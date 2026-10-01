import { useState } from "react";
import { 
  Calendar, Ticket, Globe, Sparkles, Building2, 
  Clock, MapPin, DollarSign, Image as ImageIcon,
  Send, AlertCircle, ExternalLink, ShieldCheck
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface RegistroEventoModalProps {
  open: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
}

export function RegistroEventoModal({ open, onClose }: RegistroEventoModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  // Form states
  const [eventName, setEventName] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [organizerEmail, setOrganizerEmail] = useState("");
  const [organizerPhone, setOrganizerPhone] = useState("");
  const [category, setCategory] = useState("concierto");
  const [destination, setDestination] = useState("Santo Domingo");
  const [venue, setVenue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("18:00");
  const [priceType, setPriceType] = useState<"free" | "paid">("paid");
  const [priceRange, setPriceRange] = useState("");
  const [ticketSalesOption, setTicketSalesOption] = useState<"website_redirect" | "native_checkout" | "door_only">("website_redirect");
  const [websiteTicketUrl, setWebsiteTicketUrl] = useState("");
  const [description, setDescription] = useState("");
  const [promotionalTier, setPromotionalTier] = useState<"standard" | "featured_banner" | "push_newsletter">("featured_banner");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventName.trim() || !organizerName.trim() || !organizerEmail.trim() || !venue.trim() || !startDate) {
      toast.error("Por favor completa los campos obligatorios del evento.");
      return;
    }

    setLoading(true);

    try {
      // Save to organizer events repository in localStorage
      const newOrganizerEvent = {
        id: `evt-${Date.now()}`,
        name: eventName.trim(),
        event_type: category.charAt(0).toUpperCase() + category.slice(1),
        province: destination,
        venue: venue.trim(),
        start_date: startDate,
        start_time: startTime,
        price_type: priceType,
        price_range: priceType === "free" ? "Entrada Libre (Gratis)" : priceRange || "RD$ 500+",
        status: "published",
        max_capacity: 500,
        total_registered: 0,
        organizer: organizerName.trim(),
        image_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&fit=crop&q=80"
      };

      const existingEvents = JSON.parse(localStorage.getItem("dr_organizer_events") || "[]");
      existingEvents.unshift(newOrganizerEvent);
      localStorage.setItem("dr_organizer_events", JSON.stringify(existingEvents));

      setStep(2);
      toast.info("Borrador guardado en este navegador", {
        description: "La solicitud no se envio al equipo ni se publico en el portal."
      });
    } catch (err) {
      toast.error("No se pudo guardar el borrador local. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setEventName("");
    setOrganizerName("");
    setOrganizerEmail("");
    setOrganizerPhone("");
    setVenue("");
    setStartDate("");
    setPriceRange("");
    setWebsiteTicketUrl("");
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => (!isOpen ? handleReset() : undefined)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border-border bg-card">
        {step === 1 ? (
          <div>
            <DialogHeader className="mb-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-2 w-fit">
                <Ticket className="h-3.5 w-3.5" /> Portal B2B para Organizadores de Eventos
              </div>
              <DialogTitle className="font-display text-2xl font-bold text-foreground">
                Registra tu Evento en Descubre RD
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Gana visibilidad ante cientos de miles de turistas y dominicanos. Redirige a tu boletería oficial o activa la venta directa de taquillas.
                <span className="block mt-2 font-medium">Vista previa local: no se envian solicitudes ni datos de contacto al equipo.</span>
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Básica */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/80 pb-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Datos Principales del Evento
                </h4>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Nombre del Evento *
                    </label>
                    <Input
                      placeholder="Ej. Festival de Jazz Punta Cana 2026 / Concierto Sinfónico"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      required
                      className="rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Categoría del Evento
                    </label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="rounded-xl text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="concierto">Concierto / Música en Vivo</SelectItem>
                        <SelectItem value="festival">Festival Cultural / Gastronómico</SelectItem>
                        <SelectItem value="teatro">Teatro & Artes Escénicas</SelectItem>
                        <SelectItem value="deportes">Torneo Deportivo / Golf / Surf</SelectItem>
                        <SelectItem value="conferencia">Feria Comercial / Congreso (MICE)</SelectItem>
                        <SelectItem value="vida_nocturna">Fiesta & Vida Nocturna</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Destino / Provincia
                    </label>
                    <Select value={destination} onValueChange={setDestination}>
                      <SelectTrigger className="rounded-xl text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Santo Domingo">Santo Domingo / Distrito Nacional</SelectItem>
                        <SelectItem value="Punta Cana">Punta Cana / Bávaro / Cap Cana</SelectItem>
                        <SelectItem value="Puerto Plata">Puerto Plata / Cabarete / Sosúa</SelectItem>
                        <SelectItem value="Samaná">Samaná / Las Terrenas</SelectItem>
                        <SelectItem value="Santiago">Santiago de los Caballeros</SelectItem>
                        <SelectItem value="La Romana">La Romana / Bayahibe</SelectItem>
                        <SelectItem value="Jarabacoa">Jarabacoa / Constanza</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Lugar o Recinto (Venue) *
                    </label>
                    <Input
                      placeholder="Ej. Estadio Olímpico / Anfiteatro Altos de Chavón"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      required
                      className="rounded-xl text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Fecha *
                      </label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        className="rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Hora
                      </label>
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Opciones de Venta de Boletas & Taquillas */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/80 pb-2">
                  <Ticket className="h-4 w-4 text-primary" /> Modalidad de Taquillas & Venta
                </h4>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div 
                    onClick={() => setTicketSalesOption("website_redirect")}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                      ticketSalesOption === "website_redirect" 
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-sm" 
                        : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Globe className="h-4 w-4 text-primary" />
                      <Badge variant="secondary" className="text-[9px]">Recomendado</Badge>
                    </div>
                    <p className="text-xs font-bold text-foreground">Redirección a mi Web / Boletería</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Uea.com, Tuboleta, TuTicket o tu propia web oficial.
                    </p>
                  </div>

                  <div 
                    onClick={() => setTicketSalesOption("native_checkout")}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                      ticketSalesOption === "native_checkout" 
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-sm" 
                        : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Ticket className="h-4 w-4 text-amber-500" />
                      <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[9px] border-0">Segunda Etapa</Badge>
                    </div>
                    <p className="text-xs font-bold text-foreground">Comprar Taquillas en Descubre RD</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Venta directa con tarjeta / Apple Pay integrado (Fase 2).
                    </p>
                  </div>

                  <div 
                    onClick={() => setTicketSalesOption("door_only")}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                      ticketSalesOption === "door_only" 
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-sm" 
                        : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs font-bold text-foreground">Venta Solo en Puerta</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Venta presencial o evento de entrada libre.
                    </p>
                  </div>
                </div>

                {ticketSalesOption === "website_redirect" && (
                  <div className="animate-in fade-in duration-200">
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Enlace Oficial de Compra / Sitio Web *
                    </label>
                    <Input
                      type="url"
                      placeholder="https://tuboleta.com.do/evento o https://mifestival.com"
                      value={websiteTicketUrl}
                      onChange={(e) => setWebsiteTicketUrl(e.target.value)}
                      required={ticketSalesOption === "website_redirect"}
                      className="rounded-xl text-xs font-mono"
                    />
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Tipo de Entrada
                    </label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={priceType === "paid" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPriceType("paid")}
                        className="w-1/2 text-xs rounded-xl"
                      >
                        De Pago
                      </Button>
                      <Button
                        type="button"
                        variant={priceType === "free" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPriceType("free")}
                        className="w-1/2 text-xs rounded-xl"
                      >
                        Entrada Gratis
                      </Button>
                    </div>
                  </div>

                  {priceType === "paid" && (
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Rango de Precio Estimado
                      </label>
                      <Input
                        placeholder="Ej. RD$ 1,500 - RD$ 4,500 / US$ 50"
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="rounded-xl text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Datos de Contacto del Organizador */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/80 pb-2">
                  <Building2 className="h-4 w-4 text-primary" /> Datos del Organizador o Productora
                </h4>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Empresa / Productora *
                    </label>
                    <Input
                      placeholder="Ej. Producciones SD / Hotel Resort"
                      value={organizerName}
                      onChange={(e) => setOrganizerName(e.target.value)}
                      required
                      className="rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Email de Contacto *
                    </label>
                    <Input
                      type="email"
                      placeholder="eventos@tuempresa.com"
                      value={organizerEmail}
                      onChange={(e) => setOrganizerEmail(e.target.value)}
                      required
                      className="rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Teléfono / WhatsApp *
                    </label>
                    <Input
                      type="tel"
                      placeholder="+1 (809) 000-0000"
                      value={organizerPhone}
                      onChange={(e) => setOrganizerPhone(e.target.value)}
                      required
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Descripción del Evento & Artistas Invitados
                  </label>
                  <Textarea
                    placeholder="Describe los headliners, experiencia, tipo de público y detalles que enamoren al viajero..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="rounded-xl text-xs resize-none"
                  />
                </div>
              </div>

              {/* Botón de Envío */}
              <div className="pt-2 flex items-center justify-between gap-4">
                <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl text-xs">
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="rounded-xl text-xs font-bold gap-2 px-6 h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                >
                  <Send className="h-4 w-4" />
                  {loading ? "Guardando borrador..." : "Guardar borrador local"}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center mx-auto mb-2">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground">
              Borrador local creado
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              El borrador de <strong>{eventName}</strong> solo esta guardado en este navegador. No se envio al equipo ni se publicara hasta conectar un servicio de registro.
            </p>
            <Button onClick={handleReset} className="rounded-xl text-xs font-bold px-8 mt-4">
              Entendido, volver a Eventos
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
