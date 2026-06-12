import { Helmet } from 'react-helmet-async'
import { buildCanonical } from '@/lib/seo/site'

interface SEOProps {
  /** Título de página (sin sufijo). Se concatena con `| storeName` automáticamente si se pasa storeName. */
  title?: string
  description?: string
  /** Path relativo (ej: "/productos/mi-producto"). */
  canonicalPath?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'product'
  /** Si true, agrega <meta name="robots" content="noindex, nofollow">. Para checkout, carrito, etc. */
  noindex?: boolean
  /** Sufijo de marca opcional para el title. */
  storeName?: string
  /** Uno o varios bloques JSON-LD. */
  jsonLd?: object | object[]
}

export function SEO({
  title,
  description,
  canonicalPath,
  ogImage,
  ogType = 'website',
  noindex = false,
  storeName,
  jsonLd,
}: SEOProps) {
  const fullTitle = title
    ? storeName && !title.includes(storeName)
      ? `${title} | ${storeName}`
      : title
    : storeName

  const canonical = canonicalPath ? buildCanonical(canonicalPath) : undefined
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []

  return (
    <Helmet>
      {fullTitle && <title>{fullTitle}</title>}
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {fullTitle && <meta property="og:title" content={fullTitle} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={ogType} />
      {canonical && <meta property="og:url" content={canonical} />}
      {ogImage && <meta property="og:image" content={ogImage} />}

      {fullTitle && <meta name="twitter:title" content={fullTitle} />}
      {description && <meta name="twitter:description" content={description} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {blocks.map((block, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  )
}
