import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Film,
  MapPin,
  Camera,
  FileText,
  DollarSign,
  Plane,
  Users,
  Building,
  ChevronRight,
  Play,
  Download,
  Phone,
  Mail,
  ArrowRight,
  Star,
  Clock,
  Clapperboard,
  Sparkles,
  Award
} from "lucide-react";
import { PanoramaAd } from "@/components/promo";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import samanaImg from "@/assets/samana.jpg";
import historyImg from "@/assets/history.jpg";
import adventureImg from "@/assets/adventure.jpg";

const incentives = [
  {
    icon: DollarSign,
    title: "Crédito Fiscal Transferible (25%)",
    description: "Un crédito fiscal transferible del 25% sobre todos los gastos elegibles realizados en República Dominicana (Artículo 39 Ley 108-10).",
  },
  {
    icon: FileText,
    title: "Exención Total de ITBIS (18%)",
    description: "Exención del 18% en compras de bienes y contratación de servicios calificados directamente vinculados a la producción cinematográfica.",
  },
  {
    icon: Plane,
    title: "Ventanilla Única DGCINE",
    description: "Emisión ágil del Permiso Único de Rodaje (PUR) para filmaciones en parques nacionales, monumentos históricos y espacios públicos.",
  },
];

const productions = [
  { 
    title: "Jurassic Park", 
    location: "Samaná, Cascadas y Museo del Ámbar", 
    year: "1993", 
    director: "Steven Spielberg",
    genre: "AVENTURA & SCI-FI",
    image: samanaImg,
    curiosidad: "El mosquito fósil en ámbar que inspiró la trama proviene de las minas de ámbar del Valle del Cibao."
  },
  { 
    title: "El Padrino II (The Godfather II)", 
    location: "Calle El Conde y Casonas de la Zona Colonial", 
    year: "1974", 
    director: "Francis Ford Coppola",
    genre: "DRAMA & CLÁSICO",
    image: historyImg,
    curiosidad: "Las calles de la Zona Colonial de Santo Domingo recrearon la Habana prerrevolucionaria de los años 50."
  },
  { 
    title: "Fast & Furious 4 (Rápidos y Furiosos)", 
    location: "Montecristi, Autopistas y Costas", 
    year: "2009", 
    director: "Justin Lin (Vin Diesel)",
    genre: "ACCIÓN & VELOCIDAD",
    image: adventureImg,
    curiosidad: "La escena de apertura del robo del camión cisterna fue filmada a lo largo de las carreteras del noroeste dominicano."
  },
  { 
    title: "The Lost City (La Ciudad Perdida)", 
    location: "Samaná, Las Terrenas & Casa de Campo", 
    year: "2022", 
    director: "Aaron & Adam Nee",
    genre: "COMEDIA & AVENTURA",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
    curiosidad: "Sandra Bullock, Channing Tatum y Brad Pitt filmaron durante 4 meses en las selvas de Samaná."
  },
];

const experiencias = [
  {
    titulo: "Ruta Jurásica y Cuevas de Samaná",
    descripcion: "Visita los paisajes selváticos donde se filmaron escenas icónicas de dinosaurios y cuevas con arte rupestre taíno.",
    duracion: "6 HORAS",
    precio: 85,
    rating: 4.9,
    imagen: samanaImg
  },
  {
    titulo: "Caminata de Época: El Padrino en Santo Domingo",
    descripcion: "Recorrido histórico guiado por las casonas coloniales y balcones del casco antiguo que engañaron al lente de Hollywood.",
    duracion: "3 HORAS",
    precio: 45,
    rating: 5.0,
    imagen: historyImg
  },
  {
    titulo: "Safari 4x4 por la Costa de Acción",
    descripcion: "Ruta en todoterreno por los acantilados y playas salvajes utilizadas para secuencias de persecución y películas de acción.",
    duracion: "DÍA COMPLETO",
    precio: 120,
    rating: 4.8,
    imagen: adventureImg
  }
];

const infrastructure = [
  {
    icon: Building,
    title: "Pinewood Dominican Republic Studios",
    description: "Complejo de estudios de nivel internacional en Juan Dolio, equipado con el Horizon Water Tank de 60,500 pies cuadrados para rodajes marítimos de gran escala.",
  },
  {
    icon: Users,
    title: "Crew Técnico y Talento Bilingüe",
    description: "Directores de fotografía, ingenieros de sonido, operadores de drones certificados por IDAC y especialistas en efectos prácticos con amplia experiencia en producciones globales.",
  },
  {
    icon: Plane,
    title: "8 Aeropuertos y Logística Hotelera",
    description: "Conexiones internacionales sin escalas y capacidad hotelera de más de 85,000 habitaciones para alojar grandes equipos de rodaje con comodidades de primer nivel.",
  },
];

