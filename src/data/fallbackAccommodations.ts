export interface Hotel {
  id: string;
  name: string;
  slug: string | null;
  short_description: string | null;
  image_url: string | null;
  price_range: string | null;
  rating: number | null;
  stars: number | null;
  category: string | null;
  amenities: string[] | null;
  address: string | null;
  is_sponsored?: boolean | null;
  is_featured?: boolean | null;
  destinations?: { name: string } | null;
}

export interface Airbnb {
  id: string;
  name: string;
  slug: string | null;
  short_description: string | null;
  image_url: string | null;
  price_per_night: number | null;
  rating: number | null;
  guests: number | null;
  bedrooms: number | null;
  is_superhost: boolean | null;
  is_sponsored?: boolean | null;
  is_featured?: boolean | null;
  property_type: string | null;
  amenities: string[] | null;
  address: string | null;
  destinations?: { name: string } | null;
}

// Curated fallback options ensuring at least 3 high-quality accommodations per category
export const FALLBACK_HOTELS: Hotel[] = [
  // Categoria: Resort / All-Inclusive
  {
    id: "sanctuary-cap-cana",
    name: "Sanctuary Cap Cana Resort & Spa",
    slug: "sanctuary-cap-cana",
    short_description: "Exclusivo resort 5 estrellas todo incluido solo para adultos frente al mar con servicio de mayordomo privado.",
    image_url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80",
    price_range: "$$$$",
    rating: 4.9,
    stars: 5,
    category: "Resort All-Inclusive",
    amenities: ["wifi", "pool", "restaurant", "gym", "spa", "playa privada"],
    address: "Boulevard Cap Cana, Punta Cana, La Altagracia",
    is_sponsored: true,
    is_featured: true,
    destinations: { name: "Cap Cana, Punta Cana" }
  },
  {
    id: "eden-roc-cap-cana",
    name: "Eden Roc Cap Cana Relais & Châteaux",
    slug: "eden-roc-cap-cana",
    short_description: "Propiedad de ultralujo Relais & Châteaux con villas privadas, club de playa exclusivo y campo de golf Punta Espada.",
    image_url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
    price_range: "$$$$",
    rating: 4.9,
    stars: 5,
    category: "Resort All-Inclusive",
    amenities: ["wifi", "pool", "restaurant", "gym", "golf", "spa"],
    address: "Cap Cana Marina & Beach Club, La Altagracia",
    is_sponsored: false,
    is_featured: true,
    destinations: { name: "Cap Cana, Punta Cana" }
  },
  {
    id: "casa-de-campo-resort",
    name: "Casa de Campo Resort & Villas",
    slug: "casa-de-campo",
    short_description: "Resort de clase mundial con el icónico campo de golf Teeth of the Dog, marina internacional y villa medieval Altos de Chavón.",
    image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
    price_range: "$$$$",
    rating: 4.9,
    stars: 5,
    category: "Resort All-Inclusive",
    amenities: ["wifi", "pool", "restaurant", "gym", "golf", "marina"],
    address: "Carretera La Romana - Higüey, La Romana",
    is_sponsored: false,
    is_featured: true,
    destinations: { name: "La Romana" }
  },

  // Categoria: Boutique & Colonial
  {
    id: "casas-del-xvi",
    name: "Casas del XVI Boutique Hotel",
    slug: "casas-del-xvi",
    short_description: "Colección de casas coloniales del siglo XVI restauradas con lujo refinado en el corazón de la Ciudad Colonial.",
    image_url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=80",
    price_range: "$$$",
    rating: 4.8,
    stars: 5,
    category: "Hotel Boutique",
    amenities: ["wifi", "pool", "restaurant", "patio colonial", "mayordomo"],
    address: "Calle Padre Billini No. 252, Ciudad Colonial, Santo Domingo",
    is_sponsored: false,
    is_featured: true,
    destinations: { name: "Santo Domingo (Zona Colonial)" }
  },
  {
    id: "billini-hotel",
    name: "Billini Hotel Historic Luxury",
    slug: "billini-hotel",
    short_description: "Vanguardia arquitectónica integrada con muros coloniales del siglo XVI, terraza rooftop y piscina con vista al convento.",
    image_url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop&q=80",
    price_range: "$$$",
    rating: 4.7,
    stars: 5,
    category: "Hotel Boutique",
    amenities: ["wifi", "pool", "restaurant", "gym", "rooftop bar"],
    address: "Calle Padre Billini 256, Ciudad Colonial, Santo Domingo",
    is_sponsored: false,
    is_featured: false,
    destinations: { name: "Santo Domingo (Zona Colonial)" }
  },
  {
    id: "the-peninsula-house",
    name: "The Peninsula House Boutique Lodge",
    slug: "peninsula-house",
    short_description: "Mansión estilo victoriano premiada internacionalmente, con vistas panorámicas al océano Atlántico en las colinas de Samaná.",
    image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
    price_range: "$$$$",
    rating: 4.9,
    stars: 5,
    category: "Hotel Boutique",
    amenities: ["wifi", "pool", "restaurant", "spa", "playa privada"],
    address: "Cosón Hills, Las Terrenas, Samaná",
    is_sponsored: false,
    is_featured: true,
    destinations: { name: "Las Terrenas, Samaná" }
  },

  // Categoria: Eco-Lodge & Montaña
  {
    id: "casa-bonita-lodge",
    name: "Casa Bonita Tropical Lodge",
    slug: "casa-bonita-barahona",
    short_description: "Santuario ecológico de lujo en la Reserva de la Biosfera con vistas espectaculares del mar Caribe y la Sierra de Bahoruco.",
    image_url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80",
    price_range: "$$$",
    rating: 4.8,
    stars: 4,
    category: "Eco-Lodge & Montaña",
    amenities: ["wifi", "pool", "restaurant", "spa natural", "canopy zipline"],
    address: "Km 17 Carretera de la Costa, Bahoruco, Barahona",
    is_sponsored: false,
    is_featured: true,
    destinations: { name: "Barahona (Costa Sur)" }
  },
  {
    id: "rancho-baiguate",
    name: "Rancho Baiguate Eco-Adventure",
    slug: "rancho-baiguate",
    short_description: "Pionero del ecoturismo y turismo de aventura en la Cordillera Central, rafting en Río Yaque del Norte y cabalgatas.",
    image_url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80",
    price_range: "$$",
    rating: 4.7,
    stars: 4,
    category: "Eco-Lodge & Montaña",
    amenities: ["wifi", "pool", "restaurant", "rafting", "senderismo", "caballos"],
    address: "Carretera La Joya, Jarabacoa, La Vega",
    is_sponsored: false,
    is_featured: false,
    destinations: { name: "Jarabacoa, La Vega" }
  },
  {
    id: "clave-verde-ecolodge",
    name: "Clave Verde Ecolodge & Retreat",
    slug: "clave-verde-samana",
    short_description: "Refugio ecológico autosostenible con energía solar, piscina natural y vistas panorámicas de 360 grados a la bahía y montañas.",
    image_url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop&q=80",
    price_range: "$$",
    rating: 4.8,
    stars: 4,
    category: "Eco-Lodge & Montaña",
    amenities: ["wifi", "pool", "restaurant", "gimnasio al aire libre", "yoga"],
    address: "La Barbacoa, Las Terrenas, Samaná",
    is_sponsored: false,
    is_featured: false,
    destinations: { name: "Samaná" }
  },
];

