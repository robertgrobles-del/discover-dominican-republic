import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Check,
  Search,
  Video,
  Pill,
  AlertCircle,
  Filter,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const quickCategories = [
  { icon: Shield, title: "Atención Internacional", description: "Hospitales certificados con personal multilingüe y estándares globales." },
  { icon: Pill, title: "Farmacias 24 Horas", description: "Red de farmacias disponibles en cualquier momento para emergencias." },
  { icon: Video, title: "Telemedicina", description: "Consultas virtuales inmediatas con doctores certificados." },
];

const categoryFilters = [
  { name: "Todos", active: true },
  { name: "Hospitales", active: false },
  { name: "Clínicas Dentales", active: false },
  { name: "Farmacias", active: false },
  { name: "Laboratorios", active: false },
  { name: "Wellness", active: false },
];

const clinics = [
  {
    name: "Centro Médico Punta Cana",
    location: "Av. España, Bávaro, Punta Cana",
    specialties: ["Urgencias 24/7", "Inglés / Francés", "Acepta Seguro Internacional"],
    rating: 4.8,
    verified: true,
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400",
    type: "Hospital",
  },
  {
    name: "Hospiten Santo Domingo",
    location: "Av. Alma Mater, Santo Domingo",
    specialties: ["Alta Especialidad", "Emergencias", "Cardiología"],
    rating: 4.9,
    verified: true,
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400",
    type: "Hospital",
  },
  {
    name: "Clínica Dental Sonrisa RD",
    location: "Zona Colonial, Santo Domingo",
    specialties: ["Implantes", "Estética Dental", "Ortodoncia"],
    rating: 4.9,
    verified: true,
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400",
    type: "Dental",
  },
  {
    name: "Farmacia Carol 24H",
    location: "Multiple locations",
    specialties: ["24 Horas", "Delivery", "Seguro Internacional"],
    rating: 4.6,
    verified: true,
    image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400",
    type: "Farmacia",
  },
];

const dentalServices = [
  { name: "Implantes Dentales", savings: "60-70%", avgPrice: "$800-1,500" },
  { name: "Carillas de Porcelana", savings: "50-65%", avgPrice: "$300-500/pieza" },
  { name: "Blanqueamiento Láser", savings: "40-50%", avgPrice: "$150-250" },
  { name: "Ortodoncia Invisalign", savings: "45-55%", avgPrice: "$2,500-4,000" },
];

const wellnessHotels = [
  {
    name: "Casa de Campo Wellness",
    location: "La Romana",
    services: ["Spa de clase mundial", "Yoga", "Nutrición"],
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400",
  },
  {
    name: "Sanctuary Cap Cana",
    location: "Punta Cana",
    services: ["Tratamientos holísticos", "Meditación", "Detox"],
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400",
  },
];

const benefits = [
  { icon: Award, title: "Médicos Certificados", description: "Profesionales formados en USA y Europa" },
  { icon: Shield, title: "Hasta 70% Ahorro", description: "Comparado con precios en EE.UU." },
  { icon: Heart, title: "Recuperación Caribeña", description: "Entorno paradisíaco para sanar" },
  { icon: Globe, title: "Atención Multilingüe", description: "Español, inglés, francés y más" },
];

