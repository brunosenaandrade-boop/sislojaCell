import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '../../superadmin/route-utils'
import { emailService } from '@/services/email/resend'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { logApiError } from '@/lib/server-logger'
import { timingSafeEqual } from 'crypto'

// ============================================
// WEBHOOK ASAAS - Recebe eventos de pagamento
// POST /api/asaas/webhook
// ============================================

const WEBHOOK_TOKEN = process.env.ASAAS_WEBHOOK_TOKEN || ''

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 60 requests por minuto por IP
    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'webhook', limit: 60, windowSeconds: 60 })
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // 2.14 - Validar token do webhook
    const token = request.headers.get('asaas-access-token')
    if (!WEBHOOK_TOKEN) {
      return NextResponse.json({ error: 'Webhook não configurado' }, { status: 500 })
    }
    if (!token || token.length !== WEBHOOK_TOKEN.length ||
        !timingSafeEqual(Buffer.from(token), Buffer.from(WEBHOOK_TOKEN))) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const payload = await request.json()
    const evento = payload.event as string

    if (!evento) {
      return NextResponse.json({ error: 'Evento não informado' }, { status: 400 })
    }

    const supabase = getServiceClient()

    // Idempotency: verificar se este evento+payment já foi processado
    const paymentData = payload.payment as Record<string, unknown> | undefined
    const idempotencyKey = paymentData?.id ? `${evento}:${paymentData.id}` : null

    if (idempotencyKey) {
      const { data: jaProcessado } = await supabase
        .from('webhooks_log')
        .select('id')
        .eq('origem', 'asaas')
        .eq('evento', evento)
        .eq('processado', true)
        .contains('payload', { payment: { id: paymentData!.id } })
        .limit(1)
        .maybeSingle()

      if (jaProcessado) {
        return NextResponse.json({ received: true, duplicate: true })
      }
    }

    // 2.13 - Registrar webhook no log
    const { data: logEntry } = await supabase.from('webhooks_log').insert({
      origem: 'asaas',
      evento,
      payload,
      processado: false,
    }).select('id').single()

    const logId = logEntry?.id

    // Processar evento
    let processado = false

    switch (evento) {
      // ============================================
      // 2.10 - Eventos de CHECKOUT
      // ============================================
      case 'CHECKOUT_PAID': {
        processado = await handleCheckoutPaid(supabase, payload)
        break
      }
      case 'CHECKOUT_EXPIRED':
      case 'CHECKOUT_CANCELED': {
        processado = await handleCheckoutCancelledOrExpired(supabase, payload)
        break
      }

      // ============================================
      // 2.11 - Eventos de PAYMENT (assinatura)
      // ============================================
      case 'PAYMENT_CREATED': {
        processado = await handlePaymentCreated(supabase, payload)
        break
      }
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_CONFIRMED': {
        processado = await handlePaymentReceived(supabase, payload)
        break
      }
      case 'PAYMENT_OVERDUE': {
        processado = await handlePaymentOverdue(supabase, payload)
        break
      }
      case 'PAYMENT_DELETED': {
        processado = await handlePaymentCancelled(supabase, payload)
        break
      }
      case 'PAYMENT_REFUNDED': {
        processado = await handlePaymentRefunded(supabase, payload)
        break
      }

      // ============================================
      // Eventos de SUBSCRIPTION (assinatura)
      // ============================================
      case 'SUBSCRIPTION_DELETED':
      case 'SUBSCRIPTION_CANCELLED':
      case 'SUBSCRIPTION_EXPIRED': {
        processado = await handleSubscriptionCancelled(supabase, payload)
        break
      }

      default:
        // Evento não tratado - apenas logado
        processado = true
        break
    }

    // Marcar como processado
    if (processado && logId) {
      await supabase
        .from('webhooks_log')
        .update({ processado: true })
        .eq('id', logId)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'

    // Logar erro
    try {
      const supabase = getServiceClient()
      await supabase.from('webhooks_log').insert({
        origem: 'asaas',
        evento: 'PROCESSING_ERROR',
        payload: { error: msg },
        processado: false,
        erro: msg,
      })
    } catch { /* ignore logging error */ }

    await logApiError('/api/asaas/webhook', 'POST', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// ============================================
// HANDLERS
// ============================================

type SupabaseClient = ReturnType<typeof getServiceClient>

async function handleCheckoutPaid(
  supabase: SupabaseClient,
  payload: Record<string, unknown>
): Promise<boolean> {
  const checkout = payload.payment as Record<string, unknown> | undefined
  const subscriptionId = (checkout?.subscription || payload.subscription) as string | undefined
  const customerId = (checkout?.customer || payload.customer) as string | undefined
  const paymentId = checkout?.id as string | undefined

  // Buscar empresa - tentar múltiplas formas
  let empresa = null

  // 1. Tentar por asaas_customer_id
  if (customerId) {
    const { data } = await supabase
      .from('empresas')
      .select('id')
      .eq('asaas_customer_id', customerId)
      .maybeSingle()
    empresa = data
  }

  // 2. Se não encontrou, tentar pela fatura
  if (!empresa && paymentId) {
    const { data: fatura } = await supabase
      .from('faturas')
      .select('empresa_id')
      .eq('asaas_payment_id', paymentId)
      .maybeSingle()

    if (fatura?.empresa_id) {
      const { data } = await supabase
        .from('empresas')
        .select('id')
        .eq('id', fatura.empresa_id)
        .single()
      empresa = data
    }
  }

  // 3. Se não encontrou, tentar pela assinatura
  if (!empresa && subscriptionId) {
    const { data: assinatura } = await supabase
      .from('assinaturas')
      .select('empresa_id')
      .eq('asaas_subscription_id', subscriptionId)
      .maybeSingle()

    if (assinatura?.empresa_id) {
      const { data } = await supabase
        .from('empresas')
        .select('id')
        .eq('id', assinatura.empresa_id)
        .single()
      empresa = data
    }
  }

  if (!empresa) return false

  // 2.12 - Atualizar status da empresa para ativa
  await supabase
    .from('empresas')
    .update({
      status_assinatura: 'active',
      assinatura_id: subscriptionId || null,
    })
    .eq('id', empresa.id)

  // Atualizar assinatura se existir
  if (subscriptionId) {
    await supabase
      .from('assinaturas')
      .update({ status: 'active' })
      .eq('asaas_subscription_id', subscriptionId)
  } else {
    // Ativar assinatura pendente mais recente da empresa
    await supabase
      .from('assinaturas')
      .update({ status: 'active' })
      .eq('empresa_id', empresa.id)
      .eq('status', 'pending')
  }

  return true
}

async function handleCheckoutCancelledOrExpired(
  supabase: SupabaseClient,
  payload: Record<string, unknown>
): Promise<boolean> {
  // Apenas logado - não muda status da empresa pois pode tentar novamente
  void supabase
  void payload
  return true
}

async function handlePaymentCreated(
  supabase: SupabaseClient,
  payload: Record<string, unknown>
): Promise<boolean> {
  const payment = payload.payment as Record<string, unknown> | undefined
  if (!payment) return false

  const customerId = payment.customer as string | undefined
  if (!customerId) return false

  const { data: empresa } = await supabase
    .from('empresas')
    .select('id')
    .eq('asaas_customer_id', customerId)
    .single()

  if (!empresa) return false

  // Registrar fatura
  await supabase.from('faturas').insert({
    empresa_id: empresa.id,
    valor: payment.value as number,
    status: 'pending',
    data_vencimento: payment.dueDate as string,
    asaas_payment_id: payment.id as string,
    link_boleto: (payment.bankSlipUrl as string) || null,
    link_invoice: (payment.invoiceUrl as string) || null,
  })

  return true
}

async function handlePaymentReceived(
  supabase: SupabaseClient,
  payload: Record<string, unknown>
): Promise<boolean> {
  const payment = payload.payment as Record<string, unknown> | undefined
  if (!payment) return false

  const paymentId = payment.id as string
  const customerId = payment.customer as string | undefined
  const subscriptionId = payment.subscription as string | undefined

  // Atualizar fatura
  await supabase
    .from('faturas')
    .update({
      status: 'received',
      data_pagamento: new Date().toISOString(),
      forma_pagamento: payment.billingType as string,
    })
    .eq('asaas_payment_id', paymentId)

  // Buscar empresa - tentar múltiplas formas
  let empresa = null

  // 1. Tentar por asaas_customer_id
  if (customerId) {
    const { data } = await supabase
      .from('empresas')
      .select('id, nome, nome_fantasia, email, status_assinatura')
      .eq('asaas_customer_id', customerId)
      .maybeSingle()
    empresa = data
  }

  // 2. Se não encontrou, tentar pela fatura
  if (!empresa) {
    const { data: fatura } = await supabase
      .from('faturas')
      .select('empresa_id')
      .eq('asaas_payment_id', paymentId)
      .maybeSingle()

    if (fatura?.empresa_id) {
      const { data } = await supabase
        .from('empresas')
        .select('id, nome, nome_fantasia, email, status_assinatura')
        .eq('id', fatura.empresa_id)
        .single()
      empresa = data
    }
  }

  // 3. Se não encontrou, tentar pela assinatura
  if (!empresa && subscriptionId) {
    const { data: assinatura } = await supabase
      .from('assinaturas')
      .select('empresa_id')
      .eq('asaas_subscription_id', subscriptionId)
      .maybeSingle()

    if (assinatura?.empresa_id) {
      const { data } = await supabase
        .from('empresas')
        .select('id, nome, nome_fantasia, email, status_assinatura')
        .eq('id', assinatura.empresa_id)
        .single()
      empresa = data
    }
  }

  if (!empresa) return false

  // Ativar empresa se não estava ativa
  if (empresa.status_assinatura !== 'active') {
    await supabase
      .from('empresas')
      .update({
        status_assinatura: 'active',
        grace_period_fim: null,
      })
      .eq('id', empresa.id)
  }

  // Ativar assinatura e renovar data_fim
  const assinaturaFilter = subscriptionId
    ? supabase.from('assinaturas').select('id, ciclo').eq('asaas_subscription_id', subscriptionId).maybeSingle()
    : supabase.from('assinaturas').select('id, ciclo').eq('empresa_id', empresa.id).in('status', ['pending', 'active']).order('created_at', { ascending: false }).limit(1).maybeSingle()

  const { data: assinaturaAtual } = await assinaturaFilter

  if (assinaturaAtual) {
    // Calcular nova data_fim baseado no ciclo
    const novaDataFim = new Date()
    switch (assinaturaAtual.ciclo) {
      case 'MONTHLY': novaDataFim.setMonth(novaDataFim.getMonth() + 1); break
      case 'QUARTERLY': novaDataFim.setMonth(novaDataFim.getMonth() + 3); break
      case 'SEMIANNUALLY': novaDataFim.setMonth(novaDataFim.getMonth() + 6); break
      case 'YEARLY': novaDataFim.setFullYear(novaDataFim.getFullYear() + 1); break
    }

    await supabase
      .from('assinaturas')
      .update({ status: 'active', data_fim: novaDataFim.toISOString() })
      .eq('id', assinaturaAtual.id)
  } else if (subscriptionId) {
    await supabase
      .from('assinaturas')
      .update({ status: 'active' })
      .eq('asaas_subscription_id', subscriptionId)
  }

  // 10.5 - Email: pagamento confirmado
  if (empresa.email) {
    const valor = payment.value as number
    const data = new Date().toLocaleDateString('pt-BR')
    emailService.pagamentoConfirmado(empresa.email, empresa.nome_fantasia || empresa.nome, valor, data).catch(() => {})
  }

  // Verificar indicações: se esta empresa foi indicada, checar qualificação
  await verificarIndicacaoQualificada(supabase, empresa.id)

  return true
}

async function handlePaymentOverdue(
  supabase: SupabaseClient,
  payload: Record<string, unknown>
): Promise<boolean> {
  const payment = payload.payment as Record<string, unknown> | undefined
  if (!payment) return false

  const customerId = payment.customer as string | undefined
  const paymentId = payment.id as string
  if (!customerId) return false

  // Atualizar fatura
  await supabase
    .from('faturas')
    .update({ status: 'overdue' })
    .eq('asaas_payment_id', paymentId)

  // Marcar empresa como overdue (com grace period de 3 dias)
  const { data: empresa } = await supabase
    .from('empresas')
    .select('id, nome, nome_fantasia, email, meses_bonus, grace_period_fim')
    .eq('asaas_customer_id', customerId)
    .single()

  if (!empresa) return false

  // Se tem meses bônus, consumir um em vez de suspender
  // Usa .gt() como guard atômico para evitar meses_bonus < 0 sob concorrência
  if (empresa.meses_bonus > 0) {
    const { count } = await supabase
      .from('empresas')
      .update({
        meses_bonus: empresa.meses_bonus - 1,
        status_assinatura: 'active',
      })
      .eq('id', empresa.id)
      .gt('meses_bonus', 0)

    // Se nenhuma row foi atualizada, o bônus já foi consumido por outro request
    if (count === 0) {
      // Iniciar grace period de 3 dias em vez de bloquear imediatamente
      const gracePeriodFim = new Date()
      gracePeriodFim.setDate(gracePeriodFim.getDate() + 3)
      await supabase
        .from('empresas')
        .update({
          status_assinatura: 'overdue',
          grace_period_fim: gracePeriodFim.toISOString(),
        })
        .eq('id', empresa.id)
    }
  } else {
    // Iniciar grace period de 3 dias em vez de bloquear imediatamente
    const gracePeriodFim = new Date()
    gracePeriodFim.setDate(gracePeriodFim.getDate() + 3)
    await supabase
      .from('empresas')
      .update({
        status_assinatura: 'overdue',
        grace_period_fim: gracePeriodFim.toISOString(),
      })
      .eq('id', empresa.id)

    // 10.6 - Email: pagamento vencido
    if (empresa.email) {
      const valor = payment.value as number
      const dataVencimento = payment.dueDate as string
      emailService.pagamentoVencido(
        empresa.email,
        empresa.nome_fantasia || empresa.nome,
        valor,
        new Date(dataVencimento).toLocaleDateString('pt-BR')
      ).catch(() => {})
    }
  }

  return true
}

async function handlePaymentCancelled(
  supabase: SupabaseClient,
  payload: Record<string, unknown>
): Promise<boolean> {
  const payment = payload.payment as Record<string, unknown> | undefined
  if (!payment) return false

  const paymentId = payment.id as string
  const customerId = payment.customer as string | undefined

  await supabase
    .from('faturas')
    .update({ status: 'cancelled' })
    .eq('asaas_payment_id', paymentId)

  // Cancelar indicação pendente/aguardando se a empresa foi indicada
  if (customerId) {
    const { data: empresa } = await supabase
      .from('empresas')
      .select('id')
      .eq('asaas_customer_id', customerId)
      .single()

    if (empresa) {
      await cancelarIndicacaoPendente(supabase, empresa.id)
    }
  }

  return true
}

// ============================================
// INDICAÇÕES - Verificar qualificação após pagamento
// ============================================

async function verificarIndicacaoQualificada(
  supabase: SupabaseClient,
  empresaIndicadaId: string
): Promise<void> {
  // Buscar indicação pendente/aguardando para esta empresa
  const { data: indicacao } = await supabase
    .from('indicacoes')
    .select('*')
    .eq('empresa_indicada_id', empresaIndicadaId)
    .in('status', ['pendente', 'aguardando'])
    .single()

  if (!indicacao) return

  // Se ainda é pendente, marcar como aguardando (primeiro pagamento)
  if (indicacao.status === 'pendente') {
    await supabase
      .from('indicacoes')
      .update({
        status: 'aguardando',
        data_contratacao_indicado: new Date().toISOString(),
      })
      .eq('id', indicacao.id)
    return
  }

  // Se está aguardando, verificar se já faz 30 dias desde a contratação
  if (indicacao.status === 'aguardando' && indicacao.data_contratacao_indicado) {
    const dataContratacao = new Date(indicacao.data_contratacao_indicado)
    const agora = new Date()
    const diasDesdeContratacao = Math.floor(
      (agora.getTime() - dataContratacao.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diasDesdeContratacao >= 30) {
      await qualificarERecompensarIndicacao(supabase, indicacao, empresaIndicadaId)
    }
  }
}

// Qualificar e recompensar indicação em operação única (evita estado intermediário)
async function qualificarERecompensarIndicacao(
  supabase: SupabaseClient,
  indicacao: { id: string; empresa_origem_id: string },
  empresaIndicadaId: string
): Promise<void> {
  const agora = new Date().toISOString()

  // Marcar como recompensada diretamente (pula estado 'qualificada' intermediário)
  const { error: updateErr } = await supabase
    .from('indicacoes')
    .update({
      status: 'recompensada',
      data_qualificacao: agora,
      data_recompensa: agora,
    })
    .eq('id', indicacao.id)
    .eq('status', 'aguardando') // Guard: só atualiza se ainda estiver aguardando

  if (updateErr) return

  // Incrementar meses_bonus da empresa origem
  const { data: empresaOrigem } = await supabase
    .from('empresas')
    .select('id, meses_bonus')
    .eq('id', indicacao.empresa_origem_id)
    .single()

  if (empresaOrigem) {
    await supabase
      .from('empresas')
      .update({ meses_bonus: (empresaOrigem.meses_bonus || 0) + 1 })
      .eq('id', empresaOrigem.id)

    // 10.8 - Email: indicação bem-sucedida
    const { data: origemFull } = await supabase
      .from('empresas')
      .select('email, nome, nome_fantasia')
      .eq('id', empresaOrigem.id)
      .single()

    const { data: indicadaFull } = await supabase
      .from('empresas')
      .select('nome, nome_fantasia')
      .eq('id', empresaIndicadaId)
      .single()

    if (origemFull?.email) {
      emailService.indicacaoSucesso(
        origemFull.email,
        origemFull.nome_fantasia || origemFull.nome,
        indicadaFull?.nome_fantasia || indicadaFull?.nome || 'uma loja'
      ).catch(() => {})
    }
  }
}

async function handlePaymentRefunded(
  supabase: SupabaseClient,
  payload: Record<string, unknown>
): Promise<boolean> {
  const payment = payload.payment as Record<string, unknown> | undefined
  if (!payment) return false

  const paymentId = payment.id as string
  const customerId = payment.customer as string | undefined

  // Marcar fatura como cancelada
  await supabase
    .from('faturas')
    .update({ status: 'cancelled' })
    .eq('asaas_payment_id', paymentId)

  if (!customerId) return true

  // Buscar empresa e suspender (reembolso = investigar)
  const { data: empresa } = await supabase
    .from('empresas')
    .select('id, email, nome, nome_fantasia')
    .eq('asaas_customer_id', customerId)
    .single()

  if (empresa) {
    await supabase
      .from('empresas')
      .update({ status_assinatura: 'suspended' })
      .eq('id', empresa.id)

    await cancelarIndicacaoPendente(supabase, empresa.id)
  }

  return true
}

async function handleSubscriptionCancelled(
  supabase: SupabaseClient,
  payload: Record<string, unknown>
): Promise<boolean> {
  const subscription = (payload.subscription || payload) as Record<string, unknown>
  const subscriptionId = subscription?.id as string | undefined
  const customerId = subscription?.customer as string | undefined

  if (!subscriptionId && !customerId) return false

  // Buscar empresa
  let empresa = null

  if (subscriptionId) {
    const { data: assinatura } = await supabase
      .from('assinaturas')
      .select('empresa_id')
      .eq('asaas_subscription_id', subscriptionId)
      .maybeSingle()

    if (assinatura?.empresa_id) {
      const { data } = await supabase
        .from('empresas')
        .select('id, email, nome, nome_fantasia')
        .eq('id', assinatura.empresa_id)
        .single()
      empresa = data
    }
  }

  if (!empresa && customerId) {
    const { data } = await supabase
      .from('empresas')
      .select('id, email, nome, nome_fantasia')
      .eq('asaas_customer_id', customerId)
      .maybeSingle()
    empresa = data
  }

  if (!empresa) return false

  // Atualizar status da empresa
  await supabase
    .from('empresas')
    .update({ status_assinatura: 'cancelled' })
    .eq('id', empresa.id)

  // Atualizar assinatura local
  if (subscriptionId) {
    await supabase
      .from('assinaturas')
      .update({
        status: 'cancelled',
        data_cancelamento: new Date().toISOString(),
      })
      .eq('asaas_subscription_id', subscriptionId)
  }

  // Enviar email de cancelamento
  if (empresa.email) {
    emailService.assinaturaCancelada(
      empresa.email,
      empresa.nome_fantasia || empresa.nome
    ).catch(() => {})
  }

  // Cancelar indicações pendentes
  await cancelarIndicacaoPendente(supabase, empresa.id)

  return true
}

// Cancelar indicação quando empresa indicada cancela/pede reembolso
async function cancelarIndicacaoPendente(
  supabase: SupabaseClient,
  empresaIndicadaId: string
): Promise<void> {
  await supabase
    .from('indicacoes')
    .update({ status: 'cancelada' })
    .eq('empresa_indicada_id', empresaIndicadaId)
    .in('status', ['pendente', 'aguardando'])
}
