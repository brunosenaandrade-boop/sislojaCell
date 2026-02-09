'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/useStore'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  FileText,
  AlertTriangle,
  Cake,
  ArrowRight,
  Loader2,
  MoreHorizontal,
  XCircle,
  Eye,
  ChevronDown,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { toast } from 'sonner'
import { dashboardService } from '@/services/dashboard.service'
import { vendasService } from '@/services/vendas.service'
import { ordensServicoService } from '@/services/ordens-servico.service'
import type { Cliente, Venda, OrdemServico, StatusOS } from '@/types/database'

const statusColors: Record<string, string> = {
  aberta: 'bg-blue-100 text-blue-800',
  em_analise: 'bg-yellow-100 text-yellow-800',
  aguardando_peca: 'bg-orange-100 text-orange-800',
  aguardando_aprovacao: 'bg-purple-100 text-purple-800',
  em_andamento: 'bg-cyan-100 text-cyan-800',
  finalizada: 'bg-green-100 text-green-800',
  entregue: 'bg-gray-100 text-gray-800',
  cancelada: 'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
  aberta: 'Aberta',
  em_analise: 'Em Análise',
  aguardando_peca: 'Aguardando Peça',
  aguardando_aprovacao: 'Aguardando Aprovação',
  em_andamento: 'Em Andamento',
  finalizada: 'Finalizada',
  entregue: 'Entregue',
  cancelada: 'Cancelada',
}

// Fluxo mais permissivo para ações rápidas no dashboard
const statusFlow: Record<string, string[]> = {
  aberta: ['em_analise', 'em_andamento', 'finalizada', 'cancelada'],
  em_analise: ['aguardando_peca', 'aguardando_aprovacao', 'em_andamento', 'finalizada', 'cancelada'],
  aguardando_peca: ['em_andamento', 'finalizada', 'cancelada'],
  aguardando_aprovacao: ['em_andamento', 'finalizada', 'cancelada'],
  em_andamento: ['finalizada', 'aguardando_peca', 'cancelada'],
  finalizada: ['entregue'],
  entregue: [],
  cancelada: [],
}

interface DashboardResumo {
  vendas_dia: number
  custo_dia: number
  lucro_dia: number
  quantidade_vendas: number
  os_abertas: number
  os_finalizadas: number
  produtos_estoque_baixo: number
}

