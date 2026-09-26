import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Plane, MapPin, Star, ChevronRight, Clock, Phone, Globe, 
  Car, ShoppingBag, Wifi, Shield, Navigation, PlaneTakeoff, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { useTranslation } from "@/i18n";
import { getAirportBySlug } from "@/data/airports";

export default function AeropuertoDetalle() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const airport = slug ? getAirportBySlug(slug) : undefined;

  if (!airport) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-32 text-center">
            <Plane className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">{t("common.noResults") || "Aeropuerto no encontrado"}</h1>
            <p className="text-muted-foreground mb-8">El aeropuerto que buscas no existe o está en actualización.</p>
            <Link to="/como-llegar"><Button>{t("common.viewAll") || "Ver cómo llegar"}</Button></Link>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SEOHead
        title={`${airport.name} (${airport.code}) | DescubreRD`}
        description={airport.shortDescription}
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative h-[50vh] md:h-[55vh] overflow-hidden">
          <img src={airport.imageUrl} alt={airport.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="container mx-auto">
              <nav className="flex items-center gap-2 text-sm text-white/70 mb-4">
                <Link to="/" className="hover:text-white">{t("common.back") || "Inicio"}</Link>
                <ChevronRight className="h-4 w-4" />
                <Link to="/como-llegar" className="hover:text-white">{t("logistica.title") || "Cómo Llegar"}</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-white">{airport.code}</span>
              </nav>
              <Badge className="mb-3 bg-white/20 text-white border-none">
                <PlaneTakeoff className="h-3 w-3 mr-1" />
                {airport.type === 'internacional' ? t("logistica.airports") || 'Internacional' : 'Doméstico'}
              </Badge>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-2">{airport.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
                <span className="flex items-center gap-1 text-lg font-bold bg-white/20 px-3 py-1 rounded-lg">{airport.code}</span>
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{airport.city}, {airport.provinceName}</span>
                <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-400" />{airport.rating} ({airport.reviewCount.toLocaleString()})</span>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2 space-y-10">
              {/* About */}
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">Sobre el Aeropuerto</h2>
                <p className="text-muted-foreground leading-relaxed">{airport.description}</p>
              </div>

              {/* Airlines */}
              <div>
                <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Plane className="h-5 w-5 text-primary" /> Aerolíneas
                </h2>
                <div className="flex flex-wrap gap-2">
                  {airport.airlines.map((a, i) => (
                    <Badge key={i} variant="secondary">{a}</Badge>
                  ))}
                </div>
              </div>

              {/* Destinations */}
              <div>
                <h2 className="font-display text-xl font-bold text-foreground mb-4">Destinos Principales</h2>
                <div className="flex flex-wrap gap-2">
                  {airport.destinations.map((d, i) => (
                    <Badge key={i} variant="outline">{d}</Badge>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div>
                <h2 className="font-display text-xl font-bold text-foreground mb-4">Servicios</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {airport.services.map((s, i) => (
                    <div key={i} className="p-4 rounded-xl bg-card border border-border">
                      <h3 className="font-semibold text-foreground mb-1">{s.name}</h3>
                      <p className="text-sm text-muted-foreground">{s.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transportation */}
              <div>
                <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" /> Transporte desde el Aeropuerto
                </h2>
                <div className="space-y-3">
                  {airport.transportation.map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
                      <div>
                        <p className="font-semibold text-foreground">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.detail}</p>
                      </div>
                      {t.price && <Badge variant="secondary">{t.price}</Badge>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Gallery */}
              {airport.gallery.length > 0 && (
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">Galería</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {airport.gallery.map((img, i) => (
                      <div key={i} className="aspect-video rounded-xl overflow-hidden">
                        <img src={img} alt={`${airport.name} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Info Card */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">Información</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <PlaneTakeoff className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Código IATA / ICAO</p>
                      <p className="text-sm text-muted-foreground">{airport.code} / {airport.icao}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Navigation className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Terminales</p>
                      <p className="text-sm text-muted-foreground">{airport.terminals.join(', ')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Teléfono</p>
                      <p className="text-sm text-muted-foreground">{airport.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Sitio Web</p>
                      <a href={airport.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">{airport.website.replace('https://', '')}</a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nearby Destinations */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">Destinos Cercanos</h3>
                <div className="space-y-2">
                  {airport.nearbyDestinations.map((d, i) => (
                    <Link key={i} to={`/destino/${d.slug}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                      <div>
                        <p className="font-medium text-foreground text-sm">{d.name}</p>
                        <p className="text-xs text-muted-foreground">{d.distance}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Map placeholder */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">Ubicación</h3>
                <div className="aspect-square bg-muted rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Navigation className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{airport.coordinates.lat.toFixed(4)}°N, {Math.abs(airport.coordinates.lng).toFixed(4)}°W</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
