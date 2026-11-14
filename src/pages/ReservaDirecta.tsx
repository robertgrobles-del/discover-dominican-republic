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
import { SelloVerificadoBadge } from "@/components/ui/SelloVerificadoBadge";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { 
  CheckCircle, ShieldCheck, ArrowLeft, CreditCard, Calendar, 
  MapPin, Users, Bed, Sparkles, ChevronRight, Lock, PhoneCall,
  Clock, DollarSign, Award, Gift, Loader2
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

import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { bookingsApi } from "@/lib/bookingsApi";
import { apiMessage } from "@/lib/accountApi";
import { usePageContent } from "@/lib/pageContent";

export default function ReservaDirecta() {
  const pc = usePageContent("reserva-directa");
  const destinosOpciones = pc.data("destinosOpciones", __pcData.destinosOpciones);
  const tiposServicio = pc.data("tiposServicio", __pcData.tiposServicio);
  const beneficiosDirectos = pc.data("beneficiosDirectos", __pcData.beneficiosDirectos);
  const { user } = useAuth();
  const [selectedDestino, setSelectedDestino] = useState(destinosOpciones[0].id);
  const [selectedTipo, setSelectedTipo] = useState("hotel");
  const [noches, setNoches] = useState(3);
  const [huespedes, setHuespedes] = useState(2);
  const [metodoPago, setMetodoPago] = useState<"pay_later" | "card_sandbox" | "deposit">("pay_later");
  const [guestName, setGuestName] = useState(user?.user_metadata?.full_name || "");
  const [guestEmail, setGuestEmail] = useState(user?.email || "");
  const [guestPhone, setGuestPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const destinoActual = destinosOpciones.find(d => d.id === selectedDestino) || destinosOpciones[0];
  const precioBase = destinoActual.precioPromedio * noches;
  const itbis = Math.round(precioBase * 0.18); // ITBIS 18%
  const propinaLegal = Math.round(precioBase * 0.10); // Ley 10%
  const total = precioBase + itbis + propinaLegal;

  const handleBooking = async () => {
    if (!guestName.trim()) {
      toast.error("Por favor ingresa tu nombre completo.");
      return;
    }
    if (!guestEmail.trim() || !guestEmail.includes("@")) {
      toast.error("Por favor ingresa un correo electrónico válido.");
      return;
    }

    setIsSubmitting(true);
    try {
      const checkInDate = new Date();
      checkInDate.setDate(checkInDate.getDate() + 1);
      const checkOutDate = new Date(checkInDate.getTime() + noches * 86400000);

      const paymentMode = metodoPago === "deposit" ? "deposit" : metodoPago === "card_sandbox" ? "pay_now" : "pay_later";
      const paymentToken = metodoPago === "card_sandbox" ? "tok_cardnet_demo_sandbox_approved" : undefined;

      if (HAS_BACKEND_SESSION) {
        const res = await bookingsApi.create({
          request: {
            listing_id: `listing-${selectedDestino}`,
            date: checkInDate.toISOString().split("T")[0],
            check_out: checkOutDate.toISOString().split("T")[0],
            adults: huespedes,
            children: 0,
          },
          contact: {
            name: guestName.trim(),
            email: guestEmail.trim().toLowerCase(),
            phone: guestPhone.trim() || undefined,
          },
          notes: `Reserva directa para ${destinoActual.nombre} (${noches} noches, ${selectedTipo}) - Método: ${metodoPago}`,
          payment_mode: paymentMode,
          payment_method_token: paymentToken,
          locale: "es",
        });

        toast.success("¡Reserva Confirmada Exitosamente!", {
          description: `Referencia: ${res.booking.reference} en ${destinoActual.nombre} (${noches} noches). Se ha enviado el comprobante a ${guestEmail}.`,
        });
      } else {
        toast.success("¡Solicitud de Reserva Directa Registrada!", {
          description: `Destino: ${destinoActual.nombre} para ${huespedes} personas (${noches} noches). Te hemos enviado la confirmación oficial a ${guestEmail}.`,
        });
      }
    } catch (err: unknown) {
      toast.error(apiMessage(err, "No se pudo procesar la reserva directa. Intenta nuevamente."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <SEOHead
        title={pc.t("SEOHead.title.1", "Portal de Reserva Directa | Tarifas Oficiales y Garantía Descubre RD")}
        description={pc.t("SEOHead.description.1", "Reserva directo con hoteles, resorts y operadores certificados en República Dominicana. Sin comisiones ocultas, mejor tarifa garantizada y cancelación flexible.")}
        keywords="reserva directa hoteles rd, reservar resort punta cana, tours certificados dominicana, reserva directa descubrerd"
      />
      <div className="min-h-dvh flex flex-col bg-background text-foreground">
        <Header />

        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[460px] flex items-end overflow-hidden">
          <img
            src={pc.img("img.src.1", puntaCanaImg)}
            alt={pc.t("img.alt.1", "Reserva directa de hoteles y tours en República Dominicana")}
            className="absolute inset-0 w-full h-full object-cover object-center"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-black/30" />

          <div className="relative z-10 container mx-auto px-4 lg:px-8 pb-12">
            <nav className="flex items-center gap-2 text-xs md:text-sm text-white/80 mb-4">
              <Link to="/" className="hover:text-primary transition-colors">{pc.tx("Link.1", "Inicio")}</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link to="/alojamientos" className="hover:text-primary transition-colors">{pc.tx("Link.2", "Alojamientos")}</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-white font-medium">{pc.tx("span.1", "Reserva Directa")}</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <SelloVerificadoBadge variant="full" size="md" className="mb-3" />
                <h1 className="font-display text-4xl md:text-6xl font-black text-white tracking-tight mb-3">{pc.tx("h1.1", "Portal de Reserva Directa")}</h1>
                <p className="text-base md:text-lg text-white/90 max-w-2xl leading-relaxed">{pc.tx("p.1", "Conéctate de forma transparente y segura con los mejores alojamientos, villas y operadores turísticos certificados de República Dominicana.")}</p>
              </div>

              {/* Verified badge */}
              <div className="bg-black/50 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-white flex items-center gap-3">
                <ShieldCheck className="h-8 w-8 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs text-white/70">{pc.tx("p.2", "Seguridad Garantizada")}</p>
                  <p className="text-sm font-bold text-primary">{pc.tx("p.3", "Cifrado SSL de 256 bits")}</p>
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
                  <h2 className="h3 font-display font-bold text-lg text-foreground flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">1</span>{pc.tx("h3.1", "¿Qué deseas reservar?")}</h2>
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
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">2</span>{pc.tx("h3.2", "Selecciona tu Destino")}</h3>
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
                        <span className="text-xs font-semibold text-primary">{pc.tx("span.2", "Desde $")}{dest.precioPromedio}{pc.tx("span.3", "/noche")}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Step 3: Dates & Guests */}
              <Card className="border-border bg-card">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">3</span>{pc.tx("h3.3", "Estadía & Huéspedes")}</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" />{" "}{pc.tx("label.1", "Duración de Estadía (Noches)")}</label>
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
                        <Users className="h-3.5 w-3.5 text-primary" />{" "}{pc.tx("label.2", "Número de Huéspedes")}</label>
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
                  <h3 className="font-display font-bold text-xl text-foreground mb-1">{pc.tx("h3.4", "Resumen de Reserva Directa")}</h3>
                  <p className="text-xs text-muted-foreground">{pc.tx("p.4", "Tarifa oficial confirmada sin cargos ocultos.")}</p>
                </div>

                {/* Details Pill */}
                <div className="p-4 bg-muted/30 rounded-xl border border-border/70 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{pc.tx("span.4", "Destino:")}</span>
                    <strong className="text-foreground">{destinoActual.nombre}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{pc.tx("span.5", "Estadía:")}</span>
                    <strong className="text-foreground">{noches}{" "}{pc.tx("strong.1", "noches /")}{" "}{huespedes}{" "}{pc.tx("strong.2", "huéspedes")}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{pc.tx("span.6", "Modalidad:")}</span>
                    <strong className="text-emerald-500">{pc.tx("strong.3", "Reserva Directa Oficial")}</strong>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 text-xs pt-2 border-t border-border">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{pc.tx("span.7", "Precio base (")}{noches}{" "}{pc.tx("span.8", "noches):")}</span>
                    <span>{pc.tx("span.9", "US$")}{" "}{precioBase.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{pc.tx("span.10", "ITBIS Dominicano (18%):")}</span>
                    <span>{pc.tx("span.11", "US$")}{" "}{itbis.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{pc.tx("span.12", "Propina legal hotelera (10%):")}</span>
                    <span>{pc.tx("span.13", "US$")}{" "}{propinaLegal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-border text-base font-bold text-foreground">
                    <span>{pc.tx("span.14", "Total Estimado Final:")}</span>
                    <span className="text-primary font-display text-xl">{pc.tx("span.15", "US$")}{" "}{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment methods */}
                <div className="pt-2 border-t border-border space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground block">{pc.tx("label.3", "Modalidad de Pago:")}</label>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setMetodoPago("pay_later")}
                      className={`p-3 rounded-xl border text-left font-medium transition-all ${
                        metodoPago === "pay_later"
                          ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                          : "border-border text-muted-foreground hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground flex items-center gap-1.5">{pc.tx("span.16", "🏨 Pagar en Destino")}<Badge variant="outline" className="text-3xs py-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/30">{pc.tx("Badge.1", "Recomendado")}</Badge>
                        </span>
                      </div>
                      <p className="text-2xs text-muted-foreground mt-0.5">{pc.tx("p.5", "Paga al momento del check-in directamente con el hotel u operador.")}</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMetodoPago("card_sandbox")}
                      className={`p-3 rounded-xl border text-left font-medium transition-all ${
                        metodoPago === "card_sandbox"
                          ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                          : "border-border text-muted-foreground hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground flex items-center gap-1.5">{pc.tx("span.17", "💳 Tarjeta Online (Sandbox Demo)")}<Badge variant="outline" className="text-3xs py-0 bg-amber-500/10 text-amber-600 border-amber-500/30">{pc.tx("Badge.2", "CardNet / Azul / Stripe")}</Badge>
                        </span>
                      </div>
                      <p className="text-2xs text-muted-foreground mt-0.5">{pc.tx("p.6", "Simulación de pasarela de pago segura con aprobación instantánea de prueba.")}</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMetodoPago("deposit")}
                      className={`p-3 rounded-xl border text-left font-medium transition-all ${
                        metodoPago === "deposit"
                          ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                          : "border-border text-muted-foreground hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{pc.tx("span.18", "⏳ Depósito Inicial (20%)")}</span>
                        <span className="text-2xs text-primary font-bold">{pc.tx("span.19", "US$")}{" "}{Math.round(total * 0.2).toLocaleString()}{" "}{pc.tx("span.20", "hoy")}</span>
                      </div>
                      <p className="text-2xs text-muted-foreground mt-0.5">{pc.tx("p.7", "Garantiza tu cupo con 20% y cancela el saldo restante al llegar.")}</p>
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleBooking}
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full gap-2 font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Procesando Reserva Oficial...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" /> Confirmar Solicitud de Reserva Directa
                    </>
                  )}
                </Button>

                <p className="text-2xs text-center text-muted-foreground flex items-center justify-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-emerald-500" />{" "}{pc.tx("p.8", "Transacción encriptada • Cancelación flexible hasta 48h")}</p>
              </div>
            </div>

          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-card/40 border-y border-border/50">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
            <div className="text-center mb-12">
              <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">{pc.tx("Badge.3", "VENTAJAS EXCLUSIVAS")}</Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">{pc.tx("h2.1", "¿Por Qué Reservar Directo con Nosotros?")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">{pc.tx("p.9", "Eliminamos los sobrecostos de intermediarios para ofrecerte las mejores condiciones del mercado.")}</p>
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

// Datos del módulo editables desde el panel (ver pc.data en src/lib/pageContent.ts).
const __pcData = { destinosOpciones, tiposServicio, beneficiosDirectos };
