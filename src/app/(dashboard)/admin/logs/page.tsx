'use client'

import { useEffect, useState } from 'react'
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
} from 'lucide-react'
import Link from 'next/link'

interface LogEntry {
  id: string
  tipo: string
  categoria: string | null
  mensagem: string
  detalhes: Record<string, unknown> | null
  empresa_id: string | null
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
    date.getMinutes().toString().padStart(2, '0')
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

export default function SuperadminLogsPage() {
  const { isSuperadmin } = usePermissao()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [tipo, setTipo] = useState('todos')
  const [categoria, setCategoria] = useState('todos')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [lastUpdate, setLastUpdate] = useState('')

  const fetchLogs = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('limit', '200')
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
    setLastUpdate(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
  }

  useEffect(() => {
    if (isSuperadmin) fetchLogs()
  }, [isSuperadmin, tipo, categoria, search])

  useEffect(() => {
    if (!isSuperadmin) return
    const interval = setInterval(fetchLogs, 30000)
    return () => clearInterval(interval)
  }, [isSuperadmin, tipo, categoria, search])

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
          <h1 className="text-2xl font-bold">Logs Globais</h1>
          <p className="text-muted-foreground text-sm">
            Todos os logs de todas as empresas
          </p>
        </div>
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
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="auth">Auth</SelectItem>
                  <SelectItem value="venda">Venda</SelectItem>
                  <SelectItem value="os">OS</SelectItem>
                  <SelectItem value="estoque">Estoque</SelectItem>
                  <SelectItem value="sistema">Sistema</SelectItem>
                  <SelectItem value="impersonacao">Impersonação</SelectItem>
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
                  <TableHead className="w-[140px]">Data/Hora</TableHead>
                  <TableHead className="w-[100px]">Tipo</TableHead>
                  <TableHead className="w-[100px]">Categoria</TableHead>
                  <TableHead className="w-[160px]">Empresa</TableHead>
                  <TableHead>Mensagem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </TableCell>
                    <TableCell>
                      <TipoBadge tipo={log.tipo} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.categoria || '-'}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.empresas?.nome_fantasia || log.empresas?.nome || '-'}
                    </TableCell>
                    <TableCell className="text-sm max-w-[400px] truncate" title={log.mensagem}>
                      {log.mensagem}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
