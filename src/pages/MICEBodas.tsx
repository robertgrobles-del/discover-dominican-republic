import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Building, MapPin, Users, Calendar, Calculator, Sparkles, Send, Check } from "lucide-react";
import { toast } from "sonner";

interface VenueB2B {
  id: string;
  name: string;
  type: "beach" | "colonial" | "hotel" | "garden";
  capacity: number;
  location: string;
  image: string;
  features: string[];
}

const mockVenues: VenueB2B[] = [
  {
    id: "v1",
    name: "Hard Rock Hall Punta Cana",
    type: "hotel",
    capacity: 3500,
    location: "Punta Cana",
    image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800",
    features: ["Sonido line-array", "Acondicionador de aire", "Seguridad privada", "Parqueo 500 veh."]
  },
  {
    id: "v2",
    name: "Playa Palmeras VIP",
    type: "beach",
    capacity: 800,
    location: "Las Terrenas",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    features: ["Planta eléctrica de respaldo", "Permiso de música 24h", "Gazebo frente al mar"]
  },
  {
    id: "v3",
    name: "Quinta Colonial de la Calle Las Damas",
    type: "colonial",
    capacity: 250,
    location: "Santo Domingo",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800",
    features: ["Patio español del siglo XVI", "Iluminación colonial", "Área climatizada para catering"]
  }
];

