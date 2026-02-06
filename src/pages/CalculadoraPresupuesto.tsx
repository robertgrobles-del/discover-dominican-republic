import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Backpack, Hotel, Gem, Calendar, Users, Utensils, Car, Ticket, Plane,
  Calculator, Download, Share2, ChevronDown, ChevronUp, DollarSign, PiggyBank,
  Bed, Coffee, Bus, Camera, ShoppingBag, Stethoscope, Wifi, CreditCard
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { exportItineraryToPDF } from "@/components/ui/export-pdf";
import { shareViaWhatsApp, shareViaEmail } from "@/lib/share-utils";
import { ProgressBar } from "@/components/ui/progress-bar";
import { toast } from "sonner";

type TravelStyle = "mochilero" | "estandar" | "lujo";

interface StyleOption {
  id: TravelStyle;
  name: string;
  description: string;
  icon: typeof Backpack;
  multiplier: number;
  color: string;
}

const travelStyles: StyleOption[] = [
  { id: "mochilero", name: "Mochilero", description: "Hostales, transporte público y comida local.", icon: Backpack, multiplier: 0.5, color: "text-emerald" },
  { id: "estandar", name: "Estándar", description: "Hoteles 3-4★, tours y restaurantes variados.", icon: Hotel, multiplier: 1, color: "text-primary" },
  { id: "lujo", name: "Lujo", description: "Resorts 5★, transporte privado y experiencias premium.", icon: Gem, multiplier: 2.5, color: "text-gold" },
];

interface ExpenseCategory {
  id: string;
  name: string;
  icon: typeof Bed;
  base: number;
  perPerson: boolean;
  description: string;
}

const expenseCategories: ExpenseCategory[] = [
  { id: "alojamiento", name: "Alojamiento", icon: Bed, base: 80, perPerson: false, description: "Hoteles, hostales, Airbnb" },
  { id: "comida", name: "Comidas", icon: Utensils, base: 35, perPerson: true, description: "Desayuno, almuerzo, cena" },
  { id: "transporte", name: "Transporte", icon: Car, base: 25, perPerson: false, description: "Taxis, guaguas, alquiler" },
  { id: "actividades", name: "Actividades", icon: Camera, base: 40, perPerson: true, description: "Tours, excursiones, entradas" },
  { id: "vuelos", name: "Vuelos", icon: Plane, base: 350, perPerson: true, description: "Pasajes aéreos ida y vuelta" },
  { id: "compras", name: "Compras", icon: ShoppingBag, base: 20, perPerson: true, description: "Souvenirs y recuerdos" },
  { id: "seguro", name: "Seguro de viaje", icon: Stethoscope, base: 8, perPerson: true, description: "Cobertura médica y cancelación" },
  { id: "comunicacion", name: "Internet/Datos", icon: Wifi, base: 5, perPerson: true, description: "SIM local o roaming" },
  { id: "propinas", name: "Propinas y extras", icon: CreditCard, base: 10, perPerson: false, description: "Propinas y gastos imprevistos" },
];

