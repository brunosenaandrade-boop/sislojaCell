import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórias'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}

// Cliente singleton para uso no lado do cliente
let client: ReturnType<typeof createClient> | null = null

export function getClient() {
  // Não cria cliente no servidor durante o build
  if (typeof window === 'undefined') {
    // No servidor, sempre cria um novo cliente (não usa singleton)
    // Isso evita problemas durante o build
    return createClient()
  }

  // No cliente, usa singleton
  if (!client) {
    client = createClient()
  }
  return client
}
