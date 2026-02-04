'use client'

import { useEffect, useState } from 'react'
import { usePermissao } from '@/hooks/usePermissao'
import { superadminService } from '@/services/superadmin.service'
import type { ReceitaMensal, ReceitaPorPlano, Cupom } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  DollarSign,
  Download,
  Plus,
  Loader2,
  AlertCircle,
  ArrowLeft,
  TrendingUp,
  Ticket,
  FileDown,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const formatCurrency = (v: number | string) =>
  `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

function downloadCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(';'),
    ...data.map((row) =>
      headers
        .map((h) => {
          const val = row[h]
          const str = val === null || val === undefined ? '' : String(val)
          return str.includes(';') || str.includes('"') || str.includes('\n')
            ? '"' + str.replace(/"/g, '""') + '"'
            : str
        })
        .join(';')
    ),
  ].join('\n')
  const blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

export default function FinanceiroAdminPage() {
  const { isSuperadmin } = usePermissao()

  // Receita state
  const [meses, setMeses] = useState<ReceitaMensal[]>([])
  const [porPlano, setPorPlano] = useState<ReceitaPorPlano[]>([])
  const [loadingReceita, setLoadingReceita] = useState(true)

  // Cupons state
  const [cupons, setCupons] = useState<Cupom[]>([])
  const [loadingCupons, setLoadingCupons] = useState(true)
  const [cupomDialogOpen, setCupomDialogOpen] = useState(false)
  const [savingCupom, setSavingCupom] = useState(false)
  const [cupomForm, setCupomForm] = useState({
    codigo: '',
    descricao: '',
    tipo_desconto: 'percentual' as 'percentual' | 'fixo',
    valor: '',
    max_usos: '',
    plano_restrito: '',
    data_expiracao: '',
  })

  // Export state
  const [exportingEmpresas, setExportingEmpresas] = useState(false)
  const [exportingFinanceiro, setExportingFinanceiro] = useState(false)
  const [exportingUsuarios, setExportingUsuarios] = useState(false)

  const loadReceita = async () => {
    setLoadingReceita(true)
    const { data, error } = await superadminService.getReceita()
    if (error) {
      toast.error('Erro ao carregar receita: ' + error)
    } else if (data) {
      setMeses(data.meses || [])
      setPorPlano(data.por_plano || [])
    }
    setLoadingReceita(false)
  }

  const loadCupons = async () => {
    setLoadingCupons(true)
    const { data, error } = await superadminService.getCupons()
    if (error) {
      toast.error('Erro ao carregar cupons: ' + error)
    } else if (data) {
      setCupons(data)
    }
    setLoadingCupons(false)
  }

  useEffect(() => {
    loadReceita()
    loadCupons()
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

  const resetCupomForm = () => {
    setCupomForm({
      codigo: '',
      descricao: '',
      tipo_desconto: 'percentual',
      valor: '',
      max_usos: '',
      plano_restrito: '',
      data_expiracao: '',
    })
  }

  const handleCriarCupom = async () => {
    if (!cupomForm.codigo.trim()) {
      toast.error('Informe o código do cupom')
      return
    }
    if (!cupomForm.valor || Number(cupomForm.valor) <= 0) {
      toast.error('Informe um valor válido para o desconto')
      return
    }

    setSavingCupom(true)
    const payload: Partial<Cupom> = {
      codigo: cupomForm.codigo.toUpperCase().trim(),
      descricao: cupomForm.descricao.trim() || undefined,
      tipo_desconto: cupomForm.tipo_desconto,
      valor: Number(cupomForm.valor),
      max_usos: cupomForm.max_usos ? Number(cupomForm.max_usos) : undefined,
      plano_restrito: cupomForm.plano_restrito || undefined,
      data_expiracao: cupomForm.data_expiracao || undefined,
      ativo: true,
    }

    const { error } = await superadminService.criarCupom(payload)
    if (error) {
      toast.error('Erro ao criar cupom: ' + error)
    } else {
      toast.success('Cupom criado com sucesso')
      setCupomDialogOpen(false)
      resetCupomForm()
      loadCupons()
    }
    setSavingCupom(false)
  }

  const handleToggleCupom = async (cupom: Cupom) => {
    const novoStatus = !cupom.ativo
    const { error } = await superadminService.atualizarCupom(cupom.id, {
      ativo: novoStatus,
    })
    if (error) {
      toast.error('Erro ao atualizar cupom: ' + error)
    } else {
      toast.success(
        `Cupom ${novoStatus ? 'ativado' : 'desativado'} com sucesso`
      )
      setCupons((prev) =>
        prev.map((c) => (c.id === cupom.id ? { ...c, ativo: novoStatus } : c))
      )
    }
  }

  const handleExportEmpresas = async () => {
    setExportingEmpresas(true)
    const { data, error } = await superadminService.getEmpresas()
    if (error) {
      toast.error('Erro ao exportar empresas: ' + error)
    } else if (data && data.length > 0) {
      const rows = data.map((e) => ({
        ID: e.id,
        Nome: e.nome,
        'Nome Fantasia': e.nome_fantasia || '',
        CNPJ: e.cnpj || '',
        Plano: e.plano,
        'Status Assinatura': e.status_assinatura,
        Ativo: e.ativo ? 'Sim' : 'Não',
        'Trial Fim': e.trial_fim || '',
        Usuários: e.usuarios_count,
        'Ordens de Serviço': e.os_count,
        Vendas: e.vendas_count,
        'Criada em': e.created_at,
      }))
      downloadCSV(rows as unknown as Record<string, unknown>[], `empresas_${new Date().toISOString().split('T')[0]}.csv`)
      toast.success('Exportação de empresas concluída')
    } else {
      toast.info('Nenhuma empresa para exportar')
    }
    setExportingEmpresas(false)
  }

  const handleExportFinanceiro = async () => {
    setExportingFinanceiro(true)
    const { data, error } = await superadminService.getSaasStats()
    if (error) {
      toast.error('Erro ao exportar financeiro: ' + error)
    } else if (data) {
      const rows = [
        {
          Metrica: 'MRR',
          Valor: data.mrr,
        },
        {
          Metrica: 'ARR',
          Valor: data.arr,
        },
        {
          Metrica: 'Total Assinantes',
          Valor: data.total_assinantes,
        },
        {
          Metrica: 'Taxa Conversão (%)',
          Valor: data.taxa_conversao,
        },
        {
          Metrica: 'Churn Rate (%)',
          Valor: data.churn_rate,
        },
        {
          Metrica: 'Cancelamentos no Mês',
          Valor: data.cancelamentos_mes,
        },
        {
          Metrica: 'Faturas Vencidas',
          Valor: data.faturas_vencidas_count,
        },
        {
          Metrica: 'Trials Expirando',
          Valor: data.trials_expirando,
        },
        {
          Metrica: 'Indicações Total',
          Valor: data.indicacoes.total,
        },
        {
          Metrica: 'Indicações Qualificadas',
          Valor: data.indicacoes.qualificadas,
        },
      ]
      downloadCSV(rows as unknown as Record<string, unknown>[], `financeiro_${new Date().toISOString().split('T')[0]}.csv`)
      toast.success('Exportação financeira concluída')
    }
    setExportingFinanceiro(false)
  }

  const handleExportUsuarios = async () => {
    setExportingUsuarios(true)
    try {
      const { data: usuariosData, error: usuariosError } = await superadminService.getUsuarios()
      if (usuariosError) {
        toast.error('Erro ao exportar usuários: ' + usuariosError)
      } else if (usuariosData && usuariosData.length > 0) {
        const rows = usuariosData.map((u) => ({
          ID: u.id,
          Nome: u.nome,
          Email: u.email,
          Perfil: u.perfil,
          Ativo: u.ativo ? 'Sim' : 'Não',
          'Empresa ID': u.empresa_id || '',
          'Último Acesso': u.ultimo_acesso || '',
          'Criado em': u.created_at,
        }))
        downloadCSV(rows, `usuarios_${new Date().toISOString().split('T')[0]}.csv`)
        toast.success('Exportação de usuários concluída')
      } else {
        toast.info('Nenhum usuário para exportar')
      }
    } catch {
      toast.error('Erro ao exportar usuários')
    }
    setExportingUsuarios(false)
  }

  const formatDate = (d: string) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('pt-BR')
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
        <div>
          <h1 className="text-2xl font-bold">Financeiro</h1>
          <p className="text-muted-foreground">
            Receita, cupons e exportações
          </p>
        </div>
      </div>

      <Tabs defaultValue="receita">
        <TabsList>
          <TabsTrigger value="receita">
            <TrendingUp className="h-4 w-4 mr-1" />
            Receita
          </TabsTrigger>
          <TabsTrigger value="cupons">
            <Ticket className="h-4 w-4 mr-1" />
            Cupons
          </TabsTrigger>
          <TabsTrigger value="exportar">
            <FileDown className="h-4 w-4 mr-1" />
            Exportar
          </TabsTrigger>
        </TabsList>

        {/* ===================== TAB RECEITA ===================== */}
        <TabsContent value="receita" className="space-y-6 mt-4">
          {loadingReceita ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* MRR Line Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    MRR - Receita Recorrente Mensal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {meses.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Sem dados de receita disponíveis.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={meses}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" fontSize={12} />
                        <YAxis
                          fontSize={12}
                          tickFormatter={(v) =>
                            `R$ ${Number(v).toLocaleString('pt-BR')}`
                          }
                        />
                        <Tooltip
                          formatter={(v) => [formatCurrency(Number(v || 0)), 'MRR']}
                          labelFormatter={(label) => `Mês: ${label}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="mrr"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                          name="MRR"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* New Subscriptions Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Novas Assinaturas por Mês
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {meses.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Sem dados disponíveis.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={meses}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip
                          formatter={(v) => [
                            Number(v || 0),
                            'Novas Assinaturas',
                          ]}
                          labelFormatter={(label) => `Mês: ${label}`}
                        />
                        <Bar
                          dataKey="novas_assinaturas"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                          name="Novas Assinaturas"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Revenue by Plan Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Receita por Plano
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {porPlano.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Sem dados de planos disponíveis.
                    </p>
                  ) : (
                    <div className="flex flex-col lg:flex-row items-center gap-6">
                      <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                          <Pie
                            data={porPlano}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            dataKey="receita"
                            nameKey="plano"
                            label={({ name, percent }: { name?: string; percent?: number }) =>
                              `${name || ''} (${((percent || 0) * 100).toFixed(0)}%)`
                            }
                          >
                            {porPlano.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(v) => [
                              formatCurrency(Number(v || 0)),
                              'Receita',
                            ]}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ===================== TAB CUPONS ===================== */}
        <TabsContent value="cupons" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Cupons de Desconto
            </h2>
            <Button
              onClick={() => {
                resetCupomForm()
                setCupomDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Cupom
            </Button>
          </div>

          {loadingCupons ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : cupons.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhum cupom cadastrado.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Usos</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Expiração</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cupons.map((cupom) => {
                      const isExpired =
                        cupom.data_expiracao &&
                        new Date(cupom.data_expiracao) < new Date()
                      const isMaxUsed =
                        cupom.max_usos !== undefined &&
                        cupom.max_usos !== null &&
                        cupom.usos_atuais >= cupom.max_usos

                      return (
                        <TableRow key={cupom.id}>
                          <TableCell className="font-mono font-semibold">
                            {cupom.codigo}
                          </TableCell>
                          <TableCell>
                            {cupom.tipo_desconto === 'percentual'
                              ? 'Percentual'
                              : 'Fixo'}
                          </TableCell>
                          <TableCell>
                            {cupom.tipo_desconto === 'percentual'
                              ? `${cupom.valor}%`
                              : formatCurrency(cupom.valor)}
                          </TableCell>
                          <TableCell>
                            {cupom.usos_atuais}
                            {cupom.max_usos ? `/${cupom.max_usos}` : '/∞'}
                          </TableCell>
                          <TableCell>
                            {cupom.plano_restrito || 'Todos'}
                          </TableCell>
                          <TableCell>
                            {cupom.data_expiracao
                              ? formatDate(cupom.data_expiracao)
                              : 'Sem limite'}
                          </TableCell>
                          <TableCell>
                            {!cupom.ativo ? (
                              <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                                Inativo
                              </Badge>
                            ) : isExpired ? (
                              <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                                Expirado
                              </Badge>
                            ) : isMaxUsed ? (
                              <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                                Esgotado
                              </Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                Ativo
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleCupom(cupom)}
                            >
                              {cupom.ativo ? 'Desativar' : 'Ativar'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dialog: Novo Cupom */}
          <Dialog open={cupomDialogOpen} onOpenChange={setCupomDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Novo Cupom de Desconto</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo cupom.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cupom-codigo">Código</Label>
                  <Input
                    id="cupom-codigo"
                    placeholder="DESCONTO10"
                    value={cupomForm.codigo}
                    onChange={(e) =>
                      setCupomForm({
                        ...cupomForm,
                        codigo: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cupom-descricao">Descrição</Label>
                  <Input
                    id="cupom-descricao"
                    placeholder="Descrição do cupom (opcional)"
                    value={cupomForm.descricao}
                    onChange={(e) =>
                      setCupomForm({
                        ...cupomForm,
                        descricao: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Desconto</Label>
                    <Select
                      value={cupomForm.tipo_desconto}
                      onValueChange={(v) =>
                        setCupomForm({
                          ...cupomForm,
                          tipo_desconto: v as 'percentual' | 'fixo',
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentual">Percentual (%)</SelectItem>
                        <SelectItem value="fixo">Fixo (R$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cupom-valor">Valor</Label>
                    <Input
                      id="cupom-valor"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={
                        cupomForm.tipo_desconto === 'percentual'
                          ? 'Ex: 10'
                          : 'Ex: 29.90'
                      }
                      value={cupomForm.valor}
                      onChange={(e) =>
                        setCupomForm({
                          ...cupomForm,
                          valor: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cupom-max-usos">Max. Usos (opcional)</Label>
                    <Input
                      id="cupom-max-usos"
                      type="number"
                      min="1"
                      placeholder="Ilimitado"
                      value={cupomForm.max_usos}
                      onChange={(e) =>
                        setCupomForm({
                          ...cupomForm,
                          max_usos: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Plano Restrito</Label>
                    <Select
                      value={cupomForm.plano_restrito}
                      onValueChange={(v) =>
                        setCupomForm({
                          ...cupomForm,
                          plano_restrito: v === '_todos' ? '' : v,
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Todos os planos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_todos">Todos os planos</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cupom-expiracao">
                    Data de Expiração (opcional)
                  </Label>
                  <Input
                    id="cupom-expiracao"
                    type="date"
                    value={cupomForm.data_expiracao}
                    onChange={(e) =>
                      setCupomForm({
                        ...cupomForm,
                        data_expiracao: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCupomDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleCriarCupom} disabled={savingCupom}>
                  {savingCupom && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Criar Cupom
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ===================== TAB EXPORTAR ===================== */}
        <TabsContent value="exportar" className="mt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Download className="h-5 w-5" />
                  Exportar Empresas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Exporta todas as empresas cadastradas com estatísticas de uso
                  em formato CSV.
                </p>
                <Button
                  className="w-full"
                  onClick={handleExportEmpresas}
                  disabled={exportingEmpresas}
                >
                  {exportingEmpresas ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="mr-2 h-4 w-4" />
                  )}
                  Baixar CSV
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="h-5 w-5" />
                  Exportar Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Exporta métricas financeiras SaaS incluindo MRR, ARR, churn e
                  indicações.
                </p>
                <Button
                  className="w-full"
                  onClick={handleExportFinanceiro}
                  disabled={exportingFinanceiro}
                >
                  {exportingFinanceiro ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="mr-2 h-4 w-4" />
                  )}
                  Baixar CSV
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Download className="h-5 w-5" />
                  Exportar Usuários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Exporta todos os usuários da plataforma com dados de perfil e
                  acesso.
                </p>
                <Button
                  className="w-full"
                  onClick={handleExportUsuarios}
                  disabled={exportingUsuarios}
                >
                  {exportingUsuarios ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="mr-2 h-4 w-4" />
                  )}
                  Baixar CSV
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
