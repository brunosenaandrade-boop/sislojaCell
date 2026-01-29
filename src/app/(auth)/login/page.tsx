'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/useStore'
import { logger } from '@/services/logger'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const supabase = getClient()
  const { setUsuario, setEmpresa, setLoading } = useAuthStore()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 1. Autenticar com Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error('Usuário não encontrado')
      }

      // 2. Buscar dados do usuário no banco
      const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .select('*, empresa:empresas(*)')
        .eq('auth_id', authData.user.id)
        .single()

      if (usuarioError || !usuario) {
        throw new Error('Usuário não cadastrado no sistema')
      }

      if (!usuario.ativo) {
        throw new Error('Usuário inativo. Entre em contato com o administrador.')
      }

      // 3. Atualizar último acesso
      await supabase
        .from('usuarios')
        .update({ ultimo_acesso: new Date().toISOString() })
        .eq('id', usuario.id)

      // 4. Salvar no store
      setUsuario(usuario)
      setEmpresa(usuario.empresa)
      setLoading(false)

      // 5. Log de auditoria
      await logger.audit('Login realizado', { usuario_id: usuario.id }, 'login')

      toast.success('Login realizado com sucesso!')
      router.push('/dashboard')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login'

      // Traduzir mensagens comuns do Supabase
      let displayMessage = message
      if (message.includes('Invalid login credentials')) {
        displayMessage = 'Email ou senha incorretos'
      } else if (message.includes('Email not confirmed')) {
        displayMessage = 'Email não confirmado. Verifique sua caixa de entrada.'
      }

      toast.error(displayMessage)
      await logger.error('Falha no login', error, 'auth', 'login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {/* Logo placeholder - sera substituida pela logo da empresa */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground">
            LC
          </div>
          <CardTitle className="text-2xl">Bem-vindo</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={showSenha ? 'text' : 'password'}
                  placeholder="••••••••"
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
                  {showSenha ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/recuperar-senha">
              <Button variant="link" className="text-sm text-muted-foreground">
                Esqueci minha senha
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
