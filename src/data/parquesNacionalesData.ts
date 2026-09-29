export interface ParqueSendero {
  nombre: string;
  distancia: string;
  dificultad: string;
}

export interface ParqueImagen {
  src: string;
  alt: string;
}

export interface ParqueNacionalData {
  id: string;
  nombre: string;
  ubicacion: string;
  provincia: string;
  dificultad: "Fácil" | "Media" | "Difícil";
  descripcion: string;
  descripcionLarga: string;
  etiquetas: string[];
  precio: string;
  horario: string;
  superficie: string;
  telefono: string;
  email: string;
  website: string;
  coordenadas: { lat: number; lng: number };
  imagenes: ParqueImagen[];
  ecosistemas: string[];
  fauna: string[];
  flora: string[];
  actividades: string[];
  senderos: ParqueSendero[];
  servicios: string[];
  rating: number;
  reviews: number;
}

export const parquesData: Record<string, ParqueNacionalData> = {
  "haitises": {
    id: "haitises",
    nombre: "Parque Nacional Los Haitises",
    ubicacion: "Sabana de la Mar",
    provincia: "Monte Plata / Samaná",
    dificultad: "Media",
    descripcion: "Laberinto de mogotes, manglares y cuevas con arte taíno. Uno de los tesoros naturales más impresionantes del Caribe.",
    descripcionLarga: "Los Haitises, que significa 'tierra montañosa' en taíno, es uno de los parques nacionales más espectaculares del Caribe. Con sus icónicos mogotes (formaciones cársticas que emergen del mar), extensos manglares y cuevas con arte rupestre taíno, este parque ofrece una experiencia única de inmersión en la naturaleza. Es hogar de manatíes, delfines y más de 100 especies de aves, incluyendo el pelícano pardo y la cotorra de La Española.",
    etiquetas: ["Manglares", "Cavernas", "Arte Taíno", "Aves"],
    precio: "RD$150 (más costo de bote)",
    horario: "8:00 AM - 5:00 PM",
    superficie: "1,600 km²",
    telefono: "+1 809-556-7333",
    email: "haitises@medioambiente.gob.do",
    website: "https://ambiente.gob.do/areas-protegidas/los-haitises",
    coordenadas: { lat: 19.0833, lng: -69.5000 },
    imagenes: [
      { src: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop", alt: "Los Haitises - Vista aérea" },
      { src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop", alt: "Mogotes en el mar" },
      { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop", alt: "Cueva con arte taíno" },
      { src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop", alt: "Manglares" },
      { src: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&h=600&fit=crop", alt: "Pelícanos en vuelo" }
    ],
    ecosistemas: ["Bosque húmedo subtropical", "Manglares", "Humedales", "Sistema cárstico"],
    fauna: ["Manatí antillano", "Delfín nariz de botella", "Pelícano pardo", "Cotorra de La Española", "Iguana rinoceronte", "Hutía"],
    flora: ["Mangle rojo", "Mangle blanco", "Ceiba", "Caoba", "Palma real", "Orquídeas endémicas"],
    actividades: ["Paseo en bote", "Kayak", "Observación de aves", "Visita a cuevas", "Fotografía de naturaleza", "Senderismo"],
    senderos: [
      { nombre: "Sendero El Naranjo", distancia: "2.5 km", dificultad: "Fácil" },
      { nombre: "Ruta de las Cuevas", distancia: "4 km", dificultad: "Media" },
      { nombre: "Circuito de Manglares (bote)", distancia: "8 km", dificultad: "Fácil" }
    ],
    servicios: ["Centro de visitantes", "Guías certificados", "Baños", "Área de picnic", "Embarcadero"],
    rating: 4.8,
    reviews: 3421
  },
  "jaragua": {
    id: "jaragua",
    nombre: "Parque Nacional Jaragua",
    ubicacion: "Pedernales",
    provincia: "Pedernales",
    dificultad: "Fácil",
    descripcion: "El parque más grande del Caribe insular con playas vírgenes, flamencos y lagunas costeras.",
    descripcionLarga: "El Parque Nacional Jaragua es el área protegida más grande del Caribe insular, abarcando más de 1,400 km² entre tierra y mar. Protege ecosistemas únicos como los bosques secos, lagunas costeras y playas vírgenes como Bahía de las Águilas, considerada una de las playas más hermosas del mundo. Es refugio de flamencos, iguanas rinoceronte y tortugas marinas que desovan en sus playas.",
    etiquetas: ["Playas vírgenes", "Flamencos", "Iguanas", "Bosque seco"],
    precio: "RD$200",
    horario: "7:00 AM - 6:00 PM",
    superficie: "1,400 km²",
    telefono: "+1 809-524-0101",
    email: "jaragua@medioambiente.gob.do",
    website: "https://ambiente.gob.do/areas-protegidas/jaragua",
    coordenadas: { lat: 17.8333, lng: -71.5000 },
    imagenes: [
      { src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop", alt: "Bahía de las Águilas" },
      { src: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop", alt: "Flamencos en laguna" },
      { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop", alt: "Bosque seco" },
      { src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop", alt: "Iguana rinoceronte" },
      { src: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&h=600&fit=crop", alt: "Atardecer en la playa" }
    ],
    ecosistemas: ["Bosque seco subtropical", "Lagunas costeras", "Arrecifes de coral", "Playas de arena blanca"],
    fauna: ["Flamenco caribeño", "Iguana rinoceronte", "Tortuga carey", "Tortuga tinglar", "Manatí", "Jutía"],
    flora: ["Cactus cardón", "Guayacán", "Palo de leche", "Bayahonda", "Uva de playa"],
    actividades: ["Playa", "Snorkeling", "Observación de aves", "Kayak en lagunas", "Camping", "Fotografía"],
    senderos: [
      { nombre: "Sendero Bahía de las Águilas", distancia: "3 km", dificultad: "Fácil" },
      { nombre: "Ruta Laguna Oviedo", distancia: "5 km", dificultad: "Fácil" },
      { nombre: "Sendero Isla Beata (bote)", distancia: "12 km", dificultad: "Media" }
    ],
    servicios: ["Centro de visitantes", "Guías locales", "Transporte en bote", "Camping autorizado", "Baños ecológicos"],
    rating: 4.9,
    reviews: 2156
  },
  "bermudez": {
    id: "bermudez",
    nombre: "Parque Nacional Armando Bermúdez",
    ubicacion: "Cordillera Central",
    provincia: "Santiago / La Vega / San Juan",
    dificultad: "Difícil",
    descripcion: "Hogar del Pico Duarte (3,098m), la montaña más alta del Caribe. Aventura de alta montaña.",
    descripcionLarga: "El Parque Nacional Armando Bermúdez protege el corazón de la Cordillera Central dominicana, incluyendo el Pico Duarte, la cumbre más alta del Caribe con 3,098 metros. Este parque de alta montaña ofrece bosques de pinos, temperaturas que pueden bajar de 0°C y paisajes alpinos únicos en el Caribe. La ascensión al Pico Duarte es una de las experiencias de montañismo más emblemáticas de la región.",
    etiquetas: ["Pico Duarte", "Alta montaña", "Camping", "Bosque de pinos"],
    precio: "RD$500 (incluye permiso de escalada)",
    horario: "Registro 6:00 AM - 2:00 PM",
    superficie: "766 km²",
    telefono: "+1 809-574-4440",
    email: "bermudez@medioambiente.gob.do",
    website: "https://ambiente.gob.do/areas-protegidas/armando-bermudez",
    coordenadas: { lat: 19.0333, lng: -70.9833 },
    imagenes: [
      { src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop", alt: "Pico Duarte" },
      { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop", alt: "Bosque de pinos" },
      { src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop", alt: "Amanecer en la cumbre" },
      { src: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&h=600&fit=crop", alt: "Valle de Tetero" },
      { src: "https://images.unsplash.com/photo-1432405972618-c6b0c635e16c?w=800&h=600&fit=crop", alt: "Campamento base" }
    ],
    ecosistemas: ["Bosque de pinos", "Bosque nublado", "Páramo de altura", "Nacimientos de ríos"],
    fauna: ["Cotorra de La Española", "Zorzal de La Selle", "Cuervo", "Jutía", "Solenodonte"],
    flora: ["Pino criollo", "Manacla", "Palma de montaña", "Helechos gigantes", "Musgos"],
    actividades: ["Ascensión al Pico Duarte", "Camping", "Senderismo", "Observación de aves", "Fotografía de paisajes"],
    senderos: [
      { nombre: "Ruta La Ciénaga (más popular)", distancia: "23 km", dificultad: "Difícil" },
      { nombre: "Ruta Mata Grande", distancia: "45 km", dificultad: "Muy difícil" },
      { nombre: "Ruta Sabaneta", distancia: "30 km", dificultad: "Difícil" }
    ],
    servicios: ["Centro de registro", "Guías obligatorios", "Mulas de carga", "Refugios de montaña", "Zonas de camping"],
    rating: 4.9,
    reviews: 1876
  },
  "damajagua": {
    id: "damajagua",
    nombre: "Monumento Natural Saltos de la Damajagua",
    ubicacion: "Imbert",
    provincia: "Puerto Plata",
    dificultad: "Media",
    descripcion: "27 cascadas de aguas cristalinas perfectas para saltar, deslizarse y nadar.",
    descripcionLarga: "Los 27 Charcos de Damajagua son un sistema único de cascadas y piscinas naturales formadas por la erosión del río Damajagua sobre roca caliza. Este monumento natural ofrece una aventura acuática donde los visitantes pueden saltar, deslizarse y nadar a través de las cascadas. El recorrido incluye opciones de 7, 12 o 27 saltos según el nivel de aventura deseado.",
    etiquetas: ["Cascadas", "Natación", "Aventura", "Familia"],
    precio: "RD$350 - RD$650 (según cantidad de saltos)",
    horario: "8:30 AM - 3:00 PM",
    superficie: "6 km de río",
    telefono: "+1 809-696-0882",
    email: "info@27charcos.com",
    website: "https://27charcos.com",
    coordenadas: { lat: 19.7000, lng: -70.8333 },
    imagenes: [
      { src: "https://images.unsplash.com/photo-1432405972618-c6b0c635e16c?w=800&h=600&fit=crop", alt: "Salto principal" },
      { src: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&h=600&fit=crop", alt: "Piscina natural" },
      { src: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop", alt: "Cascada" },
      { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop", alt: "Grupo de aventureros" },
      { src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop", alt: "Tobogán natural" }
    ],
    ecosistemas: ["Bosque húmedo", "Río de montaña", "Formaciones cársticas"],
    fauna: ["Cangrejos de río", "Peces endémicos", "Mariposas", "Aves acuáticas"],
    flora: ["Bambú", "Heliconias", "Palmas", "Helechos", "Lianas"],
    actividades: ["Saltos de cascada", "Toboganes naturales", "Natación", "Senderismo", "Fotografía"],
    senderos: [
      { nombre: "Circuito 7 Saltos", distancia: "1.5 km", dificultad: "Fácil" },
      { nombre: "Circuito 12 Saltos", distancia: "2.5 km", dificultad: "Media" },
      { nombre: "Circuito 27 Saltos", distancia: "4 km", dificultad: "Difícil" }
    ],
    servicios: ["Centro de visitantes", "Guías certificados", "Equipos de seguridad", "Casilleros", "Restaurante", "Tienda de souvenirs"],
    rating: 4.8,
    reviews: 4532
  }
};

export const parquesNacionalesData = parquesData;
