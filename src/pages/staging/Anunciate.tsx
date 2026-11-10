// /anunciate: media kit y tarifas. Borrador: cifras y precios se editan en AUDIENCE / PLANS / EXTRAS.
// "Descargar PDF" usa la impresión del navegador (print:hidden oculta cabecera y pie).
import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Printer } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LEGAL } from "./LegalPage";

const AUDIENCE = [
  { value: "36,8 mil", label: "Instagram (2 cuentas)" },
  { value: "13,7 mil", label: "TikTok" },
  { value: "13 mil", label: "Facebook" },
  { value: "1,7 mil", label: "X" },
];

const PLANS = [
  {
    name: "Esencial", price: 150, fit: "Para negocios que empiezan a anunciarse",
    items: ["Banner en noticias y eventos", "1 Reel en Instagram", "3 stories con enlace", "Ficha destacada en su provincia"],
  },
  {
    name: "Destacado", price: 350, fit: "Hoteles, tours y restaurantes con temporada alta", featured: true,
    items: ["Banner en la portada", "1 artículo patrocinado en el portal", "2 Reels en Instagram + 1 TikTok", "6 stories con enlace", "Ficha destacada en su provincia"],
  },
  {
    name: "Premium", price: 700, fit: "Marcas que buscan presencia constante",
    items: ["Banner en portada, noticias y eventos", "2 artículos patrocinados", "4 Reels en Instagram + 2 TikTok", "12 stories con enlace", "Su producto como premio de la rifa mensual", "Informe de resultados al cierre"],
  },
];

const EXTRAS = [
  ["Reel o post en Instagram", "USD 90"],
  ["Video en TikTok", "USD 70"],
  ["Story con enlace", "USD 20"],
  ["Artículo patrocinado", "USD 100"],
  ["Banner en la portada (mes)", "USD 90"],
];

const SPONSORS = [
  { tier: "Oro", price: "USD 1.500", perks: "Marca principal en el evento y la transmisión, banner en portada 3 meses, contenido en redes ×2 y premio de la primera rifa." },
  { tier: "Plata", price: "USD 800", perks: "Marca en el evento y la transmisión, banner en portada 1 mes y contenido en redes." },
  { tier: "Bronce", price: "USD 400", perks: "Logo en el evento, 1 Reel en Instagram y mención en la nota de prensa." },
];

const ANNUAL_DISCOUNT = 0.1;
const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

