import type { EmpresaStats, PlataformaStats } from '@/types/database'
import type { ServiceResult } from './base'

export const superadminService = {
  async getEmpresas(): Promise<ServiceResult<EmpresaStats[]>> {
    try {
      const res = await fetch('/api/superadmin/empresas')
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: json.data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  async toggleEmpresa(empresa_id: string, ativo: boolean): Promise<ServiceResult<null>> {
    try {
      const res = await fetch('/api/superadmin/empresas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa_id, ativo }),
      })
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: null, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  async getPlataformaStats(): Promise<ServiceResult<PlataformaStats>> {
    try {
      const res = await fetch('/api/superadmin/stats')
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: json.data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },
}
