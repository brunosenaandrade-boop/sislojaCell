import type { AvisoPlataforma } from '@/types/database'
import type { ServiceResult } from './base'

export const avisosService = {
  async getAtivos(): Promise<ServiceResult<AvisoPlataforma[]>> {
    try {
      const res = await fetch('/api/avisos')
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: json.data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  async marcarComoLido(avisoId: string): Promise<ServiceResult<null>> {
    try {
      const res = await fetch('/api/avisos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aviso_id: avisoId }),
      })
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: null, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },
}
