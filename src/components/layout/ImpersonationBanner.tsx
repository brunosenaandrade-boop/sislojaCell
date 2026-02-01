'use client'

import { useAuthStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { X, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ImpersonationBanner() {
  const { isImpersonating, empresa, stopImpersonation } = useAuthStore()
  const router = useRouter()

  if (!isImpersonating) return null

  const handleExit = () => {
    stopImpersonation()
    router.push('/admin/empresas')
  }

  return (
    <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between text-sm shrink-0">
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4" />
        <span>
          Visualizando como: <strong>{empresa?.nome_fantasia || empresa?.nome}</strong>
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleExit}
        className="text-white hover:bg-red-700 h-7"
      >
        <X className="h-4 w-4 mr-1" />
        Sair
      </Button>
    </div>
  )
}
