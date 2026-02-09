'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useStore'
import { authService } from '@/services/auth.service'
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
  const { setUsuario, setEmpresa, setLoading } = useAuthStore()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await authService.login(email, senha)

      if (error) {
        // Traduzir mensagens comuns do Supabase
        let displayMessage = error
        if (error.includes('Invalid login credentials')) {
          displayMessage = 'Email ou senha incorretos'
        } else if (error.includes('Email not confirmed')) {
          displayMessage = 'Email não confirmado. Verifique sua caixa de entrada.'
        }
        toast.error(displayMessage)
        await logger.error('Falha no login', new Error(error), 'auth', 'login')
        return
      }

      if (!data) {
        toast.error('Erro ao fazer login')
        return
      }

      // Salvar no store
      setUsuario(data.usuario)
      setEmpresa(data.empresa)
      setLoading(false)

      // Log de auditoria
      await logger.audit('Login realizado', { usuario_id: data.usuario.id }, 'login')

      toast.success('Login realizado com sucesso!')
      router.push(data.usuario.perfil === 'superadmin' ? '/admin' : '/dashboard')
    } catch (error: unknown) {
      toast.error('Erro ao fazer login')
      await logger.error('Falha no login', error, 'auth', 'login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
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

            <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700" disabled={isLoading}>
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

          <div className="mt-4 text-center space-y-1">
            <div>
              <Link href="/recuperar-senha">
                <Button variant="link" className="text-sm text-muted-foreground">
                  Esqueci minha senha
                </Button>
              </Link>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Não tem conta? </span>
              <Link href="/cadastro">
                <Button variant="link" className="text-sm p-0">
                  Cadastre-se
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