export default function DashboardPage() {
  const { usuario, empresa } = useAuthStore()
  const router = useRouter()

  // Superadmin sem impersonação não tem empresa real - redirecionar para /admin
  useEffect(() => {
    if (usuario?.perfil === 'superadmin' && (!empresa?.id || empresa.id === 'superadmin')) {
      router.replace('/admin')
    }
  }, [usuario, empresa, router])

  const [resumo, setResumo] = useState<DashboardResumo>({
    vendas_dia: 0,
    custo_dia: 0,
    lucro_dia: 0,
    quantidade_vendas: 0,
    os_abertas: 0,
    os_finalizadas: 0,
    produtos_estoque_baixo: 0,
  })
  const [aniversariantes, setAniversariantes] = useState<Cliente[]>([])
  const [ultimasVendas, setUltimasVendas] = useState<Venda[]>([])
  const [ultimasOS, setUltimasOS] = useState<OrdemServico[]>([])
  const [vendasSemana, setVendasSemana] = useState<Array<{ dia: string; total: number; custo: number; lucro: number }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // State para cancelamento de venda
  const [dialogCancelarVendaOpen, setDialogCancelarVendaOpen] = useState(false)
  const [vendaParaCancelar, setVendaParaCancelar] = useState<Venda | null>(null)
  const [motivoCancelamento, setMotivoCancelamento] = useState('')
  const [isCanceling, setIsCanceling] = useState(false)

  // State para atualização de status da OS
  const [isUpdatingOS, setIsUpdatingOS] = useState<string | null>(null)

  useEffect(() => {
    setIsMounted(true)

    // Não carregar dados se for superadmin sem empresa real
    if (usuario?.perfil === 'superadmin' && (!empresa?.id || empresa.id === 'superadmin')) {
      setIsLoading(false)
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [resumoRes, aniversariantesRes, vendasRes, osRes, vendasSemanaRes] = await Promise.all([
          dashboardService.getResumo(),
          dashboardService.getAniversariantes(),
          dashboardService.getUltimasVendas(),
          dashboardService.getUltimasOS(),
          dashboardService.getVendasSemana(),
        ])

        if (resumoRes.error) toast.error('Erro ao carregar resumo: ' + resumoRes.error)
        if (resumoRes.data) setResumo(resumoRes.data)

        if (aniversariantesRes.error) toast.error('Erro ao carregar aniversariantes: ' + aniversariantesRes.error)
        setAniversariantes(aniversariantesRes.data)

        if (vendasRes.error) toast.error('Erro ao carregar vendas: ' + vendasRes.error)
        setUltimasVendas(vendasRes.data)

        if (osRes.error) toast.error('Erro ao carregar OS: ' + osRes.error)
        setUltimasOS(osRes.data)

        if (vendasSemanaRes.error) toast.error('Erro ao carregar vendas da semana: ' + vendasSemanaRes.error)
        setVendasSemana(vendasSemanaRes.data.map(item => ({
          ...item,
          dia: format(new Date(item.dia + 'T12:00:00'), 'EEE dd/MM', { locale: ptBR }),
        })))
      } catch {
        toast.error('Erro ao carregar dados do dashboard')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const handleCancelarVenda = async () => {
    if (!vendaParaCancelar || !motivoCancelamento.trim()) return

    setIsCanceling(true)
    try {
      const { error } = await vendasService.cancelar(vendaParaCancelar.id, motivoCancelamento.trim())

      if (error) {
        toast.error('Erro ao cancelar venda: ' + error)
        return
      }

      // Atualizar lista local
      setUltimasVendas(prev =>
        prev.map(v =>
          v.id === vendaParaCancelar.id
            ? { ...v, cancelada: true, data_cancelamento: new Date().toISOString(), motivo_cancelamento: motivoCancelamento.trim() }
            : v
        )
      )

      // Atualizar resumo financeiro
      setResumo(prev => ({
        ...prev,
        vendas_dia: prev.vendas_dia - vendaParaCancelar.valor_total,
        custo_dia: prev.custo_dia - vendaParaCancelar.valor_custo_total,
        lucro_dia: prev.lucro_dia - vendaParaCancelar.lucro_liquido,
        quantidade_vendas: prev.quantidade_vendas - 1,
      }))

      toast.success(`Venda #${vendaParaCancelar.numero} cancelada com sucesso`)
      setDialogCancelarVendaOpen(false)
      setVendaParaCancelar(null)
      setMotivoCancelamento('')
    } catch {
      toast.error('Erro ao cancelar venda')
    } finally {
      setIsCanceling(false)
    }
  }

  const handleAtualizarStatusOS = async (os: OrdemServico, novoStatus: StatusOS) => {
    if (novoStatus === 'cancelada') {
      const confirmado = window.confirm(`Tem certeza que deseja cancelar a OS #${os.numero}?`)
      if (!confirmado) return
    }

    setIsUpdatingOS(os.id)
    try {
      const dados: { data_finalizacao?: string; data_entrega?: string } = {}
      if (novoStatus === 'finalizada') {
        dados.data_finalizacao = new Date().toISOString()
      }
      if (novoStatus === 'entregue') {
        dados.data_entrega = new Date().toISOString()
      }

      const { error } = await ordensServicoService.atualizarStatus(os.id, novoStatus, dados)

      if (error) {
        toast.error('Erro ao atualizar status: ' + error)
        return
      }

      // Atualizar lista local
      setUltimasOS(prev =>
        prev.map(o =>
          o.id === os.id ? { ...o, status: novoStatus } : o
        )
      )

      toast.success(`OS #${os.numero} atualizada para ${statusLabels[novoStatus]}`)
    } catch {
      toast.error('Erro ao atualizar status da OS')
    } finally {
      setIsUpdatingOS(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-6 p-4 lg:p-6">
        {/* Saudação */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">
              {new Date().getHours() < 12 ? 'Bom dia' : new Date().getHours() < 18 ? 'Boa tarde' : 'Boa noite'}, {usuario?.nome?.split(' ')[0] || 'Usuário'}!
            </h2>
            <p className="text-muted-foreground">Aqui está o resumo do seu dia</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href="/vendas">
              <Button size="sm"><ShoppingCart className="mr-2 h-4 w-4" />Nova Venda</Button>
            </Link>
            <Link href="/ordens-servico">
              <Button size="sm" variant="outline"><FileText className="mr-2 h-4 w-4" />Nova OS</Button>
            </Link>
            <Link href="/caixa">
              <Button size="sm" variant="outline"><DollarSign className="mr-2 h-4 w-4" />Caixa</Button>
            </Link>
          </div>
        </div>

        {/* Cards principais */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4" data-tutorial="dashboard-kpis">
          {/* Vendas do dia */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Faturamento do Dia
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <AnimatedCounter value={resumo.vendas_dia} formatter={formatCurrency} className="text-2xl font-bold" />
              <p className="text-xs text-muted-foreground">
                {resumo.quantidade_vendas} vendas e OS realizadas
              </p>
            </CardContent>
          </Card>

          {/* Custo */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Custos
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <AnimatedCounter value={resumo.custo_dia} formatter={formatCurrency} className="text-2xl font-bold text-red-600" />
              <p className="text-xs text-muted-foreground">
                Custo total de vendas e OS
              </p>
            </CardContent>
          </Card>

          {/* Lucro Líquido - DESTAQUE */}
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
                Lucro Líquido
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <AnimatedCounter value={resumo.lucro_dia} formatter={formatCurrency} className="text-2xl font-bold text-green-600" />
              <p className="text-xs text-green-600/80">
                Margem: {resumo.vendas_dia > 0 ? ((resumo.lucro_dia / resumo.vendas_dia) * 100).toFixed(1) : '0.0'}%
              </p>
            </CardContent>
          </Card>

          {/* OS Abertas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ordens de Serviço
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <AnimatedCounter value={resumo.os_abertas} className="text-2xl font-bold" />
              <p className="text-xs text-muted-foreground">
                {resumo.os_finalizadas} finalizadas hoje
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alertas */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Estoque Baixo */}
          {resumo.produtos_estoque_baixo > 0 && (
            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-sm font-medium text-orange-700">
                  Alerta de Estoque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-700">
                  <strong>{resumo.produtos_estoque_baixo}</strong> produtos estão com estoque baixo
                </p>
                <Link href="/estoque?filter=baixo">
                  <Button variant="link" className="h-auto p-0 text-orange-700">
                    Ver produtos <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Aniversariantes */}
          {aniversariantes.length > 0 && (
            <Card className="border-pink-200 bg-pink-50 dark:bg-pink-950/20">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Cake className="h-5 w-5 text-pink-600" />
                <CardTitle className="text-sm font-medium text-pink-700">
                  Aniversariantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {aniversariantes.map((cliente) => (
                    <li key={cliente.id} className="text-sm text-pink-700">
                      {cliente.nome} -{' '}
                      {cliente.data_nascimento ? format(new Date(cliente.data_nascimento + 'T00:00:00'), 'dd/MM', {
                        locale: ptBR,
                      }) : ''}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Gráfico de Vendas da Semana */}
        <Card>
          <CardHeader>
            <CardTitle>Faturamento da Semana</CardTitle>
            <CardDescription>Vendas, OS e lucro por dia da semana</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {isMounted && <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vendasSemana}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="dia" className="text-xs" />
                  <YAxis
                    className="text-xs"
                    tickFormatter={(value: number) =>
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        notation: 'compact',
                      }).format(value)
                    }
                  />
                  <Tooltip
                    formatter={(value) =>
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(Number(value))
                    }
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="total" name="Faturamento" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lucro" name="Lucro" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>}
            </div>
          </CardContent>
        </Card>

        {/* Listas */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Últimas Vendas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Últimas Vendas</CardTitle>
                <CardDescription>Vendas realizadas hoje</CardDescription>
              </div>
              <Link href="/vendas">
                <Button variant="outline" size="sm">
                  Ver todas
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ultimasVendas.map((venda) => (
                  <div
                    key={venda.id}
                    className={`flex items-center justify-between border-b pb-2 last:border-0 ${venda.cancelada ? 'opacity-60' : ''}`}
                  >
                    <div
                      className="cursor-pointer hover:underline"
                      onClick={() => router.push('/vendas/historico')}
                    >
                      <p className="font-medium">Venda #{venda.numero}</p>
                      <p className="text-sm text-muted-foreground">{(venda.cliente as { id: string; nome: string } | undefined)?.nome || 'Cliente Avulso'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {venda.cancelada ? (
                        <Badge className="bg-red-100 text-red-800">Cancelada</Badge>
                      ) : (
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(venda.valor_total)}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(venda.created_at), 'HH:mm')}
                          </p>
                        </div>
                      )}
                      {!venda.cancelada && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push('/vendas/historico')}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setVendaParaCancelar(venda)
                                setMotivoCancelamento('')
                                setDialogCancelarVendaOpen(true)
                              }}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancelar venda
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
                {ultimasVendas.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhuma venda recente</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Últimas OS */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ordens de Serviço</CardTitle>
                <CardDescription>OS em andamento</CardDescription>
              </div>
              <Link href="/ordens-servico">
                <Button variant="outline" size="sm">
                  Ver todas
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ultimasOS.map((os) => {
                  const transicoesDisponiveis = statusFlow[os.status] || []
                  return (
                    <div
                      key={os.id}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <div
                        className="cursor-pointer hover:underline"
                        onClick={() => router.push(`/ordens-servico/${os.id}`)}
                      >
                        <p className="font-medium">OS #{os.numero}</p>
                        <p className="text-sm text-muted-foreground">
                          {(os.cliente as { id: string; nome: string } | undefined)?.nome || 'Sem cliente'} - {os.modelo || os.tipo_aparelho || 'N/A'}
                        </p>
                      </div>
                      {transicoesDisponiveis.length > 0 ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors cursor-pointer hover:opacity-80 ${statusColors[os.status]}`}>
                              {isUpdatingOS === os.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  {statusLabels[os.status]}
                                  <ChevronDown className="h-3 w-3" />
                                </>
                              )}
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {transicoesDisponiveis.map((status) => (
                              <DropdownMenuItem
                                key={status}
                                className={status === 'cancelada' ? 'text-red-600' : ''}
                                onClick={() => handleAtualizarStatusOS(os, status as StatusOS)}
                              >
                                <Badge className={`${statusColors[status]} mr-2`}>
                                  {statusLabels[status]}
                                </Badge>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <Badge className={statusColors[os.status]}>
                          {statusLabels[os.status]}
                        </Badge>
                      )}
                    </div>
                  )
                })}
                {ultimasOS.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhuma OS recente</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de cancelamento de venda */}
      <Dialog open={dialogCancelarVendaOpen} onOpenChange={setDialogCancelarVendaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Venda #{vendaParaCancelar?.numero}</DialogTitle>
            <DialogDescription>
              Esta ação irá cancelar a venda e reverter o estoque dos produtos. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-400">
              <strong>Atenção:</strong> O estoque dos produtos será restaurado e o valor será removido do total de vendas do dia.
            </div>
            <div className="space-y-2">
              <label htmlFor="motivo" className="text-sm font-medium">
                Motivo do cancelamento <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="motivo"
                placeholder="Informe o motivo do cancelamento..."
                value={motivoCancelamento}
                onChange={(e) => setMotivoCancelamento(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogCancelarVendaOpen(false)}
              disabled={isCanceling}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelarVenda}
              disabled={isCanceling || !motivoCancelamento.trim()}
            >
              {isCanceling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                'Confirmar cancelamento'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
