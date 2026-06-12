import { PayPalProvider, PayPalOneTimePaymentButton } from "@paypal/react-paypal-js/sdk-v6"
import { useNavigate } from "react-router-dom"
import { callEdge } from "@/lib/edge"
import { STORE_ID } from "@/lib/config"
import { useSettings } from "@/contexts/SettingsContext"
import { useCart } from "@/contexts/CartContext"
import { useToast } from "@/hooks/use-toast"

interface PaypalExpressButtonProps {
  /** Order amount in major units (e.g. 49.00, NOT cents). */
  amount: number
  /** ISO currency code, uppercase (e.g. "USD", "MXN"). */
  currency: string
  checkoutToken?: string | null
  items?: any[]
  shipping?: any
  disabled?: boolean
  /** Optional hook called BEFORE createOrder. */
  onBeforeCreate?: () => Promise<void> | void
}

/**
 * Renders the PayPal Express button — ONLY if the store has an active
 * PayPal account connected in the Lovivo dashboard. Uses PayPal JS SDK v6.
 */
export function PaypalExpressButton({
  amount,
  currency,
  checkoutToken,
  items,
  shipping,
  disabled,
  onBeforeCreate,
}: PaypalExpressButtonProps) {
  const { paypalEnabled, paypalClientId, paypalEnvironment } = useSettings()
  const { clearCart } = useCart()
  const { toast } = useToast()
  const navigate = useNavigate()

  const upperCurrency = (currency || "USD").toUpperCase()

  if (!paypalEnabled || !paypalClientId || !checkoutToken) {
    return null
  }

  // v6 expects `production` not `live`
  const sdkEnvironment: "sandbox" | "production" =
    paypalEnvironment === "sandbox" ? "sandbox" : "production"

  return (
    <div
      className="paypal-express-wrapper w-full"
      style={{
        // Force the underlying <paypal-button> web component to match the
        // Stripe ExpressCheckout button height (44px) and full width.
        ['--paypal-button-height' as any]: '44px',
      }}
    >
      <style>{`
        .paypal-express-wrapper paypal-button,
        .paypal-express-wrapper > div { width: 100% !important; }
        .paypal-express-wrapper paypal-button { height: 44px !important; min-height: 44px !important; display: block; }
      `}</style>
      <PayPalProvider
        clientId={paypalClientId}
        environment={sdkEnvironment}
        components={["paypal-payments"]}
        pageType="checkout"
      >

        <PayPalOneTimePaymentButton
          createOrder={async () => {
            if (onBeforeCreate) await onBeforeCreate()
            const res = await callEdge("paypal-create-order", {
              store_id: STORE_ID,
              checkout_token: checkoutToken,
              amount,
              currency: upperCurrency,
              items,
              shipping,
            })
            const id = res?.id || res?.order_id
            if (!id) throw new Error("PayPal: no se recibió order id")
            return { orderId: id }
          }}
          onApprove={async (data: any) => {
            const paypalOrderId = data?.orderID || data?.orderId
            try {
              const res = await callEdge("paypal-capture-order", {
                store_id: STORE_ID,
                paypal_order_id: paypalOrderId,
                checkout_token: checkoutToken,
              })
              if (res?.status && res.status !== "COMPLETED") {
                throw new Error(`PayPal status: ${res.status}`)
              }
              const order = res?.order
              try {
                if (order) localStorage.setItem("completed_order", JSON.stringify(order))
              } catch {}
              clearCart()
              const finalId = order?.id || res?.order_id || paypalOrderId
              navigate(`/gracias/${finalId}`)
              toast({
                title: "¡Pago exitoso!",
                description: "Tu compra con PayPal fue procesada correctamente.",
              })
            } catch (err: any) {
              console.error("PayPal capture error:", err)
              toast({
                title: "Error al capturar PayPal",
                description: err?.message || "No se pudo completar el pago",
                variant: "destructive",
              })
            }
          }}
        />
      </PayPalProvider>
    </div>
  )
}

export default PaypalExpressButton
