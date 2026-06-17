import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Clock, Star, MapPin, Shield, Calendar, Users, Heart, Share2, 
  ArrowLeft, Check, Compass, Sparkles, MessageSquare, Tag, AlertCircle 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FavoriteButton } from "@/components/FavoriteButton";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

interface StaticActivity {
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
}

const staticActivities: Record<string, StaticActivity> = {
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
    galeria: [whaleSamana, samana, relaxBeach, diving]
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
    galeria: [adventure, samana, heroBeach, relaxBeach]
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
    ubicacion: "Marina Cap Cana, Punta Cana",
    dificultad: "Fácil",
    recomendaciones: [
      "Llevar traje de baño, toalla, protector solar y sombrero.",
      "Estar preparado para un ambiente de fiesta y entretenimiento animado.",
      "Cámara a prueba de agua para selfies en la piscina natural."
    ],
    incluye: [
      "Traslados en bus climatizado desde el hotel",
      "Almuerzo ligero servido a bordo",
      "Bar abierto con cócteles premium y bebidas nacionales",
      "Equipo de snorkel y chalecos salvavidas"
    ],
    galeria: [heroBeach, relaxBeach, diving, samana]
  },
  "zipline": {
    nombre: "Circuito de Tirolesas en Anamuya",
    categoria: "Aventura",
    imagen: adventure,
    rating: 4.6,
    duracion: "2 horas",
    precio: 75,
    descripcion: "Vuela por encima de las copas de los árboles en el primer circuito de tirolesas de la República Dominicana. Con 12 cables de alta velocidad suspendidos sobre el exuberante valle de Anamuya, sentirás la adrenalina pura con vistas aéreas increíbles.",
    ubicacion: "Valle de Anamuya, Punta Cana",
    dificultad: "Moderado",
    recomendaciones: [
      "Ropa deportiva cómoda y calzado deportivo cerrado obligatorio.",
      "Tener el cabello largo recogido.",
      "No apto para personas con vértigo severo o problemas cardíacos."
    ],
    incluye: [
      "Equipo de seguridad homologado internacionalmente (arnés, casco, poleas)",
      "Instrucción detallada por guías de aventura capacitados",
      "Acceso ilimitado a todas las líneas del circuito",
      "Agua fría al finalizar el recorrido"
    ],
    galeria: [adventure, samana, diving, relaxBeach]
  },
  "colonial-tour": {
    nombre: "Tour Histórico por la Zona Colonial",
    categoria: "Cultura",
    imagen: santoDomingo,
    rating: 4.9,
    duracion: "3 horas",
    precio: 35,
    descripcion: "Viaja en el tiempo y camina por donde comenzó la historia del Nuevo Mundo. Visitaremos el Alcázar de Colón, la Catedral Primada de América y la icónica Fortaleza Ozama, descubriendo los secretos arquitectónicos y coloniales de Santo Domingo.",
    ubicacion: "Zona Colonial, Santo Domingo",
    dificultad: "Fácil",
    recomendaciones: [
      "Zapatos cómodos para caminar en calles empedradas históricas.",
      "Vestimenta respetuosa para ingresar a templos religiosos.",
      "Botella de agua recargable y paraguas o sombrero para el sol."
    ],
    incluye: [
      "Guía historiador oficial bilingüe",
      "Boletos de entrada a todos los museos y monumentos del itinerario",
      "Sistema de audio individual para escuchar al guía sin ruidos",
      "Degustación de chocolate o café artesanal local"
    ],
    galeria: [santoDomingo, gastronomy, hotelEdenRoc, samana]
  },
  "merengue-class": {
    nombre: "Clase de Merengue y Bachata",
    categoria: "Cultura",
    imagen: relaxBeach,
    rating: 4.8,
    duracion: "2 horas",
    precio: 25,
    descripcion: "Siente el ritmo y aprende los pasos básicos de los bailes nacionales de República Dominicana: el merengue y la bachata. De la mano de bailarines profesionales locales, dominarás los movimientos de cadera esenciales en un ambiente divertido y relajado.",
    ubicacion: "Zona Colonial, Santo Domingo",
    dificultad: "Fácil",
    recomendaciones: [
      "Ropa y zapatos cómodos que permitan el libre movimiento.",
      "Muchas ganas de divertirse y bailar sin timidez.",
      "Cámara para grabar tus propios pasos al final."
    ],
    incluye: [
      "Instructor de baile profesional dedicado",
      "Alquiler del salón de baile climatizado con espejos",
      "Cóctel tropical de bienvenida (Cuba Libre o Santo Libre)",
      "Certificado simbólico de 'Bailador Dominicano'"
    ],
    galeria: [relaxBeach, gastronomy, santoDomingo, hotelEdenRoc]
  },
  "food-tour": {
    nombre: "Ruta Gastronómica Criolla",
    categoria: "Gastronomía",
    imagen: gastronomy,
    rating: 4.7,
    duracion: "4 horas",
    precio: 65,
    descripcion: "Un festín culinario por los sabores tradicionales dominicanos. Haremos paradas en comedores históricos, colmados y restaurantes modernos para degustar el icónico mangú, mofongo, chicharrón, empanadas y dulces típicos locales.",
    ubicacion: "Santo Domingo Centro",
    dificultad: "Fácil",
    recomendaciones: [
      "Venir con el estómago vacío.",
      "Informar al guía sobre alergias alimentarias previas.",
      "Llevar ropa holgada."
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

export function ActividadDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [numPeople, setNumPeople] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [isBooked, setIsBooked] = useState(false);

  // Load static activity data
  const staticActivity = staticActivities[slug || ""];

  // Fetch activity from DB if it's dynamic
  const { data: dbActivity, isLoading: loadingDb } = useQuery({
    queryKey: ["db-activity", slug],
    queryFn: async () => {
      if (!slug || staticActivity) return null;
      // If it's a UUID we check by ID, otherwise by slug
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
      let query = supabase.from("experiences").select("*");
      if (isUUID) {
        query = query.eq("id", slug);
      } else {
        query = query.eq("slug", slug);
      }
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug && !staticActivity,
  });

  const isLoading = !staticActivity && loadingDb;

  useEffect(() => {
    if (isLoading) return;
    if (!staticActivity && !dbActivity) return;
    
    const startTime = Date.now();
    
    // Track page view in analytics (optional, non-blocking)
    import("@/hooks/useAnalytics").then(({ trackEvent }) => {
      const activityId = slug || (dbActivity?.id || "unknown");
      const activityName = staticActivity?.nombre || (dbActivity?.name || "unknown");
      trackEvent("activity_view", { activity_id: activityId, activity_name: activityName });
    }).catch(() => {/* analytics optional */});

    return () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      if (timeSpent >= 120) {
        import("@/hooks/useAnalytics").then(({ trackEvent }) => {
          trackEvent("activity_read", { slug, time_spent: timeSpent });
        }).catch(() => {/* analytics optional */});
      }
    };
  }, [isLoading, staticActivity, dbActivity, slug]);

  // Render Loader
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <p className="text-muted-foreground text-sm">Cargando detalles de actividad...</p>
        </div>
      </div>
    );
  }

  // Activity not found
  if (!staticActivity && !dbActivity) {
    return (
      <PageTransition>
        <Header />
        <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Actividad No Encontrada</h1>
          <p className="text-muted-foreground mb-6 max-w-md">Lo sentimos, la actividad que estás buscando no existe en nuestro catálogo o ha sido desactivada temporalmente.</p>
          <Link to="/actividades">
            <Button>Ver Catálogo de Actividades</Button>
          </Link>
        </div>
        <Footer />
      </PageTransition>
    );
  }

  // Format activity object uniformly
  const activity = staticActivity ? {
    id: slug || "",
    nombre: staticActivity.nombre,
    categoria: staticActivity.categoria,
    imagen: staticActivity.imagen,
    rating: staticActivity.rating,
    duracion: staticActivity.duracion,
    precio: staticActivity.precio,
    descripcion: staticActivity.descripcion,
    ubicacion: staticActivity.ubicacion,
    dificultad: staticActivity.dificultad,
    recomendaciones: staticActivity.recomendaciones,
    incluye: staticActivity.incluye,
    galeria: staticActivity.galeria,
    isStatic: true
  } : {
    id: dbActivity!.id,
    nombre: dbActivity!.name,
    categoria: dbActivity!.category || "Aventura",
    imagen: dbActivity!.image_url || "/placeholder.svg",
    rating: dbActivity!.rating || 4.5,
    duracion: dbActivity!.duration || "3 horas",
    precio: typeof dbActivity!.price_range === 'number' ? dbActivity!.price_range : parseFloat((dbActivity!.price_range || "45").replace(/[^0-9.]/g, "")) || 45,
    descripcion: dbActivity!.description || "Una fantástica actividad turística en República Dominicana.",
    ubicacion: (dbActivity as any)?.location || dbActivity!.destination_id || "República Dominicana",
    dificultad: dbActivity!.difficulty || "Moderado",
    recomendaciones: [
      "Llevar protector solar amigable con el arrecife.",
      "Mantenerse hidratado durante el trayecto.",
      "Seguir las instrucciones del guía en todo momento."
    ],
    incluye: [
      "Guía turístico local certificado",
      "Equipo de seguridad obligatorio",
      "Paseo con entradas incluidas"
    ],
    galeria: [dbActivity!.image_url || "/placeholder.svg"],
    isStatic: false
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      toast({
        title: "Selecciona una fecha",
        description: "Por favor, selecciona el día en que deseas realizar esta actividad.",
        variant: "destructive",
      });
      return;
    }
    setIsBooked(true);
    toast({
      title: "Reserva Simulada Exitosamente",
      description: `¡Tu actividad "${activity.nombre}" para ${numPeople} personas el día ${selectedDate} ha sido registrada!`,
    });
  };

  const totalCost = activity.precio * numPeople;

  return (
    <PageTransition>
      <SEOHead
        title={`${activity.nombre} - Actividades en RD`}
        description={activity.descripcion}
        image={activity.imagen}
      />
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        {/* Hero Section */}
        <section className="relative h-[65vh] flex items-end overflow-hidden">
          <img
            src={activity.imagen}
            alt={activity.nombre}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          
          <div className="relative z-10 container mx-auto px-4 pb-12">
            <Link to="/actividades" className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Actividades
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-3xl">
                <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 uppercase">
                  {activity.categoria}
                </Badge>
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                  {activity.nombre}
                </h1>
                <p className="text-white/80 text-lg md:text-xl font-medium flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                  {activity.ubicacion}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <FavoriteButton
                  id={activity.id}
                  type="tour"
                  name={activity.nombre}
                  image={activity.imagen}
                  location={activity.ubicacion}
                  variant="button"
                  size="lg"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                />
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast({ title: "Enlace copiado", description: "El enlace de la actividad ha sido copiado al portapapeles." });
                  }}
                >
                  <Share2 className="h-4 w-4" /> Compartir
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Left side: Information */}
            <div className="lg:col-span-2 space-y-12">
              
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-card border border-border rounded-2xl">
                <div className="text-center p-2 border-r border-border last:border-0 md:border-r">
                  <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground uppercase">Duración</p>
                  <p className="font-semibold text-foreground text-sm">{activity.duracion}</p>
                </div>
                <div className="text-center p-2 border-r border-border last:border-0 md:border-r">
                  <Star className="h-6 w-6 text-yellow-400 fill-yellow-400 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground uppercase">Valoración</p>
                  <p className="font-semibold text-foreground text-sm">{activity.rating} / 5.0</p>
                </div>
                <div className="text-center p-2 border-r border-border last:border-0 md:border-r">
                  <Compass className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground uppercase">Dificultad</p>
                  <p className="font-semibold text-foreground text-sm">{activity.dificultad}</p>
                </div>
                <div className="text-center p-2">
                  <Tag className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground uppercase">Precio Desde</p>
                  <p className="font-bold text-primary text-sm">${activity.precio} USD</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> Sobre la Actividad
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {activity.descripcion}
                </p>
              </div>

              {/* Gallery */}
              {activity.galeria.length > 0 && (
                <div className="space-y-4">
                  <h2 className="font-display text-2xl font-bold text-foreground">Galería de Imágenes</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {activity.galeria.map((imgSrc, i) => (
                      <motion.div 
                        key={i} 
                        className={`rounded-2xl overflow-hidden shadow border border-border aspect-video ${
                          i === 0 ? "col-span-2 row-span-1 md:col-span-2 md:row-span-1" : ""
                        }`}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                      >
                        <img 
                          src={imgSrc} 
                          alt={`${activity.nombre} - ${i}`} 
                          className="w-full h-full object-cover" 
                          loading="lazy" 
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations and Inclusions */}
              <div className="grid md:grid-cols-2 gap-8">
                
                {/* What's included */}
                <div className="space-y-4 p-6 bg-card border border-border rounded-2xl">
                  <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                    <Check className="h-5 w-5 text-emerald-500" /> ¿Qué Incluye?
                  </h3>
                  <ul className="space-y-3">
                    {activity.incluye.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-muted-foreground text-sm">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="space-y-4 p-6 bg-card border border-border rounded-2xl">
                  <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" /> Recomendaciones
                  </h3>
                  <ul className="space-y-3">
                    {activity.recomendaciones.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-muted-foreground text-sm">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>

            {/* Right side: Booking Form & Widget */}
            <div className="space-y-6">
              <Card className="border-border sticky top-24 shadow-xl">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <span className="text-3xl font-bold text-primary">${activity.precio}</span>
                    <span className="text-muted-foreground text-sm font-normal"> / persona</span>
                  </div>

                  {isBooked ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-6 rounded-2xl text-center space-y-3">
                      <Check className="h-10 w-10 mx-auto bg-emerald-500 text-white rounded-full p-2" />
                      <h3 className="font-display font-bold text-lg">Reserva Confirmada</h3>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">¡Tu lugar ha sido apartado con éxito! Se ha enviado el comprobante a tu correo de explorador.</p>
                      <Button className="w-full mt-4" variant="outline" onClick={() => setIsBooked(false)}>Reservar de nuevo</Button>
                    </div>
                  ) : (
                    <form onSubmit={handleBooking} className="space-y-4">
                      
                      {/* Date Picker */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" /> Selecciona la Fecha
                        </label>
                        <input 
                          type="date"
                          id="activity-date"
                          title="Fecha de la actividad"
                          aria-label="Selecciona la fecha de la actividad"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          required
                        />
                      </div>

                      {/* Number of people */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" /> Número de Personas
                        </label>
                        <div className="flex items-center justify-between border border-border rounded-lg p-1 bg-background">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            disabled={numPeople <= 1}
                            onClick={() => setNumPeople(numPeople - 1)}
                            className="h-8 w-8 rounded-md"
                          >
                            -
                          </Button>
                          <span className="font-semibold text-sm text-foreground">{numPeople}</span>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            disabled={numPeople >= 20}
                            onClick={() => setNumPeople(numPeople + 1)}
                            className="h-8 w-8 rounded-md"
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      <hr className="border-border my-4" />

                      {/* Cost Summary */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>${activity.precio} x {numPeople} persona(s)</span>
                          <span>${totalCost} USD</span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-foreground pt-1">
                          <span>Costo Total</span>
                          <span>${totalCost} USD</span>
                        </div>
                      </div>

                      {/* Submit */}
                      <Button type="submit" size="lg" className="w-full font-semibold">
                        Confirmar y Reservar
                      </Button>
                    </form>
                  )}

                  <div className="text-center">
                    <p className="text-[11px] text-muted-foreground">Procesado de forma segura. Cancela gratis hasta 24 horas antes.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Small Tip Box */}
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex gap-3">
                <Compass className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">Tip del Explorador</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Completar esta actividad te otorga **+35 XP** en tu Pasaporte Digital y suma puntos para subir de nivel.</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}

export default ActividadDetalle;
