import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getServiceClient } from '../../superadmin/route-utils'
import { asaasService } from '@/services/asaas.service'
import { emailService } from '@/services/email/resend'
import { logApiError } from '@/lib/server-logger'

// ============================================
// ASSINATURA ASAAS - Consultar, Cancelar, Trocar
// GET/DELETE/PATCH /api/asaas/assinatura
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

async function getEmpresaFromAuth(userId: string) {
  const serviceClient = getServiceClient()

  const { data: usuario } = await serviceClient
    .from('usuarios')
    .select('empresa_id')
    .eq('auth_id', userId)
    .single()

  if (!usuario?.empresa_id) return null

  const { data: empresa } = await serviceClient
    .from('empresas')
    .select('*')
    .eq('id', usuario.empresa_id)
    .single()

  return empresa
}

// GET - Consultar status da assinatura
export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const serviceClient = getServiceClient()

    // Superadmin não tem empresa — retornar resposta vazia
    const { data: usuarioCheck } = await serviceClient
      .from('usuarios')
      .select('perfil, empresa_id')
      .eq('auth_id', user.id)
      .single()

    if (usuarioCheck?.perfil === 'superadmin') {
      return NextResponse.json({
        empresa: null,
        assinatura: null,
        plano: { nome: 'Superadmin', slug: 'enterprise', features: {} },
        faturas: [],
      })
    }

    const empresa = await getEmpresaFromAuth(user.id)
    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    // Buscar assinatura ativa no banco
    const { data: assinatura } = await serviceClient
      .from('assinaturas')
      .select('*, plano:planos(*)')
      .eq('empresa_id', empresa.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Buscar faturas recentes
    const { data: faturas } = await serviceClient
      .from('faturas')
      .select('*')
      .eq('empresa_id', empresa.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Buscar plano atual
    const { data: plano } = await serviceClient
      .from('planos')
      .select('*')
      .eq('slug', empresa.plano || 'free')
      .single()

    // Calcular dias restantes de trial
    let trialDiasRestantes = 0
    if (empresa.status_assinatura === 'trial' && empresa.trial_fim) {
      const diff = new Date(empresa.trial_fim).getTime() - Date.now()
      trialDiasRestantes = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
    }

    return NextResponse.json({
      empresa: {
        id: empresa.id,
        nome: empresa.nome,
        plano: empresa.plano,
        status_assinatura: empresa.status_assinatura,
        trial_fim: empresa.trial_fim,
        trial_dias_restantes: trialDiasRestantes,
        meses_bonus: empresa.meses_bonus || 0,
      },
      assinatura: assinatura || null,
      plano: plano || null,
      faturas: faturas || [],
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    await logApiError('/api/asaas/assinatura', 'GET', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// DELETE - Cancelar assinatura
export async function DELETE() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const empresa = await getEmpresaFromAuth(user.id)
    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    const serviceClient = getServiceClient()

    // Buscar assinatura ativa
    const { data: assinatura } = await serviceClient
      .from('assinaturas')
      .select('*')
      .eq('empresa_id', empresa.id)
      .in('status', ['active', 'pending'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!assinatura) {
      return NextResponse.json({ error: 'Nenhuma assinatura ativa' }, { status: 404 })
    }

    // Cancelar no Asaas se tiver subscription ID
    if (assinatura.asaas_subscription_id) {
      const { error } = await asaasService.cancelarAssinatura(assinatura.asaas_subscription_id)
      if (error) {
        return NextResponse.json({ error: `Erro ao cancelar no gateway: ${error}` }, { status: 500 })
      }
    }

    // Atualizar assinatura no banco
    await serviceClient
      .from('assinaturas')
      .update({
        status: 'cancelled',
        data_cancelamento: new Date().toISOString(),
      })
      .eq('id', assinatura.id)

    // Atualizar empresa
    await serviceClient
      .from('empresas')
      .update({
        status_assinatura: 'cancelled',
        plano: 'free',
      })
      .eq('id', empresa.id)

    // 13.30 - Se cancelou antes de qualificar, marcar indicação como cancelada
    await serviceClient
      .from('indicacoes')
      .update({ status: 'cancelada' })
      .eq('empresa_indicada_id', empresa.id)
      .in('status', ['pendente', 'aguardando'])

    // 10.7 - Email: assinatura cancelada
    if (empresa.email) {
      emailService.assinaturaCancelada(
        empresa.email,
        empresa.nome_fantasia || empresa.nome
      ).catch(() => {})
    }

    return NextResponse.json({ success: true, message: 'Assinatura cancelada' })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    await logApiError('/api/asaas/assinatura', 'DELETE', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// PATCH - Trocar plano (upgrade/downgrade)
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const empresa = await getEmpresaFromAuth(user.id)
    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    const body = await request.json()
    const { planoSlug } = body as { planoSlug: string }

    if (!planoSlug) {
      return NextResponse.json({ error: 'Plano não informado' }, { status: 400 })
    }

    const serviceClient = getServiceClient()

    // Buscar novo plano
    const { data: novoPlano } = await serviceClient
      .from('planos')
      .select('*')
      .eq('slug', planoSlug)
      .eq('ativo', true)
      .single()

    if (!novoPlano) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 })
    }

    // Atualizar plano da empresa (a cobrança é ajustada via checkout)
    await serviceClient
      .from('empresas')
      .update({ plano: novoPlano.slug })
      .eq('id', empresa.id)

    return NextResponse.json({
      success: true,
      message: `Plano alterado para ${novoPlano.nome}`,
      plano: novoPlano,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    await logApiError('/api/asaas/assinatura', 'PATCH', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
