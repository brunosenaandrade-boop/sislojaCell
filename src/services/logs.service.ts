import { getSupabase, getEmpresaId } from './base'
import type { LogSistema } from '@/types/database'

export const logsService = {
  async listar(filtros?: {
    tipo?: string
    categoria?: string
    busca?: string
    limite?: number
  }): Promise<{ data: LogSistema[]; error: string | null }> {
    const supabase = getSupabase()
    const empresaId = getEmpresaId()

    let query = supabase
      .from('logs_sistema')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false })

    if (filtros?.tipo) {
      query = query.eq('tipo', filtros.tipo)
    }

    if (filtros?.categoria) {
      query = query.eq('categoria', filtros.categoria)
    }

    if (filtros?.busca) {
      query = query.ilike('mensagem', `%${filtros.busca}%`)
    }

    if (filtros?.limite) {
      query = query.limit(filtros.limite)
    } else {
      query = query.limit(100)
    }

    const { data, error } = await query
    return { data: data ?? [], error: error?.message ?? null }
  },
}
