import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { TrendingUp, Globe, Mail, Users, Phone, MapPin, Download, ArrowRight, Check, Monitor, FileText, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, ResponsiveContainer, Area, AreaChart } from "recharts";

import heroBeach from "@/assets/hero-beach.jpg";

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
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 pt-16">
          {/* Hero */}
          <section className="relative py-24 overflow-hidden">
            <div className="absolute inset-0">
              <img src={heroBeach} alt="Hero" className="w-full h-full object-cover opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
            </div>
            <div className="relative container mx-auto px-4 text-center">
              <Badge className="mb-6 bg-primary/20 text-primary">
                ● OPORTUNIDADES Q3 2024 DISPONIBLES
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Conecte su Marca con el<br />
                <span className="text-gradient">Turismo de RD</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                La plataforma líder para alcanzar a millones de viajeros internacionales y locales. 
                Impulse su negocio con nuestras soluciones publicitarias estratégicas basadas en datos.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                  <Download className="w-5 h-5" /> Descargar Media Kit
                </Button>
                <Button size="lg" variant="outline" onClick={() => window.location.href = "/partner/login"}>
                  Acceso a Partners
                </Button>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="py-16 border-y border-border">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">Alcance y Audiencia</h2>
                <p className="text-muted-foreground">Llegue a viajeros en cada etapa de su jornada: inspiración, planificación y reserva.</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-card rounded-xl p-6 border border-border text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground uppercase">Visitas Mensuales</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl font-display font-bold text-foreground">2.5M+</span>
                    <Badge className="bg-emerald-500/10 text-emerald-400">
                      <TrendingUp className="w-3 h-3 mr-1" /> 12%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Promedio últimos 6 meses</p>
                </div>
                
                <div className="bg-card rounded-xl p-6 border border-border text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground uppercase">Tráfico Internacional</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl font-display font-bold text-foreground">85%</span>
                    <Badge className="bg-emerald-500/10 text-emerald-400">
                      <TrendingUp className="w-3 h-3 mr-1" /> 5%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">USA, Canadá, Europa y Latam</p>
                </div>
                
                <div className="bg-card rounded-xl p-6 border border-border text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground uppercase">Base de Datos Activa</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl font-display font-bold text-foreground">50k+</span>
                    <Badge className="bg-emerald-500/10 text-emerald-400">
                      <TrendingUp className="w-3 h-3 mr-1" /> 8%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Suscriptores Newsletter B2C</p>
                </div>
              </div>

              {/* Growth Chart */}
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display font-bold text-foreground">Crecimiento de Usuarios Únicos</h3>
                    <p className="text-sm text-muted-foreground">Comparativa interanual 2023-2024</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-muted-foreground">Este Año</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                      <span className="text-muted-foreground">Año Pasado</span>
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
                  <h2 className="text-2xl font-display font-bold text-foreground mb-2">Formatos Publicitarios</h2>
                  <p className="text-muted-foreground">Diseñados para integrarse naturalmente en la experiencia del usuario.</p>
                </div>
                <Button variant="link" className="text-primary gap-2">
                  Ver especificaciones técnicas <ArrowRight className="w-4 h-4" />
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

          {/* Partners */}
          <section className="py-12 border-y border-border bg-card/50">
            <div className="container mx-auto px-4">
              <p className="text-center text-sm text-muted-foreground uppercase tracking-wider mb-8">
                Empresas que confían en nosotros
              </p>
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
                  <Badge className="mb-4 bg-primary/20 text-primary">
                    ● ÚNETE A NUESTRA RED
                  </Badge>
                  <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                    Solicite una Propuesta Personalizada
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    Nuestro equipo de ventas está listo para ayudarle a diseñar la campaña perfecta. 
                    Cuéntenos sus objetivos y le responderemos en menos de 24 horas.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Email Directo</p>
                        <p className="text-muted-foreground">ventas@turismord.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Teléfono</p>
                        <p className="text-muted-foreground">+1 (809) 555-0123</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Oficinas</p>
                        <p className="text-muted-foreground">Av. Winston Churchill, Santo Domingo, RD</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-8 border border-border">
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Nombre Completo</label>
                      <Input placeholder="Ej. Juan Pérez" />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Empresa</label>
                      <Input placeholder="Ej. Hotel Paradiso" />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="text-sm text-muted-foreground mb-2 block">Correo Corporativo</label>
                    <Input type="email" placeholder="nombre@empresa.com" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Interés Principal</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="display">Publicidad Display</SelectItem>
                          <SelectItem value="contenido">Contenido Patrocinado</SelectItem>
                          <SelectItem value="newsletter">Newsletter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Presupuesto Estimado</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1000">Menos de $1,000 USD</SelectItem>
                          <SelectItem value="5000">$1,000 - $5,000 USD</SelectItem>
                          <SelectItem value="10000">Más de $5,000 USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="text-sm text-muted-foreground mb-2 block">Mensaje / Objetivos</label>
                    <Textarea placeholder="Describa brevemente qué desea lograr..." rows={4} />
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                    Enviar Solicitud <ArrowRight className="w-4 h-4" />
                  </Button>
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
