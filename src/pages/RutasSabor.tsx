import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Coffee, Flame, Mountain, MapPin, Star, Clock, 
  Users, ChevronRight, Leaf, Calendar, Award, Camera, 
  Factory, Store, Wine, Play
} from "lucide-react";

import history from "@/assets/history.jpg";
import gastronomy from "@/assets/gastronomy.jpg";

// ================= CAFÉ DATA =================
const regionesCafe = [
  {
    nombre: "Jarabacoa",
    altitud: "500-1,500m",
    variedad: "Typica, Caturra",
    sabor: "Chocolate, nuez, cuerpo medio",
    imagen: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&h=400&fit=crop",
    fincas: ["Finca Alta Gracia", "Café Monte Alto", "Rancho Baiguate"],
  },
  {
    nombre: "Constanza",
    altitud: "1,200-1,800m",
    variedad: "Bourbon, Catuaí",
    sabor: "Frutal, acidez brillante, floral",
    imagen: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop",
    fincas: ["Finca Los Pinos", "Café Valle Nuevo"],
  },
  {
    nombre: "Barahona",
    altitud: "600-1,200m",
    variedad: "Typica",
    sabor: "Intenso, especiado, cacao",
    imagen: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=400&fit=crop",
    fincas: ["Finca La Esperanza", "Café Barahona Orgánico"],
  },
];

const toursCafe = [
  {
    nombre: "Tour Café Jarabacoa",
    duracion: "4 horas",
    precio: "$45",
    incluye: ["Recorrido por cafetales", "Proceso de tostado", "Cata profesional", "Almuerzo típico"],
    rating: 4.9,
  },
  {
    nombre: "Ruta del Café Premium",
    duracion: "Día completo",
    precio: "$95",
    incluye: ["Visita a 3 fincas", "Taller de barista", "Transporte", "Cena gourmet"],
    rating: 5.0,
  },
];

// ================= TABACO DATA =================
const casasProductoras = [
  {
    nombre: "La Aurora",
    fundacion: "1903",
    descripcion: "La fábrica de cigarros más antigua de la República Dominicana. Un símbolo de perseverancia y calidad mundial.",
    imagen: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop"
  },
  {
    nombre: "Arturo Fuente",
    fundacion: "1912",
    descripcion: "Cuatro generaciones de tradición familiar. Conocidos por su famosa capa OpusX.",
    imagen: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&h=300&fit=crop"
  },
  {
    nombre: "Davidoff",
    fundacion: "1970",
    descripcion: "Sinónimo de lujo y sofisticación. Filosofía del 'Tiempo Bellamente Llenado'.",
    imagen: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"
  }
];

const toursTabaco = [
  {
    nombre: "Tour Fábrica La Aurora",
    ubicacion: "Santiago de los Caballeros",
    duracion: "2 horas",
    precio: "$35 USD",
    incluye: ["Recorrido completo", "Museo del Tabaco", "Degustación guiada"],
  },
  {
    nombre: "Ruta del Tabaco Completa",
    ubicacion: "Villa González - Santiago",
    duracion: "Día completo",
    precio: "$95 USD",
    incluye: ["Visita a campos", "3 fábricas artesanales", "Almuerzo típico"],
  },
];

const maridajes = [
  { bebida: "Ron Añejo 12 años", cigarro: "Cigarro medio", nota: "Notas de vainilla y caramelo." },
  { bebida: "Whisky Single Malt", cigarro: "Cigarro fuerte", nota: "El ahumado realza los matices terrosos." },
  { bebida: "Café Dominicano", cigarro: "Cigarro suave", nota: "Potencia las notas achocolatadas." },
  { bebida: "Cognac VSOP", cigarro: "Cigarro premium", nota: "Elegancia francesa con tradición dominicana." }
];

