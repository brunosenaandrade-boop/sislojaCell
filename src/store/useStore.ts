import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Usuario, Empresa, Caixa } from '@/types/database'

// ============================================
// STORE DE AUTENTICAÇÃO/USUÁRIO
// ============================================

interface AuthState {
  usuario: Usuario | null
  empresa: Empresa | null
  isLoading: boolean
  setUsuario: (usuario: Usuario | null) => void
  setEmpresa: (empresa: Empresa | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      empresa: null,
      isLoading: true,
      setUsuario: (usuario) => set({ usuario }),
      setEmpresa: (empresa) => set({ empresa }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ usuario: null, empresa: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        usuario: state.usuario,
        empresa: state.empresa,
      }),
    }
  )
)

// ============================================
// STORE DO CAIXA
// ============================================

interface CaixaState {
  caixaAtual: Caixa | null
  setCaixaAtual: (caixa: Caixa | null) => void
}

export const useCaixaStore = create<CaixaState>((set) => ({
  caixaAtual: null,
  setCaixaAtual: (caixaAtual) => set({ caixaAtual }),
}))

// ============================================
// STORE DE UI
// ============================================

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark') => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'light',
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-storage',
    }
  )
)

// ============================================
// STORE DO CARRINHO (PDV)
// ============================================

interface ItemCarrinho {
  produto_id: string
  nome: string
  quantidade: number
  valor_unitario: number
  valor_custo: number
  valor_total: number
}

interface CarrinhoState {
  itens: ItemCarrinho[]
  cliente_id: string | null
  addItem: (item: Omit<ItemCarrinho, 'valor_total'>) => void
  removeItem: (produto_id: string) => void
  updateQuantidade: (produto_id: string, quantidade: number) => void
  setCliente: (cliente_id: string | null) => void
  clearCarrinho: () => void
  getTotal: () => number
  getCustoTotal: () => number
  getLucroTotal: () => number
}

export const useCarrinhoStore = create<CarrinhoState>((set, get) => ({
  itens: [],
  cliente_id: null,

  addItem: (item) => {
    const itens = get().itens
    const existingIndex = itens.findIndex((i) => i.produto_id === item.produto_id)

    if (existingIndex >= 0) {
      // Produto já existe, atualiza quantidade
      const newItens = [...itens]
      newItens[existingIndex].quantidade += item.quantidade
      newItens[existingIndex].valor_total =
        newItens[existingIndex].quantidade * newItens[existingIndex].valor_unitario
      set({ itens: newItens })
    } else {
      // Novo produto
      set({
        itens: [
          ...itens,
          {
            ...item,
            valor_total: item.quantidade * item.valor_unitario,
          },
        ],
      })
    }
  },

  removeItem: (produto_id) => {
    set({ itens: get().itens.filter((i) => i.produto_id !== produto_id) })
  },

  updateQuantidade: (produto_id, quantidade) => {
    if (quantidade <= 0) {
      get().removeItem(produto_id)
      return
    }

    const itens = get().itens.map((item) =>
      item.produto_id === produto_id
        ? { ...item, quantidade, valor_total: quantidade * item.valor_unitario }
        : item
    )
    set({ itens })
  },

  setCliente: (cliente_id) => set({ cliente_id }),

  clearCarrinho: () => set({ itens: [], cliente_id: null }),

  getTotal: () => get().itens.reduce((acc, item) => acc + item.valor_total, 0),

  getCustoTotal: () =>
    get().itens.reduce((acc, item) => acc + item.valor_custo * item.quantidade, 0),

  getLucroTotal: () => get().getTotal() - get().getCustoTotal(),
}))
