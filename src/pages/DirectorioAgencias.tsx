import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Search, MapPin, Phone, Mail, Globe, ChevronRight, ChevronLeft,
  Check, Building2, Compass, Bus, Download, ExternalLink, FileText, Image
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
const agencies = [
  {
    id: "tropical-caribbean",
    name: "Tropical Caribbean Tours",
    verified: true,
    location: "Punta Cana",
    rnt: "RNT: 20439-OP",
    description: "Especialistas en excursiones náuticas y safaris terrestres en la zona este. Proveedor líder de experiencias B2B con flota propia.",
    type: "Tour Operador",
    status: "Activo",
    logo: "TC",
    hasEmail: true,
    hasPhone: true,
    hasWeb: true
  },
  {
    id: "econature-republic",
    name: "EcoNature Republic",
    verified: true,
    location: "Samaná",
    rnt: "RNT: 11029-AG",
    description: "Pioneros en turismo sostenible y avistamiento de ballenas. Operamos bajo estrictos estándares de conservación ambiental.",
    type: "Ecoturismo",
    status: "Activo",
    logo: "EN",
    hasEmail: true,
    hasPhone: true,
    hasWeb: false
  },
  {
    id: "santo-domingo-experts",
    name: "Santo Domingo City Experts",
    verified: false,
    location: "Santo Domingo",
    rnt: "RNT: Pendiente",
    description: "Recorridos históricos por la Zona Colonial y experiencias gastronómicas urbanas. Conectando visitantes con la historia.",
    type: "Cultural",
    status: "En Revisión",
    logo: "SD",
    hasEmail: true,
    hasPhone: false,
    hasWeb: false
  }
];

const excursions = [
  {
    id: "isla-saona-vip",
    title: "Isla Saona VIP",
    price: 45,
    duration: "8 Horas",
    location: "La Romana",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop"
  },
  {
    id: "los-haitises-cayo",
    title: "Los Haitises & Cayo",
    price: 85,
    duration: "6 Horas",
    location: "Samaná",
    image: "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=400&h=300&fit=crop"
  },
  {
    id: "santo-domingo-historico",
    title: "Santo Domingo Histórico",
    price: 60,
    duration: "5 Horas",
    location: "Sto. Dgo",
    image: "https://images.unsplash.com/photo-1585535116934-9e1a14063e35?w=400&h=300&fit=crop"
  },
  {
    id: "buggy-adventure-macao",
    title: "Buggy Adventure Macao",
    price: 120,
    duration: "4 Horas",
    location: "Punta Cana",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"
  }
];

const b2bResources = [
  { id: 1, title: "Kit de Marketing 2024", type: "ZIP", size: "45 MB", icon: Image },
  { id: 2, title: "Tarifas B2B Q1 2026", type: "PDF", size: "2.3 MB", icon: FileText },
  { id: 3, title: "Galería Profesional HD", type: "ZIP", size: "120 MB", icon: Image },
  { id: 4, title: "Contrato de Colaboración", type: "DOCX", size: "156 KB", icon: FileText },
];

