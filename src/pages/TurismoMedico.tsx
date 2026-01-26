import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Stethoscope, 
  Smile, 
  Home, 
  Sparkles, 
  Shield, 
  Award, 
  MapPin, 
  Phone, 
  Globe, 
  Star,
  Calendar,
  ChevronRight,
  Check
} from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  {
    icon: Stethoscope,
    title: "Clínicas y Hospitales",
    description: "Centros médicos certificados internacionalmente con especialistas de primer nivel.",
    services: ["Cirugía general", "Cardiología", "Oncología", "Traumatología"],
    color: "bg-blue-500",
  },
  {
    icon: Smile,
    title: "Turismo Dental",
    description: "Tratamientos dentales de alta calidad a precios competitivos.",
    services: ["Implantes", "Blanqueamiento", "Ortodoncia", "Carillas"],
    color: "bg-cyan-500",
  },
  {
    icon: Sparkles,
    title: "Cirugía Estética",
    description: "Procedimientos estéticos con cirujanos plásticos certificados.",
    services: ["Liposucción", "Rinoplastia", "Lifting facial", "Aumento mamario"],
    color: "bg-pink-500",
  },
  {
    icon: Home,
    title: "Casas de Reposo",
    description: "Instalaciones de recuperación y reposo en entornos paradisíacos.",
    services: ["Cuidado post-operatorio", "Rehabilitación", "Terapia física", "Bienestar"],
    color: "bg-green-500",
  },
];

const clinics = [
  {
    name: "Centro Médico Punta Cana",
    location: "Punta Cana",
    specialties: ["Cirugía Plástica", "Dental", "Oftalmología"],
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400",
    certifications: ["JCI", "ISO 9001"],
  },
  {
    name: "Hospital General de la Plaza de la Salud",
    location: "Santo Domingo",
    specialties: ["Cardiología", "Oncología", "Neurología"],
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400",
    certifications: ["JCI", "Planetree"],
  },
  {
    name: "Clínica Dental Sonrisa Perfecta",
    location: "Santiago",
    specialties: ["Implantología", "Estética Dental", "Endodoncia"],
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400",
    certifications: ["ADA", "ISO"],
  },
];

const benefits = [
  { icon: Award, title: "Médicos Certificados", description: "Profesionales formados en USA y Europa" },
  { icon: Shield, title: "Precios Competitivos", description: "Hasta 70% menos que en EE.UU." },
  { icon: Heart, title: "Recuperación en el Caribe", description: "Entorno paradisíaco para sanar" },
  { icon: Globe, title: "Atención Multilingüe", description: "Español, inglés, francés y más" },
];

const testimonials = [
  {
    name: "Sarah M.",
    country: "Estados Unidos",
    procedure: "Implantes dentales",
    text: "Ahorré $15,000 y tuve una experiencia increíble. Los doctores fueron muy profesionales.",
    rating: 5,
  },
  {
    name: "Jean-Pierre L.",
    country: "Francia",
    procedure: "Cirugía estética",
    text: "La clínica era de primera clase y la recuperación en la playa fue perfecta.",
    rating: 5,
  },
];

export default function TurismoMedico() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-cyan-900/80 to-teal-900/90" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551076805-e1869033e561?w=1920')] bg-cover bg-center opacity-30" />
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <span className="inline-flex items-center gap-2 text-cyan-300 text-sm font-medium mb-4">
                <Heart className="h-4 w-4" />
                Salud y Bienestar
              </span>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
                Turismo Médico en <span className="text-cyan-400">República Dominicana</span>
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Combina tratamientos médicos de clase mundial con una recuperación en el paraíso caribeño. 
                Ahorra hasta un 70% en procedimientos médicos y dentales.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gap-2 bg-white text-cyan-900 hover:bg-white/90">
                  <Phone className="h-4 w-4" />
                  Consulta Gratuita
                </Button>
                <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                  Ver Especialidades
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid md:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
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
                Especialidades <span className="text-gradient">Médicas</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Ofrecemos una amplia gama de servicios médicos con los más altos estándares internacionales.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-all hover:shadow-lg"
                >
                  <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center mb-4`}>
                    <category.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">{category.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                  <ul className="space-y-2">
                    {category.services.map((service) => (
                      <li key={service} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-3.5 w-3.5 text-primary" />
                        {service}
                      </li>
                    ))}
                  </ul>
                  <Button variant="link" className="text-primary p-0 mt-4 gap-1">
                    Ver clínicas
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Clinics */}
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
                  Clínicas <span className="text-gradient">Certificadas</span>
                </h2>
                <p className="text-muted-foreground max-w-xl">
                  Centros médicos con acreditaciones internacionales y equipos de última generación.
                </p>
              </div>
              <Button variant="outline" className="hidden md:flex gap-2">
                Ver directorio completo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {clinics.map((clinic, index) => (
                <motion.div
                  key={clinic.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-surface rounded-2xl overflow-hidden hover:shadow-xl transition-all"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={clinic.image}
                      alt={clinic.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-semibold">{clinic.rating}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold text-foreground mb-1">{clinic.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-3.5 w-3.5" />
                      {clinic.location}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {clinic.specialties.map((spec) => (
                        <span key={spec} className="text-xs bg-muted px-2 py-1 rounded-full">
                          {spec}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex gap-2">
                        {clinic.certifications.map((cert) => (
                          <span key={cert} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {cert}
                          </span>
                        ))}
                      </div>
                      <Button size="sm">Contactar</Button>
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
                Testimonios de <span className="text-gradient">Pacientes</span>
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
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.country}</p>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {testimonial.procedure}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-cyan-900 to-blue-900">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                ¿Listo para tu consulta?
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Nuestro equipo te ayudará a planificar tu viaje médico, desde la consulta inicial hasta la recuperación.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="gap-2 bg-white text-cyan-900 hover:bg-white/90">
                  <Calendar className="h-4 w-4" />
                  Agendar Consulta
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
