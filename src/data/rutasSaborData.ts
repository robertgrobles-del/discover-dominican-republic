import { 
  Coffee, Flame, Leaf, Wine, Sparkles, LucideIcon 
} from "lucide-react";

export interface ParadaClave {
  nombre: string;
  ubicacion: string;
  descripcion: string;
  destacado: string;
  imagen: string;
}

export interface TourSensorial {
  nombre: string;
  duracion: string;
  precio: string;
  rating: number;
  incluye: string[];
}

export interface MaridajeSensorial {
  protagonista: string;
  acompaniamiento: string;
  notaCata: string;
}

export interface RutaSensorial {
  id: string;
  name: string;
  badge: string;
  icon: LucideIcon;
  heroImage: string;
  description: string;
  tagline: string;
  provinces: string[];
  duration: string;
  bestSeason: string;
  paradasClave: ParadaClave[];
  tours: TourSensorial[];
  maridaje: MaridajeSensorial[];
}

export const RUTAS_SABOR_DATA: Record<string, RutaSensorial> = {
  cafe: {
    id: "cafe",
    name: "Ruta del Café de Altura",
    badge: "AROMA DE MONTAÑA",
    icon: Coffee,
    heroImage: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600&auto=format&fit=crop&q=80",
    tagline: "De las cumbres nubladas de la Cordillera Central a la taza más aromática del Caribe.",
    description: "Recorre las plantaciones de café arábica de sombra cultivadas entre 600 y 1,800 metros sobre el nivel del mar en Jarabacoa, Constanza y Polo Barahona. Aprende el proceso de despulpado, secado al sol y tostado artesanal.",
    provinces: ["La Vega (Jarabacoa y Constanza)", "Barahona (Polo)", "San Cristóbal (Los Cacaos)"],
    duration: "Circuito de 2 a 3 días",
    bestSeason: "Octubre a Marzo (Época de cosecha)",
    paradasClave: [
      {
        nombre: "Café Monte Alto & Rancho Baiguate",
        ubicacion: "Jarabacoa, La Vega",
        descripcion: "Finca modelo con cultivo orgánico bajo sombra de pino criollo, fábrica procesadora histórica y cata de perfiles de tueste.",
        destacado: "Cata de microlotes con acidez cítrica y notas a chocolate amargo",
        imagen: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Cafetales de Altura de Constanza",
        ubicacion: "Valle de Constanza (1,200m+)",
        descripcion: "Cultivo de variedades Bourbon y Catuaí en las temperaturas más frescas del país. Microclima único que retarda la maduración del grano concentrando azúcares.",
        destacado: "Vistas panorámicas de la Suiza del Caribe y maridaje con fresas frescas",
        imagen: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Fincas Orgánicas de Polo Barahona",
        ubicacion: "Sierra de Bahoruco, Polo",
        descripcion: "El secreto mejor guardado del sur profundo. Café con denominación de origen y festival anual 'Café Orgánico Fest'.",
        destacado: "Cuerpo robusto, baja acidez y notas terrosas con nuez moscada",
        imagen: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&auto=format&fit=crop&q=80"
      }
    ],
    tours: [
      {
        nombre: "Inmersión Cafetalera Jarabacoa",
        duracion: "4 Horas",
        precio: "$45 USD",
        rating: 4.9,
        incluye: ["Recorrido guiado por cafetal", "Taller de recolección y despulpado", "Cata barista profesional", "Almuerzo típico campesino"]
      },
      {
        nombre: "Expedición Cordillera Gourmet",
        duracion: "Día Completo (8h)",
        precio: "$95 USD",
        rating: 5.0,
        incluye: ["Transporte 4x4 de montaña", "Visita a 3 fincas exclusivas", "Taller de métodos de extracción (V60, Chemex, Greca)", "Bolsa de 1lb de café de origen"]
      }
    ],
    maridaje: [
      {
        protagonista: "Café Espresso Arábica Typica",
        acompaniamiento: "Dulce de Leche Cortada de Baní",
        notaCata: "La acidez frutal del café equilibra la untuosidad y dulzor acaramelado del postre criollo."
      },
      {
        protagonista: "Café Filtrado Chemex (Valle Nuevo)",
        acompaniamiento: "Arepa Dominicana de Maíz y Coco",
        notaCata: "Las notas a nuez y maíz tostado se complementan armoniosamente con las notas florales del café."
      }
    ]
  },
  cacao: {
    id: "cacao",
    name: "Ruta del Cacao y Chocolate Orgánico",
    badge: "ORO NEGRO DOMINICANO",
    icon: Leaf,
    heroImage: "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=1600&auto=format&fit=crop&q=80",
    tagline: "RD es el exportador #1 mundial de cacao fino de aroma y orgánico.",
    description: "Adéntrate en los senderos de San Francisco de Macorís, Monte Plata y El Seibo para descubrir cómo las mazorcas de cacao Hispaniola y Sánchez se convierten en los chocolates más premiados del planeta.",
    provinces: ["Duarte (San Francisco de Macorís)", "Monte Plata", "El Seibo", "Hato Mayor"],
    duration: "Excursión de 1 a 2 días",
    bestSeason: "Todo el año (Pico de cosecha en Mayo-Julio)",
    paradasClave: [
      {
        nombre: "Sendero del Cacao (Hacienda La Esmeralda)",
        ubicacion: "San Francisco de Macorís, Prov. Duarte",
        descripcion: "El tour de cacao más famoso del país. Experiencia sensorial completa donde injertas tu propia planta, abres mazorcas frescas y degustas licor de cacao.",
        destacado: "Taller para fabricar tu propia tableta de chocolate personalizada",
        imagen: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=800&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Chocal (Chocolateras Artesanales de Altamira)",
        ubicacion: "Puerto Plata (Cordillera Septentrional)",
        descripcion: "Cooperativa ejemplar liderada por mujeres de la comunidad que producen chocolate artesanal, vinos de cacao y cosméticos naturales.",
        destacado: "Bombones rellenos de frutas tropicales (chinola, jengibre y coco)",
        imagen: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Ruta del Cacao Orgánico El Seibo",
        ubicacion: "Miches y El Seibo",
        descripcion: "Plantaciones agroforestales sostenibles certificadas Rainforest Alliance que protegen cuencas hidrográficas y fauna endémica.",
        destacado: "Degustación de 'Bolo' de cacao tradicional disuelto en leche de coco",
        imagen: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800&auto=format&fit=crop&q=80"
      }
    ],
    tours: [
      {
        nombre: "Sendero del Cacao Clásico",
        duracion: "3.5 Horas",
        precio: "$40 USD",
        rating: 4.9,
        incluye: ["Paseo guiado por el bosque cacaotero", "Cata de chocolate 60%, 70% y 85%", "Almuerzo típico cibaeño", "Muestra de manteca de cacao"]
      },
      {
        nombre: "Taller Maestro Chocolatero",
        duracion: "5 Horas",
        precio: "$70 USD",
        rating: 4.8,
        incluye: ["Clase magistral de temperado", "Elaboración de trufas con ron dominicano", "Kit de chocolatería artesanal"]
      }
    ],
    maridaje: [
      {
        protagonista: "Chocolate Oscuro 75% Hispaniola",
        acompaniamiento: "Ron Extra Viejo Dominicano",
        notaCata: "Las notas de madera, vainilla y roble del ron realzan la intensidad amarga y frutal del cacao criollo."
      },
      {
        protagonista: "Trufa de Cacao y Chinola",
        acompaniamiento: "Cerveza Artesanal Presidente Helada",
        notaCata: "El contraste crujiente y refrescante que limpia el paladar entre mordiscos."
      }
    ]
  },
  tabaco: {
    id: "tabaco",
    name: "Ruta del Tabaco y Cigarros Premium",
    badge: "CAPITAL MUNDIAL DEL CIGARRO",
    icon: Flame,
    heroImage: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=1600&auto=format&fit=crop&q=80",
    tagline: "El Valle del Cibao: cuna de los mejores maestros torcedores del mundo.",
    description: "Santiago de los Caballeros y Tamboril concentran las fábricas de cigarros hechos a mano más prestigiosas. Conoce el arte del añejamiento de hojas, el torcido artesanal y las casas legendarias.",
    provinces: ["Santiago de los Caballeros", "Tamboril", "Villa González", "La Vega"],
    duration: "1 a 2 días",
    bestSeason: "Noviembre a Abril (Festivales y cosecha)",
    paradasClave: [
      {
        nombre: "La Aurora Cigar Factory (1903)",
        ubicacion: "Tamboril, Santiago",
        descripcion: "La fábrica de cigarros más antigua del país. Museo interactivo, salas de añejamiento en cedro y demostración en vivo de maestros tabaqueros.",
        destacado: "Cata guiada de capas Connecticut, Cameroon y Corojo",
        imagen: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Tabacalera Arturo Fuente & Chateau de la Fuente",
        ubicacion: "Santiago / Bonao",
        descripcion: "Creadores del legendario Fuente Fuente OpusX. Un templo del lujo tabaquero y la perfección en fermentación de hojas de capa 100% dominicanas.",
        destacado: "Historia viva del legado familiar y reserva privada de tabacos añejos",
        imagen: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Tamboril: Capital Mundial del Cigarro",
        ubicacion: "Tamboril, Santiago",
        descripcion: "Pueblo pintoresco donde más de 50 boutiques artesanales elaboran puros en vitrinas a pie de calle con técnicas transmitidas por generaciones.",
        destacado: "Monumental Parque del Cigarro y tiendas boutique libres de impuestos",
        imagen: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&auto=format&fit=crop&q=80"
      }
    ],
    tours: [
      {
        nombre: "Tour Histórico La Aurora",
        duracion: "2 Horas",
        precio: "$35 USD",
        rating: 4.9,
        incluye: ["Recorrido de planta activa", "Acceso al Museo del Tabaco", "Cigarro de cortesía", "Degustación de ron premium"]
      },
      {
        nombre: "Ruta VIP del Valle del Cibao",
        duracion: "Día Completo",
        precio: "$110 USD",
        rating: 5.0,
        incluye: ["Visita a 3 factorías boutique", "Taller de torcido propio", "Almuerzo en Camp David con vistas a Santiago", "Caja conmemorativa"]
      }
    ],
    maridaje: [
      {
        protagonista: "Cigarro Fortaleza Media (Capa Habana)",
        acompaniamiento: "Ron Barceló Imperial / Brugal 1888",
        notaCata: "Armonía suprema entre las notas de cuero y cedro con la dulzura de frutos secos y roble tostado."
      },
      {
        protagonista: "Cigarro Robusto Maduro",
        acompaniamiento: "Café Espresso Cortado sin azúcar",
        notaCata: "Intensidad tostada que resalta los aceites esenciales de la hoja madurada."
      }
    ]
  },
  ron: {
    id: "ron",
    name: "Ruta del Ron Dominicano",
    badge: "DESTILADOS DE PURA CAÑA",
    icon: Wine,
    heroImage: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1600&auto=format&fit=crop&q=80",
    tagline: "El ron más suave y aromático del mundo, añejado bajo el sol del Caribe.",
    description: "Desde los extensos cañaverales del Este hasta las centenarias bodegas de añejamiento en barricas de roble blanco americano en San Pedro de Macorís y Puerto Plata.",
    provinces: ["San Pedro de Macorís", "Puerto Plata", "Santo Domingo"],
    duration: "1 día",
    bestSeason: "Todo el año",
    paradasClave: [
      {
        nombre: "Centro Histórico Ron Barceló",
        ubicacion: "San Pedro de Macorís",
        descripcion: "Bodega modelo donde se añejan millones de litros en barricas de bourbon. Aprende sobre la destilación directa del jugo de caña puro.",
        destacado: "Cata en barrica de rones de 10 a 30 años de solera",
        imagen: "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=800&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Casa Brugal & Centro de Visitantes",
        ubicacion: "Puerto Plata",
        descripcion: "La marca que lleva el ADN dominicano por todo el orbe desde 1888. Descubre el arte del doble añejamiento en barricas de jerez español.",
        destacado: "Taller interactivo de coctelería tropical y degustación de reservas maestras",
        imagen: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80"
      }
    ],
    tours: [
      {
        nombre: "Experiencia Sensorial Barceló",
        duracion: "2.5 Horas",
        precio: "$30 USD",
        rating: 4.8,
        incluye: ["Tour por bodegas históricas", "Cata de 4 rones añejos", "Guía sumiller certificado"]
      }
    ],
    maridaje: [
      {
        protagonista: "Ron Extra Añejo en las Rocas",
        acompaniamiento: "Queso Geo de Imbert y Casabe Tostado",
        notaCata: "La salinidad y textura crocante del casabe crea un contraste sublime con el roble caramelizado."
      }
    ]
  },
  costera: {
    id: "costera",
    name: "Ruta del Coco y Mariscos de Samaná",
    badge: "COCINA DE COSTA Y PALMERAS",
    icon: Sparkles,
    heroImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80",
    tagline: "El auténtico pescado al coco, cangrejos frescos y la herencia cocolo-afroantillana.",
    description: "Samaná y Miches ofrecen la gastronomía costera más exquisita de la isla. Pescado fresco frito con tostones crujientes, salsa de leche de coco recién exprimida y pan de batata con jengibre.",
    provinces: ["Samaná (Las Terrenas, Las Galeras)", "El Seibo (Miches)", "Nagua"],
    duration: "Circuito de fin de semana (2-3 días)",
    bestSeason: "Enero a Abril (Coincide con avistamiento de ballenas)",
    paradasClave: [
      {
        nombre: "Ruta del Coco en Las Terrenas",
        ubicacion: "Península de Samaná",
        descripcion: "Visitas a palmerales costeros y cocinas tradicionales donde se extrae leche y aceite de coco virgen de forma artesanal.",
        destacado: "Degustación de Chillo al Coco con moro de guandules y tostones",
        imagen: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Parada del Pescado en Nagua",
        ubicacion: "María Trinidad Sánchez",
        descripcion: "Muelle pesquero matutino y restaurantes a la orilla del mar con mariscos y pescados capturados en la madrugada.",
        destacado: "Langosta a la parrilla y lambí a la vinagreta criolla",
        imagen: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop&q=80"
      }
    ],
    tours: [
      {
        nombre: "Safari Culinario Samaná y Coco",
        duracion: "6 Horas",
        precio: "$65 USD",
        rating: 4.9,
        incluye: ["Taller de extracción de leche de coco", "Almuerzo frente a la playa", "Visita a Salto El Limón con jugo tropical"]
      }
    ],
    maridaje: [
      {
        protagonista: "Chillo Fresco al Coco",
        acompaniamiento: "Jugo Natural de Chinola o Piña Colada Fresca",
        notaCata: "La cremosidad de la salsa de coco resalta con la acidez refrescante de la fruta de la pasión caribeña."
      }
    ]
  }
};
