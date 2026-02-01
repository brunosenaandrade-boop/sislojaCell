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
          plano: 'enterprise',
          status_assinatura: 'active' as const,
          meses_bonus: 0,
          onboarding_completo: true,
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
}
