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
  DropdownMenuSeparator,
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
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Archive,
  ArrowUpDown,
} from 'lucide-react'
import { toast } from 'sonner'
import { usePermissao } from '@/hooks/usePermissao'

// Categorias mockadas
const categoriasMock = [
  { id: '1', nome: 'Carregadores' },
  { id: '2', nome: 'Cabos' },
  { id: '3', nome: 'Películas' },
  { id: '4', nome: 'Capas' },
  { id: '5', nome: 'Fones' },
  { id: '6', nome: 'Power Banks' },
  { id: '7', nome: 'Acessórios' },
  { id: '8', nome: 'Peças' },
]

// Produtos mockados
const produtosMock = [
  { id: '1', código: '001', nome: 'Carregador USB-C Turbo 20W', categoria_id: '1', categoria: 'Carregadores', custo: 25.00, preço_venda: 49.90, estoque_atual: 15, estoque_mínimo: 5, ativo: true },
  { id: '2', código: '002', nome: 'Cabo USB-C 2m', categoria_id: '2', categoria: 'Cabos', custo: 12.00, preço_venda: 29.90, estoque_atual: 30, estoque_mínimo: 10, ativo: true },
  { id: '3', código: '003', nome: 'Película iPhone 13', categoria_id: '3', categoria: 'Películas', custo: 8.00, preço_venda: 25.00, estoque_atual: 3, estoque_mínimo: 5, ativo: true },
  { id: '4', código: '004', nome: 'Capa Silicone iPhone 13', categoria_id: '4', categoria: 'Capas', custo: 15.00, preço_venda: 35.00, estoque_atual: 12, estoque_mínimo: 5, ativo: true },
  { id: '5', código: '005', nome: 'Fone Bluetooth TWS', categoria_id: '5', categoria: 'Fones', custo: 45.00, preço_venda: 89.90, estoque_atual: 2, estoque_mínimo: 3, ativo: true },
  { id: '6', código: '006', nome: 'Carregador Wireless 15W', categoria_id: '1', categoria: 'Carregadores', custo: 40.00, preço_venda: 79.90, estoque_atual: 5, estoque_mínimo: 3, ativo: true },
  { id: '7', código: '007', nome: 'Suporte Veicular Magnetico', categoria_id: '7', categoria: 'Acessórios', custo: 20.00, preço_venda: 45.00, estoque_atual: 10, estoque_mínimo: 5, ativo: true },
  { id: '8', código: '008', nome: 'Power Bank 10000mAh', categoria_id: '6', categoria: 'Power Banks', custo: 55.00, preço_venda: 99.90, estoque_atual: 7, estoque_mínimo: 3, ativo: true },
  { id: '9', código: '009', nome: 'Película Samsung S22', categoria_id: '3', categoria: 'Películas', custo: 8.00, preço_venda: 25.00, estoque_atual: 0, estoque_mínimo: 5, ativo: true },
  { id: '10', código: '010', nome: 'Capa Samsung S22', categoria_id: '4', categoria: 'Capas', custo: 15.00, preço_venda: 35.00, estoque_atual: 14, estoque_mínimo: 5, ativo: true },
  { id: '11', código: '011', nome: 'Cabo Lightning 1m Original', categoria_id: '2', categoria: 'Cabos', custo: 18.00, preço_venda: 39.90, estoque_atual: 25, estoque_mínimo: 10, ativo: true },
  { id: '12', código: '012', nome: 'Tela iPhone 13 (Peca)', categoria_id: '8', categoria: 'Peças', custo: 280.00, preço_venda: 450.00, estoque_atual: 2, estoque_mínimo: 2, ativo: true },
]

