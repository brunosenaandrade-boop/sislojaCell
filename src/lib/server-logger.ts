import { createClient } from '@supabase/supabase-js'

// ============================================
// SERVER-SIDE LOGGER
// Grava logs diretamente no banco via service role
// Usar APENAS em API routes (server-side)
// ============================================

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface ServerLogOptions {
  tipo: 'erro' | 'warning' | 'info' | 'audit'
  categoria?: 'auth' | 'venda' | 'os' | 'estoque' | 'sistema' | 'impersonacao'
  mensagem: string
  detalhes?: Record<string, unknown>
  pagina?: string
  acao?: string
  empresa_id?: string | null
  usuario_id?: string | null
  ip?: string | null
  user_agent?: string | null
}

async function log(options: ServerLogOptions) {
  try {
    const db = getDb()
    await db.from('logs_sistema').insert({
      tipo: options.tipo,
      categoria: options.categoria || 'sistema',
      mensagem: options.mensagem,
      detalhes: options.detalhes || null,
      pagina: options.pagina,
      acao: options.acao,
      empresa_id: options.empresa_id || null,
      usuario_id: options.usuario_id || null,
      ip: options.ip || null,
      user_agent: options.user_agent || null,
    })
  } catch {
    // Fallback: ao menos console.error para Vercel logs
    console.error('[ServerLogger] Falha ao gravar log:', options.mensagem)
  }
}

/** Log de erro de API route */
export async function logApiError(
  endpoint: string,
  method: string,
  err: unknown,
  extra?: {
    empresa_id?: string | null
    usuario_id?: string | null
    ip?: string | null
    user_agent?: string | null
    body?: unknown
  }
) {
  const isError = err instanceof Error
  const mensagem = `[${method}] ${endpoint} — ${isError ? err.message : String(err)}`

  const detalhes: Record<string, unknown> = {
    endpoint,
    method,
    error_message: isError ? err.message : String(err),
  }

  if (isError && err.stack) {
    detalhes.stack_trace = err.stack
  }

  if (extra?.body) {
    // Sanitizar body — remover senhas/tokens
    const sanitized = { ...extra.body as Record<string, unknown> }
    for (const key of ['senha', 'password', 'token', 'secret', 'apiKey', 'api_key']) {
      if (key in sanitized) sanitized[key] = '[REDACTED]'
    }
    detalhes.request_body = sanitized
  }

  // Console para Vercel runtime logs
  console.error(`[API ERROR] ${mensagem}`)

  await log({
    tipo: 'erro',
    categoria: 'sistema',
    mensagem,
    detalhes,
    pagina: endpoint,
    acao: `${method} ${endpoint}`,
    empresa_id: extra?.empresa_id,
    usuario_id: extra?.usuario_id,
    ip: extra?.ip,
    user_agent: extra?.user_agent,
  })
}

/** Log de info genérico server-side */
export async function logInfo(
  mensagem: string,
  detalhes?: Record<string, unknown>,
  extra?: { empresa_id?: string | null; usuario_id?: string | null; categoria?: ServerLogOptions['categoria'] }
) {
  await log({
    tipo: 'info',
    categoria: extra?.categoria || 'sistema',
    mensagem,
    detalhes,
    empresa_id: extra?.empresa_id,
    usuario_id: extra?.usuario_id,
  })
}

/** Log de warning server-side */
export async function logWarning(
  mensagem: string,
  detalhes?: Record<string, unknown>,
  extra?: { empresa_id?: string | null; usuario_id?: string | null }
) {
  await log({
    tipo: 'warning',
    categoria: 'sistema',
    mensagem,
    detalhes,
    empresa_id: extra?.empresa_id,
    usuario_id: extra?.usuario_id,
  })
}

/** Log de audit server-side */
export async function logAudit(
  mensagem: string,
  detalhes?: Record<string, unknown>,
  extra?: { empresa_id?: string | null; usuario_id?: string | null; categoria?: ServerLogOptions['categoria'] }
) {
  await log({
    tipo: 'audit',
    categoria: extra?.categoria || 'sistema',
    mensagem,
    detalhes,
    empresa_id: extra?.empresa_id,
    usuario_id: extra?.usuario_id,
  })
}

export const serverLogger = { log, logApiError, logInfo, logWarning, logAudit }
