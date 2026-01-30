import { getClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/useStore'

export function getSupabase() {
  return getClient()
}

export function getEmpresaId(): string {
  const empresa = useAuthStore.getState().empresa
  if (!empresa?.id) throw new Error('Empresa não encontrada')
  return empresa.id
}

export function getUsuarioId(): string {
  const usuario = useAuthStore.getState().usuario
  if (!usuario?.id) throw new Error('Usuário não encontrado')
  return usuario.id
}

export interface ServiceResult<T> {
  data: T | null
  error: string | null
}

// Sanitizar input de busca para uso em filtros Supabase
export function sanitizeSearch(input: string): string {
  return input.replace(/[%_\\'"()]/g, '').trim().slice(0, 100)
}

export async function handleQuery<T>(
  fn: () => Promise<{ data: T | null; error: { message: string } | null }>
): Promise<ServiceResult<T>> {
  try {
    const { data, error } = await fn()
    if (error) return { data: null, error: error.message }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}
