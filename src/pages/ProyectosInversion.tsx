import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Briefcase, Landmark, Coins, TrendingUp, Handshake, Users, 
  MapPin, CheckCircle2, DollarSign, Send, Filter, PlusCircle,
  Building, Sparkles, PieChart, ShieldCheck, ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";
import { PanoramaAd } from "@/components/promo";
import puertoPlataImg from "@/assets/puerto-plata.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import adventureImg from "@/assets/adventure.jpg";

interface ProjectItem {
  id: string;
  title: string;
  category: "Hotelería" | "Eco-Turismo" | "Infraestructura" | "Entretenimiento";
  location: string;
  fundingRequired: number;
  irr: string; // Tasa Interna de Retorno estimada
  stage: string;
  description: string;
  creatorName: string;
  image: string;
  highlights: string[];
}

interface InvestorItem {
  id: string;
  name: string;
  origin: string;
  investmentRange: string;
  focusAreas: string[];
  investorType: "Angel" | "Venture Capital" | "Private Equity" | "Family Office";
  description: string;
  verified: boolean;
}

const mockProjects: ProjectItem[] = [
  {
    id: "p1",
    title: "Eco-Lodge & Glamping Jarabacoa",
    category: "Eco-Turismo",
    location: "Jarabacoa, La Vega",
    fundingRequired: 450000,
    irr: "18% - 22%",
    stage: "En Desarrollo (Licencias listas)",
    description: "Proyecto de 15 domos geodésicos de lujo con senderos y restaurante orgánico al borde del río Yaque del Norte. Se busca socio capitalista para el inicio de construcción.",
    creatorName: "Desarrollos Verdes Quisqueya SRL",
    image: adventureImg,
    highlights: ["15 Domos Geodésicos", "Permisos Ambientales Listos", "Río Yaque Frontal"]
  },
  {
    id: "p2",
    title: "Hotel Boutique y Rooftop Zona Colonial",
    category: "Hotelería",
    location: "Zona Colonial, Santo Domingo",
    fundingRequired: 1800000,
    irr: "14% - 16%",
    stage: "Diseño y Permisos Aprobados",
    description: "Restauración de una casona del siglo XVI para convertirla en un hotel de 12 habitaciones temáticas de alta gama, con rooftop y piscina infinita con vistas a la Catedral.",
    creatorName: "Patrimonio Real Inversiones",
    image: santoDomingoImg,
    highlights: ["12 Habitaciones Boutique", "Rooftop con Vista Catedral", "Exención CONFOTUR"]
  },
  {
    id: "p3",
    title: "Marina y Club Náutico Bahía Luperón",
    category: "Infraestructura",
    location: "Bahía de Luperón, Puerto Plata",
    fundingRequired: 3500000,
    irr: "12% - 15%",
    stage: "Operativo (Buscando expansión)",
    description: "Ampliación de los muelles flotantes existentes para alojar hasta 40 yates adicionales de gran calado, incluyendo la construcción de un club náutico moderno.",
    creatorName: "Luperón Yacht Club SAS",
    image: puertoPlataImg,
    highlights: ["40 Muelles de Gran Calado", "Refugio Natural de Huracanes", "Servicios de Varadero"]
  }
];

const mockInvestors: InvestorItem[] = [
  {
    id: "inv1",
    name: "Antilles Capital Fund",
    origin: "Canadá / Toronto",
    investmentRange: "$500,000 - $2,500,000 USD",
    focusAreas: ["Hotelería", "Eco-Turismo"],
    investorType: "Private Equity",
    description: "Fondo de inversión canadiense enfocado en desarrollos inmobiliarios y hoteleros sostenibles en el área del Caribe.",
    verified: true
  },
  {
    id: "inv2",
    name: "Eduardo Gómez & Asociados",
    origin: "Santo Domingo, RD",
    investmentRange: "$100,000 - $400,000 USD",
    focusAreas: ["Eco-Turismo", "Entretenimiento"],
    investorType: "Angel",
    description: "Empresario local buscando apoyar proyectos turísticos boutique y experiencias gastronómicas de alto valor en etapa semilla.",
    verified: true
  },
  {
    id: "inv3",
    name: "Sunbelt Hospitality Partners",
    origin: "Miami, USA",
    investmentRange: "$2,000,000 - $10,000,000 USD",
    focusAreas: ["Hotelería", "Infraestructura"],
    investorType: "Family Office",
    description: "Family Office con cartera activa en hospitalidad caribeña. Buscamos desarrollos con estructuración fiduciaria clara.",
    verified: true
  }
];

