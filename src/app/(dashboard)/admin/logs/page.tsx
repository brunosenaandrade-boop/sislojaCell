'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePermissao } from '@/hooks/usePermissao'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ScrollText,
  Search,
  Loader2,
  AlertCircle,
  ArrowLeft,
  AlertTriangle,
  Info,
  ShieldAlert,
  ClipboardCheck,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react'
import Link from 'next/link'

interface LogEntry {
  id: string
  tipo: string
  categoria: string | null
  mensagem: string
  detalhes: Record<string, unknown> | null
  pagina: string | null
  acao: string | null
  ip: string | null
  user_agent: string | null
  empresa_id: string | null
  usuario_id: string | null
  created_at: string
  empresas: { nome: string; nome_fantasia: string | null } | null
}

function formatDate(d: string) {
  const date = new Date(d)
  return (
    date.getDate().toString().padStart(2, '0') +
    '/' +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    '/' +
    date.getFullYear() +
    ' ' +
    date.getHours().toString().padStart(2, '0') +
    ':' +
    date.getMinutes().toString().padStart(2, '0') +
    ':' +
    date.getSeconds().toString().padStart(2, '0')
  )
}

function TipoBadge({ tipo }: { tipo: string }) {
  switch (tipo) {
    case 'erro':
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Erro
        </Badge>
      )
    case 'warning':
      return (
        <Badge className="gap-1 bg-yellow-500 hover:bg-yellow-600 text-white">
          <AlertTriangle className="h-3 w-3" />
          Warning
        </Badge>
      )
    case 'info':
      return (
        <Badge className="gap-1 bg-blue-500 hover:bg-blue-600 text-white">
          <Info className="h-3 w-3" />
          Info
        </Badge>
      )
    case 'audit':
      return (
        <Badge className="gap-1 bg-green-600 hover:bg-green-700 text-white">
          <ClipboardCheck className="h-3 w-3" />
          Audit
        </Badge>
      )
    default:
      return <Badge variant="secondary">{tipo}</Badge>
  }
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <Button variant="ghost" size="sm" onClick={copy} className="h-6 w-6 p-0">
      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
    </Button>
  )
}

