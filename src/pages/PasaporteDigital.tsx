import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  MapPin,
  Trophy,
  Star,
  Award,
  Gift,
  Camera,
  Mountain,
  Waves,
  Utensils,
  Landmark,
  Lock,
  ChevronRight,
  QrCode,
  Share2,
  TrendingUp,
  Ticket,
  Map,
} from "lucide-react";

const userStats = {
  name: "Explorador Novato",
  memberId: "#82910",
  memberSince: "2023",
  currentXP: 1250,
  nextLevelXP: 2000,
  sitesVisited: 12,
  sitesNew: 2,
  badges: 5,
  badgesNew: 1,
  discounts: 3,
};

const activeMissions = [
  {
    id: 1,
    title: "Expedición Pico Duarte",
    description: "Sube el pico más alto del Caribe. La recompensa incluye un descuento en equipos de montaña.",
    location: "San Juan",
    xp: 500,
    difficulty: "Difícil",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    title: "Ruta Zona Colonial",
    description: "Descubre la historia de la primera ciudad del Nuevo Mundo. Visita 3 museos.",
    location: "Santo Domingo",
    xp: 200,
    difficulty: "Fácil",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&h=300&fit=crop",
  },
];

const badges = [
  { id: 1, name: "Playero", icon: Waves, level: 2, unlocked: true },
  { id: 2, name: "Montañista", icon: Mountain, level: 1, unlocked: true },
  { id: 3, name: "Fotógrafo", icon: Camera, level: 3, unlocked: true },
  { id: 4, name: "Gastronómico", icon: Utensils, level: 0, unlocked: false },
  { id: 5, name: "Historiador", icon: Landmark, level: 0, unlocked: false },
  { id: 6, name: "Buceador", icon: Waves, level: 0, unlocked: false },
];

