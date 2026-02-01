import type { Usuario, Empresa } from '@/types/database'
import type { ServiceResult } from './base'
import { getSupabase } from './base'
import { configuracoesService } from './configuracoes.service'

async function setupEmpresaDefaults(supabase: ReturnType<typeof getSupabase>, empresaId: string) {
  // Criar configurações padrão
  await configuracoesService.criarConfiguracoes(empresaId)

  // Criar categorias de produtos padrão
  await supabase.from('categorias_produtos').insert([
    { empresa_id: empresaId, nome: 'Acessórios' },
    { empresa_id: empresaId, nome: 'Peças' },
    { empresa_id: empresaId, nome: 'Capas' },
    { empresa_id: empresaId, nome: 'Carregadores' },
    { empresa_id: empresaId, nome: 'Fones de Ouvido' },
  ])

  // Criar categorias de serviços padrão
  await supabase.from('categorias_servicos').insert([
    { empresa_id: empresaId, nome: 'Celular' },
    { empresa_id: empresaId, nome: 'Videogame' },
    { empresa_id: empresaId, nome: 'Tablet' },
  ])
}

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
    codigoIndicacao?: string
    indicadaPor?: string
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

      // 2. Criar empresa com trial de 7 dias
      const trialFim = new Date()
      trialFim.setDate(trialFim.getDate() + 7)

      const { data: empresa, error: empresaError } = await supabase
        .from('empresas')
        .insert({
          nome: dados.nomeEmpresa,
          nome_fantasia: dados.nomeFantasia || dados.nomeEmpresa,
          cnpj: dados.cnpj || null,
          telefone: dados.telefone || null,
          cor_primaria: '#2563eb',
          cor_secundaria: '#1e40af',
          plano: 'free',
          status_assinatura: 'trial',
          trial_fim: trialFim.toISOString(),
          meses_bonus: 0,
          onboarding_completo: false,
          indicada_por: dados.indicadaPor || null,
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

      // 4. Auto-setup: configurações + categorias padrão
      await setupEmpresaDefaults(supabase, empresa.id)

      // 5. Se foi indicada, registrar indicação
      if (dados.codigoIndicacao) {
        const { data: empresaOrigem } = await supabase
          .from('empresas')
          .select('id, cnpj, email')
          .eq('codigo_indicacao', dados.codigoIndicacao)
          .single()

        if (empresaOrigem) {
          // 13.26 - Não permitir auto-indicação
          const isSelf = empresaOrigem.id === empresa.id
          // 13.27 - Não permitir duplicata (mesmo email/CNPJ já indicado)
          const sameEmail = empresaOrigem.email === dados.email
          const sameCnpj = dados.cnpj && empresaOrigem.cnpj && empresaOrigem.cnpj === dados.cnpj

          if (!isSelf && !sameEmail && !sameCnpj) {
            // Verificar se esta empresa já foi indicada antes
            const { data: existente } = await supabase
              .from('indicacoes')
              .select('id')
              .eq('empresa_indicada_id', empresa.id)
              .maybeSingle()

            if (!existente) {
              await supabase.from('indicacoes').insert({
                empresa_origem_id: empresaOrigem.id,
                empresa_indicada_id: empresa.id,
                codigo_indicacao: dados.codigoIndicacao,
                status: 'pendente',
                data_cadastro_indicado: new Date().toISOString(),
              })
            }
          }
        }
      }

      // 6. Enviar email de boas-vindas (fire-and-forget via API route)
      fetch('/api/email/boas-vindas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: dados.email,
          nomeEmpresa: dados.nomeFantasia || dados.nomeEmpresa,
        }),
      }).catch(() => {})

      return { data: { usuario, empresa }, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },
}
