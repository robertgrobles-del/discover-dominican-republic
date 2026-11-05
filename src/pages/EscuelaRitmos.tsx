import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Play, MapPin, Star, Clock, Music, 
  ChevronRight, Users, Award, HeadphonesIcon
} from "lucide-react";
import { useState } from "react";

import merengueDance from "@/assets/merengue-dance.jpg";
import { usePageContent } from "@/lib/pageContent";

const videoTutoriales = [
  {
    titulo: "Paso Básico de Merengue",
    duracion: "5 min",
    instructor: "Carlos M.",
    nivel: "Nivel 1",
    nivelColor: "bg-primary",
    imagen: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=400&h=300&fit=crop"
  },
  {
    titulo: "La Vuelta y Coordinación",
    duracion: "8 min",
    instructor: "Ana R.",
    nivel: "Nivel 2",
    nivelColor: "bg-blue-500",
    imagen: "https://images.unsplash.com/photo-1545959570-a94084071b5d?w=400&h=300&fit=crop"
  },
  {
    titulo: "El Abrazo y La Postura",
    duracion: "6 min",
    instructor: "Luis G.",
    nivel: "Historia",
    nivelColor: "bg-purple-500",
    imagen: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=400&h=300&fit=crop"
  }
];

const escuelas = [
  {
    nombre: "Academia Santo Domingo",
    ubicacion: "Zona Colonial, Santo Domingo",
    rating: 4.8,
    reviews: 124,
    especialidades: ["Merengue", "Bachata", "Salsa"],
    claseGratis: true,
    estado: "Abierto"
  },
  {
    nombre: "Ritmo Caribe Dance",
    ubicacion: "Piantini, Santo Domingo",
    rating: 4.9,
    reviews: 89,
    especialidades: ["Bachata Sensual", "Merengue Urbano"],
    claseGratis: true,
    estado: "Abierto"
  },
  {
    nombre: "Escuela de Baile Tropical",
    ubicacion: "Bávaro, Punta Cana",
    rating: 4.7,
    reviews: 156,
    especialidades: ["Merengue", "Bachata", "Son"],
    claseGratis: false,
    estado: "Abierto"
  },
  {
    nombre: "Academia La Clave",
    ubicacion: "Puerto Plata",
    rating: 4.6,
    reviews: 67,
    especialidades: ["Merengue Típico", "Bachata"],
    claseGratis: true,
    estado: "Cerrado"
  }
];

const datosHistoricos = {
  titulo: "Más que música, una identidad nacional.",
  descripcion: "El Merengue nació en los campos del Cibao a mediados del siglo XIX. Con instrumentos como la tambora, la güira y el acordeón, representa la alegría y resiliencia del pueblo dominicano. En 2016, fue declarado Patrimonio Cultural Inmaterial de la Humanidad por la UNESCO.",
  playlist: ["Juan Luis Guerra", "Johnny Ventura", "Wilfrido Vargas"]
};

