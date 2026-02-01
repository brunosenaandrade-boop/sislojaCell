import { getSupabase, getEmpresaId, getUsuarioId, handleQuery } from './base'
import type { Caixa, MovimentacaoCaixa } from '@/types/database'

export const caixaService = {
  // ============================================
  // BUSCAR CAIXA ABERTO
  // ============================================

  async buscarAberto(): Promise<{ data: Caixa | null; error: string | null }> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()

    const { data, error } = await supabase
      .from('caixa')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('status', 'aberto')
      .maybeSingle()

    return { data: data ?? null, error: error?.message ?? null }
  },

  // ============================================
  // ABRIR CAIXA
  // ============================================

  async abrir(valorAbertura: number): Promise<{ data: Caixa | null; error: string | null }> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()
    const usuarioId = getUsuarioId()

    return handleQuery(() =>
      supabase
        .from('caixa')
        .insert({
          empresa_id: empresaId,
          usuario_abertura_id: usuarioId,
          status: 'aberto',
          valor_abertura: valorAbertura,
          data_abertura: new Date().toISOString(),
        })
        .select()
        .single()
    )
  },

  // ============================================
  // FECHAR CAIXA
  // ============================================

  async fechar(
    caixaId: string,
    valorFechamento: number,
    totais: {
      total_vendas: number
      total_os: number
      total_entradas: number
      total_saidas: number
      total_esperado: number
      diferenca: number
    }
  ): Promise<{ data: Caixa | null; error: string | null }> {
    const empresaId = getEmpresaId()
    const usuarioId = getUsuarioId()

    return handleQuery(() =>
      getSupabase()
        .from('caixa')
        .update({
          status: 'fechado',
          data_fechamento: new Date().toISOString(),
          valor_fechamento: valorFechamento,
          usuario_fechamento_id: usuarioId,
          ...totais,
        })
        .eq('id', caixaId)
        .eq('empresa_id', empresaId)
        .select()
        .single()
    )
  },

  // ============================================
  // MOVIMENTAÇÕES
  // ============================================

  async adicionarMovimentacao(mov: {
    caixa_id: string
    tipo: string
    valor: number
    descricao?: string
    venda_id?: string
    os_id?: string
  }): Promise<{ data: MovimentacaoCaixa | null; error: string | null }> {
    const empresaId = getEmpresaId()
    const usuarioId = getUsuarioId()

    // Validar que o caixa pertence à empresa
    const supabase = getSupabase()
    const { data: caixa } = await supabase
      .from('caixa')
      .select('id')
      .eq('id', mov.caixa_id)
      .eq('empresa_id', empresaId)
      .single()

    if (!caixa) return { data: null, error: 'Caixa não encontrado' }

    return handleQuery(() =>
      supabase
        .from('movimentacoes_caixa')
        .insert({
          ...mov,
          usuario_id: usuarioId,
        })
        .select()
        .single()
    )
  },

  async listarMovimentacoes(caixaId: string): Promise<{ data: MovimentacaoCaixa[]; error: string | null }> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()

    // Validar que o caixa pertence à empresa
    const { data: caixa } = await supabase
      .from('caixa')
      .select('id')
      .eq('id', caixaId)
      .eq('empresa_id', empresaId)
      .single()

    if (!caixa) return { data: [], error: 'Caixa não encontrado' }

    const { data, error } = await supabase
      .from('movimentacoes_caixa')
      .select('*')
      .eq('caixa_id', caixaId)
      .order('created_at', { ascending: true })

    return { data: data ?? [], error: error?.message ?? null }
  },

  // ============================================
  // HISTÓRICO DE CAIXAS
  // ============================================

  async listarHistorico(limite?: number): Promise<{ data: Caixa[]; error: string | null }> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()

    let query = supabase
      .from('caixa')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('status', 'fechado')
      .order('data_abertura', { ascending: false })

    if (limite) {
      query = query.limit(limite)
    }

    const { data, error } = await query
    return { data: data ?? [], error: error?.message ?? null }
  },
}
