import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Award, Download, Mic, Users, Link as LinkIcon, DollarSign,
  FileText, Plus, Percent, ShoppingBag, QrCode, Camera,
  Loader2, CheckCircle2, XCircle, Calendar, Briefcase
} from "lucide-react";

/* ==========================================================================
   MODULE 1: GUIDE TOOLS MODULE (businessType === 'guia')
   ========================================================================== */
export function GuideToolsModule({ userId, businessName }: { userId?: string, businessName: string }) {
  // Silent Guide State
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastUsers, setBroadcastUsers] = useState(0);
  const roomCode = `COLONIAL-${userId?.substring(0, 4).toUpperCase() || "LIVE"}`;

  // Tips log
  const mockTips = [
    { id: 1, tourist: "David Miller (USA)", amount: 15, date: "Hoy, 15:42" },
    { id: 2, tourist: "Emma Watson (UK)", amount: 25, date: "Hoy, 12:10" },
    { id: 3, tourist: "Jean Pierre (FR)", amount: 20, date: "Ayer, 18:30" }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBroadcasting) {
      setBroadcastUsers(12);
      interval = setInterval(() => {
        setBroadcastUsers(prev => prev + (Math.random() > 0.5 ? 1 : -1));
      }, 5000);
    } else {
      setBroadcastUsers(0);
    }
    return () => clearInterval(interval);
  }, [isBroadcasting]);

  const handleCopyBroadcastLink = () => {
    const link = `${window.location.origin}/silent-guide?room=${roomCode}`;
    navigator.clipboard.writeText(link);
    toast.success("¡Enlace de transmisión copiado al portapapeles!");
  };

  const handleDownloadCredential = () => {
    toast.success("Descargando credencial digital de Guía en formato PDF...");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Official License Badge Card */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
            <Award className="h-5 w-5 text-amber-500 fill-amber-500" />
            Credencial Oficial
          </CardTitle>
          <CardDescription>Licencia autorizada por el Ministerio de Turismo.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {/* Badge Visual Design */}
          <div className="w-full max-w-[280px] bg-gradient-to-b from-indigo-900 to-indigo-950 text-white rounded-2xl p-5 shadow-lg border-2 border-amber-500 relative overflow-hidden text-center aspect-[2/3] flex flex-col justify-between">
            {/* Crest / Flag simulation */}
            <div className="flex justify-between items-center text-[8px] tracking-widest font-bold opacity-80 uppercase">
              <span>MITUR RD</span>
              <span className="text-amber-500">LICENCIA VIGENTE</span>
            </div>

            <div className="my-auto space-y-4 flex flex-col items-center">
              {/* Photo placeholder */}
              <div className="w-20 h-20 rounded-full border-2 border-amber-500 bg-white/10 flex items-center justify-center text-3xl overflow-hidden shadow">
                👤
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">{businessName || "Guía Autorizado"}</h4>
                <p className="text-[10px] text-amber-400 font-mono mt-0.5">ID: LIC-MITUR-2026-{(userId || "0000").substring(0,4)}</p>
              </div>

              {/* QR Code pointing to public verify / silent guide */}
              <div className="bg-white p-1.5 rounded-lg inline-block shadow">
                <svg viewBox="0 0 100 100" className="w-14 h-14">
                  <rect x="0" y="0" width="100" height="100" fill="white" />
                  <rect x="5" y="5" width="25" height="25" fill="black" />
                  <rect x="9" y="9" width="17" height="17" fill="white" />
                  <rect x="70" y="5" width="25" height="25" fill="black" />
                  <rect x="74" y="9" width="17" height="17" fill="white" />
                  <rect x="5" y="70" width="25" height="25" fill="black" />
                  <rect x="9" y="74" width="17" height="17" fill="white" />
                  <rect x="40" y="40" width="20" height="20" fill="black" />
                  <rect x="70" y="70" width="25" height="25" fill="black" />
                </svg>
              </div>
            </div>

            <div className="text-[7px] leading-relaxed opacity-70">
              Escanea para verificar validez y unirse al grupo de audio digital.
            </div>
          </div>

          <Button variant="outline" className="w-full mt-6 gap-2" onClick={handleDownloadCredential}>
            <Download className="h-4 w-4" />
            Descargar PDF Oficial
          </Button>
        </CardContent>
      </Card>

      {/* 2. Silent Guide Transmitter Card */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
            <Mic className="h-5 w-5 text-primary" />
            Silent Guide Transmitter
          </CardTitle>
          <CardDescription>Habla por tu micrófono y transmite en vivo a tus turistas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/40 p-4 rounded-xl border border-border text-center space-y-4">
            {isBroadcasting ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="text-sm font-bold text-red-500 uppercase tracking-wider">Transmitiendo en Vivo</span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Código de Sala</div>
                  <div className="text-2xl font-black text-foreground tracking-widest">{roomCode}</div>
                </div>

                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {broadcastUsers} turistas escuchándote
                </div>

                {/* Animated visualizer simulator */}
                <div className="h-8 flex items-center justify-center gap-1">
                  {[...Array(6)].map((_, i) => {
                    const heights = ["h-3", "h-5", "h-4", "h-6", "h-2", "h-5"];
                    return (
                      <div
                        key={i}
                        className={`w-1.5 bg-primary rounded-full animate-pulse ${heights[i % heights.length]}`}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-6 space-y-2">
                <p className="text-sm text-muted-foreground">La transmisión se encuentra apagada.</p>
                <p className="text-xs text-muted-foreground/70">Tus oyentes no podrán escuchar audio hasta que inicies.</p>
              </div>
            )}

            <Button
              className={`w-full font-bold h-11 ${isBroadcasting ? "bg-red-500 hover:bg-red-600 text-white" : "bg-primary hover:bg-primary/90 text-white"}`}
              onClick={() => setIsBroadcasting(!isBroadcasting)}
            >
              {isBroadcasting ? "Detener Transmisión" : "Iniciar Transmisión de Audio"}
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Enlace del Grupo de Turistas</Label>
            <div className="flex gap-2">
              <Input
                value={`${window.location.origin}/silent-guide?room=${roomCode}`}
                readOnly
                className="font-mono text-xs h-9 bg-muted"
                title="Enlace para turistas"
              />
              <Button size="icon" variant="outline" className="h-9 w-9 shrink-0 text-primary border-primary/20 hover:bg-primary/10" onClick={handleCopyBroadcastLink}>
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Tipping Passport Card */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
            <DollarSign className="h-5 w-5 text-emerald-500" />
            Propinas Digitales
          </CardTitle>
          <CardDescription>Monitorea los aportes de tus turistas extranjeros.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Aporte del Mes</span>
              <div className="text-2xl font-bold text-emerald-600 mt-0.5">$60.00 USD</div>
            </div>
            <div className="h-10 w-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-lg">
              💵
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider block">Últimas propinas</span>
            <div className="divide-y divide-border">
              {mockTips.map((tip) => (
                <div key={tip.id} className="flex justify-between items-center py-2 text-sm">
                  <div>
                    <div className="font-semibold text-foreground">{tip.tourist}</div>
                    <div className="text-xs text-muted-foreground">{tip.date}</div>
                  </div>
                  <div className="font-mono font-bold text-emerald-500">+${tip.amount} USD</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ==========================================================================
   MODULE 2: B2B TRAVEL AGENCY TOOLS (businessType === 'agencia')
   ========================================================================== */
export function AgencyToolsModule() {
  // Itinerary Builder State
  const [clientName, setClientName] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [logoText, setLogoText] = useState("");
  const [isGenerated, setIsGenerated] = useState(false);

  // Net rate pricing markup
  const [hotelMarkup, setHotelMarkup] = useState(10);
  const hotelNetPrice = 120;
  const hotelMarkupPrice = hotelNetPrice * (1 + hotelMarkup / 100);

  const mockCatalog = [
    { id: "CAT-1", name: "Excursión Parque Nacional Los Haitises", type: "Tour", price: 45 },
    { id: "CAT-2", name: "Almuerzo Típico y Degustación en Jalao", type: "Gastro", price: 30 },
    { id: "CAT-3", name: "Paseo en Catamarán a Isla Saona", type: "Tour", price: 65 },
    { id: "CAT-4", name: "Estadía VIP en Grand Bahia Principe Samaná", type: "Hotel", price: 180 }
  ];

  const handleToggleItem = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleExportItinerary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      toast.error("Por favor ingresa el nombre del cliente.");
      return;
    }
    setIsGenerated(true);
    toast.success("¡Itinerario marca blanca estructurado y listo para descargar!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. White-Label Itinerary Builder */}
      <Card className="lg:col-span-2 border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
            <FileText className="h-5 w-5 text-primary" />
            Diseñador de Itinerarios Marca Blanca
          </CardTitle>
          <CardDescription>Estructura una agenda detallada para tus clientes bajo tu propia marca corporativa.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isGenerated ? (
            <form onSubmit={handleExportItinerary} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="client-name">Nombre del Cliente</Label>
                  <Input
                    id="client-name"
                    placeholder="Ej: Familia Henderson"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="agency-logo">Nombre de tu Agencia (Marca Blanca)</Label>
                  <Input
                    id="agency-logo"
                    placeholder="Ej: Dominicana Premium Travel"
                    value={logoText}
                    onChange={(e) => setLogoText(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Seleccionar actividades para incluir</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mockCatalog.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleItem(item.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${
                        selectedItems.includes(item.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/30"
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-sm text-foreground">{item.name}</div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Badge variant="outline" className="text-[8px] px-1.5 py-0">
                            {item.type}
                          </Badge>
                          <span>Precio al público: ${item.price} USD</span>
                        </div>
                      </div>
                      <div className={`h-5 w-5 rounded-full border flex items-center justify-center text-xs font-bold ${
                        selectedItems.includes(item.id) ? "bg-primary border-primary text-white" : "border-border"
                      }`}>
                        {selectedItems.includes(item.id) ? "✓" : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/95 text-white gap-2">
                <Plus className="h-4 w-4" /> Generar Itinerario Digital
              </Button>
            </form>
          ) : (
            // Generated White-Label Preview
            <div className="space-y-4 bg-muted/20 p-6 rounded-2xl border border-border">
              <div className="flex justify-between items-center border-b border-border pb-4">
                <div>
                  <div className="text-[10px] uppercase font-bold text-primary tracking-widest">PROPUESTA DE VIAJE</div>
                  <h4 className="text-xl font-bold text-foreground">Itinerario: {clientName}</h4>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Presentado por</div>
                  <div className="font-bold text-foreground text-sm">{logoText || "Agente Local Afiliado"}</div>
                </div>
              </div>

              <div className="space-y-4 py-4">
                <div className="border-l-2 border-primary pl-4 space-y-1">
                  <div className="text-xs font-bold text-primary">DÍA 1: Llegada y Aventura Ecoturística</div>
                  <p className="text-sm text-foreground">Excursión Parque Nacional Los Haitises con almuerzo local en el cayo.</p>
                </div>
                <div className="border-l-2 border-border pl-4 space-y-1">
                  <div className="text-xs font-bold text-muted-foreground">DÍA 2: Relajación y Playas Vírgenes</div>
                  <p className="text-sm text-foreground">Paseo guiado en Catamarán exclusivo a Isla Saona con buffet premium.</p>
                </div>
              </div>

              <div className="flex gap-3 border-t border-border pt-4">
                <Button variant="outline" className="w-1/2" onClick={() => setIsGenerated(false)}>
                  Modificar
                </Button>
                <Button className="w-1/2 bg-primary hover:bg-primary/95 text-white" onClick={() => toast.success("PDF del itinerario marca blanca generado correctamente.")}>
                  Exportar PDF Cliente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Rates Markup & Wallet Panel */}
      <div className="space-y-6">
        {/* Net Rate Calculator */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Percent className="h-5 w-5 text-indigo-500" />
              Calculadora de Margen
            </CardTitle>
            <CardDescription>Ajusta el markup comercial para reservas de tus clientes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/40 p-3 rounded-xl border border-border space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Hotel Costa Norte (Neto B2B)</span>
                <span>$120.00 USD</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-foreground">
                <span>Precio con Comisión ({hotelMarkup}%)</span>
                <span>${hotelMarkupPrice.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-emerald-500">
                <span>Tu Ganancia (Markup)</span>
                <span>+${(hotelMarkupPrice - hotelNetPrice).toFixed(2)} USD</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <Label htmlFor="markup-range" className="text-muted-foreground">Porcentaje de Ganancia</Label>
                <span className="font-bold text-foreground">{hotelMarkup}%</span>
              </div>
              <input
                id="markup-range"
                type="range"
                min="0"
                max="30"
                value={hotelMarkup}
                onChange={(e) => setHotelMarkup(parseInt(e.target.value))}
                className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                title="Porcentaje de Ganancia"
                placeholder="Porcentaje de Ganancia"
                aria-label="Porcentaje de Ganancia"
              />
            </div>
          </CardContent>
        </Card>

        {/* Commercial Wallet Credit */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <ShoppingBag className="h-5 w-5 text-emerald-500" />
              Crédito Comercial
            </CardTitle>
            <CardDescription>Saldo prepago para reservas inmediatas sin tarjeta.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-muted-foreground">Saldo Disponible</span>
                <div className="text-2xl font-bold text-foreground">$3,850.00 USD</div>
              </div>
              <Button size="sm" variant="outline" className="border-primary/20 text-primary hover:bg-primary/5" onClick={() => toast.success("Formulario de carga de crédito enviado.")}>
                Cargar Saldo
              </Button>
            </div>
            <div className="text-[10px] text-muted-foreground bg-muted/40 p-2 rounded border border-border">
              ℹ️ Los depósitos vía transferencia bancaria tardan de 12 a 24 horas en ser validados por el departamento de finanzas.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ==========================================================================
   MODULE 3: TOUR OPERATOR TOOLS MODULE (businessType === 'operador')
   ========================================================================== */
export function OperatorToolsModule() {
  // Ticket validator state
  const [ticketCode, setTicketCode] = useState("");
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  // Camera mock scan state
  const [isScanning, setIsScanning] = useState(false);

  // Daily departures schedules
  const mockDepartures = [
    { id: 1, title: "Excursión Los Haitises", time: "09:00 AM", pax: 14, guide: "Alexandro Tejeda", status: "embarcando" },
    { id: 2, title: "Cayo Levantado VIP", time: "10:30 AM", pax: 8, guide: "Carlos Ruiz", status: "programado" },
    { id: 3, title: "Canopy Aventura Montaña", time: "11:30 AM", pax: 12, guide: "Sin Asignar", status: "programado" }
  ];

  const handleValidateTicket = async (codeToVerify: string) => {
    if (!codeToVerify.trim()) {
      toast.error("Por favor ingresa un código de ticket.");
      return;
    }

    setScanLoading(true);
    setScanResult(null);

    try {
      // Query the database for the ticket
      const supabaseAny = supabase as any;
      const { data, error } = await supabaseAny
        .from("event_tickets")
        .select(`
          id,
          ticket_code,
          status,
          scanned_at,
          reservations (
            contact_name,
            entity_type,
            total_price
          )
        `)
        .eq("ticket_code", codeToVerify.trim().toUpperCase())
        .maybeSingle();

      if (error) throw error;

      if (data) {
        if (data.status === "unused") {
          // Update status to scanned
          const { error: updateErr } = await supabaseAny
            .from("event_tickets")
            .update({
              status: "scanned",
              scanned_at: new Date().toISOString()
            })
            .eq("id", data.id);

          if (updateErr) throw updateErr;

          setScanResult({
            success: true,
            code: data.ticket_code,
            guest: data.reservations?.contact_name || "Cliente",
            service: data.reservations?.entity_type || "Excursión",
            price: data.reservations?.total_price || 0,
            message: "¡Ticket validado y canjeado con éxito! Permita el abordaje."
          });
          toast.success("¡Ticket validado con éxito!");
        } else {
          setScanResult({
            success: false,
            code: data.ticket_code,
            scannedAt: data.scanned_at,
            message: `ATENCIÓN: Este ticket ya fue utilizado el ${new Date(data.scanned_at).toLocaleString("es-DO")}.`
          });
          toast.warning("Ticket ya utilizado previamente.");
        }
      } else {
        // Fallback for simulation codes
        if (codeToVerify.trim().toUpperCase() === "MOCK-OK") {
          setScanResult({
            success: true,
            code: "MOCK-OK",
            guest: "Juan Pérez",
            service: "Tour Saona",
            price: 75,
            message: "¡SIMULACIÓN: Ticket válido! Abordaje aprobado."
          });
          toast.success("¡Ticket simulado exitoso!");
        } else {
          setScanResult({
            success: false,
            code: codeToVerify,
            message: "ERROR: El código ingresado no existe en nuestro padrón de reservas."
          });
          toast.error("Ticket inválido.");
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(`Error de base de datos: ${err.message}`);
    } finally {
      setScanLoading(false);
    }
  };

  const handleStartCameraScan = () => {
    setIsScanning(true);
    setScanResult(null);

    // Auto-resolve mock scan after 2.5 seconds
    setTimeout(() => {
      setIsScanning(false);
      // Auto fill a code
      const mockCode = Math.random() > 0.4 ? "MOCK-OK" : "TKT-INVALID";
      setTicketCode(mockCode);
      handleValidateTicket(mockCode);
    }, 2500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Ticket Validator Panel */}
      <Card className="lg:col-span-2 border-border shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-950 text-white p-6">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <QrCode className="h-5 w-5 text-emerald-400" />
            Validador de Entradas & Tickets QR
          </CardTitle>
          <CardDescription className="text-slate-400">
            Escanea o digita el código del ticket del viajero para registrar su entrada.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          {/* Scanning Animation */}
          {isScanning && (
            <div className="relative w-full max-w-sm mx-auto aspect-video bg-black rounded-2xl overflow-hidden border border-border shadow-inner flex flex-col items-center justify-center text-white">
              <Camera className="h-10 w-10 text-muted-foreground animate-pulse mb-2" />
              <div className="text-xs text-muted-foreground">Iniciando cámara... buscando código QR</div>
              {/* Scan beam */}
              <div className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_8px_red] top-1/2 animate-[bounce_2s_infinite]" />
            </div>
          )}

          {!isScanning && (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="ticket-code-input" className="text-sm font-semibold">Código del Ticket</Label>
                <div className="relative">
                  <Input
                    id="ticket-code-input"
                    placeholder="Ej: TKT-12345"
                    value={ticketCode}
                    onChange={(e) => setTicketCode(e.target.value)}
                    className="uppercase h-11"
                  />
                </div>
              </div>
              <div className="flex gap-2 items-end">
                <Button
                  onClick={handleStartCameraScan}
                  variant="outline"
                  className="h-11 gap-1.5 border-primary/20 text-primary hover:bg-primary/5"
                  title="Escanear con cámara"
                >
                  <Camera className="h-4 w-4" />
                  Escanear
                </Button>
                <Button
                  onClick={() => handleValidateTicket(ticketCode)}
                  className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  disabled={scanLoading}
                >
                  {scanLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Validar Ticket"}
                </Button>
              </div>
            </div>
          )}

          {/* Validation Result display */}
          {scanResult && (
            <div className={`p-5 rounded-2xl border ${
              scanResult.success
                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-900 dark:text-emerald-300"
                : "bg-red-500/5 border-red-500/20 text-red-950 dark:text-red-300"
            } space-y-3`}>
              <div className="flex items-start gap-3">
                {scanResult.success ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-sm">
                    {scanResult.success ? "Acceso Aprobado" : "Acceso Denegado"}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono">Ticket Code: {scanResult.code}</p>
                  <p className="text-sm mt-2">{scanResult.message}</p>
                </div>
              </div>

              {scanResult.success && (
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/20 text-xs">
                  <div>
                    <span className="text-muted-foreground">Turista:</span>
                    <p className="font-semibold text-foreground">{scanResult.guest}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Servicio contratado:</span>
                    <p className="font-semibold text-foreground capitalize">{scanResult.service}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Departure Scheduler Card */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
            <Calendar className="h-5 w-5 text-indigo-500" />
            Despacho de Salidas
          </CardTitle>
          <CardDescription>Control diario de excursiones y asignación de personal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="divide-y divide-border">
            {mockDepartures.map((dep) => (
              <div key={dep.id} className="py-3 flex justify-between items-start gap-4 text-sm last:pb-0 first:pt-0">
                <div className="space-y-0.5">
                  <div className="font-semibold text-foreground">{dep.title}</div>
                  <div className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                    <span>🕒 {dep.time}</span>
                    <span>👥 {dep.pax} Pasajeros</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Guía: <span className="font-medium text-foreground">{dep.guide}</span></div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    dep.status === "embarcando"
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/20 uppercase text-[9px] font-bold"
                      : "bg-muted text-muted-foreground uppercase text-[9px] font-bold"
                  }
                >
                  {dep.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
