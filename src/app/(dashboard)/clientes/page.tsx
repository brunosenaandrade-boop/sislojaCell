'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Users,
  Cake,
  Phone,
  FileDown,
  UserCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { usePermissao } from '@/hooks/usePermissao'

// Clientes mockados
const clientesMock = [
  {
    id: '1',
    nome: 'Joao Silva',
    telefone: '(48) 99999-1111',
    email: 'joao@email.com',
    cpf: '123.456.789-00',
    data_nascimento: '1990-03-15',
    endereço: 'Rua das Flores, 123 - Centro',
    cidade: 'Florianopolis',
    total_compras: 5,
    total_os: 3,
    valor_total: 1250.00,
    created_at: '2024-01-10',
  },
  {
    id: '2',
    nome: 'Maria Santos',
    telefone: '(48) 99999-2222',
    email: 'maria@email.com',
    cpf: '987.654.321-00',
    data_nascimento: '1985-01-27',
    endereço: 'Av. Brasil, 456 - Bairro Novo',
    cidade: 'Florianopolis',
    total_compras: 12,
    total_os: 8,
    valor_total: 3500.00,
    created_at: '2023-06-15',
  },
  {
    id: '3',
    nome: 'Pedro Oliveira',
    telefone: '(48) 99999-3333',
    email: 'pedro@email.com',
    cpf: '456.789.123-00',
    data_nascimento: '1992-07-20',
    endereço: 'Rua Principal, 789',
    cidade: 'Sao Jose',
    total_compras: 2,
    total_os: 1,
    valor_total: 450.00,
    created_at: '2024-01-20',
  },
  {
    id: '4',
    nome: 'Ana Costa',
    telefone: '(48) 99999-4444',
    email: 'ana@email.com',
    cpf: '321.654.987-00',
    data_nascimento: '1988-01-28',
    endereço: 'Rua das Palmeiras, 321',
    cidade: 'Florianopolis',
    total_compras: 8,
    total_os: 5,
    valor_total: 2100.00,
    created_at: '2023-09-01',
  },
  {
    id: '5',
    nome: 'Carlos Ferreira',
    telefone: '(48) 99999-5555',
    email: 'carlos@email.com',
    cpf: '654.321.987-00',
    data_nascimento: '1995-12-10',
    endereço: 'Av. Central, 555',
    cidade: 'Palhoca',
    total_compras: 3,
    total_os: 2,
    valor_total: 890.00,
    created_at: '2024-01-05',
  },
]

export default function ClientesPage() {
  const { podeExcluirRegistros } = usePermissao()
  const [clientes, setClientes] = useState(clientesMock)
  const [busca, setBusca] = useState('')
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false)
  const [clienteParaDeletar, setClienteParaDeletar] = useState<string | null>(null)

  // Filtrar clientes
  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
    cliente.telefone.includes(busca) ||
    cliente.cpf.includes(busca) ||
    cliente.email.toLowerCase().includes(busca.toLowerCase())
  )

  // Aniversariantes da semana
  const hoje = new Date()
  const aniversariantes = clientes.filter(cliente => {
    if (!cliente.data_nascimento) return false
    const nascimento = new Date(cliente.data_nascimento)
    const diaCliente = nascimento.getDate()
    const mêsCliente = nascimento.getMonth()

    // Verificar se o aniversário esta nos próximos 7 dias
    for (let i = 0; i < 7; i++) {
      const dia = new Date(hoje)
      dia.setDate(dia.getDate() + i)
      if (dia.getDate() === diaCliente && dia.getMonth() === mêsCliente) {
        return true
      }
    }
    return false
  })

  // Verificar se e aniversário hoje
  const ehAniversárioHoje = (dataNascimento: string) => {
    const nascimento = new Date(dataNascimento)
    return nascimento.getDate() === hoje.getDate() &&
           nascimento.getMonth() === hoje.getMonth()
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

  // Confirmar exclusão
  const confirmarDelete = (id: string) => {
    const cliente = clientes.find(c => c.id === id)
    if (cliente && (cliente.total_compras > 0 || cliente.total_os > 0)) {
      toast.error('Não é possível excluir cliente com compras ou OS vinculadas')
      return
    }
    setClienteParaDeletar(id)
    setDialogDeleteOpen(true)
  }

  // Deletar cliente
  const handleDelete = () => {
    if (!clienteParaDeletar) return
    setClientes(clientes.filter(c => c.id !== clienteParaDeletar))
    toast.success('Cliente excluído')
    setDialogDeleteOpen(false)
    setClienteParaDeletar(null)
  }

  // Exportar CSV
  const exportarCSV = () => {
    const headers = ['Nome', 'Telefone', 'Email', 'CPF', 'Data Nascimento', 'Endereço', 'Cidade']
    const rows = clientes.map(c => [
      c.nome,
      c.telefone,
      c.email,
      c.cpf,
      c.data_nascimento ? formatDate(c.data_nascimento) : '',
      c.endereço,
      c.cidade,
    ])

    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    toast.success('Lista exportada com sucesso!')
  }

  return (
    <div className="flex flex-col">
      <Header title="Clientes" />

      <div className="flex-1 space-y-6 p-4 lg:p-6">
        {/* Ações */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone, CPF ou email..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportarCSV}>
              <FileDown className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Link href="/clientes/novo">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Cliente
              </Button>
            </Link>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total de Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientes.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Clientes Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clientes.filter(c => c.total_compras > 0 || c.total_os > 0).length}
              </div>
              <p className="text-xs text-muted-foreground">Com compras ou OS</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Cake className="h-4 w-4" />
                Aniversariantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{aniversariantes.length}</div>
              <p className="text-xs text-muted-foreground">Próximos 7 dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Novos este mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clientes.filter(c => {
                  const data = new Date(c.created_at)
                  return data.getMonth() === hoje.getMonth() &&
                         data.getFullYear() === hoje.getFullYear()
                }).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Aniversariantes da Semana */}
        {aniversariantes.length > 0 && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Cake className="h-4 w-4 text-primary" />
                Aniversariantes da Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {aniversariantes.map(cliente => (
                  <Link key={cliente.id} href={`/clientes/${cliente.id}`}>
                    <Badge
                      variant={ehAniversárioHoje(cliente.data_nascimento) ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-primary/20 py-1.5 px-3"
                    >
                      {ehAniversárioHoje(cliente.data_nascimento) && (
                        <Cake className="mr-1 h-3 w-3" />
                      )}
                      {cliente.nome} - {formatDate(cliente.data_nascimento)}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabela de Clientes */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead className="text-center">Compras</TableHead>
                  <TableHead className="text-center">OS</TableHead>
                  <TableHead className="text-right">Total Gasto</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientesFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      {busca ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  clientesFiltrados.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {cliente.nome.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {cliente.nome}
                              {cliente.data_nascimento && ehAniversárioHoje(cliente.data_nascimento) && (
                                <Badge variant="default" className="text-xs">
                                  <Cake className="mr-1 h-3 w-3" />
                                  Aniversário!
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {cliente.cidade}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{cliente.telefone}</div>
                        <div className="text-xs text-muted-foreground">{cliente.email}</div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {cliente.cpf}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{cliente.total_compras}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{cliente.total_os}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(cliente.valor_total)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/clientes/${cliente.id}`}>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/clientes/${cliente.id}/editar`}>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                            </Link>
                            {podeExcluirRegistros && (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => confirmarDelete(cliente.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
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
                Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
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