export default function TurismoMedico() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero with Search */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-cyan-900/80 to-teal-900/90" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551076805-e1869033e561?w=1920')] bg-cover bg-center opacity-30" />
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                Asistencia Médica para Turistas
              </h1>
              <p className="text-lg text-white/80 mb-8">
                Encuentra hospitales certificados, farmacias 24 horas y médicos de confianza. 
                Tu salud es nuestra prioridad mientras disfrutas de RD.
              </p>
              
              {/* Search Bar */}
              <div className="bg-card rounded-xl p-2 flex flex-col md:flex-row gap-2 shadow-xl">
                <div className="flex-1 flex items-center gap-2 px-4 border-b md:border-b-0 md:border-r border-border">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar especialidad, clínica..."
                    className="border-0 focus-visible:ring-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex-1 flex items-center gap-2 px-4">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <select className="flex-1 bg-transparent border-0 text-foreground focus:ring-0">
                    <option>Todas las ubicaciones</option>
                    <option>Santo Domingo</option>
                    <option>Punta Cana / Bávaro</option>
                    <option>Puerto Plata</option>
                    <option>Samaná</option>
                  </select>
                </div>
                <Button className="px-8">Buscar</Button>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 lg:px-8 -mt-5 relative z-10">
          <div role="note" className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-foreground">
            <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <p><strong>Información turística:</strong> este directorio no ofrece diagnósticos ni sustituye el consejo de un profesional de salud. Verifica directamente con cada proveedor sus servicios, credenciales y condiciones.</p>
          </div>
        </div>

        {/* Quick Categories */}
        <section className="py-12 bg-card">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid md:grid-cols-3 gap-6">
              {quickCategories.map((cat, index) => (
                <motion.div
                  key={cat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 p-6 bg-surface rounded-xl border border-border hover:border-primary/50 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary flex items-center justify-center transition-colors shrink-0">
                    <cat.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground mb-1">{cat.title}</h3>
                    <p className="text-sm text-muted-foreground">{cat.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Strip */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-wrap justify-center gap-8">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex items-center gap-3">
                  <benefit.icon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground text-sm">{benefit.title}</p>
                    <p className="text-xs text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Directory with Filters */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto pb-6 mb-8">
              {categoryFilters.map((filter) => (
                <Button
                  key={filter.name}
                  variant={activeFilter === filter.name ? "default" : "outline"}
                  className="rounded-full shrink-0"
                  onClick={() => setActiveFilter(filter.name)}
                >
                  {filter.name}
                </Button>
              ))}
            </div>

            <h2 className="font-display text-2xl font-bold mb-6">Resultados Recomendados</h2>

            {/* Clinic Cards */}
            <div className="space-y-4">
              {clinics.map((clinic, index) => (
                <motion.div
                  key={clinic.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col md:flex-row gap-4 bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all p-4"
                >
                  <div className="w-full md:w-48 h-48 md:h-auto shrink-0 rounded-lg overflow-hidden">
                    <img
                      src={clinic.image}
                      alt={clinic.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col flex-1 gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-foreground">{clinic.name}</h3>
                          {clinic.verified && (
                            <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30">
                              <Check className="h-3 w-3 mr-1" />
                              Verificado
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {clinic.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded text-amber-600 dark:text-amber-400">
                        <span className="font-bold text-sm">{clinic.rating}</span>
                        <Star className="h-4 w-4 fill-current" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {clinic.specialties.map((spec) => (
                        <span key={spec} className="px-2 py-1 bg-muted rounded text-xs font-medium">
                          {spec}
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto pt-3 flex items-center justify-between border-t border-border">
                      <Badge variant="outline">{clinic.type}</Badge>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Ver Mapa</Button>
                        <Button size="sm" className="gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          Llamar
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Dental Services */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Badge className="mb-4" variant="outline">
                <Smile className="h-3 w-3 mr-1" />
                TURISMO DENTAL
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Tratamientos Dentales con <span className="text-gradient">Gran Ahorro</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Clínicas dentales certificadas con tecnología de punta y precios hasta 70% menores.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {dentalServices.map((service, index) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-surface rounded-xl p-6 border border-border"
                >
                  <Smile className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-bold text-foreground mb-2">{service.name}</h3>
                  <p className="text-2xl font-bold text-primary mb-1">{service.savings}</p>
                  <p className="text-sm text-muted-foreground">Ahorro vs. EE.UU.</p>
                  <p className="text-xs text-muted-foreground mt-2">Precio promedio: {service.avgPrice}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Wellness Hotels */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-end justify-between mb-8"
            >
              <div>
                <Badge className="mb-2" variant="outline">
                  <Sparkles className="h-3 w-3 mr-1" />
                  RECUPERACIÓN DE LUJO
                </Badge>
                <h2 className="font-display text-3xl font-bold">
                  Hoteles Wellness
                </h2>
              </div>
              <Link to="/wellness">
                <Button variant="outline" className="hidden md:flex gap-2">
                  Ver todos
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {wellnessHotels.map((hotel, index) => (
                <motion.div
                  key={hotel.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-2/5 aspect-video md:aspect-auto relative overflow-hidden">
                      <img
                        src={hotel.image}
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-display text-xl font-bold text-foreground">{hotel.name}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-semibold">{hotel.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-4">
                        <MapPin className="h-3.5 w-3.5" />
                        {hotel.location}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {hotel.services.map((service) => (
                          <span key={service} className="text-xs bg-muted px-2 py-1 rounded-full">
                            {service}
                          </span>
                        ))}
                      </div>
                      <Button className="w-full">Ver Paquetes de Recuperación</Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Emergency CTA */}
        <section className="py-8 bg-red-500/10 border-y border-red-500/20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-foreground">¿Emergencia Médica?</p>
                  <p className="text-sm text-muted-foreground">Línea de emergencias disponible 24/7</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="destructive" size="lg" className="gap-2">
                  <Phone className="h-4 w-4" />
                  911 Emergencias
                </Button>
                <Button variant="outline" size="lg">
                  Ver Hospitales Cercanos
                </Button>
              </div>
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
