import type { Usuario, Empresa } from '@/types/database'
import type { ServiceResult } from './base'
import { getSupabase } from './base'

export const authService = {
  async getUsuarioLogado(): Promise<ServiceResult<{ usuario: Usuario; empresa: Empresa }>> {
    try {
      const supabase = getSupabase()

      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError) return { data: null, error: authError.message }
      if (!authData.user) return { data: null, error: 'Usuário não autenticado' }

      const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_id', authData.user.id)
        .eq('ativo', true)
        .single()

      if (usuarioError) return { data: null, error: usuarioError.message }
      if (!usuario) return { data: null, error: 'Usuário não encontrado no sistema' }

      // Superadmin não tem empresa vinculada
      if (usuario.perfil === 'superadmin') {
        const empresaPlaceholder = {
          id: 'superadmin',
          nome: 'Plataforma',
          nome_fantasia: 'Painel Administrativo',
          cor_primaria: '#dc2626',
          cor_secundaria: '#991b1b',
          ativo: true,
          created_at: '',
          updated_at: '',
        }
        return { data: { usuario, empresa: empresaPlaceholder as any }, error: null }
      }

      const { data: empresa, error: empresaError } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', usuario.empresa_id)
        .single()

      if (empresaError) return { data: null, error: empresaError.message }
      if (!empresa) return { data: null, error: 'Empresa não encontrada' }

      return { data: { usuario, empresa }, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  async login(email: string, senha: string): Promise<ServiceResult<{ usuario: Usuario; empresa: Empresa }>> {
    try {
      const supabase = getSupabase()

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      })

      if (signInError) return { data: null, error: signInError.message }

      return authService.getUsuarioLogado()
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  async logout(): Promise<ServiceResult<null>> {
    try {
      const supabase = getSupabase()
      const { error } = await supabase.auth.signOut()
      if (error) return { data: null, error: error.message }
      return { data: null, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  async criarUsuario(dados: {
    nome: string
    email: string
    senha: string
    perfil: 'admin' | 'funcionario'
    telefone?: string
  }): Promise<ServiceResult<Usuario>> {
    try {
      const supabase = getSupabase()

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: dados.email,
        password: dados.senha,
      })

      if (authError) return { data: null, error: authError.message }
      if (!authData.user) return { data: null, error: 'Erro ao criar usuário de autenticação' }

      const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .insert({
          auth_id: authData.user.id,
          nome: dados.nome,
          email: dados.email,
          perfil: dados.perfil,
          telefone: dados.telefone,
        })
        .select()
        .single()

      if (usuarioError) return { data: null, error: usuarioError.message }

      return { data: usuario, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  async cadastrarEmpresa(dados: {
    nomeEmpresa: string
    nomeFantasia?: string
    cnpj?: string
    telefone?: string
    nomeUsuario: string
    email: string
    senha: string
  }): Promise<ServiceResult<{ usuario: Usuario; empresa: Empresa }>> {
    try {
      const supabase = getSupabase()

      // 1. Criar usuario no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: dados.email,
        password: dados.senha,
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          return { data: null, error: 'Este email ja esta cadastrado' }
        }
        return { data: null, error: authError.message }
      }
      if (!authData.user) return { data: null, error: 'Erro ao criar conta' }

      // 2. Criar empresa
      const { data: empresa, error: empresaError } = await supabase
        .from('empresas')
        .insert({
          nome: dados.nomeEmpresa,
          nome_fantasia: dados.nomeFantasia || dados.nomeEmpresa,
          cnpj: dados.cnpj || null,
          telefone: dados.telefone || null,
          cor_primaria: '#2563eb',
          cor_secundaria: '#1e40af',
        })
        .select()
        .single()

      if (empresaError) return { data: null, error: empresaError.message }

      // 3. Criar usuario admin vinculado a empresa
      const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .insert({
          auth_id: authData.user.id,
          empresa_id: empresa.id,
          nome: dados.nomeUsuario,
          email: dados.email,
          perfil: 'admin',
          telefone: dados.telefone || null,
        })
        .select()
        .single()

      if (usuarioError) return { data: null, error: usuarioError.message }

      return { data: { usuario, empresa }, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },
}
