import { NextRequest, NextResponse } from 'next/server'
import { verifySuperadmin, getServiceClient } from '../route-utils'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { logApiError } from '@/lib/server-logger'

export async function GET(request: NextRequest) {
  try {
    const auth = await verifySuperadmin()
    if ('error' in auth) return auth.error

    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'superadmin-avisos-get', limit: 30, windowSeconds: 60 })
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const db = getServiceClient()

    // Get all announcements
    const { data: avisos, error } = await db
      .from('avisos_plataforma')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Get read counts for each announcement
    const avisosComLeituras = await Promise.all(
      (avisos || []).map(async (aviso) => {
        const { count } = await db
          .from('avisos_lidos')
          .select('id', { count: 'exact', head: true })
          .eq('aviso_id', aviso.id)

        return {
          ...aviso,
          leituras_count: count || 0,
        }
      })
    )

    return NextResponse.json({ data: avisosComLeituras })
  } catch (err) {
    console.error('Erro ao listar avisos:', err)
    await logApiError('/api/superadmin/avisos', 'GET', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifySuperadmin()
    if ('error' in auth) return auth.error

    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'superadmin-avisos-post', limit: 15, windowSeconds: 60 })
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const body = await request.json()
    const { titulo, mensagem, tipo, alvo_tipo, alvo_valor, ativo } = body

    if (!titulo || !mensagem) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: título, mensagem' },
        { status: 400 }
      )
    }

    const db = getServiceClient()

    const { data: aviso, error } = await db
      .from('avisos_plataforma')
      .insert({
        titulo,
        mensagem,
        tipo: tipo || 'info',
        alvo_tipo: alvo_tipo || 'todos',
        alvo_valor: alvo_valor || null,
        ativo: ativo !== undefined ? ativo : true,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data: aviso }, { status: 201 })
  } catch (err) {
    console.error('Erro ao criar aviso:', err)
    await logApiError('/api/superadmin/avisos', 'POST', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifySuperadmin()
    if ('error' in auth) return auth.error

    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'superadmin-avisos-delete', limit: 15, windowSeconds: 60 })
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID do aviso é obrigatório' }, { status: 400 })
    }

    const db = getServiceClient()

    // Remover leituras associadas primeiro
    await db.from('avisos_lidos').delete().eq('aviso_id', id)

    const { error } = await db
      .from('avisos_plataforma')
      .delete()
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Erro ao excluir aviso:', err)
    await logApiError('/api/superadmin/avisos', 'DELETE', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifySuperadmin()
    if ('error' in auth) return auth.error

    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'superadmin-avisos-patch', limit: 20, windowSeconds: 60 })
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const body = await request.json()
    const { id, ...fields } = body

    if (!id) {
      return NextResponse.json({ error: 'ID do aviso é obrigatório' }, { status: 400 })
    }

    const db = getServiceClient()

    const { data: aviso, error } = await db
      .from('avisos_plataforma')
      .update(fields)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data: aviso })
  } catch (err) {
    console.error('Erro ao atualizar aviso:', err)
    await logApiError('/api/superadmin/avisos', 'PATCH', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
