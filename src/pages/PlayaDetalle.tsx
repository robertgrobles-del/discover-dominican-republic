import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MapPin, Star, Waves, Umbrella, Car, ShieldCheck, Sun, 
  Thermometer, Users, ChevronRight, Navigation, Clock, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { FavoriteButton } from "@/components/FavoriteButton";
import { getBeachBySlug, Beach } from "@/data/beaches";

const beachTypeLabels: Record<Beach['beachType'], string> = {
  'arena-blanca': 'Arena Blanca',
  'arena-dorada': 'Arena Dorada',
  'virgen': 'Virgen',
  'bahia': 'Bahía',
  'deportiva': 'Deportiva',
  'urbana': 'Urbana'
};

const waveLabels: Record<Beach['waveIntensity'], { label: string; color: string }> = {
  'calma': { label: 'Oleaje Calmo', color: 'bg-green-500' },
  'moderada': { label: 'Oleaje Moderado', color: 'bg-yellow-500' },
  'fuerte': { label: 'Oleaje Fuerte', color: 'bg-red-500' }
};

const crowdLabels: Record<Beach['crowdLevel'], { label: string; color: string }> = {
  'baja': { label: 'Poca Afluencia', color: 'bg-green-500' },
  'media': { label: 'Afluencia Media', color: 'bg-yellow-500' },
  'alta': { label: 'Alta Afluencia', color: 'bg-orange-500' }
};

export default function PlayaDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const beach = slug ? getBeachBySlug(slug) : undefined;

  if (!beach) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-32 text-center">
            <h1 className="text-3xl font-bold mb-4">Playa no encontrada</h1>
            <p className="text-muted-foreground mb-8">La playa que buscas no existe o ha sido movida.</p>
            <Link to="/playas">
              <Button>Ver todas las playas</Button>
            </Link>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  const waveInfo = waveLabels[beach.waveIntensity];
  const crowdInfo = crowdLabels[beach.crowdLevel];

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
              <Link to="/playas" className="hover:text-primary transition-colors">Playas</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to={`/destino/${beach.provinceSlug}`} className="hover:text-primary transition-colors">
                {beach.province}
              </Link>
              {beach.destinationName && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-foreground">{beach.destinationName}</span>
                </>
              )}
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">{beach.name}</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section className="relative h-[50vh] min-h-[400px]">
          <div className="absolute inset-0">
            <img 
              src={beach.imageUrl} 
              alt={beach.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-8 container mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  <Waves className="h-3 w-3 mr-1" /> {beachTypeLabels[beach.beachType]}
                </Badge>
                <Badge className={`${waveInfo.color} text-white`}>
                  {waveInfo.label}
                </Badge>
                <FavoriteButton 
                  id={beach.id} 
                  type="playa" 
                  name={beach.name} 
                  image={beach.imageUrl} 
                  location={beach.province} 
                  variant="button" 
                />
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                {beach.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium text-foreground">{beach.rating}</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{beach.province}</span>
                  {beach.destinationName && <span>· {beach.destinationName}</span>}
                </div>
                <span>·</span>
                <span>{beach.accessType === 'publico' ? 'Acceso Público' : beach.accessType === 'semi-privado' ? 'Semi-Privada' : 'Privada'}</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Gallery */}
        {beach.gallery.length > 1 && (
          <section className="container mx-auto px-4 -mt-8 relative z-10">
            <div className="grid grid-cols-4 gap-2 rounded-xl overflow-hidden">
              {beach.gallery.slice(0, 4).map((img, i) => (
                <div key={i} className="aspect-video">
                  <img 
                    src={img} 
                    alt={`${beach.name} ${i + 1}`} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer" 
                  />
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
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  Sobre {beach.name}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {beach.description}
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-card rounded-xl p-4 border border-border text-center">
                    <Waves className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Tipo de Arena</p>
                    <p className="text-sm font-medium text-foreground">{beach.sandType}</p>
                  </div>
                  <div className="bg-card rounded-xl p-4 border border-border text-center">
                    <Thermometer className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Color del Agua</p>
                    <p className="text-sm font-medium text-foreground">{beach.waterColor}</p>
                  </div>
                  <div className="bg-card rounded-xl p-4 border border-border text-center">
                    <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Afluencia</p>
                    <p className="text-sm font-medium text-foreground">{crowdInfo.label}</p>
                  </div>
                  <div className="bg-card rounded-xl p-4 border border-border text-center">
                    <ShieldCheck className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Salvavidas</p>
                    <p className="text-sm font-medium text-foreground">
                      {beach.lifeguardOnDuty ? 'Disponible' : 'No disponible'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Activities */}
              <section>
                <h3 className="font-display text-xl font-bold text-foreground mb-4">
                  Actividades Disponibles
                </h3>
                <div className="flex flex-wrap gap-2">
                  {beach.activities.map((activity) => (
                    <Badge key={activity} variant="secondary" className="text-sm py-2 px-4">
                      {activity}
                    </Badge>
                  ))}
                </div>
              </section>

              {/* Amenities */}
              <section>
                <h3 className="font-display text-xl font-bold text-foreground mb-4">
                  Servicios y Amenidades
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {beach.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2 text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                  {beach.parkingAvailable && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Car className="h-4 w-4 text-primary" />
                      <span className="text-sm">Estacionamiento</span>
                    </div>
                  )}
                </div>
              </section>

              {/* How to Get There */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Navigation className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-xl font-bold text-foreground">
                    Cómo Llegar
                  </h3>
                </div>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <p className="text-muted-foreground">{beach.howToGetThere}</p>
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Best Time */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sun className="h-5 w-5 text-primary" />
                  <h3 className="font-display font-bold text-foreground">Mejor Época</h3>
                </div>
                <p className="text-muted-foreground text-sm">{beach.bestTimeToVisit}</p>
              </div>

              {/* Quick Info */}
              <div className="bg-primary/10 rounded-xl border border-primary/20 p-6">
                <h3 className="font-display font-bold text-foreground mb-4">
                  Información Rápida
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Acceso</span>
                    <span className="font-medium text-foreground">
                      {beach.accessType === 'publico' ? 'Público' : beach.accessType === 'semi-privado' ? 'Semi-Privado' : 'Privado'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Oleaje</span>
                    <span className="font-medium text-foreground">{waveInfo.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estacionamiento</span>
                    <span className="font-medium text-foreground">
                      {beach.parkingAvailable ? 'Sí' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Salvavidas</span>
                    <span className="font-medium text-foreground">
                      {beach.lifeguardOnDuty ? 'Sí' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-bold text-foreground mb-4">Ubicación</h3>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {beach.province}
                  {beach.destinationName && ` · ${beach.destinationName}`}
                </p>
                <Link to={`/destino/${beach.provinceSlug}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    Ver {beach.province}
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