const leaderboard = [
  { rank: 1, name: "María Santos", xp: 5420, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop" },
  { rank: 2, name: "Jose Díaz", xp: 4890, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop" },
  { rank: 3, name: "Ana R.", xp: 4100, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop" },
];

const rewards = [
  { id: 1, title: "Café Santo Domingo", discount: "20%", expiry: "5 días", type: "discount" },
  { id: 2, title: "Entrada Acuario", discount: "2×1", expiry: "Lun-Vie", type: "2x1" },
];

export default function PasaporteDigital() {
  const xpProgress = (userStats.currentXP / userStats.nextLevelXP) * 100;
  const xpRemaining = userStats.nextLevelXP - userStats.currentXP;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Profile Header */}
        <section className="pt-24 pb-8">
          <div className="container mx-auto px-4">
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
                      alt="User"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Star className="h-4 w-4 text-primary-foreground fill-current" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h1 className="font-display text-3xl font-bold text-foreground mb-1">
                    {userStats.name}
                  </h1>
                  <p className="text-muted-foreground mb-4">
                    Viajero desde {userStats.memberSince} • ID: {userStats.memberId}
                  </p>
                  
                  {/* XP Progress */}
                  <div className="max-w-md">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">{userStats.currentXP} / {userStats.nextLevelXP} XP</span>
                    </div>
                    <Progress value={xpProgress} className="h-2 mb-2" />
                    <p className="text-sm text-primary">
                      Faltan {xpRemaining} XP para el Nivel Aventurero
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button className="gap-2">
                    <QrCode className="h-4 w-4" /> Escanear Visita
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Share2 className="h-4 w-4" /> Compartir Logros
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl border border-border p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-blue-500" />
                  </div>
                  <span className="text-muted-foreground">Sitios Visitados</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{userStats.sitesVisited}</p>
                <p className="text-sm text-primary">+{userStats.sitesNew} esta semana</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-xl border border-border p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                  </div>
                  <span className="text-muted-foreground">Insignias</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{userStats.badges}</p>
                <p className="text-sm text-primary">{userStats.badgesNew} nueva</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-xl border border-border p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Gift className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="text-muted-foreground">Descuentos</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{userStats.discounts}</p>
                <p className="text-sm text-muted-foreground">Listos para usar</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Missions & Badges */}
              <div className="lg:col-span-2 space-y-8">
                {/* Active Missions */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-xl font-bold text-foreground">
                      Misiones Activas
                    </h2>
                    <Button variant="link" className="text-primary">Ver todas</Button>
                  </div>
                  
                  <div className="space-y-4">
                    {activeMissions.map((mission, index) => (
                      <motion.div
                        key={mission.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-card rounded-xl border border-border overflow-hidden flex flex-col md:flex-row"
                      >
                        <div className="relative md:w-48 h-40 md:h-auto">
                          <img
                            src={mission.image}
                            alt={mission.title}
                            className="w-full h-full object-cover"
                          />
                          <Badge
                            className={`absolute top-3 left-3 ${
                              mission.difficulty === "Difícil"
                                ? "bg-orange-500"
                                : "bg-green-500"
                            } text-white`}
                          >
                            ⚡ {mission.difficulty}
                          </Badge>
                        </div>
                        <div className="flex-1 p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-foreground text-lg mb-1">
                                {mission.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-3">
                                {mission.description}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {mission.location}
                              </p>
                            </div>
                            <Badge className="bg-primary/10 text-primary flex-shrink-0">
                              +{mission.xp} XP
                            </Badge>
                          </div>
                          <div className="mt-4">
                            <Button size="sm">
                              {mission.id === 1 ? "Registrar Visita" : "Continuar"}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Badges Collection */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-xl font-bold text-foreground">
                      Colección de Sellos
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      {badges.filter(b => b.unlocked).length} de {badges.length} desbloqueados
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {badges.map((badge) => (
                      <motion.div
                        key={badge.id}
                        whileHover={{ scale: badge.unlocked ? 1.05 : 1 }}
                        className={`bg-card rounded-xl border border-border p-4 text-center ${
                          !badge.unlocked && "opacity-50"
                        }`}
                      >
                        <div
                          className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 ${
                            badge.unlocked
                              ? "bg-primary/10"
                              : "bg-muted"
                          }`}
                        >
                          {badge.unlocked ? (
                            <badge.icon className="h-8 w-8 text-primary" />
                          ) : (
                            <Lock className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <p className="font-medium text-foreground text-sm">{badge.name}</p>
                        {badge.unlocked && (
                          <p className="text-xs text-primary">Nvl {badge.level}</p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Leaderboard & Rewards */}
              <div className="space-y-6">
                {/* Leaderboard */}
                <div className="bg-card rounded-xl border border-border p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <h3 className="font-semibold text-foreground">Top Exploradores</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {leaderboard.map((user) => (
                      <div key={user.rank} className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            user.rank === 1
                              ? "bg-yellow-500 text-white"
                              : user.rank === 2
                              ? "bg-gray-400 text-white"
                              : "bg-orange-600 text-white"
                          }`}
                        >
                          {user.rank}
                        </span>
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.xp.toLocaleString()} XP</p>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t border-border pt-3 mt-3">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          15
                        </span>
                        <img
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop"
                          alt="Tu"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-sm">Tu</p>
                          <p className="text-xs text-muted-foreground">{userStats.currentXP.toLocaleString()} XP</p>
                        </div>
                        <Badge className="bg-green-500/10 text-green-500 text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" /> Subiendo
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rewards Wallet */}
                <div className="bg-card rounded-xl border border-border p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Ticket className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Wallet de Recompensas</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {rewards.map((reward) => (
                      <div
                        key={reward.id}
                        className="flex items-center gap-3 bg-surface rounded-lg p-3"
                      >
                        <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                          {reward.discount}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-sm">{reward.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {reward.type === "discount" ? `Expira en ${reward.expiry}` : `Válido ${reward.expiry}`}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <QrCode className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <Button variant="link" className="w-full mt-3 text-primary">
                    Ver todas las recompensas
                  </Button>
                </div>

                {/* Exploration Map */}
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="aspect-video bg-muted flex items-center justify-center relative">
                    <img
                      src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&h=400&fit=crop"
                      alt="Mapa"
                      className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                    <Button className="absolute bottom-4 left-4 gap-2">
                      <Map className="h-4 w-4" /> Mapa Interactivo
                    </Button>
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-foreground">Mapa de Exploración</p>
                    <p className="text-sm text-muted-foreground">35% del territorio descubierto</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
