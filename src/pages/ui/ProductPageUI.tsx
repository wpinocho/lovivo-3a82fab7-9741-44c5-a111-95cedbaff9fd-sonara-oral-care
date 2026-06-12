import { useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { EcommerceTemplate } from "@/templates/EcommerceTemplate"
import {
  ShoppingCart,
  ArrowLeft,
  Plus,
  Minus,
  Truck,
  ShieldCheck,
  RotateCcw,
  Lock,
  ChevronRight,
} from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import type { SellingPlan } from "@/lib/supabase"
import { VolumeBadge } from "@/components/ui/VolumeBadge"
import { BOGOLabel } from "@/components/ui/BOGOLabel"
import { intervalLabel } from "@/lib/subscription-utils"
import ProductExpressCheckout from "@/components/ProductExpressCheckout"
import { SEO } from "@/components/SEO"
import { useSettings } from "@/contexts/SettingsContext"
import { productJsonLd, breadcrumbJsonLd, plainText } from "@/lib/seo/jsonld"

/**
 * EDITABLE UI COMPONENT - ProductPageUI (Premium Redesign)
 *
 * Layout asimétrico 7/5, galería con thumbnails verticales (desktop),
 * tipografía editorial, highlights con íconos, acordeones de detalle,
 * sticky info column en desktop. Lógica intacta — solo presentación.
 */

interface ProductPageUIProps {
  logic: {
    product: any
    loading: boolean
    notFound: boolean
    selected: Record<string, string>
    quantity: number
    matchingVariant: any
    currentPrice: number
    currentCompareAt: number | null
    currentImage: string | null
    inStock: boolean
    handleOptionSelect: (optionName: string, value: string) => void
    handleQuantityChange: (quantity: number) => void
    handleAddToCart: () => void
    handleNavigateBack: () => void
    isOptionValueAvailable: (optionName: string, value: string) => boolean
    [key: string]: any
  }
}

export const ProductPageUI = ({ logic }: ProductPageUIProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [expressAvailable, setExpressAvailable] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const { ref: ctaRef, inView: ctaInView } = useInView({ threshold: 0 })

  const displayImage =
    selectedImage ||
    logic.displayImages?.[0] ||
    logic.currentImage ||
    "/placeholder.svg"

  useEffect(() => {
    setSelectedImage(null)
  }, [logic.matchingVariant])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  if (logic.loading) {
    return (
      <EcommerceTemplate>
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <Skeleton className="aspect-[4/5] rounded-lg lg:col-span-7" />
          <div className="space-y-4 lg:col-span-5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </div>
      </EcommerceTemplate>
    )
  }

  if (logic.notFound) {
    return (
      <EcommerceTemplate>
        <div className="text-center py-16">
          <h1 className="text-4xl font-bold mb-4">Producto no encontrado</h1>
          <p className="text-muted-foreground mb-8">
            El producto que buscas no existe o ha sido eliminado.
          </p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Link>
          </Button>
        </div>
      </EcommerceTemplate>
    )
  }

  if (!logic.product) return null

  const discountPct =
    logic.currentCompareAt && logic.currentCompareAt > logic.currentPrice
      ? Math.round(
          ((logic.currentCompareAt - logic.currentPrice) /
            logic.currentCompareAt) *
            100
        )
      : 0

  const vendor = logic.product.vendor || logic.product.product_type

  const { storeName, currencyCode } = useSettings()
  const product = logic.product
  const seoTitle = product.title
  const seoDescription = plainText(product.description, 160) || `Compra ${product.title} en ${storeName}.`
  const seoImage = product.images?.[0]
  const productSchema = productJsonLd(product, {
    storeName,
    currencyCode,
    inStock: !!logic.inStock,
    price: logic.currentPrice,
  })
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Inicio', path: '/' },
    { name: 'Productos', path: '/' },
    { name: product.title, path: `/productos/${product.slug}` },
  ])

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonicalPath={`/productos/${product.slug}`}
        ogImage={seoImage}
        ogType="product"
        storeName={storeName}
        jsonLd={[productSchema, breadcrumbs]}
      />
    <EcommerceTemplate hideFloatingCartOnMobile>
      <div className="max-w-[1400px] mx-auto">
        {/* Breadcrumbs */}
        <nav
          aria-label="Migas de pan"
          className="mb-6 hidden md:flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Link to="/" className="hover:text-foreground transition-colors">
            Inicio
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            to="/"
            className="hover:text-foreground transition-colors"
          >
            Productos
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground/80 truncate max-w-[280px]">
            {logic.product.title}
          </span>
        </nav>

        {/* Mobile back link */}
        <button
          type="button"
          onClick={logic.handleNavigateBack}
          className="md:hidden mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Seguir comprando
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* ========== GALLERY (lg:col-span-7, sticky on desktop) ========== */}
          <div className="lg:col-span-7 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)]">
            {/* Desktop: main image + horizontal thumbnails below */}
            <div className="hidden md:block">
              {/* Main image */}
              <div
                className="relative w-full aspect-[4/5] lg:max-h-[75vh] rounded-lg overflow-hidden bg-muted/30 cursor-zoom-in group"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
              >
                <img
                  src={displayImage}
                  alt={logic.product.title}
                  className={cn(
                    "w-full h-full object-contain transition-transform duration-500 ease-out",
                    isZoomed ? "scale-110" : "scale-100"
                  )}
                />
                {discountPct > 0 && (
                  <Badge className="absolute top-4 left-4 bg-foreground text-background hover:bg-foreground/90">
                    -{discountPct}%
                  </Badge>
                )}
              </div>

              {/* Horizontal thumbnails below main image */}
              {logic.displayImages && logic.displayImages.length > 1 && (
                <div className="flex gap-3 mt-4">
                  {logic.displayImages.map((img: string, index: number) => {
                    const isActive =
                      selectedImage === img ||
                      (!selectedImage &&
                        logic.currentImage === img) ||
                      (!selectedImage &&
                        !logic.currentImage &&
                        index === 0)
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(img)}
                        className={cn(
                          "shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all bg-muted/30",
                          isActive
                            ? "border-foreground"
                            : "border-transparent hover:border-muted-foreground/40"
                        )}
                        aria-label={`Ver imagen ${index + 1}`}
                      >
                        <img
                          src={img}
                          alt={`${logic.product.title} miniatura ${index + 1}`}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-contain"
                        />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Mobile: carousel */}
            {logic.displayImages && logic.displayImages.length > 1 ? (
              <div className="md:hidden">
                <Carousel className="w-full">
                  <CarouselContent>
                    {logic.displayImages.map((img: string, index: number) => (
                      <CarouselItem key={index}>
                        <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-muted/30">
                          <img
                            src={img}
                            alt={`${logic.product.title} ${index + 1}`}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-contain"
                          />
                          {discountPct > 0 && index === 0 && (
                            <Badge className="absolute top-3 left-3 bg-foreground text-background">
                              -{discountPct}%
                            </Badge>
                          )}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>
              </div>
            ) : (
              <div className="md:hidden relative aspect-[4/5] rounded-lg overflow-hidden bg-muted/30">
                <img
                  src={displayImage}
                  alt={logic.product.title}
                  className="w-full h-full object-contain"
                />
                {discountPct > 0 && (
                  <Badge className="absolute top-3 left-3 bg-foreground text-background">
                    -{discountPct}%
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* ========== INFO COLUMN (lg:col-span-5, scrolls while gallery sticks) ========== */}
          <div className="lg:col-span-5 space-y-8">
            {/* Title block */}
            <div className="space-y-3">
              {vendor && (
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
                  {vendor}
                </p>
              )}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight leading-[1.1]">
                {logic.product.title}
              </h1>

              {/* Price block */}
              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-3xl font-semibold tracking-tight">
                  {logic.formatMoney(logic.currentPrice)}
                </span>
                {logic.currentCompareAt &&
                  logic.currentCompareAt > logic.currentPrice && (
                    <>
                      <span className="text-base text-muted-foreground line-through">
                        {logic.formatMoney(logic.currentCompareAt)}
                      </span>
                      {discountPct > 0 && (
                        <span className="text-sm font-medium text-primary">
                          Ahorra {discountPct}%
                        </span>
                      )}
                    </>
                  )}
              </div>

              {/* Promo badges */}
              {logic.product?.id && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <VolumeBadge productId={logic.product.id} />
                  <BOGOLabel productId={logic.product.id} />
                </div>
              )}
            </div>

            {/* Highlights row */}
            <div className="grid grid-cols-2 gap-3 py-4 border-y border-border/60">
              <div className="flex items-center gap-2.5 text-xs">
                <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-foreground/80">Envío rápido</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs">
                <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-foreground/80">Garantía 30 días</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs">
                <RotateCcw className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-foreground/80">Devolución sin costo</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs">
                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-foreground/80">Pago seguro</span>
              </div>
            </div>

            {/* Selling Plan Selector */}
            {logic.sellingPlans && logic.sellingPlans.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium uppercase tracking-wider">
                  Tipo de compra
                </Label>
                <div className="space-y-2">
                  <label
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all",
                      !logic.selectedPlan
                        ? "border-foreground bg-foreground/5"
                        : "border-border hover:border-muted-foreground/40"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="selling-plan"
                        checked={!logic.selectedPlan}
                        onChange={() => logic.setSelectedPlan(null)}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="font-medium">Compra única</span>
                    </div>
                    <span className="font-semibold">
                      {logic.formatMoney(logic.currentPrice)}
                    </span>
                  </label>

                  {logic.sellingPlans.map((plan: SellingPlan) => {
                    const subPrice =
                      logic.subscriptionPrice &&
                      logic.selectedPlan?.id === plan.id
                        ? logic.subscriptionPrice
                        : plan.discount_type === "percentage" &&
                          plan.discount_value
                        ? logic.currentPrice *
                          (1 - plan.discount_value / 100)
                        : plan.discount_type === "fixed" && plan.discount_value
                        ? Math.max(
                            0,
                            logic.currentPrice - plan.discount_value
                          )
                        : logic.currentPrice

                    return (
                      <label
                        key={plan.id}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all",
                          logic.selectedPlan?.id === plan.id
                            ? "border-foreground bg-foreground/5"
                            : "border-border hover:border-muted-foreground/40"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="selling-plan"
                            checked={logic.selectedPlan?.id === plan.id}
                            onChange={() => logic.setSelectedPlan(plan)}
                            className="w-4 h-4 text-primary"
                          />
                          <div>
                            <span className="font-medium">{plan.name}</span>
                            {plan.discount_value &&
                              plan.discount_value > 0 && (
                                <span className="ml-2 text-xs text-primary font-medium">
                                  -{plan.discount_value}
                                  {plan.discount_type === "percentage"
                                    ? "%"
                                    : ""}
                                </span>
                              )}
                          </div>
                        </div>
                        <span className="font-semibold">
                          {logic.formatMoney(subPrice)}/
                          {intervalLabel(plan.interval, plan.interval_count)}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Product Options */}
            {logic.product.options && logic.product.options.length > 0 && (
              <div className="space-y-5">
                {logic.product.options.map((option: any) => (
                  <div key={option.name} className="space-y-2.5">
                    <div className="flex items-baseline justify-between">
                      <Label className="text-sm font-medium uppercase tracking-wider">
                        {option.name}
                      </Label>
                      {logic.selected[option.name] && (
                        <span className="text-sm text-muted-foreground">
                          {logic.selected[option.name]}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value: string) => {
                        const isSelected =
                          logic.selected[option.name] === value
                        const isAvailable = logic.isOptionValueAvailable(
                          option.name,
                          value
                        )

                        return (
                          <button
                            key={value}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() =>
                              logic.handleOptionSelect(option.name, value)
                            }
                            className={cn(
                              "min-w-[3rem] px-4 h-11 rounded-md border text-sm font-medium transition-all",
                              isSelected
                                ? "border-foreground bg-foreground text-background"
                                : "border-border bg-background hover:border-foreground/60",
                              !isAvailable &&
                                "opacity-40 cursor-not-allowed line-through"
                            )}
                          >
                            {value}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity stepper */}
            <div className="space-y-2.5">
              <Label className="text-sm font-medium uppercase tracking-wider">
                Cantidad
              </Label>
              <div className="inline-flex items-center border border-border rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    logic.handleQuantityChange(
                      Math.max(1, logic.quantity - 1)
                    )
                  }
                  disabled={logic.quantity <= 1}
                  className="w-11 h-11 flex items-center justify-center hover:bg-muted/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="w-12 h-11 flex items-center justify-center font-medium tabular-nums border-x border-border">
                  {logic.quantity}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    logic.handleQuantityChange(logic.quantity + 1)
                  }
                  className="w-11 h-11 flex items-center justify-center hover:bg-muted/60 transition-colors"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div ref={ctaRef} className="flex flex-col gap-3">
              {logic.inStock &&
                logic.canAddToCart &&
                !logic.selectedPlan && (
                  <>
                    <ProductExpressCheckout
                      product={logic.product}
                      variant={logic.matchingVariant}
                      sellingPlan={logic.selectedPlan}
                      quantity={logic.quantity}
                      unitPrice={logic.currentPrice}
                      onAvailabilityChange={setExpressAvailable}
                    />
                    {expressAvailable && (
                      <div className="flex items-center gap-3 py-1">
                        <Separator className="flex-1" />
                        <span className="text-xs text-muted-foreground uppercase tracking-widest">
                          o
                        </span>
                        <Separator className="flex-1" />
                      </div>
                    )}
                  </>
                )}

              {logic.inStock && (
                <Button
                  onClick={logic.handleBuyNow}
                  className="w-full h-14 text-base tracking-wide rounded-md"
                  size="lg"
                >
                  Comprar ahora
                </Button>
              )}

              <Button
                onClick={logic.handleAddToCart}
                disabled={!logic.inStock}
                variant={logic.inStock ? "outline" : "default"}
                className="w-full h-14 text-base tracking-wide rounded-md"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {logic.inStock
                  ? logic.selectedPlan
                    ? `Suscribirse — ${logic.formatMoney(
                        logic.subscriptionPrice || logic.currentPrice
                      )}/${intervalLabel(
                        logic.selectedPlan.interval,
                        logic.selectedPlan.interval_count
                      )}`
                    : "Agregar al carrito"
                  : "Agotado"}
              </Button>

              {!logic.inStock && (
                <Badge variant="secondary" className="w-fit">
                  Agotado
                </Badge>
              )}
            </div>

            {/* Detail accordions */}
            <Accordion
              type="single"
              collapsible
              defaultValue="description"
              className="border-t border-border/60"
            >
              {logic.product.description && (
                <AccordionItem value="description">
                  <AccordionTrigger className="text-sm font-medium uppercase tracking-wider">
                    Descripción
                  </AccordionTrigger>
                  <AccordionContent>
                    <div
                      className="text-muted-foreground prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: logic.product.description,
                      }}
                    />
                  </AccordionContent>
                </AccordionItem>
              )}

              <AccordionItem value="shipping">
                <AccordionTrigger className="text-sm font-medium uppercase tracking-wider">
                  Envío y devoluciones
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    Envío a todo el país. Tiempo estimado de entrega: 2 a 5
                    días hábiles.
                  </p>
                  <p>
                    Cuentas con 30 días para solicitar tu devolución sin
                    costo adicional.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="care">
                <AccordionTrigger className="text-sm font-medium uppercase tracking-wider">
                  Cuidado del producto
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  <p>
                    Conserva en lugar fresco y seco, alejado de la luz solar
                    directa. Sigue las indicaciones de uso descritas en el
                    empaque.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Sticky Add to Cart Bar */}
      {logic.inStock && (
        <div
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t shadow-lg transition-transform duration-300 ease-out pb-[env(safe-area-inset-bottom)]",
            ctaInView ? "translate-y-full" : "translate-y-0"
          )}
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            {/* Desktop */}
            <div className="hidden md:flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-md overflow-hidden bg-muted/30 shrink-0">
                  <img
                    src={displayImage}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium truncate text-sm">
                    {logic.product.title}
                  </h3>
                  <span className="font-semibold text-base">
                    {logic.formatMoney(logic.currentPrice)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Button onClick={logic.handleBuyNow} size="default">
                  Comprar ahora
                </Button>
                <Button
                  onClick={logic.handleAddToCart}
                  variant="outline"
                  size="default"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Agregar al carrito
                </Button>
              </div>
            </div>
            {/* Mobile */}
            <div className="md:hidden space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-md overflow-hidden bg-muted/30 shrink-0">
                  <img
                    src={displayImage}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">
                    {logic.product.title}
                  </h3>
                  <span className="font-semibold shrink-0 text-sm">
                    {logic.formatMoney(logic.currentPrice)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={logic.handleBuyNow}
                  size="sm"
                  className="flex-1"
                >
                  Comprar ahora
                </Button>
                <Button
                  onClick={logic.handleAddToCart}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                  Agregar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </EcommerceTemplate>
    </>
  )
}
