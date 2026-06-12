import CheckoutUI from "@/pages/ui/CheckoutUI"
import { SEO } from "@/components/SEO"

const Checkout = () => {
  return (
    <>
      <SEO title="Pagar" canonicalPath="/pagar" noindex />
      <CheckoutUI />
    </>
  )
}

export default Checkout
