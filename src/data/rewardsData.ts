export interface CatalogReward {
  id: string;
  name: string;
  description: string;
  sponsor: string;
  location: string;
  category: "all" | "resort" | "adventure" | "gastronomy" | "product" | "vip";
  coin_cost: number;
  original_coin_cost?: number;
  estimated_value_dop: number;
  estimated_value_usd: number;
  prize_type: "experience" | "product" | "discount";
  min_level: number;
  quantity_available: number;
  quantity_redeemed: number;
  is_featured: boolean;
  image_url: string;
  validity_days: number;
  includes: string[];
  isPartnerCustom?: boolean;
}

export interface RedeemedVoucher {
  id: string;
  code: string;
  prizeName: string;
  sponsor: string;
  location: string;
  category: string;
  redeemedDate: string;
  expiryDate: string;
  status: "active" | "used" | "expired";
  qrData: string;
  instructions: string;
}

export const initialRewards: CatalogReward[] = [
  {
    id: "p1",
    name: "Pase de 1 Día Todo Incluido en Resort Playa Dorada",
    description: "Acceso VIP a playas privadas, buffet ilimitado de almuerzo y snacks, open bar de coctelería nacional y uso de instalaciones acuáticas.",
    sponsor: "Grand Paradise Resort Puerto Plata",
    location: "Puerto Plata",
    category: "resort",
    coin_cost: 350,
    original_coin_cost: 420,
    estimated_value_dop: 5200,
    estimated_value_usd: 85,
    prize_type: "experience",
    min_level: 2,
    quantity_available: 25,
    quantity_redeemed: 11,
    is_featured: true,
    image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
    validity_days: 90,
    includes: ["Almuerzo buffet internacional", "Bebidas y coctelería nacional ilimitada", "Toallas y camastros de playa", "Piscinas y kayaks"]
  },
  {
    id: "p2",
    name: "Cata Guiada de Ron Dominicano Imperial & Cigarros",
    description: "Experiencia sensorial exclusiva para 2 personas en cava colonial con sommelier y maestro tabaquero certificado.",
    sponsor: "Cava Colonial & Tabaco RD",
    location: "Zona Colonial, Santo Domingo",
    category: "gastronomy",
    coin_cost: 220,
    estimated_value_dop: 3800,
    estimated_value_usd: 62,
    prize_type: "experience",
    min_level: 1,
    quantity_available: 35,
    quantity_redeemed: 14,
    is_featured: true,
    image_url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop&q=80",
    validity_days: 60,
    includes: ["Degustación de 4 rones añejos y extra-añejos", "Maridaje con chocolate orgánico", "Cigarro artesanal premium", "Guía sommelier"]
  },
  {
    id: "p3",
    name: "Excursión en Catamarán a Cayo Arena con Snorkel",
    description: "Navegación en lancha rápida por los manglares de Montecristi hacia el atolón coralino de Cayo Arena con equipo de buceo superficial y almuerzo típico.",
    sponsor: "Quisqueya EcoTours",
    location: "Punta Rucia / Montecristi",
    category: "adventure",
    coin_cost: 400,
    original_coin_cost: 480,
    estimated_value_dop: 6500,
    estimated_value_usd: 105,
    prize_type: "experience",
    min_level: 3,
    quantity_available: 15,
    quantity_redeemed: 6,
    is_featured: true,
    image_url: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80",
    validity_days: 120,
    includes: ["Transporte marítimo ida y vuelta", "Chalecos y caretas de snorkel", "Frutas frescas y bebidas en el cayo", "Almuerzo de mariscos en la playa"]
  },
  {
    id: "p4",
    name: "Kit de Explorador: Mochila Ecoturística + Termo RD",
    description: "Mochila impermeable de 30L oficial Descubre RD con termo de acero inoxidable grabado en láser y buff multifuncional.",
    sponsor: "Tienda Oficial Descubre RD",
    location: "Envío a todo el país",
    category: "product",
    coin_cost: 180,
    estimated_value_dop: 2900,
    estimated_value_usd: 48,
    prize_type: "product",
    min_level: 1,
    quantity_available: 45,
    quantity_redeemed: 22,
    is_featured: false,
    image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    validity_days: 365,
    includes: ["Mochila técnica impermeable 30L", "Termo doble capa frío/calor 750ml", "Envío postal certificado a domicilio"]
  },
  {
    id: "p5",
    name: "Safari en Buggies por Senderos & Playa Macao",
    description: "Recorrido off-road conduciendo tu propio buggy todoterreno por plantaciones de café, cueva con cenote y parada en Playa Macao.",
    sponsor: "Macao Adventure Tours",
    location: "Bávaro - Punta Cana",
    category: "adventure",
    coin_cost: 260,
    estimated_value_dop: 4200,
    estimated_value_usd: 70,
    prize_type: "experience",
    min_level: 2,
    quantity_available: 30,
    quantity_redeemed: 17,
    is_featured: false,
    image_url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80",
    validity_days: 90,
    includes: ["Buggy biplaza por 2.5 horas", "Casco y gafas de protección", "Baño en cenote indígena", "Degustación de café y cacao"]
  },
  {
    id: "p6",
    name: "Cena Degustación de 4 Tiempos Gastronomía Criolla",
    description: "Menú de autor para 2 personas que reinterpreta los sabores tradicionales del Cibao con ingredientes de origen orgánico.",
    sponsor: "Restaurante Raíces Cibaeñas",
    location: "Santiago de los Caballeros",
    category: "gastronomy",
    coin_cost: 240,
    estimated_value_dop: 3900,
    estimated_value_usd: 65,
    prize_type: "experience",
    min_level: 2,
    quantity_available: 20,
    quantity_redeemed: 9,
    is_featured: false,
    image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
    validity_days: 60,
    includes: ["Menú degustación 4 pasos", "2 copas de vino de bienvenida", "Postre artesanal de majarete brulee", "Mesa preferencial"]
  },
  {
    id: "p7",
    name: "Estadía 2 Días / 1 Noche en Eco-Lodge de Montaña",
    description: "Escapada ecológica en cabaña rústica con vista a los pinares de Jarabacoa, fogata nocturna y desayuno campestre.",
    sponsor: "Jarabacoa Eco-Reserva",
    location: "Jarabacoa, La Vega",
    category: "resort",
    coin_cost: 550,
    original_coin_cost: 650,
    estimated_value_dop: 9200,
    estimated_value_usd: 150,
    prize_type: "experience",
    min_level: 4,
    quantity_available: 8,
    quantity_redeemed: 3,
    is_featured: true,
    image_url: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&auto=format&fit=crop&q=80",
    validity_days: 120,
    includes: ["Alojamiento 1 noche para 2 personas", "Desayuno criollo con mangu y queso frito", "Acceso a senderos privados", "Leña para fogata"]
  },
  {
    id: "p8",
    name: "2 Entradas VIP para la Temporada de Béisbol LIDOM",
    description: "Boletas palco preferencial para ver a los Tigres del Licey, Leones del Escogido o Águilas Cibaeñas.",
    sponsor: "LIDOM Oficial",
    location: "Estadio Quisqueya / Estadio Cibao",
    category: "vip",
    coin_cost: 210,
    estimated_value_dop: 3200,
    estimated_value_usd: 52,
    prize_type: "experience",
    min_level: 2,
    quantity_available: 40,
    quantity_redeemed: 25,
    is_featured: false,
    image_url: "https://images.unsplash.com/photo-1508344928928-7165b67de128?w=800&auto=format&fit=crop&q=80",
    validity_days: 45,
    includes: ["2 Asientos en Palco A o B", "Acceso rápido sin filas en taquilla", "Válido para ronda regular"]
  },
  {
    id: "p9",
    name: "Pasaporte Físico de Colección con Sellos Dorados",
    description: "Libreta de tapa de cuero ecológico repujada en dorado con páginas ilustradas de las 32 provincias y set de calcomanías oficiales.",
    sponsor: "Descubre RD Brand",
    location: "Envío a todo el país",
    category: "product",
    coin_cost: 140,
    estimated_value_dop: 2100,
    estimated_value_usd: 35,
    prize_type: "product",
    min_level: 1,
    quantity_available: 60,
    quantity_redeemed: 38,
    is_featured: false,
    image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
    validity_days: 365,
    includes: ["Pasaporte Físico 64 páginas", "Set de 32 stickers provinciales", "Caja conmemorativa de presentación"]
  }
];

