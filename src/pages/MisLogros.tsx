import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Trophy, Award, Star, Lock, Share2, Edit, 
  MapPin, Utensils, Camera, Compass, Waves,
  Mountain, Music, Heart
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import { Progress } from "@/components/ui/progress";

interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  xp: number;
  date?: string;
  unlocked: boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
  category: string;
}

const userProfile = {
  name: "Alex",
  level: 4,
  levelName: "Caminante del Sol",
  xp: 1250,
  xpToNext: 2000,
  totalBadges: 24,
  totalMissions: 12,
  memberSince: "2021",
  bio: "Explorando los rincones ocultos de la República Dominicana desde 2021. Tu pasión por la cultura local es legendaria.",
};

const badges: BadgeItem[] = [
  {
    id: "colonial-explorer",
    name: "Explorador Colonial",
    description: "Has visitado 5 museos clave en la Zona Colonial de Santo Domingo.",
    icon: Camera,
    xp: 150,
    date: "12 Oct 2023",
    unlocked: true,
    rarity: "rare",
    category: "Historia",
  },
  {
    id: "flavor-hunter",
    name: "Cazador de Sabores",
    description: "Probaste los platos típicos en 10 restaurantes autóctonos.",
    icon: Utensils,
    xp: 100,
    date: "5 Sept 2023",
    unlocked: true,
    rarity: "common",
    category: "Gastronomía",
  },
  {
    id: "whale-whisperer",
    name: "Susurrador de Ballenas",
    description: "Avistaste ballenas jorobadas en la Bahía de Samaná.",
    icon: Waves,
    xp: 200,
    date: "15 Feb 2024",
    unlocked: true,
    rarity: "epic",
    category: "Naturaleza",
  },
  {
    id: "mountain-conqueror",
    name: "Conquistador del Pico",
    description: "Escalaste el Pico Duarte, el más alto del Caribe.",
    icon: Mountain,
    xp: 300,
    unlocked: false,
    rarity: "legendary",
    category: "Aventura",
  },
  {
    id: "merengue-master",
    name: "Maestro del Merengue",
    description: "Bailaste merengue en un colmado tradicional.",
    icon: Music,
    xp: 75,
    date: "20 Dic 2023",
    unlocked: true,
    rarity: "common",
    category: "Cultura",
  },
  {
    id: "beach-hopper",
    name: "Saltador de Playas",
    description: "Visitaste 10 playas diferentes en República Dominicana.",
    icon: Compass,
    xp: 120,
    unlocked: false,
    rarity: "rare",
    category: "Playas",
  },
  {
    id: "local-lover",
    name: "Amante Local",
    description: "Hiciste amigos locales y compartiste experiencias.",
    icon: Heart,
    xp: 80,
    date: "1 Ene 2024",
    unlocked: true,
    rarity: "common",
    category: "Comunidad",
  },
  {
    id: "photo-master",
    name: "Maestro Fotógrafo",
    description: "Compartiste 50 fotos de tus viajes por RD.",
    icon: Camera,
    xp: 100,
    unlocked: false,
    rarity: "rare",
    category: "Comunidad",
  },
];

const categories = ["Todos", "Historia", "Gastronomía", "Naturaleza", "Aventura", "Cultura", "Playas", "Comunidad"];
const filterOptions = ["Todos", "Desbloqueados", "Por Descubrir"];

const rarityColors = {
  common: "from-slate-400 to-slate-500",
  rare: "from-blue-400 to-primary",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-amber-400 to-yellow-600",
};

const rarityLabels = {
  common: "Común",
  rare: "Raro",
  epic: "Épico",
  legendary: "Legendario",
};

