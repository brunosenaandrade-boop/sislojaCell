import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export function createClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórias')
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}

// Cliente singleton para uso no lado do cliente
let client: ReturnType<typeof createBrowserClient> | null = null

export function getClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórias')
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
