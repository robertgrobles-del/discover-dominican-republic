import { Anchor, Camera, Car, UtensilsCrossed, Compass, Music, type LucideIcon } from "lucide-react";
import gastronomy from "@/assets/gastronomy.jpg";
import adventureImg from "@/assets/adventure.jpg";
import colonialDoor from "@/assets/colonial-door.jpg";
import relaxBeach from "@/assets/relax-beach.jpg";
import samanaImg from "@/assets/samana.jpg";
import puntaCana from "@/assets/punta-cana.jpg";
import santoDomingo from "@/assets/santo-domingo.jpg";
import laBandera from "@/assets/la-bandera.jpg";

export interface Artesano {
  id: string;
  nombre: string;
  especialidad: string;
  ubicacion: string;
  bio: string;
  imagen: string;
  telefono: string;
  verificado: boolean;
}

export interface Producto {
  id: string;
  nombre: string;
  vendedor: string;
  imagen: string;
  categoria: string;
  precio: string;
  ubicacion: string;
  rating: number;
  reviews: number;
  descripcion: string;
  tags: string[];
  envio: boolean;
  verificado: boolean;
}

export interface Servicio {
  id: string;
  nombre: string;
  proveedor: string;
  imagen: string;
  categoria: string;
  precio: string;
  ubicacion: string;
  rating: number;
  reviews: number;
  descripcion: string;
  serviciosList: string[];
  telefono?: string;
  whatsapp?: string;
  verificado: boolean;
  icon: LucideIcon;
}

export interface Negocio {
  id: string;
  nombre: string;
  tipo: string;
  imagen: string;
  ubicacion: string;
  rating: number;
  reviews: number;
  horario: string;
  telefono: string;
  website: string;
  descripcion: string;
  categorias: string[];
  verificado: boolean;
}

// ─── Artesanos Directo ───────────────────────────────────────────────
export const artesanos: Artesano[] = [
  {
    id: "artesano-1",
    nombre: "Taller de Alfarería Higüerito",
    especialidad: "Alfarería tradicional y Muñecas Limé",
    ubicacion: "Moca, Espaillat",
    bio: "Artesanos de tercera generación dedicados a moldear el barro rojo tradicional de Higüerito. Creadores de las famosas muñecas sin rostro (Limé) que representan la identidad y el sincretismo cultural dominicano.",
    imagen: "https://images.unsplash.com/photo-1540552980157-21d2a565c52b?w=600&auto=format&fit=crop&q=80",
    telefono: "+1 809-578-2234",
    verificado: true
  },
  {
    id: "artesano-2",
    nombre: "Cooperativa de Artesanos del Larimar",
    especialidad: "Talla y pulido de Pectolita Azul Larimar en Plata 925",
    ubicacion: "Bahoruco, Barahona",
    bio: "Asociación de artesanos y mineros locales de Los Checheses dedicados a la elaboración de joyería fina y piezas de colección en auténtico Larimar dominicano.",
    imagen: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80",
    telefono: "+1 829-543-9821",
    verificado: true
  },
  {
    id: "artesano-3",
    nombre: "Tallistas de Madera de Bonao",
    especialidad: "Esculturas en madera noble y Santos de Palo",
    ubicacion: "Bonao, Monseñor Nouel",
    bio: "Colectivo de tallistas especializados en maderas nobles locales como caoba y guayacán. Famosos por sus tallas de aves endémicas dominicanas y hermosas reproducciones de arte sacro tradicional.",
    imagen: "https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?w=600&auto=format&fit=crop&q=80",
    telefono: "+1 809-525-6712",
    verificado: true
  }
];

