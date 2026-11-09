import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Plane, MapPin, Star, ChevronRight, Phone, Globe, 
  Car, ShoppingBag, Wifi, Navigation, PlaneTakeoff, 
  ExternalLink, Check, Search, QrCode, FileCheck2,
  Crown, Banknote, Utensils, Cross, Smartphone, Key, 
  Bus, Headphones, ShieldAlert, Sun, Landmark, Waves, 
  Palmtree, Building2, HelpCircle, Navigation2
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead, generateAirportSchema } from "@/components/SEOHead";
import { useTranslation } from "@/i18n";
import { getAirportBySlug, airports, type AirlineContact } from "@/data/airports";

interface AirportStory {
  title: string;
  p1: string;
  p2: string;
  stat1: { label: string; desc: string };
  stat2: { label: string; desc: string };
  stat3: { label: string; desc: string };
}

const airportNarratives: Record<string, AirportStory> = {
  SDQ: {
    title: "El Gran Centro de Conectividad de la Capital",
    p1: "Inaugurado originalmente en 1959 en Punta Caucedo, el Aeropuerto Las Américas fue rebautizado en honor al Dr. José Francisco Peña Gómez. Con su pista de 3,354 metros apta para aeronaves de fuselaje ancho como Boeing 777 y Airbus A350, representa el punto neurálgico del comercio aéreo y turismo internacional dominicano.",
    p2: "Con la moderna concesión de AERODOM operada por VINCI Airports, el aeropuerto ha completado la ampliación de la Terminal Pública Central con una inversión superior a US$ 250 millones, fortaleciendo a Santo Domingo como el gran Hub Continental de bajo costo de la región.",
    stat1: { label: "Hub Arajet", desc: "Base estratégica del Caribe" },
    stat2: { label: "Terminal Carga #1", desc: "111,000+ tons/año" },
    stat3: { label: "Autovía del Este", desc: "Acceso a playas en 10 min" }
  },
  PUJ: {
    title: "El Aeropuerto Privado más Concurrido del Caribe",
    p1: "Pionero mundial en turismo sostenible y diseño arquitectónico bioclimático, el Aeropuerto Internacional de Punta Cana recibe a más del 56% de los turistas que ingresan a la República Dominicana. Sus emblemáticas terminales con techos de cana de palma y piedra coralina autóctona combinan la hospitalidad caribeña con tecnología de navegación de última generación.",
    p2: "Con la reciente inauguración de la expansión de la Terminal B con una inversión de US$ 90 millones, dispone de puentes de abordaje de alta capacidad y una exclusiva terraza VIP con piscina panorámica frente a la pista activa, conectando sin escalas con más de 64 ciudades del mundo.",
    stat1: { label: "Piscina VIP en Terraza", desc: "Vista panorámica a la pista" },
    stat2: { label: "> 9.5M Pasajeros", desc: "56% del tráfico aéreo nacional" },
    stat3: { label: "Boulevard Turístico", desc: "10 min a Cap Cana y Bávaro" }
  },
  STI: {
    title: "El Motor Aéreo y Comercial de la Región del Cibao",
    p1: "Inaugurado en 2002 gracias a la visión de la clase empresarial santiaguera, el Aeropuerto Internacional del Cibao es el principal vínculo entre la región norte y la diáspora dominicana radicada en Estados Unidos. Es el tercer aeropuerto con mayor afluencia de pasajeros de todo el territorio dominicano.",
    p2: "Actualmente ejecuta un plan maestro de expansión que incluye la ampliación de su pista a 3,000 metros y la duplicación de su terminal de pasajeros para acoger vuelos directos transatlánticos desde Europa, además de su terminal de exportación de productos agrícolas y textiles del Cibao.",
    stat1: { label: "Hub de la Diáspora", desc: "Vuelos diarios JFK, BOS, MIA" },
    stat2: { label: "Pista en Expansión", desc: "Ampliación a 3,000 metros" },
    stat3: { label: "Autopista Duarte", desc: "15 min a Santiago Centro" }
  },
  POP: {
    title: "La Puerta Oficial a la Costa del Ámbar y Atlántico",
    p1: "Nombrado en honor al prócer restaurador General Gregorio Luperón, este aeropuerto inauguró la era moderna del turismo internacional en la República Dominicana en los años 70 y 80. Su pista de 3,081 metros está diseñada para acoger sin restricciones vuelos chárter transatlánticos procedentes de Europa y Canadá.",
    p2: "Administrado por AERODOM y VINCI Airports, es el portal estratégico hacia las mecas mundiales del ecoturismo y deportes acuáticos como Cabarete y Sosúa, los resorts de Playa Dorada y los concurridos puertos de cruceros Amber Cove y Taíno Bay.",
    stat1: { label: "Costa del Ámbar", desc: "Acceso inmediato a Cabarete" },
    stat2: { label: "Pista de 3,081 m", desc: "Apta para Boeing 777 y A350" },
    stat3: { label: "Carretera Costera", desc: "15 min a resorts y cruceros" }
  },
  LRM: {
    title: "Ingenio Azucarero y Lujo en Casa de Campo",
    p1: "Inaugurado en diciembre del año 2000 por Central Romana Corporation, el Aeropuerto Internacional de La Romana destaca por su icónica arquitectura inspirada en un ingenio azucarero dominicano tradicional, con acabados en madera noble y chimenea industrial estilizada.",
    p2: "Es la terminal preferida por celebridades mundiales, golfistas y ejecutivos que visitan Casa de Campo Resort & Villas y el célebre campo Teeth of the Dog, además de funcionar como enlace aéreo logístico para las grandes navieras que atracan en el Puerto de Cruceros de La Romana y Bayahíbe.",
    stat1: { label: "Terminal Casa de Campo", desc: "A 10 min del resort y golf" },
    stat2: { label: "Pista de 2,949 m", desc: "FBO Premier para jets privados" },
    stat3: { label: "Autovía del Coral", desc: "Acceso express a Bayahíbe" }
  },
  AZS: {
    title: "El Portal Aéreo a la Península Virgen de Samaná",
    p1: "Inaugurado a finales de 2006 en la comunidad de El Catey, el Aeropuerto Internacional Presidente Juan Bosch brinda acceso rápido y seguro a una de las regiones con mayor biodiversidad y belleza virgen de todo el Caribe insular.",
    p2: "Su moderna pista de 3,000 metros recibe vuelos transatlánticos directos durante la temporada de avistamiento de ballenas jorobadas en la Bahía de Samaná, así como viajeros europeos y norteamericanos que disfrutan de las paradisíacas playas de Las Terrenas, Las Galeras y Playa Rincón.",
    stat1: { label: "Santuario de Ballenas", desc: "Temporada enero a marzo" },
    stat2: { label: "Pista de 3,000 m", desc: "Fuselaje ancho transatlántico" },
    stat3: { label: "Boulevard del Atlántico", desc: "30 min a Las Terrenas" }
  },
  BRX: {
    title: "Infraestructura Estratégica del Suroeste y Cabo Rojo",
    p1: "Bautizado en homenaje a la insigne actriz dominicana María Montez, este aeropuerto representa la mayor infraestructura aérea de toda la región Enriquillo. Cuenta con una pista transcontinental de 3,000 metros de longitud apta para aviones intercontinentales de fuselaje ancho.",
    p2: "Con el desarrollo del nuevo polo turístico de Pedernales, Cabo Rojo y la Reserva de la Biosfera Jaragua-Bahoruco-Enriquillo, el aeropuerto María Montez opera como nodo clave para comitivas de inversión, vuelos comerciales ecológicos y conexión regional directa con Santo Domingo.",
    stat1: { label: "Pista Transcontinental", desc: "3,000 m de alta resistencia" },
    stat2: { label: "Bahía de las Águilas", desc: "Portal al turismo del Sur" },
    stat3: { label: "Carretera Costera", desc: "10 min al malecón Barahona" }
  },
  JBQ: {
    title: "Centro Neurálgico de la Aviación Corporativa y FBO",
    p1: "El Aeropuerto Internacional Dr. Joaquín Balaguer (La Isabela / El Higüero) fue construido para sustituir al antiguo aeródromo de Herrera y centralizar la aviación ejecutiva, gubernamental y privada de la capital dominicana.",
    p2: "Sede principal de las escuelas de aviación civil de la República Dominicana y hub de Air Century para rutas regionales hacia Haití y las Antillas, cuenta con un moderno FBO operado por AERODOM/VINCI Airports con despacho migratorio y aduanero preferencial disponible las 24 horas.",
    stat1: { label: "Epicentro FBO y Jets", desc: "Aviación corporativa 24/7" },
    stat2: { label: "Pista de 1,650 m", desc: "Apta para turbohélices y jets" },
    stat3: { label: "Acceso Capital Norte", desc: "20 min a Piantini y Naco" }
  }
};

