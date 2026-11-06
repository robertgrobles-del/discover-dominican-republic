// /e-ticket: guía del e-Ticket migratorio de República Dominicana (nuevo portal eticket.gob.do).
// Cada texto es un nodo propio para que el traductor del sitio (src/i18n/auto) lo encuentre entero.
// Para buscadores y agentes de IA: el servidor entrega esta URL con metadatos y FAQPage (api/index.ts, render/e-ticket)
// y hay versión Markdown en /e-ticket.md. Si cambias datos aquí, cámbialos también en public/e-ticket.md.
import { useState } from "react";
import {
  AlertTriangle, ArrowLeftRight, BadgeCheck, BellRing, CalendarClock, Check, CheckCircle2, Clock, Copy, CreditCard,
  ExternalLink, FileCheck, Globe, Home, IdCard, Luggage, Mail, PencilLine, Phone, Plane, QrCode, Save, ShieldAlert,
  ShieldCheck, Ticket, UserRound, Users, Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";

const OFFICIAL_URL = "https://eticket.gob.do/";
const OFFICIAL_HOST = "eticket.gob.do";
const PHONE = "809-508-2555";
const EMAIL = "info@migracion.gob.do";

const keyFacts = [
  { icon: Wallet, label: "Costo", value: "Gratis" },
  { icon: Clock, label: "Tiempo", value: "Unos 15 minutos" },
  { icon: CalendarClock, label: "Cuándo", value: "De 72 a 24 horas antes" },
  { icon: QrCode, label: "Recibes", value: "Un QR por trayecto" },
];

const news = [
  { icon: UserRound, text: "Crea tu cuenta: tus datos quedan guardados para el próximo viaje." },
  { icon: Mail, text: "Recibe el e-Ticket en tu correo electrónico." },
  { icon: CheckCircle2, text: "Ya no hay formulario de salud y varios campos se simplificaron." },
  { icon: Save, text: "Guarda el formulario a medias y termínalo después." },
  { icon: ArrowLeftRight, text: "Crea el e-Ticket de salida a partir del de entrada." },
];

const steps = [
  { icon: Globe, title: "Entra al portal oficial", description: "Escribe tú la dirección eticket.gob.do en el navegador. No llegues desde anuncios ni buscadores patrocinados." },
  { icon: UserRound, title: "Inicia sesión o continúa como invitado", description: "Con una cuenta tus datos quedan guardados. Elige «Nuevo e-Ticket» o crea uno a partir de un e-Ticket anterior." },
  { icon: FileCheck, title: "Completa tus datos", description: "Pasaporte, vuelo, escalas, dirección donde te alojarás y la declaración de aduanas. Puedes guardarlo y seguir después." },
  { icon: QrCode, title: "Guarda tu código QR", description: "Al enviarlo recibes el QR, también por correo. Descarga el PDF o haz una captura de pantalla." },
  { icon: BadgeCheck, title: "Preséntalo al viajar", description: "Muéstralo desde el celular o impreso en el mostrador de la aerolínea y en migración." },
];

const checklist = [
  { icon: IdCard, text: "Pasaporte de cada viajero" },
  { icon: Plane, text: "Número de vuelo, fecha y escalas" },
  { icon: Home, text: "Dirección del alojamiento en República Dominicana" },
  { icon: Luggage, text: "Si llevas más de 10.000 dólares en efectivo, debes declararlo en aduanas" },
  { icon: Mail, text: "Un correo electrónico para recibir el QR" },
];

const facts = [
  { icon: ArrowLeftRight, title: "Entrada y salida, por separado", text: "Cada trayecto tiene su propio e-Ticket y su propio QR. Muchos viajeros solo llenan el de llegada y deben hacer el de salida deprisa en el aeropuerto. En el nuevo portal, el de salida se crea en un momento a partir del de entrada." },
  { icon: PencilLine, title: "¿Te equivocaste en un dato?", text: "Antes del día del vuelo puedes corregirlo desde tu cuenta o con el código de solicitud que recibes al empezar. Si ya es el día del viaje, lo más rápido es llenar uno nuevo." },
  { icon: Users, title: "Viajes en familia y menores", text: "En un mismo trámite puedes incluir a tus acompañantes, incluidos bebés y niños. La declaración de aduanas solo la firman los mayores de 18 años." },
  { icon: CreditCard, title: "No sustituye la Tarjeta de Turista", text: "La Tarjeta de Turista (10 dólares) es aparte, aunque en la mayoría de los vuelos comerciales ya viene incluida en el precio del boleto." },
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

function OfficialSiteButton({ label, size = "lg", className = "" }: { label: string; size?: "lg" | "default"; className?: string }) {
  return (
    <Button size={size} className={`gap-2 rounded-xl font-bold ${className}`} asChild>
      <a href={OFFICIAL_URL} target="_blank" rel="noopener noreferrer">
        <span>{label}</span>
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">(se abre en otra pestaña)</span>
      </a>
    </Button>
  );
}

export default function ETicket() {
  const [copied, setCopied] = useState(false);
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
        title="E-Ticket República Dominicana 2026: guía del nuevo portal | Descubre RD"
        description="Cómo hacer gratis el e-Ticket de entrada y salida de República Dominicana en el nuevo portal eticket.gob.do: pasos, novedades, QR, menores y cómo evitar fraudes."
        keywords="e-ticket República Dominicana, eticket.gob.do, e-ticket migración, formulario de entrada, formulario de salida, código QR"
        url="/e-ticket"
        breadcrumbs={[]}
      />
      <div className="min-h-screen bg-background">
        <Header />

        <main>
          {/* Portada */}
          <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/15 via-background to-background">
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
            <div className="container relative mx-auto grid gap-10 px-4 pb-10 pt-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8 lg:pt-28">
              <div>
                <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-1.5 text-sm font-semibold text-primary">
                  <Ticket className="h-4 w-4" aria-hidden="true" /><span>Guía actualizada · Nuevo portal oficial</span>
                </p>
                <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">E-Ticket de República Dominicana</h1>
                <p className="mt-4 max-w-xl text-lg text-muted-foreground">El formulario digital, obligatorio y gratuito, para entrar y salir del país. Reúne en un solo trámite los datos de Migración y Aduanas.</p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <OfficialSiteButton label="Completar mi e-Ticket gratis" />
                  <Button variant="outline" size="lg" className="rounded-xl" asChild><a href="#como-obtenerlo">Ver cómo se hace</a></Button>
                </div>
              </div>

              <aside aria-labelledby="sitio-oficial" className="rounded-3xl border border-emerald-600/30 bg-card p-6 shadow-xl shadow-emerald-900/5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600/15 text-emerald-700 dark:text-emerald-400"><ShieldCheck className="h-6 w-6" aria-hidden="true" /></span>
                  <div>
                    <h2 id="sitio-oficial" className="font-display text-lg font-bold">Portal oficial</h2>
                    <p className="text-sm text-muted-foreground">Dirección General de Migración</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-muted/50 p-2 pl-4">
                  <code className="min-w-0 flex-1 truncate font-mono text-base font-semibold text-primary">{OFFICIAL_HOST}</code>
                  <Button variant="outline" size="sm" className="shrink-0 gap-1.5 rounded-lg" onClick={copyUrl}>
                    {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    <span>{copied ? "Copiada" : "Copiar"}</span>
                  </Button>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Comprueba que la dirección termine en .gob.do, el dominio del gobierno dominicano.</p>
                <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
                  <a href={`tel:+1${PHONE.replace(/-/g, "")}`} className="flex items-center gap-2 text-foreground hover:text-primary"><Phone className="h-4 w-4 text-primary" aria-hidden="true" />{PHONE}</a>
                  <a href={`mailto:${EMAIL}`} className="flex items-center gap-2 text-foreground hover:text-primary"><Mail className="h-4 w-4 text-primary" aria-hidden="true" />{EMAIL}</a>
                </div>
              </aside>
            </div>

            <dl className="container relative mx-auto grid grid-cols-2 gap-3 px-4 pb-10 lg:grid-cols-4 lg:px-8">
              {keyFacts.map((f) => (
                <div key={f.label} className="flex items-center gap-3 rounded-2xl border border-border bg-card/80 p-4 backdrop-blur">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><f.icon className="h-5 w-5" aria-hidden="true" /></span>
                  <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground">{f.label}</dt>
                    <dd className="font-display font-bold leading-tight">{f.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>

          {/* Aviso de fraude */}
          <section aria-labelledby="alerta-fraude" className="container mx-auto px-4 pt-8 lg:px-8">
            <div role="note" className="flex flex-col gap-3 rounded-2xl border border-red-600/30 bg-red-600/10 p-5 sm:flex-row sm:items-center">
              <ShieldAlert className="h-7 w-7 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
              <div className="text-sm">
                <strong id="alerta-fraude" className="font-display text-base">El e-Ticket no se paga.</strong>{" "}
                <span>Hay sitios que cobran por un trámite que el gobierno ofrece gratis. Si te piden dinero, no es el sitio oficial.</span>
              </div>
            </div>
          </section>

          {/* Qué es + novedades */}
          <section aria-labelledby="que-es" className="container mx-auto grid gap-8 px-4 py-14 lg:grid-cols-2 lg:px-8">
            <div>
              <h2 id="que-es" className="font-display text-3xl font-bold">¿Qué es el e-Ticket?</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">Es un formulario único que reúne la información que piden la Dirección General de Migración y la Dirección General de Aduanas. Todo pasajero, dominicano o extranjero, debe completarlo para entrar o salir del país.</p>
              <p className="mt-3 leading-relaxed text-muted-foreground">Sustituyó a los antiguos formularios en papel: está en vigor desde abril de 2021 y es obligatorio desde septiembre de 2021. Se basa en las leyes 285-04, 115-17, 72-02 y 226-06.</p>
            </div>
            <div className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 to-transparent p-6">
              <h2 className="flex items-center gap-2 font-display text-2xl font-bold"><BellRing className="h-6 w-6 text-primary" aria-hidden="true" /><span>Novedades del nuevo portal</span></h2>
              <p className="mt-2 text-sm text-muted-foreground">Migración renovó el portal en eticket.gob.do. Ahora es más rápido:</p>
              <ul className="mt-4 space-y-3">
                {news.map((n) => (
                  <li key={n.text} className="flex items-start gap-3 text-sm">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card text-primary shadow-sm"><n.icon className="h-4 w-4" aria-hidden="true" /></span>
                    <span className="pt-1.5">{n.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Pasos y lo que hay que tener a mano */}
          <section id="como-obtenerlo" aria-labelledby="titulo-pasos" className="scroll-mt-24 border-y border-border bg-muted/30">
            <div className="container mx-auto grid gap-10 px-4 py-14 lg:grid-cols-[1.4fr_1fr] lg:px-8">
              <div>
                <h2 id="titulo-pasos" className="font-display text-3xl font-bold">Cómo obtenerlo en 5 pasos</h2>
                <p className="mt-2 text-muted-foreground">Se completa en línea, desde el celular o la computadora.</p>
                <ol className="mt-8">
                  {steps.map((s, i) => (
                    <li key={s.title} className="relative flex gap-4 pb-6 last:pb-0">
                      {i < steps.length - 1 && <span className="absolute left-5 top-11 h-[calc(100%-2.75rem)] w-px bg-primary/30" aria-hidden="true" />}
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-display font-bold text-primary-foreground" aria-hidden="true">{i + 1}</span>
                      <div className="flex-1 rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <h3 className="flex items-center gap-2 font-display text-lg font-bold"><s.icon className="h-5 w-5 text-primary" aria-hidden="true" /><span>{s.title}</span></h3>
                        <p className="mt-1.5 text-sm text-muted-foreground">{s.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <aside aria-labelledby="titulo-lista" className="h-fit rounded-3xl border border-border bg-card p-6 shadow-sm lg:sticky lg:top-24">
                <h2 id="titulo-lista" className="font-display text-xl font-bold">Ten esto a mano</h2>
                <p className="mt-1 text-sm text-muted-foreground">Con estos datos lo terminas de una sola vez.</p>
                <ul className="mt-5 space-y-3">
                  {checklist.map((c) => (
                    <li key={c.text} className="flex items-start gap-3 text-sm">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><c.icon className="h-4 w-4" aria-hidden="true" /></span>
                      <span className="pt-1.5">{c.text}</span>
                    </li>
                  ))}
                </ul>
                <OfficialSiteButton label="Ir al portal oficial" size="default" className="mt-6 w-full" />
              </aside>
            </div>
          </section>

          {/* Lo que debes saber */}
          <section aria-labelledby="debes-saber" className="container mx-auto px-4 py-14 lg:px-8">
            <h2 id="debes-saber" className="font-display text-3xl font-bold">Lo que debes saber</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {facts.map((f) => (
                <article key={f.title} className="flex gap-4 rounded-2xl border border-border bg-card p-6">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><f.icon className="h-5 w-5" aria-hidden="true" /></span>
                  <div>
                    <h3 className="font-display text-lg font-bold">{f.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Fraudes y ayuda */}
          <section aria-labelledby="titulo-fraudes" className="border-y border-border bg-muted/30">
            <div className="container mx-auto grid gap-6 px-4 py-14 lg:grid-cols-2 lg:px-8">
              <div className="rounded-3xl border border-red-600/25 bg-card p-6">
                <h2 id="titulo-fraudes" className="flex items-center gap-2 font-display text-2xl font-bold"><AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" /><span>Señales de un sitio falso</span></h2>
                <ul className="mt-5 space-y-3">
                  {fraudSigns.map((s) => (
                    <li key={s} className="flex items-start gap-3 text-sm"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" /><span>{s}</span></li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-emerald-600/25 bg-card p-6">
                <h2 className="flex items-center gap-2 font-display text-2xl font-bold"><CheckCircle2 className="h-6 w-6 text-emerald-700 dark:text-emerald-400" aria-hidden="true" /><span>Si necesitas ayuda</span></h2>
                <ul className="mt-5 space-y-3 text-sm">
                  <li className="flex items-start gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" /><span>Soporte oficial de Migración:</span> <a href={`tel:+1${PHONE.replace(/-/g, "")}`} className="font-semibold text-primary hover:underline">{PHONE}</a></li>
                  <li className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" /><span>Correo:</span> <a href={`mailto:${EMAIL}`} className="font-semibold text-primary hover:underline">{EMAIL}</a></li>
                  <li className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" /><span>Tu aerolínea, tu agencia de viajes o la recepción de tu hotel suelen orientarte sin costo.</span></li>
                  <li className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" /><span>Si alguien lo llena por ti, que lo haga en el sitio oficial y delante de ti.</span></li>
                </ul>
                <p className="mt-5 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">Descubre RD es una guía de viaje independiente: no tramita el e-Ticket ni cobra por él.</p>
              </div>
            </div>
          </section>

          {/* Preguntas frecuentes */}
          <section aria-labelledby="titulo-faq" className="container mx-auto max-w-3xl px-4 py-14 lg:px-8">
            <h2 id="titulo-faq" className="text-center font-display text-3xl font-bold">Preguntas frecuentes</h2>
            <Accordion type="single" collapsible className="mt-8 space-y-3">
              {ETICKET_FAQS.map((f, i) => (
                <AccordionItem key={f.question} value={`faq-${i}`} className="rounded-2xl border border-border bg-card px-5">
                  <AccordionTrigger className="text-left font-display text-base font-bold hover:no-underline md:text-lg">{f.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <p className="mt-6 text-center text-xs text-muted-foreground">Información revisada en noviembre de 2026. Confirma siempre los detalles en el portal oficial.</p>
          </section>

          {/* Cierre */}
          <section className="container mx-auto px-4 pb-16 lg:px-8">
            <div className="flex flex-col items-center gap-5 rounded-3xl bg-primary p-8 text-center text-primary-foreground md:flex-row md:justify-between md:text-left">
              <div>
                <h2 className="font-display text-2xl font-bold">Hazlo con tiempo y viaja tranquilo</h2>
                <p className="mt-1 opacity-90">Gratis, en línea y en unos 15 minutos. Guarda el código QR en tu celular.</p>
              </div>
              <Button size="lg" variant="secondary" className="shrink-0 gap-2 rounded-xl font-bold" asChild>
                <a href={OFFICIAL_URL} target="_blank" rel="noopener noreferrer"><span>Completar e-Ticket gratis</span><ExternalLink className="h-4 w-4" aria-hidden="true" /></a>
              </Button>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