export default function MICEBodas() {
  const [eventType, setEventType] = useState<"mice" | "boda" | "quince">("mice");
  const [guests, setGuests] = useState<number[]>([150]);
  const [venueTier, setVenueTier] = useState<"standard" | "boutique" | "luxury">("boutique");
  
  // Extra services checkboxes
  const [catering, setCatering] = useState(true);
  const [decor, setDecor] = useState(true);
  const [sound, setSound] = useState(true);
  const [photo, setPhoto] = useState(false);
  const [coordinator, setCoordinator] = useState(false);

  const [rfpSubmitted, setRfpSubmitted] = useState(false);
  const [rfpName, setRfpName] = useState("");
  const [rfpEmail, setRfpEmail] = useState("");

  // Budget calculations
  const getVenueCost = () => {
    const base = venueTier === "luxury" ? 250000 : venueTier === "boutique" ? 120000 : 60000;
    const sizeMultiplier = guests[0] > 500 ? 2 : guests[0] > 200 ? 1.5 : 1;
    return base * sizeMultiplier;
  };

  const getCateringCost = () => {
    if (!catering) return 0;
    const pricePerPax = venueTier === "luxury" ? 2500 : venueTier === "boutique" ? 1500 : 900;
    return pricePerPax * guests[0];
  };

  const getExtrasCost = () => {
    let total = 0;
    if (decor) total += venueTier === "luxury" ? 120000 : venueTier === "boutique" ? 60000 : 30000;
    if (sound) total += venueTier === "luxury" ? 80000 : venueTier === "boutique" ? 40000 : 20000;
    if (photo) total += venueTier === "luxury" ? 90000 : venueTier === "boutique" ? 45000 : 25000;
    if (coordinator) total += venueTier === "luxury" ? 60000 : venueTier === "boutique" ? 30000 : 15000;
    return total;
  };

  const grandTotal = getVenueCost() + getCateringCost() + getExtrasCost();

  const handleRfpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfpName || !rfpEmail) {
      toast.error("Por favor completa tu nombre e email corporativo.");
      return;
    }
    setRfpSubmitted(true);
    toast.success("¡Tu solicitud RFP ha sido enviada exitosamente! Un especialista B2B te responderá en menos de 24 horas.");
  };

  return (
    <PageTransition>
      <SEOHead
        title="B2B MICE, Bodas y Quinceaños en RD - Cotizador de Venues"
        description="Portal corporativo y de eventos B2B en República Dominicana. Utiliza nuestro cotizador inteligente de venues para congresos, bodas y quinceaños."
      />
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />

        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8">
            
            {/* Header section */}
            <div className="text-center max-w-2xl mx-auto mb-10">
              <Badge className="mb-3 bg-cyan-500/10 text-cyan-400 border-cyan-400/20 gap-1.5 py-1 px-3">
                💼 Soluciones B2B & Eventos
              </Badge>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground">
                Portal de Venues y Congresos
              </h1>
              <p className="text-muted-foreground mt-3 text-base">
                Planifica tu convención corporativa, boda de ensueño o fiesta de quinceaños en los escenarios más exclusivos de República Dominicana.
              </p>
            </div>

            {/* Budget calculator widget */}
            <div className="grid lg:grid-cols-5 gap-8 mb-12">
              <Card className="lg:col-span-3 bg-card/65 border border-border">
                <CardHeader className="border-b border-border/40">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" /> Cotizador de Presupuesto Estimado
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Configura tu evento y calcula costos de alquiler y servicios al instante.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Event Type selector */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Tipo de Celebración</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "mice", label: "MICE / Congresos" },
                        { id: "boda", label: "Boda de Destino" },
                        { id: "quince", label: "Quinceaños / Sweet 15" }
                      ].map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setEventType(type.id as any)}
                          className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                            eventType === type.id 
                              ? "bg-primary/10 border-primary text-primary" 
                              : "border-border hover:bg-secondary text-muted-foreground"
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Guests Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Cantidad de Asistentes</label>
                      <span className="font-bold text-sm text-primary">{guests[0]} Pax</span>
                    </div>
                    <Slider
                      value={guests}
                      onValueChange={setGuests}
                      max={eventType === "mice" ? 1000 : 500}
                      min={20}
                      step={10}
                    />
                  </div>

                  {/* Venue Category selection */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Categoría de Venue</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "standard", label: "Estándar (Salones)" },
                        { id: "boutique", label: "Boutique (Histórico)" },
                        { id: "luxury", label: "Lujo (Playa/Resort)" }
                      ].map((tier) => (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => setVenueTier(tier.id as any)}
                          className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                            venueTier === tier.id 
                              ? "bg-primary/10 border-primary text-primary" 
                              : "border-border hover:bg-secondary text-muted-foreground"
                          }`}
                        >
                          {tier.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Extra B2B Services */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-3 block">Servicios Complementarios</label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                        <Checkbox checked={catering} onCheckedChange={(c) => setCatering(!!c)} />
                        Catering y Banquetes
                      </label>
                      <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                        <Checkbox checked={decor} onCheckedChange={(d) => setDecor(!!d)} />
                        Decoración y Mobiliario
                      </label>
                      <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                        <Checkbox checked={sound} onCheckedChange={(s) => setSound(!!s)} />
                        Sonido y Luces Pro
                      </label>
                      <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                        <Checkbox checked={photo} onCheckedChange={(p) => setPhoto(!!p)} />
                        Fotografía y Video
                      </label>
                      <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                        <Checkbox checked={coordinator} onCheckedChange={(c) => setCoordinator(!!c)} />
                        Coordinador In-Situ
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Budget results & RFP form */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-secondary/40 border border-border">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Desglose de Costos Estimados</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Alquiler del Venue:</span>
                        <span className="font-semibold text-foreground">RD$ {getVenueCost().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Catering ({guests[0]} Pax):</span>
                        <span className="font-semibold text-foreground">RD$ {getCateringCost().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Servicios y Extras:</span>
                        <span className="font-semibold text-foreground">RD$ {getExtrasCost().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-border/40 pt-3 text-base font-bold text-foreground">
                        <span>Total Estimado:</span>
                        <span className="text-primary">RD$ {grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* RFP Submission Form */}
                <Card className="border border-border bg-card">
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-1">
                      <Send className="h-4 w-4 text-primary" /> Solicitar Propuesta Formal (RFP)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {rfpSubmitted ? (
                      <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                        <Check className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                        <p className="font-bold text-xs text-emerald-500">RFP Recibido</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Un planificador asignado te responderá vía email.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleRfpSubmit} className="space-y-3">
                        <Input
                          placeholder="Tu Nombre"
                          value={rfpName}
                          onChange={(e) => setRfpName(e.target.value)}
                          className="bg-secondary/40 border-border text-xs"
                          required
                        />
                        <Input
                          placeholder="Email Corporativo"
                          type="email"
                          value={rfpEmail}
                          onChange={(e) => setRfpEmail(e.target.value)}
                          className="bg-secondary/40 border-border text-xs"
                          required
                        />
                        <Button
                          type="submit"
                          size="sm"
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                        >
                          Enviar RFP
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* B2B Venues Catalog */}
            <div>
              <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                <Building className="h-6 w-6 text-primary" /> Catálogo de Venues Destacados
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mockVenues.map((venue) => (
                  <Card key={venue.id} className="overflow-hidden border border-border bg-card/60 hover:border-primary/20 transition-all duration-300 group hover:shadow-lg">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={venue.image}
                        alt={venue.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <Badge className="absolute top-3 left-3 bg-black/75 text-white border-none text-[10px]">
                        Max: {venue.capacity} Pax
                      </Badge>
                    </div>
                    <div className="p-5">
                      <Badge variant="secondary" className="mb-2 text-[10px] uppercase">
                        {venue.type === "hotel" ? "Salón de Convenciones" : venue.type === "beach" ? "Playa Privada" : "Palacio Histórico"}
                      </Badge>
                      <h3 className="font-display font-bold text-base text-foreground mb-1 group-hover:text-primary transition-colors">
                        {venue.name}
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
                        <MapPin className="h-3.5 w-3.5 text-primary" /> {venue.location}
                      </p>
                      <ul className="space-y-1 text-[10px] text-muted-foreground">
                        {venue.features.map(f => (
                          <li key={f} className="flex items-center gap-1.5">
                            <span className="h-1 w-1 rounded-full bg-primary" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
