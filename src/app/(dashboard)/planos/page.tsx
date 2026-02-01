'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/useStore'
import { usePermissao } from '@/hooks/usePermissao'
import {
  CheckCircle2,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Clock,
  CreditCard,
  Gift,
  ExternalLink,
  XCircle,
  Copy,
  Check,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface PlanoInfo {
  nome: string
  slug: string
  preco_mensal: number
  preco_anual: number
  max_usuarios: number
  max_produtos: number
  max_os_mes: number
  max_vendas_mes: number
  features: Record<string, boolean | string>
}

interface FaturaInfo {
  id: string
  valor: number
  status: string
  data_vencimento: string
  data_pagamento?: string
  asaas_payment_id?: string
  link_boleto?: string
  link_pix?: string
}

interface AssinaturaResponse {
  empresa: {
    id: string
    nome: string
    plano: string
    status_assinatura: string
    trial_fim?: string
    trial_dias_restantes: number
    meses_bonus: number
  }
  assinatura: {
    id: string
    status: string
    ciclo: string
    valor: number
  } | null
  plano: PlanoInfo | null
  faturas: FaturaInfo[]
}

const statusLabels: Record<string, { label: string; color: string }> = {
  trial: { label: 'Trial Grátis', color: 'bg-blue-100 text-blue-700' },
  active: { label: 'Ativa', color: 'bg-green-100 text-green-700' },
  overdue: { label: 'Pagamento Pendente', color: 'bg-yellow-100 text-yellow-700' },
  suspended: { label: 'Suspensa', color: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Cancelada', color: 'bg-gray-100 text-gray-700' },
  expired: { label: 'Expirada', color: 'bg-gray-100 text-gray-700' },
}

const faturaStatusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700' },
  received: { label: 'Paga', color: 'bg-green-100 text-green-700' },
  confirmed: { label: 'Confirmada', color: 'bg-green-100 text-green-700' },
  overdue: { label: 'Vencida', color: 'bg-red-100 text-red-700' },
  refunded: { label: 'Reembolsada', color: 'bg-gray-100 text-gray-700' },
  deleted: { label: 'Removida', color: 'bg-gray-100 text-gray-700' },
}

export default function PlanosPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <PlanosContent />
    </Suspense>
  )
}

