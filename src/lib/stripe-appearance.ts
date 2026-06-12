/**
 * Stripe Elements appearance helper
 *
 * Stripe Elements run inside an iframe, so they cannot read CSS variables
 * directly (`hsl(var(--primary))` doesn't work). We resolve the template's
 * design tokens from `:root` in the parent document and pass them to Stripe
 * as fully-qualified `hsl(...)` strings.
 *
 * This means any store using this template can change the HSL tokens in
 * `src/index.css` and the Stripe checkout will automatically pick up the new
 * brand colors — no extra config needed.
 *
 * Usage:
 *   <Elements stripe={stripePromise} options={{ ..., appearance: getStripeAppearance() }}>
 */

export function getStripeAppearance() {
  // Safe default for SSR / non-browser contexts.
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { theme: 'stripe' as const }
  }

  const style = getComputedStyle(document.documentElement)
  const read = (name: string) => style.getPropertyValue(name).trim()
  const hsl = (name: string) => {
    const raw = read(name)
    return raw ? `hsl(${raw})` : undefined
  }

  const radius = read('--radius') || '8px'
  const inputBorder = read('--input')
  const ring = read('--ring')
  const border = read('--border')
  const bodyFont = style.fontFamily || 'system-ui, -apple-system, sans-serif'

  return {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: hsl('--primary'),
      colorBackground: hsl('--background'),
      colorText: hsl('--foreground'),
      colorTextSecondary: hsl('--muted-foreground'),
      colorDanger: hsl('--destructive'),
      borderRadius: radius,
      fontSizeBase: '16px',
      fontFamily: bodyFont,
    },
    rules: {
      '.Input': {
        border: inputBorder ? `1px solid hsl(${inputBorder})` : undefined,
        backgroundColor: hsl('--background'),
        color: hsl('--foreground'),
      },
      '.Input:focus': {
        borderColor: ring ? `hsl(${ring})` : undefined,
        boxShadow: ring ? `0 0 0 1px hsl(${ring})` : undefined,
      },
      '.Label': {
        color: hsl('--foreground'),
      },
      '.Tab': {
        border: border ? `1px solid hsl(${border})` : undefined,
        backgroundColor: hsl('--background'),
        color: hsl('--foreground'),
      },
      '.Tab--selected': {
        borderColor: hsl('--primary'),
        color: hsl('--primary'),
      },
      '.Tab:hover': {
        color: hsl('--primary'),
      },
    },
  }
}
