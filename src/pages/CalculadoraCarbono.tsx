import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Leaf, Plane, Trees, Sparkles, 
  Car, Ship, CheckCircle2, 
  MapPin, Compass, ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { mockRoutes, carEmissionFactors, offsetProjects } from "@/data/carbonoData";
import { CarbonCertificateGenerator } from "@/components/sustainability/CarbonCertificateGenerator";
import { useEffect } from "react";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { fetchApi } from "@/lib/fastifyClient";
import { usePageContent } from "@/lib/pageContent";

interface CarbonBackendResult {
  flight_km: number;
  breakdown_kg: {
    flight: number;
    car: number;
    bus: number;
    ferry: number;
  };
  total_kg: number;
  total_tons: number;
  trees_needed: number;
  per_passenger_kg: number;
  offset_projects?: Array<{
    id: string;
    title: string;
    slug: string;
    location: string;
    category: string;
    cost_info: unknown;
  }>;
}

export default function CalculadoraCarbono() {
  const pc = usePageContent("calculadora-carbono");
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
  const [selectedProjectForCert, setSelectedProjectForCert] = useState<string>("Reforestación en Parque Nacional Valle Nuevo");
  const [backendData, setBackendData] = useState<CarbonBackendResult | null>(null);

  // Factors fallback
  const flightDistance = (mockRoutes.find(r => r.origin === origin && r.destination === destination)?.distanceKm || 1500) * (tripType === "round-trip" ? 2 : 1);
  const flightCO2Kg = backendData ? backendData.breakdown_kg.flight : flightDistance * 0.115 * passengers;

  // Terrestre: 
  const carCO2Kg = backendData ? backendData.breakdown_kg.car : rentalCarKm * carEmissionFactors[carType];

  // Autobús / Guagua interurbana: 0.040 kg/pas/km
  const busCO2Kg = backendData ? backendData.breakdown_kg.bus : busKm * 0.040 * passengers;

  // Lancha / Ferry Saona / Cayo Levantado: aprox 18 kg CO2 por trayecto marítimo por grupo
  const ferryCO2Kg = backendData ? backendData.breakdown_kg.ferry : ferryTrips * 18 * passengers;

  // Total Tons CO2
  const totalCO2Kg = backendData ? backendData.total_kg : (flightCO2Kg + carCO2Kg + busCO2Kg + ferryCO2Kg);
  const totalCO2Tons = backendData ? backendData.total_tons : (totalCO2Kg / 1000);

  // Trees: 22 kg CO2 / tree / year
  const treesNeeded = backendData ? backendData.trees_needed : Math.max(1, Math.ceil(totalCO2Kg / 22));

  useEffect(() => {
    if (!HAS_BACKEND_SESSION) return;
    const controller = new AbortController();
    const flightDistOneWay = mockRoutes.find(r => r.origin === origin && r.destination === destination)?.distanceKm || 1500;

    fetchApi<{ data: CarbonBackendResult }>("/calculators/carbon", {
      method: "POST",
      body: JSON.stringify({
        flight_km: flightDistOneWay,
        round_trip: tripType === "round-trip",
        passengers,
        rental_car_km: rentalCarKm,
        car_type: carType,
        bus_km: busKm,
        ferry_trips: ferryTrips
      }),
      signal: controller.signal
    })
      .then((res) => {
        if (res?.data) {
          setBackendData(res.data);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Error al calcular huella de carbono en backend:", err);
        }
      });

    return () => controller.abort();
  }, [origin, destination, tripType, passengers, rentalCarKm, carType, busKm, ferryTrips]);

  const handleOffset = (projectName: string) => {
    setSelectedProjectForCert(projectName);
    toast.success(`¡Gracias por tu compromiso verde! Has seleccionado ${projectName}. Puedes generar tu Certificado Oficial abajo.`);
  };

  return (
    <PageTransition>
      <SEOHead
        title={pc.t("SEOHead.title.1", "Calculadora Multimodal de Huella de Carbono y Certificado Verde - Descubre RD")}
        description={pc.t("SEOHead.description.1", "Calcula el impacto ambiental de tu vuelo, transporte terrestre y lanchas en República Dominicana. Compensa con reforestación en Valle Nuevo y Los Haitises.")}
        keywords="calculadora carbono vuelos rd, reforestacion valle nuevo, los haitises carbono azul, certificado viajero sostenible republica dominicana"
      />
      <div className="min-h-dvh bg-background">
        <Header />

        <main className="pt-20">
          {/* Hero */}
          <section className="relative py-16 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent border-b border-border">
            <div className="container mx-auto px-4 text-center">
              <Badge variant="secondary" className="mb-4 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 gap-1.5 px-3 py-1">
                <Leaf className="h-4 w-4 text-emerald-600" />{" "}{pc.tx("Badge.1", "Calculadora Multimodal de Impacto Ecológico (Opción #30)")}</Badge>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 font-display text-foreground">{pc.tx("h1.1", "Calcula y Neutraliza tu Huella de Viaje")}</h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">{pc.tx("p.1", "Mide no solo tus vuelos internacionales sino también tus traslados en vehículo de alquiler, autobuses y excursiones marítimas en República Dominicana. Apoya la siembra de árboles nativos y recibe tu Certificado Oficial de Viajero Verde.")}</p>
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
                      <CardTitle as="h2" className="text-base flex items-center gap-2">
                        <Compass className="h-4 w-4 text-primary" />{pc.tx("CardTitle.1", "Parámetros Multimodales del Viaje")}</CardTitle>
                      <CardDescription className="text-xs">{pc.tx("CardDescription.1", "Ingresa todos los segmentos de tu aventura dominicana")}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-4 space-y-5">
                      {/* Vuelo Internacional */}
                      <div className="space-y-3 p-3 bg-muted/40 rounded-xl border border-border/60">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Plane className="h-4 w-4 text-primary" />{" "}{pc.tx("label.1", "Vuelo Internacional")}</label>
                          <Badge variant="outline" className="text-3xs">
                            {flightDistance}{" "}{pc.tx("Badge.2", "km")}</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-3xs text-muted-foreground font-semibold">{pc.tx("span.1", "Origen")}</span>
                            <select 
                              className="w-full bg-background border border-input text-xs rounded p-1.5 mt-0.5"
                              value={origin}
                              onChange={(e) => setOrigin(e.target.value)}
                            >
                              <option value="Miami (MIA)">{pc.tx("option.1", "Miami (MIA)")}</option>
                              <option value="New York (JFK)">{pc.tx("option.2", "New York (JFK)")}</option>
                              <option value="Madrid (MAD)">{pc.tx("option.3", "Madrid (MAD)")}</option>
                              <option value="Bogotá (BOG)">{pc.tx("option.4", "Bogotá (BOG)")}</option>
                              <option value="Panamá (PTY)">{pc.tx("option.5", "Panamá (PTY)")}</option>
                              <option value="Toronto (YYZ)">{pc.tx("option.6", "Toronto (YYZ)")}</option>
                              <option value="San Juan (SJU)">{pc.tx("option.7", "San Juan (SJU)")}</option>
                            </select>
                          </div>

                          <div>
                            <span className="text-3xs text-muted-foreground font-semibold">{pc.tx("span.2", "Destino RD")}</span>
                            <select 
                              className="w-full bg-background border border-input text-xs rounded p-1.5 mt-0.5"
                              value={destination}
                              onChange={(e) => setDestination(e.target.value)}
                            >
                              <option value="Santo Domingo (SDQ)">{pc.tx("option.8", "Santo Domingo (SDQ)")}</option>
                              <option value="Punta Cana (PUJ)">{pc.tx("option.9", "Punta Cana (PUJ)")}</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <span className="text-3xs text-muted-foreground font-semibold">{pc.tx("span.3", "Pasajeros")}</span>
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
                            <span className="text-3xs text-muted-foreground font-semibold">{pc.tx("span.4", "Trayecto")}</span>
                            <select 
                              className="w-full bg-background border border-input text-xs rounded p-1.5 mt-0.5"
                              value={tripType}
                              onChange={(e) => setTripType(e.target.value as any)}
                            >
                              <option value="round-trip">{pc.tx("option.10", "Ida y Vuelta (Roundtrip)")}</option>
                              <option value="one-way">{pc.tx("option.11", "Solo Ida (One Way)")}</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Transporte Terrestre Local */}
                      <div className="space-y-3 p-3 bg-muted/40 rounded-xl border border-border/60">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Car className="h-4 w-4 text-emerald-600" />{" "}{pc.tx("label.2", "Vehículo de Alquiler en la Isla")}</label>
                          <span className="text-2xs font-bold text-primary">{rentalCarKm}{" "}{pc.tx("span.5", "km")}</span>
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
                        <div className="flex justify-between text-3xs text-muted-foreground">
                          <span>{pc.tx("span.6", "0 km (Solo resort)")}</span>
                          <span>{pc.tx("span.7", "500 km (Ruta clásica)")}</span>
                          <span>{pc.tx("span.8", "1500 km (Vuelta a la isla)")}</span>
                        </div>

                        <div className="pt-1">
                          <span className="text-3xs text-muted-foreground font-semibold">{pc.tx("span.9", "Tipo de Motorización")}</span>
                          <div className="grid grid-cols-2 gap-1.5 mt-1">
                            <button
                              type="button"
                              onClick={() => setCarType("gasoline")}
                              className={`text-2xs py-1 px-2 rounded border transition-all ${
                                carType === "gasoline" ? "bg-primary text-primary-foreground font-bold" : "bg-background text-muted-foreground"
                              }`}
                            >{pc.tx("button.1", "Gasolina SUV / Sedán")}</button>
                            <button
                              type="button"
                              onClick={() => setCarType("diesel")}
                              className={`text-2xs py-1 px-2 rounded border transition-all ${
                                carType === "diesel" ? "bg-primary text-primary-foreground font-bold" : "bg-background text-muted-foreground"
                              }`}
                            >{pc.tx("button.2", "Diésel 4x4")}</button>
                            <button
                              type="button"
                              onClick={() => setCarType("hybrid")}
                              className={`text-2xs py-1 px-2 rounded border transition-all ${
                                carType === "hybrid" ? "bg-primary text-primary-foreground font-bold" : "bg-background text-muted-foreground"
                              }`}
                            >{pc.tx("button.3", "Híbrido Eco")}</button>
                            <button
                              type="button"
                              onClick={() => setCarType("electric")}
                              className={`text-2xs py-1 px-2 rounded border transition-all ${
                                carType === "electric" ? "bg-primary text-primary-foreground font-bold" : "bg-background text-muted-foreground"
                              }`}
                            >{pc.tx("button.4", "100% Eléctrico (EV)")}</button>
                          </div>
                        </div>
                      </div>

                      {/* Lanchas & Catamaranes */}
                      <div className="space-y-2 p-3 bg-muted/40 rounded-xl border border-border/60">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Ship className="h-4 w-4 text-blue-600" />{" "}{pc.tx("label.3", "Tours Marítimos (Lanchas / Catamarán)")}</label>
                          <span className="text-2xs font-bold text-blue-600">{ferryTrips}{" "}{pc.tx("span.10", "tours")}</span>
                        </div>
                        <p className="text-3xs text-muted-foreground">{pc.tx("p.2", "Excursiones a Isla Saona, Catalina, Cayo Levantado o avistamiento de ballenas.")}</p>
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
                      <CardTitle className="text-xs font-mono uppercase text-emerald-800 dark:text-emerald-300 tracking-wider">{pc.tx("CardTitle.2", "Huella Total Estimada del Itinerario")}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                        <div className="p-3 bg-background/80 rounded-xl border border-border">
                          <span className="text-3xs text-muted-foreground uppercase font-bold block">{pc.tx("span.11", "Vuelo Aéreo")}</span>
                          <span className="text-lg font-bold font-mono text-foreground">{(flightCO2Kg / 1000).toFixed(2)} t</span>
                        </div>
                        <div className="p-3 bg-background/80 rounded-xl border border-border">
                          <span className="text-3xs text-muted-foreground uppercase font-bold block">{pc.tx("span.12", "Carro / Asfalto")}</span>
                          <span className="text-lg font-bold font-mono text-foreground">{(carCO2Kg / 1000).toFixed(2)} t</span>
                        </div>
                        <div className="p-3 bg-background/80 rounded-xl border border-border">
                          <span className="text-3xs text-muted-foreground uppercase font-bold block">{pc.tx("span.13", "Marítimo")}</span>
                          <span className="text-lg font-bold font-mono text-foreground">{(ferryCO2Kg / 1000).toFixed(2)} t</span>
                        </div>
                        <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-md">
                          <span className="text-3xs uppercase font-bold block opacity-90">{pc.tx("span.14", "Árboles a Sembrar")}</span>
                          <span className="text-xl font-bold flex items-center justify-center gap-1 mt-0.5">
                            <Trees className="h-5 w-5" /> {treesNeeded}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">{pc.tx("span.15", "Emisión Consolidada:")}{" "}<strong className="text-emerald-600 font-mono text-sm">{totalCO2Tons.toFixed(3)}{" "}{pc.tx("strong.1", "tCO₂e")}</strong>
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
                        <h2 className="h3 text-base font-bold font-display text-foreground">{pc.tx("h3.1", "Proyectos Locales de Neutralización")}</h2>
                      </div>
                      <span className="text-xs text-muted-foreground">{pc.tx("span.16", "Geolocalizados en RD")}</span>
                    </div>

                    <div className="space-y-3">
                      {offsetProjects.map((proj) => (
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
                                <h3 className="h4 font-bold text-sm text-foreground">{proj.title}</h3>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 font-medium">
                                  <MapPin className="h-3 w-3 text-emerald-600" /> {proj.location}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-3xs border-emerald-500/40 text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
                                {proj.category}
                              </Badge>
                            </div>

                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {proj.description}
                            </p>

                            <div className="p-2 rounded bg-background border border-border/80 text-2xs flex items-center justify-between text-muted-foreground">
                              <span>🌱 <strong>{pc.tx("strong.2", "Impacto:")}</strong> {proj.impact}</span>
                              <span className="font-semibold text-emerald-600">{proj.cost_info}</span>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <span className="text-3xs text-muted-foreground italic">{pc.tx("span.17", "Alianza:")}{" "}{proj.partner}
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

                  {/* Certificate Generator Component */}
                  <CarbonCertificateGenerator
                    totalCO2Tons={totalCO2Tons}
                    treesNeeded={treesNeeded}
                    selectedProjectForCert={selectedProjectForCert}
                  />

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