export default function ProyectosInversion() {
  const [projectsList, setProjectsList] = useState<ProjectItem[]>(mockProjects);
  const [investorsList, setInvestorsList] = useState<InvestorItem[]>(mockInvestors);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showInvestorForm, setShowInvestorForm] = useState(false);

  // Form states
  const [newProject, setNewProject] = useState({
    title: "",
    category: "Hotelería" as ProjectItem["category"],
    location: "",
    fundingRequired: "",
    irr: "",
    stage: "",
    description: "",
    creatorName: ""
  });

  const [newInvestor, setNewInvestor] = useState({
    name: "",
    origin: "",
    minInvest: "",
    maxInvest: "",
    focusAreas: "",
    investorType: "Angel" as InvestorItem["investorType"],
    description: ""
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title || !newProject.fundingRequired) {
      toast.error("Por favor completa los campos principales.");
      return;
    }
    const created: ProjectItem = {
      id: "p_" + Date.now(),
      title: newProject.title,
      category: newProject.category,
      location: newProject.location || "República Dominicana",
      fundingRequired: Number(newProject.fundingRequired),
      irr: newProject.irr || "15% - 18%",
      stage: newProject.stage || "En Evaluación",
      description: newProject.description,
      creatorName: newProject.creatorName || "Promotor Anónimo",
      image: adventureImg,
      highlights: ["Proyecto Registrado", "En Proceso de Validación"]
    };
    setProjectsList([created, ...projectsList]);
    setShowProjectForm(false);
    toast.success("¡Proyecto enviado para revisión del comité de inversión!");
  };

  const handleCreateInvestor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvestor.name) {
      toast.error("Por favor ingresa tu nombre o el de tu firma.");
      return;
    }
    const created: InvestorItem = {
      id: "inv_" + Date.now(),
      name: newInvestor.name,
      origin: newInvestor.origin || "Internacional",
      investmentRange: `$${Number(newInvestor.minInvest || 100000).toLocaleString()} - $${Number(newInvestor.maxInvest || 1000000).toLocaleString()} USD`,
      focusAreas: newInvestor.focusAreas ? newInvestor.focusAreas.split(",").map(s => s.trim()) : ["Turismo"],
      investorType: newInvestor.investorType,
      description: newInvestor.description,
      verified: false
    };
    setInvestorsList([created, ...investorsList]);
    setShowInvestorForm(false);
    toast.success("¡Perfil de inversionista registrado con éxito!");
  };

  const filteredProjects = projectsList.filter(p => 
    selectedCategory === "all" || p.category === selectedCategory
  );

  return (
    <PageTransition>
      <SEOHead
        title="Proyectos de Inversión y Matchmaking B2B - Descubre RD"
        description="Conecta con desarrolladores turísticos, fondos de capital privado e inversionistas ángeles para proyectos hoteleros, eco-turismo e infraestructura en RD."
        keywords="inversion turistica dominicana, proyectos hoteleros rd, capital privado dominicana, invertir en turismo caribe"
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-1">
          {/* Hero Banner */}
          <section className="relative min-h-[38vh] flex items-center overflow-hidden border-b border-border/60">
            <div className="absolute inset-0">
              <img 
                src={santoDomingoImg} 
                alt="Matchmaking de Inversión Turística" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/50" />
            </div>
            <div className="container mx-auto px-4 relative z-10 py-12">
              <div className="max-w-2xl">
                <Badge className="mb-3 bg-primary text-primary-foreground font-semibold">
                  <Handshake className="h-3.5 w-3.5 mr-1.5" /> B2B Investment Matchmaking Hub
                </Badge>
                <h1 className="font-display text-3xl md:text-5xl font-black text-foreground tracking-tight mb-3">
                  Proyectos & <span className="text-primary">Capital de Inversión</span>
                </h1>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Conectamos promotores de proyectos turísticos de alto impacto con fondos de inversión, family offices y capitalistas ángeles interesados en el crecimiento hotelero de República Dominicana.
                </p>
              </div>
            </div>
          </section>

          {/* Quick Metrics Strip */}
          <section className="py-6 bg-card/50 border-b border-border">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">TIR Promedio</p>
                    <p className="text-base font-bold text-foreground">14% - 22% USD</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                    <Coins className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Capital en Pipeline</p>
                    <p className="text-base font-bold text-foreground">$18.5M+ USD</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Marco Jurídico</p>
                    <p className="text-base font-bold text-foreground">Ley CONFOTUR 158-01</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Debida Diligencia</p>
                    <p className="text-base font-bold text-foreground">Auditoría Aprobada</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Main Section: Tabs for Projects & Investors */}
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-6xl">
              <Tabs defaultValue="projects" className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                  <TabsList className="bg-muted/60 p-1 rounded-2xl">
                    <TabsTrigger value="projects" className="rounded-xl px-5 gap-2 text-xs md:text-sm font-semibold">
                      <Briefcase className="h-4 w-4" /> Proyectos Disponibles ({projectsList.length})
                    </TabsTrigger>
                    <TabsTrigger value="investors" className="rounded-xl px-5 gap-2 text-xs md:text-sm font-semibold">
                      <Users className="h-4 w-4" /> Directorio de Inversionistas ({investorsList.length})
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => setShowProjectForm(!showProjectForm)}
                      className="rounded-xl gap-1.5 text-xs font-semibold"
                    >
                      <PlusCircle className="h-4 w-4" /> Publicar Proyecto
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowInvestorForm(!showInvestorForm)}
                      className="rounded-xl gap-1.5 text-xs font-semibold"
                    >
                      <Users className="h-4 w-4" /> Registrarse como Inversionista
                    </Button>
                  </div>
                </div>

                {/* ── PROJECTS TAB ── */}
                <TabsContent value="projects" className="space-y-6">
                  {/* Category Filter Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
                      <Filter className="h-3.5 w-3.5" /> Sector:
                    </span>
                    {["all", "Hotelería", "Eco-Turismo", "Infraestructura", "Entretenimiento"].map((cat) => (
                      <Button
                        key={cat}
                        size="sm"
                        variant={selectedCategory === cat ? "default" : "outline"}
                        className="rounded-xl text-xs h-8"
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat === "all" ? "Todos los Sectores" : cat}
                      </Button>
                    ))}
                  </div>

                  {/* Submit Project Form Modal/Card */}
                  {showProjectForm && (
                    <Card className="border-primary bg-primary/5 rounded-3xl">
                      <CardHeader>
                        <CardTitle className="text-lg">Registrar Nuevo Proyecto Turístico</CardTitle>
                        <CardDescription className="text-xs">
                          Publica tu desarrollo para conectar con fondos de inversión acreditados en República Dominicana.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleCreateProject} className="space-y-4">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <Input placeholder="Título del Proyecto" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} required className="text-xs rounded-xl" />
                            <Input placeholder="Empresa o Promotor Responsable" value={newProject.creatorName} onChange={e => setNewProject({...newProject, creatorName: e.target.value})} className="text-xs rounded-xl" />
                          </div>
                          <div className="grid sm:grid-cols-3 gap-4">
                            <select 
                              className="bg-background border border-input rounded-xl p-2.5 text-xs"
                              value={newProject.category} 
                              onChange={e => setNewProject({...newProject, category: e.target.value as ProjectItem["category"]})}
                              title="Categoría"
                              aria-label="Categoría del Proyecto"
                            >
                              <option value="Hotelería">Hotelería</option>
                              <option value="Eco-Turismo">Eco-Turismo</option>
                              <option value="Infraestructura">Infraestructura</option>
                              <option value="Entretenimiento">Entretenimiento</option>
                            </select>
                            <Input placeholder="Ubicación (Ej: Las Terrenas)" value={newProject.location} onChange={e => setNewProject({...newProject, location: e.target.value})} className="text-xs rounded-xl" />
                            <Input type="number" placeholder="Capital Requerido (USD)" value={newProject.fundingRequired} onChange={e => setNewProject({...newProject, fundingRequired: e.target.value})} required className="text-xs rounded-xl" />
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <Input placeholder="TIR Estimada (Ej: 16% - 20%)" value={newProject.irr} onChange={e => setNewProject({...newProject, irr: e.target.value})} className="text-xs rounded-xl" />
                            <Input placeholder="Fase / Estado (Ej: Permisos Listos)" value={newProject.stage} onChange={e => setNewProject({...newProject, stage: e.target.value})} className="text-xs rounded-xl" />
                          </div>
                          <Textarea placeholder="Describe la propuesta de valor, mercado objetivo y modelo de retorno del proyecto..." value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} required className="text-xs rounded-xl" />
                          <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={() => setShowProjectForm(false)} className="rounded-xl text-xs">Cancelar</Button>
                            <Button type="submit" className="rounded-xl text-xs">Enviar Proyecto</Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  )}

                  {/* Projects List */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                      <Card key={project.id} className="overflow-hidden rounded-3xl border border-border hover:border-primary/50 transition-all flex flex-col justify-between group shadow-xs">
                        <div>
                          {/* Image & Badges */}
                          <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                            <img 
                              src={project.image} 
                              alt={project.title} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            
                            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-bold">
                              {project.category}
                            </Badge>

                            <div className="absolute bottom-3 left-3 right-3 text-white flex items-end justify-between">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-white/80 block">Capital Requerido</span>
                                <span className="text-xl font-black font-mono tracking-tight">
                                  ${project.fundingRequired.toLocaleString()} USD
                                </span>
                              </div>
                              <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                                TIR: {project.irr}
                              </Badge>
                            </div>
                          </div>

                          <CardHeader className="p-5 pb-2">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span>{project.location}</span>
                            </div>
                            <CardTitle className="text-base font-display font-bold group-hover:text-primary transition-colors">
                              {project.title}
                            </CardTitle>
                            <span className="text-[11px] text-muted-foreground block font-medium">Por: {project.creatorName}</span>
                          </CardHeader>

                          <CardContent className="p-5 pt-0 space-y-3 text-xs text-muted-foreground">
                            <p className="line-clamp-3 leading-relaxed">{project.description}</p>
                            
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {project.highlights.map((h, i) => (
                                <Badge key={i} variant="secondary" className="text-[10px] bg-muted/60 text-muted-foreground border-none">
                                  {h}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </div>

                        <div className="p-5 pt-0">
                          <Button 
                            size="sm" 
                            className="w-full rounded-xl gap-1 text-xs font-semibold"
                            onClick={() => toast.success(`Solicitud de contacto y NDA enviada a ${project.creatorName}`)}
                          >
                            <Handshake className="h-3.5 w-3.5" /> Solicitar Dossier de Inversión
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* ── INVESTORS TAB ── */}
                <TabsContent value="investors" className="space-y-6">
                  {/* Investor Register Form */}
                  {showInvestorForm && (
                    <Card className="border-primary bg-primary/5 rounded-3xl">
                      <CardHeader>
                        <CardTitle className="text-lg">Registrarse como Inversionista Acreditado</CardTitle>
                        <CardDescription className="text-xs">Crea tu perfil para recibir propuestas de proyectos turísticos previamente auditados.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleCreateInvestor} className="space-y-4">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <Input placeholder="Nombre de la Firma / Inversionista" value={newInvestor.name} onChange={e => setNewInvestor({...newInvestor, name: e.target.value})} required className="text-xs rounded-xl" />
                            <Input placeholder="Ubicación de Origen (Ej: Miami, USA)" value={newInvestor.origin} onChange={e => setNewInvestor({...newInvestor, origin: e.target.value})} className="text-xs rounded-xl" />
                          </div>
                          <div className="grid sm:grid-cols-3 gap-4">
                            <Input type="number" placeholder="Inversión Mínima (USD)" value={newInvestor.minInvest} onChange={e => setNewInvestor({...newInvestor, minInvest: e.target.value})} className="text-xs rounded-xl" />
                            <Input type="number" placeholder="Inversión Máxima (USD)" value={newInvestor.maxInvest} onChange={e => setNewInvestor({...newInvestor, maxInvest: e.target.value})} className="text-xs rounded-xl" />
                            <select 
                              className="bg-background border border-input rounded-xl p-2.5 text-xs"
                              value={newInvestor.investorType} 
                              onChange={e => setNewInvestor({...newInvestor, investorType: e.target.value as InvestorItem["investorType"]})}
                              title="Tipo de Inversionista"
                              aria-label="Tipo de Inversionista"
                            >
                              <option value="Angel">Inversionista Ángel</option>
                              <option value="Venture Capital">Capital de Riesgo (VC)</option>
                              <option value="Private Equity">Capital Privado (PE)</option>
                              <option value="Family Office">Family Office</option>
                            </select>
                          </div>
                          <Input placeholder="Áreas de Interés separadas por coma (Ej: Hotelería, Eco-Turismo)" value={newInvestor.focusAreas} onChange={e => setNewInvestor({...newInvestor, focusAreas: e.target.value})} className="text-xs rounded-xl" />
                          <Textarea placeholder="Describe brevemente tus criterios de inversión y qué tipo de proyectos buscas..." value={newInvestor.description} onChange={e => setNewInvestor({...newInvestor, description: e.target.value})} required className="text-xs rounded-xl" />
                          <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={() => setShowInvestorForm(false)} className="rounded-xl text-xs">Cancelar</Button>
                            <Button type="submit" className="rounded-xl text-xs">Registrar Perfil</Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  )}

                  {/* Investors List */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {investorsList.map((inv) => (
                      <Card key={inv.id} className="rounded-3xl border border-border hover:border-primary/40 transition-colors flex flex-col justify-between shadow-xs">
                        <CardHeader className="p-5 pb-3">
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <Badge variant="outline" className="text-[10px] font-semibold">
                              {inv.investorType}
                            </Badge>
                            {inv.verified && (
                              <Badge className="bg-emerald-600/10 text-emerald-600 border-emerald-600/20 text-[10px]">
                                Verificado ✓
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg font-display">{inv.name}</CardTitle>
                          <span className="text-xs text-muted-foreground block">Origen: {inv.origin}</span>
                        </CardHeader>

                        <CardContent className="p-5 pt-0 space-y-4 text-xs text-muted-foreground">
                          <div className="bg-primary/5 p-3 rounded-2xl border border-primary/10">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Ticket de Inversión</span>
                            <span className="text-sm font-bold font-mono text-primary">{inv.investmentRange}</span>
                          </div>

                          <p className="leading-relaxed">{inv.description}</p>
                          
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sectores de Interés</span>
                            <div className="flex flex-wrap gap-1.5">
                              {inv.focusAreas.map((f, idx) => (
                                <Badge key={idx} variant="secondary" className="text-[10px] bg-muted border-none">{f}</Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>

                        <div className="p-5 pt-0 border-t border-border/60 mt-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="w-full rounded-xl text-xs font-semibold gap-1.5 mt-3"
                            onClick={() => toast.success(`Solicitud de pitch enviada a ${inv.name}`)}
                          >
                            <Send className="h-3.5 w-3.5" /> Enviar Pitch Deck
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

              </Tabs>
            </div>
          </section>

          {/* Panorama Ad at the bottom */}
          <div className="container mx-auto px-4 max-w-6xl pb-16">
            <PanoramaAd />
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
