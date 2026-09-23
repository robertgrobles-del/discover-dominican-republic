import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, MapPin, Star, Loader2, RefreshCw, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface Recommendation {
  id: string;
  type: "destino" | "experiencia" | "evento";
  title: string;
  reason: string;
  score: number;
  matchPercentage: number;
  meta: Record<string, unknown>;
}

export function RecommendationsWidget() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem("traveler_profile");
      const profile = stored ? JSON.parse(stored) : { style: "aventurero", region: "cualquiera" };

      // Mock client-side smart recommendations based on profile
      const mockRecs: Recommendation[] = [
        {
          id: "1",
          type: "destino",
          title: "Bahía de las Águilas",
          reason: "Basado en tu interés por naturaleza virgen y playas",
          score: 0.95,
          matchPercentage: 95,
          meta: { destination_id: "bahia-de-las-aguilas", image: "" },
        },
        {
          id: "2",
          type: "experiencia",
          title: "Rafting en Río Yaque del Norte",
          reason: "Para amantes de la aventura y ecoturismo",
          score: 0.88,
          matchPercentage: 88,
          meta: { experience_id: "rafting-jarabacoa" },
        },
        {
          id: "3",
          type: "destino",
          title: "Cayo Levantado, Samaná",
          reason: "Perfecto para relajación y escapadas paradisíacas",
          score: 0.82,
          matchPercentage: 82,
          meta: { destination_id: "samana" },
        },
      ];

      setRecommendations(mockRecs);
      setLoaded(true);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const typeConfig: Record<string, { color: string; label: string; path: string }> = {
    destino: { color: "bg-emerald-500/20 text-emerald-400", label: "Destino", path: "/destino" },
    experiencia: { color: "bg-amber-500/20 text-amber-400", label: "Experiencia", path: "/experiencia" },
    evento: { color: "bg-blue-500/20 text-blue-400", label: "Evento", path: "/evento" },
  };

  if (!loaded) {
    return (
      <div className="text-center py-8">
        <Compass className="h-10 w-10 text-primary mx-auto mb-4" />
        <h3 className="font-display text-xl font-bold mb-2">Recomendaciones Inteligentes</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Descubre destinos, experiencias y eventos personalizados para ti
        </p>
        <Button onClick={fetchRecommendations} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Compass className="h-4 w-4" />}
          {loading ? "Analizando..." : "Obtener Recomendaciones"}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-primary" />
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
            const slug = (rec.meta.destination_id || rec.meta.experience_id || rec.meta.event_id || "") as string;
            const starCount = Math.round(rec.matchPercentage / 20);
            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`${config.path}/${slug}`}>
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
                                  className={`h-3 w-3 ${j < starCount ? "fill-primary text-primary" : "text-muted"}`}
                                />
                              ))}
                            </div>
                          </div>
                          <h4 className="font-medium text-sm">{rec.title}</h4>
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
