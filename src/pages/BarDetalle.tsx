import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, Star, Clock, Music, Users, Calendar, Phone, Instagram, 
  ChevronRight, Ticket, Wine, Shield, Car, Share2,
  CheckCircle2, Flame, Volume2, ShieldCheck, ExternalLink, HelpCircle,
  ChevronDown, ChevronUp, GlassWater, PartyPopper, Disc3, Compass, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { FavoriteButton } from "@/components/FavoriteButton";
import { SEOHead } from "@/components/SEOHead";
import { Lightbox } from "@/components/ui/lightbox";
import { getBarBySlug, Bar } from "@/data/bars";
import { getHotelsByDestination } from "@/data/hotels";
import { getRestaurantsByDestination } from "@/data/restaurants";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { DetailPageSidebarAd, InlineAd, MobileStickyFooterAd } from "@/components/promo";
import { BarHeroSlider } from "@/components/bar/BarHeroSlider";

const barTypeLabels: Record<Bar['barType'], string> = {
  'cocktail-bar': 'Cocktail Bar & Mixología',
  'lounge': 'Lounge Sofisticado',
  'nightclub': 'Discoteca & Club VIP',
  'beach-bar': 'Beach Club & Bar de Playa',
  'rooftop': 'Rooftop Bar con Vistas Panorámicas',
  'sports-bar': 'Sports Bar & Grill',
  'pub': 'Pub & Cervecería Artesanal'
};

const weeklyLineup = [
  { day: "Jueves", title: "Noche de Ritmos Latinos", desc: "Bachata sensual, salsa brava y cócteles 2x1 hasta la medianoche con banda en vivo.", time: "20:00 - 02:00", badge: "Live Band" },
  { day: "Viernes", title: "Sunset to Sunrise Sessions", desc: "DJ Set internacional de Deep House, Afrobeat y Tech-House con show de luces.", time: "21:00 - 04:00", badge: "Guest DJ" },
  { day: "Sábado", title: "Glow VIP Saturday", desc: "La fiesta más cotizada del destino con servicio de botellas premium y show temático.", time: "22:00 - 05:00", badge: "Top Night" },
  { day: "Domingo", title: "Sunset Chill & Cocktails", desc: "Tarde relajada al atardecer con mixología botánica y ritmos acústicos.", time: "17:00 - 01:00", badge: "Chillout" }
];

