import { useEffect, useState } from "react";
import { Flame, Loader2, Sparkles, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { fetchApi } from "@/lib/fastifyClient";

interface GameProfile {
  xp: number;
  coins: number;
  level: { number: number; title: string; icon: string } | null;
  next_level: { number: number; title: string; xp_required: number } | null;
  progress: { percent: number; xp_into_level: number; xp_for_next: number };
  streak: { days: number; checked_in_today: boolean; multiplier: number };
  league: { name: string; icon: string; xp_this_week: number } | null;
  season: { xp: number; rank: number | null } | null;
}

interface GameMission {
  id: string;
  name: string;
  description: string | null;
  progress: number;
  target_count: number;
  completed: boolean;
  xp_reward: number;
  coin_reward: number;
}

interface RewardShipment {
  id: string;
  prize: string;
  status: string;
  tracking_number: string | null;
  shipped_at: string | null;
  created_at: string;
}

export function GamificationLivePanel() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<GameProfile | null>(null);
  const [missions, setMissions] = useState<GameMission[]>([]);
  const [shipments, setShipments] = useState<RewardShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!session?.access_token) { setProfile(null); setMissions([]); setShipments([]); setLoading(false); return; }
      setLoading(true);
      setError(null);
      const headers = { Authorization: `Bearer ${session.access_token}` };
      try {
        const [profileResult, missionResult, shipmentResult] = await Promise.all([
          fetchApi<{ data: GameProfile }>("/gamification/me", { headers }),
          fetchApi<{ data: GameMission[] }>("/gamification/missions/me", { headers }),
          fetchApi<{ data: RewardShipment[] }>("/gamification/shipments/me", { headers }),
        ]);
        if (active) { setProfile(profileResult.data); setMissions(missionResult.data); setShipments(shipmentResult.data); }
      } catch {
        if (active) setError("No pudimos cargar tu progreso de gamificación. Intenta de nuevo más tarde.");
      } finally { if (active) setLoading(false); }
    };
    void load();
    return () => { active = false; };
  }, [session?.access_token]);

  if (!session?.access_token) return <section className="container mx-auto px-4 py-8"><Card><CardContent className="p-5 text-sm text-muted-foreground">Inicia sesión para consultar tu progreso personal, calculado por el servidor.</CardContent></Card></section>;
  if (loading) return <section className="container mx-auto px-4 py-8"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Cargando progreso oficial…</div></section>;
  if (error || !profile) return <section className="container mx-auto px-4 py-8"><Card><CardContent className="p-5 text-sm text-destructive">{error ?? "No hay datos de progreso disponibles."}</CardContent></Card></section>;

  const suggested = missions.filter(mission => !mission.completed).slice(0, 3);
  return <section className="container mx-auto px-4 py-8 space-y-4" aria-label="Tu progreso de gamificación">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Experiencia</p><p className="mt-1 text-xl font-bold">{profile.xp.toLocaleString("es-DO")} XP</p></CardContent></Card>
      <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Monedas</p><p className="mt-1 text-xl font-bold">{profile.coins.toLocaleString("es-DO")}</p></CardContent></Card>
      <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Nivel actual</p><p className="mt-1 text-xl font-bold">{profile.level?.icon} {profile.level?.title ?? `Nivel ${profile.level?.number ?? 1}`}</p></CardContent></Card>
      <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Racha y liga</p><p className="mt-1 text-xl font-bold"><Flame className="mr-1 inline h-4 w-4 text-orange-500" />{profile.streak.days} días{profile.league ? ` · ${profile.league.name}` : ""}</p></CardContent></Card>
    </div>
    <Card><CardContent className="p-5 grid md:grid-cols-2 gap-6">
      <div className="space-y-2"><div className="flex items-center justify-between text-sm"><span className="font-semibold">{profile.next_level ? `Progreso a ${profile.next_level.title}` : "Nivel máximo alcanzado"}</span><span>{profile.progress.percent}%</span></div><Progress value={profile.progress.percent} /><p className="text-xs text-muted-foreground">{profile.next_level ? `${Math.max(0, profile.next_level.xp_required - profile.xp).toLocaleString("es-DO")} XP para el siguiente nivel` : ""}</p>
        {profile.season && <p className="text-xs text-muted-foreground"><Trophy className="mr-1 inline h-3.5 w-3.5" />Temporada: puesto {profile.season.rank ?? "—"} · {profile.season.xp.toLocaleString("es-DO")} XP</p>}
      </div>
      <div><p className="mb-2 text-sm font-semibold"><Sparkles className="mr-1 inline h-4 w-4 text-primary" />Próximas misiones</p>{suggested.length ? <ul className="space-y-2">{suggested.map(mission => <li key={mission.id} className="rounded-lg bg-muted/40 p-2 text-xs"><span className="font-semibold">{mission.name}</span><span className="ml-2 text-muted-foreground">{mission.progress}/{mission.target_count}</span>{mission.description && <p className="mt-1 text-muted-foreground">{mission.description}</p>}</li>)}</ul> : <p className="text-xs text-muted-foreground">No tienes misiones activas pendientes.</p>}</div>
    </CardContent></Card>
    {shipments.length > 0 && <Card><CardContent className="p-5"><p className="mb-3 text-sm font-semibold"><Trophy className="mr-1 inline h-4 w-4 text-primary" />Seguimiento de premios físicos</p><ul className="space-y-2">{shipments.slice(0, 3).map(shipment => <li key={shipment.id} className="flex flex-wrap justify-between gap-2 rounded-lg bg-muted/40 p-2 text-xs"><span className="font-semibold">{shipment.prize}</span><span className="text-muted-foreground">{shipment.status}{shipment.tracking_number ? ` · ${shipment.tracking_number}` : ""}</span></li>)}</ul></CardContent></Card>}
  </section>;
}
