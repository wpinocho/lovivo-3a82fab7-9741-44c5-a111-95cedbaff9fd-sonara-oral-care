import { ReactNode, useEffect, useState } from 'react'
import { PageTemplate } from './PageTemplate'
import { SocialLinks } from '@/components/SocialLinks'
import { FloatingCart } from '@/components/FloatingCart'
import { ProfileMenu } from '@/components/ProfileMenu'
import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useCartUISafe } from '@/components/CartProvider'
import { useCart } from '@/contexts/CartContext'
import { useCollections } from '@/hooks/useCollections'
import { ScrollLink } from '@/components/ScrollLink'

/**
 * SONARA — EcommerceTemplate
 * Header sticky con blur, footer oscuro con columnas y métodos de pago.
 */

interface EcommerceTemplateProps {
  children: ReactNode
  pageTitle?: string
  showCart?: boolean
  className?: string
  headerClassName?: string
  footerClassName?: string
  layout?: 'default' | 'full-width' | 'centered'
  hideFloatingCartOnMobile?: boolean
}

export const EcommerceTemplate = ({
  children,
  pageTitle,
  showCart = true,
  className,
  headerClassName,
  footerClassName,
  layout = 'default',
  hideFloatingCartOnMobile = false
}: EcommerceTemplateProps) => {
  const cartUI = useCartUISafe()
  const openCart = cartUI?.openCart ?? (() => {})
  const { getTotalItems } = useCart()
  const totalItems = getTotalItems()
  const { hasCollections } = useCollections()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const header = (
    <div
      className={`py-0 transition-shadow duration-200 ${scrolled ? 'shadow-sonara' : ''} ${headerClassName ?? ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0" aria-label="Sonara — Inicio">
            <img
              src="/logo.png"
              alt="Sonara Oral Care"
              className="h-10 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.insertAdjacentHTML('afterend', `
                  <span style="font-family: Sora, sans-serif; font-size: 20px; font-weight: 700; letter-spacing: -0.03em; color: hsl(213 52% 12%)">SONARA</span>
                `)
              }}
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/products/sonara-one"
              className="text-ink-mid hover:text-ink transition-colors text-sm font-medium"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Sonara One
            </Link>
            <Link
              to="/products/sonara-tabs"
              className="text-ink-mid hover:text-ink transition-colors text-sm font-medium"
            >
              Tabletas
            </Link>
            <ScrollLink
              to="/#products"
              className="text-ink-mid hover:text-ink transition-colors text-sm font-medium"
            >
              Bundle
            </ScrollLink>
            <ScrollLink
              to="/#faq"
              className="text-ink-mid hover:text-ink transition-colors text-sm font-medium"
            >
              FAQ
            </ScrollLink>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <ProfileMenu />

            {showCart && (
              <button
                onClick={openCart}
                className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors"
                aria-label="Ver carrito"
              >
                <ShoppingCart className="h-5 w-5 text-ink" />
                {totalItems > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                    style={{
                      background: 'hsl(175 62% 61%)',
                      color: 'white',
                      fontSize: '11px',
                      fontFamily: 'Sora, sans-serif'
                    }}
                  >
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {pageTitle && (
          <div className="py-6 border-t border-border">
            <h1 className="text-ink font-bold text-2xl" style={{ fontFamily: 'Sora, sans-serif' }}>
              {pageTitle}
            </h1>
          </div>
        )}
      </div>
    </div>
  )

  const footer = (
    <div className={`bg-ink py-16 ${footerClassName ?? ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand column */}
          <div className="md:col-span-1">
            <img
              src="/logo.png"
              alt="Sonara"
              className="h-10 w-auto object-contain mb-4 brightness-0 invert"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.insertAdjacentHTML('afterend', `
                  <span style="font-family: Sora, sans-serif; font-size: 20px; font-weight: 700; color: white; letter-spacing: -0.03em">SONARA</span>
                `)
              }}
            />
            <p className="text-sm mb-5 leading-relaxed" style={{ color: 'hsl(0 0% 100% / 0.65)' }}>
              Limpieza ultrasónica de grado clínico para tu aparato oral. Hecho en México para sonrisas en tratamiento.
            </p>
            <SocialLinks />
          </div>

          {/* Comprar */}
          <div>
            <h4
              className="font-semibold mb-4 text-sm uppercase tracking-widest"
              style={{ fontFamily: 'Sora, sans-serif', color: 'hsl(0 0% 100% / 0.45)', letterSpacing: '0.08em' }}
            >
              Comprar
            </h4>
            <div className="space-y-3">
              {[
                { label: 'Sonara One', to: '/products/sonara-one' },
                { label: 'Sonara Tabs', to: '/products/sonara-tabs' },
                { label: 'Bundle Especial', to: '/#products' },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-sm transition-colors hover:text-white"
                  style={{ color: 'hsl(0 0% 100% / 0.65)' }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Ayuda */}
          <div>
            <h4
              className="font-semibold mb-4 text-sm uppercase tracking-widest"
              style={{ fontFamily: 'Sora, sans-serif', color: 'hsl(0 0% 100% / 0.45)', letterSpacing: '0.08em' }}
            >
              Ayuda
            </h4>
            <div className="space-y-3">
              {[
                { label: 'Preguntas frecuentes', to: '/#faq' },
                { label: 'Envíos y Devoluciones', to: '/envios-y-devoluciones' },
                { label: 'Rastrear pedido', to: '/my-orders' },
                { label: 'Contacto', to: '/blog' },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-sm transition-colors hover:text-white"
                  style={{ color: 'hsl(0 0% 100% / 0.65)' }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4
              className="font-semibold mb-4 text-sm uppercase tracking-widest"
              style={{ fontFamily: 'Sora, sans-serif', color: 'hsl(0 0% 100% / 0.45)', letterSpacing: '0.08em' }}
            >
              Legal
            </h4>
            <div className="space-y-3">
              {[
                { label: 'Términos y Condiciones', to: '/terminos-y-condiciones' },
                { label: 'Aviso de Privacidad', to: '/aviso-de-privacidad' },
                { label: 'Blog', to: '/blog' },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-sm transition-colors hover:text-white"
                  style={{ color: 'hsl(0 0% 100% / 0.65)' }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t mb-8" style={{ borderColor: 'hsl(0 0% 100% / 0.1)' }} />

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm" style={{ color: 'hsl(0 0% 100% / 0.5)' }}>
            © 2026 Sonara®. Hecho en México 🇲🇽 para sonrisas en tratamiento.
          </p>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            {/* Payment method badges */}
            {['VISA', 'MC', 'AMEX', 'MP', 'OXXO'].map((method) => (
              <div
                key={method}
                className="px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{
                  background: 'hsl(0 0% 100% / 0.08)',
                  color: 'hsl(0 0% 100% / 0.7)',
                  border: '1px solid hsl(0 0% 100% / 0.12)',
                  fontFamily: 'Inter, sans-serif',
                  letterSpacing: '0.02em'
                }}
              >
                {method}
              </div>
            ))}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
              style={{
                background: 'hsl(0 0% 100% / 0.08)',
                color: 'hsl(0 0% 100% / 0.7)',
                border: '1px solid hsl(0 0% 100% / 0.12)',
              }}
            >
              🔒 Pagos seguros · SSL
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <PageTemplate
        header={header}
        footer={footer}
        className={className}
        layout={layout}
      >
        {children}
      </PageTemplate>

      {showCart && <FloatingCart hideOnMobile={hideFloatingCartOnMobile} />}
    </>
  )
}