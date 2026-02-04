import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
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

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'tickets-get', limit: 30, windowSeconds: 60 })
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const db = getServiceClient()

    // Get user's empresa_id
    const { data: usuario, error: userError } = await db
      .from('usuarios')
      .select('empresa_id')
      .eq('auth_id', user.id)
      .single()

    if (userError || !usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const { data: tickets, error } = await db
      .from('tickets_suporte')
      .select('*')
      .eq('empresa_id', usuario.empresa_id)
      .order('updated_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data: tickets })
  } catch (err) {
    console.error('Erro ao listar tickets:', err)
    await logApiError('/api/tickets', 'GET', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'tickets-post', limit: 10, windowSeconds: 60 })
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const body = await request.json()
    const { assunto, mensagem } = body

    if (!assunto || !mensagem) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: assunto, mensagem' },
        { status: 400 }
      )
    }

    const db = getServiceClient()

    // Get user's empresa_id
    const { data: usuario, error: userError } = await db
      .from('usuarios')
      .select('empresa_id')
      .eq('auth_id', user.id)
      .single()

    if (userError || !usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Generate protocol number
    const protocolo = `TK-${Date.now().toString(36).toUpperCase()}`

    // Create ticket
    const { data: ticket, error: ticketError } = await db
      .from('tickets_suporte')
      .insert({
        empresa_id: usuario.empresa_id,
        assunto,
        status: 'aberto',
        prioridade: 'media',
        protocolo,
      })
      .select()
      .single()

    if (ticketError) return NextResponse.json({ error: ticketError.message }, { status: 500 })

    // Create first message
    const { error: msgError } = await db
      .from('ticket_mensagens')
      .insert({
        ticket_id: ticket.id,
        mensagem: mensagem.trim(),
        autor_tipo: 'empresa',
        autor_id: user.id,
      })

    if (msgError) {
      console.error('Erro ao criar mensagem inicial do ticket:', msgError)
      // Ticket was created but message failed - still return ticket
    }

    return NextResponse.json({ data: ticket }, { status: 201 })
  } catch (err) {
    console.error('Erro ao criar ticket:', err)
    await logApiError('/api/tickets', 'POST', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
