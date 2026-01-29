'use client'

import { useEffect, useState } from 'react'
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
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Printer,
  FileText,
  Smartphone,
  Gamepad2,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { OrdemServico, StatusOS } from '@/types/database'

// Configurações de status
const statusConfig: Record<StatusOS, { label: string; color: string; icon: React.ReactNode }> = {
  aberta: { label: 'Aberta', color: 'bg-blue-100 text-blue-800', icon: <FileText className="h-3 w-3" /> },
  em_analise: { label: 'Em Analise', color: 'bg-yellow-100 text-yellow-800', icon: <Search className="h-3 w-3" /> },
  aguardando_peca: { label: 'Aguardando Peca', color: 'bg-orange-100 text-orange-800', icon: <Clock className="h-3 w-3" /> },
  aguardando_aprovacao: { label: 'Aguardando Aprovação', color: 'bg-purple-100 text-purple-800', icon: <AlertCircle className="h-3 w-3" /> },
  em_andamento: { label: 'Em Andamento', color: 'bg-cyan-100 text-cyan-800', icon: <Clock className="h-3 w-3" /> },
  finalizada: { label: 'Finalizada', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
  entregue: { label: 'Entregue', color: 'bg-gray-100 text-gray-800', icon: <CheckCircle className="h-3 w-3" /> },
  cancelada: { label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: <AlertCircle className="h-3 w-3" /> },
}

// Dados mockados para demo
const mockOS: OrdemServico[] = [
  {
    id: '1',
    empresa_id: '1',
    cliente_id: '1',
    usuario_id: '1',
    numero: 1001,
    status: 'em_andamento',
    tipo_aparelho: 'celular',
    marca: 'Apple',
    modelo: 'iPhone 13',
    problema_relatado: 'Tela quebrada, não liga',
    valor_servicos: 350,
    valor_produtos: 450,
    valor_desconto: 0,
    valor_total: 800,
    pago: false,
    data_entrada: '2026-01-25T10:30:00',
    created_at: '2026-01-25T10:30:00',
    updated_at: '2026-01-25T10:30:00',
    cliente: { id: '1', empresa_id: '1', nome: 'Maria Silva', telefone: '(48) 99999-1111', ativo: true, created_at: '', updated_at: '' },
  },
  {
    id: '2',
    empresa_id: '1',
    cliente_id: '2',
    usuario_id: '1',
    numero: 1002,
    status: 'aguardando_peca',
    tipo_aparelho: 'celular',
    marca: 'Samsung',
    modelo: 'Galaxy S22',
    problema_relatado: 'Bateria viciada, desliga rápido',
    valor_servicos: 80,
    valor_produtos: 150,
    valor_desconto: 0,
    valor_total: 230,
    pago: false,
    data_entrada: '2026-01-24T14:00:00',
    created_at: '2026-01-24T14:00:00',
    updated_at: '2026-01-24T14:00:00',
    cliente: { id: '2', empresa_id: '1', nome: 'Joao Santos', telefone: '(48) 99999-2222', ativo: true, created_at: '', updated_at: '' },
  },
  {
    id: '3',
    empresa_id: '1',
    cliente_id: '3',
    usuario_id: '1',
    numero: 1003,
    status: 'finalizada',
    tipo_aparelho: 'videogame',
    marca: 'Sony',
    modelo: 'PlayStation 5',
    problema_relatado: 'Não lê disco',
    valor_servicos: 200,
    valor_produtos: 0,
    valor_desconto: 0,
    valor_total: 200,
    pago: true,
    data_entrada: '2026-01-23T09:00:00',
    data_finalizacao: '2026-01-25T16:00:00',
    created_at: '2026-01-23T09:00:00',
    updated_at: '2026-01-25T16:00:00',
    cliente: { id: '3', empresa_id: '1', nome: 'Pedro Costa', telefone: '(48) 99999-3333', ativo: true, created_at: '', updated_at: '' },
  },
  {
    id: '4',
    empresa_id: '1',
    cliente_id: '4',
    usuario_id: '1',
    numero: 1004,
    status: 'aberta',
    tipo_aparelho: 'celular',
    marca: 'Motorola',
    modelo: 'Edge 30',
    problema_relatado: 'Camera traseira com defeito',
    valor_servicos: 0,
    valor_produtos: 0,
    valor_desconto: 0,
    valor_total: 0,
    pago: false,
    data_entrada: '2026-01-26T08:00:00',
    created_at: '2026-01-26T08:00:00',
    updated_at: '2026-01-26T08:00:00',
    cliente: { id: '4', empresa_id: '1', nome: 'Ana Oliveira', telefone: '(48) 99999-4444', ativo: true, created_at: '', updated_at: '' },
  },
  {
    id: '5',
    empresa_id: '1',
    cliente_id: '5',
    usuario_id: '1',
    numero: 1005,
    status: 'em_analise',
    tipo_aparelho: 'videogame',
    marca: 'Microsoft',
    modelo: 'Xbox Series X',
    problema_relatado: 'Superaquecimento e desligando sozinho',
    valor_servicos: 0,
    valor_produtos: 0,
    valor_desconto: 0,
    valor_total: 0,
    pago: false,
    data_entrada: '2026-01-26T11:00:00',
    created_at: '2026-01-26T11:00:00',
    updated_at: '2026-01-26T11:00:00',
    cliente: { id: '5', empresa_id: '1', nome: 'Carlos Lima', telefone: '(48) 99999-5555', ativo: true, created_at: '', updated_at: '' },
  },
]

export default function OrdensServiçoPage() {
  const [ordens, setOrdens] = useState<OrdemServico[]>(mockOS)
  const [busca, setBusca] = useState('')
  const [statusFiltro, setStatusFiltro] = useState<string>('todos')
  const [isLoading, setIsLoading] = useState(false)

  // Estatísticas
  const stats = {
    total: ordens.length,
    abertas: ordens.filter(o => o.status === 'aberta').length,
    em_andamento: ordens.filter(o => ['em_analise', 'em_andamento', 'aguardando_peca', 'aguardando_aprovacao'].includes(o.status)).length,
    finalizadas: ordens.filter(o => o.status === 'finalizada').length,
  }

  // Filtrar ordens
  const ordensFiltradas = ordens.filter(os => {
    const matchBusca =
      os.numero.toString().includes(busca) ||
      os.cliente?.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      os.marca?.toLowerCase().includes(busca.toLowerCase()) ||
      os.modelo?.toLowerCase().includes(busca.toLowerCase())

    const matchStatus = statusFiltro === 'todos' || os.status === statusFiltro

    return matchBusca && matchStatus
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const getAparelhoIcon = (tipo?: string) => {
    if (tipo === 'videogame') return <Gamepad2 className="h-4 w-4" />
    return <Smartphone className="h-4 w-4" />
  }

  return (
    <div className="flex flex-col">
      <Header title="Ordens de Serviço" />

      <div className="flex-1 space-y-6 p-4 lg:p-6">
        {/* Cards de estatísticas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de OS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Abertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.abertas}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Em Andamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.em_andamento}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Finalizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.finalizadas}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e ações */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por numero, cliente, aparelho..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFiltro} onValueChange={setStatusFiltro}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="aberta">Aberta</SelectItem>
                <SelectItem value="em_analise">Em Analise</SelectItem>
                <SelectItem value="aguardando_peca">Aguardando Peca</SelectItem>
                <SelectItem value="aguardando_aprovacao">Aguardando Aprovação</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="finalizada">Finalizada</SelectItem>
                <SelectItem value="entregue">Entregue</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Link href="/ordens-serviço/nova">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova OS
            </Button>
          </Link>
        </div>

        {/* Tabela de OS */}
        <Card data-tutorial="os-list">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">OS</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Aparelho</TableHead>
                  <TableHead>Problema</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordensFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      Nenhuma ordem de serviço encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  ordensFiltradas.map((os) => (
                    <TableRow key={os.id}>
                      <TableCell className="font-medium">
                        #{os.numero}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{os.cliente?.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {os.cliente?.telefone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getAparelhoIcon(os.tipo_aparelho)}
                          <div>
                            <p className="font-medium">{os.marca}</p>
                            <p className="text-sm text-muted-foreground">{os.modelo}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="truncate text-sm" title={os.problema_relatado}>
                          {os.problema_relatado}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge className={`gap-1 ${statusConfig[os.status].color}`}>
                          {statusConfig[os.status].icon}
                          {statusConfig[os.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            {format(new Date(os.data_entrada), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(os.data_entrada), 'HH:mm')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <p className="font-medium">{formatCurrency(os.valor_total)}</p>
                          {os.pago ? (
                            <Badge variant="outline" className="text-xs text-green-600">
                              Pago
                            </Badge>
                          ) : os.valor_total > 0 ? (
                            <Badge variant="outline" className="text-xs text-orange-600">
                              Pendente
                            </Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/ordens-serviço/${os.id}`}>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/ordens-serviço/${os.id}/editar`}>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem>
                              <Printer className="mr-2 h-4 w-4" />
                              Imprimir
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
      </div>
    </div>
  )
}
