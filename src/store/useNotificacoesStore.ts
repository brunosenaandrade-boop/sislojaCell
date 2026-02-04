import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TipoNotificacao = 'estoque' | 'aniversario' | 'os_atrasada' | 'caixa'

export interface Notificacao {
  id: string
  tipo: TipoNotificacao
  titulo: string
  mensagem: string
  lida: boolean
  data: string
  link?: string
}

interface NotificacoesState {
  notificacoes: Notificacao[]
  ultimaGeracao: string | null
  addNotificacao: (n: Omit<Notificacao, 'id' | 'data' | 'lida'>) => void
  marcarComoLida: (id: string) => void
  marcarTodasComoLidas: () => void
  limparNotificacoes: () => void
  getNaoLidas: () => number
  temNotificacao: (tipo: TipoNotificacao, titulo: string) => boolean
  setUltimaGeracao: (data: string) => void
  jaGerouHoje: () => boolean
}

export const useNotificacoesStore = create<NotificacoesState>()(
  persist(
    (set, get) => ({
      notificacoes: [],
      ultimaGeracao: null,

      addNotificacao: (n) => {
        const nova: Notificacao = {
          ...n,
          id: String(Date.now()) + Math.random().toString(36).slice(2, 6),
          data: new Date().toISOString(),
          lida: false,
        }
        set({ notificacoes: [nova, ...get().notificacoes] })
      },

      marcarComoLida: (id) => {
        set({
          notificacoes: get().notificacoes.map((n) =>
            n.id === id ? { ...n, lida: true } : n
          ),
        })
      },

      marcarTodasComoLidas: () => {
        set({
          notificacoes: get().notificacoes.map((n) => ({ ...n, lida: true })),
        })
      },

      limparNotificacoes: () => set({
        notificacoes: [],
        ultimaGeracao: new Date().toISOString().slice(0, 10),
      }),

      getNaoLidas: () => get().notificacoes.filter((n) => !n.lida).length,

      temNotificacao: (tipo, titulo) =>
        get().notificacoes.some((n) => n.tipo === tipo && n.titulo === titulo),

      setUltimaGeracao: (data) => set({ ultimaGeracao: data }),

      jaGerouHoje: () => {
        const hoje = new Date().toISOString().slice(0, 10)
        return get().ultimaGeracao === hoje
      },
    }),
    {
      name: 'notificacoes-storage',
    }
  )
)
