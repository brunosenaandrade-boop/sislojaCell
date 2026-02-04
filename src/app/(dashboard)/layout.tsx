'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { useUIStore, useSubscriptionStore } from '@/store/useStore'
import { usePermissao } from '@/hooks/usePermissao'
import { setupGlobalErrorHandler } from '@/services/logger'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/sonner'
import { TutorialProvider } from '@/components/tutorial/TutorialProvider'
import { TutorialOverlay } from '@/components/tutorial/TutorialOverlay'
import { TutorialCard } from '@/components/tutorial/TutorialCard'
import { HelpButton } from '@/components/tutorial/HelpButton'
import { ImpersonationBanner } from '@/components/layout/ImpersonationBanner'
import { TrialBanner } from '@/components/layout/TrialBanner'

const rotasRestritas = ['/configuracoes', '/relatorios', '/logs']
const rotasSuperadmin = ['/admin']

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { sidebarOpen } = useUIStore()
  const { isAdmin, isSuperadmin } = usePermissao()
  const { fetchSubscription, isLoaded: subscriptionLoaded } = useSubscriptionStore()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setupGlobalErrorHandler()
  }, [])

  // Carregar dados da assinatura junto com o layout
  useEffect(() => {
    if (!subscriptionLoaded) {
      fetchSubscription()
    }
  }, [subscriptionLoaded, fetchSubscription])

  useEffect(() => {
    if (!isAdmin && rotasRestritas.some((rota) => pathname.startsWith(rota))) {
      router.replace('/dashboard')
    }
    if (!isSuperadmin && rotasSuperadmin.some((rota) => pathname.startsWith(rota))) {
      router.replace('/dashboard')
    }
  }, [pathname, isAdmin, isSuperadmin, router])

  return (
    <TutorialProvider>
      <div className="flex h-screen overflow-hidden bg-muted/30">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <ImpersonationBanner />
          <TrialBanner />
          <main
            className={cn(
              'flex-1 overflow-y-auto transition-all duration-300',
              sidebarOpen ? 'lg:ml-0' : 'lg:ml-0'
            )}
          >
            {children}
          </main>
        </div>
        <Toaster position="top-right" richColors />
        <TutorialOverlay />
        <TutorialCard />
        <HelpButton />
      </div>
    </TutorialProvider>
  )
}
