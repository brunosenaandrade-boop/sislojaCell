'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  ShoppingCart,
  CreditCard,
  Banknote,
  QrCode,
  X,
  Check,
  Printer,
  Package,
  DollarSign,
  TrendingUp,
  Loader2,
  ChevronUp,
  Tag,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useCarrinhoStore, useAuthStore, usePrintConfigStore } from '@/store/useStore'
import { CupomVenda } from '@/components/print/CupomVenda'
import type { Produto, Cliente } from '@/types/database'
import { produtosService } from '@/services/produtos.service'
import { clientesService } from '@/services/clientes.service'
import { vendasService } from '@/services/vendas.service'
import { caixaService } from '@/services/caixa.service'

type FormaPagamento = 'dinheiro' | 'pix' | 'debito' | 'credito'

const formasPagamento: { value: FormaPagamento; label: string; icon: React.ReactNode }[] = [
  { value: 'dinheiro', label: 'Dinheiro', icon: <Banknote className="h-5 w-5" /> },
  { value: 'pix', label: 'PIX', icon: <QrCode className="h-5 w-5" /> },
  { value: 'debito', label: 'Débito', icon: <CreditCard className="h-5 w-5" /> },
  { value: 'credito', label: 'Crédito', icon: <CreditCard className="h-5 w-5" /> },
]

