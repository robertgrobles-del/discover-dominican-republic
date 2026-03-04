import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, Star, Clock, Phone, Mail, Globe, Heart, Leaf, 
  Droplets, ChevronLeft, Calendar, Users, Sparkles 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { FavoriteButton } from "@/components/FavoriteButton";

// Static fallback data
const staticSpas = [
  {
    slug: "six-senses-spa",
    name: "Six Senses Spa",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=500&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1540555700478-4be289fbec6b?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&h=500&fit=crop",
    ],
    category: "Resort Spa",
    location: "Punta Cana, La Altagracia",
    rating: 4.9,
    reviews: 567,
    priceFrom: 150,
    duration: "60-180 min",
    phone: "+1 809-555-0101",
    email: "reservas@sixsensesrd.com",
    website: "https://sixsensesrd.com",
    description: "Experiencia de bienestar holístico con vistas al mar Caribe. Nuestro spa combina técnicas ancestrales con innovaciones modernas para ofrecer una experiencia transformadora.",
    services: ["Masajes terapéuticos", "Faciales orgánicos", "Yoga al amanecer", "Meditación guiada", "Hidroterapia", "Reflexología", "Aromaterapia", "Terapia de piedras calientes"],
    highlights: ["Tratamientos con ingredientes orgánicos locales", "Vistas panorámicas al mar Caribe", "Programa detox de 3 y 7 días"],
    schedule: "Lunes a Domingo: 8:00 AM - 9:00 PM",
    featured: true,
  },
  {
    slug: "spa-sanctuary",
    name: "Spa Sanctuary",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbec6b?w=800&h=500&fit=crop",
    gallery: ["https://images.unsplash.com/photo-1540555700478-4be289fbec6b?w=800&h=500&fit=crop"],
    category: "Day Spa",
    location: "Santo Domingo, Distrito Nacional",
    rating: 4.7, reviews: 324, priceFrom: 80, duration: "30-120 min",
    phone: "+1 809-555-0202", email: "info@spasanctuary.do", website: "https://spasanctuary.do",
    description: "Oasis urbano de tranquilidad en el corazón de la capital dominicana.",
    services: ["Masajes terapéuticos", "Tratamientos faciales", "Manicure/Pedicure", "Exfoliación corporal"],
    highlights: ["Productos artesanales dominicanos", "Ambiente zen minimalista"],
    schedule: "Lunes a Sábado: 9:00 AM - 8:00 PM", featured: false,
  },
  {
    slug: "casa-de-campo-spa",
    name: "Casa de Campo Spa",
    image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&h=500&fit=crop",
    gallery: ["https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&h=500&fit=crop"],
    category: "Resort Spa",
    location: "La Romana",
    rating: 4.8, reviews: 456, priceFrom: 120, duration: "60-240 min",
    phone: "+1 809-555-0303", email: "spa@casadecampo.do", website: "https://casadecampo.do",
    description: "Spa de lujo con tratamientos exclusivos y vistas tropicales.",
    services: ["Terapias de pareja", "Circuito de aguas", "Tratamientos corporales", "Masaje con cacao dominicano"],
    highlights: ["Tratamientos signature con cacao dominicano", "Piscinas termales privadas"],
    schedule: "Todos los días: 7:00 AM - 10:00 PM", featured: true,
  },
  {
    slug: "jarabacoa-eco-spa",
    name: "Jarabacoa Eco Spa",
    image: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&h=500&fit=crop",
    gallery: ["https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&h=500&fit=crop"],
    category: "Eco Spa", location: "Jarabacoa, La Vega",
    rating: 4.6, reviews: 189, priceFrom: 60, duration: "45-120 min",
    phone: "+1 809-555-0404", email: "info@jarabacoaecospa.do", website: "https://jarabacoaecospa.do",
    description: "Bienestar natural en las montañas con productos orgánicos locales.",
    services: ["Masajes con aceites esenciales", "Baños de flores", "Aromaterapia", "Yoga en la naturaleza"],
    highlights: ["100% productos naturales y orgánicos", "Aire puro a 500m de altitud"],
    schedule: "Viernes a Domingo: 8:00 AM - 6:00 PM", featured: false,
  },
  {
    slug: "santuario-del-mar",
    name: "Santuario del Mar Spa",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=500&fit=crop",
    gallery: ["https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=500&fit=crop"],
    category: "Resort Spa", location: "Punta Cana, La Altagracia",
    rating: 4.9, reviews: 108, priceFrom: 180, duration: "60-240 min",
    phone: "+1 809-555-0505", email: "reservas@santuariodelmar.do", website: "https://santuariodelmar.do",
    description: "Experiencia de rejuvenecimiento total frente al mar Caribe con tratamientos exclusivos.",
    services: ["Talasoterapia", "Masajes con algas marinas", "Faciales anti-edad", "Circuito hídrico"],
    highlights: ["Frente al mar", "Tratamientos con algas caribeñas"],
    schedule: "Todos los días: 7:00 AM - 9:00 PM", featured: true,
  },
  {
    slug: "el-valle-yoga-loft",
    name: "El Valle Yoga Loft",
    image: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&h=500&fit=crop",
    gallery: ["https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&h=500&fit=crop"],
    category: "Eco Spa", location: "Las Terrenas, Samaná",
    rating: 4.8, reviews: 65, priceFrom: 150, duration: "Paquete 3 días",
    phone: "+1 809-555-0606", email: "namaste@elvalle.do", website: "https://elvalle.do",
    description: "Conecta con la naturaleza en bungalows ecológicos y sesiones de yoga con vista a la montaña.",
    services: ["Yoga Vinyasa", "Meditación", "Pranayama", "Masajes ayurvédicos"],
    highlights: ["Retiros de 3 y 7 días", "Instructores internacionales"],
    schedule: "Retiros programados mensualmente", featured: false,
  },
  {
    slug: "eco-retiro-los-pinos",
    name: "Eco-Retiro Los Pinos",
    image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&h=500&fit=crop",
    gallery: ["https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&h=500&fit=crop"],
    category: "Eco Spa", location: "Jarabacoa, La Vega",
    rating: 5.0, reviews: 42, priceFrom: 120, duration: "Por noche",
    phone: "+1 809-555-0707", email: "paz@lospinos.do", website: "https://lospinos.do",
    description: "Aire fresco, meditación guiada y senderismo consciente en la eterna primavera dominicana.",
    services: ["Meditación guiada", "Senderismo consciente", "Baños de bosque", "Terapia de sonido"],
    highlights: ["Clima de montaña todo el año", "Silencio y desconexión total"],
    schedule: "Viernes a Domingo, retiros especiales entre semana", featured: false,
  },
];

