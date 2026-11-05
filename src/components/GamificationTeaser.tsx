import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, CheckCircle2, Compass, Fish, Flame, Landmark, Mountain, ShieldCheck, Stamp, Target, Trophy, Umbrella, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { fetchApi } from "@/lib/fastifyClient";
import { usePageContent } from "@/lib/pageContent";
import { MissionQrDialog } from "@/components/gamification/MissionQrDialog";

interface Mission { id: string; name: string; description: string; target_count: number; xp_reward: number; coin_reward: number; mission_type: string; is_featured: boolean; progress: number; completed: boolean; target_url?: string | null; target_label?: string | null; is_sponsored?: boolean; sponsor_name?: string | null; sponsor_reward_text?: string | null; requires_validation?: boolean }

/** Sellos de muestra del pasaporte: lo que se puede coleccionar, no un progreso. */
const STAMPS = [
  { icon: Landmark, name: "Zona Colonial", xp: 50 },
  { icon: Umbrella, name: "Costas del Este", xp: 75 },
  { icon: Mountain, name: "Pico Duarte", xp: 150 },
  { icon: Fish, name: "Bahía de Samaná", xp: 100 },
];

/**
 * Bloque de gamificación de la portada.
 *  - Sin sesión: invitación a crear el pasaporte.
 *  - Con sesión: el reto del día (la misión diaria pendiente del backend); si ya está hecho o no hay, nada.
 */
export function GamificationTeaser() {
  const { user } = useAuth();
  return user ? <DailyChallenge /> : <PassportInvite />;
}

