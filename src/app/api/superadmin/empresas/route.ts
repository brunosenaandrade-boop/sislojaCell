import { NextRequest, NextResponse } from 'next/server'
import { verifySuperadmin, getServiceClient } from '../route-utils'

export async function GET() {
  const auth = await verifySuperadmin()
  if ('error' in auth) return auth.error

  const db = getServiceClient()

  const { data: empresas, error } = await db
    .from('empresas')
    .select('id, nome, nome_fantasia, cnpj, ativo, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const empresasWithStats = await Promise.all(
    (empresas || []).map(async (emp) => {
      const [usuarios, os, vendas] = await Promise.all([
        db.from('usuarios').select('id', { count: 'exact', head: true }).eq('empresa_id', emp.id),
        db.from('ordens_servico').select('id', { count: 'exact', head: true }).eq('empresa_id', emp.id),
        db.from('vendas').select('id', { count: 'exact', head: true }).eq('empresa_id', emp.id),
      ])
      return {
        ...emp,
        usuarios_count: usuarios.count ?? 0,
        os_count: os.count ?? 0,
        vendas_count: vendas.count ?? 0,
      }
    })
  )

  return NextResponse.json({ data: empresasWithStats })
}

export async function PATCH(request: NextRequest) {
  const auth = await verifySuperadmin()
  if ('error' in auth) return auth.error

  const body = await request.json()
  const { empresa_id, ativo } = body

  if (!empresa_id || typeof ativo !== 'boolean') {
    return NextResponse.json({ error: 'Dados invalidos' }, { status: 400 })
  }

  const db = getServiceClient()
  const { error } = await db
    .from('empresas')
    .update({ ativo })
    .eq('id', empresa_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