export const FALLBACK_AIRBNBS: Airbnb[] = [
  // Categoria: Villas Frente al Mar (Beachfront)
  {
    id: "villa-palmeras-oceanfront",
    name: "Villa Palmeras Oceanfront Luxury",
    slug: "villa-palmeras-cap-cana",
    short_description: "Lujosa villa contemporánea frente al mar con piscina infinita privada, chef personal y acceso directo a la playa de arena blanca.",
    image_url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=80",
    price_per_night: 420,
    rating: 4.95,
    guests: 10,
    bedrooms: 5,
    is_superhost: true,
    is_sponsored: true,
    is_featured: true,
    property_type: "Villa de Playa",
    amenities: ["wifi", "pool", "aire acondicionado", "chef privado", "acceso directo playa"],
    address: "Marina Boulevard, Cap Cana, Punta Cana",
    destinations: { name: "Cap Cana, Punta Cana" }
  },
  {
    id: "villa-coson-paradise",
    name: "Villa Cosón Beachfront Sanctuary",
    slug: "villa-coson-paradise",
    short_description: "Villa tropical moderna rodeada de palmeras frente a las olas cristalinas de Playa Cosón con terraza panorámica.",
    image_url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=80",
    price_per_night: 310,
    rating: 4.92,
    guests: 8,
    bedrooms: 4,
    is_superhost: true,
    is_sponsored: false,
    is_featured: true,
    property_type: "Villa de Playa",
    amenities: ["wifi", "pool", "cocina gourmet", "barbacoa", "seguridad 24h"],
    address: "Playa Cosón, Las Terrenas, Samaná",
    destinations: { name: "Las Terrenas, Samaná" }
  },
  {
    id: "cabarete-kite-penthouse",
    name: "Kite Penthouse Vista al Océano",
    slug: "cabarete-kite-penthouse",
    short_description: "Penthouse de dos niveles frente a la bahía de kitesurf con jacuzzi privado en la azotea y vistas inigualables del atardecer.",
    image_url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80",
    price_per_night: 185,
    rating: 4.88,
    guests: 6,
    bedrooms: 3,
    is_superhost: true,
    is_sponsored: false,
    is_featured: false,
    property_type: "Penthouse de Playa",
    amenities: ["wifi", "pool", "jacuzzi privado", "aire acondicionado", "estación de kite"],
    address: "Kite Beach, Cabarete, Puerto Plata",
    destinations: { name: "Cabarete, Puerto Plata" }
  },

  // Categoria: Lofts y Apartamentos Coloniales / Ciudad
  {
    id: "loft-historico-conde",
    name: "Loft Histórico Colonial con Patio",
    slug: "loft-historico-conde",
    short_description: "Elegante loft de techos altos y arcos de ladrillo colonial del siglo XVI completamente climatizado con patio privado y jacuzzi.",
    image_url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
    price_per_night: 95,
    rating: 4.89,
    guests: 3,
    bedrooms: 1,
    is_superhost: true,
    is_sponsored: false,
    is_featured: true,
    property_type: "Loft Colonial",
    amenities: ["wifi", "aire acondicionado", "jacuzzi", "cocina equipada", "patio privado"],
    address: "Calle El Conde esq. Hostos, Zona Colonial, Santo Domingo",
    destinations: { name: "Santo Domingo (Zona Colonial)" }
  },
  {
    id: "studio-moderno-piantini",
    name: "Studio de Diseño en Torre Piantini",
    slug: "studio-moderno-piantini",
    short_description: "Moderno estudio de lujo en piso alto con piscina infinita en el rooftop, gimnasio de última generación y vistas a la ciudad.",
    image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80",
    price_per_night: 85,
    rating: 4.85,
    guests: 2,
    bedrooms: 1,
    is_superhost: true,
    is_sponsored: false,
    is_featured: false,
    property_type: "Apartamento Urbano",
    amenities: ["wifi", "pool", "gym", "seguridad 24h", "rooftop"],
    address: "Av. Abraham Lincoln, Piantini, Santo Domingo",
    destinations: { name: "Santo Domingo (Piantini)" }
  },
  {
    id: "penthouse-malecon-sd",
    name: "Penthouse Vista Panorámica al Mar",
    slug: "penthouse-malecon-sd",
    short_description: "Impresionante apartamento frente al mar Caribe sobre la Avenida George Washington con balconada corrida y brisa marina constante.",
    image_url: "https://images.unsplash.com/photo-1502005229762-ee1b2da97ba5?w=800&auto=format&fit=crop&q=80",
    price_per_night: 130,
    rating: 4.82,
    guests: 4,
    bedrooms: 2,
    is_superhost: false,
    is_sponsored: false,
    is_featured: false,
    property_type: "Penthouse Urbano",
    amenities: ["wifi", "aire acondicionado", "parqueo techado", "vista al mar"],
    address: "Av. George Washington, Malecón, Santo Domingo",
    destinations: { name: "Santo Domingo (Malecón)" }
  },

  // Categoria: Cabañas de Montaña y Chalets
  {
    id: "cabana-panoramica-pinos",
    name: "Cabaña Panorámica Los Pinos",
    slug: "cabana-panoramica-pinos",
    short_description: "Encantadora cabaña alpina de madera y piedra con chimenea de leña, fogata exterior y vistas infinitas a los valles de Jarabacoa.",
    image_url: "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800&auto=format&fit=crop&q=80",
    price_per_night: 110,
    rating: 4.93,
    guests: 6,
    bedrooms: 3,
    is_superhost: true,
    is_sponsored: false,
    is_featured: true,
    property_type: "Cabaña de Montaña",
    amenities: ["wifi", "chimenea", "barbacoa", "fogata", "senderos privados"],
    address: "Pinar Quemado, Jarabacoa, La Vega",
    destinations: { name: "Jarabacoa, La Vega" }
  },
  {
    id: "eco-chalet-valle-nuevo",
    name: "Eco-Chalet Entre Nubes Constanza",
    slug: "eco-chalet-valle-nuevo",
    short_description: "Refugio de montaña a más de 1,800 metros sobre el nivel del mar, clima templado de montaña, fogata y observación astronómica.",
    image_url: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=80",
    price_per_night: 125,
    rating: 4.87,
    guests: 5,
    bedrooms: 2,
    is_superhost: true,
    is_sponsored: false,
    is_featured: false,
    property_type: "Chalet de Montaña",
    amenities: ["wifi", "chimenea", "calefacción", "jardines orgánicos", "mirador"],
    address: "Carretera Valle Nuevo, Constanza, La Vega",
    destinations: { name: "Constanza, La Vega" }
  },
  {
    id: "villa-bosque-nublado",
    name: "Villa Bosque de Niebla & Jacuzzi",
    slug: "villa-bosque-nublado",
    short_description: "Villa rústica de lujo en la montaña con jacuzzi climatizado con hidromasaje, rodeada de pinares y arroyos de agua pura.",
    image_url: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&auto=format&fit=crop&q=80",
    price_per_night: 160,
    rating: 4.91,
    guests: 8,
    bedrooms: 3,
    is_superhost: true,
    is_sponsored: false,
    is_featured: false,
    property_type: "Cabaña de Montaña",
    amenities: ["wifi", "jacuzzi climatizado", "chimenea", "terraza con asador"],
    address: "Paso Bajito, Jarabacoa, La Vega",
    destinations: { name: "Jarabacoa, La Vega" }
  }
];
