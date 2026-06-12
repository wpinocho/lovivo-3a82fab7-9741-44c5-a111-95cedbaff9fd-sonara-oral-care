---
name: PDP Payment Request Button
description: PDP usa PRB legacy mostrando 1 solo botón, filtrando Link para que solo aparezca con wallet REAL autenticado (Apple Pay / Google Pay)
type: feature
---

En la página de producto (PDP), el componente `ProductExpressCheckout.tsx` usa el `PaymentRequestButton` legacy de Stripe (no el `ExpressCheckoutElement` moderno) para mostrar 1 solo botón de express checkout.

**Filtro crítico:** El botón se monta SOLO si `canMakePayment()` devuelve `applePay: true` o `googlePay: true`. Si solo hay `link: true`, el botón se oculta. Razón: Stripe reporta Link como wallet disponible incluso en incógnito o sin sesión (porque permite guest checkout con email+tarjeta on-the-fly), lo cual es ruido visual en PDP y diluye el CTA principal.

Trade-off aceptado: users con Link logueado no verán el botón Link en PDP, pero lo verán como opción explícita en `/pagar` (que usa el ExpressCheckoutElement moderno con todos los wallets visibles).

Resultado:
- Chrome + GPay con tarjeta → botón GPay ✅
- Safari + Apple Pay → botón Apple Pay ✅
- Chrome sin wallets reales / incógnito → no se muestra nada ✅
