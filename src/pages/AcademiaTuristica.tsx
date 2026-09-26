import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Search,
  Play,
  Clock,
  Users,
  Award,
  BookOpen,
  GraduationCap,
  ChevronRight,
  Download,
  Calendar,
  Star,
  Bell,
} from "lucide-react";

const categories = [
  { id: "all", label: "Todo", icon: BookOpen },
  { id: "guides", label: "Guías Turísticos", icon: Users },
  { id: "hospitality", label: "Hotelería y Servicio", icon: Star },
  { id: "languages", label: "Idiomas", icon: BookOpen },
  { id: "culture", label: "Cultura Dominicana", icon: GraduationCap },
];

const courses = [
  {
    id: 1,
    title: "Inglés Técnico para Meseros",
    description: "Aprende el vocabulario esencial para ofrecer un servicio de primera clase a turistas angloparlantes.",
    category: "Hotelería",
    duration: "4h 30m",
    enrolled: 120,
    image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    title: "Patrimonio Cultural: Zona Colonial",
    description: "Profundiza en la historia de la primera ciudad de América y mejora tus tours.",
    category: "Historia",
    duration: "6h 15m",
    enrolled: 85,
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    title: "Protocolo y Etiqueta en Resorts",
    description: "Estándares internacionales de etiqueta para personal de servicio en hoteles 5 estrellas.",
    category: "Servicio",
    duration: "2h 45m",
    enrolled: 200,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
  },
];

const upcomingWebinars = [
  {
    id: 1,
    title: "Nuevos Protocolos de Seguridad 2024",
    instructor: "Lic. Ana Reyes",
    date: "Jueves 24 Oct, 7:00 PM",
    isLive: true,
  },
  {
    id: 2,
    title: "Turismo Sostenible",
    instructor: "Dr. Carlos Méndez",
    date: "Viernes 25 Oct, 6:00 PM",
    isLive: false,
  },
];

const certificates = [
  { id: 1, title: "Servicio al Cliente Básico", date: "Oct 2023" },
  { id: 2, title: "Primeros Auxilios", date: "Ago 2023" },
];

const readings = [
  "Manual de Buenas Prácticas Ambientales",
  "Guía de Restaurantes 2024",
];

export default function AcademiaTuristica() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <PageTransition>
      <SEOHead
        title="Academia Turística - Cursos y Certificaciones para el Sector"
        description="Capacítate con cursos en línea de inglés técnico, hotelería, protocolo y patrimonio cultural, y obtén certificaciones para trabajar en el turismo dominicano."
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Section */}
        <section className="relative pt-20 pb-12 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=600&fit=crop"
              alt="Academia"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/70" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl py-12">
              <Badge className="bg-primary/20 text-primary mb-4">
                ✨ CONTINÚA APRENDIENDO
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Bienvenido de nuevo, <br />
                <span className="text-primary">Carlos</span>
              </h1>
              <p className="text-muted-foreground mb-6">
                Continúa tu camino hacia la excelencia turística. Estás al 75% de 
                completar tu certificación en "Historia Colonial de Santo Domingo".
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                <Button className="gap-2">
                  <Play className="h-4 w-4" /> Reanudar Curso
                </Button>
                <Button variant="outline" className="gap-2">
                  <BookOpen className="h-4 w-4" /> Ver Catálogo
                </Button>
              </div>

              <div className="bg-card/80 backdrop-blur rounded-xl border border-border p-4 max-w-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Progreso Semanal</span>
                  <span className="text-sm font-bold text-primary">4.5 Hrs</span>
                </div>
                <Progress value={75} className="h-2" />
                <p className="text-xs text-primary mt-2">¡Genial! Has superado tu meta diaria.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <h2 className="font-semibold text-foreground mb-4">Explora por Categoría</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat.id)}
                  className="gap-2"
                >
                  <cat.icon className="h-4 w-4" />
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Courses List */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Cursos Recomendados
                  </h2>
                  <Button variant="link" className="text-primary">Ver todos</Button>
                </div>

                <div className="space-y-4">
                  {courses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-card rounded-xl border border-border overflow-hidden flex flex-col md:flex-row hover:border-primary/50 transition-colors"
                    >
                      <div className="md:w-48 h-40 md:h-auto">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Badge className="bg-primary/10 text-primary mb-2">
                              {course.category}
                            </Badge>
                            <h3 className="font-semibold text-foreground text-lg mb-1">
                              {course.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              {course.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {course.duration}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" /> +{course.enrolled}
                              </span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Inscribirse Gratis
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Upcoming Webinar */}
                <div className="bg-card rounded-xl border border-border p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Play className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Próximo Webinar</h3>
                  </div>

                  {upcomingWebinars.map((webinar) => (
                    <div
                      key={webinar.id}
                      className={`p-4 rounded-lg mb-3 ${
                        webinar.isLive ? "bg-primary/10 border border-primary/20" : "bg-surface"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-xs text-muted-foreground">{webinar.date}</p>
                        {webinar.isLive && (
                          <Badge className="bg-red-500 text-white text-xs">EN VIVO</Badge>
                        )}
                      </div>
                      <h4 className="font-medium text-foreground text-sm mb-1">
                        {webinar.title}
                      </h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" /> {webinar.instructor}
                      </p>
                      {webinar.isLive && (
                        <Button size="sm" className="w-full mt-3">
                          Reservar Lugar
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* My Certificates */}
                <div className="bg-card rounded-xl border border-border p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Mis Certificados</h3>
                    </div>
                    <Badge variant="secondary">2 Completados</Badge>
                  </div>

                  <div className="space-y-3">
                    {certificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="flex items-center gap-3 p-3 bg-surface rounded-lg"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Award className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-sm">{cert.title}</p>
                          <p className="text-xs text-muted-foreground">Expedido: {cert.date}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button variant="link" className="w-full mt-3 text-primary text-sm">
                    VER HISTORIAL COMPLETO
                  </Button>
                </div>

                {/* Recent Readings */}
                <div className="bg-card rounded-xl border border-border p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Lecturas Recientes</h3>
                  </div>

                  <ul className="space-y-2">
                    {readings.map((reading) => (
                      <li key={reading} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {reading}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4 text-center">
            <GraduationCap className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              ¿Listo para certificarte?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Completa cursos, obtén insignias y accede a oportunidades exclusivas 
              en el sector turístico dominicano.
            </p>
            <Button size="lg" className="gap-2">
              <Award className="h-4 w-4" /> Explorar Certificaciones
            </Button>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
