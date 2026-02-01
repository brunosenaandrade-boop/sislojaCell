import { getSupabase, getEmpresaId } from './base'
import type { Plano, UsageInfo } from '@/types/database'

// ============================================
// SERVIÇO DE PLANOS E LIMITES
// ============================================

export type Recurso = 'usuarios' | 'produtos' | 'os_mes' | 'vendas_mes'

export const planosService = {
  // 3.5 - Buscar plano atual da empresa
  async getPlano(empresaId?: string): Promise<{ plano: Plano | null; error: string | null }> {
    const supabase = getSupabase()
    const id = empresaId || getEmpresaId()

    const { data: empresa } = await supabase
      .from('empresas')
      .select('plano')
      .eq('id', id)
      .single()

    if (!empresa) return { plano: null, error: 'Empresa não encontrada' }

    const { data: plano, error } = await supabase
      .from('planos')
      .select('*')
      .eq('slug', empresa.plano || 'free')
      .single()

    return { plano, error: error?.message ?? null }
  },

  // 3.7 - Obter uso atual vs limites
  async getUsage(empresaId?: string): Promise<{ data: UsageInfo | null; error: string | null }> {
    const supabase = getSupabase()
    const id = empresaId || getEmpresaId()

    // Buscar plano da empresa
    const { plano, error: planoError } = await this.getPlano(id)
    if (planoError || !plano) return { data: null, error: planoError || 'Plano não encontrado' }

    // Contar usuários ativos
    const { count: usersCount } = await supabase
      .from('usuarios')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', id)
      .eq('ativo', true)

    // Contar produtos ativos
    const { count: produtosCount } = await supabase
      .from('produtos')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', id)
      .eq('ativo', true)

    // Contar OS do mês atual
    const inicioMes = new Date()
    inicioMes.setDate(1)
    inicioMes.setHours(0, 0, 0, 0)

    const { count: osCount } = await supabase
      .from('ordens_servico')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', id)
      .gte('created_at', inicioMes.toISOString())

    // Contar vendas do mês atual
    const { count: vendasCount } = await supabase
      .from('vendas')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', id)
      .gte('created_at', inicioMes.toISOString())

    return {
      data: {
        usuarios_count: usersCount || 0,
        usuarios_limit: plano.max_usuarios,
        produtos_count: produtosCount || 0,
        produtos_limit: plano.max_produtos,
        os_mes_count: osCount || 0,
        os_mes_limit: plano.max_os_mes,
        vendas_mes_count: vendasCount || 0,
        vendas_mes_limit: plano.max_vendas_mes,
      },
      error: null,
    }
  },

  // 3.6 - Verificar se pode criar mais de um recurso
  // Retorna null se OK, ou mensagem de erro se limite atingido
  // Limite -1 = ilimitado
  async verificarLimite(recurso: Recurso, empresaId?: string): Promise<string | null> {
    const { data: usage, error } = await this.getUsage(empresaId)
    if (error || !usage) return 'Não foi possível verificar limites do plano. Tente novamente.'

    switch (recurso) {
      case 'usuarios': {
        if (usage.usuarios_limit === -1) return null
        if (usage.usuarios_count >= usage.usuarios_limit) {
          return `Limite de usuários atingido (${usage.usuarios_count}/${usage.usuarios_limit}). Faça upgrade do plano.`
        }
        return null
      }
      case 'produtos': {
        if (usage.produtos_limit === -1) return null
        if (usage.produtos_count >= usage.produtos_limit) {
          return `Limite de produtos atingido (${usage.produtos_count}/${usage.produtos_limit}). Faça upgrade do plano.`
        }
        return null
      }
      case 'os_mes': {
        if (usage.os_mes_limit === -1) return null
        if (usage.os_mes_count >= usage.os_mes_limit) {
          return `Limite de ordens de serviço do mês atingido (${usage.os_mes_count}/${usage.os_mes_limit}). Faça upgrade do plano.`
        }
        return null
      }
      case 'vendas_mes': {
        if (usage.vendas_mes_limit === -1) return null
        if (usage.vendas_mes_count >= usage.vendas_mes_limit) {
          return `Limite de vendas do mês atingido (${usage.vendas_mes_count}/${usage.vendas_mes_limit}). Faça upgrade do plano.`
        }
        return null
      }
      default:
        return null
    }
  },
}
