import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Leaf, Plane, Trees, Sparkles, AlertCircle, 
  Car, Bus, Ship, Award, CheckCircle2, Download, 
  MapPin, ShieldCheck, Share2, Compass, ArrowRight, Globe2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface RouteDistance {
  origin: string;
  destination: string;
  distanceKm: number;
}

const mockRoutes: RouteDistance[] = [
  { origin: "Miami (MIA)", destination: "Punta Cana (PUJ)", distanceKm: 1400 },
  { origin: "Miami (MIA)", destination: "Santo Domingo (SDQ)", distanceKm: 1350 },
  { origin: "New York (JFK)", destination: "Punta Cana (PUJ)", distanceKm: 2500 },
  { origin: "New York (JFK)", destination: "Santo Domingo (SDQ)", distanceKm: 2550 },
  { origin: "Madrid (MAD)", destination: "Santo Domingo (SDQ)", distanceKm: 6600 },
  { origin: "Madrid (MAD)", destination: "Punta Cana (PUJ)", distanceKm: 6550 },
  { origin: "Bogotá (BOG)", destination: "Santo Domingo (SDQ)", distanceKm: 1650 },
  { origin: "Panamá (PTY)", destination: "Santo Domingo (SDQ)", distanceKm: 1450 },
  { origin: "Toronto (YYZ)", destination: "Punta Cana (PUJ)", distanceKm: 3000 },
  { origin: "San Juan (SJU)", destination: "Santo Domingo (SDQ)", distanceKm: 390 }
];

