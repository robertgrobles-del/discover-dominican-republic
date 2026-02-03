import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MapPin, Star, Clock, Music, Users, Calendar, Phone, Instagram, 
  ChevronRight, Ticket, Wine, Sparkles, Shield, Car
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { FavoriteButton } from "@/components/FavoriteButton";
import { getBarBySlug, Bar } from "@/data/bars";

const barTypeLabels: Record<Bar['barType'], string> = {
  'cocktail-bar': 'Cocktail Bar',
  'lounge': 'Lounge',
  'nightclub': 'Discoteca',
  'beach-bar': 'Beach Bar',
  'rooftop': 'Rooftop',
  'sports-bar': 'Sports Bar',
  'pub': 'Pub'
};

export default function BarDetalle() {
  const { id } = useParams<{ id: string }>();
  const bar = id ? getBarBySlug(id) : undefined;

  if (!bar) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-32 text-center">
            <h1 className="text-3xl font-bold mb-4">Bar no encontrado</h1>
            <p className="text-muted-foreground mb-8">El bar que buscas no existe o ha sido movido.</p>
            <Link to="/vida-nocturna">
              <Button>Ver todos los bares</Button>
            </Link>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Breadcrumbs */}
        <div className="bg-muted/30 border-b border-border mt-16">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/vida-nocturna" className="hover:text-primary transition-colors">Vida Nocturna</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to={`/destino/${bar.destinationId}`} className="hover:text-primary transition-colors">
                {bar.destinationName}
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">{bar.name}</span>
            </nav>
          </div>
        </div>

        {/* Hero Gallery */}
        <section className="relative h-[50vh] min-h-[400px]">
          <div className="absolute inset-0">
            <img src={bar.imageUrl} alt={bar.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-8 container mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  <Music className="h-3 w-3 mr-1" /> {barTypeLabels[bar.barType]}
                </Badge>
                <FavoriteButton 
                  id={bar.id} 
                  type="bar" 
                  name={bar.name} 
                  image={bar.imageUrl} 
                  location={bar.destinationName} 
                  variant="button" 
                />
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">{bar.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium text-foreground">{bar.rating}</span>
                  <span>({bar.reviewCount} reseñas)</span>
                </div>
                <span>·</span>
                <span>{bar.priceRange}</span>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{bar.destinationName}, {bar.province}</span>
                </div>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Music className="h-4 w-4" />
                  {bar.musicStyle.join(' / ')}
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Image Gallery */}
        {bar.gallery.length > 1 && (
          <section className="container mx-auto px-4 -mt-8 relative z-10">
            <div className="grid grid-cols-4 gap-2 rounded-xl overflow-hidden">
              {bar.gallery.slice(0, 4).map((img, i) => (
                <div key={i} className="aspect-video">
                  <img src={img} alt={`${bar.name} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer" />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Description */}
              <section>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">Sobre el Lugar</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">{bar.description}</p>
                
                {/* Services */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {bar.services.slice(0, 4).map((service) => (
                    <div key={service} className="bg-card rounded-xl p-4 border border-border text-center">
                      <Sparkles className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">{service}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Music Style */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Music className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-xl font-bold text-foreground">Estilo Musical</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {bar.musicStyle.map((style) => (
                    <Badge key={style} variant="secondary" className="text-sm py-2 px-4">
                      {style}
                    </Badge>
                  ))}
                </div>
              </section>

              {/* All Services */}
              <section>
                <h3 className="font-display text-xl font-bold text-foreground mb-4">
                  Todos los Servicios
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {bar.services.map((service) => (
                    <div key={service} className="flex items-center gap-2 text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm">{service}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Hours & Info */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-bold text-foreground mb-4">Información</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div className="text-sm">
                      <p className="text-foreground font-medium">Horarios</p>
                      <p className="text-muted-foreground">{bar.openingHours}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div className="text-sm">
                      <p className="text-foreground font-medium">Edad Mínima</p>
                      <p className="text-muted-foreground">{bar.minimumAge} años</p>
                    </div>
                  </div>
                  {bar.dressCode && (
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-primary" />
                      <div className="text-sm">
                        <p className="text-foreground font-medium">Código de Vestimenta</p>
                        <p className="text-muted-foreground">{bar.dressCode}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact */}
              <div className="bg-primary/10 rounded-xl border border-primary/20 p-6">
                <h3 className="font-display font-bold text-foreground mb-4">Contacto</h3>
                <div className="space-y-3">
                  {bar.phone && (
                    <Button variant="outline" className="w-full gap-2">
                      <Phone className="h-4 w-4" /> {bar.phone}
                    </Button>
                  )}
                  {bar.website && (
                    <a href={bar.website} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full gap-2">
                        <Sparkles className="h-4 w-4" /> Visitar Sitio Web
                      </Button>
                    </a>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-bold text-foreground mb-4">Ubicación</h3>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">{bar.address}</p>
                <Link to={`/destino/${bar.destinationId}`}>
                  <Button variant="outline" size="sm" className="w-full gap-1">
                    <Car className="h-4 w-4" /> Ver {bar.destinationName}
                  </Button>
                </Link>
              </div>

              {/* CTA */}
              <div className="bg-card rounded-xl border border-border p-6">
                <Button className="w-full mb-3">
                  Agregar al Plan de Viaje
                </Button>
                <Button variant="outline" className="w-full">
                  Compartir
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
}
