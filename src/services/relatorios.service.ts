import { getSupabase, getEmpresaId } from './base'
import type { Cliente } from '@/types/database'

export const relatoriosService = {
  // ============================================
  // VENDAS POR PERÍODO
  // ============================================

  async getVendasPeriodo(
    dataInicio: string,
    dataFim: string,
    agrupamento: 'dia' | 'semana' | 'mes'
  ): Promise<{
    data: Array<{
      periodo: string
      total_vendas: number
      total_custo: number
      lucro_liquido: number
      quantidade_vendas: number
    }>
    error: string | null
  }> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()

    try {
      const [vendasRes, osPagasRes] = await Promise.all([
        supabase
          .from('vendas')
          .select('created_at, valor_total, valor_custo_total')
          .eq('empresa_id', empresaId)
          .eq('cancelada', false)
          .gte('created_at', dataInicio)
          .lte('created_at', dataFim)
          .order('created_at', { ascending: true }),
        supabase
          .from('ordens_servico')
          .select('id, data_pagamento, valor_total')
          .eq('empresa_id', empresaId)
          .eq('pago', true)
          .gte('data_pagamento', dataInicio)
          .lte('data_pagamento', dataFim)
          .order('data_pagamento', { ascending: true }),
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

      // Helper para calcular chave do período
      const getChave = (dateStr: string) => {
        const data = new Date(dateStr)
        if (agrupamento === 'dia') {
          return data.toISOString().split('T')[0]
        } else if (agrupamento === 'semana') {
          const diaSemana = data.getDay()
          const inicioSemana = new Date(data)
          inicioSemana.setDate(data.getDate() - diaSemana)
          return inicioSemana.toISOString().split('T')[0]
        } else {
          return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
        }
      }

      // Agrupar conforme o tipo
      const agrupado: Record<string, { total_vendas: number; total_custo: number; quantidade_vendas: number }> = {}

      for (const venda of vendasRes.data ?? []) {
        const chave = getChave(venda.created_at)
        if (!agrupado[chave]) {
          agrupado[chave] = { total_vendas: 0, total_custo: 0, quantidade_vendas: 0 }
        }

        agrupado[chave].total_vendas += venda.valor_total || 0
        agrupado[chave].total_custo += venda.valor_custo_total || 0
        agrupado[chave].quantidade_vendas += 1
      }

      // Somar OS pagas
      for (const os of osPagas) {
        if (!os.data_pagamento) continue
        const chave = getChave(os.data_pagamento)
        if (!agrupado[chave]) {
          agrupado[chave] = { total_vendas: 0, total_custo: 0, quantidade_vendas: 0 }
        }

        agrupado[chave].total_vendas += os.valor_total || 0
        agrupado[chave].total_custo += custosPorOS[os.id] || 0
        agrupado[chave].quantidade_vendas += 1
      }

      const resultado = Object.entries(agrupado).map(([periodo, valores]) => ({
        periodo,
        total_vendas: valores.total_vendas,
        total_custo: valores.total_custo,
        lucro_liquido: valores.total_vendas - valores.total_custo,
        quantidade_vendas: valores.quantidade_vendas,
      }))

      return { data: resultado, error: null }
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  // ============================================
  // OS POR STATUS
  // ============================================

  async getOSPorStatus(): Promise<{
    data: Array<{ status: string; quantidade: number; valor_total: number }>
    error: string | null
  }> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()

    try {
      const { data: ordens, error } = await supabase
        .from('ordens_servico')
        .select('status, valor_total')
        .eq('empresa_id', empresaId)

      if (error) return { data: [], error: error.message }

      const agrupado: Record<string, { quantidade: number; valor_total: number }> = {}

      for (const os of ordens ?? []) {
        if (!agrupado[os.status]) {
          agrupado[os.status] = { quantidade: 0, valor_total: 0 }
        }
        agrupado[os.status].quantidade += 1
        agrupado[os.status].valor_total += os.valor_total || 0
      }

      const resultado = Object.entries(agrupado).map(([status, valores]) => ({
        status,
        quantidade: valores.quantidade,
        valor_total: valores.valor_total,
      }))

      return { data: resultado, error: null }
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  // ============================================
  // TOP PRODUTOS VENDIDOS
  // ============================================

  async getTopProdutos(
    limite?: number,
    dataInicio?: string,
    dataFim?: string
  ): Promise<{
    data: Array<{ produto_id: string; nome: string; quantidade_total: number; valor_total: number }>
    error: string | null
  }> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()

    try {
      // Buscar vendas no período para obter os IDs
      let vendasQuery = supabase
        .from('vendas')
        .select('id')
        .eq('empresa_id', empresaId)
        .eq('cancelada', false)

      if (dataInicio) {
        vendasQuery = vendasQuery.gte('created_at', dataInicio)
      }
      if (dataFim) {
        vendasQuery = vendasQuery.lte('created_at', dataFim)
      }

      const { data: vendas, error: vendasError } = await vendasQuery
      if (vendasError) return { data: [], error: vendasError.message }

      const vendaIds = (vendas ?? []).map((v: { id: string }) => v.id)
      if (vendaIds.length === 0) return { data: [], error: null }

      // Buscar itens das vendas
      const { data: itens, error: itensError } = await supabase
        .from('itens_venda')
        .select('produto_id, descricao, quantidade, valor_total, produto:produtos(id,nome)')
        .in('venda_id', vendaIds)

      if (itensError) return { data: [], error: itensError.message }

      // Agrupar por produto
      const agrupado: Record<string, { nome: string; quantidade_total: number; valor_total: number }> = {}

      for (const item of itens ?? []) {
        const produtoId = item.produto_id
        if (!produtoId) continue

        if (!agrupado[produtoId]) {
          const nome = (item.produto as { id: string; nome: string } | null)?.nome ?? item.descricao
          agrupado[produtoId] = { nome, quantidade_total: 0, valor_total: 0 }
        }

        agrupado[produtoId].quantidade_total += item.quantidade || 0
        agrupado[produtoId].valor_total += item.valor_total || 0
      }

      const resultado = Object.entries(agrupado)
        .map(([produto_id, valores]) => ({
          produto_id,
          nome: valores.nome,
          quantidade_total: valores.quantidade_total,
          valor_total: valores.valor_total,
        }))
        .sort((a, b) => b.quantidade_total - a.quantidade_total)
        .slice(0, limite ?? 10)

      return { data: resultado, error: null }
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  // ============================================
  // TOP SERVIÇOS
  // ============================================

  async getTopServicos(
    limite?: number,
    dataInicio?: string,
    dataFim?: string
  ): Promise<{
    data: Array<{ servico_id: string; nome: string; quantidade_total: number; valor_total: number }>
    error: string | null
  }> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()

    try {
      // Buscar OS no período
      let osQuery = supabase
        .from('ordens_servico')
        .select('id')
        .eq('empresa_id', empresaId)

      if (dataInicio) {
        osQuery = osQuery.gte('created_at', dataInicio)
      }
      if (dataFim) {
        osQuery = osQuery.lte('created_at', dataFim)
      }

      const { data: ordens, error: ordensError } = await osQuery
      if (ordensError) return { data: [], error: ordensError.message }

      const osIds = (ordens ?? []).map((o: { id: string }) => o.id)
      if (osIds.length === 0) return { data: [], error: null }

      // Buscar itens de serviço das OS
      const { data: itens, error: itensError } = await supabase
        .from('itens_os')
        .select('servico_id, descricao, quantidade, valor_total, servico:servicos(id,nome)')
        .in('os_id', osIds)
        .eq('tipo', 'servico')

      if (itensError) return { data: [], error: itensError.message }

      // Agrupar por serviço
      const agrupado: Record<string, { nome: string; quantidade_total: number; valor_total: number }> = {}

      for (const item of itens ?? []) {
        const servicoId = item.servico_id
        if (!servicoId) continue

        if (!agrupado[servicoId]) {
          const nome = (item.servico as { id: string; nome: string } | null)?.nome ?? item.descricao
          agrupado[servicoId] = { nome, quantidade_total: 0, valor_total: 0 }
        }

        agrupado[servicoId].quantidade_total += item.quantidade || 0
        agrupado[servicoId].valor_total += item.valor_total || 0
      }

      const resultado = Object.entries(agrupado)
        .map(([servico_id, valores]) => ({
          servico_id,
          nome: valores.nome,
          quantidade_total: valores.quantidade_total,
          valor_total: valores.valor_total,
        }))
        .sort((a, b) => b.quantidade_total - a.quantidade_total)
        .slice(0, limite ?? 10)

      return { data: resultado, error: null }
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  // ============================================
  // ANIVERSARIANTES DO MÊS
  // ============================================

  async getAniversariantesMes(mes?: number): Promise<{ data: Cliente[]; error: string | null }> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()

    const mesAlvo = mes ?? new Date().getMonth() + 1 // 1-based

    const { data: clientes, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('ativo', true)
      .not('data_nascimento', 'is', null)

    if (error) return { data: [], error: error.message }

    const aniversariantes = (clientes ?? []).filter((cliente: { data_nascimento?: string | null }) => {
      if (!cliente.data_nascimento) return false
      const nascimento = new Date(cliente.data_nascimento)
      return nascimento.getMonth() + 1 === mesAlvo
    })

    return { data: aniversariantes, error: null }
  },
}
