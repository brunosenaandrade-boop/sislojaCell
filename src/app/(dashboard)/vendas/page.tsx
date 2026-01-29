'use client'

import { useState, useRef, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  ShoppingCart,
  CreditCard,
  Banknote,
  Smartphone,
  QrCode,
  X,
  Check,
  Printer,
  Package,
  DollarSign,
  TrendingUp,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useCarrinhoStore, useAuthStore, useCaixaStore } from '@/store/useStore'
import { CupomVenda } from '@/components/print/CupomVenda'
import type { Produto, Cliente } from '@/types/database'
import { produtosService } from '@/services/produtos.service'
import { clientesService } from '@/services/clientes.service'
import { vendasService } from '@/services/vendas.service'

type FormaPagamento = 'dinheiro' | 'pix' | 'debito' | 'credito'

const formasPagamento: { value: FormaPagamento; label: string; icon: React.ReactNode }[] = [
  { value: 'dinheiro', label: 'Dinheiro', icon: <Banknote className="h-5 w-5" /> },
  { value: 'pix', label: 'PIX', icon: <QrCode className="h-5 w-5" /> },
  { value: 'debito', label: 'Débito', icon: <CreditCard className="h-5 w-5" /> },
  { value: 'credito', label: 'Crédito', icon: <CreditCard className="h-5 w-5" /> },
]

