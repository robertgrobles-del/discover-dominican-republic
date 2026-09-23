import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Users, Trophy, Target, Award, Sparkles, Plus, Crown, ChevronRight, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getStoredJSON } from "@/lib/safeStorage";

interface Guild {
  id: string;
  name: string;
  tag: string;
  description: string;
  leader: string;
  membersCount: number;
  maxMembers: number;
  totalXp: number;
  level: number;
  badgeEmoji: string;
  activeQuest: {
    title: string;
    progress: number;
    target: number;
    rewardXp: number;
    rewardBadge: string;
  };
}

const INITIAL_GUILDS: Guild[] = [
  {
    id: "guild-1",
    name: "Guardianes de Samaná",
    tag: "SAM",
    description: "Amantes del ecoturismo, ballenas jorobadas y cascadas vírgenes en la península de Samaná.",
    leader: "CarlosM",
    membersCount: 18,
    maxMembers: 25,
    totalXp: 34200,
    level: 5,
    badgeEmoji: "🐋",
    activeQuest: {
      title: "Explorar 15 playas vírgenes en equipo",
      progress: 11,
      target: 15,
      rewardXp: 1500,
      rewardBadge: "Vanguardia Costera",
    },
  },
  {
    id: "guild-2",
    name: "Caminantes del Pico Duarte",
    tag: "PICO",
    description: "Grupo especializado en senderismo de alta montaña y preservación de parques nacionales.",
    leader: "AnaValdez",
    membersCount: 22,
    maxMembers: 30,
    totalXp: 48900,
    level: 7,
    badgeEmoji: "🏔️",
    activeQuest: {
      title: "Registrar 20 cumbres y senderos en la Cordillera",
      progress: 16,
      target: 20,
      rewardXp: 2000,
      rewardBadge: "Conquistador de Alturas",
    },
  },
  {
    id: "guild-3",
    name: "Ruta Gastronómica Criolla",
    tag: "SABOR",
    description: "Exploradores del sabor dominicano: chivo liniero, mofongo, dulces de baní y mariscos del sur.",
    leader: "ChefManuel",
    membersCount: 14,
    maxMembers: 20,
    totalXp: 27500,
    level: 4,
    badgeEmoji: "🍲",
    activeQuest: {
      title: "Reseñar 30 platos autóctonos en 5 regiones",
      progress: 24,
      target: 30,
      rewardXp: 1200,
      rewardBadge: "Paladar Patriota",
    },
  },
];

