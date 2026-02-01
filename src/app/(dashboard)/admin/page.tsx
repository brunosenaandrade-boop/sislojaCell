'use client'

import { useEffect, useState } from 'react'
import { usePermissao } from '@/hooks/usePermissao'
import { superadminService } from '@/services/superadmin.service'
import type { PlataformaStats } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Building2,
  Users,
  FileText,
  ShoppingCart,
  DollarSign,
  CheckCircle,
  Shield,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  ScrollText,
} from 'lucide-react'
import Link from 'next/link'

interface AlertItem {
  tipo: 'critico' | 'aviso' | 'info'
  categoria: string
  mensagem: string
  empresa_id?: string
  empresa_nome?: string
}

interface AlertsData {
  alerts: AlertItem[]
  summary: {
    total_empresas: number
    empresas_ativas: number
    total_usuarios: number
    total_erros_24h: number
    total_erros_total: number
    total_alerts: number
    criticos: number
    avisos: number
  }
}

export default function AdminDashboardPage() {
  const { isSuperadmin } = usePermissao()
  const [stats, setStats] = useState<PlataformaStats | null>(null)
  const [alertsData, setAlertsData] = useState<AlertsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [alertsLoading, setAlertsLoading] = useState(true)

  const fetchAlerts = async () => {
    setAlertsLoading(true)
    try {
      const res = await fetch('/api/superadmin/alerts')
      if (res.ok) {
        const json = await res.json()
        setAlertsData(json.data || null)
      }
    } catch {
      // silently fail
    }
    setAlertsLoading(false)
  }

  useEffect(() => {
    async function load() {
      const { data } = await superadminService.getPlataformaStats()
      if (data) setStats(data)
      setLoading(false)
    }
    load()
    fetchAlerts()
  }, [])

  useEffect(() => {
    if (!isSuperadmin) return
    const interval = setInterval(fetchAlerts, 60000)
    return () => clearInterval(interval)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const cards = [
    {
      title: 'Total de Empresas',
      value: stats?.total_empresas ?? 0,
      icon: Building2,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Empresas Ativas',
      value: stats?.empresas_ativas ?? 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Total de Usuarios',
      value: stats?.total_usuarios ?? 0,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Ordens de Servico',
      value: stats?.total_os ?? 0,
      icon: FileText,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      title: 'Total de Vendas',
      value: stats?.total_vendas ?? 0,
      icon: ShoppingCart,
      color: 'text-pink-600',
      bg: 'bg-pink-50',
    },
    {
      title: 'Receita Total',
      value: formatCurrency(stats?.valor_total_vendas ?? 0),
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 text-white">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground">Visao geral da plataforma</p>
          </div>
        </div>
        <Link href="/admin/empresas">
          <Button>
            <Building2 className="h-4 w-4 mr-2" />
            Gerenciar Empresas
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-lg">Alertas e Monitoramento</CardTitle>
              {alertsData && alertsData.alerts.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {alertsData.alerts.length}
                </Badge>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={fetchAlerts} disabled={alertsLoading}>
              <RefreshCw className={alertsLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {alertsLoading && !alertsData ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !alertsData || alertsData.alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-10 w-10 mx-auto mb-3 text-green-500" />
              <p className="font-medium">Tudo certo!</p>
              <p className="text-sm">Nenhum alerta no momento.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Summary badges */}
              <div className="flex gap-3 mb-4">
                {alertsData.summary.criticos > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {alertsData.summary.criticos} critico{alertsData.summary.criticos !== 1 ? 's' : ''}
                  </Badge>
                )}
                {alertsData.summary.avisos > 0 && (
                  <Badge className="gap-1 bg-yellow-500 hover:bg-yellow-600 text-white">
                    <AlertTriangle className="h-3 w-3" />
                    {alertsData.summary.avisos} aviso{alertsData.summary.avisos !== 1 ? 's' : ''}
                  </Badge>
                )}
                {alertsData.summary.total_erros_24h > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <ScrollText className="h-3 w-3" />
                    {alertsData.summary.total_erros_24h} erro{alertsData.summary.total_erros_24h !== 1 ? 's' : ''} (24h)
                  </Badge>
                )}
              </div>

              {/* Alert items */}
              {alertsData.alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 rounded-lg border p-3 ${
                    alert.tipo === 'critico'
                      ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
                      : alert.tipo === 'aviso'
                      ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950'
                      : 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950'
                  }`}
                >
                  {alert.tipo === 'critico' ? (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                  ) : alert.tipo === 'aviso' ? (
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
                  ) : (
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={alert.tipo === 'critico' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {alert.categoria}
                      </Badge>
                      {alert.empresa_nome && (
                        <span className="text-xs text-muted-foreground">
                          {alert.empresa_nome}
                        </span>
                      )}
                    </div>
                    <p className="text-sm mt-1">{alert.mensagem}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/admin/empresas">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardContent className="pt-6 flex items-center gap-3">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Gerenciar Empresas</p>
                <p className="text-sm text-muted-foreground">Ativar, desativar, visualizar</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/usuarios">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardContent className="pt-6 flex items-center gap-3">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">Usuarios Global</p>
                <p className="text-sm text-muted-foreground">Todos os usuarios do sistema</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/logs">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardContent className="pt-6 flex items-center gap-3">
              <ScrollText className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium">Logs Globais</p>
                <p className="text-sm text-muted-foreground">Monitoramento em tempo real</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
