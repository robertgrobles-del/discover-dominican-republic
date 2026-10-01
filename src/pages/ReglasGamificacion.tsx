import { useMemo, useState } from "react";
import { ArrowRight, Clock3, Search, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const rewardRules = [
  { action: "Reseña aprobada", xp: 20, coins: 5, limit: "3 al día", condition: "La reseña debe ser aprobada; una vez por reseña." },
  { action: "Favorito añadido", xp: 2, coins: 0, limit: "10 al día", condition: "Una vez por lugar guardado." },
  { action: "Publicación en RD Social", xp: 5, coins: 1, limit: "3 al día", condition: "La publicación debe ser válida y no eliminada." },
  { action: "Comentario en RD Social", xp: 2, coins: 0, limit: "5 al día · 20 s entre acciones", condition: "El servidor aplica el enfriamiento y el tope." },
  { action: "Reserva completada", xp: 100, coins: 20, limit: "Sin tope diario configurado", condition: "Una vez por reserva; se acredita desde el servidor." },
  { action: "Foto aprobada", xp: 10, coins: 2, limit: "5 al día", condition: "La foto debe pasar la aprobación correspondiente." },
  { action: "Visita a página", xp: 1, coins: 0, limit: "5 al día · 5 s entre acciones", condition: "La visita por sí sola no garantiza saldo visible en esta página." },
  { action: "Compartir contenido", xp: 3, coins: 0, limit: "5 al día · 30 s entre acciones", condition: "El servidor limita la frecuencia de acreditación." },
  { action: "Lugar marcado como visitado", xp: 15, coins: 2, limit: "5 al día", condition: "Una vez por lugar; requiere una referencia válida." },
  { action: "Check-in diario", xp: 10, coins: 2, limit: "1 al día", condition: "El XP puede multiplicarse por racha; no se puede repetir el día." },
  { action: "Sello del Pasaporte verificado", xp: 20, coins: 3, limit: "10 al día", condition: "Una vez por sello; lo acredita el servidor." },
  { action: "Primera visita a una provincia", xp: 25, coins: 5, limit: "Una vez por provincia", condition: "La provincia debe ser una visita nueva para la cuenta." },
  { action: "Punto de ruta completado", xp: 10, coins: 0, limit: "40 al día", condition: "Una vez por punto de control." },
  { action: "Check-in de reserva", xp: 30, coins: 5, limit: "Una vez por reserva", condition: "Se vincula con una reserva elegible." },
  { action: "Referido registrado", xp: 50, coins: 20, limit: "10 al día", condition: "Acreditación del servidor al aplicar un código válido." },
  { action: "Código de referido aplicado", xp: 25, coins: 10, limit: "Una vez por código aplicado", condition: "El servidor valida el referido y evita autorreferidos." },
];

const levels = [
  ["Turista", "0"], ["Curioso", "100"], ["Viajero", "300"], ["Explorador", "600"], ["Aventurero", "1,000"],
  ["Trotamundos", "1,600"], ["Guía local", "2,400"], ["Embajador", "3,500"], ["Leyenda", "5,000"], ["Maestro del Caribe", "7,500"],
];

const leagues = [
  ["Bronce", "0–99 XP", "0 monedas"], ["Plata", "100–299 XP", "10 monedas"], ["Oro", "300–699 XP", "25 monedas"],
  ["Platino", "700–1,499 XP", "50 monedas"], ["Diamante", "1,500 XP o más", "100 monedas"],
];

export default function ReglasGamificacion() {
  const [query, setQuery] = useState("");
  const filteredRules = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return rewardRules.filter((rule) => `${rule.action} ${rule.condition} ${rule.limit}`.toLocaleLowerCase().includes(term));
  }, [query]);

  return (
    <PageTransition>
      <SEOHead
        title="Reglas de XP, monedas y Pasaporte Digital"
        description="Consulta cómo se acreditan XP y monedas, los topes de acciones, los niveles y las ligas del Pasaporte Digital de Descubre RD."
      />
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main>
          <section className="border-b border-border bg-[#0b3c36] text-white">
            <div className="container mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
              <Badge className="border-white/20 bg-white/10 text-emerald-100 hover:bg-white/10"><ShieldCheck className="mr-2 h-3.5 w-3.5" />Reglas del Pasaporte Digital</Badge>
              <h1 className="mt-5 max-w-3xl font-display text-4xl font-black tracking-tight md:text-5xl">Lo que haces cuenta. El servidor acredita.</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-emerald-50/80">Los valores que ves aquí son los valores iniciales definidos para el programa. Los topes, referencias válidas y aprobaciones se aplican en el servidor; la configuración activa de cada despliegue puede variar.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild className="bg-amber-300 text-emerald-950 hover:bg-amber-200"><Link to="/pasaporte-digital">Abrir mi Pasaporte <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                <Button asChild variant="outline" className="border-white/35 bg-transparent text-white hover:bg-white/10 hover:text-white"><Link to="/gana-con-descubre-rd">Ver formas de participar</Link></Button>
              </div>
            </div>
          </section>

          <div className="container mx-auto max-w-7xl space-y-16 px-4 py-12 md:px-8 md:py-16">
            <section aria-labelledby="reward-table-title">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">XP y monedas</p><h2 id="reward-table-title" className="mt-2 font-display text-3xl font-bold">Acciones y límites iniciales</h2></div>
                <div className="relative w-full md:max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar una acción" aria-label="Buscar una regla de gamificación" className="pl-9" /></div>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                  <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3">Acción</th><th className="px-4 py-3">XP</th><th className="px-4 py-3">Monedas</th><th className="px-4 py-3">Tope / espera</th><th className="px-4 py-3">Condición</th></tr></thead>
                  <tbody className="divide-y divide-border">
                    {filteredRules.map((rule) => <tr key={rule.action} className="align-top"><th scope="row" className="px-4 py-3 font-semibold">{rule.action}</th><td className="px-4 py-3 tabular-nums">{rule.xp}</td><td className="px-4 py-3 tabular-nums">{rule.coins}</td><td className="px-4 py-3">{rule.limit}</td><td className="max-w-sm px-4 py-3 text-muted-foreground">{rule.condition}</td></tr>)}
                    {filteredRules.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No encontramos una regla que coincida con esa búsqueda.</td></tr>}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0" />Los topes diarios se cuentan según el día de República Dominicana. Algunas acciones sólo las acredita el servidor después de verificar la reserva, el contenido, el sello o la referencia.</p>
            </section>

            <section aria-labelledby="level-table-title">
              <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Progreso</p><h2 id="level-table-title" className="mt-2 font-display text-3xl font-bold">Niveles del Pasaporte</h2><p className="mt-2 max-w-2xl text-muted-foreground">Estos son los umbrales iniciales de XP. Los beneficios vinculados a un nivel dependen de las condiciones y la oferta vigente.</p></div>
              <ol className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-5">
                {levels.map(([name, xp], index) => <li key={name} className="bg-card p-4"><span className="font-mono text-xs text-primary">NIVEL {index + 1}</span><h3 className="mt-2 font-semibold">{name}</h3><p className="mt-1 text-sm text-muted-foreground">Desde {xp} XP</p></li>)}
              </ol>
            </section>

            <section aria-labelledby="league-table-title">
              <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Competencia semanal</p><h2 id="league-table-title" className="mt-2 font-display text-3xl font-bold">Ligas y cierre de semana</h2><p className="mt-2 max-w-2xl text-muted-foreground">El servidor calcula la liga a partir del XP semanal de la temporada activa. Al cerrar la semana, asigna la liga y aplica la recompensa indicada si corresponde.</p></div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{leagues.map(([name, xp, reward]) => <article key={name} className="border-l-2 border-primary bg-card px-4 py-4"><h3 className="font-semibold">{name}</h3><p className="mt-2 text-sm text-muted-foreground">{xp}</p><p className="mt-1 text-sm font-medium">{reward}</p></article>)}</div>
            </section>

            <section className="grid gap-8 border-t border-border pt-10 md:grid-cols-2">
              <div><h2 className="font-display text-2xl font-bold">Rachas y temporadas</h2><p className="mt-3 leading-7 text-muted-foreground">El check-in diario mantiene la racha. El XP del check-in aumenta desde el tercer día consecutivo; hay hitos de monedas en 7, 14, 30, 60 y 100 días. Las fechas y recompensas de cada temporada se definen en el servidor y pueden cambiar entre temporadas.</p></div>
              <div><h2 className="font-display text-2xl font-bold">Antifraude y aprobación</h2><p className="mt-3 leading-7 text-muted-foreground">Las cifras no se reciben del navegador. Reseñas, fotos, reservas y referencias se acreditan desde flujos del servidor; los topes, enfriamientos y registros repetidos pueden impedir una recompensa. Compartir o abrir una página no garantiza ingresos ni saldo.</p></div>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
}
