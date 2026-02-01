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

  async getSaasStats(): Promise<ServiceResult<SaasStats>> {
    try {
      const res = await fetch('/api/superadmin/saas-stats')
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: json.data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  async estenderTrial(empresa_id: string, dias: number): Promise<ServiceResult<{ message: string }>> {
    try {
      const res = await fetch('/api/superadmin/assinaturas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa_id, acao: 'estender_trial', valor: dias }),
      })
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: json, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  async adicionarBonus(empresa_id: string, meses: number): Promise<ServiceResult<{ message: string }>> {
    try {
      const res = await fetch('/api/superadmin/assinaturas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa_id, acao: 'adicionar_bonus', valor: meses }),
      })
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: json, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },
}

export interface SaasStats {
  mrr: number
  arr: number
  total_assinantes: number
  status_distribuicao: Record<string, number>
  plano_distribuicao: Record<string, number>
  taxa_conversao: number
  churn_rate: number
  cancelamentos_mes: number
  faturas_vencidas: { id: string; empresa_id: string; valor: number; data_vencimento: string }[]
  faturas_vencidas_count: number
  trials_expirando: number
  indicacoes: {
    total: number
    qualificadas: number
    recompensadas: number
    meses_bonus_total: number
    top_indicadores: { empresa_id: string; count: number }[]
  }
}