export default function ProdutosPage() {
  const { podeExcluirRegistros } = usePermissao()
  const [produtos, setProdutos] = useState(produtosMock)
  const [busca, setBusca] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas')
  const [estoqueFiltro, setEstoqueFiltro] = useState('todos')
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false)
  const [produtoParaDeletar, setProdutoParaDeletar] = useState<string | null>(null)

  // Estatísticas
  const stats = {
    totalProdutos: produtos.length,
    produtosAtivos: produtos.filter(p => p.ativo).length,
    estoqueBaixo: produtos.filter(p => p.estoque_atual <= p.estoque_mínimo && p.estoque_atual > 0).length,
    semEstoque: produtos.filter(p => p.estoque_atual === 0).length,
    valorEstoque: produtos.reduce((acc, p) => acc + (p.custo * p.estoque_atual), 0),
  }

  // Filtrar produtos
  const produtosFiltrados = produtos.filter(p => {
    const matchBusca =
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.código.includes(busca)

    const matchCategoria = categoriaFiltro === 'todas' || p.categoria_id === categoriaFiltro

    let matchEstoque = true
    if (estoqueFiltro === 'baixo') {
      matchEstoque = p.estoque_atual <= p.estoque_mínimo && p.estoque_atual > 0
    } else if (estoqueFiltro === 'zerado') {
      matchEstoque = p.estoque_atual === 0
    } else if (estoqueFiltro === 'ok') {
      matchEstoque = p.estoque_atual > p.estoque_mínimo
    }

    return matchBusca && matchCategoria && matchEstoque
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Calcular margem de lucro
  const calcularMargem = (custo: number, venda: number) => {
    if (custo === 0) return 100
    return ((venda - custo) / custo) * 100
  }

  // Deletar produto
  const handleDelete = () => {
    if (!produtoParaDeletar) return
    setProdutos(produtos.filter(p => p.id !== produtoParaDeletar))
    toast.success('Produto excluído')
    setDialogDeleteOpen(false)
    setProdutoParaDeletar(null)
  }

  const confirmarDelete = (id: string) => {
    setProdutoParaDeletar(id)
    setDialogDeleteOpen(true)
  }

  return (
    <div className="flex flex-col">
      <Header title="Produtos" />

      <div className="flex-1 space-y-6 p-4 lg:p-6">
        {/* Cards de estatísticas */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4" />
                Total de Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProdutos}</div>
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
              <div className="text-2xl font-bold">{formatCurrency(stats.valorEstoque)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Produtos Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.produtosAtivos}</div>
            </CardContent>
          </Card>

          <Card className={stats.estoqueBaixo > 0 ? 'border-orange-200 bg-orange-50' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm font-medium flex items-center gap-2 ${stats.estoqueBaixo > 0 ? 'text-orange-700' : 'text-muted-foreground'}`}>
                <AlertTriangle className="h-4 w-4" />
                Estoque Baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.estoqueBaixo > 0 ? 'text-orange-600' : ''}`}>
                {stats.estoqueBaixo}
              </div>
            </CardContent>
          </Card>

          <Card className={stats.semEstoque > 0 ? 'border-red-200 bg-red-50' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm font-medium flex items-center gap-2 ${stats.semEstoque > 0 ? 'text-red-700' : 'text-muted-foreground'}`}>
                <Archive className="h-4 w-4" />
                Sem Estoque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.semEstoque > 0 ? 'text-red-600' : ''}`}>
                {stats.semEstoque}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e ações */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou código..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas Categorias</SelectItem>
                {categoriasMock.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={estoqueFiltro} onValueChange={setEstoqueFiltro}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estoque" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ok">Estoque OK</SelectItem>
                <SelectItem value="baixo">Estoque Baixo</SelectItem>
                <SelectItem value="zerado">Sem Estoque</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Link href="/produtos/categorias">
              <Button variant="outline">
                Categorias
              </Button>
            </Link>
            <Link href="/produtos/novo">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Produto
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabela de produtos */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Código</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Custo</TableHead>
                  <TableHead className="text-right">Preço Venda</TableHead>
                  <TableHead className="text-right">Margem</TableHead>
                  <TableHead className="text-center">Estoque</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
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
                  produtosFiltrados.map((produto) => {
                    const margem = calcularMargem(produto.custo, produto.preço_venda)
                    const estoqueBaixo = produto.estoque_atual <= produto.estoque_mínimo
                    const semEstoque = produto.estoque_atual === 0

                    return (
                      <TableRow key={produto.id} className={!produto.ativo ? 'opacity-50' : ''}>
                        <TableCell className="font-mono text-sm">
                          {produto.código}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                              <Package className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <span className="font-medium">{produto.nome}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{produto.categoria}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(produto.custo)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(produto.preço_venda)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className={
                              margem >= 50
                                ? 'text-green-600 border-green-600'
                                : margem >= 30
                                ? 'text-blue-600 border-blue-600'
                                : 'text-orange-600 border-orange-600'
                            }
                          >
                            {margem.toFixed(0)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={`font-medium ${
                                semEstoque
                                  ? 'text-red-600'
                                  : estoqueBaixo
                                  ? 'text-orange-600'
                                  : ''
                              }`}
                            >
                              {produto.estoque_atual}
                            </span>
                            {semEstoque && (
                              <Badge variant="destructive" className="text-[10px] px-1">
                                Zerado
                              </Badge>
                            )}
                            {estoqueBaixo && !semEstoque && (
                              <Badge className="text-[10px] px-1 bg-orange-100 text-orange-700">
                                Baixo
                              </Badge>
                            )}
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
                              <Link href={`/produtos/${produto.id}/editar`}>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                              </Link>
                              <Link href={`/estoque?produto=${produto.id}`}>
                                <DropdownMenuItem>
                                  <ArrowUpDown className="mr-2 h-4 w-4" />
                                  Movimentar Estoque
                                </DropdownMenuItem>
                              </Link>
                              {podeExcluirRegistros && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => confirmarDelete(produto.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog Confirmar Exclusão */}
        <Dialog open={dialogDeleteOpen} onOpenChange={setDialogDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogDeleteOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
