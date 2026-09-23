import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { PanoramaAd } from "@/components/promo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { 
  CableCar, Clock, DollarSign, MapPin, Users, ChevronRight, 
  Info, Shield, Mountain, CreditCard, Sparkles, ArrowRight, Eye, Train
} from "lucide-react";

import santoDomingoImg from "@/assets/santo-domingo.jpg";

const estacionesDetalle = [
  {
    nombre: "Estación Gualey (T1)",
    conexion: "Conexión directa con Metro Línea 2 (Estación Eduardo Brito)",
    destacado: "Punto neurálgico que une el centro metropolitano con el sistema aéreo.",
    turismo: "Fácil acceso para conectar hacia la Zona Colonial y el Malecón."
  },
  {
    nombre: "Estación Los Tres Brazos (T2)",
    conexion: "Cruce sobre el Río Ozama",
    destacado: "Vistas panorámicas espectaculares del curso fluvial y la vegetación ribereña.",
    turismo: "Ideal para tomar fotografías aéreas del Gran Santo Domingo."
  },
  {
    nombre: "Estación Sabana Perdida (T3)",
    conexion: "Estación de transferencia intermodal",
    destacado: "Centro de operaciones técnicas y garaje de cabinas electromecánicas.",
    turismo: "Conecta con rutas de autobuses hacia Santo Domingo Norte y Parque Mirador Norte."
  },
  {
    nombre: "Estación Los Alcarrizos (Línea 2)",
    conexion: "Conexión Autopista Duarte",
    destacado: "Terminal moderna con capacidad de alta demanda y accesibilidad total.",
    turismo: "Puerta de entrada oeste hacia el Cibao y el interior del país."
  }
];

const lineasTeleferico = [
  {
    nombre: "Línea 1 (Cuenca del Ozama)",
    ruta: "Gualey ↔ Sabana Perdida",
    longitud: "5.2 km",
    estaciones: 4,
    tiempo: "10 minutos",
    descripcion: "Cruza el río Ozama conectando el Distrito Nacional con Santo Domingo Norte. Reduce un trayecto que antes tomaba más de 1 hora en tráfico pesado a solo 10 minutos de vuelo silencioso.",
  },
  {
    nombre: "Línea 2 (Los Alcarrizos)",
    ruta: "Los Americanos ↔ Los Alcarrizos Central",
    longitud: "4.2 km",
    estaciones: 4,
    tiempo: "12 minutos",
    descripcion: "Sistema de transporte por cable de última generación que comunica los sectores de mayor densidad del oeste con la red troncal del Metro de Santo Domingo.",
  },
];

const tarifas = [
  { tipo: "Pasaje Integrado (Teleférico + Metro)", precio: "RD$ 35 (USD 0.60)", desc: "Permite trasbordo sin costo adicional entre teleférico y metro." },
  { tipo: "Viaje Sencillo Teleférico", precio: "RD$ 20 (USD 0.35)", desc: "Válido para un único trayecto en el sistema de cabinas." },
  { tipo: "Tarjeta Recargable RD Pass / Metro", precio: "RD$ 60 (Emisión única)", desc: "Tarjeta contactless reutilizable para turistas y residentes." },
];

const datos = [
  { label: "Capacidad por cabina", value: "10 personas" },
  { label: "Cabinas en operación", value: "290+" },
  { label: "Velocidad constante", value: "21.6 km/h" },
  { label: "Altura panorámica", value: "60 metros" },
  { label: "Capacidad / hora", value: "4,500 pas." },
  { label: "Integración Metro", value: "100% Gratuita" },
];

