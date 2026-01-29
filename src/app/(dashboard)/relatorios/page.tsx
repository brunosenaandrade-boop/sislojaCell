'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Wrench,
  Package,
  Users,
  Cake,
  FileDown,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
  Star,
} from 'lucide-react'
import { toast } from 'sonner'

// ========== DADOS MOCKADOS ==========

// Vendas por período
const vendasDiarias = [
  { data: '2024-01-27', vendas: 5, valor_bruto: 549.80, custo: 185.00, lucro: 364.80 },
  { data: '2024-01-26', vendas: 8, valor_bruto: 890.50, custo: 312.00, lucro: 578.50 },
  { data: '2024-01-25', vendas: 3, valor_bruto: 245.00, custo: 95.00, lucro: 150.00 },
  { data: '2024-01-24', vendas: 12, valor_bruto: 1580.00, custo: 520.00, lucro: 1060.00 },
  { data: '2024-01-23', vendas: 6, valor_bruto: 720.00, custo: 248.00, lucro: 472.00 },
  { data: '2024-01-22', vendas: 9, valor_bruto: 1120.40, custo: 380.00, lucro: 740.40 },
  { data: '2024-01-21', vendas: 4, valor_bruto: 356.00, custo: 140.00, lucro: 216.00 },
]

const vendasSemanais = [
  { período: 'Semana 4 (22-28/Jan)', vendas: 47, valor_bruto: 5461.70, custo: 1880.00, lucro: 3581.70 },
  { período: 'Semana 3 (15-21/Jan)', vendas: 38, valor_bruto: 4250.00, custo: 1520.00, lucro: 2730.00 },
  { período: 'Semana 2 (08-14/Jan)', vendas: 42, valor_bruto: 4890.30, custo: 1680.00, lucro: 3210.30 },
  { período: 'Semana 1 (01-07/Jan)', vendas: 35, valor_bruto: 3920.00, custo: 1390.00, lucro: 2530.00 },
]

const vendasMensais = [
  { mês: 'Janeiro/2024', vendas: 162, valor_bruto: 18522.00, custo: 6470.00, lucro: 12052.00 },
  { mês: 'Dezembro/2023', vendas: 198, valor_bruto: 22450.00, custo: 7890.00, lucro: 14560.00 },
  { mês: 'Novembro/2023', vendas: 145, valor_bruto: 16780.00, custo: 5940.00, lucro: 10840.00 },
  { mês: 'Outubro/2023', vendas: 156, valor_bruto: 17920.00, custo: 6250.00, lucro: 11670.00 },
]

// OS por status
const osPorStatus = [
  { status: 'Aberta', quantidade: 4, valor_total: 780.00 },
  { status: 'Em Andamento', quantidade: 6, valor_total: 1450.00 },
  { status: 'Aguardando Peça', quantidade: 3, valor_total: 920.00 },
  { status: 'Aguardando Cliente', quantidade: 2, valor_total: 350.00 },
  { status: 'Finalizada', quantidade: 45, valor_total: 12500.00 },
  { status: 'Entregue', quantidade: 38, valor_total: 10200.00 },
]

const osRecentes = [
  { id: 'OS045', cliente: 'Maria Santos', aparelho: 'iPhone 13', serviço: 'Troca de Tela', status: 'em_andamento', valor: 350.00, data: '2024-01-27' },
  { id: 'OS044', cliente: 'Joao Silva', aparelho: 'Samsung S22', serviço: 'Troca de Bateria', status: 'finalizada', valor: 180.00, data: '2024-01-26' },
  { id: 'OS043', cliente: 'Pedro Oliveira', aparelho: 'PS5', serviço: 'Limpeza Interna', status: 'aguardando', valor: 80.00, data: '2024-01-26' },
  { id: 'OS042', cliente: 'Ana Costa', aparelho: 'iPhone 12', serviço: 'Troca Conector', status: 'finalizada', valor: 120.00, data: '2024-01-25' },
  { id: 'OS041', cliente: 'Carlos Ferreira', aparelho: 'Xbox Series X', serviço: 'Reparo HDMI', status: 'aberta', valor: 200.00, data: '2024-01-25' },
]

