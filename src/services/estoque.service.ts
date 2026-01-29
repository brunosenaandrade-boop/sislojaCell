import { getSupabase, getEmpresaId, getUsuarioId } from './base'
import type { MovimentacaoEstoque } from '@/types/database'

export const estoqueService = {
  // ============================================
  // REGISTRAR MOVIMENTAÇÃO
  // ============================================

  async registrarMovimentacao(mov: {
    produto_id: string
    tipo: string
    quantidade: number
    motivo?: string
    observacoes?: string
    venda_id?: string
    os_id?: string
  }): Promise<{ data: MovimentacaoEstoque | null; error: string | null }> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()
    const usuarioId = getUsuarioId()

    try {
      // 1. Buscar estoque atual do produto
      const { data: produto, error: produtoError } = await supabase
        .from('produtos')
        .select('estoque_atual')
        .eq('id', mov.produto_id)
        .single()

      if (produtoError) return { data: null, error: produtoError.message }

      const estoqueAnterior = produto.estoque_atual
      let estoquePosterior: number

      if (mov.tipo === 'entrada') {
        estoquePosterior = estoqueAnterior + mov.quantidade
      } else if (mov.tipo === 'saida' || mov.tipo === 'venda' || mov.tipo === 'os') {
        estoquePosterior = estoqueAnterior - mov.quantidade
      } else {
        // ajuste: quantidade é o valor absoluto final
        estoquePosterior = mov.quantidade
      }

      // 2. Inserir movimentação
      const { data: movimentacao, error: movError } = await supabase
        .from('movimentacoes_estoque')
        .insert({
          empresa_id: empresaId,
          usuario_id: usuarioId,
          produto_id: mov.produto_id,
          tipo: mov.tipo,
          quantidade: mov.quantidade,
          estoque_anterior: estoqueAnterior,
          estoque_posterior: estoquePosterior,
          motivo: mov.motivo,
          observacoes: mov.observacoes,
          venda_id: mov.venda_id,
          os_id: mov.os_id,
        })
        .select()
        .single()

      if (movError) return { data: null, error: movError.message }

      // 3. Atualizar estoque do produto
      const { error: updateError } = await supabase
        .from('produtos')
        .update({ estoque_atual: estoquePosterior })
        .eq('id', mov.produto_id)

      if (updateError) return { data: null, error: updateError.message }

      return { data: movimentacao, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  // ============================================
  // LISTAR MOVIMENTAÇÕES
  // ============================================

  async listarMovimentacoes(filtros?: {
    produtoId?: string
    tipo?: string
  }): Promise<{ data: MovimentacaoEstoque[]; error: string | null }> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()

    let query = supabase
      .from('movimentacoes_estoque')
      .select('*, produto:produtos(id,nome,codigo)')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false })

    if (filtros?.produtoId) {
      query = query.eq('produto_id', filtros.produtoId)
    }

    if (filtros?.tipo) {
      query = query.eq('tipo', filtros.tipo)
    }

    const { data, error } = await query
    return { data: data ?? [], error: error?.message ?? null }
  },
}