const serviceCardStyles = [
  { icon: Crown, bg: "bg-amber-50 text-amber-600", tag: "Salón VIP Exclusivo", tagColor: "text-[#005ea6]" },
  { icon: ShoppingBag, bg: "bg-rose-50 text-rose-600", tag: "Comercios & Duty Free", tagColor: "text-slate-600" },
  { icon: Wifi, bg: "bg-cyan-50 text-[#0284c7]", tag: "Conectividad Gratuita", tagColor: "text-emerald-600" },
  { icon: Banknote, bg: "bg-emerald-50 text-emerald-600", tag: "Bancos & Cambio Oficial", tagColor: "text-slate-600" },
  { icon: Utensils, bg: "bg-amber-50 text-amber-600", tag: "Gastronomía & Cafeterías", tagColor: "text-slate-600" },
  { icon: Cross, bg: "bg-red-50 text-red-600", tag: "Asistencia & Seguridad 24/7", tagColor: "text-red-600" },
];

const transportCardStyles = [
  { icon: Car, bg: "bg-amber-100 text-amber-800", badge: "Oficial y Seguro", badgeClass: "bg-emerald-100 text-emerald-800" },
  { icon: Smartphone, bg: "bg-slate-900 text-white", badge: "Bahía Autorizada / App", badgeClass: "bg-blue-100 text-[#005ea6]" },
  { icon: Key, bg: "bg-blue-100 text-[#005ea6]", badge: "Renta de Autos / Flota", badgeClass: "bg-slate-100 text-slate-700" },
  { icon: Bus, bg: "bg-emerald-100 text-emerald-800", badge: "Económico / Shuttle", badgeClass: "bg-slate-100 text-slate-600" }
];

