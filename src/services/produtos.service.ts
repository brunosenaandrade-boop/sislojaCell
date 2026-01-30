import type { Produto, CategoriaProduto } from '@/types/database'
import type { ServiceResult } from './base'
import { getSupabase, getEmpresaId, handleQuery, sanitizeSearch } from './base'

export const produtosService = {
  async listar(busca?: string, categoriaId?: string): Promise<ServiceResult<Produto[]>> {
    return handleQuery(async () => {
      const supabase = getSupabase()
      const empresaId = getEmpresaId()

      let query = supabase
        .from('produtos')
        .select('*, categoria:categorias_produtos(*)')
        .eq('empresa_id', empresaId)
        .eq('ativo', true)
        .order('nome')

      if (busca) {
        const term = sanitizeSearch(busca)
        if (term) {
          query = query.or(`nome.ilike.%${term}%,codigo.ilike.%${term}%`)
        }
      }

      if (categoriaId) {
        query = query.eq('categoria_id', categoriaId)
      }

      return query
    })
  },

  async buscarPorId(id: string): Promise<ServiceResult<Produto>> {
    return handleQuery(async () => {
      const supabase = getSupabase()
      return supabase
        .from('produtos')
        .select('*, categoria:categorias_produtos(*)')
        .eq('id', id)
        .single()
    })
  },

  async criar(produto: Partial<Omit<Produto, 'id' | 'empresa_id' | 'created_at' | 'updated_at' | 'categoria'>>): Promise<ServiceResult<Produto>> {
    return handleQuery(async () => {
      const supabase = getSupabase()
      const empresaId = getEmpresaId()

      return supabase
        .from('produtos')
        .insert({ ...produto, empresa_id: empresaId })
        .select()
        .single()
    })
  },

  async atualizar(id: string, dados: Partial<Omit<Produto, 'id' | 'empresa_id' | 'created_at' | 'updated_at' | 'categoria'>>): Promise<ServiceResult<Produto>> {
    return handleQuery(async () => {
      const supabase = getSupabase()
      return supabase
        .from('produtos')
        .update(dados)
        .eq('id', id)
        .select()
        .single()
    })
  },

  async excluir(id: string): Promise<ServiceResult<Produto>> {
    return handleQuery(async () => {
      const supabase = getSupabase()
      return supabase
        .from('produtos')
        .update({ ativo: false })
        .eq('id', id)
        .select()
        .single()
    })
  },

  async listarCategorias(): Promise<ServiceResult<CategoriaProduto[]>> {
    return handleQuery(async () => {
      const supabase = getSupabase()
      const empresaId = getEmpresaId()

      return supabase
        .from('categorias_produtos')
        .select('*')
        .eq('empresa_id', empresaId)
        .eq('ativo', true)
        .order('nome')
    })
  },

  async criarCategoria(nome: string, descricao?: string): Promise<ServiceResult<CategoriaProduto>> {
    return handleQuery(async () => {
      const supabase = getSupabase()
      const empresaId = getEmpresaId()

      return supabase
        .from('categorias_produtos')
        .insert({ nome, descricao, empresa_id: empresaId })
        .select()
        .single()
    })
  },

  async atualizarCategoria(id: string, nome: string, descricao?: string): Promise<ServiceResult<CategoriaProduto>> {
    return handleQuery(async () => {
      const supabase = getSupabase()
      return supabase
        .from('categorias_produtos')
        .update({ nome, descricao })
        .eq('id', id)
        .select()
        .single()
    })
  },

  async excluirCategoria(id: string): Promise<ServiceResult<CategoriaProduto>> {
    return handleQuery(async () => {
      const supabase = getSupabase()
      return supabase
        .from('categorias_produtos')
        .delete()
        .eq('id', id)
        .select()
        .single()
    })
  },
}
