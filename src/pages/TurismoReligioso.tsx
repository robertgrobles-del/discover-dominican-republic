import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Church, MapPin, Clock, ChevronRight, Calendar, Download, 
  Play, Navigation
} from "lucide-react";
import { useState } from "react";

import santoDomingo from "@/assets/santo-domingo.jpg";
import colonialDoor from "@/assets/colonial-door.jpg";

const destinosSagrados = [
  {
    id: "catedral-primada",
    nombre: "Catedral Primada de América",
    ubicacion: "Ciudad Colonial, Santo Domingo",
    etiqueta: "PATRIMONIO UNESCO",
    descripcion: "La Catedral Santa María la Menor es la primera catedral del Nuevo Mundo, dedicada a Santa María de la Encarnación. Una joya del gótico tardío y el estilo plateresco que alberga siglos de historia.",
    imagen: santoDomingo,
    horarios: [
      { dia: "Lunes - Sábado", hora: "5:00 PM" },
      { dia: "Domingos", hora: "10:00 AM, 12:00 PM, 5:00 PM" }
    ]
  },
  {
    id: "santo-cerro",
    nombre: "Santo Cerro",
    ubicacion: "La Vega",
    etiqueta: "SANTUARIO NACIONAL",
    descripcion: "Santuario Nacional Nuestra Señora de las Mercedes. Ubicado en la cima de una colina sagrada, ofrece una vista panorámica del Valle del Cibao y es un lugar de profunda devoción mariana.",
    imagen: colonialDoor,
    horarios: [
      { dia: "Diario", hora: "9:00 AM, 4:00 PM" },
      { dia: "Día de las Mercedes (24 sept)", hora: "Horario Especial (Cada hora)" }
    ]
  },
  {
    id: "basilica-higuey",
    nombre: "Basílica de Higüey",
    ubicacion: "Higüey, La Altagracia",
    etiqueta: "CENTRO DE PEREGRINACIÓN",
    descripcion: "Catedral Basílica de Nuestra Señora de la Altagracia. Un monumento arquitectónico moderno y el centro de peregrinación más importante del país, hogar de la madre espiritual de los dominicanos.",
    imagen: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=600&h=400&fit=crop",
    horarios: [
      { dia: "Lunes - Sábado", hora: "5:30 AM, 6:00 PM" },
      { dia: "Domingos", hora: "5:30 AM, 8:00 AM, 10:00 AM, 6:00 PM" }
    ]
  }
];

const rutaPeregrino = [
  { ciudad: "Santo Domingo", destino: "Catedral Primada" },
  { ciudad: "La Vega", destino: "Santo Cerro" },
  { ciudad: "Higüey", destino: "Basílica de la Altagracia" }
];

