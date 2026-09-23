import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Leaf, TreePine, Users, Map, Download, 
  ChevronRight, Check, ArrowRight, Plane, Building, 
  HelpCircle, CheckCircle, Info, Calendar, Sparkles, Trophy
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { CheckoutModal } from "@/components/CheckoutModal";
import adventureImg from "@/assets/adventure.jpg";
import samanaImg from "@/assets/samana.jpg";
import divingImg from "@/assets/diving.jpg";

const pillars = [
  {
    id: 1,
    icon: Users,
    title: "Turismo Comunitario",
    description: "Apoya la economía local sumergiéndote en la cultura auténtica de nuestros pueblos rurales y costeros.",
    link: "Saber más",
    href: "/destinos",
  },
  {
    id: 2,
    icon: TreePine,
    title: "Áreas Protegidas",
    description: "Explora nuestros 29 parques nacionales y reservas científicas conservadas bajo estricta vigilancia.",
    link: "Ver mapa",
    href: "/destinos",
  },
  {
    id: 3,
    icon: Leaf,
    title: "Viajero Responsable",
    description: "Guía práctica de comportamiento ético para minimizar tu huella ecológica durante tu visita.",
    link: "Descargar guía",
    href: "/guia-viajero-responsable",
  },
];

const conservationProjects = [
  {
    id: 1,
    category: "Vida Marina",
    title: "Restauración de Corales",
    location: "Bayahíbe",
    description: "Proyecto de jardinería de coral para restaurar los arrecifes dañados por el cambio climático.",
    image: divingImg,
  },
  {
    id: 2,
    category: "Fauna",
    title: "Protección de Tortugas",
    location: "Samaná",
    description: "Monitoreo 24/7 y protección de nidos de tortugas marinas en temporada de desove.",
    image: samanaImg,
  },
  {
    id: 3,
    category: "Flora",
    title: "Reforestación Costera",
    location: "Montecristi",
    description: "Siembra masiva de manglares para proteger la costa de la erosión y crear hábitats.",
    image: adventureImg,
  },
];

// Eco-Verified Directory Data
const ecoBusinesses = [
  {
    id: "eco-1",
    name: "Rancho Baiguate",
    location: "Jarabacoa",
    description: "Pionero del ecoturismo en la cordillera central, enfocado en reforestación y conservación de cuencas.",
    category: "Alojamiento",
    rating: 4.8,
    criteria: [
      { name: "100% Energía Solar", checked: true },
      { name: "Libre de plásticos de un solo uso", checked: true },
      { name: "Huerto Orgánico Propio", checked: true },
      { name: "95% Empleo local verificado", checked: true },
      { name: "Tratamiento de aguas grises", checked: false }
    ]
  },
  {
    id: "eco-2",
    name: "Eco-Lodge Tubagua",
    location: "Puerto Plata",
    description: "Hospedaje ecológico rústico en la cordillera septentrional, integrando arquitectura sostenible.",
    category: "Alojamiento",
    rating: 4.9,
    criteria: [
      { name: "Reciclaje de agua de lluvia", checked: true },
      { name: "Construcción con materiales locales", checked: true },
      { name: "Libre de plásticos de un solo uso", checked: true },
      { name: "100% Empleo local verificado", checked: true },
      { name: "Compostaje de residuos orgánicos", checked: true }
    ]
  },
  {
    id: "eco-3",
    name: "Clave Verde",
    location: "Las Terrenas, Samaná",
    description: "Hotel boutique ecológico certificado, rodeado de cocoteros y comprometido con la biodiversidad.",
    category: "Alojamiento",
    rating: 4.7,
    criteria: [
      { name: "100% Energía Solar", checked: true },
      { name: "Piscina natural sin cloro", checked: true },
      { name: "Libre de plásticos de un solo uso", checked: true },
      { name: "90% Empleo local verificado", checked: true },
      { name: "Monitoreo de huella de carbono", checked: false }
    ]
  }
];

