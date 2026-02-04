import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Sem Supabase configurado, permite apenas rotas públicas
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
    const publicRoutes = ['/login', '/recuperar-senha', '/cadastro', '/alterar-senha']
    const isPublicRoute = publicRoutes.some(route =>
      request.nextUrl.pathname.startsWith(route)
    )
    if (isPublicRoute) {
      return NextResponse.next({ request })
    }
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANTE: Evite escrever qualquer lógica entre createServerClient e
  // supabase.auth.getUser(). Um simples erro pode dificultar muito a depuração
  // de problemas com usuários sendo deslogados aleatoriamente.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // ============================================
  // MODO MANUTENÇÃO
  // ============================================
  if (pathname === '/manutencao') {
    return supabaseResponse
  }

  // ============================================
  // ROTAS PÚBLICAS (sem autenticação)
  // ============================================
  const publicRoutes = ['/login', '/recuperar-senha', '/cadastro', '/alterar-senha', '/precos', '/termos', '/privacidade']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Landing page (/) é pública
  if (pathname === '/') {
    return supabaseResponse
  }

  // API routes públicas (sem autenticação)
  if (
    pathname.startsWith('/api/asaas/webhook') ||
    pathname.startsWith('/api/auth/cadastro') ||
    pathname.startsWith('/api/indicacao') ||
    pathname.startsWith('/api/email/trial-check')
  ) {
    return supabaseResponse
  }

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && pathname === '/login') {
    const db = getServiceClient()
    const { data: usuarioLogin } = await db
      .from('usuarios')
      .select('perfil')
      .eq('auth_id', user.id)
      .single()

    const url = request.nextUrl.clone()
    url.pathname = usuarioLogin?.perfil === 'superadmin' ? '/admin' : '/dashboard'
    return NextResponse.redirect(url)
  }

  // ============================================
  // ROTAS AUTENTICADAS - Verificar assinatura
  // ============================================

  // Rotas que funcionam MESMO com assinatura vencida
  const rotasLivresDeAssinatura = ['/planos', '/configuracoes', '/onboarding', '/indicacoes']
  const isRotaLivre = rotasLivresDeAssinatura.some(route => pathname.startsWith(route))

  // Rotas restritas a superadmin
  const isSuperadminRoute = pathname.startsWith('/admin')

  // Rotas restritas a admin
  const isAdminRoute = pathname.startsWith('/configuracoes')

  if (user && (isAdminRoute || isSuperadminRoute)) {
    const db = getServiceClient()
    const { data: usuario } = await db
      .from('usuarios')
      .select('perfil')
      .eq('auth_id', user.id)
      .single()

    if (isSuperadminRoute) {
      if (!usuario || usuario.perfil !== 'superadmin') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
      // Superadmin não tem restrição de assinatura nem manutenção
      return supabaseResponse
    } else if (isAdminRoute) {
      if (!usuario || (usuario.perfil !== 'admin' && usuario.perfil !== 'superadmin')) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    }
  }

  // ============================================
  // VERIFICAÇÃO MODO MANUTENÇÃO (para não-superadmin)
  // ============================================
  if (user && !isPublicRoute && !isSuperadminRoute && !pathname.startsWith('/api')) {
    try {
      const dbManutencao = getServiceClient()
      const { data: manutencaoConfig } = await dbManutencao
        .from('configuracoes_plataforma')
        .select('valor')
        .eq('chave', 'manutencao')
        .single()

      if (manutencaoConfig?.valor && (manutencaoConfig.valor as Record<string, unknown>).ativo === true) {
        const { data: usuarioCheck } = await dbManutencao
          .from('usuarios')
          .select('perfil')
          .eq('auth_id', user.id)
          .single()

        if (usuarioCheck?.perfil !== 'superadmin') {
          const url = request.nextUrl.clone()
          url.pathname = '/manutencao'
          return NextResponse.redirect(url)
        }
      }
    } catch {
      // Tabela pode não existir ainda, continuar normalmente
    }
  }

  // ============================================
  // 4.1-4.5 VERIFICAÇÃO DE STATUS DA ASSINATURA
  // ============================================
  if (user && !isPublicRoute && !isRotaLivre && !isSuperadminRoute) {
    const dbAssinatura = getServiceClient()
    const { data: usuario } = await dbAssinatura
      .from('usuarios')
      .select('empresa_id, perfil')
      .eq('auth_id', user.id)
      .single()

    // Superadmin nunca é bloqueado
    if (usuario?.perfil === 'superadmin') {
      return supabaseResponse
    }

    if (usuario?.empresa_id) {
      const { data: empresa } = await dbAssinatura
        .from('empresas')
        .select('status_assinatura, trial_fim, meses_bonus, onboarding_completo')
        .eq('id', usuario.empresa_id)
        .single()

      if (empresa) {
        const status = empresa.status_assinatura as string

        // 4.7 - Redirecionar para onboarding se não completou
        if (!empresa.onboarding_completo && !pathname.startsWith('/onboarding')) {
          const url = request.nextUrl.clone()
          url.pathname = '/onboarding'
          return NextResponse.redirect(url)
        }

        // 4.2 - active → acesso normal
        if (status === 'active') {
          return supabaseResponse
        }

        // 4.3 - trial → verificar se expirou
        if (status === 'trial') {
          if (empresa.trial_fim) {
            const trialFim = new Date(empresa.trial_fim)
            if (trialFim > new Date()) {
              // Trial ainda válido
              return supabaseResponse
            }
          }
          // Trial expirado → redirecionar para planos
          const url = request.nextUrl.clone()
          url.pathname = '/planos'
          url.searchParams.set('motivo', 'trial_expirado')
          return NextResponse.redirect(url)
        }

        // 4.4 - suspended, cancelled, overdue, expired → redirecionar para planos
        if (['suspended', 'cancelled', 'overdue', 'expired'].includes(status)) {
          // 4.5 - Se tem meses bônus, não bloqueia (consumido no webhook)
          if ((empresa.meses_bonus || 0) > 0) {
            return supabaseResponse
          }

          const url = request.nextUrl.clone()
          url.pathname = '/planos'
          url.searchParams.set('motivo', status)
          return NextResponse.redirect(url)
        }
      }
    }
  }

  return supabaseResponse
}