export default function VendasPage() {
  const searchRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const { empresa, usuario } = useAuthStore()
  const {
    itens,
    addItem,
    removeItem,
    updateQuantidade,
    setCliente,
    clearCarrinho,
    getTotal,
    getCustoTotal,
    getLucroTotal,
  } = useCarrinhoStore()

  const printConfig = usePrintConfigStore()
  const [caixaAbertoId, setCaixaAbertoId] = useState<string | null>(null)

  const [busca, setBusca] = useState('')
  const [buscaAberta, setBuscaAberta] = useState(false)
  const [buscaCliente, setBuscaCliente] = useState('')
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento | null>(null)
  const [valorRecebido, setValorRecebido] = useState('')
  const [desconto, setDesconto] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [dialogFinalizarOpen, setDialogFinalizarOpen] = useState(false)
  const [dialogClienteOpen, setDialogClienteOpen] = useState(false)
  const [mobileResumoOpen, setMobileResumoOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [vendaFinalizada, setVendaFinalizada] = useState<{
    numero: number
    cliente: Cliente | null
    itens: { produto_id: string; nome: string; descricao: string; quantidade: number; valor_unitario: number; valor_custo: number; valor_total: number }[]
    valor_total: number
    valor_custo: number
    lucro: number
    forma_pagamento: string
    data: string
  } | null>(null)
  const [showPrint, setShowPrint] = useState(false)

  // Dados carregados do Supabase
  const [produtosCatalogo, setProdutosCatalogo] = useState<Produto[]>([])
  const [clientesLista, setClientesLista] = useState<Cliente[]>([])

  // Valores calculados
  const subtotal = getTotal()
  const descontoValor = Math.min(Math.max(parseFloat(desconto) || 0, 0), subtotal)
  const totalFinal = subtotal - descontoValor
  const trocoValor = parseFloat(valorRecebido) || 0
  const troco = trocoValor - totalFinal

  // Carregar dados do Supabase
  useEffect(() => {
    const carregarDados = async () => {
      setIsLoadingData(true)
      try {
        const [produtosRes, clientesRes, caixaRes] = await Promise.all([
          produtosService.listar(),
          clientesService.listar(),
          caixaService.buscarAberto(),
        ])

        if (produtosRes.data) setProdutosCatalogo(produtosRes.data)
        if (clientesRes.data) setClientesLista(clientesRes.data)
        if (caixaRes.data) setCaixaAbertoId(caixaRes.data.id)

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

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setBuscaAberta(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filtrar produtos (exclui sem estoque dos resultados)
  const produtosFiltrados = busca
    ? produtosCatalogo.filter(p =>
        (p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (p.codigo && p.codigo.toLowerCase().includes(busca.toLowerCase()))) &&
        p.estoque_atual > 0
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

  // Buscar estoque disponível de um produto
  const getEstoqueDisponivel = useCallback((produtoId: string) => {
    const produto = produtosCatalogo.find(p => p.id === produtoId)
    return produto?.estoque_atual ?? 0
  }, [produtosCatalogo])

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
    setBuscaAberta(false)
    searchRef.current?.focus()
    toast.success('Produto adicionado')
  }

  // Incrementar quantidade com validação de estoque
  const handleIncrementQuantidade = (produtoId: string, quantidadeAtual: number) => {
    const estoqueDisponivel = getEstoqueDisponivel(produtoId)
    if (quantidadeAtual >= estoqueDisponivel) {
      toast.error('Quantidade máxima atingida (estoque)')
      return
    }
    updateQuantidade(produtoId, quantidadeAtual + 1)
  }

  // Enter na busca - adicionar por código (leitor de barras)
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && busca.trim()) {
      e.preventDefault()
      // Buscar match exato por código
      const matchExato = produtosCatalogo.find(
        p => p.codigo && p.codigo.toLowerCase() === busca.trim().toLowerCase() && p.estoque_atual > 0
      )
      if (matchExato) {
        handleAddProduto(matchExato)
      } else if (produtosFiltrados.length === 1) {
        // Se só tem 1 resultado, adiciona direto
        handleAddProduto(produtosFiltrados[0])
      }
    }
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
  const handleAbrirFinalizar = useCallback(() => {
    if (itens.length === 0) {
      toast.error('Adicione produtos ao carrinho')
      return
    }
    if (!caixaAbertoId) {
      toast.warning('O caixa não está aberto. A venda não será registrada no controle de caixa.')
    }
    setValorRecebido('')
    setDialogFinalizarOpen(true)
  }, [itens.length, caixaAbertoId])

  // Finalizar venda
  const handleFinalizarVenda = async () => {
    if (!formaPagamento) {
      toast.error('Selecione a forma de pagamento')
      return
    }

    if (formaPagamento === 'dinheiro' && trocoValor > 0 && trocoValor < totalFinal) {
      toast.error('Valor recebido insuficiente')
      return
    }

    setIsLoading(true)
    try {
      const vendaData = {
        cliente_id: clienteSelecionado?.id,
        forma_pagamento: formaPagamento,
        valor_produtos: subtotal,
        valor_custo_total: getCustoTotal(),
        valor_desconto: descontoValor,
        valor_total: totalFinal,
        observacoes: observacoes.trim() || undefined,
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

      const lucroFinal = totalFinal - getCustoTotal()
      const venda = {
        numero: vendaCriada?.numero ?? 0,
        cliente: clienteSelecionado,
        itens: itens.map(i => ({ ...i, descricao: i.nome })),
        valor_total: totalFinal,
        valor_custo: getCustoTotal(),
        lucro: lucroFinal,
        forma_pagamento: formaPagamento || 'dinheiro',
        data: new Date().toISOString(),
      }

      // Registrar no caixa se estiver aberto (persiste no banco)
      if (caixaAbertoId && vendaCriada) {
        await caixaService.adicionarMovimentacao({
          caixa_id: caixaAbertoId,
          tipo: 'venda',
          valor: venda.valor_total,
          descricao: `Venda #${venda.numero} - ${itens.map(i => i.nome).join(', ')}`,
          venda_id: vendaCriada.id,
        })
      }

      setVendaFinalizada(venda)
      toast.success('Venda finalizada com sucesso!')

      // Limpar tudo
      clearCarrinho()
      setFormaPagamento(null)
      setDesconto('')
      setObservacoes('')
      setValorRecebido('')
      setDialogFinalizarOpen(false)

    } catch {
      toast.error('Erro ao finalizar venda')
    } finally {
      setIsLoading(false)
    }
  }

  // Imprimir cupom via portal (mesmo padrão do CupomOS)
  const handlePrint = () => {
    setShowPrint(true)
    setTimeout(() => {
      window.print()
    }, 300)
  }

  useEffect(() => {
    if (!showPrint) return
    const handleAfterPrint = () => setShowPrint(false)
    window.addEventListener('afterprint', handleAfterPrint)
    return () => window.removeEventListener('afterprint', handleAfterPrint)
  }, [showPrint])

  // Nova venda
  const handleNovaVenda = () => {
    setVendaFinalizada(null)
    setClienteSelecionado(null)
    setDesconto('')
    setObservacoes('')
    searchRef.current?.focus()
  }

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'F4' && itens.length > 0 && !dialogFinalizarOpen) {
        e.preventDefault()
        handleAbrirFinalizar()
      }
      if (e.key === 'Escape') {
        setBusca('')
        setBuscaAberta(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [itens.length, dialogFinalizarOpen, handleAbrirFinalizar])

  // === Componente do Resumo (reutilizado no desktop e mobile) ===
  const ResumoContent = () => (
    <>
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

      {/* Resumo financeiro */}
      <div className="flex-1 p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal ({itens.length} {itens.length === 1 ? 'item' : 'itens'})</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          {/* Campo de desconto */}
          <div className="flex items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground shrink-0">Desconto</span>
            <div className="flex-1 flex items-center gap-1">
              <span className="text-sm text-muted-foreground">R$</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={desconto}
                onChange={(e) => setDesconto(e.target.value)}
                className="h-7 text-sm text-right"
              />
            </div>
          </div>
          {descontoValor > 0 && (
            <div className="flex justify-between text-sm text-red-500">
              <span>Desconto</span>
              <span>- {formatCurrency(descontoValor)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm text-green-600">
            <span>Lucro estimado</span>
            <span>{formatCurrency(getLucroTotal() - descontoValor)}</span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between text-2xl font-bold">
          <span>Total</span>
          <span>{formatCurrency(totalFinal)}</span>
        </div>
      </div>

      {/* Botoes */}
      <div className="p-4 pt-6 border-t space-y-2">
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
            onClick={() => { clearCarrinho(); setDesconto('') }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Limpar Carrinho
          </Button>
        )}
      </div>
    </>
  )

  if (isLoadingData) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Portal de impressão: renderiza direto no body, fora do layout/overflow */}
      {showPrint && vendaFinalizada && typeof document !== 'undefined' && createPortal(
        <div
          className="print-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'white',
            overflow: 'auto',
          }}
        >
          <CupomVenda
            venda={vendaFinalizada}
            empresa={empresa}
            operador={usuario?.nome}
            config={{
              largura: printConfig.larguraPapel as '58' | '80' | 'A4',
              mostrarLogo: printConfig.mostrarLogo,
              mostrarEndereco: printConfig.mostrarEndereco,
              mostrarTelefone: printConfig.mostrarTelefone,
              mensagemCupom: printConfig.mensagemCupom,
            }}
          />
        </div>,
        document.body
      )}

      <div className="flex flex-col h-screen print:hidden">
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
          <>
            {/* Layout principal: flex-col no mobile, flex-row no desktop */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* Coluna Esquerda - Busca + Carrinho */}
              <div className="flex-1 flex flex-col p-4 overflow-hidden pb-0 lg:pb-4">
                {/* Busca de produtos (dropdown overlay) */}
                <div className="relative mb-4" ref={searchContainerRef} data-tutorial="pdv-search">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    ref={searchRef}
                    placeholder="Buscar produto por nome ou código... (F2)"
                    value={busca}
                    onChange={(e) => { setBusca(e.target.value); setBuscaAberta(true) }}
                    onFocus={() => { if (busca) setBuscaAberta(true) }}
                    onKeyDown={handleSearchKeyDown}
                    className="pl-10 h-12 text-lg"
                    autoComplete="off"
                  />
                  {busca && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => { setBusca(''); setBuscaAberta(false) }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Resultados da busca - dropdown overlay */}
                  {busca && buscaAberta && (
                    <Card className="absolute left-0 right-0 top-full mt-1 z-20 max-h-[300px] overflow-y-auto shadow-lg border">
                      <CardContent className="p-0">
                        {produtosFiltrados.length === 0 ? (
                          <div className="p-4 text-center text-muted-foreground text-sm">
                            Nenhum produto encontrado com estoque
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
                                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium truncate">{produto.nome}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {produto.codigo && `Cod: ${produto.codigo} | `}Estoque: {produto.estoque_atual}
                                      {produto.estoque_atual <= (produto.estoque_minimo || 0) && (
                                        <span className="text-orange-500 ml-1">(baixo)</span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right shrink-0 ml-2">
                                  <p className="font-bold text-lg">{formatCurrency(produto.preco_venda)}</p>
                                  {produto.categoria?.nome && (
                                    <Badge variant="outline" className="text-xs">
                                      {produto.categoria.nome}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Carrinho */}
                <Card className="flex-1 flex flex-col overflow-hidden" data-tutorial="pdv-cart">
                  <div className="flex items-center gap-2 px-4 py-2 border-b">
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-sm">Carrinho</span>
                    {itens.length > 0 && (
                      <Badge variant="secondary" className="text-xs">{itens.length}</Badge>
                    )}
                  </div>
                  <CardContent className="flex-1 overflow-y-auto p-0">
                    {itens.length === 0 ? (
                      <div className="flex items-center justify-center gap-2 text-muted-foreground py-6">
                        <ShoppingCart className="h-5 w-5 opacity-50" />
                        <p className="text-sm">Busque um produto para adicionar</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {itens.map(item => {
                          const estoqueMax = getEstoqueDisponivel(item.produto_id)
                          const noLimite = item.quantidade >= estoqueMax
                          return (
                            <div key={item.produto_id} className="flex items-center gap-2 sm:gap-3 p-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{item.nome}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatCurrency(item.valor_unitario)} cada
                                </p>
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
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
                                  onClick={() => handleIncrementQuantidade(item.produto_id, item.quantidade)}
                                  disabled={noLimite}
                                  title={noLimite ? `Máximo: ${estoqueMax}` : undefined}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="w-20 sm:w-24 text-right shrink-0">
                                <p className="font-bold">{formatCurrency(item.valor_total)}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 shrink-0"
                                onClick={() => removeItem(item.produto_id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Coluna Direita - Resumo (Desktop) */}
              <div className="hidden lg:flex w-80 border-l bg-card flex-col">
                <ResumoContent />
              </div>
            </div>

            {/* Bottom Bar (Mobile) */}
            <div className="lg:hidden border-t bg-card p-3 shrink-0">
              <div className="flex items-center gap-3">
                <Sheet open={mobileResumoOpen} onOpenChange={setMobileResumoOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="shrink-0">
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Resumo
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[85vh] flex flex-col p-0">
                    <SheetHeader className="px-4 pt-4 pb-2">
                      <SheetTitle>Resumo da Venda</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 flex flex-col overflow-y-auto">
                      <ResumoContent />
                    </div>
                  </SheetContent>
                </Sheet>

                <div className="flex-1 text-right">
                  <p className="text-xs text-muted-foreground">{itens.length} {itens.length === 1 ? 'item' : 'itens'}</p>
                  <p className="text-lg font-bold">{formatCurrency(totalFinal)}</p>
                </div>

                <Button
                  className="h-12 px-6 text-base shrink-0"
                  onClick={handleAbrirFinalizar}
                  disabled={itens.length === 0}
                >
                  <DollarSign className="mr-1 h-5 w-5" />
                  Finalizar (F4)
                </Button>
              </div>
            </div>
          </>
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
                {clientesFiltrados.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    Nenhum cliente encontrado
                  </div>
                ) : (
                  clientesFiltrados.map(cliente => (
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
                  ))
                )}
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
                <p className="text-4xl font-bold">{formatCurrency(totalFinal)}</p>
                {descontoValor > 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    Desconto: - {formatCurrency(descontoValor)}
                  </p>
                )}
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

              {/* Calculadora de troco (dinheiro) */}
              {formaPagamento === 'dinheiro' && (
                <div className="rounded-lg border p-3 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Valor recebido</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0,00"
                        value={valorRecebido}
                        onChange={(e) => setValorRecebido(e.target.value)}
                        className="pl-10 text-lg h-11"
                        autoFocus
                      />
                    </div>
                  </div>
                  {trocoValor > 0 && (
                    <div className={`flex justify-between items-center p-2 rounded-md ${troco >= 0 ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}>
                      <span className={`text-sm font-medium ${troco >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                        {troco >= 0 ? 'Troco' : 'Falta'}
                      </span>
                      <span className={`text-lg font-bold ${troco >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                        {formatCurrency(Math.abs(troco))}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Cliente */}
              {clienteSelecionado && (
                <div className="rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{clienteSelecionado.nome}</p>
                </div>
              )}

              {/* Observações */}
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Observações (opcional)</Label>
                <Textarea
                  placeholder="Ex: Troca de peça com garantia..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={2}
                  className="resize-none text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogFinalizarOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleFinalizarVenda}
                disabled={!formaPagamento || isLoading || (formaPagamento === 'dinheiro' && trocoValor > 0 && troco < 0)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Confirmar Venda'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
