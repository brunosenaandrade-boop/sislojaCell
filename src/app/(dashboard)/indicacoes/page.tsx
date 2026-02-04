'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  Gift,
  Copy,
  Check,
  Loader2,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Share2,
} from 'lucide-react'
import { toast } from 'sonner'

// ============================================
// 13.19-13.24 - Página de Indicações
// ============================================

interface IndicacaoData {
  id: string
  status: string
  created_at: string
  data_contratacao_indicado?: string
  data_qualificacao?: string
  data_recompensa?: string
  empresa_indicada?: {
    id: string
    nome: string
    nome_fantasia?: string
    status_assinatura?: string
    created_at: string
  }
}

interface IndicacaoResponse {
  codigo: string | null
  meses_bonus: number
  indicacoes: IndicacaoData[]
  resumo: {
    total: number
    pendentes: number
    aguardando: number
    qualificadas: number
    recompensadas: number
    canceladas: number
  }
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock }> = {
  pendente: { label: 'Cadastrou', variant: 'outline', icon: Clock },
  aguardando: { label: 'Pagou', variant: 'secondary', icon: Clock },
  qualificada: { label: 'Qualificada', variant: 'default', icon: CheckCircle2 },
  recompensada: { label: 'Recompensada', variant: 'default', icon: Gift },
  cancelada: { label: 'Cancelada', variant: 'destructive', icon: XCircle },
}

export default function IndicacoesPage() {
  const [data, setData] = useState<IndicacaoResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [gerando, setGerando] = useState(false)
  const [copied, setCopied] = useState(false)

  const loadData = async () => {
    try {
      const res = await fetch('/api/indicacao')
      if (res.ok) {
        setData(await res.json())
      }
    } catch {
      toast.error('Erro ao carregar dados de indicação')
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleGerarCodigo = async () => {
    setGerando(true)
    try {
      const res = await fetch('/api/indicacao', { method: 'POST' })
      const json = await res.json()
      if (json.codigo) {
        toast.success('Código de indicação gerado!')
        loadData()
      } else {
        toast.error(json.error || 'Erro ao gerar código')
      }
    } catch {
      toast.error('Erro ao gerar código')
    }
    setGerando(false)
  }

  const getShareUrl = () => {
    if (!data?.codigo) return ''
    return `${window.location.origin}/cadastro?ref=${data.codigo}`
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(getShareUrl())
    setCopied(true)
    toast.success('Link copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Conheça o SisLoja Cell! Sistema completo para lojas de celular. Cadastre-se pelo meu link e ambos ganham benefícios: ${getShareUrl()}`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const formatDate = (d?: string) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Programa de Indicação</h1>
        <p className="text-muted-foreground">
          Indique outras lojas e ganhe meses grátis de acesso ao sistema.
        </p>
      </div>

      {/* Card: Como funciona */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">1</div>
              <div>
                <p className="font-medium">Compartilhe seu link</p>
                <p className="text-muted-foreground">Envie para outras lojas de celular</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">2</div>
              <div>
                <p className="font-medium">Loja se cadastra e assina</p>
                <p className="text-muted-foreground">Precisa permanecer ativa por 30 dias</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 font-bold text-xs">3</div>
              <div>
                <p className="font-medium">Você ganha 1 mês grátis!</p>
                <p className="text-muted-foreground">Sem limite de indicações</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo + Código */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card: Meses Bônus */}
        <Card>
          <CardContent className="pt-6 text-center">
            <Gift className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <p className="text-3xl font-bold text-green-600">{data?.meses_bonus || 0}</p>
            <p className="text-sm text-muted-foreground">Meses bônus acumulados</p>
          </CardContent>
        </Card>

        {/* Card: Total Indicações */}
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <p className="text-3xl font-bold">{data?.resumo?.total || 0}</p>
            <p className="text-sm text-muted-foreground">Indicações realizadas</p>
          </CardContent>
        </Card>

        {/* Card: Aguardando */}
        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
            <p className="text-3xl font-bold">{(data?.resumo?.pendentes || 0) + (data?.resumo?.aguardando || 0)}</p>
            <p className="text-sm text-muted-foreground">Aguardando qualificação</p>
          </CardContent>
        </Card>
      </div>

      {/* Card: Link de Indicação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Share2 className="h-5 w-5 text-blue-600" />
            Seu Link de Indicação
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.codigo ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg border bg-muted px-3 py-2.5 text-sm font-mono break-all">
                  {getShareUrl()}
                </code>
                <Button variant="outline" size="icon" onClick={handleCopy} title="Copiar link">
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Link
                </Button>
                <Button variant="outline" size="sm" onClick={handleWhatsApp} className="text-green-700 border-green-200 hover:bg-green-50">
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Compartilhar no WhatsApp
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Seu código: <span className="font-mono font-semibold">{data.codigo}</span>
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Você ainda não tem um código de indicação. Gere agora para começar a indicar!
              </p>
              <Button onClick={handleGerarCodigo} disabled={gerando}>
                {gerando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Gerar Meu Código de Indicação
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela de Indicações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Indicações</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!data?.indicacoes?.length ? (
            <div className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhuma indicação ainda. Compartilhe seu link para começar!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loja Indicada</TableHead>
                  <TableHead>Data Cadastro</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Primeiro Pagamento</TableHead>
                  <TableHead>Qualificação</TableHead>
                  <TableHead>Bônus</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.indicacoes.map((ind) => {
                  const sInfo = statusLabels[ind.status] || statusLabels.pendente
                  const Icon = sInfo.icon
                  return (
                    <TableRow key={ind.id}>
                      <TableCell>
                        <p className="font-medium">
                          {ind.empresa_indicada?.nome_fantasia || ind.empresa_indicada?.nome || '—'}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(ind.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={sInfo.variant} className="gap-1">
                          <Icon className="h-3 w-3" />
                          {sInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(ind.data_contratacao_indicado)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(ind.data_qualificacao)}
                      </TableCell>
                      <TableCell>
                        {ind.status === 'recompensada' ? (
                          <Badge variant="default" className="bg-green-600 gap-1">
                            <Gift className="h-3 w-3" />
                            +1 mês
                          </Badge>
                        ) : ind.status === 'cancelada' ? (
                          <span className="text-sm text-muted-foreground">—</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Aguardando</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
