import type { EmpresaStats, PlataformaStats, Cupom, AvisoPlataforma, TicketSuporte, TicketMensagem, ReceitaMensal, ReceitaPorPlano, FunilOnboarding, MetricasUso, ManutencaoConfig, Plano, SaasStats, AlertsData, UsuarioGlobal, LogEntry } from '@/types/database'
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

  async alterarPlanoEmpresa(empresa_id: string, plano: string, status_assinatura: string): Promise<ServiceResult<null>> {
    try {
      const res = await fetch('/api/superadmin/empresas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa_id, plano, status_assinatura }),
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

  // ====== RECEITA ======
  async getReceita(): Promise<ServiceResult<{ meses: ReceitaMensal[]; por_plano: ReceitaPorPlano[] }>> {
    try {
      const res = await fetch('/api/superadmin/receita')
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: json.data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  // ====== PLANOS ======
  async getPlanos(): Promise<ServiceResult<Plano[]>> {
    try {
      const res = await fetch('/api/superadmin/planos')
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: json.data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  async criarPlano(data: Partial<Plano>): Promise<ServiceResult<Plano>> {
    try {
      const res = await fetch('/api/superadmin/planos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: json.data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  async atualizarPlano(id: string, data: Partial<Plano>): Promise<ServiceResult<null>> {
    try {
      const res = await fetch('/api/superadmin/planos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      })
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: null, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  async desativarPlano(id: string): Promise<ServiceResult<null>> {
    try {
      const res = await fetch('/api/superadmin/planos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: null, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  // ====== CUPONS ======
  async getCupons(): Promise<ServiceResult<Cupom[]>> {
    try {
      const res = await fetch('/api/superadmin/cupons')
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: json.data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  async criarCupom(data: Partial<Cupom>): Promise<ServiceResult<Cupom>> {
    try {
      const res = await fetch('/api/superadmin/cupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: json.data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  async atualizarCupom(id: string, data: Partial<Cupom>): Promise<ServiceResult<null>> {
    try {
      const res = await fetch('/api/superadmin/cupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      })
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: null, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  // ====== AVISOS ======
  async getAvisos(): Promise<ServiceResult<(AvisoPlataforma & { lidos_count?: number })[]>> {
    try {
      const res = await fetch('/api/superadmin/avisos')
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: json.data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  async criarAviso(data: Partial<AvisoPlataforma>): Promise<ServiceResult<AvisoPlataforma>> {
    try {
      const res = await fetch('/api/superadmin/avisos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: json.data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  async atualizarAviso(id: string, data: Partial<AvisoPlataforma>): Promise<ServiceResult<null>> {
    try {
      const res = await fetch('/api/superadmin/avisos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      })
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: null, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  async excluirAviso(id: string): Promise<ServiceResult<null>> {
    try {
      const res = await fetch('/api/superadmin/avisos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: null, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  // ====== TICKETS ======
  async getTickets(params?: { status?: string; prioridade?: string; search?: string }): Promise<ServiceResult<TicketSuporte[]>> {
    try {
      const query = new URLSearchParams()
      if (params?.status) query.set('status', params.status)
      if (params?.prioridade) query.set('prioridade', params.prioridade)
      if (params?.search) query.set('search', params.search)
      const res = await fetch(`/api/superadmin/tickets?${query}`)
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: json.data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  async atualizarTicket(id: string, data: { status?: string; prioridade?: string }): Promise<ServiceResult<null>> {
    try {
      const res = await fetch('/api/superadmin/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      })
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: null, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  async getTicketMensagens(ticketId: string): Promise<ServiceResult<TicketMensagem[]>> {
    try {
      const res = await fetch(`/api/superadmin/tickets/${ticketId}/mensagens`)
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: json.data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  async responderTicket(ticketId: string, mensagem: string): Promise<ServiceResult<null>> {
    try {
      const res = await fetch(`/api/superadmin/tickets/${ticketId}/mensagens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagem }),
      })
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: null, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  // ====== IMPERSONACAO ======
  async logImpersonacao(empresa_id: string, empresa_nome: string, acao: 'inicio' | 'fim'): Promise<ServiceResult<null>> {
    try {
      const res = await fetch('/api/superadmin/impersonacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa_id, empresa_nome, acao }),
      })
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: null, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  // ====== FUNIL ======
  async getFunil(): Promise<ServiceResult<FunilOnboarding>> {
    try {
      const res = await fetch('/api/superadmin/funil')
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: json.data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  // ====== METRICAS ======
  async getMetricas(): Promise<ServiceResult<MetricasUso>> {
    try {
      const res = await fetch('/api/superadmin/metricas')
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: json.data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  // ====== MANUTENCAO ======
  async getManutencao(): Promise<ServiceResult<ManutencaoConfig>> {
    try {
      const res = await fetch('/api/superadmin/manutencao')
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: json.data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  async setManutencao(ativo: boolean, mensagem: string): Promise<ServiceResult<null>> {
    try {
      const res = await fetch('/api/superadmin/manutencao', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo, mensagem }),
      })
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: null, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  // ====== ALERTS ======
  async getAlerts(): Promise<ServiceResult<AlertsData>> {
    try {
      const res = await fetch('/api/superadmin/alerts')
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: json.data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  // ====== USUARIOS ======
  async getUsuarios(params?: { perfil?: string; ativo?: string; empresa_id?: string; search?: string }): Promise<ServiceResult<UsuarioGlobal[]>> {
    try {
      const query = new URLSearchParams()
      if (params?.perfil) query.set('perfil', params.perfil)
      if (params?.ativo) query.set('ativo', params.ativo)
      if (params?.empresa_id) query.set('empresa_id', params.empresa_id)
      if (params?.search) query.set('search', params.search)
      const res = await fetch(`/api/superadmin/usuarios?${query}`)
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: json.data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  async redefinirSenha(authId: string, novaSenha: string): Promise<ServiceResult<boolean>> {
    try {
      const res = await fetch('/api/superadmin/usuarios', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auth_id: authId, nova_senha: novaSenha }),
      })
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: true, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  // ====== LOGS ======
  async getLogs(params?: { tipo?: string; categoria?: string; search?: string; limit?: number }): Promise<ServiceResult<LogEntry[]>> {
    try {
      const query = new URLSearchParams()
      if (params?.limit) query.set('limit', String(params.limit))
      if (params?.tipo) query.set('tipo', params.tipo)
      if (params?.categoria) query.set('categoria', params.categoria)
      if (params?.search) query.set('search', params.search)
      const res = await fetch(`/api/superadmin/logs?${query}`)
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: json.data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },
}
