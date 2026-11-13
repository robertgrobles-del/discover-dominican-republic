// Cómo se gana en cada lotería y sorteo. Las reglas salen de lottery_draws.how_to_play (editable en el panel):
// sin montos de pago, que fija cada lotería.
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Hash, Search } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { fetchLotteries } from "@/services/lotteryService";
import type { LotteryCompanyWithDraws } from "@/types/lotteryRelational";

const DAY: Record<string, string> = { lunes: "Lun", martes: "Mar", miercoles: "Mié", jueves: "Jue", viernes: "Vie", sabado: "Sáb", domingo: "Dom" };
const days = (d: string[]) => (d.length === 7 ? "Todos los días" : d.map((x) => DAY[x] ?? x).join(", "));
const time12 = (t: string) => { const [h, m] = t.split(":").map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };

const PLAYS = [
  { name: "Quiniela", text: "Aciertas uno de los tres números del sorteo. Cobras más si sale en primera posición.", balls: 1 },
  { name: "Palé", text: "Aciertas dos de los tres números, en cualquier posición.", balls: 2 },
  { name: "Tripleta", text: "Aciertas los tres números del sorteo.", balls: 3 },
];

export default function LoteriasComoSeGana() {
  const [lotteries, setLotteries] = useState<LotteryCompanyWithDraws[] | null>(null);
  const [q, setQ] = useState("");
  useEffect(() => { void fetchLotteries().then(setLotteries); }, []);
  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!lotteries || !term) return lotteries;
    return lotteries
      .map((l) => (l.name.toLowerCase().includes(term) ? l : { ...l, draws: l.draws.filter((d) => d.name.toLowerCase().includes(term)) }))
      .filter((l) => l.draws.length);
  }, [lotteries, q]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Cómo se gana en cada lotería dominicana | Reglas por sorteo"
        description="Reglas de cada sorteo de las loterías dominicanas y de EE. UU. jugadas en RD: cuántos números salen, su rango y cómo se gana en quiniela, palé, tripleta y loto."
        url="https://descubrerepdom.com/loterias/como-se-gana"
        breadcrumbs={[{ name: "Inicio", url: "/" }, { name: "Loterías", url: "/loterias" }, { name: "Cómo se gana", url: "/loterias/como-se-gana" }]}
      />
      <Header />
      <main id="main-content" className="pb-16 pt-16">
        <section className="border-b border-sky-100 bg-gradient-to-br from-white via-sky-50 to-blue-100">
          <div className="container mx-auto grid gap-8 px-4 py-10 sm:py-14 lg:grid-cols-12 lg:px-8">
            <div className="lg:col-span-7">
              <Link to="/loterias" className="text-xs font-semibold text-blue-700 hover:underline">← Resultados de hoy</Link>
              <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-blue-700 sm:text-5xl">Cómo se gana en cada lotería</h1>
              <p className="mt-3 max-w-xl text-slate-600">
                Cuántos números salen en cada sorteo, de qué rango y qué hay que acertar. Los pagos los fija cada lotería o banca: pregúntalos antes de jugar.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-1">
              {PLAYS.map((p) => (
                <div key={p.name} className="flex items-start gap-3 rounded-2xl border border-white bg-white/85 p-4 shadow-sm">
                  <span className="flex shrink-0 gap-1" aria-hidden>
                    {Array.from({ length: 3 }, (_, i) => <span key={i} className={`h-4 w-4 rounded-full ${i < p.balls ? "bg-amber-400" : "bg-slate-200"}`} />)}
                  </span>
                  <span><span className="block font-bold text-slate-900">{p.name}</span><span className="text-sm text-slate-600">{p.text}</span></span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 pt-8 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav aria-label="Ir a una lotería" className="flex flex-wrap gap-1.5">
              {lotteries?.map((l) => (
                <a key={l.id} href={`#lot-${l.slug}`} className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold hover:border-blue-300 hover:text-blue-700">{l.name}</a>
              ))}
            </nav>
            <label className="relative">
              <span className="sr-only">Buscar sorteo</span>
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar sorteo" className="h-9 w-56 rounded-full border border-input bg-background pl-9 pr-3 text-sm" />
            </label>
          </div>

          {list === null ? <p className="mt-8 text-muted-foreground">Cargando…</p> : list.length === 0 ? (
            <p className="mt-8 text-muted-foreground">{q ? "Ningún sorteo coincide con la búsqueda." : "No se pudieron cargar las reglas. Inténtalo de nuevo más tarde."}</p>
          ) : list.map((l) => (
            <section key={l.id} id={`lot-${l.slug}`} aria-labelledby={`h-${l.slug}`} className="mt-10 scroll-mt-24">
              <h2 id={`h-${l.slug}`} className="flex flex-wrap items-baseline gap-2 border-b border-border pb-2 font-display text-2xl font-bold">
                <Link to={`/loteria/${l.slug}`} className="hover:text-blue-700">{l.name}</Link>
                <span className="text-sm font-normal text-muted-foreground">{l.country}</span>
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {l.draws.map((d) => (
                  <article key={d.id} className="flex flex-col rounded-2xl border border-border bg-card p-5 transition hover:border-blue-200 hover:shadow-md">
                    <h3 className="font-display text-lg font-bold"><Link to={`/loteria/${l.slug}/${d.slug}`} className="hover:text-blue-700">{d.name}</Link></h3>
                    <ul className="mt-2 flex flex-wrap gap-1.5 text-xs">
                      <li className="flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-sky-800 dark:bg-sky-500/10 dark:text-sky-200"><Clock className="h-3 w-3" />{d.schedule_description || `${days(d.draw_days)} · ${time12(d.draw_time)}`}</li>
                      <li className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200"><Hash className="h-3 w-3" />{d.number_of_balls} {d.number_of_balls === 1 ? "número" : "números"} del {d.ball_range_min} al {d.ball_range_max}</li>
                    </ul>
                    {d.how_to_play ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d.how_to_play}</p> : null}
                  </article>
                ))}
              </div>
            </section>
          ))}

          <p className="mt-12 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
            La lotería es un juego de azar. Juega con responsabilidad: <Link to="/loterias/juego-responsable" className="font-semibold underline">consejos y ayuda</Link>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
