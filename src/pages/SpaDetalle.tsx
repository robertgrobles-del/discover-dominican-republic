import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, Star, Clock, Phone, Mail, Globe, Heart, Leaf, 
  Droplets, ChevronLeft, Calendar, Users, Sparkles 
} from "lucide-react";

const allSpas = [
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
    description: "Experiencia de bienestar holístico con vistas al mar Caribe. Nuestro spa combina técnicas ancestrales con innovaciones modernas para ofrecer una experiencia transformadora. Cada tratamiento es personalizado según las necesidades individuales del huésped.",
    services: ["Masajes terapéuticos", "Faciales orgánicos", "Yoga al amanecer", "Meditación guiada", "Hidroterapia", "Reflexología", "Aromaterapia", "Terapia de piedras calientes"],
    highlights: ["Tratamientos con ingredientes orgánicos locales", "Vistas panorámicas al mar Caribe", "Programa detox de 3 y 7 días", "Instructores certificados internacionalmente"],
    schedule: "Lunes a Domingo: 8:00 AM - 9:00 PM",
    featured: true,
  },
  {
    slug: "spa-sanctuary",
    name: "Spa Sanctuary",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbec6b?w=800&h=500&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbec6b?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&h=500&fit=crop",
    ],
    category: "Day Spa",
    location: "Santo Domingo, Distrito Nacional",
    rating: 4.7,
    reviews: 324,
    priceFrom: 80,
    duration: "30-120 min",
    phone: "+1 809-555-0202",
    email: "info@spasanctuary.do",
    website: "https://spasanctuary.do",
    description: "Oasis urbano de tranquilidad en el corazón de la capital dominicana. Un espacio diseñado para desconectarte del estrés diario y reconectar con tu bienestar interior.",
    services: ["Masajes terapéuticos", "Tratamientos faciales", "Manicure/Pedicure", "Exfoliación corporal", "Envolturas"],
    highlights: ["Productos artesanales dominicanos", "Ambiente zen minimalista"],
    schedule: "Lunes a Sábado: 9:00 AM - 8:00 PM",
    featured: false,
  },
  {
    slug: "casa-de-campo-spa",
    name: "Casa de Campo Spa",
    image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&h=500&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=500&fit=crop",
    ],
    category: "Resort Spa",
    location: "La Romana",
    rating: 4.8,
    reviews: 456,
    priceFrom: 120,
    duration: "60-240 min",
    phone: "+1 809-555-0303",
    email: "spa@casadecampo.do",
    website: "https://casadecampo.do",
    description: "Spa de lujo con tratamientos exclusivos y vistas tropicales. Disfruta de un circuito de aguas único y terapias diseñadas para parejas en un entorno paradisíaco.",
    services: ["Terapias de pareja", "Circuito de aguas", "Tratamientos corporales", "Faciales premium", "Masaje con cacao dominicano"],
    highlights: ["Tratamientos signature con cacao dominicano", "Piscinas termales privadas", "Suites de pareja"],
    schedule: "Todos los días: 7:00 AM - 10:00 PM",
    featured: true,
  },
  {
    slug: "jarabacoa-eco-spa",
    name: "Jarabacoa Eco Spa",
    image: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&h=500&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&h=500&fit=crop",
    ],
    category: "Eco Spa",
    location: "Jarabacoa, La Vega",
    rating: 4.6,
    reviews: 189,
    priceFrom: 60,
    duration: "45-120 min",
    phone: "+1 809-555-0404",
    email: "info@jarabacoaecospa.do",
    website: "https://jarabacoaecospa.do",
    description: "Bienestar natural en las montañas con productos orgánicos locales. Un retiro eco-consciente donde la naturaleza es la protagonista de cada tratamiento.",
    services: ["Masajes con aceites esenciales", "Baños de flores", "Aromaterapia", "Yoga en la naturaleza", "Meditación guiada"],
    highlights: ["100% productos naturales y orgánicos", "Productos cosechados en la montaña", "Aire puro a 500m de altitud"],
    schedule: "Viernes a Domingo: 8:00 AM - 6:00 PM",
    featured: false,
  },
  {
    slug: "santuario-del-mar",
    name: "Santuario del Mar Spa",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=500&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=500&fit=crop",
    ],
    category: "Resort Spa",
    location: "Punta Cana, La Altagracia",
    rating: 4.9,
    reviews: 108,
    priceFrom: 180,
    duration: "60-240 min",
    phone: "+1 809-555-0505",
    email: "reservas@santuariodelmar.do",
    website: "https://santuariodelmar.do",
    description: "Experiencia de rejuvenecimiento total frente al mar Caribe con tratamientos exclusivos que combinan la tradición caribeña con técnicas de vanguardia.",
    services: ["Talasoterapia", "Masajes con algas marinas", "Faciales anti-edad", "Circuito hídrico", "Yoga al atardecer"],
    highlights: ["Frente al mar", "Tratamientos con algas caribeñas", "Programa detox marino"],
    schedule: "Todos los días: 7:00 AM - 9:00 PM",
    featured: true,
  },
  {
    slug: "el-valle-yoga-loft",
    name: "El Valle Yoga Loft",
    image: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&h=500&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&h=500&fit=crop",
    ],
    category: "Eco Spa",
    location: "Las Terrenas, Samaná",
    rating: 4.8,
    reviews: 65,
    priceFrom: 150,
    duration: "Paquete 3 días",
    phone: "+1 809-555-0606",
    email: "namaste@elvalle.do",
    website: "https://elvalle.do",
    description: "Conecta con la naturaleza en nuestros bungalows ecológicos y sesiones de yoga con vista a la montaña. Un retiro transformador en el corazón de Samaná.",
    services: ["Yoga Vinyasa", "Meditación", "Pranayama", "Masajes ayurvédicos", "Alimentación consciente"],
    highlights: ["Retiros de 3 y 7 días", "Instructores internacionales", "Alimentación orgánica incluida"],
    schedule: "Retiros programados mensualmente",
    featured: false,
  },
  {
    slug: "eco-retiro-los-pinos",
    name: "Eco-Retiro Los Pinos",
    image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&h=500&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&h=500&fit=crop",
    ],
    category: "Eco Spa",
    location: "Jarabacoa, La Vega",
    rating: 5.0,
    reviews: 42,
    priceFrom: 120,
    duration: "Por noche",
    phone: "+1 809-555-0707",
    email: "paz@lospinos.do",
    website: "https://lospinos.do",
    description: "Aire fresco, meditación guiada y senderismo consciente en la eterna primavera dominicana. Un espacio para reconectar contigo mismo.",
    services: ["Meditación guiada", "Senderismo consciente", "Baños de bosque", "Terapia de sonido", "Alimentación plant-based"],
    highlights: ["Clima de montaña todo el año", "Silencio y desconexión total", "Certificación eco-friendly"],
    schedule: "Viernes a Domingo, retiros especiales entre semana",
    featured: false,
  },
];

