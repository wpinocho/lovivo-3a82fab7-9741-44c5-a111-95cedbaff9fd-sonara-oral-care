/**
 * Genera public/sitemap.xml en build/dev.
 * Lee STORE_ID de src/lib/config.ts y consulta Supabase para productos, bundles y blogs.
 *
 * BASE_URL se resuelve desde la env var SITE_URL (configurada en cada Vercel store).
 * Si no existe, usa el dominio del template como fallback.
 */
import { writeFileSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const SITE_URL =
  process.env.SITE_URL ||
  process.env.VITE_SITE_URL ||
  'https://template-lovivo-template-pruebas.lovable.app'

const BASE_URL = SITE_URL.replace(/\/$/, '')

// --- Leer STORE_ID desde src/lib/config.ts ---
function getStoreId(): string {
  const configPath = resolve('src/lib/config.ts')
  const content = readFileSync(configPath, 'utf-8')
  const match = content.match(/STORE_ID\s*=\s*["']([^"']+)["']/)
  if (!match) throw new Error('No se pudo leer STORE_ID de src/lib/config.ts')
  return match[1]
}

// --- Cliente Supabase (usa anon key embebida en src/lib/supabase.ts) ---
const SUPABASE_URL = 'https://ptgmltivisbtvmoxwnhd.supabase.co'
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Z21sdGl2aXNidHZtb3h3bmhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNzA2MzUsImV4cCI6MjA2Nzg0NjYzNX0.uU-Zh7AthPiJKmw1_oUnh8tLmCpmt0-M-y5Kd8_Fc34'

interface SitemapEntry {
  path: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: string
}

async function buildEntries(): Promise<SitemapEntry[]> {
  const storeId = getStoreId()
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  const entries: SitemapEntry[] = [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/blog', changefreq: 'weekly', priority: '0.6' },
    { path: '/terminos-y-condiciones', changefreq: 'yearly', priority: '0.3' },
    { path: '/aviso-de-privacidad', changefreq: 'yearly', priority: '0.3' },
  ]

  // Productos activos
  try {
    const { data: products } = await supabase
      .from('products')
      .select('slug, updated_at, created_at')
      .eq('store_id', storeId)
      .eq('status', 'active')
    if (products) {
      for (const p of products) {
        if (!p.slug) continue
        entries.push({
          path: `/productos/${p.slug}`,
          lastmod: (p as any).updated_at || (p as any).created_at,
          changefreq: 'weekly',
          priority: '0.8',
        })
      }
    }
  } catch (e) {
    console.warn('[sitemap] No se pudieron cargar productos:', (e as Error).message)
  }

  // Bundles activos
  try {
    const { data: bundles } = await supabase
      .from('bundles')
      .select('slug, created_at')
      .eq('store_id', storeId)
      .eq('status', 'active')
    if (bundles) {
      for (const b of bundles) {
        if (!b.slug) continue
        entries.push({
          path: `/paquete/${b.slug}`,
          lastmod: (b as any).created_at,
          changefreq: 'weekly',
          priority: '0.7',
        })
      }
    }
  } catch (e) {
    console.warn('[sitemap] No se pudieron cargar bundles:', (e as Error).message)
  }

  // Posts del blog (template usa array estático, pero dejamos hook para DB futura)
  try {
    const blogModule = await import('../src/data/blogPosts.ts')
    const posts = (blogModule as any).blogPosts as Array<any>
    if (Array.isArray(posts)) {
      for (const post of posts) {
        if (post.status !== 'published' || !post.slug) continue
        entries.push({
          path: `/blog/${post.slug}`,
          lastmod: post.updated_at || post.created_at,
          changefreq: 'monthly',
          priority: '0.5',
        })
      }
    }
  } catch (e) {
    console.warn('[sitemap] No se pudieron cargar blog posts:', (e as Error).message)
  }

  return entries
}

function renderSitemap(entries: SitemapEntry[]): string {
  const urls = entries.map((e) =>
    [
      '  <url>',
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${new Date(e.lastmod).toISOString()}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      '  </url>',
    ]
      .filter(Boolean)
      .join('\n'),
  )

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n')
}

function renderLlmsTxt(entries: SitemapEntry[], storeId: string): string {
  const products = entries.filter((e) => e.path.startsWith('/productos/'))
  const bundles = entries.filter((e) => e.path.startsWith('/paquete/'))
  const blog = entries.filter((e) => e.path.startsWith('/blog/'))

  const lines = [
    `# ${BASE_URL}`,
    '',
    'Tienda online. Este archivo ayuda a modelos de lenguaje (LLMs) a indexar y entender el contenido del sitio.',
    '',
    '## Páginas principales',
    `- [Inicio](${BASE_URL}/)`,
    `- [Blog](${BASE_URL}/blog)`,
    `- [Términos y Condiciones](${BASE_URL}/terminos-y-condiciones)`,
    `- [Aviso de Privacidad](${BASE_URL}/aviso-de-privacidad)`,
    '',
  ]

  if (products.length > 0) {
    lines.push(`## Productos (${products.length})`)
    for (const p of products.slice(0, 200)) {
      const name = p.path.replace('/productos/', '').replace(/-/g, ' ')
      lines.push(`- [${name}](${BASE_URL}${p.path})`)
    }
    lines.push('')
  }

  if (bundles.length > 0) {
    lines.push(`## Paquetes (${bundles.length})`)
    for (const b of bundles) {
      const name = b.path.replace('/paquete/', '').replace(/-/g, ' ')
      lines.push(`- [${name}](${BASE_URL}${b.path})`)
    }
    lines.push('')
  }

  if (blog.length > 0) {
    lines.push(`## Blog (${blog.length})`)
    for (const post of blog) {
      const name = post.path.replace('/blog/', '').replace(/-/g, ' ')
      lines.push(`- [${name}](${BASE_URL}${post.path})`)
    }
    lines.push('')
  }

  lines.push(`## Sitemap`)
  lines.push(`- [sitemap.xml](${BASE_URL}/sitemap.xml)`)
  lines.push('')
  return lines.join('\n')
}

async function main() {
  const entries = await buildEntries()
  const sitemap = renderSitemap(entries)
  writeFileSync(resolve('public/sitemap.xml'), sitemap)
  console.log(`[sitemap] sitemap.xml escrito (${entries.length} entradas) — ${BASE_URL}`)

  const llmsTxt = renderLlmsTxt(entries, getStoreId())
  writeFileSync(resolve('public/llms.txt'), llmsTxt)
  console.log(`[sitemap] llms.txt escrito`)
}

main().catch((err) => {
  console.error('[sitemap] Error generando sitemap:', err)
  // No fallar el build: dejar un sitemap mínimo si algo falla
  try {
    writeFileSync(
      resolve('public/sitemap.xml'),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${BASE_URL}/</loc></url>\n</urlset>\n`,
    )
  } catch {}
  process.exit(0)
})
