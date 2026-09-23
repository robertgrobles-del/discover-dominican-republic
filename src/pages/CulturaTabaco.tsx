import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  MapPin, Calendar, ChevronRight, Play, Flame,
  Factory, Store, Wine, Leaf, Award, Clock
} from "lucide-react";
import { Link } from "react-router-dom";

import history from "@/assets/history.jpg";

const casasProductoras = [
  {
    nombre: "La Aurora",
    fundacion: "1903",
    descripcion: "Fundada en 1903, es la fábrica de cigarros más antigua de la República Dominicana. Un símbolo de perseverancia y calidad mundial.",
    imagen: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop"
  },
  {
    nombre: "Arturo Fuente",
    fundacion: "1912",
    descripcion: "Cuatro generaciones de tradición familiar. Conocidos por su inigualable atención al detalle y su famosa capa OpusX.",
    imagen: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&h=300&fit=crop"
  },
  {
    nombre: "Davidoff",
    fundacion: "1970",
    descripcion: "Sinónimo de lujo y sofisticación. En sus campos de Santiago se cultiva la perfección bajo la filosofía del 'Tiempo Bellamente Llenado'.",
    imagen: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"
  }
];

const procesosProduccion = [
  { icono: Leaf, titulo: "1. Cultivo", descripcion: "Selección rigurosa de semillas y cuidado en el fértil suelo del Cibao." },
  { icono: Factory, titulo: "2. Secado", descripcion: "Las hojas se cuelgan en casas de curado durante 45-60 días." },
  { icono: Award, titulo: "3. Fermentación", descripcion: "Proceso crucial que desarrolla el sabor y aroma característico." },
  { icono: Store, titulo: "4. Torcido", descripcion: "Artesanos expertos enrollan cada cigarro a mano con precisión." }
];

const experienciasTours = [
  {
    nombre: "Tour Fábrica La Aurora",
    ubicacion: "Santiago de los Caballeros",
    duracion: "2 horas",
    precio: "$35 USD",
    incluye: ["Recorrido completo de la fábrica", "Museo del Tabaco", "Degustación guiada", "Descuento en tienda"]
  },
  {
    nombre: "Ruta del Tabaco Completa",
    ubicacion: "Villa González - Santiago",
    duracion: "Día completo",
    precio: "$95 USD",
    incluye: ["Visita a campos de cultivo", "3 fábricas artesanales", "Almuerzo típico", "Cata de 5 cigarros premium"]
  },
  {
    nombre: "Masterclass de Maridaje",
    ubicacion: "Cigar Lounges selectos",
    duracion: "3 horas",
    precio: "$120 USD",
    incluye: ["Sommelier de tabaco experto", "Maridaje con ron añejo", "4 cigarros premium", "Certificado de participación"]
  }
];

const maridajes = [
  { bebida: "Ron Añejo 12 años", cigarro: "Cigarro medio", nota: "Notas de vainilla y caramelo complementan la suavidad." },
  { bebida: "Whisky Single Malt", cigarro: "Cigarro fuerte", nota: "El ahumado del whisky realza los matices terrosos." },
  { bebida: "Café Dominicano", cigarro: "Cigarro suave", nota: "El café local potencia las notas achocolatadas." },
  { bebida: "Cognac VSOP", cigarro: "Cigarro premium", nota: "Elegancia francesa con tradición dominicana." }
];

