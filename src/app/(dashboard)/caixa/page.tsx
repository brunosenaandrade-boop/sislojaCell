'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
  Lock,
  Unlock,
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
  History,
  AlertTriangle,
  CheckCircle,
  Receipt,
  Wallet,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { caixaService } from '@/services/caixa.service'
import type { Caixa, MovimentacaoCaixa } from '@/types/database'

type TipoMovimentacao = 'suprimento' | 'sangria'

export default function CaixaPage() {
  // State for real data
  const [caixaAberto, setCaixaAberto] = useState<Caixa | null>(null)
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoCaixa[]>([])
  const [historicoCaixas, setHistoricoCaixas] = useState<Caixa[]>([])
  const [isLoadingPage, setIsLoadingPage] = useState(true)

  // Dialogs
  const [dialogAbrirOpen, setDialogAbrirOpen] = useState(false)
  const [dialogFecharOpen, setDialogFecharOpen] = useState(false)
  const [dialogMovOpen, setDialogMovOpen] = useState(false)
  const [movTipo, setMovTipo] = useState<TipoMovimentacao>('suprimento')

  // Form abertura
  const [formValorAbertura, setFormValorAbertura] = useState('')

  // Form movimentacao
  const [movValor, setMovValor] = useState('')
  const [movDescricao, setMovDescricao] = useState('')

  // Form fechamento
  const [valorContado, setValorContado] = useState('')

  const [isLoading, setIsLoading] = useState(false)

  // Derived state
  const statusCaixa = caixaAberto ? 'aberto' : 'fechado'
  const valorAbertura = caixaAberto?.valor_abertura ?? 0
  const horaAbertura = caixaAberto?.data_abertura ?? ''

  // Calculate totals from movimentacoes
  const totalVendas = movimentacoes.filter(m => m.tipo === 'venda').reduce((acc, m) => acc + m.valor, 0)
  const totalOS = movimentacoes.filter(m => m.tipo === 'os').reduce((acc, m) => acc + m.valor, 0)
  const totalSangrias = movimentacoes.filter(m => m.tipo === 'sangria').reduce((acc, m) => acc + Math.abs(m.valor), 0)
  const totalSuprimentos = movimentacoes.filter(m => m.tipo === 'suprimento').reduce((acc, m) => acc + m.valor, 0)
  const totalEntradas = totalVendas + totalOS + totalSuprimentos
  const totalSaidas = totalSangrias
  const saldoAtual = valorAbertura + totalEntradas - totalSaidas
  const totalCusto = 0 // Not tracked per-movement
  const lucroLiquido = totalVendas + totalOS - totalCusto
  const qtdVendas = movimentacoes.filter(m => m.tipo === 'venda').length
  const qtdOS = movimentacoes.filter(m => m.tipo === 'os').length

  // Lucro de ontem para comparacao
  const lucroOntem = historicoCaixas.length > 0 ? (historicoCaixas[0].total_vendas + historicoCaixas[0].total_os) : 0
  const diferencaLucro = lucroLiquido - lucroOntem

  // Fetch data
  const fetchCaixa = useCallback(async () => {
    try {
      const { data, error } = await caixaService.buscarAberto()
      if (error) {
        toast.error('Erro ao buscar caixa: ' + error)
        return
      }
      setCaixaAberto(data)

      if (data) {
        const movRes = await caixaService.listarMovimentacoes(data.id)
        if (movRes.error) toast.error('Erro ao carregar movimentações: ' + movRes.error)
        setMovimentacoes(movRes.data)
      } else {
        setMovimentacoes([])
      }
    } catch {
      toast.error('Erro ao carregar caixa')
    }
  }, [])

  const fetchHistorico = useCallback(async () => {
    try {
      const { data, error } = await caixaService.listarHistorico(10)
      if (error) toast.error('Erro ao carregar histórico: ' + error)
      setHistoricoCaixas(data)
    } catch {
      toast.error('Erro ao carregar histórico')
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      setIsLoadingPage(true)
      await Promise.all([fetchCaixa(), fetchHistorico()])
      setIsLoadingPage(false)
    }
    load()
  }, [fetchCaixa, fetchHistorico])

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  // Abrir caixa
  const handleAbrirCaixa = async () => {
    // Limpa formatação BR (troca vírgula por ponto) antes de parsear
    const valorLimpo = formValorAbertura.replace(',', '.')
    const valor = parseFloat(valorLimpo)
    if (isNaN(valor) || valor < 0) {
      toast.error('Informe um valor válido para abertura (ex: 100 ou 200.00)')
      return
    }
    setIsLoading(true)
    try {
      const { data, error } = await caixaService.abrir(valor)
      if (error) {
        toast.error('Erro ao abrir caixa: ' + error)
        return
      }
      setCaixaAberto(data)
      setMovimentacoes([])
      toast.success('Caixa aberto com sucesso!')
      setDialogAbrirOpen(false)
      setFormValorAbertura('')
    } catch {
      toast.error('Erro ao abrir caixa')
    } finally {
      setIsLoading(false)
    }
  }

  // Registrar movimentacao (suprimento/sangria)
  const handleRegistrarMovimentacao = async () => {
    const valor = parseFloat(movValor.replace(',', '.'))
    if (isNaN(valor) || valor <= 0) {
      toast.error('Informe um valor válido')
      return
    }
    if (!movDescricao.trim()) {
      toast.error('Informe a descrição')
      return
    }
    if (movTipo === 'sangria' && valor > saldoAtual) {
      toast.error('Valor maior que o saldo em caixa')
      return
    }
    if (!caixaAberto) return

    setIsLoading(true)
    try {
      const { data, error } = await caixaService.adicionarMovimentacao({
        caixa_id: caixaAberto.id,
        tipo: movTipo,
        valor: movTipo === 'sangria' ? -valor : valor,
        descricao: `${movTipo === 'sangria' ? 'Sangria' : 'Suprimento'} - ${movDescricao}`,
      })
      if (error) {
        toast.error('Erro ao registrar movimentação: ' + error)
        return
      }
      if (data) {
        setMovimentacoes(prev => [...prev, data])
      }
      toast.success(`${movTipo === 'sangria' ? 'Sangria' : 'Suprimento'} registrado!`)
      setDialogMovOpen(false)
      setMovValor('')
      setMovDescricao('')
    } catch {
      toast.error('Erro ao registrar movimentação')
    } finally {
      setIsLoading(false)
    }
  }

  // Fechar caixa
  const handleFecharCaixa = async () => {
    const contado = parseFloat(valorContado.replace(',', '.'))
    if (isNaN(contado) || contado < 0) {
      toast.error('Informe o valor contado no caixa')
      return
    }
    if (!caixaAberto) return

    setIsLoading(true)
    try {
      const totalEsperado = saldoAtual
      const diferenca = contado - totalEsperado

      const { error } = await caixaService.fechar(caixaAberto.id, contado, {
        total_vendas: totalVendas,
        total_os: totalOS,
        total_entradas: totalEntradas,
        total_saidas: totalSaidas,
        total_esperado: totalEsperado,
        diferenca,
      })

      if (error) {
        toast.error('Erro ao fechar caixa: ' + error)
        return
      }

      if (Math.abs(diferenca) > 0.01) {
        toast.warning(`Diferenca de ${formatCurrency(diferenca)} no fechamento`)
      } else {
        toast.success('Caixa fechado sem diferenca!')
      }
      setCaixaAberto(null)
      setMovimentacoes([])
      setDialogFecharOpen(false)
      setValorContado('')
      await fetchHistorico()
    } catch {
      toast.error('Erro ao fechar caixa')
    } finally {
      setIsLoading(false)
    }
  }

  // Abrir dialog de movimentacao
  const abrirDialogMovimentacao = (tipo: TipoMovimentacao) => {
    setMovTipo(tipo)
    setMovValor('')
    setMovDescricao('')
    setDialogMovOpen(true)
  }

  // Badge do tipo de movimentacao
  const getTipoBadge = (tipo: string) => {
    const config: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      abertura: { label: 'Abertura', className: 'bg-violet-100 text-violet-700', icon: <Unlock className="h-3 w-3" /> },
      venda: { label: 'Venda', className: 'bg-green-100 text-green-700', icon: <ArrowUpCircle className="h-3 w-3" /> },
      os: { label: 'OS', className: 'bg-purple-100 text-purple-700', icon: <ArrowUpCircle className="h-3 w-3" /> },
      suprimento: { label: 'Suprimento', className: 'bg-violet-100 text-violet-700', icon: <ArrowUpCircle className="h-3 w-3" /> },
      sangria: { label: 'Sangria', className: 'bg-red-100 text-red-700', icon: <ArrowDownCircle className="h-3 w-3" /> },
    }
    const c = config[tipo] || { label: tipo, className: '', icon: null }
    return (
      <Badge className={`${c.className} gap-1`}>
        {c.icon}
        {c.label}
      </Badge>
    )
  }

  // Badge forma de pagamento
  const getFormaPagamentoIcon = (forma?: string) => {
    if (!forma) return null
    const config: Record<string, { label: string; icon: React.ReactNode }> = {
      dinheiro: { label: 'Dinheiro', icon: <Banknote className="h-3 w-3" /> },
      pix: { label: 'PIX', icon: <Smartphone className="h-3 w-3" /> },
      debito: { label: 'Debito', icon: <CreditCard className="h-3 w-3" /> },
      credito: { label: 'Credito', icon: <CreditCard className="h-3 w-3" /> },
    }
    const c = config[forma]
    if (!c) return null
    return (
      <Badge variant="outline" className="gap-1">
        {c.icon}
        {c.label}
      </Badge>
    )
  }

  if (isLoadingPage) {
    return (
      <div className="flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col" data-tutorial="caixa-status">
      <div className="flex-1 space-y-6 p-4 lg:p-6">
        {/* Status e Ações do Caixa */}
        <Card className={statusCaixa === 'aberto' ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : 'border-red-200 bg-red-50 dark:bg-red-950/20'}>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${statusCaixa === 'aberto' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {statusCaixa === 'aberto' ? (
                    <Unlock className="h-6 w-6 text-green-600" />
                  ) : (
                    <Lock className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${statusCaixa === 'aberto' ? 'text-green-700' : 'text-red-700'}`}>
                    Caixa {statusCaixa === 'aberto' ? 'Aberto' : 'Fechado'}
                  </h2>
                  {statusCaixa === 'aberto' && (
                    <p className="text-sm text-muted-foreground">
                      Aberto em {formatDateTime(horaAbertura)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {statusCaixa === 'fechado' ? (
                  <Button onClick={() => setDialogAbrirOpen(true)} className="bg-green-600 hover:bg-green-700">
                    <Unlock className="mr-2 h-4 w-4" />
                    Abrir Caixa
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => abrirDialogMovimentacao('suprimento')}>
                      <ArrowUpCircle className="mr-2 h-4 w-4 text-violet-600" />
                      Suprimento
                    </Button>
                    <Button variant="outline" onClick={() => abrirDialogMovimentacao('sangria')}>
                      <ArrowDownCircle className="mr-2 h-4 w-4 text-red-600" />
                      Sangria
                    </Button>
                    <Button variant="destructive" onClick={() => setDialogFecharOpen(true)}>
                      <Lock className="mr-2 h-4 w-4" />
                      Fechar Caixa
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {statusCaixa === 'aberto' && (
          <>
            {/* Cards de Resumo - 5 colunas incluindo Lucro Líquido */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Saldo Atual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-violet-600">{formatCurrency(saldoAtual)}</div>
                  <p className="text-xs text-muted-foreground">Abertura: {formatCurrency(valorAbertura)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Vendas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalVendas)}</div>
                  <p className="text-xs text-muted-foreground">{qtdVendas} vendas realizadas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Ordens de Serviço
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalOS)}</div>
                  <p className="text-xs text-muted-foreground">{qtdOS} OS finalizadas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    Sangrias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{formatCurrency(totalSangrias)}</div>
                  <p className="text-xs text-muted-foreground">Suprimentos: {formatCurrency(totalSuprimentos)}</p>
                </CardContent>
              </Card>

              {/* NOVO: Card de Lucro Líquido */}
              <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Lucro Líquido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(lucroLiquido)}</div>
                  <p className="text-xs text-muted-foreground">
                    Custo: {formatCurrency(totalCusto)}
                  </p>
                  {historicoCaixas.length > 0 && (
                    <div className="flex items-center gap-1 mt-1 text-xs">
                      {diferencaLucro >= 0 ? (
                        <>
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <span className="text-green-600">+{formatCurrency(diferencaLucro)} vs ontem</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-3 w-3 text-red-600" />
                          <span className="text-red-600">{formatCurrency(diferencaLucro)} vs ontem</span>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Resumo por Forma de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resumo por Forma de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                  {(() => {
                    // Calcular totais por forma de pagamento das vendas
                    const totais: Record<string, number> = { dinheiro: 0, pix: 0, debito: 0, credito: 0 }
                    movimentacoes
                      .filter(m => m.tipo === 'venda' && m.valor > 0)
                      .forEach(m => {
                        const forma = (m as unknown as { venda?: { forma_pagamento?: string } }).venda?.forma_pagamento || 'dinheiro'
                        if (forma in totais) totais[forma] += m.valor
                        else totais.dinheiro += m.valor
                      })

                    const formas = [
                      { key: 'dinheiro', label: 'Dinheiro', icon: <Banknote className="h-5 w-5 text-green-600" />, bg: 'bg-green-100' },
                      { key: 'pix', label: 'PIX', icon: <Smartphone className="h-5 w-5 text-violet-600" />, bg: 'bg-violet-100' },
                      { key: 'debito', label: 'Debito', icon: <CreditCard className="h-5 w-5 text-purple-600" />, bg: 'bg-purple-100' },
                      { key: 'credito', label: 'Credito', icon: <CreditCard className="h-5 w-5 text-orange-600" />, bg: 'bg-orange-100' },
                    ]

                    return formas.map(f => (
                      <div key={f.key} className="flex items-center gap-3 rounded-lg border p-3">
                        <div className={`w-10 h-10 rounded ${f.bg} flex items-center justify-center`}>
                          {f.icon}
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">{f.label}</div>
                          <div className="font-bold">{formatCurrency(totais[f.key])}</div>
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Tabs */}
        <Tabs defaultValue="movimentacoes">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="movimentacoes">
              <Clock className="mr-2 h-4 w-4" />
              Movimentações do Dia
            </TabsTrigger>
            <TabsTrigger value="historico">
              <History className="mr-2 h-4 w-4" />
              Histórico de Caixas
            </TabsTrigger>
          </TabsList>

          {/* Tab Movimentações do Dia */}
          <TabsContent value="movimentacoes" data-tutorial="caixa-movimentacoes">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hora</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movimentacoes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          Nenhuma movimentação registrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      [...movimentacoes]
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .map((mov) => (
                          <TableRow key={mov.id}>
                            <TableCell className="font-mono text-sm">
                              {formatTime(mov.created_at)}
                            </TableCell>
                            <TableCell>{getTipoBadge(mov.tipo)}</TableCell>
                            <TableCell className="max-w-[250px] truncate">
                              {mov.descricao || '-'}
                            </TableCell>
                            <TableCell>
                              <span className="text-muted-foreground">-</span>
                            </TableCell>
                            <TableCell className="text-sm">{mov.usuario_id || '-'}</TableCell>
                            <TableCell className="text-right font-bold">
                              <span className={mov.valor >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {mov.valor >= 0 ? '+' : ''}{formatCurrency(mov.valor)}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Histórico de Caixas */}
          <TabsContent value="historico">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Horario</TableHead>
                      <TableHead className="text-right">Abertura</TableHead>
                      <TableHead className="text-right">Vendas</TableHead>
                      <TableHead className="text-right">OS</TableHead>
                      <TableHead className="text-right">Sangrias</TableHead>
                      <TableHead className="text-right">Lucro</TableHead>
                      <TableHead className="text-right">Fechamento</TableHead>
                      <TableHead>Usuario</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historicoCaixas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                          Nenhum histórico de caixa.
                        </TableCell>
                      </TableRow>
                    ) : (
                      historicoCaixas.map((caixa) => (
                        <TableRow key={caixa.id}>
                          <TableCell className="font-medium">
                            {formatDate(caixa.data_abertura)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatTime(caixa.data_abertura)} - {caixa.data_fechamento ? formatTime(caixa.data_fechamento) : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(caixa.valor_abertura)}
                          </TableCell>
                          <TableCell className="text-right text-green-600 font-medium">
                            {formatCurrency(caixa.total_vendas)}
                          </TableCell>
                          <TableCell className="text-right text-purple-600 font-medium">
                            {formatCurrency(caixa.total_os)}
                          </TableCell>
                          <TableCell className="text-right text-red-600">
                            -{formatCurrency(caixa.total_saidas)}
                          </TableCell>
                          <TableCell className="text-right text-green-600 font-bold">
                            {formatCurrency(caixa.total_vendas + caixa.total_os)}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(caixa.valor_fechamento ?? 0)}
                          </TableCell>
                          <TableCell className="text-sm">{caixa.usuario_fechamento_id || '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog Abrir Caixa */}
        <Dialog open={dialogAbrirOpen} onOpenChange={setDialogAbrirOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Unlock className="h-5 w-5 text-green-600" />
                Abrir Caixa
              </DialogTitle>
              <DialogDescription>
                Informe o valor inicial do caixa (troco)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Valor de Abertura (R$)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formValorAbertura}
                    onChange={(e) => setFormValorAbertura(e.target.value)}
                    className="pl-10 text-lg"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Valor em dinheiro disponível para troco. Use ponto como decimal (ex: 200.00)
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogAbrirOpen(false)}>Cancelar</Button>
              <Button onClick={handleAbrirCaixa} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                {isLoading ? 'Abrindo...' : 'Abrir Caixa'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Suprimento/Sangria */}
        <Dialog open={dialogMovOpen} onOpenChange={setDialogMovOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {movTipo === 'suprimento' ? (
                  <><ArrowUpCircle className="h-5 w-5 text-violet-600" /> Suprimento</>
                ) : (
                  <><ArrowDownCircle className="h-5 w-5 text-red-600" /> Sangria</>
                )}
              </DialogTitle>
              <DialogDescription>
                {movTipo === 'suprimento'
                  ? 'Adicionar dinheiro ao caixa (troco, deposito)'
                  : 'Retirar dinheiro do caixa (pagamento, despesa)'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Valor (R$) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={movValor}
                    onChange={(e) => setMovValor(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {movTipo === 'sangria' && (
                  <p className="text-xs text-muted-foreground">
                    Saldo disponível: {formatCurrency(saldoAtual)}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Descrição *</Label>
                <Input
                  placeholder={movTipo === 'suprimento' ? 'Ex: Troco adicional' : 'Ex: Pagamento fornecedor'}
                  value={movDescricao}
                  onChange={(e) => setMovDescricao(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogMovOpen(false)}>Cancelar</Button>
              <Button
                onClick={handleRegistrarMovimentacao}
                disabled={isLoading}
                variant={movTipo === 'sangria' ? 'destructive' : 'default'}
                className={movTipo === 'suprimento' ? 'bg-violet-600 hover:bg-violet-700' : ''}
              >
                {isLoading ? 'Salvando...' : 'Confirmar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Fechar Caixa */}
        <Dialog open={dialogFecharOpen} onOpenChange={setDialogFecharOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-red-600" />
                Fechar Caixa
              </DialogTitle>
              <DialogDescription>
                Confira os valores e informe o total contado
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Resumo */}
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valor de Abertura</span>
                  <span>{formatCurrency(valorAbertura)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Vendas</span>
                  <span className="text-green-600">+{formatCurrency(totalVendas)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total OS</span>
                  <span className="text-green-600">+{formatCurrency(totalOS)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Suprimentos</span>
                  <span className="text-violet-600">+{formatCurrency(totalSuprimentos)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sangrias</span>
                  <span className="text-red-600">-{formatCurrency(totalSangrias)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Custo dos Produtos</span>
                  <span className="text-orange-600">-{formatCurrency(totalCusto)}</span>
                </div>
                <div className="flex justify-between font-bold text-green-600">
                  <span>Lucro Líquido</span>
                  <span>{formatCurrency(lucroLiquido)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Saldo Esperado</span>
                  <span className="text-violet-600">{formatCurrency(saldoAtual)}</span>
                </div>
              </div>

              {/* Valor contado */}
              <div className="space-y-2">
                <Label>Valor Contado no Caixa (R$) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={valorContado}
                    onChange={(e) => setValorContado(e.target.value)}
                    className="pl-10 text-lg"
                  />
                </div>
              </div>

              {/* Diferenca */}
              {valorContado && (
                <div className="rounded-lg border p-3">
                  {(() => {
                    const contado = parseFloat(valorContado) || 0
                    const diferenca = contado - saldoAtual
                    if (Math.abs(diferenca) < 0.01) {
                      return (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-medium">Caixa conferido! Sem diferenca.</span>
                        </div>
                      )
                    }
                    return (
                      <div className="flex items-center gap-2 text-orange-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span>
                          Diferenca de <strong>{formatCurrency(diferenca)}</strong>
                          {diferenca > 0 ? ' (sobra)' : ' (falta)'}
                        </span>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogFecharOpen(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleFecharCaixa} disabled={isLoading}>
                {isLoading ? 'Fechando...' : 'Confirmar Fechamento'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
