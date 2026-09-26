import { MapPin, Sparkles, ArrowRight, Waves, Compass, Trees, Wine } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export interface DestinationZone {
  id: string;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  badgeColor?: string;
  highlight: string;
  image: string;
  link?: string;
}

const defaultZonesMap: Record<string, DestinationZone[]> = {
  "punta-cana": [
    {
      id: "cap-cana",
      name: "Cap Cana",
      tagline: "Lujo Privado & Golf",
      description: "Marina de megayates, el galardonado campo Punta Espada Golf Club y parques ecológicos de aventura.",
      badge: "Lujo & Marina",
      badgeColor: "bg-amber-500 text-white",
      highlight: "Beach Clubs VIP & Yates",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
      link: "/destino/cap-cana",
    },
    {
      id: "bavaro",
      name: "Playa Bávaro",
      tagline: "El Corazón del Caribe",
      description: "Declarada por la UNESCO entre las mejores playas del mundo. Cocoteros infinitos, centros comerciales y vida nocturna.",
      badge: "Todo Incluido & Ocio",
      badgeColor: "bg-sky-500 text-white",
      highlight: "Aguas Calmas & Arrecifes",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
      link: "/destino/bavaro",
    },
    {
      id: "macao",
      name: "Playa Macao",
      tagline: "Surf & Buggies 4x4",
      description: "Playa virgen de oleaje perfecto para surfing, chiringuitos de pescado frito tradicional y rutas en todoterreno.",
      badge: "Aventura & Olas",
      badgeColor: "bg-orange-500 text-white",
      highlight: "Cocina Criolla & Surf",
      image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&auto=format&fit=crop&q=80",
      link: "/destino/macao",
    },
    {
      id: "uvero-alto",
      name: "Uvero Alto",
      tagline: "Serenidad & Bienestar",
      description: "Aguas de color turquesa intenso con arenas tostadas, hoteles boutique de bienestar y retiros de absoluta desconexión.",
      badge: "Resorts Wellness",
      badgeColor: "bg-emerald-600 text-white",
      highlight: "Spa & Romance",
      image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&auto=format&fit=crop&q=80",
      link: "/destino/uvero-alto",
    },
  ],
  "bavaro": [
    {
      id: "los-corales",
      name: "Los Corales & El Cortecito",
      tagline: "Gastronomía & Paseo Peatonal",
      description: "Epicentro gastronómico frente al mar con restaurantes multiculturales, bares de playa y vida bohemia.",
      badge: "Gastronomía & Ocio",
      badgeColor: "bg-amber-500 text-white",
      highlight: "Bistrós & Vibe Playero",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "arena-gorda",
      name: "Playa Arena Gorda",
      tagline: "Mega Resorts Todo Incluido",
      description: "Extensión de arena blanca y aguas transparentes con resorts de 5 estrellas, parques acuáticos y spas.",
      badge: "Familiar & Lujo",
      badgeColor: "bg-sky-500 text-white",
      highlight: "Parques Acuáticos & Spas",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "cabeza-de-toro",
      name: "Cabeza de Toro",
      tagline: "Santuario de Aves & Arrecifes",
      description: "Lagunas naturales protegidas, arrecifes de coral virgen para buceo y centros de conservación marina.",
      badge: "Snorkel & Ecoturismo",
      badgeColor: "bg-teal-600 text-white",
      highlight: "Arrecife de Coral Vivo",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80",
    },
  ],
  "cap-cana": [
    {
      id: "marina-cap-cana",
      name: "La Marina",
      tagline: "Megayates & Alta Cocina",
      description: "La marina más moderna del Caribe con fondeo de megayates, pesca deportiva de aguja azul y restaurantes de autor.",
      badge: "Yate & Gastronomía",
      badgeColor: "bg-indigo-600 text-white",
      highlight: "Pesca Deportiva & Vinos",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "punta-espada",
      name: "Punta Espada",
      tagline: "Golf Signature de Jack Nicklaus",
      description: "Campo de golf clasificado #1 del Caribe y México con 8 hoyos jugando directamente sobre el mar turquesa.",
      badge: "Golf de Campeonato",
      badgeColor: "bg-emerald-600 text-white",
      highlight: "8 Hoyos sobre el Mar",
      image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "juanillo",
      name: "Playa Juanillo",
      tagline: "Aguas Turquesas & Beach Club",
      description: "Kilómetros de arena blanca y aguas poco profundas como piscinas naturales, con exclusivos clubes de playa.",
      badge: "Beach Club VIP",
      badgeColor: "bg-sky-500 text-white",
      highlight: "Aguas Cristalinas Calmas",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "scape-park",
      name: "Scape Park & Hoyo Azul",
      tagline: "Cenotes & Cavernas Milenarias",
      description: "Parque eco-aventura con el famoso cenote Hoyo Azul al pie de un farallón de 75 metros y tirolesas en acantilados.",
      badge: "Aventura & Ecoturismo",
      badgeColor: "bg-teal-600 text-white",
      highlight: "Cenote Turquesa Oculto",
      image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&auto=format&fit=crop&q=80",
    },
  ],
  "samana": [
    {
      id: "las-terrenas",
      name: "Las Terrenas",
      tagline: "Vibración Bohemia & Playas Vírgenes",
      description: "Pueblo cosmopolita de pescadores con bistrós franceses e italianos frente al mar, kitesurf y ambiente relajado.",
      badge: "Chic & Gastronomía",
      badgeColor: "bg-purple-500 text-white",
      highlight: "Pueblo de los Pescadores",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
      link: "/destino/las-terrenas",
    },
    {
      id: "las-galeras",
      name: "Las Galeras",
      tagline: "El Rincón del Fin del Mundo",
      description: "Punto de partida hacia Playa Rincón, Frontón y Madama. Naturaleza virgen con acantilados de roca caliza.",
      badge: "Ecoturismo Puro",
      badgeColor: "bg-emerald-600 text-white",
      highlight: "Playa Rincón & Ballenas",
      image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&auto=format&fit=crop&q=80",
      link: "/destino/las-galeras",
    },
    {
      id: "el-valle",
      name: "El Valle",
      tagline: "Selva Virgen & Glamping",
      description: "Valle escondido entre montañas con playas salvajes, cascadas secretas y alojamientos sostenibles en copas de árboles.",
      badge: "Eco-Lodge & Paz",
      badgeColor: "bg-green-700 text-white",
      highlight: "Playa El Valle & Cascadas",
      image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "cayo-levantado",
      name: "Cayo Levantado",
      tagline: "Isla Bacardí & Arrecifes",
      description: "Pequeña isla paradisíaca en medio de la bahía con aguas cristalinas color esmeralda y avistamiento de ballenas.",
      badge: "Isla Exclusiva",
      badgeColor: "bg-sky-600 text-white",
      highlight: "Aguas Esmeralda & Fauna",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80",
    },
  ],
  "puerto-plata": [
    {
      id: "cabarete",
      name: "Cabarete",
      tagline: "Capital Mundial del Viento & Kitesurf",
      description: "Ambiente joven y deportivo con campeonatos internacionales de windsurf, kitesurf y fiesta en la orilla de la playa.",
      badge: "Deportes Extremos",
      badgeColor: "bg-sky-600 text-white",
      highlight: "Kite Beach & Bares",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
      link: "/destino/cabarete",
    },
    {
      id: "sosua",
      name: "Sosúa",
      tagline: "Bahía de Buceo & Arrecifes",
      description: "Aguas cristalinas en forma de media luna ideales para el esnórquel entre barcos hundidos y corales multicolores.",
      badge: "Buceo & Snorkel",
      badgeColor: "bg-teal-600 text-white",
      highlight: "Playa Alicia & Corales",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80",
      link: "/destino/sosua",
    },
    {
      id: "playa-dorada",
      name: "Playa Dorada",
      tagline: "Resorts Todo Incluido & Golf",
      description: "Complejo vacacional cerrado con campo de golf diseñado por Robert Trent Jones Sr. y extensas playas doradas.",
      badge: "Golf & Todo Incluido",
      badgeColor: "bg-amber-600 text-white",
      highlight: "Playa Dorada Golf Course",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "costambar",
      name: "Costámbar & Cofresí",
      tagline: "Villas Marítimas & Ocean World",
      description: "Zona residencial tranquila con calas protegidas de arrecifes y el parque marino Ocean World Adventure Park.",
      badge: "Tranquilidad & Marina",
      badgeColor: "bg-indigo-600 text-white",
      highlight: "Ocean World & Ensenadas",
      image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&auto=format&fit=crop&q=80",
    },
  ],
  "santo-domingo": [
    {
      id: "ciudad-colonial",
      name: "Ciudad Colonial",
      tagline: "Patrimonio de la Humanidad UNESCO",
      description: "La primera ciudad del Nuevo Mundo con calles adoquinadas centenarias, museos coloniales y terrazas de alta gastronomía.",
      badge: "Historia & Cultura",
      badgeColor: "bg-amber-600 text-white",
      highlight: "Calle Las Damas & Catedral",
      image: "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800&auto=format&fit=crop&q=80",
      link: "/destino/zona-colonial",
    },
    {
      id: "malecon",
      name: "Malecón & Gazcue",
      tagline: "Paseo Marítimo & Tradición",
      description: "Kilómetros de avenida costera frente al Mar Caribe, casinos históricos, hoteles emblemáticos y el Palacio Nacional.",
      badge: "Vistas al Mar",
      badgeColor: "bg-blue-600 text-white",
      highlight: "Paseo Marítimo & Obelisco",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "poligono-central",
      name: "Piantini & Naco",
      tagline: "Epicentro Cosmopolita & Shopping",
      description: "El distrito financiero más vibrante con rascacielos modernos, boutiques de lujo, bistrós y exclusivos bares rooftop.",
      badge: "Lujo & Vida Nocturna",
      badgeColor: "bg-purple-600 text-white",
      highlight: "Rooftops & Centros Comerciales",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "los-tres-ojos",
      name: "Santo Domingo Este & Los Tres Ojos",
      tagline: "Cenotes Urbanos & Faro a Colón",
      description: "Parque nacional con lagos subterráneos de aguas sulfurosas azules rodeados de vegetación prehistórica.",
      badge: "Naturaleza Urbana",
      badgeColor: "bg-teal-600 text-white",
      highlight: "Cenotes Subterráneos",
      image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&auto=format&fit=crop&q=80",
    },
  ],
  "la-romana": [
    {
      id: "casa-de-campo",
      name: "Casa de Campo Resort",
      tagline: "Resort de Celebridades & Golf",
      description: "El resort más exclusivo del Caribe con Teeth of the Dog, marina internacional, campos de polo y villas privadas.",
      badge: "Ultralujo & Polo",
      badgeColor: "bg-amber-600 text-white",
      highlight: "Teeth of the Dog Golf",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "altos-de-chavon",
      name: "Altos de Chavón",
      tagline: "Villa Medieval Mediterránea",
      description: "Réplica de una villa mediterránea del siglo XVI sobre el río Chavón con anfiteatro romano, talleres de arte y museos.",
      badge: "Arte & Arquitectura",
      badgeColor: "bg-rose-600 text-white",
      highlight: "Anfiteatro Griego & Río Chavón",
      image: "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "bayahibe",
      name: "Bayahíbe",
      tagline: "Pueblo de Pescadores & Isla Saona",
      description: "Puerto de embarque oficial hacia la Isla Saona y Parque Nacional Cotubanamá, con espectaculares atardeceres caribeños.",
      badge: "Playas Calmas & Buceo",
      badgeColor: "bg-sky-500 text-white",
      highlight: "Embarque a Isla Saona",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
      link: "/destino/bayahibe",
    },
    {
      id: "isla-catalina",
      name: "Isla Catalina",
      tagline: "Muro de Coral & Buceo VIP",
      description: "Isla deshabitada protegida con 'El Muro', uno de los puntos de inmersión y snorkel más impresionantes del planeta.",
      badge: "Santuario Marino",
      badgeColor: "bg-teal-600 text-white",
      highlight: "El Muro de Coral",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80",
    },
  ],
  "jarabacoa": [
    {
      id: "los-montones",
      name: "Ruta de los Ríos & Balnearios",
      tagline: "Aguas Cristalinas de Montaña",
      description: "Confluencia de los ríos Yaque del Norte y Jimenoa con balnearios naturales de agua pura y fresca.",
      badge: "Ríos & Balnearios",
      badgeColor: "bg-sky-600 text-white",
      highlight: "Rafting & Kayak Extremo",
      image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "salto-jimenoa",
      name: "Salto de Jimenoa & Baiguate",
      tagline: "Cascadas en Bosque Nublado",
      description: "Puentes colgantes de madera sobre cañones verdes que conducen a impresionantes caídas de agua de 35 metros.",
      badge: "Cascadas Icónicas",
      badgeColor: "bg-emerald-600 text-white",
      highlight: "Puentes Colgantes",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "rancho-baiguate",
      name: "Valle de Pinar Quemado",
      tagline: "Ecoturismo & Cabañas de Madera",
      description: "Zona campestre de montaña ideal para paseos a caballo, parapente sobre el valle y estancias en chalets alpinos.",
      badge: "Cabañas & Clima Fresco",
      badgeColor: "bg-amber-600 text-white",
      highlight: "Parapente & Senderismo",
      image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&auto=format&fit=crop&q=80",
    },
  ],
  "barahona": [
    {
      id: "san-rafael",
      name: "San Rafael & Los Patos",
      tagline: "Ríos Fríos que Mueren en el Mar",
      description: "Playas de piedras blancas pulidas por el oleaje con balnearios de ríos helados a escasos metros del mar Caribe.",
      badge: "Ríos & Olas Gigantes",
      badgeColor: "bg-teal-600 text-white",
      highlight: "Cascadas Frente a la Playa",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "bahoruco",
      name: "Sierra de Bahoruco & Larimar",
      tagline: "Única Mina de Larimar del Mundo",
      description: "Montañas nubladas con yacimientos mineros de la piedra semipreciosa azul larimar y observación de aves endémicas.",
      badge: "Minas de Larimar",
      badgeColor: "bg-blue-600 text-white",
      highlight: "Piedra Turquesa Nacional",
      image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "polo-magnetico",
      name: "Polo Magnético & Café",
      tagline: "Misterio Físico & Cafetales",
      description: "Fenómeno óptico y gravitacional donde los vehículos suben la colina solos, rodeado de fincas cafetaleras de altura.",
      badge: "Misterio & Café",
      badgeColor: "bg-amber-700 text-white",
      highlight: "Ruta del Café de Altura",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
    },
  ],
  "pedernales": [
    {
      id: "bahia-aguilas",
      name: "Bahía de las Águilas",
      tagline: "La Playa Más Virgen del Caribe",
      description: "8 kilómetros de arena blanca inmaculada protegida dentro del Parque Nacional Jaragua, sin construcciones hoteleras.",
      badge: "Patrimonio de la Biosfera",
      badgeColor: "bg-sky-500 text-white",
      highlight: "Aguas Cristalinas Puras",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
      link: "/destino/bahia-de-las-aguilas",
    },
    {
      id: "cabo-rojo",
      name: "Cabo Rojo & Puerto de Cruceros",
      tagline: "El Nuevo Polo Ecoturístico",
      description: "Aguas turquesas sobre acantilados de bauxita roja con nueva terminal de cruceros sostenible y glamping boutique.",
      badge: "Desarrollo Ecoturístico",
      badgeColor: "bg-rose-600 text-white",
      highlight: "Acantilados de Bauxita Roja",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "laguna-oviedo",
      name: "Laguna de Oviedo",
      tagline: "Flamencos Rosados & Manglares",
      description: "Laguna hipersalina con colonias de flamencos, iguanas rinoceronte y cayos vírgenes en un ecosistema único.",
      badge: "Santuario de Aves",
      badgeColor: "bg-pink-600 text-white",
      highlight: "Flamencos & Cayos Vírgenes",
      image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&auto=format&fit=crop&q=80",
    },
  ],
};

