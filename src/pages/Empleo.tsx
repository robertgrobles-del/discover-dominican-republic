import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search, MapPin, Briefcase, Clock, DollarSign, ChevronRight,
  Building, GraduationCap, Users, Zap, Globe, Star,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const categoryLabels: Record<string, { label: string; icon: typeof Briefcase }> = {
  hoteleria: { label: "Hotelería", icon: Building },
  gastronomia: { label: "Gastronomía", icon: Star },
  tours: { label: "Tours & Excursiones", icon: Globe },
  wellness: { label: "Spa & Bienestar", icon: Star },
  marketing: { label: "Marketing", icon: Zap },
  operaciones: { label: "Operaciones", icon: Users },
};

const jobTypeLabels: Record<string, string> = {
  'full-time': 'Tiempo Completo',
  'part-time': 'Medio Tiempo',
  'contract': 'Contrato',
  'freelance': 'Freelance',
};

const experienceLabels: Record<string, string> = {
  'entry': 'Sin experiencia',
  'junior': 'Junior (1-2 años)',
  'mid': 'Intermedio (2-4 años)',
  'senior': 'Senior (5+ años)',
  'director': 'Director / Gerencial',
};

function useJobVacancies() {
  return useQuery({
    queryKey: ['job-vacancies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_vacancies')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('is_urgent', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'Hace menos de 1 hora';
  if (diffHours < 24) return `Hace ${diffHours} horas`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  return `Hace ${Math.floor(diffDays / 30)} meses`;
}

export default function Empleo() {
  const { data: vacancies, isLoading } = useJobVacancies();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [selectedExperience, setSelectedExperience] = useState("all");

  const featured = vacancies?.filter(v => v.is_featured) || [];
  const filtered = vacancies?.filter(v => {
    const matchesSearch = !searchTerm || 
      v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || v.category === selectedCategory;
    const matchesProvince = selectedProvince === 'all' || v.province === selectedProvince;
    const matchesExperience = selectedExperience === 'all' || v.experience_level === selectedExperience;
    return matchesSearch && matchesCategory && matchesProvince && matchesExperience;
  }) || [];

  const provinces = [...new Set(vacancies?.map(v => v.province).filter(Boolean) || [])] as string[];

  return (
    <PageTransition>
      <SEOHead
        title="Empleo en Turismo | Bolsa de Trabajo RD"
        description="Encuentra las mejores oportunidades laborales en el sector turístico de República Dominicana."
        keywords="empleo turismo, trabajo hoteles, vacantes Punta Cana, empleo hotelería"
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="pt-24 pb-12 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <Briefcase className="h-3 w-3 mr-1" /> {vacancies?.length || 0} vacantes activas
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Tu carrera en el turismo <span className="text-primary italic">empieza aquí</span>
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                Conectamos a los mejores profesionales con hoteles, restaurantes y empresas turísticas líderes en República Dominicana.
              </p>
            </motion.div>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto bg-card rounded-xl border border-border p-2 flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por puesto o empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-0 bg-transparent focus-visible:ring-0"
                />
              </div>
              <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                <SelectTrigger className="md:w-48 bg-background">
                  <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                  <SelectValue placeholder="Ubicación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las zonas</SelectItem>
                  {provinces.map(p => (
                    <SelectItem key={p} value={p!}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="gap-2"><Search className="h-4 w-4" /> Buscar</Button>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 py-4 flex flex-wrap items-center gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-44 bg-background">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {Object.entries(categoryLabels).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedExperience} onValueChange={setSelectedExperience}>
              <SelectTrigger className="w-48 bg-background">
                <SelectValue placeholder="Experiencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Cualquier experiencia</SelectItem>
                {Object.entries(experienceLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground ml-auto">
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </section>

        {/* Featured Jobs */}
        {featured.length > 0 && (
          <section className="container mx-auto px-4 py-8">
            <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" /> Vacantes Destacadas
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {featured.slice(0, 3).map((job, i) => (
                <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Link to={`/empleo/${job.slug}`}>
                    <div className="relative rounded-xl overflow-hidden group h-52 border border-border">
                      <img src={job.company_logo || '/placeholder.svg'} alt={job.company_name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        {job.is_urgent && (
                          <Badge className="mb-2 bg-destructive/20 text-destructive border-destructive/30">🔥 Urgente</Badge>
                        )}
                        <h3 className="font-display font-bold text-foreground text-lg">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">{job.company_name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" /> {job.location}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Job Listings */}
        <section className="container mx-auto px-4 py-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-6">
            Todas las Vacantes
          </h2>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No se encontraron vacantes con esos filtros.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/empleo/${job.slug}`}>
                    <div className="bg-card rounded-xl border border-border p-5 hover:border-primary/30 transition-all group">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                          <img src={job.company_logo || '/placeholder.svg'} alt={job.company_name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors text-lg">
                                {job.title}
                              </h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                <Building className="h-3 w-3" /> {job.company_name}
                                <span>·</span>
                                <MapPin className="h-3 w-3" /> {job.location}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {job.is_urgent && <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-xs">Urgente</Badge>}
                              {job.is_remote && <Badge variant="secondary" className="text-xs">Remoto</Badge>}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-1">{job.short_description}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                            {job.salary_range && (
                              <span className="flex items-center gap-1 text-primary font-medium">
                                <DollarSign className="h-3 w-3" /> {job.salary_range}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" /> {jobTypeLabels[job.job_type || 'full-time'] || job.job_type}
                            </span>
                            <span className="flex items-center gap-1">
                              <GraduationCap className="h-3 w-3" /> {experienceLabels[job.experience_level || 'mid'] || job.experience_level}
                            </span>
                            <span className="flex items-center gap-1 ml-auto">
                              <Clock className="h-3 w-3" /> {timeAgo(job.created_at)}
                            </span>
                          </div>
                          {job.skills && job.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {job.skills.slice(0, 4).map((skill) => (
                                <Badge key={skill} variant="outline" className="text-xs py-0.5">{skill}</Badge>
                              ))}
                              {job.skills.length > 4 && (
                                <Badge variant="outline" className="text-xs py-0.5">+{job.skills.length - 4}</Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-2" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-12">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-8 md:p-12 text-center">
            <Building className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              ¿Eres hotel o empresa turística?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Publica tus vacantes y llega a miles de profesionales del turismo en República Dominicana.
            </p>
            <Button size="lg" className="gap-2">
              <Briefcase className="h-4 w-4" /> Publicar Vacante
            </Button>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
