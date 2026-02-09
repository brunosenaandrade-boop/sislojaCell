'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function AlterarSenhaPage() {
  const router = useRouter()
  const supabase = getClient()

  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (novaSenha.length < 6) {
      toast.error('A senha deve ter no minimo 6 caracteres')
      return
    }

    if (novaSenha !== confirmarSenha) {
      toast.error('As senhas nao coincidem')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: novaSenha,
      })

      if (error) {
        if (error.message.includes('same_password')) {
          toast.error('A nova senha deve ser diferente da anterior')
        } else {
          toast.error('Erro ao alterar senha: ' + error.message)
        }
        return
      }

      setSucesso(true)
      toast.success('Senha alterada com sucesso!')
    } catch {
      toast.error('Erro ao alterar senha')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground">
            CF
          </div>
          <CardTitle className="text-2xl">
            {sucesso ? 'Senha Alterada' : 'Nova Senha'}
          </CardTitle>
          <CardDescription>
            {sucesso
              ? 'Sua senha foi alterada com sucesso'
              : 'Defina sua nova senha de acesso'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sucesso ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <CheckCircle className="mx-auto h-10 w-10 text-green-600 mb-2" />
                <p className="text-sm text-green-700">
                  Sua senha foi alterada. Voce ja pode fazer login com a nova senha.
                </p>
              </div>
              <Button className="w-full" onClick={() => router.push('/login')}>
                Ir para o Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="novaSenha">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="novaSenha"
                    type={showSenha ? 'text' : 'password'}
                    placeholder="Minimo 6 caracteres"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
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
                <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                <Input
                  id="confirmarSenha"
                  type={showSenha ? 'text' : 'password'}
                  placeholder="Repita a nova senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Alterando...
                  </>
                ) : (
                  'Alterar Senha'
                )}
              </Button>
            </form>
          )}

          <div className="mt-4 text-center">
            <Link href="/login">
              <Button variant="link" className="text-sm text-muted-foreground">
                Voltar para o login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
