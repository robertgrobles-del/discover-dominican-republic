import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  MapPin, Star, Clock, Music, Users, Shield, Share2,
  Wine, CheckCircle2, ShieldCheck, HelpCircle, ChevronDown, ChevronUp, GlassWater
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead, generateRestaurantSchema } from "@/components/SEOHead";
import { getBarBySlug, Bar } from "@/data/bars";
import { CatalogService } from "@/services/catalogService";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { BarHeroSlider } from "@/components/bar/BarHeroSlider";
import { BarCocktailsGrid } from "@/components/bar/BarCocktailsGrid";
import { BarWeeklyLineup } from "@/components/bar/BarWeeklyLineup";
import { BarVipBookingCard } from "@/components/bar/BarVipBookingCard";
import { DetailFloatingBar } from "@/components/detail/DetailFloatingBar";
import { CommentSection } from "@/components/comments/CommentSection";
import { PlaceActions, scrollToSection } from "@/components/detail/PlaceActions";
import { Martini, Navigation } from "lucide-react";
import { calculateOpenStatus } from "@/lib/openStatus";
import { usePageContent } from "@/lib/pageContent";

const barTypeLabels: Record<Bar['barType'], string> = {
  'cocktail-bar': 'Cocktail Bar & Mixología',
  'lounge': 'Lounge Sofisticado',
  'nightclub': 'Discoteca & Club VIP',
  'beach-bar': 'Beach Club & Bar de Playa',
  'rooftop': 'Rooftop Bar con Vistas Panorámicas',
  'sports-bar': 'Sports Bar & Grill',
  'pub': 'Pub & Cervecería Artesanal'
};

const faqsNightlife = [
  {
    q: "¿Se exige código de vestimenta estricto?",
    a: "Para discotecas y rooftops rige código Smart Casual / Elegante. No se permite el acceso en chancletas, camisetas sin mangas para caballeros ni ropa deportiva."
  },
  {
    q: "¿Cómo funciona la reserva de Mesa VIP o Bottle Service?",
    a: "Al solicitar mesa VIP obtienes acceso preferencial sin fila para tu grupo y crédito consumible en botellas y mixers de alta gama."
  },
  {
    q: "¿Cuál es la edad mínima requerida?",
    a: "La edad mínima legal en República Dominicana es 18 años. Se requiere documento de identidad con foto vigente (Cédula o Pasaporte) en puerta."
  },
  {
    q: "¿Tienen servicio de taxi o Uber accesible?",
    a: "Sí, el lugar cuenta con parada de taxis seguros autorizados y punto de recogida directo para Uber en la entrada principal."
  }
];