export default function Anunciate() {
  const [annual, setAnnual] = useState(false);
  return (
    <>
      <SEOHead
        title="Anúnciate | Publicidad y Patrocinios en Descubre RD"
        description="Llega a miles de viajeros y locales con paquetes de publicidad en Descubre RD: portal web, Instagram, TikTok y contenido patrocinado."
        url="/anunciate"
        keywords="publicidad turismo republica dominicana, media kit turismo rd, patrocinar eventos turismo rd, anunciar hotel republica dominicana"
        geo={{ placename: "República Dominicana", region: "DO" }}
        breadcrumbs={[
          { name: "Inicio", url: "/" },
          { name: "Anúnciate", url: "/anunciate" },
        ]}
      />
      <div className="print:hidden"><Header /></div>
      <main className="container mx-auto px-4 pb-20 pt-24 lg:px-8 lg:pt-28 print:pt-0">
        <nav aria-label="Migas de pan" className="mb-6 text-sm text-muted-foreground print:hidden">
          <Link to="/" className="hover:text-foreground">Inicio</Link> <span aria-hidden="true">/</span> <span aria-current="page">Anúnciate</span>
        </nav>

        <header className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Anúnciate en Descubre RD</h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">Contamos lo que pasa en el turismo dominicano a más de 65 mil personas que siguen el portal en redes: viajeros de fuera, dominicanos en el exterior y quienes recorren el país los fines de semana.</p>
          </div>
          <dl className="flex gap-8 border-l-2 border-primary pl-6">
            {AUDIENCE.map((a) => (
              <div key={a.label} className="flex flex-col-reverse">
                <dt className="text-sm text-muted-foreground">{a.label}</dt>
                <dd className="font-display text-3xl font-bold tabular-nums">{a.value}</dd>
              </div>
            ))}
          </dl>
        </header>

        <section aria-labelledby="paquetes" className="mt-16">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 id="paquetes" className="font-display text-2xl font-bold">Paquetes mensuales</h2>
            <div role="group" aria-label="Forma de pago" className="inline-flex border border-border text-sm print:hidden">
              {[false, true].map((a) => (
                <button key={String(a)} type="button" aria-pressed={annual === a} onClick={() => setAnnual(a)}
                  className={cn("px-4 py-2 font-medium transition-colors", annual === a ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>
                  {a ? "Anual · 10 % menos" : "Mensual"}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3 md:items-center">
            {PLANS.map((p) => (
              <article key={p.name} className={cn("relative flex flex-col rounded-lg border p-7 break-inside-avoid",
                p.featured ? "border-foreground bg-foreground text-background md:-my-4 md:py-11" : "border-border bg-background")}>
                {p.featured && <p className="absolute -top-3 left-7 bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">El más contratado</p>}
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className={cn("mt-1 text-sm", p.featured ? "text-background/70" : "text-muted-foreground")}>{p.fit}</p>
                <p className="mt-6"><span className={cn("font-display text-5xl font-bold tabular-nums", p.featured ? "text-background" : "text-foreground")}>{usd(annual ? p.price * (1 - ANNUAL_DISCOUNT) : p.price)}</span> <span className={p.featured ? "text-background/70" : "text-muted-foreground"}>/ mes</span></p>
                <p className={cn("mt-1 text-sm tabular-nums", p.featured ? "text-background/70" : "text-muted-foreground")}>
                  {annual
                    ? `${usd(p.price * 12 * (1 - ANNUAL_DISCOUNT))} al año · ahorra ${usd(p.price * 12 * ANNUAL_DISCOUNT)}`
                    : `o ${usd(p.price * 12 * (1 - ANNUAL_DISCOUNT))} al año con el plan anual`}
                </p>
                <ul className="mt-6 space-y-2.5 text-sm">
                  {p.items.map((it) => (
                    <li key={it} className="flex gap-2"><Check className={"mt-0.5 h-4 w-4 shrink-0 text-primary"} aria-hidden="true" />{it}</li>
                  ))}
                </ul>
                <Button asChild variant={p.featured ? "default" : "outline"} className="mt-8 print:hidden">
                  <Link to="/contacto">Quiero el {p.name}</Link>
                </Button>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="sueltos" className="mt-16 grid gap-10 lg:grid-cols-2 break-inside-avoid">
          <div>
            <h2 id="sueltos" className="font-display text-2xl font-bold">Formatos sueltos</h2>
            <dl className="mt-4 divide-y divide-border border-y border-border">
              {EXTRAS.map(([name, price]) => (
                <div key={name} className="flex justify-between gap-6 py-3"><dt>{name}</dt><dd className="font-semibold tabular-nums">{price}</dd></div>
              ))}
            </dl>
          </div>
          <div className="rounded-lg bg-muted/40 p-7">
            <h2 id="patrocinio" className="font-display text-2xl font-bold">Patrocinio del lanzamiento</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">Evento presencial de presentación del portal, transmitido en vivo por Instagram y TikTok.</p>
            <dl className="mt-5 space-y-4">
              {SPONSORS.map((s) => (
                <div key={s.tier}>
                  <div className="flex justify-between gap-6"><dt className="font-semibold">{s.tier}</dt><dd className="font-semibold tabular-nums">{s.price}</dd></div>
                  <dd className="mt-1 text-sm text-muted-foreground">{s.perks}</dd>
                </div>
              ))}
            </dl>
            <a href={`mailto:${LEGAL.email}?subject=Patrocinio%20del%20lanzamiento`} className="mt-5 inline-block font-medium text-primary hover:underline">{LEGAL.email}</a>
          </div>
        </section>

        <div className="mt-12 flex flex-wrap items-center gap-4 print:hidden">
          <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" aria-hidden="true" />Descargar en PDF</Button>
          <p className="text-sm text-muted-foreground">Precios en USD, sin impuestos. Próximamente: anuncios en el boletín y la revista.</p>
        </div>
      </main>
      <div className="print:hidden"><Footer /></div>
    </>
  );
}
