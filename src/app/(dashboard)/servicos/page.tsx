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
} from 'lucide-react'
import { toast } from 'sonner'
import { usePermissao } from '@/hooks/usePermissao'

// Tipos de serviço
type TipoServiço = 'celular' | 'videogame'
type NivelServiço = 'básico' | 'avançado'

// Serviços mockados
const serviçosMock = [
  {
    id: '1',
    nome: 'Troca de Tela',
    descrição: 'Substituição completa do display e touchscreen',
    tipo: 'celular' as TipoServiço,
    nivel: 'avançado' as NivelServiço,
    preço_base: 150.00,
    tempo_estimado: 60,
    ativo: true,
    total_realizados: 45,
  },
  {
    id: '2',
    nome: 'Troca de Bateria',
    descrição: 'Substituição da bateria por uma nova original ou compativel',
    tipo: 'celular' as TipoServiço,
    nivel: 'básico' as NivelServiço,
    preço_base: 80.00,
    tempo_estimado: 30,
    ativo: true,
    total_realizados: 78,
  },
  {
    id: '3',
    nome: 'Troca de Conector de Carga',
    descrição: 'Reparo ou substituição do conector USB/Lightning',
    tipo: 'celular' as TipoServiço,
    nivel: 'avançado' as NivelServiço,
    preço_base: 100.00,
    tempo_estimado: 45,
    ativo: true,
    total_realizados: 32,
  },
  {
    id: '4',
    nome: 'Limpeza Interna',
    descrição: 'Limpeza completa de poeira e sujeira interna',
    tipo: 'videogame' as TipoServiço,
    nivel: 'básico' as NivelServiço,
    preço_base: 80.00,
    tempo_estimado: 40,
    ativo: true,
    total_realizados: 56,
  },
  {
    id: '5',
    nome: 'Troca de Pasta Térmica',
    descrição: 'Substituição da pasta térmica do processador',
    tipo: 'videogame' as TipoServiço,
    nivel: 'básico' as NivelServiço,
    preço_base: 100.00,
    tempo_estimado: 50,
    ativo: true,
    total_realizados: 41,
  },
  {
    id: '6',
    nome: 'Reparo de Placa',
    descrição: 'Diagnóstico e reparo de componentes na placa-mae',
    tipo: 'videogame' as TipoServiço,
    nivel: 'avançado' as NivelServiço,
    preço_base: 250.00,
    tempo_estimado: 120,
    ativo: true,
    total_realizados: 18,
  },
  {
    id: '7',
    nome: 'Troca de Botoes',
    descrição: 'Substituição de botoes de volume, power ou home',
    tipo: 'celular' as TipoServiço,
    nivel: 'básico' as NivelServiço,
    preço_base: 60.00,
    tempo_estimado: 25,
    ativo: true,
    total_realizados: 23,
  },
  {
    id: '8',
    nome: 'Reparo HDMI',
    descrição: 'Reparo ou substituição da porta HDMI',
    tipo: 'videogame' as TipoServiço,
    nivel: 'avançado' as NivelServiço,
    preço_base: 180.00,
    tempo_estimado: 90,
    ativo: false,
    total_realizados: 12,
  },
]

