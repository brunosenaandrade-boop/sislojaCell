'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Save,
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  History,
} from 'lucide-react'
import { toast } from 'sonner'

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

// Produto mockado para edição
const produtoMock = {
  id: '1',
  código: '001',
  nome: 'Carregador USB-C Turbo 20W',
  descrição: 'Carregador rápido com tecnologia Power Delivery',
  categoria_id: '1',
  custo: 25.00,
  preço_venda: 49.90,
  estoque_atual: 15,
  estoque_mínimo: 5,
  unidade: 'UN',
  ativo: true,
}

export default function EditarProdutoPage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)

  // Estados do formulário
  const [código, setCódigo] = useState('')
  const [nome, setNome] = useState('')
  const [descrição, setDescrição] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [custo, setCusto] = useState('')
  const [preçoVenda, setPreçoVenda] = useState('')
  const [estoqueAtual, setEstoqueAtual] = useState('')
  const [estoqueMínimo, setEstoqueMínimo] = useState('')
  const [unidade, setUnidade] = useState('UN')
  const [ativo, setAtivo] = useState(true)

  // Carregar dados do produto
  useEffect(() => {
    // TODO: Buscar do Supabase
    const produto = produtoMock
    setCódigo(produto.código)
    setNome(produto.nome)
    setDescrição(produto.descrição || '')
    setCategoriaId(produto.categoria_id)
    setCusto(produto.custo.toString())
    setPreçoVenda(produto.preço_venda.toString())
    setEstoqueAtual(produto.estoque_atual.toString())
    setEstoqueMínimo(produto.estoque_mínimo.toString())
    setUnidade(produto.unidade)
    setAtivo(produto.ativo)
  }, [params.id])

  // Calcular margem
  const custoNum = parseFloat(custo) || 0
  const vendaNum = parseFloat(preçoVenda) || 0
  const lucro = vendaNum - custoNum
  const margem = custoNum > 0 ? ((vendaNum - custoNum) / custoNum) * 100 : 0

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Salvar produto
  const handleSalvar = async () => {
    if (!nome.trim()) {
      toast.error('Informe o nome do produto')
      return
    }
    if (!categoriaId) {
      toast.error('Selecione uma categoria')
      return
    }
    if (custoNum <= 0) {
      toast.error('Informe o custo do produto')
      return
    }
    if (vendaNum <= 0) {
      toast.error('Informe o preço de venda')
      return
    }

    setIsLoading(true)

    try {
      const produto = {
        id: params.id,
        código,
        nome,
        descrição,
        categoria_id: categoriaId,
        custo: custoNum,
        preço_venda: vendaNum,
        estoque_atual: parseInt(estoqueAtual) || 0,
        estoque_mínimo: parseInt(estoqueMínimo) || 5,
        unidade,
        ativo,
      }

      await new Promise(resolve => setTimeout(resolve, 800))

      toast.success('Produto atualizado com sucesso!')
      router.push('/produtos')
    } catch (error) {
      toast.error('Erro ao atualizar produto')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col">
      <Header title="Editar Produto" />

      <div className="flex-1 space-y-6 p-4 lg:p-6">
        {/* Ações */}
        <div className="flex items-center justify-between">
          <Link href="/produtos">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div className="flex gap-2">
            <Link href={`/estoque?produto=${params.id}`}>
              <Button variant="outline">
                <History className="mr-2 h-4 w-4" />
                Histórico de Estoque
              </Button>
            </Link>
            <Button onClick={handleSalvar} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Formulário Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="código">Código</Label>
                    <Input
                      id="código"
                      value={código}
                      onChange={(e) => setCódigo(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Select value={categoriaId} onValueChange={setCategoriaId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriasMock.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Produto *</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descrição">Descrição</Label>
                  <Textarea
                    id="descrição"
                    value={descrição}
                    onChange={(e) => setDescrição(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label>Produto Ativo</Label>
                    <p className="text-sm text-muted-foreground">
                      Produtos inativos não aparecem no PDV
                    </p>
                  </div>
                  <Button
                    variant={ativo ? 'default' : 'outline'}
                    onClick={() => setAtivo(!ativo)}
                  >
                    {ativo ? 'Ativo' : 'Inativo'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preços */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Preços
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="custo">Custo (Compra) *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        R$
                      </span>
                      <Input
                        id="custo"
                        type="number"
                        step="0.01"
                        min="0"
                        value={custo}
                        onChange={(e) => setCusto(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preço_venda">Preço de Venda *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        R$
                      </span>
                      <Input
                        id="preço_venda"
                        type="number"
                        step="0.01"
                        min="0"
                        value={preçoVenda}
                        onChange={(e) => setPreçoVenda(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {custoNum > 0 && vendaNum > 0 && (
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Lucro por unidade</span>
                      <span className={`font-medium ${lucro > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(lucro)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Margem de lucro</span>
                      <Badge
                        className={
                          margem >= 50
                            ? 'bg-green-100 text-green-700'
                            : margem >= 30
                            ? 'bg-blue-100 text-blue-700'
                            : margem > 0
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                        }
                      >
                        <TrendingUp className="mr-1 h-3 w-3" />
                        {margem.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Estoque */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Estoque
                </CardTitle>
                <CardDescription>
                  Para movimentar estoque, use a página de Estoque
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Estoque Atual</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={estoqueAtual}
                        disabled
                        className="bg-muted"
                      />
                      <Link href={`/estoque?produto=${params.id}`}>
                        <Button variant="outline" size="sm">
                          Movimentar
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estoque_mínimo">Estoque Mínimo</Label>
                    <Input
                      id="estoque_mínimo"
                      type="number"
                      min="0"
                      value={estoqueMínimo}
                      onChange={(e) => setEstoqueMínimo(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unidade">Unidade</Label>
                    <Select value={unidade} onValueChange={setUnidade}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UN">Unidade (UN)</SelectItem>
                        <SelectItem value="CX">Caixa (CX)</SelectItem>
                        <SelectItem value="PC">Peça (PC)</SelectItem>
                        <SelectItem value="KIT">Kit (KIT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {parseInt(estoqueAtual) <= parseInt(estoqueMínimo) && parseInt(estoqueAtual) > 0 && (
                  <div className="flex items-center gap-2 text-orange-600 text-sm rounded-lg bg-orange-50 p-3">
                    <AlertTriangle className="h-4 w-4" />
                    Estoque abaixo do mínimo! Considere repor o produto.
                  </div>
                )}

                {parseInt(estoqueAtual) === 0 && (
                  <div className="flex items-center gap-2 text-red-600 text-sm rounded-lg bg-red-50 p-3">
                    <AlertTriangle className="h-4 w-4" />
                    Produto sem estoque!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna Lateral */}
          <div className="space-y-6">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Código</span>
                    <span className="font-mono">{código}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={ativo ? 'default' : 'secondary'}>
                      {ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Custo</span>
                    <span>{formatCurrency(custoNum)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Venda</span>
                    <span className="font-medium">{formatCurrency(vendaNum)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lucro</span>
                    <span className="text-green-600 font-medium">{formatCurrency(lucro)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Margem</span>
                    <span>{margem.toFixed(1)}%</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estoque</span>
                    <span className={
                      parseInt(estoqueAtual) === 0
                        ? 'text-red-600 font-medium'
                        : parseInt(estoqueAtual) <= parseInt(estoqueMínimo)
                        ? 'text-orange-600 font-medium'
                        : ''
                    }>
                      {estoqueAtual} {unidade}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Valor em Estoque</span>
                    <span>{formatCurrency(custoNum * parseInt(estoqueAtual || '0'))}</span>
                  </div>
                </div>

                <Separator />

                <Button className="w-full" onClick={handleSalvar} disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
