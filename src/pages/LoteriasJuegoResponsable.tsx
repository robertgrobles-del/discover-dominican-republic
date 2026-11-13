// Juego responsable: límites, señales de alerta y dónde pedir ayuda en República Dominicana.
// Teléfonos comprobados el 2026-11-12: 711 (Línea Cuida Tu Salud Mental, sustituyó al 809-200-1400) y 911.
import { Link } from "react-router-dom";
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
      <main id="main-content" className="container mx-auto max-w-3xl px-4 pb-16 pt-24 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">Juego responsable</h1>
        <p className="mt-3 text-muted-foreground">
          La lotería es un entretenimiento, no una forma de ganar dinero. Descubre RD solo publica resultados: no vende boletos ni recibe apuestas.
        </p>

        <section aria-labelledby="consejos" className="mt-8">
          <h2 id="consejos" className="text-xl font-bold">Consejos para jugar con cabeza</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">{TIPS.map((t) => <li key={t}>{t}</li>)}</ul>
        </section>

        <section aria-labelledby="senales" className="mt-8">
          <h2 id="senales" className="text-xl font-bold">Señales de alerta</h2>
          <p className="mt-2 text-muted-foreground">Si te reconoces en alguna, puede que el juego se esté convirtiendo en un problema:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">{SIGNS.map((t) => <li key={t}>{t}</li>)}</ul>
        </section>

        <section aria-labelledby="ayuda" className="mt-8 rounded-2xl border border-border bg-card p-5">
          <h2 id="ayuda" className="text-xl font-bold">Dónde pedir ayuda</h2>
          <ul className="mt-3 space-y-3 text-sm">
            <li><a href="tel:711" className="text-lg font-bold text-primary hover:underline">711</a>
              <span className="block text-muted-foreground">Línea Cuida Tu Salud Mental del Ministerio de Salud Pública: orientación psicológica gratuita y confidencial.</span></li>
            <li><a href="tel:911" className="text-lg font-bold text-primary hover:underline">911</a>
              <span className="block text-muted-foreground">Si tú o alguien está en peligro inmediato.</span></li>
            <li><span className="font-semibold">Jugadores Anónimos</span>
              <span className="block text-muted-foreground">Grupos de apoyo para personas con problemas de juego y sus familias.</span></li>
          </ul>
        </section>

        <p className="mt-8 text-sm text-muted-foreground">
          Consulta también <Link to="/loterias/como-se-gana" className="font-semibold text-primary hover:underline">cómo se gana en cada lotería</Link> o vuelve a los <Link to="/loterias" className="font-semibold text-primary hover:underline">resultados</Link>.
        </p>
      </main>
      <Footer />
    </div>
  );
}
