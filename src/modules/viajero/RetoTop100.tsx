import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ExternalLink, Heart, Share2, ShoppingBag, Trophy } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useGamification } from "@/hooks/useGamification";
import { getStoredJSON } from "@/lib/safeStorage";
import { MILESTONES, TOP_100, toggleSpot, useSpots, type SpotKind } from "./retoData";

type Filter = "all" | "visited" | "todo" | "wish";
const KIND_LABEL: Record<SpotKind, string> = { destino: "Destino", playa: "Playa", montaña: "Montaña", río: "Río" };

export default function Top100() {
  const { user } = useAuth();
  const { awardXp } = useGamification();
  const qc = useQueryClient();
  const { data: visited = [] } = useSpots("traveler_spots", user?.id);
  const { data: wishes = [] } = useSpots("traveler_wishlist", user?.id);
  const [filter, setFilter] = useState<Filter>("all");
  const [kind, setKind] = useState<SpotKind | "all">("all");

  const visitedSet = useMemo(() => new Set(visited.map((v) => v.spot_id)), [visited]);
  const wishSet = useMemo(() => new Set(wishes.map((v) => v.spot_id)), [wishes]);
  const count = TOP_100.filter((s) => visitedSet.has(s.id)).length;
  const total = TOP_100.length;
  const next = MILESTONES.find((m) => count < m.at);

  // Hitos: dan XP una sola vez por usuario.
  useEffect(() => {
    if (!user) return;
    const key = `top100:milestones:${user.id}`;
    const done = getStoredJSON<number[]>(key, []);
    const fresh = MILESTONES.filter((m) => count >= m.at && !done.includes(m.at));
    if (fresh.length === 0) return;
    fresh.forEach((m) => {
      awardXp(m.xp, 0, `Top 100: ${m.label} (${m.at} destinos)`, "top100", String(m.at));
      toast.success(`¡Hito alcanzado: ${m.label}! +${m.xp} XP`);
    });
    try { localStorage.setItem(key, JSON.stringify([...done, ...fresh.map((m) => m.at)])); } catch { /* sin storage */ }
  }, [count, user]);

  const toggle = async (table: "traveler_spots" | "traveler_wishlist", id: string, on: boolean) => {
    if (!user) return toast.error("Inicia sesión para guardar tu progreso.");
    try {
      await toggleSpot(table, user.id, id, on);
      qc.invalidateQueries({ queryKey: ["viajero", table] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const list = TOP_100.filter((s) => {
    if (kind !== "all" && s.kind !== kind) return false;
    if (filter === "visited") return visitedSet.has(s.id);
    if (filter === "todo") return !visitedSet.has(s.id);
    if (filter === "wish") return wishSet.has(s.id);
    return true;
  });

  const share = async () => {
    const text = `Ya visité ${count} de los ${total} destinos del reto Top 100 de Descubre RD. ¿Y tú?`;
    const url = window.location.href;
    try { if (navigator.share) await navigator.share({ title: "Top 100 destinos", text, url }); else { await navigator.clipboard.writeText(`${text} ${url}`); toast.success("Texto copiado"); } } catch { /* cancelado */ }
  };

  return (
    <PageTransition>
      <SEOHead title="Reto Top 100 destinos de República Dominicana" description="Marca los destinos que ya conoces, guarda tus deseados y gana XP por cada hito. Playas, montañas, ríos y ciudades de República Dominicana." />
      <Header variant="white" />
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 lg:grid-cols-[1fr_20rem] mb-8">
            <div>
              <Badge className="mb-3 gap-1"><Trophy className="h-3 w-3" /> Reto Descubre RD</Badge>
              <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">Top 100 destinos</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">Tu misión: recorrer Dominicana y tachar cada destino conquistado. Guarda tu progreso, arma tu lista de deseados y gana XP en cada hito.</p>
              <div className="mt-5 max-w-xl">
                <div className="flex justify-between text-sm mb-1"><span className="font-semibold">{count} de {total} visitados</span><span className="text-muted-foreground">{next ? `Próximo hito: ${next.label} (${next.at})` : "¡Reto completado!"}</span></div>
                <Progress value={(count / total) * 100} className="h-3" />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={share}><Share2 className="h-4 w-4" /> Compartir progreso</Button>
                <Button variant="outline" size="sm" className="gap-2" asChild><Link to="/mi-viaje">Planear un viaje</Link></Button>
                <Button variant="outline" size="sm" className="gap-2" asChild><Link to="/pasaporte-digital">Mi pasaporte</Link></Button>
              </div>
            </div>
            <Card className="p-5 flex flex-col gap-3 justify-center bg-secondary/40">
              <p className="font-display font-bold flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-primary" /> Póster rayable</p>
              <p className="text-sm text-muted-foreground">Llévate el reto a la pared: rasca cada destino al visitarlo.</p>
              <Button asChild><Link to="/tienda/poster-rayable-top-100-destinos">Ver en la tienda</Link></Button>
            </Card>
          </div>

          {!user && <p className="mb-4 rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-sm">Inicia sesión para guardar tu progreso. <Link to="/login" className="underline font-medium">Iniciar sesión</Link></p>}

          <div className="flex flex-wrap gap-2 mb-6">
            {([["all", "Todos"], ["visited", "Visitados"], ["todo", "Por visitar"], ["wish", "Deseados"]] as const).map(([k, l]) => (
              <Button key={k} size="sm" variant={filter === k ? "default" : "outline"} className="rounded-full" onClick={() => setFilter(k)}>{l}</Button>
            ))}
            <span className="w-px bg-border mx-1" />
            {(["all", "destino", "playa", "montaña", "río"] as const).map((k) => (
              <Button key={k} size="sm" variant={kind === k ? "secondary" : "ghost"} className="rounded-full" onClick={() => setKind(k)}>{k === "all" ? "Todas las categorías" : KIND_LABEL[k]}</Button>
            ))}
          </div>

          {list.length === 0 ? <p className="py-12 text-center text-muted-foreground">Nada por aquí todavía.</p> : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {list.map((s) => {
                const seen = visitedSet.has(s.id);
                const wish = wishSet.has(s.id);
                return (
                  <Card key={s.id} className={`overflow-hidden flex flex-col ${seen ? "ring-2 ring-emerald-500/60" : ""}`}>
                    <div className="aspect-[4/3] bg-muted relative">
                      {s.image && <img src={s.image} alt={s.name} loading="lazy" className={`w-full h-full object-cover ${seen ? "" : "grayscale-[35%]"}`} />}
                      <Badge variant="secondary" className="absolute top-2 left-2">{KIND_LABEL[s.kind]}</Badge>
                      <button type="button" aria-label={wish ? `Quitar ${s.name} de deseados` : `Guardar ${s.name} en deseados`} aria-pressed={wish} onClick={() => toggle("traveler_wishlist", s.id, !wish)} className="absolute top-2 right-2 rounded-full bg-background/90 p-1.5">
                        <Heart className={`h-4 w-4 ${wish ? "fill-rose-500 text-rose-500" : ""}`} />
                      </button>
                    </div>
                    <div className="p-3 flex flex-col gap-2 flex-1">
                      <div><p className="font-semibold leading-snug">{s.name}</p><p className="text-xs text-muted-foreground">{s.province}</p></div>
                      <div className="mt-auto flex gap-2">
                        <Button size="sm" className="flex-1 gap-1" variant={seen ? "default" : "outline"} aria-pressed={seen} onClick={() => toggle("traveler_spots", s.id, !seen)}>
                          <Check className="h-3.5 w-3.5" /> {seen ? "Visitado" : "Marcar visitado"}
                        </Button>
                        <Button size="icon" variant="ghost" asChild aria-label={`Ver ficha de ${s.name}`}><Link to={s.href}><ExternalLink className="h-4 w-4" /></Link></Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
}

