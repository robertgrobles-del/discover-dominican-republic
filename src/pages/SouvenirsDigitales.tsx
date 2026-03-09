import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Lock, Crown, Star, Gift, ChevronRight,
  Gem, Eye, Heart, Share2, Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGamification } from "@/hooks/useGamification";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Collectible {
  id: string;
  name: string;
  description: string | null;
  short_description: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  animated_url: string | null;
  collectible_type: string;
  rarity: string;
  xp_value: number | null;
  coin_value: number | null;
  total_supply: number | null;
  current_supply: number | null;
  is_tradeable: boolean | null;
  unlock_condition: string | null;
  season: string | null;
}

interface UserCollectible {
  id: string;
  collectible_id: string;
  acquired_at: string | null;
  acquisition_method: string | null;
  is_favorite: boolean | null;
}

const rarityConfig: Record<string, { label: string; gradient: string; border: string; text: string }> = {
  common: { label: "Común", gradient: "from-slate-400 to-slate-500", border: "border-slate-400/30", text: "text-slate-400" },
  uncommon: { label: "Poco Común", gradient: "from-emerald-400 to-emerald-600", border: "border-emerald-400/30", text: "text-emerald-400" },
  rare: { label: "Raro", gradient: "from-blue-400 to-blue-600", border: "border-blue-400/30", text: "text-blue-400" },
  epic: { label: "Épico", gradient: "from-purple-400 to-purple-600", border: "border-purple-400/30", text: "text-purple-400" },
  legendary: { label: "Legendario", gradient: "from-amber-400 to-amber-600", border: "border-amber-400/30", text: "text-amber-400" },
};

const typeLabels: Record<string, string> = {
  landmark: "Lugar Emblemático",
  culture: "Cultural",
  nature: "Naturaleza",
  food: "Gastronomía",
  activity: "Actividad",
  event: "Evento",
  special: "Especial",
};

