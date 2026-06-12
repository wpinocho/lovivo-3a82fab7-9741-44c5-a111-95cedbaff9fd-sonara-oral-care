import { useEffect, useState, useMemo } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tag, X, ShoppingBag, Loader2, RefreshCw, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CartAppliedRules } from "@/components/ui/CartAppliedRules";
import { useNavigate } from "react-router-dom";
import StripePayment from "@/components/StripePayment";
import { PaypalExpressButton } from "@/components/PaypalExpressButton";
import { HeadlessCheckout } from "@/components/headless/HeadlessCheckout";
import { BrandLogoLeft } from "@/components/BrandLogoLeft";
import { useURLCheckoutParams } from "@/hooks/useURLCheckoutParams";
import { useTokenCheckout } from "@/hooks/useTokenCheckout";
import { formatMoney } from "@/lib/money";
import { countryNameToCode, countryCodeToName } from "@/lib/country-codes";

/**
 * EDITABLE UI COMPONENT - CheckoutUI
 * 
 * Este componente solo maneja la presentación del checkout.
 * Toda la lógica viene del HeadlessCheckout.
 * 
 * PUEDES MODIFICAR LIBREMENTE:
 * - Colores, temas, estilos
 * - Textos e idioma
 * - Layout y estructura visual
 * - Formularios y campos
 * - Animaciones y efectos
 * - Agregar features visuales
 */

