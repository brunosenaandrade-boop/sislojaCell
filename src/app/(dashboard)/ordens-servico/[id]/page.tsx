'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  Edit,
  Printer,
  User,
  Smartphone,
  Gamepad2,
  Eye,
  EyeOff,
  Lock,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  DollarSign,
  Wrench,
  Package,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import type { StatusOS } from '@/types/database'
import { CupomOS } from '@/components/print/CupomOS'
import { useAuthStore } from '@/store/useStore'
import { PatternLock } from '@/components/ui/pattern-lock'

// Configurações de status
const statusConfig: Record<StatusOS, { label: string; color: string; icon: React.ReactNode }> = {
  aberta: { label: 'Aberta', color: 'bg-blue-100 text-blue-800', icon: <FileText className="h-4 w-4" /> },
  em_analise: { label: 'Em Análise', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-4 w-4" /> },
  aguardando_peca: { label: 'Aguardando Peça', color: 'bg-orange-100 text-orange-800', icon: <Clock className="h-4 w-4" /> },
  aguardando_aprovacao: { label: 'Aguardando Aprovação', color: 'bg-purple-100 text-purple-800', icon: <AlertCircle className="h-4 w-4" /> },
  em_andamento: { label: 'Em Andamento', color: 'bg-cyan-100 text-cyan-800', icon: <Wrench className="h-4 w-4" /> },
  finalizada: { label: 'Finalizada', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> },
  entregue: { label: 'Entregue', color: 'bg-gray-100 text-gray-800', icon: <CheckCircle className="h-4 w-4" /> },
  cancelada: { label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: <AlertCircle className="h-4 w-4" /> },
}

// Fluxo de status permitidos
const statusFlow: Record<StatusOS, StatusOS[]> = {
  aberta: ['em_analise', 'cancelada'],
  em_analise: ['aguardando_peca', 'aguardando_aprovacao', 'em_andamento', 'cancelada'],
  aguardando_peca: ['em_andamento', 'cancelada'],
  aguardando_aprovacao: ['em_andamento', 'cancelada'],
  em_andamento: ['finalizada', 'aguardando_peca', 'cancelada'],
  finalizada: ['entregue'],
  entregue: [],
  cancelada: [],
}

// Mock de OS detalhada
const mockOSDetalhada = {
  id: '1',
  empresa_id: '1',
  cliente_id: '1',
  usuário_id: '1',
  número: 1001,
  status: 'em_andamento' as StatusOS,
  tipo_aparelho: 'celular',
  marca: 'Apple',
  modelo: 'iPhone 13',
  cor: 'Azul',
  imei: '123456789012345',
  tipo_desbloqueio: 'padrao' as 'sem_senha' | 'padrao' | 'pin' | 'senha',
  padrao_desbloqueio: [1, 4, 7, 8, 9, 6, 3] as number[] | undefined,
  pin_desbloqueio: undefined as string | undefined,
  senha_aparelho: undefined as string | undefined,
  condicao_entrada: 'Aparelho com tela quebrada no canto superior direito. Pequenos arranhoes na traseira.',
  acessórios: 'Carregador original, capa silicone preta',
  problema_relatado: 'Cliente relata que a tela quebrou apos queda. O aparelho liga mas o touch não funciona na parte de cima.',
  diagnóstico: 'Tela LCD danificada. Necessaria troca completa do display.',
  observações_internas: 'Cliente com pressa, prometemos entregar em 2 dias.',
  valor_serviços: 150,
  valor_produtos: 450,
  valor_desconto: 0,
  valor_total: 600,
  pago: false,
  data_entrada: '2026-01-25T10:30:00',
  data_previsao: '2026-01-27T18:00:00',
  created_at: '2026-01-25T10:30:00',
  updated_at: '2026-01-26T14:00:00',
  cliente: {
    id: '1',
    empresa_id: '1',
    nome: 'Maria Silva',
    telefone: '(48) 99999-1111',
    whatsapp: '(48) 99999-1111',
    email: 'maria@email.com',
    cpf: '123.456.789-00',
    ativo: true,
    created_at: '',
    updated_at: '',
  },
  usuário: {
    id: '1',
    empresa_id: '1',
    nome: 'Bruno (Admin)',
    email: 'bruno@loja.com',
    perfil: 'admin' as const,
    ativo: true,
    created_at: '',
    updated_at: '',
  },
  itens: [
    { id: '1', tipo: 'serviço', nome: 'Troca de Tela', quantidade: 1, valor_unitario: 150, valor_custo: 0 },
    { id: '2', tipo: 'produto', nome: 'Tela iPhone 13 Original', quantidade: 1, valor_unitario: 450, valor_custo: 280 },
  ],
}

export default function VisualizarOSPage() {
  const params = useParams()
  const router = useRouter()
  const { empresa, usuario } = useAuthStore()
  const [os, setOs] = useState(mockOSDetalhada)
  const [showSenha, setShowSenha] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [dialogStatusOpen, setDialogStatusOpen] = useState(false)
  const [novoStatus, setNovoStatus] = useState<StatusOS | ''>('')
  const [diagnóstico, setDiagnóstico] = useState(os.diagnóstico || '')
  const [showPrint, setShowPrint] = useState(false)
  const [tipoPrint, setTipoPrint] = useState<'entrada' | 'completa' | 'entrega'>('entrada')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const getAparelhoIcon = (tipo?: string) => {
    if (tipo === 'videogame') return <Gamepad2 className="h-5 w-5" />
    return <Smartphone className="h-5 w-5" />
  }

  // Alterar status
  const handleAlterarStatus = async () => {
    if (!novoStatus) return

    setIsLoading(true)
    try {
      // TODO: Atualizar no Supabase
      await new Promise(resolve => setTimeout(resolve, 500))

      setOs(prev => ({
        ...prev,
        status: novoStatus,
        diagnóstico: diagnóstico,
        ...(novoStatus === 'finalizada' ? { data_finalização: new Date().toISOString() } : {}),
        ...(novoStatus === 'entregue' ? { data_entrega: new Date().toISOString() } : {}),
      }))

      toast.success(`Status alterado para ${statusConfig[novoStatus].label}`)
      setDialogStatusOpen(false)
      setNovoStatus('')
    } catch (error) {
      toast.error('Erro ao alterar status')
    } finally {
      setIsLoading(false)
    }
  }

  // Marcar como pago
  const handleMarcarPago = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setOs(prev => ({ ...prev, pago: true, data_pagamento: new Date().toISOString() }))
      toast.success('Pagamento registrado')
    } catch (error) {
      toast.error('Erro ao registrar pagamento')
    } finally {
      setIsLoading(false)
    }
  }

  // Imprimir
  const handlePrint = (tipo: 'entrada' | 'completa' | 'entrega' = 'entrada') => {
    setTipoPrint(tipo)
    setShowPrint(true)
    setTimeout(() => {
      window.print()
      setShowPrint(false)
    }, 100)
  }

  const statusDisponiveis = statusFlow[os.status]

  return (
    <>
      {/* Conteudo para impressão */}
      {showPrint && (
        <div className="print:block hidden">
          <CupomOS
            os={os}
            tipo={tipoPrint}
            empresa={empresa}
            operador={usuario?.nome}
          />
        </div>
      )}

      <div className="flex flex-col print:hidden">
        <Header title={`OS #${os.número}`} />

        <div className="flex-1 space-y-6 p-4 lg:p-6">
          {/* Ações */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/ordens-servico">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handlePrint('entrada')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Comprovante de Entrada
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlePrint('completa')}>
                    <FileText className="mr-2 h-4 w-4" />
                    OS Completa
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlePrint('entrega')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Comprovante de Entrega
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href={`/ordens-servico/${os.id}/editar`}>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              </Link>

              {/* Botao de alterar status */}
              {statusDisponiveis.length > 0 && (
                <Dialog open={dialogStatusOpen} onOpenChange={setDialogStatusOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      Alterar Status
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Alterar Status da OS</DialogTitle>
                      <DialogDescription>
                        Selecione o novo status e adicione informações se necessário
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Status Atual</Label>
                        <Badge className={`${statusConfig[os.status].color} gap-1`}>
                          {statusConfig[os.status].icon}
                          {statusConfig[os.status].label}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <Label>Novo Status</Label>
                        <Select value={novoStatus} onValueChange={(v) => setNovoStatus(v as StatusOS)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o novo status" />
                          </SelectTrigger>
                          <SelectContent>
                            {statusDisponiveis.map(status => (
                              <SelectItem key={status} value={status}>
                                <span className="flex items-center gap-2">
                                  {statusConfig[status].icon}
                                  {statusConfig[status].label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {(novoStatus === 'em_andamento' || novoStatus === 'finalizada') && (
                        <div className="space-y-2">
                          <Label>Diagnóstico / Solucao</Label>
                          <Textarea
                            placeholder="Descreva o diagnóstico ou a solucao aplicada..."
                            value={diagnóstico}
                            onChange={(e) => setDiagnóstico(e.target.value)}
                            rows={4}
                          />
                        </div>
                      )}
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogStatusOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleAlterarStatus} disabled={!novoStatus || isLoading}>
                        {isLoading ? 'Alterando...' : 'Confirmar'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* Status Badge Grande */}
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <Badge className={`${statusConfig[os.status].color} gap-2 px-4 py-2 text-base`}>
                  {statusConfig[os.status].icon}
                  {statusConfig[os.status].label}
                </Badge>
                {os.pago ? (
                  <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                    <DollarSign className="h-3 w-3" />
                    Pago
                  </Badge>
                ) : os.valor_total > 0 ? (
                  <Badge variant="outline" className="gap-1 text-orange-600 border-orange-600">
                    <DollarSign className="h-3 w-3" />
                    Pendente
                  </Badge>
                ) : null}
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Entrada</p>
                <p className="font-medium">
                  {format(new Date(os.data_entrada), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Coluna Principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cliente */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-6">
                    <div>
                      <p className="text-lg font-medium">{os.cliente?.nome}</p>
                      <p className="text-sm text-muted-foreground">{os.cliente?.cpf}</p>
                    </div>
                    <Separator orientation="vertical" className="h-12 hidden sm:block" />
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{os.cliente?.telefone}</span>
                    </div>
                    {os.cliente?.email && (
                      <>
                        <Separator orientation="vertical" className="h-12 hidden sm:block" />
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{os.cliente?.email}</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Aparelho */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getAparelhoIcon(os.tipo_aparelho)}
                    Dados do Aparelho
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Tipo</p>
                      <p className="font-medium capitalize">{os.tipo_aparelho}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Marca</p>
                      <p className="font-medium">{os.marca}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Modelo</p>
                      <p className="font-medium">{os.modelo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cor</p>
                      <p className="font-medium">{os.cor || '-'}</p>
                    </div>
                  </div>

                  {os.imei && (
                    <div>
                      <p className="text-sm text-muted-foreground">IMEI / Serial</p>
                      <p className="font-mono">{os.imei}</p>
                    </div>
                  )}

                  {/* Desbloqueio do Aparelho */}
                  {os.tipo_desbloqueio && os.tipo_desbloqueio !== 'sem_senha' && (
                    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-orange-700">
                          <Lock className="h-5 w-5" />
                          <span className="font-medium">
                            Desbloqueio do Aparelho
                            <span className="ml-2 text-xs font-normal opacity-75">
                              ({os.tipo_desbloqueio === 'padrao' ? 'Padrão de Desenho' : os.tipo_desbloqueio === 'pin' ? 'PIN Numérico' : 'Senha'})
                            </span>
                          </span>
                        </div>
                        {(os.tipo_desbloqueio === 'pin' || os.tipo_desbloqueio === 'senha') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowSenha(!showSenha)}
                            className="text-orange-700"
                          >
                            {showSenha ? (
                              <><EyeOff className="mr-2 h-4 w-4" /> Ocultar</>
                            ) : (
                              <><Eye className="mr-2 h-4 w-4" /> Mostrar</>
                            )}
                          </Button>
                        )}
                      </div>

                      {/* Padrão de Desenho */}
                      {os.tipo_desbloqueio === 'padrao' && os.padrao_desbloqueio && (
                        <div className="mt-3 flex justify-center">
                          <PatternLock
                            value={os.padrao_desbloqueio}
                            readOnly
                            size={180}
                          />
                        </div>
                      )}

                      {/* PIN */}
                      {os.tipo_desbloqueio === 'pin' && os.pin_desbloqueio && (
                        <div className="mt-2">
                          <code className="rounded bg-orange-100 px-3 py-2 text-lg text-orange-800 font-mono tracking-[0.3em]">
                            {showSenha ? os.pin_desbloqueio : '●'.repeat(os.pin_desbloqueio.length)}
                          </code>
                        </div>
                      )}

                      {/* Senha */}
                      {os.tipo_desbloqueio === 'senha' && os.senha_aparelho && (
                        <div className="mt-2">
                          <code className="rounded bg-orange-100 px-3 py-2 text-lg text-orange-800 font-mono">
                            {showSenha ? os.senha_aparelho : '●'.repeat(os.senha_aparelho.length)}
                          </code>
                        </div>
                      )}
                    </div>
                  )}

                  {os.condicao_entrada && (
                    <div>
                      <p className="text-sm text-muted-foreground">Condicao de Entrada</p>
                      <p>{os.condicao_entrada}</p>
                    </div>
                  )}

                  {os.acessórios && (
                    <div>
                      <p className="text-sm text-muted-foreground">Acessórios</p>
                      <p>{os.acessórios}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Problema e Diagnóstico */}
              <Card>
                <CardHeader>
                  <CardTitle>Problema e Diagnóstico</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Problema Relatado pelo Cliente</p>
                    <p className="mt-1">{os.problema_relatado}</p>
                  </div>

                  {os.diagnóstico && (
                    <div>
                      <p className="text-sm text-muted-foreground">Diagnóstico Técnico</p>
                      <p className="mt-1">{os.diagnóstico}</p>
                    </div>
                  )}

                  {os.observações_internas && (
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-sm text-muted-foreground">Observações Internas</p>
                      <p className="mt-1 text-sm">{os.observações_internas}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Serviços e Produtos */}
              <Card>
                <CardHeader>
                  <CardTitle>Serviços e Peças</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-center">Qtd</TableHead>
                        <TableHead className="text-right">Valor Unit.</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {os.itens?.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Badge variant={item.tipo === 'serviço' ? 'default' : 'secondary'}>
                              {item.tipo === 'serviço' ? (
                                <><Wrench className="mr-1 h-3 w-3" /> Serviço</>
                              ) : (
                                <><Package className="mr-1 h-3 w-3" /> Peça</>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.nome}</TableCell>
                          <TableCell className="text-center">{item.quantidade}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.valor_unitario)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.valor_unitario * item.quantidade)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Coluna Lateral */}
            <div className="space-y-6">
              {/* Resumo Financeiro */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumo Financeiro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Serviços</span>
                      <span>{formatCurrency(os.valor_serviços)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Peças/Produtos</span>
                      <span>{formatCurrency(os.valor_produtos)}</span>
                    </div>
                    {os.valor_desconto > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Desconto</span>
                        <span>-{formatCurrency(os.valor_desconto)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-medium">
                      <span>Total</span>
                      <span className="text-green-600">{formatCurrency(os.valor_total)}</span>
                    </div>
                  </div>

                  <Separator />

                  {!os.pago && os.valor_total > 0 && (
                    <Button className="w-full" onClick={handleMarcarPago} disabled={isLoading}>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Registrar Pagamento
                    </Button>
                  )}

                  {os.pago && (
                    <div className="rounded-lg bg-green-50 p-3 text-center text-green-700">
                      <CheckCircle className="mx-auto h-6 w-6 mb-1" />
                      <p className="font-medium">Pago</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Informações */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Número da OS</span>
                    <span className="font-medium">#{os.número}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Criado por</span>
                    <span className="font-medium">{os.usuário?.nome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data de Entrada</span>
                    <span className="font-medium">
                      {format(new Date(os.data_entrada), 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>
                  {os.data_previsao && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Previsao</span>
                      <span className="font-medium">
                        {format(new Date(os.data_previsao), 'dd/MM/yyyy')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ultima Atualização</span>
                    <span className="font-medium">
                      {format(new Date(os.updated_at), 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
