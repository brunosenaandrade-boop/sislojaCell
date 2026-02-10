import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Usuario, Empresa, Plano, StatusAssinatura, UsageInfo } from '@/types/database'

// ============================================
// STORE DE AUTENTICAÇÃO/USUÁRIO
// ============================================

interface AuthState {
  usuario: Usuario | null
  empresa: Empresa | null
  isLoading: boolean
  isImpersonating: boolean
  originalEmpresa: Empresa | null
  setUsuario: (usuario: Usuario | null) => void
  setEmpresa: (empresa: Empresa | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  startImpersonation: (empresa: Empresa) => void
  stopImpersonation: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      empresa: null,
      isLoading: true,
      isImpersonating: false,
      originalEmpresa: null,
      setUsuario: (usuario) => set({ usuario }),
      setEmpresa: (empresa) => set({ empresa }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ usuario: null, empresa: null, isImpersonating: false, originalEmpresa: null }),
      startImpersonation: (empresa) => set((state) => ({
        isImpersonating: true,
        originalEmpresa: state.empresa,
        empresa,
      })),
      stopImpersonation: () => set((state) => ({
        isImpersonating: false,
        empresa: state.originalEmpresa,
        originalEmpresa: null,
      })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        usuario: state.usuario,
        empresa: state.empresa,
        isImpersonating: state.isImpersonating,
        originalEmpresa: state.originalEmpresa,
      }),
    }
  )
)

// ============================================
// STORE DO CAIXA
// ============================================

type FormaPagamentoCaixa = 'dinheiro' | 'pix' | 'debito' | 'credito'

export interface MovimentacaoCaixaLocal {
  id: string
  tipo: 'abertura' | 'venda' | 'os' | 'sangria' | 'suprimento'
  valor: number
  custo?: number
  descricao: string
  forma_pagamento?: FormaPagamentoCaixa
  usuario: string
  data: string
  venda_id?: string
  os_id?: string
}

export interface HistoricoCaixaLocal {
  id: string
  data_abertura: string
  data_fechamento: string
  valor_abertura: number
  valor_fechamento: number
  total_vendas: number
  total_os: number
  total_sangrias: number
  total_suprimentos: number
  total_custo: number
  lucro_liquido: number
  usuario: string
  status: 'fechado'
}

// Estado inicial vazio (sem mock data em producao)

interface CaixaState {
  statusCaixa: 'aberto' | 'fechado'
  valorAbertura: number
  horaAbertura: string
  movimentacoes: MovimentacaoCaixaLocal[]
  historicoCaixas: HistoricoCaixaLocal[]

  abrirCaixa: (valor: number, usuario: string) => void
  fecharCaixa: (valorContado: number) => void
  adicionarMovimentacao: (mov: Omit<MovimentacaoCaixaLocal, 'id' | 'data'>) => void
  registrarVenda: (params: { valor: number; custo: number; formaPagamento: FormaPagamentoCaixa; descricao: string; vendaId: string }) => void
  registrarOS: (params: { valor: number; custo: number; formaPagamento: FormaPagamentoCaixa; descricao: string; osId: string }) => void

  getTotalVendas: () => number
  getTotalOS: () => number
  getTotalSangrias: () => number
  getTotalSuprimentos: () => number
  getTotalCusto: () => number
  getLucroLiquido: () => number
  getSaldoAtual: () => number
  isCaixaAberto: () => boolean
  getTotalPorFormaPagamento: () => Record<string, number>
  getQtdVendas: () => number
  getQtdOS: () => number
}

