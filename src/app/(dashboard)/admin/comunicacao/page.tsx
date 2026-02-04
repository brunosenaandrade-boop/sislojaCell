'use client'

import { useEffect, useState } from 'react'
import { usePermissao } from '@/hooks/usePermissao'
import { superadminService } from '@/services/superadmin.service'
import type { AvisoPlataforma, TipoAviso, AlvoTipoAviso } from '@/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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
  Megaphone,
  Plus,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Power,
  PowerOff,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

type AvisoComLidos = AvisoPlataforma & { lidos_count?: number }

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

function TipoBadge({ tipo }: { tipo: TipoAviso }) {
  switch (tipo) {
    case 'info':
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
          Info
        </Badge>
      )
    case 'warning':
      return (
        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
          Warning
        </Badge>
      )
    case 'important':
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-200">
          Importante
        </Badge>
      )
    default:
      return <Badge variant="secondary">{tipo}</Badge>
  }
}

function alvoDisplay(alvo_tipo: AlvoTipoAviso, alvo_valor?: string) {
  switch (alvo_tipo) {
    case 'todos':
      return 'Todas as empresas'
    case 'plano':
      return `Plano: ${alvo_valor || '-'}`
    case 'empresa':
      return 'Empresa específica'
    default:
      return alvo_tipo
  }
}

export default function ComunicacaoAdminPage() {
  const { isSuperadmin } = usePermissao()
  const [avisos, setAvisos] = useState<AvisoComLidos[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formTitulo, setFormTitulo] = useState('')
  const [formMensagem, setFormMensagem] = useState('')
  const [formTipo, setFormTipo] = useState<TipoAviso>('info')
  const [formAlvoTipo, setFormAlvoTipo] = useState<AlvoTipoAviso>('todos')
  const [formAlvoValor, setFormAlvoValor] = useState('')

  const loadAvisos = async () => {
    const { data, error } = await superadminService.getAvisos()
    if (error) {
      toast.error('Erro ao carregar avisos: ' + error)
    } else if (data) {
      setAvisos(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isSuperadmin) loadAvisos()
  }, [isSuperadmin])

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

  const handleToggle = async (aviso: AvisoComLidos) => {
    const novoStatus = !aviso.ativo
    setTogglingId(aviso.id)
    const { error } = await superadminService.atualizarAviso(aviso.id, { ativo: novoStatus })
    if (error) {
      toast.error('Erro: ' + error)
    } else {
      toast.success(`Aviso ${novoStatus ? 'ativado' : 'desativado'} com sucesso`)
      setAvisos((prev) =>
        prev.map((a) => (a.id === aviso.id ? { ...a, ativo: novoStatus } : a))
      )
    }
    setTogglingId(null)
  }

  const resetForm = () => {
    setFormTitulo('')
    setFormMensagem('')
    setFormTipo('info')
    setFormAlvoTipo('todos')
    setFormAlvoValor('')
  }

  const handleCriarAviso = async () => {
    if (!formTitulo.trim()) {
      toast.error('Título é obrigatório')
      return
    }
    if (!formMensagem.trim()) {
      toast.error('Mensagem é obrigatória')
      return
    }

    setSaving(true)
    const payload: Partial<AvisoPlataforma> = {
      titulo: formTitulo.trim(),
      mensagem: formMensagem.trim(),
      tipo: formTipo,
      alvo_tipo: formAlvoTipo,
      ativo: true,
    }
    if (formAlvoTipo !== 'todos' && formAlvoValor.trim()) {
      payload.alvo_valor = formAlvoValor.trim()
    }

    const { data, error } = await superadminService.criarAviso(payload)
    if (error) {
      toast.error('Erro ao criar aviso: ' + error)
    } else if (data) {
      toast.success('Aviso criado com sucesso')
      setAvisos((prev) => [data, ...prev])
      setDialogOpen(false)
      resetForm()
    }
    setSaving(false)
  }

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
          <Megaphone className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">Comunicação</h1>
            <p className="text-muted-foreground text-sm">
              {avisos.length} aviso{avisos.length !== 1 ? 's' : ''} cadastrado{avisos.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Aviso
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : avisos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum aviso cadastrado.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Alvo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {avisos.map((aviso) => (
                  <TableRow key={aviso.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{aviso.titulo}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                          {aviso.mensagem}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TipoBadge tipo={aviso.tipo} />
                    </TableCell>
                    <TableCell className="text-sm">
                      {alvoDisplay(aviso.alvo_tipo, aviso.alvo_valor)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={aviso.ativo ? 'default' : 'secondary'}>
                        {aviso.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(aviso.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        title={aviso.ativo ? 'Desativar' : 'Ativar'}
                        onClick={() => handleToggle(aviso)}
                        disabled={togglingId === aviso.id}
                      >
                        {togglingId === aviso.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : aviso.ativo ? (
                          <PowerOff className="h-4 w-4 text-destructive" />
                        ) : (
                          <Power className="h-4 w-4 text-green-600" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialog: Novo Aviso */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Aviso</DialogTitle>
            <DialogDescription>
              Crie um aviso para ser exibido aos usuários da plataforma.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Título</label>
              <Input
                placeholder="Título do aviso"
                value={formTitulo}
                onChange={(e) => setFormTitulo(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Mensagem</label>
              <Textarea
                placeholder="Mensagem do aviso..."
                rows={4}
                value={formMensagem}
                onChange={(e) => setFormMensagem(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={formTipo} onValueChange={(v) => setFormTipo(v as TipoAviso)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="important">Importante</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Alvo</label>
              <Select value={formAlvoTipo} onValueChange={(v) => { setFormAlvoTipo(v as AlvoTipoAviso); setFormAlvoValor('') }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="plano">Plano específico</SelectItem>
                  <SelectItem value="empresa">Empresa específica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formAlvoTipo === 'plano' && (
              <div className="space-y-1">
                <label className="text-sm font-medium">Slug do plano</label>
                <Input
                  placeholder="slug do plano (ex: anual)"
                  value={formAlvoValor}
                  onChange={(e) => setFormAlvoValor(e.target.value)}
                />
              </div>
            )}
            {formAlvoTipo === 'empresa' && (
              <div className="space-y-1">
                <label className="text-sm font-medium">ID da empresa</label>
                <Input
                  placeholder="ID da empresa"
                  value={formAlvoValor}
                  onChange={(e) => setFormAlvoValor(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCriarAviso} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Aviso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
