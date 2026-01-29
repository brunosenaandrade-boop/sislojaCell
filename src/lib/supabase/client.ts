import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export function createClient() {
  if (!supabaseUrl || !supabaseKey) {
    // Durante o build ou sem env vars, retorna null
    return null as unknown as ReturnType<typeof createBrowserClient>
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}

// Cliente singleton para uso no lado do cliente
let client: ReturnType<typeof createBrowserClient> | null = null

export function getClient() {
  if (!supabaseUrl || !supabaseKey) {
    return null as unknown as ReturnType<typeof createBrowserClient>
  }

  // No servidor, sempre cria um novo
  if (typeof window === 'undefined') {
    return createClient()
  }

  // No cliente, usa singleton
  if (!client) {
    client = createClient()
  }
  return client
}
