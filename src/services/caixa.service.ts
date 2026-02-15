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

    // Verificar se já existe caixa aberto
    const { data: existente } = await supabase
      .from('caixa')
      .select('id')
      .eq('empresa_id', empresaId)
      .eq('status', 'aberto')
      .maybeSingle()

    if (existente) {
      return { data: null, error: 'Já existe um caixa aberto. Feche-o antes de abrir outro.' }
    }

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
      total_custo: number
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
    forma_pagamento?: string
    custo?: number
  }): Promise<{ data: MovimentacaoCaixa | null; error: string | null }> {
    const empresaId = getEmpresaId()
    const usuarioId = getUsuarioId()

    // Validar que o caixa pertence à empresa e está aberto
    const supabase = getSupabase()
    const { data: caixa } = await supabase
      .from('caixa')
      .select('id, valor_abertura, status')
      .eq('id', mov.caixa_id)
      .eq('empresa_id', empresaId)
      .single()

    if (!caixa) return { data: null, error: 'Caixa não encontrado' }
    if (caixa.status !== 'aberto') return { data: null, error: 'Caixa não está aberto' }

    // Validar saldo para sangrias
    if (mov.tipo === 'sangria') {
      const { data: movimentacoes } = await supabase
        .from('movimentacoes_caixa')
        .select('tipo, valor')
        .eq('caixa_id', mov.caixa_id)

      const saldo = (caixa.valor_abertura || 0) + (movimentacoes || []).reduce((acc: number, m: { tipo: string; valor: number }) => {
        return acc + (m.tipo === 'sangria' ? -m.valor : m.valor)
      }, 0)

      if (mov.valor > saldo) {
        return { data: null, error: `Saldo insuficiente. Saldo atual: R$ ${saldo.toFixed(2)}` }
      }
    }

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
      .select('*, venda:vendas(forma_pagamento), os:ordens_servico(forma_pagamento), usuario:usuarios!movimentacoes_caixa_usuario_id_fkey(nome)')
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
      .select('*, usuario_fechamento:usuarios!caixa_usuario_fechamento_id_fkey(nome)')
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
