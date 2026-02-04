import { NextRequest, NextResponse } from 'next/server'
import { verifySuperadmin, getServiceClient } from '../route-utils'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    const auth = await verifySuperadmin()
    if ('error' in auth) return auth.error

    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'superadmin-tickets-get', limit: 30, windowSeconds: 60 })
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const db = getServiceClient()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const prioridade = searchParams.get('prioridade')
    const search = searchParams.get('search')

    let query = db
      .from('tickets_suporte')
      .select('*, empresas:empresa_id(nome, nome_fantasia)')
      .order('updated_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (prioridade) {
      query = query.eq('prioridade', prioridade)
    }

    if (search) {
      query = query.or(`assunto.ilike.%${search}%,protocolo.ilike.%${search}%`)
    }

    const { data: tickets, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Get latest message for each ticket
    const ticketsComMensagem = await Promise.all(
      (tickets || []).map(async (ticket) => {
        const { data: mensagens } = await db
          .from('ticket_mensagens')
          .select('mensagem, autor_tipo, created_at')
          .eq('ticket_id', ticket.id)
          .order('created_at', { ascending: false })
          .limit(1)

        return {
          ...ticket,
          ultima_mensagem: mensagens?.[0] || null,
        }
      })
    )

    return NextResponse.json({ data: ticketsComMensagem })
  } catch (err) {
    console.error('Erro ao listar tickets:', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifySuperadmin()
    if ('error' in auth) return auth.error

    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'superadmin-tickets-patch', limit: 20, windowSeconds: 60 })
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const body = await request.json()
    const { id, status, prioridade } = body

    if (!id) {
      return NextResponse.json({ error: 'ID do ticket e obrigatorio' }, { status: 400 })
    }

    if (!status && !prioridade) {
      return NextResponse.json(
        { error: 'Informe ao menos um campo para atualizar (status ou prioridade)' },
        { status: 400 }
      )
    }

    const db = getServiceClient()

    const updateFields: Record<string, string> = {}
    if (status) updateFields.status = status
    if (prioridade) updateFields.prioridade = prioridade
    updateFields.updated_at = new Date().toISOString()

    const { data: ticket, error } = await db
      .from('tickets_suporte')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data: ticket })
  } catch (err) {
    console.error('Erro ao atualizar ticket:', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