export default function CineRD() {
  return (
    <PageTransition>
      <SEOHead
        title="Turismo Cinematográfico y Locaciones de Cine en RD | Descubre República Dominicana"
        description="Explora los escenarios de Hollywood en República Dominicana: Jurassic Park, El Padrino II, The Lost City. Conoce la Ley de Cine (108-10), incentivos fiscales y tours de cine."
        keywords="cine dominicano, locaciones de peliculas en republica dominicana, film commission rd, ley de cine 108-10, jurassic park samana, el padrino zona colonial"
      />
      
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />

        <main className="pb-20">
          {/* Hero Cinematográfico */}
          <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <img
                src={santoDomingoImg}
                alt="Turismo Cinematográfico y Escenarios de Cine en República Dominicana"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-black/65 to-black/40" />
            </div>

            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto text-white py-16">
              <Badge className="mb-4 bg-primary/20 text-white border-primary/40 backdrop-blur-md px-3 py-1 font-semibold">
                <Clapperboard className="w-3.5 h-3.5 mr-1.5 text-primary" />
                Turismo Cinematográfico & Film Commission
              </Badge>
              <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-md">
                República Dominicana en la <br />
                <span className="italic text-primary">Gran Pantalla</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed drop-shadow">
                Visita los sets reales de películas clásicas y producciones contemporáneas que escogieron las costas, selvas y calles coloniales de nuestra isla.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="gap-2 font-bold shadow-md">
                  <Camera className="h-4 w-4" /> Explorar Locaciones Famosas
                </Button>
                <Button size="lg" variant="outline" className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm">
                  <Download className="h-4 w-4" /> Guía DGCINE (PDF)
                </Button>
              </div>
            </div>
          </section>

          {/* Cartelera de Estrellas */}
          <section className="container mx-auto px-4 mt-16 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-1">Filmografía en la Isla</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Grandes Producciones Filmadas en RD
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Descubre cómo los paisajes dominicanos han dado vida a algunas de las escenas más recordadas del cine mundial.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {productions.map((prod, index) => (
                <Card key={prod.title} className="overflow-hidden border border-border/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                  <div>
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={prod.image}
                        alt={prod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                      
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-black/70 text-white text-[10px] font-semibold backdrop-blur-xs">
                          {prod.genre} • {prod.year}
                        </Badge>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h3 className="font-display font-bold text-lg leading-tight drop-shadow">{prod.title}</h3>
                        <p className="text-xs text-white/80 mt-0.5">Dir: {prod.director}</p>
                        <p className="text-xs text-primary font-semibold flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" /> {prod.location}
                        </p>
                      </div>
                    </div>

                    <CardContent className="p-4 space-y-2">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground block">Curiosidad de Rodaje:</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {prod.curiosidad}
                      </p>
                    </CardContent>
                  </div>

                  <div className="p-4 pt-0">
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold">
                      Ver Ficha de Locación
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Experiencias de Cine y Tours */}
          <section className="container mx-auto px-4 mt-20 max-w-6xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-1">Tours y Rutas Guiadas</span>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  Experiencias de Película en Primera Persona
                </h2>
              </div>
              <p className="text-xs text-muted-foreground max-w-sm">
                Recorridos guiados por especialistas en cine que te llevan a los mismos puntos de cámara de tus actores favoritos.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {experiencias.map((exp, index) => (
                <Card key={exp.titulo} className="overflow-hidden border border-border/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                  <div>
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={exp.imagen}
                        alt={exp.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <Badge className="absolute top-3 left-3 bg-black/70 text-white text-[10px]">
                        <Clock className="w-3 h-3 mr-1" />
                        {exp.duracion}
                      </Badge>
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-full text-white text-xs">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{exp.rating}</span>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-bold text-foreground text-base mb-2">{exp.titulo}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{exp.descripcion}</p>
                    </CardContent>
                  </div>

                  <div className="p-5 pt-0 border-t border-border/50 flex items-center justify-between mt-2">
                    <div>
                      <span className="text-[10px] text-muted-foreground block uppercase">Tarifa desde</span>
                      <span className="text-lg font-bold font-mono text-foreground">${exp.precio} USD</span>
                    </div>
                    <Button size="sm" className="text-xs font-bold">Reservar Tour</Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Incentivos Ley 108-10 y Servicios a Productores */}
          <section className="container mx-auto px-4 mt-20 max-w-6xl">
            <div className="bg-card border border-border/80 rounded-3xl p-8 md:p-12 shadow-sm">
              <div className="max-w-3xl mb-10">
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs mb-3 font-semibold">
                  📜 Ley de Fomento a la Actividad Cinematográfica (108-10)
                </Badge>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  Incentivos Fiscales de Nivel Mundial
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-2 leading-relaxed">
                  República Dominicana ofrece uno de los paquetes de incentivos más competitivos del hemisferio occidental, facilitando transferencias bancarias ágiles y exención total de aranceles de importación temporal de equipos.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {incentives.map((incentive, index) => {
                  const IconComp = incentive.icon;
                  return (
                    <div key={incentive.title} className="bg-muted/30 p-6 rounded-2xl border border-border/50 space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <IconComp className="h-5 w-5" />
                      </div>
                      <h3 className="font-bold text-foreground text-sm">{incentive.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{incentive.description}</p>
                    </div>
                  );
                })}
              </div>

              {/* Infraestructura */}
              <div className="pt-8 border-t border-border/60">
                <h3 className="font-display font-bold text-xl text-foreground mb-6">
                  Infraestructura y Estudios Técnicos
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {infrastructure.map((inf, i) => {
                    const InfIcon = inf.icon;
                    return (
                      <div key={i} className="flex gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <InfIcon className="h-4.5 w-4.5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-foreground text-xs">{inf.title}</h4>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{inf.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Banner Publicitario Oficial */}
          <section className="container mx-auto px-4 mt-16 max-w-5xl">
            <PanoramaAd />
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
