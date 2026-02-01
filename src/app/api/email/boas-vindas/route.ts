import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { emailService } from '@/services/email/resend'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

// ============================================
// POST /api/email/boas-vindas
// Envia email de boas-vindas após cadastro
// ============================================

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 requests por minuto por IP
    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'boas-vindas', limit: 5, windowSeconds: 60 })
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { email, nomeEmpresa } = (await request.json()) as {
      email?: string
      nomeEmpresa?: string
    }

    if (!email || !nomeEmpresa) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    // Verificar que o usuário está autenticado
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
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // 10.2 - Enviar email de boas-vindas
    const result = await emailService.boasVindas(email, nomeEmpresa)

    return NextResponse.json({ success: result.success, error: result.error })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
