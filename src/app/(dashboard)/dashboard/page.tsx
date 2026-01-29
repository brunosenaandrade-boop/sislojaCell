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
  Loader2,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { toast } from 'sonner'
import { dashboardService } from '@/services/dashboard.service'
import type { Cliente, Venda, OrdemServico } from '@/types/database'

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
  const { usuario } = useAuthStore()
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

  useEffect(() => {
    setIsMounted(true)
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
        setVendasSemana(vendasSemanaRes.data)
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

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <Header title="Dashboard" />
        <div className="flex-1 flex items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
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
              <AnimatedCounter value={resumo.vendas_dia} formatter={formatCurrency} className="text-2xl font-bold" />
              <p className="text-xs text-muted-foreground">
                {resumo.quantidade_vendas} vendas realizadas
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
              <AnimatedCounter value={resumo.custo_dia} formatter={formatCurrency} className="text-2xl font-bold text-red-600" />
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
            <CardTitle>Vendas da Semana</CardTitle>
            <CardDescription>Vendas e lucro por dia da semana</CardDescription>
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
                  <Bar dataKey="total" name="Vendas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lucro" name="Lucro" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>}
            </div>
          </CardContent>
        </Card>

        {/* Listas */}
        <div className="grid gap-4 lg:grid-cols-2">
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
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium">Venda #{venda.numero}</p>
                      <p className="text-sm text-muted-foreground">{(venda.cliente as { id: string; nome: string } | undefined)?.nome || 'Cliente Avulso'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(venda.valor_total)}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(venda.created_at), 'HH:mm')}
                      </p>
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
                {ultimasOS.map((os) => (
                  <div
                    key={os.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium">OS #{os.numero}</p>
                      <p className="text-sm text-muted-foreground">
                        {(os.cliente as { id: string; nome: string } | undefined)?.nome || 'Sem cliente'} - {os.modelo || os.tipo_aparelho || 'N/A'}
                      </p>
                    </div>
                    <Badge className={statusColors[os.status]}>
                      {statusLabels[os.status]}
                    </Badge>
                  </div>
                ))}
                {ultimasOS.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhuma OS recente</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
