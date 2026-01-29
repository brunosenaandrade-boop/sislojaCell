'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import { format } from 'date-fns'

// Mock data de logs
const mockLogs = [
  {
    id: '1',
    tipo: 'audit' as const,
    categoria: 'auth',
    mensagem: 'Login realizado',
    usuario: 'Bruno (Admin)',
    pagina: '/login',
    detalhes: { usuario_id: '1', ip: '192.168.1.1' },
    created_at: '2026-01-29T15:30:00',
  },
  {
    id: '2',
    tipo: 'info' as const,
    categoria: 'venda',
    mensagem: 'Venda #145 finalizada',
    usuario: 'Bruno (Admin)',
    pagina: '/vendas',
    detalhes: { venda_id: '145', valor: 89.90, forma_pagamento: 'pix' },
    created_at: '2026-01-29T14:22:00',
  },
  {
    id: '3',
    tipo: 'warning' as const,
    categoria: 'estoque',
    mensagem: 'Produto "Carregador USB-C" com estoque baixo (3 unidades)',
    usuario: 'Sistema',
    pagina: '/estoque',
    detalhes: { produto_id: '1', estoque_atual: 3, estoque_minimo: 5 },
    created_at: '2026-01-29T13:45:00',
  },
  {
    id: '4',
    tipo: 'erro' as const,
    categoria: 'sistema',
    mensagem: 'Erro ao conectar com servidor de impressão',
    usuario: 'Funcionário 1',
    pagina: '/vendas',
    detalhes: { error_name: 'ConnectionError', error_message: 'ECONNREFUSED', stack_trace: 'at PrintService.connect...' },
    created_at: '2026-01-29T12:10:00',
  },
  {
    id: '5',
    tipo: 'audit' as const,
    categoria: 'os',
    mensagem: 'OS #1001 status alterado para "Em Andamento"',
    usuario: 'Bruno (Admin)',
    pagina: '/ordens-servico/1',
    detalhes: { os_id: '1', status_anterior: 'em_analise', status_novo: 'em_andamento' },
    created_at: '2026-01-29T11:30:00',
  },
  {
    id: '6',
    tipo: 'info' as const,
    categoria: 'auth',
    mensagem: 'Logout realizado',
    usuario: 'Funcionário 1',
    pagina: '/dashboard',
    detalhes: {},
    created_at: '2026-01-29T10:00:00',
  },
  {
    id: '7',
    tipo: 'audit' as const,
    categoria: 'venda',
    mensagem: 'Venda #144 finalizada',
    usuario: 'Bruno (Admin)',
    pagina: '/vendas',
    detalhes: { venda_id: '144', valor: 250.00, forma_pagamento: 'credito' },
    created_at: '2026-01-28T16:45:00',
  },
  {
    id: '8',
    tipo: 'warning' as const,
    categoria: 'sistema',
    mensagem: 'Tentativa de acesso a rota restrita',
    usuario: 'Funcionário 1',
    pagina: '/configuracoes',
    detalhes: { rota: '/configuracoes', perfil: 'funcionario' },
    created_at: '2026-01-28T15:20:00',
  },
  {
    id: '9',
    tipo: 'info' as const,
    categoria: 'estoque',
    mensagem: 'Entrada de estoque: 20 unidades de "Película iPhone 15"',
    usuario: 'Bruno (Admin)',
    pagina: '/estoque',
    detalhes: { produto_id: '3', quantidade: 20, tipo: 'entrada' },
    created_at: '2026-01-28T14:00:00',
  },
  {
    id: '10',
    tipo: 'erro' as const,
    categoria: 'sistema',
    mensagem: 'Promise rejeitada: Network Error',
    usuario: 'Sistema',
    pagina: '/dashboard',
    detalhes: { error_name: 'AxiosError', error_message: 'Network Error' },
    created_at: '2026-01-28T09:30:00',
  },
]

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
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos')
  const [busca, setBusca] = useState('')
  const [logSelecionado, setLogSelecionado] = useState<typeof mockLogs[0] | null>(null)

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

  const logsFiltrados = mockLogs.filter((log) => {
    if (filtroTipo !== 'todos' && log.tipo !== filtroTipo) return false
    if (filtroCategoria !== 'todos' && log.categoria !== filtroCategoria) return false
    if (busca) {
      const term = busca.toLowerCase()
      return (
        log.mensagem.toLowerCase().includes(term) ||
        log.usuario.toLowerCase().includes(term) ||
        log.pagina.toLowerCase().includes(term)
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
          {logsFiltrados.length} registro{logsFiltrados.length !== 1 ? 's' : ''} encontrado{logsFiltrados.length !== 1 ? 's' : ''}
        </div>

        {/* Tabela */}
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
                        <Badge className={`${tipoBadge[log.tipo].variant} gap-1`}>
                          {tipoBadge[log.tipo].icon}
                          {tipoBadge[log.tipo].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {categoriaLabels[log.categoria] || log.categoria}
                      </TableCell>
                      <TableCell className="text-sm max-w-[300px] truncate">
                        {log.mensagem}
                      </TableCell>
                      <TableCell className="text-sm">{log.usuario}</TableCell>
                      <TableCell className="text-sm font-mono text-muted-foreground">
                        {log.pagina}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Detalhes do Log */}
      <Dialog open={!!logSelecionado} onOpenChange={() => setLogSelecionado(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Detalhes do Log
              {logSelecionado && (
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
                    {categoriaLabels[logSelecionado.categoria] || logSelecionado.categoria}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Usuário</p>
                  <p className="font-medium">{logSelecionado.usuario}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Página</p>
                  <p className="font-medium font-mono text-sm">{logSelecionado.pagina}</p>
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
