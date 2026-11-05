import { SectionIndex } from "@/components/SectionIndex";
import { InfoTransporteSection } from "@/components/transporte/InfoTransporteSection";
import { MetroSection } from "@/components/transporte/MetroSection";
import { TelefericoSection } from "@/components/transporte/TelefericoSection";
import { MonorielSection } from "@/components/transporte/MonorielSection";
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
  Train, Navigation, MapPin, CreditCard, Info, Map, 
  Clock, DollarSign, Calendar, ArrowRight, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { usePageContent } from "@/lib/pageContent";

interface RouteInfo {
  id: string;
  name: string;
  city: string;
  status: string;
  stationsCount: number;
  length: string;
  color: string;
  schedule: string;
  keyStops: string[];
  fare: string;
  coverage: string;
  tip: string;
}

const systems: RouteInfo[] = [
  {
    id: "metro1",
    name: "Metro Santo Domingo - Línea 1",
    city: "Santo Domingo",
    status: "Operativo",
    stationsCount: 16,
    length: "14.5 km",
    color: "bg-blue-600 text-white",
    schedule: "Lun - Vie: 6:00 AM - 10:30 PM • Sáb, Dom y feriados: 6:00 AM - 10:00 PM",
    keyStops: ["Mamá Tingó", "Centro de los Héroes (La Feria)", "Máximo Gómez (Conexión L2)"],
    fare: "RD$ 20 por viaje + RD$ 60 la Tarjeta Metro recargable",
    coverage: "Conecta Santo Domingo Norte, Centro, Este y Oeste sin tráfico vehicular.",
    tip: "Usa la estación Juan Pablo Duarte (Av. Kennedy / Máximo Gómez) para transbordar gratis entre la Línea 1 y la Línea 2.",
  },
  {
    id: "metro2",
    name: "Metro Santo Domingo - Línea 2 (2A & 2B)",
    city: "Santo Domingo",
    status: "Operativo",
    stationsCount: 18,
    length: "18.5 km",
    color: "bg-red-600 text-white",
    schedule: "Lun - Vie: 6:00 AM - 10:30 PM • Sáb, Dom y feriados: 6:00 AM - 10:00 PM",
    keyStops: ["María Montez (Km 9)", "Juan Pablo Duarte (Conexión L1)", "Concepción Bona (Megacentro)"],
    fare: "RD$ 20 por viaje + RD$ 60 la Tarjeta Metro recargable",
    coverage: "Conecta Santo Domingo Norte, Centro, Este y Oeste sin tráfico vehicular.",
    tip: "Usa la estación Juan Pablo Duarte (Av. Kennedy / Máximo Gómez) para transbordar gratis entre la Línea 1 y la Línea 2.",
  },
  {
    id: "teleferico1",
    name: "Teleférico Santo Domingo - Línea 1",
    city: "Santo Domingo",
    status: "Operativo",
    stationsCount: 4,
    length: "5 km",
    color: "bg-orange-500 text-white",
    schedule: "Lun - Vie: 6:00 AM - 10:30 PM • Sab: 6:00 AM - 9:00 PM • Dom: 8:00 AM - 9:00 PM",
    keyStops: ["Gualey (Conexión L2 Metro)", "Sabana Perdida", "Charles de Gaulle"],
    fare: "Integrado al Metro: sin costo adicional con la misma tarjeta",
    coverage: "Sobrevuela el río Ozama y conecta sectores elevados con las terminales del Metro.",
    tip: "Opción escénica y sin congestión para cruzar el Gran Santo Domingo.",
  },
  {
    id: "teleferico2",
    name: "Teleférico Santo Domingo - Línea 2",
    city: "Santo Domingo",
    status: "Operativo",
    stationsCount: 4,
    length: "4.2 km",
    color: "bg-amber-500 text-white",
    schedule: "Lun - Vie: 6:00 AM - 10:30 PM • Sab: 6:00 AM - 9:00 PM • Dom: 8:00 AM - 9:00 PM",
    keyStops: ["Los Alcarrizos", "Las Caobas", "María Montez (Conexión L2 Metro)"],
    fare: "Integrado al Metro: sin costo adicional con la misma tarjeta",
    coverage: "Sobrevuela el río Ozama y conecta sectores elevados con las terminales del Metro.",
    tip: "Opción escénica y sin congestión para cruzar el Gran Santo Domingo.",
  },
  {
    id: "monorriel",
    name: "Monorriel de Santiago - Línea 1",
    city: "Santiago de los Caballeros",
    status: "En Pruebas / Inauguración Parcial",
    stationsCount: 14,
    length: "13.2 km",
    color: "bg-green-600 text-white",
    schedule: "Sujeto a horarios especiales de pruebas",
    keyStops: ["Cienfuegos", "Las Carreras", "Pekín"],
    fare: "Tarifa integrada al Sistema SIT de Santiago",
    coverage: "Primer monorriel del Caribe: conecta Cienfuegos con el Monumento de Santiago y la PUCMM.",
    tip: "Reducirá el trayecto norte-sur de Santiago de 60 minutos en hora pico a unos 18 minutos.",
  }
];

