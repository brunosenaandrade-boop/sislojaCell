'use client'

import { useState, useEffect, useCallback } from 'react'
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
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { usePermissao } from '@/hooks/usePermissao'
import { clientesService } from '@/services/clientes.service'
import type { Cliente } from '@/types/database'

export default function ClientesPage() {
  const { podeExcluirRegistros } = usePermissao()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [aniversariantes, setAniversariantes] = useState<Cliente[]>([])
  const [busca, setBusca] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false)
  const [clienteParaDeletar, setClienteParaDeletar] = useState<string | null>(null)

  const carregarClientes = useCallback(async (termoBusca?: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await clientesService.listar(termoBusca)
      if (error) {
        toast.error('Erro ao carregar clientes: ' + error)
        return
      }
      setClientes(data || [])
    } catch {
      toast.error('Erro ao carregar clientes')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const carregarAniversariantes = useCallback(async () => {
    try {
      const { data, error } = await clientesService.aniversariantes()
      if (error) return
      setAniversariantes(data || [])
    } catch {
      // silently fail for birthday section
    }
  }, [])

  // Initial load
  useEffect(() => {
    carregarClientes()
    carregarAniversariantes()
  }, [carregarClientes, carregarAniversariantes])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      carregarClientes(busca || undefined)
    }, 400)
    return () => clearTimeout(timer)
  }, [busca, carregarClientes])

  const hoje = new Date()

  // Verificar se e aniversário hoje
  const ehAniversarioHoje = (dataNascimento: string) => {
    const nascimento = new Date(dataNascimento)
    return nascimento.getDate() === hoje.getDate() &&
           nascimento.getMonth() === hoje.getMonth()
  }

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  // Confirmar exclusão
  const confirmarDelete = (id: string) => {
    setClienteParaDeletar(id)
    setDialogDeleteOpen(true)
  }

  // Deletar cliente
  const handleDelete = async () => {
    if (!clienteParaDeletar) return
    try {
      const { error } = await clientesService.excluir(clienteParaDeletar)
      if (error) {
        toast.error('Erro ao excluir cliente: ' + error)
        return
      }
      toast.success('Cliente excluído')
      setDialogDeleteOpen(false)
      setClienteParaDeletar(null)
      carregarClientes(busca || undefined)
    } catch {
      toast.error('Erro ao excluir cliente')
    }
  }

  // Exportar CSV
  const exportarCSV = () => {
    const headers = ['Nome', 'Telefone', 'Email', 'CPF', 'Data Nascimento', 'Endereço', 'Cidade']
    const rows = clientes.map(c => [
      c.nome,
      c.telefone || '',
      c.email || '',
      c.cpf || '',
      c.data_nascimento ? formatDate(c.data_nascimento) : '',
      c.endereco || '',
      c.cidade || '',
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
                {clientes.length}
              </div>
              <p className="text-xs text-muted-foreground">Cadastrados e ativos</p>
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
                      variant={cliente.data_nascimento && ehAniversarioHoje(cliente.data_nascimento) ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-primary/20 py-1.5 px-3"
                    >
                      {cliente.data_nascimento && ehAniversarioHoje(cliente.data_nascimento) && (
                        <Cake className="mr-1 h-3 w-3" />
                      )}
                      {cliente.nome} - {cliente.data_nascimento ? formatDate(cliente.data_nascimento) : ''}
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
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      {busca ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  clientes.map((cliente) => (
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
                              {cliente.data_nascimento && ehAniversarioHoje(cliente.data_nascimento) && (
                                <Badge variant="default" className="text-xs">
                                  <Cake className="mr-1 h-3 w-3" />
                                  Aniversário!
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {cliente.cidade || ''}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{cliente.telefone || ''}</div>
                        <div className="text-xs text-muted-foreground">{cliente.email || ''}</div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {cliente.cpf || ''}
                      </TableCell>
                      <TableCell className="text-sm">
                        {cliente.cidade || ''}
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
            )}
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
