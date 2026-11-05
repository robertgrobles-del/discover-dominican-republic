import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Wifi, Shield, ArrowRight, QrCode, Smartphone, 
  HelpCircle, CheckCircle, Info, Sparkles, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { CheckoutModal } from "@/components/CheckoutModal";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n";
import { usePageContent } from "@/lib/pageContent";

const plans = [
  {
    id: "esim-altice-easy",
    operator: "Altice",
    name: "Altice Conectado Local",
    price: 15.00,
    gb: "10 GB",
    days: "7 Días",
    description: "Excelente cobertura en zonas urbanas y resorts. Incluye 50 minutos locales gratis.",
    color: "border-sky-500/20 bg-sky-500/5",
    badgeColor: "bg-sky-500 text-white"
  },
  {
    id: "esim-altice-max",
    operator: "Altice",
    name: "Altice Viajero Pro",
    price: 25.00,
    gb: "Ilimitado",
    days: "15 Días",
    description: "Datos ilimitados para compartir y navegar. Ideal para recorrer todo el país sin límites.",
    color: "border-sky-600/30 bg-sky-600/10",
    badgeColor: "bg-sky-600 text-white",
    popular: true
  },
  {
    id: "esim-claro-easy",
    operator: "Claro",
    name: "Claro Dominicana Easy",
    price: 18.00,
    gb: "12 GB",
    days: "7 Días",
    description: "La mayor cobertura nacional, ideal para ecoturismo y zonas montañosas remotas.",
    color: "border-red-500/20 bg-red-500/5",
    badgeColor: "bg-red-500 text-white"
  },
  {
    id: "esim-claro-premium",
    operator: "Claro",
    name: "Claro Ilimitado Premium",
    price: 28.00,
    gb: "Ilimitado",
    days: "15 Días",
    description: "Conexión premium 5G ilimitada en todo el territorio. Máxima velocidad de subida.",
    color: "border-red-600/30 bg-red-600/10",
    badgeColor: "bg-red-600 text-white",
    popular: false
  }
];

const compatibilityList = {
  Apple: ["iPhone 11 o posterior", "iPhone SE (2ª gen) o posterior", "iPad Pro o posterior"],
  Samsung: ["Galaxy S20 o posterior", "Galaxy Fold / Z Flip o posterior", "Galaxy Note 20"],
  Google: ["Pixel 4 o posterior", "Pixel 4a o posterior"],
  Otros: ["Huawei P40 o posterior", "Xiaomi 12T Pro o posterior", "Oppo Find X3 Pro"]
};

