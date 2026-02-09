'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'
import { toast } from 'sonner'

export default function RecuperarSenhaPage() {
  const supabase = getClient()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error('Informe seu e-mail')
      return
    }

    setIsLoading(true)

    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/alterar-senha`,
      })

      // Sempre mostra sucesso (não revela se email existe)
      setEnviado(true)
      toast.success('Instruções enviadas para o e-mail informado')
    } catch {
      // Mesmo em caso de erro, mostra sucesso por segurança
      setEnviado(true)
      toast.success('Instruções enviadas para o e-mail informado')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Recuperar Senha</CardTitle>
          <CardDescription>
            {enviado
              ? 'Verifique sua caixa de entrada'
              : 'Informe seu e-mail para receber as instruções de recuperação'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {enviado ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <Mail className="mx-auto h-10 w-10 text-green-600 mb-2" />
                <p className="text-sm text-green-700">
                  Se o e-mail informado estiver cadastrado, você receberá as instruções para redefinir sua senha.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setEnviado(false)
                  setEmail('')
                }}
              >
                Enviar novamente
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
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

              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar instruções'
                )}
              </Button>
            </form>
          )}

          <div className="mt-4 text-center">
            <Link href="/login">
              <Button variant="link" className="text-sm text-muted-foreground">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Voltar para o login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
