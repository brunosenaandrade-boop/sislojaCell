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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  Clock,
  Gift,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  trial: { label: 'Trial', variant: 'outline' },
  active: { label: 'Ativa', variant: 'default' },
  overdue: { label: 'Inadimplente', variant: 'destructive' },
  suspended: { label: 'Suspensa', variant: 'destructive' },
  cancelled: { label: 'Cancelada', variant: 'secondary' },
  expired: { label: 'Expirada', variant: 'secondary' },
}

export default function EmpresasAdminPage() {
  const { isSuperadmin } = usePermissao()
  const { startImpersonation } = useAuthStore()
  const router = useRouter()
  const [empresas, setEmpresas] = useState<EmpresaStats[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroPlano, setFiltroPlano] = useState('todos')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // Estender trial state
  const [trialDialogOpen, setTrialDialogOpen] = useState(false)
  const [trialEmpresa, setTrialEmpresa] = useState<EmpresaStats | null>(null)
  const [trialDias, setTrialDias] = useState('7')
  const [trialSaving, setTrialSaving] = useState(false)

  // Bonus state
  const [bonusDialogOpen, setBonusDialogOpen] = useState(false)
  const [bonusEmpresa, setBonusEmpresa] = useState<EmpresaStats | null>(null)
  const [bonusMeses, setBonusMeses] = useState('1')
  const [bonusSaving, setBonusSaving] = useState(false)

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

  const handleImpersonate = async (empresa: EmpresaStats) => {
    await superadminService.logImpersonacao(
      empresa.id,
      empresa.nome_fantasia || empresa.nome,
      'inicio'
    )
    startImpersonation({
      id: empresa.id,
      nome: empresa.nome,
      nome_fantasia: empresa.nome_fantasia,
      cnpj: empresa.cnpj,
      cor_primaria: '#3B82F6',
      cor_secundaria: '#1e40af',
      ativo: empresa.ativo,
      plano: empresa.plano || 'free',
      status_assinatura: empresa.status_assinatura || 'trial',
      meses_bonus: 0,
      onboarding_completo: true,
      created_at: empresa.created_at,
      updated_at: empresa.created_at,
    })
    router.push('/dashboard')
  }

  const handleEstenderTrial = async () => {
    if (!trialEmpresa) return
    setTrialSaving(true)
    const { error } = await superadminService.estenderTrial(trialEmpresa.id, Number(trialDias) || 7)
    if (error) {
      toast.error('Erro: ' + error)
    } else {
      toast.success(`Trial estendido em ${trialDias} dias para ${trialEmpresa.nome}`)
      setTrialDialogOpen(false)
      loadEmpresas()
    }
    setTrialSaving(false)
  }

  const handleAdicionarBonus = async () => {
    if (!bonusEmpresa) return
    setBonusSaving(true)
    const { error } = await superadminService.adicionarBonus(bonusEmpresa.id, Number(bonusMeses) || 1)
    if (error) {
      toast.error('Erro: ' + error)
    } else {
      toast.success(`${bonusMeses} mês(es) bônus adicionado(s) para ${bonusEmpresa.nome}`)
      setBonusDialogOpen(false)
      loadEmpresas()
    }
    setBonusSaving(false)
  }

  const filtered = empresas.filter((e) => {
    const q = search.toLowerCase()
    const matchSearch =
      e.nome.toLowerCase().includes(q) ||
      (e.nome_fantasia || '').toLowerCase().includes(q) ||
      (e.cnpj || '').includes(q)

    const matchPlano = filtroPlano === 'todos' || e.plano === filtroPlano
    const matchStatus = filtroStatus === 'todos' || e.status_assinatura === filtroStatus

    return matchSearch && matchPlano && matchStatus
  })

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('pt-BR')

  // Planos e status únicos para os filtros
  const planosUnicos = [...new Set(empresas.map(e => e.plano).filter(Boolean))]
  const statusUnicos = [...new Set(empresas.map(e => e.status_assinatura).filter(Boolean))]

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

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, fantasia ou CNPJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filtroPlano} onValueChange={setFiltroPlano}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Plano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos Planos</SelectItem>
            {planosUnicos.map(p => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos Status</SelectItem>
            {statusUnicos.map(s => (
              <SelectItem key={s} value={s}>{statusLabels[s]?.label || s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
              {search || filtroPlano !== 'todos' || filtroStatus !== 'todos'
                ? 'Nenhuma empresa encontrada para os filtros.'
                : 'Nenhuma empresa cadastrada.'}
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
                  <TableHead>Plano</TableHead>
                  <TableHead>Assinatura</TableHead>
                  <TableHead className="text-center">
                    <Users className="h-4 w-4 inline mr-1" />
                    Users
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
                  <TableHead>Ativa</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((empresa) => {
                  const sInfo = statusLabels[empresa.status_assinatura] || { label: empresa.status_assinatura, variant: 'secondary' as const }
                  return (
                    <TableRow key={empresa.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{empresa.nome_fantasia || empresa.nome}</p>
                          {empresa.nome_fantasia && (
                            <p className="text-xs text-muted-foreground">{empresa.nome}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {empresa.plano || 'free'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={sInfo.variant} className="text-xs">
                          {sInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{empresa.usuarios_count}</TableCell>
                      <TableCell className="text-center">{empresa.os_count}</TableCell>
                      <TableCell className="text-center">{empresa.vendas_count}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(empresa.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={empresa.ativo ? 'default' : 'secondary'}>
                          {empresa.ativo ? 'Sim' : 'Não'}
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
                            title="Estender trial"
                            onClick={() => {
                              setTrialEmpresa(empresa)
                              setTrialDias('7')
                              setTrialDialogOpen(true)
                            }}
                          >
                            <Clock className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Adicionar mês bônus"
                            onClick={() => {
                              setBonusEmpresa(empresa)
                              setBonusMeses('1')
                              setBonusDialogOpen(true)
                            }}
                          >
                            <Gift className="h-4 w-4 text-green-600" />
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
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialog: Estender Trial */}
      <Dialog open={trialDialogOpen} onOpenChange={setTrialDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Estender Trial</DialogTitle>
            <DialogDescription>
              Estender o período de teste para {trialEmpresa?.nome}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Dias adicionais</label>
              <Input
                type="number"
                min="1"
                max="90"
                value={trialDias}
                onChange={(e) => setTrialDias(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrialDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleEstenderTrial} disabled={trialSaving}>
              {trialSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Estender em {trialDias} dias
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Adicionar Bônus */}
      <Dialog open={bonusDialogOpen} onOpenChange={setBonusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Meses Bônus</DialogTitle>
            <DialogDescription>
              Adicionar meses bônus gratuitos para {bonusEmpresa?.nome}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Quantidade de meses</label>
              <Input
                type="number"
                min="1"
                max="12"
                value={bonusMeses}
                onChange={(e) => setBonusMeses(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBonusDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAdicionarBonus} disabled={bonusSaving}>
              {bonusSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adicionar {bonusMeses} mês(es)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