// Beach Cleanup Campaigns Data
const cleanupCampaigns = [
  {
    id: "camp-1",
    title: "Limpieza en Playa Montesinos",
    location: "Santo Domingo",
    date: "Sábado 20 de Junio, 2026",
    time: "8:00 AM - 12:00 PM",
    badge: "Guardián del Caribe",
    xp: 150,
    volunteers: 42,
    description: "Ayúdanos a retirar residuos plásticos en el litoral sur de Santo Domingo y proteger el estuario del Ozama."
  },
  {
    id: "camp-2",
    title: "Restauración de Dunas en Baní",
    location: "Las Calderas, Peravia",
    date: "Domingo 28 de Junio, 2026",
    time: "7:00 AM - 1:00 PM",
    badge: "Defensor de Dunas",
    xp: 200,
    volunteers: 28,
    description: "Siembre de plantas costeras nativas para detener la erosión eólica en las dunas monumentales de Baní."
  },
  {
    id: "camp-3",
    title: "Recogida de Microplásticos",
    location: "Playa Cabarete, Puerto Plata",
    date: "Sábado 4 de Julio, 2026",
    time: "9:00 AM - 2:00 PM",
    badge: "Eco-Surfista",
    xp: 150,
    volunteers: 55,
    description: "Campaña de microplásticos y colillas en la playa de deportes acuáticos más importante del norte."
  }
];