// ─── Productos Artesanales ──────────────────────────────────────────
export const productos: Producto[] = [
  {
    id: "larimar-jewelry",
    nombre: "Dije de Larimar Azul Cielo en Plata 925",
    vendedor: "Cooperativa de Artesanos de Bahoruco",
    imagen: relaxBeach,
    categoria: "Joyería",
    precio: "RD$ 3,450",
    ubicacion: "Barahona",
    rating: 4.9,
    reviews: 342,
    descripcion: "Gema pectolita azul natural extraída de las minas de Barahona y tallada a mano con montura de plata de ley 925 con certificado de origen.",
    tags: ["Larimar", "Plata 925", "Hecho a mano", "Gema Nacional"],
    envio: true,
    verificado: true,
  },
  {
    id: "ambar-dominicano",
    nombre: "Colgante de Ámbar Fósil Dominicano",
    vendedor: "Ámbar del Norte",
    imagen: relaxBeach,
    categoria: "Joyería",
    precio: "RD$ 4,800",
    ubicacion: "Puerto Plata",
    rating: 4.9,
    reviews: 276,
    descripcion: "Auténtico ámbar fósil de la Cordillera Septentrional, pulido artesanalmente en La Cumbre con tonos miel y transparencia única.",
    tags: ["Ámbar fósil", "Certificado MITUR", "Colección"],
    envio: true,
    verificado: true,
  },
  {
    id: "muneca-lime-moca",
    nombre: "Muñeca Limé sin Rostro de Higüerito (25 cm)",
    vendedor: "Artesanos de Moca",
    imagen: colonialDoor,
    categoria: "Artesanía",
    precio: "RD$ 1,650",
    ubicacion: "Moca, Espaillat",
    rating: 4.8,
    reviews: 195,
    descripcion: "Muñeca de barro cocido y esmaltado tradicional con traje criollo y ramo de flores, símbolo cumbre de la identidad mestiza quisqueyana.",
    tags: ["Muñeca Limé", "Barro Rojo", "Artesanía Típica"],
    envio: true,
    verificado: true,
  },
  {
    id: "cafe-jarabacoa",
    nombre: "Café Especialidad de Altura Monte Alto (1 lb Grano)",
    vendedor: "Café Monte Alto",
    imagen: gastronomy,
    categoria: "Gastronomía",
    precio: "RD$ 650",
    ubicacion: "Jarabacoa",
    rating: 4.9,
    reviews: 412,
    descripcion: "Café arábica 100% lavado cosechado a 1,300 msnm bajo sombra de pinos y guamas. Tueste medio con notas achocolatadas y acidez cítrica balanceada.",
    tags: ["Café Dominicano", "Arábica", "Jarabacoa", "Orgánico"],
    envio: true,
    verificado: true,
  },
  {
    id: "cacao-organico-macoris",
    nombre: "Nibs de Cacao Orgánico y Chocolate Artesanal 70%",
    vendedor: "Sendero del Cacao / Conacado",
    imagen: gastronomy,
    categoria: "Gastronomía",
    precio: "RD$ 520",
    ubicacion: "San Francisco de Macorís",
    rating: 4.8,
    reviews: 280,
    descripcion: "Cacao fino de aroma orgánico de la cuenca del Cibao Oriental. Fermentación controlada y tostado suave sin aditivos químicos.",
    tags: ["Cacao Orgánico", "Fair Trade", "Chocolate Criollo"],
    envio: true,
    verificado: true,
  },
  {
    id: "mamajuana-curada",
    nombre: "Mamajuana Tradicional Curada en Botella Típica",
    vendedor: "Raíces Quisqueyanas",
    imagen: laBandera,
    categoria: "Bebidas",
    precio: "RD$ 1,200",
    ubicacion: "Santo Domingo",
    rating: 4.8,
    reviews: 310,
    descripcion: "Mezcla de cortezas, raíces y hierbas medicinales (bejuco indio, anamú, clavo) macerada con ron dominicano, vino tinto y miel pura de abeja.",
    tags: ["Mamajuana", "Tradición", "Bebida Típica"],
    envio: true,
    verificado: true,
  },
];

