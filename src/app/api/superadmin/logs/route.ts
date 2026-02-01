import { NextRequest, NextResponse } from 'next/server'
import { verifySuperadmin, getServiceClient } from '../route-utils'

export async function GET(request: NextRequest) {
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
    .select('*, empresas:empresa_id(nome, nome_fantasia)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (tipo) query = query.eq('tipo', tipo)
  if (categoria) query = query.eq('categoria', categoria)
  if (empresa_id) query = query.eq('empresa_id', empresa_id)
  if (search) query = query.ilike('mensagem', '%' + search + '%')

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data })
}