export default function RutasSabor() {
  const [activeTab, setActiveTab] = useState("cafe");

  return (
    <PageTransition>
      <SEOHead
        title="Rutas del Sabor Dominicano - Café y Tabaco Premium"
        description="Descubre las rutas gastronómicas de República Dominicana: el café de montaña del Cibao y los cigarros premium de Santiago. Tours, fincas y experiencias únicas."
        keywords="café dominicano, cigarros premium, ruta del café, tabaco Santiago, La Aurora, Arturo Fuente, Jarabacoa"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        {/* Hero */}
        <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center mt-16">
          <div className="absolute inset-0">
            <img
              src={activeTab === "cafe" ? gastronomy : history}
              alt="Rutas del Sabor Dominicano"
              className="w-full h-full object-cover transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <Badge className="mb-4 bg-amber-500/20 text-amber-400 border-amber-500/30">
              EXPERIENCIAS SENSORIALES
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6">
              Rutas del{" "}
              <span className="text-gradient">Sabor Dominicano</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Un viaje sensorial por las tradiciones más auténticas de la isla: el café de las montañas del Cibao y el tabaco premium de Santiago.
            </p>
          </div>
        </section>

        {/* Tabs */}
        <section className="py-8 bg-card border-b border-border sticky top-16 z-40">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-auto gap-2 bg-transparent">
                <TabsTrigger
                  value="cafe"
                  className="flex items-center gap-2 data-[state=active]:bg-amber-600 data-[state=active]:text-white py-3"
                >
                  <Coffee className="h-4 w-4" />
                  Ruta del Café
                </TabsTrigger>
                <TabsTrigger
                  value="tabaco"
                  className="flex items-center gap-2 data-[state=active]:bg-amber-600 data-[state=active]:text-white py-3"
                >
                  <Flame className="h-4 w-4" />
                  Ruta del Tabaco
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* =========== CAFÉ TAB =========== */}
            {activeTab === "cafe" && (
              <div className="space-y-16">
                {/* Regiones */}
                <div>
                  <div className="text-center mb-12">
                    <h2 className="font-display text-3xl font-bold mb-4">
                      Regiones <span className="text-gradient">Cafetaleras</span>
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      Cada región produce un café con características únicas definidas por su terroir.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-8">
                    {regionesCafe.map((region, index) => (
                      <motion.div
                        key={region.nombre}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="group bg-card rounded-2xl overflow-hidden border border-border"
                      >
                        <div className="aspect-[4/3] relative overflow-hidden">
                          <img
                            src={region.imagen}
                            alt={region.nombre}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-4 left-4 text-white">
                            <h3 className="font-display text-2xl font-bold">{region.nombre}</h3>
                            <p className="text-white/80 flex items-center gap-1">
                              <Mountain className="h-4 w-4" />
                              {region.altitud}
                            </p>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="mb-4">
                            <p className="text-sm text-muted-foreground mb-1">Variedades:</p>
                            <p className="font-medium text-foreground">{region.variedad}</p>
                          </div>
                          <div className="mb-4">
                            <p className="text-sm text-muted-foreground mb-1">Notas de sabor:</p>
                            <p className="font-medium text-foreground">{region.sabor}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {region.fincas.map((finca) => (
                              <Badge key={finca} variant="secondary" className="text-xs">
                                {finca}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Tours Café */}
                <div className="bg-card rounded-2xl p-8 border border-border">
                  <h3 className="font-display text-2xl font-bold mb-6 text-center">
                    Tours y <span className="text-amber-500">Experiencias</span>
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {toursCafe.map((tour, index) => (
                      <Card key={tour.nombre} className="bg-background border-border">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <Badge className="bg-amber-500/20 text-amber-600">
                              <Coffee className="h-3 w-3 mr-1" />
                              Tour
                            </Badge>
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{tour.rating}</span>
                            </div>
                          </div>
                          <h4 className="font-display text-xl font-bold text-foreground mb-2">
                            {tour.nombre}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {tour.duracion}
                            </span>
                            <span className="font-bold text-primary text-lg">{tour.precio}</span>
                          </div>
                          <ul className="space-y-2 mb-6">
                            {tour.incluye.map((item) => (
                              <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Leaf className="h-3 w-3 text-amber-500" />
                                {item}
                              </li>
                            ))}
                          </ul>
                          <Button className="w-full gap-2 bg-amber-600 hover:bg-amber-700">
                            Reservar <ChevronRight className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* =========== TABACO TAB =========== */}
            {activeTab === "tabaco" && (
              <div className="space-y-16">
                {/* Casas Productoras */}
                <div>
                  <div className="text-center mb-12">
                    <Badge className="mb-4 bg-amber-500/20 text-amber-400 border-amber-500/30">
                      LEGADO Y TRADICIÓN
                    </Badge>
                    <h2 className="font-display text-3xl font-bold mb-4">Casas Productoras</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      Conozca las familias que han mantenido viva la llama de la excelencia durante generaciones.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-8">
                    {casasProductoras.map((casa, index) => (
                      <motion.div
                        key={casa.nombre}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="group bg-card rounded-xl overflow-hidden border border-border hover:border-amber-500/50 transition-all"
                      >
                        <div className="h-48 overflow-hidden">
                          <img
                            src={casa.imagen}
                            alt={casa.nombre}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                          />
                        </div>
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-foreground">{casa.nombre}</h3>
                            <Badge variant="outline" className="text-xs">{casa.fundacion}</Badge>
                          </div>
                          <p className="text-muted-foreground text-sm mb-4">{casa.descripcion}</p>
                          <Button variant="link" className="text-amber-500 p-0 gap-1">
                            Leer Historia <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Tours Tabaco */}
                <div className="bg-card rounded-2xl p-8 border border-border">
                  <h3 className="font-display text-2xl font-bold mb-6 text-center">
                    Experiencias y <span className="text-amber-500">Tours</span>
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {toursTabaco.map((tour) => (
                      <Card key={tour.nombre} className="bg-background border-border">
                        <CardContent className="p-6">
                          <h4 className="font-display font-bold text-xl text-foreground mb-2">{tour.nombre}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {tour.ubicacion}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {tour.duracion}
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-amber-500 mb-4">{tour.precio}</p>
                          <ul className="space-y-2 mb-6">
                            {tour.incluye.map((item, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                {item}
                              </li>
                            ))}
                          </ul>
                          <Button className="w-full bg-amber-600 hover:bg-amber-700">Reservar Ahora</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Maridaje */}
                <div>
                  <div className="text-center mb-8">
                    <Badge className="mb-4 bg-amber-500/20 text-amber-400 border-amber-500/30">
                      <Wine className="h-3 w-3 mr-1" />
                      ARTE DEL MARIDAJE
                    </Badge>
                    <h3 className="font-display text-2xl font-bold">Combinaciones Perfectas</h3>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {maridajes.map((item, index) => (
                      <motion.div
                        key={item.bebida}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-card rounded-xl border border-border p-6 text-center"
                      >
                        <Wine className="h-8 w-8 text-amber-500 mx-auto mb-4" />
                        <h4 className="font-bold text-foreground mb-1">{item.bebida}</h4>
                        <p className="text-sm text-primary mb-3">+ {item.cigarro}</p>
                        <p className="text-xs text-muted-foreground">{item.nota}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-amber-900 to-orange-900">
          <div className="container mx-auto px-4 text-center">
            {activeTab === "cafe" ? (
              <Coffee className="h-12 w-12 text-amber-300 mx-auto mb-4" />
            ) : (
              <Flame className="h-12 w-12 text-amber-300 mx-auto mb-4" />
            )}
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              {activeTab === "cafe"
                ? "Vive la experiencia cafetalera"
                : "¿Listo para una experiencia premium?"}
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              {activeTab === "cafe"
                ? "Reserva tu tour y lleva a casa el mejor café del Caribe."
                : "Planifique su visita al corazón del tabaco dominicano."}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="gap-2 bg-white text-amber-900 hover:bg-white/90">
                <Calendar className="h-4 w-4" />
                {activeTab === "cafe" ? "Reservar Tour" : "Planificar Visita"}
              </Button>
              <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                {activeTab === "cafe" ? "Comprar Café Online" : "Contactar Guía"}
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