export function ExplorerGuilds() {
  const [guilds, setGuilds] = useState<Guild[]>(() => {
    return getStoredJSON("explorer_guilds_data", INITIAL_GUILDS);
  });

  const [joinedGuildId, setJoinedGuildId] = useState<string | null>(() => {
    return localStorage.getItem("my_explorer_guild_id") || null;
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [newGuild, setNewGuild] = useState({
    name: "",
    tag: "",
    description: "",
    badgeEmoji: "🌴",
  });

  const handleJoinGuild = (guild: Guild) => {
    if (joinedGuildId === guild.id) {
      // Leave
      setJoinedGuildId(null);
      localStorage.removeItem("my_explorer_guild_id");
      const updated = guilds.map(g => g.id === guild.id ? { ...g, membersCount: g.membersCount - 1 } : g);
      setGuilds(updated);
      localStorage.setItem("explorer_guilds_data", JSON.stringify(updated));
      toast.info(`Has salido del gremio ${guild.name}`);
    } else {
      // Join
      setJoinedGuildId(guild.id);
      localStorage.setItem("my_explorer_guild_id", guild.id);
      const updated = guilds.map(g => g.id === guild.id ? { ...g, membersCount: g.membersCount + 1 } : g);
      setGuilds(updated);
      localStorage.setItem("explorer_guilds_data", JSON.stringify(updated));
      toast.success(`🎉 ¡Bienvenido a ${guild.name}! Ahora colaboras en las metas comunitarias.`);
    }
  };

  const handleCreateGuild = () => {
    if (!newGuild.name.trim() || !newGuild.tag.trim()) {
      toast.error("Por favor completa el nombre y la etiqueta del gremio.");
      return;
    }

    const created: Guild = {
      id: `guild-${Date.now()}`,
      name: newGuild.name.trim(),
      tag: newGuild.tag.trim().toUpperCase(),
      description: newGuild.description.trim() || "Gremio de aventureros por la República Dominicana.",
      leader: "Tú",
      membersCount: 1,
      maxMembers: 20,
      totalXp: 500,
      level: 1,
      badgeEmoji: newGuild.badgeEmoji || "🛡️",
      activeQuest: {
        title: "Completar los primeros 10 retos del gremio",
        progress: 1,
        target: 10,
        rewardXp: 1000,
        rewardBadge: "Pionero Comunitario",
      },
    };

    const updated = [created, ...guilds];
    setGuilds(updated);
    setJoinedGuildId(created.id);
    localStorage.setItem("explorer_guilds_data", JSON.stringify(updated));
    localStorage.setItem("my_explorer_guild_id", created.id);
    setCreateOpen(false);
    setNewGuild({ name: "", tag: "", description: "", badgeEmoji: "🌴" });
    toast.success(`🏆 ¡Gremio "${created.name}" fundado con éxito!`);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-primary/15 via-amber-500/10 to-primary/10 border border-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Badge className="bg-primary text-primary-foreground gap-1.5 px-3 py-1">
            <Users className="h-3.5 w-3.5" /> Gremios & Metas Comunitarias
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">
            Gremios de Exploradores RD
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl">
            Únete a un clan o funda tu propio gremio turístico. Suma puntos de exploración en grupo, completa misiones colectivas y desbloquea insignias comunitarias exclusivas.
          </p>
        </div>

        <Button onClick={() => setCreateOpen(true)} className="gap-2 shadow-md shrink-0">
          <Plus className="h-4 w-4" /> Fundar Gremio
        </Button>
      </div>

      {/* Guilds Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guilds.map((guild) => {
          const isMember = joinedGuildId === guild.id;
          return (
            <motion.div
              key={guild.id}
              whileHover={{ y: -4 }}
              className={`rounded-2xl border bg-card p-6 transition-all flex flex-col justify-between ${
                isMember ? "ring-2 ring-primary border-primary shadow-lg" : "border-border hover:border-primary/40"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl shadow-sm">
                      {guild.badgeEmoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-foreground text-base">{guild.name}</h3>
                        <Badge variant="secondary" className="font-mono text-[10px]">
                          [{guild.tag}]
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Líder: <strong className="text-foreground">{guild.leader}</strong></p>
                    </div>
                  </div>

                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-300 text-xs">
                    Nivel {guild.level}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                  {guild.description}
                </p>

                {/* Community Quest */}
                <div className="p-3.5 bg-secondary/30 rounded-xl border border-border/50 mb-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5 text-primary" /> Misión Colectiva
                    </span>
                    <span className="text-primary font-bold">+{guild.activeQuest.rewardXp} XP</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{guild.activeQuest.title}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Progreso del Gremio</span>
                      <span>{guild.activeQuest.progress} / {guild.activeQuest.target}</span>
                    </div>
                    <Progress value={(guild.activeQuest.progress / guild.activeQuest.target) * 100} className="h-1.5" />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                <div className="text-xs text-muted-foreground">
                  <span className="font-bold text-foreground">{guild.membersCount}</span>/{guild.maxMembers} miembros
                </div>

                <Button
                  size="sm"
                  variant={isMember ? "outline" : "default"}
                  onClick={() => handleJoinGuild(guild)}
                  className={`text-xs gap-1.5 ${isMember ? "border-emerald-500 text-emerald-600 hover:bg-emerald-50" : ""}`}
                >
                  {isMember ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Miembro Activo
                    </>
                  ) : (
                    <>
                      <Users className="h-3.5 w-3.5" /> Unirse al Clan
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Create Guild Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Fundar Nuevo Gremio
            </DialogTitle>
            <DialogDescription>
              Crea tu hermandad turística e invita a otros viajeros a colaborar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="g-name" className="text-xs">Nombre del Gremio</Label>
              <Input
                id="g-name"
                placeholder="Ej: Exploradores del Caribe"
                value={newGuild.name}
                onChange={(e) => setNewGuild(prev => ({ ...prev, name: e.target.value }))}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="g-tag" className="text-xs">Tag / Siglas (Max 5 letras)</Label>
                <Input
                  id="g-tag"
                  maxLength={5}
                  placeholder="EXPLO"
                  value={newGuild.tag}
                  onChange={(e) => setNewGuild(prev => ({ ...prev, tag: e.target.value.toUpperCase() }))}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="g-emoji" className="text-xs">Emblema (Emoji)</Label>
                <Input
                  id="g-emoji"
                  maxLength={2}
                  placeholder="🌴"
                  value={newGuild.badgeEmoji}
                  onChange={(e) => setNewGuild(prev => ({ ...prev, badgeEmoji: e.target.value }))}
                  className="text-xs text-center"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="g-desc" className="text-xs">Descripción y Enfoque</Label>
              <Input
                id="g-desc"
                placeholder="Rutas ecoturísticas, playas, historia..."
                value={newGuild.description}
                onChange={(e) => setNewGuild(prev => ({ ...prev, description: e.target.value }))}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleCreateGuild}>
              Fundar y Unirse
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
