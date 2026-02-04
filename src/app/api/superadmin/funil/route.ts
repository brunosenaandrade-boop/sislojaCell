import { NextRequest, NextResponse } from 'next/server'
import { verifySuperadmin, getServiceClient } from '../route-utils'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { logApiError } from '@/lib/server-logger'

interface FunilEtapa {
  etapa: string
  quantidade: number
  percentual: number
}

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

    const funil: FunilEtapa[] = [
      {
        etapa: 'Cadastro',
        quantidade: total,
        percentual: 100,
      },
      {
        etapa: 'Onboarding Completo',
        quantidade: onboardingCompleto || 0,
        percentual: total > 0 ? Math.round(((onboardingCompleto || 0) / total) * 100) : 0,
      },
      {
        etapa: 'Cadastrou Produtos',
        quantidade: empresasProdutosDistinct,
        percentual: total > 0 ? Math.round((empresasProdutosDistinct / total) * 100) : 0,
      },
      {
        etapa: 'Realizou Vendas',
        quantidade: empresasVendasDistinct,
        percentual: total > 0 ? Math.round((empresasVendasDistinct / total) * 100) : 0,
      },
      {
        etapa: 'Assinatura Ativa',
        quantidade: empresasAtivasDistinct,
        percentual: total > 0 ? Math.round((empresasAtivasDistinct / total) * 100) : 0,
      },
    ]

    return NextResponse.json({ data: funil, total_empresas: total })
  } catch (err) {
    console.error('Erro ao buscar funil:', err)
    await logApiError('/api/superadmin/funil', 'GET', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
