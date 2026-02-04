'use client'

import { useEffect, useState, useRef } from 'react'
import { usePermissao } from '@/hooks/usePermissao'
import { superadminService } from '@/services/superadmin.service'
import type {
  TicketSuporte,
  TicketMensagem,
  StatusTicket,
  PrioridadeTicket,
} from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Headphones,
  Search,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Send,
  MessageSquare,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const statusConfig: Record<
  StatusTicket,
  { label: string; className: string }
> = {
  aberto: { label: 'Aberto', className: 'bg-blue-100 text-blue-700' },
  em_atendimento: {
    label: 'Em Atendimento',
    className: 'bg-yellow-100 text-yellow-700',
  },
  resolvido: {
    label: 'Resolvido',
    className: 'bg-green-100 text-green-700',
  },
  fechado: { label: 'Fechado', className: 'bg-gray-100 text-gray-700' },
}

const prioridadeConfig: Record<
  PrioridadeTicket,
  { label: string; className: string }
> = {
  baixa: { label: 'Baixa', className: 'bg-gray-100 text-gray-700' },
  media: { label: 'Media', className: 'bg-blue-100 text-blue-700' },
  alta: { label: 'Alta', className: 'bg-orange-100 text-orange-700' },
  urgente: { label: 'Urgente', className: 'bg-red-100 text-red-700' },
}

