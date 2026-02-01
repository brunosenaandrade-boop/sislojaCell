'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/useStore'
import { AlertTriangle } from 'lucide-react'
import { planosService } from '@/services/planos.service'
import type { UsageInfo } from '@/types/database'

export function PlanLimitBanner() {
  const { empresa } = useAuthStore()
  const [warnings, setWarnings] = useState<string[]>([])

  useEffect(() => {
    if (!empresa?.id) return
    // Só mostra para trial (plano com limites)
    if (empresa.status_assinatura !== 'trial') {
      setWarnings([])
      return
    }

    const check = async () => {
      try {
        const { data } = await planosService.getUsage(empresa.id)
        if (!data) return

        const msgs: string[] = []
        const checkLimit = (label: string, count: number, limit: number) => {
          if (limit === -1) return
          const pct = (count / limit) * 100
          if (pct >= 80) {
            msgs.push(`${label}: ${count}/${limit} (${Math.round(pct)}%)`)
          }
        }

        checkLimit('Usuários', data.usuarios_count, data.usuarios_limit)
        checkLimit('Produtos', data.produtos_count, data.produtos_limit)
        checkLimit('OS/mês', data.os_mes_count, data.os_mes_limit)
        checkLimit('Vendas/mês', data.vendas_mes_count, data.vendas_mes_limit)

        setWarnings(msgs)
      } catch {
        // silently ignore
      }
    }

    check()
  }, [empresa])

  if (warnings.length === 0) return null

  return (
    <div className="border-b border-yellow-300 bg-yellow-50 px-4 py-2 text-center text-sm text-yellow-800">
      <div className="flex items-center justify-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>
          Limites do trial próximos: {warnings.join(' · ')}
        </span>
        <Link
          href="/planos"
          className="ml-2 font-medium text-yellow-900 underline hover:no-underline"
        >
          Fazer upgrade
        </Link>
      </div>
    </div>
  )
}
