'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

export default function NovoProdutoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Estados do formulário
  const [código, setCódigo] = useState('')
  const [nome, setNome] = useState('')
  const [descrição, setDescrição] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [custo, setCusto] = useState('')
  const [preçoVenda, setPreçoVenda] = useState('')
  const [estoqueAtual, setEstoqueAtual] = useState('')
  const [estoqueMínimo, setEstoqueMínimo] = useState('5')
  const [unidade, setUnidade] = useState('UN')

  // Calcular margem
  const custoNum = parseFloat(custo) || 0
  const vendaNum = parseFloat(preçoVenda) || 0
  const lucro = vendaNum - custoNum
  const margem = custoNum > 0 ? ((vendaNum - custoNum) / custoNum) * 100 : 0

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Gerar código automático
  const gerarCódigo = () => {
    const novoCódigo = String(Math.floor(Math.random() * 9000) + 1000)
    setCódigo(novoCódigo)
  }

  // Salvar produto
  const handleSalvar = async () => {
    // Validações
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
    if (vendaNum <= custoNum) {
      toast.error('O preço de venda deve ser maior que o custo')
      return
    }

    setIsLoading(true)

    try {
      // TODO: Salvar no Supabase
      const produto = {
        código: código || String(Date.now()).slice(-6),
        nome,
        descrição,
        categoria_id: categoriaId,
        custo: custoNum,
        preço_venda: vendaNum,
        estoque_atual: parseInt(estoqueAtual) || 0,
        estoque_mínimo: parseInt(estoqueMínimo) || 5,
        unidade,
      }

      console.log('Produto:', produto)
      await new Promise(resolve => setTimeout(resolve, 800))

      toast.success('Produto cadastrado com sucesso!')
      router.push('/produtos')
    } catch (error) {
      toast.error('Erro ao cadastrar produto')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col">
      <Header title="Novo Produto" />

      <div className="flex-1 space-y-6 p-4 lg:p-6">
        {/* Ações */}
        <div className="flex items-center justify-between">
          <Link href="/produtos">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <Button onClick={handleSalvar} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Salvando...' : 'Salvar Produto'}
          </Button>
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
                <CardDescription>
                  Dados principais do produto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="código">Código</Label>
                    <div className="flex gap-2">
                      <Input
                        id="código"
                        placeholder="Ex: 001"
                        value={código}
                        onChange={(e) => setCódigo(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" onClick={gerarCódigo}>
                        Gerar
                      </Button>
                    </div>
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
                    placeholder="Ex: Carregador USB-C Turbo 20W"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descrição">Descrição</Label>
                  <Textarea
                    id="descrição"
                    placeholder="Descrição detalhada do produto (opcional)"
                    value={descrição}
                    onChange={(e) => setDescrição(e.target.value)}
                    rows={3}
                  />
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
                <CardDescription>
                  Defina o custo e preço de venda
                </CardDescription>
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
                        placeholder="0,00"
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
                        placeholder="0,00"
                        value={preçoVenda}
                        onChange={(e) => setPreçoVenda(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Indicadores de Margem */}
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
                    {margem < 30 && margem > 0 && (
                      <div className="flex items-center gap-2 text-orange-600 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        Margem baixa. Considere aumentar o preço de venda.
                      </div>
                    )}
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
                  Controle de estoque do produto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="estoque_atual">Estoque Inicial</Label>
                    <Input
                      id="estoque_atual"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={estoqueAtual}
                      onChange={(e) => setEstoqueAtual(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estoque_mínimo">Estoque Mínimo</Label>
                    <Input
                      id="estoque_mínimo"
                      type="number"
                      min="0"
                      placeholder="5"
                      value={estoqueMínimo}
                      onChange={(e) => setEstoqueMínimo(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Alerta quando atingir este valor
                    </p>
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
              </CardContent>
            </Card>
          </div>

          {/* Coluna Lateral - Resumo */}
          <div className="space-y-6">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Resumo do Produto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Código</span>
                    <span className="font-mono">{código || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nome</span>
                    <span className="font-medium truncate max-w-[150px]">
                      {nome || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Categoria</span>
                    <span>
                      {categoriasMock.find(c => c.id === categoriaId)?.nome || '-'}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Custo</span>
                    <span>{custoNum > 0 ? formatCurrency(custoNum) : '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Venda</span>
                    <span className="font-medium">
                      {vendaNum > 0 ? formatCurrency(vendaNum) : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lucro</span>
                    <span className={lucro > 0 ? 'text-green-600 font-medium' : ''}>
                      {lucro !== 0 ? formatCurrency(lucro) : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Margem</span>
                    <span className={margem >= 30 ? 'text-green-600 font-medium' : 'text-orange-600'}>
                      {margem > 0 ? `${margem.toFixed(1)}%` : '-'}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estoque Inicial</span>
                    <span>{estoqueAtual || '0'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estoque Mínimo</span>
                    <span>{estoqueMínimo || '5'}</span>
                  </div>
                </div>

                <Separator />

                <Button className="w-full" onClick={handleSalvar} disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? 'Salvando...' : 'Cadastrar Produto'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
