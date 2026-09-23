import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { DestinationGallery } from "@/components/destination/DestinationGallery";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, Clock, Users, ChevronRight, Calendar, Phone, 
  Mail, Globe, Star, Mountain, AlertTriangle, CheckCircle,
  ArrowLeft, Heart, Share2
} from "lucide-react";
import { motion } from "framer-motion";
import { FavoriteButton } from "@/components/FavoriteButton";

const cuevasData: Record<string, {
  id: string;
  nombre: string;
  ubicacion: string;
  provincia: string;
  dificultad: "Fácil" | "Moderado" | "Difícil";
  descripcion: string;
  descripcionLarga: string;
  nivelFisico: number;
  duracion: string;
  precio: string;
  horario: string;
  capacidad: string;
  telefono: string;
  email: string;
  website: string;
  coordenadas: { lat: number; lng: number };
  imagenes: { src: string; alt: string }[];
  atracciones: string[];
  equipoIncluido: string[];
  recomendaciones: string[];
  restricciones: string[];
  rating: number;
  reviews: number;
}> = {
  "tres-ojos": {
    id: "tres-ojos",
    nombre: "Los Tres Ojos",
    ubicacion: "Parque Mirador del Este",
    provincia: "Santo Domingo Este",
    dificultad: "Fácil",
    descripcion: "Un sistema de tres lagos subterráneos de agua dulce dentro de una caverna de piedra caliza.",
    descripcionLarga: "Los Tres Ojos es un parque natural único que alberga tres lagos de agua dulce en cuevas de piedra caliza formadas hace millones de años. Este sitio arqueológico fue habitado por los taínos y hoy es uno de los destinos más visitados de Santo Domingo. Los tres lagos principales son: Aguas Azufradas, La Nevera y Los Zaramagullones. Un cuarto lago, El Lago de las Mujeres, es accesible mediante un pequeño bote.",
    nivelFisico: 20,
    duracion: "1-2 horas",
    precio: "RD$100 (locales) / RD$200 (extranjeros)",
    horario: "9:00 AM - 5:00 PM",
    capacidad: "50 personas por grupo",
    telefono: "+1 809-788-7056",
    email: "info@tresojos.gob.do",
    website: "https://tresojos.gob.do",
    coordenadas: { lat: 18.4679, lng: -69.8612 },
    imagenes: [
      { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop", alt: "Los Tres Ojos - Vista principal" },
      { src: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&h=600&fit=crop", alt: "Lago subterráneo" },
      { src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop", alt: "Formaciones de estalactitas" },
      { src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop", alt: "Cueva iluminada" },
      { src: "https://images.unsplash.com/photo-1432405972618-c6b0c635e16c?w=800&h=600&fit=crop", alt: "Pasarela de visitantes" }
    ],
    atracciones: ["Lago Aguas Azufradas", "Lago La Nevera", "Lago Los Zaramagullones", "Lago de las Mujeres (acceso en bote)", "Pasarelas panorámicas", "Formaciones de estalactitas y estalagmitas"],
    equipoIncluido: ["Guía turístico certificado", "Entrada al parque", "Paseo en bote al cuarto lago"],
    recomendaciones: ["Usar calzado antideslizante", "Llevar agua", "Protector solar para áreas abiertas", "Cámara fotográfica"],
    restricciones: ["No se permite nadar", "Prohibido tocar las formaciones", "Niños menores de 5 años con supervisión"],
    rating: 4.6,
    reviews: 2847
  },
  "maravillas": {
    id: "maravillas",
    nombre: "Cueva de las Maravillas",
    ubicacion: "Carretera La Romana - San Pedro",
    provincia: "San Pedro de Macorís",
    dificultad: "Moderado",
    descripcion: "Galería de arte taíno subterráneo con más de 500 pictografías y petroglifos.",
    descripcionLarga: "La Cueva de las Maravillas es un museo natural subterráneo que preserva una de las colecciones más importantes de arte rupestre taíno del Caribe. Con más de 500 pictografías y petroglifos, este sitio declarado Patrimonio de la Humanidad ofrece una ventana única a la cultura precolombina. El recorrido guiado de 240 metros incluye sistemas de iluminación modernos que realzan las obras sin dañarlas.",
    nivelFisico: 45,
    duracion: "1.5-2 horas",
    precio: "RD$250 (locales) / RD$500 (extranjeros)",
    horario: "9:00 AM - 5:00 PM (Cerrado los lunes)",
    capacidad: "25 personas por grupo",
    telefono: "+1 809-696-1797",
    email: "info@cuevadelasmaravillas.com",
    website: "https://cuevadelasmaravillas.com",
    coordenadas: { lat: 18.4098, lng: -69.0234 },
    imagenes: [
      { src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop", alt: "Cueva de las Maravillas - Entrada" },
      { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop", alt: "Pictografías taínas" },
      { src: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&h=600&fit=crop", alt: "Iluminación artística" },
      { src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop", alt: "Pasarela interior" },
      { src: "https://images.unsplash.com/photo-1432405972618-c6b0c635e16c?w=800&h=600&fit=crop", alt: "Formaciones geológicas" }
    ],
    atracciones: ["500+ pictografías taínas", "Petroglifos ancestrales", "Formaciones de estalactitas", "Museo interpretativo", "Sendero elevado de 240m", "Sistema de iluminación artística"],
    equipoIncluido: ["Guía especializado en arte rupestre", "Audio guía disponible", "Entrada al museo"],
    recomendaciones: ["Llevar chaqueta ligera (temperatura fresca)", "Cámara sin flash", "Calzado cerrado", "Repelente de insectos"],
    restricciones: ["Prohibido usar flash", "No tocar las paredes", "Grupos máximo 25 personas", "Cerrado los lunes"],
    rating: 4.8,
    reviews: 1523
  },
  "pomier": {
    id: "pomier",
    nombre: "Reserva Antropológica El Pomier",
    ubicacion: "San Cristóbal",
    provincia: "San Cristóbal",
    dificultad: "Difícil",
    descripcion: "La capital prehistórica del Caribe con más de 50 cuevas y 6,000 grabados rupestres.",
    descripcionLarga: "El Pomier es el sistema de cuevas con arte rupestre más importante del Caribe, declarado Patrimonio de la Humanidad por la UNESCO. Con 55 cuevas documentadas y más de 6,000 grabados y pinturas rupestres, representa el legado más completo de la cultura taína. El sitio requiere buena condición física ya que incluye escalada moderada y terreno irregular.",
    nivelFisico: 85,
    duracion: "3-4 horas",
    precio: "RD$500 (incluye guía obligatorio)",
    horario: "8:00 AM - 4:00 PM",
    capacidad: "15 personas por grupo",
    telefono: "+1 809-528-0000",
    email: "reservas@pomier.gob.do",
    website: "https://medioambiente.gob.do",
    coordenadas: { lat: 18.4167, lng: -70.1000 },
    imagenes: [
      { src: "https://images.unsplash.com/photo-519681393784-d120267933ba?w=800&h=600&fit=crop", alt: "El Pomier - Sistema de cuevas" },
      { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop", alt: "Arte rupestre taíno" },
      { src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop", alt: "Interior de cueva" },
      { src: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&h=600&fit=crop", alt: "Grabados ancestrales" },
      { src: "https://images.unsplash.com/photo-1432405972618-c6b0c635e16c?w=800&h=600&fit=crop", alt: "Exploración guiada" }
    ],
    atracciones: ["55 cuevas documentadas", "6,000+ grabados rupestres", "Pinturas ceremoniales taínas", "Formaciones geológicas únicas", "Murciélagos endémicos", "Senderos de exploración"],
    equipoIncluido: ["Guía certificado obligatorio", "Casco con linterna", "Botiquín de emergencia"],
    recomendaciones: ["Excelente condición física requerida", "Ropa de secado rápido", "Botas de senderismo", "Agua (mínimo 2L)", "Snacks energéticos"],
    restricciones: ["Menores de 12 años no recomendado", "Personas con claustrofobia", "Condiciones cardíacas", "Reservación obligatoria 48h antes"],
    rating: 4.9,
    reviews: 456
  },
  "fun-fun": {
    id: "fun-fun",
    nombre: "Cueva Fun Fun",
    ubicacion: "Rancho Capote",
    provincia: "Hato Mayor",
    dificultad: "Difícil",
    descripcion: "Aventura extrema con rappel, río subterráneo y formaciones de estalactitas.",
    descripcionLarga: "La Cueva Fun Fun es una de las experiencias de aventura más emocionantes del Caribe. El recorrido comienza con un descenso en rappel de 18 metros hacia las entrañas de la tierra, seguido de una caminata por un río subterráneo y la exploración de impresionantes formaciones de estalactitas y estalagmitas. El nombre 'Fun Fun' proviene del sonido que hacen los murciélagos al volar.",
    nivelFisico: 90,
    duracion: "4-5 horas",
    precio: "USD $95 - $120 (tour completo)",
    horario: "8:00 AM - 2:00 PM",
    capacidad: "12 personas por grupo",
    telefono: "+1 809-553-2818",
    email: "info@ranchocapote.com",
    website: "https://ranchocapote.com",
    coordenadas: { lat: 18.7667, lng: -69.2500 },
    imagenes: [
      { src: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&h=600&fit=crop", alt: "Cueva Fun Fun - Rappel de entrada" },
      { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop", alt: "Río subterráneo" },
      { src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop", alt: "Formaciones de estalactitas" },
      { src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop", alt: "Grupo de aventureros" },
      { src: "https://images.unsplash.com/photo-1432405972618-c6b0c635e16c?w=800&h=600&fit=crop", alt: "Salida de la cueva" }
    ],
    atracciones: ["Rappel de 18 metros", "Río subterráneo", "Estalactitas milenarias", "Colonia de murciélagos", "Cabalgata incluida", "Almuerzo típico dominicano"],
    equipoIncluido: ["Equipo completo de rappel", "Casco con linterna", "Guantes", "Botas de agua", "Guía certificado", "Almuerzo y transporte desde Punta Cana"],
    recomendaciones: ["Excelente condición física", "Saber nadar básico", "Ropa que se pueda mojar", "Cambio de ropa seca", "Cámara acuática"],
    restricciones: ["Edad mínima 10 años", "Peso máximo 120 kg", "No claustrofobia", "No condiciones cardíacas", "No embarazadas"],
    rating: 4.9,
    reviews: 1876
  }
};

export default function CuevaDetalle() {
  const { slug: id } = useParams<{ slug: string }>();
  const cueva = cuevasData[id || ""];

  if (!cueva) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Mountain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Cueva no encontrada</h1>
              <p className="text-muted-foreground mb-6">La cueva que buscas no existe o ha sido removida.</p>
              <Link to="/ecoturismo">
                <Button>Volver a Ecoturismo</Button>
              </Link>
            </div>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  const dificultadColor = {
    "Fácil": "bg-emerald-500",
    "Moderado": "bg-amber-500",
    "Difícil": "bg-red-500"
  };

  return (
    <PageTransition>
      <SEOHead
        title={`${cueva.nombre} - Espeleología en República Dominicana`}
        description={cueva.descripcion}
        keywords={`${cueva.nombre}, cuevas RD, espeleología dominicana, turismo de aventura`}
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1">
          {/* Breadcrumb */}
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary">Inicio</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/ecoturismo" className="hover:text-primary">Ecoturismo</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">{cueva.nombre}</span>
            </div>
          </div>

          {/* Gallery */}
          <section className="container mx-auto px-4 mb-8">
            <DestinationGallery images={cueva.imagenes} />
          </section>

          {/* Content */}
          <section className="container mx-auto px-4 pb-16">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Header */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className={`${dificultadColor[cueva.dificultad]} text-white`}>
                      {cueva.dificultad}
                    </Badge>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-semibold">{cueva.rating}</span>
                      <span className="text-muted-foreground">({cueva.reviews} reseñas)</span>
                    </div>
                  </div>
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {cueva.nombre}
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{cueva.ubicacion}, {cueva.provincia}</span>
                  </div>
                </div>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="prose prose-invert max-w-none"
                >
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {cueva.descripcionLarga}
                  </p>
                </motion.div>

                {/* Atracciones */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    Atracciones Principales
                  </h2>
                  <div className="grid md:grid-cols-2 gap-3">
                    {cueva.atracciones.map((atraccion, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{atraccion}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Qué Incluye */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    Qué Incluye
                  </h2>
                  <div className="grid md:grid-cols-2 gap-3">
                    {cueva.equipoIncluido.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recomendaciones y Restricciones */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                      Recomendaciones
                    </h3>
                    <ul className="space-y-2">
                      {cueva.recomendaciones.map((rec, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      Restricciones
                    </h3>
                    <ul className="space-y-2">
                      {cueva.restricciones.map((rest, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                          {rest}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Booking Card */}
                <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
                  <div className="text-center mb-6">
                    <p className="text-sm text-muted-foreground">Desde</p>
                    <p className="text-3xl font-bold text-primary">{cueva.precio}</p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-muted-foreground">Duración</p>
                        <p className="text-foreground font-medium">{cueva.duracion}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-muted-foreground">Horario</p>
                        <p className="text-foreground font-medium">{cueva.horario}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Users className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-muted-foreground">Capacidad</p>
                        <p className="text-foreground font-medium">{cueva.capacidad}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button className="w-full" size="lg">
                      Reservar Ahora
                    </Button>
                    <div className="flex gap-2">
                      <FavoriteButton
                        id={cueva.id}
                        type="cueva"
                        name={cueva.nombre}
                        image={cueva.imagenes[0]?.src || ""}
                        location={cueva.provincia}
                        variant="button"
                        className="flex-1"
                      />
                      <Button variant="outline" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border space-y-3">
                    <a href={`tel:${cueva.telefono}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                      <Phone className="h-4 w-4" />
                      {cueva.telefono}
                    </a>
                    <a href={`mailto:${cueva.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                      <Mail className="h-4 w-4" />
                      {cueva.email}
                    </a>
                    <a href={cueva.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                      <Globe className="h-4 w-4" />
                      Sitio Web Oficial
                    </a>
                  </div>
                </div>

                {/* Nivel Físico */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4">Nivel Físico Requerido</h3>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-full transition-all"
                      style={{ width: `${cueva.nivelFisico}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {cueva.nivelFisico <= 30 ? "Apto para toda la familia" : 
                     cueva.nivelFisico <= 60 ? "Requiere condición física moderada" :
                     "Solo para aventureros experimentados"}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
