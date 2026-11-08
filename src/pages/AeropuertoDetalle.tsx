import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Plane, MapPin, Star, ChevronRight, Clock, Phone, Globe, 
  Car, ShoppingBag, Wifi, Shield, Navigation, PlaneTakeoff, 
  ExternalLink, Luggage, Dog, AlertTriangle, CheckCircle2,
  HelpCircle, Compass, Building2, Sparkles, CreditCard, ShieldCheck,
  Search, ArrowRight, QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Accordion, 
  AccordionItem, 
  AccordionTrigger, 
  AccordionContent 
} from "@/components/ui/accordion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { useTranslation } from "@/i18n";
import { getAirportBySlug, airports } from "@/data/airports";
import { usePageContent } from "@/lib/pageContent";
import { ETicketBanner } from "@/components/airports/ETicketBanner";

export default function AeropuertoDetalle() {
  const pc = usePageContent("aeropuerto-detalle");
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const airport = slug ? getAirportBySlug(slug) : undefined;

  const [activeContinent, setActiveContinent] = useState<string>("all");
  const [airlineSearch, setAirlineSearch] = useState<string>("");

  if (!airport) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-32 text-center max-w-lg">
            <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4 border border-border">
              <Plane className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-3">{t("common.noResults") || "Aeropuerto no encontrado"}</h1>
            <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
              {pc.tx("p.1", "El aeropuerto solicitado no se encuentra en el registro o fue actualizado con su nueva nomenclatura.")}
            </p>
            <Link to="/aeropuerto">
              <Button className="rounded-lg px-6">
                {t("common.viewAll") || "Ver todos los aeropuertos"}
              </Button>
            </Link>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  // Filtrado de aerolíneas
  const filteredAirlines = (airport.airlinesDetailed || []).filter(airline => 
    airline.name.toLowerCase().includes(airlineSearch.toLowerCase())
  );

  return (
    <PageTransition>
      <SEOHead
        title={`${airport.name} (${airport.code}) | Terminal, Vuelos, VIP y Parqueo`}
        description={airport.shortDescription}
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Cinematográfico Aéreo */}
        <section className="relative min-h-[520px] md:min-h-[580px] flex items-end overflow-hidden pb-12 pt-28">
          <img 
            src={airport.imageUrl} 
            alt={airport.name} 
            className="absolute inset-0 w-full h-full object-cover brightness-[0.78] contrast-[1.05]" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-black/40" />
          <div className="absolute inset-0 bg-radial-[at_top_right] from-sky-500/15 via-transparent to-transparent" />

          <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb minimalista */}
            <nav className="flex items-center gap-2 text-xs font-medium text-white/75 mb-6" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-white transition-colors">{t("common.back") || "Inicio"}</Link>
              <ChevronRight className="h-3.5 w-3.5 text-white/40" />
              <Link to="/aeropuerto" className="hover:text-white transition-colors">Aeropuertos</Link>
              <ChevronRight className="h-3.5 w-3.5 text-white/40" />
              <span className="text-white font-semibold">{airport.code}</span>
            </nav>

            <div className="max-w-4xl">
              {/* Antetítulo limpio sin cápsula de fondo (Regla 1 master-frontend-designer) */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wider text-sky-300 mb-3">
                <span>RED AEROPORTUARIA NACIONAL</span>
                <span className="text-white/40">•</span>
                <span>IATA: {airport.code}</span>
                <span className="text-white/40">•</span>
                <span>ICAO: {airport.icao}</span>
                {airport.operator && (
                  <>
                    <span className="text-white/40">•</span>
                    <span className="text-emerald-300">{airport.operator}</span>
                  </>
                )}
              </div>

              <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-4 drop-shadow-sm">
                {airport.name}
              </h1>

              <p className="text-base sm:text-lg text-white/90 max-w-2xl leading-relaxed mb-6 font-normal">
                {airport.shortDescription}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white/85">
                <span className="inline-flex items-center gap-1.5 font-bold bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-white/20">
                  <MapPin className="h-4 w-4 text-sky-300" />
                  {airport.city}, {airport.provinceName}
                </span>
                <span className="inline-flex items-center gap-1.5 font-bold bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-white/20">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  {airport.rating.toFixed(1)} ({airport.reviewCount.toLocaleString()} reseñas)
                </span>
                {airport.passengersAnnual && (
                  <span className="inline-flex items-center gap-1.5 font-bold bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-white/20">
                    <PlaneTakeoff className="h-4 w-4 text-emerald-300" />
                    {airport.passengersAnnual} pax/año
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Barra de Especificaciones Técnicas (Inspirada en cabina de vuelo) */}
        <section className="border-y border-border/80 bg-card/60 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center sm:text-left divide-y sm:divide-y-0 sm:divide-x divide-border/60">
              <div className="pt-2 sm:pt-0 sm:px-3 first:px-0">
                <span className="text-3xs uppercase font-bold tracking-wider text-muted-foreground block">Código IATA / OACI</span>
                <span className="text-sm font-black text-foreground">{airport.code} / {airport.icao}</span>
              </div>
              <div className="pt-2 sm:pt-0 sm:px-3">
                <span className="text-3xs uppercase font-bold tracking-wider text-muted-foreground block">Tráfico Anual</span>
                <span className="text-sm font-black text-foreground">{airport.passengersAnnual || "En actualización"}</span>
              </div>
              <div className="pt-2 sm:pt-0 sm:px-3">
                <span className="text-3xs uppercase font-bold tracking-wider text-muted-foreground block">Pista Principal</span>
                <span className="text-sm font-black text-foreground">{airport.runwayLength || "Pista comercial"}</span>
              </div>
              <div className="pt-2 sm:pt-0 sm:px-3">
                <span className="text-3xs uppercase font-bold tracking-wider text-muted-foreground block">Elevación</span>
                <span className="text-sm font-black text-foreground">{airport.elevation || "Nivel del mar"}</span>
              </div>
              <div className="pt-2 sm:pt-0 sm:px-3">
                <span className="text-3xs uppercase font-bold tracking-wider text-muted-foreground block">Terminales</span>
                <span className="text-sm font-black text-foreground">{airport.terminals.join(" y ")}</span>
              </div>
              <div className="pt-2 sm:pt-0 sm:px-3">
                <span className="text-3xs uppercase font-bold tracking-wider text-muted-foreground block">Operador Oficial</span>
                <span className="text-sm font-black text-foreground truncate block">{airport.operator || "Autoridad Aeroportuaria"}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Contenido Principal Modular */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Banner Obligatorio de E-Ticket hacia /e-ticket */}
          <ETicketBanner airportName={airport.name} className="mb-10" />

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Columna Principal con Tabs Descomprimidos (Regla 5 y 6) */}
            <div className="lg:col-span-2 space-y-10">

              {/* Pestañas de Navegación por Servicio */}
              <Tabs defaultValue="aerolineas" className="w-full">
                <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 h-auto p-1.5 bg-muted/60 rounded-xl border border-border/80 gap-1">
                  <TabsTrigger value="aerolineas" className="rounded-lg text-xs font-bold py-2.5 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                    Aerolíneas y Rutas
                  </TabsTrigger>
                  <TabsTrigger value="vip" className="rounded-lg text-xs font-bold py-2.5 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                    Salas VIP ({airport.vipLounges?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="estacionamiento" className="rounded-lg text-xs font-bold py-2.5 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                    Estacionamiento
                  </TabsTrigger>
                  <TabsTrigger value="viajero" className="rounded-lg text-xs font-bold py-2.5 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                    Equipaje y Mascotas
                  </TabsTrigger>
                </TabsList>

                {/* TAB 1: Aerolíneas y Destinos */}
                <TabsContent value="aerolineas" className="mt-8 space-y-8 focus-visible:outline-none">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">Conexiones Globales</span>
                        <h2 className="text-2xl font-black text-foreground mt-1">Aerolíneas Comerciales</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Compañías que operan vuelos regulares y chárter en la terminal.
                        </p>
                      </div>

                      {/* Buscador de Aerolínea */}
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                          type="text"
                          value={airlineSearch}
                          onChange={(e) => setAirlineSearch(e.target.value)}
                          placeholder="Buscar aerolínea..."
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-card border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>

                    {/* Grid de Aerolíneas Detalladas con Enlaces Oficiales */}
                    {airport.airlinesDetailed && airport.airlinesDetailed.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {filteredAirlines.map((airline, idx) => (
                          <div 
                            key={idx} 
                            className="group p-3.5 rounded-xl bg-card border border-border/80 hover:border-primary/40 transition-colors flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                                  {airline.name}
                                </span>
                                <Plane className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                              </div>
                              <p className="text-2xs text-muted-foreground truncate font-mono">
                                {airline.website.replace('https://', '').replace('http://', '').replace('www.', '')}
                              </p>
                            </div>
                            <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between">
                              <span className="text-3xs text-muted-foreground">Mostrador oficial</span>
                              <a
                                href={airline.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                              >
                                Ver sitio <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {airport.airlines.map((a, i) => (
                          <Badge key={i} variant="secondary" className="px-3 py-1.5 text-xs font-medium rounded-lg">
                            {a}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Destinos agrupados por Continente si existen */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Rutas Directas</span>
                    <h3 className="text-xl font-black text-foreground mt-1 mb-3">Destinos Conectados</h3>

                    {airport.destinationsByContinent && airport.destinationsByContinent.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-1.5 border-b border-border/60 pb-3">
                          <button
                            type="button"
                            onClick={() => setActiveContinent("all")}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                              activeContinent === "all"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted/60 text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            Todos ({airport.destinations.length})
                          </button>
                          {airport.destinationsByContinent.map((group, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActiveContinent(group.region)}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                                activeContinent === group.region
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
                              }`}
                            >
                              {group.region} ({group.destinations.length})
                            </button>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                          {(activeContinent === "all" 
                            ? airport.destinations 
                            : airport.destinationsByContinent.find(g => g.region === activeContinent)?.destinations || []
                          ).map((dest, i) => (
                            <span 
                              key={i} 
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-medium text-foreground"
                            >
                              <MapPin className="h-3 w-3 text-primary" /> {dest}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {airport.destinations.map((d, i) => (
                          <Badge key={i} variant="outline" className="px-3 py-1.5 text-xs rounded-lg">
                            {d}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* TAB 2: Salas VIP y Servicios Exclusivos */}
                <TabsContent value="vip" className="mt-8 space-y-6 focus-visible:outline-none">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Confort y Privacidad</span>
                    <h2 className="text-2xl font-black text-foreground mt-1">Salones VIP y Servicios Preferenciales</h2>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                      Espacios exclusivos diseñados para brindar tranquilidad antes de tu embarque, con gastronomía, fast-track migratorio y conectividad de alta velocidad.
                    </p>
                  </div>

                  {airport.vipLounges && airport.vipLounges.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {airport.vipLounges.map((lounge, idx) => (
                        <div 
                          key={idx} 
                          className="p-5 rounded-2xl bg-card border border-border/80 flex flex-col justify-between shadow-xs hover:border-primary/40 transition-colors"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-bold text-base text-foreground">{lounge.name}</h3>
                              {lounge.hours && (
                                <span className="inline-flex items-center gap-1 text-3xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                                  <Clock className="h-3 w-3" /> {lounge.hours}
                                </span>
                              )}
                            </div>

                            <p className="text-xs font-semibold text-primary mb-2 flex items-center gap-1">
                              <Building2 className="h-3.5 w-3.5" /> {lounge.location}
                            </p>

                            {lounge.description && (
                              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                                {lounge.description}
                              </p>
                            )}

                            {lounge.access && (
                              <div className="text-2xs text-muted-foreground bg-muted/50 p-2.5 rounded-lg mb-3">
                                <span className="font-bold text-foreground">Acceso:</span> {lounge.access}
                              </div>
                            )}
                          </div>

                          <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                            {lounge.phone && (
                              <a 
                                href={`tel:${lounge.phone}`}
                                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium"
                              >
                                <Phone className="h-3 w-3 text-primary" /> {lounge.phone}
                              </a>
                            )}
                            {lounge.email && (
                              <a 
                                href={`mailto:${lounge.email}`}
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-semibold"
                              >
                                Contactar vía correo
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl bg-card border border-border text-center">
                      <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-semibold text-foreground">Salones VIP Disponibles</p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                        Este aeropuerto dispone de áreas de espera preferencial para pasajeros de clase ejecutiva y titulares de programas élite autorizados.
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* TAB 3: Estacionamiento Oficial y Preguntas Frecuentes */}
                <TabsContent value="estacionamiento" className="mt-8 space-y-8 focus-visible:outline-none">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Tarifas y Modalidades</span>
                    <h2 className="text-2xl font-black text-foreground mt-1">Estacionamiento en el Aeropuerto</h2>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                      {airport.parkingInfo?.overview || "Zonas de parqueo seguras las 24 horas para estancias cortas, viajes prolongados y zona de alta comodidad."}
                    </p>
                  </div>

                  {/* Opciones de Parqueo */}
                  {airport.parkingInfo?.options && airport.parkingInfo.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {airport.parkingInfo.options.map((opt, idx) => (
                        <div 
                          key={idx}
                          className="p-5 rounded-2xl bg-card border border-border/80 flex flex-col justify-between hover:border-primary/40 transition-colors"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-bold text-base text-foreground">{opt.title}</h3>
                              <Car className="h-4 w-4 text-primary" />
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {opt.detail}
                            </p>
                          </div>
                          {opt.link && (
                            <div className="mt-4 pt-3 border-t border-border/60">
                              <a
                                href={opt.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                              >
                                Ver tarifas y reservar <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Acordeón de Preguntas Frecuentes de Estacionamiento */}
                  {airport.parkingInfo?.faqs && airport.parkingInfo.faqs.length > 0 && (
                    <div className="pt-4">
                      <div className="mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">Información Clave</span>
                        <h3 className="text-lg font-black text-foreground mt-0.5">Preguntas Frecuentes de Parqueo</h3>
                      </div>

                      <Accordion type="single" collapsible className="w-full space-y-2">
                        {airport.parkingInfo.faqs.map((faq, idx) => (
                          <AccordionItem 
                            key={idx} 
                            value={`faq-${idx}`}
                            className="bg-card border border-border/80 rounded-xl px-4 py-1"
                          >
                            <AccordionTrigger className="text-xs sm:text-sm font-bold text-foreground text-left hover:no-underline py-3">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-xs text-muted-foreground leading-relaxed pt-1 pb-3">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  )}
                </TabsContent>

                {/* TAB 4: Equipaje de Mano y Mascotas */}
                <TabsContent value="viajero" className="mt-8 space-y-8 focus-visible:outline-none">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Normativas Oficiales</span>
                    <h2 className="text-2xl font-black text-foreground mt-1">Guía del Viajero</h2>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                      Todo lo que necesitas saber sobre los límites de equipaje en cabina y los protocolos para viajar con animales de compañía.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Equipaje de Mano */}
                    <div className="p-6 rounded-2xl bg-card border border-border/80 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 bg-primary/10 text-primary rounded-xl">
                            <Luggage className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-foreground">Equipaje de Mano</h3>
                            <span className="text-2xs text-muted-foreground">Cuanto menos, es mejor</span>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                          {airport.travelGuides?.handBaggage.description || 
                            "Las dos prioridades dentro del avión son la seguridad y la comodidad. Las reglas respecto al equipaje de mano son claras: solo debes llevar lo que es imprescindible; lo demás debe ir en bodega."}
                        </p>

                        <div className="space-y-2">
                          {(airport.travelGuides?.handBaggage.tips || [
                            "Líquidos en recipientes individuales de máx. 100 ml dentro de bolsa transparente.",
                            "Medicamentos y documentos de identidad siempre en tu bolso de mano personal.",
                            "Dispositivos con baterías de litio deben permanecer en cabina por seguridad."
                          ]).map((tip, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Viajar con Animales */}
                    <div className="p-6 rounded-2xl bg-card border border-border/80 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                            <Dog className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-foreground">Viajar con Mascotas</h3>
                            <span className="text-2xs text-muted-foreground">Tu compañero también tiene lugar</span>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                          {airport.travelGuides?.petTravel.description || 
                            "Aunque cada aerolínea tenga sus propias directrices, se pueden transportar animales de compañía cumpliendo con las regulaciones de sanidad animal y bienestar de vuelo."}
                        </p>

                        <div className="space-y-2">
                          {(airport.travelGuides?.petTravel.tips || [
                            "Certificado de salud veterinario emitido con menos de 15 días previos al viaje.",
                            "Carnet de vacunación antirrábica al día para ingreso y salida de RD.",
                            "Transportín homologado IATA con adecuada ventilación y tamaño para tu mascota."
                          ]).map((tip, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Sobre el Aeropuerto e Historia */}
              <div className="pt-6 border-t border-border/80">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Reseña e Infraestructura</span>
                <h2 className="text-2xl font-black text-foreground mt-1 mb-3">{pc.tx("h2.1", "Sobre el Aeropuerto")}</h2>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  {airport.description}
                </p>

                {airport.highlights && airport.highlights.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {airport.highlights.map((h, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-muted text-foreground">
                        <Sparkles className="h-3 w-3 text-primary" /> {h}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Servicios Generales */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Comodidades</span>
                <h3 className="text-xl font-black text-foreground mt-1 mb-4">{pc.tx("h2.4", "Servicios en Terminal")}</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {airport.services.map((s, i) => (
                    <div key={i} className="p-4 rounded-xl bg-card border border-border/80">
                      <h4 className="font-bold text-sm text-foreground mb-1">{s.name}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transporte y Movilidad Terrestre */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Movilidad y Traslados</span>
                <h3 className="text-xl font-black text-foreground mt-1 mb-4 flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  {pc.tx("h2.5", "Transporte desde el Aeropuerto")}
                </h3>
                <div className="space-y-2.5">
                  {airport.transportation.map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/80">
                      <div>
                        <p className="font-bold text-sm text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.detail}</p>
                      </div>
                      {t.price && (
                        <Badge variant="secondary" className="font-bold text-xs rounded-md">
                          {t.price}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Galería Fotográfica */}
              {airport.gallery.length > 0 && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">Visuales de la Terminal</span>
                  <h3 className="text-xl font-black text-foreground mt-1 mb-4">{pc.tx("h2.6", "Galería Fotográfica")}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {airport.gallery.map((img, i) => (
                      <div key={i} className="aspect-video rounded-xl overflow-hidden border border-border">
                        <img 
                          src={img} 
                          alt={`${airport.name} imagen ${i + 1}`} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar con Contacto Oficial, Mapa y Destinos Cercanos */}
            <div className="space-y-6">
              {/* Tarjeta de Contacto Oficial */}
              <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs">
                <span className="text-3xs font-bold uppercase tracking-wider text-primary block mb-1">Centro de Información</span>
                <h3 className="font-display text-lg font-black text-foreground mb-4">{pc.tx("h3.1", "Atención al Pasajero")}</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-primary mt-1 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">{pc.tx("p.4", "Teléfono de Terminal")}</p>
                      <a href={`tel:${airport.phone}`} className="text-xs text-muted-foreground hover:text-foreground">
                        {airport.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Globe className="h-4 w-4 text-primary mt-1 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">{pc.tx("p.5", "Sitio Web Oficial")}</p>
                      <a 
                        href={airport.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-semibold"
                      >
                        {airport.website.replace('https://', '')}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 mt-1 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">POLITUR (Policía Turística)</p>
                      <p className="text-xs text-muted-foreground">Mostrador 24/7 en zona de llegadas</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-border/60 space-y-2">
                  <Link to="/e-ticket" className="w-full block">
                    <Button className="w-full rounded-xl text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
                      <QrCode className="h-4 w-4" />
                      <span>Guía Oficial del E-Ticket</span>
                    </Button>
                  </Link>
                  <a
                    href="https://eticket.gob.do/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block text-center"
                  >
                    <Button className="w-full rounded-xl text-2xs font-semibold gap-1.5" variant="ghost">
                      <span>Ir al portal eticket.gob.do</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </a>
                </div>
              </div>

              {/* Destinos Cercanos */}
              <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs">
                <span className="text-3xs font-bold uppercase tracking-wider text-primary block mb-1">Turismo Regional</span>
                <h3 className="font-display text-lg font-black text-foreground mb-4">{pc.tx("h3.2", "Destinos Conectados")}</h3>
                <div className="space-y-2">
                  {airport.nearbyDestinations.map((d, i) => (
                    <Link 
                      key={i} 
                      to={`/destino/${d.slug}`} 
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/60 transition-colors border border-transparent hover:border-border/60"
                    >
                      <div>
                        <p className="font-bold text-foreground text-xs">{d.name}</p>
                        <p className="text-2xs text-muted-foreground">{d.distance}</p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Otros Aeropuertos Recomendados */}
              <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs">
                <span className="text-3xs font-bold uppercase tracking-wider text-primary block mb-1">Explora más</span>
                <h3 className="font-display text-lg font-black text-foreground mb-4">Otros Aeropuertos</h3>
                <div className="space-y-2">
                  {airports
                    .filter(a => a.id !== airport.id)
                    .slice(0, 4)
                    .map((other, idx) => (
                      <Link
                        key={idx}
                        to={`/aeropuerto/${other.slug}`}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/60 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 rounded-md bg-muted text-xs font-black text-foreground">
                            {other.code}
                          </span>
                          <span className="text-xs font-semibold text-foreground truncate max-w-[170px]">
                            {other.city}
                          </span>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </Link>
                    ))}
                </div>
              </div>

              {/* Ubicación y Coordenadas */}
              <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs">
                <span className="text-3xs font-bold uppercase tracking-wider text-primary block mb-1">Geolocalización</span>
                <h3 className="font-display text-lg font-black text-foreground mb-3">{pc.tx("h3.3", "Ubicación Geográfica")}</h3>
                <div className="p-4 bg-muted/40 rounded-xl flex items-center justify-between border border-border/60">
                  <div className="flex items-center gap-2.5">
                    <Navigation className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs font-bold text-foreground">Coordenadas GPS</p>
                      <p className="text-2xs text-muted-foreground font-mono">
                        {airport.coordinates.lat.toFixed(4)}°N, {Math.abs(airport.coordinates.lng).toFixed(4)}°W
                      </p>
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${airport.coordinates.lat},${airport.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Abrir mapa
                  </a>
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
