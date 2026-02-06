import { NextRequest, NextResponse } from 'next/server'
import { verifySuperadmin, getServiceClient } from '../route-utils'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { logApiError } from '@/lib/server-logger'
import { sanitizeSearch } from '@/lib/sanitize'

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
      .select('*')
      .order('updated_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (prioridade) {
      query = query.eq('prioridade', prioridade)
    }

    if (search) {
      const s = sanitizeSearch(search)
      query = query.or(`assunto.ilike.%${s}%,protocolo.ilike.%${s}%`)
    }

    const { data: tickets, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Get empresa names + latest message for each ticket
    const empresaIds = [...new Set((tickets || []).map(t => t.empresa_id).filter(Boolean))]
    const empresaMap: Record<string, { nome: string; nome_fantasia: string | null }> = {}

    if (empresaIds.length > 0) {
      const { data: empresas } = await db
        .from('empresas')
        .select('id, nome, nome_fantasia')
        .in('id', empresaIds)

      for (const emp of empresas || []) {
        empresaMap[emp.id] = { nome: emp.nome, nome_fantasia: emp.nome_fantasia }
      }
    }

    // Batch: fetch all messages for all tickets in a single query
    const ticketIds = (tickets || []).map(t => t.id)
    const mensagensMap: Record<string, { mensagem: string; autor_tipo: string; created_at: string }> = {}

    if (ticketIds.length > 0) {
      const { data: allMensagens } = await db
        .from('ticket_mensagens')
        .select('ticket_id, mensagem, autor_tipo, created_at')
        .in('ticket_id', ticketIds)
        .order('created_at', { ascending: false })

      for (const msg of allMensagens || []) {
        // Keep only the most recent message per ticket
        if (!mensagensMap[msg.ticket_id]) {
          mensagensMap[msg.ticket_id] = {
            mensagem: msg.mensagem,
            autor_tipo: msg.autor_tipo,
            created_at: msg.created_at,
          }
        }
      }
    }

    const ticketsComMensagem = (tickets || []).map((ticket) => ({
      ...ticket,
      empresa: empresaMap[ticket.empresa_id] || null,
      ultima_mensagem: mensagensMap[ticket.id] || null,
    }))

    return NextResponse.json({ data: ticketsComMensagem })
  } catch (err) {
    console.error('Erro ao listar tickets:', err)
    await logApiError('/api/superadmin/tickets', 'GET', err)
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
      return NextResponse.json({ error: 'ID do ticket é obrigatório' }, { status: 400 })
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
    await logApiError('/api/superadmin/tickets', 'PATCH', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