export default function ServiçosPage() {
  const { podeExcluirRegistros } = usePermissao()
  const [serviços, setServiços] = useState(serviçosMock)
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [filtroNivel, setFiltroNivel] = useState<string>('todos')
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false)
  const [serviçoParaDeletar, setServiçoParaDeletar] = useState<string | null>(null)

  // Filtrar serviços
  const serviçosFiltrados = serviços.filter(serviço => {
    const matchBusca = serviço.nome.toLowerCase().includes(busca.toLowerCase()) ||
                       serviço.descrição.toLowerCase().includes(busca.toLowerCase())
    const matchTipo = filtroTipo === 'todos' || serviço.tipo === filtroTipo
    const matchNivel = filtroNivel === 'todos' || serviço.nivel === filtroNivel
    return matchBusca && matchTipo && matchNivel
  })

  // Estatísticas
  const totalServiços = serviços.length
  const serviçosAtivos = serviços.filter(s => s.ativo).length
  const serviçosCelular = serviços.filter(s => s.tipo === 'celular').length
  const serviçosVideogame = serviços.filter(s => s.tipo === 'videogame').length
  const totalRealizados = serviços.reduce((acc, s) => acc + s.total_realizados, 0)

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
  const getTipoBadge = (tipo: TipoServiço) => {
    if (tipo === 'celular') {
      return (
        <Badge variant="outline" className="gap-1">
          <Smartphone className="h-3 w-3" />
          Celular
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="gap-1">
        <Gamepad2 className="h-3 w-3" />
        Videogame
      </Badge>
    )
  }

  // Badge de nivel
  const getNivelBadge = (nivel: NivelServiço) => {
    if (nivel === 'básico') {
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
  const toggleAtivo = (id: string) => {
    setServiços(serviços.map(s =>
      s.id === id ? { ...s, ativo: !s.ativo } : s
    ))
    const serviço = serviços.find(s => s.id === id)
    toast.success(serviço?.ativo ? 'Serviço desativado' : 'Serviço ativado')
  }

  // Confirmar exclusão
  const confirmarDelete = (id: string) => {
    const serviço = serviços.find(s => s.id === id)
    if (serviço && serviço.total_realizados > 0) {
      toast.error('Não é possível excluir serviço com histórico de realizações')
      return
    }
    setServiçoParaDeletar(id)
    setDialogDeleteOpen(true)
  }

  // Deletar serviço
  const handleDelete = () => {
    if (!serviçoParaDeletar) return
    setServiços(serviços.filter(s => s.id !== serviçoParaDeletar))
    toast.success('Serviço excluído')
    setDialogDeleteOpen(false)
    setServiçoParaDeletar(null)
  }

  return (
    <div className="flex flex-col">
      <Header title="Serviços" />

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
                <SelectItem value="celular">Celular</SelectItem>
                <SelectItem value="videogame">Videogame</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroNivel} onValueChange={setFiltroNivel}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="básico">Básico</SelectItem>
                <SelectItem value="avançado">Avançado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Link href="/serviços/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Serviço
            </Button>
          </Link>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Total de Serviços
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalServiços}</div>
              <p className="text-xs text-muted-foreground">{serviçosAtivos} ativos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Celular
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{serviçosCelular}</div>
              <p className="text-xs text-muted-foreground">serviços</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Gamepad2 className="h-4 w-4" />
                Videogame
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{serviçosVideogame}</div>
              <p className="text-xs text-muted-foreground">serviços</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Realizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRealizados}</div>
              <p className="text-xs text-muted-foreground">total histórico</p>
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
                {formatCurrency(serviços.reduce((acc, s) => acc + s.preço_base, 0) / serviços.length)}
              </div>
              <p className="text-xs text-muted-foreground">por serviço</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Serviços */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead className="text-center">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Tempo
                  </TableHead>
                  <TableHead className="text-right">Preço Base</TableHead>
                  <TableHead className="text-center">Realizados</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviçosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      {busca || filtroTipo !== 'todos' || filtroNivel !== 'todos'
                        ? 'Nenhum serviço encontrado com os filtros aplicados.'
                        : 'Nenhum serviço cadastrado.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  serviçosFiltrados.map((serviço) => (
                    <TableRow key={serviço.id} className={!serviço.ativo ? 'opacity-50' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                            <Wrench className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{serviço.nome}</div>
                            <div className="text-xs text-muted-foreground max-w-[250px] truncate">
                              {serviço.descrição}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTipoBadge(serviço.tipo)}</TableCell>
                      <TableCell>{getNivelBadge(serviço.nivel)}</TableCell>
                      <TableCell className="text-center">
                        {formatTempo(serviço.tempo_estimado)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(serviço.preço_base)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{serviço.total_realizados}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={serviço.ativo ? 'default' : 'secondary'}>
                          {serviço.ativo ? 'Ativo' : 'Inativo'}
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
                            <Link href={`/serviços/${serviço.id}/editar`}>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem onClick={() => toggleAtivo(serviço.id)}>
                              <Settings className="mr-2 h-4 w-4" />
                              {serviço.ativo ? 'Desativar' : 'Ativar'}
                            </DropdownMenuItem>
                            {podeExcluirRegistros && (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => confirmarDelete(serviço.id)}
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
