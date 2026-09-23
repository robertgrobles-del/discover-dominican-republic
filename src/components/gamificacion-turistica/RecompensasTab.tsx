import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Lock, ChevronRight, Medal, Gift, CheckCircle2 } from "lucide-react";

interface Achievement {
  id: string;
  icon: string | null;
  name: string;
  short_description: string | null;
  xp_reward: number | null;
}

const CULTURAL_CATEGORIES = [
  {
    title: "Patrimonio Histórico",
    icon: "🏛️",
    desc: "Visita sitios declarados patrimonio y deja reseñas",
    actions: [
      { label: "Ver museos y monumentos", href: "/cultura", xp: 25 },
      { label: "Zona Colonial", href: "/destino/zona-colonial", xp: 30 },
      { label: "Fortaleza Ozama", href: "/destinos", xp: 30 },
    ],
  },
  {
    title: "Gastronomía y Tradiciones",
    icon: "🍽️",
    desc: "Descubre la cocina y tradiciones dominicanas",
    actions: [
      { label: "Guía gastronómica", href: "/guia-gastronomica", xp: 20 },
      { label: "Cultura del café", href: "/cultura-cafe", xp: 25 },
      { label: "Cultura del tabaco", href: "/cultura-tabaco", xp: 25 },
    ],
  },
  {
    title: "Arte y Música",
    icon: "🎭",
    desc: "Sumérgete en el merengue, el arte y la cultura viva",
    actions: [
      { label: "Escuela de ritmos", href: "/escuela-ritmos", xp: 20 },
      { label: "Historia de RD", href: "/historia-rd", xp: 20 },
      { label: "Pasaporte digital", href: "/pasaporte-digital", xp: 15 },
    ],
  },
];

const FALLBACK_CULTURE_ACHIEVEMENTS = [
  { icon: "🏺", name: "Guardián del Patrimonio", desc: "Reseña 3 sitios históricos", xp: 175 },
  { icon: "✍️", name: "Cronista Dominicano", desc: "10 comentarios en el feed", xp: 120 },
  { icon: "👨‍🍳", name: "Coleccionista de Sabores", desc: "5 tipos de gastronomía", xp: 150 },
];

interface RecompensasTabProps {
  cultureAchievements: Achievement[];
  isUnlocked: (achievementId: string) => boolean;
}

export function RecompensasTab({ cultureAchievements, isUnlocked }: RecompensasTabProps) {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Recompensas Culturales</h2>
        <p className="text-muted-foreground">Gana recompensas especiales por descubrir la cultura dominicana</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cultural categories */}
        <div className="lg:col-span-2 space-y-6">
          {CULTURAL_CATEGORIES.map(category => (
            <div key={category.title} className="p-6 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{category.icon}</span>
                <div>
                  <h3 className="font-bold text-foreground">{category.title}</h3>
                  <p className="text-sm text-muted-foreground">{category.desc}</p>
                </div>
              </div>
              <div className="space-y-2">
                {category.actions.map(action => (
                  <Link
                    key={action.href}
                    to={action.href}
                    className="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-primary/5 border border-border hover:border-primary/20 transition-all group"
                  >
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                      {action.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Zap className="h-2.5 w-2.5" /> +{action.xp} XP
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar: All cultural achievements */}
        <div className="space-y-4">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Medal className="h-4 w-4 text-amber-500" /> Insignias Culturales
          </h3>
          {cultureAchievements.length === 0
            ? FALLBACK_CULTURE_ACHIEVEMENTS.map(ach => (
                <div key={ach.name} className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl grayscale">{ach.icon}</span>
                    <div>
                      <p className="font-medium text-foreground text-sm">{ach.name}</p>
                      <p className="text-xs text-muted-foreground">{ach.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs gap-1">
                      <Zap className="h-2.5 w-2.5" /> {ach.xp} XP
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <Lock className="h-2.5 w-2.5 mr-1" /> Bloqueado
                    </Badge>
                  </div>
                </div>
              ))
            : cultureAchievements.map(ach => {
                const earned = isUnlocked(ach.id);
                return (
                  <div key={ach.id} className={`p-4 rounded-xl border transition-all ${
                    earned ? "bg-amber-500/5 border-amber-500/20" : "bg-card border-border"
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-2xl ${!earned && "grayscale opacity-60"}`}>{ach.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">{ach.name}</p>
                        <p className="text-xs text-muted-foreground">{ach.short_description}</p>
                      </div>
                      {earned && <CheckCircle2 className="h-5 w-5 text-amber-500 flex-shrink-0" />}
                    </div>
                    {!earned && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Zap className="h-2.5 w-2.5" /> {ach.xp_reward} XP al completar
                      </Badge>
                    )}
                  </div>
                );
              })
          }

          <Button asChild variant="outline" className="w-full gap-2">
            <Link to="/club-recompensas">
              <Gift className="h-4 w-4" /> Ver todas las recompensas
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
