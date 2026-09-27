export interface MarinaService {
  icono: string;
  titulo: string;
  descripcion: string;
}

export interface MarinaAmenity {
  titulo: string;
  descripcion: string;
  imagen: string;
}

export interface MarinaRate {
  concepto: string;
  precio: string;
}

export interface MarinaImage {
  src: string;
  alt: string;
}

export interface MarinaDetailData {
  id: string;
  nombre: string;
  ubicacion: string;
  provincia: string;
  tipo: "Marina" | "Puerto Deportivo" | "Yacht Club";
  descripcion: string;
  descripcionLarga: string;
  atraques: number;
  caladoMax: string;
  canalVHF: string;
  coordenadas: { lat: string; lng: string };
  telefono: string;
  email: string;
  website: string;
  imagenes: MarinaImage[];
  servicios: MarinaService[];
  amenidades: MarinaAmenity[];
  tarifas: MarinaRate[];
  rating: number;
  reviews: number;
}

export const marinasDetalleData: Record<string, MarinaDetailData> = {
  "casa-de-campo": {
    id: "casa-de-campo",
    nombre: "Marina Casa de Campo",
    ubicacion: "La Romana",
    provincia: "La Romana",
    tipo: "Marina",
    descripcion: "Donde el río Chavón se encuentra con el Mar Caribe. El puerto deportivo más completo y prestigioso del Caribe.",
    descripcionLarga: "Inspirada en los pintorescos pueblos costeros del Mediterráneo, pero equipada con todas las comodidades modernas que un navegante podría desear. Marina Casa de Campo ofrece un ambiente vibrante con una arquitectura impresionante. Los capitanes y propietarios encontrarán un puerto seguro y protegido, ideal durante la temporada de huracanes, con acceso directo a un resort de cinco estrellas que incluye campos de golf de renombre mundial, canchas de polo y playas privadas.",
    atraques: 350,
    caladoMax: "12 pies",
    canalVHF: "Ch 16",
    coordenadas: { lat: "18°24'N", lng: "68°54'W" },
    telefono: "+1 809-523-8646",
    email: "marina@casadecampo.com.do",
    website: "https://casadecampo.com.do/marina",
    imagenes: [
      { src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop", alt: "Marina Casa de Campo - Vista aérea" },
      { src: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&h=600&fit=crop", alt: "Yates atracados" },
      { src: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800&h=600&fit=crop", alt: "Paseo marítimo" },
      { src: "https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=800&h=600&fit=crop", alt: "Restaurantes frente al mar" }
    ],
    servicios: [
      { icono: "fuel", titulo: "Combustible Premium", descripcion: "Diesel y Gasolina de alta pureza disponible en muelle de servicio. Sistema de filtrado de alta capacidad." },
      { icono: "badge", titulo: "Migración In-Situ", descripcion: "Oficinas de Migración y Armada Dominicana directamente en la marina para check-in/out rápido." },
      { icono: "electrical", titulo: "Suministros", descripcion: "Electricidad (110/220/480V, 30-200 Amps), agua potable, TV por cable y Wi-Fi en cada amarre." },
      { icono: "security", titulo: "Seguridad 24/7", descripcion: "Circuito cerrado de cámaras, patrullaje constante y control de acceso riguroso." }
    ],
    amenidades: [
      { titulo: "Gastronomía", descripcion: "Más de 6 restaurantes internacionales frente al mar.", imagen: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400" },
      { titulo: "Shopping", descripcion: "Tiendas de diseñador, joyerías y artículos náuticos.", imagen: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400" },
      { titulo: "Yacht Club", descripcion: "Exclusivo club privado para socios y regatas.", imagen: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=400" }
    ],
    tarifas: [
      { concepto: "Amarre diario (hasta 40')", precio: "$2.50/pie" },
      { concepto: "Amarre diario (40'-80')", precio: "$3.00/pie" },
      { concepto: "Amarre mensual", precio: "Consultar" },
      { concepto: "Electricidad", precio: "Según consumo" }
    ],
    rating: 4.9,
    reviews: 342
  },
  "cap-cana": {
    id: "cap-cana",
    nombre: "Marina Cap Cana",
    ubicacion: "Cap Cana",
    provincia: "La Altagracia",
    tipo: "Marina",
    descripcion: "La marina más moderna del Caribe con capacidad para mega yates.",
    descripcionLarga: "Marina Cap Cana es el destino náutico más exclusivo de la región, diseñado para recibir los yates más grandes del mundo. Con un entorno de lujo incomparable, ofrece servicios de primera clase, restaurantes gourmet y acceso directo a campos de golf y playas privadas.",
    atraques: 122,
    caladoMax: "18 pies",
    canalVHF: "Ch 16/68",
    coordenadas: { lat: "18°28'N", lng: "68°24'W" },
    telefono: "+1 809-227-2262",
    email: "marina@capcana.com",
    website: "https://capcana.com/marina",
    imagenes: [
      { src: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&h=600&fit=crop", alt: "Marina Cap Cana" },
      { src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop", alt: "Mega yates" },
      { src: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800&h=600&fit=crop", alt: "Vista nocturna" }
    ],
    servicios: [
      { icono: "fuel", titulo: "Combustible", descripcion: "Diesel de alta calidad con capacidad para mega yates." },
      { icono: "electrical", titulo: "Electricidad", descripcion: "Hasta 480V/400A para embarcaciones de gran tamaño." },
      { icono: "security", titulo: "Seguridad", descripcion: "Vigilancia 24/7 y control de acceso biométrico." }
    ],
    amenidades: [
      { titulo: "Restaurantes", descripcion: "Gastronomía de clase mundial.", imagen: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400" },
      { titulo: "Beach Club", descripcion: "Playa privada exclusiva.", imagen: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" }
    ],
    tarifas: [
      { concepto: "Amarre diario", precio: "$3.50/pie" },
      { concepto: "Mega yates (100'+)", precio: "Consultar" }
    ],
    rating: 4.8,
    reviews: 189
  },
  "ocean-world": {
    id: "ocean-world",
    nombre: "Ocean World Marina",
    ubicacion: "Puerto Plata",
    provincia: "Puerto Plata",
    tipo: "Marina",
    descripcion: "Marina con parque acuático y delfines en la costa norte.",
    descripcionLarga: "Ocean World Marina combina servicios náuticos con un parque de aventuras marinas. Ofrece nado con delfines, leones marinos y tiburones nodriza, además de atraques para embarcaciones de recreo.",
    atraques: 80,
    caladoMax: "10 pies",
    canalVHF: "Ch 16",
    coordenadas: { lat: "19°49'N", lng: "70°42'W" },
    telefono: "+1 809-291-1000",
    email: "marina@oceanworld.net",
    website: "https://oceanworld.net",
    imagenes: [
      { src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop", alt: "Ocean World Marina" },
      { src: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&h=600&fit=crop", alt: "Delfines" }
    ],
    servicios: [
      { icono: "fuel", titulo: "Combustible", descripcion: "Diesel y gasolina disponibles." },
      { icono: "security", titulo: "Seguridad", descripcion: "Vigilancia 24/7." }
    ],
    amenidades: [
      { titulo: "Parque Acuático", descripcion: "Nado con delfines y leones marinos.", imagen: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" }
    ],
    tarifas: [
      { concepto: "Amarre diario", precio: "$1.50/pie" }
    ],
    rating: 4.5,
    reviews: 210
  },
  "marina-zar-par": {
    id: "marina-zar-par",
    nombre: "Marina Zar Par",
    ubicacion: "Santo Domingo",
    provincia: "Distrito Nacional",
    tipo: "Marina",
    descripcion: "Marina urbana en el corazón de Santo Domingo con acceso al Mar Caribe.",
    descripcionLarga: "Marina Zar Par es la principal marina urbana de Santo Domingo, ubicada en la desembocadura del Río Ozama. Ofrece servicios completos para embarcaciones de recreo con fácil acceso al centro histórico de la capital.",
    atraques: 120,
    caladoMax: "8 pies",
    canalVHF: "Ch 16",
    coordenadas: { lat: "18°28'N", lng: "69°53'W" },
    telefono: "+1 809-368-5858",
    email: "info@marinazarpar.com",
    website: "https://marinazarpar.com",
    imagenes: [
      { src: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&h=600&fit=crop", alt: "Marina Zar Par" },
      { src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop", alt: "Vista marina" }
    ],
    servicios: [
      { icono: "fuel", titulo: "Combustible", descripcion: "Diesel disponible en muelle." },
      { icono: "electrical", titulo: "Electricidad y Agua", descripcion: "Conexiones en cada amarre." },
      { icono: "security", titulo: "Seguridad", descripcion: "Circuito cerrado y vigilancia 24/7." }
    ],
    amenidades: [
      { titulo: "Restaurante", descripcion: "Comida frente al mar.", imagen: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400" }
    ],
    tarifas: [
      { concepto: "Amarre diario", precio: "$1.25/pie" },
      { concepto: "Amarre mensual", precio: "Consultar" }
    ],
    rating: 4.3,
    reviews: 156
  },
  "puerto-bahia": {
    id: "puerto-bahia",
    nombre: "Puerto Bahía Marina",
    ubicacion: "Samaná",
    provincia: "Samaná",
    tipo: "Marina",
    descripcion: "Marina moderna en la Bahía de Samaná con servicios premium.",
    descripcionLarga: "Puerto Bahía es la marina más moderna de la Península de Samaná, ofreciendo servicios de clase mundial en una de las bahías más hermosas del Caribe. Ideal para yates que visitan la temporada de ballenas jorobadas.",
    atraques: 110,
    caladoMax: "14 pies",
    canalVHF: "Ch 16/68",
    coordenadas: { lat: "19°12'N", lng: "69°20'W" },
    telefono: "+1 809-538-5555",
    email: "marina@puertobahia.com",
    website: "https://puertobahia.com",
    imagenes: [
      { src: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&h=600&fit=crop", alt: "Puerto Bahía" },
      { src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop", alt: "Bahía de Samaná" }
    ],
    servicios: [
      { icono: "fuel", titulo: "Combustible", descripcion: "Diesel de alta calidad." },
      { icono: "electrical", titulo: "Suministros", descripcion: "Electricidad y agua en cada amarre." },
      { icono: "security", titulo: "Seguridad", descripcion: "Control de acceso y vigilancia." }
    ],
    amenidades: [
      { titulo: "Avistamiento de Ballenas", descripcion: "Tours desde la marina (Ene-Mar).", imagen: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" },
      { titulo: "Restaurantes", descripcion: "Gastronomía local frente al mar.", imagen: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400" }
    ],
    tarifas: [
      { concepto: "Amarre diario", precio: "$2.00/pie" },
      { concepto: "Amarre mensual", precio: "Consultar" }
    ],
    rating: 4.6,
    reviews: 178
  },
  "luperon": {
    id: "luperon",
    nombre: "Marina de Luperón",
    ubicacion: "Luperón, Puerto Plata",
    provincia: "Puerto Plata",
    tipo: "Puerto Deportivo",
    descripcion: "Puerto natural protegido, refugio preferido de navegantes durante temporada de huracanes.",
    descripcionLarga: "La Marina de Luperón es un puerto natural extraordinariamente protegido en la costa norte. Es famoso entre navegantes internacionales como uno de los refugios más seguros del Caribe durante la temporada de huracanes. Su comunidad de liveaboards y cruceristas le da un ambiente cosmopolita único.",
    atraques: 60,
    caladoMax: "10 pies",
    canalVHF: "Ch 16",
    coordenadas: { lat: "19°54'N", lng: "70°57'W" },
    telefono: "+1 809-571-8488",
    email: "info@luperonmarina.com",
    website: "https://luperonmarina.com",
    imagenes: [
      { src: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&h=600&fit=crop", alt: "Marina Luperón" },
      { src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop", alt: "Bahía protegida" }
    ],
    servicios: [
      { icono: "fuel", titulo: "Combustible", descripcion: "Diesel disponible por entrega." },
      { icono: "security", titulo: "Migración", descripcion: "Oficina de aduanas y migración." }
    ],
    amenidades: [
      { titulo: "Comunidad Náutica", descripcion: "Ambiente internacional de navegantes.", imagen: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=400" }
    ],
    tarifas: [
      { concepto: "Fondeo mensual", precio: "$150-300" }
    ],
    rating: 4.2,
    reviews: 120
  }
};
