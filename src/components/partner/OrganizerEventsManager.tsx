import { useState, useEffect } from "react";
import { 
  Calendar, Ticket, Users, CheckCircle2, QrCode, 
  Search, Plus, Download, Eye, Clock, MapPin, 
  Sparkles, Filter, AlertCircle, ShieldCheck, ArrowUpRight,
  ChevronRight, Trash2, Check, RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { RegistroEventoModal } from "@/components/forms/RegistroEventoModal";
import { FreeTicketData } from "@/components/events/FreeTicketModal";

export interface OrganizerEvent {
  id: string;
  name: string;
  event_type: string;
  province: string;
  venue: string;
  start_date: string;
  start_time: string;
  price_type: "free" | "paid";
  price_range: string;
  status: "published" | "pending_review" | "draft" | "finished";
  max_capacity?: number;
  total_registered: number;
  organizer: string;
  image_url?: string;
}

const DEFAULT_ORGANIZER_EVENTS: OrganizerEvent[] = [
  {
    id: "1",
    name: "Carnaval Vegano 2026",
    event_type: "Tradición & Cultura",
    province: "La Vega",
    venue: "Zona de Carnaval - Calle Padre Adolfo",
    start_date: "2026-02-01",
    start_time: "14:00",
    price_type: "free",
    price_range: "Entrada General Gratis / VIP RD$ 2,500",
    status: "published",
    max_capacity: 5000,
    total_registered: 342,
    organizer: "UCAVE & Alcaldía de La Vega",
    image_url: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=600&fit=crop&q=80"
  },
  {
    id: "2",
    name: "DR Jazz Festival Cabarete",
    event_type: "Música & Festivales",
    province: "Puerto Plata",
    venue: "Escenario Principal Playa Cabarete",
    start_date: "2026-11-06",
    start_time: "19:00",
    price_type: "free",
    price_range: "Entrada General Libre",
    status: "published",
    max_capacity: 2500,
    total_registered: 188,
    organizer: "Fundación Educativa FEDUJAZZ",
    image_url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&fit=crop&q=80"
  },
  {
    id: "evt-local-101",
    name: "Festival Gastronómico del Coco & Marisco",
    event_type: "Gastronomía & Cultura",
    province: "Samaná",
    venue: "Malecón de Santa Bárbara de Samaná",
    start_date: "2026-08-15",
    start_time: "12:00",
    price_type: "free",
    price_range: "Acceso Gratuito",
    status: "published",
    max_capacity: 1200,
    total_registered: 95,
    organizer: "Asociación Culinaria de Samaná",
    image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&fit=crop&q=80"
  }
];

// Sample attendees seed
const SAMPLE_ATTENDEES: Record<string, FreeTicketData[]> = {
  "1": [
    {
      ticketId: "DR-TKT-894211",
      eventId: "1",
      eventName: "Carnaval Vegano 2026",
      eventDate: "2026-02-01",
      eventTime: "14:00",
      venue: "Calle Padre Adolfo",
      province: "La Vega",
      attendeeName: "Carlos Manuel De La Cruz",
      attendeeEmail: "carlos.delacruz@gmail.com",
      attendeePhone: "809-555-1209",
      quantity: 2,
      companions: ["Maria Elena De La Cruz"],
      issuedAt: "2026-09-21T10:14:00Z",
      qrPayload: "https://descubrerd.do/verify?code=DR-TKT-894211",
      status: "active"
    },
    {
      ticketId: "DR-TKT-771249",
      eventId: "1",
      eventName: "Carnaval Vegano 2026",
      eventDate: "2026-02-01",
      eventTime: "14:00",
      venue: "Calle Padre Adolfo",
      province: "La Vega",
      attendeeName: "Altagracia Rosario Núñez",
      attendeeEmail: "altagracia.rosario@outlook.com",
      attendeePhone: "829-441-9988",
      quantity: 3,
      companions: ["Luis Rosario", "Sofia Rosario"],
      issuedAt: "2026-09-22T15:30:00Z",
      qrPayload: "https://descubrerd.do/verify?code=DR-TKT-771249",
      status: "used"
    },
    {
      ticketId: "DR-TKT-601934",
      eventId: "1",
      eventName: "Carnaval Vegano 2026",
      eventDate: "2026-02-01",
      eventTime: "14:00",
      venue: "Calle Padre Adolfo",
      province: "La Vega",
      attendeeName: "Jean-Luc Dubois",
      attendeeEmail: "jeanluc.dubois@voyage.fr",
      attendeePhone: "+33 6 12 34 56 78",
      quantity: 1,
      companions: [],
      issuedAt: "2026-09-23T08:45:00Z",
      qrPayload: "https://descubrerd.do/verify?code=DR-TKT-601934",
      status: "active"
    }
  ],
  "2": [
    {
      ticketId: "DR-TKT-412098",
      eventId: "2",
      eventName: "DR Jazz Festival Cabarete",
      eventDate: "2026-11-06",
      eventTime: "19:00",
      venue: "Playa Cabarete",
      province: "Puerto Plata",
      attendeeName: "David Miller",
      attendeeEmail: "dmiller.jazz@nyu.edu",
      attendeePhone: "+1 212-555-0143",
      quantity: 2,
      companions: ["Rachel Miller"],
      issuedAt: "2026-09-22T19:20:00Z",
      qrPayload: "https://descubrerd.do/verify?code=DR-TKT-412098",
      status: "active"
    }
  ]
};

export function OrganizerEventsManager() {
  const [events, setEvents] = useState<OrganizerEvent[]>(DEFAULT_ORGANIZER_EVENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  
  // Attendee list viewer modal state
  const [selectedEventForAttendees, setSelectedEventForAttendees] = useState<OrganizerEvent | null>(null);
  const [attendeesList, setAttendeesList] = useState<FreeTicketData[]>([]);
  const [attendeeSearch, setAttendeeSearch] = useState("");

  // Ticket scanner / validator modal state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [ticketCodeInput, setTicketCodeInput] = useState("");
  const [validationResult, setValidationResult] = useState<{
    found: boolean;
    ticket?: FreeTicketData;
    message?: string;
  } | null>(null);

  // Load events and registrations from localStorage
  const loadOrganizerData = () => {
    try {
      const storedEvents = JSON.parse(localStorage.getItem("dr_organizer_events") || "[]");
      const storedRegistrations = JSON.parse(localStorage.getItem("dr_event_registrations") || "{}");

      // Merge default events with any stored events
      const allEvents = [...storedEvents, ...DEFAULT_ORGANIZER_EVENTS];
      
      // Deduplicate by ID
      const uniqueEventsMap = new Map<string, OrganizerEvent>();
      allEvents.forEach((evt) => {
        if (!uniqueEventsMap.has(evt.id)) {
          const registeredList = [
            ...(storedRegistrations[evt.id] || []),
            ...(SAMPLE_ATTENDEES[evt.id] || [])
          ];
          const totalTickets = registeredList.reduce((acc: number, t: FreeTicketData) => acc + (t.quantity || 1), 0);
          uniqueEventsMap.set(evt.id, {
            ...evt,
            total_registered: Math.max(evt.total_registered || 0, totalTickets)
          });
        }
      });

      setEvents(Array.from(uniqueEventsMap.values()));
    } catch (err) {
      console.error("Error loading organizer events:", err);
    }
  };

  useEffect(() => {
    loadOrganizerData();
  }, []);

  const handleOpenAttendees = (event: OrganizerEvent) => {
    setSelectedEventForAttendees(event);
    
    // Get registrations from local storage and sample
    const storedRegistrations = JSON.parse(localStorage.getItem("dr_event_registrations") || "{}");
    const registered: FreeTicketData[] = [
      ...(storedRegistrations[event.id] || []),
      ...(SAMPLE_ATTENDEES[event.id] || [])
    ];
    setAttendeesList(registered);
  };

  const handleExportCSV = () => {
    if (!selectedEventForAttendees || attendeesList.length === 0) {
      toast.error("No hay asistentes registrados para exportar.");
      return;
    }

    const headers = ["Codigo_Boleto", "Nombre_Titular", "Email", "Telefono", "Cantidad_Pases", "Acompañantes", "Fecha_Emision", "Estado"];
    const rows = attendeesList.map((t) => [
      `"${t.ticketId}"`,
      `"${t.attendeeName}"`,
      `"${t.attendeeEmail}"`,
      `"${t.attendeePhone}"`,
      t.quantity,
      `"${t.companions?.join(", ") || "Ninguno"}"`,
      `"${new Date(t.issuedAt).toLocaleDateString()}"`,
      `"${t.status === "used" ? "INGRESADO" : "ACTIVO"}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `asistentes_${selectedEventForAttendees.name.toLowerCase().replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Listado de asistentes exportado en formato CSV.");
  };

  const handleToggleCheckIn = (ticketId: string) => {
    setAttendeesList((prev) =>
      prev.map((t) => {
        if (t.ticketId === ticketId) {
          const nextStatus = t.status === "used" ? "active" : "used";
          toast.success(
            nextStatus === "used" ? `Boleto ${ticketId} marcado como Ingresado (Check-in)` : `Boleto ${ticketId} restablecido a Activo`
          );
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const handleValidateTicketCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = ticketCodeInput.trim().toUpperCase();
    if (!cleanCode) return;

    // Search across all attendees
    const storedRegistrations = JSON.parse(localStorage.getItem("dr_event_registrations") || "{}");
    let foundTicket: FreeTicketData | undefined;

    Object.values(storedRegistrations).forEach((list: any) => {
      const match = list.find((t: FreeTicketData) => t.ticketId.toUpperCase() === cleanCode);
      if (match) foundTicket = match;
    });

    if (!foundTicket) {
      Object.values(SAMPLE_ATTENDEES).forEach((list) => {
        const match = list.find((t) => t.ticketId.toUpperCase() === cleanCode);
        if (match) foundTicket = match;
      });
    }

    if (foundTicket) {
      setValidationResult({
        found: true,
        ticket: foundTicket,
        message: foundTicket.status === "used" ? "⚠️ Este boleto ya fue utilizado para ingresar anteriormente." : "✅ Boleto Válido y Confirmado."
      });
    } else {
      setValidationResult({
        found: false,
        message: "❌ Código de entrada no encontrado en los registros oficiales."
      });
    }
  };

  const filteredEvents = events.filter((evt) => {
    const matchesSearch = evt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.province.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || evt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalEventsCount = events.length;
  const totalTicketsIssued = events.reduce((acc, evt) => acc + (evt.total_registered || 0), 0);
  const freeEventsCount = events.filter((evt) => evt.price_type === "free").length;

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
              CONSOLA DE ORGANIZADOR
            </Badge>
            <Badge variant="outline" className="text-xs">
              Módulo de Eventos & Boletas
            </Badge>
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">
            Gestión de Mis Eventos y Boletas Gratuitas
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Supervisa tus eventos publicados, emite pases digitales automáticos y monitorea la afluencia de asistentes en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            onClick={() => setIsScannerOpen(true)}
            className="rounded-xl text-xs gap-1.5 font-semibold"
          >
            <QrCode className="h-4 w-4 text-emerald-500" />
            <span>Validar Entrada (Puerta)</span>
          </Button>

          <Button
            onClick={() => setIsNewEventModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-slate-950 font-bold rounded-xl text-xs gap-1.5 shadow-md shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            <span>Registrar Nuevo Evento</span>
          </Button>
        </div>
      </div>

      {/* Organizer Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-medium">Eventos Administrados</span>
              <p className="text-2xl font-black text-foreground mt-1">{totalEventsCount}</p>
              <span className="text-[11px] text-emerald-500 font-semibold">{freeEventsCount} con Acceso Libre</span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Calendar className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-medium">Boletas / Pases Emitidos</span>
              <p className="text-2xl font-black text-emerald-500 mt-1">{totalTicketsIssued}</p>
              <span className="text-[11px] text-muted-foreground">Registros digitales completados</span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Ticket className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-medium">Capacidad Total Estimada</span>
              <p className="text-2xl font-black text-primary mt-1">8,700+</p>
              <span className="text-[11px] text-muted-foreground">Turistas y público local</span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, provincia o recinto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl text-xs h-9 bg-background"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
            className="rounded-xl text-xs h-8"
          >
            Todos ({events.length})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "published" ? "default" : "outline"}
            onClick={() => setStatusFilter("published")}
            className="rounded-xl text-xs h-8"
          >
            Publicados
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={loadOrganizerData}
            className="rounded-xl text-xs h-8 gap-1 text-muted-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Actualizar
          </Button>
        </div>
      </div>

      {/* Events Table / Card Grid */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <Card className="rounded-3xl border-border p-12 text-center bg-card">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <h3 className="font-bold text-foreground text-base">No se encontraron eventos</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              No hay eventos que coincidan con los filtros seleccionados. Registra tu próximo evento para comenzar.
            </p>
            <Button
              onClick={() => setIsNewEventModalOpen(true)}
              className="mt-4 rounded-xl text-xs font-bold bg-primary text-slate-950"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Registrar Evento
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredEvents.map((evt) => (
              <Card 
                key={evt.id} 
                className="rounded-2xl border-border/80 bg-card hover:border-primary/40 transition-all shadow-xs overflow-hidden"
              >
                <CardContent className="p-5 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                  {/* Left info & media */}
                  <div className="flex items-start gap-4">
                    {evt.image_url ? (
                      <img
                        src={evt.image_url}
                        alt={evt.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 border border-border"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Calendar className="h-8 w-8" />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
                          {evt.event_type}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                          {evt.province}
                        </Badge>
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-bold">
                          {evt.price_range}
                        </Badge>
                      </div>

                      <h3 className="font-display font-bold text-base sm:text-lg text-foreground">
                        {evt.name}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-primary" /> {evt.start_date} • {evt.start_time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-amber-500" /> {evt.venue}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right stats & action buttons */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full lg:w-auto gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-border/60">
                    <div className="bg-muted/60 px-4 py-2 rounded-2xl border border-border/60 text-center sm:text-left min-w-[140px]">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Boletas Emitidas</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-display text-xl font-black text-primary">{evt.total_registered}</span>
                        <span className="text-xs text-muted-foreground">/ {evt.max_capacity || "Sin límite"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenAttendees(evt)}
                        className="rounded-xl text-xs gap-1.5 font-semibold w-full sm:w-auto border-primary/30 hover:bg-primary/10"
                      >
                        <Users className="h-3.5 w-3.5 text-primary" />
                        <span>Ver Asistentes ({evt.total_registered})</span>
                      </Button>

                      <a 
                        href={`/evento/${evt.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl text-xs gap-1 text-muted-foreground"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Página</span>
                        </Button>
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ATTENDEE LIST MODAL */}
      <Dialog open={!!selectedEventForAttendees} onOpenChange={(open) => !open && setSelectedEventForAttendees(null)}>
        <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border-border bg-card">
          <DialogHeader className="mb-4 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold mb-2 w-fit">
              <Users className="h-3.5 w-3.5" /> Registro Oficial de Asistentes
            </div>
            <DialogTitle className="font-display text-2xl font-bold text-foreground">
              {selectedEventForAttendees?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Listado de pases digitales emitidos en tiempo real. Puedes realizar check-in o exportar la base de datos a CSV.
            </DialogDescription>
          </DialogHeader>

          {/* Search & Export Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar asistente por nombre o email..."
                value={attendeeSearch}
                onChange={(e) => setAttendeeSearch(e.target.value)}
                className="pl-9 rounded-xl text-xs h-9"
              />
            </div>

            <Button
              size="sm"
              onClick={handleExportCSV}
              className="rounded-xl text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Exportar Asistentes (CSV)</span>
            </Button>
          </div>

          {/* Attendees Table */}
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-xs text-left text-muted-foreground">
              <thead className="bg-muted/80 text-foreground font-bold uppercase text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="py-3 px-4">Código Pase</th>
                  <th className="py-3 px-4">Titular / Email</th>
                  <th className="py-3 px-4">Pases</th>
                  <th className="py-3 px-4">Fecha Emisión</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción Puerta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {attendeesList
                  .filter((att) =>
                    att.attendeeName.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
                    att.attendeeEmail.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
                    att.ticketId.toLowerCase().includes(attendeeSearch.toLowerCase())
                  )
                  .map((att) => (
                    <tr key={att.ticketId} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                        {att.ticketId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-foreground">{att.attendeeName}</div>
                        <div className="text-[11px] text-muted-foreground">{att.attendeeEmail}</div>
                        {att.attendeePhone && (
                          <div className="text-[10px] text-muted-foreground/80">{att.attendeePhone}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {att.quantity} {att.quantity === 1 ? "Entrada" : "Entradas"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {new Date(att.issuedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          className={`text-[10px] font-bold ${
                            att.status === "used"
                              ? "bg-muted text-muted-foreground"
                              : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          }`}
                        >
                          {att.status === "used" ? "Ingresado" : "Activo"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant={att.status === "used" ? "outline" : "default"}
                          onClick={() => handleToggleCheckIn(att.ticketId)}
                          className={`rounded-xl text-[11px] h-7 px-2.5 font-bold ${
                            att.status !== "used" ? "bg-primary text-slate-950 hover:bg-primary/90" : ""
                          }`}
                        >
                          {att.status === "used" ? "Deshacer" : "Check-in"}
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* SCANNER / CODE VALIDATOR MODAL */}
      <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 border-border bg-card">
          <DialogHeader className="mb-4 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold mb-2 w-fit">
              <QrCode className="h-3.5 w-3.5" /> Validador de Acceso
            </div>
            <DialogTitle className="font-display text-xl font-bold text-foreground">
              Validar Código de Entrada
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Ingresa el código alfanumérico del pase digital presentado por el asistente (ej. <code>DR-TKT-894211</code>).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleValidateTicketCode} className="space-y-4">
            <div className="relative">
              <Ticket className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="DR-TKT-XXXXXX"
                value={ticketCodeInput}
                onChange={(e) => setTicketCodeInput(e.target.value)}
                className="pl-9 font-mono uppercase text-sm font-bold rounded-xl"
                required
              />
            </div>

            <Button type="submit" className="w-full bg-primary text-slate-950 font-bold rounded-xl text-xs h-10">
              Verificar Estado de Entrada
            </Button>
          </form>

          {validationResult && (
            <div
              className={`p-4 rounded-2xl border mt-3 text-xs space-y-2 ${
                validationResult.found
                  ? "bg-emerald-500/10 border-emerald-500/30 text-foreground"
                  : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
              }`}
            >
              <p className="font-bold text-sm">{validationResult.message}</p>
              {validationResult.ticket && (
                <div className="space-y-1 text-muted-foreground pt-1 border-t border-border">
                  <p><strong>Titular:</strong> {validationResult.ticket.attendeeName}</p>
                  <p><strong>Evento:</strong> {validationResult.ticket.eventName}</p>
                  <p><strong>Pases:</strong> {validationResult.ticket.quantity} personas</p>
                  <p><strong>Código:</strong> {validationResult.ticket.ticketId}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* NEW EVENT REGISTRATION MODAL */}
      <RegistroEventoModal
        open={isNewEventModalOpen}
        onClose={() => {
          setIsNewEventModalOpen(false);
          loadOrganizerData();
        }}
      />
    </div>
  );
}
