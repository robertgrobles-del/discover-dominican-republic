import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Trophy, Star, Zap, Crown, Flame, Target, Award,
  MapPin, Share2, ChevronRight, Calendar, Shield, Compass,
  Medal, Users, UserPlus, UserMinus, Clock, ArrowLeft, ArrowUpRight
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BadgeAlbum, BadgeItem, BadgeRarity } from "@/components/gamification/BadgeAlbum";
import { toast } from "sonner";

interface ExplorerProfileData {
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  travel_interests: string[] | null;
}

interface ExplorerGamificationData {
  total_xp: number;
  current_level: number;
  coins: number;
  streak_days: number;
  total_missions_completed: number;
}

interface Transaction {
  id: string;
  transaction_type: string;
  xp_amount: number | null;
  coin_amount: number | null;
  description: string | null;
  source_type: string | null;
  created_at: string;
}

interface Level {
  level_number: number;
  title: string;
  icon: string;
  color: string;
  xp_required: number;
}

export default function ExplorerProfile() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  
  const [profile, setProfile] = useState<ExplorerProfileData | null>(null);
  const [gamification, setGamification] = useState<ExplorerGamificationData | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const isOwnProfile = currentUser?.id === id;

  const fetchFollowData = useCallback(async () => {
    if (!id) return;
    try {
      // Get counts
      const [followersRes, followingRes] = await Promise.all([
        supabase
          .from("explorer_follows")
          .select("*", { count: "exact", head: true })
          .eq("following_id", id),
        supabase
          .from("explorer_follows")
          .select("*", { count: "exact", head: true })
          .eq("follower_id", id)
      ]);

      setFollowersCount(followersRes.count || 0);
      setFollowingCount(followingRes.count || 0);

      // Check if current user is following
      if (currentUser && !isOwnProfile) {
        const { data: followCheck } = await supabase
          .from("explorer_follows")
          .select("id")
          .eq("follower_id", currentUser.id)
          .eq("following_id", id)
          .maybeSingle();
        
        setIsFollowing(!!followCheck);
      }
    } catch (error) {
      console.error("Error fetching follow data:", error);
    }
  }, [id, currentUser, isOwnProfile]);

  const loadProfileData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      // Fetch level configs
      const { data: levelData } = await supabase
        .from("gamification_levels")
        .select("level_number, title, icon, color, xp_required")
        .order("level_number", { ascending: true });
      if (levelData) setLevels(levelData as unknown as Level[]);

      // Fetch profile details
      const { data: profileData } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, bio, travel_interests")
        .eq("id", id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      } else {
        toast.error("Explorador no encontrado");
        setLoading(false);
        return;
      }

      // Fetch gamification stats
      const { data: gamificationData } = await supabase
        .from("user_gamification")
        .select("total_xp, current_level, coins, streak_days, total_missions_completed")
        .eq("user_id", id)
        .maybeSingle();
      if (gamificationData) setGamification(gamificationData as unknown as ExplorerGamificationData);

      // Fetch achievements
      const [achRes, userAchRes] = await Promise.all([
        supabase.from("achievements").select("*").eq("is_active", true),
        supabase.from("user_achievements").select("*").eq("user_id", id)
      ]);
      if (achRes.data) setAchievements(achRes.data);
      if (userAchRes.data) setUserAchievements(userAchRes.data);

      // Fetch transactions
      const { data: txData } = await supabase
        .from("gamification_transactions")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (txData) setTransactions(txData as unknown as Transaction[]);

      await fetchFollowData();
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Error al cargar perfil");
    } finally {
      setLoading(false);
    }
  }, [id, fetchFollowData]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast.error("Inicia sesión para seguir a otros exploradores");
      return;
    }
    if (isOwnProfile) return;
    
    setActionLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from("explorer_follows")
          .delete()
          .eq("follower_id", currentUser.id)
          .eq("following_id", id);
        
        if (error) throw error;
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
        toast.success(`Dejaste de seguir a ${profile?.display_name}`);
      } else {
        // Follow
        const { error } = await supabase
          .from("explorer_follows")
          .insert({
            follower_id: currentUser.id,
            following_id: id
          });
        
        if (error) throw error;
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        toast.success(`Ahora sigues a ${profile?.display_name}`);
      }
    } catch (error) {
      console.error("Error updating follow state:", error);
      toast.error("Error al actualizar seguimiento");
    } finally {
      setActionLoading(false);
    }
  };

  const getLevelInfo = (levelNumber: number) => {
    return levels.find(l => l.level_number === levelNumber) || {
      title: "Explorador",
      icon: "🌱",
      color: "#8B5CF6",
      xp_required: 0
    };
  };

  const currentLevel = gamification ? getLevelInfo(gamification.current_level) : null;
  const nextLevel = gamification ? levels.find(l => l.level_number === gamification.current_level + 1) : null;

  const xpProgress = (() => {
    if (!gamification || !currentLevel || !nextLevel) return 0;
    const range = nextLevel.xp_required - currentLevel.xp_required;
    const gained = gamification.total_xp - currentLevel.xp_required;
    return Math.min(100, Math.round((gained / Math.max(1, range)) * 100));
  })();

  const mappedBadges: BadgeItem[] = achievements.map(ach => {
    const earned = userAchievements.some(ua => ua.achievement_id === ach.id);
    return {
      key: ach.id,
      icon: ach.icon || "🏅",
      name: ach.name,
      desc: ach.short_description || ach.description || "",
      xp: ach.xp_reward || 0,
      earned,
      rarity: (ach.rarity || "common") as BadgeRarity,
      isSecret: ach.is_secret || false,
      link: "/badges"
    };
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-muted-foreground text-sm">Cargando perfil del explorador...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile || !gamification) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-20 text-center">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-4">Perfil no encontrado</h1>
          <p className="text-muted-foreground mb-8">El explorador solicitado no existe o su ID es inválido.</p>
          <Button asChild>
            <Link to="/gamificacion"><ArrowLeft className="h-4 w-4 mr-2" /> Volver al Hub</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <PageTransition>
      <SEOHead
        title={`${profile.display_name || "Explorador"} - Perfil de Aventura Descubre RD`}
        description={`Conoce a ${profile.display_name}, viajero nivel ${gamification.current_level} (${currentLevel?.title}). Mira sus insignias, logros e historial en República Dominicana.`}
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Back Link */}
        <div className="container mx-auto px-4 pt-24">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/gamificacion"><ArrowLeft className="h-4 w-4 mr-2" /> Volver al Hub</Link>
          </Button>
        </div>

        {/* Profile Header Block */}
        <section className="bg-gradient-to-br from-primary/10 via-card to-amber-500/5 border-b border-border pb-12 pt-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Profile Avatar */}
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative">
                <div 
                  className="w-28 h-28 rounded-full bg-card flex items-center justify-center text-5xl border-4 shadow-xl"
                  style={{ borderColor: currentLevel?.color || "hsl(var(--primary))" }}
                >
                  {currentLevel?.icon || "🌱"}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground text-xs whitespace-nowrap shadow-md">
                    Nivel {gamification.current_level}
                  </Badge>
                </div>
              </motion.div>

              {/* Profile Details */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 text-center md:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-2 justify-center md:justify-start">
                  <h1 className="text-3xl font-display font-bold text-foreground">
                    {profile.display_name || "Explorador Anónimo"}
                  </h1>
                  {isOwnProfile && (
                    <Badge variant="outline" className="border-primary/30 text-primary">Tú</Badge>
                  )}
                </div>
                
                <p className="text-lg font-medium text-primary mb-3">
                  {currentLevel?.title || "Curioso"}
                </p>

                {profile.bio ? (
                  <p className="text-sm text-muted-foreground mb-4 max-w-lg mx-auto md:mx-0">
                    {profile.bio}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground/60 italic mb-4">
                    Este explorador no ha escrito su biografía aún.
                  </p>
                )}

                {/* Social metrics & follow button */}
                <div className="flex flex-wrap items-center gap-6 justify-center md:justify-start mb-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div>
                      <strong className="text-foreground text-base">{followersCount}</strong> seguidores
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                    <div>
                      <strong className="text-foreground text-base">{followingCount}</strong> seguidos
                    </div>
                  </div>
                  
                  {!isOwnProfile && (
                    <Button 
                      size="sm" 
                      variant={isFollowing ? "outline" : "default"}
                      onClick={handleFollowToggle}
                      disabled={actionLoading}
                      className="gap-2 shadow-sm"
                    >
                      {actionLoading ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : isFollowing ? (
                        <>
                          <UserMinus className="h-4 w-4" /> Siguiendo
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" /> Seguir
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {profile.travel_interests && profile.travel_interests.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                    {profile.travel_interests.slice(0, 6).map(interest => (
                      <Badge key={interest} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Progress Wheel/Bar Card */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.1 }}
                className="w-full md:w-80 shrink-0"
              >
                <div className="bg-card rounded-2xl border border-border p-6 shadow-md">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">XP del Nivel</span>
                    <span className="font-bold text-foreground">{xpProgress}%</span>
                  </div>
                  <Progress value={xpProgress} className="h-3 mb-3" />
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{gamification.total_xp.toLocaleString()} XP</span>
                    {nextLevel ? (
                      <span>Siguiente: {nextLevel.xp_required.toLocaleString()} XP</span>
                    ) : (
                      <span>Nivel máximo alcanzado</span>
                    )}
                  </div>
                  
                  {nextLevel && (
                    <p className="text-xs text-center text-primary mt-3 font-medium">
                      Faltan {nextLevel.xp_required - gamification.total_xp} XP para subir al rango {nextLevel.title}
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Profile Statistics Grid */}
        <section className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Zap, label: "XP Total", value: gamification.total_xp.toLocaleString(), color: "text-amber-500", bg: "bg-amber-500/10" },
              { icon: Crown, label: "Monedas", value: gamification.coins.toLocaleString(), color: "text-primary", bg: "bg-primary/10" },
              { icon: Flame, label: "Racha Activa", value: `${gamification.streak_days} días`, color: "text-orange-500", bg: "bg-orange-500/10" },
              { icon: Target, label: "Misiones completadas", value: gamification.total_missions_completed, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2 }}
                className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm"
              >
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Main Content Tabs */}
        <section className="container mx-auto px-4 pb-20">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-b border-border bg-transparent h-auto p-0 mb-8 overflow-x-auto flex-wrap gap-2">
              <TabsTrigger 
                value="overview" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2"
              >
                <Compass className="h-4 w-4" /> Resumen
              </TabsTrigger>
              <TabsTrigger 
                value="badges" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2"
              >
                <Award className="h-4 w-4" /> Álbum de Insignias
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2"
              >
                <Clock className="h-4 w-4" /> Actividad Reciente
              </TabsTrigger>
            </TabsList>

            {/* TAB: OVERVIEW */}
            <TabsContent value="overview">
              <div className="grid lg:grid-cols-[1fr_360px] gap-8">
                {/* Left Side: Summary & Showcase */}
                <div className="space-y-6">
                  {/* Earned Badges highlight */}
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                        <Medal className="h-5 w-5 text-amber-500" /> Insignias Destacadas
                      </h3>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab("badges")} className="text-primary hover:text-primary/80 gap-1 text-xs">
                        Ver todas <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>

                    {userAchievements.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-border rounded-xl">
                        <Award className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Este explorador no ha obtenido insignias todavía.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {mappedBadges.filter(b => b.earned).slice(0, 4).map(badge => (
                          <div 
                            key={badge.key}
                            className="bg-background border border-border rounded-xl p-4 text-center hover:border-primary/20 transition-all"
                          >
                            <span className="text-4xl block mb-2">{badge.icon}</span>
                            <h4 className="font-bold text-xs text-foreground truncate">{badge.name}</h4>
                            <Badge variant="outline" className="text-[9px] mt-1 bg-primary/5 text-primary border-primary/10">
                              {badge.rarity === "legendary" ? "⭐ Legendaria" : badge.rarity === "epic" ? "🔮 Épica" : badge.rarity === "rare" ? "💎 Rara" : "Común"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Showcase info */}
                <div className="space-y-6">
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-foreground mb-4 flex items-center gap-2 text-sm">
                      <Trophy className="h-4 w-4 text-primary" /> Rango actual
                    </h3>
                    
                    <div className="flex items-center gap-4 bg-background p-4 rounded-xl border border-border">
                      <span className="text-4xl">{currentLevel?.icon}</span>
                      <div>
                        <p className="font-bold text-foreground text-sm leading-tight">{currentLevel?.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Nivel {gamification.current_level}</p>
                      </div>
                    </div>

                    {profile.travel_interests && profile.travel_interests.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-border">
                        <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">Enfoque de Viaje</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.travel_interests.map(interest => (
                            <Badge key={interest} variant="secondary" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB: BADGES ALBUM */}
            <TabsContent value="badges">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <BadgeAlbum 
                  badges={mappedBadges} 
                  title={`Insignias obtenidas por ${profile.display_name || "este explorador"}`}
                  columns={4}
                />
              </div>
            </TabsContent>

            {/* TAB: ACTIVITY HISTORY */}
            <TabsContent value="activity">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm max-w-2xl">
                <h3 className="font-bold text-foreground text-lg mb-6 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" /> Historial de Aventuras
                </h3>

                {transactions.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-border rounded-xl">
                    <Clock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No hay registro de actividad reciente.</p>
                  </div>
                ) : (
                  <div className="relative border-l border-border pl-6 ml-3 space-y-6 py-2">
                    {transactions.map((tx) => {
                      const date = new Date(tx.created_at).toLocaleDateString("es-DO", {
                        day: "numeric", month: "long", year: "numeric"
                      });
                      return (
                        <div key={tx.id} className="relative">
                          {/* Dot indicator */}
                          <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-primary ring-4 ring-card" />
                          
                          <div>
                            <span className="text-[10px] font-semibold text-muted-foreground block mb-0.5">{date}</span>
                            <p className="text-sm font-semibold text-foreground leading-tight">
                              {tx.description || "Acción completada"}
                            </p>
                            <div className="flex gap-2 mt-1.5">
                              {tx.xp_amount && tx.xp_amount > 0 && (
                                <Badge variant="secondary" className="text-[10px] gap-1 px-1.5 py-0 bg-amber-500/10 text-amber-600 border-none">
                                  +{tx.xp_amount} XP
                                </Badge>
                              )}
                              {tx.coin_amount && tx.coin_amount > 0 && (
                                <Badge variant="secondary" className="text-[10px] gap-1 px-1.5 py-0 bg-primary/10 text-primary border-none">
                                  +{tx.coin_amount} monedas
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
