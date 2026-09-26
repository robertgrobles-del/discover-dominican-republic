import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, Calendar, MessageSquare,
  Settings, Loader2, LogOut,
  Briefcase, Ticket, Trophy, ShieldCheck
} from "lucide-react";
import { GuideToolsModule, AgencyToolsModule, OperatorToolsModule } from "@/components/partner/PartnerToolsModules";
import { OrganizerEventsManager } from "@/components/partner/OrganizerEventsManager";
import { AdminDeportesManager } from "@/components/sports/AdminDeportesManager";
import { MarketplaceEscrowManager } from "@/components/marketplace/MarketplaceEscrowManager";
import { PartnerKpiCards } from "@/components/partner/PartnerKpiCards";
import { PartnerAnalyticsChart } from "@/components/partner/PartnerAnalyticsChart";
import { PartnerReservationsTable } from "@/components/partner/PartnerReservationsTable";
import { PartnerReviewsManager } from "@/components/partner/PartnerReviewsManager";
import { PartnerProfileForm } from "@/components/partner/PartnerProfileForm";
import { 
  initialReservations, 
  initialReviews, 
  partnerChartData,
  ReservationItem,
  ReviewItem
} from "@/data/partnerDashboardData";
import { toast } from "sonner";

export default function PartnerDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [partnerProfile, setPartnerProfile] = useState<any>(null);
  const [reservations, setReservations] = useState<ReservationItem[]>(initialReservations);
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  
  // Dashboard fields editable
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [businessType, setBusinessType] = useState("hotel");

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

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching partner profile:", error);
        }

        if (data) {
          setPartnerProfile(data);
          setBusinessName(data.business_name || "");
          setDescription(data.description || "");
          setPhone(data.phone || "");
          setEmail(data.email || user.email || "");
          setBusinessType(data.business_type || "hotel");
        } else {
          // Default initial partner details if profile not created yet
          setBusinessName("Mi Negocio Turístico");
          setEmail(user.email || "");
        }

        // Fetch real reservations from Supabase if available
        const { data: dbRes, error: resError } = await (supabase
          .from("reservations" as any)
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10) as any);

        if (!resError && dbRes && dbRes.length > 0) {
          const mapped: ReservationItem[] = dbRes.map((r: any) => ({
            id: `RES-${r.id.slice(0, 4).toUpperCase()}`,
            realId: r.id,
            guestName: r.guest_name || "Turista Verificado",
            email: r.guest_email || "cliente@reserva.com",
            checkIn: r.check_in_date || "2026-07-01",
            checkOut: r.check_out_date || "2026-07-05",
            amount: r.total_price || 1500,
            status: r.status || "pending",
            notes: r.notes || ""
          }));
          setReservations(mapped);
        }
      } catch (err) {
        console.error("Error loading partner data:", err);
      } finally {
        setLoading(false);
      }
    }

    getProfileAndReservations();
  }, [user, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await (supabase
        .from("partner_profiles" as any)
        .upsert({
          id: user.id,
          business_name: businessName,
          description: description,
          phone: phone,
          email: email,
          business_type: businessType,
          updated_at: new Date().toISOString()
        }) as any);

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
    const realId = reservation?.realId;

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

  const handleReplyReview = (reviewId: number, text: string) => {
    setReviews((prev) =>
      prev.map((rev) => (rev.id === reviewId ? { ...rev, reply: text } : rev))
    );
    toast.success("Respuesta a reseña guardada con éxito.");
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
              <p className="text-muted-foreground text-sm">
                Panel B2B y Gestión de Reservas • ID: {user?.id.slice(0, 8)}...
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleLogout} className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/10">
                <LogOut className="h-4 w-4" /> Cerrar Sesión
              </Button>
            </div>
          </div>

          {/* Quick Metrics / Top Cards */}
          <PartnerKpiCards
            totalEarned={totalEarned}
            totalCommission={totalCommission}
            activeBookings={activeBookings}
            rating={partnerProfile?.rating || "4.8"}
          />

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
              <PartnerAnalyticsChart data={partnerChartData} />
            </TabsContent>

            {/* TAB CONTENT: RESERVATIONS */}
            <TabsContent value="reservas">
              <PartnerReservationsTable
                reservations={reservations}
                onUpdateStatus={handleUpdateStatus}
              />
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
              <PartnerProfileForm
                businessName={businessName}
                setBusinessName={setBusinessName}
                businessType={businessType}
                setBusinessType={setBusinessType}
                phone={phone}
                setPhone={setPhone}
                email={email}
                setEmail={setEmail}
                description={description}
                setDescription={setDescription}
                loading={loading}
                onSubmit={handleUpdateProfile}
              />
            </TabsContent>

            {/* TAB CONTENT: REVIEWS */}
            <TabsContent value="resenas" className="space-y-6">
              <PartnerReviewsManager
                reviews={reviews}
                onReplyReview={handleReplyReview}
              />
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
