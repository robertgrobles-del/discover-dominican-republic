import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MapPin, Star, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Recommendation {
  name: string;
  type: "destino" | "experiencia" | "evento";
  slug: string;
  reason: string;
  match_score: number;
}

export function RecommendationsWidget() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      let interests: string[] = [];
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("travel_interests")
          .eq("id", user.id)
          .maybeSingle();
        interests = (profile as any)?.travel_interests || [];
      }

      const { data, error } = await supabase.functions.invoke("ai-recommendations", {
        body: { userId: user?.id, interests, visitedDestinations: [] },
      });

      if (error) throw error;
      setRecommendations(data?.recommendations || []);
      setLoaded(true);
    } catch (e: any) {
      toast.error(e.message || "Error al obtener recomendaciones");
    }
    setLoading(false);
  };

  const typeConfig: Record<string, { color: string; label: string; path: string }> = {
    destino: { color: "bg-emerald-500/20 text-emerald-400", label: "Destino", path: "/destino" },
    experiencia: { color: "bg-amber-500/20 text-amber-400", label: "Experiencia", path: "/experiencia" },
    evento: { color: "bg-blue-500/20 text-blue-400", label: "Evento", path: "/evento" },
  };

  if (!loaded) {
    return (
      <div className="text-center py-8">
        <Sparkles className="h-10 w-10 text-primary mx-auto mb-4" />
        <h3 className="font-display text-xl font-bold mb-2">Recomendaciones con IA</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Descubre destinos, experiencias y eventos personalizados para ti
        </p>
        <Button onClick={fetchRecommendations} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Analizando..." : "Obtener Recomendaciones"}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-bold">Para Ti</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchRecommendations} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {recommendations.map((rec, i) => {
            const config = typeConfig[rec.type] || typeConfig.destino;
            return (
              <motion.div
                key={`${rec.slug}-${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`${config.path}/${rec.slug}`}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${config.color}`}>
                              {config.label}
                            </span>
                            <div className="flex">
                              {[...Array(5)].map((_, j) => (
                                <Star
                                  key={j}
                                  className={`h-3 w-3 ${j < rec.match_score ? "fill-primary text-primary" : "text-muted"}`}
                                />
                              ))}
                            </div>
                          </div>
                          <h4 className="font-medium text-sm">{rec.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{rec.reason}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
