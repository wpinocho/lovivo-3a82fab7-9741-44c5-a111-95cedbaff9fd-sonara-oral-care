import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Play, ChevronRight, Check, X, Minus, Star, Package, Shield, Truck, RefreshCw, ChevronDown } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { CollectionCard } from '@/components/CollectionCard';
import { NewsletterSection } from '@/components/NewsletterSection';
import { EcommerceTemplate } from '@/templates/EcommerceTemplate';
import { useBundles } from '@/hooks/useBundles';
import type { UseIndexLogicReturn } from '@/components/headless/HeadlessIndex';
import { useState } from 'react';

interface IndexUIProps {
  logic: UseIndexLogicReturn;
}

// Scroll reveal hook
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    const children = el.querySelectorAll('.scroll-reveal');
    children.forEach((child) => observer.observe(child));
    if (el.classList.contains('scroll-reveal')) observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

// Stars component
const Stars = ({ count = 5 }: { count?: number }) => (
  <span className="flex gap-0.5">
    {Array.from({ length: count }).map((_, i) => (
      <Star key={i} className="h-4 w-4 fill-current text-star" />
    ))}
  </span>
);

// FAQ Accordion Item
const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        className="w-full flex items-center justify-between py-5 text-left gap-4"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-ink" style={{ fontFamily: 'Sora, sans-serif', fontSize: '15px' }}>{q}</span>
        <ChevronDown
          className={`h-5 w-5 text-ink-mid flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="pb-5 text-ink-mid" style={{ fontSize: '15px', lineHeight: '1.7' }}>
          {a}
        </div>
      )}
    </div>
  );
};

export const IndexUI = ({ logic }: IndexUIProps) => {
  const {
    filteredProducts,
    handleShowAllProducts
  } = logic;

  const { bundles } = useBundles();
  const heroRef = useScrollReveal();
  const problemRef = useScrollReveal();
  const howRef = useScrollReveal();
  const productsRef = useScrollReveal();
  const compareRef = useScrollReveal();
  const testimonialsRef = useScrollReveal();
  const reviewsRef = useScrollReveal();
  const recurRef = useScrollReveal();
  const faqRef = useScrollReveal();

  // Find products
  const sonaraOne = filteredProducts.find(p => p.slug === 'sonara-one');
  const sonaraTabs = filteredProducts.find(p => p.slug === 'sonara-tabs');

  const trustItems = [
    { icon: <Shield className="h-5 w-5" />, text: 'Tecnología de grado clínico' },
    { icon: <Star className="h-5 w-5" />, text: 'Recomendado por ortodoncistas' },
    { icon: <RefreshCw className="h-5 w-5" />, text: 'Garantía de 30 días' },
    { icon: <Package className="h-5 w-5" />, text: 'Apto para alineadores, retenedores, guardas y dentaduras' },
  ];

  const compareRows = [
    {
      feature: 'Elimina bacterias en microgrietas',
      sonara: true,
      cepillo: false,
      pastillas: 'partial',
      dentista: 'paid',
    },
    {
      feature: 'No daña ni raya el aparato',
      sonara: true,
      cepillo: false,
      pastillas: true,
      dentista: true,
    },
    {
      feature: 'Limpieza en 5 min sin tallar',
      sonara: true,
      cepillo: false,
      pastillas: false,
      dentista: false,
    },
    {
      feature: 'Elimina el mal olor',
      sonara: true,
      cepillo: 'partial',
      pastillas: 'partial',
      dentista: true,
    },
    {
      feature: 'Costo por limpieza',
      sonara: '$0',
      cepillo: '$$$',
      pastillas: '$$',
      dentista: '$$$$$',
    },
  ];

  const reviews = [
    {
      name: 'Mariana G.',
      location: 'CDMX',
      stars: 5,
      text: 'El agua quedó café oscuro después de 5 minutos y mi retenedor lo "lavaba" todos los días. Asco total pero ya no tengo que preocuparme.',
    },
    {
      name: 'Rodrigo V.',
      location: 'Monterrey',
      stars: 5,
      text: 'Tengo Invisalign y mis alineadores se ven igual de transparentes que cuando los estreno. Mis amigos me preguntan si los cambié.',
    },
    {
      name: 'Sofía M.',
      location: 'Guadalajara',
      stars: 5,
      text: 'Lo más bonito de mi baño sin duda. Aparte funciona increíble, en serio. Ya se lo regalé a mi mamá que usa prótesis.',
    },
    {
      name: 'Carlos T.',
      location: 'Querétaro',
      stars: 5,
      text: 'Súper fácil, lo lleno, presiono el botón y listo. Sin tallar nada, sin pastillas raras. Solo agua.',
    },
    {
      name: 'Daniela H.',
      location: 'CDMX',
      stars: 5,
      text: 'Mi ortodoncista me lo recomendó directamente. Llevo 3 meses usándolo y mis alineadores no se han amarillado nada.',
    },
    {
      name: 'Andrés P.',
      location: 'Puebla',
      stars: 5,
      text: 'Llegó en 3 días y el empaque es precioso. Se ve y se siente premium. Vale cada peso.',
    },
  ];

  const faqs = [
    {
      q: '¿Sirve para Invisalign o alineadores transparentes?',
      a: 'Sí, el Sonara One es ideal para alineadores Invisalign y cualquier aligner transparente. Las ondas ultrasónicas limpian sin rayar ni deformar el plástico, algo que el cepillo sí puede hacer.',
    },
    {
      q: '¿Funciona para guardas de bruxismo y dentaduras?',
      a: 'Sí, es compatible con guardas de noche (bruxismo), retenedores fijos y removibles, dentaduras completas y parciales. Si cabe en el tanque de 200ml, lo limpia.',
    },
    {
      q: '¿Daña mi retenedor o alineador?',
      a: 'No. La cavitación ultrasónica es una de las técnicas más suaves de limpieza. No hay fricción mecánica ni productos químicos agresivos. Tu aparato sale limpio, no desgastado.',
    },
    {
      q: '¿Necesito químicos o pastillas especiales?',
      a: 'No, solo necesitas agua de la llave. Las Sonara Tabs son opcionales y potencian la limpieza, pero el Sonara One funciona perfectamente solo con agua.',
    },
    {
      q: '¿Cuánto tarda el envío?',
      a: '2 a 5 días hábiles a todo México. Recibirás un número de rastreo por correo electrónico en cuanto salga tu pedido.',
    },
    {
      q: '¿Qué pasa si no me convence?',
      a: 'Tienes 30 días para probarlo. Si no quedas satisfecho, te devolvemos el 100% de tu dinero sin preguntas. Solo escríbenos.',
    },
    {
      q: '¿El dispositivo tiene garantía?',
      a: '12 meses de garantía contra defectos de fabricación. Si algo falla, lo reponemos sin costo.',
    },
    {
      q: '¿Cómo puedo pagar?',
      a: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, Amex), Mercado Pago, pago en efectivo en OXXO y meses sin intereses disponibles.',
    },
  ];

  return (
    <EcommerceTemplate showCart={true}>

      {/* 1 — Announcement Bar */}
      <div className="announcement-bar">
        Envío gratis a todo México 🇲🇽 · Garantía de 30 días o te devolvemos tu dinero
      </div>

      {/* 2 — Hero */}
      <section className="bg-bone overflow-hidden" ref={heroRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text */}
            <div className="order-2 lg:order-1">
              {/* Eyebrow */}
              <div className="scroll-reveal flex items-center gap-2 mb-5">
                <Stars />
                <span className="text-ink-mid text-sm font-medium">
                  Amado por personas con Invisalign, retenedores y guardas
                </span>
              </div>

              <h1
                className="scroll-reveal stagger-1 text-ink font-bold mb-5 leading-none"
                style={{ fontFamily: 'Sora, sans-serif', fontSize: 'clamp(36px, 5vw, 60px)', letterSpacing: '-0.03em' }}
              >
                Tu retenedor,{' '}
                <span className="text-aqua">limpio de verdad.</span>{' '}
                En 5 minutos.
              </h1>

              <p className="scroll-reveal stagger-2 text-ink-mid text-lg mb-8 max-w-lg" style={{ lineHeight: '1.7' }}>
                Sonara One usa ondas ultrasónicas de 42,000 Hz para eliminar bacterias, sarro y mal olor de tu aparato oral. Solo necesitas agua.
              </p>

              <div className="scroll-reveal stagger-3 flex flex-col sm:flex-row gap-3 mb-6">
                <Link to="/products/sonara-one" className="btn-sonara-primary text-base px-8 py-4">
                  <ShoppingCart className="h-4 w-4" />
                  Comprar Sonara One
                </Link>
                <button className="btn-sonara-secondary text-base px-7 py-4">
                  <Play className="h-4 w-4 fill-current" />
                  Ver cómo funciona
                </button>
              </div>

              <div className="scroll-reveal stagger-4 flex items-center gap-6 text-sm text-ink-mid">
                <span className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-aqua" />
                  Envío gratis
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-aqua" />
                  Paga con tarjeta, Mercado Pago o en OXXO
                </span>
              </div>
            </div>

            {/* Image */}
            <div className="scroll-reveal order-1 lg:order-2 relative">
              <div className="relative rounded-card-lg overflow-hidden shadow-sonara-lg">
                <img
                  src="/hero-device.webp"
                  alt="Sonara One — Limpiador ultrasónico en baño minimalista"
                  className="w-full h-auto object-cover"
                  loading="eager"
                  style={{ aspectRatio: '16/10' }}
                />
              </div>
              {/* Floating badge */}
              <div
                className="absolute -bottom-4 -left-4 bg-surface rounded-[18px] shadow-sonara-md px-5 py-3 flex items-center gap-3"
                style={{ border: '1.5px solid hsl(175 62% 85%)' }}
              >
                <div className="w-10 h-10 rounded-full bg-aqua-light flex items-center justify-center">
                  <span className="text-aqua font-bold text-lg">✓</span>
                </div>
                <div>
                  <div className="text-ink font-semibold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>42,000 Hz</div>
                  <div className="text-ink-mid text-xs">Tecnología ultrasónica</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 — Trust Strip */}
      <section className="bg-surface border-y border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {trustItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-aqua-light flex items-center justify-center flex-shrink-0 text-aqua">
                  {item.icon}
                </div>
                <span className="text-ink text-sm font-medium leading-tight">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 — Problem Section */}
      <section className="bg-ice-blue py-section" ref={problemRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2
                className="scroll-reveal text-ink font-bold mb-5"
                style={{ fontFamily: 'Sora, sans-serif', fontSize: 'clamp(28px, 3.5vw, 44px)', letterSpacing: '-0.025em' }}
              >
                Cepillarlo no es suficiente.
              </h2>
              <p className="scroll-reveal stagger-1 text-ink-mid text-lg mb-6" style={{ lineHeight: '1.75' }}>
                Tu retenedor pasa horas en tu boca acumulando bacterias, placa y sarro invisible. El cepillo lo raya, las pastillas solas no llegan a las microgrietas, y el resultado es ese color amarillento y el mal olor que ya conoces.
              </p>
              <div className="scroll-reveal stagger-2 inline-flex items-center gap-2 badge-sonara">
                <span>🔬</span> Confirmado por estudios de microbiología dental
              </div>
            </div>
            <div className="scroll-reveal stagger-1">
              <div className="rounded-card-lg overflow-hidden shadow-sonara-md">
                <img
                  src="/before-after-water.webp"
                  alt="Agua turbia vs. agua limpia — resultado de 5 minutos en Sonara One"
                  className="w-full h-auto"
                />
              </div>
              <p className="text-center text-ink-mid text-sm mt-3 italic">
                Esto es lo que sale de un retenedor "limpio" después de 5 minutos en Sonara One.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5 — How It Works */}
      <section className="bg-surface py-section" ref={howRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2
              className="scroll-reveal text-ink font-bold mb-4"
              style={{ fontFamily: 'Sora, sans-serif', fontSize: 'clamp(28px, 3.5vw, 44px)', letterSpacing: '-0.025em' }}
            >
              Ciencia simple. Resultados visibles.
            </h2>
            <p className="scroll-reveal stagger-1 text-ink-mid text-lg max-w-xl mx-auto">
              Tres pasos. Cinco minutos. Sin esfuerzo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-10">
            {[
              {
                step: '01',
                title: 'Llénalo con agua',
                desc: 'Agua de la llave. Sin químicos agresivos, sin tallar. El tanque de 200ml está diseñado para tu aparato.',
                icon: '💧',
              },
              {
                step: '02',
                title: 'Presiona un botón',
                desc: '42,000 ondas ultrasónicas por segundo generan microburbujas que se colapsan miles de veces por segundo (cavitación), despegando bacterias y placa de cada microgrieta.',
                icon: '⚡',
              },
              {
                step: '03',
                title: 'Listo en 5 minutos',
                desc: 'Tu aparato sale limpio a nivel microscópico, transparente y sin olor. Sin desgastarlo. El Sonara One se apaga solo.',
                icon: '✨',
              },
            ].map((step, i) => (
              <div key={i} className={`scroll-reveal stagger-${i + 1} card-sonara p-7 relative`}>
                <div
                  className="text-7xl font-bold mb-5 leading-none"
                  style={{ fontFamily: 'Sora, sans-serif', color: 'hsl(175 62% 88%)', letterSpacing: '-0.04em' }}
                >
                  {step.step}
                </div>
                <div className="text-3xl mb-3">{step.icon}</div>
                <h3
                  className="text-ink font-semibold text-lg mb-3"
                  style={{ fontFamily: 'Sora, sans-serif' }}
                >
                  {step.title}
                </h3>
                <p className="text-ink-mid text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/products/sonara-one" className="btn-sonara-ghost">
              Conoce la tecnología <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Bubbles visual */}
          <div className="mt-12 rounded-card-lg overflow-hidden shadow-sonara-md max-w-2xl mx-auto">
            <img
              src="/bubbles-macro.webp"
              alt="Cavitación ultrasónica — microburbujas limpiando a 42,000 Hz"
              className="w-full h-48 object-cover"
            />
          </div>
        </div>
      </section>

      {/* 6 — Products Section */}
      <section className="bg-bone py-section" ref={productsRef} id="products">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2
              className="scroll-reveal text-ink font-bold mb-4"
              style={{ fontFamily: 'Sora, sans-serif', fontSize: 'clamp(28px, 3.5vw, 44px)', letterSpacing: '-0.025em' }}
            >
              Elige tu Sonara.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
            {/* Card 1: Sonara One */}
            <div className="scroll-reveal card-sonara overflow-hidden">
              <div className="relative">
                <img
                  src="/hero-device.webp"
                  alt="Sonara One"
                  className="w-full h-52 object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="badge-sonara badge-sonara-ink">El original</span>
                </div>
              </div>
              <div className="p-6">
                <div className="text-xs text-ink-mid mb-1 uppercase tracking-widest font-medium">Limpiador Ultrasónico</div>
                <h3 className="text-ink font-bold text-xl mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Sonara One</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-ink font-bold text-2xl" style={{ fontFamily: 'Sora, sans-serif' }}>$1,099</span>
                  <span className="text-ink-mid line-through text-base">$1,499</span>
                  <span className="badge-sonara">-27%</span>
                </div>
                <div className="flex gap-2 mb-5">
                  <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-pill border border-border font-medium text-ink hover:border-ink transition-colors">
                    <span className="w-3 h-3 rounded-full bg-surface border border-gray-300 inline-block" />
                    Blanco Ártico
                  </button>
                  <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-pill border border-border font-medium text-ink hover:border-ink transition-colors">
                    <span className="w-3 h-3 rounded-full bg-gray-800 inline-block" />
                    Negro Grafito
                  </button>
                </div>
                <Link to="/products/sonara-one" className="btn-sonara-primary w-full text-sm py-3">
                  <ShoppingCart className="h-4 w-4" />
                  Agregar al carrito
                </Link>
              </div>
            </div>

            {/* Card 2: Bundle — HIGHLIGHTED */}
            <div className="scroll-reveal stagger-1 card-sonara-elevated overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-aqua rounded-t-[22px]" />
              <div className="relative">
                <img
                  src="/device-colors.webp"
                  alt="Bundle Sonara One + Tabs"
                  className="w-full h-52 object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="badge-sonara" style={{ background: 'hsl(175 62% 61%)', color: 'white' }}>
                    Mejor valor · Ahorra $149
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="text-xs text-aqua mb-1 uppercase tracking-widest font-medium">Bundle Especial</div>
                <h3 className="text-ink font-bold text-xl mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>Sonara One + Tabs</h3>
                <p className="text-ink-mid text-sm mb-3">Dispositivo + 60 tabletas potenciadoras</p>
                <div className="flex items-baseline gap-2 mb-5">
                  <span className="text-ink font-bold text-2xl" style={{ fontFamily: 'Sora, sans-serif' }}>$1,249</span>
                  <span className="text-ink-mid line-through text-base">$1,398</span>
                </div>
                <Link to="/products/sonara-one" className="btn-sonara-aqua w-full text-sm py-3">
                  <ShoppingCart className="h-4 w-4" />
                  Agregar al carrito
                </Link>
              </div>
            </div>

            {/* Card 3: Sonara Tabs */}
            <div className="scroll-reveal stagger-2 card-sonara overflow-hidden">
              <div className="relative">
                <img
                  src="/sonara-tabs.webp"
                  alt="Sonara Tabs — 60 tabletas efervescentes"
                  className="w-full h-52 object-cover"
                />
              </div>
              <div className="p-6">
                <div className="text-xs text-ink-mid mb-1 uppercase tracking-widest font-medium">Consumible</div>
                <h3 className="text-ink font-bold text-xl mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>Sonara Tabs</h3>
                <p className="text-ink-mid text-sm mb-3">60 tabletas efervescentes de limpieza profunda</p>
                <div className="flex items-baseline gap-2 mb-5">
                  <span className="text-ink font-bold text-2xl" style={{ fontFamily: 'Sora, sans-serif' }}>$299</span>
                </div>
                <Link to="/products/sonara-tabs" className="btn-sonara-secondary w-full text-sm py-3">
                  <ShoppingCart className="h-4 w-4" />
                  Agregar al carrito
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7 — Comparison Table */}
      <section className="bg-mint-pale py-section" ref={compareRef}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="scroll-reveal text-ink font-bold mb-4"
              style={{ fontFamily: 'Sora, sans-serif', fontSize: 'clamp(28px, 3.5vw, 44px)', letterSpacing: '-0.025em' }}
            >
              No hay comparación.
            </h2>
          </div>

          <div className="scroll-reveal card-sonara overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-5 text-ink-mid font-medium w-1/3">Característica</th>
                    <th className="py-4 px-4 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        <span className="badge-sonara" style={{ background: 'hsl(175 62% 61%)', color: 'white' }}>Sonara One</span>
                      </div>
                    </th>
                    <th className="py-4 px-4 text-center text-ink-mid font-medium">Cepillo + pasta</th>
                    <th className="py-4 px-4 text-center text-ink-mid font-medium">Solo pastillas</th>
                    <th className="py-4 px-4 text-center text-ink-mid font-medium">Dentista</th>
                  </tr>
                </thead>
                <tbody>
                  {compareRows.map((row, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-bone transition-colors">
                      <td className="py-4 px-5 text-ink font-medium">{row.feature}</td>
                      <td className="py-4 px-4 text-center bg-mint-pale">
                        {row.sonara === true ? (
                          <Check className="h-5 w-5 text-aqua mx-auto" strokeWidth={2.5} />
                        ) : typeof row.sonara === 'string' ? (
                          <span className="text-ink font-semibold text-sm">{row.sonara}</span>
                        ) : (
                          <X className="h-5 w-5 text-red-400 mx-auto" strokeWidth={2.5} />
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {row.cepillo === true ? (
                          <Check className="h-5 w-5 text-aqua mx-auto" strokeWidth={2.5} />
                        ) : row.cepillo === false ? (
                          <X className="h-5 w-5 text-red-400 mx-auto" strokeWidth={2.5} />
                        ) : row.cepillo === 'partial' ? (
                          <Minus className="h-5 w-5 text-yellow-400 mx-auto" strokeWidth={2.5} />
                        ) : (
                          <span className="text-ink-mid text-sm">{row.cepillo}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {row.pastillas === true ? (
                          <Check className="h-5 w-5 text-aqua mx-auto" strokeWidth={2.5} />
                        ) : row.pastillas === false ? (
                          <X className="h-5 w-5 text-red-400 mx-auto" strokeWidth={2.5} />
                        ) : row.pastillas === 'partial' ? (
                          <Minus className="h-5 w-5 text-yellow-400 mx-auto" strokeWidth={2.5} />
                        ) : (
                          <span className="text-ink-mid text-sm">{row.pastillas}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {row.dentista === true ? (
                          <Check className="h-5 w-5 text-aqua mx-auto" strokeWidth={2.5} />
                        ) : row.dentista === false ? (
                          <X className="h-5 w-5 text-red-400 mx-auto" strokeWidth={2.5} />
                        ) : row.dentista === 'paid' ? (
                          <span className="text-ink-mid text-sm">Solo en clínica</span>
                        ) : (
                          <span className="text-ink-mid text-sm">{row.dentista}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 8 — Professional Validation */}
      <section className="bg-surface py-section" ref={testimonialsRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="scroll-reveal text-ink font-bold mb-4"
              style={{ fontFamily: 'Sora, sans-serif', fontSize: 'clamp(28px, 3.5vw, 44px)', letterSpacing: '-0.025em' }}
            >
              Respaldado por especialistas.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Dra. Fernanda Rojas',
                role: 'Ortodoncista · Clínica Sonrisas CDMX',
                quote: '"Recomiendo Sonara One a todos mis pacientes con Invisalign. La higiene de los alineadores es tan importante como el tratamiento mismo."',
              },
              {
                name: 'Dr. Alejandro Méndez',
                role: 'Odontólogo · ConsultaDental MTY',
                quote: '"La tecnología de cavitación es clínicamente comprobada para remover biofilm. Sonara One la hace accesible para todos mis pacientes."',
              },
              {
                name: 'Dra. Valeria Cruz',
                role: 'Protesista Dental · GDL',
                quote: '"Para pacientes con prótesis, Sonara One ha sido un cambio total. Llegan a consulta con sus dentaduras notablemente más limpias."',
              },
            ].map((t, i) => (
              <div key={i} className={`scroll-reveal stagger-${i + 1} card-sonara p-7`}>
                <div
                  className="text-4xl font-bold text-aqua mb-4 leading-none"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  "
                </div>
                <p className="text-ink text-base mb-5 leading-relaxed italic">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-ice-blue flex items-center justify-center text-blue-primary font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-ink font-semibold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>{t.name}</div>
                    <div className="text-ink-mid text-xs">{t.role}</div>
                  </div>
                </div>
                <p className="text-xs text-ink-mid mt-3 opacity-60">[PENDIENTE: testimonio real verificado]</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9 — Customer Reviews */}
      <section className="bg-ice-blue py-section" ref={reviewsRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="scroll-reveal text-ink font-bold mb-4"
              style={{ fontFamily: 'Sora, sans-serif', fontSize: 'clamp(28px, 3.5vw, 44px)', letterSpacing: '-0.025em' }}
            >
              Lo que dicen quienes ya lo usan.
            </h2>
            <div className="scroll-reveal stagger-1 flex items-center justify-center gap-2">
              <Stars />
              <span className="text-ink font-semibold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>4.9</span>
              <span className="text-ink-mid">de 312 reseñas</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.map((review, i) => (
              <div key={i} className={`scroll-reveal stagger-${Math.min(i + 1, 4)} card-sonara p-6`}>
                <div className="flex items-center justify-between mb-3">
                  <Stars count={review.stars} />
                  <span className="text-xs text-aqua font-medium">Compra verificada ✓</span>
                </div>
                <p className="text-ink text-sm leading-relaxed mb-4">"{review.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center text-blue-primary font-bold text-sm">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-ink font-semibold text-sm">{review.name}</div>
                    <div className="text-ink-mid text-xs">{review.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-ink-mid mt-6 opacity-60">[PENDIENTE: reemplazar con reseñas reales de clientes]</p>
        </div>
      </section>

      {/* 10 — Recurrence Teaser */}
      <section className="bg-ink py-section" ref={recurRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2
                className="scroll-reveal font-bold mb-5"
                style={{ fontFamily: 'Sora, sans-serif', fontSize: 'clamp(28px, 3.5vw, 44px)', letterSpacing: '-0.025em', color: 'white' }}
              >
                Nunca te quedes sin limpieza profunda.
              </h2>
              <p className="scroll-reveal stagger-1 text-lg mb-8" style={{ color: 'hsl(0 0% 100% / 0.75)', lineHeight: '1.75' }}>
                Las Sonara Tabs potencian cada ciclo con limpieza efervescente de grado clínico. Suscríbete y recibe tus tabletas cada mes con 15% de descuento y envío gratis.
              </p>
              <div className="scroll-reveal stagger-2 flex flex-col sm:flex-row gap-3">
                <Link to="/products/sonara-tabs" className="btn-sonara-white">
                  Conocer Sonara Tabs
                </Link>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'hsl(0 0% 100% / 0.6)' }}>
                  <Shield className="h-4 w-4" />
                  Cancela cuando quieras
                </div>
              </div>
            </div>
            <div className="scroll-reveal stagger-1">
              <div className="rounded-card-lg overflow-hidden shadow-sonara-lg">
                <img
                  src="/sonara-tabs.webp"
                  alt="Sonara Tabs — 60 tabletas efervescentes de limpieza profunda"
                  className="w-full h-64 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11 — FAQ */}
      <section className="bg-surface py-section" ref={faqRef}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="scroll-reveal text-ink font-bold mb-4"
              style={{ fontFamily: 'Sora, sans-serif', fontSize: 'clamp(28px, 3.5vw, 44px)', letterSpacing: '-0.025em' }}
            >
              Preguntas frecuentes
            </h2>
          </div>
          <div className="scroll-reveal">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* 12 — Newsletter */}
      <section className="bg-mint-pale py-16">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-ink font-bold mb-3"
            style={{ fontFamily: 'Sora, sans-serif', fontSize: '28px', letterSpacing: '-0.02em' }}
          >
            Recibe 10% de descuento en tu primer pedido
          </h2>
          <p className="text-ink-mid mb-6">Suscríbete y te enviamos un código exclusivo para estrenar tu Sonara.</p>
          <form className="flex gap-3 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="tu@correo.com"
              className="flex-1 px-4 py-3 rounded-pill border border-border text-ink placeholder:text-ink-mid text-sm focus:outline-none focus:ring-2 focus:ring-aqua bg-surface"
            />
            <button type="submit" className="btn-sonara-primary text-sm py-3 px-5">
              Obtener 10%
            </button>
          </form>
          <p className="text-xs text-ink-mid mt-3 opacity-70">Sin spam. Cancela cuando quieras.</p>
        </div>
      </section>

    </EcommerceTemplate>
  );
};