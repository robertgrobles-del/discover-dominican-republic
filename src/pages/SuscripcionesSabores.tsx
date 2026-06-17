import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Package, Coffee, Gift, Truck, MapPin, 
  CheckCircle, ArrowRight, Sparkles, DollarSign, Calendar
} from "lucide-react";
import { toast } from "sonner";
import { CheckoutModal } from "@/components/CheckoutModal";
import { useAuth } from "@/hooks/useAuth";

const boxes = [
  {
    id: "sub-caja-antillana",
    name: "Caja Antillana",
    price: 29.99,
    description: "Una selección dulce del Caribe. Incluye dulces de leche, chocolate artesanal, galletas tradicionales y golosinas típicas.",
    items: ["Dulces de leche de Las Marías", "Chocolates Kahkow 70%", "Galletas de manteca", "Sazón criollo tradicional"],
    badge: "Más Vendida",
    color: "from-amber-500/10 to-orange-500/10 border-amber-500/30",
    textColor: "text-amber-500",
    image: "https://images.unsplash.com/photo-1540552980157-21d2a565c52b?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "sub-caja-cibaena",
    name: "Caja Cibaeña",
    price: 49.99,
    description: "El auténtico sabor del Cibao en tu mesa. Café de especialidad de altura, casabe crujiente y condimentos para el clásico sazón.",
    items: ["Café Monte Alto Orgánico (1lb)", "Casabe natural de Monción", "Dulce de guayaba", "Orégano poleo cibaeño"],
    badge: "Recomendada",
    color: "from-green-500/10 to-emerald-500/10 border-green-500/30",
    textColor: "text-green-500",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "sub-caja-quisqueya",
    name: "Caja Quisqueya Premium",
    price: 79.99,
    description: "La experiencia gourmet definitiva. Edición de lujo con ron añejo dominicano, cigarros hechos a mano y café premium.",
    items: ["Ron Barceló Imperial (350ml)", "2 Cigarros Premium Santiago", "Café de Especialidad Jarabacoa", "Cacao Orgánico Fino de Aroma"],
    badge: "Premium",
    color: "from-violet-500/10 to-indigo-500/10 border-violet-500/30",
    textColor: "text-violet-500",
    image: "https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?w=600&auto=format&fit=crop&q=80"
  }
];

