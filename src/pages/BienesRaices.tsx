import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Home, MapPin, DollarSign, BedDouble, Bath, Maximize2, 
  Search, SlidersHorizontal, Phone, CheckCircle, Info, Landmark,
  ShieldCheck, Calculator, Sparkles, Building2, TrendingUp, Compass
} from "lucide-react";
import { toast } from "sonner";
import { PanoramaAd } from "@/components/promo";
import { 
  isValidEmail, 
  sanitizeInput, 
  detectSQLiPatterns, 
  ClientRateLimiter 
} from "@/lib/security";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import samanaImg from "@/assets/samana.jpg";
import laRomanaImg from "@/assets/la-romana.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import adventureImg from "@/assets/adventure.jpg";

interface Property {
  id: string;
  title: string;
  type: "villa" | "apartamento" | "penthouse" | "solar";
  location: string;
  region: string;
  price: number;
  beds?: number;
  baths?: number;
  size: number; // m²
  hasConfotur: boolean;
  image: string;
  features: string[];
  roiEstimate: string;
}

const mockProperties: Property[] = [
  {
    id: "1",
    title: "Luxury Beachfront Villa",
    type: "villa",
    location: "Cap Cana, La Romana",
    region: "Este",
    price: 1250000,
    beds: 5,
    baths: 6,
    size: 550,
    hasConfotur: true,
    image: laRomanaImg,
    features: ["Piscina Infinity", "Acceso directo a playa", "Seguridad 24/7", "Marina privada"],
    roiEstimate: "10% - 13% anual"
  },
  {
    id: "2",
    title: "Ocean View Apartment Las Terrenas",
    type: "apartamento",
    location: "Las Terrenas, Samaná",
    region: "Noreste",
    price: 285000,
    beds: 2,
    baths: 2.5,
    size: 135,
    hasConfotur: true,
    image: samanaImg,
    features: ["Terraza panorámica", "Línea blanca de lujo", "Jacuzzi privado", "Renta corta Airbnb"],
    roiEstimate: "11% - 14% anual"
  },
  {
    id: "3",
    title: "City Center Luxury Penthouse",
    type: "penthouse",
    location: "Piantini, Santo Domingo",
    region: "Distrito Nacional",
    price: 495000,
    beds: 3,
    baths: 3.5,
    size: 290,
    hasConfotur: false,
    image: santoDomingoImg,
    features: ["Vista 360 al skyline", "Ascensor privado directo", "3 parqueos techados", "Rooftop lounge"],
    roiEstimate: "8% - 10% anual"
  },
  {
    id: "4",
    title: "Eco Mountain Panoramic Lot",
    type: "solar",
    location: "Jarabacoa, Cordillera Central",
    region: "Norte",
    price: 95000,
    size: 1800,
    hasConfotur: false,
    image: adventureImg,
    features: ["Vista privilegiada al valle", "Acometidas de agua y luz", "Clima templado 18°C", "Ideal para Glamping"],
    roiEstimate: "Plusvalía 15% anual"
  },
  {
    id: "5",
    title: "Modern Golf & Lakefront Condo",
    type: "apartamento",
    location: "Cocotal Golf Club, Punta Cana",
    region: "Este",
    price: 320000,
    beds: 2,
    baths: 2,
    size: 120,
    hasConfotur: true,
    image: puntaCanaImg,
    features: ["Vista al hoyo 18", "Acceso Club de Playa privado", "Descuento en hotel Meliá", "Comunidad cerrada"],
    roiEstimate: "9% - 12% anual"
  }
];

