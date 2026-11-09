// /e-ticket: guía del e-Ticket migratorio de República Dominicana (nuevo portal eticket.gob.do).
// Cada texto es un nodo propio para que el traductor del sitio (src/i18n/auto) lo encuentre entero.
// Para buscadores y agentes de IA: el servidor entrega esta URL con metadatos y FAQPage (api/index.ts, render/e-ticket)
// y hay versión Markdown en /e-ticket.md. Si cambias datos aquí, cámbialos también en public/e-ticket.md.
import { useState } from "react";
import { AlertTriangle, Check, Copy, ExternalLink, Mail, Phone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { formatNewsDate, usePublicNewsList } from "@/lib/stagingContent";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead, generateFAQSchema } from "@/components/SEOHead";

const OFFICIAL_URL = "https://eticket.gob.do/";
const OFFICIAL_HOST = "eticket.gob.do";
const PHONE = "809-508-2555";
const EMAIL = "info@migracion.gob.do";

const keyFacts = [
  { label: "Costo", value: "Gratis" },
  { label: "Tiempo", value: "Unos 15 minutos" },
  { label: "Cuándo", value: "De 72 a 24 horas antes" },
  { label: "Recibes", value: "Un QR por trayecto" },
];

const news = [
  { text: "Crea tu cuenta: tus datos quedan guardados para el próximo viaje." },
  { text: "Recibe el e-Ticket en tu correo electrónico." },
  { text: "Ya no hay formulario de salud y varios campos se simplificaron." },
  { text: "Guarda el formulario a medias y termínalo después." },
  { text: "Crea el e-Ticket de salida a partir del de entrada." },
];

const steps = [
  { title: "Entra al portal oficial", description: "Escribe tú la dirección eticket.gob.do en el navegador. No llegues desde anuncios ni buscadores patrocinados." },
  { title: "Inicia sesión o continúa como invitado", description: "Con una cuenta tus datos quedan guardados. Elige «Nuevo e-Ticket» o crea uno a partir de un e-Ticket anterior." },
  { title: "Completa tus datos", description: "Pasaporte, vuelo, escalas, dirección donde te alojarás y la declaración de aduanas. Puedes guardarlo y seguir después." },
  { title: "Guarda tu código QR", description: "Al enviarlo recibes el QR, también por correo. Descarga el PDF o haz una captura de pantalla." },
  { title: "Preséntalo al viajar", description: "Muéstralo desde el celular o impreso en el mostrador de la aerolínea y en migración." },
];

const checklist = [
  { text: "Pasaporte de cada viajero" },
  { text: "Número de vuelo, fecha y escalas" },
  { text: "Dirección del alojamiento en República Dominicana" },
  { text: "Si llevas más de 10.000 dólares en efectivo, debes declararlo en aduanas" },
  { text: "Un correo electrónico para recibir el QR" },
];

const facts = [
  { title: "Entrada y salida, por separado", text: "Cada trayecto tiene su propio e-Ticket y su propio QR. Muchos viajeros solo llenan el de llegada y deben hacer el de salida deprisa en el aeropuerto. En el nuevo portal, el de salida se crea en un momento a partir del de entrada." },
  { title: "¿Te equivocaste en un dato?", text: "Antes del día del vuelo puedes corregirlo desde tu cuenta o con el código de solicitud que recibes al empezar. Si ya es el día del viaje, lo más rápido es llenar uno nuevo." },
  { title: "Viajes en familia y menores", text: "En un mismo trámite puedes incluir a tus acompañantes, incluidos bebés y niños. La declaración de aduanas solo la firman los mayores de 18 años." },
  { title: "No sustituye la Tarjeta de Turista", text: "La Tarjeta de Turista (10 dólares) es aparte, aunque en la mayoría de los vuelos comerciales ya viene incluida en el precio del boleto." },
];

const fraudSigns = [
  "Te cobran por tramitarlo o por «agilizarlo».",
  "La dirección no termina en .gob.do.",
  "Llegaste desde un anuncio que promete gestionarlo por ti.",
  "Te piden los datos de tu tarjeta.",
];

