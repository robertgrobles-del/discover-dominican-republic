import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin, Briefcase, Clock, DollarSign, Building, Calendar,
  GraduationCap, Globe, Users, CheckCircle2, ChevronRight,
  Share2, Send, ArrowLeft, Heart, Shield, Coffee, Plane,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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

const benefitIcons: Record<string, typeof Coffee> = {
  'Seguro': Shield,
  'Alimentación': Coffee,
  'Transporte': Plane,
  'Descuento': Heart,
};

function getBenefitIcon(benefit: string) {
  for (const [key, Icon] of Object.entries(benefitIcons)) {
    if (benefit.toLowerCase().includes(key.toLowerCase())) return Icon;
  }
  return CheckCircle2;
}

function useJobVacancy(slug: string | undefined) {
  return useQuery({
    queryKey: ['job-vacancy', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_vacancies')
        .select('*')
        .eq('slug', slug!)
        .eq('is_active', true)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!slug,
  });
}

function useSimilarJobs(category: string | null, currentId: string | undefined) {
  return useQuery({
    queryKey: ['similar-jobs', category],
    queryFn: async () => {
      const { data } = await supabase
        .from('job_vacancies')
        .select('id, title, slug, company_name, company_logo, location, salary_range, is_urgent')
        .eq('is_active', true)
        .eq('category', category!)
        .neq('id', currentId!)
        .limit(3);
      return data || [];
    },
    enabled: !!category && !!currentId,
  });
}

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return `Hace ${Math.floor(diffDays / 7)} semanas`;
}

export default function EmpleoDetalle() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading } = useJobVacancy(id);
  const { data: similarJobs } = useSimilarJobs(job?.category, job?.id);

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-32">
            <Skeleton className="h-8 w-2/3 mb-4" />
            <Skeleton className="h-4 w-1/3 mb-8" />
            <Skeleton className="h-64 w-full rounded-xl mb-4" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  if (!job) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-32 text-center">
            <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Vacante no encontrada</h1>
            <p className="text-muted-foreground mb-8">Esta vacante ya no está disponible o ha sido removida.</p>
            <Link to="/empleo"><Button>Ver todas las vacantes</Button></Link>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SEOHead
        title={`${job.title} en ${job.company_name} - Empleo Turismo RD`}
        description={job.short_description || job.description?.slice(0, 160) || ''}
        keywords={`empleo, ${job.title}, ${job.company_name}, turismo, República Dominicana`}
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Breadcrumbs */}
        <div className="bg-muted/30 border-b border-border mt-16">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/empleo" className="hover:text-primary transition-colors">Empleo</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">{job.title}</span>
            </nav>
          </div>
        </div>

        {/* Header */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-muted flex-shrink-0 border border-border">
                <img src={job.company_logo || '/placeholder.svg'} alt={job.company_name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {job.is_urgent && <Badge className="bg-destructive/20 text-destructive border-destructive/30">🔥 Urgente</Badge>}
                  {job.is_remote && <Badge variant="secondary">🌐 Remoto</Badge>}
                  {job.is_featured && <Badge className="bg-primary/20 text-primary border-primary/30">⭐ Destacada</Badge>}
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Building className="h-4 w-4 text-primary" /> {job.company_name}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-primary" /> {job.location}</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {timeAgo(job.created_at)}</span>
                  {job.views_count !== null && <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {job.views_count} vistas</span>}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" className="gap-2"><Share2 className="h-4 w-4" /> Compartir</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-10">
              {/* Description */}
              <section>
                <h2 className="font-display text-xl font-bold text-foreground mb-4">Descripción del Puesto</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">{job.description}</p>
              </section>

              {/* Company */}
              {job.company_description && (
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" /> Sobre la Empresa
                  </h2>
                  <div className="bg-card rounded-xl border border-border p-5">
                    <p className="text-muted-foreground leading-relaxed">{job.company_description}</p>
                  </div>
                </section>
              )}

              {/* Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">Responsabilidades</h2>
                  <ul className="space-y-3">
                    {job.responsibilities.map((r, i) => (
                      <motion.li key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }}
                        className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{r}</span>
                      </motion.li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">Requisitos</h2>
                  <ul className="space-y-3">
                    {job.requirements.map((r, i) => (
                      <motion.li key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }}
                        className="flex items-start gap-3">
                        <GraduationCap className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{r}</span>
                      </motion.li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Benefits */}
              {job.benefits && job.benefits.length > 0 && (
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">Beneficios</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {job.benefits.map((b, i) => {
                      const Icon = getBenefitIcon(b);
                      return (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }}
                          className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm text-muted-foreground">{b}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <section>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">Habilidades Clave</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-sm py-2 px-4">{skill}</Badge>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              <div className="sticky top-32 space-y-6">
                {/* Apply Card */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-6">
                  {job.salary_range && (
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-1">Salario</p>
                      <p className="text-xl font-bold text-foreground">{job.salary_range}</p>
                    </div>
                  )}
                  <Button className="w-full mb-3" size="lg">
                    <Send className="h-4 w-4 mr-2" /> Aplicar Ahora
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Heart className="h-4 w-4" /> Guardar Vacante
                  </Button>
                  {job.applicants_count !== null && job.applicants_count > 0 && (
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      {job.applicants_count} personas ya aplicaron
                    </p>
                  )}
                </motion.div>

                {/* Quick Info */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                  className="bg-card rounded-2xl border border-border p-6">
                  <h3 className="font-display font-bold text-foreground mb-4">Detalles del Puesto</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-2"><Briefcase className="h-4 w-4" /> Tipo</span>
                      <Badge variant="secondary">{jobTypeLabels[job.job_type || 'full-time'] || job.job_type}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Experiencia</span>
                      <span className="font-medium text-foreground">{experienceLabels[job.experience_level || 'mid'] || job.experience_level}</span>
                    </div>
                    {job.education && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Educación</span>
                        <span className="font-medium text-foreground text-right text-xs max-w-[180px]">{job.education}</span>
                      </div>
                    )}
                    {job.department && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-2"><Building className="h-4 w-4" /> Departamento</span>
                        <span className="font-medium text-foreground">{job.department}</span>
                      </div>
                    )}
                    {job.deadline && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" /> Cierre</span>
                        <span className="font-medium text-foreground">{new Date(job.deadline).toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Languages */}
                {job.languages && job.languages.length > 0 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                    className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" /> Idiomas
                    </h3>
                    <div className="space-y-2">
                      {job.languages.map((lang) => (
                        <div key={lang} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          {lang}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Similar Jobs */}
                {similarJobs && similarJobs.length > 0 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                    className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="font-display font-bold text-foreground mb-4">Vacantes Similares</h3>
                    <div className="space-y-3">
                      {similarJobs.map((sj) => (
                        <Link key={sj.id} to={`/empleo/${sj.slug}`} className="block group">
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <img src={sj.company_logo || '/placeholder.svg'} alt={sj.company_name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors truncate">{sj.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{sj.company_name}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="container mx-auto px-4 pb-12">
          <Link to="/empleo">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Ver todas las vacantes
            </Button>
          </Link>
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
}