export default function Sostenible() {
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});

  // Carbon Calculator States
  const [flightOrigin, setFlightOrigin] = useState("Madrid");
  const [flightClass, setFlightClass] = useState("economic");
  const [hotelNights, setHotelNights] = useState<number>(5);
  const [co2Calculation, setCo2Calculation] = useState<{ tons: number; offsetCost: number } | null>(null);

  // Eco Business Detail State
  const [selectedEcoBusiness, setSelectedEcoBusiness] = useState<any>(null);

  // Volunteer Campaign Registration State
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [volunteerName, setVolunteerName] = useState("");
  const [volunteerEmail, setVolunteerEmail] = useState("");
  const [volunteerPhone, setVolunteerPhone] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Offset Checkout State
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [offsetItem, setOffsetItem] = useState<any>(null);

  const handleImageLoad = (id: string) => {
    setImagesLoaded(prev => ({ ...prev, [id]: true }));
  };

  // Carbon calculation formula
  const handleCalculateCarbon = (e: React.FormEvent) => {
    e.preventDefault();
    let flightFactor = 0.5; // default NY
    if (flightOrigin === "Madrid" || flightOrigin === "Paris") flightFactor = 1.35;
    if (flightOrigin === "Miami") flightFactor = 0.26;
    if (flightOrigin === "Bogota") flightFactor = 0.35;

    let classMultiplier = 1.0;
    if (flightClass === "business") classMultiplier = 2.0;
    if (flightClass === "first") classMultiplier = 3.0;

    const flightTons = flightFactor * classMultiplier;
    const hotelTons = hotelNights * 0.022; // 22kg CO2 per night
    const totalTons = Number((flightTons + hotelTons).toFixed(2));
    const cost = Number((totalTons * 15.00).toFixed(2)); // $15 USD per ton

    setCo2Calculation({
      tons: totalTons,
      offsetCost: cost
    });
    toast.success("¡Huella de CO2 calculada con éxito!");
  };

  const handleOffsetPurchase = () => {
    if (!co2Calculation) return;

    setOffsetItem({
      id: "offset-manglares-montecristi",
      name: `Compensación de CO2 - Reforestación Montecristi (${co2Calculation.tons} Tons)`,
      type: "producto",
      price: co2Calculation.offsetCost,
      image: adventureImg
    });
    setCheckoutOpen(true);
  };

  const handleRegisterVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volunteerName.trim() || !volunteerEmail.trim()) {
      toast.error("Por favor completa los campos requeridos.");
      return;
    }
    setRegistrationSuccess(true);
    toast.success("¡Registro de voluntariado completado!");
  };

  return (
    <PageTransition>
      <SEOHead
        title="Turismo Sostenible en RD | Descubre RD"
        description="Calcula tu huella de carbono de viaje, apoya la reforestación de manglares, conoce hoteles con sello Eco-Verified y participa como voluntario en limpiezas de playa."
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={adventureImg}
              alt="Naturaleza RD"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/60" />
          </div>

          <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center py-24">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mb-4 py-1 px-3 text-xs gap-1.5 uppercase font-bold tracking-wider">
              <Leaf className="h-4 w-4" /> RD Sostenible
            </Badge>
            
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 text-foreground">
              Protegiendo Nuestro <span className="text-emerald-400">Paraíso Costero</span>
            </h1>
            
            <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              Descubre y participa activamente en el ecoturismo de República Dominicana. Calcula tu huella, hospédate en hoteles Eco-Verified y súmate a la limpieza de nuestras playas.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold" onClick={() => {
                const el = document.getElementById("calculadora");
                el?.scrollIntoView({ behavior: "smooth" });
              }}>
                Calcular Huella CO2
              </Button>
              <Button size="lg" variant="outline" className="gap-2 border-emerald-500/20 hover:bg-emerald-500/5" onClick={() => {
                const el = document.getElementById("voluntariado");
                el?.scrollIntoView({ behavior: "smooth" });
              }}>
                Unirse a Limpieza de Playas
              </Button>
            </div>
          </div>
        </section>

        <main className="flex-grow py-16 space-y-24">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
            
            {/* Pillars Section */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">Pilares de Conservación Dominicana</h2>
                <p className="text-xs text-muted-foreground mt-1">Estrategias y compromisos institucionales y locales para proteger nuestra riqueza natural.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {pillars.map((pillar) => (
                  <Card key={pillar.id} className="border bg-card/40 hover:border-emerald-500/30 transition-all flex flex-col justify-between">
                    <CardContent className="p-6 space-y-3">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                        <pillar.icon className="h-5 w-5 text-emerald-500" />
                      </div>
                      <h3 className="font-bold text-base text-foreground">{pillar.title}</h3>
                      <p className="text-xs text-muted-foreground leading-normal">{pillar.description}</p>
                      <div className="pt-4 mt-auto">
                        <Button asChild variant="outline" size="sm" className="w-full text-xs font-bold border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/5">
                          <Link to={pillar.href}>{pillar.link}</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Carbon Calculator Widget */}
            <div id="calculadora" className="pt-8 border-t border-border">
              <div className="grid lg:grid-cols-12 gap-8 items-center">
                
                {/* Form Side */}
                <div className="lg:col-span-5 space-y-6">
                  <div>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">CALCULADORA DE HUELLA</Badge>
                    <h2 className="text-2xl font-bold text-foreground mt-2">Mide Tu Impacto Ambiental</h2>
                    <p className="text-xs text-muted-foreground mt-1 leading-normal">
                      Calcula las toneladas de carbono generadas por tu vuelo y estadía, y compensa financiando de forma directa la siembra de manglares en la costa de Montecristi.
                    </p>
                  </div>

                  <form onSubmit={handleCalculateCarbon} className="space-y-4 bg-card/50 p-6 border rounded-xl">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Origen del Vuelo</label>
                      <select
                        value={flightOrigin}
                        onChange={(e) => setFlightOrigin(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        title="Origen del Vuelo"
                      >
                        <option value="New York">Estados Unidos (New York) - ~2,500 km</option>
                        <option value="Miami">Estados Unidos (Miami) - ~1,300 km</option>
                        <option value="Madrid">España (Madrid) - ~6,500 km</option>
                        <option value="Paris">Francia (París) - ~7,000 km</option>
                        <option value="Bogota">Colombia (Bogotá) - ~1,600 km</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Clase del Asiento</label>
                      <select
                        value={flightClass}
                        onChange={(e) => setFlightClass(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        title="Clase del Asiento"
                      >
                        <option value="economic">Clase Económica</option>
                        <option value="business">Clase Ejecutiva (2x Impacto)</option>
                        <option value="first">Primera Clase (3x Impacto)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Noches de Alojamiento</label>
                      <Input
                        type="number"
                        min="1"
                        value={hotelNights}
                        onChange={(e) => setHotelNights(parseInt(e.target.value) || 1)}
                        required
                        className="bg-background text-xs"
                      />
                    </div>

                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-5">
                      Calcular Huella Ecológica
                    </Button>
                  </form>
                </div>

                {/* Report / Offset Side */}
                <div className="lg:col-span-7 flex justify-center">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8 max-w-lg w-full space-y-6 text-center">
                    {co2Calculation ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                      >
                        <div className="space-y-2">
                          <Leaf className="h-10 w-10 text-emerald-500 mx-auto" />
                          <h3 className="font-display text-xl font-extrabold text-foreground">Tu Reporte de Huella CO2</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-card p-4 rounded-xl border border-border">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Emisiones CO2</span>
                            <p className="text-2xl font-extrabold font-mono text-foreground mt-1">
                              {co2Calculation.tons} <span className="text-xs font-normal">Tons</span>
                            </p>
                          </div>
                          <div className="bg-card p-4 rounded-xl border border-border">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Costo Sugerido</span>
                            <p className="text-2xl font-extrabold font-mono text-emerald-500 mt-1">
                              ${co2Calculation.offsetCost} <span className="text-xs font-normal">USD</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground leading-relaxed text-left bg-card/60 p-4 border rounded-lg">
                          <p className="font-bold text-foreground">🌱 ¿Cómo ayuda tu compensación?</p>
                          <p className="mt-1">
                            Tu aporte financia directamente la cooperativa costera en Montecristi encargada de plantar manglares rojos, capaces de capturar hasta 10 veces más carbono que un bosque tropical terrestre.
                          </p>
                        </div>

                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2" onClick={handleOffsetPurchase}>
                          Compensar Huella en Montecristi <ArrowRight className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ) : (
                      <div className="py-12 space-y-4 text-muted-foreground">
                        <Plane className="h-12 w-12 text-muted-foreground/35 mx-auto animate-bounce" />
                        <div>
                          <p className="font-bold text-sm text-foreground">Aún no has calculado tu huella</p>
                          <p className="text-xs mt-1">Ingresa los detalles de tu vuelo a la izquierda para ver el reporte ecológico detallado.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Eco-Verified Directory */}
            <div className="pt-8 border-t border-border space-y-6">
              <div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">AUDITORÍA VERDE</Badge>
                <h2 className="text-2xl font-bold text-foreground mt-2">Directorio de Negocios Eco-Verified</h2>
                <p className="text-xs text-muted-foreground mt-1">Establecimientos auditados formalmente bajo criterios rigurosos de sustentabilidad.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {ecoBusinesses.map(bus => (
                  <Card key={bus.id} className="border bg-card/40 hover:border-emerald-500/30 transition-all flex flex-col justify-between">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge className="bg-emerald-600/15 text-emerald-500 border-emerald-500/25 font-extrabold text-[10px]">
                            {bus.category}
                          </Badge>
                          <h3 className="font-display font-bold text-base text-foreground mt-2">{bus.name}</h3>
                        </div>
                        <div className="flex items-center gap-1 font-bold text-xs text-amber-500 font-mono">
                          ★ {bus.rating}
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground leading-normal">{bus.description}</p>
                      
                      <div className="border-t border-border/60 pt-3">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2">Criterios Auditados:</p>
                        <div className="space-y-1">
                          {bus.criteria.map((crit, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-xs">
                              {crit.checked ? (
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              ) : (
                                <Info className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                              )}
                              <span className={crit.checked ? "text-foreground" : "text-muted-foreground line-through"}>
                                {crit.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>

                    <div className="p-5 pt-0">
                      <Button variant="outline" size="sm" className="w-full text-xs font-bold border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/5" onClick={() => {
                        setSelectedEcoBusiness(bus);
                        toast.info(`Criterios de auditoría oficial de ${bus.name} desplegados.`);
                      }}>
                        Ver Certificado Oficial
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Beach Cleanups Campaign Registry */}
            <div id="voluntariado" className="pt-8 border-t border-border space-y-6">
              <div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">VOLUNTARIADO ACTIVO</Badge>
                <h2 className="text-2xl font-bold text-foreground mt-2">Campaña de Limpieza de Playas y Conservación</h2>
                <p className="text-xs text-muted-foreground mt-1">Súmate a otros viajeros y locales en las jornadas presenciales. Gana XP e insignias de voluntario ecológico.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {cleanupCampaigns.map(camp => (
                  <Card key={camp.id} className="border bg-card/45 flex flex-col justify-between group hover:border-emerald-500/30 transition-all">
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-emerald-500 font-bold flex items-center gap-1.5 font-mono">
                            <Calendar className="h-3.5 w-3.5" /> {camp.date}
                          </span>
                          <Badge className="bg-emerald-600/10 text-emerald-500 border-emerald-500/20 text-[9px] font-bold uppercase font-mono">
                            {camp.xp} XP
                          </Badge>
                        </div>
                        <h3 className="font-display text-base font-extrabold text-foreground mt-2">{camp.title}</h3>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{camp.location} • {camp.time}</p>
                      </div>

                      <p className="text-xs text-muted-foreground leading-normal">{camp.description}</p>
                      
                      <div className="bg-muted/40 p-3 rounded-lg border flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Insignia otorgada:</span>
                        <Badge variant="outline" className="text-[10px] font-bold text-primary flex gap-1 items-center">
                          <Trophy className="h-3 w-3" /> {camp.badge}
                        </Badge>
                      </div>
                    </CardContent>

                    <div className="p-6 pt-0">
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-2" onClick={() => {
                        setSelectedCampaign(camp);
                        setRegistrationSuccess(false);
                      }}>
                        Registrarse como Voluntario
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Conservation Projects Section */}
            <div className="pt-8 border-t border-border space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Proyectos Ecológicos Activos</h2>
                  <p className="text-xs text-muted-foreground mt-1">Iniciativas para restaurar la biodiversidad costera y terrestre de la isla.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {conservationProjects.map((project) => (
                  <Card key={project.id} className="overflow-hidden border bg-card/40 flex flex-col justify-between group">
                    <div className="aspect-[16/10] overflow-hidden relative">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                      />
                      <Badge className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold font-mono">
                        {project.category}
                      </Badge>
                    </div>
                    
                    <CardContent className="p-5 space-y-2">
                      <div className="flex justify-between items-baseline text-xs text-muted-foreground">
                        <span>{project.location}</span>
                      </div>
                      <h3 className="font-bold text-base text-foreground">{project.title}</h3>
                      <p className="text-xs text-muted-foreground leading-normal">{project.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

          </div>
        </main>

        <Footer />

        {/* Audit Certificate Modal */}
        <Dialog open={!!selectedEcoBusiness} onOpenChange={() => setSelectedEcoBusiness(null)}>
          <DialogContent className="sm:max-w-[420px] text-center space-y-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-emerald-500 flex items-center justify-center gap-1.5">
                <CheckCircle className="h-6 w-6" /> Certificado Eco-Verified
              </DialogTitle>
              <DialogDescription className="text-xs">Registro Oficial de Auditoría de Sustentabilidad Ambiental</DialogDescription>
            </DialogHeader>
            
            {selectedEcoBusiness && (
              <div className="bg-muted/30 border p-6 rounded-2xl text-left space-y-4 font-sans relative overflow-hidden">
                <div className="absolute right-2 top-2 opacity-5">
                  <Leaf className="h-32 w-32 text-emerald-500" />
                </div>
                
                <div className="pb-3 border-b border-border space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Establecimiento</span>
                  <h4 className="text-lg font-extrabold text-foreground">{selectedEcoBusiness.name}</h4>
                  <p className="text-xs text-muted-foreground">{selectedEcoBusiness.location}, RD</p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block">Resultados de Auditoría:</span>
                  {selectedEcoBusiness.criteria.map((c: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="text-foreground">{c.name}</span>
                      <span className={c.checked ? "text-emerald-500 font-bold" : "text-muted-foreground font-mono"}>
                        {c.checked ? "CUMPLIDO" : "NO APLICA"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/25 p-3 rounded-lg text-[10px] text-center text-emerald-600 font-bold uppercase tracking-wider">
                  Sello Verde Nº: EV-{selectedEcoBusiness.id.toUpperCase()}-2026
                </div>
              </div>
            )}
            
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold" onClick={() => setSelectedEcoBusiness(null)}>
              Cerrar Certificado
            </Button>
          </DialogContent>
        </Dialog>

        {/* Volunteer Registration Modal */}
        <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
          <DialogContent className="sm:max-w-[420px] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-foreground">Registro de Voluntariado</DialogTitle>
              <DialogDescription className="text-xs">Únete a {selectedCampaign?.title}.</DialogDescription>
            </DialogHeader>
            
            {registrationSuccess ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">¡Registro Exitoso!</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                    Te has inscrito como voluntario. Recibiste una insignia virtual <strong>{selectedCampaign?.badge}</strong> y has acumulado <strong>+{selectedCampaign?.xp} XP</strong> en tu pasaporte digital.
                  </p>
                </div>
                <Button className="w-full" onClick={() => setSelectedCampaign(null)}>
                  Listo
                </Button>
              </div>
            ) : (
              <form onSubmit={handleRegisterVolunteer} className="space-y-4 pt-2">
                <div className="bg-muted/40 p-4 rounded-xl text-xs space-y-1">
                  <p className="font-bold">{selectedCampaign?.title}</p>
                  <p className="text-muted-foreground">{selectedCampaign?.date} • {selectedCampaign?.time}</p>
                  <p className="text-muted-foreground">{selectedCampaign?.location}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Nombre Completo</label>
                  <Input
                    type="text"
                    placeholder="Juan Pérez"
                    value={volunteerName}
                    onChange={(e) => setVolunteerName(e.target.value)}
                    required
                    className="text-xs bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Correo Electrónico</label>
                  <Input
                    type="email"
                    placeholder="juan@ejemplo.com"
                    value={volunteerEmail}
                    onChange={(e) => setVolunteerEmail(e.target.value)}
                    required
                    className="text-xs bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Teléfono móvil</label>
                  <Input
                    type="tel"
                    placeholder="+1 (809) 555-0123"
                    value={volunteerPhone}
                    onChange={(e) => setVolunteerPhone(e.target.value)}
                    className="text-xs bg-background"
                    title="Teléfono del voluntario"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setSelectedCampaign(null)}>
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                    Confirmar Registro
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Offset Checkout Modal */}
        <CheckoutModal 
          isOpen={checkoutOpen} 
          onClose={() => setCheckoutOpen(false)} 
          item={offsetItem} 
        />
      </div>
    </PageTransition>
  );
}