import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getStoredJSON } from "@/lib/safeStorage";
import { motion } from "framer-motion";
import { 
  User, Heart, Star, Settings, MapPin, Calendar, Trash2, 
  ChevronRight, Edit3, Save, X, Globe, Compass, Printer, Download, Award, Share2,
  Plus, CreditCard, Wifi, QrCode, Ticket, Coins, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ProfilePassport } from "@/components/profile/ProfilePassport";
import { ProfileTimeline } from "@/components/profile/ProfileTimeline";
import { ProfileWallet } from "@/components/profile/ProfileWallet";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { ProfileSecurity } from "@/components/profile/ProfileSecurity";
import { ProfileFavoritesTab } from "@/components/profile/ProfileFavoritesTab";
import { ProfileReviewsTab } from "@/components/profile/ProfileReviewsTab";
import { ProfileRechargeModal } from "@/components/profile/ProfileRechargeModal";
import { ProfileQrViewerModal } from "@/components/profile/ProfileQrViewerModal";

interface Review {
  id: string;
  title: string;
  content: string;
  rating: number;
  location: string;
  category: string;
  created_at: string;
}

interface Profile {
  display_name: string | null;
  bio: string | null;
  preferred_language: string | null;
  travel_interests: string[] | null;
  avatar_url: string | null;
}

const interestOptions = [
  "Playas", "Aventura", "Cultura", "Gastronomía", "Historia",
  "Ecoturismo", "Vida Nocturna", "Bienestar", "Golf", "Buceo"
];

