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
  CreditCard, QrCode, Search, Building, Utensils, 
  Compass, Plus, Percent, CheckCircle, HelpCircle, Sparkles, Shield
} from "lucide-react";
import { toast } from "sonner";
import { CheckoutModal } from "@/components/CheckoutModal";
import { useAuth } from "@/hooks/useAuth";

const allies = [
  {
    id: "ally-1",
    name: "Eden Roc Cap Cana",
    category: "Alojamiento",
    discount: "15% OFF",
    description: "Descuento en suites y tratamientos de spa seleccionados.",
    location: "Punta Cana",
    image: "https://images.unsplash.com/photo-1540552980157-21d2a565c52b?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "ally-2",
    name: "Restaurante El Conuco",
    category: "Gastronomía",
    discount: "10% OFF",
    description: "Descuento en consumo total en platos a la carta y bebidas nacionales.",
    location: "Santo Domingo",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "ally-3",
    name: "Runners Adventures",
    category: "Actividades",
    discount: "20% OFF",
    description: "Descuento especial en tours de buggies, tirolesa y avistamiento de ballenas.",
    location: "Samaná / Punta Cana",
    image: "https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "ally-4",
    name: "Subway & Aquatic Centes Sosúa",
    category: "Actividades",
    discount: "15% OFF",
    description: "Aplica en tours de buceo certificado, snorkel y renta de botes.",
    location: "Sosúa, Puerto Plata",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "ally-5",
    name: "Aché Restaurante",
    category: "Gastronomía",
    discount: "12% OFF",
    description: "Descuento en almuerzos y cenas frente al mar en Las Terrenas.",
    location: "Las Terrenas",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "ally-6",
    name: "Cabarete Boutique Hotel",
    category: "Alojamiento",
    discount: "20% OFF",
    description: "Descuento en tarifas de temporada baja al reservar directamente.",
    location: "Cabarete",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80"
  }
];

