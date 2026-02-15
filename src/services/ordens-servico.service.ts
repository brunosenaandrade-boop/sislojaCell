import { getSupabase, getEmpresaId, getUsuarioId, handleQuery, sanitizeSearch } from './base'
import type { OrdemServico, ItemOS, FotoOS } from '@/types/database'
import { planosService } from './planos.service'

function gerarCodigoAcompanhamento(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  let codigo = ''
  for (let i = 0; i < 8; i++) {
    codigo += chars[bytes[i] % chars.length]
  }
  return codigo
}

export const ordensServicoService = {
  // ============================================
  // LISTAR ORDENS DE SERVIÇO
  // ============================================

  async listar(filtros?: { status?: string; busca?: string }): Promise<{ data: OrdemServico[]; error: string | null }> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()

    let query = supabase
      .from('ordens_servico')
      .select('*, cliente:clientes(id,nome,telefone)')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false })

    if (filtros?.status) {
      query = query.eq('status', filtros.status)
    }

    if (filtros?.busca) {
      const term = sanitizeSearch(filtros.busca)
      if (term) {
        query = query.or(
          `numero.cast(text).ilike.%${term}%,cliente.nome.ilike.%${term}%`
        )
      }
    }

    const { data, error } = await query
    return { data: data ?? [], error: error?.message ?? null }
  },

  // ============================================
  // BUSCAR POR ID
  // ============================================

  async buscarPorId(id: string): Promise<{ data: OrdemServico | null; error: string | null }> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()

    const { data, error } = await supabase
      .from('ordens_servico')
      .select(`
        *,
        cliente:clientes(*),
        usuario:usuarios!ordens_servico_usuario_id_fkey(id,nome),
        tecnico:usuarios!ordens_servico_tecnico_id_fkey(id,nome),
        itens:itens_os(*, servico:servicos(id,nome), produto:produtos(id,nome))
      `)
      .eq('id', id)
      .eq('empresa_id', empresaId)
      .single()

    return { data, error: error?.message ?? null }
  },

  // ============================================
  // CRIAR ORDEM DE SERVIÇO
  // ============================================

  async criar(os: Omit<Partial<OrdemServico>, 'id' | 'numero' | 'empresa_id' | 'usuario_id' | 'created_at' | 'updated_at'>): Promise<{ data: OrdemServico | null; error: string | null }> {
    // Verificar limite do plano
    const limiteErro = await planosService.verificarLimite('os_mes')
    if (limiteErro) return { data: null, error: limiteErro }

    const supabase = getSupabase()
    const empresaId = getEmpresaId()
    const usuarioId = getUsuarioId()

    try {
      // Obter próximo número sequencial
      const { data: numeroData, error: numeroError } = await supabase
        .rpc('get_proximo_numero_os', { p_empresa_id: empresaId })

      if (numeroError) return { data: null, error: numeroError.message }

      // Gerar código de acompanhamento público (8 chars)
      const codigoAcompanhamento = gerarCodigoAcompanhamento()

      const { data, error } = await supabase
        .from('ordens_servico')
        .insert({
          ...os,
          empresa_id: empresaId,
          usuario_id: usuarioId,
          numero: numeroData,
          codigo_acompanhamento: codigoAcompanhamento,
        })
        .select()
        .single()

      return { data, error: error?.message ?? null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  // ============================================
  // ATUALIZAR STATUS
  // ============================================

  async atualizarStatus(
    id: string,
    status: string,
    dados?: { diagnostico?: string; solucao?: string; data_finalizacao?: string; data_entrega?: string }
  ): Promise<{ data: OrdemServico | null; error: string | null }> {
    const empresaId = getEmpresaId()
    return handleQuery(() =>
      getSupabase()
        .from('ordens_servico')
        .update({ status, ...dados })
        .eq('id', id)
        .eq('empresa_id', empresaId)
        .select()
        .single()
    )
  },

  // ============================================
  // ATUALIZAR (GERAL)
  // ============================================

  async atualizar(id: string, dados: Partial<OrdemServico>): Promise<{ data: OrdemServico | null; error: string | null }> {
    const empresaId = getEmpresaId()
    return handleQuery(() =>
      getSupabase()
        .from('ordens_servico')
        .update(dados)
        .eq('id', id)
        .eq('empresa_id', empresaId)
        .select()
        .single()
    )
  },

  // ============================================
  // ITENS DA OS
  // ============================================

  async adicionarItem(item: {
    os_id: string
    tipo: 'servico' | 'produto'
    servico_id?: string
    produto_id?: string
    descricao: string
    quantidade: number
    valor_unitario: number
    valor_custo: number
    valor_total: number
  }): Promise<{ data: ItemOS | null; error: string | null }> {
    // Validar que a OS pertence à empresa
    const supabase = getSupabase()
    const empresaId = getEmpresaId()
    const { data: os } = await supabase
      .from('ordens_servico')
      .select('id')
      .eq('id', item.os_id)
      .eq('empresa_id', empresaId)
      .single()

    if (!os) return { data: null, error: 'Ordem de serviço não encontrada' }

    return handleQuery(() =>
      supabase
        .from('itens_os')
        .insert(item)
        .select()
        .single()
    )
  },

  async removerItem(itemId: string): Promise<{ data: null; error: string | null }> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()

    // Validar que o item pertence a uma OS da empresa
    const { data: itemOS } = await supabase
      .from('itens_os')
      .select('id, os_id')
      .eq('id', itemId)
      .single()

    if (itemOS) {
      const { data: os } = await supabase
        .from('ordens_servico')
        .select('id')
        .eq('id', itemOS.os_id)
        .eq('empresa_id', empresaId)
        .single()

      if (!os) return { data: null, error: 'Ordem de serviço não encontrada' }
    }

    const { error } = await supabase
      .from('itens_os')
      .delete()
      .eq('id', itemId)

    return { data: null, error: error?.message ?? null }
  },

  // ============================================
  // ATUALIZAR TOTAIS
  // ============================================

  async atualizarTotais(
    id: string,
    valores: { valor_servicos: number; valor_produtos: number; valor_desconto: number; valor_total: number }
  ): Promise<{ data: OrdemServico | null; error: string | null }> {
    const empresaId = getEmpresaId()
    return handleQuery(() =>
      getSupabase()
        .from('ordens_servico')
        .update(valores)
        .eq('id', id)
        .eq('empresa_id', empresaId)
        .select()
        .single()
    )
  },

  // ============================================
  // FOTOS DA OS
  // ============================================

  async uploadFoto(
    osId: string,
    file: File,
    metadata: { nomeOriginal: string; tamanhoBytes: number; largura?: number; altura?: number; tipoMime?: string; fileHash?: string }
  ): Promise<{ data: FotoOS | null; error: string | null }> {
    try {
      const supabase = getSupabase()
      const empresaId = getEmpresaId()

      const { data: os } = await supabase
        .from('ordens_servico')
        .select('id')
        .eq('id', osId)
        .eq('empresa_id', empresaId)
        .single()

      if (!os) return { data: null, error: 'Ordem de serviço não encontrada' }

      const { count } = await supabase
        .from('fotos_os')
        .select('id', { count: 'exact', head: true })
        .eq('os_id', osId)

      if ((count ?? 0) >= 10) return { data: null, error: 'Limite de 10 fotos por OS atingido' }

      const ext = file.name.split('.').pop() || 'webp'
      const uniqueName = `${crypto.randomUUID()}.${ext}`
      const storagePath = `${empresaId}/${osId}/${uniqueName}`

      const { error: uploadError } = await supabase.storage
        .from('os-fotos')
        .upload(storagePath, file, { upsert: false })

      if (uploadError) return { data: null, error: uploadError.message }

      const { data: urlData } = supabase.storage
        .from('os-fotos')
        .getPublicUrl(storagePath)

      const { data: foto, error: insertError } = await supabase
        .from('fotos_os')
        .insert({
          os_id: osId,
          empresa_id: empresaId,
          url: urlData.publicUrl,
          storage_path: storagePath,
          nome_original: metadata.nomeOriginal,
          tamanho_bytes: metadata.tamanhoBytes,
          tipo_mime: metadata.tipoMime || file.type,
          largura: metadata.largura,
          altura: metadata.altura,
          file_hash: metadata.fileHash,
        })
        .select()
        .single()

      if (insertError) return { data: null, error: insertError.message }

      return { data: foto, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro ao fazer upload' }
    }
  },

  async listarFotos(osId: string): Promise<{ data: FotoOS[]; error: string | null }> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()

    const { data, error } = await supabase
      .from('fotos_os')
      .select('*')
      .eq('os_id', osId)
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: true })

    return { data: data ?? [], error: error?.message ?? null }
  },

  async removerFoto(fotoId: string): Promise<{ data: null; error: string | null }> {
    try {
      const supabase = getSupabase()
      const empresaId = getEmpresaId()

      const { data: foto } = await supabase
        .from('fotos_os')
        .select('id, storage_path')
        .eq('id', fotoId)
        .eq('empresa_id', empresaId)
        .single()

      if (!foto) return { data: null, error: 'Foto não encontrada' }

      await supabase.storage.from('os-fotos').remove([foto.storage_path])

      const { error } = await supabase
        .from('fotos_os')
        .delete()
        .eq('id', fotoId)

      return { data: null, error: error?.message ?? null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro ao remover foto' }
    }
  },
}