export default function CheckoutUI() {
  const { params, hasParams } = useURLCheckoutParams();
  const { isLoadingToken, tokenError, hasToken } = useTokenCheckout();
  const navigate = useNavigate();
  const { paymentMethods, stripeAccountId, chargeType, isLoading: isSettingsLoading } = useSettings();
  const [linkAuthenticated, setLinkAuthenticated] = useState(false);
  // Track whether the on-page Stripe AddressElement has a complete address.
  // Used to decide if the Express Checkout wallet should request shipping itself
  // (form empty → wallet asks user) or use the form values silently (form complete).
  const [addressElementComplete, setAddressElementComplete] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Token checkout: show loading/error while resolving the payment link
  if (isLoadingToken || hasToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          {tokenError ? (
            <>
              <p className="text-lg font-semibold text-destructive">Error al cargar la orden</p>
              <p className="text-sm text-muted-foreground">{tokenError}</p>
            </>
          ) : (
            <>
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">Cargando orden...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <HeadlessCheckout>
      {(logic) => {
        // Aplicar parámetros de URL cuando se monta el componente
        useEffect(() => {
          if (hasParams && params) {
            logic.applyURLParams(params);
          }
        }, [hasParams, params]);

        // Convert available country names to ISO codes for Stripe AddressElement
        const allowedCountries = useMemo(() => {
          if (!logic.availableCountries || logic.availableCountries.length === 0) return undefined;
          return logic.availableCountries
            .map((c: any) => c.code || countryNameToCode(c.name))
            .filter(Boolean);
        }, [logic.availableCountries]);

        // Delivery methods slot for rendering between AddressElement and PaymentElement
        const deliveryMethodSlot = !logic.usePickup && logic.deliveryExpectations && logic.deliveryExpectations.length > 0 ? (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Métodos de envío</h3>
            {Array.isArray(logic.deliveryExpectations) && logic.deliveryExpectations.map((method: any, index: number) => (
              <div key={index} className="border rounded-lg">
                <label className="flex items-center justify-between p-4 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <input 
                      type="radio" 
                      name="delivery-method" 
                      value={index} 
                      checked={logic.selectedDeliveryMethod?.type === method.type} 
                      onChange={() => {
                        logic.setSelectedDeliveryMethod(method);
                        logic.setShippingCost(method.hasPrice && method.price ? parseFloat(method.price) : 0);
                      }} 
                      className="w-4 h-4" 
                    />
                    <div>
                      <div className="font-medium">{method.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {method.description}
                      </div>
                    </div>
                  </div>
                  <div className="font-semibold">
                    {method.hasPrice && method.price ? formatMoney(parseFloat(method.price), logic.currencyCode) : 'GRATIS'}
                  </div>
                </label>
              </div>
            ))}
          </div>
        ) : null;

        return (
        <div className="min-h-screen bg-background">
          {/* Minimal checkout header - logo only */}
          <header className="border-b bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <BrandLogoLeft />
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Mobile Order Summary - Collapsible */}
            <MobileOrderSummary logic={logic} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Formulario de Checkout */}
              <div className="space-y-8 bg-card p-3 sm:p-6 rounded-lg">
                {/* Newsletter subscription is enabled by default (hidden from UI) */}

                {/* Pickup Locations */}
                {logic.pickupLocations && logic.pickupLocations.length > 0 && (
                  <section>
                    <div className="flex items-center space-x-3 mb-4">
                      <input 
                        type="checkbox" 
                        id="use-pickup" 
                        checked={logic.usePickup} 
                        onChange={e => {
                          logic.setUsePickup(e.target.checked);
                          if (!e.target.checked) {
                            logic.setSelectedPickupLocation(null);
                            logic.setShippingCost(0);
                            logic.setSelectedDeliveryMethod(null);
                          }
                        }} 
                        className="w-4 h-4" 
                      />
                      <label htmlFor="use-pickup" className="text-sm font-medium">Recoger en tienda</label>
                    </div>
                    
                    {logic.usePickup && (
                      <div className="space-y-3">
                        {Array.isArray(logic.pickupLocations) && logic.pickupLocations.map((location: any, index: number) => {
                          const isExpanded = logic.selectedPickupLocation?.name === location.name;
                          return (
                            <div key={index} className="border rounded-lg">
                              <label className="flex items-start p-4 cursor-pointer">
                                <input 
                                  type="radio" 
                                  name="pickup" 
                                  value={index} 
                                  checked={isExpanded} 
                                  onChange={() => {
                                    if (isExpanded) {
                                      logic.setSelectedPickupLocation(null);
                                      logic.setShippingCost(0);
                                      logic.setSelectedDeliveryMethod(null);
                                    } else {
                                      logic.setSelectedPickupLocation(location);
                                      logic.setShippingCost(0);
                                      logic.setSelectedDeliveryMethod(null);
                                    }
                                  }} 
                                  className="w-4 h-4 mt-1 mr-3" 
                                />
                                <div className="flex-1">
                                  <div className="font-medium">{location.name}</div>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    {location.line1}{location.line2 && `, ${location.line2}`}, {location.city}, {location.country}
                                  </div>
                                  {!isExpanded && <div className="text-sm text-primary mt-1">Te esperamos</div>}
                                  {isExpanded && (
                                    <>
                                      <div className="text-sm text-muted-foreground mt-1">
                                        {location.city}, {location.state}, {location.country} - {location.postal_code}
                                      </div>
                                      {location.schedule && <div className="text-sm text-muted-foreground">Horario: {location.schedule}</div>}
                                      {location.instructions && <div className="text-sm text-primary mt-1">{location.instructions}</div>}
                                    </>
                                  )}
                                </div>
                                <div className="font-semibold text-green-600">GRATIS</div>
                              </label>
                            </div>
                          );
                        })}

                        {/* Pickup phone — required because there's no AddressElement to capture it */}
                        {logic.selectedPickupLocation && (
                          <div className="space-y-1.5 pt-2">
                            <Label htmlFor="pickup-phone" className="text-sm">
                              Teléfono de contacto <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="pickup-phone"
                              type="tel"
                              inputMode="tel"
                              autoComplete="tel"
                              placeholder="55 1234 5678"
                              value={logic.phone}
                              onChange={(e) => logic.setPhone(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                              Lo usaremos para avisarte cuando tu pedido esté listo para recoger.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </section>
                )}

                {/* Pago section - includes email, address, delivery methods, and payment */}
                <section>
                  {(() => {
                    const isStripeReady =
                      !isSettingsLoading &&
                      logic.isInitialized &&
                      logic.hasActiveCheckout &&
                      logic.orderId &&
                      logic.checkoutToken &&
                      logic.summaryItems.length > 0 &&
                      logic.finalTotal > 0;

                    if (!isStripeReady) {
                      return (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      );
                    }

                    // NOTA: NO incluir finalTotal — cambiarlo remontaría <Elements> y mataría
                    // la sesión del wallet (Apple Pay / GPay / Link). El monto se actualiza
                    // in-place vía elements.update({ amount }) dentro de StripePayment.
                    const stripeKey = [
                      logic.orderId,
                      logic.checkoutToken,
                      logic.currencyCode,
                      JSON.stringify(paymentMethods),
                      stripeAccountId,
                      chargeType,
                    ].join('|');

                    return (
                      <StripePayment 
                        key={stripeKey}
                        amountCents={Math.round(logic.finalTotal * 100)} 
                        currency={logic.currencyCode.toLowerCase()} 
                        description={`Pedido #${logic.orderId ?? 's/n'}`} 
                        metadata={{
                          order_id: logic.orderId ?? '',
                          ...(logic.discount?.code ? { discount_code: logic.discount.code } : {})
                        }} 
                        email={logic.email} 
                        name={`${logic.firstName} ${logic.lastName}`.trim()} 
                        phone={logic.phone} 
                        orderId={logic.orderId}
                        checkoutToken={logic.checkoutToken}
                        onValidationRequired={logic.validateCheckoutFields}
                        expectedTotal={Math.round(logic.finalTotal * 100)}
                        deliveryFee={Math.round((logic.shippingFromCheckout || logic.shippingCost) * 100)}
                        shippingAddress={logic.usePickup ? null : {
                          ...logic.address,
                          first_name: logic.firstName,
                          last_name: logic.lastName
                        }}
                        billingAddress={logic.usePickup ? logic.billingAddress : (logic.useSameAddress ? {
                          ...logic.address,
                          first_name: logic.firstName,
                          last_name: logic.lastName
                        } : logic.billingAddress)}
                        items={logic.orderItems}
                        deliveryExpectations={logic.usePickup ? 
                          [{ type: "pickup", description: "Recoger en tienda" }] : 
                          (logic.deliveryExpectations || [])
                        }
                        pickupLocations={logic.usePickup ? 
                          (logic.selectedPickupLocation ? [logic.selectedPickupLocation] : []) : 
                          []
                        }
                        billingSlot={<BillingCheckboxSection logic={logic} />}
                        deliveryMethodSlot={deliveryMethodSlot}
                        showAddressElement={!logic.usePickup}
                        addressElementComplete={addressElementComplete}
                        allowedCountries={allowedCountries}
                        paypalSlot={
                          <PaypalExpressButton
                            amount={logic.finalTotal}
                            currency={logic.currencyCode}
                            checkoutToken={logic.checkoutToken}
                            items={logic.orderItems}
                            shipping={logic.usePickup ? null : {
                              ...logic.address,
                              first_name: logic.firstName,
                              last_name: logic.lastName,
                            }}
                          />
                        }
                        onAddressChange={(addressValue, complete) => {
                          setAddressElementComplete(complete);
                          const { address, name, phone } = addressValue;

                          // Helper: usa el valor nuevo solo si no es vacío; si vacío, conserva el previo.
                          // Evita que un evento parcial de Stripe sobrescriba un dato bueno con "".
                          const keep = <T,>(next: T | undefined | null, prev: T | undefined | null): T =>
                            (next !== undefined && next !== null && String(next).trim() !== '' ? next : (prev as T));

                          const nameParts = (name || '').split(' ');
                          const first = nameParts[0] || '';
                          const last = nameParts.slice(1).join(' ') || '';

                          if (first) logic.setFirstName(first);
                          if (last) logic.setLastName(last);
                          if (phone) logic.setPhone(phone);

                          const prev: any = logic.address || {};
                          const isoCountry = (address.country || prev.countryCode || '').toUpperCase();
                          const countryName = isoCountry ? countryCodeToName(isoCountry) : (prev.country || '');

                          logic.setAddress({
                            country: countryName,
                            countryCode: isoCountry,
                            line1: keep(address.line1, prev.line1) || '',
                            line2: keep(address.line2, prev.line2) || '',
                            city: keep(address.city, prev.city) || '',
                            state: keep(address.state, prev.state) || '',
                            postal_code: keep(address.postal_code, prev.postal_code) || '',
                          });

                          if (complete && first) {
                            logic.saveClientData(true);
                          }
                        }}
                        shippingError={logic.shippingError}
                        paymentMethods={paymentMethods}
                        stripeAccountId={stripeAccountId}
                        chargeType={chargeType}
                        onEmailChange={(email: string) => {
                          logic.setEmail(email)
                          logic.saveClientData(true, email)
                        }}
                        onLinkAuthChange={setLinkAuthenticated}
                      />
                    );
                  })()}
                </section>
              </div>

              {/* Resumen del pedido */}
              <div className="hidden md:block md:sticky md:top-8 md:h-fit">
                <div className="bg-muted border-l border-muted-foreground/20 p-6 space-y-4 rounded-lg">
                  {/* Loading and stale data states */}
                  {logic.itemsLoading && logic.summaryItems.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-muted-foreground">Cargando productos...</p>
                    </div>
                  ) : null}
                  
                  {logic.isStale && logic.summaryItems.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4">
                            {logic.revalidating ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                            ) : (
                              <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm text-yellow-800">
                            {logic.revalidating ? 'Restaurando tu carrito...' : 'Mostrando datos guardados'}
                          </span>
                        </div>
                        {!logic.revalidating && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={logic.refreshItems}
                            className="text-yellow-800 hover:text-yellow-900"
                          >
                            Actualizar
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Productos del carrito */}
                  {logic.summaryItems.length === 0 && !logic.itemsLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      {/* Empty cart icon */}
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                      </div>
                      
                      {/* Main message */}
                      <h3 className="text-lg font-semibold text-foreground">
                        Tu carrito está vacío
                      </h3>
                      
                      {/* Secondary message */}
                      <p className="text-muted-foreground text-center text-sm">
                        Agrega un producto para iniciar tu compra
                      </p>
                      
                      {/* CTA Button */}
                      <Button 
                        onClick={() => navigate('/')}
                        className="mt-4"
                      >
                        Comenzar a Comprar
                      </Button>
                    </div>
                  ) : (
                    Array.isArray(logic.summaryItems) && logic.summaryItems.map(item => (
                      <div key={item.key} className="flex items-center space-x-4">
                        <div className="relative">
                          <img 
                            src={item.product.images?.[0] || "/placeholder.svg"} 
                            alt={item.product.name} 
                            className="w-16 h-16 object-cover rounded border" 
                          />
                          <span className="absolute -top-2 -right-2 bg-muted text-muted-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product.name}</h4>
                          {item.variant && <p className="text-sm text-muted-foreground">{item.variant.name}</p>}
                          {item.selling_plan_id && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                <RefreshCw className="h-2.5 w-2.5 mr-0.5" />
                                Suscripción
                              </Badge>
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-sm text-muted-foreground">Cantidad</span>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-8 h-8 p-0" 
                                disabled={logic.updatingItems.has(item.key)}
                                aria-disabled={logic.updatingItems.has(item.key)}
                                onClick={() => logic.updateOrderQuantity(item.key, item.quantity - 1)}
                              >
                                -
                              </Button>
                              <span className="font-medium">{item.quantity}</span>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-8 h-8 p-0" 
                                disabled={logic.updatingItems.has(item.key)}
                                aria-disabled={logic.updatingItems.has(item.key)}
                                onClick={() => logic.updateOrderQuantity(item.key, item.quantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="font-semibold">
                          {formatMoney(item.total || (item.price * item.quantity), logic.currencyCode)}
                        </div>
                      </div>
                    ))
                  )}

                  {/* Código de descuento */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Código de descuento</div>
                    {!logic.discount ? (
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Ingresa tu cupón" 
                          value={logic.couponCode} 
                          onChange={e => logic.setCouponCode(e.target.value.toUpperCase())} 
                          className="text-sm" 
                          ref={logic.couponInputRef} 
                          onKeyDown={(e) => { if (e.key === 'Enter') logic.validateCoupon(); }} 
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={logic.validateCoupon} 
                          disabled={logic.isValidatingCoupon || !logic.couponCode.trim()}
                        >
                          <Tag className="h-4 w-4 mr-1" />
                          {logic.isValidatingCoupon ? '...' : 'Aplicar'}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-sm bg-muted/50 border border-border p-3 rounded-lg">
                        <span className="text-foreground font-medium">
                          Cupón aplicado: {logic.couponCode}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={logic.removeCoupon} 
                          className="text-muted-foreground hover:text-foreground p-1 h-auto"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Totales */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatMoney(logic.summaryTotal, logic.currencyCode)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Envío</span>
                      <span className={`${logic.isCalculatingShipping ? 'opacity-50 blur-sm' : ''} transition-all duration-200`}>
                        {logic.selectedPickupLocation ? 'GRATIS (Recoger en tienda)' : 
                         logic.shippingCost > 0 ? formatMoney(logic.shippingCost, logic.currencyCode) : 'GRATIS'}
                      </span>
                    </div>

                    {/* Applied rules (automatic discounts from backend) */}
                    {logic.appliedRules && logic.appliedRules.length > 0 && (
                      <CartAppliedRules
                        appliedRules={logic.appliedRules}
                        formatMoney={(v: number) => formatMoney(v, logic.currencyCode)}
                      />
                    )}

                    {/* Manual discount code */}
                    {logic.discount && logic.backendDiscountAmount === 0 && (
                      <div className="flex justify-between">
                        <span>Descuento ({logic.getDiscountDisplayText(logic.discount, logic.totalQuantity)})</span>
                        <span>- {formatMoney(logic.discountAmount, logic.currencyCode)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-baseline text-lg font-semibold pt-2 border-t">
                      <span>Total</span>
                      <div className={`flex items-baseline gap-1.5 ${logic.isCalculatingTotal ? 'opacity-50 blur-sm' : ''} transition-all duration-200`}>
                        <span className="text-sm text-muted-foreground">{logic.currencyCode.toUpperCase()}</span>
                        <span>{formatMoney(logic.finalTotal, logic.currencyCode)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
        )
      }}
    </HeadlessCheckout>
  );
}

/* ─── Mobile Order Summary (collapsible, top of checkout) ─── */
function MobileOrderSummary({ logic }: { logic: any }) {
  const [open, setOpen] = useState(false);

  if (logic.summaryItems.length === 0) return null;

  return (
    <div className="md:hidden mb-6 border rounded-lg bg-muted/50">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium"
      >
        <span className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4" />
          Resumen del pedido ({logic.totalQuantity})
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
        <span className="font-semibold">{formatMoney(logic.finalTotal, logic.currencyCode)}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t">
          {/* Items */}
          {logic.summaryItems.map((item: any) => (
            <div key={item.key} className="flex items-center gap-3 pt-3">
              <div className="relative shrink-0">
                <img
                  src={item.product.images?.[0] || "/placeholder.svg"}
                  alt={item.product.name}
                  className="w-12 h-12 object-cover rounded border"
                />
                <span className="absolute -top-1.5 -right-1.5 bg-foreground text-background text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.product.name}</p>
                {item.variant && <p className="text-xs text-muted-foreground">{item.variant.name}</p>}
              </div>
              <span className="text-sm font-medium">
                {formatMoney(item.total || item.price * item.quantity, logic.currencyCode)}
              </span>
            </div>
          ))}

          {/* Totals */}
          <div className="space-y-1 pt-3 border-t text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatMoney(logic.summaryTotal, logic.currencyCode)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Envío</span>
              <span>
                {logic.selectedPickupLocation
                  ? "GRATIS"
                  : logic.shippingCost > 0
                  ? formatMoney(logic.shippingCost, logic.currencyCode)
                  : "Pendiente"}
              </span>
            </div>
            {logic.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descuento</span>
                <span>- {formatMoney(logic.discountAmount, logic.currencyCode)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold pt-1 border-t">
              <span>Total</span>
              <span>{formatMoney(logic.finalTotal, logic.currencyCode)}</span>
            </div>
          </div>

          {/* Código de descuento mobile */}
          <MobileCouponSection logic={logic} />
        </div>
      )}
    </div>
  );
}

/* ─── Billing address as checkbox (Shopify-style) ─── */
function BillingCheckboxSection({ logic }: { logic: any }) {
  return (
    <div className="mt-4 space-y-4">
      {/* Checkbox – hidden for now, keeping logic intact */}
      {/* {!logic.usePickup && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="same-billing"
            checked={logic.useSameAddress}
            onCheckedChange={(v: boolean) => logic.setUseSameAddress(!!v)}
          />
          <Label htmlFor="same-billing" className="text-sm cursor-pointer">
            Usar la dirección de envío como dirección de facturación
          </Label>
        </div>
      )} */}

      {/* Billing form – show when pickup OR when checkbox unchecked */}
      {(logic.usePickup || !logic.useSameAddress) && (
        <Card className="mt-3">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={logic.billingAddress.first_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => logic.setBillingAddress((prev: any) => ({ ...prev, first_name: e.target.value }))}
                placeholder="Nombre"
              />
              <Input
                value={logic.billingAddress.last_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => logic.setBillingAddress((prev: any) => ({ ...prev, last_name: e.target.value }))}
                placeholder="Apellidos"
              />
            </div>
            <Input
              value={logic.billingAddress.line1}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => logic.setBillingAddress((prev: any) => ({ ...prev, line1: e.target.value }))}
              placeholder="Dirección"
            />
            <Input
              value={logic.billingAddress.line2}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => logic.setBillingAddress((prev: any) => ({ ...prev, line2: e.target.value }))}
              placeholder="Apartamento, suite, etc. (opcional)"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                value={logic.billingAddress.postal_code}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => logic.setBillingAddress((prev: any) => ({ ...prev, postal_code: e.target.value }))}
                placeholder="C.P."
              />
              <Input
                value={logic.billingAddress.city}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => logic.setBillingAddress((prev: any) => ({ ...prev, city: e.target.value }))}
                placeholder="Ciudad"
              />
              <Select
                value={logic.billingAddress.state}
                onValueChange={(value: string) => logic.setBillingAddress((prev: any) => ({ ...prev, state: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    const states =
                      logic.billingAddress.country === logic.address.country
                        ? logic.availableStates
                        : logic.availableCountries.find((c: any) => c.name === logic.billingAddress.country)?.states || [];
                    return (
                      Array.isArray(states) &&
                      states.map((state: any) => {
                        const stateName = typeof state === 'string' ? state : state.name;
                        return (
                          <SelectItem key={stateName} value={stateName}>
                            {stateName}
                          </SelectItem>
                        );
                      })
                    );
                  })()}
                </SelectContent>
              </Select>
            </div>
            <Select
              value={logic.billingAddress.country}
              onValueChange={(value: string) => logic.setBillingAddress((prev: any) => ({ ...prev, country: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="País" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(logic.availableCountries) &&
                  logic.availableCountries.map((country: any) => (
                    <SelectItem key={country.name} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ─── Mobile Coupon Section (collapsible) ─── */
function MobileCouponSection({ logic }: { logic: any }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="pt-2 border-t">
      {!logic.discount ? (
        <>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="text-xs text-primary font-medium flex items-center gap-1"
          >
            <Tag className="h-3 w-3" />
            ¿Tienes un cupón?
            {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {open && (
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Código de descuento"
                value={logic.couponCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => logic.setCouponCode(e.target.value.toUpperCase())}
                className="text-sm h-9"
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') logic.validateCoupon(); }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={logic.validateCoupon}
                disabled={logic.isValidatingCoupon || !logic.couponCode.trim()}
                className="h-9 shrink-0"
              >
                {logic.isValidatingCoupon ? '...' : 'Aplicar'}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-between text-xs bg-muted/50 border border-border p-2 rounded-lg">
          <span className="text-foreground font-medium">
            Cupón: {logic.couponCode}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={logic.removeCoupon}
            className="text-muted-foreground hover:text-foreground p-1 h-auto"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
