import { getSupabase, getEmpresaId, getUsuarioId, sanitizeSearch } from './base'
import type { Venda, ItemVenda } from '@/types/database'
import { planosService } from './planos.service'

export const vendasService = {
  // ============================================
  // CRIAR VENDA (TRANSACIONAL)
  // ============================================

  async criar(venda: {
    cliente_id?: string
    forma_pagamento: string
    valor_produtos: number
    valor_custo_total: number
    valor_desconto: number
    valor_total: number
    observacoes?: string
    itens: Array<{
      produto_id: string
      descricao: string
      quantidade: number
      valor_unitario: number
      valor_custo: number
      valor_total: number
      lucro_item: number
    }>
  }): Promise<{ data: Venda | null; error: string | null }> {
    // Verificar limite do plano
    const limiteErro = await planosService.verificarLimite('vendas_mes')
    if (limiteErro) return { data: null, error: limiteErro }

    const supabase = getSupabase()
    const empresaId = getEmpresaId()
    const usuarioId = getUsuarioId()

    try {
      // 1. Obter próximo número sequencial
      const { data: numeroData, error: numeroError } = await supabase
        .rpc('get_proximo_numero_venda', { p_empresa_id: empresaId })

      if (numeroError) return { data: null, error: numeroError.message }

      // 2. Inserir a venda
      const { itens, ...dadosVenda } = venda
      const lucroLiquido = dadosVenda.valor_total - dadosVenda.valor_custo_total

      const { data: vendaCriada, error: vendaError } = await supabase
        .from('vendas')
        .insert({
          ...dadosVenda,
          empresa_id: empresaId,
          usuario_id: usuarioId,
          numero: numeroData,
          lucro_liquido: lucroLiquido,
        })
        .select()
        .single()

      if (vendaError) return { data: null, error: vendaError.message }

      // 3. Inserir itens da venda
      const itensComVendaId = itens.map((item) => ({
        ...item,
        venda_id: vendaCriada.id,
      }))

      const { error: itensError } = await supabase
        .from('itens_venda')
        .insert(itensComVendaId)

      if (itensError) return { data: null, error: itensError.message }

      return { data: vendaCriada, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  // ============================================
  // LISTAR VENDAS
  // ============================================

  async listar(filtros?: {
    dataInicio?: string
    dataFim?: string
    busca?: string
  }): Promise<{ data: Venda[]; error: string | null }> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()

    let query = supabase
      .from('vendas')
      .select('*, cliente:clientes(id,nome), itens:itens_venda(*)')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false })

    if (filtros?.dataInicio) {
      query = query.gte('created_at', filtros.dataInicio)
    }

    if (filtros?.dataFim) {
      query = query.lte('created_at', filtros.dataFim)
    }

    if (filtros?.busca) {
      const term = sanitizeSearch(filtros.busca)
      if (term) {
        query = query.or(
          `numero.cast(text).ilike.%${term}%,cliente.nome.ilike.%${term}%`
        )
      }
    }

    const { data, error } = await query
    return { data: data ?? [], error: error?.message ?? null }
  },

  // ============================================
  // BUSCAR POR ID
  // ============================================

  async buscarPorId(id: string): Promise<{ data: Venda | null; error: string | null }> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()

    const { data, error } = await supabase
      .from('vendas')
      .select(`
        *,
        cliente:clientes(*),
        usuario:usuarios(id,nome),
        itens:itens_venda(*, produto:produtos(id,nome,codigo))
      `)
      .eq('id', id)
      .eq('empresa_id', empresaId)
      .single()

    return { data, error: error?.message ?? null }
  },
}
