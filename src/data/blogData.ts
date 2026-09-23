export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: "experiencias" | "noticias" | "prensa" | "invitados";
  categoryLabel: string;
  tags: string[];
  imageUrl: string;
  publishedAt: string;
  readTime: string;
  author: {
    name: string;
    role: string;
    avatar: string;
    verified: boolean;
    company?: string;
  };
  isFeatured?: boolean;
  pressReleaseDetails?: {
    partnerName: string;
    contactEmail: string;
    officialSourceUrl?: string;
  };
}

export const blogPosts: BlogPost[] = [
  // 1. Experiencias y Recomendaciones
  {
    id: "b1",
    slug: "ruta-secreta-playas-virgenes-samana",
    title: "Ruta de Playas Vírgenes en Samaná: De Rincón a Playa Frontón",
    excerpt: "Una travesía inolvidable por los rincones costeros más salvajes y espectaculares de la península de Samaná.",
    content: "La península de Samaná resguarda algunos de los paisajes litorales más imponentes del Caribe. Desde las aguas cristalinas de Playa Rincón hasta las imponentes paredes de roca caliza de Playa Frontón, accesible únicamente en bote o sendero de montaña...",
    category: "experiencias",
    categoryLabel: "Blog de Experiencias",
    tags: ["Samaná", "Playas", "Ecoturismo", "Aventura"],
    imageUrl: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80",
    publishedAt: "2026-09-18",
    readTime: "5 min",
    isFeatured: true,
    author: {
      name: "Laura Vásquez",
      role: "Travel Blogger & Fotógrafa",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      verified: true
    }
  },
  {
    id: "b2",
    slug: "guia-gastronomica-santo-domingo-alta-cocina",
    title: "Guía Gastronómica de Santo Domingo: Nueva Cocina Dominicana",
    excerpt: "Descubre cómo los chefs dominicanos están reinterpretando el sancocho, el chivo liniero y el coco en propuestas de vanguardia.",
    content: "Santo Domingo ha sido nombrada en múltiples ocasiones como Capital Gastronómica del Caribe. En los últimos años, una nueva camada de chefs ha elevado ingredientes ancestrales taínos y africanos a la alta cocina internacional...",
    category: "experiencias",
    categoryLabel: "Blog de Experiencias",
    tags: ["Gastronomía", "Santo Domingo", "Gourmet"],
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
    publishedAt: "2026-09-12",
    readTime: "6 min",
    author: {
      name: "Chef Carlos Mota",
      role: "Crítico Culinario",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      verified: true
    }
  },

  // 2. Noticias del Sector
  {
    id: "b3",
    slug: "record-historico-llegada-turistas-2026",
    title: "República Dominicana Rompe Récord Histórico de Turistas en el Primer Semestre 2026",
    excerpt: "El Ministerio de Turismo informa un crecimiento interanual del 14% en llegadas aéreas y cruceristas, consolidando el liderazgo regional.",
    content: "El ministro de Turismo anunció cifras sin precedentes durante la última rueda de prensa mensual. La diversificación de polos como Miches, Pedernales y Puerto Plata ha impulsado el flujo de visitantes extranjeros procedentes de Norteamérica, Europa y Suramérica...",
    category: "noticias",
    categoryLabel: "Noticias del Sector",
    tags: ["Estadísticas", "Turismo RD", "MITUR", "Crecimiento"],
    imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop&q=80",
    publishedAt: "2026-09-20",
    readTime: "4 min",
    author: {
      name: "Redacción Económica & Turismo",
      role: "Prensa Especializada",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      verified: true
    }
  },
  {
    id: "b4",
    slug: "inauguracion-nueva-terminal-aeropuerto-punta-cana",
    title: "Inauguran Nueva Terminal B Sostenible en el Aeropuerto Internacional de Punta Cana",
    excerpt: "Con tecnología biométrica de última generación y operación 100% con energía solar, la nueva terminal eleva la capacidad a 12 millones de pasajeros anuales.",
    content: "Grupo Puntacana dejó inaugurada la expansión de su Terminal B, incorporando sistemas de auto-despacho de equipaje, reconocimiento facial para control de pasaportes y una arquitectura bioclimática que reduce en un 35% el consumo energético...",
    category: "noticias",
    categoryLabel: "Noticias del Sector",
    tags: ["Aviación", "Punta Cana", "Sostenibilidad", "Infraestructura"],
    imageUrl: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=800&auto=format&fit=crop&q=80",
    publishedAt: "2026-09-15",
    readTime: "3 min",
    author: {
      name: "Prensa Aeroportuaria",
      role: "Corresponsal Nacional",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      verified: true
    }
  },

  // 3. Notas de Prensa de Aliados (PR / Relaciones Públicas)
  {
    id: "b5",
    slug: "alianza-cadena-hotelera-pop-turismo-sostenible",
    title: "Playa Dorada Resort & Spa Anuncia Certificación Carbono Neutral en Puerto Plata",
    excerpt: "COMUNICADO OFICIAL: La cadena hotelera líder en la Costa Norte alcanza el estándar internacional de cero emisiones netas en todas sus propiedades.",
    content: "Puerto Plata, R.D. — En consonancia con las políticas nacionales de turismo regenerativo, Playa Dorada Resort & Spa se enorgullece en anunciar que ha obtenido la certificación oficial Carbon Neutral 2026. A través de la eliminación total de plásticos de un solo uso, reforestación de cuencas fluviales y alianzas con pescadores locales...",
    category: "prensa",
    categoryLabel: "Notas de Prensa de Aliados",
    tags: ["Relaciones Públicas", "Puerto Plata", "Hotelería", "Comunicado"],
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
    publishedAt: "2026-09-19",
    readTime: "3 min",
    author: {
      name: "Dpto. de Comunicaciones",
      role: "Playa Dorada Hospitality Group",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      verified: true,
      company: "Playa Dorada Hospitality Group"
    },
    pressReleaseDetails: {
      partnerName: "Playa Dorada Hospitality Group",
      contactEmail: "prensa@playadorada-resort.com",
      officialSourceUrl: "https://playadorada-resort.com/noticias/carbon-neutral"
    }
  },
  {
    id: "b6",
    slug: "lanzamiento-ruta-vuelos-directos-madrid-samana",
    title: "Aerolínea Aliada Lanza Ruta Directa Madrid – El Catey (Samaná) para Temporada de Ballenas",
    excerpt: "COMUNICADO: Dos frecuencias semanales conectarán directamente la capital española con el polo ecoturístico de Samaná a partir de noviembre.",
    content: "Madrid / Santo Domingo — En un esfuerzo conjunto de promoción internacional, la aerolínea aliada confirmó la apertura de la ruta directa Madrid (MAD) – Samaná El Catey (AZS), facilitando el arribo de más de 18,000 turistas europeos durante la temporada de avistamiento de ballenas jorobadas...",
    category: "prensa",
    categoryLabel: "Notas de Prensa de Aliados",
    tags: ["Aerolíneas", "Vuelos Directos", "Samaná", "Comunicado PR"],
    imageUrl: "https://images.unsplash.com/photo-1508873696983-2df5293cb32b?w=800&auto=format&fit=crop&q=80",
    publishedAt: "2026-09-14",
    readTime: "4 min",
    author: {
      name: "Gabinete de Prensa",
      role: "Iberia / Air Partner Alliance",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
      verified: true,
      company: "Iberia Alliance"
    },
    pressReleaseDetails: {
      partnerName: "Air Partner Alliance",
      contactEmail: "comunicaciones@aeropartner.com"
    }
  },

  // 4. Blog de Invitados (Guest Authors)
  {
    id: "b7",
    slug: "mi-primera-vez-haciendo-senderismo-pico-duarte",
    title: "3 Días en el Techo del Caribe: Mi Primera Travesía al Pico Duarte",
    excerpt: "Crónica vivencial de un excursionista aficionado conquistando los 3,087 metros sobre el nivel del mar entre pinares, fogatas y mulas.",
    content: "Subir al Pico Duarte no es solo una caminata exigente de montaña; es una experiencia casi mística en el corazón de la Cordillera Central dominicana. Iniciando desde La Ciénaga de Manabao en Jarabacoa...",
    category: "invitados",
    categoryLabel: "Blog de Invitados",
    tags: ["Pico Duarte", "Senderismo", "Jarabacoa", "Autor Invitado"],
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80",
    publishedAt: "2026-09-17",
    readTime: "8 min",
    author: {
      name: "Marcos De los Santos",
      role: "Autor Invitado / Mochilero",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      verified: false
    }
  },
  {
    id: "b8",
    slug: "fotografiando-cascadas-ocultas-montegordito",
    title: "En Busca de los Charcos Olvidados de Jamao al Norte",
    excerpt: "Guía fotográfica para exploradores independientes que buscan cañones turquesas y saltos de agua sin aglomeraciones.",
    content: "Escondidos en los espesos bosques húmedos entre Espaillat y Puerto Plata se encuentran los cañones de Jamao al Norte. Equipado con mi cámara acuática y botas de vadeo, me adentré río arriba...",
    category: "invitados",
    categoryLabel: "Blog de Invitados",
    tags: ["Ríos", "Fotografía", "Jamao al Norte", "Autor Invitado"],
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
    publishedAt: "2026-09-10",
    readTime: "5 min",
    author: {
      name: "Andrea Bencosme",
      role: "Autora Invitada / Fotógrafa Naturalista",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      verified: true
    }
  }
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(p => p.slug === slug || p.id === slug);
}
