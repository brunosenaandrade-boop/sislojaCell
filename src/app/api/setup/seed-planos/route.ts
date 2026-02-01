import { NextResponse } from 'next/server'
import { verifySuperadmin, getServiceClient } from '../../superadmin/route-utils'

// ============================================
// POST /api/setup/seed-planos
// Seed/atualizar planos no banco (superadmin only)
// ============================================

export async function POST() {
  try {
    const auth = await verifySuperadmin()
    if ('error' in auth) return auth.error

    const serviceClient = getServiceClient()

    // Upsert plano free (trial)
    const { error: errFree } = await serviceClient
      .from('planos')
      .upsert(
        {
          nome: 'Grátis',
          slug: 'free',
          descricao: 'Trial de 7 dias para testar o sistema. Funcionalidades básicas com limites.',
          preco_mensal: 0,
          preco_anual: 0,
          max_usuarios: 1,
          max_produtos: 50,
          max_os_mes: 30,
          max_vendas_mes: 30,
          features: {
            pdv: true, os: true, estoque: true, caixa: true,
            relatorios: false, backup: false, suporte: 'email', indicacoes: false,
          },
          destaque: false,
          ativo: true,
          ordem: 0,
        },
        { onConflict: 'slug' }
      )

    // Upsert plano anual
    const { error: errAnual } = await serviceClient
      .from('planos')
      .upsert(
        {
          nome: 'Plano Anual',
          slug: 'anual',
          descricao: 'Licença completa com tudo ilimitado. 12x de R$ 150/mês.',
          preco_mensal: 150.0,
          preco_anual: 1800.0,
          max_usuarios: -1,
          max_produtos: -1,
          max_os_mes: -1,
          max_vendas_mes: -1,
          features: {
            pdv: true, os: true, estoque: true, caixa: true,
            relatorios: true, backup: true, suporte: 'prioritario', indicacoes: true,
          },
          destaque: true,
          ativo: true,
          ordem: 1,
        },
        { onConflict: 'slug' }
      )

    if (errFree || errAnual) {
      return NextResponse.json(
        { error: errFree?.message || errAnual?.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Planos seed concluído: free + anual',
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
