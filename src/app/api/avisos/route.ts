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

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
    }

    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'avisos-get', limit: 30, windowSeconds: 60 })
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const db = getServiceClient()

    // Get user's empresa_id and plano
    const { data: usuario, error: userError } = await db
      .from('usuarios')
      .select('empresa_id')
      .eq('auth_id', user.id)
      .single()

    if (userError || !usuario) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    const empresaId = usuario.empresa_id

    // Get empresa's plano
    const { data: assinatura } = await db
      .from('assinaturas')
      .select('plano_id, planos(slug)')
      .eq('empresa_id', empresaId)
      .eq('status', 'active')
      .single()

    const planoSlug = (assinatura as unknown as { planos?: { slug: string } | null })?.planos?.slug || null

    // Get already read aviso IDs
    const { data: lidos } = await db
      .from('avisos_lidos')
      .select('aviso_id')
      .eq('empresa_id', empresaId)

    const lidosIds = (lidos || []).map((l) => l.aviso_id)

    // Get active announcements targeted to this company
    let query = db
      .from('avisos_plataforma')
      .select('*')
      .eq('ativo', true)
      .order('created_at', { ascending: false })

    const { data: avisos, error: avisosError } = await query

    if (avisosError) return NextResponse.json({ error: avisosError.message }, { status: 500 })

    // Filter by target type and exclude already read
    const avisosFiltrados = (avisos || []).filter((aviso) => {
      // Exclude already read
      if (lidosIds.includes(aviso.id)) return false

      // Filter by target
      if (aviso.alvo_tipo === 'todos') return true
      if (aviso.alvo_tipo === 'plano' && aviso.alvo_valor === planoSlug) return true
      if (aviso.alvo_tipo === 'empresa' && aviso.alvo_valor === empresaId) return true

      return false
    })

    return NextResponse.json({ data: avisosFiltrados })
  } catch (err) {
    console.error('Erro ao buscar avisos:', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
    }

    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'avisos-post', limit: 30, windowSeconds: 60 })
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const body = await request.json()
    const { aviso_id } = body

    if (!aviso_id) {
      return NextResponse.json({ error: 'aviso_id e obrigatorio' }, { status: 400 })
    }

    const db = getServiceClient()

    // Get user's empresa_id
    const { data: usuario, error: userError } = await db
      .from('usuarios')
      .select('empresa_id')
      .eq('auth_id', user.id)
      .single()

    if (userError || !usuario) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    // Check if already marked as read
    const { data: existing } = await db
      .from('avisos_lidos')
      .select('id')
      .eq('aviso_id', aviso_id)
      .eq('empresa_id', usuario.empresa_id)
      .single()

    if (existing) {
      return NextResponse.json({ message: 'Aviso ja marcado como lido' })
    }

    // Mark as read
    const { error } = await db
      .from('avisos_lidos')
      .insert({
        aviso_id,
        empresa_id: usuario.empresa_id,
      })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('Erro ao marcar aviso como lido:', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
