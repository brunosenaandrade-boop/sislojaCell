import { NextRequest, NextResponse } from 'next/server'
import { verifySuperadmin, getServiceClient } from '../route-utils'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { logApiError } from '@/lib/server-logger'

export async function GET(request: NextRequest) {
  try {
    const auth = await verifySuperadmin()
    if ('error' in auth) return auth.error

    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'superadmin-funil', limit: 30, windowSeconds: 60 })
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const db = getServiceClient()

    // Total empresas
    const { count: totalEmpresas } = await db
      .from('empresas')
      .select('id', { count: 'exact', head: true })

    const total = totalEmpresas || 0

    // Onboarding completo
    const { count: onboardingCompleto } = await db
      .from('empresas')
      .select('id', { count: 'exact', head: true })
      .eq('onboarding_completo', true)

    // Empresas with products registered
    const { data: empresasComProdutos } = await db
      .from('produtos')
      .select('empresa_id')

    const empresasProdutosDistinct = new Set(
      (empresasComProdutos || []).map((p) => p.empresa_id)
    ).size

    // Empresas with sales
    const { data: empresasComVendas } = await db
      .from('vendas')
      .select('empresa_id')

    const empresasVendasDistinct = new Set(
      (empresasComVendas || []).map((v) => v.empresa_id)
    ).size

    // Empresas with active subscription
    const { data: empresasAtivas } = await db
      .from('assinaturas')
      .select('empresa_id')
      .eq('status', 'active')

    const empresasAtivasDistinct = new Set(
      (empresasAtivas || []).map((a) => a.empresa_id)
    ).size

    return NextResponse.json({
      data: {
        total_cadastros: total,
        onboarding_completo: onboardingCompleto || 0,
        primeiro_produto: empresasProdutosDistinct,
        primeira_venda: empresasVendasDistinct,
        assinatura_ativa: empresasAtivasDistinct,
      },
    })
  } catch (err) {
    console.error('Erro ao buscar funil:', err)
    await logApiError('/api/superadmin/funil', 'GET', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