export default function BienesRaices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [maxPrice, setMaxPrice] = useState(1500000);
  const [confoturOnly, setConfoturOnly] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [selectedPropertyTitle, setSelectedPropertyTitle] = useState("");

  // CONFOTUR Interactive Calculator state
  const [calcAmount, setCalcAmount] = useState<number>(300000);

  const transferTaxSaved = calcAmount * 0.03; // 3%
  const annualIpiSaved = calcAmount * 0.01; // 1%
  const total15YearsSaved = transferTaxSaved + (annualIpiSaved * 15);

  const filteredProperties = mockProperties.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || p.type === selectedType;
    const matchesLocation = selectedLocation === "all" || p.location.includes(selectedLocation);
    const matchesPrice = p.price <= maxPrice;
    const matchesConfotur = !confoturOnly || p.hasConfotur;
    return matchesSearch && matchesType && matchesLocation && matchesPrice && matchesConfotur;
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeInput(contactName);
    const cleanEmail = sanitizeInput(contactEmail).toLowerCase();
    const cleanPhone = sanitizeInput(contactPhone);

    if (!cleanName || !cleanEmail) {
      toast.error("Por favor completa tu nombre y correo electrónico.");
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      toast.error("Introduce un correo electrónico válido (ej: nombre@dominio.com)");
      return;
    }

    if (detectSQLiPatterns(cleanName) || detectSQLiPatterns(cleanEmail) || detectSQLiPatterns(cleanPhone)) {
      toast.error("Se detectaron caracteres o patrones no permitidos por seguridad.");
      return;
    }

    // Rate limiter on lead forms (max 4 per 2 minutes)
    const rateCheck = ClientRateLimiter.check("lead_contact", cleanEmail, 4, 120000, 300000);
    if (!rateCheck.allowed) {
      toast.error(`Demasiadas solicitudes enviadas. Espera ${Math.ceil(rateCheck.retryAfterSeconds / 60)} minutos.`);
      return;
    }
    ClientRateLimiter.recordAttempt("lead_contact", cleanEmail, 4, 120000, 300000);

    toast.success(`¡Gracias ${cleanName}! Un asesor inmobiliario certificado te contactará en breve.`);
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setSelectedPropertyTitle("");
  };

  return (
    <PageTransition>
      <SEOHead
        title="Bienes Raíces y Propiedades Turísticas en RD - Descubre RD"
        description="Encuentra villas de playa, apartamentos de golf y terrenos exclusivos para inversión en Punta Cana, Samaná, Santo Domingo y Jarabacoa con beneficios de Ley CONFOTUR."
        keywords="bienes raices republica dominicana, invertir en punta cana, confotur rd, comprar villa cap cana, apartamentos las terrenas"
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-1">
          {/* Hero Banner */}
          <section className="relative min-h-[38vh] flex items-center overflow-hidden border-b border-border/60">
            <div className="absolute inset-0">
              <img 
                src={puntaCanaImg} 
                alt="Bienes Raíces Turísticos República Dominicana" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
            </div>
            <div className="container mx-auto px-4 relative z-10 py-12">
              <div className="max-w-2xl">
                <Badge className="mb-3 bg-primary text-primary-foreground font-semibold">
                  <Landmark className="h-3.5 w-3.5 mr-1.5" /> Portal Oficial de Inversión Inmobiliaria
                </Badge>
                <h1 className="font-display text-3xl md:text-5xl font-black text-foreground tracking-tight mb-3">
                  Bienes Raíces & <span className="text-primary">Propiedades Turísticas</span>
                </h1>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Invierte con seguridad en el destino número uno del Caribe. Propiedades de alta plusvalía, rentabilidad por rentas vacacionales y exenciones fiscales de hasta 15 años bajo la <strong>Ley 158-01 (CONFOTUR)</strong>.
                </p>
              </div>
            </div>
          </section>

          {/* CONFOTUR Simulator Bar */}
          <section className="py-8 bg-card/60 border-b border-border">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="bg-gradient-to-br from-primary/10 via-card to-background rounded-3xl p-6 md:p-8 border border-primary/20 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-xl">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                      <Calculator className="h-4 w-4" /> Simulador de Beneficios Fiscales
                    </div>
                    <h2 className="font-display text-2xl font-bold text-foreground">
                      ¿Cuánto te ahorras con la Ley CONFOTUR?
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Exención total del 3% del Impuesto de Transferencia Inmobiliaria inicial y del 1% anual del Impuesto al Patrimonio Inmobiliario (IPI) durante 15 años consecutivos.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-background/80 backdrop-blur-md p-4 rounded-2xl border border-border">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-muted-foreground uppercase">Valor Propiedad (USD)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          type="number"
                          step="10000"
                          value={calcAmount}
                          onChange={(e) => setCalcAmount(Math.max(0, Number(e.target.value)))}
                          className="pl-8 text-xs font-bold w-40"
                          title="Valor en USD"
                          aria-label="Valor de la propiedad en USD"
                        />
                      </div>
                    </div>

                    <div className="border-t sm:border-t-0 sm:border-l border-border pt-3 sm:pt-0 sm:pl-4 space-y-1">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase block">Ahorro Estimado (15 años)</span>
                      <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        ${Math.round(total15YearsSaved).toLocaleString()} USD
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Main Search & Properties Grid */}
          <section className="py-10">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="grid lg:grid-cols-12 gap-8">
                
                {/* Filters Panel (Col 3) */}
                <div className="lg:col-span-3 space-y-5">
                  <Card className="rounded-3xl border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4 text-primary" />
                        Filtros de Búsqueda
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Search */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Palabra Clave o Ubicación</label>
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            className="pl-8 text-xs rounded-xl"
                            placeholder="Ej: Samaná, Punta Cana..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Property Type */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Tipo de Inmueble</label>
                        <select
                          className="w-full bg-background border border-input text-xs rounded-xl p-2.5"
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                          title="Tipo de Inmueble"
                          aria-label="Tipo de Inmueble"
                        >
                          <option value="all">Todos los tipos</option>
                          <option value="villa">Villa de Lujo</option>
                          <option value="apartamento">Apartamento / Condo</option>
                          <option value="penthouse">Penthouse</option>
                          <option value="solar">Solar / Terreno</option>
                        </select>
                      </div>

                      {/* Location */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Destino Turístico</label>
                        <select
                          className="w-full bg-background border border-input text-xs rounded-xl p-2.5"
                          value={selectedLocation}
                          onChange={(e) => setSelectedLocation(e.target.value)}
                          title="Destino Turístico"
                          aria-label="Destino Turístico"
                        >
                          <option value="all">Todas las ubicaciones</option>
                          <option value="Punta Cana">Punta Cana / Bávaro / Cocotal</option>
                          <option value="Las Terrenas">Las Terrenas (Samaná)</option>
                          <option value="La Romana">Cap Cana / La Romana</option>
                          <option value="Santo Domingo">Santo Domingo (Piantini)</option>
                          <option value="Jarabacoa">Jarabacoa (Montaña)</option>
                        </select>
                      </div>

                      {/* Price Limit */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-muted-foreground">Presupuesto Máximo</span>
                          <span className="text-primary font-mono font-bold">${maxPrice.toLocaleString()} USD</span>
                        </div>
                        <input 
                          type="range" 
                          min={50000} 
                          max={1500000} 
                          step={50000} 
                          value={maxPrice} 
                          onChange={(e) => setMaxPrice(Number(e.target.value))}
                          className="w-full accent-primary cursor-pointer" 
                          title="Presupuesto Máximo"
                          aria-label="Presupuesto Máximo"
                        />
                      </div>

                      {/* Confotur toggle */}
                      <div className="pt-2 border-t border-border/70 flex items-center justify-between">
                        <label htmlFor="confotur-filter" className="text-xs font-semibold text-foreground cursor-pointer flex items-center gap-1.5">
                          <Landmark className="h-3.5 w-3.5 text-primary" /> Solo CONFOTUR
                        </label>
                        <input
                          id="confotur-filter"
                          type="checkbox"
                          checked={confoturOnly}
                          onChange={(e) => setConfoturOnly(e.target.checked)}
                          className="h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Trust Banner */}
                  <div className="bg-muted/40 p-4 rounded-2xl border border-border text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      Garantía Legal & Asesoría
                    </div>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      Todas las propiedades son verificadas a través de fiduciarias y bufetes autorizados por el Ministerio de Turismo (MITUR).
                    </p>
                  </div>
                </div>

                {/* Properties Grid (Col 9) */}
                <div className="lg:col-span-9 space-y-6">
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground">
                        Propiedades Destacadas ({filteredProperties.length})
                      </h2>
                      <p className="text-xs text-muted-foreground">Oportunidades de inversión en los principales polos turísticos</p>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono">{filteredProperties.length} Disponibles</Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {filteredProperties.length > 0 ? (
                      filteredProperties.map((p) => (
                        <Card key={p.id} className="overflow-hidden rounded-3xl border border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between group">
                          <div>
                            {/* Property Cover Image */}
                            <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                              <img 
                                src={p.image} 
                                alt={p.title} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                              
                              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                                <Badge className="bg-black/70 text-white text-[11px] backdrop-blur-md border-none capitalize">
                                  {p.type}
                                </Badge>
                                {p.hasConfotur && (
                                  <Badge className="bg-emerald-600 text-white text-[10px] font-bold border-none shadow-md">
                                    CONFOTUR ✓
                                  </Badge>
                                )}
                              </div>

                              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-white/80 block">Precio de Lista</span>
                                  <span className="text-2xl font-black font-display tracking-tight">${p.price.toLocaleString()} USD</span>
                                </div>
                                <span className="text-[11px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md font-semibold">
                                  {p.roiEstimate}
                                </span>
                              </div>
                            </div>

                            <CardHeader className="p-4 pb-2">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span className="truncate">{p.location}</span>
                              </div>
                              <CardTitle className="text-base font-display font-bold group-hover:text-primary transition-colors">
                                {p.title}
                              </CardTitle>
                            </CardHeader>

                            <CardContent className="p-4 pt-0 space-y-3">
                              {/* Specs Bar */}
                              <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium py-2 border-y border-border/60">
                                {p.beds && (
                                  <span className="flex items-center gap-1">
                                    <BedDouble className="h-3.5 w-3.5 text-primary" /> {p.beds} habs
                                  </span>
                                )}
                                {p.baths && (
                                  <span className="flex items-center gap-1">
                                    <Bath className="h-3.5 w-3.5 text-primary" /> {p.baths} baños
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Maximize2 className="h-3.5 w-3.5 text-primary" /> {p.size} m²
                                </span>
                              </div>

                              {/* Features */}
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {p.features.map((f, i) => (
                                  <Badge key={i} variant="secondary" className="text-[10px] bg-muted/60 text-muted-foreground border-none">
                                    {f}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </div>

                          <div className="p-4 pt-0">
                            <Button 
                              size="sm" 
                              className="w-full rounded-xl gap-1.5 font-semibold"
                              onClick={() => {
                                setSelectedPropertyTitle(p.title);
                                document.getElementById("form-agente")?.scrollIntoView({ behavior: "smooth" });
                              }}
                            >
                              <Phone className="h-3.5 w-3.5" /> Solicitar Ficha de Inversión
                            </Button>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-16 bg-muted/20 rounded-3xl border border-dashed border-border text-muted-foreground">
                        <Home className="h-10 w-10 mx-auto mb-3 opacity-40" />
                        <p className="font-semibold text-foreground">No encontramos propiedades con estos filtros</p>
                        <p className="text-xs mt-1">Prueba aumentando el precio máximo o desactivando el filtro CONFOTUR.</p>
                      </div>
                    )}
                  </div>

                  {/* Agent Contact Form */}
                  <Card id="form-agente" className="border border-border bg-gradient-to-br from-card via-card to-primary/5 rounded-3xl shadow-sm">
                    <CardHeader className="text-center pb-3">
                      <Badge className="mx-auto mb-2 bg-primary/10 text-primary border-primary/20">
                        Atención Personalizada
                      </Badge>
                      <CardTitle className="text-xl font-display">Contactar a un Asesor Inmobiliario Verificado</CardTitle>
                      <CardDescription className="text-xs max-w-md mx-auto">
                        {selectedPropertyTitle 
                          ? `Consultando por la propiedad: "${selectedPropertyTitle}"` 
                          : "Recibe asesoría legal, coordinación de visitas y asesoramiento para compras bajo la Ley CONFOTUR."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleContactSubmit} className="grid sm:grid-cols-4 gap-3">
                        <Input 
                          placeholder="Tu Nombre Completo" 
                          value={contactName} 
                          onChange={(e) => setContactName(e.target.value)} 
                          required 
                          className="text-xs rounded-xl"
                        />
                        <Input 
                          type="email" 
                          placeholder="Correo Electrónico" 
                          value={contactEmail} 
                          onChange={(e) => setContactEmail(e.target.value)} 
                          required 
                          className="text-xs rounded-xl"
                        />
                        <Input 
                          type="tel" 
                          placeholder="Teléfono / WhatsApp" 
                          value={contactPhone} 
                          onChange={(e) => setContactPhone(e.target.value)} 
                          className="text-xs rounded-xl"
                        />
                        <Button type="submit" className="w-full gap-1.5 rounded-xl text-xs font-semibold">
                          <Phone className="h-3.5 w-3.5" /> Enviar Solicitud
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>

              </div>
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
