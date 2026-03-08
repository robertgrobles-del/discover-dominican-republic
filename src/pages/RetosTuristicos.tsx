import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Waves, Mountain, Camera, Utensils, Landmark, TreePine,
  MapPin, Clock, Star, Trophy, Flame, ChevronRight,
  Filter, Zap, Target, Lock, CheckCircle2
} from "lucide-react";

type ChallengeCategory = "all" | "exploration" | "cultural" | "gastronomic" | "photographic" | "ecological";
type DifficultyFilter = "all" | "easy" | "medium" | "hard";

const categories = [
  { id: "all" as const, label: "Todos", icon: Target },
  { id: "exploration" as const, label: "Exploración", icon: Mountain },
  { id: "cultural" as const, label: "Cultural", icon: Landmark },
  { id: "gastronomic" as const, label: "Gastronómico", icon: Utensils },
  { id: "photographic" as const, label: "Fotográfico", icon: Camera },
  { id: "ecological" as const, label: "Ecológico", icon: TreePine },
];

const challenges = [
  {
    id: "1", title: "Conquistador de Playas", description: "Visita 5 playas diferentes de República Dominicana y comparte tu experiencia.",
    category: "exploration" as const, difficulty: "easy" as const, xp: 200, coins: 50, progress: 3, target: 5,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop",
    location: "Todo el país", duration: "Sin límite", participants: 342, isActive: true,
  },
  {
    id: "2", title: "Ruta Zona Colonial", description: "Explora los 3 museos principales de la primera ciudad del Nuevo Mundo.",
    category: "cultural" as const, difficulty: "easy" as const, xp: 150, coins: 30, progress: 1, target: 3,
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&h=300&fit=crop",
    location: "Santo Domingo", duration: "1 día", participants: 518, isActive: true,
  },
  {
    id: "3", title: "Sabores Dominicanos", description: "Prueba 5 platos típicos y califica cada experiencia gastronómica.",
    category: "gastronomic" as const, difficulty: "medium" as const, xp: 300, coins: 75, progress: 2, target: 5,
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
    location: "Todo el país", duration: "7 días", participants: 201, isActive: true,
  },
  {
    id: "4", title: "Atardecer Caribeño", description: "Captura la foto perfecta de un atardecer en la costa dominicana.",
    category: "photographic" as const, difficulty: "easy" as const, xp: 100, coins: 25, progress: 0, target: 1,
    image: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=400&h=300&fit=crop",
    location: "Cualquier costa", duration: "Sin límite", participants: 876, isActive: true,
  },
  {
    id: "5", title: "Expedición Pico Duarte", description: "Sube el pico más alto del Caribe y documenta tu aventura.",
    category: "exploration" as const, difficulty: "hard" as const, xp: 500, coins: 150, progress: 0, target: 1,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    location: "La Vega", duration: "2-3 días", participants: 89, isActive: true,
  },
  {
    id: "6", title: "Guardián del Manglar", description: "Participa en una actividad de conservación en un parque nacional.",
    category: "ecological" as const, difficulty: "medium" as const, xp: 350, coins: 100, progress: 0, target: 1,
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
    location: "Los Haitises", duration: "1 día", participants: 124, isActive: true,
  },
  {
    id: "7", title: "Quiz Histórico", description: "Responde correctamente 10 preguntas sobre la historia dominicana.",
    category: "cultural" as const, difficulty: "medium" as const, xp: 250, coins: 60, progress: 0, target: 10,
    image: "https://images.unsplash.com/photo-1461360370896-922624d12a74?w=400&h=300&fit=crop",
    location: "Online", duration: "15 min", participants: 1203, isActive: true,
  },
  {
    id: "8", title: "Fotógrafo de Paisajes", description: "Sube 3 fotos de paisajes naturales y obtén votos de la comunidad.",
    category: "photographic" as const, difficulty: "medium" as const, xp: 200, coins: 50, progress: 1, target: 3,
    image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=300&fit=crop",
    location: "Todo el país", duration: "30 días", participants: 445, isActive: true,
  },
];

const difficultyConfig = {
  easy: { label: "Fácil", color: "bg-green-500", textColor: "text-green-500" },
  medium: { label: "Medio", color: "bg-yellow-500", textColor: "text-yellow-500" },
  hard: { label: "Difícil", color: "bg-red-500", textColor: "text-red-500" },
};

