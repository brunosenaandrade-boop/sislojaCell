// ============================================
// SERVIÇO DE INTEGRAÇÃO COM ASAAS
// Pagamentos, Assinaturas e Checkout
// ============================================

const ASAAS_API_URL = process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api'
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || ''

interface AsaasResponse<T = Record<string, unknown>> {
  data: T | null
  error: string | null
}

async function asaasRequest<T = Record<string, unknown>>(
  endpoint: string,
  options: RequestInit = {}
): Promise<AsaasResponse<T>> {
  try {
    const res = await fetch(`${ASAAS_API_URL}/v3${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        access_token: ASAAS_API_KEY,
        ...options.headers,
      },
    })

    const body = await res.json()

    if (!res.ok) {
      const errorMsg =
        body?.errors?.[0]?.description ||
        body?.message ||
        `Erro Asaas: ${res.status}`
      return { data: null, error: errorMsg }
    }

    return { data: body as T, error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Erro de conexão com Asaas',
    }
  }
}

// ============================================
// TIPOS
// ============================================

export interface AsaasCustomer {
  id: string
  name: string
  cpfCnpj: string
  email?: string
  phone?: string
  mobilePhone?: string
  externalReference?: string
}

export interface AsaasCheckout {
  id: string
  url?: string
  status: string
}

export interface AsaasSubscription {
  id: string
  customer: string
  billingType: string
  value: number
  cycle: string
  status: string
  nextDueDate: string
}

export interface AsaasPayment {
  id: string
  status: string
  value: number
  netValue: number
  dueDate: string
  paymentDate?: string
  billingType: string
  invoiceUrl?: string
  bankSlipUrl?: string
}

// ============================================
// MÉTODOS
// ============================================

export const asaasService = {
  // 2.3 - Criar cliente no Asaas
  async criarCliente(dados: {
    name: string
    cpfCnpj: string
    email?: string
    phone?: string
    externalReference?: string
  }): Promise<AsaasResponse<AsaasCustomer>> {
    return asaasRequest<AsaasCustomer>('/customers', {
      method: 'POST',
      body: JSON.stringify({
        name: dados.name,
        cpfCnpj: dados.cpfCnpj.replace(/\D/g, ''),
        email: dados.email || undefined,
        phone: dados.phone?.replace(/\D/g, '') || undefined,
        externalReference: dados.externalReference || undefined,
      }),
    })
  },

  // 2.4 - Criar checkout (link de pagamento)
  async criarCheckout(dados: {
    customerId: string
    name: string
    description?: string
    billingTypes: ('BOLETO' | 'PIX' | 'CREDIT_CARD')[]
    chargeType: 'RECURRENT' | 'DETACHED'
    value: number
    cycle?: 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY'
    nextDueDate?: string
    successUrl: string
    cancelUrl?: string
  }): Promise<AsaasResponse<AsaasCheckout>> {
    const body: Record<string, unknown> = {
      customer: dados.customerId,
      name: dados.name,
      description: dados.description,
      billingTypes: dados.billingTypes,
      chargeTypes: [dados.chargeType],
      successUrl: dados.successUrl,
      cancelUrl: dados.cancelUrl,
    }

    if (dados.chargeType === 'RECURRENT') {
      body.subscriptionCycle = dados.cycle || 'MONTHLY'
      body.subscriptionNextDueDate = dados.nextDueDate
      body.value = dados.value
    } else {
      body.value = dados.value
    }

    const result = await asaasRequest<{ id: string; status: string }>('/checkouts', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    if (result.data) {
      return {
        data: {
          id: result.data.id,
          url: `https://asaas.com/checkoutSession/show?id=${result.data.id}`,
          status: result.data.status,
        },
        error: null,
      }
    }

    return { data: null, error: result.error }
  },

  // 2.5 - Criar assinatura direta
  async criarAssinatura(dados: {
    customerId: string
    billingType: 'BOLETO' | 'PIX' | 'CREDIT_CARD'
    value: number
    cycle: 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY'
    nextDueDate: string
    description: string
    externalReference?: string
  }): Promise<AsaasResponse<AsaasSubscription>> {
    return asaasRequest<AsaasSubscription>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({
        customer: dados.customerId,
        billingType: dados.billingType,
        value: dados.value,
        cycle: dados.cycle,
        nextDueDate: dados.nextDueDate,
        description: dados.description,
        externalReference: dados.externalReference,
      }),
    })
  },

  // 2.6 - Cancelar assinatura
  async cancelarAssinatura(
    subscriptionId: string
  ): Promise<AsaasResponse<{ deleted: boolean }>> {
    return asaasRequest<{ deleted: boolean }>(`/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
    })
  },

  // 2.7 - Buscar assinatura
  async buscarAssinatura(
    subscriptionId: string
  ): Promise<AsaasResponse<AsaasSubscription>> {
    return asaasRequest<AsaasSubscription>(`/subscriptions/${subscriptionId}`)
  },

  // 2.8 - Listar faturas de uma assinatura
  async listarFaturas(
    subscriptionId: string
  ): Promise<AsaasResponse<{ data: AsaasPayment[]; totalCount: number }>> {
    return asaasRequest<{ data: AsaasPayment[]; totalCount: number }>(
      `/subscriptions/${subscriptionId}/payments`
    )
  },

  // Buscar cliente por referência externa (empresa_id)
  async buscarClientePorRef(
    externalReference: string
  ): Promise<AsaasResponse<{ data: AsaasCustomer[] }>> {
    return asaasRequest<{ data: AsaasCustomer[] }>(
      `/customers?externalReference=${externalReference}`
    )
  },
}
