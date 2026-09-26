// Importing local assets
import whaleSamana from "@/assets/whale-samana.jpg";
import adventure from "@/assets/adventure.jpg";
import heroBeach from "@/assets/hero-beach.jpg";
import relaxBeach from "@/assets/relax-beach.jpg";
import diving from "@/assets/diving.jpg";
import gastronomy from "@/assets/gastronomy.jpg";
import samana from "@/assets/samana.jpg";
import santoDomingo from "@/assets/santo-domingo.jpg";
import hotelEdenRoc from "@/assets/hotel-eden-roc.jpg";
import puntaCana from "@/assets/punta-cana.jpg";
import puertoPlata from "@/assets/puerto-plata.jpg";

export interface StaticActivity {
  id?: string;
  nombre: string;
  categoria: string;
  imagen: string;
  rating: number;
  duracion: string;
  precio: number;
  descripcion: string;
  ubicacion: string;
  dificultad: "Fácil" | "Moderado" | "Difícil";
  recomendaciones: string[];
  incluye: string[];
  galeria: string[];
  itinerario?: { hora: string; titulo: string; desc: string }[];
}

export const staticActivities: Record<string, StaticActivity> = {
  "whale-watching": {
    nombre: "Avistamiento de Ballenas Jorobadas",
    categoria: "Naturaleza",
    imagen: whaleSamana,
    rating: 4.9,
    duracion: "4 horas",
    precio: 85,
    descripcion: "Sé testigo del majestuoso ritual de las ballenas jorobadas en la Bahía de Samaná. Cada año, de enero a marzo, miles de ballenas migran a estas cálidas aguas caribeñas para aparearse y dar a luz, ofreciendo un espectáculo natural incomparable de saltos y cantos marinos.",
    ubicacion: "Bahía de Samaná",
    dificultad: "Fácil",
    recomendaciones: [
      "Llevar protector solar biodegradable para cuidar el ecosistema.",
      "Llevar pastillas para el mareo si eres sensible al oleaje en mar abierto.",
      "Cámara fotográfica con buen zoom para capturar los saltos.",
      "Ropa cómoda impermeable y cortavientos."
    ],
    incluye: [
      "Guía biólogo marino certificado multilingüe",
      "Transporte en bote motorizado seguro con capitanes calificados",
      "Chaleco salvavidas de alta visibilidad",
      "Refrescos, agua mineral y snacks ligeros",
      "Impuestos de entrada al santuario de mamíferos marinos"
    ],
    galeria: [whaleSamana, samana, relaxBeach, diving],
    itinerario: [
      { hora: "08:30 AM", titulo: "Punto de encuentro", desc: "Reunión en el muelle de Samaná y charla de seguridad con biólogo marino." },
      { hora: "09:15 AM", titulo: "Navegación al santuario", desc: "Zarpe hacia el área protegida de mamíferos marinos en la bahía." },
      { hora: "10:00 AM", titulo: "Avistamiento guiado", desc: "Observación de saltos, aleteos y cantos de madres y ballenatos." },
      { hora: "12:30 PM", titulo: "Retorno y refrigerio", desc: "Regreso al puerto con bebidas típicas y sesión de preguntas." }
    ]
  },
  "salto-limon": {
    nombre: "Senderismo al Salto del Limón",
    categoria: "Aventura",
    imagen: adventure,
    rating: 4.8,
    duracion: "3 horas",
    precio: 45,
    descripcion: "Embárcate en una emocionante caminata o cabalgata a través del frondoso bosque húmedo de Samaná hasta alcanzar el impresionante Salto del Limón, una imponente cascada de 40 metros de altura que se precipita sobre una hermosa piscina natural ideal para nadar y relajarse.",
    ubicacion: "El Limón, Samaná",
    dificultad: "Moderado",
    recomendaciones: [
      "Calzado cerrado con buen agarre que se pueda mojar, o botas de agua en días de lluvia.",
      "Traje de baño puesto, toalla de microfibra ligera y repelente de mosquitos.",
      "Llevar dinero en efectivo para propinas de los guías locales.",
      "Bolsa impermeable para tus pertenencias electrónicas."
    ],
    incluye: [
      "Guía local certificado y experto en la ruta",
      "Caballo entrenado y cuidador personalizado (si seleccionas la opción)",
      "Entrada a la reserva ecológica protegida",
      "Almuerzo buffet criollo tradicional al finalizar la excursión"
    ],
    galeria: [adventure, samana, heroBeach, relaxBeach],
    itinerario: [
      { hora: "09:00 AM", titulo: "Llegada al rancho base", desc: "Asignación de guía, botas de agua y montura de caballo o equipo de caminata." },
      { hora: "09:30 AM", titulo: "Ruta selvática", desc: "Cruce de senderos de cocoteros, palmas reales y arroyos de montaña." },
      { hora: "10:45 AM", titulo: "Llegada y baño en la cascada", desc: "Tiempo libre para nadar en la piscina natural del salto de 40 metros." },
      { hora: "12:00 PM", titulo: "Almuerzo típico", desc: "Regreso al rancho para degustar arroz, habichuelas y pollo al coco." }
    ]
  },
  "cayo-levantado": {
    nombre: "Excursión a Cayo Levantado",
    categoria: "Playa",
    imagen: heroBeach,
    rating: 4.7,
    duracion: "6 horas",
    precio: 65,
    descripcion: "Explora la famosa Isla Bacardí en la Bahía de Samaná. Este pequeño islote cuenta con playas de ensueño de arena blanca y aguas turquesas rodeadas de cocoteros, ideales para desconectar del mundo, saborear un cóctel en piña natural y disfrutar de la brisa marina.",
    ubicacion: "Bahía de Samaná",
    dificultad: "Fácil",
    recomendaciones: [
      "Llevar traje de baño, toalla grande y gafas de sol.",
      "Protección solar alta y sombrero o gorra.",
      "Equipo de snorkel propio si deseas explorar los pequeños arrecifes.",
      "Efectivo si deseas comprar artesanías o piñas coladas en la isla."
    ],
    incluye: [
      "Traslado ida y vuelta en lancha rápida desde el puerto",
      "Almuerzo buffet dominicano frente al mar",
      "Acceso a camastros en el área reservada de la playa pública",
      "Bebida de bienvenida sin alcohol"
    ],
    galeria: [heroBeach, samana, relaxBeach, diving]
  },
  "kayak-manglares": {
    nombre: "Kayak en los Manglares de Los Haitises",
    categoria: "Aventura",
    imagen: diving,
    rating: 4.6,
    duracion: "2 horas",
    precio: 35,
    descripcion: "Navega en kayak de forma silenciosa y ecológica a través de los mágicos laberintos de manglares del Parque Nacional Los Haitises. Aprenderás sobre la biodiversidad de este ecosistema estuario y observarás diversas aves nativas y migratorias en su hábitat.",
    ubicacion: "Parque Nacional Los Haitises",
    dificultad: "Moderado",
    recomendaciones: [
      "Ropa deportiva ligera y zapatillas de agua o sandalias deportivas.",
      "Protección solar y gorra.",
      "Funda impermeable para teléfono o cámara.",
      "Estar preparado para remar de forma constante durante 1.5 horas."
    ],
    incluye: [
      "Alquiler de kayak individual o doble y remos de aluminio",
      "Chaleco salvavidas homologado obligatorio",
      "Guía naturalista certificado bilingüe",
      "Bebidas hidratantes y barras de cereal"
    ],
    galeria: [diving, samana, adventure, heroBeach]
  },
  "snorkel-punta": {
    nombre: "Snorkel en Arrecifes de Bávaro",
    categoria: "Acuático",
    imagen: diving,
    rating: 4.8,
    duracion: "3 horas",
    precio: 55,
    descripcion: "Sumérgete en las cálidas y transparentes aguas de la costa de Punta Cana para explorar sus coloridos arrecifes de coral coralinos poblados de cardúmenes de peces tropicales y una vibrante vida marina. Ideal para principiantes y familias.",
    ubicacion: "Playa Bávaro, Punta Cana",
    dificultad: "Fácil",
    recomendaciones: [
      "Traje de baño puesto, protector solar amigable con los arrecifes.",
      "Saber flotar o sentirse cómodo en el agua profunda con chaleco.",
      "Gafas de sol y toalla."
    ],
    incluye: [
      "Equipo completo de snorkel desinfectado (máscara, tubo, aletas)",
      "Guía y rescatistas certificados a bordo",
      "Paseo en catamarán con música y animación",
      "Bar abierto de bebidas nacionales (ron, cerveza, gaseosas)"
    ],
    galeria: [diving, relaxBeach, hotelEdenRoc, heroBeach]
  },
  "golf-punta": {
    nombre: "Golf en el Campo La Cana",
    categoria: "Golf",
    imagen: hotelEdenRoc,
    rating: 4.9,
    duracion: "4 horas",
    precio: 195,
    descripcion: "Juega al golf en uno de los campos más hermosos del Caribe, diseñado por P.B. Dye. Con 27 hoyos divididos en tres nueves, ofrece 14 hoyos con impresionantes vistas al mar Caribe y desafíos de juego para todos los niveles en un entorno exclusivo.",
    ubicacion: "Punta Cana Resort & Club",
    dificultad: "Difícil",
    recomendaciones: [
      "Cumplir con el código de vestimenta de golf tradicional.",
      "Reservar la hora de salida (tee time) con antelación.",
      "Llevar bolas de repuesto debido a los obstáculos de agua."
    ],
    incluye: [
      "Carrito de golf compartido equipado con GPS",
      "Acceso a las áreas de práctica antes del juego",
      "Servicio de caddy local opcional para lecturas de green",
      "Agua mineral fría ilimitada durante la ronda"
    ],
    galeria: [hotelEdenRoc, puntaCana, relaxBeach, adventure]
  },
  "catamaran": {
    nombre: "Tour Premium en Catamarán",
    categoria: "Playa",
    imagen: heroBeach,
    rating: 4.7,
    duracion: "6 horas",
    precio: 89,
    descripcion: "Disfruta de un día de lujo a bordo de un espacioso catamarán navegando por la costa de Punta Cana. Haremos una parada para hacer snorkel en los arrecifes y luego nos relajaremos en la famosa piscina natural flotando en aguas poco profundas.",
    ubicacion: "Costa de Punta Cana",
    dificultad: "Fácil",
    recomendaciones: [
      "Llevar traje de baño, toalla, gafas de sol y gorra.",
      "Cámara fotográfica sumergible o funda acuática.",
      "Dinero en efectivo para propinas de la tripulación."
    ],
    incluye: [
      "Barra libre nacional ilimitada durante toda la excursión",
      "Snacks caribeños y frutas tropicales frescas",
      "Equipo de snorkel y chalecos salvavidas",
      "Animación a bordo y parada en la piscina natural"
    ],
    galeria: [heroBeach, relaxBeach, samana, diving]
  },
  "zona-colonial-walk": {
    nombre: "Tour Histórico por la Zona Colonial",
    categoria: "Cultura",
    imagen: santoDomingo,
    rating: 4.8,
    duracion: "3 horas",
    precio: 30,
    descripcion: "Viaja en el tiempo recorriendo las primeras calles empedradas de América. Descubre la Catedral Primada, el Alcázar de Colón, la Fortaleza Ozama y las casas solariegas con la guía de historiadores apasionados.",
    ubicacion: "Ciudad Colonial, Santo Domingo",
    dificultad: "Fácil",
    recomendaciones: [
      "Zapatos cómodos para caminar sobre adoquines antiguos.",
      "Ropa fresca que cubra hombros y rodillas para entrar a templos religiosos.",
      "Botella de agua recargable y sombrero para el sol."
    ],
    incluye: [
      "Guía oficial historiador certificado por el Ministerio de Turismo",
      "Entradas a todos los museos y monumentos del itinerario",
      "Degustación de café dominicano y chocolate artesanal",
      "Auriculares individuales para escuchar al guía sin interferencias"
    ],
    galeria: [santoDomingo, gastronomy, hotelEdenRoc, relaxBeach]
  },
  "food-tour": {
    nombre: "Ruta Gastronómica Callejera",
    categoria: "Gastronomía",
    imagen: gastronomy,
    rating: 4.9,
    duracion: "3 horas",
    precio: 50,
    descripcion: "Siente el verdadero sabor criollo explorando los rincones más sabrosos de la capital. Degustarás empanadas de yuca, chicharrón crujiente, mangú con los tres golpes, dulce de coco y café colado en greca tradicional.",
    ubicacion: "Santo Domingo",
    dificultad: "Fácil",
    recomendaciones: [
      "Venir con buen apetito, se probarán más de 7 platos y bocadillos.",
      "Avisar con anticipación en caso de alergias alimentarias.",
      "Ropa fresca e informal."
    ],
    incluye: [
      "Guía gourmet especialista en comida caribeña",
      "Todas las degustaciones de comidas y platos principales incluidos",
      "Bebidas tradicionales (jugos naturales, refresco de uva, cerveza Presidente)",
      "Recetario digital en PDF de los platos degustados"
    ],
    galeria: [gastronomy, santoDomingo, relaxBeach, hotelEdenRoc]
  },
  "malecon-night": {
    nombre: "Tour de Vida Nocturna y Colmadones",
    categoria: "Vida Nocturna",
    imagen: adventure,
    rating: 4.5,
    duracion: "4 horas",
    precio: 45,
    descripcion: "Experimenta la auténtica fiesta dominicana. Visitaremos los famosos 'colmadones' de la ciudad para compartir unas cervezas Presidente bien frías, bailar al son de la bachata en las aceras y finalizar en un club exclusivo frente al mar en el Malecón.",
    ubicacion: "El Malecón, Santo Domingo",
    dificultad: "Fácil",
    recomendaciones: [
      "Vestimenta casual-elegante para entrar a los clubes nocturnos.",
      "Identificación oficial con foto obligatoria (mayor de 18 años).",
      "Mantenerse con el grupo durante el recorrido."
    ],
    incluye: [
      "Transporte ida y vuelta en microbús seguro para el grupo",
      "Entradas preferenciales sin filas en todos los locales",
      "Bebida o trago de cortesía en el club final",
      "Guía animador experto en la vida nocturna de la ciudad"
    ],
    galeria: [adventure, santoDomingo, relaxBeach, hotelEdenRoc]
  },
  "teleferico": {
    nombre: "Teleférico al Monte Isabel de Torres",
    categoria: "Aventura",
    imagen: adventure,
    rating: 4.8,
    duracion: "2 horas",
    precio: 20,
    descripcion: "Sube al único teleférico de todo el Caribe hasta la cima de la montaña Isabel de Torres a 800 metros de altura. En la cumbre, te espera el imponente Cristo Redentor, un hermoso jardín botánico de neblina y las mejores vistas panorámicas de Puerto Plata.",
    ubicacion: "Puerto Plata",
    dificultad: "Fácil",
    recomendaciones: [
      "Llevar un abrigo ligero o suéter, la cima suele ser fresca y nublada.",
      "Zapatos cómodos para caminar por los senderos del jardín botánico.",
      "Visitar temprano en la mañana para evitar las nubes espesas de la tarde."
    ],
    incluye: [
      "Boleto de ida y vuelta en cabina teleférico",
      "Acceso guiado a la cima y al parque nacional",
      "Entrada al jardín botánico Isabel de Torres"
    ],
    galeria: [adventure, puertoPlata, relaxBeach, diving]
  },
  "27-charcos": {
    nombre: "Los 27 Charcos de Damajagua",
    categoria: "Aventura",
    imagen: diving,
    rating: 4.9,
    duracion: "4 horas",
    precio: 55,
    descripcion: "La aventura acuática por excelencia en el norte de la isla. Camina por senderos selváticos y luego deslízate por toboganes naturales de roca y salta a piscinas profundas de agua de manantial cristalino esculpidas por el río Damajagua.",
    ubicacion: "Imbert, Puerto Plata",
    dificultad: "Difícil",
    recomendaciones: [
      "Calzado cerrado tipo tenis que se pueda arruinar o calzado de neopreno con buen agarre.",
      "Saber nadar y tener una condición física moderada.",
      "Llevar traje de baño y licra protectora.",
      "No recomendado para mujeres embarazadas o personas con dolores de espalda."
    ],
    incluye: [
      "Casco de protección y chaleco salvavidas de uso obligatorio",
      "Equipo de guías de río socorristas certificados",
      "Derecho de entrada al parque nacional Damajagua",
      "Almuerzo criollo estilo buffet incluido"
    ],
    galeria: [diving, puertoPlata, adventure, relaxBeach]
  },
  "sosua-dive": {
    nombre: "Buceo de Descubrimiento en Sosúa",
    categoria: "Acuático",
    imagen: diving,
    rating: 4.7,
    duracion: "3 horas",
    precio: 85,
    descripcion: "Aprende a respirar bajo el agua y experimenta el buceo por primera vez en la bahía protegida de Sosúa. Un instructor PADI te enseñará las reglas básicas en aguas poco profundas y luego te guiará en una hermosa inmersión en arrecife.",
    ubicacion: "Playa Sosúa, Puerto Plata",
    dificultad: "Moderado",
    recomendaciones: [
      "No requiere certificación de buceo previa.",
      "No volar en avión en las siguientes 18 horas después del buceo.",
      "Llenar cuestionario médico de aptitud obligatorio antes de la inmersión."
    ],
    incluye: [
      "Clase introductoria de teoría y práctica en aguas poco profundas",
      "1 inmersión en mar abierto a un arrecife coralino (profundidad máx: 10m)",
      "Equipo de buceo completo (regulador, chaleco hidrostático, neopreno, máscara, aletas)",
      "Instructor PADI calificado con ratio 1:2"
    ],
    galeria: [diving, relaxBeach, samana, puertoPlata]
  },
  "ambar-museum": {
    nombre: "Visita al Museo del Ámbar Dominicano",
    categoria: "Cultura",
    imagen: santoDomingo,
    rating: 4.5,
    duracion: "1.5 horas",
    precio: 10,
    descripcion: "Explora la joya científica y cultural del norte en una hermosa mansión victoriana del siglo XIX. Conocerás la historia detrás del ámbar dominicano, famoso por su claridad transparencia e inclusiones fósiles fosilizadas prehistóricas.",
    ubicacion: "Puerto Plata Centro",
    dificultad: "Fácil",
    recomendaciones: [
      "Excelente actividad para días lluviosos.",
      "Visitar la tienda de regalos al final para ver piezas auténticas certificadas.",
      "Se permite tomar fotos sin flash dentro de las exhibiciones."
    ],
    incluye: [
      "Boleto de entrada al museo",
      "Tour guiado interactivo de 45 minutos",
      "Demostración interactiva de pulido e identificación de ámbar falso"
    ],
    galeria: [santoDomingo, puertoPlata, gastronomy, hotelEdenRoc]
  }
};
