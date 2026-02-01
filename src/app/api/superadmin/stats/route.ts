import { NextResponse } from 'next/server'
import { verifySuperadmin, getServiceClient } from '../route-utils'

export async function GET() {
  const auth = await verifySuperadmin()
  if ('error' in auth) return auth.error

  const db = getServiceClient()

  const [empresas, empresasAtivas, usuarios, os, vendas, vendasValor] = await Promise.all([
    db.from('empresas').select('id', { count: 'exact', head: true }),
    db.from('empresas').select('id', { count: 'exact', head: true }).eq('ativo', true),
    db.from('usuarios').select('id', { count: 'exact', head: true }).not('perfil', 'eq', 'superadmin'),
    db.from('ordens_servico').select('id', { count: 'exact', head: true }),
    db.from('vendas').select('id', { count: 'exact', head: true }),
    db.from('vendas').select('valor_total'),
  ])

  const valor_total_vendas = (vendasValor.data || []).reduce(
    (acc: number, v: { valor_total: number }) => acc + (v.valor_total || 0), 0
  )

  return NextResponse.json({
    data: {
      total_empresas: empresas.count ?? 0,
      empresas_ativas: empresasAtivas.count ?? 0,
      total_usuarios: usuarios.count ?? 0,
      total_os: os.count ?? 0,
      total_vendas: vendas.count ?? 0,
      valor_total_vendas,
    }
  })
}
