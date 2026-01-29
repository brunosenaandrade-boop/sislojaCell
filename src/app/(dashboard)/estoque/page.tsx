'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
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
} from 'lucide-react'
import { toast } from 'sonner'

// Tipos
type TipoMovimentação = 'entrada' | 'saida'
type MotivoMovimentação = 'compra' | 'venda' | 'ajuste' | 'perda' | 'uso_interno' | 'devolução'

// Produtos mockados
const produtosMock = [
  { id: '1', código: '001', nome: 'Carregador USB-C Turbo 20W', categoria: 'Carregadores', custo: 25.00, preço_venda: 49.90, estoque_atual: 15, estoque_mínimo: 5 },
  { id: '2', código: '002', nome: 'Cabo Lightning 1m', categoria: 'Cabos', custo: 8.00, preço_venda: 25.00, estoque_atual: 3, estoque_mínimo: 10 },
  { id: '3', código: '003', nome: 'Película Galaxy S23', categoria: 'Películas', custo: 5.00, preço_venda: 20.00, estoque_atual: 0, estoque_mínimo: 5 },
  { id: '4', código: '004', nome: 'Capa iPhone 14 Silicone', categoria: 'Capas', custo: 12.00, preço_venda: 35.00, estoque_atual: 8, estoque_mínimo: 5 },
  { id: '5', código: '005', nome: 'Fone Bluetooth TWS', categoria: 'Fones', custo: 35.00, preço_venda: 89.90, estoque_atual: 2, estoque_mínimo: 3 },
  { id: '6', código: '006', nome: 'Power Bank 10000mAh', categoria: 'Power Banks', custo: 45.00, preço_venda: 99.90, estoque_atual: 6, estoque_mínimo: 3 },
  { id: '7', código: '007', nome: 'Tela iPhone 11', categoria: 'Peças', custo: 120.00, preço_venda: 250.00, estoque_atual: 4, estoque_mínimo: 2 },
  { id: '8', código: '008', nome: 'Bateria Samsung S21', categoria: 'Peças', custo: 60.00, preço_venda: 150.00, estoque_atual: 1, estoque_mínimo: 3 },
]

// Movimentações mockadas
const movimentaçõesMock = [
  { id: '1', produto_id: '1', produto_nome: 'Carregador USB-C Turbo 20W', tipo: 'entrada' as TipoMovimentação, quantidade: 20, motivo: 'compra' as MotivoMovimentação, observação: 'Compra fornecedor ABC', usuário: 'Admin', data: '2024-01-27T10:30:00' },
  { id: '2', produto_id: '1', produto_nome: 'Carregador USB-C Turbo 20W', tipo: 'saida' as TipoMovimentação, quantidade: 5, motivo: 'venda' as MotivoMovimentação, observação: 'Venda V001', usuário: 'Admin', data: '2024-01-27T14:20:00' },
  { id: '3', produto_id: '2', produto_nome: 'Cabo Lightning 1m', tipo: 'saida' as TipoMovimentação, quantidade: 2, motivo: 'venda' as MotivoMovimentação, observação: 'Venda V002', usuário: 'Funcionário', data: '2024-01-27T15:45:00' },
  { id: '4', produto_id: '3', produto_nome: 'Película Galaxy S23', tipo: 'saida' as TipoMovimentação, quantidade: 5, motivo: 'perda' as MotivoMovimentação, observação: 'Produtos danificados', usuário: 'Admin', data: '2024-01-26T09:00:00' },
  { id: '5', produto_id: '5', produto_nome: 'Fone Bluetooth TWS', tipo: 'entrada' as TipoMovimentação, quantidade: 10, motivo: 'compra' as MotivoMovimentação, observação: 'Reposição mensal', usuário: 'Admin', data: '2024-01-25T11:30:00' },
  { id: '6', produto_id: '7', produto_nome: 'Tela iPhone 11', tipo: 'saida' as TipoMovimentação, quantidade: 1, motivo: 'uso_interno' as MotivoMovimentação, observação: 'OS #OS001', usuário: 'Funcionário', data: '2024-01-25T16:00:00' },
]

