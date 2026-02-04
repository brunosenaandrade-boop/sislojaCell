import { NextRequest, NextResponse } from 'next/server'
import { verifySuperadmin, getServiceClient } from '../route-utils'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { logApiError } from '@/lib/server-logger'

interface EmpresaUsage {
  empresa_id: string
  empresa_nome: string
  produtos: number
  vendas: number
  ordens_servico: number
}

interface FeatureUsage {
  categoria: string
  total: number
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifySuperadmin()
    if ('error' in auth) return auth.error

    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'superadmin-metricas', limit: 30, windowSeconds: 60 })
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const db = getServiceClient()

    const now = new Date()
    const seteDiasAtras = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const trintaDiasAtras = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Active empresas in last 7 days (via usuarios.ultimo_acesso)
    const { data: ativos7d } = await db
      .from('usuarios')
      .select('empresa_id')
      .gte('ultimo_acesso', seteDiasAtras)

    const ativas7d = new Set((ativos7d || []).map((u) => u.empresa_id)).size

    // Active empresas in last 30 days
    const { data: ativos30d } = await db
      .from('usuarios')
      .select('empresa_id')
      .gte('ultimo_acesso', trintaDiasAtras)

    const ativas30d = new Set((ativos30d || []).map((u) => u.empresa_id)).size

    // Total empresas
    const { count: totalEmpresas } = await db
      .from('empresas')
      .select('id', { count: 'exact', head: true })

    // Inactive 30 days (total minus active 30d)
    const inativas30d = (totalEmpresas || 0) - ativas30d

    // Features most used (logs_sistema by categoria)
    const { data: logs } = await db
      .from('logs_sistema')
      .select('categoria')
      .gte('created_at', trintaDiasAtras)

    const categoriaMap: Record<string, number> = {}
    ;(logs || []).forEach((log) => {
      const cat = log.categoria || 'outros'
      categoriaMap[cat] = (categoriaMap[cat] || 0) + 1
    })

    const featuresUsage: FeatureUsage[] = Object.entries(categoriaMap)
      .map(([categoria, total]) => ({ categoria, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 20)

    // Usage per empresa (top 20 by activity)
    const { data: empresas } = await db
      .from('empresas')
      .select('id, nome, nome_fantasia')
      .eq('ativo', true)
      .limit(50)

    const usagePerEmpresa: EmpresaUsage[] = await Promise.all(
      (empresas || []).slice(0, 20).map(async (emp) => {
        const [produtos, vendas, os] = await Promise.all([
          db
            .from('produtos')
            .select('id', { count: 'exact', head: true })
            .eq('empresa_id', emp.id),
          db
            .from('vendas')
            .select('id', { count: 'exact', head: true })
            .eq('empresa_id', emp.id),
          db
            .from('ordens_servico')
            .select('id', { count: 'exact', head: true })
            .eq('empresa_id', emp.id),
        ])

        return {
          empresa_id: emp.id,
          empresa_nome: emp.nome_fantasia || emp.nome,
          produtos: produtos.count || 0,
          vendas: vendas.count || 0,
          ordens_servico: os.count || 0,
        }
      })
    )

    // Sort by total activity
    usagePerEmpresa.sort(
      (a, b) =>
        b.produtos + b.vendas + b.ordens_servico -
        (a.produtos + a.vendas + a.ordens_servico)
    )

    return NextResponse.json({
      atividade: {
        ativas_7d: ativas7d,
        ativas_30d: ativas30d,
        inativas_30d: inativas30d,
        total: totalEmpresas || 0,
      },
      features: featuresUsage,
      uso_por_empresa: usagePerEmpresa,
    })
  } catch (err) {
    console.error('Erro ao buscar metricas:', err)
    await logApiError('/api/superadmin/metricas', 'GET', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
