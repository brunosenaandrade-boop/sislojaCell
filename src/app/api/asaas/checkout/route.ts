import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getServiceClient } from '../../superadmin/route-utils'
import { asaasService } from '@/services/asaas.service'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { logApiError } from '@/lib/server-logger'

// ============================================
// CHECKOUT ASAAS - Criar assinatura + link de pagamento
// POST /api/asaas/checkout
// ============================================

async function getAuthUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 requests por minuto por IP
    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'checkout', limit: 10, windowSeconds: 60 })
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // Verificar autenticação
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { planoSlug, ciclo, billingType, creditCard, creditCardHolderInfo, installmentCount, cupom } = body as {
      planoSlug: string
      ciclo?: string
      billingType?: 'PIX' | 'CREDIT_CARD' | 'BOLETO'
      creditCard?: {
        holderName: string
        number: string
        expiryMonth: string
        expiryYear: string
        ccv: string
      }
      creditCardHolderInfo?: {
        name: string
        email: string
        cpfCnpj: string
        postalCode: string
        addressNumber: string
        phone: string
      }
      installmentCount?: number
      cupom?: string
    }

    if (!planoSlug) {
      return NextResponse.json({ error: 'Plano não informado' }, { status: 400 })
    }

    // Validar dados do cartão quando billingType é CREDIT_CARD
    if (billingType === 'CREDIT_CARD') {
      if (!creditCard || !creditCardHolderInfo) {
        return NextResponse.json(
          { error: 'Dados do cartão e titular são obrigatórios para pagamento com cartão' },
          { status: 400 }
        )
      }
    }

    const serviceClient = getServiceClient()

    // Buscar usuário e empresa
    const { data: usuario } = await serviceClient
      .from('usuarios')
      .select('empresa_id')
      .eq('auth_id', user.id)
      .single()

    if (!usuario?.empresa_id) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    // Verificar se já existe assinatura ativa ou pendente para evitar duplicidade
    const { data: assinaturaExistente } = await serviceClient
      .from('assinaturas')
      .select('id, status')
      .eq('empresa_id', usuario.empresa_id)
      .in('status', ['active', 'pending'])
      .limit(1)
      .maybeSingle()

    if (assinaturaExistente) {
      if (assinaturaExistente.status === 'active') {
        return NextResponse.json(
          { error: 'Você já possui uma assinatura ativa.' },
          { status: 400 }
        )
      }
      if (assinaturaExistente.status === 'pending') {
        return NextResponse.json(
          { error: 'Você já possui um pagamento pendente. Aguarde a confirmação ou cancele antes de tentar novamente.' },
          { status: 400 }
        )
      }
    }

    const { data: empresa } = await serviceClient
      .from('empresas')
      .select('*')
      .eq('id', usuario.empresa_id)
      .single()

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    // Buscar plano
    const { data: plano } = await serviceClient
      .from('planos')
      .select('*')
      .eq('slug', planoSlug)
      .eq('ativo', true)
      .single()

    if (!plano) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 })
    }

    // Verificar se precisa criar cliente no Asaas
    let asaasCustomerId = empresa.asaas_customer_id

    if (!asaasCustomerId) {
      const cpfCnpj = empresa.cnpj || empresa.cpf
      if (!cpfCnpj) {
        return NextResponse.json(
          { error: 'CPF ou CNPJ da empresa é obrigatório para pagamento. Atualize os dados no Onboarding ou Configurações.' },
          { status: 400 }
        )
      }

      const { data: customer, error: customerError } = await asaasService.criarCliente({
        name: empresa.nome_fantasia || empresa.nome,
        cpfCnpj,
        email: empresa.email || undefined,
        phone: empresa.telefone || undefined,
        externalReference: empresa.id,
      })

      if (customerError || !customer) {
        return NextResponse.json(
          { error: customerError || 'Erro ao criar cliente no gateway' },
          { status: 500 }
        )
      }

      asaasCustomerId = customer.id

      // Salvar ID do cliente Asaas na empresa
      await serviceClient
        .from('empresas')
        .update({ asaas_customer_id: asaasCustomerId })
        .eq('id', empresa.id)
    }

    // Calcular valor e ciclo
    const billingCycle = (ciclo as string) || 'YEARLY'
    let valor = billingCycle === 'YEARLY' ? plano.preco_anual : plano.preco_mensal

    if (valor <= 0) {
      return NextResponse.json({ error: 'Este plano é gratuito' }, { status: 400 })
    }

    // Validar e aplicar cupom de desconto
    let cupomAplicado: string | null = null
    if (cupom) {
      const { data: cupomData } = await serviceClient
        .from('cupons')
        .select('*')
        .eq('codigo', cupom.toUpperCase().trim())
        .eq('ativo', true)
        .single()

      if (!cupomData) {
        return NextResponse.json({ error: 'Cupom inválido ou expirado' }, { status: 400 })
      }

      // Verificar expiração
      if (cupomData.data_expiracao && new Date(cupomData.data_expiracao) < new Date()) {
        return NextResponse.json({ error: 'Cupom expirado' }, { status: 400 })
      }

      // Verificar limite de uso
      if (cupomData.max_usos && cupomData.usos_atuais >= cupomData.max_usos) {
        return NextResponse.json({ error: 'Cupom atingiu o limite de usos' }, { status: 400 })
      }

      // Verificar restrição de plano
      if (cupomData.plano_restrito && cupomData.plano_restrito !== planoSlug) {
        return NextResponse.json({ error: 'Cupom não aplicável a este plano' }, { status: 400 })
      }

      // Verificar valor mínimo
      if (cupomData.valor_minimo && valor < cupomData.valor_minimo) {
        return NextResponse.json({ error: `Valor mínimo para este cupom: R$ ${cupomData.valor_minimo}` }, { status: 400 })
      }

      // Aplicar desconto
      if (cupomData.tipo_desconto === 'percentual') {
        valor = valor * (1 - cupomData.valor / 100)
      } else {
        valor = Math.max(0, valor - cupomData.valor)
      }

      // Incrementar uso do cupom
      await serviceClient
        .from('cupons')
        .update({ usos_atuais: cupomData.usos_atuais + 1 })
        .eq('id', cupomData.id)

      cupomAplicado = cupomData.codigo
    }

    // Próxima data de cobrança (hoje)
    const nextDueDate = new Date().toISOString().split('T')[0]

    // Criar assinatura no Asaas com billingType específico ou UNDEFINED (fallback)
    const effectiveBillingType = billingType || 'UNDEFINED'

    const subscriptionPayload: Parameters<typeof asaasService.criarAssinatura>[0] = {
      customerId: asaasCustomerId,
      billingType: effectiveBillingType,
      value: valor,
      cycle: billingCycle as 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY',
      nextDueDate,
      description: `${plano.nome} - ${empresa.nome_fantasia || empresa.nome}`,
      externalReference: empresa.id,
    }

    if (effectiveBillingType === 'CREDIT_CARD' && creditCard && creditCardHolderInfo) {
      subscriptionPayload.creditCard = creditCard
      subscriptionPayload.creditCardHolderInfo = creditCardHolderInfo
    }

    if (effectiveBillingType !== 'CREDIT_CARD') {
      subscriptionPayload.maxInstallmentCount = 12
    }

    const { data: subscription, error: subError } = await asaasService.criarAssinatura(subscriptionPayload)

    if (subError || !subscription) {
      return NextResponse.json(
        { error: subError || 'Erro ao criar assinatura' },
        { status: 500 }
      )
    }

    // Buscar a primeira fatura gerada
    const { data: faturas } = await asaasService.listarFaturas(subscription.id)
    const primeiraFatura = faturas?.data?.[0]

    // URL de pagamento (fallback para checkout externo se não for transparente)
    const invoiceUrl = primeiraFatura?.invoiceUrl || null
    const checkoutUrl = billingType
      ? null // Checkout transparente: não precisa de URL externa
      : invoiceUrl || `${process.env.ASAAS_API_URL?.replace('/api/v3', '')}/c/${subscription.id}` || null

    // Criar registro da assinatura no banco
    const { error: assinaturaDbErr } = await serviceClient.from('assinaturas').insert({
      empresa_id: empresa.id,
      plano_id: plano.id,
      status: 'pending',
      ciclo: billingCycle,
      valor,
      asaas_subscription_id: subscription.id,
      asaas_customer_id: asaasCustomerId,
    })

    if (assinaturaDbErr) {
      await logApiError('/api/asaas/checkout', 'POST', new Error(assinaturaDbErr.message), { empresa_id: empresa.id })
    }

    // Registrar primeira fatura no banco
    if (primeiraFatura) {
      const { error: faturaDbErr } = await serviceClient.from('faturas').insert({
        empresa_id: empresa.id,
        valor,
        status: 'pending',
        data_vencimento: primeiraFatura.dueDate,
        asaas_payment_id: primeiraFatura.id,
        link_boleto: primeiraFatura.bankSlipUrl || null,
        link_invoice: primeiraFatura.invoiceUrl || null,
      })

      if (faturaDbErr) {
        await logApiError('/api/asaas/checkout', 'POST', new Error(faturaDbErr.message), { empresa_id: empresa.id })
      }
    }

    // Atualizar plano da empresa
    await serviceClient
      .from('empresas')
      .update({ plano: plano.slug })
      .eq('id', empresa.id)

    // Se pagamento com cartão foi confirmado/recebido, ativar assinatura imediatamente
    const paymentStatus = primeiraFatura?.status || ''
    const isPaymentConfirmed = ['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH'].includes(paymentStatus)

    if (effectiveBillingType === 'CREDIT_CARD' && isPaymentConfirmed) {
      await serviceClient
        .from('empresas')
        .update({ status_assinatura: 'active' })
        .eq('id', empresa.id)

      await serviceClient
        .from('assinaturas')
        .update({ status: 'active' })
        .eq('asaas_subscription_id', subscription.id)
    }

    return NextResponse.json({
      checkoutUrl,
      subscriptionId: subscription.id,
      paymentId: primeiraFatura?.id || null,
      billingType: effectiveBillingType,
      status: primeiraFatura?.status || subscription.status,
      bankSlipUrl: primeiraFatura?.bankSlipUrl || null,
      invoiceUrl,
      cupomAplicado,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    await logApiError('/api/asaas/checkout', 'POST', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
