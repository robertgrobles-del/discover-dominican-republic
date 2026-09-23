import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { 
  Heart, Star, MapPin, Sparkles, CheckCircle2, Calendar, 
  Download, Phone, Church, Waves, TreePine, Award, Camera, 
  HelpCircle, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PanoramaAd } from "@/components/promo";
import heroBeach from "@/assets/hero-beach.jpg";
import hotelClareVerde from "@/assets/hotel-clare-verde.jpg";
import santoDomingo from "@/assets/santo-domingo.jpg";
import laRomanaImg from "@/assets/la-romana.jpg";
import samanaImg from "@/assets/samana.jpg";
import puntaCanaImg from "@/assets/punta-cana.jpg";

const venues = [
  {
    id: "v1",
    nombre: "Cap Cana & Playa Juanillo",
    ubicacion: "Punta Cana / Cap Cana",
    imagen: puntaCanaImg,
    tipo: "Playa de Lujo & Atardecer",
    categoria: "playa",
    capacidad: "Hasta 400 invitados",
    destacados: "Aguas turquesas calmas, arenas blancas de coral y resorts all-inclusive de cinco estrellas."
  },
  {
    id: "v2",
    nombre: "Altos de Chavón & Capilla San Estanislao",
    ubicacion: "La Romana (Casa de Campo)",
    imagen: laRomanaImg,
    tipo: "Aldea Medieval & Histórico",
    categoria: "historico",
    capacidad: "Hasta 350 invitados",
    destacados: "Capilla de piedra bendecida por el Papa Juan Pablo II con vistas panorámicas al Río Chavón."
  },
  {
    id: "v3",
    nombre: "Catedral Primada & Casonas Coloniales",
    ubicacion: "Zona Colonial, Santo Domingo",
    imagen: santoDomingo,
    tipo: "Patrimonio Colonial del Siglo XVI",
    categoria: "historico",
    capacidad: "Hasta 250 invitados",
    destacados: "Patios coloniales empedrados, arquitectura de época y salones de banquetes históricos."
  },
  {
    id: "v4",
    nombre: "Eco-Lodge & Vistas a la Bahía de Samaná",
    ubicacion: "Las Terrenas / Las Galeras, Samaná",
    imagen: samanaImg,
    tipo: "Eco-Romance & Naturaleza",
    categoria: "eco",
    capacidad: "Hasta 180 invitados",
    destacados: "Ceremonias en acantilados con vista a las ballenas jorobadas y gastronomía fusión franco-dominicana."
  },
  {
    id: "v5",
    nombre: "Villas Privadas en Las Terrenas",
    ubicacion: "Playa Cosón, Samaná",
    imagen: hotelClareVerde,
    tipo: "Villas Privadas & Intimidad",
    categoria: "villas",
    capacidad: "Hasta 120 invitados",
    destacados: "Exclusividad total, chefs privados y piscina infinity directamente sobre la arena."
  }
];

const organizadores = [
  { 
    nombre: "Elena Vásquez Weddings", 
    especialidad: "Bodas de Lujo & Destino", 
    ubicacion: "Punta Cana & Santo Domingo",
    rating: 5.0, 
    experiencia: "12 años creando magia",
    bodasRealizadas: "350+ bodas"
  },
  { 
    nombre: "Carlos Rodríguez Event Design", 
    especialidad: "Diseño Floral & Grandes Producciones", 
    ubicacion: "La Romana & Cap Cana",
    rating: 4.9, 
    experiencia: "Especialista en venues históricos",
    bodasRealizadas: "280+ bodas"
  },
  { 
    nombre: "Isabella Santos & Co.", 
    especialidad: "Bodas Íntimas & Elopements", 
    ubicacion: "Las Terrenas & Cabarete",
    rating: 5.0, 
    experiencia: "Eco-weddings y bodas bilingües",
    bodasRealizadas: "190+ bodas"
  },
  { 
    nombre: "Miguel Ángel Bridal Style", 
    especialidad: "Fotografía Editorial & Coordinación", 
    ubicacion: "Nacional e Internacional",
    rating: 5.0, 
    experiencia: "Publicado en Vogue Weddings",
    bodasRealizadas: "220+ bodas"
  },
];

const paquetesLunaMiel = [
  {
    nombre: "Santuario de Amor en Cap Cana",
    descripcion: "5 noches en suite 'Swim-Up' solo adultos, cena privada a la luz de las velas en la orilla del mar, masaje balinés en pareja y catamarán al atardecer.",
    precio: 2450,
    imagen: puntaCanaImg,
    tipo: "All-Inclusive Lujo"
  },
  {
    nombre: "Samaná Íntimo & Ecoturismo de Lujo",
    descripcion: "4 noches en villa boutique privada sobre los cerros de Las Terrenas, avistamiento privado de ballenas, chef personal y cata de chocolate artesanal.",
    precio: 1890,
    imagen: samanaImg,
    tipo: "Eco-Aventura Romántica"
  },
  {
    nombre: "Romance Colonial & Casonas del Siglo XVI",
    descripcion: "3 noches en hotel boutique histórico, paseo en carruaje clásico por la Zona Colonial, tour de coctelería y acceso VIP a la terraza panorámica.",
    precio: 1350,
    imagen: santoDomingo,
    tipo: "Patrimonio Cultural"
  }
];

