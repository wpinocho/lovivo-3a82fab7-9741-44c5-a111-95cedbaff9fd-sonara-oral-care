# Store Plan — SONARA Oral Care
<!-- Auto-maintained by Lovivo AI. READ THIS FIRST. UPDATE IT LAST. -->

## 1. Brand & Context
- Brand name: SONARA / Sonara Oral Care
- Product / category: Cuidado de aparatos orales — tecnología ultrasónica DTC
- Target audience: Personas con Invisalign, retenedores, guardas de bruxismo y dentaduras, 22-40 años, México, tráfico principal desde Meta Ads mobile
- Market / region: México — precios MXN, envíos nacionales 2-5 días hábiles
- Tone & voice: Tuteo, limpio y directo, científico pero cálido, sin anglicismos forzados. Como Apple + clínica dental boutique.
- Key positioning bullets:
  - Producto estrella: Sonara One — limpiador ultrasónico 42,000 Hz, $1,099 MXN (vs $1,499 MSRP)
  - Producto secundario: Sonara Tabs — 60 tabletas efervescentes, $299 MXN (para recurrencia)
  - Bundle: Sonara One + Tabs $1,249 (preseleccionado en PDP y homepage como "Mejor valor")
  - Garantía 30 días, envío gratis, Mercado Pago / OXXO / tarjetas / MSI
  - IDs de productos: Sonara One = 38b5ab37-97ba-4860-93e4-bf669c46202e, Tabs = 803d8a8d-a1e8-45c1-8b6c-6ed0b6fc524d
  - Colección: Sonara Oral Care = 6921db8a-bf33-4c31-a28c-d4796451c8a4

## 2. Design System
- Fonts: Sora 600-700 (headings, display, precios), Inter 400/500 (body, UI)
- Colors HSL:
  - --ink: 213 52% 12% → #0F1C2E (texto principal, fondos oscuros, botones CTA)
  - --ink-mid: 210 17% 44% → #5A6B7E (texto secundario)
  - --blue-primary: 217 91% 51% → #0E63F4 (links, hover CTA)
  - --aqua: 175 62% 61% → #5FD4C4 (acento fresco, iconos, highlights, botón bundle)
  - --gold-star: 42 100% 50% → #FFB800 (estrellas reviews)
  - --background: 60 20% 98% → #FAFAF8 (bone white)
  - --ice-blue: 212 100% 95% → #EAF3FF (secciones alternas)
  - --mint-pale: 162 67% 96% → #F2FBF9 (comparativa, newsletter)
- Border radius: card=22px, card-lg=28px, pill=100px
- Botones CTA: pill, bg ink → hover a blue-primary con sombra azul
- Sombras: muy suaves y difusas (.shadow-sonara, .shadow-sonara-md, .shadow-sonara-lg)
- Utility classes custom: .btn-sonara-primary, .btn-sonara-secondary, .btn-sonara-white, .btn-sonara-aqua, .card-sonara, .card-sonara-elevated, .badge-sonara, .bg-bone, .bg-ice-blue, .bg-mint-pale, .bg-ink
- Animaciones: .scroll-reveal + .revealed (IntersectionObserver), .stagger-1/2/3/4

## 3. Active Plan
### Homepage MVP completado — 2026-06-12
- Why: Primera versión de la tienda para lanzar DTC en México
- Status: done
- Next step: Construir PDP Sonara One con galería + sticky buy panel + secciones debajo del fold
- Files involved: src/pages/ui/IndexUI.tsx (homepage), src/templates/EcommerceTemplate.tsx, src/index.css, tailwind.config.ts

## 4. Recent Changes
- 2026-06-12 — Sistema de diseño completo Sonara (index.css + tailwind.config.ts)
- 2026-06-12 — Homepage con 12 secciones: hero, trust strip, problema, cómo funciona, productos, comparativa, especialistas, reviews, recurrencia, FAQ, newsletter
- 2026-06-12 — EcommerceTemplate.tsx: header sticky con blur, footer oscuro con columnas Comprar/Ayuda/Legal + métodos de pago
- 2026-06-12 — BrandLogoLeft.tsx actualizado para Sonara
- 2026-06-12 — Logo SONARA generado (/logo.png) con ícono ultrasónico/sonrisa
- 2026-06-12 — 6 imágenes generadas: hero-device, bubbles-macro, before-after-water, lifestyle-woman, device-colors, sonara-tabs
- 2026-06-12 — Productos creados en DB: Sonara One (con variantes Blanco Ártico / Negro Grafito), Sonara Tabs
- 2026-06-12 — Colección "Sonara Oral Care" creada con ambos productos
- 2026-06-12 — Google Fonts: Sora añadida al index.html

## 5. Image Inventory
- /hero-device.webp — Sonara One en baño minimalista (hero homepage + PDP)
- /bubbles-macro.webp — macro cavitación ultrasónica (sección cómo funciona)
- /before-after-water.webp — agua turbia vs. limpia (sección problema)
- /lifestyle-woman.webp — mujer latina con alineador + dispositivo (lifestyle PDP)
- /device-colors.webp — Blanco Ártico + Negro Grafito en mármol (bundle card)
- /sonara-tabs.webp — tabletas efervescentes + packaging (sección recurrencia + PDP Tabs)
- /logo.png — Wordmark SONARA con ícono ultrasónico (header + footer)

## 6. Known Issues
- 2026-06-12 — Testimonios de especialistas y reviews de clientes son placeholders [PENDIENTE: reemplazar con contenido real]
- 2026-06-12 — Bundle no está creado como producto real en DB (se enlaza a PDP de Sonara One como workaround). Pendiente crear bundle real con ecommerce--create-bundle.
- 2026-06-12 — Variants de Sonara One tienen compare_at_price en el campo options (bug menor de la plataforma). Sin impacto visual.

## 7. Pending / Future Sessions
- [high] PDP Sonara One: galería 5 imágenes con swiper, panel sticky con selección de color + bundle preseleccionado, sección cómo funciona, comparativa, reviews, FAQ, cross-sell Tabs
- [high] PDP Sonara Tabs: página simple con descripción completa y CTA
- [med] Bundle real en DB con precio especial y ambos productos
- [med] Suscripción mensual Sonara Tabs (selling plan con 15% descuento)
- [med] Páginas: FAQ independiente, Sobre Sonara, Envíos y Devoluciones
- [low] Animaciones de scroll más elaboradas y micro-interacciones
- [low] Video hero loop de burbujas ultrasónicas (generar con videogen)
- [low] Internacionalización: agregar variante USD para mercado USA eventual