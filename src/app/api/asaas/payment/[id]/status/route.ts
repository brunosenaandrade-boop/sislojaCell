import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { asaasService } from '@/services/asaas.service'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

// ============================================
// GET /api/asaas/payment/[id]/status
// Polling de status do pagamento (para PIX)
// ============================================

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
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'payment-status', limit: 30, windowSeconds: 60 })
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { id: paymentId } = await params

    if (!paymentId) {
      return NextResponse.json({ error: 'ID do pagamento não informado' }, { status: 400 })
    }

    const { data, error } = await asaasService.buscarPagamento(paymentId)

    if (error || !data) {
      return NextResponse.json(
        { error: error || 'Erro ao buscar status do pagamento' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: data.status,
      billingType: data.billingType,
      value: data.value,
      netValue: data.netValue,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
