import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Building,
  Calendar,
  GraduationCap,
  Globe,
  Users,
  CheckCircle2,
  ChevronRight,
  Share2,
  Bookmark,
  Send,
  ArrowLeft,
  Heart,
  Star,
  Coffee,
  Plane,
  Shield,
} from "lucide-react";

// Datos simulados de vacantes
const jobsData: Record<string, {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  companyDescription: string;
  location: string;
  address: string;
  salary: string;
  type: string;
  experience: string;
  education: string;
  languages: string[];
  postedDate: string;
  deadline: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  skills: string[];
  urgent: boolean;
  remote: boolean;
  applicants: number;
  views: number;
  category: string;
}> = {
  "gerente-recepcion-grand-paradise": {
    id: "gerente-recepcion-grand-paradise",
    title: "Gerente de Recepción",
    company: "Grand Paradise Resort",
    companyLogo: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&h=100&fit=crop",
    companyDescription: "Grand Paradise Resort es uno de los complejos hoteleros más exclusivos de Punta Cana, con más de 15 años de experiencia ofreciendo servicios de lujo a visitantes de todo el mundo.",
    location: "Bávaro, Punta Cana",
    address: "Bulevar Turístico del Este Km 28, Bávaro 23000",
    salary: "RD$ 85,000 - 120,000 / mes",
    type: "Tiempo Completo",
    experience: "3-5 años",
    education: "Licenciatura en Hotelería o Turismo",
    languages: ["Español (Nativo)", "Inglés (Avanzado)", "Francés (Deseable)"],
    postedDate: "Hace 2 días",
    deadline: "28 de Febrero, 2026",
    description: "Buscamos un profesional dinámico y orientado al servicio para liderar nuestro equipo de recepción. El candidato ideal tendrá pasión por la hospitalidad y experiencia comprobada en gestión de equipos en hoteles de 4-5 estrellas.",
    responsibilities: [
      "Supervisar todas las operaciones del área de recepción 24/7",
      "Gestionar un equipo de 15+ recepcionistas y conserjes",
      "Asegurar la satisfacción del huésped en cada interacción",
      "Coordinar con Housekeeping y otros departamentos",
      "Manejar quejas y resolver conflictos de manera profesional",
      "Preparar reportes diarios de ocupación y revenue",
      "Capacitar y desarrollar al personal nuevo",
      "Implementar estándares de servicio de clase mundial",
    ],
    requirements: [
      "Mínimo 3 años de experiencia en posiciones similares",
      "Experiencia en sistemas PMS (Opera, Fidelio)",
      "Dominio avanzado de inglés (oral y escrito)",
      "Disponibilidad para trabajar en horarios rotativos",
      "Licenciatura en Hotelería, Turismo o afines",
      "Excelentes habilidades de comunicación y liderazgo",
      "Conocimiento de protocolos de seguridad hotelera",
    ],
    benefits: [
      "Salario competitivo + bonos por desempeño",
      "Seguro médico completo para empleado y dependientes",
      "Alojamiento subsidiado en complejo",
      "Alimentación incluida en turnos",
      "Descuentos en servicios del resort",
      "Programa de desarrollo profesional",
      "2 semanas de vacaciones pagadas al año",
      "Transporte desde Santo Domingo",
    ],
    skills: ["Liderazgo", "Atención al Cliente", "Opera PMS", "Revenue Management", "Resolución de Conflictos"],
    urgent: true,
    remote: false,
    applicants: 47,
    views: 1250,
    category: "Hotelería",
  },
  "chef-ejecutivo-el-conde": {
    id: "chef-ejecutivo-el-conde",
    title: "Chef Ejecutivo",
    company: "Restaurante El Conde",
    companyLogo: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&h=100&fit=crop",
    companyDescription: "Restaurante El Conde es un establecimiento gastronómico reconocido en la Zona Colonial de Santo Domingo, especializado en fusión de cocina dominicana contemporánea.",
    location: "Zona Colonial, Santo Domingo",
    address: "Calle El Conde #58, Ciudad Colonial, Santo Domingo",
    salary: "RD$ 120,000 - 180,000 / mes",
    type: "Tiempo Completo",
    experience: "5+ años",
    education: "Título en Artes Culinarias",
    languages: ["Español (Nativo)", "Inglés (Intermedio)"],
    postedDate: "Hace 1 semana",
    deadline: "15 de Marzo, 2026",
    description: "Buscamos un Chef Ejecutivo creativo y apasionado para liderar nuestra cocina. El candidato ideal combinará técnicas culinarias internacionales con los sabores auténticos del Caribe.",
    responsibilities: [
      "Diseñar y actualizar menús estacionales",
      "Liderar equipo de 12 cocineros y auxiliares",
      "Gestionar inventario y costos de alimentos",
      "Mantener estándares de higiene y seguridad alimentaria",
      "Crear experiencias gastronómicas memorables",
      "Colaborar en eventos especiales y catering",
    ],
    requirements: [
      "Mínimo 5 años de experiencia como Chef",
      "Formación en escuela culinaria reconocida",
      "Conocimiento de cocina dominicana y caribeña",
      "Certificación en manipulación de alimentos",
      "Capacidad de trabajar bajo presión",
      "Creatividad e innovación culinaria",
    ],
    benefits: [
      "Salario competitivo + participación en ganancias",
      "Seguro médico privado",
      "Libertad creativa en el menú",
      "Presupuesto para capacitación internacional",
      "Día libre adicional semanal",
    ],
    skills: ["Cocina Fusión", "Gestión de Cocina", "Creatividad", "Liderazgo", "HACCP"],
    urgent: false,
    remote: false,
    applicants: 23,
    views: 890,
    category: "Gastronomía",
  },
  "guia-turistico-ecotours": {
    id: "guia-turistico-ecotours",
    title: "Guía Turístico Bilingüe",
    company: "EcoTours RD",
    companyLogo: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=100&h=100&fit=crop",
    companyDescription: "EcoTours RD es la empresa líder en turismo sostenible en República Dominicana, ofreciendo experiencias únicas en la naturaleza.",
    location: "Las Terrenas, Samaná",
    address: "Calle Principal #123, Las Terrenas, Samaná",
    salary: "RD$ 35,000 - 50,000 / mes + propinas",
    type: "Tiempo Completo",
    experience: "1-2 años",
    education: "Bachillerato o carrera técnica en Turismo",
    languages: ["Español (Nativo)", "Inglés (Avanzado)", "Francés (Plus)"],
    postedDate: "Hace 3 días",
    deadline: "10 de Marzo, 2026",
    description: "Únete a nuestro equipo como Guía Turístico y comparte la belleza de Samaná con visitantes de todo el mundo. Buscamos personas apasionadas por la naturaleza y la cultura dominicana.",
    responsibilities: [
      "Guiar tours de avistamiento de ballenas",
      "Conducir excursiones a El Limón y Playa Rincón",
      "Proporcionar información sobre flora y fauna local",
      "Asegurar la seguridad de los visitantes",
      "Ofrecer servicio excepcional al cliente",
    ],
    requirements: [
      "Inglés fluido (obligatorio)",
      "Conocimiento de la zona de Samaná",
      "Certificación en primeros auxilios (deseable)",
      "Licencia de conducir",
      "Excelente condición física",
      "Pasión por el ecoturismo",
    ],
    benefits: [
      "Propinas generosas de turistas",
      "Uniforme y equipamiento proporcionado",
      "Capacitación continua",
      "Ambiente de trabajo al aire libre",
      "Oportunidad de crecimiento",
    ],
    skills: ["Comunicación", "Idiomas", "Primeros Auxilios", "Naturaleza", "Servicio al Cliente"],
    urgent: false,
    remote: false,
    applicants: 35,
    views: 720,
    category: "Turismo",
  },
};