export default function CulturaTabaco() {
  return (
    <PageTransition>
      <SEOHead
        title="Cultura del Tabaco - Ruta del Cigarro Premium en República Dominicana"
        description="Descubre la tradición del cigarro premium dominicano. Tours de fábricas, casas productoras legendarias y experiencias de maridaje en Santiago de los Caballeros."
        keywords="cigarros dominicanos, tabaco premium, La Aurora, Arturo Fuente, Davidoff, ruta del tabaco, Santiago"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        {/* Hero */}
        <section className="relative h-[70vh] min-h-[600px] flex items-center justify-center">
          <div className="absolute inset-0">
            <img
              src={history}
              alt="Cultura del Tabaco"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-amber-950/70 via-amber-900/50 to-background" />
          </div>
          
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center gap-2 text-amber-400 uppercase tracking-[0.2em] text-sm font-bold mb-4">
              <span className="w-8 h-[1px] bg-amber-400"></span>
              Santiago de los Caballeros
              <span className="w-8 h-[1px] bg-amber-400"></span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              El Alma de Santiago:
              <br />
              <span className="italic text-amber-400">Tabaco Premium</span>
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Un viaje sensorial por la tierra del mejor cigarro del mundo, donde la tradición se encuentra con la excelencia de las manos dominicanas.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="gap-2 bg-amber-600 hover:bg-amber-700">
                Explorar la Ruta
              </Button>
              <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                <Play className="h-4 w-4" /> Ver Video
              </Button>
            </div>
          </div>
        </section>

        {/* La Ruta Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-2 text-amber-500 font-bold uppercase tracking-wider text-sm mb-4">
                  <MapPin className="h-4 w-4" />
                  Destino Mundial
                </div>
                <h2 className="font-display text-4xl font-bold text-foreground mb-6">La Ruta del Tabaco</h2>
                <p className="text-muted-foreground text-lg mb-6">
                  Santiago no es solo una ciudad, es el epicentro mundial del cigarro premium. Nuestra ruta interactiva le permite visitar las plantaciones donde nace la hoja y las fábricas donde se convierte en arte.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-500">
                      <Leaf className="h-4 w-4" />
                    </span>
                    Visitas a campos de cultivo en Villa González
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-500">
                      <Factory className="h-4 w-4" />
                    </span>
                    Tours privados en fábricas legendarias
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-500">
                      <Store className="h-4 w-4" />
                    </span>
                    Catas exclusivas en cigar lounges
                  </li>
                </ul>
                <Button className="gap-2 bg-amber-600 hover:bg-amber-700">
                  <MapPin className="h-4 w-4" /> Abrir Mapa Interactivo
                </Button>
              </div>

              <div className="relative">
                <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800"
                    alt="Mapa de la Ruta del Tabaco"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Casas Productoras */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-amber-500/20 text-amber-400 border-amber-500/30">
                LEGADO Y TRADICIÓN
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Casas Productoras</h2>
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
                  className="group bg-surface rounded-xl overflow-hidden border border-border hover:border-amber-500/50 transition-all"
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
        </section>

        {/* Proceso de Producción */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-12">
              <div>
                <Badge className="mb-4 bg-amber-500/20 text-amber-400 border-amber-500/30">
                  ARTE MANUAL
                </Badge>
                <h2 className="font-display text-3xl font-bold text-foreground mb-6">De la Semilla al Humidor</h2>
                <p className="text-muted-foreground mb-8">
                  Cada cigarro premium pasa por más de 300 pares de manos antes de llegar a usted. Es un proceso de paciencia, dedicación y pura artesanía.
                </p>
                <Button variant="outline" className="gap-2">
                  <Play className="h-4 w-4" /> Ver Documental
                </Button>
              </div>

              <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
                {procesosProduccion.map((proceso, index) => (
                  <motion.div
                    key={proceso.titulo}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card p-6 rounded-xl border border-border flex gap-4"
                  >
                    <div className="text-amber-500">
                      <proceso.icono className="h-8 w-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{proceso.titulo}</h4>
                      <p className="text-muted-foreground text-sm mt-1">{proceso.descripcion}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tours y Experiencias */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Experiencias y <span className="text-amber-500">Tours</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Reserve su experiencia exclusiva en el mundo del tabaco premium.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {experienciasTours.map((tour, index) => (
                <motion.div
                  key={tour.nombre}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-surface rounded-xl border border-border p-6"
                >
                  <h3 className="font-display font-bold text-xl text-foreground mb-2">{tour.nombre}</h3>
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
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Maridaje */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-amber-500/20 text-amber-400 border-amber-500/30">
                <Wine className="h-3 w-3 mr-1" />
                ARTE DEL MARIDAJE
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Combinaciones Perfectas
              </h2>
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
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-amber-900 to-amber-800">
          <div className="container mx-auto px-4 text-center">
            <Flame className="h-12 w-12 text-amber-300 mx-auto mb-4" />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              ¿Listo para una experiencia premium?
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Planifique su visita al corazón del tabaco dominicano. Tours personalizados disponibles.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="gap-2 bg-white text-amber-900 hover:bg-white/90">
                <Calendar className="h-4 w-4" />
                Planificar Visita
              </Button>
              <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                Contactar Guía
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
