import { NextRequest, NextResponse } from 'next/server'
import { verifySuperadmin, getServiceClient } from '../route-utils'
import { logApiError } from '@/lib/server-logger'

export async function GET() {
  try {
    const auth = await verifySuperadmin()
    if ('error' in auth) return auth.error

    const db = getServiceClient()

    const { data: empresas, error } = await db
      .from('empresas')
      .select('id, nome, nome_fantasia, cnpj, ativo, plano, status_assinatura, trial_fim, cor_primaria, cor_secundaria, meses_bonus, onboarding_completo, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const ids = (empresas || []).map(e => e.id)

    // Batch count queries instead of N+1
    const [usuariosRes, osRes, vendasRes] = ids.length > 0
      ? await Promise.all([
          db.from('usuarios').select('empresa_id').in('empresa_id', ids),
          db.from('ordens_servico').select('empresa_id').in('empresa_id', ids),
          db.from('vendas').select('empresa_id').in('empresa_id', ids),
        ])
      : [{ data: [] }, { data: [] }, { data: [] }]

    const countBy = (rows: { empresa_id: string }[] | null) => {
      const map: Record<string, number> = {}
      for (const r of rows || []) {
        map[r.empresa_id] = (map[r.empresa_id] || 0) + 1
      }
      return map
    }

    const usuariosCount = countBy(usuariosRes.data)
    const osCount = countBy(osRes.data)
    const vendasCount = countBy(vendasRes.data)

    const empresasWithStats = (empresas || []).map((emp) => ({
      ...emp,
      usuarios_count: usuariosCount[emp.id] ?? 0,
      os_count: osCount[emp.id] ?? 0,
      vendas_count: vendasCount[emp.id] ?? 0,
    }))

    return NextResponse.json({ data: empresasWithStats })
  } catch (err) {
    await logApiError('/api/superadmin/empresas', 'GET', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifySuperadmin()
    if ('error' in auth) return auth.error

    const body = await request.json()
    const { empresa_id, ativo } = body

    if (!empresa_id || typeof ativo !== 'boolean') {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const db = getServiceClient()
    const { error } = await db
      .from('empresas')
      .update({ ativo })
      .eq('id', empresa_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err) {
    await logApiError('/api/superadmin/empresas', 'PATCH', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
