'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  Grid3x3,
  Hash,
  KeyRound,
  ShieldOff,
  Loader2,
  Tag,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { PatternLock } from '@/components/ui/pattern-lock'
import type { Cliente, Servico, Produto, OrdemServico, ItemOS } from '@/types/database'
import { clientesService } from '@/services/clientes.service'
import { servicosService } from '@/services/servicos.service'
import { produtosService } from '@/services/produtos.service'
import { ordensServicoService } from '@/services/ordens-servico.service'

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

interface ItemOSLocal {
  id: string
  tipo: 'servico' | 'produto'
  nome: string
  quantidade: number
  valor_unitario: number
  valor_custo: number
  servico_id?: string
  produto_id?: string
  isNew?: boolean // para diferenciar itens novos dos existentes
}

export default function EditarOSPage() {
  const router = useRouter()
  const params = useParams()
  const osId = params.id as string

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [showSenha, setShowSenha] = useState(false)
  const [osOriginal, setOsOriginal] = useState<OrdemServico | null>(null)

  // Dados carregados do Supabase
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])

  // Estados do formulario
  const [clienteId, setClienteId] = useState('')
  const [clienteBusca, setClienteBusca] = useState('')
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)

  // Dados do aparelho
  const [tipoAparelho, setTipoAparelho] = useState('celular')
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [cor, setCor] = useState('')
  const [imei, setImei] = useState('')
  const [numeroSerie, setNumeroSerie] = useState('')
  const [tipoDesbloqueio, setTipoDesbloqueio] = useState<string>('sem_senha')
  const [padraoDesbloqueio, setPadraoDesbloqueio] = useState<number[]>([])
  const [pinDesbloqueio, setPinDesbloqueio] = useState('')
  const [senhaAparelho, setSenhaAparelho] = useState('')
  const [condicaoEntrada, setCondicaoEntrada] = useState('')
  const [acessorios, setAcessorios] = useState('')

  // Problema
  const [problemaRelatado, setProblemaRelatado] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [diagnostico, setDiagnostico] = useState('')

  // Desconto
  const [desconto, setDesconto] = useState('')

  // Itens da OS
  const [itensOS, setItensOS] = useState<ItemOSLocal[]>([])
  const [itensRemovidos, setItensRemovidos] = useState<string[]>([]) // IDs dos itens removidos
  const [dialogServicoOpen, setDialogServicoOpen] = useState(false)
  const [dialogProdutoOpen, setDialogProdutoOpen] = useState(false)

  // Carregar OS existente e dados auxiliares
  useEffect(() => {
    const carregarDados = async () => {
      setIsLoadingData(true)
      try {
        // Carregar OS existente
        const osRes = await ordensServicoService.buscarPorId(osId)
        if (osRes.error || !osRes.data) {
          toast.error('Erro ao carregar OS: ' + (osRes.error || 'Nao encontrada'))
          router.push('/ordens-servico')
          return
        }

        const os = osRes.data
        setOsOriginal(os)

        // Carregar dados auxiliares
        const [clientesRes, servicosRes, produtosRes] = await Promise.all([
          clientesService.listar(),
          servicosService.listar(),
          produtosService.listar(),
        ])

        if (clientesRes.data) setClientes(clientesRes.data)
        if (servicosRes.data) setServicos(servicosRes.data)
        if (produtosRes.data) setProdutos(produtosRes.data)

        // Preencher campos do formulario com dados da OS
        setClienteId(os.cliente_id || '')
        if (os.cliente) {
          setClienteSelecionado(os.cliente)
        }

        setTipoAparelho(os.tipo_aparelho || 'celular')
        setMarca(os.marca || '')
        setModelo(os.modelo || '')
        setCor(os.cor || '')
        setImei(os.imei || '')
        setNumeroSerie(os.numero_serie || '')
        setTipoDesbloqueio(os.tipo_desbloqueio || 'sem_senha')
        setPadraoDesbloqueio(os.padrao_desbloqueio || [])
        setPinDesbloqueio(os.pin_desbloqueio || '')
        setSenhaAparelho(os.senha_aparelho || '')
        setCondicaoEntrada(os.condicao_entrada || '')
        setAcessorios(os.acessorios || '')
        setProblemaRelatado(os.problema_relatado || '')
        setObservacoes(os.observacoes || '')
        setDiagnostico(os.diagnostico || '')
        if (os.valor_desconto && os.valor_desconto > 0) {
          setDesconto(String(os.valor_desconto))
        }

        // Carregar itens existentes
        if (os.itens && os.itens.length > 0) {
          const itensCarregados: ItemOSLocal[] = os.itens.map((item: ItemOS) => ({
            id: item.id,
            tipo: item.tipo,
            nome: item.descricao,
            quantidade: item.quantidade,
            valor_unitario: item.valor_unitario,
            valor_custo: item.valor_custo || 0,
            servico_id: item.servico_id || undefined,
            produto_id: item.produto_id || undefined,
            isNew: false,
          }))
          setItensOS(itensCarregados)
        }
      } catch {
        toast.error('Erro ao carregar dados')
        router.push('/ordens-servico')
      } finally {
        setIsLoadingData(false)
      }
    }
    carregarDados()
  }, [osId, router])

  // Calcular totais
  const totalServicos = itensOS
    .filter(i => i.tipo === 'servico')
    .reduce((acc, i) => acc + i.valor_unitario * i.quantidade, 0)

  const totalProdutos = itensOS
    .filter(i => i.tipo === 'produto')
    .reduce((acc, i) => acc + i.valor_unitario * i.quantidade, 0)

  const totalGeral = totalServicos + totalProdutos

  const descontoValor = Math.min(Math.max(parseFloat(desconto) || 0, 0), totalGeral)
  const totalFinal = totalGeral - descontoValor

  // Buscar cliente
  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(clienteBusca.toLowerCase()) ||
    (c.telefone && c.telefone.includes(clienteBusca)) ||
    (c.cpf && c.cpf.includes(clienteBusca))
  )

  const selecionarCliente = (cliente: Cliente) => {
    setClienteSelecionado(cliente)
    setClienteId(cliente.id)
    setClienteBusca('')
  }

  // Adicionar servico
  const adicionarServico = (servico: Servico) => {
    const novoItem: ItemOSLocal = {
      id: `new-s-${Date.now()}`,
      tipo: 'servico',
      nome: servico.nome,
      quantidade: 1,
      valor_unitario: servico.preco_base,
      valor_custo: 0,
      servico_id: servico.id,
      isNew: true,
    }
    setItensOS([...itensOS, novoItem])
    setDialogServicoOpen(false)
    toast.success('Servico adicionado')
  }

  // Adicionar produto
  const adicionarProduto = (produto: Produto) => {
    const novoItem: ItemOSLocal = {
      id: `new-p-${Date.now()}`,
      tipo: 'produto',
      nome: produto.nome,
      quantidade: 1,
      valor_unitario: produto.preco_venda,
      valor_custo: produto.custo,
      produto_id: produto.id,
      isNew: true,
    }
    setItensOS([...itensOS, novoItem])
    setDialogProdutoOpen(false)
    toast.success('Produto adicionado')
  }

  // Remover item
  const removerItem = (id: string) => {
    const item = itensOS.find(i => i.id === id)
    if (item && !item.isNew) {
      // Item existente no banco - marcar para remocao
      setItensRemovidos([...itensRemovidos, id])
    }
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
    // Validacoes
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

    // Validar campos de desbloqueio
    if (tipoDesbloqueio === 'padrao' && padraoDesbloqueio.length === 0) {
      toast.error('Desenhe o padrao de desbloqueio do aparelho')
      return
    }
    if (tipoDesbloqueio === 'pin' && !pinDesbloqueio.trim()) {
      toast.error('Informe o PIN de desbloqueio do aparelho')
      return
    }
    if (tipoDesbloqueio === 'senha' && !senhaAparelho.trim()) {
      toast.error('Informe a senha de desbloqueio do aparelho')
      return
    }

    setIsLoading(true)

    try {
      // Atualizar dados da OS
      const osData: Record<string, unknown> = {
        cliente_id: clienteSelecionado.id,
        tipo_aparelho: tipoAparelho,
        marca,
        modelo,
        cor: cor || null,
        imei: imei || null,
        numero_serie: numeroSerie || null,
        tipo_desbloqueio: tipoDesbloqueio as 'sem_senha' | 'padrao' | 'pin' | 'senha',
        senha_aparelho: tipoDesbloqueio === 'senha' ? senhaAparelho : null,
        pin_desbloqueio: tipoDesbloqueio === 'pin' ? pinDesbloqueio : null,
        padrao_desbloqueio: tipoDesbloqueio === 'padrao' ? padraoDesbloqueio : null,
        condicao_entrada: condicaoEntrada || null,
        acessorios: acessorios || null,
        problema_relatado: problemaRelatado,
        observacoes: observacoes || null,
        diagnostico: diagnostico || null,
        valor_servicos: totalServicos,
        valor_produtos: totalProdutos,
        valor_desconto: descontoValor,
        valor_total: totalFinal,
      }

      const { error } = await ordensServicoService.atualizar(osId, osData as Partial<OrdemServico>)
      if (error) {
        toast.error('Erro ao atualizar OS: ' + error)
        return
      }

      // Remover itens marcados para remocao
      for (const itemId of itensRemovidos) {
        await ordensServicoService.removerItem(itemId)
      }

      // Adicionar novos itens
      const novosItens = itensOS.filter(i => i.isNew)
      for (const item of novosItens) {
        await ordensServicoService.adicionarItem({
          os_id: osId,
          tipo: item.tipo,
          servico_id: item.servico_id,
          produto_id: item.produto_id,
          descricao: item.nome,
          quantidade: item.quantidade,
          valor_unitario: item.valor_unitario,
          valor_custo: item.valor_custo,
          valor_total: item.valor_unitario * item.quantidade,
        })
      }

      toast.success('Ordem de Servico atualizada com sucesso!')
      router.push(`/ordens-servico/${osId}`)
    } catch {
      toast.error('Erro ao atualizar OS')
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

  if (isLoadingData) {
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
        {/* Acoes */}
        <div className="flex items-center justify-between">
          <Link href={`/ordens-servico/${osId}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/ordens-servico/${osId}`)}
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button onClick={handleSalvar} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Salvando...' : 'Salvar Alteracoes'}
            </Button>
          </div>
        </div>

        {/* Numero da OS */}
        {osOriginal && (
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  OS #{osOriginal.numero}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Editando ordem de servico
              </p>
            </CardContent>
          </Card>
        )}

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
                  Selecione ou altere o cliente
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
                    <Link href="/clientes/novo">
                      <Button variant="outline" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Cadastrar Novo Cliente
                      </Button>
                    </Link>
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
                      placeholder="Numero de serie ou IMEI"
                      value={imei}
                      onChange={(e) => setImei(e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                {/* Desbloqueio do Aparelho */}
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 space-y-4">
                  <div className="flex items-center gap-2 text-orange-700">
                    <Lock className="h-5 w-5" />
                    <Label className="text-orange-700 font-medium">
                      Desbloqueio do Aparelho
                    </Label>
                  </div>
                  <p className="text-sm text-orange-600">
                    Registre a forma de desbloqueio para o tecnico acessar durante o reparo
                  </p>

                  {/* Seletor de tipo de desbloqueio */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { value: 'sem_senha', label: 'Sem Senha', icon: ShieldOff },
                      { value: 'padrao', label: 'Padrao', icon: Grid3x3 },
                      { value: 'pin', label: 'PIN', icon: Hash },
                      { value: 'senha', label: 'Senha', icon: KeyRound },
                    ].map(tipo => (
                      <Button
                        key={tipo.value}
                        type="button"
                        variant={tipoDesbloqueio === tipo.value ? 'default' : 'outline'}
                        className={`flex-col h-auto py-3 gap-1 ${tipoDesbloqueio === tipo.value ? '' : 'bg-white/80'}`}
                        onClick={() => setTipoDesbloqueio(tipo.value)}
                      >
                        <tipo.icon className="h-5 w-5" />
                        <span className="text-xs">{tipo.label}</span>
                      </Button>
                    ))}
                  </div>

                  {/* Campo condicional baseado no tipo */}
                  {tipoDesbloqueio === 'padrao' && (
                    <div className="flex flex-col items-center gap-2 pt-2">
                      <p className="text-sm text-orange-700 font-medium">
                        Clique nos pontos na ordem do padrao de desbloqueio
                      </p>
                      <PatternLock
                        value={padraoDesbloqueio}
                        onChange={setPadraoDesbloqueio}
                        size={220}
                      />
                    </div>
                  )}

                  {tipoDesbloqueio === 'pin' && (
                    <div className="space-y-2">
                      <Label className="text-orange-700">PIN Numerico</Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        maxLength={8}
                        placeholder="Ex: 1234"
                        value={pinDesbloqueio}
                        onChange={(e) => setPinDesbloqueio(e.target.value.replace(/\D/g, ''))}
                        className="bg-white/80 text-center text-lg tracking-[0.5em] font-mono"
                      />
                    </div>
                  )}

                  {tipoDesbloqueio === 'senha' && (
                    <div className="space-y-2">
                      <Label className="text-orange-700">Senha</Label>
                      <div className="relative">
                        <Input
                          type={showSenha ? 'text' : 'password'}
                          placeholder="Digite a senha do aparelho"
                          value={senhaAparelho}
                          onChange={(e) => setSenhaAparelho(e.target.value)}
                          className="bg-white/80 pr-10"
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
                  <Label htmlFor="acessorios">Acessorios Deixados</Label>
                  <Input
                    id="acessorios"
                    placeholder="Ex: Carregador, capa, pelicula..."
                    value={acessorios}
                    onChange={(e) => setAcessorios(e.target.value)}
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
                  <Label htmlFor="problema">Descricao do Problema *</Label>
                  <Textarea
                    id="problema"
                    placeholder="O que o cliente relatou? Qual o defeito apresentado?"
                    value={problemaRelatado}
                    onChange={(e) => setProblemaRelatado(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diagnostico">Diagnostico Tecnico</Label>
                  <Textarea
                    id="diagnostico"
                    placeholder="Diagnostico feito pelo tecnico"
                    value={diagnostico}
                    onChange={(e) => setDiagnostico(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observacoes Internas</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Anotacoes internas (nao aparece para o cliente)"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Servicos e Produtos */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Servicos e Pecas</CardTitle>
                  <CardDescription>
                    Adicione os servicos e pecas utilizados
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog open={dialogServicoOpen} onOpenChange={setDialogServicoOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Servico
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Servico</DialogTitle>
                        <DialogDescription>
                          Selecione o servico a ser realizado
                        </DialogDescription>
                      </DialogHeader>
                      <div className="max-h-[300px] overflow-y-auto divide-y">
                        {servicos.map(servico => (
                          <div
                            key={servico.id}
                            className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer"
                            onClick={() => adicionarServico(servico)}
                          >
                            <div>
                              <p className="font-medium">{servico.nome}</p>
                              <Badge variant="outline" className="text-xs">
                                {servico.tipo}
                              </Badge>
                            </div>
                            <span className="font-medium">
                              {formatCurrency(servico.preco_base)}
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
                          Selecione a peca ou produto utilizado
                        </DialogDescription>
                      </DialogHeader>
                      <div className="max-h-[300px] overflow-y-auto divide-y">
                        {produtos.map(produto => (
                          <div
                            key={produto.id}
                            className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer"
                            onClick={() => adicionarProduto(produto)}
                          >
                            <div>
                              <p className="font-medium">{produto.nome}</p>
                              <p className="text-sm text-muted-foreground">
                                Estoque: {produto.estoque_atual}
                              </p>
                            </div>
                            <span className="font-medium">
                              {formatCurrency(produto.preco_venda)}
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
                    <p className="text-sm">Adicione servicos e pecas usando os botoes acima</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descricao</TableHead>
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
                            <Badge variant={item.tipo === 'servico' ? 'default' : 'secondary'}>
                              {item.tipo === 'servico' ? 'Servico' : 'Peca'}
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
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna Lateral - Resumo */}
          <div className="hidden lg:block space-y-6">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Resumo da OS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Servicos</span>
                    <span>{formatCurrency(totalServicos)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pecas/Produtos</span>
                    <span>{formatCurrency(totalProdutos)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground shrink-0">Desconto</span>
                    <div className="flex-1 flex items-center gap-1">
                      <span className="text-sm text-muted-foreground">R$</span>
                      <Input type="number" min="0" step="0.01" placeholder="0,00"
                        value={desconto} onChange={(e) => setDesconto(e.target.value)}
                        className="h-7 text-sm text-right" />
                    </div>
                  </div>
                  {descontoValor > 0 && (
                    <div className="flex justify-between text-sm text-red-500">
                      <span>Desconto</span>
                      <span>- {formatCurrency(descontoValor)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span className="text-green-600">{formatCurrency(totalFinal)}</span>
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
                  {isLoading ? 'Salvando...' : 'Salvar Alteracoes'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
