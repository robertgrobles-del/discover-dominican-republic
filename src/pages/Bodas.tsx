import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Link } from "react-router-dom";
import { Heart, Star, ChevronDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import heroBeach from "@/assets/hero-beach.jpg";
import hotelClareVerde from "@/assets/hotel-clare-verde.jpg";
import santoDomingo from "@/assets/santo-domingo.jpg";

const escenarios = [
  { nombre: "Boda", activo: true },
  { nombre: "Playas", activo: false },
  { nombre: "Iglesias Coloniales", activo: false },
  { nombre: "Villas Privadas", activo: false },
];

const venues = [
  {
    id: 1,
    nombre: "Bodas en la Playa",
    imagen: heroBeach,
    tipo: "ECO-ROMANCE"
  },
  {
    id: 2,
    nombre: "Villas de Lujo",
    imagen: hotelClareVerde,
    tipo: "COLONIAL"
  },
  {
    id: 3,
    nombre: "Capilla San Estanislao",
    imagen: santoDomingo,
    tipo: "HISTÓRICO"
  }
];

const organizadores = [
  { nombre: "Elena Vasquez", especialidad: "BODAS DE LUJO", rating: 5 },
  { nombre: "Carlos Rodriguez", especialidad: "EVENTOS CORPORATIVOS Y BODAS", rating: 5 },
  { nombre: "Isabella Santos", especialidad: "ESPECIALISTA EN DESTINOS", rating: 5 },
  { nombre: "Miguel Ángel", especialidad: "FOTOGRAFÍA Y ESTILO", rating: 5 },
];

const paquetesLunaMiel = [
  {
    nombre: "Escape Romántico en Cap Cana",
    descripcion: "5 noches en suite frente al mar, cena privada en pareja, sesión de spa...",
    precio: 2499,
    imagen: heroBeach,
    tipo: "LUJO"
  },
  {
    nombre: "Samaná Salvaje e Íntimo",
    descripcion: "Alójense en eco-lodge de lujo, avistamiento de ballenas guiado, cena al...",
    precio: 1850,
    imagen: hotelClareVerde,
    tipo: "AVENTURA"
  },
  {
    nombre: "Encanto Colonial",
    descripcion: "Estadía en hotel boutique histórico, tour gastronómico privado, noche de ópera...",
    precio: 1600,
    imagen: santoDomingo,
    tipo: "CULTURAL"
  }
];

export default function Bodas() {
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        {/* Hero */}
        <section className="relative h-[70vh] flex items-center overflow-hidden">
          <img 
            src={heroBeach} 
            alt="Bodas en el Paraíso" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          <div className="relative z-10 container mx-auto px-4 text-center">
            <p className="text-rose-300 text-sm uppercase tracking-widest mb-4">
              EL COMIENZO DE SU HISTORIA
            </p>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-6">
              Bodas y Romance<br />
              <span className="italic">en el Paraíso</span>
            </h1>
            <p className="text-white/80 max-w-lg mx-auto mb-8">
              Di "Sí, acepto" rodeada de la belleza natural del Caribe, donde cada 
              atardecer es una promesa y cada brisa un susurro de amor.
            </p>
            <div className="flex gap-4 justify-center">
              <Button className="bg-rose-500 hover:bg-rose-600 text-white">
                Comenzar a Planificar
              </Button>
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                Explorar Galerías
              </Button>
            </div>
          </div>
        </section>

        {/* Intro */}
        <section className="py-16 px-4 text-center">
          <Heart className="h-8 w-8 text-rose-500 mx-auto mb-4" />
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">
            Un Destino, Mil Historias de Amor
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Desde playas de arena blanca vírgenes hasta iglesias coloniales del siglo XVI llenas de 
            historia. Encuentra el escenario perfecto que resuene con tu visión única de romance. En 
            República Dominicana, la magia está en los detalles.
          </p>
        </section>

        {/* Escenarios de Ensueño */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground">
                  Escenarios de Ensueño
                </h2>
                <p className="text-muted-foreground">Descubre el lugar donde comenzará tu "para siempre".</p>
              </div>
              <div className="flex gap-2">
                {escenarios.map((esc) => (
                  <Badge
                    key={esc.nombre}
                    variant={esc.activo ? "default" : "outline"}
                    className={`cursor-pointer ${esc.activo ? "bg-rose-500 text-white" : ""}`}
                  >
                    {esc.nombre}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {venues.map((venue) => (
                <div key={venue.id} className="group relative rounded-2xl overflow-hidden aspect-[3/4]">
                  <img 
                    src={venue.imagen} 
                    alt={venue.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <Badge className="absolute top-4 left-4 bg-rose-500/90 text-white text-xs">
                    {venue.tipo}
                  </Badge>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="font-serif text-xl font-bold text-white">{venue.nombre}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Organizadores Certificados */}
        <section className="py-16 px-4 bg-card/30">
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-rose-500 text-sm uppercase tracking-widest mb-2">
              EXPERTOS EN AMOR
            </p>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">
              Organizadores Certificados
            </h2>
            <p className="text-muted-foreground mb-12 max-w-xl mx-auto">
              Deja los detalles en manos de nuestros expertos. Profesionales dedicados a convertir tu 
              visión en una realidad impecable.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {organizadores.map((org) => (
                <div key={org.nombre} className="text-center">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900/30 dark:to-rose-800/30 flex items-center justify-center mb-4">
                    <span className="text-3xl">👤</span>
                  </div>
                  <h3 className="font-semibold text-foreground">{org.nombre}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{org.especialidad}</p>
                  <div className="flex justify-center gap-0.5">
                    {[...Array(org.rating)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="mt-3 text-xs">
                    Contactar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Requisitos Legales */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-rose-500/20 text-rose-500 border-rose-500/30">
                  📋 TRÁMITES SIMPLIFICADOS
                </Badge>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Requisitos Legales para Extranjeros
                </h2>
                <p className="text-muted-foreground mb-8">
                  Casarse en el paraíso es más sencillo de lo que imaginas. Hemos recopilado 
                  la información esencial para que tu enfoque esté en la celebración, no en el 
                  papeleo.
                </p>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="docs">
                    <AccordionTrigger>Documentación Básica</AccordionTrigger>
                    <AccordionContent>
                      Pasaportes vigentes, actas de nacimiento apostilladas, certificados de soltería y formularios oficiales.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="testigos">
                    <AccordionTrigger>Testigos Requeridos</AccordionTrigger>
                    <AccordionContent>
                      Se requieren dos testigos mayores de edad con identificación válida para la ceremonia legal.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="plazos">
                    <AccordionTrigger>Plazos y Tiempos</AccordionTrigger>
                    <AccordionContent>
                      Los documentos deben presentarse con al menos 15 días de anticipación. El proceso de registro toma 3-5 días hábiles.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Button variant="link" className="text-rose-500 p-0 mt-4">
                  Descargar Guía Completa PDF →
                </Button>
              </div>

              <div className="rounded-2xl overflow-hidden aspect-[4/3]">
                <img 
                  src={heroBeach} 
                  alt="Boda en la playa"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Paquetes de Luna de Miel */}
        <section className="py-16 px-4 bg-card/30">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Paquetes de Luna de Miel
              </h2>
              <Link to="/alojamientos" className="text-rose-500 font-medium text-sm hover:underline">
                Ver todos →
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {paquetesLunaMiel.map((paquete) => (
                <div key={paquete.nombre} className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="relative aspect-[4/3]">
                    <img 
                      src={paquete.imagen} 
                      alt={paquete.nombre}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-4 left-4 bg-rose-500 text-white text-xs">
                      {paquete.tipo}
                    </Badge>
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif font-bold text-lg text-foreground mb-2">
                      {paquete.nombre}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {paquete.descripcion}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-muted-foreground">Desde</span>
                        <p className="text-xl font-bold text-foreground">${paquete.precio.toLocaleString()}</p>
                      </div>
                      <Button variant="outline" size="sm" className="text-rose-500 border-rose-500 hover:bg-rose-50">
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