export default function MisLogros() {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [activeCategory, setActiveCategory] = useState("Todos");

  const filteredBadges = badges.filter((badge) => {
    const matchesFilter =
      activeFilter === "Todos" ||
      (activeFilter === "Desbloqueados" && badge.unlocked) ||
      (activeFilter === "Por Descubrir" && !badge.unlocked);
    const matchesCategory = activeCategory === "Todos" || badge.category === activeCategory;
    return matchesFilter && matchesCategory;
  });

  const progressPercent = (userProfile.xp / userProfile.xpToNext) * 100;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Main Content */}
        <main className="container mx-auto px-4 lg:px-8 py-8">
          {/* Dashboard Header */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 bg-card rounded-xl p-6 border border-border flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-amber-500 to-amber-700">
                  <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                    <Trophy className="h-12 w-12 text-amber-500" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-card rounded-full p-1.5 border border-border shadow-md">
                  <div className="bg-primary size-8 rounded-full flex items-center justify-center">
                    <Award className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col text-center sm:text-left z-10">
                <h1 className="text-3xl font-display font-bold text-foreground mb-1">
                  Hola, {userProfile.name}
                </h1>
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <p className="text-primary font-bold text-lg">
                    Nivel {userProfile.level}: {userProfile.levelName}
                  </p>
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                </div>
                <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
                  {userProfile.bio}
                </p>
                <div className="mt-4 flex gap-3 justify-center sm:justify-start">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit className="h-4 w-4" /> Editar Perfil
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="h-4 w-4" /> Compartir Logros
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Stats & Progress Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-xl p-6 border border-border flex flex-col justify-center relative overflow-hidden"
            >
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
              <div className="flex justify-between items-end mb-2">
                <span className="text-muted-foreground text-sm font-medium">Siguiente: Explorador Experto</span>
                <span className="text-foreground font-bold text-xl">
                  {userProfile.xp} <span className="text-muted-foreground text-sm font-normal">/ {userProfile.xpToNext} XP</span>
                </span>
              </div>
              <Progress value={progressPercent} className="h-3 mb-4" />
              <p className="text-muted-foreground text-xs mb-6">
                ¡Estás a solo {userProfile.xpToNext - userProfile.xp} XP de tu próxima insignia de nivel! Completa 2 misiones más.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-foreground">{userProfile.totalBadges}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Badges</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-foreground">{userProfile.totalMissions}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Misiones</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Collection Section */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
                <Trophy className="h-6 w-6 text-amber-500" />
                Tu Colección de Tesoros
              </h2>

              {/* Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                {filterOptions.map((filter) => (
                  <Button
                    key={filter}
                    variant={activeFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(filter)}
                    className="gap-2 whitespace-nowrap"
                  >
                    {filter === "Desbloqueados" && <Star className="h-4 w-4" />}
                    {filter === "Por Descubrir" && <Lock className="h-4 w-4" />}
                    {filter}
                  </Button>
                ))}
              </div>
            </div>

            {/* Category Tags */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBadges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className={`group relative bg-card rounded-xl border ${
                    badge.unlocked
                      ? "border-border hover:border-primary/50"
                      : "border-border opacity-60"
                  } transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer overflow-hidden`}
                >
                  {badge.unlocked && (
                    <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${rarityColors[badge.rarity]}`} />
                  )}
                  {badge.rarity !== "common" && badge.unlocked && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase tracking-wide ${
                          badge.rarity === "rare"
                            ? "border-blue-500/50 text-blue-500"
                            : badge.rarity === "epic"
                            ? "border-purple-500/50 text-purple-500"
                            : "border-amber-500/50 text-amber-500"
                        }`}
                      >
                        {rarityLabels[badge.rarity]}
                      </Badge>
                    </div>
                  )}
                  <div className="p-6 flex flex-col items-center text-center">
                    {/* Badge Visual */}
                    <div
                      className={`size-24 rounded-full ${
                        badge.unlocked
                          ? `bg-gradient-to-b ${rarityColors[badge.rarity]}`
                          : "bg-muted"
                      } flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500 border-4 border-border relative`}
                    >
                      {badge.unlocked ? (
                        <badge.icon className="h-10 w-10 text-white drop-shadow-md" />
                      ) : (
                        <Lock className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <h3
                      className={`font-bold text-lg mb-2 ${
                        badge.unlocked ? "text-foreground group-hover:text-primary" : "text-muted-foreground"
                      } transition-colors`}
                    >
                      {badge.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                      {badge.description}
                    </p>
                    <div className="w-full mt-auto pt-4 border-t border-border flex justify-between items-center">
                      <span className="text-primary text-xs font-bold">+{badge.xp} XP</span>
                      {badge.unlocked && badge.date ? (
                        <span className="text-muted-foreground text-xs">{badge.date}</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">Sin desbloquear</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredBadges.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay insignias que coincidan con tus filtros.</p>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
