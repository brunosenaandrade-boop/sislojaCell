import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getServiceClient } from '../../route-utils'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { logApiError } from '@/lib/server-logger'

async function getAuthUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

interface CupomValidoResponse {
  valido: true
  tipo_desconto: string
  valor: number
  descricao: string | null
}

interface CupomInvalidoResponse {
  valido: false
  motivo: string
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'cupons-validar', limit: 30, windowSeconds: 60 })
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const body = await request.json()
    const { codigo, plano_slug } = body

    if (!codigo) {
      return NextResponse.json({ error: 'Código do cupom é obrigatório' }, { status: 400 })
    }

    const db = getServiceClient()

    const { data: cupom, error } = await db
      .from('cupons')
      .select('*')
      .eq('codigo', codigo.toUpperCase())
      .single()

    if (error || !cupom) {
      const response: CupomInvalidoResponse = { valido: false, motivo: 'Cupom não encontrado' }
      return NextResponse.json(response)
    }

    // Check if active
    if (!cupom.ativo) {
      const response: CupomInvalidoResponse = { valido: false, motivo: 'Cupom inativo' }
      return NextResponse.json(response)
    }

    // Check expiration
    if (cupom.validade) {
      const validade = new Date(cupom.validade)
      if (validade < new Date()) {
        const response: CupomInvalidoResponse = { valido: false, motivo: 'Cupom expirado' }
        return NextResponse.json(response)
      }
    }

    // Check max uses
    if (cupom.max_usos !== null && cupom.usos >= cupom.max_usos) {
      const response: CupomInvalidoResponse = {
        valido: false,
        motivo: 'Cupom atingiu o limite máximo de usos',
      }
      return NextResponse.json(response)
    }

    // Check plan restriction
    if (cupom.plano_slug && plano_slug && cupom.plano_slug !== plano_slug) {
      const response: CupomInvalidoResponse = {
        valido: false,
        motivo: 'Cupom não é válido para este plano',
      }
      return NextResponse.json(response)
    }

    const response: CupomValidoResponse = {
      valido: true,
      tipo_desconto: cupom.tipo_desconto,
      valor: cupom.valor,
      descricao: cupom.descricao,
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('Erro ao validar cupom:', err)
    await logApiError('/api/superadmin/cupons/validar', 'POST', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
