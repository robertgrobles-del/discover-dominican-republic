import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, Users, DollarSign, Star, Calendar, MessageSquare,
  Settings, Loader2, LogOut, CheckCircle2, XCircle, AlertCircle, Save, Reply,
  Briefcase, QrCode, Mic, Link as LinkIcon, Download, Award, FileText, Sparkles, Plus, Trash2, Camera, Ticket, Trophy, ShieldCheck
} from "lucide-react";
import { GuideToolsModule, AgencyToolsModule, OperatorToolsModule } from "@/components/partner/PartnerToolsModules";
import { OrganizerEventsManager } from "@/components/partner/OrganizerEventsManager";
import { AdminDeportesManager } from "@/components/sports/AdminDeportesManager";
import { MarketplaceEscrowManager } from "@/components/marketplace/MarketplaceEscrowManager";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { toast } from "sonner";

// Mock reservation data tailored to the business
const initialReservations = [
  { id: "RES-8921", guestName: "Sarah Connor", email: "sarah@sky.net", checkIn: "2026-06-20", checkOut: "2026-06-25", amount: 2250, status: "paid", notes: "Prefiere piso alto" },
  { id: "RES-4432", guestName: "Michael Jordan", email: "mj23@bulls.com", checkIn: "2026-06-28", checkOut: "2026-07-02", amount: 3500, status: "paid", notes: "Cama extra grande" },
  { id: "RES-1120", guestName: "Penelope Cruz", email: "penelope@cruz.es", checkIn: "2026-07-05", checkOut: "2026-07-10", amount: 1800, status: "pending", notes: "Vegana" },
  { id: "RES-9801", guestName: "John Doe", email: "john@doe.com", checkIn: "2026-06-15", checkOut: "2026-06-18", amount: 900, status: "cancelled", notes: "" }
];

const initialReviews = [
  { id: 1, author: "Juan Almonte", rating: 5, date: "2026-06-12", comment: "Excelente servicio y la vista es inmejorable. El personal muy atento.", reply: "" },
  { id: 2, author: "Alice Smith", rating: 4, date: "2026-06-08", comment: "The food was amazing but check-in took longer than expected.", reply: "" }
];

const chartData = [
  { name: "Ene", ventas: 12000 },
  { name: "Feb", ventas: 15000 },
  { name: "Mar", ventas: 18500 },
  { name: "Abr", ventas: 16000 },
  { name: "May", ventas: 21000 },
  { name: "Jun", ventas: 25400 }
];

