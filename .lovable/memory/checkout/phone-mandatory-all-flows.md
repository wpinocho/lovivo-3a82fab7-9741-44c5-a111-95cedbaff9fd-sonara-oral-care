---
name: Phone mandatory across all checkout flows
description: Shopify-style phone fallback dialog when wallet (typically GPay) doesn't deliver phone, and shared phone-utils
type: feature
---

El teléfono es obligatorio en todos los flujos de checkout. Estrategia Shopify-style: el wallet autocompleta cuando puede, y un fallback dialog se abre solo cuando falta.

## Fuente única de utilidades
`src/lib/phone-utils.ts` exporta `isValidPhone` y `normalizePhoneNumber`. CheckoutAdapter las re-exporta para compat.

## Componente compartido
`src/components/MissingPhoneDialog.tsx` — Dialog de shadcn con input `tel`, validación con `isValidPhone`. Usado por StripePayment y ProductExpressCheckout.

## Comportamiento por flujo
- **/pagar envío manual / Link autollenado**: `AddressElement` con `fields.phone:'always'` + `validation.phone.required:'always'` (sin cambios).
- **/pagar pickup**: input propio "Teléfono de contacto" en CheckoutUI dentro del bloque `usePickup` cuando hay `selectedPickupLocation`. Validado en `validateCheckoutFields` con `isValidPhone(phone)`.
- **/pagar Express Checkout (Apple/GPay/Link)**: `handleExpressCheckoutConfirm` lee `walletBilling?.phone || ev?.phone || phone`. Si no es válido → abre `MissingPhoneDialog` (await Promise) ANTES de llamar `payments-create-intent`. Si el user cancela → toast + abort.
- **PDP Express Checkout (PRB)**: `handlePaymentMethod` lee `ev.payerPhone`. Si no es válido → abre `MissingPhoneDialog` ANTES de `createCheckoutFromCart`. Cancel → `ev.complete('fail')` + toast + abort.

## Patrón Promise + ref
Cada componente mantiene `phoneResolverRef` que captura `{resolve, reject}` de la Promise creada por `requestMissingPhone()`. El submit del dialog llama `resolve(phone)`, el cancel llama `reject()`. Esto permite pausar el handler async hasta que el user responda.

## Por qué no depender solo del wallet
Google Pay reporta `requestPayerPhone:true` como "best effort" — frecuentemente devuelve `payerPhone` vacío incluso cuando se solicita. Apple Pay y Link sí entregan phone confiable. Por eso el dialog solo se ve para el subset minoritario de users de GPay sin teléfono guardado.

## Diagnóstico
StripePayment loggea cada render con `[StripePayment] mount/update { showAddressElement, hasShippingAddress, currentPhone }` para detectar si el `AddressElement` no se monta (caso reportado donde el `PaymentElement` mostraba billing fields como fallback sin phone).