// Antes la página /esim; ahora es una sección de /conectividad. Conserva su clave de contenido editable.
export function ESimSection() {
  const pc = usePageContent("e-sim-turista");
  const plans = pc.data("plans", __pcData.plans);
  const compatibilityList = pc.data("compatibilityList", __pcData.compatibilityList);
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Checkout Modal State
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  
  // Operator Filter
  const [operatorFilter, setOperatorFilter] = useState<"Todos" | "Claro" | "Altice">("Todos");
  
  // Device compatibility check form
  const [brand, setBrand] = useState("Apple");
  const [model, setModel] = useState("");
  const [isCompatible, setIsCompatible] = useState<boolean | null>(null);

  const checkCompatibility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!model.trim()) {
      toast.error("Por favor escribe el modelo de tu dispositivo móvil.");
      return;
    }
    // Simple mock logic for compatibility
    setIsCompatible(true);
    toast.success("¡Dispositivo compatible con eSIM digital!");
  };

  const handleBuyPlan = (plan: any) => {
    if (!user) {
      toast.error("Inicia sesión para comprar tu plan de datos eSIM.");
      window.location.href = "/login";
      return;
    }

    setSelectedPlan({
      id: plan.id,
      name: `eSIM ${plan.operator} - ${plan.name} (${plan.days})`,
      type: "producto",
      price: plan.price,
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80"
    });
    setCheckoutOpen(true);
  };

  const filteredPlans = plans.filter(p => operatorFilter === "Todos" || p.operator === operatorFilter);

  return (
    <>
        <section id="esim" className="py-16 border-t border-border scroll-mt-24">
          <div className="container mx-auto px-4 lg:px-8">
            
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
              <Badge className="bg-primary/20 text-primary border-primary/30 py-1 px-3 text-xs gap-1.5 uppercase font-bold tracking-wider">
                <Wifi className="h-4 w-4" /> {t("logistica.simCard") || "eSIM Turística Virtual"}
              </Badge>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">{pc.tx("h1.1", "Internet 5G al Instante,")}{" "}<span className="text-primary">{pc.tx("span.1", "Sin Esperas")}</span>
              </h2>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{pc.tx("p.1", "Compra y configura tu eSIM digital antes de abordar el avión. Al aterrizar en República Dominicana, actívala escaneando el código QR recibido y conéctate inmediatamente a las redes de Claro o Altice.")}</p>
            </div>

            {/* Grid Content: Plans vs Compatibility */}
            <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto items-start">
              
              {/* Left Side: Plans Selector & List */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex justify-between items-center bg-card/40 border p-4 rounded-xl">
                  <span className="text-sm font-bold text-foreground">{pc.tx("span.2", "Filtrar por Operador:")}</span>
                  <div className="flex gap-2">
                    {(["Todos", "Claro", "Altice"] as const).map(op => (
                      <Button
                        key={op}
                        variant={operatorFilter === op ? "default" : "outline"}
                        size="sm"
                        onClick={() => setOperatorFilter(op)}
                        className="text-xs font-bold px-3 py-1"
                      >
                        {op}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {filteredPlans.map(plan => (
                    <Card key={plan.id} className={`border flex flex-col justify-between overflow-hidden group ${plan.color}`}>
                      <div className="p-6 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge className={`${plan.badgeColor} text-3xs font-extrabold`}>
                              {plan.operator}
                            </Badge>
                            <h2 className="h3 font-display text-lg font-bold text-foreground mt-2">{plan.name}</h2>
                          </div>
                          {plan.popular && (
                            <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 text-3xs font-extrabold uppercase tracking-wide">{pc.tx("Badge.1", "Más Recomendado")}</Badge>
                          )}
                        </div>

                        <div className="flex gap-4 items-baseline">
                          <span className="font-mono text-3xl font-extrabold text-foreground">${plan.price.toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground uppercase font-bold">{plan.days} / {plan.gb}</span>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {plan.description}
                        </p>

                        <div className="space-y-1.5 pt-2 border-t border-border">
                          <div className="flex items-center gap-1.5 text-xs">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span>{pc.tx("span.3", "Velocidad de red 4G/5G LTE")}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span>{pc.tx("span.4", "Compartir datos (Hotspot) habilitado")}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span>{pc.tx("span.5", "Recibes el QR vía email en segundos")}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 pt-0">
                        <Button className="w-full font-bold gap-2" onClick={() => handleBuyPlan(plan)}>{pc.tx("Button.1", "Comprar eSIM")}{" "}<ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Right Side: Device Compatibility Form */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="bg-card/50 border">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Smartphone className="h-5 w-5 text-primary" />{" "}{pc.tx("CardTitle.1", "¿Es compatible mi móvil?")}</CardTitle>
                    <CardDescription className="text-xs">{pc.tx("CardDescription.1", "Revisa si tu dispositivo es compatible con la tecnología eSIM.")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form onSubmit={checkCompatibility} className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">{pc.tx("label.1", "Marca")}</label>
                        <select
                          value={brand}
                          onChange={(e) => setBrand(e.target.value)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          title={pc.t("select.title.1", "Marca del dispositivo")}
                        >
                          <option value="Apple">{pc.tx("option.1", "Apple (iPhone)")}</option>
                          <option value="Samsung">{pc.tx("option.2", "Samsung")}</option>
                          <option value="Google">{pc.tx("option.3", "Google Pixel")}</option>
                          <option value="Otros">{pc.tx("option.4", "Otros (Xiaomi, Huawei, Oppo)")}</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">{pc.tx("label.2", "Modelo exacto")}</label>
                        <Input
                          type="text"
                          placeholder={pc.t("Input.placeholder.1", "Ej: iPhone 14 Pro Max")}
                          value={model}
                          onChange={(e) => setModel(e.target.value)}
                          required
                          className="bg-background"
                        />
                      </div>

                      <Button type="submit" size="sm" className="w-full font-bold">{pc.tx("Button.2", "Verificar Compatibilidad")}</Button>
                    </form>

                    {isCompatible !== null && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-foreground flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">{pc.tx("p.2", "¡Tu móvil es compatible!")}</p>
                          <p className="text-muted-foreground mt-0.5">{pc.tx("p.3", "Puedes proceder con la compra de cualquier paquete eSIM.")}</p>
                        </div>
                      </div>
                    )}

                    {/* Quick Guide */}
                    <div className="pt-2 border-t border-border space-y-2">
                      <h3 className="h4 text-xs font-bold uppercase text-muted-foreground">{pc.tx("h4.1", "Listado de Referencia eSIM:")}</h3>
                      <div className="space-y-2 text-2xs text-muted-foreground max-h-32 overflow-y-auto pr-1">
                        {Object.entries(compatibilityList).map(([b, models]) => (
                          <div key={b}>
                            <span className="font-bold text-foreground">{b}:</span> {models.join(", ")}.
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="bg-primary/5 border border-primary/20">
                  <CardContent className="p-4 flex gap-3 text-xs text-foreground">
                    <Info className="h-5 w-5 text-primary shrink-0" />
                    <div className="space-y-1">
                      <span className="font-bold">{pc.tx("span.6", "¿Cómo se activa?")}</span>
                      <p className="text-muted-foreground leading-normal">{pc.tx("p.4", "1. Completa la compra.")}<br />{pc.tx("p.5", "2. Recibe un código QR en tu email.")}<br />{pc.tx("p.6", "3. Entra a Ajustes > Datos móviles > Añadir plan.")}<br />{pc.tx("p.7", "4. Escanea el código QR y listo.")}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>

          </div>
        </section>

        
        {/* Payment Modal */}
        <CheckoutModal 
          isOpen={checkoutOpen} 
          onClose={() => setCheckoutOpen(false)} 
          item={selectedPlan} 
        />
    </>
  );
}

// Datos del módulo editables desde el panel (ver pc.data en src/lib/pageContent.ts).
const __pcData = { plans, compatibilityList };
