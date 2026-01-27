import { useState } from "react";
import { motion } from "framer-motion";
import { View, Play, MapPin, Clock, Star, Expand, Volume2, VolumeX, ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import samanaImg from "@/assets/samana.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import puertoPlataImg from "@/assets/puerto-plata.jpg";

const tours360 = [
  {
    id: "zona-colonial",
    name: "Zona Colonial",
    location: "Santo Domingo",
    duration: "15 min",
    image: santoDomingoImg,
    rating: 4.9,
    views: "12.5K",
    category: "Historia",
    description: "Recorre las calles empedradas más antiguas de América.",
    highlights: ["Catedral Primada", "Alcázar de Colón", "Calle Las Damas"],
  },
  {
    id: "playa-bavaro",
    name: "Playa Bávaro",
    location: "Punta Cana",
    duration: "10 min",
    image: puntaCanaImg,
    rating: 4.8,
    views: "28.3K",
    category: "Playas",
    description: "Sumérgete en las aguas turquesas del Caribe.",
    highlights: ["Arena blanca", "Arrecifes de coral", "Atardecer"],
  },
  {
    id: "los-haitises",
    name: "Parque Los Haitises",
    location: "Samaná",
    duration: "20 min",
    image: samanaImg,
    rating: 5.0,
    views: "8.7K",
    category: "Naturaleza",
    description: "Navega entre mogotes y cuevas taínas.",
    highlights: ["Cuevas", "Manglares", "Aves endémicas"],
  },
  {
    id: "teleferico",
    name: "Teleférico",
    location: "Puerto Plata",
    duration: "12 min",
    image: puertoPlataImg,
    rating: 4.7,
    views: "15.2K",
    category: "Aventura",
    description: "Asciende a la cima del Pico Isabel de Torres.",
    highlights: ["Vista panorámica", "Cristo Redentor", "Jardín Botánico"],
  },
];

const vrFeatures = [
  { title: "Compatibilidad VR", description: "Oculus, HTC Vive, Cardboard" },
  { title: "Audio espacial", description: "Sonidos ambientales inmersivos" },
  { title: "Navegación libre", description: "Explora a tu propio ritmo" },
  { title: "Información interactiva", description: "Puntos de interés clickeables" },
];

export default function Tours360() {
  const [selectedTour, setSelectedTour] = useState<typeof tours360[0] | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <PageTransition>
      <SEOHead
        title="Tours Virtuales 360° | Turismo RD"
        description="Explora República Dominicana desde casa con tours virtuales inmersivos en 360 grados."
        keywords="tours virtuales, 360, VR, realidad virtual, República Dominicana, inmersivo"
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative h-[60vh] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={santoDomingoImg}
              alt="Tour 360"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          </div>
          
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
                <View className="h-5 w-5" />
                <span className="font-medium">Inmersión Total</span>
              </div>
              <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
                Tours <span className="text-primary">360°</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Explora los destinos más impresionantes de República Dominicana 
                sin moverte de tu sofá. Experiencias inmersivas en realidad virtual.
              </p>
              <div className="flex gap-4">
                <Button size="lg" className="gap-2">
                  <Play className="h-5 w-5" />
                  Comenzar Tour
                </Button>
                <Button size="lg" variant="outline">
                  Ver con VR
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* VR Features */}
        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {vrFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <h3 className="font-bold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Tours Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="font-display text-3xl font-bold mb-4">
                Tours <span className="text-primary">Disponibles</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                Selecciona un destino y sumérgete en una experiencia visual única.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {tours360.map((tour, index) => (
                <motion.div
                  key={tour.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="overflow-hidden group cursor-pointer"
                    onClick={() => setSelectedTour(tour)}
                  >
                    <div className="relative h-64">
                      <img
                        src={tour.image}
                        alt={tour.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                      
                      {/* Play button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 bg-primary/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="h-8 w-8 text-primary-foreground ml-1" />
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge>{tour.category}</Badge>
                        <Badge variant="secondary" className="gap-1">
                          <View className="h-3 w-3" />
                          {tour.views}
                        </Badge>
                      </div>

                      {/* Duration */}
                      <Badge className="absolute top-4 right-4 bg-black/50 backdrop-blur">
                        <Clock className="h-3 w-3 mr-1" />
                        {tour.duration}
                      </Badge>
                    </div>

                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-display text-xl font-bold">{tour.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {tour.location}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span className="font-bold">{tour.rating}</span>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm mb-4">{tour.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {tour.highlights.map((h) => (
                          <Badge key={h} variant="outline" className="text-xs">{h}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Tour Modal */}
        {selectedTour && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          >
            {/* Simulated 360 view */}
            <div className="relative w-full h-full">
              <img
                src={selectedTour.image}
                alt={selectedTour.name}
                className="w-full h-full object-cover"
              />
              
              {/* Controls */}
              <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className="bg-red-500 animate-pulse">● EN VIVO</Badge>
                  <span className="text-white font-bold">{selectedTour.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    <Expand className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={() => setSelectedTour(null)}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>

              {/* Navigation hint */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center">
                <p className="text-white/80 text-sm mb-2">Arrastra para mirar alrededor</p>
                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    Anterior
                  </Button>
                  <Button className="gap-2">
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Hotspots simulation */}
              <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2">
                <div className="w-8 h-8 bg-primary rounded-full animate-ping absolute" />
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center relative">
                  <span className="text-xs font-bold text-white">1</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl font-bold mb-4">
                ¿Tienes gafas VR?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Descarga nuestra app para una experiencia completamente inmersiva 
                con tu Oculus, HTC Vive o Google Cardboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg">Descargar para Oculus</Button>
                <Button size="lg" variant="outline">Otras plataformas</Button>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
