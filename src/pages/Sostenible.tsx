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
import { CarbonCalculatorSection } from "@/components/sostenible/CarbonCalculatorSection";
import { EcoVerifiedDirectory } from "@/components/sostenible/EcoVerifiedDirectory";
import { VolunteerCampaignsSection } from "@/components/sostenible/VolunteerCampaignsSection";
import { SostenibleModals } from "@/components/sostenible/SostenibleModals";
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
            <CarbonCalculatorSection
              flightOrigin={flightOrigin}
              onFlightOriginChange={setFlightOrigin}
              flightClass={flightClass}
              onFlightClassChange={setFlightClass}
              hotelNights={hotelNights}
              onHotelNightsChange={setHotelNights}
              co2Calculation={co2Calculation}
              onCalculate={handleCalculateCarbon}
              onOffsetPurchase={handleOffsetPurchase}
            />

            {/* Eco-Verified Directory */}
            <EcoVerifiedDirectory
              businesses={ecoBusinesses}
              onSelectBusiness={(bus) => {
                setSelectedEcoBusiness(bus);
                toast.info(`Criterios de auditoría oficial de ${bus.name} desplegados.`);
              }}
            />

            {/* Beach Cleanups Campaign Registry */}
            <VolunteerCampaignsSection
              campaigns={cleanupCampaigns}
              onSelectCampaign={(camp) => {
                setSelectedCampaign(camp);
                setRegistrationSuccess(false);
              }}
            />

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

        {/* Modals for Audit Certificate & Volunteer Registration */}
        <SostenibleModals
          selectedEcoBusiness={selectedEcoBusiness}
          onCloseEcoBusiness={() => setSelectedEcoBusiness(null)}
          selectedCampaign={selectedCampaign}
          onCloseCampaign={() => setSelectedCampaign(null)}
          volunteerName={volunteerName}
          onVolunteerNameChange={setVolunteerName}
          volunteerEmail={volunteerEmail}
          onVolunteerEmailChange={setVolunteerEmail}
          volunteerPhone={volunteerPhone}
          onVolunteerPhoneChange={setVolunteerPhone}
          registrationSuccess={registrationSuccess}
          onRegisterVolunteer={handleRegisterVolunteer}
        />

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