export default function EscuelaRitmos() {
  const pc = usePageContent("escuela-ritmos");
  const videoTutoriales = pc.data("videoTutoriales", __pcData.videoTutoriales);
  const datosHistoricos = pc.data("datosHistoricos", __pcData.datosHistoricos);
  const escuelas = pc.data("escuelas", __pcData.escuelas);
  const [ritmoActivo, setRitmoActivo] = useState("merengue");

  return (
    <PageTransition>
      <SEOHead
        title={pc.t("SEOHead.title.1", "Aprende el Ritmo: Merengue y Bachata - Escuelas de Baile en República Dominicana")}
        description={pc.t("SEOHead.description.1", "Descubre el alma de República Dominicana a través del baile. Aprende Merengue y Bachata con videotutoriales y escuelas certificadas.")}
        keywords="aprender merengue, clases bachata, escuelas baile RD, ritmos dominicanos, danza caribeña"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        {/* Hero */}
        <section className="relative h-[70vh] min-h-[600px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={pc.img("img.src.1", merengueDance)}
              alt={pc.t("img.alt.1", "Baile dominicano")}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/50" />
          </div>

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">{pc.tx("Badge.1", "CULTURA VIVA")}</Badge>
            <h1 className="font-display text-4xl md:text-6xl font-black text-foreground mb-6 leading-tight">{pc.tx("h1.1", "Siente el Ritmo")}<br />
              <span className="text-primary">{pc.tx("span.1", "del Caribe")}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">{pc.tx("p.1", "Merengue y bachata paso a paso, con videotutoriales y escuelas certificadas antes de pisar la isla.")}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="gap-2">
                <Play className="h-4 w-4" />{" "}{pc.tx("Button.1", "Comenzar Clases")}</Button>
              <Button size="lg" variant="outline" className="gap-2">{pc.tx("Button.2", "Ver Escuelas")}</Button>
            </div>
          </div>
        </section>

        {/* Segmented Buttons */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-center">
              <div className="bg-card p-2 rounded-full shadow-xl flex gap-1 border border-border">
                <button 
                  onClick={() => setRitmoActivo("merengue")}
                  className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${
                    ritmoActivo === "merengue" 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  }`}
                >{pc.tx("button.1", "Merengue")}</button>
                <button 
                  onClick={() => setRitmoActivo("bachata")}
                  className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${
                    ritmoActivo === "bachata" 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  }`}
                >{pc.tx("button.2", "Bachata")}</button>
                <button 
                  onClick={() => setRitmoActivo("son")}
                  className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${
                    ritmoActivo === "son" 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  }`}
                >{pc.tx("button.3", "Son")}</button>
              </div>
            </div>
          </div>
        </section>

        {/* Video Tutoriales */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">{pc.tx("h2.1", "Videotutoriales Básicos")}</h2>
                <p className="text-muted-foreground">{pc.tx("p.2", "Aprende los fundamentos desde casa.")}</p>
              </div>
              <Button variant="link" className="text-primary gap-1">{pc.tx("Button.3", "Ver todos")}{" "}<ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {videoTutoriales.map((video, index) => (
                <motion.div
                  key={video.titulo}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 shadow-lg">
                    <img
                      src={video.imagen}
                      alt={video.titulo}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="bg-white/20 backdrop-blur-md rounded-full p-4 group-hover:scale-110 transition-transform border border-white/40">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <Badge className={`absolute top-3 left-3 ${video.nivelColor} text-white`}>
                      {video.nivel}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {video.titulo}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{pc.tx("p.3", "Duración:")}{" "}{video.duracion}{" "}{pc.tx("p.4", "• Instructor:")}{" "}{video.instructor}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Historia del Merengue */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600"
                    alt={pc.t("img.alt.2", "Historia del Merengue")}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <p className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">{pc.tx("p.5", "Orígenes")}</p>
                    <p className="text-2xl font-bold">{pc.tx("p.6", "Patrimonio de la Humanidad")}</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="font-display text-3xl md:text-4xl font-black text-foreground mb-6 leading-tight">
                  {datosHistoricos.titulo.split(",")[0]},
                  <br />
                  <span className="text-primary">{datosHistoricos.titulo.split(",")[1]}</span>
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                  {datosHistoricos.descripcion}
                </p>
                
                <div className="bg-surface rounded-2xl p-4 flex items-center gap-4 mb-6">
                  <div className="bg-primary/10 rounded-full p-3 text-primary">
                    <HeadphonesIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="h4 font-bold text-foreground text-sm">{pc.tx("h4.1", "Playlist Esencial: Clásicos")}</h3>
                    <p className="text-xs text-muted-foreground">{datosHistoricos.playlist.join(", ")}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="text-primary">
                    <Play className="h-5 w-5" />
                  </Button>
                </div>

                <Button variant="link" className="text-primary p-0 gap-2">{pc.tx("Button.4", "Leer historia completa")}{" "}<ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Escuelas */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl font-bold text-foreground mb-3">{pc.tx("h2.2", "Encuentra tu Escuela")}</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">{pc.tx("p.7", "Mapa interactivo de academias certificadas por el Ministerio de Turismo. Reserva tu primera clase gratis.")}</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Lista de Escuelas */}
              <div className="space-y-4">
                {escuelas.map((escuela, index) => (
                  <motion.div
                    key={escuela.nombre}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card rounded-2xl border border-border p-4 hover:border-primary/50 transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="h4 font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                        {escuela.nombre}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className={escuela.estado === "Abierto" ? "bg-green-500/10 text-green-600 border-green-500/30" : "bg-red-500/10 text-red-600 border-red-500/30"}
                      >
                        {escuela.estado}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1 text-amber-500 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(escuela.rating) ? "fill-current" : ""}`} />
                      ))}
                      <span className="text-xs text-muted-foreground ml-1">({escuela.reviews}{" "}{pc.tx("span.2", "reseñas)")}</span>
                    </div>

                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                      <MapPin className="h-4 w-4" />
                      {escuela.ubicacion}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {escuela.especialidades.map((esp) => (
                        <Badge key={esp} variant="secondary" className="text-xs">
                          {esp}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      {escuela.claseGratis && (
                        <Badge className="bg-primary/10 text-primary border-primary/30">{pc.tx("Badge.2", "1ra Clase Gratis")}</Badge>
                      )}
                      <Button size="sm" className="ml-auto">{pc.tx("Button.5", "Reservar")}</Button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Mapa Placeholder */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="aspect-square lg:aspect-auto lg:h-full relative">
                  <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800"
                    alt={pc.t("img.alt.3", "Mapa de escuelas")}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-6">
                    <div className="text-center w-full">
                      <p className="text-foreground font-semibold mb-2">{pc.tx("p.8", "Mapa Interactivo")}</p>
                      <Button className="gap-2">
                        <MapPin className="h-4 w-4" />{" "}{pc.tx("Button.6", "Ver en Mapa")}</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Beneficios */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{pc.tx("h3.1", "Instructores Certificados")}</h3>
                <p className="text-sm text-muted-foreground">{pc.tx("p.9", "Todos nuestros instructores están avalados por el Ministerio de Turismo.")}</p>
              </div>
              <div>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{pc.tx("h3.2", "Clases para Todos")}</h3>
                <p className="text-sm text-muted-foreground">{pc.tx("p.10", "Desde principiantes hasta avanzados. Grupos pequeños o clases privadas.")}</p>
              </div>
              <div>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Music className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{pc.tx("h3.3", "Inmersión Cultural")}</h3>
                <p className="text-sm text-muted-foreground">{pc.tx("p.11", "No solo aprenderás a bailar, vivirás la cultura dominicana.")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-primary to-orange-500">
          <div className="container mx-auto px-4 text-center">
            <Music className="h-12 w-12 text-white mx-auto mb-4" />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">{pc.tx("h2.3", "¿Listo para mover los pies?")}</h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">{pc.tx("p.12", "Reserva tu primera clase gratis en cualquiera de nuestras academias certificadas.")}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="gap-2 bg-white text-primary hover:bg-white/90">{pc.tx("Button.7", "Reservar Clase Gratis")}</Button>
              <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">{pc.tx("Button.8", "Ver Videotutoriales")}</Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}

// Datos del módulo editables desde el panel (ver pc.data en src/lib/pageContent.ts).
const __pcData = { videoTutoriales, datosHistoricos, escuelas };
