'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  History,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { clientesService } from '@/services/clientes.service'
import type { Cliente } from '@/types/database'

export default function EditarClientePage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isLoadingCEP, setIsLoadingCEP] = useState(false)

  // Estados do formulario
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [telefone2, setTelefone2] = useState('')
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [cep, setCep] = useState('')
  const [endereco, setEndereco] = useState('')
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('SC')
  const [observacoes, setObservacoes] = useState('')

  // Carregar dados do cliente
  useEffect(() => {
    const carregar = async () => {
      if (!params.id) return
      setIsLoadingData(true)
      try {
        const { data: cliente, error } = await clientesService.buscarPorId(params.id as string)
        if (error) {
          toast.error('Erro ao carregar cliente: ' + error)
          return
        }
        if (cliente) {
          setNome(cliente.nome)
          setTelefone(cliente.telefone || '')
          setTelefone2(cliente.telefone2 || '')
          setEmail(cliente.email || '')
          setCpf(cliente.cpf || '')
          setDataNascimento(cliente.data_nascimento || '')
          setCep(cliente.cep || '')
          setEndereco(cliente.endereco || '')
          setNumero(cliente.numero || '')
          setComplemento(cliente.complemento || '')
          setBairro(cliente.bairro || '')
          setCidade(cliente.cidade || '')
          setEstado(cliente.estado || 'SC')
          setObservacoes(cliente.observacoes || '')
        }
      } catch {
        toast.error('Erro ao carregar cliente')
      } finally {
        setIsLoadingData(false)
      }
    }
    carregar()
  }, [params.id])

  // Formatar telefone
  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  // Formatar CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  // Formatar CEP
  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2')
  }

  // Buscar CEP
  const buscarCEP = async () => {
    const cepLimpo = cep.replace(/\D/g, '')
    if (cepLimpo.length !== 8) {
      toast.error('CEP inválido')
      return
    }

    setIsLoadingCEP(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await response.json()

      if (data.erro) {
        toast.error('CEP não encontrado')
        return
      }

      setEndereco(data.logradouro || '')
      setBairro(data.bairro || '')
      setCidade(data.localidade || '')
      setEstado(data.uf || 'SC')
      toast.success('Endereço preenchido!')
    } catch {
      toast.error('Erro ao buscar CEP')
    } finally {
      setIsLoadingCEP(false)
    }
  }

  // Validar CPF
  const validarCPF = (cpfValue: string) => {
    const numbers = cpfValue.replace(/\D/g, '')
    if (numbers.length !== 11) return false
    if (/^(\d)\1+$/.test(numbers)) return false
    let sum = 0
    for (let i = 0; i < 9; i++) sum += parseInt(numbers[i]) * (10 - i)
    let rest = (sum * 10) % 11
    if (rest === 10) rest = 0
    if (rest !== parseInt(numbers[9])) return false
    sum = 0
    for (let i = 0; i < 10; i++) sum += parseInt(numbers[i]) * (11 - i)
    rest = (sum * 10) % 11
    if (rest === 10) rest = 0
    return rest === parseInt(numbers[10])
  }

  // Salvar cliente
  const handleSalvar = async () => {
    // Validações
    if (!nome.trim()) {
      toast.error('Informe o nome do cliente')
      return
    }
    if (!telefone.trim()) {
      toast.error('Informe o telefone do cliente')
      return
    }
    if (cpf && !validarCPF(cpf)) {
      toast.error('CPF inválido')
      return
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('E-mail inválido')
      return
    }

    setIsLoading(true)

    try {
      const dados = {
        nome,
        telefone,
        telefone2: telefone2 || undefined,
        email: email || undefined,
        cpf: cpf || undefined,
        data_nascimento: dataNascimento || undefined,
        cep: cep || undefined,
        endereco: endereco || undefined,
        numero: numero || undefined,
        complemento: complemento || undefined,
        bairro: bairro || undefined,
        cidade: cidade || undefined,
        estado: estado || undefined,
        observacoes: observacoes || undefined,
      }

      const { error } = await clientesService.atualizar(params.id as string, dados)

      if (error) {
        toast.error('Erro ao atualizar cliente: ' + error)
        return
      }

      toast.success('Cliente atualizado com sucesso!')
      router.push(`/clientes/${params.id}`)
    } catch {
      toast.error('Erro ao atualizar cliente')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex flex-col">
        <Header title="Editar Cliente" />
        <div className="flex-1 flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Header title="Editar Cliente" />

      <div className="flex-1 space-y-6 p-4 lg:p-6">
        {/* Ações */}
        <div className="flex items-center justify-between">
          <Link href={`/clientes/${params.id}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div className="flex gap-2">
            <Link href={`/clientes/${params.id}`}>
              <Button variant="outline">
                <History className="mr-2 h-4 w-4" />
                Ver Histórico
              </Button>
            </Link>
            <Button onClick={handleSalvar} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Formulario Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(formatCPF(e.target.value))}
                      maxLength={14}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                    <Input
                      id="data_nascimento"
                      type="date"
                      value={dataNascimento}
                      onChange={(e) => setDataNascimento(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contato */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone Principal *</Label>
                    <Input
                      id="telefone"
                      placeholder="(00) 00000-0000"
                      value={telefone}
                      onChange={(e) => setTelefone(formatTelefone(e.target.value))}
                      maxLength={15}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone2">Telefone Secundário</Label>
                    <Input
                      id="telefone2"
                      placeholder="(00) 00000-0000"
                      value={telefone2}
                      onChange={(e) => setTelefone2(formatTelefone(e.target.value))}
                      maxLength={15}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Endereço */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cep"
                        placeholder="00000-000"
                        value={cep}
                        onChange={(e) => setCep(formatCEP(e.target.value))}
                        maxLength={9}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" onClick={buscarCEP} disabled={isLoadingCEP}>
                        {isLoadingCEP ? 'Buscando...' : 'Buscar'}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="endereco">Logradouro</Label>
                    <Input
                      id="endereco"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número</Label>
                    <Input
                      id="numero"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      value={complemento}
                      onChange={(e) => setComplemento(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Input
                      id="estado"
                      value={estado}
                      onChange={(e) => setEstado(e.target.value.toUpperCase())}
                      maxLength={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Observações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações sobre o cliente</Label>
                  <textarea
                    id="observacoes"
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Lateral - Resumo */}
          <div className="space-y-6">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nome</span>
                    <span className="font-medium truncate max-w-[150px]">
                      {nome || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">CPF</span>
                    <span className="font-mono">{cpf || '-'}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Telefone</span>
                    <span>{telefone || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">E-mail</span>
                    <span className="truncate max-w-[150px]">{email || '-'}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Aniversário</span>
                    <span>
                      {dataNascimento
                        ? new Date(dataNascimento).toLocaleDateString('pt-BR')
                        : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cidade</span>
                    <span>{cidade ? `${cidade}/${estado}` : '-'}</span>
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
