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
    telefono: "+1 809-555-0192",
    verificado: true
  },
  {
    id: "artesano-2",
    nombre: "Tejedoras de Caña de El Seibo",
    especialidad: "Cestería y sombreros de caña",
    ubicacion: "El Seibo",
    bio: "Cooperativa de mujeres artesanas que mantiene vivo el arte ancestral del tejido de fibras de caña y palma real. Cada pieza cuenta una historia de resiliencia, trabajo en equipo y tradición familiar.",
    imagen: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80",
    telefono: "+1 809-555-0193",
    verificado: true
  },
  {
    id: "artesano-3",
    nombre: "Tallistas de Madera de Bonao",
    especialidad: "Esculturas en madera y Santos de Palo",
    ubicacion: "Bonao, Monseñor Nouel",
    bio: "Colectivo de tallistas especializados en maderas nobles locales como caoba y guayacán. Famosos por sus tallas de aves endémicas dominicanas y hermosas reproducciones de arte sacro tradicional.",
    imagen: "https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?w=600&auto=format&fit=crop&q=80",
    telefono: "+1 809-555-0194",
    verificado: true
  }
];

// ─── Productos Artesanales ──────────────────────────────────────────
export const productos: Producto[] = [
  {
    id: "larimar-jewelry",
    nombre: "Joyería de Larimar",
    vendedor: "Piedras del Caribe",
    imagen: relaxBeach,
    categoria: "Joyería",
    precio: "Desde US$ 25",
    ubicacion: "Barahona",
    rating: 4.9,
    reviews: 342,
    descripcion: "Piezas únicas de larimar azul dominicano engarzado en plata. Diseños artesanales exclusivos.",
    tags: ["Larimar", "Plata 925", "Hecho a mano"],
    envio: true,
    verificado: true,
  },
  {
    id: "cafe-barahona",
    nombre: "Café Orgánico de Montaña",
    vendedor: "Finca La Aurora",
    imagen: gastronomy,
    categoria: "Gastronomía",
    precio: "US$ 12 - US$ 45",
    ubicacion: "Jarabacoa",
    rating: 4.8,
    reviews: 215,
    descripcion: "Café 100% orgánico cultivado a 1,200 msnm. Tostado artesanal, notas de chocolate y frutas rojas.",
    tags: ["Orgánico", "Tostado artesanal", "Specialty"],
    envio: true,
    verificado: true,
  },
  {
    id: "ron-artesanal",
    nombre: "Ron Premium Dominicano",
    vendedor: "Casa del Ron",
    imagen: laBandera,
    categoria: "Bebidas",
    precio: "US$ 35 - US$ 150",
    ubicacion: "San Pedro de Macorís",
    rating: 4.9,
    reviews: 180,
    descripcion: "Ron añejo premium, envejecido hasta 25 años en barricas de roble americano. Ediciones limitadas.",
    tags: ["Añejo", "Edición limitada", "Premium"],
    envio: true,
    verificado: true,
  },
  {
    id: "cacao-organico",
    nombre: "Cacao Fino de Aroma",
    vendedor: "Chocolat Dominicano",
    imagen: gastronomy,
    categoria: "Gastronomía",
    precio: "US$ 8 - US$ 30",
    ubicacion: "Hato Mayor",
    rating: 4.7,
    reviews: 128,
    descripcion: "Cacao orgánico certificado y tabletas de chocolate artesanal single-origin de República Dominicana.",
    tags: ["Orgánico", "Single Origin", "Fair Trade"],
    envio: true,
    verificado: false,
  },
  {
    id: "pintura-naive",
    nombre: "Pintura Naïf Dominicana",
    vendedor: "Galería Caribe",
    imagen: colonialDoor,
    categoria: "Arte",
    precio: "US$ 50 - US$ 500",
    ubicacion: "Santo Domingo",
    rating: 4.8,
    reviews: 95,
    descripcion: "Cuadros originales de estilo naïf dominicano, pintados en acrílico y óleo por artistas locales.",
    tags: ["Arte original", "Naïf", "Firmado"],
    envio: true,
    verificado: true,
  },
  {
    id: "ambar-dominicano",
    nombre: "Ámbar Dominicano",
    vendedor: "Ámbar del Cibao",
    imagen: relaxBeach,
    categoria: "Joyería",
    precio: "Desde US$ 15",
    ubicacion: "Puerto Plata",
    rating: 4.6,
    reviews: 276,
    descripcion: "Ámbar azul y miel dominicano en anillos, collares y piezas de colección. Certificado de autenticidad.",
    tags: ["Ámbar azul", "Certificado", "Colección"],
    envio: true,
    verificado: true,
  },
  {
    id: "cigarros-premium",
    nombre: "Cigarros Premium Hechos a Mano",
    vendedor: "Tabacalera del Valle",
    imagen: adventureImg,
    categoria: "Tabaco",
    precio: "US$ 8 - US$ 80",
    ubicacion: "Santiago",
    rating: 4.9,
    reviews: 310,
    descripcion: "Cigarros enrollados a mano con tabaco dominicano premium. Cajas y ediciones especiales.",
    tags: ["Premium", "Hecho a mano", "Edición especial"],
    envio: true,
    verificado: true,
  },
  {
    id: "artesania-taino",
    nombre: "Artesanía Taína",
    vendedor: "Raíces Taínas",
    imagen: colonialDoor,
    categoria: "Artesanía",
    precio: "US$ 10 - US$ 120",
    ubicacion: "La Vega",
    rating: 4.5,
    reviews: 88,
    descripcion: "Réplicas de arte taíno en cerámica y piedra: cemíes, duhos y vasijas ceremoniales.",
    tags: ["Taíno", "Cerámica", "Cultural"],
    envio: true,
    verificado: false,
  },
];