export default function TurismoReligioso() {
  const [selectedDestino, setSelectedDestino] = useState<string | null>(null);

  return (
    <PageTransition>
      <SEOHead
        title="Turismo Religioso en República Dominicana - Rutas de la Fe"
        description="Descubre los destinos sagrados de RD: Catedral Primada de América, Santo Cerro y Basílica de Higüey. Rutas de peregrinación y horarios de misas."
        keywords="turismo religioso RD, Basílica Higüey, Catedral Primada, Santo Cerro, peregrinación dominicana"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        {/* Hero */}
        <section className="relative h-[70vh] min-h-[600px] flex items-center justify-center">
          <div className="absolute inset-0">
            <img
              src={santoDomingo}
              alt="Turismo Religioso RD"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/85" />
          </div>
          
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <Badge className="mb-6 bg-amber-500/20 text-amber-400 border-amber-500/30">
              RUTAS DE LA FE
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
              Turismo Religioso RD
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
              Recorre los tres pilares de la fe dominicana. Desde la primera catedral del Nuevo Mundo hasta el santuario de la patrona nacional.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="gap-2">
                Comenzar Peregrinación <ChevronRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                <Play className="h-4 w-4" /> Ver Video Introductorio
              </Button>
            </div>
          </div>
        </section>

        {/* Destinos Sagrados */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">Destinos Sagrados</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Los tres pilares de la fe dominicana.</p>
            </div>

            <div className="space-y-8">
              {destinosSagrados.map((destino, index) => (
                <motion.div
                  key={destino.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl border border-border overflow-hidden"
                >
                  <div className="grid lg:grid-cols-2 gap-0">
                    <div className="relative h-64 lg:h-auto">
                      <img 
                        src={destino.imagen} 
                        alt={destino.nombre}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-4 left-4 bg-amber-500 text-white">
                        {destino.etiqueta}
                      </Badge>
                    </div>
                    <div className="p-8">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        {destino.ubicacion}
                      </div>
                      <h3 className="font-display text-2xl font-bold text-foreground mb-4">{destino.nombre}</h3>
                      <p className="text-muted-foreground mb-6">{destino.descripcion}</p>
                      
                      {/* Horarios */}
                      <div className="bg-secondary/50 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                          <Clock className="h-4 w-4 text-primary" />
                          Horarios de Misas
                        </div>
                        <div className="space-y-2">
                          {destino.horarios.map((horario, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{horario.dia}</span>
                              <span className="text-foreground font-medium">{horario.hora}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Link to={`/destino-religioso/${destino.id}`} className="flex-1">
                          <Button className="w-full gap-2">
                            Leer historia completa <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="outline">Ver horarios</Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Ruta del Peregrino */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-4">Ruta del Peregrino</h2>
                <p className="text-muted-foreground mb-8">
                  Mapa interactivo conectando los puntos sagrados de la República Dominicana. Planifica tu peregrinación espiritual.
                </p>

                <div className="space-y-4 mb-8">
                  {rutaPeregrino.map((punto, index) => (
                    <div key={punto.ciudad} className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{punto.ciudad}</p>
                        <p className="text-sm text-muted-foreground">{punto.destino}</p>
                      </div>
                      {index < rutaPeregrino.length - 1 && (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button className="gap-2">
                    <Download className="h-4 w-4" /> Descargar Mapa Offline
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Navigation className="h-4 w-4" /> Abrir en Maps
                  </Button>
                </div>
              </div>

              {/* Mapa Visual */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="aspect-square relative">
                  <img 
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=800&fit=crop"
                    alt="Mapa de la ruta"
                    className="w-full h-full object-cover opacity-50"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Church className="h-16 w-16 text-primary mx-auto mb-4" />
                      <p className="text-foreground font-semibold">Mapa Interactivo</p>
                      <p className="text-sm text-muted-foreground">3 destinos sagrados</p>
                    </div>
                  </div>
                  
                  {/* Marcadores */}
                  <div className="absolute top-1/4 left-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg" />
                  <div className="absolute top-1/2 left-1/3 w-4 h-4 bg-amber-500 rounded-full border-2 border-white shadow-lg" />
                  <div className="absolute bottom-1/3 right-1/3 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-lg" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Horarios Consolidados */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">Horarios de Misas</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {destinosSagrados.map((destino) => (
                <div key={destino.id} className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4">{destino.nombre.split(" ").slice(0, 2).join(" ")}</h3>
                  <Badge className="mb-4 bg-emerald-500/20 text-emerald-400">Abierto</Badge>
                  <div className="space-y-3">
                    {destino.horarios.map((horario, i) => (
                      <div key={i} className="flex justify-between text-sm border-b border-border pb-2 last:border-0">
                        <span className="text-muted-foreground">{horario.dia}</span>
                        <span className="text-foreground font-medium">{horario.hora}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Arte Sacro Teaser */}
        <section className="py-16 bg-gradient-to-r from-amber-500/10 to-primary/10">
          <div className="container mx-auto px-4 text-center">
            <Church className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Arte Sacro</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Descubre las obras maestras del arte religioso dominicano. Retablos, esculturas y pinturas que narran siglos de devoción.
            </p>
            <Button size="lg" className="gap-2">
              Explorar Galería <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
