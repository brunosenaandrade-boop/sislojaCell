import { NextRequest, NextResponse } from 'next/server'
import { verifySuperadmin, getServiceClient } from '../route-utils'

// PATCH - Estender trial ou alterar plano de uma empresa
export async function PATCH(request: NextRequest) {
  const auth = await verifySuperadmin()
  if ('error' in auth) return auth.error

  const body = await request.json()
  const { empresa_id, acao, valor } = body as {
    empresa_id: string
    acao: 'estender_trial' | 'alterar_plano' | 'adicionar_bonus'
    valor: string | number
  }

  if (!empresa_id || !acao) {
    return NextResponse.json({ error: 'empresa_id e acao são obrigatórios' }, { status: 400 })
  }

  const db = getServiceClient()

  if (acao === 'estender_trial') {
    const dias = Number(valor) || 7
    const { data: empresa } = await db
      .from('empresas')
      .select('trial_fim, status_assinatura')
      .eq('id', empresa_id)
      .single()

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    // Calcula nova data de fim (a partir de agora ou do trial_fim existente)
    const base = empresa.trial_fim && new Date(empresa.trial_fim) > new Date()
      ? new Date(empresa.trial_fim)
      : new Date()
    base.setDate(base.getDate() + dias)

    await db
      .from('empresas')
      .update({
        trial_fim: base.toISOString(),
        status_assinatura: 'trial',
      })
      .eq('id', empresa_id)

    return NextResponse.json({
      success: true,
      message: `Trial estendido em ${dias} dias (até ${base.toLocaleDateString('pt-BR')})`,
    })
  }

  if (acao === 'alterar_plano') {
    const planoSlug = String(valor)
    const { data: plano } = await db
      .from('planos')
      .select('slug')
      .eq('slug', planoSlug)
      .single()

    if (!plano) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 })
    }

    await db
      .from('empresas')
      .update({ plano: planoSlug })
      .eq('id', empresa_id)

    return NextResponse.json({
      success: true,
      message: `Plano alterado para ${planoSlug}`,
    })
  }

  if (acao === 'adicionar_bonus') {
    const meses = Number(valor) || 1

    const { data: empresa } = await db
      .from('empresas')
      .select('meses_bonus')
      .eq('id', empresa_id)
      .single()

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    await db
      .from('empresas')
      .update({ meses_bonus: (empresa.meses_bonus || 0) + meses })
      .eq('id', empresa_id)

    return NextResponse.json({
      success: true,
      message: `${meses} mês(es) bônus adicionado(s)`,
    })
  }

  return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
}
