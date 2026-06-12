import type { Product, Bundle, Blog } from '@/lib/supabase'
import { buildCanonical } from './site'

/** Limpia HTML y trunca para descripciones meta. */
export function plainText(input?: string, maxLen = 300): string {
  if (!input) return ''
  const stripped = input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  if (stripped.length <= maxLen) return stripped
  return stripped.slice(0, maxLen - 1).trimEnd() + '…'
}

export function organizationJsonLd(storeName: string, socialLinks?: any) {
  const sameAs: string[] = []
  if (socialLinks && typeof socialLinks === 'object') {
    Object.values(socialLinks).forEach((v) => {
      if (typeof v === 'string' && v.startsWith('http')) sameAs.push(v)
    })
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: storeName,
    url: buildCanonical('/'),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  }
}

export function websiteJsonLd(storeName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: storeName,
    url: buildCanonical('/'),
  }
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: buildCanonical(it.path),
    })),
  }
}

export function productJsonLd(product: Product, opts: {
  storeName: string
  currencyCode: string
  inStock: boolean
  price: number
}) {
  const url = buildCanonical(`/productos/${product.slug}`)
  const variants = (product as any).variants as any[] | undefined
  const hasVariants = Array.isArray(variants) && variants.length > 0

  const offers = hasVariants
    ? {
        '@type': 'AggregateOffer',
        priceCurrency: opts.currencyCode,
        lowPrice: Math.min(...variants!.map((v) => v.price ?? product.price)),
        highPrice: Math.max(...variants!.map((v) => v.price ?? product.price)),
        offerCount: variants!.length,
        availability: opts.inStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        url,
      }
    : {
        '@type': 'Offer',
        priceCurrency: opts.currencyCode,
        price: opts.price,
        availability: opts.inStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        url,
      }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: plainText(product.description, 500),
    image: product.images && product.images.length > 0 ? product.images : undefined,
    sku: product.id,
    brand: { '@type': 'Brand', name: opts.storeName },
    offers,
  }
}

export function bundleJsonLd(bundle: Bundle, opts: {
  storeName: string
  currencyCode: string
}) {
  const url = buildCanonical(`/paquete/${bundle.slug}`)
  const price = bundle.bundle_price ?? bundle.compare_at_price ?? 0
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: bundle.title,
    description: plainText(bundle.description, 500),
    image: bundle.images && bundle.images.length > 0 ? bundle.images : undefined,
    sku: bundle.id,
    brand: { '@type': 'Brand', name: opts.storeName },
    offers: {
      '@type': 'Offer',
      priceCurrency: opts.currencyCode,
      price,
      availability: 'https://schema.org/InStock',
      url,
    },
  }
}

export function articleJsonLd(post: Blog, storeName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: plainText(post.excerpt || post.content, 300),
    image: post.featured_image && post.featured_image.length > 0 ? post.featured_image : undefined,
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: { '@type': 'Organization', name: storeName },
    publisher: { '@type': 'Organization', name: storeName },
    mainEntityOfPage: buildCanonical(`/blog/${post.slug}`),
  }
}
