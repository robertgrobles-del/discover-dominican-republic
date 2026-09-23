import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { DestinationGallery } from "@/components/destination/DestinationGallery";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, Clock, ChevronRight, Calendar, Phone, 
  Mail, Globe, Star, Church, CheckCircle, Users,
  Music, BookOpen, Heart, Share2
} from "lucide-react";
import { motion } from "framer-motion";
import { FavoriteButton } from "@/components/FavoriteButton";

import santoDomingo from "@/assets/santo-domingo.jpg";
import colonialDoor from "@/assets/colonial-door.jpg";

const destinosReligiososData: Record<string, {
  id: string;
  nombre: string;
  ubicacion: string;
  provincia: string;
  etiqueta: string;
  descripcion: string;
  descripcionLarga: string;
  historia: string;
  telefono: string;
  email: string;
  website: string;
  coordenadas: { lat: number; lng: number };
  imagenes: { src: string; alt: string }[];
  horariosMisas: { dia: string; hora: string }[];
  festividades: { nombre: string; fecha: string; descripcion: string }[];
  servicios: string[];
  recomendaciones: string[];
  arquitectura: string[];
  rating: number;
  reviews: number;
}> = {
  "catedral-primada": {
    id: "catedral-primada",
    nombre: "Catedral Primada de América",
    ubicacion: "Ciudad Colonial",
    provincia: "Santo Domingo",
    etiqueta: "PATRIMONIO UNESCO",
    descripcion: "La primera catedral del Nuevo Mundo, dedicada a Santa María de la Encarnación.",
    descripcionLarga: "La Catedral Santa María la Menor, conocida como la Catedral Primada de América, es la primera catedral construida en el Nuevo Mundo. Su construcción comenzó en 1512 bajo la dirección del obispo Fray García Padilla y fue consagrada en 1541. Este magnífico templo combina elementos del gótico tardío con el estilo renacentista plateresco, representando una joya arquitectónica única en el continente americano.",
    historia: "La catedral ha sido testigo de más de 500 años de historia dominicana. Sus paredes albergaron los restos de Cristóbal Colón hasta 1992, cuando fueron trasladados al Faro a Colón. El templo ha sobrevivido terremotos, ataques piratas (incluyendo el de Francis Drake en 1586) y el paso del tiempo, manteniendo su esplendor original.",
    telefono: "+1 809-689-1920",
    email: "catedral@arquidiocesis.org.do",
    website: "https://catedraldesantodomingo.org",
    coordenadas: { lat: 18.4730, lng: -69.8828 },
    imagenes: [
      { src: santoDomingo, alt: "Catedral Primada - Fachada principal" },
      { src: colonialDoor, alt: "Puerta colonial" },
      { src: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800&h=600&fit=crop", alt: "Interior de la catedral" },
      { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop", alt: "Altar mayor" },
      { src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop", alt: "Vitrales" }
    ],
    horariosMisas: [
      { dia: "Lunes - Viernes", hora: "7:00 AM, 12:00 PM, 6:00 PM" },
      { dia: "Sábados", hora: "7:00 AM, 5:00 PM" },
      { dia: "Domingos", hora: "7:00 AM, 10:00 AM, 12:00 PM, 5:00 PM, 7:00 PM" }
    ],
    festividades: [
      { nombre: "Corpus Christi", fecha: "Junio (fecha variable)", descripcion: "Procesión solemne por las calles de la Ciudad Colonial." },
      { nombre: "Navidad", fecha: "24-25 de Diciembre", descripcion: "Misa de Gallo y celebraciones especiales." },
      { nombre: "Semana Santa", fecha: "Marzo/Abril", descripcion: "Procesiones y liturgias especiales durante toda la semana." }
    ],
    servicios: ["Misas diarias", "Confesiones", "Matrimonios", "Bautizos", "Visitas guiadas", "Museo catedralicio"],
    recomendaciones: ["Vestimenta apropiada (hombros y rodillas cubiertos)", "Silencio durante las celebraciones", "Fotografía sin flash", "Visitar el museo adjunto"],
    arquitectura: ["Estilo gótico tardío", "Elementos renacentistas platerescos", "14 capillas laterales", "Altar de plata", "Vitrales originales del siglo XVI"],
    rating: 4.7,
    reviews: 3254
  },
  "santo-cerro": {
    id: "santo-cerro",
    nombre: "Santuario Santo Cerro",
    ubicacion: "La Vega",
    provincia: "La Vega",
    etiqueta: "SANTUARIO NACIONAL",
    descripcion: "Santuario Nacional Nuestra Señora de las Mercedes, lugar de aparición mariana.",
    descripcionLarga: "El Santo Cerro es uno de los lugares de peregrinación más importantes de República Dominicana. Según la tradición, aquí se produjo la aparición de la Virgen de las Mercedes durante la batalla entre españoles y taínos en 1495. La leyenda cuenta que una cruz plantada por los españoles fue protegida milagrosamente por la Virgen, lo que cambió el curso de la batalla.",
    historia: "El santuario actual fue construido en 1880 sobre las ruinas de una ermita original del siglo XVI. El Santo Hoyo, donde según la tradición estaba plantada la cruz milagrosa, es el punto central de peregrinación. Cada 24 de septiembre, miles de devotos suben la colina en honor a la Virgen de las Mercedes, patrona del país.",
    telefono: "+1 809-573-2566",
    email: "santocerro@arquidiocesis.org.do",
    website: "https://santuariosantocerro.org",
    coordenadas: { lat: 19.2167, lng: -70.5000 },
    imagenes: [
      { src: colonialDoor, alt: "Santo Cerro - Santuario" },
      { src: santoDomingo, alt: "Vista panorámica" },
      { src: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800&h=600&fit=crop", alt: "Interior del santuario" },
      { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop", alt: "El Santo Hoyo" },
      { src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop", alt: "Procesión del 24 de septiembre" }
    ],
    horariosMisas: [
      { dia: "Lunes - Sábado", hora: "9:00 AM, 4:00 PM" },
      { dia: "Domingos", hora: "9:00 AM, 11:00 AM, 4:00 PM" },
      { dia: "24 de Septiembre", hora: "Misas cada hora desde las 6:00 AM" }
    ],
    festividades: [
      { nombre: "Día de la Virgen de las Mercedes", fecha: "24 de Septiembre", descripcion: "La mayor peregrinación del año con más de 100,000 devotos." },
      { nombre: "Novenario", fecha: "15-23 de Septiembre", descripcion: "Nueve días de preparación espiritual antes de la fiesta patronal." }
    ],
    servicios: ["Misas diarias", "Confesiones", "Bendiciones", "Tienda de artículos religiosos", "Estacionamiento amplio", "Café y refrigerios"],
    recomendaciones: ["Llevar agua y protector solar", "Calzado cómodo para subir la colina", "Visitar temprano para evitar multitudes", "El 24 de septiembre llegar muy temprano"],
    arquitectura: ["Estilo neoclásico", "Campanario visible desde el valle", "El Santo Hoyo (sitio de la cruz original)", "Jardines y vía crucis"],
    rating: 4.8,
    reviews: 1876
  },
  "basilica-higuey": {
    id: "basilica-higuey",
    nombre: "Basílica de Nuestra Señora de la Altagracia",
    ubicacion: "Higüey",
    provincia: "La Altagracia",
    etiqueta: "CENTRO DE PEREGRINACIÓN",
    descripcion: "El centro de peregrinación más importante del país, hogar de la madre espiritual de los dominicanos.",
    descripcionLarga: "La Basílica de Nuestra Señora de la Altagracia es el santuario mariano más importante de República Dominicana y uno de los más visitados del Caribe. Construida entre 1954 y 1971 por los arquitectos franceses André-Jacques Dunoyer de Segonzac y Pierre Dupré, su diseño modernista en forma de arco parabólico simboliza las manos en oración. Alberga el cuadro original de la Virgen de la Altagracia, venerado desde el siglo XVI.",
    historia: "La devoción a la Virgen de la Altagracia comenzó en 1502 con la llegada de los primeros colonizadores españoles. La imagen original, un pequeño óleo sobre tabla, ha sido venerada por más de 500 años. La basílica actual reemplazó al antiguo santuario del siglo XIX, manteniendo la imagen original que los papas Juan Pablo II (1979) y Benedicto XVI (2014) han coronado canónicamente.",
    telefono: "+1 809-554-2376",
    email: "basilica@altagracia.org.do",
    website: "https://basilicahiguey.com",
    coordenadas: { lat: 18.6167, lng: -68.7000 },
    imagenes: [
      { src: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800&h=600&fit=crop", alt: "Basílica de Higüey - Vista exterior" },
      { src: santoDomingo, alt: "Interior de la basílica" },
      { src: colonialDoor, alt: "Altar con la imagen de la Virgen" },
      { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop", alt: "Arco parabólico" },
      { src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop", alt: "Peregrinos en oración" }
    ],
    horariosMisas: [
      { dia: "Lunes - Viernes", hora: "5:30 AM, 9:00 AM, 12:00 PM, 3:00 PM, 6:00 PM" },
      { dia: "Sábados", hora: "5:30 AM, 9:00 AM, 12:00 PM, 5:00 PM" },
      { dia: "Domingos", hora: "5:30 AM, 8:00 AM, 10:00 AM, 12:00 PM, 5:00 PM, 7:00 PM" }
    ],
    festividades: [
      { nombre: "Día de la Altagracia", fecha: "21 de Enero", descripcion: "Fiesta patronal nacional con misa pontifical y procesión." },
      { nombre: "Velorio de la Virgen", fecha: "20 de Enero", descripcion: "Vigilia nocturna con miles de peregrinos." },
      { nombre: "Coronación de la Virgen", fecha: "15 de Agosto", descripcion: "Conmemoración de la coronación canónica." }
    ],
    servicios: ["Misas en español e inglés", "Confesiones diarias", "Matrimonios", "Bautizos", "Museo de la Altagracia", "Tienda de artículos religiosos", "Cafetería", "Estacionamiento gratuito"],
    recomendaciones: ["Vestimenta apropiada obligatoria", "El 21 de enero llegar con varios días de anticipación", "Visitar el museo adjunto", "Subir a la terraza para vista panorámica"],
    arquitectura: ["Arco parabólico de 80 metros de altura", "Diseño modernista brutalista", "Vitral de la puerta de bronce", "Capacidad para 3,000 personas", "Corona de espinas simbólica en la fachada"],
    rating: 4.9,
    reviews: 5432
  }
};

export default function DestinoReligiosoDetalle() {
  const { slug: id } = useParams<{ slug: string }>();
  const destino = destinosReligiososData[id || ""];

  if (!destino) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Church className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Destino no encontrado</h1>
              <p className="text-muted-foreground mb-6">El destino religioso que buscas no existe.</p>
              <Link to="/turismo-religioso">
                <Button>Volver a Turismo Religioso</Button>
              </Link>
            </div>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SEOHead
        title={`${destino.nombre} - Turismo Religioso en República Dominicana`}
        description={destino.descripcion}
        keywords={`${destino.nombre}, turismo religioso RD, peregrinación dominicana, iglesias`}
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1">
          {/* Breadcrumb */}
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary">Inicio</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/turismo-religioso" className="hover:text-primary">Turismo Religioso</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">{destino.nombre}</span>
            </div>
          </div>

          {/* Gallery */}
          <section className="container mx-auto px-4 mb-8">
            <DestinationGallery images={destino.imagenes} />
          </section>

          {/* Content */}
          <section className="container mx-auto px-4 pb-16">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Header */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className="bg-amber-500 text-white">{destino.etiqueta}</Badge>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-semibold">{destino.rating}</span>
                      <span className="text-muted-foreground">({destino.reviews} reseñas)</span>
                    </div>
                  </div>
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {destino.nombre}
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{destino.ubicacion}, {destino.provincia}</span>
                  </div>
                </div>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="prose prose-invert max-w-none"
                >
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {destino.descripcionLarga}
                  </p>
                </motion.div>

                {/* Historia */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-amber-500" />
                    Historia
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">{destino.historia}</p>
                </div>

                {/* Arquitectura */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Church className="h-5 w-5 text-primary" />
                    Arquitectura
                  </h2>
                  <div className="grid md:grid-cols-2 gap-3">
                    {destino.arquitectura.map((elemento, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{elemento}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Festividades */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-amber-500" />
                    Festividades Principales
                  </h2>
                  <div className="space-y-4">
                    {destino.festividades.map((fest, index) => (
                      <div key={index} className="p-4 bg-secondary/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-foreground">{fest.nombre}</h3>
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
                            {fest.fecha}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{fest.descripcion}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recomendaciones */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    Recomendaciones para Visitantes
                  </h2>
                  <ul className="space-y-2">
                    {destino.recomendaciones.map((rec, index) => (
                      <li key={index} className="text-muted-foreground flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-1 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Horarios Card */}
                <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
                  <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Horarios de Misas
                  </h3>
                  <div className="space-y-3 mb-6">
                    {destino.horariosMisas.map((horario, index) => (
                      <div key={index} className="flex justify-between text-sm border-b border-border pb-2 last:border-0">
                        <span className="text-muted-foreground">{horario.dia}</span>
                        <span className="text-foreground font-medium">{horario.hora}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <Button className="w-full" size="lg">
                      Planificar Visita
                    </Button>
                    <div className="flex gap-2">
                      <FavoriteButton
                        id={destino.id}
                        type="destino-religioso"
                        name={destino.nombre}
                        image={destino.imagenes[0]?.src || ""}
                        location={destino.provincia}
                        variant="button"
                        className="flex-1"
                      />
                      <Button variant="outline" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border space-y-3">
                    <a href={`tel:${destino.telefono}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                      <Phone className="h-4 w-4" />
                      {destino.telefono}
                    </a>
                    <a href={`mailto:${destino.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                      <Mail className="h-4 w-4" />
                      {destino.email}
                    </a>
                    <a href={destino.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                      <Globe className="h-4 w-4" />
                      Sitio Web Oficial
                    </a>
                  </div>
                </div>

                {/* Servicios */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Servicios Disponibles
                  </h3>
                  <ul className="space-y-2">
                    {destino.servicios.map((servicio, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        {servicio}
                      </li>
                    ))}
                  </ul>
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
