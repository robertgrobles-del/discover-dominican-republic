// Números calientes y fríos por sorteo, calculados con los resultados reales guardados (api: /lotteries/stats).
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Flame, Snowflake } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { fetchLotteries } from "@/services/lotteryService";
import type { LotteryCompanyWithDraws } from "@/types/lotteryRelational";

interface Stat { n: number; count: number; pct: number; last_date: string | null; days_since: number | null }
interface Stats {
  draw: { id: string; name: string; ball_range_min: number; ball_range_max: number; number_of_balls: number };
  days: number | null; range_from: string | null; range_to: string | null; total_draws: number; from: string | null; to: string | null; probability: number; numbers: Stat[];
}

const pad = (n: number, max: number) => String(n).padStart(max >= 10 ? 2 : 1, "0");
const pct = (x: number) => `${(x * 100).toLocaleString("es-DO", { maximumFractionDigits: 1 })} %`;
const ago = (d: number | null) => (d === null ? "Sin salir en el periodo" : d === 0 ? "Salió hoy" : d === 1 ? "Salió ayer" : `Hace ${d} días`);

export default function LoteriasEstadisticas() {
  const [params] = useSearchParams();
  const [lotteries, setLotteries] = useState<LotteryCompanyWithDraws[]>([]);
  const [lotterySlug, setLotterySlug] = useState("");
  const [drawId, setDrawId] = useState("");
  // Periodo: últimos N días (365 por defecto), año en curso, año pasado o un rango propio.
  const [period, setPeriod] = useState("365");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const year = new Date().getFullYear();
  const today = new Date(Date.now() - 4 * 3600_000).toISOString().slice(0, 10);
  const query = period === "year" ? `from=${year}-01-01&to=${today}`
    : period === "prev" ? `from=${year - 1}-01-01&to=${year - 1}-12-31`
    : period === "custom" ? (from && to && from <= to ? `from=${from}&to=${to}` : "")
    : `days=${period}`;
  const periodLabel = period === "year" ? `en ${year}` : period === "prev" ? `en ${year - 1}` : period === "custom" ? `del ${from} al ${to}` : `en los últimos ${period} días`;
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetchLotteries().then((l) => {
      setLotteries(l);
      const wanted = params.get("draw");
      const owner = wanted ? l.find((x) => x.draws.some((d) => d.id === wanted)) : undefined;
      const first = owner ?? l.find((x) => x.draws.length);
      if (first) { setLotterySlug(first.slug); setDrawId(owner && wanted ? wanted : first.draws[0].id); }
    });
  }, [params]);

  useEffect(() => {
    if (!drawId || !query) return;
    let live = true;
    setLoading(true);
    fetch(`/api/v1/lotteries/stats?draw=${encodeURIComponent(drawId)}&${query}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (live) setStats(j?.data ?? null); })
      .catch(() => { if (live) setStats(null); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [drawId, query]);

  const lottery = lotteries.find((l) => l.slug === lotterySlug);
  const { hot, cold, maxCount } = useMemo(() => {
    const list = stats?.numbers ?? [];
    const hot = [...list].sort((a, b) => b.count - a.count || (a.days_since ?? 1e9) - (b.days_since ?? 1e9)).slice(0, 10);
    const cold = [...list].sort((a, b) => a.count - b.count || (b.days_since ?? 1e9) - (a.days_since ?? 1e9)).slice(0, 10);
    return { hot, cold, maxCount: Math.max(1, ...list.map((x) => x.count)) };
  }, [stats]);
  const max = stats?.draw.ball_range_max ?? 99;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Números calientes y fríos | Loterías dominicanas"
        description="Cuántas veces ha salido cada número en cada sorteo de las loterías dominicanas y de EE. UU., cuándo salió por última vez y su probabilidad."
        url="https://descubrerepdom.com/loterias/estadisticas"
        breadcrumbs={[{ name: "Inicio", url: "/" }, { name: "Loterías", url: "/loterias" }, { name: "Números calientes y fríos", url: "/loterias/estadisticas" }]}
      />
      <Header />
      <main id="main-content" className="pb-16 pt-16">
        <section className="border-b border-sky-100 bg-gradient-to-br from-white via-sky-50 to-blue-100">
          <div className="container mx-auto px-4 py-10 lg:px-8">
            <h1 className="font-display text-3xl font-black tracking-tight text-blue-700 sm:text-5xl">Números calientes y fríos</h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Cuántas veces ha salido cada número en un sorteo y cuándo salió por última vez, contado con los resultados que hemos guardado.
            </p>
          </div>
        </section>

        <div className="container mx-auto space-y-8 px-4 pt-8 lg:px-8">
          <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4" onSubmit={(e) => e.preventDefault()}>
            <label className="text-xs font-semibold text-muted-foreground">Lotería
              <select value={lotterySlug} onChange={(e) => { const l = lotteries.find((x) => x.slug === e.target.value); setLotterySlug(e.target.value); setDrawId(l?.draws[0]?.id ?? ""); }}
                className="mt-1 block h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground">
                {lotteries.filter((l) => l.draws.length).map((l) => <option key={l.slug} value={l.slug}>{l.name}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-muted-foreground">Sorteo
              <select value={drawId} onChange={(e) => setDrawId(e.target.value)} className="mt-1 block h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground">
                {lottery?.draws.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-muted-foreground">Periodo
              <select value={period} onChange={(e) => setPeriod(e.target.value)} className="mt-1 block h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground">
                <option value="365">Últimos 365 días</option>
                <option value="year">Año en curso ({year})</option>
                <option value="prev">Año pasado ({year - 1})</option>
                <option value="180">Últimos 180 días</option>
                <option value="90">Últimos 90 días</option>
                <option value="30">Últimos 30 días</option>
                <option value="custom">Otras fechas…</option>
              </select>
            </label>
            {period === "custom" ? <>
              <label className="text-xs font-semibold text-muted-foreground">Desde
                <input type="date" value={from} max={to || today} onChange={(e) => setFrom(e.target.value)} className="mt-1 block h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground" />
              </label>
              <label className="text-xs font-semibold text-muted-foreground">Hasta
                <input type="date" value={to} min={from} max={today} onChange={(e) => setTo(e.target.value)} className="mt-1 block h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground" />
              </label>
            </> : null}
          </form>

          {loading && !stats ? <p className="text-muted-foreground">Cargando…</p> : !stats ? (
            <p className="text-muted-foreground">No se pudieron cargar las estadísticas.</p>
          ) : stats.total_draws === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">Aún no hay resultados guardados de {stats.draw.name} en este periodo.</p>
          ) : (
            <>
              <dl className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card p-4"><dt className="text-xs text-muted-foreground">Sorteos analizados</dt><dd className="font-display text-2xl font-black tabular-nums">{stats.total_draws}</dd><dd className="text-xs text-muted-foreground">{stats.from} a {stats.to}</dd></div>
                <div className="rounded-2xl border border-border bg-card p-4"><dt className="text-xs text-muted-foreground">Números posibles</dt><dd className="font-display text-2xl font-black tabular-nums">{pad(stats.draw.ball_range_min, max)}–{pad(max, max)}</dd><dd className="text-xs text-muted-foreground">Salen {stats.draw.number_of_balls} por sorteo</dd></div>
                <div className="rounded-2xl border border-border bg-card p-4"><dt className="text-xs text-muted-foreground">Probabilidad de que salga un número</dt><dd className="font-display text-2xl font-black tabular-nums">{pct(stats.probability)}</dd><dd className="text-xs text-muted-foreground">En cada sorteo, igual para todos</dd></div>
              </dl>

              <div className="grid gap-6 lg:grid-cols-2">
                {([["Calientes", "Los que más han salido", hot, Flame, "bg-orange-100 text-orange-800 border-orange-200"], ["Fríos", "Los que menos han salido", cold, Snowflake, "bg-sky-100 text-sky-800 border-sky-200"]] as const).map(([title, sub, list, Icon, tone]) => (
                  <section key={title} className="rounded-2xl border border-border bg-card p-5">
                    <h2 className="flex items-center gap-2 font-display text-lg font-bold"><Icon className="h-5 w-5" />{title}</h2>
                    <p className="text-xs text-muted-foreground">{sub} {periodLabel}</p>
                    <ol className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {list.map((x) => (
                        <li key={x.n} className={`rounded-xl border p-2 text-center ${tone}`}>
                          <span className="block font-mono text-xl font-black">{pad(x.n, max)}</span>
                          <span className="block text-3xs">{x.count} {x.count === 1 ? "vez" : "veces"} · {pct(x.pct)}</span>
                          <span className="block text-3xs opacity-80">{ago(x.days_since)}</span>
                        </li>
                      ))}
                    </ol>
                  </section>
                ))}
              </div>

              <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="font-display text-lg font-bold">Todos los números</h2>
                <p className="text-xs text-muted-foreground">Cuanto más intenso el color, más veces ha salido. Pasa el ratón por encima para ver el detalle.</p>
                <ul className="mt-4 grid grid-cols-5 gap-1.5 sm:grid-cols-10">
                  {stats.numbers.map((x) => (
                    <li key={x.n} title={`${pad(x.n, max)}: ${x.count} veces (${pct(x.pct)}). ${ago(x.days_since)}`}
                      className="rounded-lg border border-blue-100 p-1.5 text-center" style={{ backgroundColor: `rgba(37, 99, 235, ${0.06 + 0.6 * (x.count / maxCount)})` }}>
                      <span className="block font-mono text-sm font-black text-slate-900">{pad(x.n, max)}</span>
                      <span className="block text-3xs text-slate-700">{x.count}×</span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}

          <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
            Cada sorteo es independiente: que un número haya salido mucho o poco no cambia su probabilidad de salir en el próximo.
            Juega con responsabilidad: <Link to="/loterias/juego-responsable" className="font-semibold underline">consejos y ayuda</Link>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
