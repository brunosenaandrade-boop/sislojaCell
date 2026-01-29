'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { useUIStore } from '@/store/useStore'
import { usePermissao } from '@/hooks/usePermissao'
import { setupGlobalErrorHandler } from '@/services/logger'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/sonner'

const rotasRestritas = ['/configuracoes', '/relatorios', '/logs']

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { sidebarOpen } = useUIStore()
  const { isAdmin } = usePermissao()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setupGlobalErrorHandler()
  }, [])

  useEffect(() => {
    if (!isAdmin && rotasRestritas.some((rota) => pathname.startsWith(rota))) {
      router.replace('/dashboard')
    }
  }, [pathname, isAdmin, router])

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <Sidebar />
      <main
        className={cn(
          'flex-1 overflow-y-auto transition-all duration-300',
          sidebarOpen ? 'lg:ml-0' : 'lg:ml-0'
        )}
      >
        {children}
      </main>
      <Toaster position="top-right" richColors />
    </div>
  )
}
