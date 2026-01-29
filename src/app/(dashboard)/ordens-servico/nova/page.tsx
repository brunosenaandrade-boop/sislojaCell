'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  Save,
  Printer,
  Plus,
  Trash2,
  Search,
  User,
  Smartphone,
  Gamepad2,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

// Tipos de aparelho
const tiposAparelho = [
  { value: 'celular', label: 'Celular', icon: Smartphone },
  { value: 'videogame', label: 'Videogame', icon: Gamepad2 },
  { value: 'tablet', label: 'Tablet', icon: Smartphone },
  { value: 'outro', label: 'Outro', icon: Smartphone },
]

// Marcas comuns
const marcasCelular = ['Apple', 'Samsung', 'Motorola', 'Xiaomi', 'LG', 'Huawei', 'Asus', 'Outra']
const marcasVideogame = ['Sony', 'Microsoft', 'Nintendo', 'Outra']

// Serviços mockados
const serviçosMock = [
  { id: '1', nome: 'Troca de Tela', preço: 150, tipo: 'básico' },
  { id: '2', nome: 'Troca de Bateria', preço: 80, tipo: 'básico' },
  { id: '3', nome: 'Troca de Conector de Carga', preço: 100, tipo: 'básico' },
  { id: '4', nome: 'Reparo de Placa (Avançado)', preço: 300, tipo: 'avançado' },
  { id: '5', nome: 'Troca de Camera', preço: 120, tipo: 'básico' },
  { id: '6', nome: 'Limpeza Interna', preço: 50, tipo: 'básico' },
  { id: '7', nome: 'Troca de Leitor de Disco (Videogame)', preço: 200, tipo: 'básico' },
  { id: '8', nome: 'Troca de Pasta Térmica', preço: 80, tipo: 'básico' },
]

// Produtos/Peças mockados
const produtosMock = [
  { id: '1', nome: 'Tela iPhone 13', preço: 450, custo: 280, estoque: 5 },
  { id: '2', nome: 'Bateria iPhone 13', preço: 150, custo: 80, estoque: 10 },
  { id: '3', nome: 'Tela Samsung S22', preço: 380, custo: 220, estoque: 3 },
  { id: '4', nome: 'Bateria Samsung S22', preço: 120, custo: 65, estoque: 8 },
  { id: '5', nome: 'Conector de Carga Universal', preço: 40, custo: 15, estoque: 20 },
  { id: '6', nome: 'Leitor Blu-ray PS5', preço: 350, custo: 200, estoque: 2 },
]

// Clientes mockados
const clientesMock = [
  { id: '1', nome: 'Maria Silva', telefone: '(48) 99999-1111', cpf: '123.456.789-00' },
  { id: '2', nome: 'Joao Santos', telefone: '(48) 99999-2222', cpf: '234.567.890-11' },
  { id: '3', nome: 'Pedro Costa', telefone: '(48) 99999-3333', cpf: '345.678.901-22' },
  { id: '4', nome: 'Ana Oliveira', telefone: '(48) 99999-4444', cpf: '456.789.012-33' },
]

interface ItemOS {
  id: string
  tipo: 'serviço' | 'produto'
  nome: string
  quantidade: number
  valor_unitario: number
  valor_custo: number
}