function useSpaData(slug: string | undefined) {
  const staticSpa = slug ? staticSpas.find(s => s.slug === slug) : undefined;

  const { data: dbSpa, isLoading } = useQuery({
    queryKey: ['spa', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spas_wellness')
        .select('*')
        .eq('slug', slug!)
        .eq('is_active', true)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !staticSpa && !!slug,
  });

  return { spa: staticSpa || dbSpa, isLoading: !staticSpa && isLoading };
}

export default function SpaDetalle() {
  const { slug } = useParams();
  const { spa: rawSpa, isLoading } = useSpaData(slug);

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-32">
            <Skeleton className="h-[300px] w-full rounded-xl mb-8" />
            <Skeleton className="h-8 w-1/2 mb-4" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  if (!rawSpa) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-20 text-center">
            <h1 className="text-3xl font-bold mb-4">Spa no encontrado</h1>
            <p className="text-muted-foreground mb-8">El establecimiento que buscas no existe o fue removido.</p>
            <Link to="/wellness"><Button>Volver a Wellness</Button></Link>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  // Normalize
  const spa = {
    slug: (rawSpa as any).slug || '',
    name: (rawSpa as any).name || '',
    image: (rawSpa as any).image || (rawSpa as any).image_url || '/placeholder.svg',
    gallery: (rawSpa as any).gallery || [],
    category: (rawSpa as any).category || (rawSpa as any).spa_type || '',
    location: (rawSpa as any).location || (rawSpa as any).address || '',
    rating: (rawSpa as any).rating || 0,
    reviews: (rawSpa as any).reviews || (rawSpa as any).review_count || 0,
    priceFrom: (rawSpa as any).priceFrom || (rawSpa as any).price_from || 0,
    duration: (rawSpa as any).duration || '',
    phone: (rawSpa as any).phone || '',
    email: (rawSpa as any).email || '',
    website: (rawSpa as any).website || '',
    description: (rawSpa as any).description || '',
    services: (rawSpa as any).services || (rawSpa as any).treatments || [],
    highlights: (rawSpa as any).highlights || [],
    schedule: (rawSpa as any).schedule || (rawSpa as any).opening_hours || '',
    featured: (rawSpa as any).featured ?? (rawSpa as any).is_featured ?? false,
    id: (rawSpa as any).id || (rawSpa as any).slug || '',
    priceRange: (rawSpa as any).price_range || (rawSpa as any).priceRange || '',
  };

  return (
    <PageTransition>
      <SEOHead
        title={`${spa.name} - Spa & Wellness en República Dominicana`}
        description={spa.description}
        keywords={`spa, wellness, ${spa.name}, ${spa.location}, República Dominicana`}
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative">
          <div className="aspect-[21/9] md:aspect-[3/1] relative overflow-hidden">
            <img src={spa.image} alt={spa.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <div className="container mx-auto">
                <Link to="/wellness" className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm">
                  <ChevronLeft className="h-4 w-4" /> Volver a Wellness
                </Link>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary/90 text-primary-foreground">{spa.category}</Badge>
                  {spa.featured && <Badge variant="secondary">⭐ Destacado</Badge>}
                </div>
                <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-2">{spa.name}</h1>
                <div className="flex items-center gap-4 text-white/80 text-sm flex-wrap">
                  {spa.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {spa.location}</span>}
                  {spa.rating > 0 && <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> {spa.rating} ({spa.reviews} reseñas)</span>}
                  {spa.duration && <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {spa.duration}</span>}
                </div>
              </div>
            </div>
          </div>
        </section>

        <main className="container mx-auto px-4 py-10">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h2 className="font-display text-2xl font-bold mb-4">Sobre {spa.name}</h2>
                <p className="text-muted-foreground leading-relaxed">{spa.description}</p>
              </section>

              {spa.gallery.length > 1 && (
                <section>
                  <h2 className="font-display text-xl font-bold mb-4">Galería</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {spa.gallery.map((img: string, i: number) => (
                      <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden">
                        <img src={img} alt={`${spa.name} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {spa.services.length > 0 && (
                <section>
                  <h2 className="font-display text-xl font-bold mb-4">Servicios y Tratamientos</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {spa.services.map((service: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                        <Sparkles className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm">{service}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {spa.highlights.length > 0 && (
                <section>
                  <h2 className="font-display text-xl font-bold mb-4">¿Por qué elegir {spa.name}?</h2>
                  <div className="space-y-3">
                    {spa.highlights.map((h: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg">
                        <Leaf className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
                {spa.priceFrom > 0 && (
                  <div className="text-center mb-6">
                    <p className="text-sm text-muted-foreground">Desde</p>
                    <p className="text-4xl font-bold text-primary">${spa.priceFrom}</p>
                    <p className="text-sm text-muted-foreground">por sesión</p>
                  </div>
                )}
                {spa.priceRange && !spa.priceFrom && (
                  <div className="text-center mb-6">
                    <p className="text-sm text-muted-foreground">Rango de precios</p>
                    <p className="text-2xl font-bold text-primary">{spa.priceRange}</p>
                  </div>
                )}

                <Button className="w-full mb-3 gap-2"><Calendar className="h-4 w-4" /> Reservar Ahora</Button>
                <FavoriteButton id={spa.id} type="spa" name={spa.name} image={spa.image} location={spa.location} variant="button" />

                <div className="mt-6 pt-6 border-t border-border space-y-4">
                  {spa.schedule && (
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{spa.schedule}</span>
                    </div>
                  )}
                  {spa.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${spa.phone}`} className="text-primary hover:underline">{spa.phone}</a>
                    </div>
                  )}
                  {spa.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${spa.email}`} className="text-primary hover:underline">{spa.email}</a>
                    </div>
                  )}
                  {spa.website && (
                    <div className="flex items-center gap-3 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a href={spa.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Sitio web</a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
