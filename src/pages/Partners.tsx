import { Honeypot } from "@/components/forms/Honeypot";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { TrendingUp, Globe, Mail, Users, Phone, MapPin, Download, ArrowRight, Check, Monitor, FileText, Megaphone, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { XAxis, ResponsiveContainer, Area, AreaChart } from "recharts";
import { fetchApi } from "@/lib/fastifyClient";
import { B2BROICalculator } from "@/components/pricing/B2BROICalculator";

import heroBeach from "@/assets/hero-beach.jpg";
import { usePageContent } from "@/lib/pageContent";

const growthData = [
  { month: "ENE", value: 1800 },
  { month: "FEB", value: 2100 },
  { month: "MAR", value: 2400 },
  { month: "ABR", value: 2200 },
  { month: "MAY", value: 2600 },
  { month: "JUN", value: 2900 },
  { month: "JUL", value: 3200 },
  { month: "AGO", value: 3100 },
  { month: "SEP", value: 3400 },
  { month: "OCT", value: 3800 },
  { month: "NOV", value: 4100 },
  { month: "DIC", value: 4500 },
];

const partners = ["AIRLINE.RD", "RESORTSLUX", "CaribBank", "TOURS", "OCEANIC"];

const formatos = [
  {
    titulo: "Display Premium",
    tipo: "CPM / CPC",
    icon: Monitor,
    descripcion: "Posiciones estratégicas en Home, páginas de destino y artículos. Tamaños estándar (Leaderboard, MPU) y formatos rich media.",
    beneficios: ["CTR promedio 0.8%", "Visibilidad garantizada"]
  },
  {
    titulo: "Contenido Patrocinado",
    tipo: "Flat Fee",
    icon: FileText,
    descripcion: "Artículos editoriales escritos por nuestros expertos, integrando su marca en narrativas inspiradoras sobre RD.",
    beneficios: ["SEO permanente", "Promoción en RRSS incluida"]
  },
  {
    titulo: "Newsletter Blast",
    tipo: "Por Envío",
    icon: Megaphone,
    descripcion: "Llegue directamente a la bandeja de entrada de 50,000+ viajeros con alta intención de compra.",
    beneficios: ["Open Rate > 25%", "Segmentación disponible"]
  }
];

export default function Partners() {
  const pc = usePageContent("partners");
  const growthData = pc.data("growthData", __pcData.growthData);
  const formatos = pc.data("formatos", __pcData.formatos);
  const partners = pc.data("partners", __pcData.partners);
  const [formData, setFormData] = useState({
    fullName: "",
    company: "",
    email: "",
    interest: "display",
    budget: "5000",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.company.trim()) {
      toast.error("Por favor completa los campos obligatorios: Nombre, Empresa y Correo.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        company: formData.company.trim(),
        interest: formData.interest,
        budget: formData.budget,
        message: formData.message.trim(),
        source: "partners_b2b_page",
        created_at: new Date().toISOString()
      };

      // 1. Persistir en backend Fastify autoritativo
      await fetchApi("/leads", {
        method: "POST",
        body: JSON.stringify({
          name: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          company: formData.company.trim() || undefined,
          interest: formData.interest || undefined,
          message: `${formData.message.trim()} | Presupuesto: ${formData.budget}`,
          source: "partners_b2b_page",
          consent: true,
        }),
      });

      setIsSubmitted(true);
      toast.success("¡Solicitud enviada con éxito!", {
        description: "Nuestro equipo corporativo de alianzas se comunicará en menos de 24 horas laborables."
      });
    } catch (err: any) {
      console.error("Fallo al procesar lead de partner:", err);
      toast.error(err?.message || "No se pudo enviar la solicitud. Por favor revise su conexión e intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 pt-16">
          {/* Hero */}
          <section className="relative py-24 overflow-hidden">
            <div className="absolute inset-0">
              <img src={pc.img("img.src.1", heroBeach)} alt={pc.t("img.alt.1", "Hero")} className="w-full h-full object-cover opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
            </div>
            <div className="relative container mx-auto px-4 text-center">
              <Badge className="mb-6 bg-primary/20 text-primary">{pc.tx("Badge.1", "● ALIANZAS ESTRATÉGICAS DISPONIBLES")}</Badge>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">{pc.tx("h1.1", "Conecte su Negocio con el")}<br />
                <span className="text-gradient">{pc.tx("span.1", "Turismo Dominicano")}</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">{pc.tx("p.1", "El portal de referencia para viajeros internacionales y locales. Impulse su establecimiento con presencia destacada, reservas directas y sin comisiones.")}</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2" onClick={() => window.location.href = "/para-empresas"}>
                  <Sparkles className="w-5 h-5" />{" "}{pc.tx("Button.1", "Ver Planes para Empresas")}</Button>
                <Button size="lg" variant="outline" className="gap-2" onClick={() => {
                  toast.info("Descargando Media Kit Oficial de Descubre República Dominicana...");
                }}>
                  <Download className="w-5 h-5" />{" "}{pc.tx("Button.2", "Descargar Media Kit")}</Button>
                <Button size="lg" variant="outline" onClick={() => window.location.href = "/login?returnTo=/operadores/panel"}>{pc.tx("Button.3", "Acceso a Operadores / Partners")}</Button>
                <Button size="lg" variant="outline" onClick={() => window.location.href = "/operadores"}>{pc.tx("Button.4", "Operadores RD: reservas directas")}</Button>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="py-16 border-y border-border">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">{pc.tx("h2.1", "Alcance y Audiencia")}</h2>
                <p className="text-muted-foreground">{pc.tx("p.2", "Llegue a viajeros en cada etapa de su jornada: inspiración, planificación y reserva.")}</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-card rounded-xl p-6 border border-border text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground uppercase">{pc.tx("span.2", "Visitas Mensuales")}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl font-display font-bold text-foreground">2.5M+</span>
                    <Badge className="bg-emerald-500/10 text-emerald-400">
                      <TrendingUp className="w-3 h-3 mr-1" /> 12%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{pc.tx("p.3", "Promedio últimos 6 meses")}</p>
                </div>
                
                <div className="bg-card rounded-xl p-6 border border-border text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground uppercase">{pc.tx("span.3", "Tráfico Internacional")}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl font-display font-bold text-foreground">85%</span>
                    <Badge className="bg-emerald-500/10 text-emerald-400">
                      <TrendingUp className="w-3 h-3 mr-1" /> 5%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{pc.tx("p.4", "USA, Canadá, Europa y Latam")}</p>
                </div>
                
                <div className="bg-card rounded-xl p-6 border border-border text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground uppercase">{pc.tx("span.4", "Base de Datos Activa")}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl font-display font-bold text-foreground">50k+</span>
                    <Badge className="bg-emerald-500/10 text-emerald-400">
                      <TrendingUp className="w-3 h-3 mr-1" /> 8%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{pc.tx("p.5", "Suscriptores Newsletter B2C")}</p>
                </div>
              </div>

              {/* Growth Chart */}
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display font-bold text-foreground">{pc.tx("h3.1", "Crecimiento de Usuarios Únicos")}</h3>
                    <p className="text-sm text-muted-foreground">{pc.tx("p.6", "Comparativa interanual 2023-2024")}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-muted-foreground">{pc.tx("span.5", "Este Año")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                      <span className="text-muted-foreground">{pc.tx("span.6", "Año Pasado")}</span>
                    </div>
                  </div>
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthData}>
                      <defs>
                        <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(193, 86%, 50%)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(193, 86%, 50%)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(192, 20%, 70%)' }} />
                      <Area type="monotone" dataKey="value" stroke="hsl(193, 86%, 50%)" strokeWidth={2} fill="url(#colorGrowth)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>

          {/* Formatos */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground mb-2">{pc.tx("h2.2", "Formatos Publicitarios")}</h2>
                  <p className="text-muted-foreground">{pc.tx("p.7", "Diseñados para integrarse naturalmente en la experiencia del usuario.")}</p>
                </div>
                <Button variant="link" className="text-primary gap-2">{pc.tx("Button.5", "Ver especificaciones técnicas")}{" "}<ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {formatos.map((formato) => (
                  <div key={formato.titulo} className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-colors">
                    <div className="aspect-video bg-secondary/50 relative">
                      <Badge className="absolute top-4 right-4 bg-primary/20 text-primary">{formato.tipo}</Badge>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <formato.icon className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="font-display font-bold text-foreground">{formato.titulo}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{formato.descripcion}</p>
                      <div className="space-y-2">
                        {formato.beneficios.map((beneficio) => (
                          <div key={beneficio} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-primary" />
                            <span className="text-muted-foreground">{beneficio}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* B2B ROI Simulator */}
          <B2BROICalculator />

          {/* Partners */}
          <section className="py-12 border-y border-border bg-card/50">
            <div className="container mx-auto px-4">
              <p className="text-center text-sm text-muted-foreground uppercase tracking-wider mb-8">{pc.tx("p.8", "Empresas que confían en nosotros")}</p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
                {partners.map((partner) => (
                  <span key={partner} className="text-xl font-display font-bold text-muted-foreground/60 hover:text-foreground transition-colors">
                    {partner}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Form */}
          <section className="py-16 bg-gradient-to-b from-primary/5 to-transparent">
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-12">
                <div>
                  <Badge className="mb-4 bg-primary/20 text-primary">{pc.tx("Badge.2", "● ÚNETE A NUESTRA RED")}</Badge>
                  <h2 className="text-3xl font-display font-bold text-foreground mb-4">{pc.tx("h2.3", "Solicite una Propuesta Personalizada")}</h2>
                  <p className="text-muted-foreground mb-8">{pc.tx("p.9", "Nuestro equipo de ventas está listo para ayudarle a diseñar la campaña perfecta. Cuéntenos sus objetivos y le responderemos en menos de 24 horas.")}</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{pc.tx("p.10", "Email Directo")}</p>
                        <p className="text-muted-foreground">{pc.tx("p.11", "ventas@turismord.com")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{pc.tx("p.12", "Teléfono")}</p>
                        <p className="text-muted-foreground">+1 (809) 555-0123</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{pc.tx("p.13", "Oficinas")}</p>
                        <p className="text-muted-foreground">{pc.tx("p.14", "Av. Winston Churchill, Santo Domingo, RD")}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-8 border border-border">
                  {isSubmitted ? (
                    <div className="text-center py-8 space-y-4">
                      <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="font-display text-2xl font-bold text-foreground">{pc.tx("h3.2", "¡Solicitud Recibida!")}</h3>
                      <p className="text-muted-foreground max-w-md mx-auto text-sm">{pc.tx("p.15", "Gracias por tu interés en colaborar con Descubre RD. Un asesor de alianzas estratégicas revisará tu propuesta y te enviará las tarifas detalladas en menos de 24 horas.")}</p>
                      <Button variant="outline" onClick={() => setIsSubmitted(false)} className="rounded-xl">{pc.tx("Button.6", "Enviar otra consulta")}</Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit}><Honeypot />
                      <div className="grid sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-sm text-muted-foreground mb-2 block">{pc.tx("label.1", "Nombre Completo *")}</label>
                          <Input 
                            required
                            placeholder={pc.t("Input.placeholder.1", "Ej. Juan Pérez")} 
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground mb-2 block">{pc.tx("label.2", "Empresa *")}</label>
                          <Input 
                            required
                            placeholder={pc.t("Input.placeholder.2", "Ej. Hotel Paradiso")} 
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="text-sm text-muted-foreground mb-2 block">{pc.tx("label.3", "Correo Corporativo *")}</label>
                        <Input 
                          required
                          type="email" 
                          placeholder={pc.t("Input.placeholder.3", "nombre@empresa.com")} 
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-sm text-muted-foreground mb-2 block">{pc.tx("label.4", "Interés Principal")}</label>
                          <Select 
                            value={formData.interest} 
                            onValueChange={(val) => setFormData({ ...formData, interest: val })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={pc.t("SelectValue.placeholder.1", "Seleccionar")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="display">{pc.tx("SelectItem.1", "Publicidad Display")}</SelectItem>
                              <SelectItem value="contenido">{pc.tx("SelectItem.2", "Contenido Patrocinado")}</SelectItem>
                              <SelectItem value="newsletter">{pc.tx("SelectItem.3", "Newsletter")}</SelectItem>
                              <SelectItem value="misiones">{pc.tx("SelectItem.4", "Misión Patrocinada Gamificada")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground mb-2 block">{pc.tx("label.5", "Presupuesto Estimado")}</label>
                          <Select 
                            value={formData.budget} 
                            onValueChange={(val) => setFormData({ ...formData, budget: val })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={pc.t("SelectValue.placeholder.2", "Seleccionar")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1000">{pc.tx("SelectItem.5", "Menos de $1,000 USD")}</SelectItem>
                              <SelectItem value="5000">{pc.tx("SelectItem.6", "$1,000 - $5,000 USD")}</SelectItem>
                              <SelectItem value="10000">{pc.tx("SelectItem.7", "Más de $5,000 USD")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="mb-6">
                        <label className="text-sm text-muted-foreground mb-2 block">{pc.tx("label.6", "Mensaje / Objetivos")}</label>
                        <Textarea 
                          placeholder={pc.t("Textarea.placeholder.1", "Describa brevemente qué desea lograr...")} 
                          rows={4} 
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-bold py-3 rounded-xl"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Procesando solicitud...
                          </>
                        ) : (
                          <>
                            Enviar Solicitud <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}

// Datos del módulo editables desde el panel (ver pc.data en src/lib/pageContent.ts).
const __pcData = { growthData, formatos, partners };
