import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Palette,
  MapPin,
  Clock,
  Users,
  Star,
  ChevronRight,
  Gem,
  Music,
  Brush,
  Calendar,
  Heart,
  Camera,
} from "lucide-react";
import { Link } from "react-router-dom";

const talleres = [
  {
    id: "larimar",
    nombre: "Taller de Joyería en Larimar",
    ubicacion: "Barahona",
    duracion: "3 horas",
    precio: "$65",
    participantes: "4-8 personas",
    descripcion: "Aprende a trabajar la única piedra azul del Caribe. Crea tu propia pieza de joyería para llevar.",
    imagen: "https://images.unsplash.com/photo-1551376347-075b0121a65b?w=600&h=400&fit=crop",
    incluye: ["Materiales", "Instrucción", "Pieza terminada", "Certificado"],
    rating: 4.9,
    categoria: "Joyería",
  },
  {
    id: "ceramica",
    nombre: "Cerámica Taína Tradicional",
    ubicacion: "La Vega",
    duracion: "4 horas",
    precio: "$55",
    participantes: "6-12 personas",
    descripcion: "Recrea piezas cerámicas inspiradas en la cultura taína usando técnicas ancestrales.",
    imagen: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=400&fit=crop",
    incluye: ["Arcilla", "Herramientas", "Horneado", "Tu creación"],
    rating: 4.8,
    categoria: "Cerámica",
  },
  {
    id: "tambora",
    nombre: "Construye tu Tambora",
    ubicacion: "Santiago",
    duracion: "5 horas",
    precio: "$85",
    participantes: "4-6 personas",
    descripcion: "Fabrica el instrumento insignia de la música dominicana con maestros artesanos locales.",
    imagen: "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=600&h=400&fit=crop",
    incluye: ["Materiales premium", "Instrucción experta", "Tambora completa"],
    rating: 5.0,
    categoria: "Música",
  },
  {
    id: "pintura",
    nombre: "Arte Naïf Dominicano",
    ubicacion: "Santo Domingo",
    duracion: "3 horas",
    precio: "$50",
    participantes: "8-15 personas",
    descripcion: "Pinta paisajes tropicales al estilo naïf con artistas locales en un taller al aire libre.",
    imagen: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&h=400&fit=crop",
    incluye: ["Lienzo", "Pinturas acrílicas", "Pinceles", "Bebidas"],
    rating: 4.7,
    categoria: "Pintura",
  },
  {
    id: "faceless",
    nombre: "Muñecas Sin Rostro Limé",
    ubicacion: "Higüey",
    duracion: "2.5 horas",
    precio: "$40",
    participantes: "6-10 personas",
    descripcion: "Crea la icónica muñeca dominicana que representa la diversidad del pueblo.",
    imagen: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    incluye: ["Telas coloridas", "Instrucción", "Muñeca terminada"],
    rating: 4.9,
    categoria: "Textil",
  },
  {
    id: "ambar",
    nombre: "Pulido de Ámbar",
    ubicacion: "Puerto Plata",
    duracion: "2 horas",
    precio: "$45",
    participantes: "4-8 personas",
    descripcion: "Aprende a identificar y pulir ámbar auténtico. Llévate tu pieza pulida.",
    imagen: "https://images.unsplash.com/photo-1564389598-c1ac3caa5b87?w=600&h=400&fit=crop",
    incluye: ["Ámbar en bruto", "Herramientas", "Pieza pulida", "Certificación"],
    rating: 4.8,
    categoria: "Joyería",
  },
];

const categorias = [
  { nombre: "Todos", icon: Palette, count: talleres.length },
  { nombre: "Joyería", icon: Gem, count: 2 },
  { nombre: "Cerámica", icon: Brush, count: 1 },
  { nombre: "Música", icon: Music, count: 1 },
  { nombre: "Pintura", icon: Brush, count: 1 },
  { nombre: "Textil", icon: Heart, count: 1 },
];

const testimonios = [
  {
    nombre: "Sarah M.",
    pais: "Estados Unidos",
    texto: "El taller de larimar fue increíble. Me llevé un collar que hice yo misma. ¡Experiencia única!",
    rating: 5,
  },
  {
    nombre: "Pierre L.",
    pais: "Francia",
    texto: "Construir mi propia tambora fue el highlight de mi viaje. Los artesanos son verdaderos maestros.",
    rating: 5,
  },
];

export default function TalleresArtesanales() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-900/90 via-red-900/80 to-pink-900/90" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1920')] bg-cover bg-center opacity-20" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <Badge className="mb-4 bg-white/20 text-white border-white/30">
                <Palette className="w-4 h-4 mr-2" />
                Experiencias Creativas
              </Badge>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
                Talleres Artesanales:{" "}
                <span className="text-orange-300">Crea con tus Manos</span>
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Sumérgete en la tradición artesanal dominicana. Aprende técnicas ancestrales 
                y llévate a casa piezas únicas creadas por ti.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gap-2 bg-white text-orange-900 hover:bg-white/90">
                  <Calendar className="h-4 w-4" />
                  Ver Talleres
                </Button>
                <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                  Reservar Grupo
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categorías */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {categorias.map((cat) => (
                <Button
                  key={cat.nombre}
                  variant="outline"
                  className="gap-2"
                >
                  <cat.icon className="h-4 w-4" />
                  {cat.nombre}
                  <Badge variant="secondary" className="ml-1 text-xs">{cat.count}</Badge>
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Talleres Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Experiencias <span className="text-gradient">Disponibles</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Reserva tu taller y vive una experiencia inmersiva en la cultura dominicana.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {talleres.map((taller, index) => (
                <motion.div
                  key={taller.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all"
                >
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img
                      src={taller.imagen}
                      alt={taller.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-background/90 text-foreground">{taller.categoria}</Badge>
                    </div>
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-white text-sm font-medium">{taller.rating}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold text-foreground mb-2">
                      {taller.nombre}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">{taller.descripcion}</p>
                    
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-primary" />
                        {taller.ubicacion}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-primary" />
                        {taller.duracion}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-primary" />
                        {taller.participantes}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {taller.incluye.map((item) => (
                        <Badge key={item} variant="secondary" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">{taller.precio}</span>
                      <Button className="gap-2">
                        Reservar <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonios */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl font-bold mb-4">
                Lo que Dicen <span className="text-gradient">Nuestros Artistas</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {testimonios.map((test, index) => (
                <motion.div
                  key={test.nombre}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-background border-border">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(test.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-muted-foreground italic mb-4">"{test.texto}"</p>
                      <div>
                        <p className="font-semibold text-foreground">{test.nombre}</p>
                        <p className="text-sm text-muted-foreground">{test.pais}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-orange-900 to-red-900">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Palette className="h-12 w-12 text-orange-300 mx-auto mb-4" />
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                ¿Listo para crear?
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Reserva tu experiencia artesanal y llévate un recuerdo único hecho por ti.
              </p>
              <Button size="lg" className="gap-2 bg-white text-orange-900 hover:bg-white/90">
                Ver Calendario de Talleres <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
