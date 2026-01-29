'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

const routeNames: Record<string, string> = {
  'dashboard': 'Dashboard',
  'clientes': 'Clientes',
  'produtos': 'Produtos',
  'servicos': 'Serviços',
  'ordens-servico': 'Ordens de Serviço',
  'vendas': 'PDV',
  'estoque': 'Estoque',
  'caixa': 'Caixa',
  'relatorios': 'Relatórios',
  'logs': 'Logs',
  'configuracoes': 'Configurações',
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length <= 1) return null

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link href="/dashboard" className="hover:text-foreground transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {segments.map((segment, index) => {
        const path = '/' + segments.slice(0, index + 1).join('/')
        const isLast = index === segments.length - 1
        const name = routeNames[segment] || segment

        return (
          <span key={path} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5" />
            {isLast ? (
              <span className="text-foreground font-medium">{name}</span>
            ) : (
              <Link href={path} className="hover:text-foreground transition-colors">
                {name}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
