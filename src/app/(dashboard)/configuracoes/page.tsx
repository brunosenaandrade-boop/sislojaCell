'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { useAuthStore, usePrintConfigStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Settings,
  Building2,
  Upload,
  Image,
  Save,
  Printer,
  Users,
  Shield,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Database,
  Download,
  AlertTriangle,
  CheckCircle,
  KeyRound,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { configuracoesService } from '@/services/configuracoes.service'
import type { Empresa, Usuario } from '@/types/database'

interface UsuarioItem {
  id: string
  nome: string
  email: string
  perfil: 'admin' | 'funcionario'
  ativo: boolean
  ultimo_acesso: string
}

export default function ConfiguracoesPage() {
  const { empresa } = useAuthStore()
  const printConfig = usePrintConfigStore()

  // Loading
  const [isLoadingPage, setIsLoadingPage] = useState(true)

  // Dados da empresa
  const [nomeEmpresa, setNomeEmpresa] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [telefoneEmpresa, setTelefoneEmpresa] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [emailEmpresa, setEmailEmpresa] = useState('')
  const [enderecoEmpresa, setEnderecoEmpresa] = useState('')
  const [cidadeEmpresa, setCidadeEmpresa] = useState('')
  const [estadoEmpresa, setEstadoEmpresa] = useState('')
  const [cepEmpresa, setCepEmpresa] = useState('')

  // Logo
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Impressão
  const [tipoImpressora, setTipoImpressora] = useState('térmica')
  const [larguraPapel, setLarguraPapel] = useState('80')
  const [mostrarLogo, setMostrarLogo] = useState(true)
  const [mostrarEndereco, setMostrarEndereco] = useState(true)
  const [mostrarTelefone, setMostrarTelefone] = useState(true)
  const [mensagemCupom, setMensagemCupom] = useState('Obrigado pela preferência!')

  // Sincronizar estado local com store após hidratação do localStorage
  const [storeHydrated, setStoreHydrated] = useState(false)
  useEffect(() => {
    if (storeHydrated) return
    setLogoPreview(printConfig.logoBase64)
    setTipoImpressora(printConfig.tipoImpressora)
    setLarguraPapel(printConfig.larguraPapel)
    setMostrarLogo(printConfig.mostrarLogo)
    setMostrarEndereco(printConfig.mostrarEndereco)
    setMostrarTelefone(printConfig.mostrarTelefone)
    setMensagemCupom(printConfig.mensagemCupom)
    setStoreHydrated(true)
  }, [printConfig, storeHydrated])

  // Usuários
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([])
  const [dialogUsuarioOpen, setDialogUsuarioOpen] = useState(false)
  const [editandoUsuario, setEditandoUsuario] = useState<UsuarioItem | null>(null)
  const [formNomeUsuario, setFormNomeUsuario] = useState('')
  const [formEmailUsuario, setFormEmailUsuario] = useState('')
  const [formSenhaUsuario, setFormSenhaUsuario] = useState('')
  const [formPerfilUsuario, setFormPerfilUsuario] = useState<string>('funcionario')
  const [mostrarSenha, setMostrarSenha] = useState(false)

  // Dialog delete usuário
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false)
  const [usuarioParaDeletar, setUsuarioParaDeletar] = useState<string | null>(null)

  const [isLoading, setIsLoading] = useState(false)

  // Fetch empresa data
  const fetchEmpresa = useCallback(async () => {
    try {
      const { data, error } = await configuracoesService.getEmpresa()
      if (error) {
        toast.error('Erro ao carregar empresa: ' + error)
        return
      }
      if (data) {
        setNomeEmpresa(data.nome || '')
        setCnpj(data.cnpj || '')
        setTelefoneEmpresa(data.telefone || '')
        setWhatsapp(data.whatsapp || '')
        setEmailEmpresa(data.email || '')
        setEnderecoEmpresa(data.endereco || '')
        setCidadeEmpresa(data.cidade || '')
        setEstadoEmpresa(data.estado || '')
        setCepEmpresa(data.cep || '')
        if (data.logo_url) setLogoPreview(data.logo_url)
      }
    } catch {
      toast.error('Erro ao carregar dados da empresa')
    }
  }, [])

  // Fetch usuarios
  const fetchUsuarios = useCallback(async () => {
    try {
      const { data, error } = await configuracoesService.listarUsuarios()
      if (error) {
        toast.error('Erro ao carregar usuários: ' + error)
        return
      }
      setUsuarios(data.map((u: Usuario) => ({
        id: u.id,
        nome: u.nome,
        email: u.email,
        perfil: u.perfil,
        ativo: u.ativo,
        ultimo_acesso: u.ultimo_acesso || '',
      })))
    } catch {
      toast.error('Erro ao carregar usuários')
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      setIsLoadingPage(true)
      await Promise.all([fetchEmpresa(), fetchUsuarios()])
      setIsLoadingPage(false)
    }
    load()
  }, [fetchEmpresa, fetchUsuarios])

  // Formatar CNPJ
  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  // Upload de logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem válida')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 2MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setLogoPreview(base64)
      printConfig.setLogoBase64(base64)
      toast.success('Logo carregada!')
    }
    reader.readAsDataURL(file)
  }

  // Salvar dados da empresa
  const handleSalvarEmpresa = async () => {
    if (!nomeEmpresa.trim()) {
      toast.error('Informe o nome da empresa')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await configuracoesService.atualizarEmpresa({
        nome: nomeEmpresa,
        cnpj: cnpj || undefined,
        telefone: telefoneEmpresa || undefined,
        whatsapp: whatsapp || undefined,
        email: emailEmpresa || undefined,
        endereco: enderecoEmpresa || undefined,
        cidade: cidadeEmpresa || undefined,
        estado: estadoEmpresa || undefined,
        cep: cepEmpresa || undefined,
      })
      if (error) {
        toast.error('Erro ao salvar: ' + error)
        return
      }
      toast.success('Dados da empresa salvos!')
    } catch {
      toast.error('Erro ao salvar')
    } finally {
      setIsLoading(false)
    }
  }

  // Salvar config de impressão
  const handleSalvarImpressao = async () => {
    setIsLoading(true)
    try {
      printConfig.setTipoImpressora(tipoImpressora)
      printConfig.setLarguraPapel(larguraPapel)
      printConfig.setMostrarLogo(mostrarLogo)
      printConfig.setMostrarEndereco(mostrarEndereco)
      printConfig.setMostrarTelefone(mostrarTelefone)
      printConfig.setMensagemCupom(mensagemCupom)
      toast.success('Configurações de impressão salvas!')
    } catch {
      toast.error('Erro ao salvar')
    } finally {
      setIsLoading(false)
    }
  }

  // Abrir dialog novo usuário
  const abrirNovoUsuario = () => {
    setEditandoUsuario(null)
    setFormNomeUsuario('')
    setFormEmailUsuario('')
    setFormSenhaUsuario('')
    setFormPerfilUsuario('funcionario')
    setDialogUsuarioOpen(true)
  }

  // Abrir dialog editar usuário
  const abrirEditarUsuario = (usuario: UsuarioItem) => {
    setEditandoUsuario(usuario)
    setFormNomeUsuario(usuario.nome)
    setFormEmailUsuario(usuario.email)
    setFormSenhaUsuario('')
    setFormPerfilUsuario(usuario.perfil)
    setDialogUsuarioOpen(true)
  }

  // Salvar usuário
  const handleSalvarUsuario = async () => {
    if (!formNomeUsuario.trim()) {
      toast.error('Informe o nome')
      return
    }
    if (!formEmailUsuario.trim()) {
      toast.error('Informe o email')
      return
    }
    if (!editandoUsuario && !formSenhaUsuario.trim()) {
      toast.error('Informe a senha')
      return
    }

    setIsLoading(true)
    try {
      if (editandoUsuario) {
        const { error } = await configuracoesService.atualizarUsuario(editandoUsuario.id, {
          nome: formNomeUsuario,
          email: formEmailUsuario,
          perfil: formPerfilUsuario as 'admin' | 'funcionario',
        })
        if (error) {
          toast.error('Erro ao atualizar: ' + error)
          return
        }
        toast.success('Usuário atualizado!')
      } else {
        const { error } = await configuracoesService.criarUsuario({
          nome: formNomeUsuario,
          email: formEmailUsuario,
          senha: formSenhaUsuario,
          perfil: formPerfilUsuario as 'admin' | 'funcionario',
        })
        if (error) {
          toast.error('Erro ao criar: ' + error)
          return
        }
        toast.success('Usuário criado!')
      }

      setDialogUsuarioOpen(false)
      await fetchUsuarios()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar usuário'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  // Resetar senha do usuário
  const handleResetSenha = async (email: string) => {
    try {
      // Use the base supabase client for auth operations
      const { getSupabase } = await import('@/services/base')
      const supabase = getSupabase()
      await supabase.auth.resetPasswordForEmail(email)
      toast.success('E-mail de redefinição de senha enviado')
    } catch {
      toast.error('Erro ao enviar e-mail de redefinição')
    }
  }

  // Toggle ativo usuário
  const toggleAtivoUsuario = async (id: string) => {
    const usuario = usuarios.find(u => u.id === id)
    if (!usuario) return

    const novoAtivo = !usuario.ativo
    try {
      if (novoAtivo) {
        const { error } = await configuracoesService.atualizarUsuario(id, { ativo: true })
        if (error) throw new Error(error)
      } else {
        const { error } = await configuracoesService.desativarUsuario(id)
        if (error) throw new Error(error)
      }

      setUsuarios(usuarios.map(u =>
        u.id === id ? { ...u, ativo: novoAtivo } : u
      ))
      toast.success(novoAtivo ? 'Usuário ativado' : 'Usuário desativado')
    } catch {
      toast.error('Erro ao alterar status do usuário')
    }
  }

  // Confirmar exclusão usuário
  const confirmarDeleteUsuario = (id: string) => {
    const usuario = usuarios.find(u => u.id === id)
    if (usuario?.perfil === 'admin') {
      toast.error('Não é possível excluir o administrador')
      return
    }
    setUsuarioParaDeletar(id)
    setDialogDeleteOpen(true)
  }

  // Deletar usuário (desativar)
  const handleDeleteUsuario = async () => {
    if (!usuarioParaDeletar) return
    try {
      const { error } = await configuracoesService.desativarUsuario(usuarioParaDeletar)
      if (error) throw new Error(error)

      setUsuarios(usuarios.filter(u => u.id !== usuarioParaDeletar))
      toast.success('Usuário excluído')
    } catch {
      toast.error('Erro ao excluir usuário')
    } finally {
      setDialogDeleteOpen(false)
      setUsuarioParaDeletar(null)
    }
  }

  // Exportar backup
  const handleExportarBackup = () => {
    const dados = {
      empresa: { nomeEmpresa, cnpj, telefoneEmpresa, whatsapp, emailEmpresa, enderecoEmpresa, cidadeEmpresa, estadoEmpresa },
      impressao: { tipoImpressora, larguraPapel, mostrarLogo, mostrarEndereco, mostrarTelefone, mensagemCupom },
      usuarios: usuarios.map(u => ({ nome: u.nome, email: u.email, perfil: u.perfil })),
      data_export: new Date().toISOString(),
    }

    const json = JSON.stringify(dados, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `backup_config_${new Date().toISOString().split('T')[0]}.json`
    link.click()
    toast.success('Backup exportado!')
  }

  // Formatar data
  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Nunca acessou'
    return new Date(dateString).toLocaleString('pt-BR')
  }

  if (isLoadingPage) {
    return (
      <div className="flex flex-col">
        <Header title="Configurações" />
        <div className="flex-1 flex items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Header title="Configurações" />

      <div className="flex-1 space-y-6 p-4 lg:p-6">
        <Tabs defaultValue="empresa">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 max-w-2xl">
            <TabsTrigger value="empresa">
              <Building2 className="mr-2 h-4 w-4 hidden sm:inline" />
              Empresa
            </TabsTrigger>
            <TabsTrigger value="impressao">
              <Printer className="mr-2 h-4 w-4 hidden sm:inline" />
              Impressão
            </TabsTrigger>
            <TabsTrigger value="usuarios">
              <Users className="mr-2 h-4 w-4 hidden sm:inline" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="sistema">
              <Settings className="mr-2 h-4 w-4 hidden sm:inline" />
              Sistema
            </TabsTrigger>
          </TabsList>

          {/* ===== TAB EMPRESA ===== */}
          <TabsContent value="empresa" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                {/* Dados da Empresa */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Dados da Empresa
                    </CardTitle>
                    <CardDescription>
                      Informações exibidas nos cupons e documentos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="nome_empresa">Nome da Empresa *</Label>
                        <Input
                          id="nome_empresa"
                          value={nomeEmpresa}
                          onChange={(e) => setNomeEmpresa(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cnpj">CNPJ</Label>
                        <Input
                          id="cnpj"
                          placeholder="00.000.000/0000-00"
                          value={cnpj}
                          onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                          maxLength={18}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email_empresa">E-mail</Label>
                        <Input
                          id="email_empresa"
                          type="email"
                          value={emailEmpresa}
                          onChange={(e) => setEmailEmpresa(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="telefone_empresa">Telefone</Label>
                        <Input
                          id="telefone_empresa"
                          value={telefoneEmpresa}
                          onChange={(e) => setTelefoneEmpresa(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="whatsapp">WhatsApp</Label>
                        <Input
                          id="whatsapp"
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="endereco_empresa">Endereço</Label>
                        <Input
                          id="endereco_empresa"
                          value={enderecoEmpresa}
                          onChange={(e) => setEnderecoEmpresa(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cidade_empresa">Cidade</Label>
                        <Input
                          id="cidade_empresa"
                          value={cidadeEmpresa}
                          onChange={(e) => setCidadeEmpresa(e.target.value)}
                        />
                      </div>

                      <div className="grid gap-4 grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="estado_empresa">Estado</Label>
                          <Input
                            id="estado_empresa"
                            value={estadoEmpresa}
                            onChange={(e) => setEstadoEmpresa(e.target.value.toUpperCase())}
                            maxLength={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cep_empresa">CEP</Label>
                          <Input
                            id="cep_empresa"
                            value={cepEmpresa}
                            onChange={(e) => setCepEmpresa(e.target.value)}
                            maxLength={9}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSalvarEmpresa} disabled={isLoading}>
                        <Save className="mr-2 h-4 w-4" />
                        {isLoading ? 'Salvando...' : 'Salvar Dados'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Logo */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Image className="h-5 w-5" />
                      Logo da Empresa
                    </CardTitle>
                    <CardDescription>
                      Exibida no sistema e nos cupons
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="w-full aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/30 overflow-hidden">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Logo"
                          className="w-full h-full object-contain p-4"
                        />
                      ) : (
                        <div className="text-center text-muted-foreground">
                          <Image className="h-12 w-12 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">Nenhuma logo</p>
                        </div>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {logoPreview ? 'Alterar Logo' : 'Enviar Logo'}
                    </Button>

                    {logoPreview && (
                      <Button
                        variant="ghost"
                        className="w-full text-red-600"
                        onClick={() => {
                          setLogoPreview(null)
                          printConfig.setLogoBase64(null)
                          toast.success('Logo removida')
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover Logo
                      </Button>
                    )}

                    <p className="text-xs text-muted-foreground text-center">
                      Formatos: PNG, JPG, SVG. Máximo 2MB.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ===== TAB IMPRESSAO ===== */}
          <TabsContent value="impressao" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Config de Impressão */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Printer className="h-5 w-5" />
                    Configuração de Impressão
                  </CardTitle>
                  <CardDescription>
                    Defina o formato dos cupons
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Tipo de Impressora</Label>
                      <Select value={tipoImpressora} onValueChange={setTipoImpressora}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="térmica">Térmica</SelectItem>
                          <SelectItem value="padrão">Padrão (A4)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {tipoImpressora === 'térmica' && (
                      <div className="space-y-2">
                        <Label>Largura do Papel</Label>
                        <Select value={larguraPapel} onValueChange={setLarguraPapel}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="58">58mm</SelectItem>
                            <SelectItem value="80">80mm</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Exibir no Cupom</Label>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <span className="text-sm">Logo da empresa</span>
                      <Button
                        variant={mostrarLogo ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMostrarLogo(!mostrarLogo)}
                      >
                        {mostrarLogo ? 'Sim' : 'Não'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <span className="text-sm">Endereço da empresa</span>
                      <Button
                        variant={mostrarEndereco ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMostrarEndereco(!mostrarEndereco)}
                      >
                        {mostrarEndereco ? 'Sim' : 'Não'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <span className="text-sm">Telefone/WhatsApp</span>
                      <Button
                        variant={mostrarTelefone ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMostrarTelefone(!mostrarTelefone)}
                      >
                        {mostrarTelefone ? 'Sim' : 'Não'}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mensagem_cupom">Mensagem do Cupom</Label>
                    <Input
                      id="mensagem_cupom"
                      placeholder="Obrigado pela preferência!"
                      value={mensagemCupom}
                      onChange={(e) => setMensagemCupom(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Exibida no rodapé do cupom
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSalvarImpressao} disabled={isLoading}>
                      <Save className="mr-2 h-4 w-4" />
                      {isLoading ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Preview do Cupom */}
              <Card>
                <CardHeader>
                  <CardTitle>Pré-visualização do Cupom</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="mx-auto bg-white border-2 border-dashed rounded-lg p-4 font-mono text-xs"
                    style={{ maxWidth: tipoImpressora === 'térmica' ? (larguraPapel === '58' ? '200px' : '280px') : '100%' }}
                  >
                    {mostrarLogo && (
                      <div className="text-center mb-2">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo" className="h-10 mx-auto" />
                        ) : (
                          <div className="h-10 bg-muted rounded flex items-center justify-center text-muted-foreground">
                            [LOGO]
                          </div>
                        )}
                      </div>
                    )}

                    <div className="text-center mb-2">
                      <div className="font-bold text-sm">{nomeEmpresa || 'Nome da Empresa'}</div>
                      {cnpj && <div>CNPJ: {cnpj}</div>}
                    </div>

                    {mostrarEndereco && enderecoEmpresa && (
                      <div className="text-center mb-1">
                        <div>{enderecoEmpresa}</div>
                        <div>{cidadeEmpresa}/{estadoEmpresa}</div>
                      </div>
                    )}

                    {mostrarTelefone && (
                      <div className="text-center mb-2">
                        {telefoneEmpresa && <div>Tel: {telefoneEmpresa}</div>}
                        {whatsapp && <div>WhatsApp: {whatsapp}</div>}
                      </div>
                    )}

                    <div className="border-t border-dashed my-2" />

                    <div className="text-center font-bold mb-1">CUPOM NÃO FISCAL</div>
                    <div className="text-center mb-2">27/01/2024 15:30</div>

                    <div className="border-t border-dashed my-2" />

                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>1x Carregador USB-C</span>
                        <span>49,90</span>
                      </div>
                      <div className="flex justify-between">
                        <span>1x Cabo Lightning</span>
                        <span>25,00</span>
                      </div>
                    </div>

                    <div className="border-t border-dashed my-2" />

                    <div className="flex justify-between font-bold">
                      <span>TOTAL</span>
                      <span>R$ 74,90</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pagamento</span>
                      <span>PIX</span>
                    </div>

                    <div className="border-t border-dashed my-2" />

                    {mensagemCupom && (
                      <div className="text-center italic">{mensagemCupom}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ===== TAB USUARIOS ===== */}
          <TabsContent value="usuarios" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Gerenciar Usuários</h3>
                <p className="text-sm text-muted-foreground">
                  Cadastre e gerencie os usuários do sistema
                </p>
              </div>
              <Button onClick={abrirNovoUsuario}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </div>

            {/* Perfis */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Administrador
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Acesso total ao sistema: configurações, relatórios, exclusão de registros, gerenciamento de usuários.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Funcionário
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Acesso a vendas, OS, clientes e estoque. Sem acesso a configurações e relatórios financeiros.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tabela de Usuários */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Perfil</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Último Acesso</TableHead>
                      <TableHead className="w-[120px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios.map(usuario => (
                      <TableRow key={usuario.id} className={!usuario.ativo ? 'opacity-50' : ''}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {usuario.nome.charAt(0)}
                              </span>
                            </div>
                            <span className="font-medium">{usuario.nome}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{usuario.email}</TableCell>
                        <TableCell>
                          <Badge variant={usuario.perfil === 'admin' ? 'default' : 'secondary'}>
                            {usuario.perfil === 'admin' ? (
                              <><Shield className="h-3 w-3 mr-1" /> Admin</>
                            ) : (
                              'Funcionário'
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={usuario.ativo ? 'default' : 'secondary'}>
                            {usuario.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(usuario.ultimo_acesso)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => abrirEditarUsuario(usuario)}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleResetSenha(usuario.email)}
                              title="Resetar senha"
                            >
                              <KeyRound className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => toggleAtivoUsuario(usuario.id)}
                              title={usuario.ativo ? 'Desativar' : 'Ativar'}
                            >
                              {usuario.ativo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600"
                              onClick={() => confirmarDeleteUsuario(usuario.id)}
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== TAB SISTEMA ===== */}
          <TabsContent value="sistema" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Info do Sistema */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Informações do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Versão</span>
                    <Badge variant="outline">1.0.0</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frontend</span>
                    <span>Next.js + Shadcn/ui</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Backend</span>
                    <span>Supabase</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Hospedagem</span>
                    <span>Vercel</span>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Sistema funcionando normalmente
                  </div>
                </CardContent>
              </Card>

              {/* Backup */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Backup de Dados
                  </CardTitle>
                  <CardDescription>
                    Exporte as configurações do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Download className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Exportar Configurações</div>
                        <div className="text-xs text-muted-foreground">
                          Dados da empresa, impressão e usuários
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={handleExportarBackup}>
                      <Download className="mr-2 h-4 w-4" />
                      Exportar JSON
                    </Button>
                  </div>

                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-orange-700">Banco de Dados</div>
                        <p className="text-xs text-orange-600">
                          O backup completo do banco de dados deve ser feito diretamente no painel do Supabase.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialog Novo/Editar Usuário */}
        <Dialog open={dialogUsuarioOpen} onOpenChange={setDialogUsuarioOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editandoUsuario ? 'Editar Usuário' : 'Novo Usuário'}
              </DialogTitle>
              <DialogDescription>
                {editandoUsuario
                  ? 'Altere os dados do usuário'
                  : 'Preencha os dados para criar um novo usuário'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input
                  placeholder="Nome do usuário"
                  value={formNomeUsuario}
                  onChange={(e) => setFormNomeUsuario(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>E-mail *</Label>
                <Input
                  type="email"
                  placeholder="usuário@email.com"
                  value={formEmailUsuario}
                  onChange={(e) => setFormEmailUsuario(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>{editandoUsuario ? 'Nova Senha (deixe vazio para manter)' : 'Senha *'}</Label>
                <div className="relative">
                  <Input
                    type={mostrarSenha ? 'text' : 'password'}
                    placeholder="********"
                    value={formSenhaUsuario}
                    onChange={(e) => setFormSenhaUsuario(e.target.value)}
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
                <Label>Perfil de Acesso *</Label>
                <Select value={formPerfilUsuario} onValueChange={setFormPerfilUsuario}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Administrador
                      </div>
                    </SelectItem>
                    <SelectItem value="funcionario">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Funcionário
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogUsuarioOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSalvarUsuario} disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Confirmar Exclusão Usuário */}
        <Dialog open={dialogDeleteOpen} onOpenChange={setDialogDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogDeleteOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteUsuario}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