export default function SouvenirsDigitales() {
  const { user } = useAuth();
  const { userGamification } = useGamification();
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [userCollectibles, setUserCollectibles] = useState<UserCollectible[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<Collectible | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: coll } = await supabase
        .from("digital_collectibles")
        .select("*")
        .eq("is_active", true)
        .order("rarity", { ascending: false });
      if (coll) setCollectibles(coll as Collectible[]);

      if (user) {
        const { data: uc } = await supabase
          .from("user_collectibles")
          .select("*")
          .eq("user_id", user.id);
        if (uc) setUserCollectibles(uc as UserCollectible[]);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const isOwned = (collectibleId: string) => userCollectibles.some(uc => uc.collectible_id === collectibleId);
  const ownedCount = userCollectibles.length;
  const totalCount = collectibles.length;

  const filteredCollectibles = collectibles.filter(c => {
    if (activeTab === "owned") return isOwned(c.id);
    if (activeTab === "locked") return !isOwned(c.id);
    return true;
  }).filter(c => rarityFilter === "all" || c.rarity === rarityFilter);

  const toggleFavorite = async (collectibleId: string) => {
    if (!user) return;
    const uc = userCollectibles.find(u => u.collectible_id === collectibleId);
    if (!uc) return;
    const newFav = !uc.is_favorite;
    await supabase.from("user_collectibles").update({ is_favorite: newFav }).eq("id", uc.id);
    setUserCollectibles(prev => prev.map(u => u.id === uc.id ? { ...u, is_favorite: newFav } : u));
    toast.success(newFav ? "Añadido a favoritos ❤️" : "Eliminado de favoritos");
  };

  return (
    <PageTransition>
      <SEOHead
        title="Souvenirs Digitales - Coleccionables RD"
        description="Colecciona souvenirs digitales únicos explorando República Dominicana. Tarjetas, sellos y más."
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-purple-500/10" />
          <div className="absolute top-10 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 gap-2 px-4 py-2">
                <Gem className="h-4 w-4" /> Colección Digital
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
                Souvenirs <span className="text-gradient">Digitales</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Colecciona items digitales únicos explorando República Dominicana. 
                Cada destino, reto y logro puede desbloquear piezas exclusivas.
              </p>
              {user && (
                <div className="flex justify-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{ownedCount}</p>
                    <p className="text-xs text-muted-foreground">Coleccionados</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{totalCount}</p>
                    <p className="text-xs text-muted-foreground">Disponibles</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{totalCount > 0 ? Math.round((ownedCount / totalCount) * 100) : 0}%</p>
                    <p className="text-xs text-muted-foreground">Completado</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Filters & Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <TabsList>
                  <TabsTrigger value="all">Todos ({totalCount})</TabsTrigger>
                  <TabsTrigger value="owned">Míos ({ownedCount})</TabsTrigger>
                  <TabsTrigger value="locked">Por Desbloquear ({totalCount - ownedCount})</TabsTrigger>
                </TabsList>

                <div className="flex gap-2 flex-wrap">
                  {["all", "common", "uncommon", "rare", "epic", "legendary"].map(r => (
                    <Button
                      key={r}
                      variant={rarityFilter === r ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRarityFilter(r)}
                      className="text-xs"
                    >
                      {r === "all" ? "Todas" : rarityConfig[r]?.label || r}
                    </Button>
                  ))}
                </div>
              </div>

              <TabsContent value={activeTab} className="mt-0">
                {loading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />
                    ))}
                  </div>
                ) : filteredCollectibles.length === 0 ? (
                  <div className="text-center py-16">
                    <Gem className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {activeTab === "owned" ? "Aún no tienes coleccionables" : "No hay items en esta categoría"}
                    </h3>
                    <p className="text-muted-foreground mb-4">Explora destinos y completa retos para desbloquear</p>
                    <Button asChild>
                      <Link to="/gamificacion">Explorar Retos</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredCollectibles.map((item, i) => {
                      const owned = isOwned(item.id);
                      const rarity = rarityConfig[item.rarity] || rarityConfig.common;
                      const userCol = userCollectibles.find(uc => uc.collectible_id === item.id);

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className={`group relative rounded-2xl border overflow-hidden transition-all cursor-pointer hover:scale-[1.02] ${
                            owned ? `${rarity.border} bg-card` : "border-border bg-card/50"
                          }`}
                          onClick={() => setSelectedItem(item)}
                        >
                          {/* Image */}
                          <div className="aspect-square relative overflow-hidden">
                            {item.image_url || item.thumbnail_url ? (
                              <img
                                src={item.thumbnail_url || item.image_url || ""}
                                alt={item.name}
                                className={`w-full h-full object-cover transition-all ${
                                  !owned ? "grayscale opacity-40" : "group-hover:scale-105"
                                }`}
                              />
                            ) : (
                              <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${rarity.gradient} ${!owned ? "opacity-30" : ""}`}>
                                <Gem className="h-12 w-12 text-white/50" />
                              </div>
                            )}

                            {!owned && (
                              <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                                <Lock className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}

                            {/* Rarity badge */}
                            <Badge className={`absolute top-2 right-2 text-xs bg-background/80 backdrop-blur-sm ${rarity.text}`}>
                              {rarity.label}
                            </Badge>

                            {/* Supply */}
                            {item.total_supply && (
                              <Badge variant="outline" className="absolute top-2 left-2 text-xs bg-background/80 backdrop-blur-sm">
                                {item.current_supply || 0}/{item.total_supply}
                              </Badge>
                            )}

                            {/* Hover actions */}
                            {owned && (
                              <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="icon"
                                  variant="secondary"
                                  className="h-8 w-8 rounded-full"
                                  onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                                >
                                  <Heart className={`h-3.5 w-3.5 ${userCol?.is_favorite ? "fill-red-500 text-red-500" : ""}`} />
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="p-3">
                            <p className="font-bold text-foreground text-sm truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{item.short_description || typeLabels[item.collectible_type] || item.collectible_type}</p>
                            <div className="flex items-center gap-2 mt-2">
                              {item.xp_value && item.xp_value > 0 && (
                                <Badge variant="secondary" className="text-xs gap-1"><Star className="h-3 w-3" /> {item.xp_value} XP</Badge>
                              )}
                              {item.coin_value && item.coin_value > 0 && (
                                <Badge variant="outline" className="text-xs gap-1"><Crown className="h-3 w-3" /> {item.coin_value}</Badge>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Detail Modal */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setSelectedItem(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-2xl border border-border max-w-md w-full overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {selectedItem.image_url && (
                <img src={selectedItem.image_url} alt={selectedItem.name} className="w-full h-64 object-cover" />
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${rarityConfig[selectedItem.rarity]?.text || ""}`}>
                    {rarityConfig[selectedItem.rarity]?.label || selectedItem.rarity}
                  </Badge>
                  <Badge variant="outline">{typeLabels[selectedItem.collectible_type] || selectedItem.collectible_type}</Badge>
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">{selectedItem.name}</h2>
                <p className="text-sm text-muted-foreground mb-4">{selectedItem.description || selectedItem.short_description}</p>

                {selectedItem.unlock_condition && !isOwned(selectedItem.id) && (
                  <div className="p-3 rounded-lg bg-muted/50 mb-4">
                    <p className="text-xs font-medium text-muted-foreground">Cómo desbloquear:</p>
                    <p className="text-sm text-foreground">{selectedItem.unlock_condition}</p>
                  </div>
                )}

                {selectedItem.season && (
                  <p className="text-xs text-muted-foreground mb-4">Temporada: {selectedItem.season}</p>
                )}

                <div className="flex gap-2">
                  {isOwned(selectedItem.id) ? (
                    <Badge className="bg-emerald-500/10 text-emerald-500 gap-1"><Star className="h-3 w-3" /> En tu colección</Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1"><Lock className="h-3 w-3" /> Bloqueado</Badge>
                  )}
                </div>
              </div>
              <div className="border-t border-border p-4 flex justify-end">
                <Button variant="outline" onClick={() => setSelectedItem(null)}>Cerrar</Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* CTA */}
        <section className="py-16 bg-card border-t border-border">
          <div className="container mx-auto px-4 text-center">
            <Gem className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-4">Desbloquea más coleccionables</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Completa misiones, visita destinos y participa en eventos para expandir tu colección.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild className="gap-2">
                <Link to="/gamificacion"><Sparkles className="h-4 w-4" /> Ver Misiones</Link>
              </Button>
              <Button variant="outline" asChild className="gap-2">
                <Link to="/pasaporte-digital"><Gift className="h-4 w-4" /> Mi Pasaporte</Link>
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