function LogDetailPanel({ log }: { log: LogEntry }) {
  const detalhes = log.detalhes
  const stackTrace = detalhes?.stack_trace as string | undefined
  const errorMessage = detalhes?.error_message as string | undefined
  const endpoint = detalhes?.endpoint as string | undefined
  const method = detalhes?.method as string | undefined
  const requestBody = detalhes?.request_body as Record<string, unknown> | undefined

  // Build a clean details object (without fields we show separately)
  const otherDetails = detalhes
    ? Object.fromEntries(
        Object.entries(detalhes).filter(
          ([k]) => !['stack_trace', 'error_message', 'endpoint', 'method', 'request_body'].includes(k)
        )
      )
    : null

  return (
    <div className="bg-muted/50 border-t px-6 py-4 space-y-3 text-sm">
      {/* Error info */}
      {(endpoint || method) && (
        <div className="flex gap-4">
          {endpoint && (
            <div>
              <span className="text-muted-foreground">Endpoint: </span>
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                {method && <span className="text-blue-500 font-semibold">{method} </span>}
                {endpoint}
              </code>
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <div>
          <span className="text-muted-foreground">Erro: </span>
          <span className="text-destructive font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Stack trace */}
      {stackTrace && (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-muted-foreground font-medium">Stack Trace</span>
            <CopyButton text={stackTrace} />
          </div>
          <pre className="bg-black/90 text-green-400 p-3 rounded-md text-xs overflow-x-auto max-h-[300px] overflow-y-auto whitespace-pre-wrap font-mono">
            {stackTrace}
          </pre>
        </div>
      )}

      {/* Request body */}
      {requestBody && Object.keys(requestBody).length > 0 && (
        <div>
          <span className="text-muted-foreground font-medium">Request Body</span>
          <pre className="bg-muted p-2 rounded text-xs overflow-x-auto max-h-[200px] overflow-y-auto font-mono mt-1">
            {JSON.stringify(requestBody, null, 2)}
          </pre>
        </div>
      )}

      {/* Other details */}
      {otherDetails && Object.keys(otherDetails).length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-muted-foreground font-medium">Detalhes</span>
            <CopyButton text={JSON.stringify(otherDetails, null, 2)} />
          </div>
          <pre className="bg-muted p-2 rounded text-xs overflow-x-auto max-h-[200px] overflow-y-auto font-mono">
            {JSON.stringify(otherDetails, null, 2)}
          </pre>
        </div>
      )}

      {/* Metadata */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground pt-2 border-t">
        {log.pagina && (
          <div>
            <span className="font-medium">Pagina: </span>
            {log.pagina}
          </div>
        )}
        {log.acao && (
          <div>
            <span className="font-medium">Acao: </span>
            {log.acao}
          </div>
        )}
        {log.ip && (
          <div>
            <span className="font-medium">IP: </span>
            {log.ip}
          </div>
        )}
        {log.usuario_id && (
          <div>
            <span className="font-medium">Usuario ID: </span>
            <code className="text-[10px]">{log.usuario_id}</code>
          </div>
        )}
        {log.empresa_id && (
          <div>
            <span className="font-medium">Empresa ID: </span>
            <code className="text-[10px]">{log.empresa_id}</code>
          </div>
        )}
        {log.user_agent && (
          <div className="basis-full">
            <span className="font-medium">User Agent: </span>
            <span className="break-all">{log.user_agent}</span>
          </div>
        )}
        <div>
          <span className="font-medium">Log ID: </span>
          <code className="text-[10px]">{log.id}</code>
        </div>
      </div>
    </div>
  )
}

export default function SuperadminLogsPage() {
  const { isSuperadmin } = usePermissao()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [tipo, setTipo] = useState('todos')
  const [categoria, setCategoria] = useState('todos')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [lastUpdate, setLastUpdate] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('limit', '500')
    if (tipo !== 'todos') params.set('tipo', tipo)
    if (categoria !== 'todos') params.set('categoria', categoria)
    if (search.trim()) params.set('search', search.trim())

    try {
      const res = await fetch('/api/superadmin/logs?' + params.toString())
      if (res.ok) {
        const json = await res.json()
        setLogs(json.data || [])
      }
    } catch {
      // silently fail
    }
    setLoading(false)
    setLastUpdate(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
  }, [tipo, categoria, search])

  useEffect(() => {
    if (isSuperadmin) fetchLogs()
  }, [isSuperadmin, fetchLogs])

  useEffect(() => {
    if (!isSuperadmin) return
    const interval = setInterval(fetchLogs, 30000)
    return () => clearInterval(interval)
  }, [isSuperadmin, fetchLogs])

  const erroCount = logs.filter((l) => l.tipo === 'erro').length
  const warningCount = logs.filter((l) => l.tipo === 'warning').length

  if (!isSuperadmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <ShieldAlert className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-lg font-semibold">Acesso Restrito</h2>
            <p className="text-muted-foreground mt-2">Apenas superadmin.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <ScrollText className="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-bold">Logs do Sistema</h1>
          <p className="text-muted-foreground text-sm">
            Todos os logs de todas as empresas — clique em uma linha para ver detalhes
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold">{logs.length}</div>
            <div className="text-xs text-muted-foreground">Total de logs</div>
          </CardContent>
        </Card>
        <Card className={erroCount > 0 ? 'border-destructive/50' : ''}>
          <CardContent className="pt-4 pb-3">
            <div className={`text-2xl font-bold ${erroCount > 0 ? 'text-destructive' : ''}`}>{erroCount}</div>
            <div className="text-xs text-muted-foreground">Erros</div>
          </CardContent>
        </Card>
        <Card className={warningCount > 0 ? 'border-yellow-500/50' : ''}>
          <CardContent className="pt-4 pb-3">
            <div className={`text-2xl font-bold ${warningCount > 0 ? 'text-yellow-500' : ''}`}>{warningCount}</div>
            <div className="text-xs text-muted-foreground">Warnings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold">{logs.filter((l) => l.tipo === 'audit').length}</div>
            <div className="text-xs text-muted-foreground">Auditorias</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="erro">Erro</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="audit">Audit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Categoria</label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="auth">Auth</SelectItem>
                  <SelectItem value="venda">Venda</SelectItem>
                  <SelectItem value="os">OS</SelectItem>
                  <SelectItem value="estoque">Estoque</SelectItem>
                  <SelectItem value="sistema">Sistema</SelectItem>
                  <SelectItem value="impersonacao">Impersonacao</SelectItem>
                  <SelectItem value="manutencao">Manutencao</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 flex-1 min-w-[200px]">
              <label className="text-sm font-medium">Buscar</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar na mensagem..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && setSearch(searchInput)}
                />
                <Button variant="secondary" onClick={() => setSearch(searchInput)}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button variant="outline" onClick={fetchLogs}>
              <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {logs.length} log{logs.length !== 1 ? 's' : ''}
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              Atualizado: {lastUpdate} | Auto-refresh 30s
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading && logs.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ScrollText className="h-12 w-12 mx-auto mb-4" />
              <p>Nenhum log encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30px]"></TableHead>
                  <TableHead className="w-[150px]">Data/Hora</TableHead>
                  <TableHead className="w-[90px]">Tipo</TableHead>
                  <TableHead className="w-[110px]">Categoria</TableHead>
                  <TableHead className="w-[160px]">Empresa</TableHead>
                  <TableHead>Mensagem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  const isExpanded = expandedId === log.id
                  const hasDetails = log.detalhes || log.pagina || log.acao || log.ip || log.user_agent
                  return (
                    <TableRow
                      key={log.id}
                      className={`cursor-pointer ${isExpanded ? 'bg-muted/30' : ''} ${log.tipo === 'erro' ? 'hover:bg-destructive/5' : ''}`}
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    >
                      <TableCell className="px-2">
                        {hasDetails && (
                          isExpanded
                            ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap font-mono text-xs">
                        {formatDate(log.created_at)}
                      </TableCell>
                      <TableCell>
                        <TipoBadge tipo={log.tipo} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{log.categoria || '-'}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.empresas?.nome_fantasia || log.empresas?.nome || (log.empresa_id ? log.empresa_id.slice(0, 8) + '...' : '-')}
                      </TableCell>
                      <TableCell className="text-sm max-w-[400px] truncate" title={log.mensagem}>
                        {log.mensagem}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}

          {/* Expanded detail panels (rendered outside table for proper layout) */}
          {logs.map((log) => {
            if (expandedId !== log.id) return null
            return <LogDetailPanel key={`detail-${log.id}`} log={log} />
          })}
        </CardContent>
      </Card>
    </div>
  )
}
