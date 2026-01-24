import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Filter } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/PageTransition";
import { Link } from "react-router-dom";
import heroBeach from "@/assets/hero-beach.jpg";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import samanaImg from "@/assets/samana.jpg";
import laRomanaImg from "@/assets/la-romana.jpg";
import puertoPlataImg from "@/assets/puerto-plata.jpg";
import beachCategoryImg from "@/assets/beach-category.jpg";
import adventureImg from "@/assets/adventure.jpg";
import divingImg from "@/assets/diving.jpg";
import whaleSamanaImg from "@/assets/whale-samana.jpg";

const filters = ["Todos", "Región Norte", "Región Este", "Región Sur", "Santo Domingo"];

const destinations = [
  {
    id: "punta-cana",
    name: "Punta Cana",
    description: "Donde el Atlántico encuentra al Caribe, un santuario de arena blanca y aguas turquesas que redefinen el descanso eterno.",
    image: puntaCanaImg,
    tags: ["Relax", "Lujo"],
    region: "Región Este",
    featured: true,
  },
  {
    id: "santo-domingo",
    name: "Santo Domingo",
    description: "La Ciudad Primada de América. Un laberinto de piedras centenarias que guardan los secretos del Nuevo Mundo.",
    image: santoDomingoImg,
    tags: ["Cultura", "Historia"],
    region: "Santo Domingo",
    featured: false,
  },
  {
    id: "samana",
    name: "Samaná",
    description: "Donde las ballenas danzan y la selva esmeralda abraza playas vírgenes. El alma cruda del Caribe.",
    image: samanaImg,
    tags: ["Naturaleza Única"],
    region: "Región Norte",
    featured: false,
  },
  {
    id: "la-romana",
    name: "La Romana",
    description: "Elegancia caribeña con toques de sofisticación excepcional. Destino de lujo por excelencia.",
    image: laRomanaImg,
    tags: ["Exclusividad"],
    region: "Región Este",
    featured: false,
  },
  {
    id: "puerto-plata",
    name: "Puerto Plata",
    description: "La novia del Atlántico, victoriosa y vibrante, entre la montaña y el mar.",
    image: puertoPlataImg,
    tags: ["Aventura"],
    region: "Región Norte",
    featured: false,
  },
  {
    id: "cabarete",
    name: "Cabarete",
    description: "Capital mundial del kitesurfing. Playas interminables donde el viento te invita a volar sobre las olas.",
    image: beachCategoryImg,
    tags: ["Deportes", "Surf"],
    region: "Región Norte",
    featured: false,
  },
  {
    id: "jarabacoa",
    name: "Jarabacoa",
    description: "Los Alpes dominicanos. Montañas esmeralda, ríos cristalinos y el aire más puro del Caribe.",
    image: adventureImg,
    tags: ["Montaña", "Ecoturismo"],
    region: "Región Norte",
    featured: false,
  },
  {
    id: "bayahibe",
    name: "Bayahíbe",
    description: "Pueblo de pescadores convertido en paraíso del buceo. Arrecifes vibrantes y aguas de ensueño.",
    image: divingImg,
    tags: ["Buceo", "Playa"],
    region: "Región Este",
    featured: false,
  },
  {
    id: "las-terrenas",
    name: "Las Terrenas",
    description: "El secreto mejor guardado de Samaná. Playas doradas y ambiente bohemio europeo.",
    image: whaleSamanaImg,
    tags: ["Bohemio", "Gastronomía"],
    region: "Región Norte",
    featured: false,
  },
  {
    id: "bani",
    name: "Baní",
    description: "Dunas de arena dorada que abrazan el mar. Un desierto caribeño único en el mundo.",
    image: heroBeach,
    tags: ["Dunas", "Único"],
    region: "Región Sur",
    featured: false,
  },
  {
    id: "pedernales",
    name: "Pedernales",
    description: "La frontera salvaje. Bahía de las Águilas y paisajes vírgenes que desafían la imaginación.",
    image: beachCategoryImg,
    tags: ["Virgen", "Naturaleza"],
    region: "Región Sur",
    featured: false,
  },
  {
    id: "constanza",
    name: "Constanza",
    description: "El valle encantado a 1,200 metros de altura. Fresas, flores y clima primaveral todo el año.",
    image: adventureImg,
    tags: ["Valle", "Agricultura"],
    region: "Región Norte",
    featured: false,
  },
];

export default function Destinos() {
  const [activeFilter, setActiveFilter] = useState("Todos");

  const filteredDestinations = destinations.filter(
    (dest) => activeFilter === "Todos" || dest.region === activeFilter
  );

  return (
    <PageTransition>
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] w-full flex flex-col justify-center items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={heroBeach}
            alt="Playas de República Dominicana"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/30" />
        </div>

        <div className="relative z-10 text-center px-4 pt-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block bg-primary/20 text-primary text-sm font-medium px-4 py-2 rounded-full mb-6"
          >
            Descubre tu paraíso
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-6xl font-bold mb-4"
          >
            Explora Nuestros{" "}
            <span className="text-gradient">Destinos</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Una colección curada de rincones inolvidables, desde playas infinitas hasta ciudades coloniales que respiran historia.
          </motion.p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-card border-b border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {filters.map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter)}
                className="rounded-full"
              >
                {filter}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="rounded-full gap-2">
              <Filter className="h-4 w-4" />
              Más Filtros
            </Button>
          </div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Featured Destination */}
          {filteredDestinations.filter((d) => d.featured).map((dest) => (
            <motion.div
              key={dest.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="relative aspect-[21/9] rounded-2xl overflow-hidden group cursor-pointer">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                <div className="absolute top-4 right-4 flex gap-2">
                  {dest.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-surface/80 backdrop-blur-sm text-foreground text-xs font-medium px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-6">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-gradient mb-3">
                  {dest.name}
                </h2>
                <p className="text-muted-foreground italic max-w-2xl mb-4">
                  "{dest.description}"
                </p>
                <Button variant="link" className="text-primary gap-2 p-0">
                  Explorar destino
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}

          {/* Other Destinations - Masonry-like Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDestinations
              .filter((d) => !d.featured)
              .map((dest, index) => (
                <motion.div
                  key={dest.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`group cursor-pointer ${
                    index === 0 ? "md:row-span-2" : ""
                  }`}
                >
                  <div
                    className={`relative rounded-2xl overflow-hidden ${
                      index === 0 ? "aspect-[3/4]" : "aspect-video"
                    }`}
                  >
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex gap-2 mb-3">
                        {dest.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-primary/20 text-primary text-xs font-medium px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {dest.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-2 italic">
                        "{dest.description}"
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" className="gap-2">
              Cargar más destinos
              <ChevronRight className="h-4 w-4 rotate-90" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl font-bold mb-4">
              ¿No sabes por dónde empezar?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Déjanos guiarte hacia tu experiencia perfecta con nuestra herramienta de planificación.
            </p>
            <Button size="lg">Planifica mi viaje</Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
    </PageTransition>
  );
}
