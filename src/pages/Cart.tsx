import { HeadlessCart } from "@/components/headless/HeadlessCart"
import { CartUI } from "@/pages/ui/CartUI"
import { SEO } from "@/components/SEO"

export default function Cart() {
  return (
    <>
      <SEO title="Carrito" canonicalPath="/carrito" noindex />
      <HeadlessCart>
        {(logic) => <CartUI logic={logic} />}
      </HeadlessCart>
    </>
  )
}
