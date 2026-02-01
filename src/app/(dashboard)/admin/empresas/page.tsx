'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePermissao } from '@/hooks/usePermissao'
import { useAuthStore } from '@/store/useStore'
import { superadminService } from '@/services/superadmin.service'
import type { EmpresaStats } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Building2,
  Search,
  Eye,
  Power,
  PowerOff,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Users,
  FileText,
  ShoppingCart,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function EmpresasAdminPage() {
  const { isSuperadmin } = usePermissao()
  const { startImpersonation } = useAuthStore()
  const router = useRouter()
  const [empresas, setEmpresas] = useState<EmpresaStats[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const loadEmpresas = async () => {
    const { data, error } = await superadminService.getEmpresas()
    if (error) {
      toast.error('Erro ao carregar empresas: ' + error)
    } else if (data) {
      setEmpresas(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadEmpresas()
  }, [])

  if (!isSuperadmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-lg font-semibold">Acesso Restrito</h2>
            <p className="text-muted-foreground mt-2">
              Apenas o superadmin pode acessar este painel.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleToggle = async (empresa: EmpresaStats) => {
    const novoStatus = !empresa.ativo
    const confirmMsg = novoStatus
      ? `Ativar a empresa "${empresa.nome}"?`
      : `Desativar a empresa "${empresa.nome}"? Os usuarios nao conseguirao mais acessar o sistema.`

    if (!window.confirm(confirmMsg)) return

    setTogglingId(empresa.id)
    const { error } = await superadminService.toggleEmpresa(empresa.id, novoStatus)
    if (error) {
      toast.error('Erro: ' + error)
    } else {
      toast.success(`Empresa ${novoStatus ? 'ativada' : 'desativada'} com sucesso`)
      setEmpresas((prev) =>
        prev.map((e) => (e.id === empresa.id ? { ...e, ativo: novoStatus } : e))
      )
    }
    setTogglingId(null)
  }

  const handleImpersonate = (empresa: EmpresaStats) => {
    startImpersonation({
      id: empresa.id,
      nome: empresa.nome,
      nome_fantasia: empresa.nome_fantasia,
      cnpj: empresa.cnpj,
      cor_primaria: '#3B82F6',
      cor_secundaria: '#1e40af',
      ativo: empresa.ativo,
      created_at: empresa.created_at,
      updated_at: empresa.created_at,
    })
    router.push('/dashboard')
  }

  const filtered = empresas.filter((e) => {
    const q = search.toLowerCase()
    return (
      e.nome.toLowerCase().includes(q) ||
      (e.nome_fantasia || '').toLowerCase().includes(q) ||
      (e.cnpj || '').includes(q)
    )
  })

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('pt-BR')

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Empresas</h1>
            <p className="text-muted-foreground">
              {empresas.length} empresa{empresas.length !== 1 ? 's' : ''} cadastrada{empresas.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 max-w-md">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, fantasia ou CNPJ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {search ? 'Nenhuma empresa encontrada para a busca.' : 'Nenhuma empresa cadastrada.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead className="text-center">
                    <Users className="h-4 w-4 inline mr-1" />
                    Usuarios
                  </TableHead>
                  <TableHead className="text-center">
                    <FileText className="h-4 w-4 inline mr-1" />
                    OS
                  </TableHead>
                  <TableHead className="text-center">
                    <ShoppingCart className="h-4 w-4 inline mr-1" />
                    Vendas
                  </TableHead>
                  <TableHead>Criada em</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((empresa) => (
                  <TableRow key={empresa.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{empresa.nome_fantasia || empresa.nome}</p>
                        {empresa.nome_fantasia && (
                          <p className="text-xs text-muted-foreground">{empresa.nome}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {empresa.cnpj || '-'}
                    </TableCell>
                    <TableCell className="text-center">{empresa.usuarios_count}</TableCell>
                    <TableCell className="text-center">{empresa.os_count}</TableCell>
                    <TableCell className="text-center">{empresa.vendas_count}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(empresa.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={empresa.ativo ? 'default' : 'secondary'}>
                        {empresa.ativo ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Visualizar como esta empresa"
                          onClick={() => handleImpersonate(empresa)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={empresa.ativo ? 'Desativar' : 'Ativar'}
                          onClick={() => handleToggle(empresa)}
                          disabled={togglingId === empresa.id}
                        >
                          {togglingId === empresa.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : empresa.ativo ? (
                            <PowerOff className="h-4 w-4 text-destructive" />
                          ) : (
                            <Power className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
