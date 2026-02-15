import { NextRequest, NextResponse } from 'next/server'
import { verifySuperadmin, getServiceClient } from '../route-utils'
import { logApiError } from '@/lib/server-logger'
import { sanitizeSearch } from '@/lib/sanitize'

export async function GET(request: NextRequest) {
  try {
    const auth = await verifySuperadmin()
    if ('error' in auth) return auth.error

    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')
    const categoria = searchParams.get('categoria')
    const empresa_id = searchParams.get('empresa_id')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '200')

    const db = getServiceClient()

    let query = db
      .from('logs_sistema')
      .select('*, empresas:empresa_id(nome, nome_fantasia), usuarios:usuario_id(nome, email, perfil)')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (tipo) query = query.eq('tipo', tipo)
    if (categoria) query = query.eq('categoria', categoria)
    if (empresa_id) query = query.eq('empresa_id', empresa_id)
    if (search) query = query.ilike('mensagem', '%' + sanitizeSearch(search) + '%')

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data })
  } catch (err) {
    console.error('Erro ao buscar logs:', err)
    await logApiError('/api/superadmin/logs', 'GET', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
