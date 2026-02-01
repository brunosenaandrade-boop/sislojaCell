import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getServiceClient } from '../superadmin/route-utils'

// ============================================
// 13.13 - API de Indicações
// GET  /api/indicacao        - dados da indicação da empresa
// POST /api/indicacao        - gerar código de indicação
// GET  /api/indicacao?codigo=REF-XXX - buscar empresa por código (público)
// ============================================

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
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function getEmpresaFromAuth(userId: string) {
  const db = getServiceClient()
  const { data: usuario } = await db
    .from('usuarios')
    .select('empresa_id')
    .eq('auth_id', userId)
    .single()

  if (!usuario?.empresa_id) return null

  const { data: empresa } = await db
    .from('empresas')
    .select('*')
    .eq('id', usuario.empresa_id)
    .single()

  return empresa
}

// GET - Buscar dados de indicação ou buscar empresa por código
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const codigo = searchParams.get('codigo')

    // Busca pública por código (para exibir nome no cadastro)
    if (codigo) {
      const db = getServiceClient()
      const { data: empresa } = await db
        .from('empresas')
        .select('nome, nome_fantasia')
        .eq('codigo_indicacao', codigo)
        .single()

      if (!empresa) {
        return NextResponse.json({ error: 'Código não encontrado' }, { status: 404 })
      }

      return NextResponse.json({
        nome: empresa.nome_fantasia || empresa.nome,
      })
    }

    // Busca autenticada - dados do programa de indicação
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const empresa = await getEmpresaFromAuth(user.id)
    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    const db = getServiceClient()

    // Buscar indicações
    const { data: indicacoes } = await db
      .from('indicacoes')
      .select('*, empresa_indicada:empresas!indicacoes_empresa_indicada_id_fkey(id, nome, nome_fantasia, status_assinatura, created_at)')
      .eq('empresa_origem_id', empresa.id)
      .order('created_at', { ascending: false })

    const lista = indicacoes || []

    return NextResponse.json({
      codigo: empresa.codigo_indicacao || null,
      meses_bonus: empresa.meses_bonus || 0,
      indicacoes: lista,
      resumo: {
        total: lista.length,
        pendentes: lista.filter((i: { status: string }) => i.status === 'pendente').length,
        aguardando: lista.filter((i: { status: string }) => i.status === 'aguardando').length,
        qualificadas: lista.filter((i: { status: string }) => i.status === 'qualificada').length,
        recompensadas: lista.filter((i: { status: string }) => i.status === 'recompensada').length,
        canceladas: lista.filter((i: { status: string }) => i.status === 'cancelada').length,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST - Gerar código de indicação
export async function POST() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const empresa = await getEmpresaFromAuth(user.id)
    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    // 13.28 - Código imutável após gerado
    if (empresa.codigo_indicacao) {
      return NextResponse.json({ codigo: empresa.codigo_indicacao })
    }

    const db = getServiceClient()

    // Gerar código único com retry
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let codigo = ''
    let tentativas = 0
    const MAX_TENTATIVAS = 5

    do {
      let raw = ''
      for (let i = 0; i < 6; i++) {
        raw += chars[Math.floor(Math.random() * chars.length)]
      }
      codigo = `REF-${raw}`

      const { data: existente } = await db
        .from('empresas')
        .select('id')
        .eq('codigo_indicacao', codigo)
        .maybeSingle()

      if (!existente) break
      tentativas++
    } while (tentativas < MAX_TENTATIVAS)

    if (tentativas >= MAX_TENTATIVAS) {
      return NextResponse.json({ error: 'Erro ao gerar código. Tente novamente.' }, { status: 500 })
    }

    // Salvar
    await db
      .from('empresas')
      .update({ codigo_indicacao: codigo })
      .eq('id', empresa.id)

    return NextResponse.json({ codigo })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
