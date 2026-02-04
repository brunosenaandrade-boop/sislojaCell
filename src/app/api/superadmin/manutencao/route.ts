import { NextRequest, NextResponse } from 'next/server'
import { verifySuperadmin, getServiceClient } from '../route-utils'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { logApiError } from '@/lib/server-logger'

export async function GET(request: NextRequest) {
  try {
    const auth = await verifySuperadmin()
    if ('error' in auth) return auth.error

    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'superadmin-manutencao-get', limit: 30, windowSeconds: 60 })
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const db = getServiceClient()

    const { data, error } = await db
      .from('configuracoes_plataforma')
      .select('valor')
      .eq('chave', 'manutencao')
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data?.valor || { ativo: false, mensagem: '' })
  } catch (err) {
    console.error('Erro ao buscar status de manutenção:', err)
    await logApiError('/api/superadmin/manutencao', 'GET', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifySuperadmin()
    if ('error' in auth) return auth.error

    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'superadmin-manutencao-patch', limit: 10, windowSeconds: 60 })
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const body = await request.json()
    const { ativo, mensagem } = body

    if (typeof ativo !== 'boolean') {
      return NextResponse.json(
        { error: 'Campo obrigatório: ativo (boolean)' },
        { status: 400 }
      )
    }

    const db = getServiceClient()

    const valor = {
      ativo,
      mensagem: mensagem || '',
      atualizado_em: new Date().toISOString(),
      atualizado_por: auth.authUserId,
    }

    // Upsert configuracoes_plataforma
    const { data, error } = await db
      .from('configuracoes_plataforma')
      .upsert(
        {
          chave: 'manutencao',
          valor,
        },
        { onConflict: 'chave' }
      )
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Log the action
    await db.from('logs_sistema').insert({
      tipo: 'audit',
      categoria: 'manutencao',
      mensagem: ativo
        ? 'Modo de manutenção ATIVADO'
        : 'Modo de manutenção DESATIVADO',
      detalhes: { ativo, mensagem },
      autor_id: auth.authUserId,
    })

    return NextResponse.json({ data: data?.valor || valor })
  } catch (err) {
    console.error('Erro ao atualizar modo de manutenção:', err)
    await logApiError('/api/superadmin/manutencao', 'PATCH', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
