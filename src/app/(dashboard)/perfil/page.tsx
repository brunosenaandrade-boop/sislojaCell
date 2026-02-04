'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/useStore'
import { usePermissao } from '@/hooks/usePermissao'
import { configuracoesService } from '@/services/configuracoes.service'
import { getClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  User,
  Mail,
  Shield,
  KeyRound,
  Save,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
} from 'lucide-react'
import { toast } from 'sonner'

export default function PerfilPage() {
  const { usuario, setUsuario } = useAuthStore()
  const { isAdmin } = usePermissao()

  const [nome, setNome] = useState(usuario?.nome || '')
  const [isLoadingNome, setIsLoadingNome] = useState(false)

  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [isLoadingSenha, setIsLoadingSenha] = useState(false)

  const perfilLabel = usuario?.perfil === 'superadmin'
    ? 'Super Admin'
    : usuario?.perfil === 'admin'
      ? 'Administrador'
      : 'Funcionário'

  const handleSalvarNome = async () => {
    if (!nome.trim()) {
      toast.error('Informe seu nome')
      return
    }
    if (!usuario) return

    setIsLoadingNome(true)
    try {
      const { error } = await configuracoesService.atualizarUsuario(usuario.id, { nome: nome.trim() })
      if (error) {
        toast.error('Erro ao salvar: ' + error)
        return
      }
      setUsuario({ ...usuario, nome: nome.trim() })
      toast.success('Nome atualizado!')
    } catch {
      toast.error('Erro ao salvar nome')
    } finally {
      setIsLoadingNome(false)
    }
  }

  const handleAlterarSenha = async () => {
    if (!novaSenha) {
      toast.error('Informe a nova senha')
      return
    }
    if (novaSenha.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres')
      return
    }
    if (novaSenha !== confirmarSenha) {
      toast.error('As senhas não coincidem')
      return
    }

    setIsLoadingSenha(true)
    try {
      const supabase = getClient()
      const { error } = await supabase.auth.updateUser({ password: novaSenha })

      if (error) {
        if (error.message.includes('same_password')) {
          toast.error('A nova senha deve ser diferente da atual')
        } else {
          toast.error('Erro ao alterar senha: ' + error.message)
        }
        return
      }

      toast.success('Senha alterada com sucesso!')
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarSenha('')
    } catch {
      toast.error('Erro ao alterar senha')
    } finally {
      setIsLoadingSenha(false)
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-6 p-4 lg:p-6 max-w-2xl">
        {/* Info do usuário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>
              Seus dados de acesso ao sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="perfil-nome">Nome</Label>
              <div className="flex gap-2">
                <Input
                  id="perfil-nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                />
                <Button
                  onClick={handleSalvarNome}
                  disabled={isLoadingNome || nome === usuario?.nome}
                >
                  {isLoadingNome ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>E-mail</Label>
              <div className="flex items-center gap-2 rounded-md border px-3 py-2 bg-muted/50">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{usuario?.email}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                O e-mail não pode ser alterado
              </p>
            </div>

            <div className="space-y-2">
              <Label>Perfil de Acesso</Label>
              <div className="flex items-center gap-2">
                <Badge variant={isAdmin ? 'default' : 'secondary'}>
                  <Shield className="h-3 w-3 mr-1" />
                  {perfilLabel}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alterar senha */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Alterar Senha
            </CardTitle>
            <CardDescription>
              Defina uma nova senha para sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nova-senha">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="nova-senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                >
                  {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmar-senha">Confirmar Nova Senha</Label>
              <Input
                id="confirmar-senha"
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Repita a nova senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
              />
            </div>

            <Button
              onClick={handleAlterarSenha}
              disabled={isLoadingSenha || !novaSenha || !confirmarSenha}
            >
              {isLoadingSenha ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Alterando...
                </>
              ) : (
                <>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Alterar Senha
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