export default function NovaOSPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showSenha, setShowSenha] = useState(false)

  // Estados do formulário
  const [clienteId, setClienteId] = useState('')
  const [clienteBusca, setClienteBusca] = useState('')
  const [clienteSelecionado, setClienteSelecionado] = useState<typeof clientesMock[0] | null>(null)

  // Dados do aparelho
  const [tipoAparelho, setTipoAparelho] = useState('celular')
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [cor, setCor] = useState('')
  const [imei, setImei] = useState('')
  const [númeroSerie, setNúmeroSerie] = useState('')
  const [senhaAparelho, setSenhaAparelho] = useState('')
  const [condicaoEntrada, setCondicaoEntrada] = useState('')
  const [acessórios, setAcessórios] = useState('')

  // Problema
  const [problemaRelatado, setProblemaRelatado] = useState('')
  const [observações, setObservações] = useState('')

  // Itens da OS
  const [itensOS, setItensOS] = useState<ItemOS[]>([])
  const [dialogServiçoOpen, setDialogServiçoOpen] = useState(false)
  const [dialogProdutoOpen, setDialogProdutoOpen] = useState(false)

  // Gerar senha mascarada
  const senhaMascarada = senhaAparelho ? '●'.repeat(senhaAparelho.length) : ''

  // Calcular totais
  const totalServiços = itensOS
    .filter(i => i.tipo === 'serviço')
    .reduce((acc, i) => acc + i.valor_unitario * i.quantidade, 0)

  const totalProdutos = itensOS
    .filter(i => i.tipo === 'produto')
    .reduce((acc, i) => acc + i.valor_unitario * i.quantidade, 0)

  const totalGeral = totalServiços + totalProdutos

  // Buscar cliente
  const clientesFiltrados = clientesMock.filter(c =>
    c.nome.toLowerCase().includes(clienteBusca.toLowerCase()) ||
    c.telefone.includes(clienteBusca) ||
    c.cpf.includes(clienteBusca)
  )

  const selecionarCliente = (cliente: typeof clientesMock[0]) => {
    setClienteSelecionado(cliente)
    setClienteId(cliente.id)
    setClienteBusca('')
  }

  // Adicionar serviço
  const adicionarServiço = (serviço: typeof serviçosMock[0]) => {
    const novoItem: ItemOS = {
      id: `s-${Date.now()}`,
      tipo: 'serviço',
      nome: serviço.nome,
      quantidade: 1,
      valor_unitario: serviço.preço,
      valor_custo: 0,
    }
    setItensOS([...itensOS, novoItem])
    setDialogServiçoOpen(false)
    toast.success('Serviço adicionado')
  }

  // Adicionar produto
  const adicionarProduto = (produto: typeof produtosMock[0]) => {
    const novoItem: ItemOS = {
      id: `p-${Date.now()}`,
      tipo: 'produto',
      nome: produto.nome,
      quantidade: 1,
      valor_unitario: produto.preço,
      valor_custo: produto.custo,
    }
    setItensOS([...itensOS, novoItem])
    setDialogProdutoOpen(false)
    toast.success('Produto adicionado')
  }

  // Remover item
  const removerItem = (id: string) => {
    setItensOS(itensOS.filter(i => i.id !== id))
    toast.success('Item removido')
  }

  // Atualizar quantidade
  const atualizarQuantidade = (id: string, quantidade: number) => {
    if (quantidade < 1) return
    setItensOS(itensOS.map(i => i.id === id ? { ...i, quantidade } : i))
  }

  // Salvar OS
  const handleSalvar = async () => {
    // Validações
    if (!clienteSelecionado) {
      toast.error('Selecione um cliente')
      return
    }
    if (!marca || !modelo) {
      toast.error('Informe a marca e modelo do aparelho')
      return
    }
    if (!problemaRelatado) {
      toast.error('Descreva o problema relatado pelo cliente')
      return
    }

    setIsLoading(true)

    try {
      // TODO: Salvar no Supabase
      const osData = {
        cliente_id: clienteSelecionado.id,
        tipo_aparelho: tipoAparelho,
        marca,
        modelo,
        cor,
        imei,
        número_serie: númeroSerie,
        senha_aparelho: senhaAparelho,
        senha_aparelho_masked: senhaMascarada,
        condicao_entrada: condicaoEntrada,
        acessórios,
        problema_relatado: problemaRelatado,
        observações,
        valor_serviços: totalServiços,
        valor_produtos: totalProdutos,
        valor_total: totalGeral,
        itens: itensOS,
      }

      console.log('OS Data:', osData)

      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast.success('Ordem de Serviço criada com sucesso!')
      router.push('/ordens-serviço')
    } catch (error) {
      toast.error('Erro ao criar OS')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Obter marcas baseado no tipo
  const getMarcas = () => {
    if (tipoAparelho === 'videogame') return marcasVideogame
    return marcasCelular
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <div className="flex flex-col">
      <Header title="Nova Ordem de Serviço" />

      <div className="flex-1 space-y-6 p-4 lg:p-6">
        {/* Ações */}
        <div className="flex items-center justify-between">
          <Link href="/ordens-serviço">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir Entrada
            </Button>
            <Button onClick={handleSalvar} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Salvando...' : 'Salvar OS'}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Cliente
                </CardTitle>
                <CardDescription>
                  Selecione ou cadastre o cliente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {clienteSelecionado ? (
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">{clienteSelecionado.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {clienteSelecionado.telefone} | {clienteSelecionado.cpf}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setClienteSelecionado(null)}
                    >
                      Trocar
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nome, telefone ou CPF..."
                        value={clienteBusca}
                        onChange={(e) => setClienteBusca(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    {clienteBusca && (
                      <div className="rounded-lg border divide-y max-h-48 overflow-y-auto">
                        {clientesFiltrados.length === 0 ? (
                          <div className="p-3 text-center text-sm text-muted-foreground">
                            Nenhum cliente encontrado
                          </div>
                        ) : (
                          clientesFiltrados.map(cliente => (
                            <div
                              key={cliente.id}
                              className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer"
                              onClick={() => selecionarCliente(cliente)}
                            >
                              <div>
                                <p className="font-medium">{cliente.nome}</p>
                                <p className="text-sm text-muted-foreground">
                                  {cliente.telefone}
                                </p>
                              </div>
                              <Button variant="ghost" size="sm">
                                Selecionar
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                    <Button variant="outline" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Cadastrar Novo Cliente
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Aparelho */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Dados do Aparelho
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tipo de aparelho */}
                <div className="flex gap-2">
                  {tiposAparelho.map(tipo => (
                    <Button
                      key={tipo.value}
                      variant={tipoAparelho === tipo.value ? 'default' : 'outline'}
                      onClick={() => {
                        setTipoAparelho(tipo.value)
                        setMarca('')
                      }}
                      className="flex-1"
                    >
                      <tipo.icon className="mr-2 h-4 w-4" />
                      {tipo.label}
                    </Button>
                  ))}
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="marca">Marca *</Label>
                    <Select value={marca} onValueChange={setMarca}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a marca" />
                      </SelectTrigger>
                      <SelectContent>
                        {getMarcas().map(m => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="modelo">Modelo *</Label>
                    <Input
                      id="modelo"
                      placeholder="Ex: iPhone 13, Galaxy S22, PS5..."
                      value={modelo}
                      onChange={(e) => setModelo(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cor">Cor</Label>
                    <Input
                      id="cor"
                      placeholder="Ex: Preto, Branco..."
                      value={cor}
                      onChange={(e) => setCor(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imei">IMEI / Serial</Label>
                    <Input
                      id="imei"
                      placeholder="Número de serie ou IMEI"
                      value={imei}
                      onChange={(e) => setImei(e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                {/* Senha do Aparelho - IMPORTANTE */}
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-orange-700">
                    <Lock className="h-5 w-5" />
                    <Label className="text-orange-700 font-medium">
                      Senha do Aparelho
                    </Label>
                  </div>
                  <p className="text-sm text-orange-600">
                    Importante: Anote a senha para acesso durante o reparo
                  </p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showSenha ? 'text' : 'password'}
                        placeholder="Digite a senha do aparelho"
                        value={senhaAparelho}
                        onChange={(e) => setSenhaAparelho(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowSenha(!showSenha)}
                      >
                        {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  {senhaAparelho && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Senha mascarada:</span>
                      <code className="rounded bg-orange-100 px-2 py-1 text-orange-800">
                        {senhaMascarada}
                      </code>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="condicao">Condicao de Entrada</Label>
                  <Textarea
                    id="condicao"
                    placeholder="Descreva o estado fisico do aparelho (arranhoes, amassados, etc.)"
                    value={condicaoEntrada}
                    onChange={(e) => setCondicaoEntrada(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="acessórios">Acessórios Deixados</Label>
                  <Input
                    id="acessórios"
                    placeholder="Ex: Carregador, capa, película..."
                    value={acessórios}
                    onChange={(e) => setAcessórios(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Problema */}
            <Card>
              <CardHeader>
                <CardTitle>Problema Relatado</CardTitle>
                <CardDescription>
                  Descreva o problema informado pelo cliente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="problema">Descrição do Problema *</Label>
                  <Textarea
                    id="problema"
                    placeholder="O que o cliente relatou? Qual o defeito apresentado?"
                    value={problemaRelatado}
                    onChange={(e) => setProblemaRelatado(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observações">Observações Internas</Label>
                  <Textarea
                    id="observações"
                    placeholder="Anotações internas (não aparece para o cliente)"
                    value={observações}
                    onChange={(e) => setObservações(e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Serviços e Produtos */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Serviços e Peças</CardTitle>
                  <CardDescription>
                    Adicione os serviços e peças utilizados
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog open={dialogServiçoOpen} onOpenChange={setDialogServiçoOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Serviço
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Serviço</DialogTitle>
                        <DialogDescription>
                          Selecione o serviço a ser realizado
                        </DialogDescription>
                      </DialogHeader>
                      <div className="max-h-[300px] overflow-y-auto divide-y">
                        {serviçosMock.map(serviço => (
                          <div
                            key={serviço.id}
                            className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer"
                            onClick={() => adicionarServiço(serviço)}
                          >
                            <div>
                              <p className="font-medium">{serviço.nome}</p>
                              <Badge variant="outline" className="text-xs">
                                {serviço.tipo}
                              </Badge>
                            </div>
                            <span className="font-medium">
                              {formatCurrency(serviço.preço)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={dialogProdutoOpen} onOpenChange={setDialogProdutoOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Peca
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Peca/Produto</DialogTitle>
                        <DialogDescription>
                          Selecione a peça ou produto utilizado
                        </DialogDescription>
                      </DialogHeader>
                      <div className="max-h-[300px] overflow-y-auto divide-y">
                        {produtosMock.map(produto => (
                          <div
                            key={produto.id}
                            className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer"
                            onClick={() => adicionarProduto(produto)}
                          >
                            <div>
                              <p className="font-medium">{produto.nome}</p>
                              <p className="text-sm text-muted-foreground">
                                Estoque: {produto.estoque}
                              </p>
                            </div>
                            <span className="font-medium">
                              {formatCurrency(produto.preço)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {itensOS.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <p>Nenhum item adicionado</p>
                    <p className="text-sm">Adicione serviços e peças usando os botoes acima</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="w-[100px]">Qtd</TableHead>
                        <TableHead className="text-right">Valor Unit.</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itensOS.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Badge variant={item.tipo === 'serviço' ? 'default' : 'secondary'}>
                              {item.tipo === 'serviço' ? 'Serviço' : 'Peca'}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.nome}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantidade}
                              onChange={(e) => atualizarQuantidade(item.id, parseInt(e.target.value) || 1)}
                              className="w-16 h-8"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.valor_unitario)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.valor_unitario * item.quantidade)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600"
                              onClick={() => removerItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna Lateral - Resumo */}
          <div className="space-y-6">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Resumo da OS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Serviços</span>
                    <span>{formatCurrency(totalServiços)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Peças/Produtos</span>
                    <span>{formatCurrency(totalProdutos)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span className="text-green-600">{formatCurrency(totalGeral)}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cliente</span>
                    <span className="font-medium">
                      {clienteSelecionado?.nome || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Aparelho</span>
                    <span className="font-medium">
                      {marca && modelo ? `${marca} ${modelo}` : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Itens</span>
                    <span className="font-medium">{itensOS.length}</span>
                  </div>
                </div>

                <Separator />

                <Button className="w-full" onClick={handleSalvar} disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? 'Salvando...' : 'Criar Ordem de Serviço'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
