'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, usePrintConfigStore } from '@/store/useStore'
import { configuracoesService } from '@/services/configuracoes.service'
import { produtosService } from '@/services/produtos.service'
import { servicosService } from '@/services/servicos.service'
import type { Empresa } from '@/types/database'
import {
  Building2,
  Printer,
  Package,
  Rocket,
  ArrowRight,
  ArrowLeft,
  SkipForward,
  Check,
  Loader2,
  Upload,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const steps = [
  { title: 'Dados da Empresa', icon: Building2, desc: 'Informações básicas da sua loja' },
  { title: 'Impressão', icon: Printer, desc: 'Configure o cupom de venda' },
  { title: 'Primeiro Cadastro', icon: Package, desc: 'Cadastre um produto ou serviço' },
  { title: 'Pronto!', icon: Rocket, desc: 'Sua loja está configurada' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { empresa, setEmpresa } = useAuthStore()
  const printConfig = usePrintConfigStore()

  const [currentStep, setCurrentStep] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  // Step 1 - Empresa
  const [nomeFantasia, setNomeFantasia] = useState(empresa?.nome_fantasia || '')
  const [cnpj, setCnpj] = useState(empresa?.cnpj || '')
  const [telefone, setTelefone] = useState(empresa?.telefone || '')
  const [whatsapp, setWhatsapp] = useState(empresa?.whatsapp || '')
  const [email, setEmail] = useState(empresa?.email || '')
  const [endereco, setEndereco] = useState(empresa?.endereco || '')
  const [cidade, setCidade] = useState(empresa?.cidade || '')
  const [estado, setEstado] = useState(empresa?.estado || '')
  const [cep, setCep] = useState(empresa?.cep || '')
  const [logoBase64, setLogoBase64] = useState<string | null>(null)

  // Step 2 - Impressão
  const [tipoImpressora, setTipoImpressora] = useState(printConfig.tipoImpressora)
  const [larguraPapel, setLarguraPapel] = useState(printConfig.larguraPapel)

  // Step 3 - Primeiro cadastro
  const [cadastroTipo, setCadastroTipo] = useState<'produto' | 'servico'>('produto')
  const [produtoNome, setProdutoNome] = useState('')
  const [produtoPreco, setProdutoPreco] = useState('')
  const [servicoNome, setServicoNome] = useState('')
  const [servicoPreco, setServicoPreco] = useState('')

  const formatCnpj = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 14)
    if (digits.length <= 2) return digits
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
    if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
  }

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 10) {
      return digits.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3')
    }
    return digits.replace(/^(\d{2})(\d{5})(\d{0,4})$/, '($1) $2-$3')
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Imagem deve ter no máximo 2MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setLogoBase64(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const saveStep1 = async () => {
    setIsSaving(true)
    try {
      const dados: Partial<Empresa> = {}
      if (nomeFantasia) dados.nome_fantasia = nomeFantasia
      if (cnpj) dados.cnpj = cnpj.replace(/\D/g, '')
      if (telefone) dados.telefone = telefone
      if (whatsapp) dados.whatsapp = whatsapp
      if (email) dados.email = email
      if (endereco) dados.endereco = endereco
      if (cidade) dados.cidade = cidade
      if (estado) dados.estado = estado
      if (cep) dados.cep = cep
      if (logoBase64) dados.logo_url = logoBase64

      if (Object.keys(dados).length > 0) {
        const { data, error } = await configuracoesService.atualizarEmpresa(dados)
        if (error) {
          toast.error(error)
          return
        }
        if (data) setEmpresa(data)
      }
      setCurrentStep(1)
    } catch {
      toast.error('Erro ao salvar dados da empresa')
    } finally {
      setIsSaving(false)
    }
  }

  const saveStep2 = () => {
    printConfig.setTipoImpressora(tipoImpressora)
    printConfig.setLarguraPapel(larguraPapel)
    setCurrentStep(2)
  }

  const saveStep3 = async () => {
    setIsSaving(true)
    try {
      if (cadastroTipo === 'produto' && produtoNome) {
        const { error } = await produtosService.criar({
          nome: produtoNome,
          preco_venda: parseFloat(produtoPreco.replace(',', '.')) || 0,
          estoque_atual: 0,
          estoque_minimo: 0,
          ativo: true,
        })
        if (error) {
          toast.error(error)
          return
        }
        toast.success('Produto cadastrado!')
      } else if (cadastroTipo === 'servico' && servicoNome) {
        const { error } = await servicosService.criar({
          nome: servicoNome,
          preco_base: parseFloat(servicoPreco.replace(',', '.')) || 0,
          tipo: 'basico',
          ativo: true,
        })
        if (error) {
          toast.error(error)
          return
        }
        toast.success('Serviço cadastrado!')
      }
      setCurrentStep(3)
    } catch {
      toast.error('Erro ao cadastrar')
    } finally {
      setIsSaving(false)
    }
  }

  const finishOnboarding = async () => {
    setIsSaving(true)
    try {
      const { data, error } = await configuracoesService.atualizarEmpresa({ onboarding_completo: true } )
      if (error) {
        toast.error(error)
        return
      }
      if (data) setEmpresa(data)
      toast.success('Sua loja está pronta! Boas vendas!')
      // Usar hard navigation para garantir que o middleware veja os dados atualizados
      window.location.href = '/dashboard'
    } catch {
      toast.error('Erro ao finalizar')
    } finally {
      setIsSaving(false)
    }
  }

  const skipAll = async () => {
    setIsSaving(true)
    try {
      const { data, error } = await configuracoesService.atualizarEmpresa({ onboarding_completo: true } )
      if (error) {
        toast.error(error)
        return
      }
      if (data) setEmpresa(data)
      // Usar hard navigation para garantir que o middleware veja os dados atualizados
      window.location.href = '/dashboard'
    } catch {
      toast.error('Erro ao pular')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
            CF
          </div>
          <h1 className="text-2xl font-bold">Configurar sua loja</h1>
          <p className="text-muted-foreground">
            Complete os passos abaixo para começar a usar o sistema
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={step.title} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                      i < currentStep
                        ? 'bg-green-600 text-white'
                        : i === currentStep
                          ? 'bg-blue-600 text-white'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {i < currentStep ? <Check className="h-5 w-5" /> : i + 1}
                  </div>
                  <span className="mt-1 hidden text-xs text-muted-foreground sm:block">
                    {step.title}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 flex-1 transition-colors ${
                      i < currentStep ? 'bg-green-600' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="pt-6">
            {/* STEP 1 - Dados da Empresa */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Complete os dados da sua loja</h2>
                  <p className="text-sm text-muted-foreground">
                    Essas informações aparecem nos cupons e documentos. Tudo opcional, pode preencher depois.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                    <Input
                      id="nomeFantasia"
                      value={nomeFantasia}
                      onChange={(e) => setNomeFantasia(e.target.value)}
                      placeholder="Como seus clientes conhecem sua loja"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      value={cnpj}
                      onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="loja@exemplo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={telefone}
                      onChange={(e) => setTelefone(formatPhone(e.target.value))}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      placeholder="Rua, número"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      value={cep}
                      onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                      placeholder="00000000"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      placeholder="Sua cidade"
                    />
                  </div>
                  <div>
                    <Label htmlFor="estado">Estado</Label>
                    <Input
                      id="estado"
                      value={estado}
                      onChange={(e) => setEstado(e.target.value.toUpperCase().slice(0, 2))}
                      placeholder="UF"
                      maxLength={2}
                    />
                  </div>
                </div>

                {/* Logo */}
                <div>
                  <Label>Logo da Empresa (opcional)</Label>
                  <div className="mt-1 flex items-center gap-4">
                    {logoBase64 ? (
                      <img src={logoBase64} alt="Logo" className="h-16 w-16 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Upload className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml"
                        onChange={handleLogoUpload}
                        className="text-sm"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">PNG, JPG ou SVG. Máximo 2MB.</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="ghost" onClick={skipAll} disabled={isSaving}>
                    <SkipForward className="mr-2 h-4 w-4" />
                    Pular tudo
                  </Button>
                  <Button onClick={saveStep1} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Próximo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2 - Impressão */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Configuração de Impressão</h2>
                  <p className="text-sm text-muted-foreground">
                    Configure como os cupons serão impressos. Pode alterar depois em Configurações.
                  </p>
                </div>

                <div>
                  <Label>Tipo de Impressora</Label>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTipoImpressora('térmica')}
                      className={`rounded-lg border-2 p-4 text-center transition-colors ${
                        tipoImpressora === 'térmica'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-muted hover:border-gray-300'
                      }`}
                    >
                      <Printer className="mx-auto mb-2 h-8 w-8" />
                      <p className="font-medium">Térmica</p>
                      <p className="text-xs text-muted-foreground">Cupom 58mm ou 80mm</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoImpressora('padrão')}
                      className={`rounded-lg border-2 p-4 text-center transition-colors ${
                        tipoImpressora === 'padrão'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-muted hover:border-gray-300'
                      }`}
                    >
                      <Printer className="mx-auto mb-2 h-8 w-8" />
                      <p className="font-medium">Padrão (A4)</p>
                      <p className="text-xs text-muted-foreground">Folha A4 comum</p>
                    </button>
                  </div>
                </div>

                {tipoImpressora === 'térmica' && (
                  <div>
                    <Label>Largura do Papel</Label>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setLarguraPapel('58')}
                        className={`rounded-lg border-2 p-3 text-center transition-colors ${
                          larguraPapel === '58'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-muted hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium">58mm</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLarguraPapel('80')}
                        className={`rounded-lg border-2 p-3 text-center transition-colors ${
                          larguraPapel === '80'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-muted hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium">80mm</p>
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setCurrentStep(0)}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Voltar
                    </Button>
                    <Button variant="ghost" onClick={() => setCurrentStep(2)}>
                      <SkipForward className="mr-2 h-4 w-4" />
                      Pular
                    </Button>
                  </div>
                  <Button onClick={saveStep2}>
                    Próximo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3 - Primeiro Cadastro */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Primeiro Cadastro</h2>
                  <p className="text-sm text-muted-foreground">
                    Cadastre seu primeiro produto ou serviço. Pode pular e fazer depois.
                  </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCadastroTipo('produto')}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      cadastroTipo === 'produto'
                        ? 'bg-blue-600 text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    Produto
                  </button>
                  <button
                    type="button"
                    onClick={() => setCadastroTipo('servico')}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      cadastroTipo === 'servico'
                        ? 'bg-blue-600 text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    Serviço
                  </button>
                </div>

                {cadastroTipo === 'produto' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="prod-nome">Nome do Produto</Label>
                      <Input
                        id="prod-nome"
                        value={produtoNome}
                        onChange={(e) => setProdutoNome(e.target.value)}
                        placeholder="Ex: Película de Vidro iPhone 15"
                      />
                    </div>
                    <div>
                      <Label htmlFor="prod-preco">Preço de Venda (R$)</Label>
                      <Input
                        id="prod-preco"
                        value={produtoPreco}
                        onChange={(e) => setProdutoPreco(e.target.value)}
                        placeholder="29,90"
                      />
                    </div>
                  </div>
                )}

                {cadastroTipo === 'servico' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="serv-nome">Nome do Serviço</Label>
                      <Input
                        id="serv-nome"
                        value={servicoNome}
                        onChange={(e) => setServicoNome(e.target.value)}
                        placeholder="Ex: Troca de Tela iPhone 15"
                      />
                    </div>
                    <div>
                      <Label htmlFor="serv-preco">Preço (R$)</Label>
                      <Input
                        id="serv-preco"
                        value={servicoPreco}
                        onChange={(e) => setServicoPreco(e.target.value)}
                        placeholder="250,00"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Voltar
                    </Button>
                    <Button variant="ghost" onClick={() => setCurrentStep(3)}>
                      <SkipForward className="mr-2 h-4 w-4" />
                      Pular
                    </Button>
                  </div>
                  <Button
                    onClick={saveStep3}
                    disabled={isSaving || (cadastroTipo === 'produto' ? !produtoNome : !servicoNome)}
                  >
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Cadastrar e Continuar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4 - Pronto */}
            {currentStep === 3 && (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-10 w-10 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Tudo pronto!</h2>
                  <p className="mt-2 text-muted-foreground">
                    Sua loja está configurada. Agora você pode abrir o caixa, cadastrar
                    produtos, criar ordens de serviço e realizar vendas.
                  </p>
                </div>

                <div className="rounded-lg border bg-muted/50 p-4 text-left">
                  <p className="mb-2 text-sm font-medium">Próximos passos sugeridos:</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Cadastre seus produtos e serviços</li>
                    <li>• Abra o caixa para iniciar as vendas</li>
                    <li>• Cadastre seus clientes</li>
                    <li>• Crie sua primeira ordem de serviço</li>
                  </ul>
                </div>

                <Button size="lg" onClick={finishOnboarding} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Ir para o Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