export default function DirectorioAgencias() {
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyVerified, setOnlyVerified] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1580541631950-7282082b53ce?w=1920&h=600&fit=crop"
            alt="Turismo RD"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/60" />
        </div>
        
        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full mb-4">
              <Check className="h-3 w-3" />
              Verificado por Descubre República Dominicana
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2">
              Conectando Profesionales
            </h1>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-6">
              Del Turismo Dominicano
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Accede al directorio oficial de operadores verificados, catálogos de excursiones exclusivas y recursos de marketing para agencias globales.
            </p>

            {/* Search Bar */}
            <div className="flex gap-2 max-w-xl mx-auto bg-card/80 backdrop-blur-md p-2 rounded-xl border border-border">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar agencia por nombre, RNT o región..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-transparent border-0 focus-visible:ring-0"
                />
              </div>
              <Button>Buscar</Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Tabs */}
      <Tabs defaultValue="directorio" className="w-full">
        <section className="border-b border-border bg-card/50">
          <div className="container mx-auto px-4">
            <TabsList className="bg-transparent h-auto p-0">
              <TabsTrigger value="directorio" className="gap-2 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-4">
                <Building2 className="h-4 w-4" />
                Directorio Verificado
              </TabsTrigger>
              <TabsTrigger value="catalogo" className="gap-2 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-4">
                <Compass className="h-4 w-4" />
                Catálogo de Excursiones
              </TabsTrigger>
              <TabsTrigger value="recursos" className="gap-2 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-4">
                <Download className="h-4 w-4" />
                Recursos B2B
              </TabsTrigger>
            </TabsList>
          </div>
        </section>

        {/* Tab Content: Directorio */}
        <TabsContent value="directorio" className="mt-0">

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-foreground">Filtros</h3>
                <Button variant="link" className="text-primary text-sm p-0">Limpiar</Button>
              </div>

              {/* Type Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-foreground mb-3">Tipo de Empresa</h4>
                <div className="space-y-3">
                  {["Tour Operadores", "Agencias de Viajes", "Transporte Turístico"].map((type, i) => (
                    <div key={type} className="flex items-center gap-2">
                      <Checkbox id={type} defaultChecked={i === 0} />
                      <label htmlFor={type} className="text-sm text-muted-foreground">{type}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Region Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-foreground mb-3">Región</h4>
                <Select defaultValue="all">
                  <SelectTrigger className="bg-surface">
                    <SelectValue placeholder="Todas las regiones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las regiones</SelectItem>
                    <SelectItem value="este">Zona Este</SelectItem>
                    <SelectItem value="norte">Zona Norte</SelectItem>
                    <SelectItem value="sur">Zona Sur</SelectItem>
                    <SelectItem value="santo-domingo">Santo Domingo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Verified Only */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-foreground mb-3">Estado</h4>
                <div className="flex items-center gap-2">
                  <Switch checked={onlyVerified} onCheckedChange={setOnlyVerified} />
                  <span className="text-sm text-muted-foreground">Solo Verificados</span>
                </div>
              </div>

              {/* Marketing Kit CTA */}
              <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                <h4 className="font-display font-bold text-foreground mb-2">Kit de Marketing 2024</h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Descarga fotos y logos oficiales para tus promociones.
                </p>
                <Button className="w-full">Acceder al Portal B2B</Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground">Agencias Verificadas</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Ordenar por:</span>
                <Select defaultValue="relevancia">
                  <SelectTrigger className="w-[140px] bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevancia">Relevancia</SelectItem>
                    <SelectItem value="nombre">Nombre</SelectItem>
                    <SelectItem value="ubicacion">Ubicación</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Agency Cards */}
            <div className="space-y-4 mb-8">
              {agencies.map((agency, index) => (
                <motion.div
                  key={agency.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors"
                >
                  <div className="flex gap-6">
                    {/* Logo */}
                    <div className="w-28 h-28 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                      <span className="font-display text-3xl font-bold text-primary">{agency.logo}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-display font-bold text-foreground">{agency.name}</h3>
                            {agency.verified && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {agency.location}
                            </span>
                            <span className="text-primary">{agency.rnt}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            agency.status === "Activo" 
                              ? "bg-green-500/20 text-green-400" 
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}>
                            {agency.status}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                            {agency.type}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">{agency.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {agency.hasEmail && (
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Mail className="h-4 w-4" />
                            </Button>
                          )}
                          {agency.hasPhone && (
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Phone className="h-4 w-4" />
                            </Button>
                          )}
                          {agency.hasWeb && (
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Globe className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <Link to={`/agencia/${agency.id}`}>
                          <Button variant="link" className="text-primary gap-1">
                            Ver Perfil Completo <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2">
              <Button variant="ghost" size="icon" disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {[1, 2, 3].map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <span className="text-muted-foreground px-2">...</span>
              <Button variant="ghost" size="icon">12</Button>
              <Button variant="ghost" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Excursions Catalog in Directorio tab */}
        <section className="mt-16 pt-16 border-t border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Catálogo de Excursiones Destacadas</h2>
              <p className="text-sm text-muted-foreground">Experiencias B2B con comisiones preferenciales.</p>
            </div>
            <Link to="/experiencias">
              <Button variant="link" className="text-primary gap-1">
                Ver todo el catálogo <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {excursions.map((exc, index) => (
              <Link key={exc.id} to={`/experiencia/${exc.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[4/3] rounded-xl overflow-hidden relative mb-3">
                    <img 
                      src={exc.image} 
                      alt={exc.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                      Desde ${exc.price} USD
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors">
                    {exc.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{exc.duration}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {exc.location}
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      </div>
        </TabsContent>

        {/* Tab Content: Catálogo de Excursiones */}
        <TabsContent value="catalogo" className="mt-0">
          <div className="container mx-auto px-4 py-12">
            <h2 className="font-display text-3xl font-bold text-foreground mb-8">Catálogo Completo de Excursiones</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {excursions.map((exc, index) => (
                <Link key={exc.id} to={`/experiencia/${exc.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group cursor-pointer bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img 
                        src={exc.image} 
                        alt={exc.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                        Desde ${exc.price} USD
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                        {exc.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{exc.duration}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {exc.location}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Tab Content: Recursos B2B */}
        <TabsContent value="recursos" className="mt-0">
          <div className="container mx-auto px-4 py-12">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">Recursos B2B</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              Descarga materiales oficiales de marketing, tarifas preferenciales y documentación para partners.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {b2bResources.map((resource, index) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <resource.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-2">{resource.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <span className="px-2 py-0.5 bg-muted rounded text-xs">{resource.type}</span>
                    <span>{resource.size}</span>
                  </div>
                  <Button variant="outline" className="w-full gap-2">
                    <Download className="h-4 w-4" /> Descargar
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Footer />
    </div>
  );
}