function DailyChallenge() {
  const pc = usePageContent("gamification-teaser");
  const [qrOpen, setQrOpen] = useState(false);
  const { data: missions = [] } = useQuery({
    queryKey: ["home-daily-challenge"],
    queryFn: async () => (await fetchApi<{ data: Mission[] }>("/gamification/missions")).data,
    staleTime: 5 * 60_000,
    retry: false,
  });
  const daily = missions.filter((m) => m.mission_type === "daily");
  const mission = daily.find((m) => !m.completed && m.is_featured) ?? daily.find((m) => !m.completed);
  const done = daily.length > 0 && !mission;
  if (!mission && !done) return null;
  const pct = mission ? Math.min(100, Math.round((mission.progress / Math.max(1, mission.target_count)) * 100)) : 100;

  return (
    <section className="border-y border-border/50 bg-gradient-to-b from-background via-card/40 to-background py-10">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-6 rounded-3xl border border-primary/25 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-lg shadow-primary/5 sm:p-8 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
              {done ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : <Target className="h-6 w-6" />}
            </div>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary"><Flame className="h-3.5 w-3.5 text-orange-500" />{pc.tx("p.reto", "Reto del día")}</p>
              <h2 className="mt-1 font-display text-xl font-bold text-foreground sm:text-2xl">{mission ? mission.name : pc.t("h2.reto-hecho", "¡Reto de hoy completado!")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{mission ? mission.description : pc.t("p.reto-hecho", "Vuelve mañana por uno nuevo, o sigue sumando con las misiones de la semana.")}</p>
              {mission && (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Badge variant="secondary" className="gap-1"><Zap className="h-3 w-3 text-emerald-500" />+{mission.xp_reward} XP</Badge>
                  {mission.coin_reward > 0 && <Badge variant="secondary">+{mission.coin_reward} monedas</Badge>}
                  {mission.is_sponsored && mission.sponsor_name && <Badge variant="outline" title={mission.sponsor_reward_text ?? undefined}>Patrocinado por {mission.sponsor_name}</Badge>}
                  <div className="flex min-w-[10rem] flex-1 items-center gap-2 sm:max-w-xs">
                    <Progress value={pct} className="h-2" />
                    <span className="shrink-0 text-xs font-semibold text-muted-foreground">{mission.progress}/{mission.target_count}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            {mission?.requires_validation ? (
              <Button className="rounded-xl font-bold" onClick={() => setQrOpen(true)}>{pc.t("Button.qr", "Mostrar mi QR")} <ArrowRight className="ml-1 h-4 w-4" /></Button>
            ) : (
            <Button asChild className="rounded-xl font-bold">
              {mission?.target_url?.startsWith("https://")
                ? <a href={mission.target_url} target="_blank" rel="noopener noreferrer">{mission.target_label || pc.t("Link.reto", "Ir al reto")} <ArrowRight className="ml-1 h-4 w-4" /></a>
                : <Link to={mission?.target_url || "/gamificacion-turistica/retos"}>{mission ? mission.target_label || pc.t("Link.reto", "Ir al reto") : pc.t("Link.retos", "Ver más retos")} <ArrowRight className="ml-1 h-4 w-4" /></Link>}
            </Button>
            )}
            <Button asChild variant="outline" className="rounded-xl"><Link to="/gamificacion-turistica">{pc.tx("Link.pasaporte", "Mi pasaporte")}</Link></Button>
          </div>
        </div>
      </div>
      {mission?.requires_validation && <MissionQrDialog missionId={mission.id} missionName={mission.name} sponsorName={mission.sponsor_name} open={qrOpen} onOpenChange={setQrOpen} />}
    </section>
  );
}

function PassportInvite() {
  const pc = usePageContent("gamification-teaser");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="relative py-14 md:py-16 overflow-hidden bg-gradient-to-b from-background via-card/40 to-background border-y border-border/50">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="rounded-3xl bg-gradient-to-br from-card via-card to-primary/5 border border-primary/25 p-6 sm:p-8 md:p-10 shadow-lg shadow-primary/5"
        >
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-primary/15 text-primary border-primary/30 text-xs px-3 py-1 font-semibold">
                  <Compass className="h-3.5 w-3.5 mr-1.5" />{" "}{pc.tx("Badge.1", "Pasaporte Digital")}</Badge>
                <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs px-3 py-1 font-semibold">
                  <Trophy className="h-3.5 w-3.5 mr-1.5 text-amber-500" />{" "}{pc.tx("Badge.2", "32 Provincias")}</Badge>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight leading-tight">{pc.tx("h2.1", "Conquista las 32 provincias y")}{" "}
                <span className="text-primary">{pc.tx("span.1", "acredita tus viajes")}</span>
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">{pc.tx("p.1", "Crea tu cuenta gratuita para desbloquear tu Pasaporte Digital Dominicano. Registra cada destino visitado, colecciona insignias turísticas y canjea tus puntos XP por beneficios con hoteles y restaurantes aliados.")}</p>

              <div className="grid sm:grid-cols-2 gap-2.5 pt-1 text-xs font-medium text-foreground">
                {[pc.t("span.2", "Sellos de las 32 provincias"), pc.t("span.3", "Insignias de cultura y ecoturismo"), pc.t("span.4", "Ranking nacional de exploradores"), pc.t("span.5", "Canje de descuentos y experiencias")].filter(Boolean).map((perk) => (
                  <div key={perk} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /><span>{perk}</span></div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-3">
                <Button asChild className="btn-cta-magnetic bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl h-11 px-6 text-xs sm:text-sm shadow-md shadow-primary/20">
                  <Link to="/registro" className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />{" "}{pc.tx("Link.1", "Crear mi pasaporte gratis")}</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-2xl h-11 px-5 text-xs sm:text-sm border-border bg-card hover:bg-muted font-semibold">
                  <Link to="/gamificacion-turistica" className="flex items-center gap-1.5">{pc.tx("Link.2", "Ver misiones y recompensas")}{" "}<ArrowRight className="h-4 w-4 text-primary" /></Link>
                </Button>
              </div>
            </div>

            {/* Vista del pasaporte: una página con los sellos que se pueden coleccionar */}
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-background to-background p-6 shadow-sm">
                <Stamp className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rotate-12 text-primary/[0.07]" aria-hidden="true" />
                <p className="text-3xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{pc.tx("p.2", "República Dominicana")}</p>
                <h3 className="mt-1 font-display text-xl font-bold text-foreground">{pc.tx("h4.1", "Pasaporte de Explorador")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{pc.tx("p.3", "Un sello por cada lugar que visites. Estos son algunos de los primeros:")}</p>

                <ul className="mt-5 grid grid-cols-2 gap-3">
                  {STAMPS.map((s) => (
                    <li key={s.name} className="flex items-center gap-3 rounded-2xl border border-dashed border-primary/30 bg-card/60 p-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary"><s.icon className="h-5 w-5" aria-hidden="true" /></span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold leading-tight text-foreground">{s.name}</span>
                        <span className="block text-xs font-bold text-emerald-600 dark:text-emerald-400">+{s.xp} XP</span>
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="mt-5 border-t border-border/60 pt-4 text-center text-sm text-muted-foreground">
                  {pc.tx("span.8", "¿Ya tienes cuenta?")}{" "}
                  <Link to="/login" className="font-bold text-primary hover:underline underline-offset-4">{pc.tx("Link.3", "Inicia sesión")}</Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
