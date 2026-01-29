import { getClient } from '@/lib/supabase/client'
import type { TipoLog, CategoriaLog } from '@/types/database'

// ============================================
// SERVIÇO DE LOGS
// ============================================

interface LogOptions {
  tipo: TipoLog
  categoria?: CategoriaLog
  mensagem: string
  detalhes?: Record<string, unknown>
  pagina?: string
  acao?: string
}

class Logger {
  private _supabase: ReturnType<typeof getClient> | null = null

  private get supabase() {
    if (!this._supabase) {
      this._supabase = getClient()
    }
    return this._supabase
  }

  private async getContext() {
    // Pega informações do contexto atual
    const pagina = typeof window !== 'undefined' ? window.location.pathname : undefined
    const user_agent = typeof window !== 'undefined' ? navigator.userAgent : undefined

    return { pagina, user_agent }
  }

  async log(options: LogOptions) {
    // Só executa no cliente
    if (typeof window === 'undefined') return

    try {
      const context = await this.getContext()

      const { error } = await this.supabase.from('logs_sistema').insert({
        tipo: options.tipo,
        categoria: options.categoria,
        mensagem: options.mensagem,
        detalhes: options.detalhes,
        pagina: options.pagina || context.pagina,
        acao: options.acao,
        user_agent: context.user_agent,
      })

      if (error) {
        console.error('Erro ao salvar log:', error)
      }
    } catch (err) {
      console.error('Erro no logger:', err)
    }
  }

  // Métodos de conveniência
  async info(mensagem: string, detalhes?: Record<string, unknown>, categoria?: CategoriaLog) {
    await this.log({ tipo: 'info', categoria, mensagem, detalhes })
  }

  async warning(mensagem: string, detalhes?: Record<string, unknown>, categoria?: CategoriaLog) {
    await this.log({ tipo: 'warning', categoria, mensagem, detalhes })
  }

  async error(
    mensagem: string,
    error?: Error | unknown,
    categoria?: CategoriaLog,
    acao?: string
  ) {
    const detalhes: Record<string, unknown> = {}

    if (error instanceof Error) {
      detalhes.error_name = error.name
      detalhes.error_message = error.message
      detalhes.stack_trace = error.stack
    } else if (error) {
      detalhes.error = error
    }

    await this.log({ tipo: 'erro', categoria, mensagem, detalhes, acao })
  }

  async audit(mensagem: string, detalhes?: Record<string, unknown>, acao?: string) {
    await this.log({ tipo: 'audit', categoria: 'sistema', mensagem, detalhes, acao })
  }
}

// Singleton
export const logger = new Logger()

// ============================================
// ERROR BOUNDARY HELPER
// ============================================

export function setupGlobalErrorHandler() {
  if (typeof window === 'undefined') return

  // Captura erros não tratados
  window.onerror = (message, source, lineno, colno, error) => {
    logger.error(`Erro global: ${message}`, error, 'sistema', 'global_error')
  }

  // Captura rejeições de Promise não tratadas
  window.onunhandledrejection = (event) => {
    logger.error(
      `Promise rejeitada: ${event.reason}`,
      event.reason,
      'sistema',
      'unhandled_rejection'
    )
  }
}

// ============================================
// HELPER PARA ERROS DE API
// ============================================

export function logApiError(
  endpoint: string,
  method: string,
  error: unknown,
  requestData?: unknown
) {
  logger.error(`Erro na API: ${method} ${endpoint}`, error, 'sistema', 'api_error')

  // Log adicional em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.error(`[API Error] ${method} ${endpoint}:`, error)
    if (requestData) {
      console.error('Request data:', requestData)
    }
  }
}
