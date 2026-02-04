import { NextRequest, NextResponse } from 'next/server'
import { verifySuperadmin, getServiceClient } from '../route-utils'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const auth = await verifySuperadmin()
    if ('error' in auth) return auth.error

    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'superadmin-impersonacao', limit: 20, windowSeconds: 60 })
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const body = await request.json()
    const { empresa_id, empresa_nome, acao } = body

    if (!empresa_id || !acao) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: empresa_id, ação' },
        { status: 400 }
      )
    }

    const db = getServiceClient()

    // Log impersonation action
    const { data: log, error } = await db
      .from('logs_sistema')
      .insert({
        tipo: 'audit',
        categoria: 'impersonacao',
        mensagem: `Superadmin ${acao} impersonação da empresa ${empresa_nome || empresa_id}`,
        detalhes: {
          empresa_id,
          empresa_nome: empresa_nome || null,
          acao,
          superadmin_id: auth.authUserId,
          timestamp: new Date().toISOString(),
        },
        autor_id: auth.authUserId,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data: log }, { status: 201 })
  } catch (err) {
    console.error('Erro ao registrar impersonação:', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
