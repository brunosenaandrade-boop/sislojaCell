import { useState, useEffect, useCallback } from 'react'

interface UseQueryResult<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: string | null }>,
  deps: unknown[] = []
): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const result = await queryFn()
    setData(result.data)
    setError(result.error)
    setIsLoading(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}
