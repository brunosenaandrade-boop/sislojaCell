'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore, useUIStore } from '@/store/useStore'
import { usePermissao } from '@/hooks/usePermissao'
import {
  LayoutDashboard,
  Users,
  Package,
  Wrench,
  FileText,
  ShoppingCart,
  Warehouse,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  ScrollText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

interface MenuItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  requiredRole?: 'admin'
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Clientes',
    href: '/clientes',
    icon: Users,
  },
  {
    title: 'Produtos',
    href: '/produtos',
    icon: Package,
  },
  {
    title: 'Serviços',
    href: '/servicos',
    icon: Wrench,
  },
  {
    title: 'Ordens de Serviço',
    href: '/ordens-servico',
    icon: FileText,
  },
  {
    title: 'Vendas (PDV)',
    href: '/vendas',
    icon: ShoppingCart,
  },
  {
    title: 'Estoque',
    href: '/estoque',
    icon: Warehouse,
  },
  {
    title: 'Caixa',
    href: '/caixa',
    icon: DollarSign,
  },
  {
    title: 'Relatórios',
    href: '/relatorios',
    icon: BarChart3,
    requiredRole: 'admin',
  },
  {
    title: 'Logs',
    href: '/logs',
    icon: ScrollText,
    requiredRole: 'admin',
  },
  {
    title: 'Configurações',
    href: '/configuracoes',
    icon: Settings,
    requiredRole: 'admin',
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { usuario, empresa, logout } = useAuthStore()
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const { isAdmin } = usePermissao()

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  const filteredMenuItems = menuItems.filter(
    (item) => !item.requiredRole || isAdmin
  )

  return (
    <>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full flex-col border-r bg-card transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-16',
          'lg:relative lg:z-0'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              {empresa?.logo_url ? (
                <img
                  src={empresa.logo_url}
                  alt={empresa.nome_fantasia || empresa.nome}
                  className="h-8 w-8 rounded object-cover"
                />
              ) : (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded text-white font-bold"
                  style={{ backgroundColor: empresa?.cor_primaria || '#3B82F6' }}
                >
                  {(empresa?.nome_fantasia || empresa?.nome || 'L')[0]}
                </div>
              )}
              <span className="font-semibold text-sm truncate">
                {empresa?.nome_fantasia || empresa?.nome || 'Loja'}
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="shrink-0"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {filteredMenuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                    title={!sidebarOpen ? item.title : undefined}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {sidebarOpen && <span>{item.title}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer - Usuário */}
        <div className="border-t p-2">
          <Separator className="mb-2" />
          <div
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2',
              sidebarOpen ? '' : 'justify-center'
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {usuario?.nome?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{usuario?.nome}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {usuario?.perfil}
                </p>
              </div>
            )}
            {sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
