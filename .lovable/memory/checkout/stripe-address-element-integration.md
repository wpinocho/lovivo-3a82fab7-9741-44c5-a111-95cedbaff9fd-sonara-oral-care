---
name: Stripe AddressElement integration
description: Replaced custom address inputs with Stripe AddressElement for shipping, enabling Link autofill
type: feature
---
Phase 2 of Stripe migration: custom address inputs replaced with Stripe `AddressElement`.

## Architecture
- `AddressElement` rendered inside `StripePayment.tsx` (within `<Elements>` provider), between `LinkAuthenticationElement` and `PaymentElement`
- Controlled via `showAddressElement` prop (true when not pickup mode)
- `onAddressChange` callback syncs Stripe address data back to `CheckoutAdapter` state
- `deliveryMethodSlot` prop renders delivery method selection between AddressElement and PaymentElement
- `allowedCountries` prop restricts countries based on `shippingCoverage`

## Country mapping
- `src/lib/country-codes.ts` maps Spanish country names ↔ ISO 3166-1 alpha-2 codes
- Stripe uses ISO codes, backend uses Spanish names — mapping happens in `CheckoutUI.tsx` onAddressChange callback

## AddressElement config
- `mode: 'shipping'`
- `fields.phone: 'always'` with required validation
- `display.name: 'split'` (firstName + lastName)
- Default country: MX

## Validation changes
- Address field validation moved to Stripe (`elements.submit()` catches incomplete AddressElement)
- `validateCheckoutFields` only validates email (for pickup: billing fields), delivery method selection
- Phone validation handled by Stripe AddressElement

## Flow
1. User enters email via LinkAuthenticationElement → Link recognition
2. If Link user: address auto-filled via AddressElement
3. Delivery methods shown between address and payment
4. PaymentElement for payment method selection
5. BillingCheckboxSection for separate billing address
