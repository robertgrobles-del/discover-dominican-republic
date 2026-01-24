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

const liderazgo = [
  { nombre: "David Martínez", cargo: "MINISTRO DE TURISMO", imagen: null },
  { nombre: "Elena Vásquez", cargo: "VICEMINISTRA TÉCNICA", imagen: null },
  { nombre: "Roberto Henríquez", cargo: "DIRECTOR DE CALIDAD", imagen: null },
  { nombre: "Tammy Reynoso", cargo: "PROMOCIÓN INTERNACIONAL", imagen: null },
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
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
          
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
              NUESTRA MISIÓN
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
              La esencia de<br />
              <span className="text-gradient">República Dominicana</span>
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Nuestra misión es compartir la calidez, la historia y el alma vibrante del Caribe con el mundo. 
              Más que un destino, somos un sentimiento que perdura.
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

        {/* Liderazgo */}
        <section className="py-20 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">Nuestro Liderazgo</h2>
              <p className="text-muted-foreground">Las mentes y corazones dedicados a promover lo mejor de nuestra tierra.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {liderazgo.map((persona) => (
                <div key={persona.nombre} className="text-center group">
                  <div className="w-40 h-40 mx-auto mb-4 rounded-full bg-gradient-to-br from-secondary to-muted overflow-hidden">
                    {/* Placeholder illustration */}
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <svg viewBox="0 0 100 100" className="w-32 h-32">
                        <circle cx="50" cy="35" r="20" fill="currentColor" opacity="0.3" />
                        <ellipse cx="50" cy="85" rx="30" ry="25" fill="currentColor" opacity="0.3" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-foreground">{persona.nombre}</h3>
                  <p className="text-xs text-muted-foreground tracking-wider uppercase mt-1">{persona.cargo}</p>
                  <div className="flex justify-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Linkedin className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Twitter className="w-4 h-4" />
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
