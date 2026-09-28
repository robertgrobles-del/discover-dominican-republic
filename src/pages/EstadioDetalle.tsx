import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { 
  MapPin, Star, Users, Calendar, Clock, Ticket, Car, 
  ChevronRight, Trophy, Building, Phone, Globe, Sparkles,
  ExternalLink, Music, Compass, Flag, ShieldCheck, Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { FavoriteButton } from "@/components/FavoriteButton";
import { SEOHead, generateTouristAttractionSchema } from "@/components/SEOHead";
import { toast } from "sonner";
import { getVenueBySlug, getAllVenues, type VenueItem } from "@/data/venuesData";

export default function EstadioDetalle() {
  const { slug } = useParams<{ slug: string }>();
  
  // Buscar en el repositorio unificado de recintos
  const venue: VenueItem = getVenueBySlug(slug || "estadio-quisqueya") || getVenueBySlug("estadio-quisqueya")!;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${venue.name} — Descubre República Dominicana`,
          text: `Conoce las instalaciones y eventos en ${venue.name} (${venue.location})`,
          url: window.location.href,
        });
        toast.success("¡Enlace compartido!");
      } catch {
        // Cancelado
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  const otherVenues = getAllVenues().filter(v => v.id !== venue.id).slice(0, 3);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "golf":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "teatro":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "centro_convenciones":
        return "bg-sky-500/20 text-sky-400 border-sky-500/30";
      case "mall":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "arena":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-green-500/20 text-green-400 border-green-500/30";
    }
  };

  return (
    <PageTransition>
      <SEOHead
        title={`${venue.name} — ${venue.categoryLabel} en ${venue.location} | Descubre República Dominicana`}
        description={venue.description}
        image={venue.image}
        keywords={`${venue.name}, ${venue.categoryLabel}, ${venue.location}, eventos república dominicana, deportes rd, espectáculos`}
        jsonLd={generateTouristAttractionSchema({
          name: venue.name,
          description: venue.description,
          image: venue.image,
          address: `${venue.location}, ${venue.province}, República Dominicana`,
          touristType: [venue.categoryLabel, "Recinto Deportivo y Espectáculos", "Estadio"],
        })}
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        {/* Hero Section */}
        <section className="relative h-[55vh] min-h-[420px] bg-slate-950">
          <div className="absolute inset-0 overflow-hidden">
            <img 
              src={venue.image} 
              alt={venue.name} 
              className="w-full h-full object-cover opacity-80 scale-100 hover:scale-105 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/80" />
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 container mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge className={`px-3 py-1 text-xs font-bold ${getCategoryColor(venue.category)}`}>
                  {venue.category === "golf" ? <Flag className="h-3.5 w-3.5 mr-1" /> : <Trophy className="h-3.5 w-3.5 mr-1" />} 
                  {venue.categoryLabel}
                </Badge>
                
                <span className="text-xs bg-black/40 text-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  📍 {venue.province}
                </span>

                <FavoriteButton 
                  id={venue.id} 
                  type="experiencia" 
                  name={venue.name} 
                  image={venue.image} 
                  location={venue.location} 
                  variant="button" 
                />

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleShare}
                  className="rounded-full h-8 text-xs bg-black/40 text-white border-white/20 hover:bg-black/60 gap-1.5"
                >
                  <Share2 className="h-3.5 w-3.5" /> Compartir
                </Button>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 drop-shadow-md">
                {venue.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-200">
                <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-lg">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-white">{venue.rating}</span>
                  <span className="text-slate-300">({venue.reviewCount} opiniones)</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{venue.location}</span>
                </div>
                {venue.capacity && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-primary" />
                      <span>{typeof venue.capacity === "number" ? `${venue.capacity.toLocaleString()} personas` : venue.capacity}</span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Body */}
        <div className="container mx-auto px-4 lg:px-8 py-12 flex-1">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left Column: Details & Events (8 cols) */}
            <div className="lg:col-span-8 space-y-10">
              
              {/* About Section */}
              <section className="bg-card rounded-3xl p-6 md:p-8 border border-border space-y-4 shadow-xs">
                <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> Sobre el Recinto & Capacidad
                </h2>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                  {venue.description}
                </p>

                {/* Amenities Badges */}
                <div className="pt-4 border-t border-border/60">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Instalaciones & Servicios Disponibles
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {venue.amenities.map((amenity, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs bg-muted/60 text-foreground py-1.5 px-3">
                        ✓ {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </section>

              {/* Golf Specifications (si aplica) */}
              {venue.golfSpecs && (
                <section className="bg-gradient-to-br from-emerald-950/40 via-card to-card rounded-3xl p-6 md:p-8 border border-emerald-500/30 space-y-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                      <Flag className="h-5 w-5 text-emerald-500" /> Especificaciones del Campo de Golf
                    </h3>
                    <Badge className="bg-emerald-500 text-slate-950 font-bold">PGA Standard</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted/40 rounded-2xl border border-border/60 text-center">
                      <span className="text-xs text-muted-foreground block">Hoyos</span>
                      <span className="text-xl font-bold text-foreground">{venue.golfSpecs.holes} Hoyos</span>
                    </div>
                    <div className="p-4 bg-muted/40 rounded-2xl border border-border/60 text-center">
                      <span className="text-xs text-muted-foreground block">Par del Campo</span>
                      <span className="text-xl font-bold text-foreground">Par {venue.golfSpecs.par}</span>
                    </div>
                    <div className="p-4 bg-muted/40 rounded-2xl border border-border/60 text-center">
                      <span className="text-xs text-muted-foreground block">Diseñador</span>
                      <span className="text-sm font-bold text-foreground">{venue.golfSpecs.designer}</span>
                    </div>
                    <div className="p-4 bg-muted/40 rounded-2xl border border-border/60 text-center">
                      <span className="text-xs text-muted-foreground block">Green Fee Estimado</span>
                      <span className="text-sm font-bold text-emerald-500">{venue.golfSpecs.greenFee}</span>
                    </div>
                  </div>
                </section>
              )}

              {/* Home Teams (si aplica) */}
              {venue.homeTeams && venue.homeTeams.length > 0 && (
                <section className="bg-card rounded-3xl p-6 md:p-8 border border-border space-y-6 shadow-xs">
                  <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" /> Equipos Locales & Franquicias
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {venue.homeTeams.map((team) => (
                      <div key={team.name} className="bg-muted/30 rounded-2xl p-5 border border-border/60 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center font-bold text-xl text-primary shrink-0">
                          {team.logo}
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground text-base">{team.name}</h4>
                          <p className="text-xs text-muted-foreground">{team.colors}</p>
                          <p className="text-xs font-semibold text-amber-500 mt-1 flex items-center gap-1">
                            <Trophy className="h-3 w-3" /> {team.championships} Campeonatos Nacionales
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* UPCOMING EVENTS & CALENDAR */}
              <section className="bg-card rounded-3xl p-6 md:p-8 border border-border space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" /> Próximos Eventos & Partidos
                    </h3>
                    <p className="text-xs text-muted-foreground">Cartelera confirmada para este recinto</p>
                  </div>
                  <Button variant="outline" size="sm" asChild className="rounded-xl text-xs">
                    <Link to="/eventos">Ver Todos los Eventos del País</Link>
                  </Button>
                </div>

                <div className="space-y-4">
                  {venue.upcomingEvents.map((event) => (
                    <div 
                      key={event.id}
                      className="p-4 sm:p-5 rounded-2xl bg-muted/30 border border-border hover:border-primary/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0 text-center min-w-[70px]">
                          <Calendar className="h-4 w-4 mx-auto mb-1" />
                          <span className="text-xs font-bold block">{event.date.split(" ")[0]}</span>
                        </div>
                        <div>
                          <Badge variant="outline" className="text-[10px] mb-1 capitalize">
                            {event.type}
                          </Badge>
                          <h4 className="font-bold text-foreground text-sm sm:text-base leading-tight">
                            {event.title}
                          </h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-primary" /> {event.time}
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-border/50">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-muted-foreground block">Boletas Desde</span>
                          <span className="font-mono font-bold text-sm text-primary">{event.priceFrom}</span>
                        </div>
                        {event.eventSlug ? (
                          <Button size="sm" asChild className="rounded-xl text-xs gap-1">
                            <Link to={`/evento/${event.eventSlug}`}>
                              <Ticket className="h-3.5 w-3.5" /> Ver Evento
                            </Link>
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            className="rounded-xl text-xs gap-1"
                            onClick={() => toast.success("Redirigiendo a boletería oficial del evento.")}
                          >
                            <Ticket className="h-3.5 w-3.5" /> Adquirir Entrada
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Other Venues Recommendations */}
              <section className="space-y-4">
                <h3 className="font-display text-xl font-bold text-foreground">
                  Otros Escenarios & Recintos Destacados
                </h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {otherVenues.map((v) => (
                    <Link 
                      key={v.id} 
                      to={`/estadio/${v.slug}`} 
                      className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/40 transition-all shadow-xs flex flex-col"
                    >
                      <div className="aspect-[16/10] relative overflow-hidden bg-muted">
                        <img 
                          src={v.image} 
                          alt={v.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <span className="absolute top-2 left-2 text-[10px] bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full font-bold">
                          {v.categoryLabel}
                        </span>
                      </div>
                      <div className="p-3.5 flex flex-col justify-between flex-1">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">📍 {v.location}</p>
                          <h4 className="font-bold text-xs sm:text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                            {v.name}
                          </h4>
                        </div>
                        <span className="text-[11px] text-primary font-semibold mt-2 flex items-center gap-1">
                          Ver ficha <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

            </div>

            {/* Right Column: Sidebar, Contact, Map (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Quick Info Card */}
              <div className="bg-card rounded-3xl border border-border p-6 space-y-4 shadow-xs">
                <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" /> Ficha del Escenario
                </h3>
                
                <div className="space-y-3 text-xs divide-y divide-border/60">
                  <div className="pt-2 flex justify-between">
                    <span className="text-muted-foreground">Categoría:</span>
                    <span className="font-semibold text-foreground">{venue.categoryLabel}</span>
                  </div>
                  {venue.capacity && (
                    <div className="pt-2 flex justify-between">
                      <span className="text-muted-foreground">Aforo / Capacidad:</span>
                      <span className="font-semibold text-foreground">
                        {typeof venue.capacity === "number" ? `${venue.capacity.toLocaleString()} espectadores` : venue.capacity}
                      </span>
                    </div>
                  )}
                  {venue.yearBuilt && (
                    <div className="pt-2 flex justify-between">
                      <span className="text-muted-foreground">Año de Inauguración:</span>
                      <span className="font-semibold text-foreground">{venue.yearBuilt}</span>
                    </div>
                  )}
                  <div className="pt-2 flex justify-between">
                    <span className="text-muted-foreground">Provincia:</span>
                    <span className="font-semibold text-foreground">{venue.province}</span>
                  </div>
                </div>

                {venue.contact && (
                  <div className="pt-3 border-t border-border/60 space-y-2 text-xs">
                    {venue.contact.phone && (
                      <a href={`tel:${venue.contact.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                        <Phone className="h-4 w-4 text-primary shrink-0" /> {venue.contact.phone}
                      </a>
                    )}
                    {venue.contact.website && (
                      <a href={venue.contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                        <Globe className="h-4 w-4 text-primary shrink-0" /> Sitio Web Oficial <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* How to Get There */}
              <div className="bg-card rounded-3xl border border-border p-6 space-y-4 shadow-xs">
                <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" /> Cómo Llegar & Accesos
                </h3>

                <div className="space-y-3 text-xs">
                  {venue.howToGet?.byMetro && (
                    <div className="p-3 bg-muted/40 rounded-xl">
                      <p className="font-bold text-foreground mb-0.5">🚇 En Metro / Transporte Masivo</p>
                      <p className="text-muted-foreground">{venue.howToGet.byMetro}</p>
                    </div>
                  )}
                  {venue.howToGet?.byCar && (
                    <div className="p-3 bg-muted/40 rounded-xl">
                      <p className="font-bold text-foreground mb-0.5">🚗 En Vehículo Particular</p>
                      <p className="text-muted-foreground">{venue.howToGet.byCar}</p>
                    </div>
                  )}
                  {venue.howToGet?.parking && (
                    <div className="p-3 bg-muted/40 rounded-xl">
                      <p className="font-bold text-foreground mb-0.5">🅿️ Estacionamiento</p>
                      <p className="text-muted-foreground">{venue.howToGet.parking}</p>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-2">📍 {venue.address}</p>
                  <Button 
                    variant="outline" 
                    className="w-full text-xs rounded-xl gap-2"
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.name + " " + venue.address)}`, "_blank")}
                  >
                    <MapPin className="h-3.5 w-3.5 text-primary" /> Abrir en Google Maps
                  </Button>
                </div>
              </div>

              {/* Host an Event CTA */}
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl border border-primary/20 p-6 space-y-3 shadow-xs">
                <h3 className="font-display font-bold text-base text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary" /> ¿Deseas Realizar un Evento Aquí?
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Para reservaciones de fechas, alquiler de salas de conferencias, campos deportivos o salones de convenciones, contacta la administración del recinto o a nuestro equipo de Turismo MICE.
                </p>
                <Button size="sm" className="w-full rounded-xl text-xs" asChild>
                  <Link to="/mice">Consultar Turismo de Reuniones & Eventos</Link>
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
