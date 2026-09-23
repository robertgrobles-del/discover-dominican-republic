import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Link } from "react-router-dom";
import { ChevronDown, Quote, ArrowRight, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

import heroBeach from "@/assets/hero-beach.jpg";

const hitos = [
  {
    año: "1496",
    titulo: "Fundación de Santo Domingo",
    descripcion: "Se establece la Ciudad Primada de América, marcando el inicio de la historia moderna en el continente y sentando las bases de nuestra riqueza cultural."
  },
  {
    año: "1970",
    titulo: "El Despertar del Turismo",
    descripcion: "Puerto Plata abre sus puertas al mundo con el desarrollo de Playa Dorada, iniciando la era dorada de la hospitalidad dominicana."
  },
  {
    año: "1988",
    titulo: "Expansión Punta Cana",
    descripcion: "El Este se consolida como un paraíso mundial de resorts todo incluido, redefiniendo el lujo accesible y la belleza de nuestras costas."
  },
  {
    año: "2024 - PRESENTE",
    titulo: "Líder en el Caribe",
    descripcion: "Rompemos récords de visitantes anuales, enfocándonos en un turismo sostenible, diverso y auténtico que beneficia a todas nuestras comunidades."
  }
];

const equipoPortal = [
  {
    nombre: "Roberto Guzmán",
    cargo: "DIRECTOR DE TECNOLOGÍA & PRODUCTO",
    especialidad: "Arquitectura Web & Experiencia Digital",
    imagen: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    bio: "Lidera la ingeniería, infraestructura e interactividad del ecosistema digital Descubre RD.",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
  },
  {
    nombre: "Camila Vásquez",
    cargo: "EDITORA JEFE & CURADURÍA CULTURAL",
    especialidad: "Periodismo Turístico & Rutas Locales",
    imagen: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    bio: "Supervisa la calidad editorial, guías gastronómicas y documentación de destinos en todo el país.",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
  },
  {
    nombre: "Marcos De la Cruz",
    cargo: "LEAD UI/UX & DISEÑO DE PRODUCTO",
    especialidad: "Sistemas de Diseño & Accesibilidad",
    imagen: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    bio: "Crea experiencias intuitivas y visualmente cautivadoras inspiradas en la riqueza visual caribeña.",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
  },
  {
    nombre: "Laura Santana",
    cargo: "COORDINACIÓN DE DATOS & ALIANZAS",
    especialidad: "Verificación de Destinos & Servicios",
    imagen: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    bio: "Verifica y mantiene actualizados los datos de alojamientos, actividades y servicios en las 32 provincias.",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
  },
];

export default function SobreNosotros() {
  const [heroLoaded, setHeroLoaded] = useState(false);

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        {/* Hero */}
        <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
          {!heroLoaded && <Skeleton className="absolute inset-0" />}
          <img
            src={heroBeach}
            alt="República Dominicana"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              heroLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setHeroLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/50 to-black/85" />
          
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
              NUESTRA MISIÓN
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
              La esencia de<br />
              <span className="text-gradient">República Dominicana</span>
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Información oficial de turismo hecha por dominicanos, para que planifiques tu viaje sin sorpresas.
            </p>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-8 h-8 text-white/60" />
          </div>
        </section>

        {/* Evolución */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="w-12 h-12 mx-auto mb-6 text-primary">
                <svg viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 4L6 12v12c0 11.1 7.7 21.5 18 24 10.3-2.5 18-12.9 18-24V12L24 4z"/>
                </svg>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Nuestra Evolución
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Desde la fundación de la primera ciudad colonial del Nuevo Mundo hasta convertirnos en el destino líder del Caribe, 
                nuestra historia es una de reinvención constante, hospitalidad inigualable y un profundo respeto por nuestra naturaleza exuberante.
              </p>
            </div>

            {/* Quote */}
            <div className="max-w-3xl mx-auto mb-20">
              <div className="bg-card rounded-2xl p-8 border border-border relative">
                <Quote className="absolute top-6 left-6 w-8 h-8 text-primary/20" />
                <p className="text-xl md:text-2xl font-display italic text-foreground text-center">
                  "El turismo es el motor de nuestro orgullo"
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl font-display font-bold text-foreground mb-12">Hitos Históricos</h3>
              <div className="space-y-0">
                {hitos.map((hito, index) => (
                  <div key={hito.año} className="relative pl-12 pb-12 last:pb-0">
                    {/* Line */}
                    {index < hitos.length - 1 && (
                      <div className="absolute left-[17px] top-10 w-0.5 h-[calc(100%-24px)] bg-border" />
                    )}
                    
                    {/* Dot */}
                    <div className={`absolute left-0 top-1 w-9 h-9 rounded-full border-2 flex items-center justify-center ${
                      index === hitos.length - 1 
                        ? "border-primary bg-primary/20" 
                        : "border-border bg-background"
                    }`}>
                      <div className={`w-3 h-3 rounded-full ${
                        index === hitos.length - 1 ? "bg-primary" : "bg-muted-foreground"
                      }`} />
                    </div>

                    {/* Content */}
                    <div>
                      <span className="text-primary font-semibold text-sm">{hito.año}</span>
                      <h4 className="font-display font-bold text-xl text-foreground mt-1 mb-2">{hito.titulo}</h4>
                      <p className="text-muted-foreground">{hito.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Equipo del Portal */}
        <section className="py-20 bg-card/40 border-y border-border/40">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-14">
              <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">
                INNOVACIÓN & DESARROLLO
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                Equipo Detrás de Descubre RD
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
                Profesionales de la ingeniería web, diseño interactivo, periodismo y hospitalidad dedicados a crear la plataforma turística digital más completa e interactiva de República Dominicana.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {equipoPortal.map((persona) => (
                <div 
                  key={persona.nombre} 
                  className="group bg-card/80 hover:bg-card border border-border/70 hover:border-primary/40 rounded-2xl p-5 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col items-center"
                >
                  <div className="relative w-28 h-28 md:w-32 md:h-32 mb-4 rounded-full overflow-hidden border-2 border-primary/30 group-hover:border-primary transition-colors shadow-md">
                    <img 
                      src={persona.imagen} 
                      alt={persona.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  <h3 className="font-display font-bold text-base md:text-lg text-foreground group-hover:text-primary transition-colors">
                    {persona.nombre}
                  </h3>
                  <p className="text-[11px] font-bold text-primary tracking-wider uppercase mt-1">
                    {persona.cargo}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium mt-1 mb-3">
                    {persona.especialidad}
                  </p>
                  <p className="text-xs text-muted-foreground/90 leading-relaxed mb-4 flex-grow">
                    {persona.bio}
                  </p>

                  <div className="flex justify-center gap-1.5 pt-3 border-t border-border/50 w-full">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
                      asChild
                    >
                      <a href={persona.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`LinkedIn de ${persona.nombre}`}>
                        <Linkedin className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
                      asChild
                    >
                      <a href={persona.twitter} target="_blank" rel="noopener noreferrer" aria-label={`Twitter de ${persona.nombre}`}>
                        <Twitter className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-b from-primary/10 to-transparent">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              ¿Listo para vivir la historia?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Descubre por qué República Dominicana lo tiene todo. Planifica tu próxima aventura con nosotros.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/destinos">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Explorar Destinos
                </Button>
              </Link>
              <Link to="/ayuda">
                <Button size="lg" variant="outline">
                  Contactar Oficina
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
