import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { PanoramaAd } from "@/components/promo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShieldCheck, MapPin, Hotel, Phone, Users, Sun, Star,
  CheckCircle, AlertTriangle, Heart, Camera, Compass,
  ChevronRight, ArrowUpRight, MessageSquare, Quote, Lock, LifeBuoy
} from "lucide-react";

import relaxBeach from "@/assets/relax-beach.jpg";
import samanaImg from "@/assets/samana.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import puertoPlataImg from "@/assets/puerto-plata.jpg";

const destinosSeguros = [
  { 
    nombre: "Punta Cana & Bávaro", 
    provincia: "La Altagracia",
    seguridad: "Muy Alta", 
    seguridadScore: "5.0",
    image: puntaCanaImg,
    enlace: "/destino/punta-cana",
    desc: "El polo turístico más vigilado del país. Resorts cerrados, patrullaje constante de POLITUR y playas infinitas para caminar sin preocupación.", 
    tips: ["Alojamiento en hoteles o residenciales con seguridad", "Usa traslados oficiales y apps", "Playa Bávaro es perfecta para caminar sola de día"] 
  },
  { 
    nombre: "Cabarete & Playa Encuentro", 
    provincia: "Puerto Plata",
    seguridad: "Alta", 
    seguridadScore: "4.9",
    image: puertoPlataImg,
    enlace: "/destino/puerto-plata",
    desc: "Capital caribeña de deportes acuáticos con una vibrante comunidad internacional y ambiente relajado, ideal para nómadas y deportistas.", 
    tips: ["Clases de surf/kitesurf con escuelas certificadas", "Cafés y coworkings llenos de viajeras solas", "La vida nocturna sobre la arena es muy accesible"] 
  },
  { 
    nombre: "Las Terrenas & Playa Bonita", 
    provincia: "Samaná",
    seguridad: "Alta", 
    seguridadScore: "4.8",
    image: samanaImg,
    enlace: "/destino/samana",
    desc: "Pueblo costero cosmopolita de influencia franco-italiana. Seguro, caminable de punta a punta y con bistrós sobre la arena.", 
    tips: ["Alquila una pasola o scooter para moverte libremente", "Paseo marítimo iluminado de noche", "Hoteles boutique atendidos por sus dueños"] 
  },
  { 
    nombre: "Zona Colonial", 
    provincia: "Santo Domingo",
    seguridad: "Alta", 
    seguridadScore: "4.7",
    image: santoDomingoImg,
    enlace: "/destino/santo-domingo",
    desc: "El corazón histórico y cultural de la capital. Cuadrante peatonal vigilado con museos, galerías de arte, librerías y terrazas bohemias.", 
    tips: ["Quédate en hoteles boutique coloniales", "Usa Uber o DiDi en lugar de taxis no identificados", "Participa en tours guiados a pie o en bicicleta"] 
  },
  { 
    nombre: "Las Galeras & Playa Rincón", 
    provincia: "Samaná",
    seguridad: "Muy Alta", 
    seguridadScore: "4.9",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
    enlace: "/destino/samana",
    desc: "El rincón más pacífico de Samaná. Una pequeña bahía de pescadores donde todos los habitantes se conocen y cuidan al visitante.", 
    tips: ["Ideal para desconexión total y yoga", "Tours en lancha organizados con la asociación local de pescadores", "Ecolodges y cabañas seguras"] 
  },
  { 
    nombre: "Jarabacoa & Valle de Constanza", 
    provincia: "La Vega",
    seguridad: "Muy Alta", 
    seguridadScore: "4.9",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop",
    enlace: "/destino/jarabacoa",
    desc: "Ecoturismo en las montañas con clima fresco todo el año, senderismo seguro, plantaciones de café y saltos de agua.", 
    tips: ["Contrata guías de senderismo certificados", "Hospedajes estilo cabaña con chimenea", "Gente local excepcionalmente hospitalaria"] 
  },
];

const consejosSeguridad = [
  { icon: Phone, titulo: "Apps de Transporte Verificadas", desc: "Usa Uber o DiDi en las ciudades y transfers oficiales de hotel en aeropuertos. Comparte tu trayecto en vivo." },
  { icon: Lock, titulo: "Cerraduras & Hospedajes con Reseñas", desc: "Elige alojamientos con excelentes calificaciones de viajeras solas, recepción 24h y cajas fuertes en la habitación." },
  { icon: MapPin, titulo: "Itinerario y Mapas Offline", desc: "Descarga mapas de Google sin conexión y mantén informada a una persona de confianza sobre tus excursiones del día." },
  { icon: Users, titulo: "Socializar con Sentido Común", desc: "La calidez dominicana es maravillosa. Únete a actividades grupales o tours guiados para conocer amigos de viaje." },
  { icon: Camera, titulo: "Discreción con Objetos de Valor", desc: "Disfruta de tus fotos con tranquilidad, pero guarda cámaras costosas y joyas llamativas al transitar calles concurridas." },
  { icon: LifeBuoy, titulo: "Línea de Asistencia POLITUR", desc: "La Policía Turística (POLITUR) está disponible 24/7 en el 809-200-3500 para acompañarte ante cualquier duda o eventualidad." },
];

