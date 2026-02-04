import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function verifySuperadmin(): Promise<
  { authUserId: string } | { error: NextResponse }
> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // read-only in route handlers
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }) }
  }

  const serviceClient = getServiceClient()
  const { data: usuario } = await serviceClient
    .from('usuarios')
    .select('perfil')
    .eq('auth_id', user.id)
    .single()

  if (!usuario || usuario.perfil !== 'superadmin') {
    return { error: NextResponse.json({ error: 'Acesso negado' }, { status: 403 }) }
  }

  return { authUserId: user.id }
}
