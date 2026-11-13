// Cómo se gana en cada lotería y sorteo. Las reglas salen de lottery_draws.how_to_play (editable en el panel):
// sin montos de pago, que fija cada lotería.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { fetchLotteries } from "@/services/lotteryService";
import type { LotteryCompanyWithDraws } from "@/types/lotteryRelational";

const DAY: Record<string, string> = { lunes: "Lun", martes: "Mar", miercoles: "Mié", jueves: "Jue", viernes: "Vie", sabado: "Sáb", domingo: "Dom" };
const days = (d: string[]) => (d.length === 7 ? "Todos los días" : d.map((x) => DAY[x] ?? x).join(", "));

export default function LoteriasComoSeGana() {
  const [lotteries, setLotteries] = useState<LotteryCompanyWithDraws[] | null>(null);
  useEffect(() => { void fetchLotteries().then(setLotteries); }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Cómo se gana en cada lotería dominicana | Reglas por sorteo"
        description="Reglas de cada sorteo de las loterías dominicanas y de EE. UU. jugadas en RD: cuántos números salen, su rango y cómo se gana en quiniela, palé, tripleta y loto."
        url="https://descubrerepdom.com/loterias/como-se-gana"
        breadcrumbs={[{ name: "Inicio", url: "/" }, { name: "Loterías", url: "/loterias" }, { name: "Cómo se gana", url: "/loterias/como-se-gana" }]}
      />
      <Header />
      <main id="main-content" className="container mx-auto max-w-5xl px-4 pb-16 pt-24 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">Cómo se gana en cada lotería</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Cuántos números salen en cada sorteo, de qué rango y qué hay que acertar. Los pagos los fija cada lotería o banca: consúltalos antes de jugar.
          Juega con responsabilidad: <Link to="/loterias/juego-responsable" className="font-semibold text-primary hover:underline">consejos y ayuda</Link>.
        </p>

        <section aria-labelledby="jugadas" className="mt-8 rounded-2xl border border-border bg-card p-5">
          <h2 id="jugadas" className="text-lg font-bold">Las jugadas de la quiniela</h2>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
            <div><dt className="font-semibold">Quiniela</dt><dd className="text-muted-foreground">Aciertas uno de los tres números del sorteo (1.º, 2.º o 3.º premio).</dd></div>
            <div><dt className="font-semibold">Palé</dt><dd className="text-muted-foreground">Aciertas dos de los tres números.</dd></div>
            <div><dt className="font-semibold">Tripleta</dt><dd className="text-muted-foreground">Aciertas los tres números.</dd></div>
          </dl>
        </section>

        {lotteries === null ? <p className="mt-8 text-muted-foreground">Cargando…</p> : lotteries.length === 0 ? (
          <p className="mt-8 text-muted-foreground">No se pudieron cargar las reglas. Inténtalo de nuevo más tarde.</p>
        ) : lotteries.map((l) => (
          <section key={l.id} aria-labelledby={`lot-${l.slug}`} className="mt-10">
            <h2 id={`lot-${l.slug}`} className="text-xl font-bold">
              <Link to={`/loteria/${l.slug}`} className="hover:text-primary">{l.name}</Link>
              <span className="ml-2 text-sm font-normal text-muted-foreground">{l.country}</span>
            </h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {l.draws.map((d) => (
                <article key={d.id} className="rounded-xl border border-border bg-card p-4">
                  <h3 className="font-semibold"><Link to={`/loteria/${l.slug}/${d.slug}`} className="hover:text-primary">{d.name}</Link></h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {d.schedule_description || `${days(d.draw_days)} · ${d.draw_time}`} · {d.number_of_balls} {d.number_of_balls === 1 ? "número" : "números"} del {d.ball_range_min} al {d.ball_range_max}
                  </p>
                  {d.how_to_play ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.how_to_play}</p> : null}
                </article>
              ))}
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </div>
  );
}
