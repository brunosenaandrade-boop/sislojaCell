'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft,
  Search,
  MoreHorizontal,
  Eye,
  Printer,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Calendar,
  Banknote,
  CreditCard,
  QrCode,
  Loader2,
  XCircle,
  AlertTriangle,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import type { Venda } from '@/types/database'
import { vendasService } from '@/services/vendas.service'

const formasPagamentoIcon: Record<string, React.ReactNode> = {
  dinheiro: <Banknote className="h-4 w-4" />,
  pix: <QrCode className="h-4 w-4" />,
  debito: <CreditCard className="h-4 w-4" />,
  credito: <CreditCard className="h-4 w-4" />,
}

const formasPagamentoLabel: Record<string, string> = {
  dinheiro: 'Dinheiro',
  pix: 'PIX',
  debito: 'Débito',
  credito: 'Crédito',
}

export default function HistoricoVendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [busca, setBusca] = useState('')
  const [filtroData, setFiltroData] = useState('hoje')
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dialogCancelarOpen, setDialogCancelarOpen] = useState(false)
  const [vendaParaCancelar, setVendaParaCancelar] = useState<Venda | null>(null)
  const [motivoCancelamento, setMotivoCancelamento] = useState('')
  const [isCanceling, setIsCanceling] = useState(false)

  // Carregar vendas
  useEffect(() => {
    const carregar = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await vendasService.listar()
        if (error) {
          toast.error('Erro ao carregar vendas: ' + error)
          return
        }
        setVendas(data)
      } catch {
        toast.error('Erro ao carregar vendas')
      } finally {
        setIsLoading(false)
      }
    }
    carregar()
  }, [])

  // Calcular estatisticas (excluindo vendas canceladas)
  const vendasAtivas = vendas.filter(v => !v.cancelada)
  const stats = {
    totalVendas: vendasAtivas.reduce((acc, v) => acc + v.valor_total, 0),
    totalLucro: vendasAtivas.reduce((acc, v) => acc + v.lucro_liquido, 0),
    quantidadeVendas: vendasAtivas.length,
    ticketMedio: vendasAtivas.length > 0 ? vendasAtivas.reduce((acc, v) => acc + v.valor_total, 0) / vendasAtivas.length : 0,
  }

  // Funcao para cancelar venda
  const handleCancelarVenda = async () => {
    if (!vendaParaCancelar || !motivoCancelamento.trim()) {
      toast.error('Informe o motivo do cancelamento')
      return
    }

    setIsCanceling(true)
    try {
      const { error } = await vendasService.cancelar(vendaParaCancelar.id, motivoCancelamento)
      if (error) {
        toast.error('Erro ao cancelar venda: ' + error)
        return
      }

      toast.success(`Venda #${vendaParaCancelar.numero} cancelada com sucesso. Estoque estornado.`)

      // Atualizar lista de vendas
      setVendas(vendas.map(v =>
        v.id === vendaParaCancelar.id
          ? { ...v, cancelada: true, data_cancelamento: new Date().toISOString(), motivo_cancelamento: motivoCancelamento }
          : v
      ))

      setDialogCancelarOpen(false)
      setVendaParaCancelar(null)
      setMotivoCancelamento('')
    } catch {
      toast.error('Erro ao cancelar venda')
    } finally {
      setIsCanceling(false)
    }
  }

  const abrirDialogCancelar = (venda: Venda) => {
    setVendaParaCancelar(venda)
    setMotivoCancelamento('')
    setDialogCancelarOpen(true)
  }

  // Filtrar vendas
  const vendasFiltradas = vendas.filter(v => {
    const matchBusca =
      v.numero.toString().includes(busca) ||
      v.cliente?.nome?.toLowerCase().includes(busca.toLowerCase())
    return matchBusca
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-6 p-4 lg:p-6">
        {/* Ações */}
        <div className="flex items-center justify-between">
          <Link href="/vendas">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao PDV
            </Button>
          </Link>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total em Vendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalVendas)}</div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Lucro Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalLucro)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Vendas Realizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.quantidadeVendas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Ticket Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.ticketMedio)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por número ou cliente..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filtroData} onValueChange={setFiltroData}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="semana">Esta Semana</SelectItem>
              <SelectItem value="mes">Este Mês</SelectItem>
              <SelectItem value="todos">Todos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabela de vendas */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Venda</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Lucro</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendasFiltradas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                        Nenhuma venda encontrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    vendasFiltradas.map((venda) => (
                      <TableRow key={venda.id} className={venda.cancelada ? 'opacity-60 bg-red-50' : ''}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            #{venda.numero}
                            {venda.cancelada && (
                              <Badge variant="destructive" className="text-xs">
                                Cancelada
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {venda.cliente ? (
                            <div>
                              <p className="font-medium">{venda.cliente.nome}</p>
                              <p className="text-sm text-muted-foreground">{venda.cliente.telefone}</p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Cliente Avulso</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {venda.itens?.length || 0} {(venda.itens?.length || 0) === 1 ? 'item' : 'itens'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {formasPagamentoIcon[venda.forma_pagamento]}
                            <span>{formasPagamentoLabel[venda.forma_pagamento]}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">
                              {format(new Date(venda.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(venda.created_at), 'HH:mm')}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className={`text-right font-medium ${venda.cancelada ? 'line-through text-muted-foreground' : ''}`}>
                          {formatCurrency(venda.valor_total)}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${venda.cancelada ? 'line-through text-muted-foreground' : 'text-green-600'}`}>
                          {formatCurrency(venda.lucro_liquido)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setVendaSelecionada(venda)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Printer className="mr-2 h-4 w-4" />
                                Reimprimir Cupom
                              </DropdownMenuItem>
                              {!venda.cancelada && (
                                <DropdownMenuItem
                                  onClick={() => abrirDialogCancelar(venda)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Cancelar Venda
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog Detalhes da Venda */}
        <Dialog open={!!vendaSelecionada} onOpenChange={() => setVendaSelecionada(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Venda #{vendaSelecionada?.numero}</DialogTitle>
              <DialogDescription>
                {vendaSelecionada && format(new Date(vendaSelecionada.created_at), "dd 'de' MMMM 'de' yyyy 'as' HH:mm", { locale: ptBR })}
              </DialogDescription>
            </DialogHeader>
            {vendaSelecionada && (
              <div className="space-y-4">
                {/* Cliente */}
                {vendaSelecionada.cliente && (
                  <div className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-medium">{vendaSelecionada.cliente.nome}</p>
                    <p className="text-sm text-muted-foreground">{vendaSelecionada.cliente.telefone}</p>
                  </div>
                )}

                {/* Itens */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Itens</p>
                  <div className="rounded-lg border divide-y">
                    {vendaSelecionada.itens?.map((item, index) => (
                      <div key={item.id || index} className="flex justify-between p-2 text-sm">
                        <span>{item.quantidade}x {item.descricao}</span>
                        <span className="font-medium">{formatCurrency(item.valor_total)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totais */}
                <div className="rounded-lg bg-muted p-3 space-y-2">
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span className="font-bold text-lg">{formatCurrency(vendaSelecionada.valor_total)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Lucro</span>
                    <span className="font-medium">{formatCurrency(vendaSelecionada.lucro_liquido)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Forma de Pagamento</span>
                    <span>{formasPagamentoLabel[vendaSelecionada.forma_pagamento]}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Vendedor</span>
                    <span>{vendaSelecionada.usuario?.nome || '-'}</span>
                  </div>
                </div>

                {/* Acoes */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Printer className="mr-2 h-4 w-4" />
                    Reimprimir
                  </Button>
                  {!vendaSelecionada.cancelada && (
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => {
                        setVendaSelecionada(null)
                        abrirDialogCancelar(vendaSelecionada)
                      }}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancelar
                    </Button>
                  )}
                </div>

                {vendaSelecionada.cancelada && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm">
                    <div className="flex items-center gap-2 text-red-700 font-medium mb-1">
                      <AlertTriangle className="h-4 w-4" />
                      Venda Cancelada
                    </div>
                    {vendaSelecionada.data_cancelamento && (
                      <p className="text-red-600 text-xs">
                        Em {format(new Date(vendaSelecionada.data_cancelamento), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })}
                      </p>
                    )}
                    {vendaSelecionada.motivo_cancelamento && (
                      <p className="text-red-600 text-xs mt-1">
                        Motivo: {vendaSelecionada.motivo_cancelamento}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog Cancelar Venda */}
        <Dialog open={dialogCancelarOpen} onOpenChange={setDialogCancelarOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Cancelar Venda #{vendaParaCancelar?.numero}
              </DialogTitle>
              <DialogDescription>
                Esta acao ira cancelar a venda e estornar o estoque de todos os produtos.
                Esta acao nao pode ser desfeita.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                <p className="font-medium">Ao cancelar esta venda:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>O estoque dos produtos sera estornado</li>
                  <li>A venda ficara marcada como cancelada</li>
                  <li>Os valores nao serao contabilizados nos relatorios</li>
                </ul>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo do Cancelamento *</Label>
                <Textarea
                  id="motivo"
                  placeholder="Informe o motivo do cancelamento..."
                  value={motivoCancelamento}
                  onChange={(e) => setMotivoCancelamento(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogCancelarOpen(false)}>
                Voltar
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelarVenda}
                disabled={!motivoCancelamento.trim() || isCanceling}
              >
                {isCanceling ? 'Cancelando...' : 'Confirmar Cancelamento'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
