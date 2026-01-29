'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
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
} from 'lucide-react'

// Cliente mockado
const clienteMock = {
  id: '1',
  nome: 'Maria Santos',
  telefone: '(48) 99999-2222',
  telefone2: '(48) 3333-4444',
  email: 'maria@email.com',
  cpf: '987.654.321-00',
  data_nascimento: '1985-01-27',
  cep: '88000-000',
  endereço: 'Av. Brasil, 456',
  número: '456',
  complemento: 'Apto 302',
  bairro: 'Centro',
  cidade: 'Florianopolis',
  estado: 'SC',
  observações: 'Cliente VIP. Sempre paga em dia.',
  created_at: '2023-06-15',
  updated_at: '2024-01-20',
}

// Histórico de compras mockado
const comprasMock = [
  {
    id: 'V001',
    data: '2024-01-20',
    produtos: ['Carregador USB-C', 'Cabo Lightning'],
    valor_total: 89.90,
    forma_pagamento: 'PIX',
  },
  {
    id: 'V002',
    data: '2024-01-10',
    produtos: ['Película Galaxy S23', 'Capa Silicone'],
    valor_total: 65.00,
    forma_pagamento: 'Cartão Crédito',
  },
  {
    id: 'V003',
    data: '2023-12-15',
    produtos: ['Fone Bluetooth TWS'],
    valor_total: 120.00,
    forma_pagamento: 'Dinheiro',
  },
]

// Histórico de OS mockado
const osMock = [
  {
    id: 'OS001',
    data: '2024-01-18',
    aparelho: 'iPhone 13',
    serviço: 'Troca de Tela',
    status: 'finalizada',
    valor_total: 350.00,
  },
  {
    id: 'OS002',
    data: '2024-01-05',
    aparelho: 'Samsung S22',
    serviço: 'Troca de Bateria',
    status: 'finalizada',
    valor_total: 180.00,
  },
  {
    id: 'OS003',
    data: '2023-11-20',
    aparelho: 'PS5',
    serviço: 'Limpeza e Manutenção',
    status: 'finalizada',
    valor_total: 150.00,
  },
]

export default function ClienteDetalhePage() {
  const params = useParams()
  const [cliente, setCliente] = useState(clienteMock)
  const [compras] = useState(comprasMock)
  const [ordens] = useState(osMock)

  // Calcular estatísticas
  const totalCompras = compras.reduce((acc, c) => acc + c.valor_total, 0)
  const totalOS = ordens.reduce((acc, o) => acc + o.valor_total, 0)
  const totalGeral = totalCompras + totalOS

  // Verificar se e aniversário hoje
  const hoje = new Date()
  const nascimento = cliente.data_nascimento ? new Date(cliente.data_nascimento) : null
  const ehAniversárioHoje = nascimento &&
    nascimento.getDate() === hoje.getDate() &&
    nascimento.getMonth() === hoje.getMonth()

  // Calcular idade
  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date()
    const nascimento = new Date(dataNascimento)
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mês = hoje.getMonth() - nascimento.getMonth()
    if (mês < 0 || (mês === 0 && hoje.getDate() < nascimento.getDate())) {
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

  return (
    <div className="flex flex-col">
      <Header title="Detalhes do Cliente" />

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
        <Card className={ehAniversárioHoje ? 'border-primary bg-primary/5' : ''}>
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
                  {ehAniversárioHoje && (
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
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Total gasto</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalGeral)}
                </div>
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
                  <span>{cliente.telefone}</span>
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
            {cliente.endereço && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Endereço
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <p>{cliente.endereço}, {cliente.número}</p>
                    {cliente.complemento && <p>{cliente.complemento}</p>}
                    <p>{cliente.bairro}</p>
                    <p>{cliente.cidade}/{cliente.estado}</p>
                    {cliente.cep && <p className="text-muted-foreground">{cliente.cep}</p>}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Observações */}
            {cliente.observações && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Observações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {cliente.observações}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Histórico */}
          <div className="lg:col-span-2">
            {/* Cards de Estatísticas */}
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Compras
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{compras.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(totalCompras)} total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Ordens de Serviço
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{ordens.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(totalOS)} total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Total Geral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalGeral)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    em {compras.length + ordens.length} transações
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs de Histórico */}
            <Card>
              <Tabs defaultValue="compras">
                <CardHeader>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="compras">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Compras ({compras.length})
                    </TabsTrigger>
                    <TabsTrigger value="os">
                      <Wrench className="mr-2 h-4 w-4" />
                      Ordens de Serviço ({ordens.length})
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent>
                  {/* Tab Compras */}
                  <TabsContent value="compras" className="mt-0">
                    {compras.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhuma compra registrada
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Produtos</TableHead>
                            <TableHead>Pagamento</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {compras.map((compra) => (
                            <TableRow key={compra.id}>
                              <TableCell className="font-mono">{compra.id}</TableCell>
                              <TableCell>{formatDate(compra.data)}</TableCell>
                              <TableCell>
                                <div className="max-w-[200px]">
                                  {compra.produtos.join(', ')}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{compra.forma_pagamento}</Badge>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(compra.valor_total)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>

                  {/* Tab OS */}
                  <TabsContent value="os" className="mt-0">
                    {ordens.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhuma ordem de serviço registrada
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>OS</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Aparelho</TableHead>
                            <TableHead>Serviço</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ordens.map((os) => (
                            <TableRow key={os.id}>
                              <TableCell>
                                <Link
                                  href={`/ordens-serviço/${os.id}`}
                                  className="font-mono text-primary hover:underline flex items-center gap-1"
                                >
                                  {os.id}
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                              </TableCell>
                              <TableCell>{formatDate(os.data)}</TableCell>
                              <TableCell>{os.aparelho}</TableCell>
                              <TableCell>{os.serviço}</TableCell>
                              <TableCell>{getStatusBadge(os.status)}</TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(os.valor_total)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>

            {/* Ações Rápidas */}
            <div className="flex gap-2 mt-6">
              <Link href="/vendas" className="flex-1">
                <Button variant="outline" className="w-full">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Nova Venda
                </Button>
              </Link>
              <Link href="/ordens-serviço/nova" className="flex-1">
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
