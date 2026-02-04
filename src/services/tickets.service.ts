import type { TicketSuporte, TicketMensagem } from '@/types/database'
import type { ServiceResult } from './base'

export const ticketsService = {
  async getTickets(): Promise<ServiceResult<TicketSuporte[]>> {
    try {
      const res = await fetch('/api/tickets')
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: json.data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  async criarTicket(assunto: string, mensagem: string): Promise<ServiceResult<TicketSuporte>> {
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assunto, mensagem }),
      })
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: json.data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  async getMensagens(ticketId: string): Promise<ServiceResult<TicketMensagem[]>> {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/mensagens`)
      const json = await res.json()
      if (!res.ok) return { data: null, error: json.error }
      return { data: json.data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  },

  async responder(ticketId: string, mensagem: string): Promise<ServiceResult<null>> {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/mensagens`, {
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
}
