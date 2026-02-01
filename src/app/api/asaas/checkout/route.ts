import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getServiceClient } from '../../superadmin/route-utils'
import { asaasService } from '@/services/asaas.service'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

// ============================================
// CHECKOUT ASAAS - Gerar link de pagamento
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
    const { planoSlug, ciclo } = body as { planoSlug: string; ciclo?: string }

    if (!planoSlug) {
      return NextResponse.json({ error: 'Plano não informado' }, { status: 400 })
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
          { error: 'CPF ou CNPJ da empresa é obrigatório para pagamento. Atualize os dados da empresa.' },
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
    const billingCycle = (ciclo as string) || 'MONTHLY'
    const valor = billingCycle === 'YEARLY' ? plano.preco_anual : plano.preco_mensal

    if (valor <= 0) {
      return NextResponse.json({ error: 'Este plano é gratuito' }, { status: 400 })
    }

    // Próxima data de cobrança (hoje)
    const nextDueDate = new Date().toISOString().split('T')[0]

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sisloja-cell.vercel.app'

    // Criar checkout no Asaas
    const { data: checkout, error: checkoutError } = await asaasService.criarCheckout({
      customerId: asaasCustomerId,
      name: `${plano.nome} - ${empresa.nome_fantasia || empresa.nome}`,
      description: `Assinatura ${plano.nome} (${billingCycle === 'YEARLY' ? 'Anual' : 'Mensal'})`,
      billingTypes: ['PIX', 'CREDIT_CARD', 'BOLETO'],
      chargeType: 'RECURRENT',
      value: valor,
      cycle: billingCycle as 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY',
      nextDueDate,
      successUrl: `${appUrl}/planos?status=success`,
      cancelUrl: `${appUrl}/planos?status=cancelled`,
    })

    if (checkoutError || !checkout) {
      return NextResponse.json(
        { error: checkoutError || 'Erro ao criar checkout' },
        { status: 500 }
      )
    }

    // Criar registro da assinatura (pendente)
    await serviceClient.from('assinaturas').insert({
      empresa_id: empresa.id,
      plano_id: plano.id,
      status: 'pending',
      ciclo: billingCycle,
      valor,
      asaas_customer_id: asaasCustomerId,
    })

    // Atualizar plano da empresa
    await serviceClient
      .from('empresas')
      .update({ plano: plano.slug })
      .eq('id', empresa.id)

    return NextResponse.json({
      checkoutUrl: checkout.url,
      checkoutId: checkout.id,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
