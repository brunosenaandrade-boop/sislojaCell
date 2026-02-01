import { getSupabase, getEmpresaId, getUsuarioId, handleQuery, sanitizeSearch } from './base'
import type { OrdemServico, ItemOS } from '@/types/database'
import { planosService } from './planos.service'

export const ordensServicoService = {
  // ============================================
  // LISTAR ORDENS DE SERVIÇO
  // ============================================

  async listar(filtros?: { status?: string; busca?: string }): Promise<{ data: OrdemServico[]; error: string | null }> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()

    let query = supabase
      .from('ordens_servico')
      .select('*, cliente:clientes(id,nome,telefone)')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false })

    if (filtros?.status) {
      query = query.eq('status', filtros.status)
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

  async buscarPorId(id: string): Promise<{ data: OrdemServico | null; error: string | null }> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()

    const { data, error } = await supabase
      .from('ordens_servico')
      .select(`
        *,
        cliente:clientes(*),
        usuario:usuarios!ordens_servico_usuario_id_fkey(id,nome),
        tecnico:usuarios!ordens_servico_tecnico_id_fkey(id,nome),
        itens:itens_os(*, servico:servicos(id,nome), produto:produtos(id,nome))
      `)
      .eq('id', id)
      .eq('empresa_id', empresaId)
      .single()

    return { data, error: error?.message ?? null }
  },

  // ============================================
  // CRIAR ORDEM DE SERVIÇO
  // ============================================

  async criar(os: Omit<Partial<OrdemServico>, 'id' | 'numero' | 'empresa_id' | 'usuario_id' | 'created_at' | 'updated_at'>): Promise<{ data: OrdemServico | null; error: string | null }> {
    // Verificar limite do plano
    const limiteErro = await planosService.verificarLimite('os_mes')
    if (limiteErro) return { data: null, error: limiteErro }

    const supabase = getSupabase()
    const empresaId = getEmpresaId()
    const usuarioId = getUsuarioId()

    try {
      // Obter próximo número sequencial
      const { data: numeroData, error: numeroError } = await supabase
        .rpc('get_proximo_numero_os', { empresa_id: empresaId })

      if (numeroError) return { data: null, error: numeroError.message }

      const { data, error } = await supabase
        .from('ordens_servico')
        .insert({
          ...os,
          empresa_id: empresaId,
          usuario_id: usuarioId,
          numero: numeroData,
        })
        .select()
        .single()

      return { data, error: error?.message ?? null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  // ============================================
  // ATUALIZAR STATUS
  // ============================================

  async atualizarStatus(
    id: string,
    status: string,
    dados?: { diagnostico?: string; solucao?: string; data_finalizacao?: string; data_entrega?: string }
  ): Promise<{ data: OrdemServico | null; error: string | null }> {
    const empresaId = getEmpresaId()
    return handleQuery(() =>
      getSupabase()
        .from('ordens_servico')
        .update({ status, ...dados })
        .eq('id', id)
        .eq('empresa_id', empresaId)
        .select()
        .single()
    )
  },

  // ============================================
  // ATUALIZAR (GERAL)
  // ============================================

  async atualizar(id: string, dados: Partial<OrdemServico>): Promise<{ data: OrdemServico | null; error: string | null }> {
    const empresaId = getEmpresaId()
    return handleQuery(() =>
      getSupabase()
        .from('ordens_servico')
        .update(dados)
        .eq('id', id)
        .eq('empresa_id', empresaId)
        .select()
        .single()
    )
  },

  // ============================================
  // ITENS DA OS
  // ============================================

  async adicionarItem(item: {
    os_id: string
    tipo: 'servico' | 'produto'
    servico_id?: string
    produto_id?: string
    descricao: string
    quantidade: number
    valor_unitario: number
    valor_custo: number
    valor_total: number
  }): Promise<{ data: ItemOS | null; error: string | null }> {
    // Validar que a OS pertence à empresa
    const supabase = getSupabase()
    const empresaId = getEmpresaId()
    const { data: os } = await supabase
      .from('ordens_servico')
      .select('id')
      .eq('id', item.os_id)
      .eq('empresa_id', empresaId)
      .single()

    if (!os) return { data: null, error: 'Ordem de serviço não encontrada' }

    return handleQuery(() =>
      supabase
        .from('itens_os')
        .insert(item)
        .select()
        .single()
    )
  },

  async removerItem(itemId: string): Promise<{ data: null; error: string | null }> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()

    // Validar que o item pertence a uma OS da empresa
    const { data: itemOS } = await supabase
      .from('itens_os')
      .select('id, os_id')
      .eq('id', itemId)
      .single()

    if (itemOS) {
      const { data: os } = await supabase
        .from('ordens_servico')
        .select('id')
        .eq('id', itemOS.os_id)
        .eq('empresa_id', empresaId)
        .single()

      if (!os) return { data: null, error: 'Ordem de serviço não encontrada' }
    }

    const { error } = await supabase
      .from('itens_os')
      .delete()
      .eq('id', itemId)

    return { data: null, error: error?.message ?? null }
  },

  // ============================================
  // ATUALIZAR TOTAIS
  // ============================================

  async atualizarTotais(
    id: string,
    valores: { valor_servicos: number; valor_produtos: number; valor_desconto: number; valor_total: number }
  ): Promise<{ data: OrdemServico | null; error: string | null }> {
    const empresaId = getEmpresaId()
    return handleQuery(() =>
      getSupabase()
        .from('ordens_servico')
        .update(valores)
        .eq('id', id)
        .eq('empresa_id', empresaId)
        .select()
        .single()
    )
  },
}
