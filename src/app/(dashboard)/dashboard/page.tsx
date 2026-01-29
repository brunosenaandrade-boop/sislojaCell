'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/useStore'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  FileText,
  Package,
  Users,
  AlertTriangle,
  Cake,
  ArrowRight,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

// Dados mockados para demo
const mockDashboard = {
  vendas_dia: 1250.00,
  custo_dia: 680.00,
  lucro_dia: 570.00,
  quantidade_vendas: 8,
  os_abertas: 5,
  os_finalizadas: 3,
  produtos_estoque_baixo: 7,
  aniversariantes: [
    { id: '1', nome: 'Maria Silva', data_nascimento: '1990-01-26' },
    { id: '2', nome: 'Joao Santos', data_nascimento: '1985-01-27' },
  ],
  ultimas_vendas: [
    { id: '1', número: 145, valor: 89.90, cliente: 'Cliente Avulso', created_at: new Date().toISOString() },
    { id: '2', número: 144, valor: 250.00, cliente: 'Pedro Almeida', created_at: new Date().toISOString() },
    { id: '3', número: 143, valor: 45.00, cliente: 'Ana Costa', created_at: new Date().toISOString() },
  ],
  ultimas_os: [
    { id: '1', número: 89, status: 'em_andamento', cliente: 'Carlos Lima', aparelho: 'iPhone 13' },
    { id: '2', número: 88, status: 'aguardando_peca', cliente: 'Julia Ferreira', aparelho: 'Samsung S22' },
    { id: '3', número: 87, status: 'finalizada', cliente: 'Roberto Dias', aparelho: 'PS5' },
  ],
}

const mockVendasSemana = [
  { dia: 'Seg', vendas: 980, lucro: 420 },
  { dia: 'Ter', vendas: 1250, lucro: 570 },
  { dia: 'Qua', vendas: 850, lucro: 380 },
  { dia: 'Qui', vendas: 1500, lucro: 690 },
  { dia: 'Sex', vendas: 2100, lucro: 950 },
  { dia: 'Sáb', vendas: 1800, lucro: 810 },
  { dia: 'Dom', vendas: 600, lucro: 270 },
]

const statusColors: Record<string, string> = {
  aberta: 'bg-blue-100 text-blue-800',
  em_analise: 'bg-yellow-100 text-yellow-800',
  aguardando_peca: 'bg-orange-100 text-orange-800',
  aguardando_aprovação: 'bg-purple-100 text-purple-800',
  em_andamento: 'bg-cyan-100 text-cyan-800',
  finalizada: 'bg-green-100 text-green-800',
  entregue: 'bg-gray-100 text-gray-800',
  cancelada: 'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
  aberta: 'Aberta',
  em_analise: 'Em Analise',
  aguardando_peca: 'Aguardando Peca',
  aguardando_aprovação: 'Aguardando Aprovação',
  em_andamento: 'Em Andamento',
  finalizada: 'Finalizada',
  entregue: 'Entregue',
  cancelada: 'Cancelada',
}

export default function DashboardPage() {
  const { usuario } = useAuthStore()
  const [data, setData] = useState(mockDashboard)
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // TODO: Buscar dados reais do Supabase
  useEffect(() => {
    setIsMounted(true)
    // fetchDashboardData()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <div className="flex flex-col">
      <Header title="Dashboard" />

      <div className="flex-1 space-y-6 p-4 lg:p-6">
        {/* Saudação */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {new Date().getHours() < 12 ? 'Bom dia' : new Date().getHours() < 18 ? 'Boa tarde' : 'Boa noite'}, {usuario?.nome?.split(' ')[0] || 'Usuário'}!
            </h2>
            <p className="text-muted-foreground">Aqui está o resumo do seu dia</p>
          </div>
          <div className="flex gap-2">
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-tutorial="dashboard-kpis">
          {/* Vendas do dia */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Vendas do Dia
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <AnimatedCounter value={data.vendas_dia} formatter={formatCurrency} className="text-2xl font-bold" />
              <p className="text-xs text-muted-foreground">
                {data.quantidade_vendas} vendas realizadas
              </p>
            </CardContent>
          </Card>

          {/* Custo */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Custo dos Produtos
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <AnimatedCounter value={data.custo_dia} formatter={formatCurrency} className="text-2xl font-bold text-red-600" />
              <p className="text-xs text-muted-foreground">
                Custo total das vendas
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
              <AnimatedCounter value={data.lucro_dia} formatter={formatCurrency} className="text-2xl font-bold text-green-600" />
              <p className="text-xs text-green-600/80">
                Margem: {((data.lucro_dia / data.vendas_dia) * 100).toFixed(1)}%
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
              <AnimatedCounter value={data.os_abertas} className="text-2xl font-bold" />
              <p className="text-xs text-muted-foreground">
                {data.os_finalizadas} finalizadas hoje
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alertas */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Estoque Baixo */}
          {data.produtos_estoque_baixo > 0 && (
            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-sm font-medium text-orange-700">
                  Alerta de Estoque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-700">
                  <strong>{data.produtos_estoque_baixo}</strong> produtos estao com estoque baixo
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
          {data.aniversariantes.length > 0 && (
            <Card className="border-pink-200 bg-pink-50 dark:bg-pink-950/20">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Cake className="h-5 w-5 text-pink-600" />
                <CardTitle className="text-sm font-medium text-pink-700">
                  Aniversariantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {data.aniversariantes.map((cliente) => (
                    <li key={cliente.id} className="text-sm text-pink-700">
                      {cliente.nome} -{' '}
                      {format(new Date(cliente.data_nascimento + 'T00:00:00'), 'dd/MM', {
                        locale: ptBR,
                      })}
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
            <CardTitle>Vendas da Semana</CardTitle>
            <CardDescription>Vendas e lucro por dia da semana</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {isMounted && <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockVendasSemana}>
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
                  <Bar dataKey="vendas" name="Vendas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lucro" name="Lucro" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>}
            </div>
          </CardContent>
        </Card>

        {/* Listas */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Ultimas Vendas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ultimas Vendas</CardTitle>
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
                {data.ultimas_vendas.map((venda) => (
                  <div
                    key={venda.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium">Venda #{venda.número}</p>
                      <p className="text-sm text-muted-foreground">{venda.cliente}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(venda.valor)}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(venda.created_at), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ultimas OS */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ordens de Serviço</CardTitle>
                <CardDescription>OS em andamento</CardDescription>
              </div>
              <Link href="/ordens-serviço">
                <Button variant="outline" size="sm">
                  Ver todas
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.ultimas_os.map((os) => (
                  <div
                    key={os.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium">OS #{os.número}</p>
                      <p className="text-sm text-muted-foreground">
                        {os.cliente} - {os.aparelho}
                      </p>
                    </div>
                    <Badge className={statusColors[os.status]}>
                      {statusLabels[os.status]}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
