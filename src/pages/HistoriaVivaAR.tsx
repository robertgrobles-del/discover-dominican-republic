import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, Download, ScanLine, Camera, MapPin, Clock,
  ChevronRight, Play, QrCode, FileDown
} from "lucide-react";

import santoDomingo from "@/assets/santo-domingo.jpg";
import colonialDoor from "@/assets/colonial-door.jpg";
import history from "@/assets/history.jpg";

const pasos = [
  {
    numero: 1,
    titulo: "Descarga la App",
    descripcion: "Nuestra app utiliza geolocalización y reconocimiento de imagen para superponer la historia sobre el presente. No necesitas equipos costosos, solo tu celular.",
    icono: Download
  },
  {
    numero: 2,
    titulo: "Encuentra el Marcador",
    descripcion: "Disponible gratis para iOS y Android. Busca \"Turismo RD AR\". Ubícate frente al monumento o descarga el marcador PDF en casa.",
    icono: ScanLine
  },
  {
    numero: 3,
    titulo: "Apunta y Descubre",
    descripcion: "Usa tu cámara para ver cómo las ruinas cobran vida en 3D interactivo. Viaja en el tiempo sin moverte del lugar.",
    icono: Camera
  }
];

const experiencias = [
  {
    id: "alcazar-colon",
    nombre: "Alcázar de Colón",
    año: "1511",
    descripcion: "Explora la residencia del virrey Diego Colón tal como era en su esplendor original.",
    destacado: true,
    imagen: santoDomingo
  },
  {
    id: "monasterio-san-francisco",
    nombre: "Monasterio de San Francisco",
    año: "1508",
    descripcion: "El primer monasterio del Nuevo Mundo. Observa cómo las ruinas se completan con arcos y techos digitales.",
    imagen: history
  },
  {
    id: "catedral-primada",
    nombre: "Catedral Primada",
    año: "1541",
    descripcion: "Descubre los detalles góticos que se han perdido con el tiempo y revive la majestuosidad original.",
    imagen: colonialDoor
  }
];

export default function HistoriaVivaAR() {
  return (
    <PageTransition>
      <SEOHead
        title="Historia Viva AR - Realidad Aumentada en Monumentos de RD"
        description="Viaja en el tiempo con Realidad Aumentada. Descubre el Alcázar de Colón, Monasterio de San Francisco y más monumentos históricos como eran hace 500 años."
        keywords="realidad aumentada RD, historia dominicana, monumentos coloniales, AR turismo, Ciudad Colonial virtual"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        {/* Hero */}
        <section className="relative h-[70vh] min-h-[600px] flex items-center justify-center">
          <div className="absolute inset-0">
            <img
              src={history}
              alt="Historia Viva AR"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/85" />
          </div>
          
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <Badge className="mb-6 bg-purple-500/20 text-purple-400 border-purple-500/30">
              NUEVA EXPERIENCIA
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
              Historia Viva:
              <br />
              <span className="text-gradient">Realidad Aumentada</span>
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
              Viaja en el tiempo y descubre el Monasterio de San Francisco tal como era en el siglo XVI con nuestra tecnología de Realidad Aumentada.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="gap-2">
                Ver Demo <Play className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                <Download className="h-4 w-4" /> Descargar Marcadores
              </Button>
            </div>
          </div>
        </section>

        {/* Pasos */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">Tres pasos para viajar al pasado</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {pasos.map((paso, index) => (
                <motion.div
                  key={paso.numero}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="bg-card rounded-2xl border border-border p-8 h-full">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                      <paso.icono className="h-6 w-6 text-primary" />
                    </div>
                    <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                      {paso.numero}
                    </div>
                    <h3 className="font-display font-bold text-xl text-foreground mb-3">{paso.titulo}</h3>
                    <p className="text-muted-foreground">{paso.descripcion}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Galería de Experiencias */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">Galería de Experiencias</h2>
                <p className="text-muted-foreground">Monumentos disponibles actualmente en la plataforma.</p>
              </div>
              <Button variant="outline" className="gap-2">
                Ver todas las experiencias <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {experiencias.map((exp, index) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/50 transition-colors"
                >
                  <div className="relative h-48">
                    <img 
                      src={exp.imagen} 
                      alt={exp.nombre}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    {exp.destacado && (
                      <Badge className="absolute top-3 left-3 bg-purple-500 text-white">DESTACADO</Badge>
                    )}
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-semibold">{exp.nombre}</span>
                        <Badge variant="secondary" className="bg-background/80">{exp.año}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-muted-foreground mb-4">{exp.descripcion}</p>
                    
                    {/* Timeline Slider */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs text-muted-foreground">HOY</span>
                      <div className="flex-1 h-1 bg-secondary rounded-full relative">
                        <div className="absolute left-1/2 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full" />
                      </div>
                      <span className="text-xs text-primary font-medium">{exp.año}</span>
                    </div>
                    
                    <Button className="w-full gap-2">
                      <Smartphone className="h-4 w-4" /> Probar en App
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Marcadores desde casa */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-amber-500/20 text-amber-400 border-amber-500/30">
                  ¿NO ESTÁS EN RD?
                </Badge>
                <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                  Vive la experiencia desde casa
                </h2>
                <p className="text-muted-foreground mb-6">
                  No te preocupes. Puedes vivir la experiencia desde la comodidad de tu hogar. 
                  Descarga e imprime nuestros marcadores oficiales, colócalos en una superficie plana y apunta con la app.
                </p>
                <Button size="lg" className="gap-2">
                  <FileDown className="h-4 w-4" /> Descargar Guía PDF de Marcadores
                </Button>
              </div>

              <div className="bg-card rounded-2xl border border-border p-8 text-center">
                <div className="w-48 h-48 mx-auto mb-6 bg-secondary rounded-xl flex items-center justify-center">
                  <QrCode className="h-24 w-24 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">
                  Escanea este código con la app "Turismo RD" para visualizar el modelo 3D.
                </p>
                <Badge variant="secondary">Ejemplo de Marcador</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Descarga App */}
        <section className="py-16 bg-gradient-to-r from-purple-500/10 to-primary/10">
          <div className="container mx-auto px-4 text-center">
            <Smartphone className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Descarga la App</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Disponible gratis para iOS y Android. Busca "Turismo RD AR" en tu tienda de aplicaciones.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="outline" className="gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                App Store
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z"/>
                </svg>
                Google Play
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
