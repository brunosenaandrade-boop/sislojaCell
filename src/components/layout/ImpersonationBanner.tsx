'use client'

import { useAuthStore } from '@/store/useStore'
import { superadminService } from '@/services/superadmin.service'
import { Button } from '@/components/ui/button'
import { X, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ImpersonationBanner() {
  const { isImpersonating, empresa, stopImpersonation } = useAuthStore()
  const router = useRouter()

  if (!isImpersonating) return null

  const handleExit = async () => {
    if (empresa) {
      await superadminService.logImpersonacao(
        empresa.id,
        empresa.nome_fantasia || empresa.nome,
        'fim'
      )
    }
    stopImpersonation()
    router.push('/admin/empresas')
  }

  return (
    <div className="bg-red-600 text-white px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm shrink-0">
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4" />
        <span>
          Visualizando como: <strong className="truncate max-w-[200px] sm:max-w-none">{empresa?.nome_fantasia || empresa?.nome}</strong>
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
