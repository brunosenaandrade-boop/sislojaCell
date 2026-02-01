import type { Servico, CategoriaServico } from '@/types/database'
import type { ServiceResult } from './base'
import { getSupabase, getEmpresaId, handleQuery } from './base'

export const servicosService = {
  async listar(busca?: string, tipo?: string): Promise<ServiceResult<Servico[]>> {
    return handleQuery(async () => {
      const supabase = getSupabase()
      const empresaId = getEmpresaId()

      let query = supabase
        .from('servicos')
        .select('*')
        .eq('empresa_id', empresaId)
        .eq('ativo', true)
        .order('nome')

      if (busca) {
        query = query.ilike('nome', `%${busca}%`)
      }

      if (tipo) {
        query = query.eq('tipo', tipo)
      }

      return query
    })
  },

  async buscarPorId(id: string): Promise<ServiceResult<Servico>> {
    return handleQuery(async () => {
      const supabase = getSupabase()
      const empresaId = getEmpresaId()
      return supabase
        .from('servicos')
        .select('*')
        .eq('id', id)
        .eq('empresa_id', empresaId)
        .single()
    })
  },

  async criar(servico: Partial<Omit<Servico, 'id' | 'empresa_id' | 'created_at' | 'updated_at' | 'categoria'>>): Promise<ServiceResult<Servico>> {
    return handleQuery(async () => {
      const supabase = getSupabase()
      const empresaId = getEmpresaId()

      return supabase
        .from('servicos')
        .insert({ ...servico, empresa_id: empresaId })
        .select()
        .single()
    })
  },

  async atualizar(id: string, dados: Partial<Omit<Servico, 'id' | 'empresa_id' | 'created_at' | 'updated_at' | 'categoria'>>): Promise<ServiceResult<Servico>> {
    return handleQuery(async () => {
      const supabase = getSupabase()
      const empresaId = getEmpresaId()
      return supabase
        .from('servicos')
        .update(dados)
        .eq('id', id)
        .eq('empresa_id', empresaId)
        .select()
        .single()
    })
  },

  async excluir(id: string): Promise<ServiceResult<Servico>> {
    return handleQuery(async () => {
      const supabase = getSupabase()
      const empresaId = getEmpresaId()
      return supabase
        .from('servicos')
        .update({ ativo: false })
        .eq('id', id)
        .eq('empresa_id', empresaId)
        .select()
        .single()
    })
  },

  async listarCategorias(): Promise<ServiceResult<CategoriaServico[]>> {
    return handleQuery(async () => {
      const supabase = getSupabase()
      const empresaId = getEmpresaId()

      return supabase
        .from('categorias_servicos')
        .select('*')
        .eq('empresa_id', empresaId)
        .eq('ativo', true)
        .order('nome')
    })
  },
}
