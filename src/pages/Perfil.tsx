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
  ChevronRight, Edit3, Save, X, Globe, Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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
                <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
                  <TabsTrigger value="favoritos" className="gap-2">
                    <Heart className="h-4 w-4" /> Favoritos
                  </TabsTrigger>
                  <TabsTrigger value="opiniones" className="gap-2">
                    <Star className="h-4 w-4" /> Opiniones
                  </TabsTrigger>
                  <TabsTrigger value="configuracion" className="gap-2">
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
                                <Link to={`/${fav.type}/${fav.id}`}>
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
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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

        <Footer />
      </div>
    </PageTransition>
  );
}