export default function Perfil() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { favorites, removeFavorite, loading: favLoading } = useFavorites();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    display_name: "",
    bio: "",
    preferred_language: "es",
    travel_interests: [],
    avatar_url: null,
  });
  const [profileLoading, setProfileLoading] = useState(true);

  // Timeline, Checkin & Swarm States
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [checkins, setCheckins] = useState<string[]>([]);
  const [badgesUnlocked, setBadgesUnlocked] = useState<any[]>([]);
  const [newTimelineDest, setNewTimelineDest] = useState("");
  const [newTimelineDate, setNewTimelineDate] = useState("");
  const [newTimelineNotes, setNewTimelineNotes] = useState("");
  const [selectedCheckinPlace, setSelectedCheckinPlace] = useState("Zona Colonial");
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<any>(null);

  // Unified Wallet States
  const [rdPassBalance, setRdPassBalance] = useState(2500);
  const [selectedTicket, setSelectedTicket] = useState<{ title: string; qrValue: string; type: string } | null>(null);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [customRechargeVal, setCustomRechargeVal] = useState("");

  const handleCustomRechargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(customRechargeVal);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Por favor ingresa un monto válido.");
      return;
    }
    setRdPassBalance(prev => prev + amt);
    toast.success(`¡Recarga de RD$ ${amt.toLocaleString("es-DO", { minimumFractionDigits: 2 })} completada con éxito!`);
    setIsRechargeModalOpen(false);
    setCustomRechargeVal("");
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserReviews();

      // Load Local Storage values
      const localTimeline = getStoredJSON<any[] | null>(`user_timeline_${user.id}`, null);
      if (localTimeline) {
        setTimelineEvents(localTimeline);
      } else {
        // Mock default timeline events
        const mockDefault = [
          { id: "1", name: "Santo Domingo", date: "2026-01-15", notes: "Primer día en la Zona Colonial. Visitamos el Alcázar de Colón." },
          { id: "2", name: "Punta Cana", date: "2026-03-22", notes: "Playas increíbles, arena blanca. Hicimos snorkel en Isla Saona." }
        ];
        setTimelineEvents(mockDefault);
        localStorage.setItem(`user_timeline_${user.id}`, JSON.stringify(mockDefault));
      }

      const localCheckins = getStoredJSON<string[] | null>(`user_checkins_${user.id}`, null);
      if (localCheckins) {
        setCheckins(localCheckins);
      } else {
        const defaultCheckins = ["Santo Domingo", "Punta Cana"];
        setCheckins(defaultCheckins);
        localStorage.setItem(`user_checkins_${user.id}`, JSON.stringify(defaultCheckins));
      }

      const localBadges = getStoredJSON<any[] | null>(`user_badges_${user.id}`, null);
      if (localBadges) {
        setBadgesUnlocked(localBadges);
      } else {
        const defaultBadges = [
          { name: "Primeros Pasos", description: "Completa tu registro en Descubre RD.", icon: "🎒", date: "2026-01-12" }
        ];
        setBadgesUnlocked(defaultBadges);
        localStorage.setItem(`user_badges_${user.id}`, JSON.stringify(defaultBadges));
      }
    }
  }, [user]);

  const handleAddTimelineEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTimelineDest || !newTimelineDate) return;

    const newEvent = {
      id: Date.now().toString(),
      name: newTimelineDest,
      date: newTimelineDate,
      notes: newTimelineNotes
    };

    const updated = [newEvent, ...timelineEvents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTimelineEvents(updated);
    localStorage.setItem(`user_timeline_${user!.id}`, JSON.stringify(updated));

    // Reset fields
    setNewTimelineDest("");
    setNewTimelineDate("");
    setNewTimelineNotes("");
    toast.success("¡Destino añadido a tu línea de tiempo! 🗺️");
  };

  const handleSwarmCheckin = () => {
    if (!user) return;
    if (checkins.includes(selectedCheckinPlace)) {
      toast.error(`Ya registraste un check-in en ${selectedCheckinPlace}`);
      return;
    }
    setIsCheckingIn(true);
    
    setTimeout(() => {
      setIsCheckingIn(false);
      const updatedCheckins = [selectedCheckinPlace, ...checkins];
      setCheckins(updatedCheckins);
      localStorage.setItem(`user_checkins_${user.id}`, JSON.stringify(updatedCheckins));
      
      // Unlock badge logic
      let newBadge = null;
      if (selectedCheckinPlace === "Zona Colonial") {
        newBadge = { name: "Conquistador Colonial", description: "Haz hecho check-in en la Primera Ciudad de América.", icon: "🏰", date: new Date().toLocaleDateString() };
      } else if (selectedCheckinPlace === "Bahía de las Águilas") {
        newBadge = { name: "Explorador del Suroeste", description: "Visita la playa más cristalina del país en Pedernales.", icon: "🦅", date: new Date().toLocaleDateString() };
      } else if (selectedCheckinPlace === "Salto El Limón") {
        newBadge = { name: "Amante de Cascadas", description: "Llega hasta la majestuosa cascada de El Limón en Samaná.", icon: "🌊", date: new Date().toLocaleDateString() };
      } else if (selectedCheckinPlace === "Playa Rincón") {
        newBadge = { name: "Conquistador de Playas", description: "Visita una de las 10 mejores playas del mundo.", icon: "🌴", date: new Date().toLocaleDateString() };
      }

      if (newBadge) {
        const updatedBadges = [newBadge, ...badgesUnlocked];
        setBadgesUnlocked(updatedBadges);
        localStorage.setItem(`user_badges_${user.id}`, JSON.stringify(updatedBadges));
        setUnlockedBadge(newBadge);
        toast.success(`Check-in exitoso en ${selectedCheckinPlace}! ¡Insignia desbloqueada: ${newBadge.name}! 🏆`);
      } else {
        toast.success(`Check-in exitoso en ${selectedCheckinPlace}! +15 XP`);
      }

      // Add to timeline automatically
      const newTimeline = {
        id: "checkin-" + Date.now(),
        name: selectedCheckinPlace,
        date: new Date().toISOString().split("T")[0],
        notes: `¡Check-in registrado mediante Swarm en ${selectedCheckinPlace}! Descubriendo las maravillas de Quisqueya.`
      };
      const updatedTimeline = [newTimeline, ...timelineEvents];
      setTimelineEvents(updatedTimeline);
      localStorage.setItem(`user_timeline_${user.id}`, JSON.stringify(updatedTimeline));
    }, 1500);
  };

  const exportPassportToPDF = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Pasaporte Turístico Dominicano - ${profile.display_name}</title>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0b1329; color: #fff; padding: 40px; text-align: center; }
          .passport-card { 
            max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #1e293b, #0f172a); 
            border: 4px solid #c5a880; border-radius: 20px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); 
          }
          .passport-header { border-bottom: 2px solid #c5a880; padding-bottom: 15px; margin-bottom: 20px; }
          .passport-header h1 { color: #c5a880; font-size: 20px; text-transform: uppercase; letter-spacing: 2px; margin: 0; }
          .passport-header p { font-size: 11px; color: #94a3b8; margin: 5px 0 0 0; }
          .passport-body { display: flex; gap: 20px; text-align: left; margin-bottom: 25px; }
          .passport-photo { width: 100px; height: 120px; background: #334155; border: 2px solid #c5a880; border-radius: 10px; display: flex; items-center; justify-content: center; font-size: 40px; }
          .passport-details { flex-grow: 1; font-size: 13px; line-height: 1.6; }
          .detail-row { margin-bottom: 8px; }
          .detail-label { font-size: 10px; text-transform: uppercase; color: #94a3b8; font-weight: bold; }
          .detail-value { font-weight: bold; color: #f8fafc; }
          .stamps-section { border-top: 1px dashed #334155; padding-top: 15px; }
          .stamps-title { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #c5a880; margin-bottom: 10px; text-align: left; }
          .stamps-grid { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-start; }
          .stamp-badge { background: #e0f2fe; color: #0284c7; border: 1.5px dashed #0284c7; padding: 4px 10px; border-radius: 30px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
          @media print {
            body { background: #fff; color: #000; padding: 0; }
            .passport-card { box-shadow: none; border-color: #000; color: #000; background: #fff; }
            .passport-header h1 { color: #000; }
            .passport-photo { border-color: #000; color: #000; }
            .detail-value { color: #000; }
            .stamp-badge { border-color: #000; color: #000; background: #fff; }
          }
        </style>
      </head>
      <body>
        <div class="passport-card">
          <div class="passport-header">
            <h1>Pasaporte Turístico Oficial</h1>
            <p>REPÚBLICA DOMINICANA • MINISTERIO DE TURISMO</p>
          </div>
          <div class="passport-body">
            <div class="passport-photo">👤</div>
            <div class="passport-details">
              <div class="detail-row">
                <div class="detail-label">Nombre del Viajero</div>
                <div class="detail-value">${profile.display_name}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Número de Serie</div>
                <div class="detail-value">RD-${Math.floor(100000 + Math.random() * 900000)}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">País de Destino</div>
                <div class="detail-value">República Dominicana</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Fecha de Expedición</div>
                <div class="detail-value">${new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>
          <div class="stamps-section">
            <div class="stamps-title">Sellos de Visita (${checkins.length})</div>
            <div class="stamps-grid">
              ${checkins.map(place => `<span class="stamp-badge">📍 ${place}</span>`).join("")}
            </div>
          </div>
        </div>
        <script>
          window.focus();
          setTimeout(() => {
            window.print();
            window.close();
          }, 250);
        </script>
      </body>
      </html>
    `;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      toast.success("Generando pasaporte para exportar a PDF...");
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserReviews();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setProfileLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("display_name, bio, preferred_language, travel_interests, avatar_url")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setProfile({
        display_name: data.display_name || user.email?.split("@")[0] || "",
        bio: data.bio || "",
        preferred_language: data.preferred_language || "es",
        travel_interests: data.travel_interests || [],
        avatar_url: data.avatar_url,
      });
    } else {
      setProfile(prev => ({ ...prev, display_name: user.email?.split("@")[0] || "" }));
    }
    setProfileLoading(false);
  };

  const fetchUserReviews = async () => {
    if (!user) return;
    setReviewsLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setReviews(data || []);
    setReviewsLoading(false);
  };

  const handleDeleteReview = async (reviewId: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
    if (error) {
      toast.error("Error al eliminar la opinión");
    } else {
      setReviews(reviews.filter(r => r.id !== reviewId));
      toast.success("Opinión eliminada");
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: profile.display_name,
        bio: profile.bio,
        preferred_language: profile.preferred_language,
        travel_interests: profile.travel_interests,
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Error al guardar el perfil");
    } else {
      toast.success("Perfil actualizado");
      setIsEditing(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setProfile(prev => {
      const current = prev.travel_interests || [];
      return {
        ...prev,
        travel_interests: current.includes(interest)
          ? current.filter(i => i !== interest)
          : [...current, interest],
      };
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <PageTransition>
      <SEOHead
        title="Mi Perfil"
        description="Gestiona tu perfil, favoritos y opiniones en Descubre República Dominicana."
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 pt-20">
          {/* Profile Header */}
          <section className="bg-gradient-to-b from-primary/10 to-background py-12">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <div className="text-center md:text-left flex-1">
                  {profileLoading ? (
                    <Skeleton className="h-8 w-48 mb-2" />
                  ) : isEditing ? (
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <Input
                        value={profile.display_name || ""}
                        onChange={(e) => setProfile(p => ({ ...p, display_name: e.target.value }))}
                        className="max-w-xs"
                      />
                      <Button size="icon" variant="ghost" onClick={handleSaveProfile}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <h1 className="font-display text-2xl font-bold text-foreground">
                        {profile.display_name}
                      </h1>
                      <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <p className="text-muted-foreground">{user.email}</p>
                  <div className="flex items-center gap-4 mt-2 justify-center md:justify-start flex-wrap">
                    <Badge variant="secondary" className="gap-1">
                      <Heart className="h-3 w-3" /> {favorites.length} Favoritos
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Star className="h-3 w-3" /> {reviews.length} Opiniones
                    </Badge>
                    {(profile.travel_interests?.length || 0) > 0 && (
                      <Badge variant="secondary" className="gap-1">
                        <Compass className="h-3 w-3" /> {profile.travel_interests!.length} Intereses
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tabs Content */}
          <section className="py-8">
            <div className="container mx-auto px-4">
              <Tabs defaultValue="favoritos" className="w-full">
                <TabsList className="grid w-full max-w-4xl grid-cols-2 md:grid-cols-6 gap-2 mb-8 bg-muted/50 p-1 rounded-xl">
                  <TabsTrigger value="favoritos" className="gap-2 rounded-lg">
                    <Heart className="h-4 w-4" /> Favoritos
                  </TabsTrigger>
                  <TabsTrigger value="opiniones" className="gap-2 rounded-lg">
                    <Star className="h-4 w-4" /> Opiniones
                  </TabsTrigger>
                  <TabsTrigger value="pasaporte" className="gap-2 rounded-lg">
                    <Award className="h-4 w-4" /> Pasaporte
                  </TabsTrigger>
                  <TabsTrigger value="wallet" className="gap-2 rounded-lg">
                    <CreditCard className="h-4 w-4" /> Mi Billetera
                  </TabsTrigger>
                  <TabsTrigger value="seguridad" className="gap-2 rounded-lg">
                    <Shield className="h-4 w-4 text-primary" /> Seguridad
                  </TabsTrigger>
                  <TabsTrigger value="configuracion" className="gap-2 rounded-lg">
                    <Settings className="h-4 w-4" /> Ajustes
                  </TabsTrigger>
                </TabsList>

                {/* Favoritos Tab */}
                <TabsContent value="favoritos">
                  <ProfileFavoritesTab
                    favorites={favorites}
                    favLoading={favLoading}
                    onRemoveFavorite={removeFavorite}
                  />
                </TabsContent>

                {/* Opiniones Tab */}
                <TabsContent value="opiniones">
                  <ProfileReviewsTab
                    reviews={reviews}
                    reviewsLoading={reviewsLoading}
                    onDeleteReview={handleDeleteReview}
                  />
                </TabsContent>

                {/* Pasaporte & Swarm Tab */}
                <TabsContent value="pasaporte" className="space-y-6">
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <ProfilePassport
                        user={user}
                        profile={profile}
                        checkins={checkins}
                        badgesUnlocked={badgesUnlocked}
                        selectedCheckinPlace={selectedCheckinPlace}
                        setSelectedCheckinPlace={setSelectedCheckinPlace}
                        isCheckingIn={isCheckingIn}
                        handleSwarmCheckin={handleSwarmCheckin}
                        exportPassportToPDF={exportPassportToPDF}
                      />
                    </div>
                    <div>
                      <ProfileTimeline
                        timelineEvents={timelineEvents}
                        newTimelineDest={newTimelineDest}
                        setNewTimelineDest={setNewTimelineDest}
                        newTimelineDate={newTimelineDate}
                        setNewTimelineDate={setNewTimelineDate}
                        newTimelineNotes={newTimelineNotes}
                        setNewTimelineNotes={setNewTimelineNotes}
                        handleAddTimelineEvent={handleAddTimelineEvent}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Mi Billetera (Wallet Unificado) Tab */}
                <TabsContent value="wallet">
                  <ProfileWallet
                    profile={profile}
                    rdPassBalance={rdPassBalance}
                    setRdPassBalance={setRdPassBalance}
                    setIsRechargeModalOpen={setIsRechargeModalOpen}
                    setSelectedTicket={setSelectedTicket}
                  />
                </TabsContent>

                {/* Seguridad Tab */}
                <TabsContent value="seguridad">
                  <ProfileSecurity user={user} />
                </TabsContent>

                {/* Configuración Tab */}
                <TabsContent value="configuracion">
                  <ProfileSettings
                    user={user}
                    profile={profile}
                    setProfile={setProfile}
                    handleSaveProfile={handleSaveProfile}
                    toggleInterest={toggleInterest}
                    signOut={signOut}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </section>
        </main>

        {/* Custom Recharge Modal */}
        <ProfileRechargeModal
          open={isRechargeModalOpen}
          onOpenChange={setIsRechargeModalOpen}
          customRechargeVal={customRechargeVal}
          onCustomRechargeValChange={setCustomRechargeVal}
          onSubmit={handleCustomRechargeSubmit}
        />

        {/* QR Code Ticket Viewer Modal */}
        <ProfileQrViewerModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />

        <Footer />
      </div>
    </PageTransition>
  );
}