// Vacante por defecto
const defaultJob = {
  id: "coordinador-eventos",
  title: "Coordinador de Eventos y Bodas",
  company: "Punta Cana Princess",
  companyLogo: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=100&h=100&fit=crop",
  companyDescription: "Punta Cana Princess es un resort all-inclusive de 5 estrellas ubicado en las playas más hermosas del Caribe.",
  location: "Bávaro, Punta Cana",
  address: "Playa Bávaro, Punta Cana 23000",
  salary: "RD$ 55,000 - 75,000 / mes",
  type: "Tiempo Completo",
  experience: "2-3 años",
  education: "Licenciatura en Eventos, Turismo o afines",
  languages: ["Español (Nativo)", "Inglés (Avanzado)"],
  postedDate: "Hace 2 horas",
  deadline: "20 de Febrero, 2026",
  description: "Buscamos un Coordinador de Eventos apasionado para crear momentos inolvidables en bodas y eventos corporativos en nuestro resort de playa.",
  responsibilities: [
    "Planificar y coordinar bodas de destino",
    "Gestionar eventos corporativos y conferencias",
    "Coordinar con proveedores externos",
    "Supervisar montaje y logística de eventos",
    "Atender consultas de clientes internacionales",
  ],
  requirements: [
    "2+ años de experiencia en coordinación de eventos",
    "Inglés avanzado (indispensable)",
    "Disponibilidad para trabajar fines de semana",
    "Excelentes habilidades organizativas",
    "Atención meticulosa al detalle",
  ],
  benefits: [
    "Salario competitivo",
    "Bonos por evento exitoso",
    "Seguro médico",
    "Alojamiento en el resort",
    "Comidas incluidas",
  ],
  skills: ["Planificación", "Negociación", "Creatividad", "Gestión de Proveedores"],
  urgent: true,
  remote: false,
  applicants: 28,
  views: 456,
  category: "Eventos",
};

