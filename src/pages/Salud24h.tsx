import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Phone, MapPin, Compass, Stethoscope, AlertTriangle, ShieldCheck, 
  HeartPulse, Search, FlaskConical, Smile, Clock, Navigation, CheckCircle2,
  Building2, Globe
} from "lucide-react";
import { toast } from "sonner";
import { BetweenSectionsAd, CompactInlineAd, MobileStickyFooterAd, PanoramaAd } from "@/components/promo";
import { centrosSalud, mockHealthLocations, CentroSalud } from "@/data/healthCenters";

export type HealthCategory = "all" | "hospital" | "pharmacy" | "laboratory" | "dental";

export default function Salud24h() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activePreset, setActivePreset] = useState<string>("Ninguno");
  const [calculatedCentros, setCalculatedCentros] = useState<any[]>(centrosSalud);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<HealthCategory>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  };

  const sortCentrosByDistance = (lat: number, lng: number) => {
    const updated = centrosSalud.map(c => ({
      ...c,
      distance: calculateDistance(lat, lng, c.latitude, c.longitude)
    })).sort((a, b) => a.distance - b.distance);
    setCalculatedCentros(updated);
  };

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          setActivePreset("Ubicación de tu dispositivo");
          sortCentrosByDistance(lat, lng);
          toast.success("¡Coordenadas GPS cargadas y centros ordenados por cercanía!");
        },
        (error) => {
          console.error(error);
          toast.error("No se pudo obtener la geolocalización. Selecciona una ubicación simulada.");
        }
      );
    } else {
      toast.error("Tu navegador no soporta geolocalización.");
    }
  };

  const handleSimulateLocation = (locName: string, lat: number, lng: number) => {
    setUserLocation({ lat, lng });
    setActivePreset(locName);
    sortCentrosByDistance(lat, lng);
    toast.success(`Ubicación simulada en: ${locName}. Centros de salud ordenados.`);
  };

  const filteredCentros = useMemo(() => {
    return calculatedCentros.filter(centro => {
      const matchesCategory = selectedCategory === "all" || centro.type === selectedCategory;
      const matchesRegion = selectedRegion === "all" || centro.region === selectedRegion;
      
      if (!matchesCategory || !matchesRegion) return false;

      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return centro.name.toLowerCase().includes(q) || 
             centro.region.toLowerCase().includes(q) ||
             centro.address.toLowerCase().includes(q) ||
             centro.services.some((s: string) => s.toLowerCase().includes(q)) ||
             (centro.insuranceAccepted && centro.insuranceAccepted.some((i: string) => i.toLowerCase().includes(q)));
    });
  }, [calculatedCentros, selectedCategory, selectedRegion, searchQuery]);

  const categoryCounts = useMemo(() => {
    return {
      all: calculatedCentros.length,
      hospital: calculatedCentros.filter(c => c.type === "hospital").length,
      pharmacy: calculatedCentros.filter(c => c.type === "pharmacy").length,
      laboratory: calculatedCentros.filter(c => c.type === "laboratory").length,
      dental: calculatedCentros.filter(c => c.type === "dental").length,
    };
  }, [calculatedCentros]);

  return (
    <PageTransition>
      <SEOHead
        title="Directorio de Salud, Hospitales, Farmacias, Laboratorios y Dentistas en RD"
        description="Red oficial de emergencias médicas, hospitales bilingües, farmacias 24h, laboratorios clínicos certificados y clínicas odontológicas en República Dominicana."
      />
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />

        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8">
            
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 border-b border-border pb-6">
              <div className="max-w-2xl">
                <Badge className="mb-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1.5 py-1 px-3">
                  <ShieldCheck className="h-4 w-4" /> Asistencia Médica y Hospitalaria Verificada
                </Badge>
                <h1 className="font-display text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
                  Salud, Farmacias & Emergencias
                </h1>
                <p className="text-muted-foreground mt-2 text-sm sm:text-base leading-relaxed">
                  Red integral de hospitales certificados, farmacias de turno 24h, laboratorios clínicos para viajeros y clínicas dentales de urgencia en toda República Dominicana.
                </p>
              </div>

              {/* Emergency Call Widgets */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                  <div className="p-3 bg-red-600 rounded-xl text-white shadow-md shadow-red-600/30">
                    <HeartPulse className="h-6 w-6 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-red-500 tracking-wider">Emergencias RD</p>
                    <a href="tel:911" className="text-2xl font-black text-foreground hover:text-red-500 transition-colors">
                      9-1-1
                    </a>
                    <p className="text-[11px] text-muted-foreground">Policía, Bomberos & Ambulancia</p>
                  </div>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                  <div className="p-3 bg-primary rounded-xl text-primary-foreground shadow-md shadow-primary/30">
                    <Stethoscope className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-primary tracking-wider">Policía Turística</p>
                    <a href="tel:8092003500" className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                      809-200-3500
                    </a>
                    <p className="text-[11px] text-muted-foreground">POLITUR Asistencia 24h</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Geolocation Simulation Console */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="md:col-span-2 bg-secondary/30 border border-border backdrop-blur-md">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                    <Compass className="h-4 w-4 text-primary" /> Geoposicionamiento y Cálculo de Cercanía
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Comprueba qué centros de atención médica están más cercanos a tu hotel, villa o ubicación actual.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-2 flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
                    {mockHealthLocations.map((loc) => (
                      <Button
                        key={loc.name}
                        onClick={() => handleSimulateLocation(loc.name, loc.lat, loc.lng)}
                        variant={activePreset === loc.name ? "default" : "outline"}
                        size="sm"
                        className="text-xs h-8"
                      >
                        {loc.name}
                      </Button>
                    ))}
                  </div>

                  <Button
                    onClick={handleGetLocation}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 text-xs h-8 shrink-0 w-full sm:w-auto"
                  >
                    <Navigation className="h-3.5 w-3.5" /> Usar mi GPS Real
                  </Button>
                </CardContent>
              </Card>

              {/* Active position card */}
              <Card className="bg-card/70 border border-border">
                <CardContent className="p-4 flex flex-col justify-center h-full">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Punto de Referencia Activo</p>
                  <p className="text-sm font-bold mt-1 text-foreground flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary shrink-0" /> {activePreset}
                  </p>
                  {userLocation ? (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Coordenadas activas (distancias calculadas)
                    </p>
                  ) : (
                    <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" /> GPS inactivo (distancia estándar)
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Filters Bar: Category Tabs & Search */}
            <div className="space-y-4 mb-6">
              <div className="flex flex-wrap gap-2 items-center">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                  className="rounded-full text-xs gap-1.5"
                >
                  <Building2 className="h-3.5 w-3.5" /> Todos ({categoryCounts.all})
                </Button>
                <Button
                  variant={selectedCategory === "hospital" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("hospital")}
                  className={`rounded-full text-xs gap-1.5 ${selectedCategory === "hospital" ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
                >
                  <HeartPulse className="h-3.5 w-3.5" /> Hospitales & Urgencias ({categoryCounts.hospital})
                </Button>
                <Button
                  variant={selectedCategory === "pharmacy" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("pharmacy")}
                  className={`rounded-full text-xs gap-1.5 ${selectedCategory === "pharmacy" ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}`}
                >
                  <Stethoscope className="h-3.5 w-3.5" /> Farmacias 24h ({categoryCounts.pharmacy})
                </Button>
                <Button
                  variant={selectedCategory === "laboratory" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("laboratory")}
                  className={`rounded-full text-xs gap-1.5 ${selectedCategory === "laboratory" ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}`}
                >
                  <FlaskConical className="h-3.5 w-3.5" /> Laboratorios Clínicos ({categoryCounts.laboratory})
                </Button>
                <Button
                  variant={selectedCategory === "dental" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("dental")}
                  className={`rounded-full text-xs gap-1.5 ${selectedCategory === "dental" ? "bg-teal-600 hover:bg-teal-700 text-white" : ""}`}
                >
                  <Smile className="h-3.5 w-3.5" /> Odontología & Dentistas ({categoryCounts.dental})
                </Button>
              </div>

              {/* Search & Region Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, especialidad, ARS o seguro aceptado..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-card border-border text-foreground"
                  />
                </div>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  aria-label="Filtrar por región"
                  className="h-10 px-3 rounded-md bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Todas las Regiones</option>
                  <option value="Santo Domingo">Santo Domingo</option>
                  <option value="Punta Cana">Punta Cana / Bávaro</option>
                  <option value="Puerto Plata">Puerto Plata / Cabarete</option>
                  <option value="Santiago">Santiago</option>
                </select>
              </div>
            </div>

            <div className="my-6">
              <CompactInlineAd showDemo />
            </div>

            {/* Results Counter */}
            <p className="text-xs text-muted-foreground mb-4">
              Mostrando <strong className="text-foreground">{filteredCentros.length}</strong> establecimientos médicos verificados
            </p>

            {/* List display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredCentros.map((centro) => {
                  const isHospital = centro.type === "hospital";
                  const isPharmacy = centro.type === "pharmacy";
                  const isLab = centro.type === "laboratory";

                  const badgeBg = isHospital 
                    ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                    : isPharmacy
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                    : isLab
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    : "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20";

                  const TypeIcon = isHospital 
                    ? HeartPulse 
                    : isPharmacy 
                    ? Stethoscope 
                    : isLab 
                    ? FlaskConical 
                    : Smile;

                  const typeLabel = isHospital 
                    ? "Hospital & Urgencias" 
                    : isPharmacy 
                    ? "Farmacia & Medicamentos" 
                    : isLab 
                    ? "Laboratorio Clínico" 
                    : "Clínica Dental";

                  return (
                    <motion.div
                      key={centro.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Card className="h-full border border-border/70 bg-card hover:border-primary/50 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between overflow-hidden rounded-2xl">
                        <div>
                          {/* Image Container with Badges */}
                          <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                            <img
                              src={centro.imageUrl || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80"}
                              alt={centro.name}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/30" />
                            
                            {/* Badges on Image */}
                            <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                              <Badge className={`${badgeBg} backdrop-blur-md shadow-sm border gap-1.5 py-1 px-2.5 font-semibold text-xs`}>
                                <TypeIcon className="h-3.5 w-3.5" />
                                {typeLabel}
                              </Badge>
                            </div>

                            <div className="absolute top-3 right-3 z-10">
                              {centro.is24h ? (
                                <Badge className="bg-emerald-600/90 hover:bg-emerald-600 text-white font-semibold backdrop-blur-md text-[11px] gap-1 shadow-sm border border-emerald-400/30">
                                  <Clock className="h-3 w-3 animate-pulse" /> 24 Horas
                                </Badge>
                              ) : centro.schedule ? (
                                <Badge className="bg-black/60 text-white/90 font-medium backdrop-blur-md text-[10px] border border-white/20">
                                  {centro.schedule.split("(")[0]}
                                </Badge>
                              ) : null}
                            </div>

                            {/* Distance Tag bottom right */}
                            <div className="absolute bottom-2.5 right-3 z-10">
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white/95 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                                <MapPin className="h-3 w-3 text-primary" />
                                {centro.distance !== undefined ? `${centro.distance} km` : "GPS RD"}
                              </span>
                            </div>
                          </div>

                          <div className="p-5">
                            <Link to={`/salud-24h/${centro.id}`}>
                              <h3 className="font-display font-bold text-lg text-foreground leading-snug group-hover:text-primary transition-colors hover:underline cursor-pointer">
                                {centro.name}
                              </h3>
                            </Link>

                            <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1.5 leading-relaxed">
                              <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{centro.address}</span>
                            </p>

                            {centro.languages && (
                              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span>Idiomas: <strong className="text-foreground font-medium">{centro.languages.join(", ")}</strong></span>
                              </div>
                            )}

                            <div className="mt-3.5 flex flex-wrap gap-1.5">
                              {centro.services.slice(0, 4).map((serv: string) => (
                                <span 
                                  key={serv} 
                                  className="text-[10px] bg-secondary/80 text-foreground/80 font-medium px-2 py-0.5 rounded-md border border-border/50"
                                >
                                  {serv}
                                </span>
                              ))}
                              {centro.services.length > 4 && (
                                <span className="text-[10px] bg-muted text-muted-foreground font-medium px-2 py-0.5 rounded-md">
                                  +{centro.services.length - 4} más
                                </span>
                              )}
                            </div>

                            {centro.insuranceAccepted && centro.insuranceAccepted.length > 0 && (
                              <div className="mt-3.5 pt-3 border-t border-border/40">
                                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">
                                  Seguros / ARS Aceptadas:
                                </p>
                                <p className="text-[11px] text-foreground/75 line-clamp-1">
                                  {centro.insuranceAccepted.join(" • ")}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-4 bg-muted/40 border-t border-border/50 flex items-center justify-between gap-2">
                          <Link to={`/salud-24h/${centro.id}`} className="flex-1">
                            <Button size="sm" variant="outline" className="w-full text-xs h-9 px-3 rounded-xl border-border hover:border-primary/50 font-medium">
                              Ver Ficha
                            </Button>
                          </Link>
                          
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs h-9 w-9 p-0 border-border rounded-xl shrink-0"
                            onClick={() => {
                              const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(centro.name + " " + centro.address)}`;
                              window.open(url, "_blank");
                            }}
                            title={`Ver ruta hacia ${centro.name}`}
                            aria-label={`Ver ruta hacia ${centro.name}`}
                          >
                            <Navigation className="h-3.5 w-3.5" />
                          </Button>

                          <a href={`tel:${centro.emergencyPhone || centro.phone}`} className="shrink-0">
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs h-9 px-3.5 shadow-sm rounded-xl font-medium">
                              <Phone className="h-3.5 w-3.5" /> Llamar
                            </Button>
                          </a>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {filteredCentros.length === 0 && (
              <div className="text-center py-16 bg-card rounded-2xl border border-border">
                <p className="text-muted-foreground text-sm">No se encontraron centros de salud con los filtros aplicados.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 text-xs"
                  onClick={() => { setSearchQuery(""); setSelectedCategory("all"); setSelectedRegion("all"); }}
                >
                  Restablecer filtros
                </Button>
              </div>
            )}

            {/* Banner Publicitario Panorama */}
            <div className="mt-16">
              <PanoramaAd />
            </div>

          </div>
        </main>

        <BetweenSectionsAd showDemo />
        <MobileStickyFooterAd showDemo />

        <Footer />
      </div>
    </PageTransition>
  );
}