export default function VendasPage() {
  const searchRef = useRef<HTMLInputElement>(null)
  const { empresa, usuario } = useAuthStore()
  const {
    itens,
    cliente_id,
    addItem,
    removeItem,
    updateQuantidade,
    setCliente,
    clearCarrinho,
    getTotal,
    getCustoTotal,
    getLucroTotal,
  } = useCarrinhoStore()

  const { registrarVenda, isCaixaAberto } = useCaixaStore()

  const [busca, setBusca] = useState('')
  const [buscaCliente, setBuscaCliente] = useState('')
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento | null>(null)
  const [dialogFinalizarOpen, setDialogFinalizarOpen] = useState(false)
  const [dialogClienteOpen, setDialogClienteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [vendaFinalizada, setVendaFinalizada] = useState<any>(null)
  const [showPrint, setShowPrint] = useState(false)

  // Dados carregados do Supabase
  const [produtosCatalogo, setProdutosCatalogo] = useState<Produto[]>([])
  const [clientesLista, setClientesLista] = useState<Cliente[]>([])

  // Carregar dados do Supabase
  useEffect(() => {
    const carregarDados = async () => {
      setIsLoadingData(true)
      try {
        const [produtosRes, clientesRes] = await Promise.all([
          produtosService.listar(),
          clientesService.listar(),
        ])

        if (produtosRes.data) setProdutosCatalogo(produtosRes.data)
        if (clientesRes.data) setClientesLista(clientesRes.data)

        if (produtosRes.error) toast.error('Erro ao carregar produtos: ' + produtosRes.error)
        if (clientesRes.error) toast.error('Erro ao carregar clientes: ' + clientesRes.error)
      } catch {
        toast.error('Erro ao carregar dados')
      } finally {
        setIsLoadingData(false)
      }
    }
    carregarDados()
  }, [])

  // Focar no campo de busca ao carregar
  useEffect(() => {
    if (!isLoadingData) {
      searchRef.current?.focus()
    }
  }, [isLoadingData])

  // Filtrar produtos
  const produtosFiltrados = busca
    ? produtosCatalogo.filter(p =>
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (p.codigo && p.codigo.includes(busca))
      )
    : []

  // Filtrar clientes
  const clientesFiltrados = buscaCliente
    ? clientesLista.filter(c =>
        c.nome.toLowerCase().includes(buscaCliente.toLowerCase()) ||
        (c.telefone && c.telefone.includes(buscaCliente))
      )
    : clientesLista

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Adicionar produto ao carrinho
  const handleAddProduto = (produto: Produto) => {
    if (produto.estoque_atual <= 0) {
      toast.error('Produto sem estoque')
      return
    }

    const itemExistente = itens.find(i => i.produto_id === produto.id)
    if (itemExistente && itemExistente.quantidade >= produto.estoque_atual) {
      toast.error('Quantidade máxima atingida (estoque)')
      return
    }

    addItem({
      produto_id: produto.id,
      nome: produto.nome,
      quantidade: 1,
      valor_unitario: produto.preco_venda,
      valor_custo: produto.custo,
    })

    setBusca('')
    searchRef.current?.focus()
    toast.success('Produto adicionado')
  }

  // Selecionar cliente
  const handleSelectCliente = (cliente: Cliente) => {
    setClienteSelecionado(cliente)
    setCliente(cliente.id)
    setDialogClienteOpen(false)
    toast.success(`Cliente: ${cliente.nome}`)
  }

  // Remover cliente
  const handleRemoveCliente = () => {
    setClienteSelecionado(null)
    setCliente(null)
  }

  // Abrir finalização
  const handleAbrirFinalizar = () => {
    if (itens.length === 0) {
      toast.error('Adicione produtos ao carrinho')
      return
    }
    if (!isCaixaAberto()) {
      toast.warning('O caixa não está aberto. A venda não será registrada no controle de caixa.')
    }
    setDialogFinalizarOpen(true)
  }

  // Finalizar venda
  const handleFinalizarVenda = async () => {
    if (!formaPagamento) {
      toast.error('Selecione a forma de pagamento')
      return
    }

    setIsLoading(true)
    try {
      const vendaData = {
        cliente_id: clienteSelecionado?.id,
        forma_pagamento: formaPagamento,
        valor_produtos: getTotal(),
        valor_custo_total: getCustoTotal(),
        valor_desconto: 0,
        valor_total: getTotal(),
        itens: itens.map(item => ({
          produto_id: item.produto_id,
          descricao: item.nome,
          quantidade: item.quantidade,
          valor_unitario: item.valor_unitario,
          valor_custo: item.valor_custo,
          valor_total: item.valor_unitario * item.quantidade,
          lucro_item: (item.valor_unitario - item.valor_custo) * item.quantidade,
        })),
      }

      const { data: vendaCriada, error } = await vendasService.criar(vendaData)
      if (error) {
        toast.error('Erro ao finalizar venda: ' + error)
        return
      }

      const venda = {
        numero: vendaCriada?.numero,
        cliente: clienteSelecionado,
        itens: itens,
        valor_total: getTotal(),
        valor_custo: getCustoTotal(),
        lucro: getLucroTotal(),
        forma_pagamento: formaPagamento,
        data: new Date().toISOString(),
      }

      // Registrar no caixa se estiver aberto
      if (isCaixaAberto()) {
        registrarVenda({
          valor: venda.valor_total,
          custo: venda.valor_custo,
          formaPagamento: formaPagamento,
          descricao: `Venda #${venda.numero} - ${itens.map(i => i.nome).join(', ')}`,
          vendaId: vendaCriada?.id || String(venda.numero),
        })
      }

      setVendaFinalizada(venda)
      toast.success('Venda finalizada com sucesso!')

      // Limpar carrinho
      clearCarrinho()
      setFormaPagamento(null)
      setDialogFinalizarOpen(false)

    } catch {
      toast.error('Erro ao finalizar venda')
    } finally {
      setIsLoading(false)
    }
  }

  // Imprimir cupom
  const handlePrint = () => {
    setShowPrint(true)
    setTimeout(() => {
      window.print()
      setShowPrint(false)
    }, 100)
  }

  // Nova venda
  const handleNovaVenda = () => {
    setVendaFinalizada(null)
    setClienteSelecionado(null)
    searchRef.current?.focus()
  }

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F2 - Focar busca
      if (e.key === 'F2') {
        e.preventDefault()
        searchRef.current?.focus()
      }
      // F4 - Finalizar
      if (e.key === 'F4' && itens.length > 0) {
        e.preventDefault()
        handleAbrirFinalizar()
      }
      // Escape - Limpar busca
      if (e.key === 'Escape') {
        setBusca('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [itens])

  if (isLoadingData) {
    return (
      <div className="flex flex-col h-screen">
        <Header title="PDV - Ponto de Venda" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Cupom para impressão */}
      {showPrint && vendaFinalizada && (
        <div className="print:block hidden">
          <CupomVenda
            venda={vendaFinalizada}
            empresa={empresa}
            operador={usuario?.nome}
          />
        </div>
      )}

      <div className="flex flex-col h-screen print:hidden">
        <Header title="PDV - Ponto de Venda" />

        {/* Tela de venda finalizada */}
        {vendaFinalizada ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <Card className="w-full max-w-md text-center">
              <CardContent className="pt-6 space-y-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-green-600">Venda Finalizada!</h2>
                  <p className="text-muted-foreground">Venda #{vendaFinalizada.numero}</p>
                </div>
                <div className="text-4xl font-bold">
                  {formatCurrency(vendaFinalizada.valor_total)}
                </div>
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>Lucro: {formatCurrency(vendaFinalizada.lucro)}</span>
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir
                  </Button>
                  <Button className="flex-1" onClick={handleNovaVenda}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Venda
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Coluna Esquerda - Produtos */}
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
              {/* Busca de produtos */}
              <div className="relative mb-4" data-tutorial="pdv-search">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  ref={searchRef}
                  placeholder="Buscar produto por nome ou código... (F2)"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10 h-12 text-lg"
                  autoComplete="off"
                />
                {busca && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setBusca('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Resultados da busca */}
              {busca && (
                <Card className="mb-4 max-h-[300px] overflow-y-auto">
                  <CardContent className="p-0">
                    {produtosFiltrados.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        Nenhum produto encontrado
                      </div>
                    ) : (
                      <div className="divide-y">
                        {produtosFiltrados.map(produto => (
                          <div
                            key={produto.id}
                            className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer transition-colors"
                            onClick={() => handleAddProduto(produto)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium">{produto.nome}</p>
                                <p className="text-sm text-muted-foreground">
                                  Cod: {produto.codigo} | Estoque: {produto.estoque_atual}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">{formatCurrency(produto.preco_venda)}</p>
                              <Badge variant="outline" className="text-xs">
                                {produto.categoria?.nome || ''}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Carrinho */}
              <Card className="flex-1 flex flex-col overflow-hidden" data-tutorial="pdv-cart">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Carrinho
                    {itens.length > 0 && (
                      <Badge variant="secondary">{itens.length} itens</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-0">
                  {itens.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <ShoppingCart className="h-12 w-12 mb-2 opacity-50" />
                      <p>Carrinho vazio</p>
                      <p className="text-sm">Busque um produto para adicionar</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {itens.map(item => (
                        <div key={item.produto_id} className="flex items-center gap-3 p-3">
                          <div className="flex-1">
                            <p className="font-medium">{item.nome}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(item.valor_unitario)} cada
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantidade(item.produto_id, item.quantidade - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                              {item.quantidade}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantidade(item.produto_id, item.quantidade + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="w-24 text-right">
                            <p className="font-bold">{formatCurrency(item.valor_total)}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600"
                            onClick={() => removeItem(item.produto_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Coluna Direita - Resumo */}
            <div className="w-80 border-l bg-card flex flex-col">
              {/* Cliente */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm text-muted-foreground">Cliente</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDialogClienteOpen(true)}
                  >
                    {clienteSelecionado ? 'Trocar' : 'Selecionar'}
                  </Button>
                </div>
                {clienteSelecionado ? (
                  <div className="flex items-center justify-between rounded-lg border p-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{clienteSelecionado.nome}</p>
                        <p className="text-xs text-muted-foreground">{clienteSelecionado.telefone}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handleRemoveCliente}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-2">
                    Cliente avulso (opcional)
                  </div>
                )}
              </div>

              {/* Resumo */}
              <div className="flex-1 p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(getTotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Lucro estimado</span>
                    <span>{formatCurrency(getLucroTotal())}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-2xl font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(getTotal())}</span>
                </div>
              </div>

              {/* Botoes */}
              <div className="p-4 border-t space-y-2">
                <Button
                  className="w-full h-14 text-lg"
                  onClick={handleAbrirFinalizar}
                  disabled={itens.length === 0}
                  data-tutorial="pdv-finalizar"
                >
                  <DollarSign className="mr-2 h-5 w-5" />
                  Finalizar Venda (F4)
                </Button>
                {itens.length > 0 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={clearCarrinho}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpar Carrinho
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dialog Selecionar Cliente */}
        <Dialog open={dialogClienteOpen} onOpenChange={setDialogClienteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Selecionar Cliente</DialogTitle>
              <DialogDescription>
                Busque e selecione o cliente para a venda
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou telefone..."
                  value={buscaCliente}
                  onChange={(e) => setBuscaCliente(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="max-h-[300px] overflow-y-auto divide-y rounded-lg border">
                {clientesFiltrados.map(cliente => (
                  <div
                    key={cliente.id}
                    className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer"
                    onClick={() => handleSelectCliente(cliente)}
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{cliente.nome}</p>
                        <p className="text-sm text-muted-foreground">{cliente.telefone}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Selecionar</Button>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog Finalizar Venda */}
        <Dialog open={dialogFinalizarOpen} onOpenChange={setDialogFinalizarOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Finalizar Venda</DialogTitle>
              <DialogDescription>
                Selecione a forma de pagamento
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Total */}
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-sm text-muted-foreground">Total a pagar</p>
                <p className="text-4xl font-bold">{formatCurrency(getTotal())}</p>
              </div>

              {/* Formas de pagamento */}
              <div className="grid grid-cols-2 gap-2">
                {formasPagamento.map(forma => (
                  <Button
                    key={forma.value}
                    variant={formaPagamento === forma.value ? 'default' : 'outline'}
                    className="h-16 flex-col gap-1"
                    onClick={() => setFormaPagamento(forma.value)}
                  >
                    {forma.icon}
                    {forma.label}
                  </Button>
                ))}
              </div>

              {/* Cliente */}
              {clienteSelecionado && (
                <div className="rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{clienteSelecionado.nome}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogFinalizarOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleFinalizarVenda} disabled={!formaPagamento || isLoading}>
                {isLoading ? 'Processando...' : 'Confirmar Venda'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
