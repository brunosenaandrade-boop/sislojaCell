/**
 * Escapa caracteres especiais do PostgREST para uso seguro em .ilike() e .or()
 * Previne SQL injection via metacaracteres de pattern matching.
 */
export function sanitizeSearch(input: string): string {
  return input
    .slice(0, 200)
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
    .replace(/,/g, '\\,')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}
