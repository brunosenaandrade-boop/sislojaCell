'use client'

import { useEffect, useState } from 'react'
import { Construction } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function ManutencaoPage() {
  const [mensagem, setMensagem] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchManutencao() {
      try {
        const res = await fetch('/api/manutencao')
        if (res.ok) {
          const json = await res.json()
          setMensagem(json.mensagem || '')
        }
      } catch {
        // silently fail
      }
      setLoading(false)
    }

    fetchManutencao()
  }, [])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="rounded-full bg-yellow-100 p-4">
              <Construction className="h-12 w-12 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Sistema em Manutenção
            </h1>
            {loading ? (
              <div className="h-5 w-48 bg-muted rounded animate-pulse" />
            ) : (
              <p className="text-gray-600">
                {mensagem || 'Estamos realizando melhorias no sistema. Voltaremos em breve!'}
              </p>
            )}
            <p className="text-sm text-gray-400">
              Tente novamente mais tarde
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
