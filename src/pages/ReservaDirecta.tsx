import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { PanoramaAd } from "@/components/promo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle, ShieldCheck, ArrowLeft, CreditCard, Calendar, 
  MapPin, Users, Bed, Sparkles, ChevronRight, Lock, PhoneCall,
  Clock, DollarSign, Award, Gift
} from "lucide-react";
import { toast } from "sonner";

import puntaCanaImg from "@/assets/punta-cana.jpg";

const destinosOpciones = [
  { id: "punta-cana", nombre: "Punta Cana & Bávaro", precioPromedio: 180 },
  { id: "samana", nombre: "Samaná & Las Terrenas", precioPromedio: 140 },
  { id: "santo-domingo", nombre: "Santo Domingo (Zona Colonial)", precioPromedio: 110 },
  { id: "puerto-plata", nombre: "Puerto Plata & Cabarete", precioPromedio: 125 },
  { id: "jarabacoa", nombre: "Jarabacoa & Constanza", precioPromedio: 95 },
  { id: "bayahibe", nombre: "La Romana & Bayahíbe", precioPromedio: 165 },
];

const tiposServicio = [
  { id: "hotel", nombre: "Resort & Hotel Boutique", icon: Bed },
  { id: "tour", nombre: "Excursión o Tour Guiado", icon: Sparkles },
  { id: "combo", nombre: "Paquete Hotel + Traslado", icon: Award },
];

const beneficiosDirectos = [
  {
    icon: Award,
    title: "Mejor Tarifa Garantizada",
    desc: "Al reservar directo sin intermediarios obtienes hasta un 15% de descuento frente a OTAs extranjeras."
  },
  {
    icon: Clock,
    title: "Cancelación Gratuita Flexible",
    desc: "Cancela o modifica tus fechas sin penalidad hasta 48 horas antes de la llegada en alojamientos participantes."
  },
  {
    icon: Gift,
    title: "Beneficios Exclusivos de Bienvenida",
    desc: "Bebida de cortesía típica (Mama Juana o cóctel de bienvenida) y late check-out según disponibilidad."
  },
  {
    icon: ShieldCheck,
    title: "Operadores 100% Verificados",
    desc: "Todos los prestadores cuentan con licencia activa y certificación oficial del Ministerio de Turismo (MITUR)."
  }
];