export default function SpaDetalle() {
  const { slug } = useParams();
  const spa = allSpas.find((s) => s.slug === slug);

  if (!spa) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-20 text-center">
            <h1 className="text-3xl font-bold mb-4">Spa no encontrado</h1>
            <p className="text-muted-foreground mb-8">El establecimiento que buscas no existe o fue removido.</p>
            <Link to="/wellness">
              <Button>Volver a Wellness</Button>
            </Link>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

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
                  <ChevronLeft className="h-4 w-4" />
                  Volver a Wellness
                </Link>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary/90 text-primary-foreground">{spa.category}</Badge>
                  {spa.featured && <Badge variant="secondary">⭐ Destacado</Badge>}
                </div>
                <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-2">{spa.name}</h1>
                <div className="flex items-center gap-4 text-white/80 text-sm flex-wrap">
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {spa.location}</span>
                  <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> {spa.rating} ({spa.reviews} reseñas)</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {spa.duration}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <main className="container mx-auto px-4 py-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h2 className="font-display text-2xl font-bold mb-4">Sobre {spa.name}</h2>
                <p className="text-muted-foreground leading-relaxed">{spa.description}</p>
              </section>

              {/* Gallery */}
              {spa.gallery.length > 1 && (
                <section>
                  <h2 className="font-display text-xl font-bold mb-4">Galería</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {spa.gallery.map((img, i) => (
                      <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden">
                        <img src={img} alt={`${spa.name} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Services */}
              <section>
                <h2 className="font-display text-xl font-bold mb-4">Servicios y Tratamientos</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {spa.services.map((service, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                      <Sparkles className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm">{service}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Highlights */}
              <section>
                <h2 className="font-display text-xl font-bold mb-4">¿Por qué elegir {spa.name}?</h2>
                <div className="space-y-3">
                  {spa.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg">
                      <Leaf className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing Card */}
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground">Desde</p>
                  <p className="text-4xl font-bold text-primary">${spa.priceFrom}</p>
                  <p className="text-sm text-muted-foreground">por sesión</p>
                </div>

                <Button className="w-full mb-3 gap-2">
                  <Calendar className="h-4 w-4" />
                  Reservar Ahora
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Heart className="h-4 w-4" />
                  Guardar
                </Button>

                <div className="mt-6 pt-6 border-t border-border space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{spa.schedule}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${spa.phone}`} className="text-primary hover:underline">{spa.phone}</a>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${spa.email}`} className="text-primary hover:underline">{spa.email}</a>
                  </div>
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
