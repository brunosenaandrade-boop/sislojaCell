'use client'

import { useEffect, useState } from 'react'
import { usePermissao } from '@/hooks/usePermissao'
import { superadminService } from '@/services/superadmin.service'
import type { Plano } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
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
  CreditCard,
  Plus,
  Pencil,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Star,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const DEFAULT_FEATURES = JSON.stringify(
  {
    pdv: true,
    os: true,
    estoque: true,
    caixa: true,
    relatorios: true,
    backup: true,
    suporte: 'prioritario',
    indicacoes: true,
  },
  null,
  2
)

interface PlanoFormState {
  nome: string
  slug: string
  descricao: string
  preco_mensal: string
  preco_anual: string
  max_usuarios: string
  max_produtos: string
  max_os_mes: string
  max_vendas_mes: string
  destaque: boolean
  ativo: boolean
  ordem: string
  features: string
}

const emptyForm: PlanoFormState = {
  nome: '',
  slug: '',
  descricao: '',
  preco_mensal: '0',
  preco_anual: '0',
  max_usuarios: '5',
  max_produtos: '100',
  max_os_mes: '50',
  max_vendas_mes: '100',
  destaque: false,
  ativo: true,
  ordem: '0',
  features: DEFAULT_FEATURES,
}

function formatLimit(value: number): string {
  return value === -1 ? 'Ilimitado' : String(value)
}

function formatCurrency(value: number): string {
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
}

