import { getSupabase, getEmpresaId, handleQuery } from './base'
import type { Indicacao } from '@/types/database'
import type { ServiceResult } from './base'

// ============================================
// 13.2-13.7 - Serviço de Indicações
// ============================================

export const indicacoesService = {
  // 13.2 - Gerar código de indicação único
  async gerarCodigoIndicacao(): Promise<ServiceResult<string>> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()

    // Verificar se já tem código (13.28 - imutável após gerado)
    const { data: empresa } = await supabase
      .from('empresas')
      .select('codigo_indicacao')
      .eq('id', empresaId)
      .single()

    if (empresa?.codigo_indicacao) {
      return { data: empresa.codigo_indicacao, error: null }
    }

    // Gerar código único REF-XXXXXX
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let codigo = ''
    for (let i = 0; i < 6; i++) {
      codigo += chars[Math.floor(Math.random() * chars.length)]
    }
    codigo = `REF-${codigo}`

    // Verificar unicidade
    const { data: existente } = await supabase
      .from('empresas')
      .select('id')
      .eq('codigo_indicacao', codigo)
      .maybeSingle()

    if (existente) {
      // Retry com sufixo extra
      codigo = `REF-${codigo.slice(4)}${chars[Math.floor(Math.random() * chars.length)]}`
    }

    // Salvar na empresa
    const { error } = await supabase
      .from('empresas')
      .update({ codigo_indicacao: codigo })
      .eq('id', empresaId)

    if (error) return { data: null, error: error.message }

    return { data: codigo, error: null }
  },

  // 13.3 - Listar minhas indicações
  async getMinhasIndicacoes(): Promise<ServiceResult<Indicacao[]>> {
    return handleQuery(async () => {
      const supabase = getSupabase()
      const empresaId = getEmpresaId()

      return supabase
        .from('indicacoes')
        .select('*, empresa_indicada:empresas!indicacoes_empresa_indicada_id_fkey(id, nome, nome_fantasia, status_assinatura, created_at)')
        .eq('empresa_origem_id', empresaId)
        .order('created_at', { ascending: false })
    })
  },

  // 13.4 - Dados resumidos do programa
  async getMeusDadosIndicacao(): Promise<ServiceResult<{
    codigo: string | null
    totalIndicacoes: number
    pendentes: number
    aguardando: number
    qualificadas: number
    recompensadas: number
    canceladas: number
    mesesBonus: number
  }>> {
    try {
      const supabase = getSupabase()
      const empresaId = getEmpresaId()

      // Buscar empresa
      const { data: empresa } = await supabase
        .from('empresas')
        .select('codigo_indicacao, meses_bonus')
        .eq('id', empresaId)
        .single()

      // Buscar indicações
      const { data: indicacoes } = await supabase
        .from('indicacoes')
        .select('status')
        .eq('empresa_origem_id', empresaId)

      const lista = (indicacoes || []) as { status: string }[]

      return {
        data: {
          codigo: empresa?.codigo_indicacao || null,
          totalIndicacoes: lista.length,
          pendentes: lista.filter((i) => i.status === 'pendente').length,
          aguardando: lista.filter((i) => i.status === 'aguardando').length,
          qualificadas: lista.filter((i) => i.status === 'qualificada').length,
          recompensadas: lista.filter((i) => i.status === 'recompensada').length,
          canceladas: lista.filter((i) => i.status === 'cancelada').length,
          mesesBonus: empresa?.meses_bonus || 0,
        },
        error: null,
      }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  // 13.5 - Buscar empresa de origem pelo código (para exibir nome no cadastro)
  async buscarEmpresaPorCodigo(codigo: string): Promise<ServiceResult<{ nome: string; nome_fantasia: string | null }>> {
    try {
      const supabase = getSupabase()

      const { data, error } = await supabase
        .from('empresas')
        .select('nome, nome_fantasia')
        .eq('codigo_indicacao', codigo)
        .single()

      if (error || !data) return { data: null, error: 'Código de indicação não encontrado' }

      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },
}
