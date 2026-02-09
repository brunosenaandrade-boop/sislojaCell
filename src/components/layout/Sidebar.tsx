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
  ChevronLeft,
  Menu,
  ScrollText,
  Shield,
  Building2,
  ScrollText as ScrollTextAdmin,
  UsersRound,
  Bell,
  CreditCard,
  Gift,
  TrendingUp,
  LifeBuoy,
  Megaphone,
  Activity,
  Construction,
  ListOrdered,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

interface MenuItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  requiredRole?: 'admin' | 'superadmin'
  /** Itens de loja: ocultos para superadmin, exceto quando impersonando */
  storeOnly?: boolean
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    storeOnly: true,
  },
  {
    title: 'Clientes',
    href: '/clientes',
    icon: Users,
    storeOnly: true,
  },
  {
    title: 'Produtos',
    href: '/produtos',
    icon: Package,
    storeOnly: true,
  },
  {
    title: 'Serviços',
    href: '/servicos',
    icon: Wrench,
    storeOnly: true,
  },
  {
    title: 'Ordens de Serviço',
    href: '/ordens-servico',
    icon: FileText,
    storeOnly: true,
  },
  {
    title: 'Vendas (PDV)',
    href: '/vendas',
    icon: ShoppingCart,
    storeOnly: true,
  },
  {
    title: 'Estoque',
    href: '/estoque',
    icon: Warehouse,
    storeOnly: true,
  },
  {
    title: 'Caixa',
    href: '/caixa',
    icon: DollarSign,
    storeOnly: true,
  },
  {
    title: 'Meu Plano',
    href: '/planos',
    icon: CreditCard,
    storeOnly: true,
  },
  {
    title: 'Indicações',
    href: '/indicacoes',
    icon: Gift,
    storeOnly: true,
  },
  {
    title: 'Ajuda',
    href: '/ajuda',
    icon: BookOpen,
    storeOnly: true,
  },
  {
    title: 'Relatórios',
    href: '/relatorios',
    icon: BarChart3,
    requiredRole: 'admin',
    storeOnly: true,
  },
  {
    title: 'Logs',
    href: '/logs',
    icon: ScrollText,
    requiredRole: 'admin',
    storeOnly: true,
  },
  {
    title: 'Configurações',
    href: '/configuracoes',
    icon: Settings,
    requiredRole: 'admin',
    storeOnly: true,
  },
  {
    title: 'Painel Admin',
    href: '/admin',
    icon: Shield,
    requiredRole: 'superadmin',
  },
  {
    title: 'Empresas',
    href: '/admin/empresas',
    icon: Building2,
    requiredRole: 'superadmin',
  },
  {
    title: 'Usuários Global',
    href: '/admin/usuarios',
    icon: UsersRound,
    requiredRole: 'superadmin',
  },
  {
    title: 'Logs Global',
    href: '/admin/logs',
    icon: ScrollTextAdmin,
    requiredRole: 'superadmin',
  },
  {
    title: 'Financeiro',
    href: '/admin/financeiro',
    icon: TrendingUp,
    requiredRole: 'superadmin',
  },
  {
    title: 'Planos',
    href: '/admin/planos',
    icon: ListOrdered,
    requiredRole: 'superadmin',
  },
  {
    title: 'Suporte',
    href: '/admin/suporte',
    icon: LifeBuoy,
    requiredRole: 'superadmin',
  },
  {
    title: 'Comunicação',
    href: '/admin/comunicacao',
    icon: Megaphone,
    requiredRole: 'superadmin',
  },
  {
    title: 'Métricas',
    href: '/admin/metricas',
    icon: Activity,
    requiredRole: 'superadmin',
  },
  {
    title: 'Manutenção',
    href: '/admin/manutencao',
    icon: Construction,
    requiredRole: 'superadmin',
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { usuario, empresa, isImpersonating } = useAuthStore()
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore()
  const { isAdmin, isSuperadmin } = usePermissao()

  // Auto-close sidebar on mobile when navigating
  const handleLinkClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  const filteredMenuItems = menuItems.filter((item) => {
    // Itens de loja: ocultos para superadmin, exceto quando impersonando
    if (item.storeOnly && isSuperadmin && !isImpersonating) return false
    if (item.requiredRole === 'superadmin') return isSuperadmin
    if (item.requiredRole === 'admin') return isAdmin
    return true
  })

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
          // Mobile: slide in/out (hidden off-screen when closed)
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: always visible, no translate needed
          'lg:translate-x-0',
          // Width: always w-64 on mobile (overlay), toggle on desktop
          sidebarOpen ? 'w-64' : 'w-64 lg:w-16',
          // Desktop: relative positioning (inline in flex layout)
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
        <nav className="flex-1 overflow-y-auto p-2" data-tutorial="sidebar-nav">
          <ul className="space-y-1">
            {filteredMenuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
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
          </div>
        </div>
      </aside>
    </>
  )
}