export default function CalculadoraCarbono() {
  // Flight params
  const [origin, setOrigin] = useState("New York (JFK)");
  const [destination, setDestination] = useState("Santo Domingo (SDQ)");
  const [tripType, setTripType] = useState<"one-way" | "round-trip">("round-trip");
  const [passengers, setPassengers] = useState<number>(1);

  // Local Ground & Maritime transport in RD
  const [rentalCarKm, setRentalCarKm] = useState<number>(250);
  const [carType, setCarType] = useState<"gasoline" | "diesel" | "hybrid" | "electric">("gasoline");
  const [busKm, setBusKm] = useState<number>(100);
  const [ferryTrips, setFerryTrips] = useState<number>(1); // e.g. Samaná - Cayo Levantado / Saona

  // Certificate generator state
  const [certifiedName, setCertifiedName] = useState<string>("");
  const [isCertificateGenerated, setIsCertificateGenerated] = useState<boolean>(false);
  const [selectedProjectForCert, setSelectedProjectForCert] = useState<string>("Reforestación en Valle Nuevo");

  // Factors:
  // Vuelo: 0.115 kg CO2 / pas / km
  const flightDistance = (mockRoutes.find(r => r.origin === origin && r.destination === destination)?.distanceKm || 1500) * (tripType === "round-trip" ? 2 : 1);
  const flightCO2Kg = flightDistance * 0.115 * passengers;

  // Terrestre: 
  // Gasolina: 0.192 kg/km, Diesel: 0.171 kg/km, Hybrid: 0.105 kg/km, Electric: 0.045 kg/km
  const carEmissionFactors = {
    gasoline: 0.192,
    diesel: 0.171,
    hybrid: 0.105,
    electric: 0.045
  };
  const carCO2Kg = rentalCarKm * carEmissionFactors[carType];

  // Autobús / Guagua interurbana: 0.040 kg/pas/km
  const busCO2Kg = busKm * 0.040 * passengers;

  // Lancha / Ferry Saona / Cayo Levantado: aprox 18 kg CO2 por trayecto marítimo por grupo
  const ferryCO2Kg = ferryTrips * 18 * passengers;

  // Total Tons CO2
  const totalCO2Kg = flightCO2Kg + carCO2Kg + busCO2Kg + ferryCO2Kg;
  const totalCO2Tons = totalCO2Kg / 1000;

  // Trees: 22 kg CO2 / tree / year
  const treesNeeded = Math.max(1, Math.ceil(totalCO2Kg / 22));

  const { data: dbProjects } = useQuery({
    queryKey: ["offset-projects-enhanced"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offset_projects")
        .select("*");
      if (error) throw error;
      return data;
    }
  });

  const projects = [
    { 
      id: "p1", 
      title: "Reforestación en Parque Nacional Valle Nuevo", 
      location: "Constanza • Cordillera Central (18°42'N 70°35'W)", 
      category: "Alta Prioridad Hídrica & Pino Criollo", 
      description: "Siembra de pino criollo (*Pinus occidentalis*) y especies nativas en la 'Madre de las Aguas'. Protege las cabeceras de los ríos Yaque del Norte y Yaque del Sur.", 
      cost_info: "Costo por Árbol: RD$ 250 (~$4.15 USD)",
      impact: "1 árbol = 22 kg CO₂/año + fijación hídrica de cuenca",
      partner: "Fondo Agua Santo Domingo & Ministerio de Medio Ambiente"
    },
    { 
      id: "p2", 
      title: "Restauración de Manglares en Parque Nacional Los Haitises", 
      location: "Bahía de Samaná & Sabana de la Mar (19°02'N 69°35'W)", 
      category: "Carbono Azul & Protección Costera", 
      description: "Los manglares rojos (*Rhizophora mangle*) capturan hasta 4 veces más carbono que los bosques terrestres. Protegen el hábitat de manatíes y aves marinas endémicas.", 
      cost_info: "Costo por M²: RD$ 300 (~$5.00 USD)",
      impact: "1 m² de manglar = 35 kg CO₂ almacenado a perpetuidad",
      partner: "Fundación Ecológica Maguá & Guardaparques Locales"
    },
    {
      id: "p3",
      title: "Santuario de Corales & Micro-fragmentación en Bayahíbe",
      location: "La Altagracia • Costa Caribeña (18°22'N 68°50'W)",
      category: "Regeneración Marina & Arrecifes",
      description: "Micro-fragmentación acelerada de corales cuerno de ciervo (*Acropora cervicornis*) para devolver vida a los arrecifes afectados por el calentamiento oceánico.",
      cost_info: "Costo por Fragmento: RD$ 400 (~$6.60 USD)",
      impact: "1 colonia = absorbe energía de oleaje y regenera biomasa marina",
      partner: "FUNDEMAR (Fundación Dominicana de Estudios Marinos)"
    }
  ];

  const handleOffset = (projectName: string) => {
    setSelectedProjectForCert(projectName);
    toast.success(`¡Gracias por tu compromiso verde! Has seleccionado ${projectName}. Puedes generar tu Certificado Oficial abajo.`);
  };

  const handleGenerateCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certifiedName.trim()) {
      toast.error("Por favor escribe tu nombre para el certificado.");
      return;
    }
    setIsCertificateGenerated(true);
    toast.success("¡Certificado Oficial de Viajero Verde generado exitosamente!");
  };

  return (
    <PageTransition>
      <SEOHead
        title="Calculadora Multimodal de Huella de Carbono y Certificado Verde - Descubre RD"
        description="Calcula el impacto ambiental de tu vuelo, transporte terrestre y lanchas en República Dominicana. Compensa con reforestación en Valle Nuevo y Los Haitises."
        keywords="calculadora carbono vuelos rd, reforestacion valle nuevo, los haitises carbono azul, certificado viajero sostenible republica dominicana"
      />
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-20">
          {/* Hero */}
          <section className="relative py-16 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent border-b border-border">
            <div className="container mx-auto px-4 text-center">
              <Badge variant="secondary" className="mb-4 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 gap-1.5 px-3 py-1">
                <Leaf className="h-4 w-4 text-emerald-600" /> Calculadora Multimodal de Impacto Ecológico (Opción #30)
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 font-display text-foreground">
                Calcula y Neutraliza tu Huella de Viaje
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Mide no solo tus vuelos internacionales sino también tus traslados en vehículo de alquiler, autobuses y excursiones marítimas en República Dominicana. Apoya la siembra de árboles nativos y recibe tu Certificado Oficial de Viajero Verde.
              </p>
            </div>
          </section>

          {/* Calculator Section */}
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Multimodal Inputs (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  <Card className="border border-border shadow-md">
                    <CardHeader className="pb-3 border-b border-border/60">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Compass className="h-4 w-4 text-primary" />
                        Parámetros Multimodales del Viaje
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Ingresa todos los segmentos de tu aventura dominicana
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-4 space-y-5">
                      {/* Vuelo Internacional */}
                      <div className="space-y-3 p-3 bg-muted/40 rounded-xl border border-border/60">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Plane className="h-4 w-4 text-primary" /> Vuelo Internacional
                          </label>
                          <Badge variant="outline" className="text-[10px]">
                            {flightDistance} km
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-muted-foreground font-semibold">Origen</span>
                            <select 
                              className="w-full bg-background border border-input text-xs rounded p-1.5 mt-0.5"
                              value={origin}
                              onChange={(e) => setOrigin(e.target.value)}
                            >
                              <option value="Miami (MIA)">Miami (MIA)</option>
                              <option value="New York (JFK)">New York (JFK)</option>
                              <option value="Madrid (MAD)">Madrid (MAD)</option>
                              <option value="Bogotá (BOG)">Bogotá (BOG)</option>
                              <option value="Panamá (PTY)">Panamá (PTY)</option>
                              <option value="Toronto (YYZ)">Toronto (YYZ)</option>
                              <option value="San Juan (SJU)">San Juan (SJU)</option>
                            </select>
                          </div>

                          <div>
                            <span className="text-[10px] text-muted-foreground font-semibold">Destino RD</span>
                            <select 
                              className="w-full bg-background border border-input text-xs rounded p-1.5 mt-0.5"
                              value={destination}
                              onChange={(e) => setDestination(e.target.value)}
                            >
                              <option value="Santo Domingo (SDQ)">Santo Domingo (SDQ)</option>
                              <option value="Punta Cana (PUJ)">Punta Cana (PUJ)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <span className="text-[10px] text-muted-foreground font-semibold">Pasajeros</span>
                            <input 
                              type="number" 
                              min="1" 
                              max="20"
                              value={passengers}
                              onChange={(e) => setPassengers(Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-full bg-background border border-input text-xs rounded p-1.5 mt-0.5"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground font-semibold">Trayecto</span>
                            <select 
                              className="w-full bg-background border border-input text-xs rounded p-1.5 mt-0.5"
                              value={tripType}
                              onChange={(e) => setTripType(e.target.value as any)}
                            >
                              <option value="round-trip">Ida y Vuelta (Roundtrip)</option>
                              <option value="one-way">Solo Ida (One Way)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Transporte Terrestre Local */}
                      <div className="space-y-3 p-3 bg-muted/40 rounded-xl border border-border/60">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Car className="h-4 w-4 text-emerald-600" /> Vehículo de Alquiler en la Isla
                          </label>
                          <span className="text-[11px] font-bold text-primary">{rentalCarKm} km</span>
                        </div>

                        <input 
                          type="range" 
                          min="0" 
                          max="1500" 
                          step="50"
                          value={rentalCarKm}
                          onChange={(e) => setRentalCarKm(parseInt(e.target.value))}
                          className="w-full accent-primary"
                        />
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>0 km (Solo resort)</span>
                          <span>500 km (Ruta clásica)</span>
                          <span>1500 km (Vuelta a la isla)</span>
                        </div>

                        <div className="pt-1">
                          <span className="text-[10px] text-muted-foreground font-semibold">Tipo de Motorización</span>
                          <div className="grid grid-cols-2 gap-1.5 mt-1">
                            <button
                              type="button"
                              onClick={() => setCarType("gasoline")}
                              className={`text-[11px] py-1 px-2 rounded border transition-all ${
                                carType === "gasoline" ? "bg-primary text-primary-foreground font-bold" : "bg-background text-muted-foreground"
                              }`}
                            >
                              Gasolina SUV / Sedán
                            </button>
                            <button
                              type="button"
                              onClick={() => setCarType("diesel")}
                              className={`text-[11px] py-1 px-2 rounded border transition-all ${
                                carType === "diesel" ? "bg-primary text-primary-foreground font-bold" : "bg-background text-muted-foreground"
                              }`}
                            >
                              Diésel 4x4
                            </button>
                            <button
                              type="button"
                              onClick={() => setCarType("hybrid")}
                              className={`text-[11px] py-1 px-2 rounded border transition-all ${
                                carType === "hybrid" ? "bg-primary text-primary-foreground font-bold" : "bg-background text-muted-foreground"
                              }`}
                            >
                              Híbrido Eco
                            </button>
                            <button
                              type="button"
                              onClick={() => setCarType("electric")}
                              className={`text-[11px] py-1 px-2 rounded border transition-all ${
                                carType === "electric" ? "bg-primary text-primary-foreground font-bold" : "bg-background text-muted-foreground"
                              }`}
                            >
                              100% Eléctrico (EV)
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Lanchas & Catamaranes */}
                      <div className="space-y-2 p-3 bg-muted/40 rounded-xl border border-border/60">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Ship className="h-4 w-4 text-blue-600" /> Tours Marítimos (Lanchas / Catamarán)
                          </label>
                          <span className="text-[11px] font-bold text-blue-600">{ferryTrips} tours</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Excursiones a Isla Saona, Catalina, Cayo Levantado o avistamiento de ballenas.</p>
                        <div className="flex gap-2">
                          {[0, 1, 2, 3, 4].map(num => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setFerryTrips(num)}
                              className={`flex-1 py-1 text-xs rounded border transition-all ${
                                ferryTrips === num ? "bg-blue-600 text-white font-bold" : "bg-background text-muted-foreground"
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column: Breakdown & Project Selection (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Emission KPI Display */}
                  <Card className="border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-background to-emerald-500/5 shadow-lg overflow-hidden">
                    <CardHeader className="pb-2 text-center border-b border-emerald-500/20">
                      <CardTitle className="text-xs font-mono uppercase text-emerald-800 dark:text-emerald-300 tracking-wider">
                        Huella Total Estimada del Itinerario
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                        <div className="p-3 bg-background/80 rounded-xl border border-border">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold block">Vuelo Aéreo</span>
                          <span className="text-lg font-bold font-mono text-foreground">{(flightCO2Kg / 1000).toFixed(2)} t</span>
                        </div>
                        <div className="p-3 bg-background/80 rounded-xl border border-border">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold block">Carro / Asfalto</span>
                          <span className="text-lg font-bold font-mono text-foreground">{(carCO2Kg / 1000).toFixed(2)} t</span>
                        </div>
                        <div className="p-3 bg-background/80 rounded-xl border border-border">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold block">Marítimo</span>
                          <span className="text-lg font-bold font-mono text-foreground">{(ferryCO2Kg / 1000).toFixed(2)} t</span>
                        </div>
                        <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-md">
                          <span className="text-[10px] uppercase font-bold block opacity-90">Árboles a Sembrar</span>
                          <span className="text-xl font-bold flex items-center justify-center gap-1 mt-0.5">
                            <Trees className="h-5 w-5" /> {treesNeeded}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">
                          Emisión Consolidada: <strong className="text-emerald-600 font-mono text-sm">{totalCO2Tons.toFixed(3)} tCO₂e</strong>
                        </span>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                          {passengers} {passengers > 1 ? 'viajeros' : 'viajero'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Dominican Offsetting Projects */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-emerald-600" />
                        <h3 className="text-base font-bold font-display text-foreground">
                          Proyectos Locales de Neutralización
                        </h3>
                      </div>
                      <span className="text-xs text-muted-foreground">Geolocalizados en RD</span>
                    </div>

                    <div className="space-y-3">
                      {projects.map((proj) => (
                        <Card 
                          key={proj.id} 
                          className={`transition-all border ${
                            selectedProjectForCert === proj.title 
                              ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5 shadow-md" 
                              : "border-border hover:border-emerald-500/40"
                          }`}
                        >
                          <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h4 className="font-bold text-sm text-foreground">{proj.title}</h4>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 font-medium">
                                  <MapPin className="h-3 w-3 text-emerald-600" /> {proj.location}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
                                {proj.category}
                              </Badge>
                            </div>

                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {proj.description}
                            </p>

                            <div className="p-2 rounded bg-background border border-border/80 text-[11px] flex items-center justify-between text-muted-foreground">
                              <span>🌱 <strong>Impacto:</strong> {proj.impact}</span>
                              <span className="font-semibold text-emerald-600">{proj.cost_info}</span>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[10px] text-muted-foreground italic">
                                Alianza: {proj.partner}
                              </span>
                              <Button 
                                size="sm" 
                                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-8 px-3"
                                onClick={() => handleOffset(proj.title)}
                              >
                                {selectedProjectForCert === proj.title ? (
                                  <>
                                    <CheckCircle2 className="h-3.5 w-3.5" /> Proyecto Seleccionado
                                  </>
                                ) : (
                                  <>
                                    Seleccionar Proyecto <ArrowRight className="h-3 w-3" />
                                  </>
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Certificate Generator Form & Preview */}
                  <Card className="border border-emerald-500/30 bg-card shadow-md">
                    <CardHeader className="pb-3 bg-emerald-500/10 border-b border-emerald-500/20">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-emerald-600" />
                        <div>
                          <CardTitle className="text-base font-display text-foreground">
                            Emisión del Certificado Oficial de Viajero Verde
                          </CardTitle>
                          <CardDescription className="text-xs">
                            Acredita tu contribución ecológica avalada con código único de verificación
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 space-y-4">
                      <form onSubmit={handleGenerateCertificate} className="flex flex-col sm:flex-row gap-3">
                        <input 
                          type="text"
                          placeholder="Tu nombre completo o de la familia viajera..."
                          value={certifiedName}
                          onChange={(e) => setCertifiedName(e.target.value)}
                          className="flex-1 bg-background border border-input text-xs rounded-lg px-3 py-2 text-foreground"
                          required
                        />
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs whitespace-nowrap">
                          <Award className="w-3.5 h-3.5 mr-1.5" />
                          Generar Certificado Digital
                        </Button>
                      </form>

                      {isCertificateGenerated && certifiedName && (
                        <div className="mt-4 p-5 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-50/50 to-emerald-100/30 dark:from-emerald-950/30 dark:to-emerald-900/10 space-y-4 animate-in fade-in">
                          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-6 h-6 text-emerald-600" />
                              <div>
                                <h4 className="font-bold text-sm text-foreground">REPÚBLICA DOMINICANA • TURISMO VERDE</h4>
                                <p className="text-[10px] text-muted-foreground">Folio Verificado: DR-ECO-{Math.floor(100000 + Math.random() * 900000)}</p>
                              </div>
                            </div>
                            <Badge className="bg-emerald-600 text-white text-[10px]">
                              Carbon Neutral Verified
                            </Badge>
                          </div>

                          <div className="text-center py-3 space-y-2">
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                              Certificado de Sostenibilidad Turística otorgado a:
                            </p>
                            <h3 className="text-xl font-bold font-serif text-foreground">
                              {certifiedName}
                            </h3>
                            <p className="text-xs text-muted-foreground max-w-lg mx-auto">
                              Por neutralizar con éxito un impacto estimado de <strong className="text-foreground">{totalCO2Tons.toFixed(3)} tCO₂e</strong> financiando el proyecto <strong className="text-emerald-700 dark:text-emerald-300">{selectedProjectForCert}</strong> equivalente a la absorción de <strong className="text-foreground">{treesNeeded} árboles nativos</strong>.
                            </p>
                          </div>

                          <div className="pt-3 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground">
                            <span>Fecha de Validación: <strong>{new Date().toLocaleDateString('es-DO')}</strong></span>
                            
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-7 text-xs gap-1 border-emerald-500/40"
                                onClick={() => {
                                  toast.success("Enlace del certificado copiado al portapapeles.");
                                }}
                              >
                                <Share2 className="w-3 h-3" /> Compartir
                              </Button>
                              <Button 
                                size="sm" 
                                className="h-7 text-xs gap-1 bg-emerald-600 text-white hover:bg-emerald-700"
                                onClick={() => {
                                  toast.success("Descargando Certificado Digital en Alta Resolución (PDF/PNG)...");
                                }}
                              >
                                <Download className="w-3 h-3" /> Descargar PDF
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

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
