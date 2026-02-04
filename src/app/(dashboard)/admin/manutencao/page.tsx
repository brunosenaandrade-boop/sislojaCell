'use client'

import { useEffect, useState } from 'react'
import { usePermissao } from '@/hooks/usePermissao'
import { superadminService } from '@/services/superadmin.service'
import type { ManutencaoConfig } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Construction,
  AlertTriangle,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Save,
  Power,
  PowerOff,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ManutencaoAdminPage() {
  const { isSuperadmin } = usePermissao()
  const [config, setConfig] = useState<ManutencaoConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [savingMsg, setSavingMsg] = useState(false)
  const [mensagem, setMensagem] = useState('')

  const loadManutencao = async () => {
    const { data, error } = await superadminService.getManutencao()
    if (error) {
      toast.error('Erro ao carregar configuracao: ' + error)
    } else if (data) {
      setConfig(data)
      setMensagem(data.mensagem || '')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isSuperadmin) loadManutencao()
  }, [isSuperadmin])

  if (!isSuperadmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-lg font-semibold">Acesso Restrito</h2>
            <p className="text-muted-foreground mt-2">
              Apenas o superadmin pode acessar este painel.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const isAtivo = config?.ativo ?? false

  const handleToggle = async () => {
    const novoStatus = !isAtivo
    const confirmMsg = novoStatus
      ? 'Ativar o modo manutencao? Os usuarios nao conseguirao acessar o sistema.'
      : 'Desativar o modo manutencao? Os usuarios voltarao a acessar o sistema.'

    if (!window.confirm(confirmMsg)) return

    setToggling(true)
    const { error } = await superadminService.setManutencao(novoStatus, mensagem)
    if (error) {
      toast.error('Erro: ' + error)
    } else {
      toast.success(`Modo manutencao ${novoStatus ? 'ativado' : 'desativado'} com sucesso`)
      setConfig((prev) => prev ? { ...prev, ativo: novoStatus, mensagem } : { ativo: novoStatus, mensagem })
    }
    setToggling(false)
  }

  const handleSaveMensagem = async () => {
    setSavingMsg(true)
    const { error } = await superadminService.setManutencao(isAtivo, mensagem)
    if (error) {
      toast.error('Erro ao salvar mensagem: ' + error)
    } else {
      toast.success('Mensagem atualizada com sucesso')
      setConfig((prev) => prev ? { ...prev, mensagem } : { ativo: isAtivo, mensagem })
    }
    setSavingMsg(false)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <Construction className="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-bold">Modo Manutencao</h1>
          <p className="text-muted-foreground text-sm">
            Controle do modo de manutencao do sistema
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status & Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Status Atual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Big Status Badge */}
            <div className="flex items-center justify-center">
              {isAtivo ? (
                <Badge variant="destructive" className="text-lg px-6 py-2">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  ATIVO
                </Badge>
              ) : (
                <Badge className="text-lg px-6 py-2 bg-green-600 hover:bg-green-700 text-white">
                  INATIVO
                </Badge>
              )}
            </div>

            {/* Toggle Button */}
            <Button
              className="w-full"
              variant={isAtivo ? 'default' : 'destructive'}
              onClick={handleToggle}
              disabled={toggling}
            >
              {toggling ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isAtivo ? (
                <Power className="mr-2 h-4 w-4" />
              ) : (
                <PowerOff className="mr-2 h-4 w-4" />
              )}
              {isAtivo ? 'Desativar Modo Manutencao' : 'Ativar Modo Manutencao'}
            </Button>

            {/* Mensagem */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Mensagem de manutencao</label>
              <Textarea
                placeholder="Estamos realizando melhorias no sistema. Voltaremos em breve!"
                rows={4}
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSaveMensagem}
                disabled={savingMsg}
              >
                {savingMsg ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar Mensagem
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-8 bg-white">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="rounded-full bg-yellow-100 p-4">
                  <Construction className="h-12 w-12 text-yellow-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Sistema em Manutencao
                </h2>
                <p className="text-gray-600 max-w-sm">
                  {mensagem || 'Estamos realizando melhorias no sistema. Voltaremos em breve!'}
                </p>
                <p className="text-sm text-gray-400">
                  Tente novamente mais tarde
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