export default function SuporteAdminPage() {
  const { isSuperadmin } = usePermissao()
  const [tickets, setTickets] = useState<TicketSuporte[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroPrioridade, setFiltroPrioridade] = useState('todos')

  // Sheet / Detail state
  const [selectedTicket, setSelectedTicket] = useState<TicketSuporte | null>(
    null
  )
  const [sheetOpen, setSheetOpen] = useState(false)
  const [mensagens, setMensagens] = useState<TicketMensagem[]>([])
  const [loadingMensagens, setLoadingMensagens] = useState(false)
  const [resposta, setResposta] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [updatingTicket, setUpdatingTicket] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadTickets = async () => {
    setLoading(true)
    const params: { status?: string; prioridade?: string; search?: string } = {}
    if (filtroStatus !== 'todos') params.status = filtroStatus
    if (filtroPrioridade !== 'todos') params.prioridade = filtroPrioridade
    if (search.trim()) params.search = search.trim()

    const { data, error } = await superadminService.getTickets(params)
    if (error) {
      toast.error('Erro ao carregar tickets: ' + error)
    } else if (data) {
      setTickets(data)
    }
    setLoading(false)
  }

  const loadMensagens = async (ticketId: string) => {
    setLoadingMensagens(true)
    const { data, error } = await superadminService.getTicketMensagens(ticketId)
    if (error) {
      toast.error('Erro ao carregar mensagens: ' + error)
    } else if (data) {
      setMensagens(data)
    }
    setLoadingMensagens(false)
  }

  useEffect(() => {
    loadTickets()
  }, [filtroStatus, filtroPrioridade])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [mensagens])

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

  const handleOpenTicket = async (ticket: TicketSuporte) => {
    setSelectedTicket(ticket)
    setSheetOpen(true)
    setResposta('')
    await loadMensagens(ticket.id)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      loadTickets()
    }
  }

  const handleResponder = async () => {
    if (!selectedTicket || !resposta.trim()) {
      toast.error('Digite uma mensagem para enviar')
      return
    }
    setEnviando(true)
    const { error } = await superadminService.responderTicket(
      selectedTicket.id,
      resposta.trim()
    )
    if (error) {
      toast.error('Erro ao enviar resposta: ' + error)
    } else {
      toast.success('Resposta enviada')
      setResposta('')
      await loadMensagens(selectedTicket.id)
      // Auto-update status to em_atendimento if still aberto
      if (selectedTicket.status === 'aberto') {
        const { error: updateErr } = await superadminService.atualizarTicket(
          selectedTicket.id,
          { status: 'em_atendimento' }
        )
        if (!updateErr) {
          setSelectedTicket({
            ...selectedTicket,
            status: 'em_atendimento',
          })
          setTickets((prev) =>
            prev.map((t) =>
              t.id === selectedTicket.id
                ? { ...t, status: 'em_atendimento' as StatusTicket }
                : t
            )
          )
        }
      }
    }
    setEnviando(false)
  }

  const handleUpdateStatus = async (newStatus: StatusTicket) => {
    if (!selectedTicket) return
    setUpdatingTicket(true)
    const { error } = await superadminService.atualizarTicket(
      selectedTicket.id,
      { status: newStatus }
    )
    if (error) {
      toast.error('Erro ao atualizar status: ' + error)
    } else {
      toast.success('Status atualizado')
      setSelectedTicket({ ...selectedTicket, status: newStatus })
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id ? { ...t, status: newStatus } : t
        )
      )
    }
    setUpdatingTicket(false)
  }

  const handleUpdatePrioridade = async (newPrioridade: PrioridadeTicket) => {
    if (!selectedTicket) return
    setUpdatingTicket(true)
    const { error } = await superadminService.atualizarTicket(
      selectedTicket.id,
      { prioridade: newPrioridade }
    )
    if (error) {
      toast.error('Erro ao atualizar prioridade: ' + error)
    } else {
      toast.success('Prioridade atualizada')
      setSelectedTicket({ ...selectedTicket, prioridade: newPrioridade })
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id
            ? { ...t, prioridade: newPrioridade }
            : t
        )
      )
    }
    setUpdatingTicket(false)
  }

  const formatDate = (d: string) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDateShort = (d: string) => {
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
          <h1 className="text-2xl font-bold">Suporte</h1>
          <p className="text-muted-foreground">
            Gerencie os tickets de suporte das empresas
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por assunto ou empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos Status</SelectItem>
            <SelectItem value="aberto">Aberto</SelectItem>
            <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
            <SelectItem value="resolvido">Resolvido</SelectItem>
            <SelectItem value="fechado">Fechado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas Prioridades</SelectItem>
            <SelectItem value="baixa">Baixa</SelectItem>
            <SelectItem value="media">Media</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="urgente">Urgente</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={loadTickets}>
          <Search className="h-4 w-4 mr-2" />
          Buscar
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Headphones className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {search || filtroStatus !== 'todos' || filtroPrioridade !== 'todos'
                ? 'Nenhum ticket encontrado para os filtros aplicados.'
                : 'Nenhum ticket de suporte.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">#</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ultima msg</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => {
                  const sConf =
                    statusConfig[ticket.status] || statusConfig.aberto
                  const pConf =
                    prioridadeConfig[ticket.prioridade] ||
                    prioridadeConfig.baixa

                  return (
                    <TableRow
                      key={ticket.id}
                      className="cursor-pointer"
                      onClick={() => handleOpenTicket(ticket)}
                    >
                      <TableCell className="font-mono text-muted-foreground">
                        {ticket.numero}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {ticket.empresa?.nome_fantasia ||
                            ticket.empresa?.nome ||
                            '-'}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[250px] truncate">
                        {ticket.assunto}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${sConf.className} hover:${sConf.className}`}
                        >
                          {sConf.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${pConf.className} hover:${pConf.className}`}
                        >
                          {pConf.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateShort(ticket.created_at)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateShort(ticket.updated_at)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Sheet: Ticket Detail */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg flex flex-col"
        >
          {selectedTicket && (
            <>
              <SheetHeader className="border-b pb-4">
                <SheetTitle className="text-left pr-8">
                  #{selectedTicket.numero} - {selectedTicket.assunto}
                </SheetTitle>
                <div className="text-sm text-muted-foreground">
                  {selectedTicket.empresa?.nome_fantasia ||
                    selectedTicket.empresa?.nome ||
                    'Empresa desconhecida'}
                </div>

                {/* Status + Prioridade selectors */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Status</Label>
                    <Select
                      value={selectedTicket.status}
                      onValueChange={(v) =>
                        handleUpdateStatus(v as StatusTicket)
                      }
                      disabled={updatingTicket}
                    >
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aberto">Aberto</SelectItem>
                        <SelectItem value="em_atendimento">
                          Em Atendimento
                        </SelectItem>
                        <SelectItem value="resolvido">Resolvido</SelectItem>
                        <SelectItem value="fechado">Fechado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Prioridade</Label>
                    <Select
                      value={selectedTicket.prioridade}
                      onValueChange={(v) =>
                        handleUpdatePrioridade(v as PrioridadeTicket)
                      }
                      disabled={updatingTicket}
                    >
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </SheetHeader>

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3 min-h-0">
                {loadingMensagens ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : mensagens.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Nenhuma mensagem neste ticket.
                    </p>
                  </div>
                ) : (
                  mensagens.map((msg) => {
                    const isSuperadmin = msg.autor_tipo === 'superadmin'
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col gap-1 ${
                          isSuperadmin ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              isSuperadmin
                                ? 'bg-green-100 text-green-700 hover:bg-green-100 text-xs'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs'
                            }
                          >
                            {isSuperadmin ? 'Suporte' : 'Empresa'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(msg.created_at)}
                          </span>
                        </div>
                        <div
                          className={`rounded-lg px-3 py-2 max-w-[85%] text-sm ${
                            isSuperadmin
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-blue-50 border border-blue-200'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.mensagem}</p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Box */}
              <div className="border-t pt-4 space-y-3">
                <Textarea
                  placeholder="Digite sua resposta..."
                  value={resposta}
                  onChange={(e) => setResposta(e.target.value)}
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      handleResponder()
                    }
                  }}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Ctrl+Enter para enviar
                  </span>
                  <Button
                    onClick={handleResponder}
                    disabled={enviando || !resposta.trim()}
                  >
                    {enviando ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Enviar
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
