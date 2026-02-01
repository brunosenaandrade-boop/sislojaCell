import { NextResponse } from 'next/server'
import { verifySuperadmin, getServiceClient } from '../route-utils'

export async function GET() {
  const auth = await verifySuperadmin()
  if ('error' in auth) return auth.error

  const db = getServiceClient()
  const alerts: Array<{
    tipo: 'critico' | 'aviso' | 'info'
    categoria: string
    mensagem: string
    empresa_id?: string
    empresa_nome?: string
  }> = []

  // 1. Empresas
  const { data: empresas } = await db.from('empresas').select('id, nome, nome_fantasia, ativo')

  for (const emp of empresas || []) {
    // Sem admin ativo
    const { count: adminCount } = await db
      .from('usuarios')
      .select('id', { count: 'exact', head: true })
      .eq('empresa_id', emp.id)
      .eq('perfil', 'admin')
      .eq('ativo', true)

    if ((adminCount || 0) === 0) {
      alerts.push({
        tipo: 'critico',
        categoria: 'empresa',
        mensagem: 'Empresa "' + (emp.nome_fantasia || emp.nome) + '" sem administrador ativo',
        empresa_id: emp.id,
        empresa_nome: emp.nome_fantasia || emp.nome,
      })
    }

    // Empresa inativa
    if (!emp.ativo) {
      alerts.push({
        tipo: 'aviso',
        categoria: 'empresa',
        mensagem: 'Empresa "' + (emp.nome_fantasia || emp.nome) + '" esta desativada',
        empresa_id: emp.id,
        empresa_nome: emp.nome_fantasia || emp.nome,
      })
    }

    // Sem usuarios
    const { count: usrCount } = await db
      .from('usuarios')
      .select('id', { count: 'exact', head: true })
      .eq('empresa_id', emp.id)
      .eq('ativo', true)

    if ((usrCount || 0) === 0) {
      alerts.push({
        tipo: 'aviso',
        categoria: 'empresa',
        mensagem: 'Empresa "' + (emp.nome_fantasia || emp.nome) + '" sem nenhum usuario ativo',
        empresa_id: emp.id,
        empresa_nome: emp.nome_fantasia || emp.nome,
      })
    }
  }

  // 2. Erros recentes (24h)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count: errorCount } = await db
    .from('logs_sistema')
    .select('id', { count: 'exact', head: true })
    .eq('tipo', 'erro')
    .gte('created_at', oneDayAgo)

  if ((errorCount || 0) > 0) {
    alerts.push({
      tipo: 'critico',
      categoria: 'sistema',
      mensagem: errorCount + ' erro(s) registrado(s) nas ultimas 24 horas',
    })
  }

  // 3. Usuarios inativos
  const { count: inactiveCount } = await db
    .from('usuarios')
    .select('id', { count: 'exact', head: true })
    .eq('ativo', false)
    .not('perfil', 'eq', 'superadmin')

  if ((inactiveCount || 0) > 0) {
    alerts.push({
      tipo: 'info',
      categoria: 'usuarios',
      mensagem: inactiveCount + ' usuario(s) desativado(s) no sistema',
    })
  }

  // 4. Produtos com estoque baixo
  const { count: lowStockCount } = await db
    .from('produtos')
    .select('id', { count: 'exact', head: true })
    .eq('ativo', true)
    .lt('estoque_atual', 5)

  if ((lowStockCount || 0) > 0) {
    alerts.push({
      tipo: 'aviso',
      categoria: 'estoque',
      mensagem: lowStockCount + ' produto(s) com estoque abaixo de 5 unidades',
    })
  }

  // Summary
  const { count: totalEmpresas } = await db.from('empresas').select('id', { count: 'exact', head: true })
  const { count: empresasAtivas } = await db.from('empresas').select('id', { count: 'exact', head: true }).eq('ativo', true)
  const { count: totalUsuarios } = await db.from('usuarios').select('id', { count: 'exact', head: true }).not('perfil', 'eq', 'superadmin')
  const { count: totalErros } = await db.from('logs_sistema').select('id', { count: 'exact', head: true }).eq('tipo', 'erro')

  return NextResponse.json({
    data: {
      alerts,
      summary: {
        total_empresas: totalEmpresas || 0,
        empresas_ativas: empresasAtivas || 0,
        total_usuarios: totalUsuarios || 0,
        total_erros_24h: errorCount || 0,
        total_erros_total: totalErros || 0,
        total_alerts: alerts.length,
        criticos: alerts.filter(a => a.tipo === 'critico').length,
        avisos: alerts.filter(a => a.tipo === 'aviso').length,
      },
    },
  })
}
