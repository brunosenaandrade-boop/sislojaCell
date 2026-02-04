import { NextRequest, NextResponse } from 'next/server'
import { verifySuperadmin, getServiceClient } from '../../../route-utils'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await verifySuperadmin()
    if ('error' in auth) return auth.error

    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'superadmin-ticket-mensagens-get', limit: 30, windowSeconds: 60 })
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const { id: ticketId } = await params
    const db = getServiceClient()

    // Verify ticket exists
    const { data: ticket, error: ticketError } = await db
      .from('tickets_suporte')
      .select('id, assunto, status, prioridade, empresa_id')
      .eq('id', ticketId)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket nao encontrado' }, { status: 404 })
    }

    // Get all messages
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
    const auth = await verifySuperadmin()
    if ('error' in auth) return auth.error

    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'superadmin-ticket-mensagens-post', limit: 20, windowSeconds: 60 })
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const { id: ticketId } = await params
    const body = await request.json()
    const { mensagem } = body

    if (!mensagem || !mensagem.trim()) {
      return NextResponse.json({ error: 'Mensagem e obrigatoria' }, { status: 400 })
    }

    const db = getServiceClient()

    // Verify ticket exists
    const { data: ticket, error: ticketError } = await db
      .from('tickets_suporte')
      .select('id, status')
      .eq('id', ticketId)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket nao encontrado' }, { status: 404 })
    }

    // Insert message
    const { data: novaMensagem, error: msgError } = await db
      .from('ticket_mensagens')
      .insert({
        ticket_id: ticketId,
        mensagem: mensagem.trim(),
        autor_tipo: 'superadmin',
        autor_id: auth.authUserId,
      })
      .select()
      .single()

    if (msgError) return NextResponse.json({ error: msgError.message }, { status: 500 })

    // Update ticket status to 'em_atendimento' if currently 'aberto'
    const updateFields: Record<string, string> = {
      updated_at: new Date().toISOString(),
    }
    if (ticket.status === 'aberto') {
      updateFields.status = 'em_atendimento'
    }

    await db
      .from('tickets_suporte')
      .update(updateFields)
      .eq('id', ticketId)

    return NextResponse.json({ data: novaMensagem }, { status: 201 })
  } catch (err) {
    console.error('Erro ao enviar mensagem no ticket:', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
