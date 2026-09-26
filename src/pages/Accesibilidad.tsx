import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Accessibility, Search, ChevronRight, Star, MapPin, Play, Bus, Phone, Eye, Volume2, Type, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { FavoriteButton } from "@/components/FavoriteButton";

import puntaCana from "@/assets/punta-cana.jpg";
import laRomana from "@/assets/la-romana.jpg";
import santoDomingo from "@/assets/santo-domingo.jpg";

const filtros = [
  { id: "todos", label: "Todos", icon: "📍" },
  { id: "hoteles", label: "Hoteles", icon: "🏨" },
  { id: "playas", label: "Playas", icon: "🏖️" },
  { id: "transporte", label: "Transporte", icon: "🚌" },
  { id: "cultura", label: "Cultura", icon: "🏛️" },
];

const herramientasAccesibilidad = [
  { id: "texto", label: "Tamaño Texto", desc: "Ajustar lectura", icon: Type },
  { id: "contraste", label: "Alto Contraste", desc: "Monocromático", icon: Eye },
  { id: "voz", label: "Lectura de Voz", desc: "Escuchar sitio", icon: Volume2 },
];

const lugaresDestacados = [
  {
    id: "hotel-punta-cana",
    nombre: "Hotel Punta Cana Accessible",
    ubicacion: "Bávaro, Punta Cana",
    rating: 4.9,
    imagen: puntaCana,
    caracteristicas: ["Rampas", "Grúa Piscina", "Puertas Anchas"],
    cta: "Ver Detalles",
  },
  {
    id: "playa-bayahibe",
    nombre: "Playa Bayahíbe Inclusiva",
    ubicacion: "Bayahíbe, La Romana",
    rating: 4.7,
    imagen: laRomana,
    caracteristicas: ["Sillas Anfibias", "Pasarelas", "Baños Adaptados"],
    cta: "Ver Guía de Playa",
  },
  {
    id: "museo-casas-reales",
    nombre: "Museo de las Casas Reales",
    ubicacion: "Zona Colonial, Santo Domingo",
    rating: 4.8,
    imagen: santoDomingo,
    caracteristicas: ["Ascensor", "Audio Guía", "Carteles Braille"],
    cta: "Planificar Visita",
  },
];

const transporteAdaptado = [
  { id: "taxis", titulo: "Taxis Adaptados", desc: "Servicio 24/7 en Santo Domingo y Punta Cana", cta: "Ver lista" },
  { id: "metro", titulo: "Metro y OMSA", desc: "Mapas de estaciones con ascensores", cta: "Ver mapas" },
];

export default function Accesibilidad() {
  const [filtroActivo, setFiltroActivo] = useState("todos");
  const [search, setSearch] = useState("");

  return (
    <PageTransition>
      <SEOHead
        title="Turismo Accesible en República Dominicana"
        description="Encuentra hoteles, playas y museos con rampas, sillas anfibias y otras facilidades certificadas, además de transporte adaptado para viajar con total accesibilidad."
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        {/* Hero */}
        <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center">
          <div className="absolute inset-0">
            <img
              src={laRomana}
              alt="Turismo Accesible RD"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
          </div>
          
          <div className="relative z-10 text-center px-4 max-w-4xl">
            <Badge className="mb-4 bg-green-500/20 text-green-400 border-green-500/30">
              <Accessibility className="h-3 w-3 mr-1" /> TURISMO INCLUSIVO CERTIFICADO
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Turismo sin Barreras en{" "}
              <span className="text-gradient">República Dominicana</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Descubre playas con pasarelas, hoteles adaptados y experiencias culturales diseñadas para todos. Tu aventura comienza aquí.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" className="gap-2">
                <Accessibility className="h-4 w-4" /> Explorar Destinos
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Play className="h-4 w-4" /> Ver Video Guía
              </Button>
            </div>
          </div>
        </section>

        {/* Herramientas de Accesibilidad */}
        <section className="py-6 border-b border-border bg-card/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-8 flex-wrap">
              {herramientasAccesibilidad.map((tool) => (
                <button
                  key={tool.id}
                  className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <tool.icon className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium text-sm text-foreground">{tool.label}</p>
                    <p className="text-xs">{tool.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Buscador */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar hoteles, playas o museos accesibles..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 h-12 bg-card border-border"
                />
                <Button className="absolute right-2 top-1/2 -translate-y-1/2" size="sm">
                  Buscar
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 flex-wrap">
                {filtros.map((filtro) => (
                  <button
                    key={filtro.id}
                    onClick={() => setFiltroActivo(filtro.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
                      filtroActivo === filtro.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span>{filtro.icon}</span>
                    <span className="font-medium text-sm">{filtro.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Lugares Destacados */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Destinos Destacados</h2>
                <p className="text-sm text-muted-foreground">Lugares verificados con las mejores facilidades de accesibilidad</p>
              </div>
              <Button variant="link" className="text-primary gap-1">
                Ver todos <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {lugaresDestacados.map((lugar, index) => (
                <motion.div
                  key={lugar.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl border border-border overflow-hidden group"
                >
                  <div className="relative aspect-[4/3]">
                    <img
                      src={lugar.imagen}
                      alt={lugar.nombre}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <Badge className="absolute top-3 left-3 bg-card/90 text-foreground gap-1">
                      <Star className="h-3 w-3 text-primary fill-primary" /> {lugar.rating}
                    </Badge>
                    <FavoriteButton
                      id={lugar.id}
                      type="destino"
                      name={lugar.nombre}
                      image={lugar.imagen}
                      location={lugar.ubicacion}
                      className="absolute top-3 right-3"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-foreground mb-1">{lugar.nombre}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-4">
                      <MapPin className="h-3 w-3" /> {lugar.ubicacion}
                    </p>
                    <div className="flex gap-2 flex-wrap mb-4">
                      {lugar.caracteristicas.map((carac) => (
                        <Badge key={carac} variant="secondary" className="text-xs gap-1">
                          <CheckCircle className="h-3 w-3 text-green-400" /> {carac}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full">{lugar.cta}</Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Transporte Adaptado */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-2 text-primary mb-4">
                  <Bus className="h-5 w-5" />
                  <span className="text-sm font-semibold uppercase tracking-wider">Transporte Adaptado</span>
                </div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                  Muévete con libertad y seguridad por todo el país
                </h2>
                <p className="text-muted-foreground mb-6">
                  Conectamos contigo los mejores servicios de transporte accesibles. Desde taxis con rampas hidráulicas hasta rutas de autobuses verificadas.
                </p>

                <div className="space-y-4">
                  {transporteAdaptado.map((item) => (
                    <div key={item.id} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Bus className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{item.titulo}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                      <Button variant="link" className="text-primary">{item.cta}</Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop"
                    alt="Transporte accesible"
                    className="w-full aspect-[3/2] object-cover"
                  />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-card/95 backdrop-blur-sm rounded-xl p-4 border border-border">
                      <Badge className="mb-2 bg-green-500/20 text-green-400">Servicio Recomendado</Badge>
                      <h3 className="font-semibold text-foreground">RD Taxis Accesibles</h3>
                      <p className="text-sm text-muted-foreground">Certificados por CONADIS</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contacto */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="bg-card rounded-2xl border border-border p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Línea de Asistencia Accesible</p>
                  <p className="text-2xl font-bold text-primary">+1 (809) 555-0123</p>
                </div>
              </div>
              <p className="text-muted-foreground text-center md:text-left">
                Disponible 24/7 con intérpretes de lenguaje de señas por videollamada
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
