import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Plane, MapPin, Star, ChevronRight, Phone, Globe, 
  Car, ShoppingBag, Wifi, Navigation, PlaneTakeoff, 
  ExternalLink, Check, Search, FileCheck2,
  Crown, Banknote, Utensils, Cross, Smartphone, Key, 
  Bus, Headphones, ShieldAlert, Sun, Landmark, Waves, 
  Palmtree, Building2, HelpCircle, Navigation2,
  Luggage, Clock, ShieldCheck, CheckCircle2, ArrowRight, Sparkles, Radio,
  QrCode, Newspaper, Calendar, Compass
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead, generateAirportSchema } from "@/components/SEOHead";
import { useTranslation } from "@/i18n";
import { getAirportBySlug, airports, type AirlineContact } from "@/data/airports";
import { useEditorialArticles, formatEditorialDate } from "@/lib/editorialApi";
import { destinations, type Destination } from "@/data/destinations";


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
  const { data: allArticles = [] } = useEditorialArticles();

  const [activeRegion, setActiveRegion] = useState<string>("all");
  const [airlineSearch, setAirlineSearch] = useState<string>("");

  // Noticias vinculadas específicamente a este aeropuerto (solo renderiza la sección si hay al menos 1 post)
  const airportNews = useMemo(() => {
    if (!airport || !allArticles.length) return [];

    const name = airport.name.toLowerCase();
    const codeRegex = new RegExp(`\\b${airport.code}\\b`, "i");
    const icaoRegex = new RegExp(`\\b${airport.icao}\\b`, "i");

    return allArticles.filter((article) => {
      // Filtrar sólo publicaciones de noticias, prensa o comunicados
      const isNewsChannel =
        article.channel === "noticias" ||
        article.channel === "prensa" ||
        article.category.toLowerCase().includes("noticia") ||
        article.category.toLowerCase().includes("prensa");
      if (!isNewsChannel) return false;

      const fullText = [
        article.title,
        article.excerpt,
        article.slug,
        ...(article.tags || [])
      ].join(" ").toLowerCase();

      // 1. Coincidencia directa por código IATA (ej. PUJ, SDQ) en título, extracto o tags
      if (
        codeRegex.test(article.title) || 
        codeRegex.test(article.excerpt) || 
        codeRegex.test(article.tags?.join(" ") || "")
      ) {
        return true;
      }

      // 2. Coincidencia por código ICAO (ej. MDPC, MDSD)
      if (icaoRegex.test(fullText)) {
        return true;
      }

      // 3. Coincidencia por nombre completo del aeropuerto o slug
      if (fullText.includes(name) || fullText.includes(airport.slug)) {
        return true;
      }

      // 4. Coincidencias específicas por aeropuertos dominicanos
      if (
        airport.code === "SDQ" && 
        (fullText.includes("las américas") || fullText.includes("las americas") || fullText.includes("peña gómez") || fullText.includes("pena gomez") || fullText.includes("punta caucedo"))
      ) {
        return true;
      }
      if (
        airport.code === "PUJ" && 
        (fullText.includes("aeropuerto") || fullText.includes("terminal")) && 
        (fullText.includes("punta cana") || fullText.includes("grupo puntacana"))
      ) {
        return true;
      }
      if (
        airport.code === "STI" && 
        (fullText.includes("aeropuerto del cibao") || fullText.includes("aeropuerto cibao") || (fullText.includes("cibao") && (fullText.includes("aeropuerto") || fullText.includes("terminal"))))
      ) {
        return true;
      }
      if (
        airport.code === "POP" && 
        (fullText.includes("gregorio luperón") || fullText.includes("gregorio luperon") || (fullText.includes("puerto plata") && (fullText.includes("aeropuerto") || fullText.includes("terminal"))))
      ) {
        return true;
      }
      if (
        airport.code === "AZS" && 
        (fullText.includes("el catey") || fullText.includes("juan bosch") || (fullText.includes("samaná") && (fullText.includes("aeropuerto") || fullText.includes("vuelo"))))
      ) {
        return true;
      }
      if (
        airport.code === "LRM" && 
        (fullText.includes("aeropuerto de la romana") || fullText.includes("aeropuerto la romana") || (fullText.includes("casa de campo") && fullText.includes("aeropuerto")))
      ) {
        return true;
      }
      if (
        airport.code === "JBQ" && 
        (fullText.includes("la isabela") || fullText.includes("higüero") || fullText.includes("higuero") || fullText.includes("joaquín balaguer") || fullText.includes("joaquin balaguer"))
      ) {
        return true;
      }
      if (
        airport.code === "BRX" && 
        (fullText.includes("maría montez") || fullText.includes("maria montez"))
      ) {
        return true;
      }

      return false;
    });
  }, [airport, allArticles]);

  // Destinos turísticos conectados con este aeropuerto
  // Se agregan de forma automática a medida que se agregan destinos turísticos en el catálogo
  const connectedDestinations = useMemo(() => {
    if (!airport) return [];
    const nearbySlugs = (airport.nearbyDestinations || []).map(n => n.slug.toLowerCase());
    const nearbyNames = (airport.nearbyDestinations || []).map(n => n.name.toLowerCase());
    const airportCode = airport.code.toLowerCase();
    const provName = (airport.provinceName || "").toLowerCase();
    const provId = (airport.provinceId || "").toLowerCase();

    // Filtramos destinos turísticos (excluyendo nodos provinciales puros para destacar destinos puntuales)
    const matches = destinations.filter(d => {
      // 1. Coincidencia directa de slug con nearbyDestinations del aeropuerto
      if (nearbySlugs.includes(d.slug.toLowerCase()) || nearbySlugs.includes(d.id.toLowerCase())) return true;

      // 2. Coincidencia de nombre con nearbyDestinations
      if (nearbyNames.some(name => d.name.toLowerCase().includes(name) || name.includes(d.name.toLowerCase()))) return true;

      // 3. Coincidencia por provincia (excluyendo tipo provincia para dar protagonismo a atracciones y destinos)
      if (d.type !== "provincia") {
        if (d.province && provName && d.province.toLowerCase().includes(provName)) return true;
        if (d.provinceId && provId && d.provinceId.toLowerCase() === provId) return true;
      }

      // 4. howToGetThere menciona el código del aeropuerto
      if (d.howToGetThere && d.howToGetThere.toLowerCase().includes(airportCode)) return true;

      // 5. nearbyAirport menciona el código o nombre del aeropuerto
      if (d.nearbyAirport && (d.nearbyAirport.toLowerCase().includes(airportCode) || d.nearbyAirport.toLowerCase().includes(airport.name.toLowerCase()))) return true;

      return false;
    });

    // Enriquecer con tiempo estimado de traslado desde este aeropuerto
    return matches.map(d => {
      const nearbyMatch = (airport.nearbyDestinations || []).find(
        n => n.slug.toLowerCase() === d.slug.toLowerCase() || 
             n.slug.toLowerCase() === d.id.toLowerCase() ||
             n.name.toLowerCase().includes(d.name.toLowerCase()) ||
             d.name.toLowerCase().includes(n.name.toLowerCase())
      );
      return {
        ...d,
        distanceTime: nearbyMatch?.distance || d.distanceFromAirport || "Acceso directo",
      };
    });
  }, [airport]);

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
        <div className="min-h-dvh bg-background">
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

      <div className="min-h-dvh bg-[#f8fafc] text-slate-800 antialiased selection:bg-[#005ea6] selection:text-white">
        
        {/* Global Site Header */}
        <Header />

        {/* BEGIN: HeroSection */}
        <section className="relative bg-[#0b1d3a] text-white overflow-hidden min-h-[85vh] flex flex-col justify-between py-10 lg:py-14" data-purpose="airport-hero">
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

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-between">
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
                  href="#servicios" 
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#005ea6] hover:bg-[#004e8a] text-white font-bold text-sm shadow-lg shadow-blue-950/20 transition-all active:scale-95"
                >
                  <span>Servicios en Terminal</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </a>
                <a 
                  href="#sobre-aeropuerto" 
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm backdrop-blur-md border border-white/20 transition-all"
                >
                  <span>Sobre el Aeropuerto</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>

            {/* Quick Airport Metric Cards (Horizontal Ribbon) */}
            <div className="mt-auto pt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 border-t border-white/15">
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

        {/* BEGIN: Section 3 - Airport Description with Side Photo */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 scroll-mt-24" id="sobre-aeropuerto" data-purpose="airport-overview-story">
          <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/90 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Text Description Column */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#005ea6] uppercase tracking-wider">
                  <Building2 className="w-4 h-4 text-[#005ea6]" />
                  <span>Perfil e Infraestructura Oficial</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                  Acerca del {airport.name} ({airport.code})
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  {airport.description}
                </p>

                {airport.highlights && airport.highlights.length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                      Aspectos Destacados de la Terminal
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {airport.highlights.map((h, i) => (
                        <div key={i} className="flex items-center space-x-2 text-xs text-slate-700 font-medium bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="truncate">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Key Aviation Metric Counters (Inspirado en Slide World Travel Agency) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-center group hover:border-[#005ea6] transition">
                    <span className="text-xl sm:text-2xl font-black text-[#005ea6] block">
                      {airport.airlinesDetailed?.length || airport.airlines?.length || 20}+
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Aerolíneas</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-center group hover:border-[#0284c7] transition">
                    <span className="text-xl sm:text-2xl font-black text-[#0284c7] block">
                      {airport.destinations?.length || 30}+
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Rutas Directas</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-center group hover:border-amber-400 transition">
                    <span className="text-xl sm:text-2xl font-black text-amber-500 block">
                      ★ {airport.rating || 4.7}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Reseñas ({airport.reviewCount?.toLocaleString() || "10k+"})</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-center group hover:border-emerald-500 transition">
                    <span className="text-xl sm:text-2xl font-black text-emerald-600 block">
                      24/7
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Operatividad</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#005ea6]" />
                    <span>{airport.city}, {airport.provinceName}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <PlaneTakeoff className="w-3.5 h-3.5 text-[#0284c7]" />
                    <span>Pista: {airport.runwayLength?.split("·")[0]?.trim() || "Internacional OACI"}</span>
                  </div>
                </div>
              </div>

              {/* Side Photos Column (Fotos a la derecha) */}
              <div className="lg:col-span-5 space-y-3">
                {/* Foto Principal */}
                <div className="relative rounded-2xl overflow-hidden aspect-[16/10] shadow-md border border-slate-200 group">
                  <img 
                    src={airport.imageUrl} 
                    alt={`${airport.name} - Fachada Oficial`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent flex items-end p-3.5">
                    <div className="text-white">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 block">Fotografía Principal</span>
                      <p className="text-xs font-semibold text-slate-100 truncate">{airport.name} ({airport.code})</p>
                    </div>
                  </div>
                </div>

                {/* Fotos Secundarias (Mosaico) */}
                {airport.gallery && airport.gallery.length > 1 && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative rounded-xl overflow-hidden aspect-[4/3] shadow-xs border border-slate-200 group">
                      <img 
                        src={airport.gallery[1]} 
                        alt={`${airport.name} - Instalaciones`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-2.5">
                        <span className="text-[11px] font-medium text-white truncate">Instalaciones &amp; Pista</span>
                      </div>
                    </div>

                    <div className="relative rounded-xl overflow-hidden aspect-[4/3] shadow-xs border border-slate-200 group">
                      <img 
                        src={airport.gallery[2] || airport.gallery[0] || airport.imageUrl} 
                        alt={`${airport.name} - Plataforma`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-2.5">
                        <span className="text-[11px] font-medium text-white truncate">Plataforma &amp; Vuelos</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>
        {/* END: Section 3 */}

        {/* BEGIN: MainContentGrid */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* ========================================== */}
            {/* LEFT COLUMN: PRIMARY TRAVEL CONTENT (8 Cols) */}
            {/* ========================================== */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* SECTION 4: Services & Amenities */}
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

              {/* SECTION: E-Ticket Dominicano Banner */}
              <section className="scroll-mt-24" data-purpose="eticket-notice-banner" id="eticket-section">
                <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg border border-emerald-500/30 relative overflow-hidden">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-start space-x-4 max-w-2xl">
                      <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 text-emerald-300">
                        <FileCheck2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-white">
                          E-Ticket Electrónico de Entrada y Salida a República Dominicana
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed">
                          Todos los pasajeros que entren o salgan por el <strong className="text-white">{airport.name} ({airport.code})</strong> deben completar la declaración jurada digital de Migración, Aduanas y Salud Pública antes de abordar para generar su código QR.
                        </p>
                        <div className="flex flex-wrap gap-y-1.5 gap-x-4 mt-3 text-xs text-emerald-200">
                          <span className="flex items-center"><Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Válido por familia o individual</span>
                          <span className="flex items-center"><Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Trámite digital previo al vuelo</span>
                          <span className="flex items-center"><Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Genera código QR descargable</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 justify-center">
                      <a 
                        className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95" 
                        href="https://eticket.gob.do/" 
                        rel="noopener noreferrer" 
                        target="_blank"
                      >
                        <span>Completar E-Ticket Oficial</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                      </a>
                      <Link 
                        to="/e-ticket" 
                        className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-emerald-200 border border-emerald-500/30 font-medium text-xs transition" 
                      >
                        <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
                        <span>Ver Guía Oficial y Pasos</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </section>

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

                {connectedDestinations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">Catálogo dinámico</span>
                    <a 
                      href="#destinos-turisticos" 
                      className="inline-flex items-center text-xs font-bold text-[#005ea6] hover:underline"
                    >
                      <span>Ver {connectedDestinations.length} destinos</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </a>
                  </div>
                )}
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
          {/* END: 2-Column Content Grid */}

          {/* ======================================================== */}
          {/* FULL-WIDTH SECTIONS (OCUPAN AMBAS COLUMNAS AL 100% ANCHO) */}
          {/* ======================================================== */}
          <div className="space-y-16 mt-16 pt-4 border-t border-slate-200/80">

            {/* SECTION: Destinations & Network (A todo ancho) */}
            <section className="scroll-mt-24" data-purpose="destinations-section" id="destinos">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-4 border-b border-slate-200 gap-4">
                <div>
                  <span className="text-xs font-bold text-[#005ea6] uppercase tracking-wider">Rutas Directas Globales</span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 font-display">Destinos Conectados sin Escalas</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">Conexión inmediata con las principales capitales y ciudades de América y Europa desde {airport.code}.</p>
                </div>

                {/* Region Filter Pills */}
                <div className="flex flex-wrap gap-2">
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
              </div>

              {/* Connected Cities Cloud */}
              <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 flex flex-wrap gap-2.5 shadow-xs">
                {displayedDestinations.map((city, idx) => {
                  const isKeyCity = city.includes("MAD") || city.includes("Madrid");
                  return (
                    <span 
                      key={idx}
                      className={`inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-default ${
                        isKeyCity 
                          ? "bg-blue-50 text-[#005ea6] font-semibold border border-blue-200 shadow-2xs" 
                          : "bg-slate-50 text-slate-700 border border-slate-200/80 hover:border-[#005ea6] hover:text-[#005ea6]"
                      }`}
                    >
                      <Plane className={`w-3.5 h-3.5 mr-2 ${isKeyCity ? "text-[#005ea6]" : "text-slate-400"}`} />
                      {city}
                    </span>
                  );
                })}
              </div>
            </section>

            {/* SECTION: Ground Transportation (A todo ancho) */}
            <section className="scroll-mt-24" data-purpose="ground-transportation" id="transporte">
              <div className="mb-6 pb-4 border-b border-slate-200">
                <span className="text-xs font-bold text-[#005ea6] uppercase tracking-wider">Movilidad y Traslados</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 font-display">Cómo Moverse desde el {airport.name}</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">Opciones verificadas y reguladas para trasladarse a {airport.city} y los principales polos turísticos del país.</p>
              </div>

              {/* Transport Cards Grid (2 Columnas en desktop para aprovechar el ancho completo) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(airport.transportation && airport.transportation.length > 0 ? airport.transportation.slice(0, 4) : [
                  { name: `Taxi Oficial ${airport.code}`, detail: `Servicio con tarifa fija por zona con ticket en mostrador oficial`, price: "US$ 25 - 40" },
                  { name: "Uber / DiDi Ridesharing", detail: "Puntos de encuentro autorizados frente a la salida exterior", price: "Tarifa en app" },
                  { name: "Renta de Autos Multimarca", detail: "Agencias líderes con mostradores en vestíbulo y entrega de vehículos", price: "Desde US$ 35/día" },
                  { name: "Autobús & Transfers Turísticos", detail: "Minibuses hacia el centro de la ciudad y hoteles turísticos", price: "Económico" }
                ]).map((trans, idx) => {
                  const style = transportCardStyles[idx % transportCardStyles.length];
                  const IconComponent = style.icon;
                  return (
                    <div key={idx} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#005ea6]/60 transition shadow-xs group">
                      <div className="flex items-start space-x-3.5">
                        <div className={`w-11 h-11 rounded-xl ${style.bg} flex items-center justify-center shrink-0`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-[#005ea6] transition">{trans.name}</h3>
                            <span className={`${style.badgeClass} text-[10px] font-bold px-2 py-0.5 rounded`}>{style.badge}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-md">
                            {trans.detail}
                          </p>
                        </div>
                      </div>
                      <div className="sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
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

            {/* SECTION 9: Passenger Journey Flow (Flujo del Pasajero a Todo Ancho) */}
            <section className="scroll-mt-24" data-purpose="passenger-journey-guide" id="flujo-pasajero">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-slate-200 gap-2">
                <div>
                  <span className="text-xs font-bold text-[#005ea6] uppercase tracking-wider">Guía Práctica al Viajero</span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 font-display">
                    Tu Experiencia en la Terminal Paso a Paso
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Procedimientos recomendados para una salida o llegada fluida y sin contratiempos en {airport.code}.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-400 font-mono hidden sm:inline">PROCESO ESTÁNDAR OACI ›››</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Step 1 */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-[#005ea6] transition shadow-xs flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="w-9 h-9 rounded-xl bg-blue-50 text-[#005ea6] font-black text-sm flex items-center justify-center font-mono">01</span>
                      <Luggage className="w-5 h-5 text-slate-400 group-hover:text-[#005ea6] transition" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mb-2">Llegada &amp; Check-in</h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Preséntate con 3 horas de antelación para vuelos internacionales. Emite pases de abordar en kioscos digitales o en el mostrador de tu aerolínea.
                    </p>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-slate-100 text-xs font-semibold text-[#005ea6] flex items-center">
                    <span>Equipaje de bodega</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-[#005ea6] transition shadow-xs flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="w-9 h-9 rounded-xl bg-blue-50 text-[#005ea6] font-black text-sm flex items-center justify-center font-mono">02</span>
                      <ShieldCheck className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mb-2">Seguridad &amp; Migración</h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Presenta tu pasaporte vigente y código QR del E-Ticket oficial. Pasa por los arcos de inspección y filtros biométricos automatizados.
                    </p>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-slate-100 text-xs font-semibold text-emerald-600 flex items-center">
                    <span>Filtro rápido QR</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-[#005ea6] transition shadow-xs flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="w-9 h-9 rounded-xl bg-blue-50 text-[#005ea6] font-black text-sm flex items-center justify-center font-mono">03</span>
                      <ShoppingBag className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mb-2">Duty Free &amp; Salas VIP</h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Explora tiendas libres de impuestos con rones dominicanos y artesanías, cafés de origen y salas de espera ejecutivas VIP con Wi-Fi premium.
                    </p>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-slate-100 text-xs font-semibold text-amber-600 flex items-center">
                    <span>Zonas de confort</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-[#005ea6] transition shadow-xs flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="w-9 h-9 rounded-xl bg-blue-50 text-[#005ea6] font-black text-sm flex items-center justify-center font-mono">04</span>
                      <PlaneTakeoff className="w-5 h-5 text-slate-400 group-hover:text-[#0284c7] transition" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mb-2">Puerta de Embarque</h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Monitorea las pantallas FIDS en tiempo real. Aborda ordenadamente por zonas a través de los puentes telescópicos hacia tu aeronave.
                    </p>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-slate-100 text-xs font-semibold text-[#0284c7] flex items-center">
                    <span>Despegue seguro</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 10: Ficha Técnica & Operaciones Aéreas (Ficha Técnica a Todo Ancho) */}
            <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-[#0b1d3a] rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden border border-slate-800 shadow-md scroll-mt-24" data-purpose="about-airport" id="historia-terminal">
              {/* Decorative radar contour rings */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 w-96 h-96 rounded-full border border-cyan-500/10 pointer-events-none" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 w-64 h-64 rounded-full border border-cyan-500/10 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <span className="text-xs font-bold text-[#00a3e0] uppercase tracking-wider font-mono">
                    Ficha Técnica &amp; Operaciones Aéreas • Estándar OACI
                  </span>
                  <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800/80 px-2.5 py-1 rounded-md font-mono font-semibold">
                    ICAO Code E / Wide-Body Ready
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-display">
                  {narrative.title}
                </h2>
                <p className="text-slate-300 text-sm mt-3 leading-relaxed max-w-4xl">
                  {narrative.p1}
                </p>
                <p className="text-slate-300 text-sm mt-2 leading-relaxed max-w-4xl">
                  {narrative.p2}
                </p>

                {/* Technical Capabilities Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-800 text-xs">
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center space-x-2 text-[#00a3e0] mb-2 font-bold text-sm">
                      <Plane className="w-4 h-4" />
                      <span>Aeronaves Compatibles</span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Pista e infraestructura certificada para aeronaves de fuselaje ancho: Boeing 777, 787 Dreamliner, Airbus A350 y A330 en vuelos intercontinentales.
                    </p>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center space-x-2 text-emerald-400 mb-2 font-bold text-sm">
                      <Radio className="w-4 h-4" />
                      <span>Radionavegación &amp; ILS</span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Sistemas de aproximación de precisión por instrumentos ILS CAT I/II, radiofaros VOR/DME y balizamiento de pista de alta intensidad PAPI.
                    </p>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center space-x-2 text-cyan-300 mb-2 font-bold text-sm">
                      <Sparkles className="w-4 h-4" />
                      <span>Servicios en Rampa (GSE)</span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Puentes de abordaje climatizados, sistemas de hidrantes de combustible Jet A-1 bajo ala y despacho aduanero y de rampa 24 horas.
                    </p>
                  </div>
                </div>

                {/* Key Stats Counter */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/80 text-xs">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <span className="text-[#00a3e0] font-bold block text-base">{narrative.stat1.label}</span>
                    <span className="text-slate-300 text-xs">{narrative.stat1.desc}</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <span className="text-[#00a3e0] font-bold block text-base">{narrative.stat2.label}</span>
                    <span className="text-slate-300 text-xs">{narrative.stat2.desc}</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <span className="text-[#00a3e0] font-bold block text-base">{narrative.stat3.label}</span>
                    <span className="text-slate-300 text-xs">{narrative.stat3.desc}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 11: Photo Gallery (Galería Fotográfica a Todo Ancho) */}
            <section className="scroll-mt-24" data-purpose="airport-gallery" id="galeria">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-200">
                <div>
                  <span className="text-xs font-bold text-[#005ea6] uppercase tracking-wider">Visuales de la Terminal</span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 font-display">
                    Galería Fotográfica
                  </h2>
                </div>
                <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Instalaciones activas {airport.code}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {(airport.gallery && airport.gallery.length > 0 ? airport.gallery : [airport.imageUrl, airport.imageUrl, airport.imageUrl]).slice(0, 3).map((imgUrl, idx) => {
                  const label = idx === 0 ? "Plataforma de Aeronaves & Pista" :
                                idx === 1 ? "Concourse & Puertas de Embarque" :
                                            "Aproximación Aérea y Paisaje";
                  return (
                    <div key={idx} className="group relative overflow-hidden rounded-2xl h-60 sm:h-72 bg-slate-200 shadow-sm border border-slate-200">
                      <img 
                        alt={`${airport.name} - ${label}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        src={imgUrl} 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-4">
                        <span className="text-white text-sm font-semibold tracking-wide drop-shadow-sm">{label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SECCIÓN 12: Destinos Turísticos Conectados (Segunda Sección Dinámica: se activa con los destinos y se agregan automáticamente) */}
            {connectedDestinations.length > 0 && (
              <section className="scroll-mt-24" data-purpose="connected-tourist-destinations" id="destinos-turisticos">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-3 border-b border-slate-200 gap-4">
                  <div>
                    <div className="flex items-center space-x-2 text-[#005ea6] text-xs font-bold uppercase tracking-wider mb-1">
                      <Compass className="w-4 h-4" />
                      <span>Conexión Turística Directa • Desde {airport.code}</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
                      Destinos Turísticos que Puedes Explorar
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
                      Playas, enclaves históricos y maravillas naturales con acceso inmediato o a corta distancia por carretera desde {airport.name}. A medida que se incorporan nuevos destinos turísticos al portal, se vinculan automáticamente a esta terminal.
                    </p>
                  </div>

                  <Link 
                    to="/destinos" 
                    className="inline-flex items-center text-xs font-bold text-[#005ea6] hover:text-[#004880] transition group self-start sm:self-auto shrink-0"
                  >
                    <span>Explorar catálogo nacional</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Destinations Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {connectedDestinations.map((dest) => {
                    const primaryCategory = (dest.categories && dest.categories[0]) || dest.type || "Destino";
                    const formattedCategory = primaryCategory.charAt(0).toUpperCase() + primaryCategory.slice(1);
                    return (
                      <article 
                        key={dest.id || dest.slug}
                        className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-[#005ea6]/50 transition duration-300 flex flex-col justify-between"
                      >
                        <div>
                          {/* Image Thumbnail with zoom effect */}
                          <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                            <img 
                              src={dest.imageUrl || airport.imageUrl} 
                              alt={dest.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                            {/* Category badge */}
                            <div className="absolute top-3 left-3">
                              <span className="bg-white/95 text-slate-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs backdrop-blur-xs">
                                {formattedCategory}
                              </span>
                            </div>

                            {/* Distance / travel time pill */}
                            <div className="absolute top-3 right-3">
                              <span className="bg-[#0b1d3a]/80 text-white border border-white/20 text-[10px] font-medium px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-cyan-300 mr-1" />
                                <span>{dest.distanceTime}</span>
                              </span>
                            </div>

                            {/* Destination Title on image bottom */}
                            <div className="absolute bottom-3 left-3 right-3 text-white">
                              <p className="text-[11px] text-cyan-200 font-medium flex items-center space-x-1">
                                <MapPin className="w-3 h-3 text-cyan-300" />
                                <span>{dest.province || airport.provinceName}</span>
                              </p>
                              <h3 className="font-bold text-base leading-tight mt-0.5 text-white truncate drop-shadow-xs">
                                {dest.name}
                              </h3>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-4">
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                              {dest.shortDescription || dest.description || "Destino turístico emblemático con atracciones naturales, cultura local y facilidades de hospedaje."}
                            </p>

                            {/* Highlights Pills */}
                            {dest.highlights && dest.highlights.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {dest.highlights.slice(0, 2).map((h, hIdx) => (
                                  <span key={hIdx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium truncate max-w-[150px]">
                                    {h}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Footer Action */}
                        <div className="p-4 pt-0">
                          <Link 
                            to={`/destino/${dest.slug}`}
                            className="w-full inline-flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 group-hover:bg-[#005ea6] text-slate-700 group-hover:text-white font-semibold text-xs transition duration-200"
                          >
                            <span>Ver Guía del Destino</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}

          </div>

          {/* SECTION 13: Noticias & Actualidad del Aeropuerto (Condicional: solo se muestra si hay al menos 1 post sobre este aeropuerto) */}
          {airportNews.length > 0 && (
            <section className="mt-16 pt-12 border-t border-slate-200" data-purpose="airport-news" id="noticias-aeropuerto">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center space-x-2 text-[#005ea6] text-xs font-bold uppercase tracking-wider mb-1.5">
                    <Newspaper className="w-4 h-4" />
                    <span>Actualidad &amp; Cobertura Oficial</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
                    Noticias sobre {airport.code}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                    Comunicados de prensa, expansiones de infraestructura, nuevas rutas y novedades de aviación vinculadas al {airport.name}.
                  </p>
                </div>

                <Link 
                  to="/noticias" 
                  className="inline-flex items-center text-xs font-bold text-[#005ea6] hover:text-[#004880] transition group self-start sm:self-auto shrink-0"
                >
                  <span>Ver todas las noticias</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Grid or Spotlight Cards */}
              <div className={`grid gap-6 ${airportNews.length === 1 ? 'grid-cols-1 md:grid-cols-12' : airportNews.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                {airportNews.map((article) => {
                  const isSingle = airportNews.length === 1;
                  return (
                    <article 
                      key={article.id} 
                      className={`group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-[#005ea6]/40 transition duration-300 flex ${isSingle ? 'flex-col md:flex-row md:col-span-12' : 'flex-col'}`}
                    >
                      <div className={`relative overflow-hidden bg-slate-100 ${isSingle ? 'md:w-5/12 h-64 md:h-auto min-h-[220px]' : 'h-52 w-full'}`}>
                        <img 
                          src={article.image || airport.imageUrl} 
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <span className="bg-[#005ea6] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs">
                            {article.category || "Noticia"}
                          </span>
                        </div>
                      </div>

                      <div className={`p-5 sm:p-6 flex flex-col justify-between flex-1 ${isSingle ? 'md:w-7/12' : ''}`}>
                        <div>
                          <div className="flex items-center space-x-3 text-slate-400 text-xs mb-2.5">
                            {article.publishedAt && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>{formatEditorialDate(article.publishedAt)}</span>
                              </div>
                            )}
                            {article.readMinutes && (
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>{article.readMinutes} min de lectura</span>
                              </div>
                            )}
                          </div>

                          <h3 className="font-bold text-slate-900 text-lg group-hover:text-[#005ea6] transition leading-snug mb-2 font-display">
                            <Link to={article.href}>
                              {article.title}
                            </Link>
                          </h3>

                          {article.excerpt && (
                            <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4">
                              {article.excerpt}
                            </p>
                          )}

                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {article.tags.slice(0, 3).map((tag, tIdx) => (
                                <span key={tIdx} className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                          <div className="text-xs text-slate-500">
                            Por <span className="font-semibold text-slate-700">{article.authorName}</span>
                          </div>
                          <Link 
                            to={article.href}
                            className="inline-flex items-center text-xs font-bold text-[#005ea6] group-hover:text-[#004880] transition"
                          >
                            <span>Leer artículo</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

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
