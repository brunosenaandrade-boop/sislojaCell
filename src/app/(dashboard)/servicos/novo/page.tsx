'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
} from 'lucide-react'
import { toast } from 'sonner'

export default function NovoServiçoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Estados do formulario
  const [nome, setNome] = useState('')
  const [descrição, setDescrição] = useState('')
  const [tipo, setTipo] = useState<string>('')
  const [nivel, setNivel] = useState<string>('')
  const [preçoBase, setPreçoBase] = useState('')
  const [tempoEstimado, setTempoEstimado] = useState('')

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
      toast.error('Selecione o nivel do serviço')
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
        nome,
        descrição,
        tipo,
        nivel,
        preço_base: preçoNum,
        tempo_estimado: tempoNum,
        ativo: true,
      }

      console.log('Serviço:', serviço)
      await new Promise(resolve => setTimeout(resolve, 800))

      toast.success('Serviço cadastrado com sucesso!')
      router.push('/servicos')
    } catch (error) {
      toast.error('Erro ao cadastrar serviço')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col">
      <Header title="Novo Serviço" />

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
            {isLoading ? 'Salvando...' : 'Salvar Serviço'}
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
                <CardDescription>
                  Dados principais do serviço
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Serviço *</Label>
                  <Input
                    id="nome"
                    placeholder="Ex: Troca de Tela"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descrição">Descrição</Label>
                  <Textarea
                    id="descrição"
                    placeholder="Descreva o serviço em detalhes..."
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
                    <p className="text-xs text-muted-foreground">
                      Categoria do aparelho atendido
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nivel">Nivel de Complexidade *</Label>
                    <Select value={nivel} onValueChange={setNivel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nivel" />
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
                    <p className="text-xs text-muted-foreground">
                      Define o nivel de habilidade necessário
                    </p>
                  </div>
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
                <CardDescription>
                  Defina o valor base e tempo estimado
                </CardDescription>
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
                        placeholder="0,00"
                        value={preçoBase}
                        onChange={(e) => setPreçoBase(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Valor mínimo cobrado pelo serviço
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tempo_estimado">Tempo Estimado (minutos) *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="tempo_estimado"
                        type="number"
                        min="1"
                        placeholder="60"
                        value={tempoEstimado}
                        onChange={(e) => setTempoEstimado(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Tempo médio para realizar o serviço
                    </p>
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

            {/* Informações Adicionais */}
            <Card>
              <CardHeader>
                <CardTitle>Dicas para Precificação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    <strong>Serviços Básicos:</strong> Geralmente entre R$ 50 e R$ 150.
                    Incluem trocas simples de componentes e limpezas.
                  </p>
                  <p>
                    <strong>Serviços Avançados:</strong> Geralmente entre R$ 150 e R$ 400.
                    Incluem reparos de placa, soldas e diagnósticos complexos.
                  </p>
                  <p>
                    <strong>Tempo Estimado:</strong> Considere o tempo real de trabalho
                    mais uma margem para imprevistos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Lateral - Resumo */}
          <div className="space-y-6">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Resumo do Serviço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nome</span>
                    <span className="font-medium truncate max-w-[150px]">
                      {nome || '-'}
                    </span>
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
                    <span className="text-muted-foreground">Nivel</span>
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
                    <span className="text-muted-foreground">Status</span>
                    <Badge>Ativo</Badge>
                  </div>
                </div>

                <Separator />

                <Button className="w-full" onClick={handleSalvar} disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? 'Salvando...' : 'Cadastrar Serviço'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
