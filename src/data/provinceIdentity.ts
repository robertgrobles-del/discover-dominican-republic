// Identidad editorial por provincia: slider propio, municipios, secciones temáticas y orden de bloques.
// Una provincia sin perfil usa la página estándar (ProvinceHero automático y DEFAULT_PROVINCE_BLOCKS).
import samanaImg from "@/assets/samana.jpg";
import type { ProvinceSlide } from "@/components/province/ProvinceHero";
import { PHOTOS, creditsFor } from "@/data/commonsPhotos";

// Bloques de ProvinciaDetalle; el orden de esta lista es el de la página estándar.
export const DEFAULT_PROVINCE_BLOCKS = [
  "hero", "ficha", "distancias", "anuncio", "acerca", "actividades", "destinos", "itinerario",
  "como-llegar", "monumentos", "anuncio-2", "parques", "hoteles", "gastronomia", "vida-nocturna",
  "panorama", "blog", "galeria", "comentarios",
] as const;
export type ProvinceBlock = (typeof DEFAULT_PROVINCE_BLOCKS)[number] | "identidad" | "municipios" | "temas" | "viajero" | "ruta-atlantico" | "creditos" | "zonas" | "pasaporte" | "introduccion";

export interface IdentityMunicipality {
  name: string;
  role?: string;            // "Cabecera", "Distrito municipal"...
  identity: string;         // qué lo identifica
  highlights: string[];     // qué resaltar
  slug?: string;            // enlace a su destino, si existe en el catálogo
}

export interface IdentityTheme {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  facts?: string[];
  image?: string;
}

export interface TravelerTag {
  label: string;
  places: string[];
}

export interface ProvinceIdentity {
  tagline: string;          // "La Península Verde y Marina"
  intro: string;
  slides: ProvinceSlide[];
  heroStyle?: "default" | "strips";
  municipalities: IdentityMunicipality[];
  themes: IdentityTheme[];
  travelerTags: TravelerTag[];
  blocks: ProvinceBlock[];
  photoCredits: string[];   // autor (licencia) de cada foto de Commons usada
}

// Ruta del Bulevar Turístico del Atlántico: compartida por Samaná y María Trinidad Sánchez.
export const ATLANTIC_ROUTE = [
  { name: "Río San Juan", lat: 19.6436, lng: -70.0767, province: "maria-trinidad-sanchez", note: "Laguna Gri Grí y Playa Grande" },
  { name: "Cabrera", lat: 19.6406, lng: -69.9036, province: "maria-trinidad-sanchez", note: "Laguna Dudú y acantilados" },
  { name: "Nagua", lat: 19.3833, lng: -69.8475, province: "maria-trinidad-sanchez", note: "Pescado frente al mar en Matancitas" },
  { name: "Aeropuerto El Catey (AZS)", lat: 19.2670, lng: -69.7420, province: "samana", note: "Puerta de entrada aérea a la zona" },
  { name: "Sánchez", lat: 19.2297, lng: -69.6136, province: "samana", note: "Camarones y acceso a Los Haitises" },
  { name: "Las Terrenas", lat: 19.3110, lng: -69.5420, province: "samana", note: "Playas turquesa y cocina de fusión" },
  { name: "Santa Bárbara de Samaná", lat: 19.2056, lng: -69.3366, province: "samana", note: "Ballenas, Cayo Levantado y el puente de colores" },
  { name: "Las Galeras", lat: 19.2689, lng: -69.2458, province: "samana", note: "Playa Rincón y playas vírgenes" },
];

const IDENTITY_BLOCKS: ProvinceBlock[] = [
  "hero", "identidad", "temas", "municipios", "zonas", "viajero", "ruta-atlantico", "acerca", "ficha",
  "distancias", "itinerario", "como-llegar", "actividades", "destinos", "anuncio", "parques", "hoteles",
  "gastronomia", "pasaporte", "creditos",
];