export const mockInitialVouchers: RedeemedVoucher[] = [
  {
    id: "vouch-1",
    code: "RD-POP-882194",
    prizeName: "Pase de 1 Día Todo Incluido en Resort Playa Dorada",
    sponsor: "Grand Paradise Resort Puerto Plata",
    location: "Puerto Plata",
    category: "resort",
    redeemedDate: "18 Sep 2026",
    expiryDate: "18 Dic 2026",
    status: "active",
    qrData: "DESCUBRERD-VOUCHER-POP-882194-ACTIVE",
    instructions: "Presentar este voucher impreso o en tu pantalla junto a tu cédula o pasaporte en la recepción del resort con 48h de reserva previa."
  }
];

export const howItWorksSteps = [
  { 
    icon: "🗺️", 
    title: "1. Explora & Registra", 
    desc: "Visita playas, monumentos, ríos y áreas protegidas en las 32 provincias de RD. Cada visita acreditada suma puntos de experiencia (XP) y monedas." 
  },
  { 
    icon: "⚡", 
    title: "2. Supera Retos & Trivias", 
    desc: "Participa en las misiones temáticas de temporada y en la trivia diaria sobre historia, gastronomía y biodiversidad para multiplicar tus monedas." 
  },
  { 
    icon: "🛍️", 
    title: "3. Descuentos en Tiendas", 
    desc: "A medida que subes de nivel, desbloqueas del 5% al 25% de descuento permanente en el Marketplace y comercios locales asociados." 
  },
  { 
    icon: "🎁", 
    title: "4. Canjea Experiencias Reales", 
    desc: "Cambia tus monedas acumuladas por estancias en hoteles, day passes, catas gastronómicas y artículos oficiales enviados a tu puerta." 
  },
];

