import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MapPin, Star, Droplets, Clock, Shield, ChevronRight, 
  Navigation, Thermometer, AlertTriangle, Zap, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { FavoriteButton } from "@/components/FavoriteButton";
import { getRiverBySlug, River } from "@/data/rivers";
import { getRioAsRiver } from "@/data/riosData";

const riverTypeLabels: Record<River['riverType'], string> = {
  'montaña': 'Río de Montaña',
  'cascada': 'Cascada',
  'charco': 'Charcos',
  'cañon': 'Cañón',
  'manantial': 'Manantial',
  'río': 'Río'
};

const difficultyLabels: Record<River['difficulty'], { label: string; color: string }> = {
  'facil': { label: 'Fácil', color: 'bg-green-500' },
  'moderado': { label: 'Moderado', color: 'bg-yellow-500' },
  'dificil': { label: 'Difícil', color: 'bg-orange-500' },
  'experto': { label: 'Experto', color: 'bg-red-500' }
};

const tempLabels: Record<River['waterTemperature'], string> = {
  'fria': 'Fría',
  'templada': 'Templada',
  'fresca': 'Fresca'
};

export default function RioDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const river = slug ? (getRiverBySlug(slug) || getRioAsRiver(slug)) : undefined;

  if (!river) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-32 text-center">
            <h1 className="text-3xl font-bold mb-4">Río no encontrado</h1>
            <p className="text-muted-foreground mb-8">El río que buscas no existe o ha sido movido.</p>
            <Link to="/rios">
              <Button>Ver todos los ríos</Button>
            </Link>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  const difficultyInfo = difficultyLabels[river.difficulty];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Breadcrumbs */}
        <div className="bg-muted/30 border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/rios" className="hover:text-primary transition-colors">Ríos y Cascadas</Link>
              <ChevronRight className="h-4 w-4" />
              <Link 
                to={`/destino/${river.provinces[0]?.slug || river.mainProvinceId}`} 
                className="hover:text-primary transition-colors"
              >
                {river.mainProvinceName}
              </Link>
              {river.destinationName && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-foreground">{river.destinationName}</span>
                </>
              )}
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">{river.name}</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section className="relative h-[50vh] min-h-[400px]">
          <div className="absolute inset-0">
            <img 
              src={river.imageUrl} 
              alt={river.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-8 container mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  <Droplets className="h-3 w-3 mr-1" /> {riverTypeLabels[river.riverType]}
                </Badge>
                <Badge className={`${difficultyInfo.color} text-white`}>
                  {difficultyInfo.label}
                </Badge>
                <FavoriteButton 
                  id={river.id} 
                  type="rio" 
                  name={river.name} 
                  image={river.imageUrl} 
                  location={river.mainProvinceName} 
                  variant="button" 
                />
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                {river.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium text-foreground">{river.rating}</span>
                  <span>({river.reviewCount} reseñas)</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{river.mainProvinceName}</span>
                  {river.destinationName && <span>· {river.destinationName}</span>}
                </div>
                <span>·</span>
                <span>{river.priceRange}</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Gallery */}
        {river.gallery.length > 1 && (
          <section className="container mx-auto px-4 -mt-8 relative z-10">
            <div className="grid grid-cols-4 gap-2 rounded-xl overflow-hidden">
              {river.gallery.slice(0, 4).map((img, i) => (
                <div key={i} className="aspect-video">
                  <img 
                    src={img} 
                    alt={`${river.name} ${i + 1}`} 
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
                  Sobre {river.name}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {river.description}
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-card rounded-xl p-4 border border-border text-center">
                    <Zap className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Adrenalina</p>
                    <div className="flex justify-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div 
                          key={level} 
                          className={`w-2 h-2 rounded-full ${level <= river.adrenalineLevel ? 'bg-primary' : 'bg-muted'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <div className="bg-card rounded-xl p-4 border border-border text-center">
                    <Thermometer className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Temperatura</p>
                    <p className="text-sm font-medium text-foreground">{tempLabels[river.waterTemperature]}</p>
                  </div>
                  <div className="bg-card rounded-xl p-4 border border-border text-center">
                    <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Duración</p>
                    <p className="text-sm font-medium text-foreground">{river.duration}</p>
                  </div>
                  <div className="bg-card rounded-xl p-4 border border-border text-center">
                    <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Guía</p>
                    <p className="text-sm font-medium text-foreground">
                      {river.guidesRequired ? 'Requerido' : 'Opcional'}
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
                  {river.activities.map((activity) => (
                    <Badge key={activity} variant="secondary" className="text-sm py-2 px-4">
                      {activity}
                    </Badge>
                  ))}
                </div>
              </section>

              {/* Safety Tips */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-display text-xl font-bold text-foreground">
                    Consejos de Seguridad
                  </h3>
                </div>
                <div className="bg-yellow-500/10 rounded-xl p-6 border border-yellow-500/20">
                  <ul className="space-y-2">
                    {river.safetyTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <Shield className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                        <span className="text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
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
                  <p className="text-muted-foreground">{river.howToGetThere}</p>
                </div>
              </section>

              {/* Provinces */}
              {river.provinces.length > 1 && (
                <section>
                  <h3 className="font-display text-xl font-bold text-foreground mb-4">
                    Provincias que atraviesa
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {river.provinces.map((province) => (
                      <Link key={province.id} to={`/destino/${province.slug}`}>
                        <Badge variant="outline" className="text-sm py-2 px-4 hover:bg-primary/10">
                          <MapPin className="h-3 w-3 mr-1" />
                          {province.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Best Season */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-bold text-foreground mb-4">Mejor Época</h3>
                <p className="text-muted-foreground text-sm">{river.bestSeason}</p>
              </div>

              {/* Quick Info */}
              <div className="bg-primary/10 rounded-xl border border-primary/20 p-6">
                <h3 className="font-display font-bold text-foreground mb-4">
                  Información Rápida
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dificultad</span>
                    <span className="font-medium text-foreground">{difficultyInfo.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duración</span>
                    <span className="font-medium text-foreground">{river.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Precio</span>
                    <span className="font-medium text-foreground">{river.priceRange}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Temperatura</span>
                    <span className="font-medium text-foreground">{tempLabels[river.waterTemperature]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guía requerido</span>
                    <span className="font-medium text-foreground">
                      {river.guidesRequired ? 'Sí' : 'No'}
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
                  {river.mainProvinceName}
                  {river.destinationName && ` · ${river.destinationName}`}
                </p>
                <Link to={`/destino/${river.provinces[0]?.slug || river.mainProvinceId}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    Ver {river.mainProvinceName}
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
