// Juego responsable: límites, señales de alerta y dónde pedir ayuda en República Dominicana.
// Teléfonos comprobados el 2026-11-12: 711 (Línea Cuida Tu Salud Mental, sustituyó al 809-200-1400) y 911.
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Phone } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";

const TIPS = [
  "Juega solo si eres mayor de 18 años.",
  "Decide antes cuánto vas a gastar y no lo superes. Usa dinero que te sobre, nunca el de la comida, el alquiler o las deudas.",
  "Ponte también un límite de tiempo.",
  "No juegues para recuperar lo que perdiste: cada sorteo es independiente y el resultado es al azar.",
  "Los números «calientes» o «fríos» son estadísticas del pasado: no aumentan tus probabilidades.",
  "No pidas prestado para jugar ni juegues bajo los efectos del alcohol o cuando estés triste o estresado.",
];
const SIGNS = [
  "Gastas más dinero o tiempo del que te propusiste.",
  "Piensas en el juego todo el tiempo o necesitas apostar más para sentir lo mismo.",
  "Mientes a tu familia sobre cuánto juegas o pides dinero para jugar.",
  "Dejas de lado el trabajo, los estudios o a tu familia.",
  "Te sientes ansioso o irritable cuando intentas dejarlo.",
];

export default function LoteriasJuegoResponsable() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Juego responsable | Loterías en República Dominicana"
        description="Consejos para jugar a la lotería con responsabilidad, señales de alerta del juego problemático y dónde pedir ayuda en República Dominicana."
        url="https://descubrerepdom.com/loterias/juego-responsable"
        breadcrumbs={[{ name: "Inicio", url: "/" }, { name: "Loterías", url: "/loterias" }, { name: "Juego responsable", url: "/loterias/juego-responsable" }]}
      />
      <Header />
      <main id="main-content" className="pb-16 pt-16">
        <section className="border-b border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-sky-100">
          <div className="container mx-auto grid items-center gap-8 px-4 py-10 sm:py-14 lg:grid-cols-12 lg:px-8">
            <div className="lg:col-span-7">
              <Link to="/loterias" className="text-xs font-semibold text-blue-700 hover:underline">← Resultados de hoy</Link>
              <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-emerald-800 sm:text-5xl">Juego responsable</h1>
              <p className="mt-3 max-w-xl text-slate-600">
                La lotería es un entretenimiento, no una forma de ganar dinero. Descubre RD solo publica resultados: no vende boletos ni recibe apuestas.
              </p>
            </div>
            <aside aria-labelledby="ayuda" className="rounded-3xl border border-white bg-white/90 p-6 shadow-lg lg:col-span-5">
              <h2 id="ayuda" className="flex items-center gap-2 font-display text-lg font-bold text-slate-900"><Phone className="h-5 w-5 text-emerald-600" />Dónde pedir ayuda</h2>
              <ul className="mt-4 space-y-4 text-sm">
                <li>
                  <a href="tel:711" className="font-display text-3xl font-black text-emerald-700 hover:underline">711</a>
                  <span className="block text-slate-600">Línea Cuida Tu Salud Mental del Ministerio de Salud Pública: orientación psicológica gratuita y confidencial.</span>
                </li>
                <li>
                  <a href="tel:911" className="font-display text-3xl font-black text-red-600 hover:underline">911</a>
                  <span className="block text-slate-600">Si tú o alguien está en peligro inmediato.</span>
                </li>
                <li>
                  <span className="font-bold text-slate-900">Jugadores Anónimos</span>
                  <span className="block text-slate-600">Grupos de apoyo para personas con problemas de juego y sus familias.</span>
                </li>
              </ul>
            </aside>
          </div>
        </section>

        <div className="container mx-auto grid gap-6 px-4 pt-10 lg:grid-cols-2 lg:px-8">
          <section aria-labelledby="consejos" className="rounded-3xl border border-border bg-card p-6">
            <h2 id="consejos" className="font-display text-2xl font-bold">Consejos para jugar con cabeza</h2>
            <ul className="mt-4 space-y-3">
              {TIPS.map((t) => (
                <li key={t} className="flex gap-3 text-muted-foreground"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />{t}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="senales" className="rounded-3xl border border-amber-200 bg-amber-50/60 p-6 dark:border-amber-500/30 dark:bg-amber-500/5">
            <h2 id="senales" className="font-display text-2xl font-bold">Señales de alerta</h2>
            <p className="mt-1 text-sm text-muted-foreground">Si te reconoces en alguna, puede que el juego se esté convirtiendo en un problema:</p>
            <ul className="mt-4 space-y-3">
              {SIGNS.map((t) => (
                <li key={t} className="flex gap-3 text-muted-foreground"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />{t}</li>
              ))}
            </ul>
          </section>

          <p className="text-sm text-muted-foreground lg:col-span-2">
            Consulta también <Link to="/loterias/como-se-gana" className="font-semibold text-blue-700 hover:underline">cómo se gana en cada lotería</Link> o vuelve a los <Link to="/loterias" className="font-semibold text-blue-700 hover:underline">resultados</Link>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
