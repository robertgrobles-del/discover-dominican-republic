import { useState, useRef } from "react";
import { 
  Ticket, Calendar, MapPin, Clock, CheckCircle2, 
  Download, Printer, Share2, Sparkles, User, Mail, 
  Phone, Users, ShieldCheck, ArrowRight, X, QrCode as QrIcon
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useGamification } from "@/hooks/useGamification";
import { trackEvent } from "@/hooks/useAnalytics";

export interface FreeTicketData {
  ticketId: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  province: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  quantity: number;
  companions: string[];
  issuedAt: string;
  qrPayload: string;
  status: "active" | "used" | "cancelled";
}

interface FreeTicketModalProps {
  open: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  eventName?: string;
  eventDate?: string;
  event?: {
    id: string;
    name: string;
    start_date?: string;
    start_time?: string;
    venue?: string;
    province?: string;
    organizer?: string;
    image_url?: string;
  };
}

export function FreeTicketModal({ open, onClose, event }: FreeTicketModalProps) {
  const [step, setStep] = useState<"form" | "ticket">("form");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [companionNames, setCompanionNames] = useState<string[]>([]);
  const [generatedTicket, setGeneratedTicket] = useState<FreeTicketData | null>(null);

  const ticketRef = useRef<HTMLDivElement>(null);
  const { awardXp } = useGamification();

  const handleQuantityChange = (qty: number) => {
    const validQty = Math.max(1, Math.min(5, qty));
    setQuantity(validQty);
    
    // Adjust companion slots
    const companionCount = validQty - 1;
    setCompanionNames((prev) => {
      const next = [...prev];
      if (next.length < companionCount) {
        while (next.length < companionCount) next.push("");
      } else {
        return next.slice(0, companionCount);
      }
      return next;
    });
  };

  const handleCompanionNameChange = (index: number, val: string) => {
    setCompanionNames((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error("Por favor completa tu nombre y correo electrónico.");
      return;
    }

    setLoading(true);

    try {
      const randomCode = Math.floor(100000 + Math.random() * 900000);
      const ticketId = `DR-TKT-${randomCode}`;
      const now = new Date().toISOString();

      const newTicket: FreeTicketData = {
        ticketId,
        eventId: event.id,
        eventName: event.name,
        eventDate: event.start_date || "2026-11-06",
        eventTime: event.start_time || "19:00",
        venue: event.venue || "República Dominicana",
        province: event.province || "Nacional",
        attendeeName: name.trim(),
        attendeeEmail: email.trim(),
        attendeePhone: phone.trim() || "No especificado",
        quantity,
        companions: companionNames.filter((c) => c.trim().length > 0),
        issuedAt: now,
        qrPayload: `https://descubrerd.do/verify-ticket?code=${ticketId}&event=${encodeURIComponent(event.name)}`,
        status: "active",
      };

      // 1. Save in local user tickets
      const existingUserTickets: FreeTicketData[] = JSON.parse(
        localStorage.getItem("dr_my_tickets") || "[]"
      );
      existingUserTickets.unshift(newTicket);
      localStorage.setItem("dr_my_tickets", JSON.stringify(existingUserTickets));

      // 2. Save in event attendee registry for the organizer dashboard
      const existingRegistrations = JSON.parse(
        localStorage.getItem("dr_event_registrations") || "{}"
      );
      if (!existingRegistrations[event.id]) {
        existingRegistrations[event.id] = [];
      }
      existingRegistrations[event.id].unshift(newTicket);
      localStorage.setItem("dr_event_registrations", JSON.stringify(existingRegistrations));

      // Optional measurement; consent-gated and excludes attendee, ticket, and event identifiers.
      trackEvent("free_ticket_registered", { quantity });

      // 4. Gamification points
      awardXp(50, 0, `Entrada gratuita obtenida: ${event.name}`, "free_ticket_obtained", event.id);

      setGeneratedTicket(newTicket);
      setStep("ticket");
      toast.success("¡Pase Digital emitido con éxito! 🇩🇴🎟️", {
        description: `Código de Entrada: ${ticketId} (+50 Puntos de Explorador)`
      });
    } catch (err) {
      console.error("Error al generar boleta:", err);
      toast.error("Ocurrió un error al emitir tu entrada. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareTicket = () => {
    if (navigator.share && generatedTicket) {
      navigator.share({
        title: `Mi Entrada a ${generatedTicket.eventName}`,
        text: `¡Tengo mi entrada para ${generatedTicket.eventName}! Código: ${generatedTicket.ticketId}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `Entrada confirmada para ${generatedTicket?.eventName}. Código de pase: ${generatedTicket?.ticketId}`
      );
      toast.success("Información del pase copiada al portapapeles");
    }
  };

  const handleAddToCalendar = () => {
    if (!generatedTicket) return;
    const title = encodeURIComponent(generatedTicket.eventName);
    const details = encodeURIComponent(
      `Pase de entrada: ${generatedTicket.ticketId} | Titular: ${generatedTicket.attendeeName} (${generatedTicket.quantity} boletas)`
    );
    const location = encodeURIComponent(`${generatedTicket.venue}, ${generatedTicket.province}`);
    const dateFormatted = generatedTicket.eventDate.replace(/-/g, "");
    const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dateFormatted}T140000Z/${dateFormatted}T230000Z`;
    window.open(calUrl, "_blank");
  };

  const handleReset = () => {
    setStep("form");
    setName("");
    setEmail("");
    setPhone("");
    setQuantity(1);
    setCompanionNames([]);
    setGeneratedTicket(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => (!isOpen ? handleReset() : undefined)}>
      <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border-border bg-card">
        {step === "form" ? (
          <div>
            <DialogHeader className="mb-6 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold mb-2 w-fit">
                <Ticket className="h-3.5 w-3.5" /> Acceso Gratuito • Entrada 100% Libre
              </div>
              <DialogTitle className="font-display text-2xl font-bold text-foreground">
                Obtén tu Entrada Digital
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Regístrate para recibir tu pase oficial con código QR al instante para <strong>{event.name}</strong>.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Event preview strip */}
              <div className="p-4 rounded-2xl bg-muted/60 border border-border/80 flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-foreground text-sm line-clamp-1">{event.name}</p>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {event.start_date || "Fecha por confirmar"} • {event.start_time || "19:00"}
                  </p>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-primary" /> {event.venue || "Lugar oficial"}, {event.province}
                  </p>
                </div>
              </div>

              {/* Attendee Form */}
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-semibold text-foreground mb-1 block">
                    Nombre Completo del Titular *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Ej. Juan Pérez Rosario"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="pl-9 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-foreground mb-1 block">
                      Correo Electrónico *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="tu@correo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-9 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-foreground mb-1 block">
                      Teléfono / WhatsApp (Opcional)
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="tel"
                        placeholder="809-555-0199"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-9 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Number of passes */}
                <div>
                  <Label className="text-xs font-semibold text-foreground mb-1.5 flex items-center justify-between">
                    <span>Cantidad de Pases / Acompañantes</span>
                    <span className="text-primary font-bold">{quantity} {quantity === 1 ? "Entrada" : "Entradas"}</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleQuantityChange(num)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          quantity === num
                            ? "bg-primary text-slate-950 border-primary shadow-sm"
                            : "bg-background hover:bg-muted text-foreground border-border"
                        }`}
                      >
                        {num} {num === 1 ? "Pase" : "Pases"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Companions fields if > 1 */}
                {quantity > 1 && (
                  <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/80 space-y-2.5">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Nombres de los Acompañantes (Opcional)
                    </span>
                    {Array.from({ length: quantity - 1 }).map((_, idx) => (
                      <Input
                        key={idx}
                        placeholder={`Acompañante ${idx + 1}`}
                        value={companionNames[idx] || ""}
                        onChange={(e) => handleCompanionNameChange(idx, e.target.value)}
                        className="rounded-xl text-xs bg-background"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Gamification incentive */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
                <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                <span>Al registrarte ganarás <strong>+50 Puntos de Explorador</strong> en tu Pasaporte Turístico Dominicano.</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button type="button" variant="ghost" onClick={handleReset} className="rounded-xl text-xs">
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 text-slate-950 font-bold rounded-xl text-xs px-6 shadow-md shadow-primary/20 gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {loading ? "Generando Entrada..." : "Generar Entrada Gratuita"}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          /* STEP 2: GENERATED TICKET VIEW */
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center mb-2">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <DialogTitle className="font-display text-2xl font-bold text-foreground">
                ¡Tu Entrada está Lista!
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Presenta este código QR o pase digital al ingresar al recinto del evento.
              </DialogDescription>
            </div>

            {/* DIGITAL TICKET BOARDING PASS CARD */}
            {generatedTicket && (
              <div
                ref={ticketRef}
                className="relative rounded-3xl overflow-hidden border-2 border-primary/40 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white shadow-2xl p-6 sm:p-8"
              >
                {/* Decorative background watermark */}
                <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Ticket Top Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🇩🇴</span>
                    <div>
                      <span className="font-display text-sm font-black tracking-wide text-white">DESCUBRE RD</span>
                      <span className="block text-[9px] uppercase font-bold text-primary tracking-widest">Pase Oficial de Acceso</span>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5">
                    Entrada Válida
                  </Badge>
                </div>

                {/* Event Title & Details */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-primary font-bold">Evento</span>
                    <h3 className="font-display text-xl sm:text-2xl font-black text-white leading-tight">
                      {generatedTicket.eventName}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-semibold block">Fecha</span>
                      <span className="font-bold text-slate-100">{generatedTicket.eventDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-semibold block">Hora</span>
                      <span className="font-bold text-slate-100">{generatedTicket.eventTime}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[10px] uppercase text-slate-400 font-semibold block">Entradas</span>
                      <span className="font-bold text-primary">{generatedTicket.quantity} {generatedTicket.quantity === 1 ? "Persona" : "Personas"}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">Ubicación / Recinto</span>
                    <span className="font-bold text-slate-200 text-xs flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      {generatedTicket.venue}, {generatedTicket.province}
                    </span>
                  </div>

                  <div className="border-t border-dashed border-white/20 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-semibold block">Titular del Pase</span>
                      <span className="font-black text-sm text-white">{generatedTicket.attendeeName}</span>
                      <span className="block text-[11px] text-slate-400">{generatedTicket.attendeeEmail}</span>
                      {generatedTicket.companions.length > 0 && (
                        <span className="block text-[10px] text-slate-400 mt-1 italic">
                          Acompañantes: {generatedTicket.companions.join(", ")}
                        </span>
                      )}
                    </div>

                    {/* QR Code Representation */}
                    <div className="flex flex-col items-center p-3 rounded-2xl bg-white text-slate-950 shadow-inner shrink-0">
                      <svg
                        className="w-24 h-24"
                        viewBox="0 0 100 100"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* Simulated realistic QR SVG pattern */}
                        <rect width="100" height="100" fill="white" />
                        <rect x="10" y="10" width="28" height="28" fill="black" />
                        <rect x="14" y="14" width="20" height="20" fill="white" />
                        <rect x="18" y="18" width="12" height="12" fill="black" />

                        <rect x="62" y="10" width="28" height="28" fill="black" />
                        <rect x="66" y="14" width="20" height="20" fill="white" />
                        <rect x="70" y="18" width="12" height="12" fill="black" />

                        <rect x="10" y="62" width="28" height="28" fill="black" />
                        <rect x="14" y="66" width="20" height="20" fill="white" />
                        <rect x="18" y="70" width="12" height="12" fill="black" />

                        <rect x="42" y="14" width="6" height="6" fill="black" />
                        <rect x="50" y="18" width="6" height="6" fill="black" />
                        <rect x="42" y="26" width="6" height="6" fill="black" />
                        <rect x="50" y="32" width="6" height="6" fill="black" />

                        <rect x="14" y="44" width="6" height="6" fill="black" />
                        <rect x="24" y="48" width="6" height="6" fill="black" />
                        <rect x="34" y="44" width="6" height="6" fill="black" />
                        <rect x="44" y="44" width="12" height="12" fill="black" />
                        <rect x="60" y="44" width="6" height="6" fill="black" />
                        <rect x="72" y="44" width="12" height="6" fill="black" />
                        <rect x="88" y="48" width="6" height="6" fill="black" />

                        <rect x="44" y="62" width="6" height="12" fill="black" />
                        <rect x="54" y="66" width="12" height="6" fill="black" />
                        <rect x="70" y="62" width="18" height="6" fill="black" />
                        <rect x="70" y="72" width="6" height="16" fill="black" />
                        <rect x="80" y="76" width="10" height="6" fill="black" />
                        <rect x="54" y="80" width="8" height="8" fill="black" />
                        <rect x="44" y="84" width="6" height="6" fill="black" />
                      </svg>
                      <span className="font-mono text-[10px] font-black tracking-widest mt-1 text-slate-900">
                        {generatedTicket.ticketId}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Pase Digital Oficial No Transferible
                  </span>
                  <span>Emitido: {new Date(generatedTicket.issuedAt).toLocaleDateString()}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="rounded-xl text-xs gap-1.5"
              >
                <Printer className="h-3.5 w-3.5 text-primary" />
                <span>Imprimir</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleAddToCalendar}
                className="rounded-xl text-xs gap-1.5"
              >
                <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                <span>Calendario</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleShareTicket}
                className="rounded-xl text-xs gap-1.5"
              >
                <Share2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>Compartir</span>
              </Button>

              <Button
                size="sm"
                onClick={handleReset}
                className="bg-primary text-slate-950 font-bold rounded-xl text-xs"
              >
                <span>Listo</span>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
