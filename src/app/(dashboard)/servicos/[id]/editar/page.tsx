'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Save,
  Wrench,
  Smartphone,
  Gamepad2,
  Clock,
  DollarSign,
  Settings,
  Zap,
  History,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'

// Serviço mockado
const serviçoMock = {
  id: '1',
  nome: 'Troca de Tela',
  descrição: 'Substituição completa do display e touchscreen',
  tipo: 'celular',
  nivel: 'avançado',
  preço_base: 150.00,
  tempo_estimado: 60,
  ativo: true,
  total_realizados: 45,
  created_at: '2023-06-15',
  updated_at: '2024-01-20',
}

export default function EditarServiçoPage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)

  // Estados do formulario
  const [nome, setNome] = useState('')
  const [descrição, setDescrição] = useState('')
  const [tipo, setTipo] = useState<string>('')
  const [nivel, setNivel] = useState<string>('')
  const [preçoBase, setPreçoBase] = useState('')
  const [tempoEstimado, setTempoEstimado] = useState('')
  const [ativo, setAtivo] = useState(true)
  const [totalRealizados, setTotalRealizados] = useState(0)

  // Carregar dados do serviço
  useEffect(() => {
    // TODO: Buscar do Supabase
    const serviço = serviçoMock
    setNome(serviço.nome)
    setDescrição(serviço.descrição || '')
    setTipo(serviço.tipo)
    setNivel(serviço.nivel)
    setPreçoBase(serviço.preço_base.toString())
    setTempoEstimado(serviço.tempo_estimado.toString())
    setAtivo(serviço.ativo)
    setTotalRealizados(serviço.total_realizados)
  }, [params.id])

  // Calculos
  const preçoNum = parseFloat(preçoBase) || 0
  const tempoNum = parseInt(tempoEstimado) || 0

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Formatar tempo
  const formatTempo = (minutos: number) => {
    if (minutos < 60) return `${minutos} min`
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`
  }

  // Salvar serviço
  const handleSalvar = async () => {
    // Validações
    if (!nome.trim()) {
      toast.error('Informe o nome do serviço')
      return
    }
    if (!tipo) {
      toast.error('Selecione o tipo do serviço')
      return
    }
    if (!nivel) {
      toast.error('Selecione o nível do serviço')
      return
    }
    if (preçoNum <= 0) {
      toast.error('Informe o preço base')
      return
    }
    if (tempoNum <= 0) {
      toast.error('Informe o tempo estimado')
      return
    }

    setIsLoading(true)

    try {
      const serviço = {
        id: params.id,
        nome,
        descrição,
        tipo,
        nivel,
        preço_base: preçoNum,
        tempo_estimado: tempoNum,
        ativo,
      }

      console.log('Serviço atualizado:', serviço)
      await new Promise(resolve => setTimeout(resolve, 800))

      toast.success('Serviço atualizado com sucesso!')
      router.push('/servicos')
    } catch (error) {
      toast.error('Erro ao atualizar serviço')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col">
      <Header title="Editar Serviço" />

      <div className="flex-1 space-y-6 p-4 lg:p-6">
        {/* Ações */}
        <div className="flex items-center justify-between">
          <Link href="/servicos">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <Button onClick={handleSalvar} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Formulario Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Informações do Serviço
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Serviço *</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descrição">Descrição</Label>
                  <Textarea
                    id="descrição"
                    value={descrição}
                    onChange={(e) => setDescrição(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select value={tipo} onValueChange={setTipo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="celular">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            Celular
                          </div>
                        </SelectItem>
                        <SelectItem value="videogame">
                          <div className="flex items-center gap-2">
                            <Gamepad2 className="h-4 w-4" />
                            Videogame
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nivel">Nível de Complexidade *</Label>
                    <Select value={nivel} onValueChange={setNivel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="básico">
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Básico
                          </div>
                        </SelectItem>
                        <SelectItem value="avançado">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Avançado
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Toggle Ativo */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label>Serviço Ativo</Label>
                    <p className="text-sm text-muted-foreground">
                      Serviços inativos não aparecem ao criar OS
                    </p>
                  </div>
                  <Button
                    variant={ativo ? 'default' : 'outline'}
                    onClick={() => setAtivo(!ativo)}
                  >
                    {ativo ? 'Ativo' : 'Inativo'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preço e Tempo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Preço e Tempo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="preço_base">Preço Base *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        R$
                      </span>
                      <Input
                        id="preço_base"
                        type="number"
                        step="0.01"
                        min="0"
                        value={preçoBase}
                        onChange={(e) => setPreçoBase(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tempo_estimado">Tempo Estimado (minutos) *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="tempo_estimado"
                        type="number"
                        min="1"
                        value={tempoEstimado}
                        onChange={(e) => setTempoEstimado(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Sugestões de tempo */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Sugestões:</span>
                  {[15, 30, 45, 60, 90, 120].map(min => (
                    <Button
                      key={min}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setTempoEstimado(String(min))}
                      className={tempoEstimado === String(min) ? 'bg-primary/10' : ''}
                    >
                      {formatTempo(min)}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Histórico */}
            {totalRealizados > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2 text-orange-700">
                    <AlertTriangle className="h-4 w-4" />
                    Atenção
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-orange-700">
                    Este serviço ja foi realizado <strong>{totalRealizados} vezes</strong>.
                    Alterações no preço base não afetarao OS ja criadas.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Coluna Lateral - Resumo */}
          <div className="space-y-6">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nome</span>
                    <span className="font-medium truncate max-w-[150px]">
                      {nome || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={ativo ? 'default' : 'secondary'}>
                      {ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tipo</span>
                    {tipo ? (
                      <Badge variant="outline" className="gap-1">
                        {tipo === 'celular' ? (
                          <><Smartphone className="h-3 w-3" /> Celular</>
                        ) : (
                          <><Gamepad2 className="h-3 w-3" /> Videogame</>
                        )}
                      </Badge>
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nível</span>
                    {nivel ? (
                      <Badge
                        variant={nivel === 'básico' ? 'secondary' : 'default'}
                        className={nivel === 'avançado' ? 'bg-orange-100 text-orange-700' : ''}
                      >
                        {nivel === 'básico' ? (
                          <><Settings className="h-3 w-3 mr-1" /> Básico</>
                        ) : (
                          <><Zap className="h-3 w-3 mr-1" /> Avançado</>
                        )}
                      </Badge>
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Preço Base</span>
                    <span className="font-medium text-green-600">
                      {preçoNum > 0 ? formatCurrency(preçoNum) : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tempo Estimado</span>
                    <span>{tempoNum > 0 ? formatTempo(tempoNum) : '-'}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Vezes Realizado</span>
                    <Badge variant="outline">
                      <History className="h-3 w-3 mr-1" />
                      {totalRealizados}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <Button className="w-full" onClick={handleSalvar} disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
