import { getSupabase, getEmpresaId } from './base'
import type { Cliente, OrdemServico, Venda } from '@/types/database'

function getHojeInicio(): string {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  return hoje.toISOString()
}

function getHojeFim(): string {
  const hoje = new Date()
  hoje.setHours(23, 59, 59, 999)
  return hoje.toISOString()
}

export const dashboardService = {
  // ============================================
  // RESUMO DO DASHBOARD
  // ============================================

  async getResumo(): Promise<{
    data: {
      vendas_dia: number
      custo_dia: number
      lucro_dia: number
      quantidade_vendas: number
      os_abertas: number
      os_finalizadas: number
      produtos_estoque_baixo: number
    } | null
    error: string | null
  }> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()
    const hojeInicio = getHojeInicio()
    const hojeFim = getHojeFim()

    try {
      // Run all 4 independent queries in parallel
      const [vendasResult, osPagasHojeResult, osAbertasResult, osFinalizadasResult, produtosResult] = await Promise.all([
        supabase
          .from('vendas')
          .select('valor_total, valor_custo_total')
          .eq('empresa_id', empresaId)
          .eq('cancelada', false)
          .gte('created_at', hojeInicio)
          .lte('created_at', hojeFim),
        supabase
          .from('ordens_servico')
          .select('id, valor_total')
          .eq('empresa_id', empresaId)
          .eq('pago', true)
          .gte('data_pagamento', hojeInicio)
          .lte('data_pagamento', hojeFim),
        supabase
          .from('ordens_servico')
          .select('id', { count: 'exact', head: true })
          .eq('empresa_id', empresaId)
          .not('status', 'in', '("finalizada","entregue","cancelada")'),
        supabase
          .from('ordens_servico')
          .select('id', { count: 'exact', head: true })
          .eq('empresa_id', empresaId)
          .eq('status', 'finalizada'),
        supabase
          .from('produtos')
          .select('id, estoque_atual, estoque_minimo')
          .eq('empresa_id', empresaId)
          .eq('ativo', true),
      ])

      if (vendasResult.error) return { data: null, error: vendasResult.error.message }
      if (osPagasHojeResult.error) return { data: null, error: osPagasHojeResult.error.message }
      if (osAbertasResult.error) return { data: null, error: osAbertasResult.error.message }
      if (osFinalizadasResult.error) return { data: null, error: osFinalizadasResult.error.message }
      if (produtosResult.error) return { data: null, error: produtosResult.error.message }

      // Receita e custo de vendas
      const vendasDia = vendasResult.data
      const receitaVendas = vendasDia?.reduce((acc: number, v: { valor_total: number | null }) => acc + (v.valor_total || 0), 0) ?? 0
      const custoVendas = vendasDia?.reduce((acc: number, v: { valor_custo_total: number | null }) => acc + (v.valor_custo_total || 0), 0) ?? 0

      // Receita e custo de OS pagas hoje
      const osPagas = osPagasHojeResult.data ?? []
      const receitaOS = osPagas.reduce((acc: number, o: { valor_total: number | null }) => acc + (o.valor_total || 0), 0)
      let custoOS = 0
      const osPagasIds = osPagas.map((o: { id: string }) => o.id)
      if (osPagasIds.length > 0) {
        const { data: itensOS } = await supabase
          .from('itens_os')
          .select('valor_custo, quantidade')
          .in('os_id', osPagasIds)
        custoOS = (itensOS ?? []).reduce((acc: number, item: { valor_custo: number | null; quantidade: number | null }) =>
          acc + ((item.valor_custo || 0) * (item.quantidade || 0)), 0)
      }

      const vendas_dia = receitaVendas + receitaOS
      const custo_dia = custoVendas + custoOS
      const lucro_dia = vendas_dia - custo_dia
      const quantidade_vendas = (vendasDia?.length ?? 0) + osPagas.length

      const produtos_estoque_baixo = produtosResult.data?.filter(
        (p: { estoque_atual: number; estoque_minimo: number }) => p.estoque_atual <= p.estoque_minimo
      ).length ?? 0

      return {
        data: {
          vendas_dia,
          custo_dia,
          lucro_dia,
          quantidade_vendas,
          os_abertas: osAbertasResult.count ?? 0,
          os_finalizadas: osFinalizadasResult.count ?? 0,
          produtos_estoque_baixo,
        },
        error: null,
      }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  // ============================================
  // ANIVERSARIANTES (PRÓXIMOS 7 DIAS)
  // ============================================

  async getAniversariantes(): Promise<{ data: Cliente[]; error: string | null }> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()

    const { data: clientes, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('ativo', true)
      .not('data_nascimento', 'is', null)

    if (error) return { data: [], error: error.message }

    const hoje = new Date()
    const em7Dias = new Date()
    em7Dias.setDate(hoje.getDate() + 7)

    const aniversariantes = (clientes ?? []).filter((cliente: { data_nascimento?: string | null }) => {
      if (!cliente.data_nascimento) return false

      const nascimento = new Date(cliente.data_nascimento)
      const aniversarioEsteAno = new Date(
        hoje.getFullYear(),
        nascimento.getMonth(),
        nascimento.getDate()
      )

      // Se o aniversário já passou este ano, verifica no próximo ano
      if (aniversarioEsteAno < hoje) {
        aniversarioEsteAno.setFullYear(hoje.getFullYear() + 1)
      }

      return aniversarioEsteAno >= hoje && aniversarioEsteAno <= em7Dias
    })

    return { data: aniversariantes, error: null }
  },

  // ============================================
  // ÚLTIMAS VENDAS
  // ============================================

  async getUltimasVendas(limite?: number): Promise<{ data: Venda[]; error: string | null }> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()

    const { data, error } = await supabase
      .from('vendas')
      .select('*, cliente:clientes(id,nome)')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false })
      .limit(limite ?? 5)

    return { data: data ?? [], error: error?.message ?? null }
  },

  // ============================================
  // ÚLTIMAS OS
  // ============================================

  async getUltimasOS(limite?: number): Promise<{ data: OrdemServico[]; error: string | null }> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()

    const { data, error } = await supabase
      .from('ordens_servico')
      .select('*, cliente:clientes(id,nome)')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false })
      .limit(limite ?? 5)

    return { data: data ?? [], error: error?.message ?? null }
  },

  // ============================================
  // VENDAS DA SEMANA (AGRUPADO POR DIA)
  // ============================================

  async getVendasSemana(): Promise<{
    data: Array<{ dia: string; total: number; custo: number; lucro: number }>
    error: string | null
  }> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()

    const hoje = new Date()
    const seteDiasAtras = new Date()
    seteDiasAtras.setDate(hoje.getDate() - 6)
    seteDiasAtras.setHours(0, 0, 0, 0)

    const [vendasRes, osPagasRes] = await Promise.all([
      supabase
        .from('vendas')
        .select('created_at, valor_total, valor_custo_total')
        .eq('empresa_id', empresaId)
        .eq('cancelada', false)
        .gte('created_at', seteDiasAtras.toISOString())
        .lte('created_at', hoje.toISOString()),
      supabase
        .from('ordens_servico')
        .select('id, data_pagamento, valor_total')
        .eq('empresa_id', empresaId)
        .eq('pago', true)
        .gte('data_pagamento', seteDiasAtras.toISOString())
        .lte('data_pagamento', hoje.toISOString()),
    ])

    if (vendasRes.error) return { data: [], error: vendasRes.error.message }

    // Buscar custos das OS pagas
    const osPagas = osPagasRes.data ?? []
    const osPagasIds = osPagas.map((o: { id: string }) => o.id)
    const custosPorOS: Record<string, number> = {}
    if (osPagasIds.length > 0) {
      const { data: itensOS } = await supabase
        .from('itens_os')
        .select('os_id, valor_custo, quantidade')
        .in('os_id', osPagasIds)
      for (const item of itensOS ?? []) {
        custosPorOS[item.os_id] = (custosPorOS[item.os_id] || 0) + ((item.valor_custo || 0) * (item.quantidade || 0))
      }
    }

    // Agrupar por dia
    const porDia: Record<string, { total: number; custo: number }> = {}

    // Inicializar todos os 7 dias
    for (let i = 0; i < 7; i++) {
      const dia = new Date(seteDiasAtras)
      dia.setDate(seteDiasAtras.getDate() + i)
      const chave = dia.toISOString().split('T')[0]
      porDia[chave] = { total: 0, custo: 0 }
    }

    // Somar vendas por dia
    for (const venda of vendasRes.data ?? []) {
      const chave = venda.created_at.split('T')[0]
      if (porDia[chave]) {
        porDia[chave].total += venda.valor_total || 0
        porDia[chave].custo += venda.valor_custo_total || 0
      }
    }

    // Somar OS pagas por dia
    for (const os of osPagas) {
      if (!os.data_pagamento) continue
      const chave = os.data_pagamento.split('T')[0]
      if (porDia[chave]) {
        porDia[chave].total += os.valor_total || 0
        porDia[chave].custo += custosPorOS[os.id] || 0
      }
    }

    const resultado = Object.entries(porDia).map(([dia, valores]) => ({
      dia,
      total: valores.total,
      custo: valores.custo,
      lucro: valores.total - valores.custo,
    }))

    return { data: resultado, error: null }
  },
}
