import { NextRequest, NextResponse } from 'next/server'
import { verifySuperadmin, getServiceClient } from '../route-utils'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { logApiError } from '@/lib/server-logger'

interface ReceitaMensal {
  mes: string
  mrr: number
  novas_assinaturas: number
  receita_total: number
}

interface ReceitaPorPlano {
  plano: string
  receita: number
  quantidade: number
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifySuperadmin()
    if ('error' in auth) return auth.error

    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'superadmin-receita', limit: 30, windowSeconds: 60 })
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const db = getServiceClient()

    // Last 12 months
    const now = new Date()
    const months: ReceitaMensal[] = []

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const mesKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const start = d.toISOString()
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString()

      // Faturas pagas neste mes
      const { count: receitaCount, data: faturas } = await db
        .from('faturas')
        .select('valor', { count: 'exact' })
        .in('status', ['received', 'confirmed'])
        .gte('data_pagamento', start)
        .lte('data_pagamento', end)

      const receitaTotal = faturas?.reduce((sum: number, f: { valor: number }) => sum + Number(f.valor), 0) || 0

      // Novas assinaturas neste mes
      const { count: novasCount } = await db
        .from('assinaturas')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', start)
        .lte('created_at', end)

      months.push({
        mes: mesKey,
        mrr: receitaTotal,
        novas_assinaturas: novasCount || 0,
        receita_total: receitaTotal,
      })
    }

    // Revenue by plan
    const { data: assinaturas } = await db
      .from('assinaturas')
      .select('valor, plano_id, planos(nome)')
      .eq('status', 'active')

    const porPlanoMap: Record<string, { receita: number; quantidade: number }> = {}
    assinaturas?.forEach((a) => {
      const planoData = a.planos as unknown as { nome: string } | null
      const nome = planoData?.nome || 'Desconhecido'
      if (!porPlanoMap[nome]) porPlanoMap[nome] = { receita: 0, quantidade: 0 }
      porPlanoMap[nome].receita += Number(a.valor)
      porPlanoMap[nome].quantidade++
    })

    const porPlano: ReceitaPorPlano[] = Object.entries(porPlanoMap).map(([plano, v]) => ({
      plano,
      ...v,
    }))

    return NextResponse.json({ data: { meses: months, por_plano: porPlano } })
  } catch (err) {
    console.error('Erro ao buscar receita:', err)
    await logApiError('/api/superadmin/receita', 'GET', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
