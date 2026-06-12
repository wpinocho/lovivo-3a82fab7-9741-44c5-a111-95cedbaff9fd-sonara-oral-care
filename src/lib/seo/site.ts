/**
 * Resuelve el origin del sitio para construir URLs canónicas y og:url.
 * Prioridad:
 *   1. VITE_SITE_URL (env var configurable por cada store en Vercel)
 *   2. window.location.origin (runtime, funciona para Helmet)
 *   3. Fallback al dominio del template
 */
export function getSiteOrigin(): string {
  const envUrl = import.meta.env.VITE_SITE_URL as string | undefined
  if (envUrl) return envUrl.replace(/\/$/, '')
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return 'https://template-lovivo-template-pruebas.lovable.app'
}

export function buildCanonical(path: string): string {
  const origin = getSiteOrigin()
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${origin}${clean}`
}
