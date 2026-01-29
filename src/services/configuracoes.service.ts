import { getSupabase, getEmpresaId, getUsuarioId, handleQuery } from './base'
import type { Empresa, Usuario, Configuracoes } from '@/types/database'

export const configuracoesService = {
  // ============================================
  // EMPRESA
  // ============================================

  async getEmpresa(): Promise<{ data: Empresa | null; error: string | null }> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()

    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', empresaId)
      .single()

    return { data, error: error?.message ?? null }
  },

  async atualizarEmpresa(dados: Partial<Empresa>): Promise<{ data: Empresa | null; error: string | null }> {
    const empresaId = getEmpresaId()
    return handleQuery(() =>
      getSupabase()
        .from('empresas')
        .update(dados)
        .eq('id', empresaId)
        .select()
        .single()
    )
  },

  // ============================================
  // CONFIGURAÇÕES
  // ============================================

  async getConfiguracoes(): Promise<{ data: Configuracoes | null; error: string | null }> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()

    const { data, error } = await supabase
      .from('configuracoes')
      .select('*')
      .eq('empresa_id', empresaId)
      .single()

    return { data, error: error?.message ?? null }
  },

  async atualizarConfiguracoes(dados: Partial<Configuracoes>): Promise<{ data: Configuracoes | null; error: string | null }> {
    const empresaId = getEmpresaId()
    return handleQuery(() =>
      getSupabase()
        .from('configuracoes')
        .update(dados)
        .eq('empresa_id', empresaId)
        .select()
        .single()
    )
  },

  // ============================================
  // USUÁRIOS
  // ============================================

  async listarUsuarios(): Promise<{ data: Usuario[]; error: string | null }> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('nome')

    return { data: data ?? [], error: error?.message ?? null }
  },

  async criarUsuario(dados: {
    nome: string
    email: string
    senha: string
    perfil: 'admin' | 'funcionario'
    telefone?: string
  }): Promise<{ data: Usuario | null; error: string | null }> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()

    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: dados.email,
      password: dados.senha,
    })

    if (authError) return { data: null, error: authError.message }
    if (!authData.user) return { data: null, error: 'Erro ao criar usuário' }

    // 2. Inserir na tabela usuarios
    const { data, error } = await supabase
      .from('usuarios')
      .insert({
        auth_id: authData.user.id,
        empresa_id: empresaId,
        nome: dados.nome,
        email: dados.email,
        telefone: dados.telefone || null,
        perfil: dados.perfil,
      })
      .select()
      .single()

    return { data, error: error?.message ?? null }
  },

  async atualizarUsuario(id: string, dados: Partial<Usuario>): Promise<{ data: Usuario | null; error: string | null }> {
    return handleQuery(() =>
      getSupabase()
        .from('usuarios')
        .update(dados)
        .eq('id', id)
        .select()
        .single()
    )
  },

  async desativarUsuario(id: string): Promise<{ data: Usuario | null; error: string | null }> {
    return handleQuery(() =>
      getSupabase()
        .from('usuarios')
        .update({ ativo: false })
        .eq('id', id)
        .select()
        .single()
    )
  },
}
