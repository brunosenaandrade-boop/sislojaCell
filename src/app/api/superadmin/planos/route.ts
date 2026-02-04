import { NextRequest, NextResponse } from 'next/server'
import { verifySuperadmin, getServiceClient } from '../route-utils'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    const auth = await verifySuperadmin()
    if ('error' in auth) return auth.error

    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'superadmin-planos-get', limit: 30, windowSeconds: 60 })
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const db = getServiceClient()

    const { data: planos, error } = await db
      .from('planos')
      .select('*')
      .order('ordem', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data: planos })
  } catch (err) {
    console.error('Erro ao listar planos:', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifySuperadmin()
    if ('error' in auth) return auth.error

    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'superadmin-planos-post', limit: 15, windowSeconds: 60 })
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const body = await request.json()
    const { nome, slug, descricao, preco_mensal, preco_anual, recursos, limites, ordem, ativo, destaque } = body

    if (!nome || !slug || preco_mensal === undefined) {
      return NextResponse.json({ error: 'Campos obrigatórios: nome, slug, preco_mensal' }, { status: 400 })
    }

    const db = getServiceClient()

    // Check slug uniqueness
    const { data: existing } = await db
      .from('planos')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Já existe um plano com este slug' }, { status: 409 })
    }

    const { data: plano, error } = await db
      .from('planos')
      .insert({
        nome,
        slug,
        descricao: descricao || null,
        preco_mensal,
        preco_anual: preco_anual || null,
        recursos: recursos || {},
        limites: limites || {},
        ordem: ordem || 0,
        ativo: ativo !== undefined ? ativo : true,
        destaque: destaque || false,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data: plano }, { status: 201 })
  } catch (err) {
    console.error('Erro ao criar plano:', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifySuperadmin()
    if ('error' in auth) return auth.error

    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'superadmin-planos-patch', limit: 20, windowSeconds: 60 })
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const body = await request.json()
    const { id, ...fields } = body

    if (!id) {
      return NextResponse.json({ error: 'ID do plano é obrigatório' }, { status: 400 })
    }

    const db = getServiceClient()

    const { data: plano, error } = await db
      .from('planos')
      .update(fields)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data: plano })
  } catch (err) {
    console.error('Erro ao atualizar plano:', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifySuperadmin()
    if ('error' in auth) return auth.error

    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'superadmin-planos-delete', limit: 10, windowSeconds: 60 })
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'ID do plano é obrigatório' }, { status: 400 })
    }

    const db = getServiceClient()

    // Check if any active companies use this plan
    const { count: activeCount } = await db
      .from('assinaturas')
      .select('id', { count: 'exact', head: true })
      .eq('plano_id', id)
      .eq('status', 'active')

    if (activeCount && activeCount > 0) {
      return NextResponse.json(
        { error: `Existem ${activeCount} assinaturas ativas usando este plano. Não é possível desativar.` },
        { status: 409 }
      )
    }

    // Deactivate plan (soft delete)
    const { data: plano, error } = await db
      .from('planos')
      .update({ ativo: false })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data: plano })
  } catch (err) {
    console.error('Erro ao desativar plano:', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
