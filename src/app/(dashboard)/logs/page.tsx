'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { usePermissao } from '@/hooks/usePermissao'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ScrollText,
  Search,
  AlertCircle,
  Info,
  AlertTriangle,
  Shield,
  X,
  Loader2,
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { logsService } from '@/services/logs.service'
import type { LogSistema } from '@/types/database'

const tipoBadge: Record<string, { label: string; variant: string; icon: React.ReactNode }> = {
  erro: { label: 'Erro', variant: 'bg-red-100 text-red-800', icon: <AlertCircle className="h-3 w-3" /> },
  info: { label: 'Info', variant: 'bg-blue-100 text-blue-800', icon: <Info className="h-3 w-3" /> },
  warning: { label: 'Aviso', variant: 'bg-yellow-100 text-yellow-800', icon: <AlertTriangle className="h-3 w-3" /> },
  audit: { label: 'Auditoria', variant: 'bg-purple-100 text-purple-800', icon: <Shield className="h-3 w-3" /> },
}

const categoriaLabels: Record<string, string> = {
  auth: 'Autenticação',
  venda: 'Vendas',
  os: 'Ordens de Serviço',
  estoque: 'Estoque',
  sistema: 'Sistema',
}

export default function LogsPage() {
  const { isAdmin } = usePermissao()
  const [logs, setLogs] = useState<LogSistema[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos')
  const [busca, setBusca] = useState('')
  const [logSelecionado, setLogSelecionado] = useState<LogSistema | null>(null)

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      const filtros: { tipo?: string; categoria?: string; busca?: string } = {}
      if (filtroTipo !== 'todos') filtros.tipo = filtroTipo
      if (filtroCategoria !== 'todos') filtros.categoria = filtroCategoria
      if (busca.trim()) filtros.busca = busca.trim()

      const { data, error } = await logsService.listar(filtros)
      if (error) toast.error('Erro ao carregar logs: ' + error)
      setLogs(data)
    } catch {
      toast.error('Erro ao carregar logs')
    } finally {
      setIsLoading(false)
    }
  }, [filtroTipo, filtroCategoria, busca])

  useEffect(() => {
    if (!isAdmin) return
    fetchLogs()
  }, [fetchLogs, isAdmin])

  if (!isAdmin) {
    return (
      <div className="flex flex-col">
        <Header title="Logs do Sistema" />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-6">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold mb-2">Acesso Restrito</h2>
              <p className="text-muted-foreground">
                Apenas administradores podem acessar os logs do sistema.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Client-side filter for busca (the service also does server-side ilike on mensagem)
  const logsFiltrados = logs.filter((log) => {
    if (busca) {
      const term = busca.toLowerCase()
      return (
        log.mensagem.toLowerCase().includes(term) ||
        (log.pagina && log.pagina.toLowerCase().includes(term))
      )
    }
    return true
  })

  return (
    <div className="flex flex-col">
      <Header title="Logs do Sistema" />

      <div className="flex-1 space-y-4 p-4 lg:p-6">
        {/* Filtros */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por mensagem, usuário ou página..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
            {busca && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setBusca('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="erro">Erro</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Aviso</SelectItem>
              <SelectItem value="audit">Auditoria</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas categorias</SelectItem>
              <SelectItem value="auth">Autenticação</SelectItem>
              <SelectItem value="venda">Vendas</SelectItem>
              <SelectItem value="os">Ordens de Serviço</SelectItem>
              <SelectItem value="estoque">Estoque</SelectItem>
              <SelectItem value="sistema">Sistema</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Contagem */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ScrollText className="h-4 w-4" />
          {isLoading ? 'Carregando...' : `${logsFiltrados.length} registro${logsFiltrados.length !== 1 ? 's' : ''} encontrado${logsFiltrados.length !== 1 ? 's' : ''}`}
        </div>

        {/* Tabela */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[160px]">Data/Hora</TableHead>
                    <TableHead className="w-[100px]">Tipo</TableHead>
                    <TableHead className="w-[130px]">Categoria</TableHead>
                    <TableHead>Mensagem</TableHead>
                    <TableHead className="w-[140px]">Usuário</TableHead>
                    <TableHead className="w-[120px]">Página</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logsFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhum log encontrado com os filtros aplicados
                      </TableCell>
                    </TableRow>
                  ) : (
                    logsFiltrados.map((log) => (
                      <TableRow
                        key={log.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setLogSelecionado(log)}
                      >
                        <TableCell className="text-sm font-mono">
                          {format(new Date(log.created_at), 'dd/MM/yy HH:mm')}
                        </TableCell>
                        <TableCell>
                          {tipoBadge[log.tipo] ? (
                            <Badge className={`${tipoBadge[log.tipo].variant} gap-1`}>
                              {tipoBadge[log.tipo].icon}
                              {tipoBadge[log.tipo].label}
                            </Badge>
                          ) : (
                            <Badge variant="outline">{log.tipo}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {(log.categoria && categoriaLabels[log.categoria]) || log.categoria || '-'}
                        </TableCell>
                        <TableCell className="text-sm max-w-[300px] truncate">
                          {log.mensagem}
                        </TableCell>
                        <TableCell className="text-sm">{log.usuario_id || '-'}</TableCell>
                        <TableCell className="text-sm font-mono text-muted-foreground">
                          {log.pagina || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog Detalhes do Log */}
      <Dialog open={!!logSelecionado} onOpenChange={() => setLogSelecionado(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Detalhes do Log
              {logSelecionado && tipoBadge[logSelecionado.tipo] && (
                <Badge className={tipoBadge[logSelecionado.tipo].variant}>
                  {tipoBadge[logSelecionado.tipo].label}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {logSelecionado && (
            <div className="space-y-4">
              <div className="grid gap-3 grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Data/Hora</p>
                  <p className="font-medium">
                    {format(new Date(logSelecionado.created_at), "dd/MM/yyyy 'às' HH:mm:ss")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Categoria</p>
                  <p className="font-medium">
                    {(logSelecionado.categoria && categoriaLabels[logSelecionado.categoria]) || logSelecionado.categoria || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Usuário</p>
                  <p className="font-medium">{logSelecionado.usuario_id || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Página</p>
                  <p className="font-medium font-mono text-sm">{logSelecionado.pagina || '-'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Mensagem</p>
                <p className="font-medium">{logSelecionado.mensagem}</p>
              </div>

              {logSelecionado.detalhes && Object.keys(logSelecionado.detalhes).length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Detalhes</p>
                  <pre className="rounded-lg bg-muted p-3 text-xs overflow-x-auto">
                    {JSON.stringify(logSelecionado.detalhes, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
