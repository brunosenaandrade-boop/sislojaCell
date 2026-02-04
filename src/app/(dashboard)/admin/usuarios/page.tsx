'use client'

import { useEffect, useState } from 'react'
import { usePermissao } from '@/hooks/usePermissao'
import { superadminService } from '@/services/superadmin.service'
import type { UsuarioGlobal } from '@/types/database'
import { toast } from 'sonner'
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
import { Users, Search, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function formatDate(d: string | null | undefined) {
  if (!d) return '-'
  const date = new Date(d)
  return (
    date.getDate().toString().padStart(2, '0') +
    '/' +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    '/' +
    date.getFullYear()
  )
}

export default function SuperadminUsuariosPage() {
  const { isSuperadmin } = usePermissao()
  const [usuarios, setUsuarios] = useState<UsuarioGlobal[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [perfilFilter, setPerfilFilter] = useState('todos')
  const [ativoFilter, setAtivoFilter] = useState('todos')
  const [empresaFilter, setEmpresaFilter] = useState('todos')

  const fetchUsuarios = async () => {
    setLoading(true)
    const { data, error } = await superadminService.getUsuarios({
      perfil: perfilFilter !== 'todos' ? perfilFilter : undefined,
      ativo: ativoFilter !== 'todos' ? ativoFilter : undefined,
      empresa_id: empresaFilter !== 'todos' ? empresaFilter : undefined,
      search: search.trim() || undefined,
    })
    if (error) {
      toast.error('Erro ao carregar usuários: ' + error)
    } else {
      setUsuarios(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isSuperadmin) fetchUsuarios()
  }, [isSuperadmin, perfilFilter, ativoFilter, empresaFilter, search])

  if (!isSuperadmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-lg font-semibold">Acesso Restrito</h2>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Extract unique empresas for filter
  const empresasMap = new Map<string, string>()
  usuarios.forEach((u) => {
    if (u.empresa_id && u.empresas) {
      empresasMap.set(u.empresa_id, u.empresas.nome_fantasia || u.empresas.nome)
    }
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <Users className="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-bold">Usuarios Global</h1>
          <p className="text-muted-foreground text-sm">
            {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} em todas as empresas
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <label className="text-sm font-medium">Perfil</label>
              <Select value={perfilFilter} onValueChange={setPerfilFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="funcionario">Funcionario</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Status</label>
              <Select value={ativoFilter} onValueChange={setAtivoFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="true">Ativo</SelectItem>
                  <SelectItem value="false">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Empresa</label>
              <Select value={empresaFilter} onValueChange={setEmpresaFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  {Array.from(empresasMap).map(([id, nome]) => (
                    <SelectItem key={id} value={id}>
                      {nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 flex-1 min-w-[200px]">
              <label className="text-sm font-medium">Buscar</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nome ou email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && setSearch(searchInput)}
                />
                <Button variant="secondary" onClick={() => setSearch(searchInput)}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : usuarios.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4" />
              <p>Nenhum usuario encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ultimo Acesso</TableHead>
                  <TableHead>Criado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.nome}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.perfil === 'admin' ? 'default' : 'secondary'}>
                        {u.perfil}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {u.empresas?.nome_fantasia || u.empresas?.nome || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.ativo ? 'default' : 'secondary'}>
                        {u.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(u.ultimo_acesso)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(u.created_at)}
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
