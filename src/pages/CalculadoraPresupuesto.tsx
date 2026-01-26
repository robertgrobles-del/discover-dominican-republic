import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Backpack, Hotel, Gem, Calendar, Users, Utensils, Car, Ticket,
  Calculator, Download, Share2, RefreshCw, CheckCircle
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";

type TravelStyle = "mochilero" | "estandar" | "lujo";

interface StyleOption {
  id: TravelStyle;
  name: string;
  description: string;
  icon: typeof Backpack;
  multiplier: number;
}

const travelStyles: StyleOption[] = [
  { id: "mochilero", name: "Mochilero", description: "Ahorro máximo, hostales y transporte público.", icon: Backpack, multiplier: 0.5 },
  { id: "estandar", name: "Estándar", description: "Hoteles 3-4 estrellas, mix de transporte.", icon: Hotel, multiplier: 1 },
  { id: "lujo", name: "Lujo", description: "Resorts 5 estrellas, transporte privado y tours.", icon: Gem, multiplier: 2.5 },
];

const baseCosts = {
  alojamiento: 80,
  comida: 35,
  transporte: 25,
  actividades: 40,
};

export default function CalculadoraPresupuesto() {
  const [style, setStyle] = useState<TravelStyle>("estandar");
  const [days, setDays] = useState(7);
  const [travelers, setTravelers] = useState(2);
  const [includeFood, setIncludeFood] = useState(true);
  const [includeTransport, setIncludeTransport] = useState(true);
  const [includeActivities, setIncludeActivities] = useState(true);

  const styleData = travelStyles.find((s) => s.id === style)!;

  const breakdown = useMemo(() => {
    const mult = styleData.multiplier;
    const alojamiento = baseCosts.alojamiento * mult * days;
    const comida = includeFood ? baseCosts.comida * mult * days * travelers : 0;
    const transporte = includeTransport ? baseCosts.transporte * mult * days : 0;
    const actividades = includeActivities ? baseCosts.actividades * mult * days * travelers : 0;
    const total = alojamiento + comida + transporte + actividades;
    return { alojamiento, comida, transporte, actividades, total };
  }, [style, days, travelers, includeFood, includeTransport, includeActivities, styleData]);

  const costPerPerson = breakdown.total / travelers;

  return (
    <PageTransition>
      <SEOHead
        title="Calculadora de Presupuesto - Planifica tu Viaje"
        description="Calcula el presupuesto estimado para tu viaje a República Dominicana. Personaliza días, estilo de viaje y actividades."
        keywords="presupuesto viaje, calculadora, República Dominicana, costo vacaciones, planificar viaje"
      />
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 lg:px-8 py-10">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 text-primary font-medium text-sm mb-2">
              <Calculator className="h-4 w-4" />
              <span>Herramienta de Planificación</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Calculadora de Presupuesto RD
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Planifica tu aventura ideal en República Dominicana. Ingresa tus detalles y obtén un estimado instantáneo de tus gastos.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Inputs */}
            <div className="lg:col-span-7 space-y-6">
              {/* Travel Style */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Gem className="h-5 w-5 text-primary" />
                  Elige tu estilo de viaje
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {travelStyles.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setStyle(option.id)}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                        style === option.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className={`mb-3 p-3 rounded-full ${
                        style === option.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        <option.icon className="h-6 w-6" />
                      </div>
                      <p className="font-bold text-sm mb-1">{option.name}</p>
                      <p className="text-xs text-muted-foreground text-center">{option.description}</p>
                      {style === option.id && (
                        <CheckCircle className="absolute top-3 right-3 h-5 w-5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders */}
              <div className="bg-card rounded-2xl p-6 border border-border space-y-8">
                {/* Duration */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="font-bold flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Duración del viaje
                    </label>
                    <Badge className="bg-primary/10 text-primary border-primary/30">{days} Días</Badge>
                  </div>
                  <Slider
                    value={[days]}
                    onValueChange={(v) => setDays(v[0])}
                    min={1}
                    max={30}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 día</span>
                    <span>30 días</span>
                  </div>
                </div>

                {/* Travelers */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="font-bold flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Número de viajeros
                    </label>
                    <Badge className="bg-primary/10 text-primary border-primary/30">{travelers} Personas</Badge>
                  </div>
                  <Slider
                    value={[travelers]}
                    onValueChange={(v) => setTravelers(v[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 persona</span>
                    <span>10 personas</span>
                  </div>
                </div>
              </div>

              {/* Extras */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h2 className="text-lg font-bold mb-4">Incluir en el presupuesto</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    onClick={() => setIncludeFood(!includeFood)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      includeFood ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <Utensils className={`h-5 w-5 ${includeFood ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="font-medium text-sm">Comidas</span>
                  </button>
                  <button
                    onClick={() => setIncludeTransport(!includeTransport)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      includeTransport ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <Car className={`h-5 w-5 ${includeTransport ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="font-medium text-sm">Transporte</span>
                  </button>
                  <button
                    onClick={() => setIncludeActivities(!includeActivities)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      includeActivities ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <Ticket className={`h-5 w-5 ${includeActivities ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="font-medium text-sm">Actividades</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Results */}
            <div className="lg:col-span-5">
              <motion.div
                key={`${style}-${days}-${travelers}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-primary/10 via-card to-card rounded-2xl p-6 border border-primary/20 sticky top-24"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold">Tu Presupuesto Estimado</h2>
                  <Badge className="bg-primary text-primary-foreground">{styleData.name}</Badge>
                </div>

                {/* Total */}
                <div className="text-center mb-6 py-6 bg-background/50 rounded-xl">
                  <p className="text-muted-foreground text-sm mb-1">Total Estimado</p>
                  <p className="font-display text-5xl font-bold text-foreground">
                    ${breakdown.total.toLocaleString()}
                  </p>
                  <p className="text-primary font-medium mt-2">
                    ${Math.round(costPerPerson).toLocaleString()} por persona
                  </p>
                </div>

                {/* Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Hotel className="h-4 w-4" /> Alojamiento
                    </span>
                    <span className="font-bold">${Math.round(breakdown.alojamiento).toLocaleString()}</span>
                  </div>
                  {includeFood && (
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Utensils className="h-4 w-4" /> Comidas
                      </span>
                      <span className="font-bold">${Math.round(breakdown.comida).toLocaleString()}</span>
                    </div>
                  )}
                  {includeTransport && (
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Car className="h-4 w-4" /> Transporte
                      </span>
                      <span className="font-bold">${Math.round(breakdown.transporte).toLocaleString()}</span>
                    </div>
                  )}
                  {includeActivities && (
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Ticket className="h-4 w-4" /> Actividades
                      </span>
                      <span className="font-bold">${Math.round(breakdown.actividades).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button className="flex-1 gap-2">
                    <Download className="h-4 w-4" />
                    Guardar PDF
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-4 text-center">
                  *Estos son precios estimados y pueden variar según temporada y disponibilidad.
                </p>
              </motion.div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
