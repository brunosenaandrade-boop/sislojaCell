import type { Produto, CategoriaProduto } from '@/types/database'
import type { ServiceResult } from './base'
import { getSupabase, getEmpresaId, handleQuery, sanitizeSearch } from './base'
import { planosService } from './planos.service'

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
      const empresaId = getEmpresaId()
      return supabase
        .from('produtos')
        .select('*, categoria:categorias_produtos(*)')
        .eq('id', id)
        .eq('empresa_id', empresaId)
        .single()
    })
  },

  async criar(produto: Partial<Omit<Produto, 'id' | 'empresa_id' | 'created_at' | 'updated_at' | 'categoria'>>): Promise<ServiceResult<Produto>> {
    // Verificar limite do plano
    const limiteErro = await planosService.verificarLimite('produtos')
    if (limiteErro) return { data: null, error: limiteErro }

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
      const empresaId = getEmpresaId()
      return supabase
        .from('produtos')
        .update(dados)
        .eq('id', id)
        .eq('empresa_id', empresaId)
        .select()
        .single()
    })
  },

  async excluir(id: string): Promise<ServiceResult<Produto>> {
    return handleQuery(async () => {
      const supabase = getSupabase()
      const empresaId = getEmpresaId()
      return supabase
        .from('produtos')
        .update({ ativo: false })
        .eq('id', id)
        .eq('empresa_id', empresaId)
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
      const empresaId = getEmpresaId()
      return supabase
        .from('categorias_produtos')
        .update({ nome, descricao })
        .eq('id', id)
        .eq('empresa_id', empresaId)
        .select()
        .single()
    })
  },

  async uploadImagem(produtoId: string, file: File): Promise<ServiceResult<string>> {
    try {
      const supabase = getSupabase()
      const empresaId = getEmpresaId()

      const { data: produto } = await supabase
        .from('produtos')
        .select('id')
        .eq('id', produtoId)
        .eq('empresa_id', empresaId)
        .single()

      if (!produto) return { data: null, error: 'Produto não encontrado' }

      const ext = file.name.split('.').pop() || 'webp'
      const uniqueName = `${crypto.randomUUID()}.${ext}`
      const storagePath = `${empresaId}/${produtoId}/${uniqueName}`

      const { error: uploadError } = await supabase.storage
        .from('produto-fotos')
        .upload(storagePath, file, { upsert: false })

      if (uploadError) return { data: null, error: uploadError.message }

      const { data: urlData } = supabase.storage
        .from('produto-fotos')
        .getPublicUrl(storagePath)

      const { error: updateError } = await supabase
        .from('produtos')
        .update({ imagem_url: urlData.publicUrl })
        .eq('id', produtoId)
        .eq('empresa_id', empresaId)

      if (updateError) return { data: null, error: updateError.message }

      return { data: urlData.publicUrl, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro ao fazer upload' }
    }
  },

  async removeImagem(produtoId: string): Promise<ServiceResult<null>> {
    try {
      const supabase = getSupabase()
      const empresaId = getEmpresaId()

      const { data: files } = await supabase.storage
        .from('produto-fotos')
        .list(`${empresaId}/${produtoId}`)

      if (files && files.length > 0) {
        const filePaths = files.map((f: { name: string }) => `${empresaId}/${produtoId}/${f.name}`)
        await supabase.storage.from('produto-fotos').remove(filePaths)
      }

      const { error } = await supabase
        .from('produtos')
        .update({ imagem_url: null })
        .eq('id', produtoId)
        .eq('empresa_id', empresaId)

      if (error) return { data: null, error: error.message }
      return { data: null, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro ao remover imagem' }
    }
  },

  async excluirCategoria(id: string): Promise<ServiceResult<CategoriaProduto>> {
    return handleQuery(async () => {
      const supabase = getSupabase()
      const empresaId = getEmpresaId()
      return supabase
        .from('categorias_produtos')
        .delete()
        .eq('id', id)
        .eq('empresa_id', empresaId)
        .select()
        .single()
    })
  },
}
