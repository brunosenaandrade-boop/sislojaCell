'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/useStore'
import { Clock, ArrowRight } from 'lucide-react'

export function TrialBanner() {
  const { empresa } = useAuthStore()
  const [diasRestantes, setDiasRestantes] = useState<number | null>(null)

  useEffect(() => {
    if (empresa?.status_assinatura !== 'trial' || !empresa?.trial_fim) {
      setDiasRestantes(null)
      return
    }

    const diff = new Date(empresa.trial_fim).getTime() - Date.now()
    const dias = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
    setDiasRestantes(dias)
  }, [empresa])

  if (diasRestantes === null) return null

  // Cor: verde >3d, amarelo 2-3d, vermelho <=1d
  let bgColor = 'bg-green-600'
  if (diasRestantes <= 1) bgColor = 'bg-red-600'
  else if (diasRestantes <= 3) bgColor = 'bg-yellow-500'

  return (
    <div className={`${bgColor} px-4 py-2 text-center text-sm font-medium text-white`}>
      <div className="flex items-center justify-center gap-2">
        <Clock className="h-4 w-4" />
        <span>
          {diasRestantes === 0
            ? 'Seu período de teste expirou!'
            : `Trial: ${diasRestantes} dia(s) restante(s)`}
        </span>
        <Link
          href="/planos"
          className="ml-2 inline-flex items-center gap-1 rounded-md bg-white/20 px-2 py-0.5 text-xs font-medium hover:bg-white/30"
        >
          Assinar agora
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}