// ─── Servicios Turísticos ───────────────────────────────────────────
export const servicios: Servicio[] = [
  {
    id: "tour-samana",
    nombre: "Excursiones en Samaná",
    proveedor: "Samaná Adventures",
    imagen: samanaImg,
    categoria: "Tours",
    precio: "Desde US$ 65",
    ubicacion: "Samaná",
    rating: 4.9,
    reviews: 520,
    descripcion: "Tours de avistamiento de ballenas, excursiones a Cayo Levantado y El Limón waterfall.",
    serviciosList: ["Ballenas", "Cayo Levantado", "Cascada El Limón", "Los Haitises"],
    verificado: true,
    icon: Anchor,
  },
  {
    id: "fotografia-profesional",
    nombre: "Fotografía Profesional de Viajes",
    proveedor: "RD Photo Studio",
    imagen: puntaCana,
    categoria: "Fotografía",
    precio: "Desde US$ 150",
    ubicacion: "Punta Cana",
    rating: 5.0,
    reviews: 185,
    descripcion: "Sesiones fotográficas para parejas, familias y grupos en las mejores locaciones de RD.",
    serviciosList: ["Sesión playa", "Sesión ciudad", "Drone", "Video"],
    verificado: true,
    icon: Camera,
  },
  {
    id: "transfer-aeropuerto",
    nombre: "Transfer Aeropuerto VIP",
    proveedor: "RD Transfers",
    imagen: adventureImg,
    categoria: "Transporte",
    precio: "Desde US$ 35",
    ubicacion: "Todo el país",
    rating: 4.8,
    reviews: 890,
    descripcion: "Servicio de transporte privado desde/hacia todos los aeropuertos. Vehículos premium, WiFi a bordo.",
    serviciosList: ["Aeropuerto", "Excursiones", "Eventos", "24/7"],
    verificado: true,
    icon: Car,
  },
  {
    id: "chef-privado",
    nombre: "Chef Privado a Domicilio",
    proveedor: "Sabores RD",
    imagen: gastronomy,
    categoria: "Gastronomía",
    precio: "Desde US$ 200",
    ubicacion: "Punta Cana / Santo Domingo",
    rating: 4.9,
    reviews: 145,
    descripcion: "Experiencia gastronómica con chef privado en tu villa o hotel. Menú personalizado con productos locales.",
    serviciosList: ["Cena privada", "Clase de cocina", "BBQ playa", "Maridaje"],
    verificado: true,
    icon: UtensilsCrossed,
  },
  {
    id: "guia-cultural",
    nombre: "Guías Culturales Certificados",
    proveedor: "Cultura Viva RD",
    imagen: santoDomingo,
    categoria: "Guías",
    precio: "Desde US$ 50",
    ubicacion: "Santo Domingo",
    rating: 4.7,
    reviews: 330,
    descripcion: "Recorridos culturales por la Zona Colonial, museos e historia dominicana con guías expertos.",
    serviciosList: ["Zona Colonial", "Museos", "Arte urbano", "Nocturno"],
    verificado: true,
    icon: Compass,
  },
  {
    id: "musica-eventos",
    nombre: "Música en Vivo para Eventos",
    proveedor: "Merengue Live",
    imagen: colonialDoor,
    categoria: "Entretenimiento",
    precio: "Desde US$ 300",
    ubicacion: "Nacional",
    rating: 4.8,
    reviews: 110,
    descripcion: "Grupos de merengue, bachata y música típica para bodas, fiestas y eventos corporativos.",
    serviciosList: ["Merengue", "Bachata", "Típico", "DJ"],
    verificado: false,
    icon: Music,
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
