'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Edit,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Cake,
  ShoppingCart,
  Wrench,
  DollarSign,
  Clock,
  FileText,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { clientesService } from '@/services/clientes.service'
import type { Cliente } from '@/types/database'

export default function ClienteDetalhePage() {
  const params = useParams()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load client data
  useEffect(() => {
    const carregar = async () => {
      if (!params.id) return
      setIsLoading(true)
      try {
        const { data, error } = await clientesService.buscarPorId(params.id as string)
        if (error) {
          toast.error('Erro ao carregar cliente: ' + error)
          return
        }
        setCliente(data)
      } catch {
        toast.error('Erro ao carregar cliente')
      } finally {
        setIsLoading(false)
      }
    }
    carregar()
  }, [params.id])

  // Verificar se e aniversário hoje
  const hoje = new Date()
  const nascimento = cliente?.data_nascimento ? new Date(cliente.data_nascimento) : null
  const ehAniversarioHoje = nascimento &&
    nascimento.getDate() === hoje.getDate() &&
    nascimento.getMonth() === hoje.getMonth()

  // Calcular idade
  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date()
    const nascimento = new Date(dataNascimento)
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mes = hoje.getMonth() - nascimento.getMonth()
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--
    }
    return idade
  }

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
      aberta: { label: 'Aberta', variant: 'secondary' },
      em_andamento: { label: 'Em Andamento', variant: 'default' },
      aguardando: { label: 'Aguardando', variant: 'outline' },
      finalizada: { label: 'Finalizada', variant: 'default' },
    }
    const config = statusConfig[status] || { label: status, variant: 'outline' }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <div className="flex-1 flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="flex flex-col">
        <div className="flex-1 space-y-6 p-4 lg:p-6">
          <Link href="/clientes">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div className="text-center py-12 text-muted-foreground">
            Cliente não encontrado.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-6 p-4 lg:p-6">
        {/* Ações */}
        <div className="flex items-center justify-between">
          <Link href="/clientes">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <Link href={`/clientes/${params.id}/editar`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Editar Cliente
            </Button>
          </Link>
        </div>

        {/* Cabecalho do Cliente */}
        <Card className={ehAniversarioHoje ? 'border-primary bg-primary/5' : ''}>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-primary">
                  {cliente.nome.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-bold">{cliente.nome}</h2>
                  {ehAniversarioHoje && (
                    <Badge variant="default" className="text-sm">
                      <Cake className="mr-1 h-4 w-4" />
                      Aniversário Hoje!
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">
                  Cliente desde {formatDate(cliente.created_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Informações do Cliente */}
          <div className="space-y-6">
            {/* Contato */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{cliente.telefone || '-'}</span>
                </div>
                {cliente.telefone2 && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{cliente.telefone2}</span>
                  </div>
                )}
                {cliente.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{cliente.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dados Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cliente.cpf && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">CPF</span>
                    <span className="font-mono">{cliente.cpf}</span>
                  </div>
                )}
                {cliente.data_nascimento && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Nascimento</span>
                      <span>{formatDate(cliente.data_nascimento)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Idade</span>
                      <span>{calcularIdade(cliente.data_nascimento)} anos</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Endereço */}
            {cliente.endereco && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Endereço
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <p>{cliente.endereco}{cliente.numero ? `, ${cliente.numero}` : ''}</p>
                    {cliente.complemento && <p>{cliente.complemento}</p>}
                    {cliente.bairro && <p>{cliente.bairro}</p>}
                    <p>{cliente.cidade}/{cliente.estado}</p>
                    {cliente.cep && <p className="text-muted-foreground">{cliente.cep}</p>}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Observações */}
            {cliente.observacoes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Observações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {cliente.observacoes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Histórico */}
          <div className="lg:col-span-2">
            {/* Ações Rápidas */}
            <div className="flex gap-2 mt-6">
              <Link href="/vendas" className="flex-1">
                <Button variant="outline" className="w-full">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Nova Venda
                </Button>
              </Link>
              <Link href="/ordens-servico/nova" className="flex-1">
                <Button variant="outline" className="w-full">
                  <Wrench className="mr-2 h-4 w-4" />
                  Nova OS
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
