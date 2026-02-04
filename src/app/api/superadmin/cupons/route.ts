import { NextRequest, NextResponse } from 'next/server'
import { verifySuperadmin, getServiceClient } from '../route-utils'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

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
      plano_slug,
      max_usos,
      validade,
      ativo,
    } = body

    if (!codigo || !tipo_desconto || valor === undefined) {
      return NextResponse.json(
        { error: 'Campos obrigatorios: codigo, tipo_desconto, valor' },
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
      return NextResponse.json({ error: 'Ja existe um cupom com este codigo' }, { status: 409 })
    }

    const { data: cupom, error } = await db
      .from('cupons')
      .insert({
        codigo: codigo.toUpperCase(),
        descricao: descricao || null,
        tipo_desconto,
        valor,
        plano_slug: plano_slug || null,
        max_usos: max_usos || null,
        usos: 0,
        validade: validade || null,
        ativo: ativo !== undefined ? ativo : true,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data: cupom }, { status: 201 })
  } catch (err) {
    console.error('Erro ao criar cupom:', err)
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
    const { id, ...fields } = body

    if (!id) {
      return NextResponse.json({ error: 'ID do cupom e obrigatorio' }, { status: 400 })
    }

    // Uppercase codigo if provided
    if (fields.codigo) {
      fields.codigo = fields.codigo.toUpperCase()
    }

    const db = getServiceClient()

    const { data: cupom, error } = await db
      .from('cupons')
      .update(fields)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data: cupom })
  } catch (err) {
    console.error('Erro ao atualizar cupom:', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
