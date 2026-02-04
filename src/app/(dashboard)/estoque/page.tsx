'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Search,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle,
  History,
  DollarSign,
  Filter,
  FileDown,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Produto, MovimentacaoEstoque } from '@/types/database'
import { produtosService } from '@/services/produtos.service'
import { estoqueService } from '@/services/estoque.service'

// Tipos
type TipoMovimentacao = 'entrada' | 'saida'

function EstoqueContent() {
  const searchParams = useSearchParams()
  const produtoIdFiltro = searchParams.get('produto')

  const [produtos, setProdutos] = useState<Produto[]>([])
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([])
  const [busca, setBusca] = useState('')
  const [filtroEstoque, setFiltroEstoque] = useState<string>('todos')
  const [filtroTipoMov, setFiltroTipoMov] = useState<string>('todos')
  const [isLoading, setIsLoading] = useState(true)

  // Dialog de movimentação
  const [dialogOpen, setDialogOpen] = useState(false)
  const [movTipo, setMovTipo] = useState<TipoMovimentacao>('entrada')
  const [movProdutoId, setMovProdutoId] = useState('')
  const [movQuantidade, setMovQuantidade] = useState('')
  const [movMotivo, setMovMotivo] = useState<string>('')
  const [movObservacao, setMovObservacao] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Carregar dados do Supabase
  useEffect(() => {
    const carregarDados = async () => {
      setIsLoading(true)
      try {
        const [produtosRes, movRes] = await Promise.all([
          produtosService.listar(),
          estoqueService.listarMovimentacoes(),
        ])

        if (produtosRes.data) setProdutos(produtosRes.data)
        if (movRes.data) setMovimentacoes(movRes.data)

        if (produtosRes.error) toast.error('Erro ao carregar produtos: ' + produtosRes.error)
        if (movRes.error) toast.error('Erro ao carregar movimentacoes: ' + movRes.error)
      } catch {
        toast.error('Erro ao carregar dados')
      } finally {
        setIsLoading(false)
      }
    }
    carregarDados()
  }, [])

  // Filtrar produtos
  const produtosFiltrados = produtos.filter(produto => {
    const matchBusca = produto.nome.toLowerCase().includes(busca.toLowerCase()) ||
                       (produto.codigo && produto.codigo.includes(busca))
    const matchEstoque = filtroEstoque === 'todos' ||
      (filtroEstoque === 'baixo' && produto.estoque_atual <= produto.estoque_minimo && produto.estoque_atual > 0) ||
      (filtroEstoque === 'zerado' && produto.estoque_atual === 0) ||
      (filtroEstoque === 'ok' && produto.estoque_atual > produto.estoque_minimo)
    const matchProduto = !produtoIdFiltro || produto.id === produtoIdFiltro
    return matchBusca && matchEstoque && matchProduto
  })

  // Filtrar movimentações
  const movimentacoesFiltradas = movimentacoes
    .filter(mov => {
      const matchTipo = filtroTipoMov === 'todos' || mov.tipo === filtroTipoMov
      const matchProduto = !produtoIdFiltro || mov.produto_id === produtoIdFiltro
      return matchTipo && matchProduto
    })

  // Estatísticas
  const totalProdutos = produtos.length
  const produtosEstoqueBaixo = produtos.filter(p => p.estoque_atual <= p.estoque_minimo && p.estoque_atual > 0).length
  const produtosSemEstoque = produtos.filter(p => p.estoque_atual === 0).length
  const valorTotalEstoque = produtos.reduce((acc, p) => acc + (p.custo * p.estoque_atual), 0)
  const valorVendaEstoque = produtos.reduce((acc, p) => acc + (p.preco_venda * p.estoque_atual), 0)

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Formatar data
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  // Abrir dialog de movimentação
  const abrirMovimentacao = (tipo: TipoMovimentacao, produtoId?: string) => {
    setMovTipo(tipo)
    setMovProdutoId(produtoId || '')
    setMovQuantidade('')
    setMovMotivo('')
    setMovObservacao('')
    setDialogOpen(true)
  }

  // Salvar movimentação
  const handleSalvarMovimentacao = async () => {
    if (!movProdutoId) {
      toast.error('Selecione um produto')
      return
    }
    if (!movQuantidade || parseInt(movQuantidade) <= 0) {
      toast.error('Informe a quantidade')
      return
    }
    if (!movMotivo) {
      toast.error('Selecione o motivo')
      return
    }

    const produto = produtos.find(p => p.id === movProdutoId)
    if (!produto) return

    const quantidade = parseInt(movQuantidade)

    // Validar saida
    if (movTipo === 'saida' && quantidade > produto.estoque_atual) {
      toast.error('Quantidade maior que o estoque disponível')
      return
    }

    setIsSaving(true)

    try {
      const { data: movCriada, error } = await estoqueService.registrarMovimentacao({
        produto_id: movProdutoId,
        tipo: movTipo,
        quantidade,
        motivo: movMotivo,
        observacoes: movObservacao || undefined,
      })

      if (error) {
        toast.error('Erro ao registrar movimentacao: ' + error)
        return
      }

      // Atualizar estoque local
      const novoEstoque = movTipo === 'entrada'
        ? produto.estoque_atual + quantidade
        : produto.estoque_atual - quantidade

      setProdutos(produtos.map(p =>
        p.id === movProdutoId ? { ...p, estoque_atual: novoEstoque } : p
      ))

      // Adicionar movimentação à lista local
      if (movCriada) {
        setMovimentacoes(prev => [{ ...movCriada, produto }, ...prev])
      }

      toast.success(`${movTipo === 'entrada' ? 'Entrada' : 'Saida'} registrada com sucesso!`)
      setDialogOpen(false)
    } catch {
      toast.error('Erro ao registrar movimentação')
    } finally {
      setIsSaving(false)
    }
  }

  // Exportar relatório
  const exportarRelatorio = () => {
    const headers = ['Código', 'Produto', 'Categoria', 'Estoque Atual', 'Estoque Mínimo', 'Custo Unit.', 'Valor Total']
    const rows = produtos.map(p => [
      p.codigo || '',
      p.nome,
      p.categoria?.nome || '',
      p.estoque_atual,
      p.estoque_minimo,
      p.custo.toFixed(2),
      (p.custo * p.estoque_atual).toFixed(2),
    ])

    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `estoque_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    toast.success('Relatório exportado!')
  }

  // Badge de status do estoque
  const getStatusBadge = (atual: number, minimo: number) => {
    if (atual === 0) {
      return <Badge variant="destructive">Sem estoque</Badge>
    }
    if (atual <= minimo) {
      return <Badge className="bg-orange-100 text-orange-700">Estoque baixo</Badge>
    }
    return <Badge variant="secondary">OK</Badge>
  }

  // Motivos por tipo
  const motivosEntrada = [
    { value: 'compra', label: 'Compra de fornecedor' },
    { value: 'devolucao', label: 'Devolução de cliente' },
    { value: 'ajuste', label: 'Ajuste de inventario' },
  ]

  const motivosSaida = [
    { value: 'venda', label: 'Venda' },
    { value: 'uso_interno', label: 'Uso interno (OS)' },
    { value: 'perda', label: 'Perda/Avaria' },
    { value: 'ajuste', label: 'Ajuste de inventario' },
  ]

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-6 p-4 lg:p-6">
        {/* Ações */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <Button onClick={() => abrirMovimentacao('entrada')} className="bg-green-600 hover:bg-green-700">
              <ArrowUpCircle className="mr-2 h-4 w-4" />
              Entrada
            </Button>
            <Button onClick={() => abrirMovimentacao('saida')} variant="destructive">
              <ArrowDownCircle className="mr-2 h-4 w-4" />
              Saida
            </Button>
          </div>
          <Button variant="outline" onClick={exportarRelatorio}>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" data-tutorial="estoque-alertas">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4" />
                Total Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProdutos}</div>
            </CardContent>
          </Card>

          <Card className={produtosSemEstoque > 0 ? 'border-red-200 bg-red-50' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                Sem Estoque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${produtosSemEstoque > 0 ? 'text-red-600' : ''}`}>
                {produtosSemEstoque}
              </div>
            </CardContent>
          </Card>

          <Card className={produtosEstoqueBaixo > 0 ? 'border-orange-200 bg-orange-50' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-orange-600" />
                Estoque Baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${produtosEstoqueBaixo > 0 ? 'text-orange-600' : ''}`}>
                {produtosEstoqueBaixo}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Valor em Estoque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(valorTotalEstoque)}</div>
              <p className="text-xs text-muted-foreground">custo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Potencial Venda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(valorVendaEstoque)}</div>
              <p className="text-xs text-muted-foreground">preço de venda</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerta de produtos críticos */}
        {(produtosSemEstoque > 0 || produtosEstoqueBaixo > 0) && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Atenção!</span>
                <span>
                  {produtosSemEstoque > 0 && `${produtosSemEstoque} produto(s) sem estoque`}
                  {produtosSemEstoque > 0 && produtosEstoqueBaixo > 0 && ' e '}
                  {produtosEstoqueBaixo > 0 && `${produtosEstoqueBaixo} com estoque baixo`}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="produtos">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="produtos">
              <Package className="mr-2 h-4 w-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="movimentacoes">
              <History className="mr-2 h-4 w-4" />
              Movimentações
            </TabsTrigger>
          </TabsList>

          {/* Tab Produtos */}
          <TabsContent value="produtos" className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou código..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filtroEstoque} onValueChange={setFiltroEstoque}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ok">Estoque OK</SelectItem>
                  <SelectItem value="baixo">Estoque Baixo</SelectItem>
                  <SelectItem value="zerado">Sem Estoque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-center">Estoque</TableHead>
                      <TableHead className="text-center">Mínimo</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Valor Unit.</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {produtosFiltrados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                          Nenhum produto encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      produtosFiltrados.map((produto) => (
                        <TableRow key={produto.id} className={produto.estoque_atual === 0 ? 'bg-red-50' : produto.estoque_atual <= produto.estoque_minimo ? 'bg-orange-50' : ''}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{produto.nome}</div>
                              <div className="text-xs text-muted-foreground font-mono">
                                {produto.codigo}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{produto.categoria?.nome || ''}</TableCell>
                          <TableCell className="text-center">
                            <span className={`font-bold ${produto.estoque_atual === 0 ? 'text-red-600' : produto.estoque_atual <= produto.estoque_minimo ? 'text-orange-600' : ''}`}>
                              {produto.estoque_atual}
                            </span>
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground">
                            {produto.estoque_minimo}
                          </TableCell>
                          <TableCell className="text-center">
                            {getStatusBadge(produto.estoque_atual, produto.estoque_minimo)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(produto.custo)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(produto.custo * produto.estoque_atual)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-600"
                                onClick={() => abrirMovimentacao('entrada', produto.id)}
                                title="Entrada"
                              >
                                <ArrowUpCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600"
                                onClick={() => abrirMovimentacao('saida', produto.id)}
                                title="Saida"
                                disabled={produto.estoque_atual === 0}
                              >
                                <ArrowDownCircle className="h-4 w-4" />
                              </Button>
                            </div>
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

          {/* Tab Movimentações */}
          <TabsContent value="movimentacoes" className="space-y-4">
            <div className="flex items-center gap-4">
              <Select value={filtroTipoMov} onValueChange={setFiltroTipoMov}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="entrada">Entradas</SelectItem>
                  <SelectItem value="saida">Saidas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-center">Qtd</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Observação</TableHead>
                      <TableHead>Usuário</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movimentacoesFiltradas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          Nenhuma movimentação encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      movimentacoesFiltradas.map((mov) => (
                        <TableRow key={mov.id}>
                          <TableCell className="text-sm">
                            {formatDateTime(mov.created_at)}
                          </TableCell>
                          <TableCell>
                            {mov.tipo === 'entrada' ? (
                              <Badge className="bg-green-100 text-green-700 gap-1">
                                <ArrowUpCircle className="h-3 w-3" />
                                Entrada
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-700 gap-1">
                                <ArrowDownCircle className="h-3 w-3" />
                                Saida
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {mov.produto?.nome || '-'}
                          </TableCell>
                          <TableCell className="text-center font-bold">
                            <span className={mov.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}>
                              {mov.tipo === 'entrada' ? '+' : '-'}{mov.quantidade}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {mov.motivo || '-'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                            {mov.observacoes || '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {mov.usuario?.nome || '-'}
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
        </Tabs>

        {/* Dialog de Movimentação */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {movTipo === 'entrada' ? (
                  <><ArrowUpCircle className="h-5 w-5 text-green-600" /> Entrada de Estoque</>
                ) : (
                  <><ArrowDownCircle className="h-5 w-5 text-red-600" /> Saida de Estoque</>
                )}
              </DialogTitle>
              <DialogDescription>
                Registre a movimentação de estoque
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Produto *</Label>
                <Select value={movProdutoId} onValueChange={setMovProdutoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {produtos
                      .filter(p => movTipo === 'entrada' || p.estoque_atual > 0)
                      .map(produto => (
                        <SelectItem key={produto.id} value={produto.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{produto.nome}</span>
                            <span className="text-muted-foreground ml-2">
                              (Estoque: {produto.estoque_atual})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quantidade *</Label>
                <Input
                  type="number"
                  min="1"
                  max={movTipo === 'saida' && movProdutoId ? produtos.find(p => p.id === movProdutoId)?.estoque_atual : undefined}
                  placeholder="0"
                  value={movQuantidade}
                  onChange={(e) => setMovQuantidade(e.target.value)}
                />
                {movTipo === 'saida' && movProdutoId && (
                  <p className="text-xs text-muted-foreground">
                    Disponível: {produtos.find(p => p.id === movProdutoId)?.estoque_atual} unidades
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Motivo *</Label>
                <Select value={movMotivo} onValueChange={setMovMotivo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {(movTipo === 'entrada' ? motivosEntrada : motivosSaida).map(motivo => (
                      <SelectItem key={motivo.value} value={motivo.value}>
                        {motivo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Observação</Label>
                <Input
                  placeholder="Ex: Nota fiscal 12345"
                  value={movObservacao}
                  onChange={(e) => setMovObservacao(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSalvarMovimentacao}
                disabled={isSaving}
                className={movTipo === 'entrada' ? 'bg-green-600 hover:bg-green-700' : ''}
                variant={movTipo === 'saida' ? 'destructive' : 'default'}
              >
                {isSaving ? 'Salvando...' : 'Confirmar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default function EstoquePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-muted-foreground">Carregando...</div>
        </div>
      </div>
    }>
      <EstoqueContent />
    </Suspense>
  )
}
