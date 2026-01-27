import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Users,
  TreePine,
  GraduationCap,
  Home,
  Waves,
  MapPin,
  Calendar,
  Clock,
  Star,
  ChevronRight,
  Check,
  Award,
} from "lucide-react";

const impactStats = [
  { number: "15,000+", label: "Voluntarios activos" },
  { number: "45", label: "Proyectos comunitarios" },
  { number: "120+", label: "Comunidades beneficiadas" },
  { number: "50,000", label: "Horas de servicio" },
];

const categories = [
  { icon: GraduationCap, name: "Educación", count: 12 },
  { icon: TreePine, name: "Medio Ambiente", count: 18 },
  { icon: Home, name: "Construcción", count: 8 },
  { icon: Heart, name: "Salud", count: 7 },
];

const projects = [
  {
    title: "Reforestación Cordillera Central",
    category: "Medio Ambiente",
    location: "Jarabacoa, La Vega",
    duration: "1-4 semanas",
    description: "Únete a nuestro programa de reforestación plantando árboles nativos en las montañas dominicanas.",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400",
    participants: 234,
    rating: 4.9,
  },
  {
    title: "Escuela de Inglés Comunitaria",
    category: "Educación",
    location: "Samaná",
    duration: "2-8 semanas",
    description: "Enseña inglés a niños y adultos en comunidades rurales mientras conoces la cultura local.",
    image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400",
    participants: 189,
    rating: 4.8,
  },
  {
    title: "Limpieza de Playas",
    category: "Medio Ambiente",
    location: "Puerto Plata",
    duration: "1 día - 2 semanas",
    description: "Participa en jornadas de limpieza costera y educación ambiental en comunidades pesqueras.",
    image: "https://images.unsplash.com/photo-1617953141905-b27fb1f17d88?w=400",
    participants: 567,
    rating: 4.7,
  },
  {
    title: "Construcción de Viviendas",
    category: "Construcción",
    location: "San Juan de la Maguana",
    duration: "1-2 semanas",
    description: "Ayuda a construir casas para familias en necesidad mientras aprendes técnicas de construcción sostenible.",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400",
    participants: 145,
    rating: 4.9,
  },
];

const testimonials = [
  {
    name: "María González",
    country: "España",
    project: "Reforestación",
    text: "Una experiencia transformadora. No solo ayudé al medio ambiente, también conocí personas increíbles.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
  },
  {
    name: "John Smith",
    country: "Estados Unidos",
    project: "Educación",
    text: "Los niños me enseñaron más de lo que yo les enseñé. República Dominicana tiene mi corazón.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
  },
];

export default function Volunturismo() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 via-green-900/80 to-teal-900/90" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1920')] bg-cover bg-center opacity-30" />
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <Badge className="mb-4 bg-emerald-500/20 text-emerald-200 border-emerald-400/30">
                <Heart className="h-3 w-3 mr-1" />
                IMPACTO POSITIVO
              </Badge>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
                Volunturismo en <span className="text-emerald-400">República Dominicana</span>
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Viaja con propósito. Combina turismo y voluntariado para crear un impacto 
                positivo en las comunidades dominicanas mientras vives experiencias únicas.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gap-2 bg-white text-emerald-900 hover:bg-white/90">
                  <Users className="h-4 w-4" />
                  Ver Proyectos
                </Button>
                <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                  Cómo Funciona
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Impact Stats */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {impactStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6"
                >
                  <p className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.number}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Áreas de <span className="text-gradient">Impacto</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Encuentra el proyecto que mejor se adapte a tus habilidades e intereses.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {categories.map((cat, index) => (
                <motion.button
                  key={cat.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center gap-3 p-6 bg-card rounded-2xl border border-border hover:border-primary/50 transition-all group"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 group-hover:bg-primary flex items-center justify-center transition-colors">
                    <cat.icon className="h-7 w-7 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.count} proyectos</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Projects */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-end justify-between mb-12"
            >
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                  Proyectos <span className="text-gradient">Destacados</span>
                </h2>
                <p className="text-muted-foreground max-w-xl">
                  Únete a iniciativas que están transformando comunidades en toda la isla.
                </p>
              </div>
              <Button variant="outline" className="hidden md:flex gap-2">
                Ver todos
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {projects.map((project, index) => (
                <motion.div
                  key={project.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-surface rounded-2xl overflow-hidden hover:shadow-xl transition-all"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-2/5 aspect-video md:aspect-auto relative overflow-hidden">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <Badge className="absolute top-4 left-4 bg-emerald-500/90 text-white">
                        {project.category}
                      </Badge>
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-display text-xl font-bold text-foreground">{project.title}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-semibold">{project.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {project.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {project.duration}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <span className="text-xs text-muted-foreground">
                          <Users className="h-3.5 w-3.5 inline mr-1" />
                          {project.participants} participantes
                        </span>
                        <Button size="sm">Aplicar</Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Historias de <span className="text-gradient">Voluntarios</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-6 border border-border"
                >
                  <p className="text-muted-foreground mb-6 italic">"{testimonial.text}"</p>
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.country} • {testimonial.project}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-emerald-900 to-green-900">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Award className="h-16 w-16 text-emerald-300 mx-auto mb-6" />
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                ¿Listo para hacer la diferencia?
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Únete a nuestra comunidad de voluntarios y vive una experiencia que transformará 
                tu vida mientras ayudas a otros.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="gap-2 bg-white text-emerald-900 hover:bg-white/90">
                  <Heart className="h-4 w-4" />
                  Registrarme
                </Button>
                <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                  Agregar al Plan de Viaje
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
