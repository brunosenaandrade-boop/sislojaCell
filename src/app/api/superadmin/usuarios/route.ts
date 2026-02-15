import { NextRequest, NextResponse } from 'next/server'
import { verifySuperadmin, getServiceClient } from '../route-utils'
import { sanitizeSearch } from '@/lib/sanitize'

export async function PATCH(request: NextRequest) {
  const auth = await verifySuperadmin()
  if ('error' in auth) return auth.error

  const body = await request.json()
  const { auth_id, nova_senha } = body

  if (!auth_id || !nova_senha) {
    return NextResponse.json({ error: 'auth_id e nova_senha são obrigatórios' }, { status: 400 })
  }

  if (nova_senha.length < 6) {
    return NextResponse.json({ error: 'A senha deve ter no mínimo 6 caracteres' }, { status: 400 })
  }

  const db = getServiceClient()

  const { error } = await db.auth.admin.updateUserById(auth_id, {
    password: nova_senha,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function GET(request: NextRequest) {
  const auth = await verifySuperadmin()
  if ('error' in auth) return auth.error

  const { searchParams } = new URL(request.url)
  const empresa_id = searchParams.get('empresa_id')
  const perfil = searchParams.get('perfil')
  const search = searchParams.get('search')
  const ativo = searchParams.get('ativo')

  const db = getServiceClient()

  let query = db
    .from('usuarios')
    .select('*, empresas:empresa_id(nome, nome_fantasia)')
    .not('perfil', 'eq', 'superadmin')
    .order('created_at', { ascending: false })

  if (empresa_id) query = query.eq('empresa_id', empresa_id)
  if (perfil) query = query.eq('perfil', perfil)
  if (ativo === 'true') query = query.eq('ativo', true)
  if (ativo === 'false') query = query.eq('ativo', false)
  if (search) {
    const s = sanitizeSearch(search)
    query = query.or('nome.ilike.%' + s + '%,email.ilike.%' + s + '%')
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data })
}