function EstoqueContent() {
  const searchParams = useSearchParams()
  const produtoIdFiltro = searchParams.get('produto')

  const [produtos, setProdutos] = useState(produtosMock)
  const [movimentações, setMovimentações] = useState(movimentaçõesMock)
  const [busca, setBusca] = useState('')
  const [filtroEstoque, setFiltroEstoque] = useState<string>('todos')
  const [filtroTipoMov, setFiltroTipoMov] = useState<string>('todos')

  // Dialog de movimentação
  const [dialogOpen, setDialogOpen] = useState(false)
  const [movTipo, setMovTipo] = useState<TipoMovimentação>('entrada')
  const [movProdutoId, setMovProdutoId] = useState('')
  const [movQuantidade, setMovQuantidade] = useState('')
  const [movMotivo, setMovMotivo] = useState<string>('')
  const [movObservação, setMovObservação] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Filtrar produtos
  const produtosFiltrados = produtos.filter(produto => {
    const matchBusca = produto.nome.toLowerCase().includes(busca.toLowerCase()) ||
                       produto.código.includes(busca)
    const matchEstoque = filtroEstoque === 'todos' ||
      (filtroEstoque === 'baixo' && produto.estoque_atual <= produto.estoque_mínimo && produto.estoque_atual > 0) ||
      (filtroEstoque === 'zerado' && produto.estoque_atual === 0) ||
      (filtroEstoque === 'ok' && produto.estoque_atual > produto.estoque_mínimo)
    const matchProduto = !produtoIdFiltro || produto.id === produtoIdFiltro
    return matchBusca && matchEstoque && matchProduto
  })

  // Filtrar movimentações
  const movimentaçõesFiltradas = movimentações
    .filter(mov => {
      const matchTipo = filtroTipoMov === 'todos' || mov.tipo === filtroTipoMov
      const matchProduto = !produtoIdFiltro || mov.produto_id === produtoIdFiltro
      return matchTipo && matchProduto
    })
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())

  // Estatísticas
  const totalProdutos = produtos.length
  const produtosEstoqueBaixo = produtos.filter(p => p.estoque_atual <= p.estoque_mínimo && p.estoque_atual > 0).length
  const produtosSemEstoque = produtos.filter(p => p.estoque_atual === 0).length
  const valorTotalEstoque = produtos.reduce((acc, p) => acc + (p.custo * p.estoque_atual), 0)
  const valorVendaEstoque = produtos.reduce((acc, p) => acc + (p.preço_venda * p.estoque_atual), 0)

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
  const abrirMovimentação = (tipo: TipoMovimentação, produtoId?: string) => {
    setMovTipo(tipo)
    setMovProdutoId(produtoId || '')
    setMovQuantidade('')
    setMovMotivo('')
    setMovObservação('')
    setDialogOpen(true)
  }

  // Salvar movimentação
  const handleSalvarMovimentação = async () => {
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

    setIsLoading(true)

    try {
      // Atualizar estoque
      const novoEstoque = movTipo === 'entrada'
        ? produto.estoque_atual + quantidade
        : produto.estoque_atual - quantidade

      setProdutos(produtos.map(p =>
        p.id === movProdutoId ? { ...p, estoque_atual: novoEstoque } : p
      ))

      // Adicionar movimentação
      const novaMovimentação = {
        id: String(Date.now()),
        produto_id: movProdutoId,
        produto_nome: produto.nome,
        tipo: movTipo,
        quantidade,
        motivo: movMotivo as MotivoMovimentação,
        observação: movObservação,
        usuário: 'Admin',
        data: new Date().toISOString(),
      }
      setMovimentações([novaMovimentação, ...movimentações])

      toast.success(`${movTipo === 'entrada' ? 'Entrada' : 'Saida'} registrada com sucesso!`)
      setDialogOpen(false)
    } catch (error) {
      toast.error('Erro ao registrar movimentação')
    } finally {
      setIsLoading(false)
    }
  }

  // Exportar relatório
  const exportarRelatório = () => {
    const headers = ['Código', 'Produto', 'Categoria', 'Estoque Atual', 'Estoque Mínimo', 'Custo Unit.', 'Valor Total']
    const rows = produtos.map(p => [
      p.código,
      p.nome,
      p.categoria,
      p.estoque_atual,
      p.estoque_mínimo,
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
  const getStatusBadge = (atual: number, mínimo: number) => {
    if (atual === 0) {
      return <Badge variant="destructive">Sem estoque</Badge>
    }
    if (atual <= mínimo) {
      return <Badge className="bg-orange-100 text-orange-700">Estoque baixo</Badge>
    }
    return <Badge variant="secondary">OK</Badge>
  }

  // Motivos por tipo
  const motivosEntrada = [
    { value: 'compra', label: 'Compra de fornecedor' },
    { value: 'devolução', label: 'Devolução de cliente' },
    { value: 'ajuste', label: 'Ajuste de inventario' },
  ]

  const motivosSaida = [
    { value: 'venda', label: 'Venda' },
    { value: 'uso_interno', label: 'Uso interno (OS)' },
    { value: 'perda', label: 'Perda/Avaria' },
    { value: 'ajuste', label: 'Ajuste de inventario' },
  ]

  return (
    <div className="flex flex-col">
      <Header title="Controle de Estoque" />

      <div className="flex-1 space-y-6 p-4 lg:p-6">
        {/* Ações */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <Button onClick={() => abrirMovimentação('entrada')} className="bg-green-600 hover:bg-green-700">
              <ArrowUpCircle className="mr-2 h-4 w-4" />
              Entrada
            </Button>
            <Button onClick={() => abrirMovimentação('saida')} variant="destructive">
              <ArrowDownCircle className="mr-2 h-4 w-4" />
              Saida
            </Button>
          </div>
          <Button variant="outline" onClick={exportarRelatório}>
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
            <TabsTrigger value="movimentações">
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
                        <TableRow key={produto.id} className={produto.estoque_atual === 0 ? 'bg-red-50' : produto.estoque_atual <= produto.estoque_mínimo ? 'bg-orange-50' : ''}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{produto.nome}</div>
                              <div className="text-xs text-muted-foreground font-mono">
                                {produto.código}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{produto.categoria}</TableCell>
                          <TableCell className="text-center">
                            <span className={`font-bold ${produto.estoque_atual === 0 ? 'text-red-600' : produto.estoque_atual <= produto.estoque_mínimo ? 'text-orange-600' : ''}`}>
                              {produto.estoque_atual}
                            </span>
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground">
                            {produto.estoque_mínimo}
                          </TableCell>
                          <TableCell className="text-center">
                            {getStatusBadge(produto.estoque_atual, produto.estoque_mínimo)}
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
                                onClick={() => abrirMovimentação('entrada', produto.id)}
                                title="Entrada"
                              >
                                <ArrowUpCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600"
                                onClick={() => abrirMovimentação('saida', produto.id)}
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Movimentações */}
          <TabsContent value="movimentações" className="space-y-4">
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
                    {movimentaçõesFiltradas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          Nenhuma movimentação encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      movimentaçõesFiltradas.map((mov) => (
                        <TableRow key={mov.id}>
                          <TableCell className="text-sm">
                            {formatDateTime(mov.data)}
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
                            {mov.produto_nome}
                          </TableCell>
                          <TableCell className="text-center font-bold">
                            <span className={mov.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}>
                              {mov.tipo === 'entrada' ? '+' : '-'}{mov.quantidade}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {mov.motivo === 'compra' && 'Compra'}
                              {mov.motivo === 'venda' && 'Venda'}
                              {mov.motivo === 'ajuste' && 'Ajuste'}
                              {mov.motivo === 'perda' && 'Perda'}
                              {mov.motivo === 'uso_interno' && 'Uso Interno'}
                              {mov.motivo === 'devolução' && 'Devolução'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                            {mov.observação || '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {mov.usuário}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
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
                  value={movObservação}
                  onChange={(e) => setMovObservação(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSalvarMovimentação}
                disabled={isLoading}
                className={movTipo === 'entrada' ? 'bg-green-600 hover:bg-green-700' : ''}
                variant={movTipo === 'saida' ? 'destructive' : 'default'}
              >
                {isLoading ? 'Salvando...' : 'Confirmar'}
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
        <Header title="Controle de Estoque" />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-muted-foreground">Carregando...</div>
        </div>
      </div>
    }>
      <EstoqueContent />
    </Suspense>
  )
}