interface DestinationZonesGridProps {
  slug: string;
  destinoNombre: string;
  zones?: DestinationZone[];
}

export function DestinationZonesGrid({ slug, destinoNombre, zones }: DestinationZonesGridProps) {
  const normalizedSlug = slug.toLowerCase().trim();
  const activeZones = zones || defaultZonesMap[normalizedSlug] || [];

  if (activeZones.length === 0) return null;

  return (
    <section className="py-16 bg-muted/30 border-y border-border" id="zonas-microdestinos">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-widest mb-2">
              <Compass className="h-4 w-4" /> Micro-Destinos &amp; Zonas
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-black text-foreground tracking-tight">
              Explora {destinoNombre} por Zonas
            </h2>
          </div>
          <p className="text-muted-foreground text-sm max-w-md font-normal leading-relaxed">
            Cada micro-zona posee su propia identidad y atmósfera: desde santuarios de lujo y golf de campeonato hasta playas vírgenes para surf y bienestar.
          </p>
        </div>

        {/* Zones Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeZones.map((zone) => {
            const CardWrapper = zone.link ? Link : 'article';
            const wrapperProps = zone.link ? { to: zone.link } : {};

            return (
              <CardWrapper
                key={zone.id}
                {...(wrapperProps as any)}
                className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 bg-slate-950 flex flex-col justify-end min-h-[380px] border border-border/40 cursor-pointer"
              >
                <img
                  src={zone.image}
                  alt={zone.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition duration-700 opacity-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                <div className="relative p-6 z-10">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase mb-2 ${
                      zone.badgeColor || "bg-primary text-primary-foreground"
                    }`}
                  >
                    {zone.tagline}
                  </span>

                  <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
                    {zone.name}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                    {zone.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-white/90 pt-3 border-t border-white/15">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      {zone.highlight}
                    </span>
                    <span className="font-bold flex items-center gap-1 text-white group-hover:translate-x-1 transition-transform">
                      Ver <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </CardWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}
