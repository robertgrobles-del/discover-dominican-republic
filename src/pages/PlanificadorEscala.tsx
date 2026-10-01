import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plane, Clock, AlertTriangle } from "lucide-react";

const airports = [
  { code: "PUJ", name: "Punta Cana" },
  { code: "SDQ", name: "Las Américas · Santo Domingo" },
  { code: "STI", name: "Cibao · Santiago" },
  { code: "POP", name: "Gregorio Luperón · Puerto Plata" },
  { code: "LRM", name: "La Romana" },
];

export default function PlanificadorEscala() {
  const [airport, setAirport] = useState("PUJ");
  const [layoverHours, setLayoverHours] = useState(6);
  const [international, setInternational] = useState(true);
  const [checkedBag, setCheckedBag] = useState(false);
  const usableMinutes = useMemo(() => Math.max(0, layoverHours * 60 - (international ? 180 : 120) - (checkedBag ? 45 : 0) - 60), [layoverHours, international, checkedBag]);

  return (
    <PageTransition>
      <SEOHead title="Planificador de escalas aeroportuarias | Descubre RD" description="Estima el tiempo libre de una escala en República Dominicana y revisa los factores que debes confirmar antes de salir del aeropuerto." />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="container mx-auto max-w-5xl flex-1 px-4 py-16">
          <Badge variant="outline" className="mb-4 gap-2"><Plane className="h-4 w-4" aria-hidden="true" /> Planifica con margen</Badge>
          <h1 className="font-display text-4xl font-bold">¿Alcanza el tiempo para salir durante tu escala?</h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">Esta estimación es orientativa; no conoce filas, demoras, requisitos migratorios ni condiciones del día. No salgas de la terminal sin confirmar con tu aerolínea y autoridades que puedes hacerlo y volver a tiempo.</p>
          <div className="mt-8 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
            <Card><CardContent className="space-y-5 p-6">
              <div><label htmlFor="layover-airport" className="mb-2 block text-sm font-medium">Aeropuerto</label><select id="layover-airport" className="w-full rounded-md border border-input bg-background p-3" value={airport} onChange={(e) => setAirport(e.target.value)}>{airports.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.name}</option>)}</select></div>
              <div><label htmlFor="layover-hours" className="mb-2 block text-sm font-medium">Duración entre vuelos (horas)</label><input id="layover-hours" type="number" min={1} max={36} value={layoverHours} onChange={(e) => setLayoverHours(Math.max(1, Math.min(36, Number(e.target.value) || 1)))} className="w-full rounded-md border border-input bg-background p-3" /></div>
              <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={international} onChange={(e) => setInternational(e.target.checked)} className="mt-1" />El siguiente vuelo es internacional (reserva más margen para controles).</label>
              <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={checkedBag} onChange={(e) => setCheckedBag(e.target.checked)} className="mt-1" />Debo recoger y volver a documentar equipaje.</label>
            </CardContent></Card>
            <Card className="border-primary/20"><CardContent className="p-6">
              <Clock className="h-7 w-7 text-primary" aria-hidden="true" />
              <p className="mt-4 text-sm text-muted-foreground">Tiempo libre estimado tras reservar márgenes</p>
              <p className="mt-1 font-display text-4xl font-bold" aria-live="polite">{usableMinutes >= 60 ? `${Math.floor(usableMinutes / 60)} h ${usableMinutes % 60} min` : `${usableMinutes} min`}</p>
              <p className="mt-3 text-sm text-muted-foreground">Usamos una reserva conservadora configurable; no sustituye tiempos mínimos de conexión ni instrucciones oficiales.</p>
            </CardContent></Card>
          </div>
          <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 text-sm"><p className="flex gap-2 font-semibold"><AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />Antes de decidir</p><ul className="mt-3 list-disc space-y-2 pl-6 text-muted-foreground"><li>Confirma con la aerolínea la hora límite de embarque y si el equipaje se transfiere automáticamente.</li><li>Verifica requisitos de entrada, migración y reingreso con fuentes oficiales.</li><li>Calcula el traslado de ida y vuelta según el tráfico real; esta página no ofrece datos de tráfico en vivo.</li><li>Si el margen es ajustado, permanece en el aeropuerto.</li></ul></div>
          <p className="mt-6 text-sm text-muted-foreground">Consulta también la <Link className="text-primary underline" to="/aeropuerto">guía de aeropuertos</Link> y la <Link className="text-primary underline" to="/guia-practica">guía práctica de viaje</Link>.</p>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
}