export default function BarDetalle() {
  const pc = usePageContent("bar-detalle");
  const barTypeLabels = pc.data("barTypeLabels", __pcData.barTypeLabels);
  const faqsNightlife = pc.data("faqsNightlife", __pcData.faqsNightlife);
  const { slug: id } = useParams<{ slug: string }>();
  const staticBar = id ? getBarBySlug(id) : undefined;
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Fetch via CatalogService if not found in static data
  const { data: dbBar, isLoading } = useQuery({
    queryKey: ['bar-detail', id],
    queryFn: async () => {
      if (!id || staticBar) return null;
      return CatalogService.getBarBySlug(id);
    },
    enabled: !!id && !staticBar,
  });

  // Merge: static takes priority, CatalogService as fallback
  const rawBar: Bar | undefined = staticBar || (dbBar ? {
    id: dbBar.id,
    slug: dbBar.slug || dbBar.id,
    name: dbBar.name,
    destinationId: dbBar.destinationId || (dbBar as any).destination_id || '',
    destinationName: dbBar.destinationName || '',
    province: dbBar.province || '',
    barType: (dbBar.barType || (dbBar as any).bar_type || 'cocktail-bar') as Bar['barType'],
    musicStyle: dbBar.musicStyle || (dbBar as any).music_style || ['Latina', 'Internacional'],
    priceRange: (dbBar.priceRange || (dbBar as any).price_range || '$$') as Bar['priceRange'],
    rating: Number(dbBar.rating) || 4.5,
    reviewCount: dbBar.reviewCount || (dbBar as any).review_count || 50,
    shortDescription: dbBar.shortDescription || (dbBar as any).short_description || '',
    description: dbBar.description || '',
    address: dbBar.address || '',
    openingHours: dbBar.openingHours || (dbBar as any).opening_hours || '',
    phone: dbBar.phone,
    instagram: dbBar.instagram,
    website: dbBar.website,
    minimumAge: dbBar.minimumAge || (dbBar as any).minimum_age || 18,
    dressCode: dbBar.dressCode || (dbBar as any).dress_code || 'Smart Casual',
    hasCover: dbBar.hasCover ?? (dbBar as any).has_cover ?? false,
    coverPrice: dbBar.coverPrice || (dbBar as any).cover_price,
    features: dbBar.features || [],
    imageUrl: dbBar.imageUrl || (dbBar as any).image_url || '/placeholder.svg',
    gallery: dbBar.gallery || [],
    latitude: dbBar.latitude ? Number(dbBar.latitude) : undefined,
    longitude: dbBar.longitude ? Number(dbBar.longitude) : undefined,
    isFeatured: dbBar.isFeatured ?? (dbBar as any).is_featured ?? false,
  } : undefined);
  // Una ficha que viene del backend puede no traer las listas opcionales: sin esto la página se caía.
  const bar = rawBar && { ...rawBar, features: rawBar.features ?? [], gallery: rawBar.gallery ?? [], musicStyle: rawBar.musicStyle ?? [] };

  // WhatsApp sólo con el teléfono del propio local: nunca un número genérico.
  const barPhone = bar?.phone?.replace(/\D/g, "") ?? "";
  const barWhatsapp = barPhone.length >= 10 ? `https://wa.me/${barPhone}?text=${encodeURIComponent(`Hola, vi ${bar?.name} en Descubre República Dominicana y quisiera consultar disponibilidad y horario.`)}` : undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center text-muted-foreground">{pc.tx("div.1", "Cargando detalles de vida nocturna...")}</div>
        <Footer />
      </div>
    );
  }

  if (!bar) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-32 text-center max-w-md">
            <GlassWater className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-3 text-foreground">{pc.tx("h1.1", "Establecimiento no encontrado")}</h1>
            <p className="text-muted-foreground mb-6 text-sm">{pc.tx("p.1", "El bar o discoteca que buscas no está disponible actualmente.")}</p>
            <Button asChild className="rounded-xl"><Link to="/vida-nocturna">{pc.tx("Link.1", "Explorar Vida Nocturna")}</Link></Button>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  const allImages = [bar.imageUrl, ...bar.gallery].filter(Boolean);

  return (
    <PageTransition>
      <SEOHead
        title={`${bar.name} - Vida Nocturna & Bares en RD`}
        description={bar.shortDescription || bar.description?.slice(0, 160)}
        keywords={`bar, discoteca, vida nocturna, ${bar.name}, ${bar.musicStyle.join(', ')}`}
        image={bar.imageUrl}
        jsonLd={generateRestaurantSchema({
          name: bar.name,
          description: bar.shortDescription || bar.description,
          image: bar.imageUrl,
          priceRange: bar.priceRange,
          rating: bar.rating,
          address: bar.address,
          cuisine: `${barTypeLabels[bar.barType]} - Música: ${bar.musicStyle.join(', ')}`,
        })}
      />

      <div className="min-h-screen bg-background text-foreground">
        <Header hasHero />

        {/* Hero Slider with ONLY bar's own images */}
        <BarHeroSlider
          images={allImages}
          name={bar.name}
          location={bar.destinationName || bar.address}
          destinationSlug={bar.destinationId}
          destinationName={bar.destinationName}
          rating={bar.rating}
          categoryLabel={barTypeLabels[bar.barType] || bar.barType}
          minimumAge={bar.minimumAge}
          favoriteId={bar.id}
        />

        {/* Action / Meta Bar */}
        <section className="border-b border-border/60 bg-card/40 backdrop-blur-sm">
          <div className="container mx-auto px-4 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{bar.musicStyle.join(' • ')}</span>
              <span>•</span>
              <span className="text-primary font-bold">{bar.priceRange}{" "}{pc.tx("span.1", "(Gama de Consumo)")}</span>
              <span>•</span>
              <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold px-2 py-0.5 rounded-md border border-purple-500/20 text-xs">
                {bar.dressCode || 'Smart Casual'}
              </span>
              <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold px-2 py-0.5 rounded-md border border-amber-500/20 text-xs">
                {bar.minimumAge}{pc.tx("span.2", "+ Exclusivo")}</span>
              <span className="bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-md border border-primary/20 text-xs">{pc.tx("span.3", "Noches con DJ y en vivo")}</span>
              <span>•</span>
              {(() => {
                const status = calculateOpenStatus(bar.openingHours);
                return (
                  <Badge variant="outline" className={`text-2xs font-bold gap-1 ${status.badgeClass}`}>
                    <Clock className="h-3 w-3" />
                    {status.statusLabel}
                  </Badge>
                );
              })()}
              {bar.address && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-xs"><MapPin className="h-3.5 w-3.5 text-primary" /> {bar.address}</span>
                </>
              )}
            </div>

            <PlaceActions
              primary={{ label: "Menú de bebidas", icon: Martini, onClick: () => scrollToSection("bar-drinks-section") }}
              secondary={[
                { label: "Horario", icon: Clock, onClick: () => scrollToSection("bar-schedule-card") },
                ...(bar.address ? [{ label: "Cómo llegar", icon: Navigation, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${bar.name} ${bar.address}`)}` }] : []),
              ]}
              whatsappUrl={barWhatsapp}
              shareTitle={bar.name}
              claim={{ name: bar.name, type: "bar", id: bar.id }}
            />
          </div>
        </section>

        {/* Main Content Layout */}
        <main className="container mx-auto px-4 lg:px-8 py-10">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left Column (8 cols) */}
            <div className="lg:col-span-8 space-y-10">
              
              {/* Quick Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-card rounded-2xl p-4 border border-border text-center shadow-xs">
                  <Music className="h-5 w-5 text-primary mx-auto mb-1.5" />
                  <p className="text-3xs text-muted-foreground uppercase font-bold">{pc.tx("p.2", "Música")}</p>
                  <p className="text-sm font-bold text-foreground truncate">{bar.musicStyle[0] || 'Variada'}</p>
                </div>
                <div className="bg-card rounded-2xl p-4 border border-border text-center shadow-xs">
                  <Users className="h-5 w-5 text-purple-500 mx-auto mb-1.5" />
                  <p className="text-3xs text-muted-foreground uppercase font-bold">{pc.tx("p.3", "Edad Mínima")}</p>
                  <p className="text-sm font-bold text-foreground">+{bar.minimumAge}{" "}{pc.tx("p.4", "Años")}</p>
                </div>
                <div id="bar-schedule-card" className="bg-card rounded-2xl p-4 border border-border text-center shadow-xs ring-1 ring-primary/20">
                  <Clock className="h-5 w-5 text-primary mx-auto mb-1.5" />
                  <p className="text-3xs text-muted-foreground uppercase font-bold">{pc.tx("p.5", "Horario & Cierre")}</p>
                  <p className="text-sm font-bold text-foreground truncate">{bar.openingHours || '20:00 - 04:00'}</p>
                </div>
                <div className="bg-card rounded-2xl p-4 border border-border text-center shadow-xs">
                  <Star className="h-5 w-5 text-amber-400 fill-amber-400 mx-auto mb-1.5" />
                  <p className="text-3xs text-muted-foreground uppercase font-bold">{pc.tx("p.6", "Calificación")}</p>
                  <p className="text-sm font-bold text-foreground">{bar.rating} / 5.0</p>
                </div>
              </div>

              {/* Description & Ambience */}
              <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm space-y-4">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2.5">
                  <Wine className="h-6 w-6 text-primary" />{pc.tx("h2.1", "El Concepto y la Experiencia")}</h2>
                <p className="text-muted-foreground leading-relaxed text-base md:text-lg whitespace-pre-line">
                  {bar.description || "Un espacio vibrante que combina cócteles de autor, la mejor selección musical y un ambiente electrizante para vivir noches inolvidables en República Dominicana."}
                </p>
                
                {bar.features.length > 0 && (
                  <div className="pt-4 border-t border-border/60">
                    <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">{pc.tx("p.7", "Amenidades & Servicios del Local")}</p>
                    <div className="flex flex-wrap gap-2">
                      {bar.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="bg-muted/70 text-foreground py-1 px-3 rounded-lg text-xs font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-primary" /> {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Signature Cocktails / Drinks Menu */}
              <div id="bar-drinks-section">
                <BarCocktailsGrid />
              </div>

              {/* Weekly Lineup & Events */}
              <BarWeeklyLineup />

              {/* FAQs */}
              <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm">
                <h3 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                  <HelpCircle className="h-6 w-6 text-primary" />{pc.tx("h3.1", "Preguntas Frecuentes")}</h3>
                
                <div className="space-y-3">
                  {faqsNightlife.map((faq, idx) => {
                    const isOpen = expandedFaq === idx;
                    return (
                      <div key={idx} className="border border-border rounded-2xl overflow-hidden">
                        <button
                          onClick={() => setExpandedFaq(isOpen ? null : idx)}
                          className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm text-foreground hover:bg-muted/30 transition-colors"
                        >
                          <span>{faq.q}</span>
                          {isOpen ? <ChevronUp className="h-4 w-4 text-primary shrink-0 ml-2" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />}
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed bg-muted/10 border-t border-border/40"
                            >
                              {faq.a}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Comments & Reviews */}
              <div className="pt-4">
                <CommentSection
                  contentId={bar.id}
                  contentType="bar"
                  title={`Opiniones sobre ${bar.name}`}
                />
              </div>

            </div>

            {/* Right Column (4 cols - VIP Booking Card) */}
            <div className="lg:col-span-4">
              <BarVipBookingCard
                barName={bar.name}
                phone={bar.phone}
                instagram={bar.instagram}
                address={bar.address}
                openingHours={bar.openingHours}
              />
            </div>

          </div>
        </main>

        {/* Mobile Sticky Floating Bar (orientado al CTA principal de la discoteca) */}
        <DetailFloatingBar 
          priceLabel={bar.hasCover ? "Cover estimado" : "Acceso"}
          priceValue={bar.hasCover ? `$${bar.coverPrice} USD` : "Entrada Libre"}
          primaryActionLabel="Reservar VIP & Botellas"
          onPrimaryAction={() => {
            const vipElement = document.getElementById("vip-lead-name");
            if (vipElement) {
              vipElement.scrollIntoView({ behavior: "smooth", block: "center" });
              vipElement.focus();
            }
          }}
        />

        <Footer />
      </div>
    </PageTransition>
  );
}

// Datos del módulo editables desde el panel (ver pc.data en src/lib/pageContent.ts).
const __pcData = { barTypeLabels, faqsNightlife };