export default function SuscripcionesSabores() {
  const { user } = useAuth();
  
  // Checkout Modal State
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedBox, setSelectedBox] = useState<any>(null);
  
  // Customization States
  const [subscriptionTerm, setSubscriptionTerm] = useState<"monthly" | "quarterly" | "annual">("monthly");
  const [shippingCountry, setShippingCountry] = useState("USA");
  const [shippingAddress, setShippingAddress] = useState("");

  const getPriceFactor = () => {
    if (subscriptionTerm === "quarterly") return 0.9; // 10% off
    if (subscriptionTerm === "annual") return 0.8; // 20% off
    return 1.0;
  };

  const getShippingCost = () => {
    if (shippingCountry === "USA") return 15.00;
    if (shippingCountry === "Spain") return 22.00;
    if (shippingCountry === "PR") return 10.00;
    return 25.00; // Canada / Other
  };

  const handleSubscribe = (box: any) => {
    if (!user) {
      toast.error("Por favor inicia sesión para adquirir una suscripción.");
      window.location.href = "/login";
      return;
    }

    const discountedBasePrice = Number((box.price * getPriceFactor()).toFixed(2));
    const shipping = getShippingCost();
    
    setSelectedBox({
      id: box.id,
      name: `${box.name} (${subscriptionTerm === "monthly" ? "Mensual" : subscriptionTerm === "quarterly" ? "Trimestral (-10%)" : "Anual (-20%)"})`,
      type: "producto",
      price: discountedBasePrice + shipping,
      image: box.image
    });
    setCheckoutOpen(true);
  };

  return (
    <PageTransition>
      <SEOHead
        title="Suscripción Sabores RD | Descubre RD"
        description="Recibe una caja mensual de productos dominicanos auténticos directos a tu puerta. Dulces criollos, café orgánico, ron premium y más."
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8">
            
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
              <Badge className="bg-primary/20 text-primary border-primary/30 py-1 px-3 text-xs gap-1.5 uppercase font-bold tracking-wider">
                <Gift className="h-4 w-4" /> Suscripción Sabores RD
              </Badge>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground">
                El Sabor de Tu Tierra, <span className="text-primary">Mensual a tu Puerta</span>
              </h1>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                Diseñado especialmente para la diáspora dominicana y los amantes del Caribe. Suscríbete y recibe periódicamente cajas repletas de antojos tradicionales, café tostado artesanal y tesoros dominicanos.
              </p>
            </div>

            {/* Config Bar */}
            <Card className="border border-border bg-card/60 backdrop-blur-md p-6 mb-12 max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-6 items-center">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">1. Frecuencia de Envío</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant={subscriptionTerm === "monthly" ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setSubscriptionTerm("monthly")}
                      className="text-xs font-bold"
                    >
                      Mensual
                    </Button>
                    <Button 
                      variant={subscriptionTerm === "quarterly" ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setSubscriptionTerm("quarterly")}
                      className="text-xs font-bold"
                    >
                      Trimestral
                    </Button>
                    <Button 
                      variant={subscriptionTerm === "annual" ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setSubscriptionTerm("annual")}
                      className="text-xs font-bold"
                    >
                      Anual
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">2. Destino del Envío</label>
                  <select
                    value={shippingCountry}
                    onChange={(e) => setShippingCountry(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    title="Destino del Envío"
                  >
                    <option value="USA">Estados Unidos (US$ 15 envío)</option>
                    <option value="PR">Puerto Rico (US$ 10 envío)</option>
                    <option value="Spain">España / Europa (US$ 22 envío)</option>
                    <option value="Canada">Canadá / Otros (US$ 25 envío)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">3. Descuento Aplicado</label>
                  <div className="p-2.5 bg-secondary/50 rounded-lg text-xs font-mono text-primary flex items-center justify-between border border-border">
                    <span>Ahorro del Término:</span>
                    <span className="font-bold">
                      {subscriptionTerm === "monthly" ? "0%" : subscriptionTerm === "quarterly" ? "10% OFF" : "20% OFF"}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Boxes Cards Grid */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {boxes.map(box => {
                const discountedPrice = box.price * getPriceFactor();
                const shipping = getShippingCost();
                const total = discountedPrice + shipping;

                return (
                  <Card key={box.id} className={`overflow-hidden border bg-card/45 flex flex-col justify-between group ${box.color}`}>
                    <div className="space-y-4">
                      {/* Box Image */}
                      <div className="aspect-[16/10] overflow-hidden relative">
                        <img 
                          src={box.image} 
                          alt={box.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        <Badge className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm border-white/10 text-[9px] uppercase font-bold tracking-wider">
                          {box.badge}
                        </Badge>
                      </div>

                      {/* Info details */}
                      <div className="p-6 pt-0 space-y-3">
                        <h3 className="font-display text-xl font-extrabold text-foreground">{box.name}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{box.description}</p>
                        
                        {/* Included items */}
                        <div className="pt-2">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1.5">¿Qué contiene la caja?</p>
                          <ul className="space-y-1">
                            {box.items.map((it, idx) => (
                              <li key={idx} className="text-xs text-foreground flex items-center gap-1.5">
                                <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span className="truncate">{it}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Subscription Action footer */}
                    <div className="p-6 border-t border-border bg-muted/20 space-y-4">
                      <div className="flex justify-between items-baseline">
                        <div>
                          <p className="text-[9px] text-muted-foreground uppercase font-bold">Caja + Envío</p>
                          <p className="font-mono text-2xl font-extrabold text-foreground">
                            ${total.toFixed(2)}
                            <span className="text-xs text-muted-foreground font-normal">/mes</span>
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[9px] font-mono">
                          Envío: ${shipping.toFixed(2)}
                        </Badge>
                      </div>

                      <Button onClick={() => handleSubscribe(box)} className="w-full font-bold gap-2">
                        Suscribirse <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Benefits Banner */}
            <div className="mt-16 bg-gradient-to-r from-primary/10 via-secondary/50 to-primary/5 border border-border rounded-2xl p-8 max-w-4xl mx-auto grid md:grid-cols-3 gap-6 text-center md:text-left">
              <div className="space-y-1">
                <Truck className="h-8 w-8 text-primary mx-auto md:mx-0" />
                <h4 className="font-bold text-sm text-foreground">Envío Internacional Seguro</h4>
                <p className="text-xs text-muted-foreground">Despachado mensualmente vía aérea rápida y con código de seguimiento.</p>
              </div>
              <div className="space-y-1">
                <Calendar className="h-8 w-8 text-primary mx-auto md:mx-0" />
                <h4 className="font-bold text-sm text-foreground">Cancela Cuando Quieras</h4>
                <p className="text-xs text-muted-foreground">Sin plazos de permanencia forzada. Gestiona tu suscripción libremente en tu perfil.</p>
              </div>
              <div className="space-y-1">
                <Sparkles className="h-8 w-8 text-primary mx-auto md:mx-0" />
                <h4 className="font-bold text-sm text-foreground">Artesanal & Fresco</h4>
                <p className="text-xs text-muted-foreground">Colaboramos directamente con micro-productores locales de dulces y café.</p>
              </div>
            </div>

          </div>
        </main>

        <Footer />
        
        {/* Payment Modal */}
        <CheckoutModal 
          isOpen={checkoutOpen} 
          onClose={() => setCheckoutOpen(false)} 
          item={selectedBox} 
        />
      </div>
    </PageTransition>
  );
}
