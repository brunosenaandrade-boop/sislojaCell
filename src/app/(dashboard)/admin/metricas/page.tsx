'use client'

import { useEffect, useState } from 'react'
import { usePermissao } from '@/hooks/usePermissao'
import { superadminService } from '@/services/superadmin.service'
import type { FunilOnboarding, MetricasUso } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart3,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Activity,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

function formatDate(d: string | null | undefined) {
  if (!d) return 'Nunca'
  const date = new Date(d)
  return (
    date.getDate().toString().padStart(2, '0') +
    '/' +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    '/' +
    date.getFullYear()
  )
}

export default function MetricasAdminPage() {
  const { isSuperadmin } = usePermissao()
  const [funil, setFunil] = useState<FunilOnboarding | null>(null)
  const [metricas, setMetricas] = useState<MetricasUso | null>(null)
  const [loadingFunil, setLoadingFunil] = useState(true)
  const [loadingMetricas, setLoadingMetricas] = useState(true)

  useEffect(() => {
    if (!isSuperadmin) return

    async function loadFunil() {
      const { data, error } = await superadminService.getFunil()
      if (error) {
        toast.error('Erro ao carregar funil: ' + error)
      } else if (data) {
        setFunil(data)
      }
      setLoadingFunil(false)
    }

    async function loadMetricas() {
      const { data, error } = await superadminService.getMetricas()
      if (error) {
        toast.error('Erro ao carregar métricas: ' + error)
      } else if (data) {
        setMetricas(data)
      }
      setLoadingMetricas(false)
    }

    loadFunil()
    loadMetricas()
  }, [isSuperadmin])

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <BarChart3 className="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-bold">Métricas</h1>
          <p className="text-muted-foreground text-sm">
            Funil de onboarding e métricas de uso
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="funil" className="space-y-6">
        <TabsList>
          <TabsTrigger value="funil" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Funil de Onboarding
          </TabsTrigger>
          <TabsTrigger value="uso" className="gap-2">
            <Activity className="h-4 w-4" />
            Uso
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Funil */}
        <TabsContent value="funil">
          {loadingFunil ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !funil ? (
            <Card>
              <CardContent className="py-12 text-center">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Não foi possível carregar os dados do funil.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Funil de Onboarding</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const steps = [
                    { label: 'Cadastro', value: funil.total_cadastros, color: 'bg-blue-500' },
                    { label: 'Onboarding Completo', value: funil.onboarding_completo, color: 'bg-blue-400' },
                    { label: 'Primeiro Produto', value: funil.primeiro_produto, color: 'bg-green-500' },
                    { label: 'Primeira Venda', value: funil.primeira_venda, color: 'bg-green-400' },
                    { label: 'Assinatura Ativa', value: funil.assinatura_ativa, color: 'bg-emerald-500' },
                  ]
                  const maxValue = steps[0].value || 1

                  return (
                    <div className="space-y-3">
                      {steps.map((step, i) => {
                        const pct = maxValue > 0 ? (step.value / maxValue) * 100 : 0
                        return (
                          <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium">{step.label}</span>
                              <span className="text-muted-foreground">{step.value} ({pct.toFixed(1)}%)</span>
                            </div>
                            <div className="h-8 bg-muted rounded-lg overflow-hidden">
                              <div
                                className={`h-full ${step.color} rounded-lg transition-all duration-500`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab 2: Uso */}
        <TabsContent value="uso">
          {loadingMetricas ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !metricas ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Não foi possível carregar as métricas de uso.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Ativas últimos 7 dias
                    </CardTitle>
                    <div className="rounded-lg p-2 bg-green-50">
                      <Activity className="h-4 w-4 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metricas.empresas_ativas_7d}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Ativas últimos 30 dias
                    </CardTitle>
                    <div className="rounded-lg p-2 bg-blue-50">
                      <Activity className="h-4 w-4 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metricas.empresas_ativas_30d}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Features mais usadas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Features mais usadas</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {metricas.features_mais_usadas.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Nenhum dado de uso disponível.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Categoria</TableHead>
                          <TableHead className="text-right">Total acessos</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {metricas.features_mais_usadas.map((f, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{f.categoria}</TableCell>
                            <TableCell className="text-right">{f.total}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Empresas inativas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Empresas inativas (30 dias)
                    {metricas.empresas_inativas_30d.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {metricas.empresas_inativas_30d.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {metricas.empresas_inativas_30d.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Nenhuma empresa inativa.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Último acesso</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {metricas.empresas_inativas_30d.map((e) => (
                          <TableRow key={e.id}>
                            <TableCell className="font-medium">
                              {e.nome_fantasia || e.nome}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(e.ultimo_acesso)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Uso por empresa */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Uso por empresa</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {metricas.uso_por_empresa.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Nenhum dado de uso por empresa.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Empresa</TableHead>
                          <TableHead className="text-center">Produtos</TableHead>
                          <TableHead className="text-center">Vendas</TableHead>
                          <TableHead className="text-center">OS</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {metricas.uso_por_empresa.map((u) => (
                          <TableRow key={u.empresa_id}>
                            <TableCell className="font-medium">{u.empresa_nome}</TableCell>
                            <TableCell className="text-center">{u.produtos_count}</TableCell>
                            <TableCell className="text-center">{u.vendas_count}</TableCell>
                            <TableCell className="text-center">{u.os_count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
