export interface PricingPlanItem {
  id: string;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceAnnual: number;
  badge: string;
  popular: boolean;
  features: string[];
  notIncluded: string[];
  ctaText: string;
  ctaVariant: "default" | "outline";
}

export const PRICING_PLANS: PricingPlanItem[] = [
  {
    id: "gratis",
    name: "Ficha Básica",
    tagline: "Presencia esencial en el directorio oficial dominicano",
    priceMonthly: 0,
    priceAnnual: 0,
    badge: "Gratis Para Siempre",
    popular: false,
    features: [
      "Ficha pública en el directorio nacional",
      "Información básica (nombre, dirección y mapa)",
      "Hasta 3 fotografías de baja/media resolución",
      "Horario comercial de atención",
      "Aparición en búsquedas generales del destino",
      "Acceso básico al panel de autogestión",
    ],
    notIncluded: [
      "Botón directo de WhatsApp / Llamada inmediata",
      "Galería HD completa y menús/habitaciones",
      "Sello dorado Verificado MITUR",
      "Protección contra publicidad de competidores en su ficha",
      "Métricas avanzadas de clientes potenciales (leads)",
      "Posicionamiento prioritario en resultados"
    ],
    ctaText: "Reclamar Ficha Gratis",
    ctaVariant: "outline"
  },
  {
    id: "premium",
    name: "Plan Premium",
    tagline: "Captación directa de clientes, leads a WhatsApp y cero competidores",
    priceMonthly: 49,
    priceAnnual: 39,
    badge: "Más Recomendado • Autoservicio",
    popular: true,
    features: [
      "Todo lo incluido en el Plan Básico",
      "Botón directo de WhatsApp y llamada con 1 clic",
      "Galería de fotos y videos HD ilimitada",
      "Catálogo completo de habitaciones / menú / tours",
      "Ficha bilingüe optimizada (Español e Inglés)",
      "Ficha libre de competidores anunciados",
      "Sello 'Verificado MITUR' (sujeto a validación de licencia)",
      "Panel con analítica de leads (llamadas, WhatsApp y clics a ruta)",
      "Publicación de ofertas y promociones especiales"
    ],
    notIncluded: [
      "Posición #1 garantizada en la categoría del destino",
      "Campañas de Banners display en la red oficial",
      "Reportaje editorial dedicado en la Revista Descubre RD"
    ],
    ctaText: "Comenzar Prueba Premium",
    ctaVariant: "default"
  },
  {
    id: "destacado",
    name: "Plan Destacado Exclusivo",
    tagline: "Dominio absoluto del destino turístico con cupos limitados",
    priceMonthly: 189,
    priceAnnual: 149,
    badge: "Exclusivo • Cupos Limitados",
    popular: false,
    features: [
      "Todo lo incluido en el Plan Premium",
      "Posición #1 destacada en el destino y categoría",
      "Etiqueta distintiva dorada 'Establecimiento Destacado'",
      "Rotación en banners oficiales de alta visibilidad (980x120 y Skyscrapers)",
      "Artículo editorial completo en la Revista Descubre RD",
      "Inclusión prioritaria en itinerarios generados por el Chatbot IA",
      "Recepción de solicitudes de cotización grupal (MICE y bodas)",
      "Asesor dedicado de cuenta y soporte prioritario 24/7",
      "Facturación fiscal dominicana con NCF"
    ],
    notIncluded: [],
    ctaText: "Solicitar Cupo Exclusivo",
    ctaVariant: "default"
  }
];