const ETICKET_FAQS = [
  { question: "¿Cuándo debo completar el e-Ticket?", answer: "Lo ideal es entre 72 y 24 horas antes del vuelo, y siempre antes del check-in. Así evitas imprevistos si falla la conexión o el portal está saturado." },
  { question: "¿Tiene algún costo?", answer: "No. Es totalmente gratis. Si una página te pide un pago, no es el sitio oficial." },
  { question: "¿Se llena uno por persona?", answer: "Cada viajero, incluidos bebés y niños, debe estar registrado, pero no hace falta un trámite por persona: puedes añadir a tus acompañantes en el mismo formulario." },
  { question: "¿Sirve el mismo para la entrada y la salida?", answer: "No. Necesitas uno para llegar y otro para salir, cada uno con su QR. En el nuevo portal, el de salida se crea a partir del de entrada." },
  { question: "¿Necesito imprimirlo?", answer: "No es obligatorio: puedes mostrar el código QR desde el celular. Una copia impresa o una captura de pantalla sirve de respaldo si te quedas sin batería o sin conexión." },
  { question: "¿Qué pasa si llego sin e-Ticket?", answer: "Tendrás que completarlo en el aeropuerto antes de pasar por migración, lo que puede retrasarte. Hazlo con tiempo desde casa." },
  { question: "¿Por qué ya no hay formulario de salud?", answer: "El nuevo portal eliminó la declaración de salud para simplificar el trámite. Ahora se completan los datos migratorios y la declaración de aduanas." },
];

