import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Car, CreditCard, Landmark, DollarSign, MapPin, 
  Calculator, Info, ShieldCheck, Compass, HelpCircle
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { TollsMap } from "@/components/peajes/TollsMap";

interface TollPoint {
  name: string;
  cat1Price: number;
  cat2Price: number;
  cat3Price: number;
  cat4Price: number;
}

interface TollRoute {
  id: string;
  name: string;
  description: string;
  tolls: TollPoint[];
}

const mockRoutes: TollRoute[] = [
  {
    id: "route_east",
    name: "Autovía del Este (Santo Domingo - Punta Cana)",
    description: "Ruta desde la capital hacia los polos turísticos de La Romana, Bayahibe, Bávaro y Punta Cana.",
    tolls: [
      { name: "Peaje Las Américas", cat1Price: 60, cat2Price: 120, cat3Price: 180, cat4Price: 240 },
      { name: "Peaje Coral I (La Romana)", cat1Price: 100, cat2Price: 200, cat3Price: 300, cat4Price: 400 },
      { name: "Peaje Coral II (Punta Cana)", cat1Price: 100, cat2Price: 200, cat3Price: 300, cat4Price: 400 }
    ]
  },
  {
    id: "route_north",
    name: "Autopista Duarte (Santo Domingo - Santiago)",
    description: "Vía de conexión principal hacia la región del Cibao (Bonao, La Vega, Santiago, Puerto Plata).",
    tolls: [
      { name: "Peaje Duarte (Km 25)", cat1Price: 60, cat2Price: 120, cat3Price: 180, cat4Price: 240 }
    ]
  },
  {
    id: "route_samana",
    name: "Autopista del Nordeste (Santo Domingo - Samaná)",
    description: "La famosa autovía Juan Pablo II que cruza el parque nacional Los Haitises hacia Las Terrenas y Samaná.",
    tolls: [
      { name: "Peaje Marbella", cat1Price: 60, cat2Price: 120, cat3Price: 180, cat4Price: 240 },
      { name: "Peaje Naranjal", cat1Price: 200, cat2Price: 400, cat3Price: 600, cat4Price: 800 },
      { name: "Peaje Guaraguao", cat1Price: 230, cat2Price: 460, cat3Price: 690, cat4Price: 920 },
      { name: "Peaje El Catey", cat1Price: 580, cat2Price: 1150, cat3Price: 1720, cat4Price: 2300 }
    ]
  },
  {
    id: "route_south",
    name: "Autopista Sánchez (Santo Domingo - San Cristóbal / Baní / Sur)",
    description: "Conexión hacia el Sur Profundo (San Cristóbal, Baní, Azua, Barahona, Pedernales).",
    tolls: [
      { name: "Peaje Sánchez (Km 12)", cat1Price: 60, cat2Price: 120, cat3Price: 180, cat4Price: 240 }
    ]
  }
];