export default function PlanosAdminPage() {
  const { isSuperadmin } = usePermissao()
  const [planos, setPlanos] = useState<Plano[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingPlano, setEditingPlano] = useState<Plano | null>(null)
  const [form, setForm] = useState<PlanoFormState>(emptyForm)

  const loadPlanos = async () => {
    setLoading(true)
    const { data, error } = await superadminService.getPlanos()
    if (error) {
      toast.error('Erro ao carregar planos: ' + error)
    } else if (data) {
      setPlanos(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadPlanos()
  }, [])

  if (!isSuperadmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-sm">
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

  const openNewPlano = () => {
    setEditingPlano(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEditPlano = (plano: Plano) => {
    setEditingPlano(plano)
    setForm({
      nome: plano.nome,
      slug: plano.slug,
      descricao: plano.descricao || '',
      preco_mensal: String(plano.preco_mensal),
      preco_anual: String(plano.preco_anual),
      max_usuarios: String(plano.max_usuarios),
      max_produtos: String(plano.max_produtos),
      max_os_mes: String(plano.max_os_mes),
      max_vendas_mes: String(plano.max_vendas_mes),
      destaque: plano.destaque,
      ativo: plano.ativo,
      ordem: String(plano.ordem),
      features: JSON.stringify(plano.features || {}, null, 2),
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.nome.trim()) {
      toast.error('Informe o nome do plano')
      return
    }
    if (!form.slug.trim()) {
      toast.error('Informe o slug do plano')
      return
    }

    let featuresObj: Record<string, boolean | string> = {}
    try {
      featuresObj = JSON.parse(form.features)
    } catch {
      toast.error('JSON de features inválido. Verifique a sintaxe.')
      return
    }

    setSaving(true)
    const payload: Partial<Plano> = {
      nome: form.nome.trim(),
      slug: form.slug.trim(),
      descricao: form.descricao.trim() || undefined,
      preco_mensal: Number(form.preco_mensal) || 0,
      preco_anual: Number(form.preco_anual) || 0,
      max_usuarios: Number(form.max_usuarios),
      max_produtos: Number(form.max_produtos),
      max_os_mes: Number(form.max_os_mes),
      max_vendas_mes: Number(form.max_vendas_mes),
      destaque: form.destaque,
      ativo: form.ativo,
      ordem: Number(form.ordem) || 0,
      features: featuresObj,
    }

    if (editingPlano) {
      const { error } = await superadminService.atualizarPlano(
        editingPlano.id,
        payload
      )
      if (error) {
        toast.error('Erro ao atualizar plano: ' + error)
      } else {
        toast.success('Plano atualizado com sucesso')
        setDialogOpen(false)
        loadPlanos()
      }
    } else {
      const { error } = await superadminService.criarPlano(payload)
      if (error) {
        toast.error('Erro ao criar plano: ' + error)
      } else {
        toast.success('Plano criado com sucesso')
        setDialogOpen(false)
        loadPlanos()
      }
    }
    setSaving(false)
  }

  const handleToggleAtivo = async (plano: Plano) => {
    const novoStatus = !plano.ativo
    if (!novoStatus) {
      const { error } = await superadminService.desativarPlano(plano.id)
      if (error) {
        toast.error('Erro ao desativar plano: ' + error)
      } else {
        toast.success('Plano desativado com sucesso')
        setPlanos((prev) =>
          prev.map((p) =>
            p.id === plano.id ? { ...p, ativo: false } : p
          )
        )
      }
    } else {
      const { error } = await superadminService.atualizarPlano(plano.id, {
        ativo: true,
      })
      if (error) {
        toast.error('Erro ao ativar plano: ' + error)
      } else {
        toast.success('Plano ativado com sucesso')
        setPlanos((prev) =>
          prev.map((p) =>
            p.id === plano.id ? { ...p, ativo: true } : p
          )
        )
      }
    }
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
          <div>
            <h1 className="text-2xl font-bold">Planos</h1>
            <p className="text-muted-foreground">
              Gerencie os planos de assinatura da plataforma
            </p>
          </div>
        </div>
        <Button onClick={openNewPlano}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : planos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum plano cadastrado.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-right">Preço Mensal</TableHead>
                  <TableHead className="text-right">Preço Anual</TableHead>
                  <TableHead className="text-center">Max Usuários</TableHead>
                  <TableHead className="text-center">Max Produtos</TableHead>
                  <TableHead className="text-center">Max OS/mês</TableHead>
                  <TableHead className="text-center">Max Vendas/mês</TableHead>
                  <TableHead className="text-center">Destaque</TableHead>
                  <TableHead className="text-center">Ativo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planos
                  .sort((a, b) => a.ordem - b.ordem)
                  .map((plano) => (
                    <TableRow key={plano.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {plano.destaque && (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          )}
                          {plano.nome}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {plano.slug}
                        </code>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(plano.preco_mensal)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(plano.preco_anual)}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatLimit(plano.max_usuarios)}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatLimit(plano.max_produtos)}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatLimit(plano.max_os_mes)}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatLimit(plano.max_vendas_mes)}
                      </TableCell>
                      <TableCell className="text-center">
                        {plano.destaque ? (
                          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                            Sim
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Não
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={plano.ativo ? 'default' : 'secondary'}
                          className="cursor-pointer"
                          onClick={() => handleToggleAtivo(plano)}
                        >
                          {plano.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Editar plano"
                          onClick={() => openEditPlano(plano)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog: Novo/Editar Plano */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlano ? 'Editar Plano' : 'Novo Plano'}
            </DialogTitle>
            <DialogDescription>
              {editingPlano
                ? `Editando o plano "${editingPlano.nome}"`
                : 'Preencha os dados do novo plano de assinatura.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Row 1: Nome + Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plano-nome">Nome</Label>
                <Input
                  id="plano-nome"
                  placeholder="Ex: Profissional"
                  value={form.nome}
                  onChange={(e) =>
                    setForm({ ...form, nome: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plano-slug">Slug</Label>
                <Input
                  id="plano-slug"
                  placeholder="Ex: profissional"
                  value={form.slug}
                  onChange={(e) =>
                    setForm({ ...form, slug: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Descricao */}
            <div className="space-y-2">
              <Label htmlFor="plano-descricao">Descrição</Label>
              <Textarea
                id="plano-descricao"
                placeholder="Descrição do plano (opcional)"
                value={form.descricao}
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value })
                }
                rows={2}
              />
            </div>

            {/* Row 2: Precos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plano-preco-mensal">Preço Mensal (R$)</Label>
                <Input
                  id="plano-preco-mensal"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.preco_mensal}
                  onChange={(e) =>
                    setForm({ ...form, preco_mensal: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plano-preco-anual">Preço Anual (R$)</Label>
                <Input
                  id="plano-preco-anual"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.preco_anual}
                  onChange={(e) =>
                    setForm({ ...form, preco_anual: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Row 3: Limites */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plano-max-usuarios">
                  Max Usuários (-1 = ilimitado)
                </Label>
                <Input
                  id="plano-max-usuarios"
                  type="number"
                  min="-1"
                  value={form.max_usuarios}
                  onChange={(e) =>
                    setForm({ ...form, max_usuarios: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plano-max-produtos">
                  Max Produtos (-1 = ilimitado)
                </Label>
                <Input
                  id="plano-max-produtos"
                  type="number"
                  min="-1"
                  value={form.max_produtos}
                  onChange={(e) =>
                    setForm({ ...form, max_produtos: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plano-max-os">
                  Max OS/mês (-1 = ilimitado)
                </Label>
                <Input
                  id="plano-max-os"
                  type="number"
                  min="-1"
                  value={form.max_os_mes}
                  onChange={(e) =>
                    setForm({ ...form, max_os_mes: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plano-max-vendas">
                  Max Vendas/mês (-1 = ilimitado)
                </Label>
                <Input
                  id="plano-max-vendas"
                  type="number"
                  min="-1"
                  value={form.max_vendas_mes}
                  onChange={(e) =>
                    setForm({ ...form, max_vendas_mes: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Row 4: Ordem + Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="plano-ordem">Ordem de Exibição</Label>
                <Input
                  id="plano-ordem"
                  type="number"
                  min="0"
                  value={form.ordem}
                  onChange={(e) =>
                    setForm({ ...form, ordem: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center gap-2 pb-2">
                <Checkbox
                  id="plano-destaque"
                  checked={form.destaque}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, destaque: checked === true })
                  }
                />
                <Label htmlFor="plano-destaque" className="cursor-pointer">
                  Destaque
                </Label>
              </div>
              <div className="flex items-center gap-2 pb-2">
                <Checkbox
                  id="plano-ativo"
                  checked={form.ativo}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, ativo: checked === true })
                  }
                />
                <Label htmlFor="plano-ativo" className="cursor-pointer">
                  Ativo
                </Label>
              </div>
            </div>

            {/* Features JSON */}
            <div className="space-y-2">
              <Label htmlFor="plano-features">Features (JSON)</Label>
              <Textarea
                id="plano-features"
                className="font-mono text-xs"
                rows={8}
                value={form.features}
                onChange={(e) =>
                  setForm({ ...form, features: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Insira um JSON válido com as features do plano. Exemplo:
                {' {"pdv": true, "os": true, "suporte": "prioritario"}'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingPlano ? 'Salvar Alterações' : 'Criar Plano'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
