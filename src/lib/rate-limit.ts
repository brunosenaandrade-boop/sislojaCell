// ============================================
// RATE LIMITER - In-memory para API routes
// Baseado em sliding window counter
// ============================================

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Limpar entradas expiradas periodicamente
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key)
    }
  }
}, 60_000) // Limpa a cada 1 minuto

interface RateLimitConfig {
  /** Identificador único do rate limiter (ex: 'webhook', 'cadastro') */
  id: string
  /** Número máximo de requisições */
  limit: number
  /** Janela de tempo em segundos */
  windowSeconds: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

/**
 * Verifica rate limit para um identificador (IP, token, etc.)
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = `${config.id}:${identifier}`
  const now = Date.now()
  const windowMs = config.windowSeconds * 1000

  const entry = store.get(key)

  // Se não existe ou expirou, criar nova entrada
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: config.limit - 1, resetAt: now + windowMs }
  }

  // Incrementar contador
  entry.count++

  if (entry.count > config.limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { success: true, remaining: config.limit - entry.count, resetAt: entry.resetAt }
}

/**
 * Extrai IP do request (funciona no Vercel)
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const real = request.headers.get('x-real-ip')
  if (real) return real
  return '127.0.0.1'
}
