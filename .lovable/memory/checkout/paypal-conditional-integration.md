---
name: PayPal conditional integration in /pagar
description: PaypalExpressButton renders only when paypal_accounts_safe has active row; mounted via paypalSlot prop on StripePayment
type: feature
---

PayPal aparece en `/pagar` SOLO si el store tiene una cuenta activa en `paypal_accounts` (Lovivo).

## Fuente del flag
`SettingsContext` consulta la vista `paypal_accounts_safe` (`store_id`, `status='active'`) con `useQuery` separado y expone:
- `paypalEnabled: boolean` (`status==='active' && client_id`)
- `paypalClientId: string | null`
- `paypalEnvironment: 'sandbox' | 'live' | null`

## Componente
`src/components/PaypalExpressButton.tsx` — usa `@paypal/react-paypal-js`. Retorna `null` si `!paypalEnabled` o falta `checkoutToken`. `PayPalScriptProvider` se monta con `key={`${clientId}-${currency}`}` para forzar reload del SDK al cambiar moneda. Opciones: `intent:'capture'`, `enable-funding:'venmo,paylater'`, `components:'buttons'`, `data-environment`.

## Backend
Solo invoca edge functions vía `callEdge`:
- `paypal-create-order` → devuelve `{ id }` (PayPal order id)
- `paypal-capture-order` → devuelve `{ order }` ya persistido en DB
Tras capture: `localStorage.setItem('completed_order', ...)`, `clearCart()`, `navigate('/gracias/:id')`.

## Montaje
`StripePayment` expone `paypalSlot?: React.ReactNode` que se renderiza justo debajo del `<ExpressCheckoutElement>` (dentro del bloque `!linkAuthenticated`). `CheckoutUI` pasa `<PaypalExpressButton .../>` ahí. El botón vive como hermano del ExpressCheckoutElement; `<Elements>` no afecta porque no usa hooks de Stripe.

## Por qué slot y no embebido
Mantiene PayPal fuera de la dependencia de Stripe (no requiere `Elements`) y permite a `CheckoutUI` controlar el payload (`amount`, `items`, `shipping`) sin duplicar lógica.