const testimoniosViajeras = [
  {
    nombre: "Clara M.",
    pais: "España",
    destino: "Las Terrenas & Samaná",
    comentario: "Pasé dos semanas recorriendo Samaná sola y me sentí completamente bienvenida y cuidada. La gente local te ayuda en todo y las playas son de ensueño.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
  },
  {
    nombre: "Sarah Jenkins",
    pais: "Canadá",
    destino: "Cabarete & Puerto Plata",
    comentario: "Como mujer viajando sola por primera vez en el Caribe, Cabarete fue el paraíso. Aprendí kitesurf, conocí muchísimas otras chicas solas y la vibra es 100% segura.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
  }
];

export default function ViajeraSola() {
  return (
    <PageTransition>
      <SEOHead
        title="Guía para Viajera Sola en República Dominicana | Seguridad y Destinos"
        description="Guía completa para mujeres que viajan solas a RD: destinos seguros, consejos prácticos de seguridad, hospedajes recomendados y comunidades de viajeras."
        keywords="viajera sola dominicana, mujer viaja sola RD, seguridad mujer turista, destinos seguros dominicana, solo female travel dominican republic"
      />
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />

        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[460px] flex items-end overflow-hidden">
          <img 
            src={relaxBeach} 
            alt="Viajera sola disfrutando de la playa en República Dominicana" 
            className="absolute inset-0 w-full h-full object-cover object-center" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-black/30" />

          <div className="relative z-10 container mx-auto px-4 lg:px-8 pb-12">
            <nav className="flex items-center gap-2 text-xs md:text-sm text-white/80 mb-4">
              <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link to="/planifica" className="hover:text-primary transition-colors">Planifica</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-white font-medium">Guía para Viajera Sola</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <Badge className="mb-3 bg-pink-500/20 text-pink-300 border-pink-500/30 text-xs px-3 py-1 font-semibold">
                  <Heart className="h-3.5 w-3.5 mr-1.5 fill-current" /> VIAJERAS INDEPENDIENTES
                </Badge>
                <h1 className="font-display text-4xl md:text-6xl font-black text-white tracking-tight mb-3">
                  Guía para Viajera Sola en RD
                </h1>
                <p className="text-base md:text-lg text-white/90 max-w-2xl leading-relaxed">
                  Consejos de seguridad, destinos recomendados, comunidades de apoyo y recursos para vivir una experiencia empoderadora, segura y memorable.
                </p>
              </div>

              {/* Emergency Hotline Box */}
              <div className="bg-black/50 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-white flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-white/70 font-medium">Asistencia Turística 24/7</p>
                  <a href="tel:8092003500" className="text-sm font-bold text-primary hover:underline">
                    POLITUR: 809-200-3500
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Destinos Más Seguros */}
        <section className="py-16 container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">
              DESTINOS VERIFICADOS
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Los Destinos Más Seguros & Recomendados
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
              Lugares con excelente infraestructura, presencia policial activa, ambiente amigable y comunidades internacionales de apoyo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinosSeguros.map((d) => (
              <div 
                key={d.nombre}
                className="group flex flex-col rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/40 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden bg-muted">
                  <img 
                    src={d.image} 
                    alt={d.nombre} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                  <div className="absolute top-3 left-3">
                    <Badge className="bg-emerald-500 text-white border-none text-[11px] shadow">
                      <ShieldCheck className="h-3 w-3 mr-1" /> Seguridad {d.seguridad}
                    </Badge>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="flex items-center gap-1 font-semibold">
                      <MapPin className="h-3.5 w-3.5 text-primary" /> {d.provincia}
                    </span>
                    <span className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-full text-amber-300 font-bold">
                      ★ {d.seguridadScore}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">
                    {d.nombre}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">
                    {d.desc}
                  </p>

                  <div className="space-y-1.5 mb-4">
                    {d.tips.map((t) => (
                      <div key={t} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>

                  <Button asChild variant="outline" size="sm" className="w-full gap-1.5 text-xs font-semibold">
                    <Link to={d.enlace}>
                      Explorar {d.nombre.split("&")[0]} <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Consejos de Oro */}
        <section className="py-16 bg-card/40 border-y border-border/50">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
            <div className="text-center mb-12">
              <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">
                TIPS PRÁCTICOS
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                Consejos de Seguridad para tu Viaje
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
                Buenas prácticas y recomendaciones sencillas para moverte con total libertad y tranquilidad.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {consejosSeguridad.map((c) => (
                <Card key={c.titulo} className="bg-card border-border/80 hover:border-primary/40 transition-all">
                  <CardContent className="p-6 space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <c.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-display font-bold text-base text-foreground">{c.titulo}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonios */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <div className="text-center mb-10">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                Experiencias Reales de Viajeras Solas
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                Historias de mujeres que exploraron Quisqueya por su cuenta.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {testimoniosViajeras.map((item) => (
                <div key={item.nombre} className="bg-card border border-border rounded-2xl p-6 relative">
                  <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/15" />
                  <p className="text-xs md:text-sm text-muted-foreground italic leading-relaxed mb-4">
                    "{item.comentario}"
                  </p>
                  <div className="flex items-center gap-3 pt-3 border-t border-border/60">
                    <img src={item.avatar} alt={item.nombre} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{item.nombre} ({item.pais})</h4>
                      <p className="text-[11px] text-primary">{item.destino}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Panorama Ad Section */}
        <section className="py-6 bg-muted/20 border-t border-border/40">
          <div className="container mx-auto px-4 max-w-6xl">
            <PanoramaAd showDemo />
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
