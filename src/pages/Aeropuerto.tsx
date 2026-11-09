import { AerolineasSection } from "@/components/vuelos/AerolineasSection";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Plane, Clock, Thermometer, Terminal, Search, PlaneTakeoff, PlaneLanding,
  Wifi, ShoppingBag, Heart, DollarSign, Car, MapPin, Star, ChevronRight,
  ShieldCheck, HelpCircle, Navigation, Globe2, FileText, Sparkles,
  Luggage, ShieldAlert, CheckCircle2, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead, generateItemListSchema } from "@/components/SEOHead";
import { FlightConnectionSearch } from "@/components/airports/FlightConnectionSearch";
import { DigitalBoardingPassCard } from "@/components/airports/DigitalBoardingPassCard";
import { LiveFlightStatusBoard } from "@/components/airports/LiveFlightStatusBoard";
import { ETicketAssistant } from "@/components/airports/ETicketAssistant";
import { usePageContent } from "@/lib/pageContent";

const ALL_AIRPORTS = [
  {
    name: "Aeropuerto Internacional Las Américas",
    code: "SDQ",
    city: "Santo Domingo",
    province: "Santo Domingo Este",
    operator: "AERODOM / VINCI Airports",
    passengers: "> 5.8M pax/año",
    runway: "3,354 m",
    image: "/img/Aeropuerto Internacional de Las Américas.jpg",
    flightsDay: 130,
    tags: ["Hub de la Capital", "Zona de Carga", "Arajet Mega-Hub"],
    slug: "aeropuerto-internacional-las-americas"
  },
  {
    name: "Aeropuerto Internacional de Punta Cana",
    code: "PUJ",
    city: "Punta Cana / Bávaro",
    province: "La Altagracia",
    operator: "Grupo Puntacana",
    passengers: "> 9.5M pax/año",
    runway: "3,100 m",
    image: "/img/Aeropuerto Internaciona de Punta Cana PUJ 1.webp",
    flightsDay: 160,
    tags: ["Mayor tráfico", "Piscina VIP", "Terminal Ecológica"],
    slug: "aeropuerto-internacional-de-punta-cana"
  },
  {
    name: "Aeropuerto Internacional del Cibao",
    code: "STI",
    city: "Santiago de los Caballeros",
    province: "Santiago",
    operator: "Aeropuerto Internacional del Cibao S.A.",
    passengers: "> 2.1M pax/año",
    runway: "2,620 m",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&fit=crop",
    flightsDay: 55,
    tags: ["Conexión Norte", "Comunidad Diáspora", "Nueva Terminal 2025"],
    slug: "aeropuerto-internacional-del-cibao"
  },
  {
    name: "Aeropuerto Internacional Gregorio Luperón",
    code: "POP",
    city: "Puerto Plata",
    province: "Puerto Plata",
    operator: "AERODOM / VINCI Airports",
    passengers: "> 850k pax/año",
    runway: "3,081 m",
    image: "/img/Puerto Plata Aurport - Aerodom.jpg",
    flightsDay: 30,
    tags: ["Costa Norte", "Vuelos Chárter", "Deportes Acuáticos"],
    slug: "aeropuerto-internacional-gregorio-luperon"
  },
  {
    name: "Aeropuerto Internacional de La Romana",
    code: "LRM",
    city: "La Romana / Bayahíbe",
    province: "La Romana",
    operator: "Central Romana Corporation",
    passengers: "> 280k pax/año",
    runway: "2,949 m",
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&fit=crop",
    flightsDay: 15,
    tags: ["Casa de Campo", "Cruceros y Yates", "Vuelos Golf"],
    slug: "aeropuerto-internacional-de-la-romana"
  },
  {
    name: "Aeropuerto Internacional Dr. Joaquín Balaguer",
    code: "JBQ",
    city: "Santo Domingo Norte (La Isabela)",
    province: "Santo Domingo",
    operator: "AERODOM / VINCI Airports",
    passengers: "> 160k pax/año",
    runway: "1,650 m",
    image: "https://images.unsplash.com/photo-1759430710977-a557a49897ff?w=800&fit=crop",
    flightsDay: 20,
    tags: ["Aviación Ejecutiva", "Conexión Haití/Cuba", "FBO Corporativo"],
    slug: "aeropuerto-internacional-dr-joaquin-balaguer"
  },
  {
    name: "Aeropuerto Internacional Presidente Juan Bosch",
    code: "AZS",
    city: "El Catey / Las Terrenas",
    province: "Samaná",
    operator: "AERODOM / VINCI Airports",
    passengers: "> 95k pax/año",
    runway: "3,000 m",
    image: "https://images.unsplash.com/photo-1512353087810-25dfcd100962?w=800&fit=crop",
    flightsDay: 12,
    tags: ["Península Verde", "Ballenas Jorobadas", "Ecoturismo"],
    slug: "aeropuerto-internacional-presidente-juan-bosch"
  },
  {
    name: "Aeropuerto Internacional María Montez",
    code: "BRX",
    city: "Barahona",
    province: "Barahona",
    operator: "AERODOM / VINCI Airports",
    passengers: "Aviación general",
    runway: "3,000 m",
    image: "https://images.unsplash.com/photo-1774887809938-c7d4663fc525?w=800&fit=crop",
    flightsDay: 8,
    tags: ["Perla del Sur", "Puerta a Bahía de las Águilas", "Pista Ancha"],
    slug: "aeropuerto-internacional-maria-montez"
  }
];

