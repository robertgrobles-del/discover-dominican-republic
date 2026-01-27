import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Coffee,
  Mountain,
  MapPin,
  Star,
  Clock,
  Users,
  ChevronRight,
  Leaf,
  Calendar,
  Award,
  Camera,
} from "lucide-react";
import { Link } from "react-router-dom";

const regiones = [
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

const tours = [
  {
    nombre: "Tour Café Jarabacoa",
    duracion: "4 horas",
    precio: "$45",
    incluye: ["Recorrido por cafetales", "Proceso de tostado", "Cata profesional", "Almuerzo típico"],
    rating: 4.9,
    reviews: 128,
  },
  {
    nombre: "Ruta del Café Premium",
    duracion: "Día completo",
    precio: "$95",
    incluye: ["Visita a 3 fincas", "Taller de barista", "Transporte", "Cena gourmet"],
    rating: 5.0,
    reviews: 67,
  },
  {
    nombre: "Experiencia Cosecha",
    duracion: "2 días",
    precio: "$180",
    incluye: ["Participar en cosecha", "Hospedaje en finca", "Todas las comidas", "Bolsa de café premium"],
    rating: 4.8,
    reviews: 34,
  },
];

const proceso = [
  { paso: 1, titulo: "Cultivo", desc: "Semillas seleccionadas crecen a la sombra de árboles nativos." },
  { paso: 2, titulo: "Cosecha", desc: "Recolección manual de cerezas maduras, una a una." },
  { paso: 3, titulo: "Despulpado", desc: "Separación de la pulpa del grano con agua de montaña." },
  { paso: 4, titulo: "Fermentación", desc: "12-36 horas para desarrollar sabores complejos." },
  { paso: 5, titulo: "Secado", desc: "Secado al sol en patios de concreto por 7-10 días." },
  { paso: 6, titulo: "Tostado", desc: "Tostado artesanal que resalta las notas únicas." },
];

const cafeterias = [
  {
    nombre: "Café Santo Domingo",
    ubicacion: "Zona Colonial, SD",
    especialidad: "Café de origen único",
    imagen: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop",
  },
  {
    nombre: "La Molienda",
    ubicacion: "Jarabacoa",
    especialidad: "Tostado en sitio",
    imagen: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&h=300&fit=crop",
  },
  {
    nombre: "Café Britt",
    ubicacion: "Punta Cana",
    especialidad: "Tours y degustaciones",
    imagen: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop",
  },
];

export default function CulturaCafe() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/95 via-orange-900/90 to-yellow-900/95" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1920')] bg-cover bg-center opacity-20" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <Badge className="mb-4 bg-white/20 text-white border-white/30">
                <Coffee className="w-4 h-4 mr-2" />
                Ruta del Café
              </Badge>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
                Cultura del Café:{" "}
                <span className="text-amber-300">Sabor de la Montaña</span>
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Descubre el café dominicano cultivado en las montañas del Cibao. 
                Desde la semilla hasta tu taza, vive una experiencia única.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gap-2 bg-white text-amber-900 hover:bg-white/90">
                  <Calendar className="h-4 w-4" />
                  Reservar Tour
                </Button>
                <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                  Ver Fincas
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Regiones Cafetaleras */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Regiones <span className="text-gradient">Cafetaleras</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Cada región produce un café con características únicas definidas por su terroir.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {regiones.map((region, index) => (
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
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Fincas destacadas:</p>
                      <div className="flex flex-wrap gap-2">
                        {region.fincas.map((finca) => (
                          <Badge key={finca} variant="secondary" className="text-xs">
                            {finca}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Proceso del Café */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Del Cafetal a tu <span className="text-gradient">Taza</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Conoce cada etapa del proceso artesanal que hace único al café dominicano.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              {proceso.map((item, index) => (
                <motion.div
                  key={item.paso}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-500 text-white font-bold text-xl flex items-center justify-center mx-auto mb-3">
                    {item.paso}
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">{item.titulo}</h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Tours */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Tours y <span className="text-gradient">Experiencias</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {tours.map((tour, index) => (
                <motion.div
                  key={tour.nombre}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-card border-border h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Badge className="bg-amber-500/20 text-amber-600">
                          <Coffee className="h-3 w-3 mr-1" />
                          Tour
                        </Badge>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{tour.rating}</span>
                          <span className="text-muted-foreground">({tour.reviews})</span>
                        </div>
                      </div>
                      <h3 className="font-display text-xl font-bold text-foreground mb-2">
                        {tour.nombre}
                      </h3>
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
                      <Button className="w-full gap-2">
                        Reservar <ChevronRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Cafeterías Destacadas */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl font-bold mb-4">
                Dónde <span className="text-gradient">Degustar</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {cafeterias.map((cafe, index) => (
                <motion.div
                  key={cafe.nombre}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-background rounded-xl overflow-hidden border border-border"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={cafe.imagen}
                      alt={cafe.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-foreground">{cafe.nombre}</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {cafe.ubicacion}
                    </p>
                    <p className="text-xs text-primary mt-1">{cafe.especialidad}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-amber-900 to-orange-900">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Coffee className="h-12 w-12 text-amber-300 mx-auto mb-4" />
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                Vive la experiencia cafetalera
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Reserva tu tour y lleva a casa el mejor café del Caribe.
              </p>
              <div className="flex justify-center gap-4">
                <Button size="lg" className="gap-2 bg-white text-amber-900 hover:bg-white/90">
                  Reservar Tour
                </Button>
                <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                  Comprar Café Online
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