export default function ReservaDirecta() {
  const [selectedDestino, setSelectedDestino] = useState(destinosOpciones[0].id);
  const [selectedTipo, setSelectedTipo] = useState("hotel");
  const [noches, setNoches] = useState(3);
  const [huespedes, setHuespedes] = useState(2);
  const [metodoPago, setMetodoPago] = useState("tarjeta");

  const destinoActual = destinosOpciones.find(d => d.id === selectedDestino) || destinosOpciones[0];
  const precioBase = destinoActual.precioPromedio * noches;
  const itbis = Math.round(precioBase * 0.18); // ITBIS 18%
  const propinaLegal = Math.round(precioBase * 0.10); // Ley 10%
  const total = precioBase + itbis + propinaLegal;

  const handleBooking = () => {
    toast.success("¡Solicitud de Reserva Directa Enviada!", {
      description: `Destino: ${destinoActual.nombre} para ${huespedes} personas (${noches} noches). Te hemos enviado la confirmación y enlace de pago seguro a tu correo.`
    });
  };

  return (
    <PageTransition>
      <SEOHead
        title="Portal de Reserva Directa | Tarifas Oficiales y Garantía Descubre RD"
        description="Reserva directo con hoteles, resorts y operadores certificados en República Dominicana. Sin comisiones ocultas, mejor tarifa garantizada y cancelación flexible."
        keywords="reserva directa hoteles rd, reservar resort punta cana, tours certificados dominicana, reserva directa descubrerd"
      />
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />

        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[460px] flex items-end overflow-hidden">
          <img
            src={puntaCanaImg}
            alt="Reserva directa de hoteles y tours en República Dominicana"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-black/30" />

          <div className="relative z-10 container mx-auto px-4 lg:px-8 pb-12">
            <nav className="flex items-center gap-2 text-xs md:text-sm text-white/80 mb-4">
              <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link to="/alojamientos" className="hover:text-primary transition-colors">Alojamientos</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-white font-medium">Reserva Directa</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <Badge className="mb-3 bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs px-3 py-1 font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> TARIFA DIRECTA SIN INTERMEDIARIOS
                </Badge>
                <h1 className="font-display text-4xl md:text-6xl font-black text-white tracking-tight mb-3">
                  Portal de Reserva Directa
                </h1>
                <p className="text-base md:text-lg text-white/90 max-w-2xl leading-relaxed">
                  Conéctate de forma transparente y segura con los mejores alojamientos, villas y operadores turísticos certificados de República Dominicana.
                </p>
              </div>

              {/* Verified badge */}
              <div className="bg-black/50 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-white flex items-center gap-3">
                <ShieldCheck className="h-8 w-8 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs text-white/70">Seguridad Garantizada</p>
                  <p className="text-sm font-bold text-primary">Cifrado SSL de 256 bits</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Multi-step Interactive Booking Engine */}
        <section className="py-16 container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left form config (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Step 1: Type of service */}
              <Card className="border-border bg-card">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">1</span>
                    ¿Qué deseas reservar?
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {tiposServicio.map((tipo) => (
                      <button
                        key={tipo.id}
                        onClick={() => setSelectedTipo(tipo.id)}
                        className={`p-3.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                          selectedTipo === tipo.id
                            ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                            : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
                        }`}
                      >
                        <tipo.icon className="h-5 w-5" />
                        <span className="text-xs">{tipo.nombre}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Destination */}
              <Card className="border-border bg-card">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">2</span>
                    Selecciona tu Destino
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {destinosOpciones.map((dest) => (
                      <button
                        key={dest.id}
                        onClick={() => setSelectedDestino(dest.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                          selectedDestino === dest.id
                            ? "border-primary bg-primary/10 text-foreground font-bold shadow-sm"
                            : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className={`h-4 w-4 ${selectedDestino === dest.id ? "text-primary" : "text-muted-foreground"}`} />
                          <span className="text-xs">{dest.nombre}</span>
                        </div>
                        <span className="text-xs font-semibold text-primary">Desde ${dest.precioPromedio}/noche</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Step 3: Dates & Guests */}
              <Card className="border-border bg-card">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">3</span>
                    Estadía & Huéspedes
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" /> Duración de Estadía (Noches)
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={30}
                        value={noches}
                        onChange={(e) => setNoches(Math.max(1, parseInt(e.target.value) || 1))}
                        className="bg-muted/20 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-primary" /> Número de Huéspedes
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={huespedes}
                        onChange={(e) => setHuespedes(Math.max(1, parseInt(e.target.value) || 1))}
                        className="bg-muted/20 rounded-xl"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Right Summary & Checkout Box (5 cols) */}
            <div className="lg:col-span-5 sticky top-24 space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-6">
                <div>
                  <h3 className="font-display font-bold text-xl text-foreground mb-1">
                    Resumen de Reserva Directa
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Tarifa oficial confirmada sin cargos ocultos.
                  </p>
                </div>

                {/* Details Pill */}
                <div className="p-4 bg-muted/30 rounded-xl border border-border/70 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Destino:</span>
                    <strong className="text-foreground">{destinoActual.nombre}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estadía:</span>
                    <strong className="text-foreground">{noches} noches / {huespedes} huéspedes</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modalidad:</span>
                    <strong className="text-emerald-500">Reserva Directa Oficial</strong>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 text-xs pt-2 border-t border-border">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Precio base ({noches} noches):</span>
                    <span>US$ {precioBase.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>ITBIS Dominicano (18%):</span>
                    <span>US$ {itbis.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Propina legal hotelera (10%):</span>
                    <span>US$ {propinaLegal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-border text-base font-bold text-foreground">
                    <span>Total Estimado Final:</span>
                    <span className="text-primary font-display text-xl">US$ {total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment methods */}
                <div className="pt-2 border-t border-border">
                  <label className="text-xs font-semibold text-muted-foreground block mb-2">
                    Método de Pago Preferido:
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => setMetodoPago("tarjeta")}
                      className={`p-2.5 rounded-lg border text-center font-medium ${
                        metodoPago === "tarjeta" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                      }`}
                    >
                      💳 Tarjeta de Crédito
                    </button>
                    <button
                      onClick={() => setMetodoPago("rdpass")}
                      className={`p-2.5 rounded-lg border text-center font-medium ${
                        metodoPago === "rdpass" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                      }`}
                    >
                      🏝️ Tarjeta RD Pass
                    </button>
                  </div>
                </div>

                <Button onClick={handleBooking} size="lg" className="w-full gap-2 font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground">
                  <CreditCard className="h-4 w-4" /> Confirmar Solicitud de Reserva Directa
                </Button>

                <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-emerald-500" /> Transacción encriptada • Cancelación flexible hasta 48h
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-card/40 border-y border-border/50">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
            <div className="text-center mb-12">
              <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">
                VENTAJAS EXCLUSIVAS
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                ¿Por Qué Reservar Directo con Nosotros?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
                Eliminamos los sobrecostos de intermediarios para ofrecerte las mejores condiciones del mercado.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {beneficiosDirectos.map((b) => (
                <div key={b.title} className="p-6 bg-card rounded-2xl border border-border flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <b.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display font-bold text-base text-foreground mb-2">{b.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Panorama Ad Section */}
        <section className="py-6 bg-muted/20 border-t border-border/40">
          <div className="container mx-auto px-4 max-w-6xl">
            <PanoramaAd showDemo />
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}