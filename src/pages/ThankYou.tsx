import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Package, Mail, ArrowLeft, ShoppingBag } from 'lucide-react'
import { formatMoney } from '@/lib/money'
import { EcommerceTemplate } from '@/templates/EcommerceTemplate'
import { SEO } from '@/components/SEO'
import { STORE_ID } from '@/lib/config'
import { callEdge } from '@/lib/edge'
import { useCart } from '@/contexts/CartContext'

interface OrderDetails {
  id: string
  order_number: string
  total_amount: number
  currency_code: string
  status: string
  shipping_address?: any
  billing_address?: any
  order_items: any[]
  created_at: string
}

const COMPLETED_KEY = 'completed_order'
const CHECKOUT_KEY = `checkout:${STORE_ID}`

const ThankYou = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { clearCart } = useCart()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const hydratedRef = useRef(false)

  useEffect(() => {
    if (hydratedRef.current) return
    hydratedRef.current = true

    const redirectStatus = searchParams.get('redirect_status')

    const persist = (o: OrderDetails) => {
      try { localStorage.setItem(COMPLETED_KEY, JSON.stringify(o)) } catch {}
    }

    const cleanupAfterSuccess = () => {
      try {
        localStorage.removeItem(CHECKOUT_KEY)
        sessionStorage.removeItem('checkout_cart')
        sessionStorage.removeItem('checkout_order')
        sessionStorage.removeItem('checkout_order_id')
        sessionStorage.removeItem('pendingDiscount')
      } catch {}
      try { clearCart() } catch {}
      if (searchParams.toString()) {
        setSearchParams({}, { replace: true })
      }
    }

    const hydrate = async () => {
      // Step 1: completed_order in localStorage
      try {
        const raw = localStorage.getItem(COMPLETED_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed && (!orderId || parsed.id === orderId)) {
            setOrder(parsed)
            cleanupAfterSuccess()
            setLoading(false)
            return
          }
        }
      } catch {}

      // Step 2: checkout:${STORE_ID} snapshot
      let checkoutToken: string | undefined
      try {
        const raw = localStorage.getItem(CHECKOUT_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          checkoutToken = parsed?.checkout_token
          if (parsed?.order && (!orderId || parsed.order_id === orderId || parsed.order.id === orderId)) {
            const snap = parsed.order as OrderDetails
            persist(snap)
            setOrder(snap)
            cleanupAfterSuccess()
            setLoading(false)
            return
          }
        }
      } catch {}

      // Step 3: backend fallback via order-get + checkout_token
      if (checkoutToken) {
        try {
          const res = await callEdge('order-get', { checkout_token: checkoutToken })
          if (res && !res.error) {
            const built: OrderDetails = res.order || {
              id: res.order_id,
              order_number: res.order_number || (orderId || '').slice(0, 8),
              total_amount: res.total_amount,
              currency_code: res.currency_code,
              status: res.status || 'paid',
              shipping_address: res.shipping_address,
              billing_address: res.billing_address,
              order_items: res.order_items || [],
              created_at: res.created_at || new Date().toISOString(),
            }
            persist(built)
            setOrder(built)
            cleanupAfterSuccess()
            setLoading(false)
            return
          }
        } catch (e) {
          console.error('order-get fallback failed:', e)
        }
      }

      // Step 4: Stripe redirect failure
      if (redirectStatus && redirectStatus !== 'succeeded') {
        navigate('/pagar', { replace: true })
        return
      }

      setOrder(null)
      setLoading(false)
    }

    hydrate()
  }, [orderId, searchParams, setSearchParams, navigate, clearCart])

  if (loading) {
    return (
      <EcommerceTemplate showCart={true}>
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Confirmando tu pedido...</p>
        </div>
      </EcommerceTemplate>
    )
  }

  if (!order) {
    return (
      <>
        <SEO title="Pedido no encontrado" noindex />
        <EcommerceTemplate showCart={true}>
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card className="border-dashed">
              <CardContent className="pt-12 pb-12">
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-muted p-6">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-xl">Pedido no encontrado</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      Parece que aún no has completado una compra, o este enlace de pedido ha expirado.
                    </p>
                  </div>
                  <Button size="lg" asChild className="mt-4">
                    <Link to="/">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Comenzar a Comprar
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </EcommerceTemplate>
      </>
    )
  }

  return (
    <>
      <SEO title="Confirmación de pedido" noindex />
    <EcommerceTemplate pageTitle="Confirmación de Pedido" showCart={true}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Confirmation Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            ¡Pago Confirmado!
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Gracias por tu compra. Tu pedido ha sido procesado exitosamente.
          </p>
          <Badge variant="secondary" className="text-sm">
            Pedido #{order.order_number}
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Detalles del Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {order.order_items.filter(item => item.quantity > 0).map((item, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    {/* Product Image */}
                    {item.product_images && item.product_images.length > 0 && (
                      <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                        <img 
                          src={item.product_images[0]} 
                          alt={item.product_name || 'Producto'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name || 'Producto'}</p>
                      {item.variant_name && (
                        <p className="text-sm text-muted-foreground">
                          {item.variant_name}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Cantidad: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatMoney(item.price * item.quantity, order.currency_code)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatMoney(order.total_amount, order.currency_code)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Información de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const ship: any = order.shipping_address
                const hasAddress = ship && (ship.line1 || ship.address1 || ship.city)
                if (!hasAddress) {
                  return (
                    <div>
                      <h4 className="font-medium mb-2">Dirección de Envío:</h4>
                      <p className="text-sm text-muted-foreground">
                        Los detalles de entrega se enviarán por correo.
                      </p>
                    </div>
                  )
                }

                const fullName = ship.name
                  || [ship.first_name, ship.last_name].filter(Boolean).join(' ')
                  || ''
                const line1 = ship.line1 ?? ship.address1 ?? ''
                const line2 = ship.line2 ?? ship.address2 ?? ''
                const state = ship.state ?? ship.state_name ?? ship.province ?? ''
                const postal = ship.postal_code ?? ship.zip ?? ''
                const country = ship.country_name ?? ship.country ?? ''

                return (
                  <div>
                    <h4 className="font-medium mb-2">Dirección de Envío:</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {fullName && <p>{fullName}</p>}
                      {line1 && <p>{line1}</p>}
                      {line2 && <p>{line2}</p>}
                      <p>
                        {[ship.city, state].filter(Boolean).join(', ')}
                      </p>
                      <p>{[postal, country].filter(Boolean).join(' ')}</p>
                      {ship.phone && <p>Teléfono: {ship.phone}</p>}
                    </div>
                  </div>
                )
              })()}

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Próximos Pasos:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Recibirás un correo de confirmación</li>
                  <li>• Te notificaremos cuando tu pedido esté listo</li>
                  <li>• Puedes rastrear tu pedido con el número #{order.order_number}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button asChild variant="outline">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Seguir Comprando
            </Link>
          </Button>
        </div>
      </div>
    </EcommerceTemplate>
    </>
  )
}

export default ThankYou
