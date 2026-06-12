/**
 * Shared phone validation and normalization helpers.
 * Single source of truth for phone logic across:
 *  - CheckoutAdapter (form state)
 *  - StripePayment (express checkout fallback)
 *  - ProductExpressCheckout (PDP wallet fallback)
 *  - MissingPhoneDialog
 */

/** Returns true if the input has between 7 and 15 digits (E.164 range). */
export function isValidPhone(phoneValue: string | null | undefined): boolean {
  if (!phoneValue || !phoneValue.trim()) return false;
  const digitsOnly = phoneValue.replace(/[^\d]/g, "");
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

/**
 * Normalize a phone number to E.164-ish format.
 * - If the value already starts with '+', keeps the country code from the input.
 * - Otherwise, prefixes '+52' (Mexico) by default.
 * Returns null if the phone is not valid.
 */
export function normalizePhoneNumber(phoneValue: string | null | undefined): string | null {
  if (!phoneValue || !isValidPhone(phoneValue)) return null;
  if (phoneValue.trim().startsWith("+")) {
    return "+" + phoneValue.replace(/\D/g, "");
  }
  const digits = phoneValue.replace(/\D/g, "");
  return `+52${digits}`;
}