export default function AeropuertoDetalle() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const airport = slug ? getAirportBySlug(slug) : undefined;

  const [activeRegion, setActiveRegion] = useState<string>("all");
  const [airlineSearch, setAirlineSearch] = useState<string>("");

  // Filtrado de aerolíneas en tiempo real
  const filteredAirlines = useMemo<AirlineContact[]>(() => {
    if (!airport) return [];
    const list: AirlineContact[] = airport.airlinesDetailed && airport.airlinesDetailed.length > 0 
      ? airport.airlinesDetailed 
      : (airport.airlines ?? []).map(name => ({ name, website: "https://www.google.com/search?q=" + encodeURIComponent(name) }));
    
    if (!airlineSearch.trim()) return list;
    const q = airlineSearch.toLowerCase();
    return list.filter(a => 
      a.name.toLowerCase().includes(q) || 
      (a.code && a.code.toLowerCase().includes(q)) ||
      (a.terminal && a.terminal.toLowerCase().includes(q))
    );
  }, [airport, airlineSearch]);

  // Lista de destinos agrupados
  const destinationGroups = useMemo(() => {
    if (!airport) return [];
    return airport.destinationsByContinent || [
      { region: "Norteamérica", destinations: ["Miami (MIA)", "New York (JFK/EWR)", "Atlanta (ATL)", "Boston (BOS)", "Toronto (YYZ)"] },
      { region: "Caribe y Centroamérica", destinations: ["Panamá (PTY)", "San Juan (SJU)", "San José (SJO)", "Curazao (CUR)"] },
      { region: "Sudamérica", destinations: ["Bogotá (BOG)", "Medellín (MDE)"] },
      { region: "Europa", destinations: ["Madrid (MAD)", "Frankfurt (FRA)", "París (ORY)"] }
    ];
  }, [airport]);

  // Destinos mostrados según la región elegida
  const displayedDestinations = useMemo(() => {
    if (!airport) return [];
    if (activeRegion === "all") {
      const all: string[] = [];
      destinationGroups.forEach(g => all.push(...g.destinations));
      return all.length > 0 ? Array.from(new Set(all)) : airport.destinations;
    }
    const group = destinationGroups.find(g => g.region === activeRegion);
    return group ? group.destinations : [];
  }, [airport, activeRegion, destinationGroups]);

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
              El aeropuerto solicitado no se encuentra en el registro o fue actualizado con su nueva nomenclatura.
            </p>
            <Link to="/aeropuerto">
              <button className="rounded-xl px-6 py-3 bg-primary text-primary-foreground font-semibold text-sm shadow-sm hover:bg-primary/95 transition-all">
                {t("common.viewAll") || "Ver todos los aeropuertos"}
              </button>
            </Link>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  const isSDQ = airport.code === "SDQ";
  const narrative = airportNarratives[airport.code] || {
    title: `Infraestructura Oficial de ${airport.name}`,
    p1: airport.description,
    p2: "La terminal aeroportuaria dispone de sistemas de radionavegación satelital y certificación internacional OACI para operaciones nocturnas e intercontinentales continuas.",
    stat1: { label: airport.highlights?.[0] || "Terminal Aérea", desc: "Operaciones regulares" },
    stat2: { label: airport.runwayLength?.split("·")[0]?.trim() || "Pista Certificada", desc: "Apta para fuselaje ancho" },
    stat3: { label: "Conexión Vial", desc: "Acceso a polos turísticos" }
  };

  return (
    <PageTransition>
      <SEOHead
        title={`${airport.name} (${airport.code}) | Guía Oficial República Dominicana`}
        description={airport.shortDescription}
        keywords={`${airport.name}, ${airport.code}, ${airport.icao}, vuelos ${airport.city}, terminal ${airport.code}, aerolineas ${airport.code}, salas vip ${airport.code}, parqueo ${airport.code}, transporte aeropuerto ${airport.city}`}
        image={airport.imageUrl}
        url={`/aeropuerto/${airport.slug}`}
        breadcrumbs={[
          { name: "Inicio", url: "/" },
          { name: "Red Aeroportuaria Nacional", url: "/aeropuerto" },
          { name: airport.city, url: `/aeropuerto` },
          { name: `${airport.name} (${airport.code})`, url: `/aeropuerto/${airport.slug}` }
        ]}
        geo={{
          latitude: airport.coordinates.lat,
          longitude: airport.coordinates.lng,
          placename: `${airport.city}, ${airport.provinceName}`,
          region: "DO"
        }}
        jsonLd={generateAirportSchema({
          name: airport.name,
          code: airport.code,
          icao: airport.icao,
          description: airport.description,
          image: airport.imageUrl,
          url: `https://descubrerd.com/aeropuerto/${airport.slug}`,
          city: airport.city,
          provinceName: airport.provinceName,
          coordinates: airport.coordinates,
          phone: airport.phone,
          website: airport.website,
          faqs: airport.parkingInfo?.faqs
        })}
      />

      <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-[#005ea6] selection:text-white">
        
        {/* Global Site Header */}
        <Header />

        {/* BEGIN: HeroSection */}
        <section className="relative bg-[#0b1d3a] text-white overflow-hidden py-14 lg:py-20" data-purpose="airport-hero">
          {/* Background Image with Lighter/Clearer Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              alt={airport.name} 
              className="w-full h-full object-cover object-center opacity-70 scale-105 transition-transform duration-700" 
              src={airport.imageUrl} 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b1d3a]/80 via-[#0b1d3a]/55 to-[#0b1d3a]/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1d3a]/90 via-transparent to-black/20" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Single Informative Antetítulo (Sin icono y sin color de fondo) */}
            <div className="mb-3">
              <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-cyan-300 block font-sans">
                Portal Aeroportuario Oficial • {airport.city}, {airport.provinceName} • República Dominicana
              </span>
            </div>

            {/* Main Headline & Subtitle */}
            <div className="max-w-4xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3 font-display">
                {airport.name}
              </h1>
              <p className="text-lg sm:text-xl font-medium text-[#00a3e0] mb-3">
                {airport.provinceName} • {airport.city} (IATA: <strong className="text-white">{airport.code}</strong> • ICAO: <strong className="text-white">{airport.icao}</strong>)
              </p>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-2xl font-normal drop-shadow-sm">
                {airport.shortDescription}
              </p>

              {/* Hero Action CTA Buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a 
                  href="#eticket-section" 
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-950/20 transition-all active:scale-95"
                >
                  <FileCheck2 className="w-4 h-4 mr-2" />
                  <span>Completar E-Ticket Oficial</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </a>
                <a 
                  href="#servicios" 
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm backdrop-blur-md border border-white/20 transition-all"
                >
                  <span>Servicios en Terminal</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>

            {/* Quick Airport Metric Cards (Horizontal Ribbon) */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 border-t border-white/15">
              <div className="bg-slate-900/60 backdrop-blur-md rounded-xl p-3 border border-white/10">
                <span className="text-[11px] uppercase tracking-wider text-slate-300 block font-semibold">IATA / ICAO</span>
                <span className="text-base font-bold text-white flex items-center mt-1">
                  {airport.code} / {airport.icao}
                </span>
              </div>

              <div className="bg-slate-900/60 backdrop-blur-md rounded-xl p-3 border border-white/10">
                <span className="text-[11px] uppercase tracking-wider text-slate-300 block font-semibold">Tráfico Anual</span>
                <span className="text-xs sm:text-sm font-bold text-white mt-1 block truncate">
                  {airport.passengersAnnual?.split("(")[0]?.trim() || "Vuelos Comerciales"}
                </span>
              </div>

              <div className="bg-slate-900/60 backdrop-blur-md rounded-xl p-3 border border-white/10">
                <span className="text-[11px] uppercase tracking-wider text-slate-300 block font-semibold">Pista Principal</span>
                <span className="text-xs sm:text-sm font-bold text-white mt-1 block truncate">
                  {airport.runwayLength?.split("·")[0]?.trim() || "Pista Asfaltada OACI"}
                </span>
              </div>

              <div className="bg-slate-900/60 backdrop-blur-md rounded-xl p-3 border border-white/10">
                <span className="text-[11px] uppercase tracking-wider text-slate-300 block font-semibold">Elevación</span>
                <span className="text-base font-bold text-white mt-1 block">
                  {airport.elevation || "18 m MSL"}
                </span>
              </div>

              <div className="bg-slate-900/60 backdrop-blur-md rounded-xl p-3 border border-white/10">
                <span className="text-[11px] uppercase tracking-wider text-slate-300 block font-semibold">Terminales</span>
                <span className="text-xs sm:text-sm font-bold text-white mt-1 block truncate">
                  {(airport.terminals ?? []).slice(0, 2).map(t => t.split("(")[0].trim()).join(" • ")}
                </span>
              </div>

              <div className="bg-slate-900/60 backdrop-blur-md rounded-xl p-3 border border-white/10">
                <span className="text-[11px] uppercase tracking-wider text-slate-300 block font-semibold">Operador Oficial</span>
                <span className="text-xs font-bold text-white mt-1 block truncate">
                  {airport.operator?.split("(")[0]?.trim() || "AERODOM"}
                </span>
              </div>
            </div>
          </div>
        </section>
        {/* END: HeroSection */}

        {/* BEGIN: ETicketBanner Floating */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20" data-purpose="mandatory-notice-banner" id="eticket-section">
          <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-xl border border-emerald-500/40 relative overflow-hidden">
            {/* Decorative background watermark */}
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 opacity-10 pointer-events-none">
              <QrCode className="w-72 h-72 text-emerald-300" />
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start space-x-4 max-w-3xl">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-300">
                  <FileCheck2 className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider">
                      Requisito Migratorio Obligatorio
                    </span>
                    <span className="text-xs text-emerald-300 font-semibold">100% Gratuito en Portal Estatal</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    E-Ticket Electrónico de Entrada y Salida a República Dominicana
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed">
                    Todos los pasajeros nacionales y extranjeros que entren o salgan por el <strong className="text-white">{airport.name} ({airport.code})</strong> deben completar la declaración jurada digital de Migración, Aduanas y Salud Pública antes de abordar para generar su código QR único.
                  </p>
                  <div className="flex flex-wrap gap-y-2 gap-x-4 mt-3 text-xs text-emerald-200">
                    <span className="flex items-center"><Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Válido por familia o individual</span>
                    <span className="flex items-center"><Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Sin costo alguno en el sitio gubernamental</span>
                    <span className="flex items-center"><Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Genera código QR descargable</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 justify-center">
                <a 
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-95" 
                  href="https://eticket.gob.do/" 
                  rel="noopener noreferrer" 
                  target="_blank"
                >
                  <span>Completar E-Ticket Oficial</span>
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
                <Link 
                  to="/e-ticket" 
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-emerald-200 border border-emerald-500/30 font-medium text-xs transition" 
                  data-purpose="open-eticket-guide"
                >
                  <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
                  <span>Ver Guía Oficial y Pasos</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
        {/* END: ETicketBanner Floating */}

        {/* BEGIN: InteractiveTabNav */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8" data-purpose="quick-jump-navigation">
          <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-sm flex items-center gap-1 overflow-x-auto whitespace-nowrap">
            <a className="px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-[#005ea6] text-white shadow-sm transition" href="#aerolineas">
              Aerolíneas &amp; Vuelos
            </a>
            <a className="px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition" href="#destinos">
              Rutas y Destinos
            </a>
            <a className="px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition" href="#servicios">
              Salas VIP &amp; Amenidades
            </a>
            <a className="px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition" href="#transporte">
              Transporte &amp; Tarifas
            </a>
            <a className="px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition" href="#historia-terminal">
              Sobre el Aeropuerto
            </a>
            <a className="px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition" href="#galeria">
              Galería Visual
            </a>
          </div>
        </section>
        {/* END: InteractiveTabNav */}

        {/* BEGIN: MainContentGrid */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* ========================================== */}
            {/* LEFT COLUMN: PRIMARY TRAVEL CONTENT (8 Cols) */}
            {/* ========================================== */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* SECTION: Airlines & Flights */}
              <section className="scroll-mt-24" data-purpose="airlines-section" id="aerolineas">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-4 border-b border-slate-200 gap-4">
                  <div>
                    <span className="text-xs font-bold text-[#005ea6] uppercase tracking-wider">Conexiones Globales</span>
                    <h2 className="text-2xl font-bold text-slate-900 mt-1 font-display">Aerolíneas Comerciales Operando en {airport.code}</h2>
                    <p className="text-xs text-slate-500 mt-1">Compañías que operan vuelos regulares y chárter en las terminales activas.</p>
                  </div>
                  
                  {/* Quick Airline Filter Input */}
                  <div className="relative w-full sm:w-64">
                    <input 
                      type="text"
                      value={airlineSearch}
                      onChange={(e) => setAirlineSearch(e.target.value)}
                      placeholder="Buscar aerolínea..." 
                      className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-300 focus:bg-white focus:border-[#005ea6] focus:ring-1 focus:ring-[#005ea6] outline-none transition" 
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                {/* Airlines Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {filteredAirlines.map((airline, idx) => {
                    const isHub = airline.isHub || (isSDQ && airline.name.toLowerCase().includes("arajet"));
                    return (
                      <div 
                        key={idx}
                        className={`airline-card p-3.5 rounded-xl border transition group ${
                          isHub
                            ? "bg-gradient-to-br from-indigo-50/80 to-blue-50/80 border-2 border-[#005ea6]/30 hover:border-[#005ea6] hover:shadow-md"
                            : "bg-white border-slate-200/90 hover:border-[#005ea6] hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-slate-900 text-sm group-hover:text-[#005ea6] transition truncate max-w-[150px]">
                              {airline.name}
                            </span>
                            {isHub && (
                              <span className="text-[9px] bg-[#005ea6] text-white px-1.5 py-0.2 rounded font-semibold shrink-0">
                                HUB {airport.code}
                              </span>
                            )}
                          </div>
                          {airline.code ? (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-medium shrink-0">
                              {airline.code}
                            </span>
                          ) : (
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono text-3xs shrink-0">
                              IATA
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-500 flex items-center justify-between">
                          <span className="truncate max-w-[130px]">
                            {airline.website.replace("https://", "").replace("http://", "").replace("www.", "").replace(/\/$/, "")}
                          </span>
                          <a 
                            className="text-[#005ea6] hover:underline inline-flex items-center font-semibold" 
                            href={airline.website} 
                            rel="noopener noreferrer" 
                            target="_blank"
                          >
                            Web <ExternalLink className="w-3 h-3 ml-0.5" />
                          </a>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center text-[10px] text-slate-400">
                          <Check className="w-3 h-3 text-emerald-500 mr-1 shrink-0" />
                          <span className="truncate">{airline.terminal || "Mostrador en Terminal"}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredAirlines.length === 0 && (
                  <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
                    No se encontraron aerolíneas con el término «{airlineSearch}».
                  </div>
                )}

                {/* Footer notice of remaining airlines */}
                <div className="mt-4 p-3 bg-slate-100/80 rounded-xl text-center text-xs text-slate-600">
                  Operaciones y frecuencias en {airport.name} ({airport.code}): <span className="font-medium text-slate-800">Vuelos regulares y chárter certificados por la Junta de Aviación Civil (JAC) y el IDAC.</span>
                </div>
              </section>

              {/* SECTION: Destinations & Network */}
              <section className="scroll-mt-24" data-purpose="destinations-section" id="destinos">
                <div className="mb-4">
                  <span className="text-xs font-bold text-[#005ea6] uppercase tracking-wider">Rutas Directas</span>
                  <h2 className="text-2xl font-bold text-slate-900 mt-1 font-display">Destinos Conectados sin Escalas</h2>
                  <p className="text-xs text-slate-500 mt-1">Conexión inmediata con las principales capitales de América y Europa.</p>
                </div>

                {/* Region Filter Pills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button 
                    onClick={() => setActiveRegion("all")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      activeRegion === "all" 
                        ? "bg-[#0b1d3a] text-white shadow-xs" 
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Todos ({destinationGroups.reduce((acc, g) => acc + g.destinations.length, 0)})
                  </button>
                  {destinationGroups.map((group) => (
                    <button 
                      key={group.region}
                      onClick={() => setActiveRegion(group.region)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                        activeRegion === group.region 
                          ? "bg-[#0b1d3a] text-white font-semibold shadow-xs" 
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {group.region} ({group.destinations.length})
                    </button>
                  ))}
                </div>

                {/* Connected Cities Cloud */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-wrap gap-2">
                  {displayedDestinations.map((city, idx) => {
                    const isKeyCity = city.includes("MAD") || city.includes("Madrid");
                    return (
                      <span 
                        key={idx}
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-default ${
                          isKeyCity 
                            ? "bg-blue-50 text-[#005ea6] font-semibold border border-blue-200" 
                            : "bg-slate-50 text-slate-700 border border-slate-200/80 hover:border-[#005ea6] hover:text-[#005ea6]"
                        }`}
                      >
                        <Plane className={`w-3 h-3 mr-1.5 ${isKeyCity ? "text-[#005ea6]" : "text-slate-400"}`} />
                        {city}
                      </span>
                    );
                  })}
                </div>
              </section>

              {/* SECTION: Services & Amenities */}
              <section className="scroll-mt-24" data-purpose="airport-amenities" id="servicios">
                <div className="mb-6">
                  <span className="text-xs font-bold text-[#005ea6] uppercase tracking-wider">Comodidades y Confort</span>
                  <h2 className="text-2xl font-bold text-slate-900 mt-1 font-display">Servicios en Terminal</h2>
                  <p className="text-xs text-slate-500 mt-1">Infraestructura de estándar mundial para una experiencia placentera de llegada y salida.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(airport.services && airport.services.length > 0 ? airport.services.slice(0, 6) : [
                    { name: "Salones VIP & Executive Lounge", description: "Atención preferencial, Wi-Fi, bar y descanso privado." },
                    { name: "Tiendas Duty Free & Souvenirs", description: "Marcas internacionales, puros artesanales y ron dominicano libre de impuestos." },
                    { name: "Wi-Fi Gratuito de Alta Velocidad", description: "Conexión a internet ilimitada en salas de preembarque y llegadas." },
                    { name: "Cajeros ATM & Cambio Oficial", description: "Bancos comerciales y cajeros automáticos multimoneda (DOP, USD, EUR)." },
                    { name: "Gastronomía & Cafeterías", description: "Restaurantes con sabor caribeño, bocadillos frescos y café local tostado." },
                    { name: "Asistencia Médica & POLITUR", description: "Seguridad turística 24/7 y dispensario de primeros auxilios." }
                  ]).map((service, idx) => {
                    const style = serviceCardStyles[idx % serviceCardStyles.length];
                    const IconComponent = style.icon;
                    return (
                      <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow transition">
                        <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center mb-3`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-base">{service.name}</h3>
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                          {service.description}
                        </p>
                        <div className={`mt-3 flex items-center text-xs font-semibold ${style.tagColor}`}>
                          <span>{style.tag}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* SECTION: Ground Transportation */}
              <section className="scroll-mt-24" data-purpose="ground-transportation" id="transporte">
                <div className="mb-6">
                  <span className="text-xs font-bold text-[#005ea6] uppercase tracking-wider">Movilidad y Traslados</span>
                  <h2 className="text-2xl font-bold text-slate-900 mt-1 font-display">Cómo Moverse desde el {airport.name}</h2>
                  <p className="text-xs text-slate-500 mt-1">Opciones verificadas y reguladas para trasladarse a {airport.city} y los principales destinos turísticos.</p>
                </div>

                {/* Transport Cards Stack */}
                <div className="space-y-3.5">
                  {(airport.transportation && airport.transportation.length > 0 ? airport.transportation.slice(0, 4) : [
                    { name: `Taxi Oficial ${airport.code}`, detail: `Servicio con tarifa fija por zona con ticket en mostrador oficial`, price: "US$ 25 - 40" },
                    { name: "Uber / DiDi Ridesharing", detail: "Puntos de encuentro autorizados frente a la salida exterior", price: "Tarifa en app" },
                    { name: "Renta de Autos Multimarca", detail: "Agencias líderes con mostradores en vestíbulo y entrega de vehículos", price: "Desde US$ 35/día" },
                    { name: "Autobús & Transfers Turísticos", detail: "Minibuses hacia el centro de la ciudad y hoteles turísticos", price: "Económico" }
                  ]).map((trans, idx) => {
                    const style = transportCardStyles[idx % transportCardStyles.length];
                    const IconComponent = style.icon;
                    return (
                      <div key={idx} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#005ea6]/60 transition shadow-xs">
                        <div className="flex items-start space-x-3.5">
                          <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center shrink-0`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-bold text-slate-900 text-sm sm:text-base">{trans.name}</h3>
                              <span className={`${style.badgeClass} text-[10px] font-bold px-2 py-0.5 rounded`}>{style.badge}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 max-w-md">
                              {trans.detail}
                            </p>
                          </div>
                        </div>
                        <div className="sm:text-right shrink-0">
                          {trans.price ? (
                            <>
                              <span className="text-[10px] uppercase text-slate-400 font-semibold block">Tarifa Estimada</span>
                              <span className="text-base sm:text-lg font-black text-slate-900">{trans.price}</span>
                              <span className="text-[11px] text-slate-500 block">Sujeto a destino / zona</span>
                            </>
                          ) : (
                            <>
                              <span className="text-[10px] uppercase text-slate-400 font-semibold block">Modalidad</span>
                              <span className="text-base sm:text-lg font-black text-[#005ea6]">Disponible</span>
                              <span className="text-[11px] text-slate-500 block">Mostrador en Hall de Llegadas</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* SECTION: History & Infrastructure Story */}
              <section className="bg-gradient-to-br from-slate-900 to-[#0b1d3a] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden" data-purpose="about-airport" id="historia-terminal">
                <div className="max-w-2xl relative z-10">
                  <span className="text-xs font-bold text-[#00a3e0] uppercase tracking-wider">Reseña e Infraestructura</span>
                  <h2 className="text-2xl font-bold text-white mt-1 font-display">
                    {narrative.title}
                  </h2>
                  <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed">
                    {narrative.p1}
                  </p>
                  <p className="text-slate-300 text-xs sm:text-sm mt-2.5 leading-relaxed">
                    {narrative.p2}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
                    <div>
                      <span className="text-[#00a3e0] font-bold block text-sm">{narrative.stat1.label}</span>
                      <span className="text-slate-400">{narrative.stat1.desc}</span>
                    </div>
                    <div>
                      <span className="text-[#00a3e0] font-bold block text-sm">{narrative.stat2.label}</span>
                      <span className="text-slate-400">{narrative.stat2.desc}</span>
                    </div>
                    <div>
                      <span className="text-[#00a3e0] font-bold block text-sm">{narrative.stat3.label}</span>
                      <span className="text-slate-400">{narrative.stat3.desc}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION: Photo Gallery */}
              <section className="scroll-mt-24" data-purpose="airport-gallery" id="galeria">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs font-bold text-[#005ea6] uppercase tracking-wider">Visuales de la Terminal</span>
                    <h2 className="text-2xl font-bold text-slate-900 mt-1 font-display">Galería Fotográfica</h2>
                  </div>
                  <span className="text-xs text-slate-500 hidden sm:inline">Instalaciones activas {airport.code}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(airport.gallery && airport.gallery.length > 0 ? airport.gallery : [airport.imageUrl, airport.imageUrl, airport.imageUrl]).slice(0, 3).map((imgUrl, idx) => {
                    const label = idx === 0 ? "Plataforma de Aeronaves & Pista" :
                                  idx === 1 ? "Concourse & Puertas de Embarque" :
                                              "Aproximación Aérea y Paisaje";
                    return (
                      <div key={idx} className={`group relative overflow-hidden rounded-xl h-44 bg-slate-200 shadow-xs ${idx === 2 ? "col-span-2 sm:col-span-1" : ""}`}>
                        <img 
                          alt={`${airport.name} - ${label}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          src={imgUrl} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2.5">
                          <span className="text-white text-xs font-medium">{label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

            </div>

            {/* ========================================== */}
            {/* RIGHT COLUMN: VISITOR UTILITY SIDEBAR (4 Cols) */}
            {/* ========================================== */}
            <aside className="lg:col-span-4 space-y-6">

              {/* SIDEBAR CARD: Passenger Assistance & Key Contacts */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm" id="asistencia">
                <div className="flex items-center space-x-2 text-[#005ea6] mb-3 pb-3 border-b border-slate-100">
                  <Headphones className="w-5 h-5" />
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Atención al Pasajero</h3>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex items-start space-x-3">
                    <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[11px]">Teléfono de Terminal</span>
                      <a className="text-slate-900 font-bold hover:text-[#005ea6] transition" href={`tel:${airport.phone}`}>
                        {airport.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <ShieldAlert className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[11px]">POLITUR (Policía de Turismo)</span>
                      <span className="text-slate-900 font-semibold block">Mostrador 24/7 en Hall de Llegadas</span>
                      <a href="tel:+18092003500" className="text-emerald-700 block font-medium hover:underline">
                        +1 (809) 200-3500
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Navigation className="w-4 h-4 text-[#0284c7] mt-0.5 shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[11px]">Asistencia Movilidad Reducida</span>
                      <span className="text-slate-700">Solicitar a su aerolínea con 48h de antelación o en mostrador de información.</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Globe className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[11px]">Sitio Oficial Operador</span>
                      <a 
                        className="text-[#005ea6] font-bold hover:underline inline-flex items-center" 
                        href={airport.website} 
                        rel="noopener noreferrer" 
                        target="_blank"
                      >
                        {airport.website.replace("https://", "").replace("http://", "").replace(/\/$/, "")} 
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <Link 
                    to="/e-ticket" 
                    className="w-full inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    <span>Guía Oficial del E-Ticket</span>
                  </Link>
                </div>
              </div>

              {/* SIDEBAR CARD: Travel Times to Key Destinations */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-2 text-slate-800 mb-3 pb-3 border-b border-slate-100">
                  <Navigation className="w-5 h-5 text-[#005ea6]" />
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Destinos Conectados</h3>
                </div>
                <p className="text-xs text-slate-500 mb-3">Tiempos promedio de traslado desde {airport.code} por vías principales:</p>
                
                <div className="space-y-2.5 text-xs">
                  {airport.nearbyDestinations && airport.nearbyDestinations.length > 0 ? (
                    airport.nearbyDestinations.map((dest, i) => {
                      const icon = i === 0 ? <Landmark className="w-4 h-4 text-amber-600" /> :
                                   i === 1 ? <Waves className="w-4 h-4 text-cyan-500" /> :
                                   i === 2 ? <Palmtree className="w-4 h-4 text-emerald-600" /> :
                                             <Building2 className="w-4 h-4 text-indigo-500" />;
                      return (
                        <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition">
                          <div className="flex items-center space-x-2">
                            {icon}
                            <span className="font-semibold text-slate-800">{dest.name}</span>
                          </div>
                          <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded shadow-2xs border border-slate-200">
                            {dest.distance}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition">
                        <div className="flex items-center space-x-2">
                          <Landmark className="w-4 h-4 text-amber-600" />
                          <span className="font-semibold text-slate-800">Zona Colonial (UNESCO)</span>
                        </div>
                        <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded shadow-2xs border border-slate-200">25 min</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition">
                        <div className="flex items-center space-x-2">
                          <Waves className="w-4 h-4 text-cyan-500" />
                          <span className="font-semibold text-slate-800">Boca Chica &amp; Club Náutico</span>
                        </div>
                        <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded shadow-2xs border border-slate-200">10 min</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition">
                        <div className="flex items-center space-x-2">
                          <Palmtree className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold text-slate-800">Juan Dolio &amp; Guavaberry</span>
                        </div>
                        <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded shadow-2xs border border-slate-200">20 min</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition">
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-indigo-500" />
                          <span className="font-semibold text-slate-800">Santo Domingo Centro (Piantini)</span>
                        </div>
                        <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded shadow-2xs border border-slate-200">30 min</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* SIDEBAR CARD: Dominican Republic Airport Network */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <PlaneTakeoff className="w-5 h-5 text-[#0284c7]" />
                    <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Otros Aeropuertos</h3>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Red Nacional</span>
                </div>
                
                <div className="space-y-2 text-xs">
                  {airports
                    .filter(a => a.id !== airport.id)
                    .slice(0, 4)
                    .map((other) => (
                      <Link 
                        key={other.id} 
                        to={`/aeropuerto/${other.slug}`} 
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition group"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-[#005ea6] bg-blue-50 px-1.5 py-0.5 rounded font-mono text-[10px]">
                            {other.code}
                          </span>
                          <span className="font-medium text-slate-700 group-hover:text-slate-900 truncate max-w-[180px]">
                            {other.name}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#005ea6]" />
                      </Link>
                    ))}
                </div>
              </div>

              {/* SIDEBAR CARD: Map & Location */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-2 text-slate-800 mb-3 pb-3 border-b border-slate-100">
                  <MapPin className="w-5 h-5 text-[#005ea6]" />
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Ubicación Geográfica</h3>
                </div>

                <div className="bg-slate-100 rounded-xl p-3 border border-slate-200/80 mb-3">
                  <div className="text-[11px] text-slate-500 font-mono">
                    <span className="text-slate-400 block text-[10px] uppercase font-sans font-semibold">Coordenadas GPS</span>
                    {airport.coordinates.lat.toFixed(4)}° N, {Math.abs(airport.coordinates.lng).toFixed(4)}° W
                  </div>
                  <div className="text-xs text-slate-700 mt-1 font-medium">
                    {isSDQ 
                      ? "Ruta 66, Punta Caucedo, Boca Chica, Santo Domingo" 
                      : `${airport.city}, ${airport.provinceName}, República Dominicana`}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <a 
                    className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 font-medium text-slate-700 transition" 
                    href={`https://maps.google.com/?q=${airport.coordinates.lat},${airport.coordinates.lng}`} 
                    rel="noopener noreferrer" 
                    target="_blank"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#005ea6]" />
                    <span>Google Maps</span>
                  </a>
                  <a 
                    className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 font-medium text-slate-700 transition" 
                    href={`https://waze.com/ul?ll=${airport.coordinates.lat},${airport.coordinates.lng}&navigate=yes`} 
                    rel="noopener noreferrer" 
                    target="_blank"
                  >
                    <Navigation2 className="w-3.5 h-3.5 text-[#0284c7]" />
                    <span>Abrir Waze</span>
                  </a>
                </div>
              </div>

            </aside>
          </div>
        </main>
        {/* END: MainContentGrid */}

        {/* BEGIN: AdvertisingRibbon */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6" data-purpose="ad-banner-placement">
          <Link 
            to="/anunciate"
            className="w-full bg-slate-900 rounded-2xl py-8 px-4 text-center border border-slate-700 text-slate-400 flex flex-col items-center justify-center min-h-[140px] shadow-sm relative overflow-hidden group hover:border-[#005ea6] transition block"
          >
            <div className="absolute inset-0 bg-radial from-[#005ea6]/20 to-transparent opacity-50 group-hover:opacity-75 transition" />
            <span className="text-2xl sm:text-4xl font-black tracking-tight text-white/90">1920 × 250</span>
            <span className="text-xs sm:text-sm uppercase tracking-widest text-[#00a3e0] font-semibold mt-1">
              Espacio Oficial de Publicidad Disponible
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              Comuníquese con el Departamento de Alianzas Turísticas B2B ↗
            </span>
          </Link>
        </section>
        {/* END: AdvertisingRibbon */}

        {/* Global Footer */}
        <Footer />
      </div>
    </PageTransition>
  );
}