// ─── Servicios y Operadores Turísticos Locales Verificados ──────────
export const servicios: Servicio[] = [
  {
    id: "surf-kite-cabarete",
    nombre: "Escuela de Surf & Kitesurf Cabarete Pro",
    proveedor: "Cabarete Ocean Sports",
    imagen: adventureImg,
    categoria: "Aventura",
    precio: "Desde US$ 45",
    ubicacion: "Kite Beach, Cabarete, Puerto Plata",
    rating: 4.9,
    reviews: 430,
    descripcion: "Clases certificadas IKO y alquiler de equipos de kitesurf, surf y wing foil con instructores bilingües oficiales en la capital del viento del Caribe.",
    serviciosList: ["Kitesurf", "Surf", "Wing Foil", "Paddleboard"],
    telefono: "+1 809-571-0890",
    whatsapp: "18095710890",
    verificado: true,
    icon: Compass,
  },
  {
    id: "rafting-jarabacoa",
    nombre: "Rafting & Canyoning Río Yaque del Norte",
    proveedor: "Rancho Baiguate Aventuras",
    imagen: adventureImg,
    categoria: "Aventura",
    precio: "Desde US$ 55",
    ubicacion: "Jarabacoa, La Vega",
    rating: 4.9,
    reviews: 620,
    descripcion: "Descenso en balsa por los rápidos clase II y III del río Yaque del Norte, paseos a caballo a la cascada Baiguate y rappel de montaña con guías certificados.",
    serviciosList: ["Rafting", "Canyoning", "Salto Jimenoa", "Senderismo"],
    telefono: "+1 809-574-6890",
    whatsapp: "18095746890",
    verificado: true,
    icon: Compass,
  },
  {
    id: "saona-bayahibe-diving",
    nombre: "Excursión Catamarán Isla Saona & Buceo Arrecifes",
    proveedor: "Bayahíbe Eco-Tours & Diving",
    imagen: samanaImg,
    categoria: "Tours",
    precio: "Desde US$ 65",
    ubicacion: "Puerto de Bayahíbe, La Altagracia",
    rating: 4.9,
    reviews: 840,
    descripcion: "Tours oficiales a Isla Saona, Canto de la Playa y Piscina Natural con estrellas de mar en lanchas rápidas y catamaranes autorizados por el Parque Nacional Cotubanamá.",
    serviciosList: ["Isla Saona", "Buceo Arrecife", "Piscina Natural", "Catamarán"],
    telefono: "+1 809-833-0145",
    whatsapp: "18098330145",
    verificado: true,
    icon: Anchor,
  },
  {
    id: "eco-tours-lasterrenas",
    nombre: "Cascada El Limón a Caballo & Safari Terrenas",
    proveedor: "Las Terrenas Eco-Explorers",
    imagen: samanaImg,
    categoria: "Tours",
    precio: "Desde US$ 50",
    ubicacion: "Las Terrenas, Samaná",
    rating: 4.8,
    reviews: 510,
    descripcion: "Senderismo ecológico hacia el Salto del Limón, avistamiento de ballenas jorobadas en la bahía de Samaná (enero-marzo) y buggy tours por playas vírgenes.",
    serviciosList: ["Salto El Limón", "Ballenas Jorobadas", "Playa Cosón", "Ruta del Café"],
    telefono: "+1 809-240-6211",
    whatsapp: "18092406211",
    verificado: true,
    icon: Anchor,
  },
  {
    id: "guia-cultural-zona-colonial",
    nombre: "Guías Históricos & Arquitectura Colonial Santo Domingo",
    proveedor: "Asociación de Guías Oficiales MITUR",
    imagen: santoDomingo,
    categoria: "Guías",
    precio: "Desde US$ 40",
    ubicacion: "Zona Colonial, Distrito Nacional",
    rating: 5.0,
    reviews: 490,
    descripcion: "Recorridos privados a pie por la Ciudad Primada de América con guías acreditados por el Ministerio de Turismo (Alcázar, Catedral Primada, Calle Las Damas).",
    serviciosList: ["Zona Colonial", "Museos Nacionales", "Ruta Fortaleza Ozama", "Tour Nocturno"],
    telefono: "+1 809-688-8920",
    whatsapp: "18096888920",
    verificado: true,
    icon: Compass,
  },
  {
    id: "transfer-aeropuertos-rd",
    nombre: "Traslados Ejecutivos & Vans Turísticas AILA / PUJ",
    proveedor: "Dominican Airport Transfers VIP",
    imagen: adventureImg,
    categoria: "Transporte",
    precio: "Desde US$ 35",
    ubicacion: "Las Américas (SDQ), Punta Cana (PUJ), Cibao (STI)",
    rating: 4.9,
    reviews: 980,
    descripcion: "Flota moderna con choferes uniformados, aire acondicionado, WiFi y monitoreo de vuelos en tiempo real para todos los polos turísticos del país.",
    serviciosList: ["Aeropuerto SDQ/PUJ", "Vans Grupales", "Servicio VIP", "Asistencia 24/7"],
    telefono: "+1 809-549-0480",
    whatsapp: "18095490480",
    verificado: true,
    icon: Car,
  },
];