export default function TransporteUrbano() {
  const pc = usePageContent("transporte-urbano");
  const systems = pc.data("systems", __pcData.systems);
  const [selectedSystem, setSelectedSystem] = useState<string>("metro1");
  const currentSystem = systems.find(s => s.id === selectedSystem) || systems[0];

  const [origin, setOrigin] = useState("Mamá Tingó");
  const [destination, setDestination] = useState("Centro de los Héroes");

  const calculateRoute = () => {
    if (origin === destination) {
      toast.error("El origen y el destino no pueden ser iguales.");
      return;
    }
    toast.success(`Ruta calculada: de ${origin} a ${destination}. Tarifa estimada: RD$20. Tiempo estimado: 25 minutos.`);
  };

  return (
    <PageTransition>
      <SEOHead
        title={pc.t("SEOHead.title.1", "Guía del Transporte Urbano Integrado - Descubre RD")}
        description={pc.t("SEOHead.description.1", "Información de tarifas, horarios y estaciones del Metro de Santo Domingo, Teleférico y el Monorriel de Santiago. Planifica tu ruta urbana fácilmente.")}
      />
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-20">
          {/* Hero */}
          <section className="relative py-16 bg-gradient-to-br from-blue-500/10 via-red-500/5 to-transparent border-b border-border">
            <div className="container mx-auto px-4 text-center">
              <Badge variant="secondary" className="mb-4 bg-blue-500/10 text-blue-600 border-blue-500/20 gap-1">
                <Train className="h-3.5 w-3.5" />{" "}{pc.tx("Badge.1", "Movilidad Sostenible e Integrada")}</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">{pc.tx("h1.1", "Transporte Urbano en RD")}</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{pc.tx("p.1", "Conoce la red de transporte masivo de la República Dominicana. Muévete de forma rápida, económica y segura en Santo Domingo y Santiago de los Caballeros.")}</p>
            </div>
          </section>
        <SectionIndex items={[{ id: "recorre", label: "Recorre el país" }, { id: "metro", label: "Metro" }, { id: "teleferico", label: "Teleférico" }, { id: "monoriel", label: "Monoriel" }]} />

          {/* Interactive Core */}
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-5xl">
              
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                
                {/* System Selector and Info (Col 7) */}
                <div className="lg:col-span-7 space-y-6">
                  <Tabs value={selectedSystem} onValueChange={setSelectedSystem} className="w-full">
                    <TabsList className="grid grid-cols-2 md:grid-cols-3 gap-1 h-auto bg-muted p-1">
                      <TabsTrigger value="metro1" className="text-xs py-2">{pc.tx("TabsTrigger.1", "Metro L1")}</TabsTrigger>
                      <TabsTrigger value="metro2" className="text-xs py-2">{pc.tx("TabsTrigger.2", "Metro L2")}</TabsTrigger>
                      <TabsTrigger value="teleferico1" className="text-xs py-2">{pc.tx("TabsTrigger.3", "Teleférico L1")}</TabsTrigger>
                      <TabsTrigger value="teleferico2" className="text-xs py-2">{pc.tx("TabsTrigger.4", "Teleférico L2")}</TabsTrigger>
                      <TabsTrigger value="monorriel" className="text-xs py-2">{pc.tx("TabsTrigger.5", "Monorriel Stgo")}</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <Card className="border-primary/10 shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-4 flex-wrap">
                        <div>
                          <CardTitle as="h2" className="text-xl font-display">{currentSystem.name}</CardTitle>
                          <CardDescription className="text-xs font-semibold text-muted-foreground mt-0.5">{pc.tx("CardDescription.1", "Ciudad:")}{" "}{currentSystem.city}
                          </CardDescription>
                        </div>
                        <Badge className={`${currentSystem.color} text-3xs uppercase font-bold border-none py-1`}>
                          {currentSystem.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 text-xs">
                      
                      <div className="grid sm:grid-cols-3 gap-4 bg-muted/40 p-4 rounded-lg border border-border">
                        <div className="space-y-0.5">
                          <span className="text-3xs text-muted-foreground uppercase font-bold">{pc.tx("span.1", "Estaciones")}</span>
                          <span className="text-sm font-bold text-foreground flex items-center gap-1"><MapPin className="h-4 w-4 text-primary" /> {currentSystem.stationsCount}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-3xs text-muted-foreground uppercase font-bold">{pc.tx("span.2", "Longitud")}</span>
                          <span className="text-sm font-bold text-foreground flex items-center gap-1"><Navigation className="h-4 w-4 text-primary" /> {currentSystem.length}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-3xs text-muted-foreground uppercase font-bold">{pc.tx("span.3", "Tarifa Básica")}</span>
                          <span className="text-sm font-bold text-foreground flex items-center gap-1"><DollarSign className="h-4 w-4 text-emerald-600" />{" "}{currentSystem.fare}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-3xs text-muted-foreground uppercase font-bold block">{pc.tx("span.5", "Horario de Operación:")}</span>
                        <p className="font-semibold text-foreground flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" /> {currentSystem.schedule}</p>
                      </div>

                      <p className="text-muted-foreground leading-relaxed">{currentSystem.coverage}</p>
                      <p className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-foreground"><strong>{pc.tx("strong.tip", "💡 Consejo:")}</strong> {currentSystem.tip}</p>

                      <div className="space-y-2 pt-2 border-t border-border">
                        <span className="text-3xs text-muted-foreground uppercase font-bold block">{pc.tx("span.6", "Estaciones y Conexiones Clave:")}</span>
                        <ul className="space-y-1">
                          {currentSystem.keyStops.map((stop, idx) => (
                            <li key={idx} className="flex items-center gap-2 p-2 bg-muted/20 border border-border/40 rounded">
                              <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                              <span className="font-medium text-foreground">{stop}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </CardContent>
                  </Card>
                </div>

                {/* Tariff, Cards, and Simulator (Col 5) */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Tarjetas e integración */}
                  <Card className="border-emerald-500/20 bg-emerald-500/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-emerald-700">
                        <CreditCard className="h-4.5 w-4.5" />{pc.tx("CardTitle.1", "Medios de Pago")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                      <p>{pc.tx("p.2", "Para acceder al Metro y al Teleférico se utiliza el sistema unificado de tarjetas inteligentes:")}</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li><strong>{pc.tx("strong.1", "Tarjeta Boleto (Plástica Reutilizable):")}</strong>{" "}{pc.tx("li.1", "Costo de adquisición RD$30. Recargable con los viajes que desees.")}</li>
                        <li><strong>{pc.tx("strong.2", "Boleto Único (Cartón):")}</strong>{" "}{pc.tx("li.2", "Costo RD$15. Válido para un único viaje de forma temporal.")}</li>
                        <li><strong>{pc.tx("strong.3", "Tarjeta SDGO Integrada:")}</strong>{" "}{pc.tx("li.3", "Permite transbordo tarifario preferencial entre autobuses de la OMSA y el sistema de Metro.")}</li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Route Planner Simulator */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{pc.tx("CardTitle.2", "Simulador de Ruta (Metro L1)")}</CardTitle>
                      <CardDescription>{pc.tx("CardDescription.2", "Selecciona estaciones para trazar tu viaje")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-3xs font-bold text-muted-foreground uppercase">{pc.tx("label.1", "Origen (Estación)")}</label>
                        <select 
                          className="w-full bg-background border border-input text-xs rounded p-2"
                          value={origin}
                          onChange={(e) => setOrigin(e.target.value)}
                        >
                          <option value="Mamá Tingó">{pc.tx("option.1", "Mamá Tingó (L1 - Extremo Norte)")}</option>
                          <option value="Máximo Gómez">{pc.tx("option.2", "Máximo Gómez (L1 - Conexión L2)")}</option>
                          <option value="Juan Pablo Duarte">{pc.tx("option.3", "Juan Pablo Duarte (L1/L2 Central)")}</option>
                          <option value="Centro de los Héroes">{pc.tx("option.4", "Centro de los Héroes (L1 - Extremo Sur)")}</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-3xs font-bold text-muted-foreground uppercase">{pc.tx("label.2", "Destino (Estación)")}</label>
                        <select 
                          className="w-full bg-background border border-input text-xs rounded p-2"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                        >
                          <option value="Mamá Tingó">{pc.tx("option.5", "Mamá Tingó (L1 - Extremo Norte)")}</option>
                          <option value="Máximo Gómez">{pc.tx("option.6", "Máximo Gómez (L1 - Conexión L2)")}</option>
                          <option value="Juan Pablo Duarte">{pc.tx("option.7", "Juan Pablo Duarte (L1/L2 Central)")}</option>
                          <option value="Centro de los Héroes">{pc.tx("option.8", "Centro de los Héroes (L1 - Extremo Sur)")}</option>
                        </select>
                      </div>

                      <Button onClick={calculateRoute} className="w-full gap-1.5 text-xs">{pc.tx("Button.1", "Calcular Ruta")}{" "}<ArrowRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Seguir con normas */}
                  <Card className="text-xs text-muted-foreground bg-muted/40 border border-border">
                    <CardContent className="p-4 flex gap-3 items-start">
                      <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <strong className="text-foreground">{pc.tx("strong.4", "Seguridad y Normas:")}</strong>{" "}{pc.tx("div.1", "El sistema de Metro está vigilado por el Cuerpo Especializado para la Seguridad del Metro (CESMET). Está prohibido ingresar alimentos, bebidas o bultos excesivamente grandes.")}</div>
                    </CardContent>
                  </Card>

                </div>

              </div>

            </div>
          </section>

        </main>

        <InfoTransporteSection />
        <MetroSection />
        <TelefericoSection />
        <MonorielSection />
        <Footer />
      </div>
    </PageTransition>
  );
}

// Datos del módulo editables desde el panel (ver pc.data en src/lib/pageContent.ts).
const __pcData = { systems };