export default function TarjetaPrepago() {
  const { user } = useAuth();
  
  // Checkout Modal State
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState<any>(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  
  // Card stats (Persistent balance)
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem("rdpass_balance_usd");
    return saved ? parseFloat(saved) : 150.00;
  });
  const [cardNumber] = useState("4892 •••• •••• 9901");
  const [qrVisible, setQrVisible] = useState(false);

  const handleReload = (amount: number) => {
    if (!user) {
      toast.error("Inicia sesión para recargar fondos en tu RD Pass.");
      window.location.href = "/login";
      return;
    }

    setSelectedLoad({
      id: `rdpass-load-${amount}`,
      name: `Recarga RD Pass - $${amount} USD`,
      type: "producto",
      price: amount,
      image: "https://images.unsplash.com/photo-1540552980157-21d2a565c52b?w=600&auto=format&fit=crop&q=80"
    });
    setCheckoutOpen(true);
  };

  const onPaymentSuccess = (amount: number) => {
    const newBal = Number((balance + amount).toFixed(2));
    setBalance(newBal);
    localStorage.setItem("rdpass_balance_usd", newBal.toString());
    toast.success(`💳 ¡Saldo actualizado con éxito! Nuevo balance: $${newBal} USD`);
  };

  const filteredAllies = allies.filter(ally => {
    const matchesSearch = ally.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ally.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || ally.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <PageTransition>
      <SEOHead
        title="Tarjeta Turística RD Pass | Descubre RD"
        description="Consigue la tarjeta turística prepagada RD Pass. Recibe descuentos del 10% al 20% en hoteles, restaurantes y tours afiliados en República Dominicana."
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8">
            
            {/* Hero & Card Section */}
            <div className="grid lg:grid-cols-12 gap-12 items-center max-w-6xl mx-auto mb-16">
              
              <div className="lg:col-span-7 space-y-6">
                <Badge className="bg-primary/20 text-primary border-primary/30 py-1 px-3 text-xs gap-1.5 uppercase font-bold tracking-wider">
                  <CreditCard className="h-4 w-4" /> Tarjeta Turística Prepago
                </Badge>
                <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground">
                  Viaja Inteligente con <span className="text-primary">RD Pass</span>
                </h1>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  Tu pase digital exclusivo para República Dominicana. Carga saldo en dólares, paga de forma segura en comercios locales y disfruta de descuentos instantáneos del 10% al 20% en nuestra red de aliados exclusivos.
                </p>

                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="flex gap-2 items-center">
                    <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                    <span className="text-xs text-foreground font-semibold">100% Digital</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Percent className="h-5 w-5 text-emerald-500 shrink-0" />
                    <span className="text-xs text-foreground font-semibold">Descuentos</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Shield className="h-5 w-5 text-emerald-500 shrink-0" />
                    <span className="text-xs text-foreground font-semibold">Cero Comisiones</span>
                  </div>
                </div>

                {/* Reload Selector */}
                <div className="pt-4 space-y-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Carga o Recarga de Fondos (USD)</p>
                  <div className="flex gap-3 max-w-md">
                    {[50, 100, 200].map(amount => (
                      <Button 
                        key={amount} 
                        variant="outline" 
                        className="flex-1 font-mono font-bold hover:border-primary py-6"
                        onClick={() => handleReload(amount)}
                      >
                        +${amount}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Virtual Card Rendering */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-[380px] aspect-[1.58/1] rounded-2xl bg-gradient-to-br from-amber-600 via-amber-500 to-amber-700 p-6 shadow-2xl text-white overflow-hidden border border-white/20 flex flex-col justify-between group">
                  {/* Decorative mesh */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.15),rgba(255,255,255,0))]" />
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
                  
                  {/* Top line info */}
                  <div className="flex justify-between items-start z-10">
                    <div>
                      <span className="text-[10px] tracking-widest font-bold uppercase opacity-85">PASE TURÍSTICO</span>
                      <h3 className="font-display font-extrabold text-xl leading-none mt-1">RD Pass</h3>
                    </div>
                    <Sparkles className="h-6 w-6 text-amber-200 animate-pulse" />
                  </div>

                  {/* QR Overlay inside the card simulation */}
                  {qrVisible ? (
                    <div className="bg-white p-3 rounded-lg flex flex-col items-center justify-center border border-white/20 self-center z-10 transition-all duration-300">
                      <QrCode className="h-28 w-28 text-black" />
                      <span className="text-[9px] font-mono text-black/60 mt-1">Nº: RD-PASS-{user ? user.id.substring(0, 6).toUpperCase() : "INVITADO"}</span>
                    </div>
                  ) : (
                    <div className="my-auto z-10">
                      <span className="text-xs text-amber-200/85">Saldo disponible</span>
                      <div className="font-mono text-3xl font-extrabold leading-none mt-1">
                        ${balance.toFixed(2)} <span className="text-xs font-normal">USD</span>
                      </div>
                    </div>
                  )}

                  {/* Card bottom bar */}
                  <div className="flex justify-between items-end z-10">
                    <div>
                      <p className="text-[10px] font-mono opacity-80">{cardNumber}</p>
                      <p className="text-xs font-bold mt-1 truncate max-w-[180px]">{user ? user.email : "Invitado General"}</p>
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      onClick={() => setQrVisible(!qrVisible)}
                      className="text-[10px] font-bold h-7 px-3 bg-white/25 hover:bg-white/40 border border-white/20 text-white gap-1.5"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      {qrVisible ? "Ocultar QR" : "Mostrar QR"}
                    </Button>
                  </div>
                </div>
              </div>

            </div>

            {/* Discount Partners Directory */}
            <div className="space-y-8 max-w-6xl mx-auto pt-8 border-t border-border">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-foreground">Red de Establecimientos Aliados</h2>
                  <p className="text-xs text-muted-foreground mt-1">Escanea tu código QR en estos comercios para aplicar tu descuento instantáneo.</p>
                </div>
                
                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {["Todos", "Alojamiento", "Gastronomía", "Actividades"].map(cat => (
                    <Button 
                      key={cat} 
                      variant={selectedCategory === cat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(cat)}
                      className="text-xs font-bold whitespace-nowrap"
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="text" 
                  placeholder="Buscar hotel, restaurante o actividad por nombre o pueblo..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-card/50"
                />
              </div>

              {/* Allies Cards Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                {filteredAllies.length > 0 ? (
                  filteredAllies.map(ally => (
                    <Card key={ally.id} className="overflow-hidden border bg-card/40 flex flex-col justify-between group">
                      <div className="space-y-4">
                        <div className="aspect-[16/10] overflow-hidden relative">
                          <img 
                            src={ally.image} 
                            alt={ally.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          />
                          <Badge className="absolute top-3 right-3 bg-emerald-600 border-emerald-500 text-white font-extrabold flex gap-1 items-center">
                            <Percent className="h-3 w-3" /> {ally.discount}
                          </Badge>
                          <Badge className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm border-white/10 text-[9px] uppercase font-bold tracking-wider">
                            {ally.category}
                          </Badge>
                        </div>

                        <div className="p-5 pt-0 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            {ally.category === "Alojamiento" ? <Building className="h-3.5 w-3.5" /> : 
                             ally.category === "Gastronomía" ? <Utensils className="h-3.5 w-3.5" /> : 
                             <Compass className="h-3.5 w-3.5" />}
                            <span>{ally.location}</span>
                          </div>
                          <h3 className="font-display text-lg font-bold text-foreground">{ally.name}</h3>
                          <p className="text-xs text-muted-foreground leading-normal">{ally.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-muted-foreground space-y-2">
                    <p className="text-sm">No encontramos ningún aliado que coincida con tu búsqueda.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>

        <Footer />
        
        {/* Payment Modal */}
        <CheckoutModal 
          isOpen={checkoutOpen} 
          onClose={() => setCheckoutOpen(false)} 
          item={selectedLoad} 
        />
      </div>
    </PageTransition>
  );
}
