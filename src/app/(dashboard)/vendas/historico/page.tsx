'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Vendas mockadas
const vendasMock = [
  {
    id: '1',
    número: 1045,
    cliente: { nome: 'Maria Silva', telefone: '(48) 99999-1111' },
    itens: [
      { nome: 'Carregador USB-C', quantidade: 1, valor_unitario: 49.90, valor_total: 49.90 },
      { nome: 'Cabo USB-C 2m', quantidade: 2, valor_unitario: 29.90, valor_total: 59.80 },
    ],
    valor_total: 109.70,
    valor_custo: 49.00,
    lucro: 60.70,
    forma_pagamento: 'pix',
    usuário: 'Bruno',
    created_at: '2026-01-26T14:30:00',
  },
  {
    id: '2',
    número: 1044,
    cliente: null,
    itens: [
      { nome: 'Fone Bluetooth TWS', quantidade: 1, valor_unitario: 89.90, valor_total: 89.90 },
    ],
    valor_total: 89.90,
    valor_custo: 45.00,
    lucro: 44.90,
    forma_pagamento: 'dinheiro',
    usuário: 'Bruno',
    created_at: '2026-01-26T11:15:00',
  },
  {
    id: '3',
    número: 1043,
    cliente: { nome: 'Joao Santos', telefone: '(48) 99999-2222' },
    itens: [
      { nome: 'Película iPhone 13', quantidade: 1, valor_unitario: 25.00, valor_total: 25.00 },
      { nome: 'Capa Silicone iPhone 13', quantidade: 1, valor_unitario: 35.00, valor_total: 35.00 },
    ],
    valor_total: 60.00,
    valor_custo: 23.00,
    lucro: 37.00,
    forma_pagamento: 'crédito',
    usuário: 'Bruno',
    created_at: '2026-01-26T09:45:00',
  },
  {
    id: '4',
    número: 1042,
    cliente: { nome: 'Ana Oliveira', telefone: '(48) 99999-4444' },
    itens: [
      { nome: 'Power Bank 10000mAh', quantidade: 1, valor_unitario: 99.90, valor_total: 99.90 },
      { nome: 'Cabo USB-C 2m', quantidade: 1, valor_unitario: 29.90, valor_total: 29.90 },
    ],
    valor_total: 129.80,
    valor_custo: 67.00,
    lucro: 62.80,
    forma_pagamento: 'débito',
    usuário: 'Funcionário',
    created_at: '2026-01-25T16:20:00',
  },
  {
    id: '5',
    número: 1041,
    cliente: null,
    itens: [
      { nome: 'Carregador Wireless', quantidade: 1, valor_unitario: 79.90, valor_total: 79.90 },
    ],
    valor_total: 79.90,
    valor_custo: 40.00,
    lucro: 39.90,
    forma_pagamento: 'pix',
    usuário: 'Bruno',
    created_at: '2026-01-25T14:00:00',
  },
]

const formasPagamentoIcon: Record<string, React.ReactNode> = {
  dinheiro: <Banknote className="h-4 w-4" />,
  pix: <QrCode className="h-4 w-4" />,
  débito: <CreditCard className="h-4 w-4" />,
  crédito: <CreditCard className="h-4 w-4" />,
}

const formasPagamentoLabel: Record<string, string> = {
  dinheiro: 'Dinheiro',
  pix: 'PIX',
  débito: 'Débito',
  crédito: 'Crédito',
}

export default function HistóricoVendasPage() {
  const [vendas] = useState(vendasMock)
  const [busca, setBusca] = useState('')
  const [filtroData, setFiltroData] = useState('hoje')
  const [vendaSelecionada, setVendaSelecionada] = useState<typeof vendasMock[0] | null>(null)

  // Calcular estatísticas
  const stats = {
    totalVendas: vendas.reduce((acc, v) => acc + v.valor_total, 0),
    totalLucro: vendas.reduce((acc, v) => acc + v.lucro, 0),
    quantidadeVendas: vendas.length,
    ticketMédio: vendas.length > 0 ? vendas.reduce((acc, v) => acc + v.valor_total, 0) / vendas.length : 0,
  }

  // Filtrar vendas
  const vendasFiltradas = vendas.filter(v => {
    const matchBusca =
      v.número.toString().includes(busca) ||
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
      <Header title="Histórico de Vendas" />

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
        <div className="grid gap-4 md:grid-cols-4">
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
              <div className="text-2xl font-bold">{formatCurrency(stats.ticketMédio)}</div>
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
              <SelectItem value="mês">Este Mês</SelectItem>
              <SelectItem value="todos">Todos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabela de vendas */}
        <Card>
          <CardContent className="p-0">
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
                    <TableRow key={venda.id}>
                      <TableCell className="font-medium">
                        #{venda.número}
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
                          {venda.itens.length} {venda.itens.length === 1 ? 'item' : 'itens'}
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
                      <TableCell className="text-right font-medium">
                        {formatCurrency(venda.valor_total)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatCurrency(venda.lucro)}
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
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog Detalhes da Venda */}
        <Dialog open={!!vendaSelecionada} onOpenChange={() => setVendaSelecionada(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Venda #{vendaSelecionada?.número}</DialogTitle>
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
                    {vendaSelecionada.itens.map((item, index) => (
                      <div key={index} className="flex justify-between p-2 text-sm">
                        <span>{item.quantidade}x {item.nome}</span>
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
                    <span className="font-medium">{formatCurrency(vendaSelecionada.lucro)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Forma de Pagamento</span>
                    <span>{formasPagamentoLabel[vendaSelecionada.forma_pagamento]}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Vendedor</span>
                    <span>{vendaSelecionada.usuário}</span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Printer className="mr-2 h-4 w-4" />
                    Reimprimir
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
