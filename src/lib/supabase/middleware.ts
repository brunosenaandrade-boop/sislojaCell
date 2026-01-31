import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/login', '/recuperar-senha', '/cadastro', '/alterar-senha']
  const isPublicRoute = publicRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (!user && !isPublicRoute) {
    // Usuário não autenticado tentando acessar rota protegida
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && request.nextUrl.pathname === '/login') {
    // Usuário autenticado tentando acessar login, redireciona para dashboard
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Rotas restritas a administradores
  const adminRoutes = ['/configuracoes']
  const isAdminRoute = adminRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (user && isAdminRoute) {
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('perfil')
      .eq('auth_id', user.id)
      .single()

    if (!usuario || usuario.perfil !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // IMPORTANTE: Você *deve* retornar o objeto supabaseResponse como está.
  // Se você está criando um novo objeto de resposta com NextResponse.next(),
  // certifique-se de:
  // 1. Passar o request nele, como: NextResponse.next({ request })
  // 2. Copiar os cookies, como: supabaseResponse.cookies.getAll().forEach(...)

  return supabaseResponse
}
