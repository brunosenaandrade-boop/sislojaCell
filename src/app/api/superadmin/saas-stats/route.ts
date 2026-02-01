import { NextResponse } from 'next/server'
import { verifySuperadmin, getServiceClient } from '../route-utils'

export async function GET() {
  const auth = await verifySuperadmin()
  if ('error' in auth) return auth.error

  const db = getServiceClient()

  // Buscar todas empresas com campos SaaS
  const { data: empresas } = await db
    .from('empresas')
    .select('id, plano, status_assinatura, trial_fim, created_at, codigo_indicacao, indicada_por, meses_bonus')

  const allEmpresas = empresas || []

  // MRR: contar assinaturas ativas * R$150/mês
  const ativas = allEmpresas.filter(e => e.status_assinatura === 'active')
  const mrr = ativas.length * 150

  // Distribuição por status
  const statusCount: Record<string, number> = {}
  allEmpresas.forEach(e => {
    const s = e.status_assinatura || 'trial'
    statusCount[s] = (statusCount[s] || 0) + 1
  })

  // Distribuição por plano
  const planoCount: Record<string, number> = {}
  allEmpresas.forEach(e => {
    const p = e.plano || 'free'
    planoCount[p] = (planoCount[p] || 0) + 1
  })

  // Taxa de conversão trial → pago
  const totalTrial = allEmpresas.filter(e =>
    e.status_assinatura === 'trial' || e.status_assinatura === 'active'
  ).length
  const totalPago = ativas.length
  const taxaConversao = totalTrial > 0 ? (totalPago / totalTrial) * 100 : 0

  // Churn: cancelamentos no último mês
  const umMesAtras = new Date()
  umMesAtras.setMonth(umMesAtras.getMonth() - 1)

  const { count: cancelamentosMes } = await db
    .from('assinaturas')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'cancelled')
    .gte('data_cancelamento', umMesAtras.toISOString())

  const churnRate = ativas.length > 0
    ? ((cancelamentosMes || 0) / (ativas.length + (cancelamentosMes || 0))) * 100
    : 0

  // Faturas vencidas
  const { data: faturasVencidas } = await db
    .from('faturas')
    .select('id, empresa_id, valor, data_vencimento')
    .eq('status', 'overdue')
    .order('data_vencimento', { ascending: false })
    .limit(20)

  // Métricas de indicação
  const { count: totalIndicacoes } = await db
    .from('indicacoes')
    .select('id', { count: 'exact', head: true })

  const { count: indicacoesQualificadas } = await db
    .from('indicacoes')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'qualificada')

  const { count: indicacoesRecompensadas } = await db
    .from('indicacoes')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'recompensada')

  const totalMesesBonus = allEmpresas.reduce((acc, e) => acc + (e.meses_bonus || 0), 0)

  // Top indicadores
  const empresasComIndicacoes = allEmpresas
    .filter(e => e.codigo_indicacao)
    .map(e => e.id)

  let topIndicadores: { empresa_id: string; count: number }[] = []
  if (empresasComIndicacoes.length > 0) {
    const { data: indicacoesPorOrigem } = await db
      .from('indicacoes')
      .select('empresa_origem_id')
      .in('status', ['qualificada', 'recompensada'])

    if (indicacoesPorOrigem) {
      const contagem: Record<string, number> = {}
      indicacoesPorOrigem.forEach((i: { empresa_origem_id: string }) => {
        contagem[i.empresa_origem_id] = (contagem[i.empresa_origem_id] || 0) + 1
      })
      topIndicadores = Object.entries(contagem)
        .map(([empresa_id, count]) => ({ empresa_id, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    }
  }

  // Trials expirando nos próximos 3 dias
  const tresDias = new Date()
  tresDias.setDate(tresDias.getDate() + 3)
  const trialsExpirando = allEmpresas.filter(e => {
    if (e.status_assinatura !== 'trial' || !e.trial_fim) return false
    const fim = new Date(e.trial_fim)
    return fim <= tresDias && fim >= new Date()
  }).length

  return NextResponse.json({
    data: {
      mrr,
      arr: mrr * 12,
      total_assinantes: ativas.length,
      status_distribuicao: statusCount,
      plano_distribuicao: planoCount,
      taxa_conversao: Math.round(taxaConversao * 10) / 10,
      churn_rate: Math.round(churnRate * 10) / 10,
      cancelamentos_mes: cancelamentosMes || 0,
      faturas_vencidas: faturasVencidas || [],
      faturas_vencidas_count: faturasVencidas?.length || 0,
      trials_expirando: trialsExpirando,
      indicacoes: {
        total: totalIndicacoes || 0,
        qualificadas: indicacoesQualificadas || 0,
        recompensadas: indicacoesRecompensadas || 0,
        meses_bonus_total: totalMesesBonus,
        top_indicadores: topIndicadores,
      },
    },
  })
}
