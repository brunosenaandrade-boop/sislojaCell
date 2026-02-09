'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/useStore'
import { getClient } from '@/lib/supabase/client'
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
  const [whatsapp, setWhatsapp] = useState('')
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
      // 1. Criar conta via API server-side (auto-confirma email)
      const res = await fetch('/api/auth/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeEmpresa,
          whatsapp: whatsapp || undefined,
          nomeUsuario,
          email,
          senha,
          codigoIndicacao: refCode || undefined,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error || 'Erro ao criar conta')
        return
      }

      // 2. Auto-login com as credenciais
      const supabase = getClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      })

      if (signInError) {
        toast.error('Conta criada, mas erro ao fazer login automático. Faça login manualmente.')
        router.push('/login')
        return
      }

      setUsuario(json.usuario)
      setEmpresa(json.empresa)
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
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
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="nomeEmpresa">Nome da Empresa *</Label>
                <Input
                  id="nomeEmpresa"
                  placeholder="Ex: Cell Tech Assistência"
                  value={nomeEmpresa}
                  onChange={(e) => setNomeEmpresa(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp *</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nomeUsuario">Seu Nome *</Label>
                <Input
                  id="nomeUsuario"
                  placeholder="Nome completo"
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
                    placeholder="Mínimo 6 caracteres"
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

            <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar Conta Grátis'
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              7 dias grátis. Sem cartão de crédito.
            </p>
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
