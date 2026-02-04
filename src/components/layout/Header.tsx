'use client'

import { useAuthStore, useCaixaStore, useUIStore } from '@/store/useStore'
import { useNotificacoesStore, type TipoNotificacao } from '@/store/useNotificacoesStore'
import { useNotificacoes } from '@/hooks/useNotificacoes'
import { usePermissao } from '@/hooks/usePermissao'
import { authService } from '@/services/auth.service'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Menu,
  Bell,
  User,
  Settings,
  LogOut,
  DollarSign,
  PackageX,
  Cake,
  Clock,
  CheckCheck,
  BellOff,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  title?: string
}

const iconesPorTipo: Record<TipoNotificacao, { icon: typeof Bell; cor: string }> = {
  estoque: { icon: PackageX, cor: 'text-orange-500' },
  aniversario: { icon: Cake, cor: 'text-pink-500' },
  os_atrasada: { icon: Clock, cor: 'text-red-500' },
  caixa: { icon: DollarSign, cor: 'text-yellow-600' },
}

export function Header({ title }: HeaderProps) {
  const router = useRouter()
  const { usuario, logout } = useAuthStore()
  const { isCaixaAberto } = useCaixaStore()
  const { toggleSidebar } = useUIStore()
  const { isAdmin } = usePermissao()
  const {
    notificacoes,
    getNaoLidas,
    marcarComoLida,
    marcarTodasComoLidas,
    limparNotificacoes,
  } = useNotificacoesStore()

  // Gerar alertas automaticamente
  useNotificacoes()

  const naoLidas = getNaoLidas()

  const handleLogout = async () => {
    await authService.logout()
    logout()
    window.location.href = '/login'
  }

  const handleNotificacaoClick = (id: string, link?: string) => {
    marcarComoLida(id)
    if (link) {
      router.push(link)
    }
  }

  const hoje = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6">
      {/* Left */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div>
          {title && <h1 className="text-lg font-semibold">{title}</h1>}
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground capitalize">{hoje}</p>
            <Breadcrumbs />
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Status do Caixa */}
        {isCaixaAberto() ? (
          <Badge variant="default" className="gap-1">
            <DollarSign className="h-3 w-3" />
            Caixa Aberto
          </Badge>
        ) : (
          <Badge variant="secondary" className="gap-1">
            <DollarSign className="h-3 w-3" />
            Caixa Fechado
          </Badge>
        )}

        {/* Notificações */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {naoLidas > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                  {naoLidas > 9 ? '9+' : naoLidas}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="font-semibold text-sm">Notificações</h3>
              <div className="flex gap-1">
                {naoLidas > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={marcarTodasComoLidas}
                  >
                    <CheckCheck className="mr-1 h-3 w-3" />
                    Marcar lidas
                  </Button>
                )}
              </div>
            </div>

            {/* Lista */}
            <div className="max-h-80 overflow-y-auto">
              {notificacoes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <BellOff className="h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm">Nenhuma notificação</p>
                </div>
              ) : (
                notificacoes.map((notif) => {
                  const config = iconesPorTipo[notif.tipo]
                  const IconeNotif = config.icon
                  return (
                    <button
                      key={notif.id}
                      className={`w-full text-left flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b last:border-b-0 ${
                        !notif.lida ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                      }`}
                      onClick={() => handleNotificacaoClick(notif.id, notif.link)}
                    >
                      <div className={`mt-0.5 shrink-0 ${config.cor}`}>
                        <IconeNotif className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm leading-tight ${!notif.lida ? 'font-semibold' : 'font-medium'}`}>
                            {notif.titulo}
                          </p>
                          {!notif.lida && (
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notif.mensagem}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 mt-1">
                          {formatDistanceToNow(new Date(notif.data), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {/* Footer */}
            {notificacoes.length > 0 && (
              <div className="border-t px-4 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-7 text-xs text-muted-foreground"
                  onClick={limparNotificacoes}
                >
                  Limpar todas
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Menu do Usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {usuario?.nome?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{usuario?.nome}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {usuario?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/perfil')}>
              <User className="mr-2 h-4 w-4" />
              <span>Meu Perfil</span>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem onClick={() => router.push('/configuracoes')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