export default function CalculadoraPresupuesto() {
  const [style, setStyle] = useState<TravelStyle>("estandar");
  const [days, setDays] = useState(7);
  const [travelers, setTravelers] = useState(2);
  const [includedCategories, setIncludedCategories] = useState<Record<string, boolean>>({
    alojamiento: true,
    comida: true,
    transporte: true,
    actividades: true,
    vuelos: true,
    compras: false,
    seguro: true,
    comunicacion: true,
    propinas: true,
  });
  const [showDetails, setShowDetails] = useState(false);
  const [customBudget, setCustomBudget] = useState<number | null>(null);

  const styleData = travelStyles.find((s) => s.id === style)!;

  const breakdown = useMemo(() => {
    const mult = styleData.multiplier;
    const result: Record<string, number> = {};
    let total = 0;

    expenseCategories.forEach((cat) => {
      if (includedCategories[cat.id]) {
        let cost: number;
        if (cat.id === "vuelos") {
          // Flights don't scale with days
          cost = cat.base * mult * travelers;
        } else if (cat.perPerson) {
          cost = cat.base * mult * days * travelers;
        } else {
          cost = cat.base * mult * days;
        }
        result[cat.id] = cost;
        total += cost;
      } else {
        result[cat.id] = 0;
      }
    });

    result.total = total;
    return result;
  }, [style, days, travelers, includedCategories, styleData]);

  const costPerPerson = breakdown.total / travelers;
  const costPerDay = breakdown.total / days;

  const toggleCategory = (id: string) => {
    setIncludedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExportPDF = () => {
    const data: Record<string, unknown> = {
      "Configuración del viaje": {
        "Estilo de viaje": styleData.name,
        "Duración": `${days} días`,
        "Viajeros": `${travelers} personas`,
      },
      "Desglose de gastos": {},
    };

    expenseCategories.forEach((cat) => {
      if (includedCategories[cat.id]) {
        (data["Desglose de gastos"] as Record<string, string>)[cat.name] = `$${Math.round(breakdown[cat.id]).toLocaleString()}`;
      }
    });

    (data as Record<string, unknown>)["Totales"] = {
      "Total estimado": `$${Math.round(breakdown.total).toLocaleString()}`,
      "Por persona": `$${Math.round(costPerPerson).toLocaleString()}`,
      "Por día": `$${Math.round(costPerDay).toLocaleString()}`,
    };

    const content = { title: "Presupuesto de Viaje a RD", data };
    
    // Use similar logic to exportItineraryToPDF
    const printContent = generateBudgetPDF(content);
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 250);
    }
    toast.success("Generando PDF...");
  };

  const handleShareWhatsApp = () => {
    let text = `💰 *Presupuesto de Viaje a República Dominicana*\n\n`;
    text += `🎒 Estilo: ${styleData.name}\n`;
    text += `📅 Duración: ${days} días\n`;
    text += `👥 Viajeros: ${travelers} personas\n\n`;
    text += `*Desglose:*\n`;
    
    expenseCategories.forEach((cat) => {
      if (includedCategories[cat.id] && breakdown[cat.id] > 0) {
        text += `• ${cat.name}: $${Math.round(breakdown[cat.id]).toLocaleString()}\n`;
      }
    });
    
    text += `\n💵 *Total: $${Math.round(breakdown.total).toLocaleString()}*\n`;
    text += `👤 Por persona: $${Math.round(costPerPerson).toLocaleString()}\n\n`;
    text += `✈️ Calculado con RD Turismo`;
    
    shareViaWhatsApp(text);
  };

  const budgetComparison = customBudget ? ((breakdown.total / customBudget) * 100) : null;

  return (
    <PageTransition>
      <SEOHead
        title="Calculadora de Presupuesto - Planifica tu Viaje a RD"
        description="Calcula el presupuesto detallado para tu viaje a República Dominicana. Personaliza categorías, estilo de viaje y obtén estimados precisos."
        keywords="presupuesto viaje, calculadora, República Dominicana, costo vacaciones, planificar viaje, gastos turismo"
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
              Calculadora de Presupuesto
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Planifica tu aventura con un presupuesto personalizado. Ajusta cada categoría según tus necesidades.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Inputs */}
            <div className="lg:col-span-7 space-y-6">
              {/* Travel Style */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Gem className="h-5 w-5 text-primary" />
                  Estilo de viaje
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {travelStyles.map((option) => (
                    <motion.button
                      key={option.id}
                      onClick={() => setStyle(option.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                        style === option.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className={`mb-3 p-3 rounded-full ${
                        style === option.id ? "bg-primary/10" : "bg-muted"
                      }`}>
                        <option.icon className={`h-6 w-6 ${style === option.id ? option.color : "text-muted-foreground"}`} />
                      </div>
                      <p className="font-bold text-sm mb-1">{option.name}</p>
                      <p className="text-xs text-muted-foreground text-center">{option.description}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Sliders */}
              <div className="bg-card rounded-2xl p-6 border border-border space-y-8">
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
                </div>
              </div>

              {/* Expense Categories */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Categorías de gastos</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                    className="gap-1"
                  >
                    {showDetails ? "Ocultar" : "Mostrar"} detalles
                    {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {expenseCategories.map((cat) => (
                    <div
                      key={cat.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        includedCategories[cat.id]
                          ? "border-primary/30 bg-primary/5"
                          : "border-border bg-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <cat.icon className={`h-5 w-5 ${
                          includedCategories[cat.id] ? "text-primary" : "text-muted-foreground"
                        }`} />
                        <div>
                          <p className="font-medium text-sm">{cat.name}</p>
                          {showDetails && (
                            <p className="text-xs text-muted-foreground">{cat.description}</p>
                          )}
                        </div>
                      </div>
                      <Switch
                        checked={includedCategories[cat.id]}
                        onCheckedChange={() => toggleCategory(cat.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Compare with Budget */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <PiggyBank className="h-5 w-5 text-primary" />
                  Comparar con tu presupuesto
                </h2>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="number"
                      placeholder="Tu presupuesto máximo"
                      value={customBudget || ""}
                      onChange={(e) => setCustomBudget(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                {budgetComparison !== null && (
                  <div className="mt-4">
                    <ProgressBar
                      value={Math.min(budgetComparison, 100)}
                      label={budgetComparison <= 100 ? "Dentro del presupuesto" : "Excede el presupuesto"}
                      variant={budgetComparison <= 100 ? "gradient" : "default"}
                    />
                    {budgetComparison > 100 && (
                      <p className="text-sm text-destructive mt-2">
                        Excedes tu presupuesto por ${Math.round(breakdown.total - customBudget!).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
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
                  <h2 className="text-lg font-bold">Tu Presupuesto</h2>
                  <Badge className={`${styleData.color} bg-current/10`}>{styleData.name}</Badge>
                </div>

                {/* Total */}
                <div className="text-center mb-6 py-6 bg-background/50 rounded-xl">
                  <p className="text-muted-foreground text-sm mb-1">Total Estimado</p>
                  <p className="font-display text-5xl font-bold text-foreground">
                    ${Math.round(breakdown.total).toLocaleString()}
                  </p>
                  <div className="flex justify-center gap-6 mt-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Por persona</p>
                      <p className="text-primary font-bold">${Math.round(costPerPerson).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Por día</p>
                      <p className="text-primary font-bold">${Math.round(costPerDay).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="space-y-2 mb-6 max-h-[300px] overflow-y-auto pr-2">
                  {expenseCategories.map((cat) => {
                    if (!includedCategories[cat.id]) return null;
                    const percentage = (breakdown[cat.id] / breakdown.total) * 100;
                    return (
                      <div key={cat.id} className="py-2 border-b border-border last:border-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="flex items-center gap-2 text-sm text-muted-foreground">
                            <cat.icon className="h-4 w-4" /> {cat.name}
                          </span>
                          <span className="font-bold text-sm">${Math.round(breakdown[cat.id]).toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            className="h-full bg-primary rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button className="flex-1 gap-2" onClick={handleExportPDF}>
                    <Download className="h-4 w-4" />
                    Guardar PDF
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleShareWhatsApp}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-4 text-center">
                  *Precios estimados en USD. Varían según temporada y disponibilidad.
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

function generateBudgetPDF(content: { title: string; data: Record<string, unknown> }): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${content.title}</title>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1a1a1a; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0ea5e9; padding-bottom: 20px; }
        .header h1 { font-size: 28px; color: #0ea5e9; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 18px; color: #0ea5e9; margin-bottom: 10px; border-bottom: 1px solid #e5e5e5; padding-bottom: 5px; }
        .item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dotted #e5e5e5; }
        .total { font-size: 24px; font-weight: bold; color: #0ea5e9; text-align: center; margin-top: 20px; padding: 15px; background: #f0f9ff; border-radius: 8px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header"><h1>${content.title}</h1><p>Generado el ${new Date().toLocaleDateString("es-ES")}</p></div>
      ${Object.entries(content.data).map(([section, items]) => `
        <div class="section">
          <h2 class="section-title">${section}</h2>
          ${Object.entries(items as Record<string, string>).map(([key, value]) => `
            <div class="item"><span>${key}</span><span style="font-weight: 500;">${value}</span></div>
          `).join("")}
        </div>
      `).join("")}
      <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px;">
        Documento generado por RD Turismo • www.rdturismo.com
      </div>
    </body>
    </html>
  `;
}
