'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Eye, EyeOff, Gift } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function CadastroPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <CadastroForm />
    </Suspense>
  )
}

function CadastroForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const refCode = searchParams.get('ref')
  const { setUsuario, setEmpresa, setLoading } = useAuthStore()

  const [nomeEmpresa, setNomeEmpresa] = useState('')
  const [nomeFantasia, setNomeFantasia] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [telefone, setTelefone] = useState('')
  const [nomeUsuario, setNomeUsuario] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [nomeIndicador, setNomeIndicador] = useState<string | null>(null)

  // 13.15 - Buscar nome da empresa que indicou
  useEffect(() => {
    if (refCode) {
      fetch(`/api/indicacao?codigo=${encodeURIComponent(refCode)}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data?.nome) setNomeIndicador(data.nome) })
        .catch(() => {})
    }
  }, [refCode])

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()

    if (senha.length < 6) {
      toast.error('A senha deve ter no minimo 6 caracteres')
      return
    }

    if (senha !== confirmarSenha) {
      toast.error('As senhas nao coincidem')
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await authService.cadastrarEmpresa({
        nomeEmpresa,
        nomeFantasia: nomeFantasia || undefined,
        cnpj: cnpj || undefined,
        telefone: telefone || undefined,
        nomeUsuario,
        email,
        senha,
        codigoIndicacao: refCode || undefined,
      })

      if (error) {
        toast.error(error)
        return
      }

      if (!data) {
        toast.error('Erro ao criar conta')
        return
      }

      // Auto-login apos cadastro
      setUsuario(data.usuario)
      setEmpresa(data.empresa)
      setLoading(false)

      toast.success('Conta criada com sucesso!')
      router.push('/dashboard')
    } catch {
      toast.error('Erro inesperado ao criar conta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground">
            LC
          </div>
          <CardTitle className="text-2xl">Criar Conta</CardTitle>
          <CardDescription>
            Cadastre sua empresa para comecar a usar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {refCode && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
              <Gift className="h-4 w-4 shrink-0" />
              <span>
                {nomeIndicador
                  ? `Você foi indicado por ${nomeIndicador}! Ambos ganham benefícios ao assinar.`
                  : 'Você foi indicado! Ambos ganham benefícios ao assinar.'}
              </span>
            </div>
          )}
          <form onSubmit={handleCadastro} className="space-y-4">
            {/* Dados da Empresa */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Dados da Empresa</p>

              <div className="space-y-2">
                <Label htmlFor="nomeEmpresa">Razao Social *</Label>
                <Input
                  id="nomeEmpresa"
                  placeholder="Nome da empresa"
                  value={nomeEmpresa}
                  onChange={(e) => setNomeEmpresa(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                <Input
                  id="nomeFantasia"
                  placeholder="Nome fantasia (opcional)"
                  value={nomeFantasia}
                  onChange={(e) => setNomeFantasia(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    placeholder="00.000.000/0000-00"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    placeholder="(00) 00000-0000"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium text-muted-foreground mb-3">Dados do Administrador</p>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="nomeUsuario">Nome Completo *</Label>
                  <Input
                    id="nomeUsuario"
                    placeholder="Seu nome"
                    value={nomeUsuario}
                    onChange={(e) => setNomeUsuario(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senha">Senha *</Label>
                  <div className="relative">
                    <Input
                      id="senha"
                      type={showSenha ? 'text' : 'password'}
                      placeholder="Minimo 6 caracteres"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowSenha(!showSenha)}
                    >
                      {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                  <Input
                    id="confirmarSenha"
                    type={showSenha ? 'text' : 'password'}
                    placeholder="Repita a senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar Conta'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-sm text-muted-foreground">Ja tem uma conta? </span>
            <Link href="/login">
              <Button variant="link" className="text-sm p-0">
                Entrar
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