// Produtos mais vendidos
const produtosMaisVendidos = [
  { posicao: 1, nome: 'Película Galaxy S23', categoria: 'Películas', quantidade: 45, valor_total: 900.00, lucro: 675.00 },
  { posicao: 2, nome: 'Cabo Lightning 1m', categoria: 'Cabos', quantidade: 38, valor_total: 950.00, lucro: 646.00 },
  { posicao: 3, nome: 'Capa iPhone 14 Silicone', categoria: 'Capas', quantidade: 32, valor_total: 1120.00, lucro: 736.00 },
  { posicao: 4, nome: 'Carregador USB-C Turbo 20W', categoria: 'Carregadores', quantidade: 28, valor_total: 1397.20, lucro: 697.20 },
  { posicao: 5, nome: 'Fone Bluetooth TWS', categoria: 'Fones', quantidade: 18, valor_total: 1618.20, lucro: 988.20 },
  { posicao: 6, nome: 'Power Bank 10000mAh', categoria: 'Power Banks', quantidade: 15, valor_total: 1498.50, lucro: 823.50 },
  { posicao: 7, nome: 'Cabo USB-C 2m', categoria: 'Cabos', quantidade: 12, valor_total: 359.40, lucro: 239.40 },
  { posicao: 8, nome: 'Película iPhone 14', categoria: 'Películas', quantidade: 10, valor_total: 200.00, lucro: 150.00 },
]

// Serviços mais realizados
const serviçosMaisRealizados = [
  { posicao: 1, nome: 'Troca de Bateria', tipo: 'Celular', nivel: 'Básico', quantidade: 78, valor_total: 6240.00 },
  { posicao: 2, nome: 'Limpeza Interna', tipo: 'Videogame', nivel: 'Básico', quantidade: 56, valor_total: 4480.00 },
  { posicao: 3, nome: 'Troca de Tela', tipo: 'Celular', nivel: 'Avançado', quantidade: 45, valor_total: 6750.00 },
  { posicao: 4, nome: 'Troca Pasta Térmica', tipo: 'Videogame', nivel: 'Básico', quantidade: 41, valor_total: 4100.00 },
  { posicao: 5, nome: 'Troca Conector Carga', tipo: 'Celular', nivel: 'Avançado', quantidade: 32, valor_total: 3200.00 },
  { posicao: 6, nome: 'Troca de Botões', tipo: 'Celular', nivel: 'Básico', quantidade: 23, valor_total: 1380.00 },
  { posicao: 7, nome: 'Reparo de Placa', tipo: 'Videogame', nivel: 'Avançado', quantidade: 18, valor_total: 4500.00 },
  { posicao: 8, nome: 'Reparo HDMI', tipo: 'Videogame', nivel: 'Avançado', quantidade: 12, valor_total: 2160.00 },
]

// Aniversariantes
const aniversariantesMês = [
  { nome: 'Maria Santos', telefone: '(48) 99999-2222', data_nascimento: '1985-01-27', idade: 39, total_gasto: 3500.00 },
  { nome: 'Ana Costa', telefone: '(48) 99999-4444', data_nascimento: '1988-01-28', idade: 36, total_gasto: 2100.00 },
  { nome: 'Lucas Pereira', telefone: '(48) 99999-6666', data_nascimento: '1993-02-05', idade: 31, total_gasto: 890.00 },
  { nome: 'Fernanda Lima', telefone: '(48) 99999-7777', data_nascimento: '1990-02-12', idade: 34, total_gasto: 1560.00 },
  { nome: 'Roberto Alves', telefone: '(48) 99999-8888', data_nascimento: '1987-02-18', idade: 37, total_gasto: 420.00 },
]

// ========== COMPONENTE ==========

