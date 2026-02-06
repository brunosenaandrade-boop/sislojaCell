import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getServiceClient } from '../../superadmin/route-utils'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { logApiError } from '@/lib/server-logger'

// ============================================
// POST /api/auth/criar-usuario
// Criar funcionário/admin com auto-confirmação de email
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
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 requests por minuto por IP
    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'criar-usuario', limit: 10, windowSeconds: 60 })
    if (!rl.success) {
      return NextResponse.json({ error: 'Muitas tentativas. Aguarde um momento.' }, { status: 429 })
    }

    // Verificar autenticação
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const serviceClient = getServiceClient()

    // Verificar se é admin da empresa
    const { data: adminUser } = await serviceClient
      .from('usuarios')
      .select('empresa_id, perfil')
      .eq('auth_id', user.id)
      .single()

    if (!adminUser || (adminUser.perfil !== 'admin' && adminUser.perfil !== 'superadmin')) {
      return NextResponse.json({ error: 'Apenas administradores podem criar usuários' }, { status: 403 })
    }

    const empresaId = adminUser.empresa_id

    // Verificar limite de usuários do plano
    let maxUsuarios = -1
    const { data: empresa } = await serviceClient
      .from('empresas')
      .select('plano')
      .eq('id', empresaId)
      .single()

    if (empresa) {
      const { data: plano } = await serviceClient
        .from('planos')
        .select('max_usuarios')
        .eq('slug', empresa.plano || 'free')
        .single()

      if (plano && plano.max_usuarios !== -1) {
        maxUsuarios = plano.max_usuarios
        const { count } = await serviceClient
          .from('usuarios')
          .select('id', { count: 'exact', head: true })
          .eq('empresa_id', empresaId)
          .eq('ativo', true)

        if ((count || 0) >= plano.max_usuarios) {
          return NextResponse.json(
            { error: `Limite de ${plano.max_usuarios} usuário(s) atingido. Faça upgrade do plano.` },
            { status: 403 }
          )
        }
      }
    }

    const body = await request.json()
    const { nome, email, senha, perfil, telefone } = body as {
      nome: string
      email: string
      senha: string
      perfil: 'admin' | 'funcionario'
      telefone?: string
    }

    if (!nome || !email || !senha || !perfil) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: nome, email, senha, perfil' },
        { status: 400 }
      )
    }

    // Criar usuário no Supabase Auth com auto-confirmação
    const { data: authData, error: authError } =
      await serviceClient.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
      })

    if (authError) {
      if (authError.message.includes('already been registered') || authError.message.includes('already registered')) {
        return NextResponse.json({ error: 'Este email já está cadastrado' }, { status: 409 })
      }
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
    }

    // Inserir na tabela usuarios
    const { data: usuario, error: usuarioError } = await serviceClient
      .from('usuarios')
      .insert({
        auth_id: authData.user.id,
        empresa_id: empresaId,
        nome,
        email,
        telefone: telefone || null,
        perfil,
      })
      .select()
      .single()

    if (usuarioError) {
      // Rollback: apagar usuário auth criado
      await serviceClient.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: usuarioError.message }, { status: 500 })
    }

    // Optimistic lock: re-check user count after insert to handle race condition
    if (maxUsuarios !== -1) {
      const { count: recount } = await serviceClient
        .from('usuarios')
        .select('id', { count: 'exact', head: true })
        .eq('empresa_id', empresaId)
        .eq('ativo', true)

      if ((recount || 0) > maxUsuarios) {
        // Rollback: delete the just-created usuario and auth user
        await serviceClient.from('usuarios').delete().eq('id', usuario.id)
        await serviceClient.auth.admin.deleteUser(authData.user.id)
        return NextResponse.json(
          { error: `Limite de ${maxUsuarios} usuário(s) atingido. Faça upgrade do plano.` },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({ usuario })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    await logApiError('/api/auth/criar-usuario', 'POST', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
