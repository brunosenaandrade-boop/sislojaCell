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
      // Vendas do dia
      const { data: vendasDia, error: vendasError } = await supabase
        .from('vendas')
        .select('valor_total, valor_custo_total')
        .eq('empresa_id', empresaId)
        .gte('created_at', hojeInicio)
        .lte('created_at', hojeFim)

      if (vendasError) return { data: null, error: vendasError.message }

      const vendas_dia = vendasDia?.reduce((acc: number, v: { valor_total: number | null }) => acc + (v.valor_total || 0), 0) ?? 0
      const custo_dia = vendasDia?.reduce((acc: number, v: { valor_custo_total: number | null }) => acc + (v.valor_custo_total || 0), 0) ?? 0
      const lucro_dia = vendas_dia - custo_dia
      const quantidade_vendas = vendasDia?.length ?? 0

      // OS abertas (não finalizadas/entregues/canceladas)
      const { count: osAbertasCount, error: osAbertasError } = await supabase
        .from('ordens_servico')
        .select('id', { count: 'exact', head: true })
        .eq('empresa_id', empresaId)
        .not('status', 'in', '("finalizada","entregue","cancelada")')

      if (osAbertasError) return { data: null, error: osAbertasError.message }

      // OS finalizadas
      const { count: osFinalizadasCount, error: osFinalizadasError } = await supabase
        .from('ordens_servico')
        .select('id', { count: 'exact', head: true })
        .eq('empresa_id', empresaId)
        .eq('status', 'finalizada')

      if (osFinalizadasError) return { data: null, error: osFinalizadasError.message }

      // Produtos com estoque baixo (client-side filter: estoque_atual <= estoque_minimo)
      const { data: todosProdutos, error: todosProdutosError } = await supabase
        .from('produtos')
        .select('id, estoque_atual, estoque_minimo')
        .eq('empresa_id', empresaId)
        .eq('ativo', true)

      if (todosProdutosError) return { data: null, error: todosProdutosError.message }

      const produtos_estoque_baixo = todosProdutos?.filter(
        (p: { estoque_atual: number; estoque_minimo: number }) => p.estoque_atual <= p.estoque_minimo
      ).length ?? 0

      return {
        data: {
          vendas_dia,
          custo_dia,
          lucro_dia,
          quantidade_vendas,
          os_abertas: osAbertasCount ?? 0,
          os_finalizadas: osFinalizadasCount ?? 0,
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

    const { data: vendas, error } = await supabase
      .from('vendas')
      .select('created_at, valor_total, valor_custo_total')
      .eq('empresa_id', empresaId)
      .gte('created_at', seteDiasAtras.toISOString())
      .lte('created_at', hoje.toISOString())

    if (error) return { data: [], error: error.message }

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
    for (const venda of vendas ?? []) {
      const chave = venda.created_at.split('T')[0]
      if (porDia[chave]) {
        porDia[chave].total += venda.valor_total || 0
        porDia[chave].custo += venda.valor_custo_total || 0
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
