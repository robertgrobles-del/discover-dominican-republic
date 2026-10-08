import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Plane, Clock, Thermometer, Terminal, Search, PlaneTakeoff, PlaneLanding,
  Wifi, ShoppingBag, Heart, DollarSign, Car, MapPin, Star, ChevronRight,
  ShieldCheck, HelpCircle, Navigation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { FlightConnectionSearch } from "@/components/airports/FlightConnectionSearch";
import { DigitalBoardingPassCard } from "@/components/airports/DigitalBoardingPassCard";
import { LiveFlightStatusBoard } from "@/components/airports/LiveFlightStatusBoard";
import { ETicketAssistant } from "@/components/airports/ETicketAssistant";

const ALL_AIRPORTS = [
  {
    name: "Aeropuerto Internacional de Punta Cana",
    code: "PUJ",
    city: "Punta Cana / Bávaro",
    province: "La Altagracia",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&fit=crop",
    flightsDay: 160,
    tags: ["Mayor tráfico", "Terminal Ecológica"],
    slug: "punta-cana-puj"
  },
  {
    name: "Aeropuerto Internacional Las Américas",
    code: "SDQ",
    city: "Santo Domingo",
    province: "Santo Domingo Este",
    image: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=800&fit=crop",
    flightsDay: 130,
    tags: ["Hub de la Capital", "Zona de Carga"],
    slug: "las-americas-sdq"
  },
  {
    name: "Aeropuerto Internacional del Cibao",
    code: "STI",
    city: "Santiago de los Caballeros",
    province: "Santiago",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&fit=crop",
    flightsDay: 55,
    tags: ["Conexión Norte", "Comunidad Diáspora"],
    slug: "cibao-sti"
  },
  {
    name: "Aeropuerto Internacional Gregorio Luperón",
    code: "POP",
    city: "Puerto Plata",
    province: "Puerto Plata",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&fit=crop",
    flightsDay: 30,
    tags: ["Costa Norte", "Vuelos Chárter"],
    slug: "gregorio-luperon-pop"
  },
  {
    name: "Aeropuerto Internacional Presidente Juan Bosch",
    code: "AZS",
    city: "El Catey / Las Terrenas",
    province: "Samaná",
    image: "https://images.unsplash.com/photo-1512353087810-25dfcd100962?w=800&fit=crop",
    flightsDay: 12,
    tags: ["Península Verde", "Ballenas Jorobadas"],
    slug: "juan-bosch-azs"
  },
  {
    name: "Aeropuerto Internacional de La Romana",
    code: "LRM",
    city: "La Romana / Bayahíbe",
    province: "La Romana",
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&fit=crop",
    flightsDay: 15,
    tags: ["Casa de Campo", "Cruceros"],
    slug: "la-romana-lrm"
  },
  {
    name: "Aeropuerto Internacional Cabo Rojo",
    code: "CBJ",
    city: "Pedernales",
    province: "Pedernales",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&fit=crop",
    flightsDay: 6,
    tags: ["Nuevo Polo", "Bahía de las Águilas"],
    slug: "cabo-rojo-cbj"
  }
];

export default function Aeropuerto() {
  const [selectedTab, setSelectedTab] = useState<"board" | "card" | "network">("board");

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Aeropuertos y Conectividad Aérea de República Dominicana - Vuelos en Vivo"
        description="Consulta vuelos en tiempo real, itinerarios, terminales, el formulario oficial de E-Ticket y conexiones hacia todos los aeropuertos internacionales de República Dominicana."
      />
      <Header />

      {/* Hero Cinematográfico con estética aérea y corte curvo */}
      <section className="relative h-[65vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&h=1000&fit=crop"
            alt="Conectividad Aérea República Dominicana"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-black/40" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center mt-[-40px]">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black uppercase tracking-widest mb-4 border border-white/25">
            <Plane className="w-3.5 h-3.5 text-sky-300" />
            El Hub Aéreo Mejor Conectado del Caribe
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            Aeropuertos y Vuelos en <span className="text-sky-300">República Dominicana</span>
          </h1>
          <p className="text-base sm:text-lg text-white/90 mt-3 max-w-2xl mx-auto font-medium drop-shadow-xs">
            Planifica tu llegada a la isla, monitorea vuelos en vivo y conoce los 8 aeropuertos internacionales que conectan con el paraíso.
          </p>
        </div>
      </section>

      {/* Buscador Modular de Vuelos integrado */}
      <FlightConnectionSearch />

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Asistente E-Ticket Obligatorio */}
        <ETicketAssistant />

        {/* Tablero FIDS de vuelos en vivo */}
        <div className="my-10">
          <LiveFlightStatusBoard />
        </div>

        {/* Muestra interactiva de Boarding Pass Digital */}
        <div className="my-14 text-center">
          <div className="max-w-xl mx-auto mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">
              Tu Pase de Abordar Digital
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Guarda tus rutas aéreas preferidas y accede fácilmente a tu pase de abordaje vinculado con el E-Ticket de aduanas.
            </p>
          </div>
          <DigitalBoardingPassCard />
        </div>

        {/* Red de los 7 Aeropuertos Internacionales */}
        <div className="my-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Red Aeroportuaria Nacional
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground mt-1">
                Los Aeropuertos Internacionales de RD
              </h2>
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              Más de 600 vuelos diarios internacionales y regionales
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ALL_AIRPORTS.map((airport, idx) => (
              <div
                key={idx}
                className="group bg-card rounded-3xl border border-border/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-primary/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={airport.image}
                    alt={airport.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Código IATA en insignia llamativa */}
                  <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 dark:bg-card/90 backdrop-blur-md rounded-xl font-black text-xs text-foreground shadow-xs">
                    {airport.code}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-[11px] font-semibold text-sky-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {airport.province}
                    </p>
                    <h3 className="font-bold text-base leading-tight mt-0.5 truncate">
                      {airport.name}
                    </h3>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {airport.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-semibold">
                      ~{airport.flightsDay} vuelos / día
                    </span>
                    <Link
                      to={`/aeropuerto/${airport.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform"
                    >
                      Ver Terminal <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guía de Traslados y Consejos para el Pasajero */}
        <div className="my-14 bg-muted/30 border border-border/60 rounded-3xl p-6 sm:p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl shrink-0">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Transporte Autorizado</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Utiliza taxis autorizados con tarifas fijas visibles o servicios de rent-a-car con mostrador oficial dentro de la terminal.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Tiempo de Llegada</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Llega 3 horas antes para vuelos internacionales y 1 hora antes para vuelos chárter o conexiones domésticas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Asistencia al Turista</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Oficinas de POLITUR y mostradores de MITUR están disponibles 24/7 en todas las terminales internacionales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