const relatedJobs = [
  {
    id: "asistente-recepcion",
    title: "Asistente de Recepción",
    company: "Hotel Catalonia",
    location: "Bávaro, Punta Cana",
    salary: "RD$ 28,000 - 35,000",
  },
  {
    id: "supervisor-housekeeping",
    title: "Supervisor de Housekeeping",
    company: "Secrets Royal Beach",
    location: "Punta Cana",
    salary: "RD$ 45,000 - 55,000",
  },
  {
    id: "bartender-premium",
    title: "Bartender Mixólogo",
    company: "Hard Rock Hotel",
    location: "Punta Cana",
    salary: "RD$ 32,000 + propinas",
  },
];

export default function EmpleoDetalle() {
  const { id } = useParams();
  const job = id && jobsData[id] ? jobsData[id] : defaultJob;

  return (
    <PageTransition>
      <SEOHead
        title={`${job.title} en ${job.company} | Empleo Turismo RD`}
        description={`Aplica para ${job.title} en ${job.company}, ${job.location}. ${job.salary}. ${job.description.substring(0, 120)}...`}
        keywords={`empleo turismo, vacante ${job.category}, trabajo ${job.location}, ${job.company}`}
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Breadcrumb & Back */}
        <div className="pt-20 bg-muted/30">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary">Inicio</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/empleo" className="hover:text-primary">Empleo</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">{job.title}</span>
            </div>
          </div>
        </div>

        {/* Job Header */}
        <section className="bg-muted/30 pb-8">
          <div className="container mx-auto px-4">
            <Link to="/empleo">
              <Button variant="ghost" size="sm" className="mb-4 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver a Empleos
              </Button>
            </Link>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Main Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={job.companyLogo}
                    alt={job.company}
                    className="w-20 h-20 rounded-xl object-cover border-2 border-border"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {job.urgent && (
                        <Badge className="bg-orange-500 text-white">Urgente</Badge>
                      )}
                      {job.remote && (
                        <Badge variant="outline" className="text-primary border-primary">
                          Remoto
                        </Badge>
                      )}
                      <Badge variant="secondary">{job.category}</Badge>
                    </div>
                    <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                      {job.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {job.postedDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-background rounded-lg p-4 text-center">
                    <DollarSign className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Salario</p>
                    <p className="text-sm font-semibold text-foreground">{job.salary.split('/')[0]}</p>
                  </div>
                  <div className="bg-background rounded-lg p-4 text-center">
                    <Briefcase className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Tipo</p>
                    <p className="text-sm font-semibold text-foreground">{job.type}</p>
                  </div>
                  <div className="bg-background rounded-lg p-4 text-center">
                    <GraduationCap className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Experiencia</p>
                    <p className="text-sm font-semibold text-foreground">{job.experience}</p>
                  </div>
                  <div className="bg-background rounded-lg p-4 text-center">
                    <Calendar className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Fecha límite</p>
                    <p className="text-sm font-semibold text-foreground">{job.deadline.split(',')[0]}</p>
                  </div>
                </div>
              </motion.div>

              {/* Apply Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:w-80"
              >
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <Button className="w-full gap-2" size="lg">
                      <Send className="h-4 w-4" />
                      Aplicar Ahora
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 gap-2">
                        <Bookmark className="h-4 w-4" />
                        Guardar
                      </Button>
                      <Button variant="outline" className="flex-1 gap-2">
                        <Share2 className="h-4 w-4" />
                        Compartir
                      </Button>
                    </div>
                    <Separator />
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p className="flex items-center justify-between">
                        <span>Aplicantes:</span>
                        <span className="text-foreground font-medium">{job.applicants} personas</span>
                      </p>
                      <p className="flex items-center justify-between">
                        <span>Vistas:</span>
                        <span className="text-foreground font-medium">{job.views}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Job Details */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Descripción del Puesto</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {job.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Responsibilities */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Responsabilidades</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {job.responsibilities.map((item, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Requirements */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Requisitos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {job.requirements.map((item, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <Star className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Benefits */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-primary" />
                        Beneficios
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {job.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center gap-3 bg-background rounded-lg p-3">
                            {index === 0 && <DollarSign className="h-5 w-5 text-primary" />}
                            {index === 1 && <Shield className="h-5 w-5 text-primary" />}
                            {index === 2 && <Coffee className="h-5 w-5 text-primary" />}
                            {index === 3 && <Plane className="h-5 w-5 text-primary" />}
                            {index >= 4 && <CheckCircle2 className="h-5 w-5 text-primary" />}
                            <span className="text-sm text-foreground">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Skills */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Habilidades Requeridas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="px-4 py-2">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Company Info */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Sobre la Empresa</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={job.companyLogo}
                          alt={job.company}
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-semibold text-foreground">{job.company}</p>
                          <p className="text-sm text-muted-foreground">{job.category}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {job.companyDescription}
                      </p>
                      <Button variant="outline" className="w-full gap-2">
                        <Building className="h-4 w-4" />
                        Ver Perfil de Empresa
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Location */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Ubicación
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                        <MapPin className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm text-foreground font-medium">{job.location}</p>
                      <p className="text-sm text-muted-foreground">{job.address}</p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Languages */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" />
                        Idiomas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {job.languages.map((lang) => (
                          <li key={lang} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">{lang}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Related Jobs */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Vacantes Similares</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {relatedJobs.map((related) => (
                        <Link
                          key={related.id}
                          to={`/empleo/${related.id}`}
                          className="block p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                        >
                          <p className="font-medium text-foreground text-sm">{related.title}</p>
                          <p className="text-xs text-muted-foreground">{related.company}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {related.location}
                            </span>
                            <span className="text-xs text-primary font-medium">{related.salary}</span>
                          </div>
                        </Link>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              ¿Te interesa esta posición?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Envía tu CV y una carta de presentación para aplicar a esta vacante. 
              El equipo de recursos humanos te contactará pronto.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="gap-2">
                <Send className="h-4 w-4" />
                Aplicar Ahora
              </Button>
              <Link to="/empleo">
                <Button size="lg" variant="outline">
                  Ver Más Vacantes
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