export default function PartnerDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [partnerProfile, setPartnerProfile] = useState<any>(null);
  const [reservations, setReservations] = useState(initialReservations);
  const [reviews, setReviews] = useState(initialReviews);
  
  // Dashboard fields editable
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [businessType, setBusinessType] = useState("hotel");

  // Review reply input state
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!user) {
      navigate("/partner/login");
      return;
    }

    async function getProfileAndReservations() {
      try {
        const { data, error } = await (supabase
          .from("partner_profiles" as any)
          .select("*")
          .eq("id", user.id)
          .maybeSingle() as any);

        if (error) throw error;

        if (data) {
          setPartnerProfile(data);
          setBusinessName(data.business_name);
          setDescription(data.description || "");
          setPhone(data.phone || "");
          setEmail(data.email || "");
          setBusinessType(data.business_type || "hotel");
        } else {
          // If profile does not exist yet (RSC timing), we populate with default values
          const defaultName = user.email ? user.email.split("@")[0].toUpperCase() + " Associates" : "Partner Hotel";
          setBusinessName(defaultName);
          setEmail(user.email || "");
        }

        // Fetch actual reservations from Supabase
        const { data: resData, error: resErr } = await supabase
          .from("reservations")
          .select("*")
          .order("created_at", { ascending: false });

        if (resErr) throw resErr;

        if (resData && resData.length > 0) {
          const mappedReservations = resData.map((res: any) => ({
            id: res.id.substring(0, 8).toUpperCase(),
            realId: res.id,
            guestName: res.contact_name || "Cliente Anónimo",
            email: res.contact_email || "no-email@descubrerd.com",
            checkIn: res.check_in ? res.check_in.split("T")[0] : "2026-06-16",
            checkOut: res.check_out ? res.check_out.split("T")[0] : "2026-06-17",
            amount: res.total_price || 0,
            status: res.status || "pending",
            notes: res.notes || ""
          }));
          setReservations([...mappedReservations, ...initialReservations]);
        }
      } catch (err) {
        console.error("Error loading partner profile or reservations:", err);
      } finally {
        setLoading(false);
      }
    }

    getProfileAndReservations();
  }, [user, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("partner_profiles" as any)
        .update({
          business_name: businessName,
          description: description,
          phone: phone,
          email: email,
          business_type: businessType
        })
        .eq("id", user?.id);

      if (error) throw error;
      setPartnerProfile((prev: any) => ({
        ...prev,
        business_name: businessName,
        description: description,
        phone: phone,
        email: email,
        business_type: businessType
      }));
      toast.success("¡Ficha comercial y tipo de negocio actualizados con éxito!");
    } catch (err: any) {
      toast.error(`Error al actualizar ficha: ${err.message || "Por favor intente de nuevo."}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const reservation = reservations.find(r => r.id === id);
    const realId = (reservation as any)?.realId;

    if (realId) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from("reservations")
          .update({ status: newStatus })
          .eq("id", realId);

        if (error) throw error;
        toast.success(`Reserva en base de datos marcada como ${newStatus.toUpperCase()}`);
      } catch (err: any) {
        toast.error(`Error al actualizar estado en Supabase: ${err.message}`);
        setLoading(false);
        return;
      }
    }

    setReservations((prev) =>
      prev.map((res) => (res.id === id ? { ...res, status: newStatus } : res))
    );
    if (!realId) {
      toast.success(`Reserva simulada ${id} marcada como ${newStatus.toUpperCase()}`);
    }
    setLoading(false);
  };

  const handleReplyReview = (reviewId: number) => {
    const text = replyTexts[reviewId];
    if (!text || !text.trim()) {
      toast.error("Por favor escribe una respuesta antes de enviar.");
      return;
    }

    setReviews((prev) =>
      prev.map((rev) => (rev.id === reviewId ? { ...rev, reply: text } : rev))
    );
    toast.success("Respuesta a reseña guardada con éxito.");
    setReplyTexts((prev) => ({ ...prev, [reviewId]: "" }));
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Sesión cerrada correctamente.");
    navigate("/partner/login");
  };

  if (loading && !partnerProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Cargando panel de control corporativo...</p>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalEarned = reservations
    .filter((r) => r.status === "paid")
    .reduce((sum, r) => sum + r.amount, 0);
  const totalCommission = Number((totalEarned * 0.10).toFixed(2));
  const activeBookings = reservations.filter((r) => r.status === "paid").length;

  return (
    <PageTransition>
      <SEOHead
        title={`Panel de Partner - ${businessName || "Descubre RD"}`}
        description="Gestiona tu negocio turístico y analiza el volumen de transacciones."
      />
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />

        <main className="flex-1 pt-24 pb-16 container mx-auto px-4 lg:px-8">
          {/* Header Dashboard */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">PARTNER COMERCIAL</Badge>
                <Badge variant="outline" className="capitalize">{businessType || "hotel"}</Badge>
              </div>
              <h1 className="text-3xl font-bold font-display mt-2 text-foreground">
                {businessName || "Mi Establecimiento"}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Panel B2B para administración de reservas, analíticas e herramientas de trabajo.
              </p>
            </div>
            <Button variant="outline" className="gap-2 text-red-500 border-red-500/20 hover:bg-red-500/10" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> Cerrar Sesión
            </Button>
          </div>

          {/* Metrics summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground font-medium">Ingresos Totales (Neto)</span>
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">${totalEarned.toLocaleString()} USD</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Acumulado tras descuento del 10%</p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground font-medium">Reservas Pagadas</span>
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{activeBookings}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Estadías y pases confirmados</p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground font-medium">Comisión Plataforma (10%)</span>
                  <TrendingUp className="h-5 w-5 text-indigo-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">${totalCommission.toLocaleString()} USD</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Cobrado por servicios de pasarela</p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground font-medium">Valoración Media</span>
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{partnerProfile?.rating || "4.8"}</span>
                  <span className="text-sm text-muted-foreground">/ 5.0</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Basado en reseñas del perfil</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Navigation */}
          <Tabs defaultValue="analiticas" className="w-full space-y-6">
            <TabsList className="w-full max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-1 bg-muted border border-border p-1.5 rounded-2xl">
              <TabsTrigger value="analiticas" className="gap-1 text-xs"><TrendingUp className="h-3.5 w-3.5" /> Analíticas</TabsTrigger>
              <TabsTrigger value="reservas" className="gap-1 text-xs"><Calendar className="h-3.5 w-3.5" /> Reservas</TabsTrigger>
              <TabsTrigger value="eventos" className="gap-1 text-xs text-primary font-bold"><Ticket className="h-3.5 w-3.5" /> Mis Eventos</TabsTrigger>
              <TabsTrigger value="deportes" className="gap-1 text-xs text-amber-500 font-bold"><Trophy className="h-3.5 w-3.5" /> Torneos & Deportes</TabsTrigger>
              <TabsTrigger value="marketplace" className="gap-1 text-xs text-emerald-500 font-bold"><ShieldCheck className="h-3.5 w-3.5" /> Ventas & Envíos (Escrow)</TabsTrigger>
              <TabsTrigger value="ficha" className="gap-1 text-xs"><Settings className="h-3.5 w-3.5" /> Mi Ficha</TabsTrigger>
              <TabsTrigger value="resenas" className="gap-1 text-xs"><MessageSquare className="h-3.5 w-3.5" /> Reseñas</TabsTrigger>
              <TabsTrigger value="b2b" className="gap-1 text-xs"><Briefcase className="h-3.5 w-3.5" /> Consola B2B</TabsTrigger>
            </TabsList>

            {/* TAB CONTENT: ANALYTICS */}
            <TabsContent value="analiticas" className="space-y-6">
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Volumen de Transacciones Recientes</CardTitle>
                  <CardDescription>Visualización mensual de los ingresos recaudados por reservas.</CardDescription>
                </CardHeader>
                <CardContent className="h-[320px] pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(193, 86%, 50%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(193, 86%, 50%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(192, 10%, 60%)" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(192, 10%, 60%)" }} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                      <Area type="monotone" dataKey="ventas" stroke="hsl(193, 86%, 50%)" strokeWidth={2.5} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB CONTENT: RESERVATIONS */}
            <TabsContent value="reservas">
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Registro de Reservas</CardTitle>
                  <CardDescription>Monitorea y cambia el estado de las compras/reservas asociadas a tu servicio.</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-muted-foreground border-collapse">
                    <thead>
                      <tr className="border-b border-border text-foreground text-xs uppercase tracking-wider font-semibold">
                        <th className="py-3 px-4">Reserva ID</th>
                        <th className="py-3 px-4">Cliente</th>
                        <th className="py-3 px-4">Check-In</th>
                        <th className="py-3 px-4">Check-Out</th>
                        <th className="py-3 px-4">Monto</th>
                        <th className="py-3 px-4">Estado</th>
                        <th className="py-3 px-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map((res) => (
                        <tr key={res.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="py-4 px-4 font-mono font-bold text-foreground">{res.id}</td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-foreground">{res.guestName}</div>
                            <div className="text-xs text-muted-foreground">{res.email}</div>
                          </td>
                          <td className="py-4 px-4">{res.checkIn}</td>
                          <td className="py-4 px-4">{res.checkOut}</td>
                          <td className="py-4 px-4 font-bold text-foreground">${res.amount} USD</td>
                          <td className="py-4 px-4">
                            <Badge
                              variant={
                                res.status === "paid"
                                  ? "secondary"
                                  : res.status === "pending"
                                  ? "outline"
                                  : "destructive"
                              }
                              className={
                                res.status === "paid"
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                  : res.status === "pending"
                                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                  : ""
                              }
                            >
                              {res.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 flex justify-center gap-2">
                            {res.status === "pending" && (
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                                onClick={() => handleUpdateStatus(res.id, "paid")}
                              >
                                <CheckCircle2 className="h-3 w-3" /> Aprobar
                              </Button>
                            )}
                            {res.status === "paid" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-500 border-red-500/20 hover:bg-red-500/10 gap-1"
                                onClick={() => handleUpdateStatus(res.id, "refunded")}
                              >
                                <XCircle className="h-3 w-3" /> Reembolsar
                              </Button>
                            )}
                            {res.status !== "cancelled" && res.status !== "refunded" && res.status !== "paid" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:bg-red-500/10 gap-1"
                                onClick={() => handleUpdateStatus(res.id, "cancelled")}
                              >
                                <XCircle className="h-3 w-3" /> Cancelar
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB CONTENT: ORGANIZER EVENTS & FREE TICKETING */}
            <TabsContent value="eventos">
              <OrganizerEventsManager />
            </TabsContent>

            {/* TAB CONTENT: SPORTS & TOURNAMENTS (LIDOM, LDF, LNB) */}
            <TabsContent value="deportes">
              <AdminDeportesManager />
            </TabsContent>

            {/* TAB CONTENT: MARKETPLACE ESCROW & CERTIFIED VENDOR */}
            <TabsContent value="marketplace">
              <MarketplaceEscrowManager />
            </TabsContent>

            {/* TAB CONTENT: PROFILE EDIT */}
            <TabsContent value="ficha">
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Información de la Ficha Comercial</CardTitle>
                  <CardDescription>Edita los datos que se muestran públicamente a los viajeros en Descubre RD.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="biz-name">Nombre Comercial</Label>
                        <Input
                          id="biz-name"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="biz-type">Tipo de Negocio B2B</Label>
                        <select
                          id="biz-type"
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Tipo de Establecimiento B2B"
                        >
                          <option value="hotel">Hotel / Hospedaje</option>
                          <option value="restaurante">Restaurante / Fritura</option>
                          <option value="guia">Guía Turístico Certificado</option>
                          <option value="agencia">Agencia de Viajes B2B</option>
                          <option value="operador">Tour Operador / Excursiones</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="biz-phone">Teléfono de Reservas</Label>
                        <Input
                          id="biz-phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="biz-email">Email Corporativo de Contacto</Label>
                        <Input
                          id="biz-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="biz-desc">Descripción General del Establecimiento</Label>
                      <Textarea
                        id="biz-desc"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={5}
                      />
                    </div>

                    <Button type="submit" className="gap-2" disabled={loading}>
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Guardar Ficha Comercial
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB CONTENT: REVIEWS */}
            <TabsContent value="resenas" className="space-y-6">
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Reseñas y Comentarios de Clientes</CardTitle>
                  <CardDescription>Responde a los testimonios de los turistas para mejorar la reputación de tu marca.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="border-b border-border pb-6 last:border-b-0 last:pb-0 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-foreground text-base">{rev.author}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">Publicado el {rev.date}</div>
                        </div>
                        <div className="flex items-center gap-0.5 bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full text-xs font-semibold">
                          <Star className="h-3 w-3 fill-yellow-500" /> {rev.rating} / 5
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border italic">
                        "{rev.comment}"
                      </p>

                      {rev.reply ? (
                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 ml-6 space-y-1">
                          <div className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Respuesta enviada por el Partner:
                          </div>
                          <p className="text-sm text-foreground">{rev.reply}</p>
                        </div>
                      ) : (
                        <div className="ml-6 space-y-2">
                          <Label htmlFor={`reply-${rev.id}`} className="text-xs text-muted-foreground">Escribir respuesta oficial:</Label>
                          <div className="flex gap-2">
                            <Input
                              id={`reply-${rev.id}`}
                              placeholder="Estimado cliente, agradecemos mucho su comentario..."
                              value={replyTexts[rev.id] || ""}
                              onChange={(e) => setReplyTexts(prev => ({ ...prev, [rev.id]: e.target.value }))}
                            />
                            <Button size="sm" className="gap-1.5" onClick={() => handleReplyReview(rev.id)}>
                              <Reply className="h-4 w-4" /> Enviar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB CONTENT: B2B TOOLS */}
            <TabsContent value="b2b">
              {businessType === "guia" && <GuideToolsModule userId={user?.id} businessName={businessName} />}
              {businessType === "agencia" && <AgencyToolsModule />}
              {businessType === "operador" && <OperatorToolsModule />}
              {businessType !== "guia" && businessType !== "agencia" && businessType !== "operador" && (
                <Card className="border-border shadow-sm">
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">Consola de Herramientas B2B Profesionales</h3>
                      <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                        Para ver las herramientas personalizadas de tu profesión, por favor cambia tu tipo de negocio en la pestaña <strong>Mi Ficha</strong> a: Guía Turístico, Agencia de Viajes o Tour Operador.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
