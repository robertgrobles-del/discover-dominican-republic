import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { DestinationGallery } from "@/components/destination/DestinationGallery";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, ChevronRight, Phone, Mail, Globe, Star, 
  Anchor, Fuel, Shield, Wifi, Waves, Ship,
  Utensils, ShoppingBag, Clock, Navigation
} from "lucide-react";
import { motion } from "framer-motion";
import { FavoriteButton } from "@/components/FavoriteButton";

const marinasData: Record<string, {
  id: string;
  nombre: string;
  ubicacion: string;
  provincia: string;
  tipo: "Marina" | "Puerto Deportivo" | "Yacht Club";
  descripcion: string;
  descripcionLarga: string;
  atraques: number;
  caladoMax: string;
  canalVHF: string;
  coordenadas: { lat: string; lng: string };
  telefono: string;
  email: string;
  website: string;
  imagenes: { src: string; alt: string }[];
  servicios: { icono: string; titulo: string; descripcion: string }[];
  amenidades: { titulo: string; descripcion: string; imagen: string }[];
  tarifas: { concepto: string; precio: string }[];
  rating: number;
  reviews: number;
}> = {
  "casa-de-campo": {
    id: "casa-de-campo",
    nombre: "Marina Casa de Campo",
    ubicacion: "La Romana",
    provincia: "La Romana",
    tipo: "Marina",
    descripcion: "Donde el río Chavón se encuentra con el Mar Caribe. El puerto deportivo más completo y prestigioso del Caribe.",
    descripcionLarga: "Inspirada en los pintorescos pueblos costeros del Mediterráneo, pero equipada con todas las comodidades modernas que un navegante podría desear. Marina Casa de Campo ofrece un ambiente vibrante con una arquitectura impresionante. Los capitanes y propietarios encontrarán un puerto seguro y protegido, ideal durante la temporada de huracanes, con acceso directo a un resort de cinco estrellas que incluye campos de golf de renombre mundial, canchas de polo y playas privadas.",
    atraques: 350,
    caladoMax: "12 pies",
    canalVHF: "Ch 16",
    coordenadas: { lat: "18°24'N", lng: "68°54'W" },
    telefono: "+1 809-523-8646",
    email: "marina@casadecampo.com.do",
    website: "https://casadecampo.com.do/marina",
    imagenes: [
      { src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop", alt: "Marina Casa de Campo - Vista aérea" },
      { src: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&h=600&fit=crop", alt: "Yates atracados" },
      { src: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800&h=600&fit=crop", alt: "Paseo marítimo" },
      { src: "https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=800&h=600&fit=crop", alt: "Restaurantes frente al mar" }
    ],
    servicios: [
      { icono: "fuel", titulo: "Combustible Premium", descripcion: "Diesel y Gasolina de alta pureza disponible en muelle de servicio. Sistema de filtrado de alta capacidad." },
      { icono: "badge", titulo: "Migración In-Situ", descripcion: "Oficinas de Migración y Armada Dominicana directamente en la marina para check-in/out rápido." },
      { icono: "electrical", titulo: "Suministros", descripcion: "Electricidad (110/220/480V, 30-200 Amps), agua potable, TV por cable y Wi-Fi en cada amarre." },
      { icono: "security", titulo: "Seguridad 24/7", descripcion: "Circuito cerrado de cámaras, patrullaje constante y control de acceso riguroso." }
    ],
    amenidades: [
      { titulo: "Gastronomía", descripcion: "Más de 6 restaurantes internacionales frente al mar.", imagen: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400" },
      { titulo: "Shopping", descripcion: "Tiendas de diseñador, joyerías y artículos náuticos.", imagen: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400" },
      { titulo: "Yacht Club", descripcion: "Exclusivo club privado para socios y regatas.", imagen: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=400" }
    ],
    tarifas: [
      { concepto: "Amarre diario (hasta 40')", precio: "$2.50/pie" },
      { concepto: "Amarre diario (40'-80')", precio: "$3.00/pie" },
      { concepto: "Amarre mensual", precio: "Consultar" },
      { concepto: "Electricidad", precio: "Según consumo" }
    ],
    rating: 4.9,
    reviews: 342
  },
  "cap-cana": {
    id: "cap-cana",
    nombre: "Marina Cap Cana",
    ubicacion: "Cap Cana",
    provincia: "La Altagracia",
    tipo: "Marina",
    descripcion: "La marina más moderna del Caribe con capacidad para mega yates.",
    descripcionLarga: "Marina Cap Cana es el destino náutico más exclusivo de la región, diseñado para recibir los yates más grandes del mundo. Con un entorno de lujo incomparable, ofrece servicios de primera clase, restaurantes gourmet y acceso directo a campos de golf y playas privadas.",
    atraques: 122,
    caladoMax: "18 pies",
    canalVHF: "Ch 16/68",
    coordenadas: { lat: "18°28'N", lng: "68°24'W" },
    telefono: "+1 809-227-2262",
    email: "marina@capcana.com",
    website: "https://capcana.com/marina",
    imagenes: [
      { src: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&h=600&fit=crop", alt: "Marina Cap Cana" },
      { src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop", alt: "Mega yates" },
      { src: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800&h=600&fit=crop", alt: "Vista nocturna" }
    ],
    servicios: [
      { icono: "fuel", titulo: "Combustible", descripcion: "Diesel de alta calidad con capacidad para mega yates." },
      { icono: "electrical", titulo: "Electricidad", descripcion: "Hasta 480V/400A para embarcaciones de gran tamaño." },
      { icono: "security", titulo: "Seguridad", descripcion: "Vigilancia 24/7 y control de acceso biométrico." }
    ],
    amenidades: [
      { titulo: "Restaurantes", descripcion: "Gastronomía de clase mundial.", imagen: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400" },
      { titulo: "Beach Club", descripcion: "Playa privada exclusiva.", imagen: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" }
    ],
    tarifas: [
      { concepto: "Amarre diario", precio: "$3.50/pie" },
      { concepto: "Mega yates (100'+)", precio: "Consultar" }
    ],
    rating: 4.8,
    reviews: 189
  }
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  fuel: Fuel,
  badge: Shield,
  electrical: Wifi,
  security: Shield
};

export default function MarinaDetalle() {
  const { slug: id } = useParams<{ slug: string }>();
  const marina = marinasData[id || ""];

  if (!marina) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Anchor className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Marina no encontrada</h1>
              <p className="text-muted-foreground mb-6">La marina que buscas no existe o ha sido removida.</p>
              <Link to="/puertos-marinas">
                <Button>Volver a Puertos y Marinas</Button>
              </Link>
            </div>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SEOHead
        title={`${marina.nombre} - Marinas en República Dominicana`}
        description={marina.descripcion}
        keywords={`${marina.nombre}, marinas RD, puertos deportivos, yates Caribe`}
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 mt-16">
          {/* Breadcrumb */}
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary">Inicio</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/puertos-marinas" className="hover:text-primary">Marinas</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">{marina.nombre}</span>
            </div>
          </div>

          {/* Hero */}
          <section className="container mx-auto px-4 mb-8">
            <div className="relative rounded-xl overflow-hidden min-h-[400px] lg:min-h-[500px] group">
              <img
                src={marina.imagenes[0].src}
                alt={marina.imagenes[0].alt}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
                <div className="flex flex-col md:flex-row items-end justify-between gap-6">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-2 text-white/90 text-sm font-medium mb-2">
                      <Badge className="bg-primary text-primary-foreground">Premium</Badge>
                      <span>{marina.ubicacion}, RD</span>
                    </div>
                    <h1 className="text-white text-3xl md:text-5xl font-black leading-tight tracking-tight mb-2">
                      {marina.nombre}
                    </h1>
                    <p className="text-white/80 text-lg max-w-xl">
                      {marina.descripcion}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <FavoriteButton
                      id={marina.id}
                      type="puerto"
                      name={marina.nombre}
                      image={marina.imagenes[0].src}
                      location={marina.ubicacion}
                    />
                    <Button className="gap-2">
                      <MapPin className="h-4 w-4" />
                      Ver Mapa
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Stats */}
          <section className="container mx-auto px-4 mb-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card rounded-lg border border-border p-5 hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Anchor className="h-5 w-5" />
                  <span className="text-sm font-medium">Atraques</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{marina.atraques}</p>
              </div>
              <div className="bg-card rounded-lg border border-border p-5 hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Waves className="h-5 w-5" />
                  <span className="text-sm font-medium">Calado Máx</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{marina.caladoMax}</p>
              </div>
              <div className="bg-card rounded-lg border border-border p-5 hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Ship className="h-5 w-5" />
                  <span className="text-sm font-medium">Canal VHF</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{marina.canalVHF}</p>
              </div>
              <div className="bg-card rounded-lg border border-border p-5 hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Navigation className="h-5 w-5" />
                  <span className="text-sm font-medium">Coordenadas</span>
                </div>
                <p className="text-lg font-bold text-foreground truncate">{marina.coordenadas.lat} {marina.coordenadas.lng}</p>
              </div>
            </div>
          </section>

          {/* Content Grid */}
          <section className="container mx-auto px-4 pb-16">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-xl border border-border p-6"
                >
                  <h2 className="text-2xl font-bold text-foreground mb-4">Experiencia Náutica de Clase Mundial</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {marina.descripcionLarga}
                  </p>
                </motion.div>

                {/* Services */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-foreground">Servicios del Puerto</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {marina.servicios.map((servicio, index) => {
                      const IconComponent = iconMap[servicio.icono] || Shield;
                      return (
                        <div key={index} className="flex items-start gap-4 p-4 rounded-lg border border-border bg-surface">
                          <div className="p-2 rounded-full bg-primary/10 text-primary">
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground">{servicio.titulo}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{servicio.descripcion}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Amenities Gallery */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="text-xl font-bold text-foreground mb-6">Estilo de Vida y Amenidades</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    {marina.amenidades.map((amenidad, index) => (
                      <div key={index} className="group cursor-pointer">
                        <div className="overflow-hidden rounded-lg aspect-[4/3] mb-3">
                          <img
                            src={amenidad.imagen}
                            alt={amenidad.titulo}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{amenidad.titulo}</h4>
                        <p className="text-sm text-muted-foreground">{amenidad.descripcion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Booking Card */}
                <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                      <Anchor className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">Solicitar Amarre</h3>
                      <p className="text-sm text-muted-foreground">Respuesta en 24 horas</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(marina.rating) ? "fill-current" : ""}`} />
                      ))}
                      <span className="ml-2 text-foreground font-semibold">{marina.rating}</span>
                      <span className="text-muted-foreground text-sm">({marina.reviews} reseñas)</span>
                    </div>

                    <div className="border-t border-border pt-4 space-y-3">
                      <h4 className="font-semibold text-foreground text-sm">Tarifas Orientativas</h4>
                      {marina.tarifas.map((tarifa, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{tarifa.concepto}</span>
                          <span className="font-medium text-foreground">{tarifa.precio}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full mb-3">Solicitar Reserva</Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Phone className="h-4 w-4" />
                    Llamar Ahora
                  </Button>
                </div>

                {/* Contact Info */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-bold text-foreground mb-4">Información de Contacto</h3>
                  <div className="space-y-3">
                    <a href={`tel:${marina.telefono}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Phone className="h-4 w-4" />
                      {marina.telefono}
                    </a>
                    <a href={`mailto:${marina.email}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Mail className="h-4 w-4" />
                      {marina.email}
                    </a>
                    <a href={marina.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Globe className="h-4 w-4" />
                      Sitio Web Oficial
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