function OfficialSiteButton({ label, className = "" }: { label: string; size?: "lg" | "default"; className?: string }) {
  return (
    <a
      href={OFFICIAL_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative inline-flex items-center justify-between gap-3 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/95 active:scale-[0.98] ${className}`}
    >
      <span>{label}</span>
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
      <span className="sr-only">(se abre en otra pestaña)</span>
    </a>
  );
}

export default function ETicket() {
  const [copied, setCopied] = useState(false);
  const { data: allNews = [] } = usePublicNewsList();
  const related = allNews.filter((n) => /e-?ticket/i.test(`${n.title} ${n.excerpt ?? ""} ${n.body ?? ""}`)).slice(0, 3);
  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(OFFICIAL_URL);
      setCopied(true);
      toast.success("Dirección oficial copiada");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error(`No se pudo copiar. Escríbela a mano: ${OFFICIAL_HOST}`);
    }
  };

  return (
    <PageTransition>
      <SEOHead
        title="E-Ticket República Dominicana: Guía Oficial de Migración y Aduanas"
        description="Cómo llenar gratis el e-Ticket oficial de entrada y salida de República Dominicana en eticket.gob.do: requisitos, pasos, código QR, menores y prevención de fraudes."
        keywords="e-ticket República Dominicana, eticket.gob.do, e-ticket migración, formulario de entrada, formulario de salida, código QR, aduanas rd"
        image="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&h=630&fit=crop"
        url="/e-ticket"
        breadcrumbs={[
          { name: "Inicio", url: "/" },
          { name: "E-Ticket Oficial", url: "/e-ticket" }
        ]}
        geo={{
          placename: "República Dominicana",
          region: "DO",
          latitude: 18.7357,
          longitude: -70.1627
        }}
        jsonLd={generateFAQSchema(ETICKET_FAQS)}
      />
      <div className="min-h-screen bg-background">
        <Header />

        <main>
          {/* Portada: texto a la izquierda; foto real con la dirección oficial montada encima */}
          <section className="border-b border-border bg-muted/30">
            <div className="container mx-auto grid gap-12 px-4 pb-14 pt-24 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:px-8 lg:pt-28">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  Guía Oficial de Viaje
                </div>
                <h1 className="font-display text-4xl font-bold leading-[1.02] tracking-[-0.03em] [text-wrap:balance] md:text-6xl text-foreground">E-Ticket de República Dominicana</h1>
                <p className="mt-5 max-w-[34rem] text-lg leading-relaxed text-muted-foreground [text-wrap:pretty]">El formulario digital, obligatorio y 100% gratuito, para entrar y salir del país. Reúne en un solo trámite los datos de Migración y Aduanas.</p>
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                  <OfficialSiteButton label="Completar mi e-Ticket gratis" />
                  <a href="#como-obtenerlo" className="text-sm font-semibold text-foreground underline decoration-primary/50 underline-offset-4 transition-colors hover:decoration-primary">Ver guía paso a paso ↗</a>
                </div>
              </div>

              <div className="relative pb-16 lg:pb-10">
                <figure className="overflow-hidden rounded-2xl border border-border/50 shadow-lg">
                  <img src="/images/eticket-punta-cana.jpg" alt="Playa de Punta Cana con palmeras y mar turquesa" width={960} height={720}
                    className="aspect-[4/3] w-full object-cover" />
                  <figcaption className="sr-only">Foto: Miltiadis Fragkidis</figcaption>
                </figure>
                <span className="absolute right-3 top-3 rounded-md bg-black/50 px-2 py-0.5 text-[10px] text-white/90 backdrop-blur-sm">Foto: Miltiadis Fragkidis</span>

                {/* Double-Bezel Card */}
                <div className="absolute -bottom-4 left-4 right-4 rounded-[1.75rem] border border-border/60 bg-muted/30 p-1.5 shadow-2xl shadow-primary/10 ring-1 ring-black/5 dark:ring-white/5 sm:left-8 sm:right-auto sm:w-[23rem] lg:-left-10">
                  <aside aria-labelledby="sitio-oficial" className="rounded-[calc(1.75rem-0.375rem)] border border-border/50 bg-card p-5 shadow-sm">
                    <h2 id="sitio-oficial" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      <ShieldCheck className="h-4 w-4" aria-hidden="true" /><span>Portal Oficial Verificado</span>
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">Dirección General de Migración</p>
                    <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/40 p-2">
                      <code className="min-w-0 truncate font-mono text-base font-bold tracking-tight text-foreground">{OFFICIAL_HOST}</code>
                      <Button variant="ghost" size="sm" className="shrink-0 h-8 gap-1.5 rounded-lg active:scale-[0.97]" onClick={copyUrl}>
                        {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                        <span className="text-xs">{copied ? "Copiada" : "Copiar"}</span>
                      </Button>
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">Comprueba siempre que el dominio termine en <strong className="text-foreground">.gob.do</strong>, exclusivo del gobierno dominicano.</p>
                  </aside>
                </div>
              </div>
            </div>

            <dl className="container mx-auto grid grid-cols-2 border-t border-border px-4 lg:grid-cols-4 lg:px-8">
              {keyFacts.map((f, i) => (
                <div key={f.label} className={`py-5 ${i % 2 ? "pl-5" : ""} ${i > 0 ? "lg:border-l lg:border-border lg:pl-5" : ""} ${i % 2 ? "border-l border-border" : ""}`}>
                  <dt className="text-sm text-muted-foreground">{f.label}</dt>
                  <dd className="mt-0.5 font-display text-lg font-semibold tabular-nums">{f.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="container mx-auto px-4 lg:px-8">
            {/* Aviso de fraude */}
            <p role="note" className="mt-10 border-l-4 border-red-600 bg-red-600/5 px-4 py-3 text-sm">
              <strong id="alerta-fraude" className="mr-1">El e-Ticket no se paga.</strong>
              <span>Hay sitios que cobran por un trámite que el gobierno ofrece gratis. Si te piden dinero, no es el sitio oficial.</span>
            </p>

            {/* Qué es + novedades */}
            <section aria-labelledby="que-es" className="grid gap-10 py-14 lg:grid-cols-2">
              <div>
                <h2 id="que-es" className="font-display text-3xl font-bold tracking-tight [text-wrap:balance]">¿Qué es el e-Ticket?</h2>
                <p className="mt-4 leading-relaxed">Es un formulario único que reúne la información que piden la Dirección General de Migración y la Dirección General de Aduanas. Todo pasajero, dominicano o extranjero, debe completarlo para entrar o salir del país.</p>
                <p className="mt-3 leading-relaxed text-muted-foreground">Sustituyó a los antiguos formularios en papel: está en vigor desde abril de 2021 y es obligatorio desde septiembre de 2021. Se basa en las leyes 285-04, 115-17, 72-02 y 226-06.</p>
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold">Novedades del nuevo portal</h2>
                <p className="mt-2 text-sm text-muted-foreground">Migración renovó el portal en eticket.gob.do. Ahora es más rápido:</p>
                <ul className="mt-4 divide-y divide-border border-y border-border">
                  {news.map((n) => (
                    <li key={n.text} className="flex items-start gap-3 py-3 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" /><span>{n.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Pasos y lo que hay que tener a mano */}
            <section id="como-obtenerlo" aria-labelledby="titulo-pasos" className="grid scroll-mt-24 gap-12 border-t border-border py-14 lg:grid-cols-[1.5fr_1fr]">
              <div>
                <h2 id="titulo-pasos" className="font-display text-3xl font-bold tracking-tight [text-wrap:balance]">Cómo obtenerlo en 5 pasos</h2>
                <p className="mt-2 text-muted-foreground">Se completa en línea, desde el celular o la computadora.</p>
                <ol className="mt-8">
                  {steps.map((s, i) => (
                    <li key={s.title} className="grid grid-cols-[3.5rem_1fr] gap-2 border-t border-border py-5 first:border-t-0 first:pt-0">
                      <span className="font-display text-4xl font-bold leading-none text-primary/30" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <h3 className="font-display text-lg font-bold">{s.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <aside aria-labelledby="titulo-lista" className="h-fit rounded-lg bg-muted/50 p-6 lg:sticky lg:top-24">
                <h2 id="titulo-lista" className="font-display text-xl font-bold">Ten esto a mano</h2>
                <p className="mt-1 text-sm text-muted-foreground">Con estos datos lo terminas de una sola vez.</p>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {checklist.map((c) => (
                    <li key={c.text} className="flex items-start gap-2.5">
                      <span className="mt-0.5 h-4 w-4 shrink-0 rounded border-2 border-primary/60" aria-hidden="true" /><span>{c.text}</span>
                    </li>
                  ))}
                </ul>
                <OfficialSiteButton label="Ir al portal oficial" size="default" className="mt-6 w-full" />
              </aside>
            </section>

            {/* Lo que debes saber */}
            <section aria-labelledby="debes-saber" className="border-t border-border py-14">
              <h2 id="debes-saber" className="font-display text-3xl font-bold tracking-tight [text-wrap:balance]">Lo que debes saber</h2>
              <div className="mt-8 grid gap-x-12 gap-y-8 md:grid-cols-2">
                {facts.map((f) => (
                  <article key={f.title}>
                    <h3 className="font-display text-lg font-bold">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
                  </article>
                ))}
              </div>
            </section>

            {/* Fraudes y ayuda */}
            <section aria-labelledby="titulo-fraudes" className="grid gap-12 border-t border-border py-14 lg:grid-cols-2">
              <div>
                <h2 id="titulo-fraudes" className="font-display text-2xl font-bold">Señales de un sitio falso</h2>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {fraudSigns.map((s) => (
                    <li key={s} className="flex items-start gap-2.5"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" /><span>{s}</span></li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold">Si necesitas ayuda</h2>
                <ul className="mt-4 space-y-2.5 text-sm">
                  <li><span>Soporte oficial de Migración:</span> <a href={`tel:+1${PHONE.replace(/-/g, "")}`} className="font-semibold text-primary hover:underline">{PHONE}</a></li>
                  <li><span>Correo:</span> <a href={`mailto:${EMAIL}`} className="font-semibold text-primary hover:underline">{EMAIL}</a></li>
                  <li><span>Tu aerolínea, tu agencia de viajes o la recepción de tu hotel suelen orientarte sin costo.</span></li>
                  <li><span>Si alguien lo llena por ti, que lo haga en el sitio oficial y delante de ti.</span></li>
                </ul>
                <p className="mt-5 text-xs text-muted-foreground">Descubre RD es una guía de viaje independiente: no tramita el e-Ticket ni cobra por él.</p>
              </div>
            </section>

            {/* Preguntas frecuentes */}
            <section aria-labelledby="titulo-faq" className="border-t border-border py-14">
              <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
                <div>
                  <h2 id="titulo-faq" className="font-display text-3xl font-bold tracking-tight [text-wrap:balance]">Preguntas frecuentes</h2>
                  <p className="mt-3 text-sm text-muted-foreground">Información revisada en noviembre de 2026. Confirma siempre los detalles en el portal oficial.</p>
                </div>
                <dl className="divide-y divide-border border-y border-border">
                  {ETICKET_FAQS.map((f) => (
                    <div key={f.question} className="grid gap-1 py-5 md:grid-cols-[minmax(0,15rem)_1fr] md:gap-8">
                      <dt className="font-display font-semibold [text-wrap:balance]">{f.question}</dt>
                      <dd className="text-sm leading-relaxed text-muted-foreground [text-wrap:pretty]">{f.answer}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>

            {/* Noticias sobre el e-Ticket */}
            {related.length > 0 && (
              <section aria-labelledby="noticias-eticket" className="border-t border-border py-14">
                <div className="flex items-end justify-between gap-4">
                  <h2 id="noticias-eticket" className="font-display text-3xl font-bold tracking-tight [text-wrap:balance]">Noticias sobre el e-Ticket</h2>
                  <Link to="/noticias" className="text-sm font-semibold text-primary hover:underline">Ver todas las noticias</Link>
                </div>
                <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((r) => (
                    <li key={r.id}>
                      <Link to={`/noticias/${r.slug}`} className="group block">
                        <div className="aspect-[16/10] overflow-hidden rounded-lg bg-muted">
                          {r.cover_url && <img src={r.cover_url} alt="" loading="lazy" width={400} height={250} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                        </div>
                        {r.published_at && <time dateTime={r.published_at} className="mt-3 block text-xs text-muted-foreground">{formatNewsDate(r.published_at)}</time>}
                        <h3 className="mt-1 line-clamp-3 font-display text-base font-bold leading-snug group-hover:text-primary">{r.title}</h3>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Cierre */}
          <section className="border-t border-border bg-muted/30">
            <div className="container mx-auto flex flex-col gap-5 px-4 py-12 md:flex-row md:items-center md:justify-between lg:px-8">
              <div>
                <h2 className="font-display text-2xl font-bold">Hazlo con tiempo y viaja tranquilo</h2>
                <p className="mt-1 text-muted-foreground">Gratis, en línea y en unos 15 minutos. Guarda el código QR en tu celular.</p>
              </div>
              <OfficialSiteButton label="Completar e-Ticket gratis" className="shrink-0" />
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