export const useCaixaStore = create<CaixaState>((set, get) => ({
  statusCaixa: 'fechado',
  valorAbertura: 0,
  horaAbertura: '',
  movimentacoes: [],
  historicoCaixas: [],

  abrirCaixa: (valor, usuario) => {
    set({
      statusCaixa: 'aberto',
      valorAbertura: valor,
      horaAbertura: new Date().toISOString(),
      movimentacoes: [{
        id: String(Date.now()),
        tipo: 'abertura',
        valor,
        descricao: 'Abertura de caixa',
        usuario,
        data: new Date().toISOString(),
      }],
    })
  },

  fecharCaixa: (valorContado) => {
    const state = get()
    const novoHistorico: HistoricoCaixaLocal = {
      id: String(Date.now()),
      data_abertura: state.horaAbertura,
      data_fechamento: new Date().toISOString(),
      valor_abertura: state.valorAbertura,
      valor_fechamento: valorContado,
      total_vendas: state.getTotalVendas(),
      total_os: state.getTotalOS(),
      total_sangrias: state.getTotalSangrias(),
      total_suprimentos: state.getTotalSuprimentos(),
      total_custo: state.getTotalCusto(),
      lucro_liquido: state.getLucroLiquido(),
      usuario: 'Admin',
      status: 'fechado',
    }
    set({
      statusCaixa: 'fechado',
      historicoCaixas: [novoHistorico, ...state.historicoCaixas],
    })
  },

  adicionarMovimentacao: (mov) => {
    const novaMovimentacao: MovimentacaoCaixaLocal = {
      ...mov,
      id: String(Date.now()),
      data: new Date().toISOString(),
    }
    set({ movimentacoes: [...get().movimentacoes, novaMovimentacao] })
  },

  registrarVenda: ({ valor, custo, formaPagamento, descricao, vendaId }) => {
    const novaMovimentacao: MovimentacaoCaixaLocal = {
      id: String(Date.now()),
      tipo: 'venda',
      valor,
      custo,
      descricao,
      forma_pagamento: formaPagamento,
      usuario: 'Admin',
      data: new Date().toISOString(),
      venda_id: vendaId,
    }
    set({ movimentacoes: [...get().movimentacoes, novaMovimentacao] })
  },

  registrarOS: ({ valor, custo, formaPagamento, descricao, osId }) => {
    const novaMovimentacao: MovimentacaoCaixaLocal = {
      id: String(Date.now()),
      tipo: 'os',
      valor,
      custo,
      descricao,
      forma_pagamento: formaPagamento,
      usuario: 'Admin',
      data: new Date().toISOString(),
      os_id: osId,
    }
    set({ movimentacoes: [...get().movimentacoes, novaMovimentacao] })
  },

  getTotalVendas: () => get().movimentacoes.filter(m => m.tipo === 'venda').reduce((acc, m) => acc + m.valor, 0),
  getTotalOS: () => get().movimentacoes.filter(m => m.tipo === 'os').reduce((acc, m) => acc + m.valor, 0),
  getTotalSangrias: () => get().movimentacoes.filter(m => m.tipo === 'sangria').reduce((acc, m) => acc + Math.abs(m.valor), 0),
  getTotalSuprimentos: () => get().movimentacoes.filter(m => m.tipo === 'suprimento').reduce((acc, m) => acc + m.valor, 0),
  getTotalCusto: () => get().movimentacoes.filter(m => m.tipo === 'venda' || m.tipo === 'os').reduce((acc, m) => acc + (m.custo || 0), 0),
  getLucroLiquido: () => {
    const state = get()
    const receita = state.getTotalVendas() + state.getTotalOS()
    return receita - state.getTotalCusto()
  },
  getSaldoAtual: () => {
    const state = get()
    return state.valorAbertura + state.getTotalVendas() + state.getTotalOS() + state.getTotalSuprimentos() - state.getTotalSangrias()
  },
  isCaixaAberto: () => get().statusCaixa === 'aberto',
  getTotalPorFormaPagamento: () => {
    const movs = get().movimentacoes.filter(m => m.forma_pagamento)
    const totais: Record<string, number> = { dinheiro: 0, pix: 0, debito: 0, credito: 0 }
    movs.forEach(m => {
      if (m.forma_pagamento) {
        totais[m.forma_pagamento] = (totais[m.forma_pagamento] || 0) + m.valor
      }
    })
    return totais
  },
  getQtdVendas: () => get().movimentacoes.filter(m => m.tipo === 'venda').length,
  getQtdOS: () => get().movimentacoes.filter(m => m.tipo === 'os').length,
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

// ============================================
// STORE DE CONFIGURAÇÕES DE IMPRESSÃO
// ============================================

interface PrintConfigState {
  logoBase64: string | null
  tipoImpressora: string
  larguraPapel: string
  mostrarLogo: boolean
  mostrarEndereco: boolean
  mostrarTelefone: boolean
  mensagemCupom: string

  setLogoBase64: (logo: string | null) => void
  setTipoImpressora: (tipo: string) => void
  setLarguraPapel: (largura: string) => void
  setMostrarLogo: (mostrar: boolean) => void
  setMostrarEndereco: (mostrar: boolean) => void
  setMostrarTelefone: (mostrar: boolean) => void
  setMensagemCupom: (mensagem: string) => void
}

export const usePrintConfigStore = create<PrintConfigState>()(
  persist(
    (set) => ({
      logoBase64: null,
      tipoImpressora: 'térmica',
      larguraPapel: '80',
      mostrarLogo: true,
      mostrarEndereco: true,
      mostrarTelefone: true,
      mensagemCupom: 'Obrigado pela preferência!',

      setLogoBase64: (logoBase64) => set({ logoBase64 }),
      setTipoImpressora: (tipoImpressora) => set({ tipoImpressora }),
      setLarguraPapel: (larguraPapel) => set({ larguraPapel }),
      setMostrarLogo: (mostrarLogo) => set({ mostrarLogo }),
      setMostrarEndereco: (mostrarEndereco) => set({ mostrarEndereco }),
      setMostrarTelefone: (mostrarTelefone) => set({ mostrarTelefone }),
      setMensagemCupom: (mensagemCupom) => set({ mensagemCupom }),
    }),
    {
      name: 'print-config-storage',
    }
  )
)

// ============================================
// STORE DE ASSINATURA (SaaS)
// ============================================

interface SubscriptionState {
  plano: Plano | null
  status: StatusAssinatura | null
  trialFim: string | null
  trialDiasRestantes: number
  mesesBonus: number
  usage: UsageInfo | null
  isLoaded: boolean

  fetchSubscription: () => Promise<void>
  checkLimit: (recurso: 'usuarios' | 'produtos' | 'os_mes' | 'vendas_mes') => string | null
  isFeatureAvailable: (feature: string) => boolean
  reset: () => void
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  plano: null,
  status: null,
  trialFim: null,
  trialDiasRestantes: 0,
  mesesBonus: 0,
  usage: null,
  isLoaded: false,

  fetchSubscription: async () => {
    try {
      const res = await fetch('/api/asaas/assinatura')
      if (!res.ok) return

      const json = await res.json()

      set({
        plano: json.plano || null,
        status: json.empresa?.status_assinatura || null,
        trialFim: json.empresa?.trial_fim || null,
        trialDiasRestantes: json.empresa?.trial_dias_restantes || 0,
        mesesBonus: json.empresa?.meses_bonus || 0,
        isLoaded: true,
      })

      // Sincronizar status atualizado no auth store (corrige banner de trial desatualizado)
      if (json.empresa?.status_assinatura) {
        const authState = useAuthStore.getState()
        if (authState.empresa && authState.empresa.status_assinatura !== json.empresa.status_assinatura) {
          authState.setEmpresa({
            ...authState.empresa,
            status_assinatura: json.empresa.status_assinatura,
            trial_fim: json.empresa.trial_fim ?? authState.empresa.trial_fim,
          })
        }
      }
    } catch {
      // silently fail - não bloqueia o uso
      set({ isLoaded: true })
    }
  },

  checkLimit: (recurso) => {
    const { usage, plano } = get()
    if (!usage || !plano) return null

    const checks: Record<string, { count: number; limit: number; label: string }> = {
      usuarios: { count: usage.usuarios_count, limit: usage.usuarios_limit, label: 'usuários' },
      produtos: { count: usage.produtos_count, limit: usage.produtos_limit, label: 'produtos' },
      os_mes: { count: usage.os_mes_count, limit: usage.os_mes_limit, label: 'ordens de serviço do mês' },
      vendas_mes: { count: usage.vendas_mes_count, limit: usage.vendas_mes_limit, label: 'vendas do mês' },
    }

    const check = checks[recurso]
    if (!check) return null
    if (check.limit === -1) return null // ilimitado
    if (check.count >= check.limit) {
      return `Limite de ${check.label} atingido (${check.count}/${check.limit}).`
    }
    return null
  },

  isFeatureAvailable: (feature) => {
    const { plano } = get()
    if (!plano?.features) return false
    return !!plano.features[feature]
  },

  reset: () => set({
    plano: null,
    status: null,
    trialFim: null,
    trialDiasRestantes: 0,
    mesesBonus: 0,
    usage: null,
    isLoaded: false,
  }),
}))
