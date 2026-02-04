import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

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

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'ticket-mensagens-get', limit: 30, windowSeconds: 60 })
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const { id: ticketId } = await params
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

    // Verify ticket belongs to the company
    const { data: ticket, error: ticketError } = await db
      .from('tickets_suporte')
      .select('id, assunto, status, prioridade')
      .eq('id', ticketId)
      .eq('empresa_id', usuario.empresa_id)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 })
    }

    // Get messages
    const { data: mensagens, error } = await db
      .from('ticket_mensagens')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ticket, mensagens: mensagens || [] })
  } catch (err) {
    console.error('Erro ao buscar mensagens do ticket:', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'ticket-mensagens-post', limit: 20, windowSeconds: 60 })
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const { id: ticketId } = await params
    const body = await request.json()
    const { mensagem } = body

    if (!mensagem || !mensagem.trim()) {
      return NextResponse.json({ error: 'Mensagem é obrigatória' }, { status: 400 })
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

    // Verify ticket belongs to the company
    const { data: ticket, error: ticketError } = await db
      .from('tickets_suporte')
      .select('id, status')
      .eq('id', ticketId)
      .eq('empresa_id', usuario.empresa_id)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 })
    }

    // Insert message
    const { data: novaMensagem, error: msgError } = await db
      .from('ticket_mensagens')
      .insert({
        ticket_id: ticketId,
        mensagem: mensagem.trim(),
        autor_tipo: 'empresa',
        autor_id: user.id,
      })
      .select()
      .single()

    if (msgError) return NextResponse.json({ error: msgError.message }, { status: 500 })

    // Update ticket updated_at
    await db
      .from('tickets_suporte')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', ticketId)

    return NextResponse.json({ data: novaMensagem }, { status: 201 })
  } catch (err) {
    console.error('Erro ao enviar mensagem no ticket:', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