export default function Aeropuerto() {
  const pc = usePageContent("aeropuerto");
  const airportsList = pc.data("ALL_AIRPORTS", __pcData.ALL_AIRPORTS);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={pc.t("SEOHead.title.1", "Aeropuertos de República Dominicana | Vuelos, FIDS y Terminales en Vivo")}
        description={pc.t("SEOHead.description.1", "Guía oficial de los 8 aeropuertos internacionales de República Dominicana: llegadas y salidas en tiempo real, terminales, salas VIP, estacionamiento y trámite de E-Ticket migratorio gratuito.")}
        keywords="aeropuertos republica dominicana, vuelos santo domingo, vuelos punta cana, sdq, puj, fids vuelos en vivo rd, salas vip aeropuertos rd, e-ticket rd, aeropuertos internacionales dominicanos"
        image="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&h=630&fit=crop"
        url="/aeropuerto"
        geo={{
          latitude: 18.4297,
          longitude: -69.6689,
          placename: "República Dominicana",
          region: "DO"
        }}
        jsonLd={generateItemListSchema(
          airportsList.map((a) => ({
            name: a.name,
            url: `https://descubrerd.com/aeropuerto/${a.slug}`,
            description: `${a.code} - ${a.city}, ${a.province}. Pista: ${a.runway}. Tráfico: ${a.passengers}. Operado por ${a.operator}`,
            image: a.image,
          })),
          "Aeropuertos Internacionales de República Dominicana"
        )}
      />
      <Header />

      {/* Hero Cinematográfico con estética aérea y corte editorial */}
      <section className="relative h-[65vh] min-h-[520px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&h=1000&fit=crop"
            alt={pc.t("img.alt.1", "Conectividad Aérea República Dominicana")}
            className="w-full h-full object-cover scale-105 brightness-[0.80]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-black/50" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center mt-[-30px]">
          {/* Antetítulo limpio sin cápsula de fondo (Regla 1 master-frontend-designer) */}
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-300 mb-3 drop-shadow-sm">
            <Plane className="w-3.5 h-3.5" />
            <span>{pc.tx("span.1", "EL HUB AÉREO MEJOR CONECTADO DEL CARIBE")}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            {pc.tx("h1.1", "Aeropuertos y Vuelos en")}{" "}
            <span className="text-sky-300">{pc.tx("span.2", "República Dominicana")}</span>
          </h1>

          <p className="text-base sm:text-lg text-white/90 mt-3 max-w-2xl mx-auto font-medium drop-shadow-xs">
            {pc.tx("p.1", "Planifica tu llegada a la isla, monitorea vuelos en vivo y conoce los 8 aeropuertos internacionales que conectan con el paraíso.")}
          </p>
        </div>
      </section>

      {/* Buscador Modular de Vuelos integrado */}
      <FlightConnectionSearch />

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* 4 Garantías y Pilares de Conectividad (Inspirado en Referencia 4 - Travel Around The World) */}
        <div className="mb-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-card border border-border/80 flex items-start gap-3.5 shadow-2xs">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Conectividad Global</h3>
              <p className="text-2xs text-muted-foreground mt-0.5 leading-relaxed">
                Más de 410 rutas directas conectando con Norteamérica, Europa, el Caribe y Sudamérica.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border/80 flex items-start gap-3.5 shadow-2xs">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">E-Ticket Gratuito</h3>
              <p className="text-2xs text-muted-foreground mt-0.5 leading-relaxed">
                Formulario digital oficial único de migración y aduanas sin costo alguno para el viajero.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border/80 flex items-start gap-3.5 shadow-2xs">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Salas VIP & Lounges</h3>
              <p className="text-2xs text-muted-foreground mt-0.5 leading-relaxed">
                Salones exclusivos, piscinas infinity con vista a pista en PUJ y fast-track migratorio.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border/80 flex items-start gap-3.5 shadow-2xs">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Seguridad POLITUR 24/7</h3>
              <p className="text-2xs text-muted-foreground mt-0.5 leading-relaxed">
                Oficinas de policía turística y mostradores de MITUR operativos en todas las terminales.
              </p>
            </div>
          </div>
        </div>

        {/* Asistente E-Ticket Obligatorio */}
        <ETicketAssistant />

        {/* Tablero FIDS de vuelos en vivo */}
        <div className="my-10">
          <LiveFlightStatusBoard />
        </div>

        {/* Muestra interactiva de Boarding Pass Digital */}
        <div className="my-14 text-center">
          <div className="max-w-xl mx-auto mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">{pc.tx("h2.1", "Tu Pase de Abordar Digital")}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">{pc.tx("p.2", "Guarda tus rutas aéreas preferidas y accede fácilmente a tu pase de abordaje vinculado con el E-Ticket de aduanas.")}</p>
          </div>
          <DigitalBoardingPassCard />
        </div>

        {/* Red de los 8 Aeropuertos Internacionales */}
        <div className="my-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              {/* Antetítulo limpio sin cápsula de fondo */}
              <span className="text-xs font-bold uppercase tracking-wider text-primary">{pc.tx("span.3", "Red Aeroportuaria Nacional")}</span>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground mt-1">{pc.tx("h2.2", "Los 8 Aeropuertos Internacionales de RD")}</h2>
            </div>
            <span className="text-xs text-muted-foreground font-medium">{pc.tx("span.4", "Más de 600 vuelos diarios internacionales y regionales")}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {airportsList.map((airport, idx) => (
              <div
                key={idx}
                className="group bg-card rounded-2xl border border-border/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-primary/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={airport.image}
                    alt={airport.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Código IATA en insignia llamativa */}
                  <div className="absolute top-3 left-3 px-3 py-1 bg-white/95 dark:bg-card/95 backdrop-blur-md rounded-lg font-black text-xs text-foreground shadow-xs">
                    {airport.code}
                  </div>

                  {airport.operator && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 bg-black/50 backdrop-blur-md rounded-md font-medium text-3xs text-white/90">
                      {airport.operator.split('/')[0].trim()}
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-2xs font-semibold text-sky-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {airport.province}
                    </p>
                    <h3 className="font-bold text-base leading-tight mt-0.5 truncate">
                      {airport.name}
                    </h3>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  {/* Ficha técnica compacta */}
                  <div className="grid grid-cols-2 gap-2 text-2xs text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/60">
                    <div>
                      <span className="text-3xs uppercase font-bold text-foreground block">Pista</span>
                      <span>{airport.runway || "Pista principal"}</span>
                    </div>
                    <div>
                      <span className="text-3xs uppercase font-bold text-foreground block">Tráfico</span>
                      <span>{airport.passengers || `${airport.flightsDay} vuelos/día`}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {airport.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-3xs font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-semibold">
                      ~{airport.flightsDay} {pc.tx("span.5", "vuelos / día")}
                    </span>
                    <Link
                      to={`/aeropuerto/${airport.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform"
                    >
                      {pc.tx("Link.1", "Ver Terminal y Vuelos")}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Línea de Tiempo Progresiva del Viajero (Inspirada en Referencia 4 - Travel Around The World) */}
        <div className="my-16">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Paso a Paso</span>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground mt-1">Cómo Planificar tu Viaje Aéreo</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Guía secuencial para llegar y salir de República Dominicana de manera rápida y sin contratiempos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            <div className="p-5 rounded-2xl bg-card border border-border/80 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-black text-sm flex items-center justify-center mb-3">
                  01
                </div>
                <h4 className="font-bold text-sm text-foreground mb-1">Elige tu Entrada</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Identifica cuál de los 8 aeropuertos internacionales te sitúa más cerca de tu hotel o zona turística.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border/80 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 font-black text-sm flex items-center justify-center mb-3">
                  02
                </div>
                <h4 className="font-bold text-sm text-foreground mb-1">Completa el E-Ticket</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Llena el formulario digital migratorio antes de abordar tu vuelo; genera un código QR para aduanas.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border/80 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 font-black text-sm flex items-center justify-center mb-3">
                  03
                </div>
                <h4 className="font-bold text-sm text-foreground mb-1">Prepara tu Equipaje</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Revisa las regulaciones de líquidos de 100ml en cabina y los certificados de vacunación si viajas con mascota.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border/80 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 font-black text-sm flex items-center justify-center mb-3">
                  04
                </div>
                <h4 className="font-bold text-sm text-foreground mb-1">Disfruta tu Llegada</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Accede a taxis turísticos oficiales, renta de vehículos o relájate en salones VIP antes de continuar tu ruta.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Guía de Traslados y Consejos para el Pasajero */}
        <div className="my-14 bg-muted/30 border border-border/60 rounded-3xl p-6 sm:p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">{pc.tx("h4.1", "Transporte Autorizado")}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{pc.tx("p.3", "Utiliza taxis autorizados con tarifas fijas visibles o servicios de rent-a-car con mostrador oficial dentro de la terminal.")}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">{pc.tx("h4.2", "Tiempo de Llegada")}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{pc.tx("p.4", "Llega 3 horas antes para vuelos internacionales y 1 hora antes para vuelos chárter o conexiones domésticas.")}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">{pc.tx("h4.3", "Asistencia al Turista")}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{pc.tx("p.5", "Oficinas de POLITUR y mostradores de MITUR están disponibles 24/7 en todas las terminales internacionales.")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AerolineasSection />

      <Footer />
    </div>
  );
}

// Datos del módulo editables desde el panel (ver pc.data en src/lib/pageContent.ts).
const __pcData = { ALL_AIRPORTS };