export default function CalculadoraPeajes() {
  const [selectedRouteId, setSelectedRouteId] = useState<string>("route_east");
  const [vehicleCategory, setVehicleCategory] = useState<number>(1); // Cat 1 to 4

  const { data: dbRoutes } = useQuery({
    queryKey: ["toll-routes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("toll_routes")
        .select("*");
      if (error) throw error;
      return data;
    }
  });

  const routes: TollRoute[] = dbRoutes && dbRoutes.length > 0
    ? dbRoutes.map((r: any) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        tolls: (typeof r.tolls_data === "string" ? JSON.parse(r.tolls_data) : r.tolls_data) || []
      }))
    : mockRoutes;

  const currentRoute = routes.find(r => r.id === selectedRouteId) || routes[0] || mockRoutes[0];

  const getTollPrice = (toll: TollPoint) => {
    if (vehicleCategory === 1) return toll.cat1Price;
    if (vehicleCategory === 2) return toll.cat2Price;
    if (vehicleCategory === 3) return toll.cat3Price;
    return toll.cat4Price;
  };

  const totalCost = currentRoute.tolls.reduce((sum, toll) => sum + getTollPrice(toll), 0);

  return (
    <PageTransition>
      <SEOHead
        title="Calculadora de Peajes de Carreteras - Descubre RD"
        description="Calcula el costo total de peajes para viajar en auto por República Dominicana (Autopista Duarte, del Nordeste, Las Américas) según tu tipo de vehículo."
      />
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-20">
          {/* Hero */}
          <section className="relative py-16 bg-gradient-to-br from-blue-500/10 via-amber-500/5 to-transparent border-b border-border">
            <div className="container mx-auto px-4 text-center">
              <Badge variant="secondary" className="mb-4 bg-blue-500/10 text-blue-600 border-blue-500/20 gap-1">
                <Calculator className="h-3.5 w-3.5" /> Planificador de Viajes por Carretera (Roadtrip)
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">
                Calculadora de Peajes RD
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Estima el costo exacto de los peajes de autopistas dominicanas antes de encender el motor. Organiza tu presupuesto de combustible y peajes cómodamente.
              </p>
            </div>
          </section>

          {/* Body */}
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-5xl">
              {/* Mapa de Peajes Interactivo */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
                      <Compass className="h-5 w-5 text-primary" /> Visualizador de Estaciones y Trazado de Ruta
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Haz clic en los marcadores de las casetas para consultar el desglose exacto de precios.
                    </p>
                  </div>
                  <Badge variant="outline" className="border-primary/30 text-primary">
                    {currentRoute.tolls.length} Estaciones en esta vía
                  </Badge>
                </div>
                <TollsMap selectedRouteId={selectedRouteId} vehicleCategory={vehicleCategory} />
              </div>

              <div className="grid lg:grid-cols-12 gap-8 items-start">
                
                {/* Inputs (Col 5) */}
                <div className="lg:col-span-5 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Configurar Trayecto</CardTitle>
                      <CardDescription>Selecciona tu ruta y categoría de vehículo</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Autopista / Destino</label>
                        <select 
                          className="w-full bg-background border border-input text-xs rounded p-2"
                          value={selectedRouteId}
                          onChange={(e) => setSelectedRouteId(e.target.value)}
                        >
                          {routes.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Categoría de Vehículo</label>
                        <select 
                          className="w-full bg-background border border-input text-xs rounded p-2"
                          value={vehicleCategory}
                          onChange={(e) => setVehicleCategory(Number(e.target.value))}
                        >
                          <option value={1}>Categoría 1: Automóviles, Jeepetas, Camionetas (2 Ejes)</option>
                          <option value={2}>Categoría 2: Minibuses, Autobuses pequeños (2 Ejes de doble rueda)</option>
                          <option value={3}>Categoría 3: Camiones de 2 Ejes / Autobuses Grandes</option>
                          <option value={4}>Categoría 4: Camiones Pesados (3 Ejes o más)</option>
                        </select>
                      </div>

                    </CardContent>
                  </Card>

                  {/* Paso Rapido info */}
                  <Card className="border-blue-500/20 bg-blue-500/5 text-xs text-muted-foreground">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
                        <CreditCard className="h-4.5 w-4.5" />
                        Paso Rápido RD
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p>
                        <strong>Paso Rápido:</strong> Es el sistema de peaje electrónico prepagado de la República Dominicana. Permite cruzar los peajes sin detenerse a pagar en efectivo, utilizando una etiqueta electrónica (tag) adherida al parabrisas.
                      </p>
                      <p>
                        Puedes adquirir el kit en las oficinas de Fideicomiso RD Vial o estaciones autorizadas y recargarlo en línea para mayor fluidez.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Outputs Receipts Style (Col 7) */}
                <div className="lg:col-span-7">
                  <Card className="border-2 border-dashed border-border shadow-md">
                    <CardHeader className="text-center pb-2 bg-muted/40">
                      <CardTitle className="font-mono text-base uppercase tracking-wider">Cálculo de Peajes (RD Vial)</CardTitle>
                      <CardDescription className="text-[10px] font-mono">FIDEICOMISO RD VIAL • SIMULACIÓN</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4 font-mono text-xs text-muted-foreground">
                      
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground font-sans block">Ruta Seleccionada:</span>
                        <p className="text-foreground font-sans font-semibold">{currentRoute.name}</p>
                        <p className="text-[10px] text-muted-foreground font-sans leading-relaxed">{currentRoute.description}</p>
                      </div>

                      <div className="border-t border-border pt-4 space-y-2">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground font-sans block mb-2">Desglose de Estaciones:</span>
                        {currentRoute.tolls.map((toll, idx) => (
                          <div key={idx} className="flex justify-between items-center py-1">
                            <span>{toll.name}</span>
                            <span className="text-foreground">RD$ {getTollPrice(toll).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t-2 border-double border-foreground pt-4 flex justify-between text-base text-foreground font-bold">
                        <span>TOTAL PEAJES</span>
                        <span>RD$ {totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>

                      <div className="pt-6 text-center text-[10px] space-y-2 border-t border-border/40 font-sans">
                        <p className="flex justify-center items-center gap-1.5 text-emerald-500 font-bold">
                          <ShieldCheck className="h-3.5 w-3.5" /> Tarifas Vigentes de Ley
                        </p>
                        <p>Las tarifas corresponden a los precios fijados por RD Vial para las autopistas estatales. Recuerda llevar efectivo dominicano si no cuentas con Paso Rápido.</p>
                      </div>

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
