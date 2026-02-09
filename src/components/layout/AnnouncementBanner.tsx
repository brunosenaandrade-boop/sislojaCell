'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/useStore'
import { usePermissao } from '@/hooks/usePermissao'
import { avisosService } from '@/services/avisos.service'
import type { AvisoPlataforma } from '@/types/database'
import { X, Info, AlertTriangle, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AnnouncementBanner() {
  const { isImpersonating } = useAuthStore()
  const { isSuperadmin } = usePermissao()
  const [avisos, setAvisos] = useState<AvisoPlataforma[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isSuperadmin && !isImpersonating) return

    async function load() {
      const { data } = await avisosService.getAtivos()
      if (data) setAvisos(data)
    }
    load()
  }, [isSuperadmin, isImpersonating])

  const handleDismiss = async (avisoId: string) => {
    setDismissed((prev) => new Set([...prev, avisoId]))
    await avisosService.marcarComoLido(avisoId)
  }

  const visibleAvisos = avisos.filter((a) => !dismissed.has(a.id))

  if (visibleAvisos.length === 0) return null

  const getStyles = (tipo: string) => {
    switch (tipo) {
      case 'warning':
        return { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-800', icon: AlertTriangle, iconColor: 'text-yellow-600' }
      case 'important':
        return { bg: 'bg-red-50 border-red-200', text: 'text-red-800', icon: Bell, iconColor: 'text-red-600' }
      default:
        return { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', icon: Info, iconColor: 'text-blue-600' }
    }
  }

  return (
    <div className="space-y-0">
      {visibleAvisos.map((aviso) => {
        const styles = getStyles(aviso.tipo)
        const Icon = styles.icon
        return (
          <div
            key={aviso.id}
            className={`${styles.bg} ${styles.text} border-b px-4 py-2 flex items-center justify-between gap-2 text-sm shrink-0`}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Icon className={`h-4 w-4 shrink-0 ${styles.iconColor}`} />
              <span className="font-medium truncate">{aviso.titulo}:</span>
              <span className="truncate">{aviso.mensagem}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDismiss(aviso.id)}
              className={`shrink-0 h-8 w-8 p-0 ${styles.text} hover:bg-black/5`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )
      })}
    </div>
  )
}
