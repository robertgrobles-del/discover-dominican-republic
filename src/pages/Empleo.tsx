import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  Bookmark,
  Building,
  GraduationCap,
  Users,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const provinces = [
  { name: "La Altagracia (Punta Cana)", count: 124 },
  { name: "Santo Domingo", count: 86 },
  { name: "Puerto Plata", count: 42 },
  { name: "Samaná", count: 18 },
];

const categories = [
  "Hotelería & Alojamiento",
  "Alimentos y Bebidas",
  "Agencias de Viaje",
  "Entretenimiento",
];

const experienceLevels = [
  "Sin experiencia",
  "Junior (1-2 años)",
  "Senior (3-5 años)",
  "Gerencial (+5 años)",
];

const featuredJobs = [
  {
    id: 1,
    title: "Gerente de Recepción",
    company: "Grand Paradise Resort",
    location: "Bávaro, Punta Cana",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
    urgent: true,
  },
  {
    id: 2,
    title: "Chef Ejecutivo",
    company: "Restaurante El Conde",
    location: "Santo Domingo, DN",
    image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=300&fit=crop",
    urgent: false,
  },
  {
    id: 3,
    title: "Guía Turístico Bilingüe",
    company: "EcoTours RD",
    location: "Las Terrenas, Samaná",
    image: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=400&h=300&fit=crop",
    urgent: false,
  },
];

const jobs = [
  {
    id: 4,
    title: "Coordinador de Eventos y Bodas",
    company: "Punta Cana Princess",
    time: "Hace 2 horas",
    salary: "$45k - $60k/mes",
    tags: ["Tiempo Completo", "Presencial", "Inglés Avanzado"],
    remote: false,
  },
  {
    id: 5,
    title: "Agente de Reservas Senior",
    company: "Caribe Tours & Travel",
    time: "Hace 5 horas",
    salary: null,
    tags: ["Híbrido", "Atención al Cliente"],
    remote: true,
  },
  {
    id: 6,
    title: "Bartender Mixólogo",
    company: "Hard Rock Cafe SD",
    time: "Ayer",
    salary: "Propinas + Beneficios",
    tags: ["Turno Rotativo", "Experiencia 2+ años"],
    remote: false,
  },
  {
    id: 7,
    title: "Gerente de Operaciones",
    company: "Grupo Hotelero Internacional",
    time: "Hace 2 días",
    salary: "Confidencial",
    tags: ["La Romana", "Alta Gerencia"],
    remote: false,
  },
];

export default function Empleo() {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Section */}
        <section className="pt-24 pb-12 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Tu carrera en el turismo <span className="text-primary italic">empieza aquí</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Conectamos a los mejores profesionales con hoteles, restaurantes y agencias 
              líderes en República Dominicana.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-3xl mx-auto bg-card rounded-xl border border-border p-2 flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cargo o palabra clave (ej. Chef, Recepcionista)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-0 bg-transparent"
                />
              </div>
              <div className="flex-1">
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="border-0 bg-transparent">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Cualquier ubicación" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((p) => (
                      <SelectItem key={p.name} value={p.name}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button size="lg">Buscar</Button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <aside className="lg:col-span-1 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-foreground">Filtros</h2>
                  <Button variant="link" className="text-primary p-0 h-auto">
                    Limpiar todo
                  </Button>
                </div>

                {/* Province Filter */}
                <div className="bg-card rounded-xl border border-border p-4">
                  <h3 className="font-medium text-foreground mb-3 text-sm uppercase tracking-wider">
                    Provincia
                  </h3>
                  <div className="space-y-2">
                    {provinces.map((province) => (
                      <label key={province.name} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox id={province.name} />
                        <span className="text-sm text-foreground flex-1">{province.name}</span>
                        <span className="text-xs text-muted-foreground">{province.count}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div className="bg-card rounded-xl border border-border p-4">
                  <h3 className="font-medium text-foreground mb-3 text-sm uppercase tracking-wider">
                    Categoría
                  </h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label key={category} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox id={category} />
                        <span className="text-sm text-foreground">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Experience Filter */}
                <div className="bg-card rounded-xl border border-border p-4">
                  <h3 className="font-medium text-foreground mb-3 text-sm uppercase tracking-wider">
                    Experiencia
                  </h3>
                  <div className="space-y-2">
                    {experienceLevels.map((level) => (
                      <label key={level} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="experience"
                          value={level}
                          checked={selectedExperience === level}
                          onChange={(e) => setSelectedExperience(e.target.value)}
                          className="text-primary"
                        />
                        <span className="text-sm text-foreground">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </aside>

              {/* Job Listings */}
              <div className="lg:col-span-3 space-y-8">
                {/* Featured Jobs */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-xl font-bold text-foreground">
                      Vacantes Destacadas
                    </h2>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    {featuredJobs.map((job, index) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-card rounded-xl border border-border overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors"
                      >
                        <div className="relative h-40">
                          <img
                            src={job.image}
                            alt={job.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {job.urgent && (
                            <Badge className="absolute top-3 left-3 bg-orange-500 text-white">
                              Urgente
                            </Badge>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-foreground mb-1">{job.title}</h3>
                          <p className="text-sm text-muted-foreground">{job.company}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                            <MapPin className="h-3 w-3" /> {job.location}
                          </p>
                          <Button variant="outline" size="sm" className="w-full mt-4">
                            Ver Detalle
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Latest Jobs */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-xl font-bold text-foreground">
                      Últimas Ofertas
                    </h2>
                    <Select defaultValue="recent">
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Ordenar por" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Más recientes</SelectItem>
                        <SelectItem value="salary">Mayor salario</SelectItem>
                        <SelectItem value="relevance">Relevancia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    {jobs.map((job, index) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-card rounded-xl border border-border p-4 flex flex-col md:flex-row md:items-center gap-4 hover:border-primary/50 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="h-6 w-6 text-primary" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-foreground">{job.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {job.company} • {job.time}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {job.remote && (
                                <Badge variant="outline" className="text-primary border-primary">
                                  Remoto
                                </Badge>
                              )}
                              {job.salary && (
                                <Badge className="bg-primary/10 text-primary">
                                  {job.salary}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-2">
                            {job.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button>Aplicar</Button>
                          <Button variant="ghost" size="icon">
                            <Bookmark className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="text-center mt-8">
                    <Button variant="outline" className="gap-2">
                      Cargar más vacantes <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <p className="text-3xl font-bold text-foreground">2,500+</p>
                <p className="text-sm text-muted-foreground">Empleos Activos</p>
              </div>
              <div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                <p className="text-3xl font-bold text-foreground">450+</p>
                <p className="text-sm text-muted-foreground">Empresas Registradas</p>
              </div>
              <div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <p className="text-3xl font-bold text-foreground">15,000+</p>
                <p className="text-sm text-muted-foreground">Candidatos</p>
              </div>
              <div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <p className="text-3xl font-bold text-foreground">85%</p>
                <p className="text-sm text-muted-foreground">Tasa de Colocación</p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