function PlanosContent() {
  const searchParams = useSearchParams()
  const { empresa } = useAuthStore()
  const { isAdmin } = usePermissao()

  const [data, setData] = useState<AssinaturaResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)
  const [isCancelLoading, setIsCancelLoading] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/asaas/assinatura')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      } else {
        toast.error('Erro ao carregar dados do plano')
      }
    } catch {
      toast.error('Erro de conexão')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Tratar retorno do checkout
  useEffect(() => {
    const status = searchParams.get('status')
    const motivo = searchParams.get('motivo')

    if (status === 'success') {
      toast.success('Pagamento realizado com sucesso! Seu plano será ativado em instantes.')
      window.history.replaceState({}, '', '/planos')
    } else if (status === 'cancelled') {
      toast.info('Checkout cancelado.')
      window.history.replaceState({}, '', '/planos')
    }

    if (motivo === 'trial_expirado') {
      toast.warning('Seu período de teste expirou. Assine para continuar usando o sistema.')
    } else if (motivo) {
      toast.warning('Sua assinatura precisa de atenção. Assine ou regularize o pagamento.')
    }
  }, [searchParams])

  const handleCheckout = async () => {
    try {
      setIsCheckoutLoading(true)
      const res = await fetch('/api/asaas/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planoSlug: 'anual', ciclo: 'YEARLY' }),
      })

      const json = await res.json()

      if (res.ok && json.checkoutUrl) {
        window.location.href = json.checkoutUrl
      } else if (res.ok && !json.checkoutUrl) {
        toast.success('Assinatura criada! Atualize a página para ver a fatura.')
        fetchData()
      } else {
        toast.error(json.error || 'Erro ao gerar link de pagamento')
      }
    } catch {
      toast.error('Erro de conexão')
    } finally {
      setIsCheckoutLoading(false)
    }
  }

  const handleCancel = async () => {
    try {
      setIsCancelLoading(true)
      const res = await fetch('/api/asaas/assinatura', { method: 'DELETE' })
      const json = await res.json()

      if (res.ok) {
        toast.success('Assinatura cancelada. Acesso disponível até o fim do período pago.')
        setCancelDialogOpen(false)
        fetchData()
      } else {
        toast.error(json.error || 'Erro ao cancelar')
      }
    } catch {
      toast.error('Erro de conexão')
    } finally {
      setIsCancelLoading(false)
    }
  }

  const handleCopyReferral = () => {
    const code = empresa?.codigo_indicacao
    if (code && typeof window !== 'undefined') {
      const url = `${window.location.origin}/cadastro?ref=${code}`
      navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link de indicação copiado!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const statusInfo = statusLabels[data?.empresa?.status_assinatura || 'trial'] || statusLabels.trial
  const isActive = data?.empresa?.status_assinatura === 'active'
  const isTrial = data?.empresa?.status_assinatura === 'trial'
  const canSubscribe = isTrial || ['expired', 'cancelled', 'suspended', 'overdue'].includes(data?.empresa?.status_assinatura || '')

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Meu Plano</h1>
        <p className="text-muted-foreground">Gerencie sua assinatura e faturas</p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Status da Assinatura</CardTitle>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Plano Atual</p>
              <p className="text-lg font-semibold">{data?.plano?.nome || 'Trial Grátis'}</p>
            </div>

            {isTrial && data?.empresa?.trial_dias_restantes !== undefined && (
              <div>
                <p className="text-sm text-muted-foreground">Dias Restantes</p>
                <p className={`text-lg font-semibold ${data.empresa.trial_dias_restantes <= 2 ? 'text-red-600' : 'text-blue-600'}`}>
                  {data.empresa.trial_dias_restantes} dias
                </p>
              </div>
            )}

            {isActive && data?.assinatura && (
              <div>
                <p className="text-sm text-muted-foreground">Valor</p>
                <p className="text-lg font-semibold">
                  R$ {Number(data.assinatura.valor).toFixed(2).replace('.', ',')}/mês
                </p>
              </div>
            )}

            {(data?.empresa?.meses_bonus || 0) > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">Meses Bônus</p>
                <div className="flex items-center gap-1">
                  <Gift className="h-4 w-4 text-green-600" />
                  <p className="text-lg font-semibold text-green-600">
                    {data?.empresa?.meses_bonus} mês(es)
                  </p>
                </div>
              </div>
            )}

            {isTrial && (
              <div>
                <p className="text-sm text-muted-foreground">Limites do Trial</p>
                <p className="text-sm text-muted-foreground">
                  1 usuário · 50 produtos · 30 OS · 30 vendas/mês
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trial Expiration Warning */}
      {isTrial && (data?.empresa?.trial_dias_restantes || 0) <= 3 && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardContent className="flex items-center gap-4 pt-6">
            <AlertTriangle className="h-8 w-8 shrink-0 text-yellow-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">
                {data?.empresa?.trial_dias_restantes === 0
                  ? 'Seu período de teste expirou!'
                  : `Seu trial expira em ${data?.empresa?.trial_dias_restantes} dia(s)`}
              </h3>
              <p className="text-sm text-yellow-800">
                Assine o plano anual para continuar usando o sistema sem limites.
              </p>
            </div>
            <Button onClick={handleCheckout} disabled={isCheckoutLoading}>
              {isCheckoutLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Assinar Agora <ArrowRight className="ml-1 h-4 w-4" /></>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Subscribe Card */}
      {canSubscribe && (
        <Card className="border-blue-200">
          <CardContent className="pt-6">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="mb-1 text-xl font-bold">Plano Anual</h3>
                <p className="text-muted-foreground">
                  Acesso completo. Tudo ilimitado. R$ 1.800/ano ou 12x de R$ 150 no cartão.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    'Usuários ilimitados',
                    'Produtos ilimitados',
                    'OS ilimitadas',
                    'Vendas ilimitadas',
                    'Suporte prioritário',
                    'Backup dos dados',
                  ].map((f) => (
                    <span key={f} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <div className="mb-2">
                  <span className="text-3xl font-bold">R$ 1.800</span>
                  <span className="text-muted-foreground">/ano</span>
                  <p className="text-xs text-muted-foreground mt-1">ou 12x de R$ 150 no cartão</p>
                </div>
                <Button
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isCheckoutLoading}
                  className="w-full"
                >
                  {isCheckoutLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="mr-2 h-4 w-4" />
                  )}
                  Assinar Agora
                </Button>
                <p className="mt-1 text-xs text-muted-foreground">
                  PIX, cartão ou boleto
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referral Card */}
      {(isActive || isTrial) && empresa?.codigo_indicacao && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Gift className="h-5 w-5 text-blue-600" />
              Programa de Indicação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Indique outras lojas e ganhe meses grátis! Para cada loja indicada que
              assinar e permanecer ativa por 30 dias, você ganha 1 mês adicional.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg border bg-muted px-3 py-2 text-sm">
                {typeof window !== 'undefined' ? window.location.origin : ''}/cadastro?ref={empresa.codigo_indicacao}
              </code>
              <Button variant="outline" size="sm" onClick={handleCopyReferral}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoices */}
      {data?.faturas && data.faturas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Últimas Faturas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium text-muted-foreground">Vencimento</th>
                    <th className="pb-2 font-medium text-muted-foreground">Valor</th>
                    <th className="pb-2 font-medium text-muted-foreground">Status</th>
                    <th className="pb-2 font-medium text-muted-foreground">Pagamento</th>
                    <th className="pb-2 font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {data.faturas.map((fatura) => {
                    const fStatus = faturaStatusLabels[fatura.status] || { label: fatura.status, color: 'bg-gray-100 text-gray-700' }
                    return (
                      <tr key={fatura.id} className="border-b last:border-0">
                        <td className="py-3">
                          {new Date(fatura.data_vencimento).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3">
                          R$ {Number(fatura.valor).toFixed(2).replace('.', ',')}
                        </td>
                        <td className="py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${fStatus.color}`}>
                            {fStatus.label}
                          </span>
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {fatura.data_pagamento
                            ? new Date(fatura.data_pagamento).toLocaleDateString('pt-BR')
                            : '—'}
                        </td>
                        <td className="py-3">
                          {(fatura.link_boleto || fatura.link_pix) && fatura.status === 'pending' && (
                            <a
                              href={fatura.link_pix || fatura.link_boleto || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Pagar
                            </a>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Subscription */}
      {isActive && isAdmin && (
        <Card className="border-red-200">
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <h3 className="font-semibold text-red-700">Cancelar Assinatura</h3>
              <p className="text-sm text-muted-foreground">
                Seu acesso continua até o fim do período pago.
              </p>
            </div>
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancelar Assinatura</DialogTitle>
                  <DialogDescription>
                    Tem certeza que deseja cancelar sua assinatura? Seu acesso ao sistema
                    permanecerá ativo até o fim do período já pago. Após isso, o sistema
                    ficará em modo limitado.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                    Voltar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleCancel}
                    disabled={isCancelLoading}
                  >
                    {isCancelLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Confirmar Cancelamento
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
