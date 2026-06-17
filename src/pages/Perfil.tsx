import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { 
  User, Heart, Star, Settings, MapPin, Calendar, Trash2, 
  ChevronRight, Edit3, Save, X, Globe, Compass, Printer, Download, Award, Share2,
  Plus, CreditCard, Wifi, QrCode, Ticket, Coins
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
      const localTimeline = localStorage.getItem(`user_timeline_${user.id}`);
      if (localTimeline) {
        setTimelineEvents(JSON.parse(localTimeline));
      } else {
        // Mock default timeline events
        const mockDefault = [
          { id: "1", name: "Santo Domingo", date: "2026-01-15", notes: "Primer día en la Zona Colonial. Visitamos el Alcázar de Colón." },
          { id: "2", name: "Punta Cana", date: "2026-03-22", notes: "Playas increíbles, arena blanca. Hicimos snorkel en Isla Saona." }
        ];
        setTimelineEvents(mockDefault);
        localStorage.setItem(`user_timeline_${user.id}`, JSON.stringify(mockDefault));
      }

      const localCheckins = localStorage.getItem(`user_checkins_${user.id}`);
      if (localCheckins) {
        setCheckins(JSON.parse(localCheckins));
      } else {
        const defaultCheckins = ["Santo Domingo", "Punta Cana"];
        setCheckins(defaultCheckins);
        localStorage.setItem(`user_checkins_${user.id}`, JSON.stringify(defaultCheckins));
      }

      const localBadges = localStorage.getItem(`user_badges_${user.id}`);
      if (localBadges) {
        setBadgesUnlocked(JSON.parse(localBadges));
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
                <TabsList className="grid w-full max-w-3xl grid-cols-2 md:grid-cols-5 gap-2 mb-8 bg-muted/50 p-1 rounded-xl">
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
                  <TabsTrigger value="configuracion" className="gap-2 rounded-lg">
                    <Settings className="h-4 w-4" /> Ajustes
                  </TabsTrigger>
                </TabsList>

                {/* Favoritos Tab */}
                <TabsContent value="favoritos">
                  {favLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-48 rounded-xl" />
                      ))}
                    </div>
                  ) : favorites.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold text-foreground mb-2">No tienes favoritos guardados</h3>
                        <p className="text-muted-foreground mb-4">Explora destinos, hoteles y experiencias para guardar tus favoritos.</p>
                        <Link to="/destinos"><Button>Explorar Destinos</Button></Link>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {favorites.map((fav, index) => (
                        <motion.div key={fav.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                          <Card className="overflow-hidden group">
                            <div className="relative aspect-video">
                              <img src={fav.image || "/placeholder.svg"} alt={fav.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              <Badge className="absolute top-3 left-3 capitalize">{fav.type}</Badge>
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-semibold text-foreground mb-1">{fav.name}</h3>
                              {fav.location && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" /> {fav.location}
                                </p>
                              )}
                              <div className="flex items-center justify-between mt-4">
                                <Link to={
                                  fav.type === "hotel" ? `/alojamiento/${fav.id}` :
                                  fav.type === "guia" ? `/guias-locales` :
                                  fav.type === "reserva-natural" ? `/reservas-naturales` :
                                  fav.type === "parque-nacional" ? `/parque-nacional/${fav.id}` :
                                  fav.type === "destino-religioso" ? `/destino-religioso/${fav.id}` :
                                  `/${fav.type}/${fav.id}`
                                }>
                                  <Button variant="outline" size="sm" className="gap-1">Ver <ChevronRight className="h-4 w-4" /></Button>
                                </Link>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeFavorite(fav.id, fav.type)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Opiniones Tab */}
                <TabsContent value="opiniones">
                  {reviewsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
                    </div>
                  ) : reviews.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold text-foreground mb-2">No has publicado opiniones</h3>
                        <p className="text-muted-foreground mb-4">Comparte tus experiencias de viaje con otros viajeros.</p>
                        <Link to="/opiniones"><Button>Escribir Opinión</Button></Link>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review, index) => (
                        <motion.div key={review.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-foreground">{review.title}</h3>
                                    <Badge variant="secondary">{review.category}</Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {review.location}</span>
                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(review.created_at).toLocaleDateString("es-DO")}</span>
                                    <span className="flex items-center gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                                      ))}
                                    </span>
                                  </div>
                                  <p className="text-muted-foreground line-clamp-2">{review.content}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteReview(review.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Pasaporte & Swarm Tab */}
                <TabsContent value="pasaporte" className="space-y-6">
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column: Digital Passport */}
                    <div className="lg:col-span-2 space-y-6">
                      <Card className="overflow-hidden border-2 border-amber-500/30 bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-xl relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                        <CardHeader className="border-b border-amber-500/20 pb-4 bg-slate-950/80">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Compass className="h-6 w-6 text-amber-500 animate-spin-slow" />
                              <div>
                                <CardTitle className="text-sm font-bold tracking-widest text-amber-500 uppercase">
                                  Pasaporte Turístico Dominicano
                                </CardTitle>
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                                  República Dominicana • Ministerio de Turismo
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="border-amber-500/40 text-amber-500 bg-amber-500/10 uppercase text-[10px] tracking-wider">
                              Oficial
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="p-6 space-y-6">
                          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                            {/* Photo Slot */}
                            <div className="w-28 h-36 border-2 border-amber-500/30 bg-slate-800 rounded-lg flex flex-col items-center justify-center relative overflow-hidden shadow-inner shrink-0 group">
                              <User className="h-16 w-16 text-slate-600 group-hover:scale-110 transition-transform duration-300" />
                              <div className="absolute bottom-1 text-[8px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 uppercase tracking-widest font-bold">
                                Viajero
                              </div>
                            </div>

                            {/* Passport Info */}
                            <div className="grid grid-cols-2 gap-4 flex-1 text-sm">
                              <div>
                                <p className="text-[10px] text-slate-400 uppercase font-semibold">Nombre del Titular</p>
                                <p className="font-bold text-slate-100">{profile.display_name || "Explorador RD"}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-400 uppercase font-semibold">Número de Pasaporte</p>
                                <p className="font-mono font-bold text-amber-400">RD-{user.id.slice(0, 8).toUpperCase()}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-400 uppercase font-semibold">País de Destino</p>
                                <p className="font-bold text-slate-100">República Dominicana</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-400 uppercase font-semibold">Fecha de Expedición</p>
                                <p className="font-bold text-slate-100">{new Date().toLocaleDateString("es-DO")}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-[10px] text-slate-400 uppercase font-semibold">Biografía de Viajes</p>
                                <p className="text-xs text-slate-300 italic line-clamp-2">
                                  {profile.bio || "Explorando las playas, ríos, montañas e historia de la hermosa República Dominicana."}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Passport Stamps section */}
                          <div className="border-t border-slate-800 pt-4">
                            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" /> Sellos de Visita ({checkins.length})
                            </h4>
                            {checkins.length === 0 ? (
                              <div className="text-center py-6 border border-dashed border-slate-800 rounded-lg text-xs text-slate-400">
                                No has registrado visitas en el país. ¡Usa el widget Swarm abajo para sellar tu pasaporte!
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-3">
                                {checkins.map((place) => (
                                  <div
                                    key={place}
                                    className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 uppercase shadow-sm animate-pulse-subtle"
                                  >
                                    <span className="text-xs">📍</span>
                                    <span>{place}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>

                        <div className="bg-slate-950/80 border-t border-slate-800 p-4 flex flex-wrap gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={exportPassportToPDF}
                            className="bg-slate-900 border-amber-500/30 hover:border-amber-500 hover:bg-slate-800 text-amber-500 text-xs font-semibold gap-1.5"
                          >
                            <Printer className="h-3.5 w-3.5" /> Exportar Pasaporte
                          </Button>
                        </div>
                      </Card>

                      {/* Swarm Check-In Widget */}
                      <Card className="border border-border bg-card shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            Registrar Visita (Estilo Swarm)
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            ¿Estás de visita en algún rincón dominicano? Elige un destino popular, registra tu check-in por geolocalización simulada y desbloquea insignias.
                          </p>

                          <div className="flex flex-col sm:flex-row gap-3">
                            <select
                              value={selectedCheckinPlace}
                              onChange={(e) => setSelectedCheckinPlace(e.target.value)}
                              className="flex-grow rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                              title="Lugar de Check-in"
                            >
                              <option value="Zona Colonial">Zona Colonial (Santo Domingo) 🏰</option>
                              <option value="Bahía de las Águilas">Bahía de las Águilas (Pedernales) 🦅</option>
                              <option value="Salto El Limón">Salto El Limón (Samaná) 🌊</option>
                              <option value="Playa Rincón">Playa Rincón (Samaná) 🌴</option>
                              <option value="Dunas de Baní">Dunas de Baní (Baní) 🏜️</option>
                              <option value="Teleférico de Puerto Plata">Teleférico de Puerto Plata 🚠</option>
                            </select>

                            <Button onClick={handleSwarmCheckin} disabled={isCheckingIn} className="gap-2 sm:w-44 font-bold shrink-0">
                              {isCheckingIn ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                  Ubicando...
                                </>
                              ) : (
                                <>
                                  <Compass className="h-4 w-4 animate-spin-slow" />
                                  Check-in Aquí
                                </>
                              )}
                            </Button>
                          </div>

                          {/* Insignias Desbloqueadas */}
                          <div className="pt-4 border-t border-border">
                            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                              <Award className="h-4 w-4 text-amber-500" /> Insignias Desbloqueadas ({badgesUnlocked.length})
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {badgesUnlocked.map((badge, idx) => (
                                <div key={idx} className="flex gap-3 p-3 bg-secondary/50 rounded-xl border border-border items-center">
                                  <span className="text-3xl p-1 bg-background rounded-lg border border-border">{badge.icon}</span>
                                  <div>
                                    <p className="font-semibold text-xs text-foreground">{badge.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{badge.description}</p>
                                    <p className="text-[8px] text-primary/70 font-mono mt-0.5">Ganado: {badge.date}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Right Column: Travel Timeline */}
                    <div className="space-y-6">
                      <Card className="border border-border bg-card shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            Agregar Destino a mi Timeline
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={handleAddTimelineEvent} className="space-y-3">
                            <div>
                              <label className="text-xs text-muted-foreground font-semibold">Destino</label>
                              <Input
                                placeholder="Ej. Jarabacoa, Las Terrenas..."
                                value={newTimelineDest}
                                onChange={(e) => setNewTimelineDest(e.target.value)}
                                required
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground font-semibold">Fecha del Viaje</label>
                              <Input
                                type="date"
                                value={newTimelineDate}
                                onChange={(e) => setNewTimelineDate(e.target.value)}
                                required
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground font-semibold">Notas del viaje</label>
                              <Textarea
                                placeholder="Describe brevemente tus mejores recuerdos..."
                                value={newTimelineNotes}
                                onChange={(e) => setNewTimelineNotes(e.target.value)}
                                rows={3}
                                className="mt-1 resize-none"
                              />
                            </div>
                            <Button type="submit" className="w-full text-xs font-bold gap-1">
                              <Plus className="h-3.5 w-3.5" /> Agregar Parada
                            </Button>
                          </form>
                        </CardContent>
                      </Card>

                      <Card className="border border-border bg-card shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-lg font-bold text-foreground">
                            Línea de Tiempo de Viajes
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {timelineEvents.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-6">
                              No has añadido paradas a tu línea de tiempo todavía.
                            </p>
                          ) : (
                            <div className="relative border-l border-border ml-2 pl-4 space-y-6 py-2">
                              {timelineEvents.map((event) => (
                                <div key={event.id} className="relative">
                                  {/* Dot */}
                                  <div className="absolute -left-[21px] top-1 w-3.5 h-3.5 rounded-full bg-primary border-2 border-background shadow-sm" />
                                  <div>
                                    <p className="text-xs font-bold text-foreground">{event.name}</p>
                                    <p className="text-[9px] text-muted-foreground font-mono">{event.date}</p>
                                    {event.notes && (
                                      <p className="text-[11px] text-muted-foreground mt-1 bg-secondary/30 p-2 rounded-lg border border-border/50 italic leading-relaxed">
                                        {event.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                {/* Mi Billetera (Wallet Unificado) Tab */}
                <TabsContent value="wallet">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Mi Billetera Digital</h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        Visualiza y gestiona tu tarjeta turística prepago RD Pass, tus eSIMs móviles y tus boletos comprados para eventos.
                      </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                      {/* Col 1 & 2: RD Pass y eSIM */}
                      <div className="lg:col-span-2 space-y-6">
                        
                        {/* RD Pass Premium Card Container */}
                        <Card className="border border-amber-500/20 bg-gradient-to-br from-amber-600/90 via-amber-700/80 to-amber-950/90 text-white relative overflow-hidden shadow-2xl rounded-3xl">
                          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                            <Compass className="h-64 w-64 text-white" />
                          </div>
                          
                          <CardContent className="p-6 md:p-8 space-y-6 relative z-10">
                            {/* Card Header */}
                            <div className="flex justify-between items-start">
                              <div>
                                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none font-mono text-[9px] uppercase tracking-wider">
                                  RD Pass Prepago
                                </Badge>
                                <h3 className="text-xs text-white/70 font-semibold tracking-widest uppercase mt-2">Descubre República Dominicana</h3>
                              </div>
                              <div className="flex items-center gap-2">
                                <Wifi className="h-5 w-5 text-white/80 rotate-90" />
                                <div className="h-8 w-12 bg-white/10 rounded-md border border-white/20 flex items-center justify-center font-bold text-sm tracking-tighter">
                                  RD
                                </div>
                              </div>
                            </div>

                            {/* Card Chip & Balance */}
                            <div className="flex justify-between items-end pt-4">
                              <div className="space-y-1">
                                <p className="text-[10px] text-white/60 uppercase tracking-wider">Balance Disponible</p>
                                <h2 className="text-3xl md:text-4xl font-mono font-extrabold text-white">
                                  RD$ {rdPassBalance.toLocaleString(".00")}
                                </h2>
                                <p className="text-xs text-white/70 font-mono">
                                  ≈ USD ${(rdPassBalance / 59.0).toFixed(2)}
                                </p>
                              </div>
                              
                              {/* Simulated Gold Chip */}
                              <div className="w-10 h-8 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 rounded-md border border-amber-600 shadow-inner flex flex-col justify-between p-1.5 opacity-90">
                                <div className="w-full h-0.5 bg-amber-700/30" />
                                <div className="w-full h-0.5 bg-amber-700/30" />
                                <div className="w-full h-0.5 bg-amber-700/30" />
                              </div>
                            </div>

                            {/* Card Footer */}
                            <div className="flex justify-between items-end pt-4 border-t border-white/10">
                              <div>
                                <p className="text-[8px] text-white/50 uppercase tracking-widest">Titular</p>
                                <p className="text-sm font-semibold tracking-wide">{profile.display_name || "Turista Invitado"}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[8px] text-white/50 uppercase tracking-widest">Número de Cuenta</p>
                                <p className="text-sm font-mono tracking-widest">•••• •••• •••• 8290</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Quick Recharge Balance Actions */}
                        <Card className="border bg-card/40">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                              <Coins className="h-4 w-4 text-amber-500" /> Recargar Saldo RD Pass
                            </CardTitle>
                            <CardDescription className="text-xs">
                              Añade saldo instantáneo a tu tarjeta prepagada para usar en comercios turísticos aliados.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                              <Button 
                                variant="outline" 
                                className="border-amber-500/20 text-amber-500 hover:bg-amber-500/5 text-xs font-bold"
                                onClick={() => {
                                  setRdPassBalance(prev => prev + 500);
                                  toast.success("¡Recarga de RD$ 500.00 completada con éxito!");
                                }}
                              >
                                + RD$ 500
                              </Button>
                              <Button 
                                variant="outline" 
                                className="border-amber-500/20 text-amber-500 hover:bg-amber-500/5 text-xs font-bold"
                                onClick={() => {
                                  setRdPassBalance(prev => prev + 1000);
                                  toast.success("¡Recarga de RD$ 1,000.00 completada con éxito!");
                                }}
                              >
                                + RD$ 1,000
                              </Button>
                              <Button 
                                variant="outline" 
                                className="border-amber-500/20 text-amber-500 hover:bg-amber-500/5 text-xs font-bold"
                                onClick={() => {
                                  setRdPassBalance(prev => prev + 2000);
                                  toast.success("¡Recarga de RD$ 2,000.00 completada con éxito!");
                                }}
                              >
                                + RD$ 2,000
                              </Button>
                            </div>
                            <Button 
                              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                              onClick={() => setIsRechargeModalOpen(true)}
                            >
                              Recarga Personalizada
                            </Button>
                          </CardContent>
                        </Card>

                        {/* Recent Transactions list */}
                        <Card className="border bg-card/40">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold">Historial de Transacciones Recientes</CardTitle>
                          </CardHeader>
                          <CardContent className="p-0">
                            <div className="divide-y divide-border/60">
                              <div className="p-4 flex justify-between items-center text-xs">
                                <div>
                                  <p className="font-semibold text-foreground">Texaco - Combustible</p>
                                  <p className="text-[10px] text-muted-foreground">Hace 2 horas • Bayahíbe, RD</p>
                                </div>
                                <span className="font-mono font-bold text-red-500">- RD$ 800.00</span>
                              </div>
                              <div className="p-4 flex justify-between items-center text-xs">
                                <div>
                                  <p className="font-semibold text-foreground">eSIM Turista - Descubre RD</p>
                                  <p className="text-[10px] text-muted-foreground">Hace 1 día • Tienda App</p>
                                </div>
                                <span className="font-mono font-bold text-red-500">- RD$ 450.00</span>
                              </div>
                              <div className="p-4 flex justify-between items-center text-xs">
                                <div>
                                  <p className="font-semibold text-foreground">Bono Cashback - Reserva de Hotel</p>
                                  <p className="text-[10px] text-muted-foreground">Hace 2 días • Recompensa</p>
                                </div>
                                <span className="font-mono font-bold text-emerald-500">+ RD$ 250.00</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                      </div>

                      {/* Col 3: eSIM y Boletos QR */}
                      <div className="space-y-6">
                        
                        {/* eSIM Card details */}
                        <Card className="border bg-card/40">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                              <Wifi className="h-4 w-4 text-emerald-500" /> Mi eSIM Activa
                            </CardTitle>
                            <CardDescription className="text-xs">Perfil eSIM de Internet Celular Prepago.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="bg-muted/40 p-4 rounded-xl border space-y-3">
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">Operadora:</span>
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[10px]">Claro RD LTE</Badge>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground font-sans">Estado:</span>
                                <span className="text-emerald-500 font-bold flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> CONECTADO
                                </span>
                              </div>
                              
                              <div className="space-y-1.5 pt-2">
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-muted-foreground">Datos Consumidos:</span>
                                  <span className="font-bold text-foreground">2.4 GB / 10 GB</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[24%]" />
                                </div>
                              </div>
                            </div>

                            <Button 
                              variant="outline" 
                              className="w-full text-xs font-bold gap-1.5 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/5"
                              onClick={() => setSelectedTicket({
                                title: "eSIM Claro Dominicana",
                                type: "eSIM Móvil Turista",
                                qrValue: "LPA:1$RSP.CLARO.DO$DESCUBRERDESIMPROMO2026"
                              })}
                            >
                              <QrCode className="h-3.5 w-3.5" /> Mostrar QR de Activación
                            </Button>
                          </CardContent>
                        </Card>

                        {/* Boletos & Eventos QR List */}
                        <Card className="border bg-card/40">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                              <Ticket className="h-4 w-4 text-primary" /> Mis Boletos y Reservas
                            </CardTitle>
                            <CardDescription className="text-xs">Muestra estos códigos QR en las entradas de los recintos.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            
                            {/* Ticket 1: LIDOM */}
                            <div className="p-3 bg-muted/30 border border-border/80 rounded-xl space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <Badge className="bg-primary/20 text-primary border-primary/20 text-[9px] uppercase">
                                    Béisbol Invernal LIDOM
                                  </Badge>
                                  <h4 className="font-bold text-xs text-foreground mt-1.5">Licey vs. Águilas Cibaeñas</h4>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">Estadio Quisqueya • Sto Dgo, RD</p>
                                </div>
                              </div>
                              <div className="flex justify-between items-center text-[10px] text-muted-foreground border-t border-border/60 pt-2">
                                <span>Preferencia C • Fila 4, As. 12</span>
                                <span>Hoy, 19:30</span>
                              </div>
                              <Button 
                                size="sm" 
                                className="w-full text-[11px] font-bold gap-1.5 h-8"
                                onClick={() => setSelectedTicket({
                                  title: "Licey vs. Águilas (LIDOM)",
                                  type: "Boleto de Entrada Estadio",
                                  qrValue: "TICKET-LIDOM-LIC-AGU-2026-PREF-C4-12"
                                })}
                              >
                                <QrCode className="h-3.5 w-3.5" /> Ver QR de Entrada
                              </Button>
                            </div>

                            {/* Ticket 2: Tour */}
                            <div className="p-3 bg-muted/30 border border-border/80 rounded-xl space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[9px] uppercase">
                                    Excursión Certificada
                                  </Badge>
                                  <h4 className="font-bold text-xs text-foreground mt-1.5">Tour Express - Cayo Arena</h4>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">Operado por Runners Adventures</p>
                                </div>
                              </div>
                              <div className="flex justify-between items-center text-[10px] text-muted-foreground border-t border-border/60 pt-2">
                                <span>Punto: Muelle Punta Rucia</span>
                                <span>Mañana, 08:00 AM</span>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="w-full text-[11px] font-bold gap-1.5 h-8"
                                onClick={() => setSelectedTicket({
                                  title: "Tour Express Cayo Arena",
                                  type: "Voucher de Excursión",
                                  qrValue: "VOUCHER-RUNNERS-CAYO-ARENA-29302-2026"
                                })}
                              >
                                <QrCode className="h-3.5 w-3.5" /> Ver QR de Voucher
                              </Button>
                            </div>

                          </CardContent>
                        </Card>

                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Configuración Tab */}
                <TabsContent value="configuracion">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Información Personal</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-foreground">Email</label>
                          <Input value={user.email || ""} disabled className="mt-1" />
                          <p className="text-xs text-muted-foreground mt-1">El email no puede ser modificado</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground">Nombre para mostrar</label>
                          <Input
                            value={profile.display_name || ""}
                            onChange={(e) => setProfile(p => ({ ...p, display_name: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground">Bio</label>
                          <Textarea
                            value={profile.bio || ""}
                            onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))}
                            placeholder="Cuéntanos sobre ti como viajero..."
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground flex items-center gap-1">
                            <Globe className="h-3 w-3" /> Idioma preferido
                          </label>
                          <select
                            value={profile.preferred_language || "es"}
                            onChange={(e) => setProfile(p => ({ ...p, preferred_language: e.target.value }))}
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                            title="Idioma preferido"
                          >
                            <option value="es">Español</option>
                            <option value="en">English</option>
                            <option value="fr">Français</option>
                            <option value="de">Deutsch</option>
                          </select>
                        </div>
                        <Button onClick={handleSaveProfile} className="w-full">Guardar Cambios</Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Compass className="h-5 w-5" /> Intereses de Viaje
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                           Selecciona tus intereses para recibir recomendaciones personalizadas.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {interestOptions.map(interest => (
                            <Badge
                              key={interest}
                              variant={(profile.travel_interests || []).includes(interest) ? "default" : "outline"}
                              className="cursor-pointer transition-colors"
                              onClick={() => toggleInterest(interest)}
                            >
                              {interest}
                            </Badge>
                          ))}
                        </div>
                        <Button onClick={handleSaveProfile} variant="outline" className="w-full mt-6">
                          Guardar Intereses
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="mt-6">
                    <CardContent className="py-6 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">Cerrar Sesión</h3>
                        <p className="text-sm text-muted-foreground">Cierra tu sesión en este dispositivo.</p>
                      </div>
                      <Button variant="destructive" onClick={signOut}>Cerrar Sesión</Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </section>
        </main>

        {/* Custom Recharge Modal */}
        <Dialog open={isRechargeModalOpen} onOpenChange={setIsRechargeModalOpen}>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-foreground">Recarga Personalizada - RD Pass</DialogTitle>
              <DialogDescription className="text-xs">Ingresa el monto y los datos de tu tarjeta de crédito o débito internacional.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCustomRechargeSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Monto a Recargar (DOP)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm text-muted-foreground">RD$</span>
                  <Input
                    type="number"
                    min="100"
                    max="50000"
                    placeholder="1000"
                    value={customRechargeVal}
                    onChange={(e) => setCustomRechargeVal(e.target.value)}
                    required
                    className="pl-12 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Número de Tarjeta</label>
                <Input
                  type="text"
                  placeholder="4000 1234 5678 9010"
                  pattern="[0-9 ]{12,19}"
                  maxLength={19}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Vencimiento</label>
                  <Input type="text" placeholder="MM/AA" maxLength={5} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">CVV</label>
                  <Input type="password" placeholder="***" maxLength={4} required />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsRechargeModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold">
                  Proceder al Pago
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* QR Code Ticket Viewer Modal */}
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="sm:max-w-[400px] text-center space-y-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-foreground">{selectedTicket?.title}</DialogTitle>
              <DialogDescription className="text-xs">{selectedTicket?.type}</DialogDescription>
            </DialogHeader>

            {selectedTicket && (
              <div className="bg-white p-6 rounded-2xl border flex flex-col items-center justify-center space-y-4 shadow-inner relative overflow-hidden group">
                {/* Laser scan animation effect */}
                <div className="absolute left-0 right-0 h-0.5 bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-[bounce_3s_infinite]" />
                
                {/* Styled vector QR Code representation */}
                <svg className="w-48 h-48 text-zinc-950" viewBox="0 0 100 100" fill="currentColor">
                  {/* Outer borders */}
                  <path d="M0,0 h30 v10 h-20 v20 h-10 z M70,0 h30 v30 h-10 v-20 h-20 z M0,70 h10 v20 h20 v10 h-30 z M90,90 h-20 v10 h30 v-30 h-10 z" />
                  {/* Top-left position block */}
                  <path d="M10,10 h20 v20 h-20 z M15,15 h10 v10 h-10 z" />
                  {/* Top-right position block */}
                  <path d="M70,10 h20 v20 h-20 z M75,15 h10 v10 h-10 z" />
                  {/* Bottom-left position block */}
                  <path d="M10,70 h20 v20 h-20 z M15,75 h10 v10 h-10 z" />
                  {/* Random noise bits */}
                  <path d="M45,10 h10 v10 h-10 z M35,25 h15 v5 h-15 z M55,30 h10 v10 h-10 z M40,40 h10 v10 h-10 z M25,45 h10 v10 h-10 z M70,45 h15 v10 h-15 z M45,60 h20 v5 h-20 z M55,75 h10 v10 h-10 z M35,80 h15 v10 h-15 z M75,75 h10 v15 h-10 z" />
                </svg>

                <div className="font-mono text-xs text-zinc-500 bg-zinc-100 px-3 py-1 rounded-md select-all">
                  {selectedTicket.qrValue}
                </div>
              </div>
            )}

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-xs text-center text-emerald-600 font-bold flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Listo para ser Escaneado
            </div>

            <Button className="w-full" onClick={() => setSelectedTicket(null)}>
              Cerrar Código
            </Button>
          </DialogContent>
        </Dialog>

        <Footer />
      </div>
    </PageTransition>
  );
}
