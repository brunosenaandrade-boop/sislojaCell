import { NextRequest, NextResponse } from 'next/server'
import { verifySuperadmin, getServiceClient } from '../route-utils'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { logApiError } from '@/lib/server-logger'

export async function GET(request: NextRequest) {
  try {
    const auth = await verifySuperadmin()
    if ('error' in auth) return auth.error

    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'superadmin-cupons-get', limit: 30, windowSeconds: 60 })
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const db = getServiceClient()

    const { data: cupons, error } = await db
      .from('cupons')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data: cupons })
  } catch (err) {
    console.error('Erro ao listar cupons:', err)
    await logApiError('/api/superadmin/cupons', 'GET', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifySuperadmin()
    if ('error' in auth) return auth.error

    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'superadmin-cupons-post', limit: 15, windowSeconds: 60 })
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const body = await request.json()
    const {
      codigo,
      descricao,
      tipo_desconto,
      valor,
      plano_restrito,
      max_usos,
      data_expiracao,
      ativo,
    } = body

    if (!codigo || !tipo_desconto || valor === undefined) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: codigo, tipo_desconto, valor' },
        { status: 400 }
      )
    }

    const db = getServiceClient()

    // Validate codigo uniqueness
    const { data: existing } = await db
      .from('cupons')
      .select('id')
      .eq('codigo', codigo.toUpperCase())
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Já existe um cupom com este código' }, { status: 409 })
    }

    const { data: cupom, error } = await db
      .from('cupons')
      .insert({
        codigo: codigo.toUpperCase(),
        descricao: descricao || null,
        tipo_desconto,
        valor,
        plano_restrito: plano_restrito || null,
        max_usos: max_usos || null,
        usos_atuais: 0,
        data_expiracao: data_expiracao || null,
        ativo: ativo !== undefined ? ativo : true,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data: cupom }, { status: 201 })
  } catch (err) {
    console.error('Erro ao criar cupom:', err)
    await logApiError('/api/superadmin/cupons', 'POST', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifySuperadmin()
    if ('error' in auth) return auth.error

    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'superadmin-cupons-patch', limit: 20, windowSeconds: 60 })
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'ID do cupom é obrigatório' }, { status: 400 })
    }

    // Whitelist of allowed fields to prevent mass assignment
    const ALLOWED_FIELDS = ['codigo', 'descricao', 'tipo_desconto', 'valor', 'plano_restrito', 'max_usos', 'data_expiracao', 'ativo'] as const
    const updateFields: Record<string, unknown> = {}
    for (const field of ALLOWED_FIELDS) {
      if (body[field] !== undefined) {
        updateFields[field] = body[field]
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: 'Nenhum campo válido para atualizar' }, { status: 400 })
    }

    // Uppercase codigo if provided
    if (typeof updateFields.codigo === 'string') {
      updateFields.codigo = updateFields.codigo.toUpperCase()
    }

    const db = getServiceClient()

    const { data: cupom, error } = await db
      .from('cupons')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data: cupom })
  } catch (err) {
    console.error('Erro ao atualizar cupom:', err)
    await logApiError('/api/superadmin/cupons', 'PATCH', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