// ─── Directorio de Negocios ─────────────────────────────────────────
export const negocios: Negocio[] = [
  {
    id: "casa-larimar",
    nombre: "Casa del Larimar",
    tipo: "Joyería & Museo",
    imagen: colonialDoor,
    ubicacion: "Zona Colonial, Santo Domingo",
    rating: 4.8,
    reviews: 1200,
    horario: "Lun-Sáb 9:00 - 18:00",
    telefono: "+1 809-689-6605",
    website: "casadellarimar.com",
    descripcion: "Museo y tienda de larimar más grande del país. Joyería fina, réplicas arqueológicas y souvenirs premium.",
    categorias: ["Joyería", "Museo", "Souvenirs"],
    verificado: true,
  },
  {
    id: "chocolate-factory",
    nombre: "Choco Museo Santo Domingo",
    tipo: "Fábrica & Tienda",
    imagen: gastronomy,
    ubicacion: "Zona Colonial, Santo Domingo",
    rating: 4.7,
    reviews: 890,
    horario: "Todos los días 10:00 - 20:00",
    telefono: "+1 809-222-3333",
    website: "chocomuseo.com",
    descripcion: "Fábrica de chocolate artesanal con tours, talleres de elaboración y tienda de productos de cacao.",
    categorias: ["Chocolate", "Tours", "Talleres"],
    verificado: true,
  },
  {
    id: "blue-mall",
    nombre: "Blue Mall Punta Cana",
    tipo: "Centro Comercial",
    imagen: puntaCana,
    ubicacion: "Bávaro, Punta Cana",
    rating: 4.5,
    reviews: 2100,
    horario: "Todos los días 10:00 - 22:00",
    telefono: "+1 809-455-1010",
    website: "bluemall.com.do",
    descripcion: "Centro comercial de lujo con tiendas internacionales, restaurantes gourmet y entertainment.",
    categorias: ["Shopping", "Gastronomía", "Entretenimiento"],
    verificado: true,
  },
  {
    id: "mercado-modelo",
    nombre: "Mercado Modelo",
    tipo: "Mercado Tradicional",
    imagen: santoDomingo,
    ubicacion: "Santo Domingo",
    rating: 4.3,
    reviews: 3500,
    horario: "Lun-Sáb 8:00 - 18:00",
    telefono: "+1 809-686-6972",
    website: "",
    descripcion: "El mercado de artesanías más famoso de RD. Pintura, ámbar, larimar, ron, tabaco y souvenirs.",
    categorias: ["Artesanías", "Souvenirs", "Cultura"],
    verificado: true,
  },
  {
    id: "tabacalera-santiago",
    nombre: "Tabacalera La Aurora",
    tipo: "Fábrica & Tienda",
    imagen: adventureImg,
    ubicacion: "Santiago de los Caballeros",
    rating: 4.9,
    reviews: 760,
    horario: "Lun-Vie 9:00 - 17:00",
    telefono: "+1 809-241-1111",
    website: "laaurora.com.do",
    descripcion: "La fábrica de cigarros más antigua del Caribe (1903). Tours guiados, museo del tabaco y tienda.",
    categorias: ["Tabaco", "Tours", "Museo"],
    verificado: true,
  },
  {
    id: "mamey-libreria",
    nombre: "Mamey Librería & Café",
    tipo: "Librería Cultural",
    imagen: colonialDoor,
    ubicacion: "Zona Colonial, Santo Domingo",
    rating: 4.8,
    reviews: 540,
    horario: "Todos los días 9:00 - 21:00",
    telefono: "+1 809-333-4444",
    website: "mameylibreria.com",
    descripcion: "Librería independiente con café artesanal. Libros sobre cultura dominicana, arte y eventos literarios.",
    categorias: ["Libros", "Café", "Cultura"],
    verificado: false,
  },
];

export const categoriasProductos = ["Todos", "Joyería", "Gastronomía", "Bebidas", "Arte", "Artesanía", "Tabaco"];
export const categoriasServicios = ["Todos", "Tours", "Fotografía", "Transporte", "Gastronomía", "Guías", "Entretenimiento"];
export const categoriasNegocios = ["Todos", "Joyería", "Chocolate", "Shopping", "Artesanías", "Tabaco", "Libros"];
