import type { Cliente } from '@/types/database'
import type { ServiceResult } from './base'
import { getSupabase, getEmpresaId, handleQuery, sanitizeSearch } from './base'

export const clientesService = {
  async listar(busca?: string): Promise<ServiceResult<Cliente[]>> {
    return handleQuery(async () => {
      const supabase = getSupabase()
      const empresaId = getEmpresaId()

      let query = supabase
        .from('clientes')
        .select('*')
        .eq('empresa_id', empresaId)
        .eq('ativo', true)
        .order('nome')

      if (busca) {
        const term = sanitizeSearch(busca)
        if (term) {
          query = query.or(
            `nome.ilike.%${term}%,telefone.ilike.%${term}%,cpf.ilike.%${term}%,email.ilike.%${term}%`
          )
        }
      }

      return query
    })
  },

  async buscarPorId(id: string): Promise<ServiceResult<Cliente>> {
    return handleQuery(async () => {
      const supabase = getSupabase()
      return supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .single()
    })
  },

  async criar(cliente: Partial<Omit<Cliente, 'id' | 'empresa_id' | 'created_at' | 'updated_at'>>): Promise<ServiceResult<Cliente>> {
    return handleQuery(async () => {
      const supabase = getSupabase()
      const empresaId = getEmpresaId()

      return supabase
        .from('clientes')
        .insert({ ...cliente, empresa_id: empresaId })
        .select()
        .single()
    })
  },

  async atualizar(id: string, dados: Partial<Omit<Cliente, 'id' | 'empresa_id' | 'created_at' | 'updated_at'>>): Promise<ServiceResult<Cliente>> {
    return handleQuery(async () => {
      const supabase = getSupabase()
      return supabase
        .from('clientes')
        .update(dados)
        .eq('id', id)
        .select()
        .single()
    })
  },

  async excluir(id: string): Promise<ServiceResult<Cliente>> {
    return handleQuery(async () => {
      const supabase = getSupabase()
      return supabase
        .from('clientes')
        .update({ ativo: false })
        .eq('id', id)
        .select()
        .single()
    })
  },

  async aniversariantes(): Promise<ServiceResult<Cliente[]>> {
    try {
      const supabase = getSupabase()
      const empresaId = getEmpresaId()

      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('empresa_id', empresaId)
        .eq('ativo', true)
        .not('data_nascimento', 'is', null)

      if (error) return { data: null, error: error.message }
      if (!data) return { data: [], error: null }

      const hoje = new Date()
      const proximos7Dias = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(hoje)
        d.setDate(d.getDate() + i)
        return { month: d.getMonth() + 1, day: d.getDate() }
      })

      const aniversariantes = data.filter((cliente: { data_nascimento?: string | null }) => {
        if (!cliente.data_nascimento) return false
        const nascimento = new Date(cliente.data_nascimento)
        const month = nascimento.getMonth() + 1
        const day = nascimento.getDate()
        return proximos7Dias.some((d) => d.month === month && d.day === day)
      })

      return { data: aniversariantes, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },
}
