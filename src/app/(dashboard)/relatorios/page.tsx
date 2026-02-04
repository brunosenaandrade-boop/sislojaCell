'use client'

import { useState, useEffect, useCallback } from 'react'
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
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { relatoriosService } from '@/services/relatorios.service'

interface VendaPeriodo {
  periodo: string
  total_vendas: number
  total_custo: number
  lucro_liquido: number
  quantidade_vendas: number
}

interface OSPorStatus {
  status: string
  quantidade: number
  valor_total: number
}

interface TopProduto {
  produto_id: string
  nome: string
  quantidade_total: number
  valor_total: number
}

interface TopServico {
  servico_id: string
  nome: string
  quantidade_total: number
  valor_total: number
}

export default function RelatoriosPage() {
  const [periodoVendas, setPeriodoVendas] = useState<string>('dia')
  const [vendasPeriodo, setVendasPeriodo] = useState<VendaPeriodo[]>([])
  const [osPorStatus, setOsPorStatus] = useState<OSPorStatus[]>([])
  const [topProdutos, setTopProdutos] = useState<TopProduto[]>([])
  const [topServicos, setTopServicos] = useState<TopServico[]>([])
  const [loadingVendas, setLoadingVendas] = useState(true)
  const [loadingOS, setLoadingOS] = useState(true)
  const [loadingProdutos, setLoadingProdutos] = useState(true)
  const [loadingServicos, setLoadingServicos] = useState(true)

  // Calcular datas para período
  const getDataRange = useCallback((agrupamento: string) => {
    const hoje = new Date()
    const dataFim = hoje.toISOString()
    let dataInicio: string

    if (agrupamento === 'dia') {
      const seteDiasAtras = new Date()
      seteDiasAtras.setDate(hoje.getDate() - 7)
      dataInicio = seteDiasAtras.toISOString()
    } else if (agrupamento === 'semana') {
      const trintaDiasAtras = new Date()
      trintaDiasAtras.setDate(hoje.getDate() - 30)
      dataInicio = trintaDiasAtras.toISOString()
    } else {
      const seisMAno = new Date()
      seisMAno.setMonth(hoje.getMonth() - 6)
      dataInicio = seisMAno.toISOString()
    }

    return { dataInicio, dataFim }
  }, [])

  // Fetch vendas por período
  const fetchVendas = useCallback(async () => {
    setLoadingVendas(true)
    try {
      const { dataInicio, dataFim } = getDataRange(periodoVendas)
      const agrupamento = periodoVendas as 'dia' | 'semana' | 'mes'
      const { data, error } = await relatoriosService.getVendasPeriodo(dataInicio, dataFim, agrupamento)
      if (error) toast.error('Erro ao carregar vendas: ' + error)
      setVendasPeriodo(data)
    } catch {
      toast.error('Erro ao carregar vendas')
    } finally {
      setLoadingVendas(false)
    }
  }, [periodoVendas, getDataRange])

  // Fetch OS por status
  const fetchOS = useCallback(async () => {
    setLoadingOS(true)
    try {
      const { data, error } = await relatoriosService.getOSPorStatus()
      if (error) toast.error('Erro ao carregar OS: ' + error)
      setOsPorStatus(data)
    } catch {
      toast.error('Erro ao carregar OS')
    } finally {
      setLoadingOS(false)
    }
  }, [])

  // Fetch top produtos
  const fetchProdutos = useCallback(async () => {
    setLoadingProdutos(true)
    try {
      const { data, error } = await relatoriosService.getTopProdutos(10)
      if (error) toast.error('Erro ao carregar produtos: ' + error)
      setTopProdutos(data)
    } catch {
      toast.error('Erro ao carregar produtos')
    } finally {
      setLoadingProdutos(false)
    }
  }, [])

  // Fetch top serviços
  const fetchServicos = useCallback(async () => {
    setLoadingServicos(true)
    try {
      const { data, error } = await relatoriosService.getTopServicos(10)
      if (error) toast.error('Erro ao carregar serviços: ' + error)
      setTopServicos(data)
    } catch {
      toast.error('Erro ao carregar serviços')
    } finally {
      setLoadingServicos(false)
    }
  }, [])

  useEffect(() => {
    fetchVendas()
  }, [fetchVendas])

  useEffect(() => {
    fetchOS()
    fetchProdutos()
    fetchServicos()
  }, [fetchOS, fetchProdutos, fetchServicos])

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Formatar data
  const formatDate = (dateString: string) => {
    // Handle both YYYY-MM-DD and YYYY-MM formats
    if (dateString.length === 7) return dateString // month format
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR')
  }

  // Calcular totais de vendas do período selecionado
  const totais = {
    vendas: vendasPeriodo.reduce((a, v) => a + v.quantidade_vendas, 0),
    bruto: vendasPeriodo.reduce((a, v) => a + v.total_vendas, 0),
    custo: vendasPeriodo.reduce((a, v) => a + v.total_custo, 0),
    lucro: vendasPeriodo.reduce((a, v) => a + v.lucro_liquido, 0),
  }
  const margemMedia = totais.bruto > 0 ? ((totais.lucro / totais.bruto) * 100) : 0

  // Status labels for OS
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

  // Exportar relatório
  const exportarRelatorio = (tipo: string) => {
    let headers: string[] = []
    let rows: string[][] = []

    if (tipo === 'vendas') {
      headers = ['Período', 'Qtd Vendas', 'Valor Bruto', 'Custo', 'Lucro']
      rows = vendasPeriodo.map(v => [
        formatDate(v.periodo),
        String(v.quantidade_vendas),
        v.total_vendas.toFixed(2),
        v.total_custo.toFixed(2),
        v.lucro_liquido.toFixed(2),
      ])
    } else if (tipo === 'produtos') {
      headers = ['Posição', 'Produto', 'Qtd Vendida', 'Valor Total']
      rows = topProdutos.map((p, i) => [
        String(i + 1),
        p.nome,
        String(p.quantidade_total),
        p.valor_total.toFixed(2),
      ])
    } else if (tipo === 'servicos') {
      headers = ['Posição', 'Serviço', 'Qtd Realizada', 'Valor Total']
      rows = topServicos.map((s, i) => [
        String(i + 1),
        s.nome,
        String(s.quantidade_total),
        s.valor_total.toFixed(2),
      ])
    }

    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
    const blob = new Blob([csv], { type: 'text-csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `relatorio_${tipo}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    toast.success('Relatório exportado!')
  }

  return (
    <div className="flex flex-col">
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
            <TabsTrigger value="servicos">
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
              <Select value={periodoVendas} onValueChange={setPeriodoVendas}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dia">Diário (7 dias)</SelectItem>
                  <SelectItem value="semana">Semanal</SelectItem>
                  <SelectItem value="mes">Mensal</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => exportarRelatorio('vendas')}>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
            </div>

            {loadingVendas ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
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
                      <p className="text-xs text-green-600">Margem: {margemMedia.toFixed(1)}%</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabela de Vendas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Detalhamento de Vendas</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
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
                        {vendasPeriodo.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              Nenhum dado encontrado para o período selecionado
                            </TableCell>
                          </TableRow>
                        ) : (
                          vendasPeriodo.map((v, i) => {
                            const margem = v.total_vendas > 0 ? (v.lucro_liquido / v.total_vendas) : 0
                            return (
                              <TableRow key={i}>
                                <TableCell className="font-medium">{formatDate(v.periodo)}</TableCell>
                                <TableCell className="text-center">{v.quantidade_vendas}</TableCell>
                                <TableCell className="text-right">{formatCurrency(v.total_vendas)}</TableCell>
                                <TableCell className="text-right text-red-600">{formatCurrency(v.total_custo)}</TableCell>
                                <TableCell className="text-right text-green-600 font-bold">{formatCurrency(v.lucro_liquido)}</TableCell>
                                <TableCell className="text-right">
                                  <Badge className={margem >= 0.5 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                                    {(margem * 100).toFixed(1)}%
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            )
                          })
                        )}
                      </TableBody>
                    </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* ===== TAB ORDENS DE SERVICO ===== */}
          <TabsContent value="os" className="space-y-6">
            {loadingOS ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Cards por Status */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {osPorStatus.map((os, i) => (
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          {statusLabels[os.status] || os.status}
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
                                style={{ width: `${osPorStatus.length > 0 ? (os.quantidade / Math.max(...osPorStatus.map(o => o.quantidade))) * 100 : 0}%` }}
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
                          {osPorStatus.filter(o => !['finalizada', 'entregue', 'cancelada'].includes(o.status)).reduce((a, o) => a + o.quantidade, 0)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* ===== TAB PRODUTOS MAIS VENDIDOS ===== */}
          <TabsContent value="produtos" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Ranking de Produtos Mais Vendidos
              </h3>
              <Button variant="outline" onClick={() => exportarRelatorio('produtos')}>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
            </div>

            {loadingProdutos ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Top 3 em destaque */}
                <div className="grid gap-4 sm:grid-cols-3">
                  {topProdutos.slice(0, 3).map((produto, i) => (
                    <Card key={i} className={i === 0 ? 'border-yellow-300 bg-yellow-50' : ''}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-orange-400'}`}>
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{produto.nome}</div>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-sm">{produto.quantidade_total} vendidos</span>
                              <span className="text-green-600 font-bold">{formatCurrency(produto.valor_total)}</span>
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
                    <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60px]">#</TableHead>
                          <TableHead>Produto</TableHead>
                          <TableHead className="text-center">Qtd Vendida</TableHead>
                          <TableHead className="text-right">Faturamento</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topProdutos.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                              Nenhum produto vendido no período
                            </TableCell>
                          </TableRow>
                        ) : (
                          topProdutos.map((produto, i) => (
                            <TableRow key={produto.produto_id}>
                              <TableCell>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-muted text-muted-foreground'}`}>
                                  {i + 1}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{produto.nome}</TableCell>
                              <TableCell className="text-center font-bold">{produto.quantidade_total}</TableCell>
                              <TableCell className="text-right font-bold">{formatCurrency(produto.valor_total)}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* ===== TAB SERVICOS MAIS REALIZADOS ===== */}
          <TabsContent value="servicos" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Ranking de Serviços Mais Realizados
              </h3>
              <Button variant="outline" onClick={() => exportarRelatorio('servicos')}>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
            </div>

            {loadingServicos ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Top 3 */}
                <div className="grid gap-4 sm:grid-cols-3">
                  {topServicos.slice(0, 3).map((servico, i) => (
                    <Card key={i} className={i === 0 ? 'border-yellow-300 bg-yellow-50' : ''}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-orange-400'}`}>
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{servico.nome}</div>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-sm">{servico.quantidade_total} realizados</span>
                              <span className="font-bold">{formatCurrency(servico.valor_total)}</span>
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
                    <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60px]">#</TableHead>
                          <TableHead>Serviço</TableHead>
                          <TableHead className="text-center">Qtd Realizada</TableHead>
                          <TableHead className="text-right">Faturamento</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topServicos.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                              Nenhum serviço realizado no período
                            </TableCell>
                          </TableRow>
                        ) : (
                          topServicos.map((servico, i) => (
                            <TableRow key={servico.servico_id}>
                              <TableCell>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-muted text-muted-foreground'}`}>
                                  {i + 1}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{servico.nome}</TableCell>
                              <TableCell className="text-center font-bold">{servico.quantidade_total}</TableCell>
                              <TableCell className="text-right font-bold">{formatCurrency(servico.valor_total)}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* ===== TAB CLIENTES / ANIVERSARIANTES ===== */}
          <TabsContent value="clientes" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Cake className="h-5 w-5 text-pink-500" />
                Aniversariantes do Mês
              </h3>
            </div>

            <Card className="border-pink-200 bg-pink-50">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">
                  Os dados de aniversariantes estão disponíveis no Dashboard.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
