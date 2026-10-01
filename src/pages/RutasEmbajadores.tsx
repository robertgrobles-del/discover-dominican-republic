import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, MapPin, Play, Calendar, Users, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import samanaImg from "@/assets/samana.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";

const ambassadors = [
  {
    id: "juan-luis-guerra",
    name: "Juan Luis Guerra",
    title: "Leyenda del Merengue",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    cover: samanaImg,
    quote: "Mi música nace de estas playas, de estos ritmos, de mi gente.",
    followers: "5.2M",
    routes: [
      {
        name: "La Ruta del Merengue",
        locations: ["Santo Domingo", "Santiago", "La Vega"],
        duration: "3 días",
        highlights: ["Estudios 440", "Festival del Merengue", "Carnaval de La Vega"],
      },
    ],
  },
  {
    id: "david-ortiz",
    name: "David Ortiz",
    title: "Big Papi - Leyenda del Béisbol",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    cover: santoDomingoImg,
    quote: "República Dominicana es donde mi corazón siempre estará.",
    followers: "3.8M",
    routes: [
      {
        name: "La Ruta del Béisbol",
        locations: ["Santo Domingo", "San Pedro de Macorís", "La Romana"],
        duration: "4 días",
        highlights: ["Estadio Quisqueya", "Academia de Béisbol", "Museo del Deporte"],
      },
    ],
  },
  {
    id: "tokischa",
    name: "Tokischa",
    title: "Estrella del Dembow",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    cover: puntaCanaImg,
    quote: "Mi país es pura energía, ritmo y libertad.",
    followers: "8.1M",
    routes: [
      {
        name: "La Ruta Urbana",
        locations: ["Santo Domingo", "Villa Mella", "Los Mina"],
        duration: "2 días",
        highlights: ["Estudios de grabación", "Barrios icónicos", "Vida nocturna"],
      },
    ],
  },
];

const timeline = [
  {
    year: "Día 1",
    title: "Santo Domingo",
    description: "Explora la Zona Colonial, el malecón y los estudios donde nacieron las leyendas.",
    image: santoDomingoImg,
  },
  {
    year: "Día 2",
    title: "Santiago de los Caballeros",
    description: "La cuna del merengue, el Monumento a los Héroes y el corazón del Cibao.",
    image: samanaImg,
  },
  {
    year: "Día 3",
    title: "La Vega",
    description: "El carnaval más colorido del Caribe y las raíces de la cultura dominicana.",
    image: puntaCanaImg,
  },
];

export default function RutasEmbajadores() {
  return (
    <PageTransition>
      <SEOHead
        title="Rutas de Embajadores | Turismo RD"
        description="Descubre República Dominicana a través de los ojos de sus celebridades más icónicas."
        keywords="embajadores, celebridades, rutas, Juan Luis Guerra, República Dominicana"
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative h-[70vh] flex items-center">
          <div className="absolute inset-0">
            <img
              src={samanaImg}
              alt="República Dominicana"
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
              <Badge className="mb-4 bg-primary/20 text-primary">Programa de Embajadores</Badge>
              <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
                RD by <span className="text-primary">Nuestras Estrellas</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Descubre la isla a través de los ojos de quienes la han llevado al mundo.
                Rutas exclusivas diseñadas por celebridades dominicanas.
              </p>
              <div className="flex gap-4">
                <Button size="lg" className="gap-2">
                  <Play className="h-5 w-5" />
                  Ver Video
                </Button>
                <Button size="lg" variant="outline">Explorar Rutas</Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Ambassadors */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-4xl font-bold mb-4">
                Nuestros <span className="text-primary">Embajadores</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Íconos dominicanos que comparten su amor por la isla con el mundo.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {ambassadors.map((ambassador, index) => (
                <motion.div
                  key={ambassador.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="group"
                >
                  <div className="relative rounded-2xl overflow-hidden">
                    <img
                      src={ambassador.cover}
                      alt={ambassador.name}
                      className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                    
                    {/* Ambassador Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-end gap-4">
                        <img
                          src={ambassador.image}
                          alt={ambassador.name}
                          className="w-16 h-16 rounded-full border-4 border-primary object-cover"
                        />
                        <div>
                          <h3 className="font-display text-2xl font-bold">{ambassador.name}</h3>
                          <p className="text-primary">{ambassador.title}</p>
                        </div>
                      </div>
                      <p className="mt-4 text-muted-foreground italic">"{ambassador.quote}"</p>
                      
                      {/* Route Preview */}
                      {ambassador.routes.map((route) => (
                        <div key={route.name} className="mt-6 p-4 bg-card/80 backdrop-blur rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold">{route.name}</h4>
                            <Badge variant="outline">{route.duration}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {route.locations.join(" → ")}
                          </div>
                        </div>
                      ))}
                      
                      <Button className="w-full mt-4 gap-2">
                        Ver Ruta Completa
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-4xl font-bold mb-4">
                La Ruta del <span className="text-primary">Merengue</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Un recorrido de 3 días por los lugares que inspiraron a Juan Luis Guerra.
              </p>
            </motion.div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-border" />

              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={`relative flex items-center gap-8 mb-12 ${
                    index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* Content */}
                  <div className="flex-1">
                    <div className={`lg:${index % 2 === 0 ? "text-right pr-8" : "text-left pl-8"}`}>
                      <Badge className="mb-2">{item.year}</Badge>
                      <h3 className="font-display text-2xl font-bold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>

                  {/* Center Dot */}
                  <div className="hidden lg:flex w-4 h-4 bg-primary rounded-full z-10 flex-shrink-0" />

                  {/* Image */}
                  <div className="flex-1">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-48 object-cover rounded-xl"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-3xl p-12 text-center">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                ¿Quieres ser embajador de RD?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                Si eres creador de contenido, influencer o personalidad pública,
                únete a nuestro programa de embajadores.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="gap-2" asChild>
                  <Link to="/requisitos-embajadores">
                    <Users className="h-5 w-5" />
                    Aplicar al Programa
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild><Link to="/requisitos-embajadores">Conocer Requisitos</Link></Button>
                <Button size="lg" variant="ghost" asChild><Link to="/afiliados">Conocer el programa de afiliados</Link></Button>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