export default function RetosTuristicos() {
  const [activeCategory, setActiveCategory] = useState<ChallengeCategory>("all");
  const [activeDifficulty, setActiveDifficulty] = useState<DifficultyFilter>("all");

  const filtered = challenges.filter((c) => {
    if (activeCategory !== "all" && c.category !== activeCategory) return false;
    if (activeDifficulty !== "all" && c.difficulty !== activeDifficulty) return false;
    return true;
  });

  const activeCount = challenges.filter(c => c.progress > 0).length;

  return (
    <PageTransition>
      <SEOHead title="Retos Turísticos - Descubre RD Jugando" description="Completa retos de exploración, cultura, gastronomía y fotografía mientras descubres República Dominicana." />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="pt-24 pb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
              <Badge className="bg-primary/10 text-primary mb-4 text-sm">
                <Flame className="h-4 w-4 mr-1" /> {activeCount} retos activos
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Retos Turísticos
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Completa misiones, gana puntos y desbloquea recompensas mientras exploras la isla
              </p>
              <div className="flex justify-center gap-6 text-center">
                <div>
                  <p className="text-3xl font-bold text-primary">{challenges.length}</p>
                  <p className="text-sm text-muted-foreground">Retos disponibles</p>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <p className="text-3xl font-bold text-foreground">{challenges.reduce((s, c) => s + c.participants, 0).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Participantes</p>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <p className="text-3xl font-bold text-accent-foreground">{challenges.reduce((s, c) => s + c.xp, 0).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">XP totales</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="sticky top-16 z-30 bg-background/95 backdrop-blur border-b border-border py-3">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat.id)}
                  className="flex-shrink-0 gap-1.5"
                >
                  <cat.icon className="h-4 w-4" /> {cat.label}
                </Button>
              ))}
              <div className="w-px bg-border mx-1 flex-shrink-0" />
              {(["easy", "medium", "hard"] as const).map((d) => (
                <Button
                  key={d}
                  variant={activeDifficulty === d ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveDifficulty(activeDifficulty === d ? "all" : d)}
                  className="flex-shrink-0"
                >
                  <span className={`w-2 h-2 rounded-full ${difficultyConfig[d].color} mr-1.5`} />
                  {difficultyConfig[d].label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Challenges Grid */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <p className="text-sm text-muted-foreground mb-6">{filtered.length} retos encontrados</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filtered.map((challenge, i) => {
                  const progressPct = (challenge.progress / challenge.target) * 100;
                  const diff = difficultyConfig[challenge.difficulty];
                  const catIcon = categories.find(c => c.id === challenge.category)?.icon || Target;
                  const CatIcon = catIcon;

                  return (
                    <motion.div
                      key={challenge.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow group"
                    >
                      <div className="relative aspect-[16/9]">
                        <img src={challenge.image} alt={challenge.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge className={`${diff.color} text-white text-xs`}>
                            ⚡ {diff.label}
                          </Badge>
                          <Badge className="bg-card/90 text-foreground text-xs">
                            <CatIcon className="h-3 w-3 mr-1" />
                            {categories.find(c => c.id === challenge.category)?.label}
                          </Badge>
                        </div>
                        <div className="absolute bottom-3 right-3 flex gap-2">
                          <Badge className="bg-primary text-primary-foreground">+{challenge.xp} XP</Badge>
                          <Badge className="bg-yellow-500 text-white">🪙 {challenge.coins}</Badge>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-lg text-foreground mb-1">{challenge.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{challenge.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {challenge.location}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {challenge.duration}</span>
                          <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {challenge.participants}</span>
                        </div>
                        {challenge.progress > 0 ? (
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Progreso</span>
                              <span className="font-medium text-primary">{challenge.progress}/{challenge.target}</span>
                            </div>
                            <Progress value={progressPct} className="h-2" />
                            <Button size="sm" className="w-full mt-2 gap-1">
                              <Zap className="h-4 w-4" /> Continuar reto
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" className="w-full gap-1">
                            <Target className="h-4 w-4" /> Aceptar reto
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