export const provinceIdentity: Record<string, ProvinceIdentity> = {
  samana: {
    tagline: "La Península Verde y Marina",
    intro: "Hogar de la biodiversidad, la cultura del coco y el avistamiento de ballenas jorobadas: una península donde la selva cae sobre la bahía y una historia afroamericana única en el Caribe sigue viva.",
    heroStyle: "strips",
    slides: [
      { id: "ballenas", image: PHOTOS.ballenaSamana.url, tag: "Enero – Marzo", title: "Ballenas jorobadas", subtitle: "Bahía de Samaná", description: "Miles de ballenas llegan cada invierno a aparearse y dar a luz frente a Santa Bárbara de Samaná. Uno de los mejores avistamientos del mundo.", ctaText: "Ver temporada", ctaLink: "#ballenas" },
      { id: "cayo-levantado", image: PHOTOS.cayoLevantado.url, tag: "Excursión imperdible", title: "Cayo Levantado", subtitle: "La Isla Bacardí", description: "Arena blanca y agua transparente en medio de la bahía, a pocos minutos en bote desde el malecón de Samaná." },
      { id: "salto-limon", image: PHOTOS.saltoLimon.url, tag: "Aventura", title: "Salto El Limón", subtitle: "Entre 40 y 50 metros de cascada", description: "Oculto en la selva, se llega a caballo o a pie por senderos de montaña." },
      { id: "playa-rincon", image: PHOTOS.playaRincon.url, tag: "Playas paradisíacas", title: "Playa Rincón", subtitle: "Las Galeras", description: "Considerada una de las mejores playas del mundo: kilómetros de arena virgen y cocoteros frente a acantilados." },
      { id: "puentes", image: PHOTOS.puentesSamana.url, tag: "Santa Bárbara de Samaná", title: "El puente de colores", subtitle: "Hacia Cayo Vigía", description: "Malecón con casas victoriano-caribeñas, Los Haitises y la cocina de coco más auténtica del país." },
      { id: "peninsula", image: samanaImg, tag: "La Península Verde", title: "Samaná", subtitle: "Donde la selva abraza el mar", description: "Una península donde la selva cae sobre la bahía y la historia afroamericana sigue viva." },
    ],
    municipalities: [
      { name: "Santa Bárbara de Samaná", role: "Cabecera", identity: "Su icónico puente peatonal de colores hacia Cayo Vigía, el malecón con casas de madera de estilo victoriano-caribeño y la historia de los afrodescendientes norteamericanos que se asentaron aquí en el siglo XIX.", highlights: ["Punto de partida del avistamiento de ballenas (enero–marzo)", "Bote hacia Cayo Levantado (Isla Bacardí)", "Excursiones al Parque Nacional Los Haitises"], slug: "santa-barbara-de-samana" },
      { name: "Las Terrenas", identity: "La fusión entre el Caribe tropical y un aire bohemio europeo, con una gran comunidad francesa e italiana. Epicentro de la cocina de fusión, la vida nocturna relajada y el lujo descalzo.", highlights: ["Playa Bonita, Playa Cosón y Punta Popy", "Kitesurf y surf", "Restaurantes a pie de arena"], slug: "las-terrenas" },
      { name: "Sánchez", identity: "La puerta de entrada terrestre a la península y capital histórica del marisco fresco, en especial los camarones de río y de bahía.", highlights: ["Arquitectura ferroviaria de principios del siglo XX y la antigua estación del tren", "Acceso inmediato a Los Haitises: manglares y cuevas con arte rupestre", "Rutas de ecoturismo de aventura"], slug: "sanchez" },
      { name: "Las Galeras", role: "Distrito municipal", identity: "El extremo oriental de la península: playas vírgenes y acantilados dramáticos.", highlights: ["Playa Rincón, una de las mejores del mundo", "Playa Frontón y Playa Madama", "Senderos costeros entre acantilados"], slug: "las-galeras" },
    ],
    themes: [
      { id: "ballenas", eyebrow: "Temporada de enero a marzo", title: "Avistamiento de ballenas jorobadas", text: "Cada invierno, las ballenas jorobadas del Atlántico Norte llegan a la Bahía de Samaná para aparearse y dar a luz. Las excursiones salen desde el malecón de Santa Bárbara de Samaná.", facts: ["Salidas desde el malecón de Samaná", "Mejor época: mediados de enero a finales de marzo", "Se combina con Cayo Levantado en el mismo día"], image: PHOTOS.ballenaSamana.url },
      { id: "herencia", eyebrow: "Cultura viva", title: "Herencia afroamericana", text: "En el siglo XIX llegaron a Samaná afrodescendientes libres de Estados Unidos. Su legado sigue en las iglesias protestantes como La Churcha, en el inglés samanés que aún se escucha y en tradiciones que no existen en ningún otro lugar del país.", image: PHOTOS.maleconSamana.url },
      { id: "haitises", eyebrow: "Parque nacional", title: "Los Haitises", text: "Mogotes cubiertos de selva, manglares y cuevas con arte rupestre taíno, accesibles en bote desde Samaná y Sánchez.", facts: ["Cuevas con pictografías y petroglifos taínos", "Manglares y aves marinas", "Salidas desde Samaná y Sánchez"], image: PHOTOS.haitises.url },
      { id: "sabores", eyebrow: "Gastronomía", title: "Cocina de coco y mar", text: "El pescado con coco es el plato emblema de la península; en Sánchez reinan los camarones de río y de bahía, y en Las Terrenas la cocina de fusión frente al mar." },
    ],
    travelerTags: [
      { label: "Aventura y naturaleza", places: ["Los Haitises", "Salto El Limón", "Kitesurf en Las Terrenas"] },
      { label: "Playas paradisíacas", places: ["Playa Rincón", "Playa Bonita", "Cayo Levantado"] },
      { label: "Cultura y gastronomía", places: ["Herencia afroamericana", "Camarones de Sánchez", "Cocina de fusión en Las Terrenas"] },
    ],
    blocks: IDENTITY_BLOCKS,
    photoCredits: creditsFor([PHOTOS.ballenaSamana, PHOTOS.cayoLevantado, PHOTOS.saltoLimon, PHOTOS.playaRincon, PHOTOS.puentesSamana, PHOTOS.maleconSamana, PHOTOS.haitises]),
  },

  "maria-trinidad-sanchez": {
    tagline: "La Costa del Atlántico Indómito",
    intro: "Acantilados kársticos, piscinas naturales de agua dulce, cocoteros infinitos y un ambiente auténtico y local: el Atlántico dominicano sin masificar.",
    heroStyle: "strips",
    slides: [
      { id: "dudu", image: PHOTOS.lagunaDudu.url, tag: "Cabrera", title: "Laguna Dudú", subtitle: "Cenotes gemelos de agua dulce", description: "Agua cristalina y fría para nadar, bucear o lanzarse en tirolesa sobre el cenote." },
      { id: "gri-gri", image: PHOTOS.lagunaGriGri.url, tag: "Río San Juan", title: "Laguna Gri Grí", subtitle: "Manglares y piscinas naturales", description: "Botes por el estero hacia La Playita y Playa Caletón. Escenario del Carnavarengue, el único carnaval marino del mundo.", ctaText: "Conocer el Carnavarengue", ctaLink: "#carnavarengue" },
      { id: "playa-grande", image: PHOTOS.playaGrande.url, tag: "Surf y golf", title: "Playa Grande", subtitle: "Oleaje atlántico", description: "Olas potentes ideales para el surf, rodeadas de un campo de golf de clase mundial." },
      { id: "las-gordas", image: PHOTOS.nagua.url, tag: "Nagua", title: "Las Gordas", subtitle: "Cuna de la catibía", description: "Empanadas de masa de yuca fresca, crocantes y con rellenos tradicionales, que atraen comensales de todo el país." },
    ],
    municipalities: [
      { name: "Nagua", role: "Cabecera", identity: "Ciudad costera y laboriosa, famosa por su producción de coco, su gente hospitalaria y su animado carnaval.", highlights: ["Pescado fresco frente al mar en Matancitas", "Laguna de Saladilla", "Playas de arena dorada menos masificadas", "Las Gordas, cuna de las empanadas de catibía"], slug: "nagua" },
      { name: "Cabrera", identity: "Acantilados imponentes que caen sobre el Atlántico y manantiales de agua cristalina y fría que brotan cerca de la costa.", highlights: ["Laguna Dudú y sus cenotes gemelos con tirolesa", "Playa Diamante: aguas tranquilas y poco profundas, ideal para familias", "Playa Caletón"], slug: "cabrera" },
      { name: "Río San Juan", identity: "Pueblo de pescadores pintoresco, alegre y colorido, con canales de manglares junto a una de las lagunas ecoturísticas más bellas del país.", highlights: ["Laguna Gri Grí en bote hacia La Playita y Playa Caletón", "Playa Grande: surf y golf de clase mundial", "Carnavarengue, el único carnaval marino del mundo"], slug: "rio-san-juan" },
      { name: "El Factor", identity: "El corazón agrícola, ganadero y de conexión vial de la provincia: el valle fértil que une la cordillera con la costa atlántica.", highlights: ["Turismo rural", "Quesos y dulces artesanales"], slug: "el-factor" },
    ],
    themes: [
      { id: "carnavarengue", eyebrow: "Río San Juan · desde 1997", title: "Carnavarengue, el único carnaval marino del mundo", text: "Rinde homenaje a la tradición pesquera y a la belleza natural de la zona. Las comparsas desfilan a bordo de botes y lanchas por la Laguna Gri Grí ante el público.", facts: ["Los «Carnamares»: disfraces de calamares gigantes, caballitos de mar, peces y langostas", "Elaborados por niños, jóvenes y vecinos de los sectores locales", "Desfiles, concurso de caretas, música y recorridos ecológicos por la laguna"], image: PHOTOS.lagunaGriGri.url },
      { id: "catibia", eyebrow: "Las Gordas, Nagua", title: "La cuna de la empanada de catibía", text: "La catibía, empanada de masa de yuca fresca, tiene raíz taína en todo el país, pero Las Gordas se ganó su fama por la maestría artesanal de su gente: masa perfectamente crocante y rellenos tradicionales que atraen comensales de todas las regiones." },
      { id: "lagunas", eyebrow: "Agua dulce frente al mar", title: "Lagunas, cenotes y manantiales", text: "Una costa kárstica donde el agua dulce brota junto al Atlántico.", facts: ["Laguna Dudú (Cabrera): cenotes gemelos y tirolesa", "Laguna Gri Grí (Río San Juan): manglares en bote", "Laguna de Saladilla (Nagua)"], image: PHOTOS.lagunaDudu.url },
    ],
    travelerTags: [
      { label: "Aventura y naturaleza", places: ["Laguna Dudú", "Laguna Gri Grí", "Turismo rural en El Factor"] },
      { label: "Playas paradisíacas", places: ["Playa Grande", "Playa Diamante", "Playa Caletón"] },
      { label: "Cultura y gastronomía", places: ["Carnavarengue", "Catibías de Las Gordas", "Pescado en Matancitas"] },
    ],
    // Sin vida nocturna: la oferta de la provincia es muy pequeña.
    blocks: IDENTITY_BLOCKS,
    photoCredits: creditsFor([PHOTOS.lagunaDudu, PHOTOS.lagunaGriGri, PHOTOS.playaGrande, PHOTOS.nagua]),
  },
};
