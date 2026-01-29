'use client'

import { useAuthStore, useCaixaStore, useUIStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface HeaderProps {
  title?: string
}

export function Header({ title }: HeaderProps) {
  const { usuario, logout } = useAuthStore()
  const { caixaAtual } = useCaixaStore()
  const { toggleSidebar } = useUIStore()

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
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
          <p className="text-sm text-muted-foreground capitalize">{hoje}</p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Status do Caixa */}
        {caixaAtual ? (
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

        {/* Notificacoes */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {/* Badge de notificacao */}
          {/* <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
            3
          </span> */}
        </Button>

        {/* Menu do Usuario */}
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
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Meu Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuracoes</span>
            </DropdownMenuItem>
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