export default function TelefericoSantoDomingo() {
  return (
    <PageTransition>
      <SEOHead
        title="Teleférico de Santo Domingo - Guía de Transporte Aéreo y Vistas Panorámicas | DescubreRD"
        description="Conoce el Teleférico de Santo Domingo: líneas 1 y 2, estaciones, tarifas integradas con el Metro, horarios y cómo disfrutar de las mejores vistas del río Ozama."
        keywords="teleferico santo domingo, transporte santo domingo, metro teleferico rd, ruta gualey sabana perdida, los alcarrizos teleferico, vistas rio ozama"
      />
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />

        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[460px] flex items-end overflow-hidden">
          <img
            src={santoDomingoImg}
            alt="Teleférico de Santo Domingo sobrevolando la ciudad y el Río Ozama"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-black/35" />

          <div className="relative z-10 container mx-auto px-4 lg:px-8 pb-12">
            <nav className="flex items-center gap-2 text-xs md:text-sm text-white/80 mb-4">
              <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link to="/transporte-urbano" className="hover:text-primary transition-colors">Transporte Urbano</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-white font-medium">Teleférico de Santo Domingo</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <Badge className="mb-3 bg-sky-500/20 text-sky-300 border-sky-500/30 text-xs px-3 py-1 font-semibold">
                  <CableCar className="h-3.5 w-3.5 mr-1.5" /> TRANSPORTE URBANO SOSTENIBLE
                </Badge>
                <h1 className="font-display text-4xl md:text-6xl font-black text-white tracking-tight mb-3">
                  Teleférico de Santo Domingo
                </h1>
                <p className="text-base md:text-lg text-white/90 max-w-2xl leading-relaxed">
                  El sistema de transporte por cable más innovador del Caribe. Sobrevuela el río Ozama en cabinas silenciosas con vistas panorámicas únicas de la capital.
                </p>
              </div>

              {/* Stats Box */}
              <div className="flex flex-wrap gap-3 bg-black/50 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-white">
                <div className="text-center px-3 border-r border-white/10 last:border-none">
                  <p className="font-display text-2xl font-bold text-primary">2</p>
                  <p className="text-[11px] text-white/70 uppercase">Líneas Activas</p>
                </div>
                <div className="text-center px-3 border-r border-white/10 last:border-none">
                  <p className="font-display text-2xl font-bold text-emerald-400">10 min</p>
                  <p className="text-[11px] text-white/70 uppercase">Vuelo Promedio</p>
                </div>
                <div className="text-center px-3">
                  <p className="font-display text-2xl font-bold text-sky-400">RD$ 35</p>
                  <p className="text-[11px] text-white/70 uppercase">Con Metro Incluido</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Data Ribbon */}
        <section className="py-6 border-b border-border bg-card/50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
              {datos.map((d) => (
                <div key={d.label} className="p-2">
                  <p className="font-display text-lg font-bold text-primary">{d.value}</p>
                  <p className="text-xs text-muted-foreground">{d.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lines and Operations */}
        <section className="py-16 container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">
              RED DE RUTAS
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Líneas en Funcionamiento
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
              Conexión directa entre el Distrito Nacional, Santo Domingo Norte y Santo Domingo Oeste.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {lineasTeleferico.map((linea) => (
              <Card key={linea.nombre} className="border-border/80 bg-card hover:border-primary/40 transition-all flex flex-col">
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-xs font-bold">
                      {linea.nombre.split("(")[0]}
                    </Badge>
                    <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {linea.tiempo}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-xl text-foreground mb-2">
                    {linea.ruta}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-6 flex-1">
                    {linea.descripcion}
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>Longitud: <strong className="text-foreground">{linea.longitud}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CableCar className="h-4 w-4 text-primary" />
                      <span>Estaciones: <strong className="text-foreground">{linea.estaciones}</strong></span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Interactive Stations Guide */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            <h3 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" /> Estaciones Clave & Conexiones Turísticas
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {estacionesDetalle.map((est) => (
                <div key={est.nombre} className="p-4 bg-muted/30 rounded-xl border border-border/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-foreground text-sm">{est.nombre}</h4>
                    <Badge variant="outline" className="text-[10px]">Conexión</Badge>
                  </div>
                  <p className="text-xs text-primary font-medium">{est.conexion}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{est.destacado}</p>
                  <p className="text-[11px] text-muted-foreground/80 italic pt-1">💡 {est.turismo}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fares & Schedule */}
        <section className="py-16 bg-card/40 border-y border-border/50">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">
                  TARIFAS INTEGRADAS
                </Badge>
                <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                  Cómo Pagar y Moverte en Teleférico
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  El Teleférico de Santo Domingo utiliza la tarjeta inteligente del Metro. Si entras al Metro y haces transbordo al teleférico en la estación Eduardo Brito / Gualey, ¡el viaje en teleférico no tiene costo adicional!
                </p>

                <div className="space-y-3">
                  {tarifas.map((t) => (
                    <div key={t.tipo} className="p-4 bg-card rounded-xl border border-border">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-sm text-foreground">{t.tipo}</span>
                        <Badge variant="secondary" className="font-bold text-primary">{t.precio}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{t.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Operations Box */}
              <div className="bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 rounded-2xl p-6 md:p-8 space-y-6">
                <div>
                  <h3 className="font-display font-bold text-xl text-foreground mb-2 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" /> Horarios de Servicio
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between py-1.5 border-b border-border">
                      <span>Lunes a Viernes:</span>
                      <strong className="text-foreground">6:00 AM – 10:30 PM</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border">
                      <span>Sábados:</span>
                      <strong className="text-foreground">6:00 AM – 9:00 PM</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border">
                      <span>Domingos y Feriados:</span>
                      <strong className="text-foreground">8:00 AM – 9:00 PM</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-start gap-3 bg-secondary/50 p-4 rounded-xl text-xs text-muted-foreground">
                    <Eye className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>
                      <strong>Consejo turístico:</strong> Los mejores horarios para tomar fotos panorámicas con la luz dorada sobre el río Ozama son entre las 5:00 PM y las 6:30 PM.
                    </span>
                  </div>
                </div>

                <Button asChild className="w-full gap-2">
                  <Link to="/metro-santo-domingo">
                    <Train className="h-4 w-4" /> Ver Red de Metro de Santo Domingo
                  </Link>
                </Button>
              </div>
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
