import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { 
  Leaf, TreePine, Users, Map, Download, 
  ChevronRight, Check, ArrowRight
} from "lucide-react";
import adventureImg from "@/assets/adventure.jpg";
import samanaImg from "@/assets/samana.jpg";
import divingImg from "@/assets/diving.jpg";

const pillars = [
  {
    id: 1,
    icon: Users,
    title: "Turismo Comunitario",
    description: "Apoya la economía local sumergiéndote en la cultura auténtica de nuestros pueblos rurales y costeros.",
    link: "Saber más",
    href: "/destinos",
  },
  {
    id: 2,
    icon: TreePine,
    title: "Áreas Protegidas",
    description: "Explora nuestros 29 parques nacionales y reservas científicas conservadas bajo estricta vigilancia.",
    link: "Ver mapa",
    href: "/destinos",
  },
  {
    id: 3,
    icon: Leaf,
    title: "Viajero Responsable",
    description: "Guía práctica de comportamiento ético para minimizar tu huella ecológica durante tu visita.",
    link: "Descargar guía",
    href: "#",
  },
];

const conservationProjects = [
  {
    id: 1,
    category: "Vida Marina",
    title: "Restauración de Corales",
    location: "Bayahíbe",
    description: "Proyecto de jardinería de coral para restaurar los arrecifes dañados por el cambio climático.",
    image: divingImg,
  },
  {
    id: 2,
    category: "Fauna",
    title: "Protección de Tortugas",
    location: "Samaná",
    description: "Monitoreo 24/7 y protección de nidos de tortugas marinas en temporada de desove.",
    image: samanaImg,
  },
  {
    id: 3,
    category: "Flora",
    title: "Reforestación Costera",
    location: "Montecristi",
    description: "Siembra masiva de manglares para proteger la costa de la erosión y crear hábitats.",
    image: adventureImg,
  },
];

export default function Sostenible() {
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});

  const handleImageLoad = (id: string) => {
    setImagesLoaded(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={adventureImg}
            alt="Naturaleza RD"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
        </div>

        <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center py-32">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-green-400 text-sm font-medium tracking-wider mb-4"
          >
            NUESTRO COMPROMISO CON LA NATURALEZA
          </motion.span>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-6xl font-bold mb-6"
          >
            RD Sostenible: Un<br />
            <span className="text-green-400">Paraíso por Preservar</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8"
          >
            Descubre el compromiso de la República Dominicana con el turismo responsable, 
            la protección de nuestros tesoros naturales y el apoyo a las comunidades locales.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Button size="lg" className="gap-2 bg-green-500 hover:bg-green-600">
              Explora Iniciativas
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              Ver Video
            </Button>
          </motion.div>
        </div>
      </section>

      <main className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Pillars Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-3xl font-bold mb-4">Pilares de Sostenibilidad</h2>
            <p className="text-muted-foreground max-w-2xl mb-12">
              Nuestra estrategia se basa en tres ejes fundamentales para garantizar un futuro 
              verde y próspero para nuestra isla.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {pillars.map((pillar, index) => (
                <motion.div
                  key={pillar.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-6 border border-border hover:border-green-500/30 transition-colors"
                >
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
                    <pillar.icon className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{pillar.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{pillar.description}</p>
                  <Link 
                    to={pillar.href} 
                    className="inline-flex items-center text-sm text-green-500 hover:text-green-400 font-medium"
                  >
                    {pillar.link}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Green Seal Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-3xl p-8 md:p-12 mb-20 border border-border"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="inline-flex items-center gap-2 text-green-500 text-sm font-medium mb-4">
                  <Check className="h-4 w-4" />
                  CERTIFICACIÓN OFICIAL
                </span>
                <h2 className="text-3xl font-bold mb-4">Busca el "Sello Verde"</h2>
                <p className="text-muted-foreground mb-6">
                  Al planificar tu viaje, elige empresas certificadas con nuestro sello de 
                  calidad ambiental. Estas organizaciones cumplen con los más altos estándares 
                  de gestión de residuos, uso de energía renovable y responsabilidad social.
                </p>
                <Button variant="outline" className="gap-2">
                  Ver Empresas Certificadas
                </Button>
              </div>

              <div className="flex justify-center">
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center border-4 border-green-500/30">
                  <div className="text-center">
                    <Leaf className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="font-bold text-green-500">RD VERDE</p>
                    <p className="text-xs text-muted-foreground">CERTIFIED ECO-TOURISM</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Conservation Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Proyectos de Conservación</h2>
                <p className="text-muted-foreground">
                  Iniciativas activas para restaurar nuestra biodiversidad
                </p>
              </div>
              <Link 
                to="/destinos"
                className="hidden md:flex items-center text-sm text-muted-foreground hover:text-primary underline"
              >
                Ver todos los proyectos
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {conservationProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-4 relative">
                    {!imagesLoaded[`project-${project.id}`] && (
                      <Skeleton className="absolute inset-0" />
                    )}
                    <img
                      src={project.image}
                      alt={project.title}
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                        imagesLoaded[`project-${project.id}`] ? 'opacity-100' : 'opacity-0'
                      }`}
                      onLoad={() => handleImageLoad(`project-${project.id}`)}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-green-500 text-green-950 text-xs font-semibold rounded-full">
                        {project.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold mb-1">{project.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{project.location}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}