export default function RelatóriosPage() {
  const [períodoVendas, setPeríodoVendas] = useState<string>('diário')

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  // Calcular totais de vendas do período selecionado
  const getTotaisPeríodo = () => {
    if (períodoVendas === 'diário') {
      return {
        vendas: vendasDiarias.reduce((a, v) => a + v.vendas, 0),
        bruto: vendasDiarias.reduce((a, v) => a + v.valor_bruto, 0),
        custo: vendasDiarias.reduce((a, v) => a + v.custo, 0),
        lucro: vendasDiarias.reduce((a, v) => a + v.lucro, 0),
      }
    }
    if (períodoVendas === 'semanal') {
      return {
        vendas: vendasSemanais.reduce((a, v) => a + v.vendas, 0),
        bruto: vendasSemanais.reduce((a, v) => a + v.valor_bruto, 0),
        custo: vendasSemanais.reduce((a, v) => a + v.custo, 0),
        lucro: vendasSemanais.reduce((a, v) => a + v.lucro, 0),
      }
    }
    return {
      vendas: vendasMensais.reduce((a, v) => a + v.vendas, 0),
      bruto: vendasMensais.reduce((a, v) => a + v.valor_bruto, 0),
      custo: vendasMensais.reduce((a, v) => a + v.custo, 0),
      lucro: vendasMensais.reduce((a, v) => a + v.lucro, 0),
    }
  }

  const totais = getTotaisPeríodo()
  const margemMédia = totais.bruto > 0 ? ((totais.lucro / totais.bruto) * 100) : 0

  // Status badge para OS
  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
      aberta: { label: 'Aberta', variant: 'secondary' },
      em_andamento: { label: 'Em Andamento', variant: 'default' },
      aguardando: { label: 'Aguardando', variant: 'outline' },
      finalizada: { label: 'Finalizada', variant: 'default' },
    }
    const c = config[status] || { label: status, variant: 'outline' }
    return <Badge variant={c.variant}>{c.label}</Badge>
  }

  // Exportar relatório
  const exportarRelatório = (tipo: string) => {
    let headers: string[] = []
    let rows: string[][] = []

    if (tipo === 'vendas') {
      headers = ['Período', 'Qtd Vendas', 'Valor Bruto', 'Custo', 'Lucro']
      if (períodoVendas === 'diário') {
        rows = vendasDiarias.map(v => [formatDate(v.data), String(v.vendas), v.valor_bruto.toFixed(2), v.custo.toFixed(2), v.lucro.toFixed(2)])
      } else if (períodoVendas === 'semanal') {
        rows = vendasSemanais.map(v => [v.período, String(v.vendas), v.valor_bruto.toFixed(2), v.custo.toFixed(2), v.lucro.toFixed(2)])
      } else {
        rows = vendasMensais.map(v => [v.mês, String(v.vendas), v.valor_bruto.toFixed(2), v.custo.toFixed(2), v.lucro.toFixed(2)])
      }
    } else if (tipo === 'produtos') {
      headers = ['Posição', 'Produto', 'Categoria', 'Qtd Vendida', 'Valor Total', 'Lucro']
      rows = produtosMaisVendidos.map(p => [String(p.posicao), p.nome, p.categoria, String(p.quantidade), p.valor_total.toFixed(2), p.lucro.toFixed(2)])
    } else if (tipo === 'serviços') {
      headers = ['Posição', 'Serviço', 'Tipo', 'Nível', 'Qtd Realizada', 'Valor Total']
      rows = serviçosMaisRealizados.map(s => [String(s.posicao), s.nome, s.tipo, s.nivel, String(s.quantidade), s.valor_total.toFixed(2)])
    } else if (tipo === 'aniversariantes') {
      headers = ['Nome', 'Telefone', 'Data Nascimento', 'Idade', 'Total Gasto']
      rows = aniversariantesMês.map(a => [a.nome, a.telefone, formatDate(a.data_nascimento), String(a.idade), a.total_gasto.toFixed(2)])
    }

    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
    const blob = new Blob([csv], { type: 'text-csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `relatório_${tipo}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    toast.success('Relatório exportado!')
  }

  return (
    <div className="flex flex-col">
      <Header title="Relatórios" />

      <div className="flex-1 space-y-6 p-4 lg:p-6">

        {/* Tabs de Relatórios */}
        <Tabs defaultValue="vendas">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 max-w-3xl">
            <TabsTrigger value="vendas">
              <ShoppingCart className="mr-2 h-4 w-4 hidden sm:inline" />
              Vendas
            </TabsTrigger>
            <TabsTrigger value="os">
              <Wrench className="mr-2 h-4 w-4 hidden sm:inline" />
              OS
            </TabsTrigger>
            <TabsTrigger value="produtos">
              <Package className="mr-2 h-4 w-4 hidden sm:inline" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="serviços">
              <Wrench className="mr-2 h-4 w-4 hidden sm:inline" />
              Serviços
            </TabsTrigger>
            <TabsTrigger value="clientes">
              <Users className="mr-2 h-4 w-4 hidden sm:inline" />
              Clientes
            </TabsTrigger>
          </TabsList>

          {/* ===== TAB VENDAS / LUCRO ===== */}
          <TabsContent value="vendas" className="space-y-6">
            <div className="flex items-center justify-between">
              <Select value={períodoVendas} onValueChange={setPeríodoVendas}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diário">Diário (7 dias)</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => exportarRelatório('vendas')}>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
            </div>

            {/* Cards Resumo */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Total Vendas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totais.vendas}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Faturamento Bruto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totais.bruto)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    Custo dos Produtos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{formatCurrency(totais.custo)}</div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Lucro Líquido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">{formatCurrency(totais.lucro)}</div>
                  <p className="text-xs text-green-600">Margem: {margemMédia.toFixed(1)}%</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabela de Vendas */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhamento de Vendas</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Período</TableHead>
                      <TableHead className="text-center">Vendas</TableHead>
                      <TableHead className="text-right">Bruto</TableHead>
                      <TableHead className="text-right">Custo</TableHead>
                      <TableHead className="text-right">Lucro</TableHead>
                      <TableHead className="text-right">Margem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {períodoVendas === 'diário' && vendasDiarias.map((v, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{formatDate(v.data)}</TableCell>
                        <TableCell className="text-center">{v.vendas}</TableCell>
                        <TableCell className="text-right">{formatCurrency(v.valor_bruto)}</TableCell>
                        <TableCell className="text-right text-red-600">{formatCurrency(v.custo)}</TableCell>
                        <TableCell className="text-right text-green-600 font-bold">{formatCurrency(v.lucro)}</TableCell>
                        <TableCell className="text-right">
                          <Badge className={v.lucro / v.valor_bruto >= 0.5 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                            {((v.lucro / v.valor_bruto) * 100).toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {períodoVendas === 'semanal' && vendasSemanais.map((v, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{v.período}</TableCell>
                        <TableCell className="text-center">{v.vendas}</TableCell>
                        <TableCell className="text-right">{formatCurrency(v.valor_bruto)}</TableCell>
                        <TableCell className="text-right text-red-600">{formatCurrency(v.custo)}</TableCell>
                        <TableCell className="text-right text-green-600 font-bold">{formatCurrency(v.lucro)}</TableCell>
                        <TableCell className="text-right">
                          <Badge className={v.lucro / v.valor_bruto >= 0.5 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                            {((v.lucro / v.valor_bruto) * 100).toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {períodoVendas === 'mensal' && vendasMensais.map((v, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{v.mês}</TableCell>
                        <TableCell className="text-center">{v.vendas}</TableCell>
                        <TableCell className="text-right">{formatCurrency(v.valor_bruto)}</TableCell>
                        <TableCell className="text-right text-red-600">{formatCurrency(v.custo)}</TableCell>
                        <TableCell className="text-right text-green-600 font-bold">{formatCurrency(v.lucro)}</TableCell>
                        <TableCell className="text-right">
                          <Badge className={v.lucro / v.valor_bruto >= 0.5 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                            {((v.lucro / v.valor_bruto) * 100).toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== TAB ORDENS DE SERVICO ===== */}
          <TabsContent value="os" className="space-y-6">
            {/* Cards por Status */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {osPorStatus.map((os, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {os.status}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-2xl font-bold">{os.quantidade}</div>
                        <p className="text-xs text-muted-foreground">{formatCurrency(os.valor_total)}</p>
                      </div>
                      <div className="text-right">
                        <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(os.quantidade / Math.max(...osPorStatus.map(o => o.quantidade))) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Resumo Total OS */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Total de OS</div>
                    <div className="text-3xl font-bold">{osPorStatus.reduce((a, o) => a + o.quantidade, 0)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Valor Total</div>
                    <div className="text-3xl font-bold text-green-600">
                      {formatCurrency(osPorStatus.reduce((a, o) => a + o.valor_total, 0))}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Em Aberto</div>
                    <div className="text-3xl font-bold text-orange-600">
                      {osPorStatus.filter(o => !['Finalizada', 'Entregue'].includes(o.status)).reduce((a, o) => a + o.quantidade, 0)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* OS Recentes */}
            <Card>
              <CardHeader>
                <CardTitle>OS Recentes</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>OS</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Aparelho</TableHead>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {osRecentes.map(os => (
                      <TableRow key={os.id}>
                        <TableCell className="font-mono font-medium">{os.id}</TableCell>
                        <TableCell>{os.cliente}</TableCell>
                        <TableCell>{os.aparelho}</TableCell>
                        <TableCell>{os.serviço}</TableCell>
                        <TableCell>{getStatusBadge(os.status)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(os.valor)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== TAB PRODUTOS MAIS VENDIDOS ===== */}
          <TabsContent value="produtos" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Ranking de Produtos Mais Vendidos
              </h3>
              <Button variant="outline" onClick={() => exportarRelatório('produtos')}>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
            </div>

            {/* Top 3 em destaque */}
            <div className="grid gap-4 sm:grid-cols-3">
              {produtosMaisVendidos.slice(0, 3).map((produto, i) => (
                <Card key={i} className={i === 0 ? 'border-yellow-300 bg-yellow-50' : ''}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-orange-400'}`}>
                        {produto.posicao}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{produto.nome}</div>
                        <div className="text-xs text-muted-foreground">{produto.categoria}</div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm">{produto.quantidade} vendidos</span>
                          <span className="text-green-600 font-bold">{formatCurrency(produto.lucro)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tabela completa */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">#</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-center">Qtd Vendida</TableHead>
                      <TableHead className="text-right">Faturamento</TableHead>
                      <TableHead className="text-right">Lucro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {produtosMaisVendidos.map(produto => (
                      <TableRow key={produto.posicao}>
                        <TableCell>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${produto.posicao <= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-muted text-muted-foreground'}`}>
                            {produto.posicao}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{produto.nome}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{produto.categoria}</Badge>
                        </TableCell>
                        <TableCell className="text-center font-bold">{produto.quantidade}</TableCell>
                        <TableCell className="text-right">{formatCurrency(produto.valor_total)}</TableCell>
                        <TableCell className="text-right text-green-600 font-bold">
                          {formatCurrency(produto.lucro)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== TAB SERVICOS MAIS REALIZADOS ===== */}
          <TabsContent value="serviços" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Ranking de Serviços Mais Realizados
              </h3>
              <Button variant="outline" onClick={() => exportarRelatório('serviços')}>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
            </div>

            {/* Top 3 */}
            <div className="grid gap-4 sm:grid-cols-3">
              {serviçosMaisRealizados.slice(0, 3).map((serviço, i) => (
                <Card key={i} className={i === 0 ? 'border-yellow-300 bg-yellow-50' : ''}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-orange-400'}`}>
                        {serviço.posicao}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{serviço.nome}</div>
                        <div className="flex gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">{serviço.tipo}</Badge>
                          <Badge variant="secondary" className="text-xs">{serviço.nivel}</Badge>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm">{serviço.quantidade} realizados</span>
                          <span className="font-bold">{formatCurrency(serviço.valor_total)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tabela completa */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">#</TableHead>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Nível</TableHead>
                      <TableHead className="text-center">Qtd Realizada</TableHead>
                      <TableHead className="text-right">Faturamento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviçosMaisRealizados.map(serviço => (
                      <TableRow key={serviço.posicao}>
                        <TableCell>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${serviço.posicao <= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-muted text-muted-foreground'}`}>
                            {serviço.posicao}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{serviço.nome}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{serviço.tipo}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{serviço.nivel}</Badge>
                        </TableCell>
                        <TableCell className="text-center font-bold">{serviço.quantidade}</TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(serviço.valor_total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== TAB CLIENTES / ANIVERSARIANTES ===== */}
          <TabsContent value="clientes" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Cake className="h-5 w-5 text-pink-500" />
                Aniversariantes do Mês
              </h3>
              <Button variant="outline" onClick={() => exportarRelatório('aniversariantes')}>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
            </div>

            {/* Cards resumo */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="border-pink-200 bg-pink-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-pink-700 flex items-center gap-2">
                    <Cake className="h-4 w-4" />
                    Aniversariantes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-pink-700">{aniversariantesMês.length}</div>
                  <p className="text-xs text-pink-600">neste mês</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Total Gasto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(aniversariantesMês.reduce((a, c) => a + c.total_gasto, 0))}
                  </div>
                  <p className="text-xs text-muted-foreground">pelos aniversariantes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Média por Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(aniversariantesMês.reduce((a, c) => a + c.total_gasto, 0) / aniversariantesMês.length)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabela de aniversariantes */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Aniversário</TableHead>
                      <TableHead className="text-center">Idade</TableHead>
                      <TableHead className="text-right">Total Gasto</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aniversariantesMês.map((cliente, i) => {
                      const hoje = new Date()
                      const nasc = new Date(cliente.data_nascimento)
                      const jaPassou = (nasc.getMonth() < hoje.getMonth()) ||
                        (nasc.getMonth() === hoje.getMonth() && nasc.getDate() < hoje.getDate())
                      const ehHoje = nasc.getDate() === hoje.getDate() && nasc.getMonth() === hoje.getMonth()

                      return (
                        <TableRow key={i} className={ehHoje ? 'bg-pink-50' : ''}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-pink-600">
                                  {cliente.nome.charAt(0)}
                                </span>
                              </div>
                              <span className="font-medium">{cliente.nome}</span>
                            </div>
                          </TableCell>
                          <TableCell>{cliente.telefone}</TableCell>
                          <TableCell>{formatDate(cliente.data_nascimento)}</TableCell>
                          <TableCell className="text-center">{cliente.idade} anos</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(cliente.total_gasto)}</TableCell>
                          <TableCell className="text-center">
                            {ehHoje ? (
                              <Badge className="bg-pink-100 text-pink-700 gap-1">
                                <Cake className="h-3 w-3" />
                                Hoje!
                              </Badge>
                            ) : jaPassou ? (
                              <Badge variant="secondary">Passou</Badge>
                            ) : (
                              <Badge variant="outline">Em breve</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