const signatureCocktails = [
  { name: "Caribe Fusión Passion", desc: "Ron Dominicano Extra Añejo, maracuyá fresca, jarabe de jengibre y toque de prosecco.", price: "$14 USD", strength: "Medio" },
  { name: "Mamajuana Old Fashioned", desc: "Infusión artesanal de hierbas y raíces dominicanas, amargo de angostura y piel de naranja flameada.", price: "$16 USD", strength: "Fuerte" },
  { name: "Santo Domingo Mezcalita", desc: "Mezcal ahumado, piña asada al carbón, jugo de lima criolla y sal de gusano/chile tajín.", price: "$15 USD", strength: "Equilibrado" },
  { name: "Coco Loco Royal", desc: "Crema de coco natural de Samaná, ron blanco, agua con gas y esencia de menta silvestre.", price: "$12 USD", strength: "Refrescante" }
];

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
  const { slug: id } = useParams<{ slug: string }>();
  const staticBar = id ? getBarBySlug(id) : undefined;
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [vipZone, setVipZone] = useState("Mesa VIP Pista");
  const [guestCount, setGuestCount] = useState("4");
  const [vipName, setVipName] = useState("");
  const [vipDate, setVipDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Fetch from DB if not found in static data
  const { data: dbBar, isLoading } = useQuery({
    queryKey: ['bar-detail', id],
    queryFn: async () => {
      const { data } = await supabase.from('bars').select('*').eq('slug', id!).maybeSingle();
      return data;
    },
    enabled: !!id && !staticBar,
  });

  // Merge: static takes priority, DB as fallback
  const bar: Bar | undefined = staticBar || (dbBar ? {
    id: dbBar.id,
    slug: dbBar.slug || id || '',
    name: dbBar.name,
    description: dbBar.description || '',
    shortDescription: dbBar.short_description || '',
    imageUrl: dbBar.image_url || '/placeholder.svg',
    gallery: dbBar.gallery || [],
    barType: (dbBar.bar_type as Bar['barType']) || 'lounge',
    musicStyle: dbBar.music_style ? dbBar.music_style.split(',').map((s: string) => s.trim()) : ['Latin', 'House', 'Urban'],
    address: dbBar.address || '',
    destinationId: dbBar.destination_id || '',
    destinationName: 'República Dominicana',
    province: '',
    rating: Number(dbBar.rating) || 4.8,
    reviewCount: dbBar.review_count || 320,
    priceRange: (dbBar.price_range || '$$$') as Bar['priceRange'],
    openingHours: dbBar.opening_hours || 'Mié-Dom 20:00 - 04:00',
    minimumAge: dbBar.minimum_age || 18,
    dressCode: dbBar.dress_code || 'Smart Casual',
    phone: dbBar.phone || '+1 809-555-0188',
    website: dbBar.website || '',
    services: dbBar.services || ['Coctelería de autor', 'Zona VIP', 'Valet Parking', 'Seguridad privada'],
  } : undefined);

  const nearbyHotels = useMemo(
    () => (bar?.destinationId ? getHotelsByDestination(bar.destinationId) : []),
    [bar?.destinationId]
  );
  const nearbyRestaurants = useMemo(
    () => (bar?.destinationId ? getRestaurantsByDestination(bar.destinationId) : []),
    [bar?.destinationId]
  );

  if (isLoading && !staticBar) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-32 text-center">
            <div className="animate-pulse text-muted-foreground flex flex-col items-center gap-3">
              <PartyPopper className="h-10 w-10 text-primary animate-spin" />
              <span>Cargando experiencia nocturna...</span>
            </div>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  if (!bar) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-32 text-center max-w-md">
            <Wine className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-3 text-foreground">Local no encontrado</h1>
            <p className="text-muted-foreground mb-6 text-sm">El bar o discoteca que buscas no existe o ha cambiado de ubicación.</p>
            <Link to="/vida-nocturna">
              <Button className="rounded-xl">Explorar Vida Nocturna</Button>
            </Link>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  const allImages = [bar.imageUrl, ...bar.gallery].filter(Boolean);

  const handleVipBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vipName.trim()) {
      toast.error("Por favor indica tu nombre completo para la lista VIP");
      return;
    }
    toast.success("¡Solicitud VIP Recibida!", {
      description: `Mesa reservada para ${vipName} (${guestCount} personas) en ${vipZone} para la noche del ${vipDate}. Te contactaremos vía WhatsApp para confirmar los detalles de acceso.`
    });
  };

  return (
    <PageTransition>
      <SEOHead
        title={`${bar.name} - Vida Nocturna & Bares en República Dominicana`}
        description={bar.shortDescription || bar.description?.slice(0, 160)}
        keywords={`vida nocturna, ${bar.name}, ${bar.barType}, discotecas dominicana, bares`}
      />

      <div className="min-h-screen bg-background text-foreground">
        <Header hasHero />

        {/* Hero Slider */}
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
          hotels={nearbyHotels}
          restaurants={nearbyRestaurants}
        />

        {/* Thumbnail Preview Bar */}
        {allImages.length > 1 && (
          <section className="container mx-auto px-4 lg:px-8 pt-6 pb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="font-semibold text-purple-500">{bar.priceRange} (Gasto Promedio)</span>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Volume2 className="h-3.5 w-3.5 text-primary" />
                  <span>{bar.musicStyle.join(' • ')}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl"
                onClick={() => {
                  if (navigator.share) navigator.share({ title: bar.name, url: window.location.href });
                  else {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Enlace copiado al portapapeles");
                  }
                }}
              >
                <Share2 className="h-4 w-4" /> Compartir
              </Button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 bg-card/90 backdrop-blur-md p-2.5 rounded-2xl border border-border shadow-lg">
              {allImages.slice(0, 6).map((img, i) => (
                <div
                  key={i}
                  className="aspect-video rounded-xl overflow-hidden cursor-pointer relative group"
                  onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
                >
                  <img
                    src={img}
                    alt={`${bar.name} vista ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Main Content Layout */}
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-10">
            
            {/* Left Column (Story, Lineup, Signature Cocktails, Services, FAQ) */}
            <div className="lg:col-span-2 space-y-10">
              
              {/* About & Atmosphere */}
              <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm">
                <h2 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                  <Wine className="h-6 w-6 text-purple-400" />
                  Experiencia & Ambiente Nocturno
                </h2>
                <p className="text-muted-foreground leading-relaxed text-base md:text-lg mb-6 whitespace-pre-line">
                  {bar.description || "Un espacio diseñado para los amantes de las noches vibrantes, con una selecta carta de cócteles de autor, ambiente exclusivo y la mejor música en vivo del destino."}
                </p>

                {/* Music Style Tags */}
                <div>
                  <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Disc3 className="h-4 w-4 text-primary" /> Géneros y Estilos Musicales
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {bar.musicStyle.map((style) => (
                      <Badge key={style} variant="secondary" className="bg-purple-500/10 text-purple-300 border border-purple-500/20 py-1.5 px-3 text-xs font-semibold rounded-xl">
                        ♪ {style}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Weekly Line-up / Theme Nights */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-display text-2xl font-bold text-foreground flex items-center gap-2.5">
                    <Calendar className="h-6 w-6 text-primary" />
                    Programación Semanal & Noches Temáticas
                  </h3>
                  <p className="text-sm text-muted-foreground">Eventos recurrentes y sesiones de DJs invitados</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {weeklyLineup.map((event, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -2 }}
                      className="bg-card rounded-3xl p-5 border border-border hover:border-purple-500/40 transition-all flex flex-col justify-between shadow-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-black text-purple-400 uppercase tracking-wider">{event.day}</span>
                          <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full">
                            {event.badge}
                          </span>
                        </div>
                        <h4 className="font-display text-base font-bold text-foreground mb-1">{event.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">{event.desc}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80 pt-2 border-t border-border/50">
                        <Clock className="h-3.5 w-3.5 text-primary" /> {event.time}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Signature Cocktails Menu */}
              <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-foreground flex items-center gap-2.5">
                      <Wine className="h-6 w-6 text-primary" />
                      Mixología & Cócteles Destacados
                    </h3>
                    <p className="text-sm text-muted-foreground">Creaciones de autor con rones locales e ingredientes botánicos</p>
                  </div>
                  <Badge variant="outline" className="text-xs font-bold text-primary border-primary/40">Carta de Autor</Badge>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {signatureCocktails.map((c, i) => (
                    <div key={i} className="p-4 bg-muted/30 rounded-2xl border border-border/60 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h4 className="font-bold text-sm text-foreground">{c.name}</h4>
                          <span className="font-black text-primary text-xs bg-primary/10 px-2 py-0.5 rounded-md">{c.price}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">{c.desc}</p>
                      </div>
                      <span className="text-[11px] font-semibold text-muted-foreground/80 flex items-center gap-1">
                        <GlassWater className="h-3 w-3 text-purple-400" /> Perfil: {c.strength}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Services & Facilities */}
              <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm">
                <h3 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Servicios y Comodidades del Local
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {bar.services.map((service, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border/50 text-xs font-medium text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQs */}
              <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm">
                <h3 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Preguntas Frecuentes de la Noche
                </h3>
                
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

            </div>

            {/* Right Column (VIP Reservation, Contact & Practical Specs) */}
            <div className="lg:col-span-1 space-y-6">
              <div className="sticky top-28 space-y-6">
                
                {/* VIP Table / Bottle Service Reservation */}
                <div className="bg-gradient-to-b from-purple-950/40 via-card to-card rounded-3xl border border-purple-500/30 p-6 shadow-xl ring-1 ring-purple-500/20">
                  <div className="flex items-center justify-between pb-4 border-b border-border/70 mb-5">
                    <div>
                      <h3 className="font-display text-xl font-black text-white flex items-center gap-1.5">
                        <Ticket className="h-5 w-5 text-purple-400" /> Mesa VIP / Botellas
                      </h3>
                      <p className="text-xs text-muted-foreground">Acceso sin fila & atención personalizada</p>
                    </div>
                    <Badge className="bg-purple-500 text-white font-bold text-xs">VIP Access</Badge>
                  </div>

                  <form onSubmit={handleVipBooking} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Nombre Completo</label>
                      <Input 
                        placeholder="Ej. Manuel Peña"
                        value={vipName}
                        onChange={(e) => setVipName(e.target.value)}
                        className="bg-background rounded-xl text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Fecha de la Fiesta</label>
                      <Input 
                        type="date" 
                        value={vipDate} 
                        onChange={(e) => setVipDate(e.target.value)} 
                        className="bg-background rounded-xl text-xs font-medium" 
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Zona Solicitada</label>
                      <Select value={vipZone} onValueChange={setVipZone}>
                        <SelectTrigger className="bg-background rounded-xl text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mesa VIP Pista">Mesa VIP Pista Principal</SelectItem>
                          <SelectItem value="Box DJ Stage">Box Exclusivo DJ Stage</SelectItem>
                          <SelectItem value="Terraza Sky Lounge">Terraza Sky Lounge al Aire Libre</SelectItem>
                          <SelectItem value="Barra Principal">Reserva de Asientos en Barra</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Cantidad de Amigos</label>
                      <Select value={guestCount} onValueChange={setGuestCount}>
                        <SelectTrigger className="bg-background rounded-xl text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 Personas</SelectItem>
                          <SelectItem value="4">4 Personas (1 Botella)</SelectItem>
                          <SelectItem value="6">6 Personas (2 Botellas)</SelectItem>
                          <SelectItem value="8">8 Personas (Mesa Grande)</SelectItem>
                          <SelectItem value="12+">12+ Personas (Box Privado)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" className="w-full py-5 text-sm font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/40">
                      Solicitar Mesa VIP
                    </Button>
                  </form>
                </div>

                {/* Practical Hours & Dress Code Card */}
                <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
                  <h4 className="font-display font-bold text-foreground mb-4 text-xs uppercase tracking-wider">
                    Detalles de Acceso
                  </h4>
                  <div className="space-y-4 text-xs">
                    <div className="flex items-start gap-3">
                      <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-foreground">Horario de Apertura</p>
                        <p className="text-muted-foreground">{bar.openingHours}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-foreground">Edad Mínima y Documento</p>
                        <p className="text-muted-foreground">+{bar.minimumAge} años con ID oficial</p>
                      </div>
                    </div>

                    {bar.dressCode && (
                      <div className="flex items-start gap-3">
                        <Users className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-foreground">Código de Vestimenta</p>
                          <p className="text-muted-foreground">{bar.dressCode}</p>
                        </div>
                      </div>
                    )}

                    {bar.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-foreground">Teléfono / WhatsApp</p>
                          <a href={`tel:${bar.phone}`} className="text-primary font-bold hover:underline">
                            {bar.phone}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location & Taxi Map */}
                <div className="bg-card rounded-3xl border border-border p-5 text-center shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-2">
                    <MapPin className="h-6 w-6 animate-pulse" />
                  </div>
                  <p className="text-xs font-bold text-foreground mb-1">Ubicación del Local</p>
                  <p className="text-[11px] text-muted-foreground mb-3">{bar.address || "República Dominicana"}</p>
                  
                  <Button asChild variant="outline" size="sm" className="w-full rounded-xl gap-1.5 text-xs font-semibold">
                    <a 
                      href={`https://maps.google.com/?q=${encodeURIComponent(bar.name + " " + (bar.address || bar.destinationName))}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Ver en Google Maps <ExternalLink className="h-3.5 w-3.5 ml-1" />
                    </a>
                  </Button>
                </div>

                {/* Sidebar Banner */}
                <DetailPageSidebarAd showDemo />
              </div>
            </div>

          </div>
        </div>

        {/* Lightbox for full screen images */}
        <Lightbox
          images={allImages}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />

        <InlineAd showDemo variant="large" />
        <MobileStickyFooterAd showDemo />
        <Footer />
      </div>
    </PageTransition>
  );
}