export default function Bodas() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredVenues = activeCategory === "all" 
    ? venues 
    : venues.filter(v => v.categoria === activeCategory);

  return (
    <PageTransition>
      <SEOHead
        title="Bodas de Destino y Lunas de Miel en República Dominicana | Descubre RD"
        description="Planifica tu boda de ensueño en República Dominicana: playas vírgenes, iglesias coloniales, organizadores de bodas certificados y requisitos legales para extranjeros."
        keywords="bodas republica dominicana, destination weddings punta cana, casarse en dominicana requisitos, luna de miel samana, bodas zona colonial"
      />
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="pb-20">
          {/* Hero Romántico */}
          <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <img 
                src={heroBeach} 
                alt="Bodas de ensueño en las playas de República Dominicana" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-black/55 to-black/35" />
            </div>
            
            <div className="relative z-10 container mx-auto px-4 py-16 text-center max-w-4xl text-white">
              <Badge className="mb-4 bg-rose-500/30 text-rose-200 border-rose-400/40 backdrop-blur-md px-3 py-1 font-semibold">
                <Heart className="h-3.5 w-3.5 mr-1.5 text-rose-300 fill-rose-300" /> Bodas de Destino & Lunas de Miel
              </Badge>
              <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-4 drop-shadow-md">
                Bodas y Romance <br />
                <span className="italic text-rose-300">en el Paraíso</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow">
                Di "Sí, acepto" rodeado de aguas turquesas cristalinas, capillas coloniales del siglo XVI y la calidez inconfundible del Caribe dominicano.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center mt-8">
                <Button size="lg" className="bg-rose-500 hover:bg-rose-600 text-white font-semibold gap-2 shadow-md">
                  <Sparkles className="h-4 w-4" /> Comenzar a Planificar
                </Button>
                <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm">
                  Descargar Guía Nupcial PDF
                </Button>
              </div>
            </div>
          </section>

          {/* Intro inspiracional */}
          <section className="container mx-auto px-4 py-12 text-center max-w-3xl">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3">
              Un Destino Incomparable, Mil Historias de Amor
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              República Dominicana es el destino número uno del Caribe para enlaces nupciales y aniversarios. Nuestro país combina hotelería de clase mundial con diseñadores y fotógrafos de talla internacional para hacer de tu celebración un recuerdo imborrable.
            </p>
          </section>

          {/* Escenarios de Ensueño */}
          <section className="container mx-auto px-4 max-w-6xl mt-4">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold text-rose-500 uppercase tracking-widest block mb-1">Locaciones Únicas</span>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                  Escenarios de Ensueño
                </h2>
              </div>

              {/* Categorías Filter */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: "Todos" },
                  { id: "playa", label: "Playas de Lujo" },
                  { id: "historico", label: "Colonial & Capillas" },
                  { id: "eco", label: "Eco-Romance" },
                  { id: "villas", label: "Villas Privadas" },
                ].map((cat) => (
                  <Button
                    key={cat.id}
                    variant={activeCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`text-xs h-8 ${activeCategory === cat.id ? "bg-rose-500 hover:bg-rose-600 text-white" : ""}`}
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVenues.map((venue) => (
                <Card key={venue.id} className="overflow-hidden border border-border/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img 
                        src={venue.imagen} 
                        alt={venue.nombre} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      <Badge className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-semibold">
                        {venue.tipo}
                      </Badge>

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h3 className="font-serif font-bold text-lg leading-tight drop-shadow">{venue.nombre}</h3>
                        <p className="text-xs text-white/90 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-rose-300" /> {venue.ubicacion}
                        </p>
                      </div>
                    </div>

                    <CardContent className="p-5 space-y-3">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {venue.destacados}
                      </p>
                      <div className="pt-2 border-t border-border/50 text-[11px] font-medium text-foreground flex items-center justify-between">
                        <span>Capacidad:</span>
                        <span className="font-bold text-rose-500">{venue.capacidad}</span>
                      </div>
                    </CardContent>
                  </div>

                  <div className="p-4 pt-0">
                    <Button variant="outline" size="sm" className="w-full text-xs font-semibold hover:border-rose-500 hover:text-rose-500">
                      Solicitar Disponibilidad
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Organizadores Certificados */}
          <section className="container mx-auto px-4 mt-16 max-w-6xl">
            <div className="bg-card border border-border/80 rounded-3xl p-8 md:p-12 shadow-sm">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <span className="text-xs font-bold text-rose-500 uppercase tracking-widest block mb-1">Wedding Planners</span>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                  Organizadores de Bodas Certificados
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-2">
                  Profesionales expertos avalados por la Asociación de Bodas de Destino que coordinan desde los permisos legales hasta el banquete y la decoración.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {organizadores.map((org) => (
                  <div key={org.nombre} className="bg-muted/30 border border-border/60 rounded-2xl p-5 text-center flex flex-col justify-between space-y-3 hover:border-rose-500/40 transition-colors">
                    <div>
                      <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3 font-serif font-bold text-xl">
                        {org.nombre[0]}
                      </div>
                      <h3 className="font-bold text-foreground text-sm">{org.nombre}</h3>
                      <p className="text-[11px] text-rose-500 font-medium mt-0.5">{org.especialidad}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 flex items-center justify-center gap-1">
                        <MapPin className="h-3 w-3" /> {org.ubicacion}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border/50">
                      <div className="flex items-center justify-center gap-1 text-xs text-amber-500 font-bold mb-3">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        <span>{org.rating}</span>
                        <span className="text-muted-foreground font-normal">({org.bodasRealizadas})</span>
                      </div>
                      <Button size="sm" variant="outline" className="w-full text-xs h-8">
                        Contactar Planner
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Requisitos Legales para Extranjeros */}
          <section className="container mx-auto px-4 mt-16 max-w-5xl">
            <div className="grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-6 space-y-4">
                <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-xs font-semibold">
                  📜 Validez Jurídica Internacional
                </Badge>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                  Requisitos Legales para Casarse en RD
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Casarse legalmente en República Dominicana es un proceso directo. Los matrimonios civiles celebrados aquí son plenamente reconocidos en Estados Unidos, Canadá y la Unión Europea mediante la Apostilla de La Haya.
                </p>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-xs font-bold">1. Documentos de los Novios</AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground space-y-1">
                      <p>• Pasaportes originales con fotocopias legibles.</p>
                      <p>• Actas de nacimiento traducidas al español y legalizadas/apostilladas.</p>
                      <p>• Declaración jurada de soltería legalizada por el consulado o notario.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-xs font-bold">2. Testigos Requeridos</AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground">
                      Se requieren dos testigos mayores de edad con pasaporte o cédula vigente (los hoteles y planners pueden proporcionarlos si viajan en pareja solitaria).
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-xs font-bold">3. Tiempos y Registro Oficial</AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground">
                      El Oficial del Estado Civil se traslada al hotel, playa o locación privada. El certificado legal apostillado se entrega en un plazo estimado de 15 a 21 días laborables tras el evento.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              <div className="md:col-span-6">
                <div className="relative rounded-3xl overflow-hidden shadow-lg border border-border">
                  <img 
                    src={laRomanaImg} 
                    alt="Ceremonia nupcial en República Dominicana" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6 text-white">
                    <div>
                      <p className="text-xs text-rose-300 font-bold uppercase">Asistencia Integral</p>
                      <p className="text-sm font-semibold mt-1">¿Prefieres una ceremonia simbólica o renovación de votos?</p>
                      <p className="text-xs text-white/80 mt-0.5">No requiere papeleo legal previo.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Paquetes de Luna de Miel */}
          <section className="container mx-auto px-4 mt-16 max-w-6xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold text-rose-500 uppercase tracking-widest block mb-1">Viajes de Pareja</span>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                  Paquetes de Luna de Miel Curados
                </h2>
              </div>
              <Link to="/alojamientos" className="text-xs text-rose-500 font-bold hover:underline flex items-center gap-1">
                Ver Alojamientos Románticos <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {paquetesLunaMiel.map((paquete, idx) => (
                <Card key={idx} className="overflow-hidden border border-border/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img src={paquete.imagen} alt={paquete.nombre} className="w-full h-full object-cover" />
                      <Badge className="absolute top-3 left-3 bg-rose-500 text-white text-[10px]">
                        {paquete.tipo}
                      </Badge>
                    </div>
                    <CardContent className="p-5 space-y-2">
                      <h3 className="font-serif font-bold text-base text-foreground">{paquete.nombre}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {paquete.descripcion}
                      </p>
                    </CardContent>
                  </div>

                  <div className="p-5 pt-0 border-t border-border/50 flex items-center justify-between mt-3">
                    <div>
                      <span className="text-[10px] text-muted-foreground block uppercase">Paquete Pareja Desde</span>
                      <span className="text-lg font-bold font-mono text-foreground">${paquete.precio.toLocaleString()} USD</span>
                    </div>
                    <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold">
                      Cotizar Paquete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Banner Publicitario Panorama */}
          <section className="container mx-auto px-4 mt-16 max-w-5xl">
            <PanoramaAd />
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
