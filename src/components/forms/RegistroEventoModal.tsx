// Formulario público «Registra tu evento»: en 3 pasos y enviado a la API (POST /events/submissions).
// El evento entra como borrador y un administrador lo revisa antes de publicarlo.
import { Honeypot } from "@/components/forms/Honeypot";
import { useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Building2, Check, CheckCircle2, Globe, Loader2, Send } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { fetchApi } from "@/lib/fastifyClient";

/** Cómo se entra al evento, en el vocabulario del servidor. La venta en Descubre RD es de una segunda etapa. */
const TICKET_MODE = { website_redirect: "external", door_only: "none" } as const;
type TicketOption = keyof typeof TICKET_MODE;
const STEPS = ["El evento", "Entradas", "Organizador"] as const;

interface RegistroEventoModalProps {
  open: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
}

const withHttps = (u: string) => (/^https?:\/\//i.test(u) ? u : `https://${u}`);

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function RegistroEventoModal({ open, onClose, onOpenChange }: RegistroEventoModalProps) {
  const [step, setStep] = useState(0); // 0-2 pasos del formulario, 3 enviado
  const [loading, setLoading] = useState(false);

  const [eventName, setEventName] = useState("");
  const [category, setCategory] = useState("concierto");
  const [destination, setDestination] = useState("Santo Domingo");
  const [venue, setVenue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("18:00");
  const [description, setDescription] = useState("");
  const [ticketOption, setTicketOption] = useState<TicketOption>("website_redirect");
  const [websiteTicketUrl, setWebsiteTicketUrl] = useState("");
  const [priceType, setPriceType] = useState<"free" | "paid">("paid");
  const [priceRange, setPriceRange] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [organizerEmail, setOrganizerEmail] = useState("");
  const [organizerPhone, setOrganizerPhone] = useState("");

  const today = new Date(Date.now() - 4 * 3600_000).toISOString().slice(0, 10);

  /** Qué falta en cada paso; null si se puede seguir. */
  const missing = (s: number): string | null => {
    if (s === 0) {
      if (!eventName.trim()) return "Escribe el nombre del evento.";
      if (!venue.trim()) return "Indica el lugar o recinto.";
      if (!startDate) return "Elige la fecha.";
      if (description.trim().length < 20) return "Describe el evento con al menos 20 caracteres.";
    }
    if (s === 1 && ticketOption === "website_redirect" && !websiteTicketUrl.trim()) return "Pega el enlace donde se compran las entradas.";
    if (s === 2) {
      if (!organizerName.trim()) return "Escribe el nombre del organizador.";
      if (!/^\S+@\S+\.\S+$/.test(organizerEmail.trim())) return "Escribe un correo válido.";
    }
    return null;
  };

  const reset = () => {
    setStep(0); setEventName(""); setVenue(""); setStartDate(""); setStartTime("18:00"); setDescription("");
    setWebsiteTicketUrl(""); setPriceRange(""); setOrganizerName(""); setOrganizerEmail(""); setOrganizerPhone("");
  };
  const close = () => { reset(); onClose?.(); onOpenChange?.(false); };

  const next = () => {
    const m = missing(step);
    if (m) { toast.error(m); return; }
    setStep((s) => s + 1);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) { next(); return; }
    for (const s of [0, 1, 2]) {
      const m = missing(s);
      if (m) { setStep(s); toast.error(m); return; }
    }
    setLoading(true);
    try {
      await fetchApi("/events/submissions", {
        method: "POST",
        body: JSON.stringify({
          title: eventName.trim(),
          start_date: startDate,
          start_time: startTime || undefined,
          location: `${venue.trim()}, ${destination}`,
          description: description.trim(),
          category,
          organizer_name: organizerName.trim(),
          organizer_email: organizerEmail.trim(),
          organizer_phone: organizerPhone.trim() || undefined,
          ticket_mode: TICKET_MODE[ticketOption],
          ticket_url: ticketOption === "website_redirect" ? withHttps(websiteTicketUrl.trim()) : undefined,
          price_info: priceType === "free" ? "Entrada libre" : priceRange.trim() || undefined,
        }),
      });
      setStep(3);
    } catch (err) {
      toast.error("No se pudo enviar el evento", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setLoading(false);
    }
  };

  const option = (value: TicketOption, Icon: typeof Globe, title: string, text: string) => (
    <label className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors ${ticketOption === value ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/40"}`}>
      <input type="radio" name="ticket-option" className="sr-only" checked={ticketOption === value} onChange={() => setTicketOption(value)} />
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
      <span>
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        <span className="mt-0.5 block text-sm text-muted-foreground">{text}</span>
      </span>
    </label>
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => (!isOpen ? close() : undefined)}>
      <DialogContent className="flex max-h-[92dvh] w-[calc(100%-2rem)] max-w-xl flex-col gap-0 overflow-hidden rounded-2xl border-border bg-card p-0">
        {step === 3 ? (
          <div className="space-y-4 px-6 py-12 text-center sm:px-10">
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" aria-hidden />
            <DialogTitle className="font-display text-2xl font-bold">Evento enviado</DialogTitle>
            <DialogDescription className="mx-auto max-w-sm text-sm leading-relaxed">
              Recibimos <strong className="text-foreground">{eventName}</strong>. El equipo lo revisará y, si lo aprueba, saldrá en la agenda de eventos.
              Te escribiremos a {organizerEmail} si necesitamos algo más.
            </DialogDescription>
            <Button onClick={close} className="mt-2 px-8">Volver a Eventos</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col"><Honeypot />
            <DialogHeader className="space-y-4 border-b border-border px-6 pb-5 pt-6 text-left sm:px-8">
              <div>
                <DialogTitle className="font-display text-2xl font-bold">Registra tu evento</DialogTitle>
                <DialogDescription className="mt-1 text-sm">
                  Gratis. Lo revisamos y, si encaja, lo publicamos en la agenda de Descubre RD.
                </DialogDescription>
              </div>
              <ol className="flex items-center gap-2" aria-label="Pasos">
                {STEPS.map((label, i) => (
                  <li key={label} className="flex flex-1 items-center gap-2" aria-current={i === step ? "step" : undefined}>
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${i < step ? "bg-primary text-primary-foreground" : i === step ? "border-2 border-primary text-primary" : "border border-border text-muted-foreground"}`}>
                      {i < step ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
                    </span>
                    <span className={`truncate text-sm ${i === step ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{label}</span>
                  </li>
                ))}
              </ol>
            </DialogHeader>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-6 sm:px-8">
              {step === 0 ? <>
                <Field id="ev-name" label="Nombre del evento">
                  <Input id="ev-name" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Ej. Festival de Jazz de Punta Cana" maxLength={200} autoFocus />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="ev-cat" label="Categoría">
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="ev-cat"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="concierto">Concierto o música en vivo</SelectItem>
                        <SelectItem value="festival">Festival cultural o gastronómico</SelectItem>
                        <SelectItem value="teatro">Teatro y artes escénicas</SelectItem>
                        <SelectItem value="deportes">Deportes</SelectItem>
                        <SelectItem value="conferencia">Feria o congreso</SelectItem>
                        <SelectItem value="vida_nocturna">Fiesta y vida nocturna</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field id="ev-dest" label="Destino">
                    <Select value={destination} onValueChange={setDestination}>
                      <SelectTrigger id="ev-dest"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Santo Domingo">Santo Domingo</SelectItem>
                        <SelectItem value="Punta Cana">Punta Cana y Bávaro</SelectItem>
                        <SelectItem value="Puerto Plata">Puerto Plata, Cabarete y Sosúa</SelectItem>
                        <SelectItem value="Samaná">Samaná y Las Terrenas</SelectItem>
                        <SelectItem value="Santiago">Santiago</SelectItem>
                        <SelectItem value="La Romana">La Romana y Bayahíbe</SelectItem>
                        <SelectItem value="Jarabacoa">Jarabacoa y Constanza</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field id="ev-venue" label="Lugar o recinto">
                  <Input id="ev-venue" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Ej. Anfiteatro de Altos de Chavón" maxLength={250} />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="ev-date" label="Fecha"><Input id="ev-date" type="date" min={today} value={startDate} onChange={(e) => setStartDate(e.target.value)} /></Field>
                  <Field id="ev-time" label="Hora (opcional)"><Input id="ev-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></Field>
                </div>
                <Field id="ev-desc" label="Descripción" hint={`Artistas, público, qué se va a vivir. Mínimo 20 caracteres (${description.trim().length}).`}>
                  <Textarea id="ev-desc" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={5000} className="resize-y" />
                </Field>
              </> : null}

              {step === 1 ? <>
                <fieldset className="space-y-3">
                  <legend className="mb-1 text-sm font-medium">¿Cómo se consiguen las entradas?</legend>
                  {option("website_redirect", Globe, "En otra web o boletería", "Uepa Tickets, Tuboleta, tu propia web… Enlazamos ahí.")}
                  {option("door_only", Building2, "En la puerta o entrada libre", "Sin venta previa en internet.")}
                </fieldset>
                {ticketOption === "website_redirect" ? (
                  <Field id="ev-url" label="Enlace de compra">
                    <Input id="ev-url" type="url" inputMode="url" value={websiteTicketUrl} onChange={(e) => setWebsiteTicketUrl(e.target.value)} placeholder="https://…" />
                  </Field>
                ) : null}
                <fieldset className="space-y-1.5">
                  <legend className="text-sm font-medium">Precio</legend>
                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant={priceType === "paid" ? "default" : "outline"} aria-pressed={priceType === "paid"} onClick={() => setPriceType("paid")}>De pago</Button>
                    <Button type="button" variant={priceType === "free" ? "default" : "outline"} aria-pressed={priceType === "free"} onClick={() => setPriceType("free")}>Gratis</Button>
                  </div>
                </fieldset>
                {priceType === "paid" ? (
                  <Field id="ev-price" label="Precio o rango (opcional)">
                    <Input id="ev-price" value={priceRange} onChange={(e) => setPriceRange(e.target.value)} placeholder="Ej. RD$ 1,500 – 4,500" maxLength={120} />
                  </Field>
                ) : null}
              </> : null}

              {step === 2 ? <>
                <Field id="ev-org" label="Organizador o productora">
                  <Input id="ev-org" value={organizerName} onChange={(e) => setOrganizerName(e.target.value)} autoComplete="organization" maxLength={200} />
                </Field>
                <Field id="ev-email" label="Correo de contacto" hint="No se publica. Solo lo usamos para hablar contigo sobre el evento.">
                  <Input id="ev-email" type="email" value={organizerEmail} onChange={(e) => setOrganizerEmail(e.target.value)} autoComplete="email" />
                </Field>
                <Field id="ev-phone" label="Teléfono o WhatsApp (opcional)">
                  <Input id="ev-phone" type="tel" value={organizerPhone} onChange={(e) => setOrganizerPhone(e.target.value)} autoComplete="tel" placeholder="+1 809 000 0000" />
                </Field>
              </> : null}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4 sm:px-8">
              {step === 0
                ? <Button type="button" variant="ghost" onClick={close}>Cancelar</Button>
                : <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}><ArrowLeft className="mr-1.5 h-4 w-4" />Atrás</Button>}
              {step < 2
                ? <Button type="button" onClick={next}>Siguiente<ArrowRight className="ml-1.5 h-4 w-4" /></Button>
                : <Button type="submit" disabled={loading}>{loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Send className="mr-1.5 h-4 w-4" />}Enviar a revisión</Button>}
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