export const rewardsFaqs = [
  {
    q: "¿Cómo reciben los turistas su recompensa una vez canjeada?",
    a: "Las experiencias y entradas digitales generan instantáneamente un Voucher con código único y código QR que el viajero muestra en tu recepción. Para los artículos físicos, el sistema coordina el envío postal con la dirección del cliente."
  },
  {
    q: "¿Cómo valida el portal que una empresa es real antes de registrar premios?",
    a: "Realizamos una verificación obligatoria mediante el RNC (Registro Nacional de Contribuyentes ante la DGII) y el Registro Nacional Turístico (RNT) o Licencia de Operación MITUR, asegurando que solo establecimientos formales y seguros ofrezcan recompensas a los turistas."
  },
  {
    q: "¿Tiene algún costo para los hoteles o tour operadores publicar recompensas?",
    a: "No cobramos comisión de publicación. El establecimiento únicamente aporta los cupos o experiencias que desee patrocinar, beneficiándose de promoción turística directa, turistas calificados y reseñas verificadas."
  },
  {
    q: "¿Cómo comprueba un hotel que el voucher del turista es auténtico?",
    a: "El personal del hotel o tour operador puede usar la herramienta de 'Escanear / Validar Voucher' en el portal de aliados para ingresar el código del viajero y marcarlo como redimido en segundos."
  }
];
