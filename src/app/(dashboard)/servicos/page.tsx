'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Wrench,
  Smartphone,
  Gamepad2,
  Clock,
  DollarSign,
  Settings,
  Zap,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { usePermissao } from '@/hooks/usePermissao'
import { servicosService } from '@/services/servicos.service'
import type { Servico } from '@/types/database'

export default function ServicosPage() {
  const { podeExcluirRegistros } = usePermissao()
  const [servicos, setServicos] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false)
  const [servicoParaDeletar, setServicoParaDeletar] = useState<string | null>(null)

  const carregarServicos = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await servicosService.listar()
      if (error) {
        toast.error('Erro ao carregar serviços: ' + error)
      } else {
        setServicos(data || [])
      }
    } catch {
      toast.error('Erro ao carregar serviços')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregarServicos()
  }, [carregarServicos])

  // Filtrar serviços
  const servicosFiltrados = servicos.filter(servico => {
    const matchBusca = servico.nome.toLowerCase().includes(busca.toLowerCase()) ||
                       (servico.descricao || '').toLowerCase().includes(busca.toLowerCase())
    const matchTipo = filtroTipo === 'todos' || servico.tipo === filtroTipo
    return matchBusca && matchTipo
  })

  // Estatísticas
  const totalServicos = servicos.length
  const servicosBasico = servicos.filter(s => s.tipo === 'basico').length
  const servicosAvancado = servicos.filter(s => s.tipo === 'avancado').length

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Formatar tempo
  const formatTempo = (minutos: number) => {
    if (minutos < 60) return `${minutos} min`
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`
  }

  // Badge de tipo
  const getTipoBadge = (tipo: string) => {
    if (tipo === 'basico') {
      return (
        <Badge variant="secondary" className="gap-1">
          <Settings className="h-3 w-3" />
          Básico
        </Badge>
      )
    }
    return (
      <Badge className="gap-1 bg-orange-100 text-orange-700 hover:bg-orange-100">
        <Zap className="h-3 w-3" />
        Avançado
      </Badge>
    )
  }

  // Toggle ativo
  const toggleAtivo = async (id: string) => {
    const servico = servicos.find(s => s.id === id)
    if (!servico) return

    const { error } = await servicosService.atualizar(id, { ativo: !servico.ativo })
    if (error) {
      toast.error('Erro ao atualizar serviço: ' + error)
    } else {
      toast.success(servico.ativo ? 'Serviço desativado' : 'Serviço ativado')
      carregarServicos()
    }
  }

  // Confirmar exclusão
  const confirmarDelete = (id: string) => {
    setServicoParaDeletar(id)
    setDialogDeleteOpen(true)
  }

  // Deletar serviço
  const handleDelete = async () => {
    if (!servicoParaDeletar) return
    const { error } = await servicosService.excluir(servicoParaDeletar)
    if (error) {
      toast.error('Erro ao excluir serviço: ' + error)
    } else {
      toast.success('Serviço excluído')
      carregarServicos()
    }
    setDialogDeleteOpen(false)
    setServicoParaDeletar(null)
  }

  if (loading) {
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
        {/* Ações e Filtros */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar serviço..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="basico">Básico</SelectItem>
                <SelectItem value="avancado">Avançado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Link href="/servicos/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Serviço
            </Button>
          </Link>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Total de Serviços
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalServicos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Básico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{servicosBasico}</div>
              <p className="text-xs text-muted-foreground">serviços</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Avançado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{servicosAvancado}</div>
              <p className="text-xs text-muted-foreground">serviços</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Preço Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {servicos.length > 0
                  ? formatCurrency(servicos.reduce((acc, s) => acc + s.preco_base, 0) / servicos.length)
                  : formatCurrency(0)
                }
              </div>
              <p className="text-xs text-muted-foreground">por serviço</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Serviços */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-center">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Tempo
                  </TableHead>
                  <TableHead className="text-right">Preço Base</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servicosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      {busca || filtroTipo !== 'todos'
                        ? 'Nenhum serviço encontrado com os filtros aplicados.'
                        : 'Nenhum serviço cadastrado.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  servicosFiltrados.map((servico) => (
                    <TableRow key={servico.id} className={!servico.ativo ? 'opacity-50' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                            <Wrench className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{servico.nome}</div>
                            <div className="text-xs text-muted-foreground max-w-[250px] truncate">
                              {servico.descricao}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTipoBadge(servico.tipo)}</TableCell>
                      <TableCell className="text-center">
                        {servico.tempo_estimado ? formatTempo(servico.tempo_estimado) : '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(servico.preco_base)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={servico.ativo ? 'default' : 'secondary'}>
                          {servico.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/servicos/${servico.id}/editar`}>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem onClick={() => toggleAtivo(servico.id)}>
                              <Settings className="mr-2 h-4 w-4" />
                              {servico.ativo ? 'Desativar' : 'Ativar'}
                            </DropdownMenuItem>
                            {podeExcluirRegistros && (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => confirmarDelete(servico.id)}
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
            </div>
          </CardContent>
        </Card>

        {/* Dialog Confirmar Exclusão */}
        <Dialog open={dialogDeleteOpen} onOpenChange={setDialogDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.
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
