import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle, BadgeCheck, Check, CheckCircle2, Clock, Copy, ExternalLink, FileCheck, Globe, Home, IdCard,
  Luggage, Plane, QrCode, ShieldAlert, ShieldCheck, Ticket, Users, Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { useTranslation } from "@/i18n";

const OFFICIAL_URL = "https://eticket.migracion.gob.do";
const OFFICIAL_HOST = "eticket.migracion.gob.do";

/** Lo esencial de un vistazo, antes de leer nada más. */
const keyFacts = [
  { icon: Wallet, label: "Costo", value: "Gratis" },
  { icon: Clock, label: "Tiempo", value: "15–20 min" },
  { icon: Plane, label: "Cuándo", value: "Al entrar y al salir" },
  { icon: QrCode, label: "Recibes", value: "Un código QR" },
];

const steps = [
  { title: "Entra al sitio oficial", description: `Escribe tú la dirección ${OFFICIAL_HOST} en el navegador. No llegues desde anuncios ni buscadores patrocinados.`, icon: Globe },
  { title: "Completa el formulario", description: "Datos personales, vuelo, dirección donde te alojarás y la declaración de aduanas.", icon: FileCheck },
  { title: "Guarda tu código QR", description: "Al terminar se genera el QR. Descárgalo o haz una captura: es tu comprobante.", icon: QrCode },
  { title: "Preséntalo al viajar", description: "Muéstralo desde el celular o impreso en el mostrador de la aerolínea y en migración.", icon: BadgeCheck },
];

const checklist = [
  { icon: IdCard, text: "Pasaporte de cada viajero" },
  { icon: Plane, text: "Número de vuelo y fecha de llegada o salida" },
  { icon: Home, text: "Dirección del alojamiento en República Dominicana" },
  { icon: Luggage, text: "Lo que debas declarar en aduanas (efectivo, mercancías)" },
];

const fraudSigns = [
  "Te cobran por tramitarlo o por «agilizarlo».",
  "La dirección no termina en .gob.do.",
  "Llegaste desde un anuncio que promete gestionarlo por ti.",
  "Te piden los datos de tu tarjeta.",
];

const faqs = [
  { question: "¿Cuándo debo completar el e-Ticket?", answer: "Antes de viajar. Lo recomendable es hacerlo unos días antes del vuelo para llegar al aeropuerto con el código QR ya guardado." },
  { question: "¿Necesito imprimirlo?", answer: "No es obligatorio: puedes mostrar el código QR desde el celular. Una copia impresa o una captura de pantalla sirve de respaldo si te quedas sin batería o sin conexión." },
  { question: "¿Qué pasa si llego sin e-Ticket?", answer: "Tendrás que completarlo en el aeropuerto antes de pasar por migración, lo que puede retrasarte. Hazlo con tiempo desde casa." },
  { question: "¿Se llena uno por persona o por familia?", answer: "El formulario permite incluir a tus acompañantes. Confirma en el sitio oficial cuántas personas admite y si los menores van en el formulario del adulto con quien viajan." },
  { question: "¿Sirve el mismo para la entrada y la salida?", answer: "Se necesita para llegar y también para salir del país. Revisa en el sitio oficial si puedes registrar ambos trayectos a la vez." },
];

// El contenido se pinta visible desde el principio: es información que hay que poder leer (e imprimir o
// capturar entera) sin depender de que una animación de entrada llegue a dispararse al hacer scroll.
const fadeUp = { initial: false } as const;

/** Botón al sitio oficial: el único destino de acción de toda la página. */
function OfficialSiteButton({ label, size = "lg", className = "" }: { label: string; size?: "lg" | "default"; className?: string }) {
  return (
    <Button size={size} className={`gap-2 rounded-xl font-bold ${className}`} asChild>
      <a href={OFFICIAL_URL} target="_blank" rel="noopener noreferrer">
        {label}
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only"> (se abre en otra pestaña)</span>
      </a>
    </Button>
  );
}

export default function ETicket() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(OFFICIAL_URL);
      setCopied(true);
      toast.success("Dirección oficial copiada");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("No se pudo copiar. Escríbela a mano: " + OFFICIAL_HOST);
    }
  };

  return (
    <PageTransition>
      <SEOHead
        title={t("logistica.eTicket") || "Guía del e-Ticket de Entrada | Turismo RD"}
        description={t("logistica.eTicketDesc") || "Todo sobre el e-Ticket de República Dominicana: cómo obtenerlo gratis en el sitio oficial, qué necesitas y cómo evitar fraudes."}
        keywords="e-ticket, República Dominicana, migración, entrada, formulario, turismo"
      />
      <div className="min-h-screen bg-background">
        <Header />

        <main>
          {/* Portada: qué es, que es gratis y dónde se hace */}
          <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/10 via-background to-background">
            <div className="container mx-auto grid gap-10 px-4 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8 lg:py-20">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-1.5 text-sm font-semibold text-primary">
                  <Ticket className="h-4 w-4" aria-hidden="true" />
                  {t("logistica.badge") || "Requisito de entrada y salida"}
                </p>
                <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
                  {t("logistica.eTicket") || "Guía del e-Ticket"}
                </h1>
                <p className="mt-4 max-w-xl text-lg text-muted-foreground">
                  {t("logistica.eTicketDesc") || "El e-Ticket es el formulario digital, obligatorio y gratuito, que todo viajero completa para entrar y salir de República Dominicana."}
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <OfficialSiteButton label="Completar mi e-Ticket gratis" />
                  <Button variant="outline" size="lg" className="rounded-xl" asChild>
                    <a href="#como-obtenerlo">Ver cómo se hace</a>
                  </Button>
                </div>
              </motion.div>

              {/* La dirección oficial, para copiarla sin pasar por un buscador */}
              <motion.aside
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                aria-labelledby="sitio-oficial"
                className="rounded-3xl border border-emerald-600/30 bg-card p-6 shadow-lg shadow-emerald-900/5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600/15 text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 id="sitio-oficial" className="font-display text-lg font-bold">El único sitio oficial</h2>
                    <p className="text-sm text-muted-foreground">Dirección General de Migración</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-muted/50 p-2 pl-4">
                  <code className="min-w-0 flex-1 truncate font-mono text-sm font-semibold text-primary">{OFFICIAL_HOST}</code>
                  <Button variant="outline" size="sm" className="shrink-0 gap-1.5 rounded-lg" onClick={copyUrl}>
                    {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    {copied ? "Copiada" : "Copiar"}
                  </Button>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Comprueba siempre que la dirección termine en <strong className="text-foreground">.gob.do</strong>, el dominio del gobierno dominicano.
                </p>
              </motion.aside>
            </div>

            <dl className="container mx-auto grid grid-cols-2 gap-3 px-4 pb-10 lg:grid-cols-4 lg:px-8">
              {keyFacts.map((fact) => (
                <div key={fact.label} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                  <fact.icon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground">{fact.label}</dt>
                    <dd className="truncate font-display font-bold">{fact.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>

          {/* Aviso de fraude: corto y arriba, antes de los pasos */}
          <section aria-labelledby="alerta-fraude" className="container mx-auto px-4 pt-8 lg:px-8">
            <div role="note" className="flex flex-col gap-3 rounded-2xl border border-red-600/30 bg-red-600/10 p-5 sm:flex-row sm:items-center">
              <ShieldAlert className="h-7 w-7 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
              <p className="text-sm text-foreground">
                <strong id="alerta-fraude" className="font-display text-base">El e-Ticket no se paga.</strong>{" "}
                Hay sitios que cobran por un trámite que el gobierno ofrece gratis. Si te piden dinero, no es el sitio oficial.
              </p>
            </div>
          </section>

          {/* Pasos y lo que hay que tener a mano */}
          <section id="como-obtenerlo" aria-labelledby="titulo-pasos" className="container mx-auto scroll-mt-24 px-4 py-14 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <motion.div {...fadeUp}>
                  <h2 id="titulo-pasos" className="font-display text-3xl font-bold">Cómo obtenerlo en 4 pasos</h2>
                  <p className="mt-2 text-muted-foreground">Se completa en línea, desde el celular o la computadora.</p>
                </motion.div>
                <ol className="mt-8 space-y-0">
                  {steps.map((step, index) => (
                    <motion.li key={step.title} {...fadeUp} transition={{ delay: index * 0.06 }} className="relative flex gap-4 pb-8 last:pb-0">
                      {/* La línea une cada paso con el siguiente */}
                      {index < steps.length - 1 && <span className="absolute left-5 top-11 h-[calc(100%-2.75rem)] w-px bg-border" aria-hidden="true" />}
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-display font-bold text-primary-foreground" aria-hidden="true">{index + 1}</span>
                      <div className="flex-1 rounded-2xl border border-border bg-card p-5">
                        <h3 className="flex items-center gap-2 font-display text-lg font-bold">
                          <step.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                          <span className="sr-only">Paso {index + 1}: </span>{step.title}
                        </h3>
                        <p className="mt-1.5 text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </motion.li>
                  ))}
                </ol>
              </div>

              <motion.aside {...fadeUp} aria-labelledby="titulo-lista" className="h-fit rounded-3xl border border-border bg-muted/40 p-6 lg:sticky lg:top-24">
                <h2 id="titulo-lista" className="font-display text-xl font-bold">Ten esto a mano</h2>
                <p className="mt-1 text-sm text-muted-foreground">Con estos datos lo terminas de una sola vez.</p>
                <ul className="mt-5 space-y-3">
                  {checklist.map((item) => (
                    <li key={item.text} className="flex items-start gap-3 text-sm">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card text-primary"><item.icon className="h-4 w-4" aria-hidden="true" /></span>
                      <span className="pt-1.5">{item.text}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-start gap-2 rounded-xl bg-card p-3 text-sm text-muted-foreground">
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <p>¿Viajas en grupo? El formulario permite añadir acompañantes; ten los datos de todos.</p>
                </div>
                <OfficialSiteButton label="Ir al sitio oficial" size="default" className="mt-5 w-full" />
              </motion.aside>
            </div>
          </section>

          {/* Fraudes: cómo reconocerlos y qué hacer */}
          <section aria-labelledby="titulo-fraudes" className="border-y border-border bg-muted/30">
            <div className="container mx-auto grid gap-8 px-4 py-14 lg:grid-cols-2 lg:px-8">
              <motion.div {...fadeUp} className="rounded-3xl border border-red-600/25 bg-card p-6">
                <h2 id="titulo-fraudes" className="flex items-center gap-2 font-display text-2xl font-bold">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" /> Señales de un sitio falso
                </h2>
                <ul className="mt-5 space-y-3">
                  {fraudSigns.map((sign) => (
                    <li key={sign} className="flex items-start gap-3 text-sm">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                      <span>{sign}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div {...fadeUp} transition={{ delay: 0.08 }} className="rounded-3xl border border-emerald-600/25 bg-card p-6">
                <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
                  <CheckCircle2 className="h-6 w-6 text-emerald-700 dark:text-emerald-400" aria-hidden="true" /> Si necesitas ayuda
                </h2>
                <ul className="mt-5 space-y-3 text-sm">
                  <li className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" /><span>Pídesela a tu aerolínea, a tu agencia de viajes o a la recepción de tu hotel: suelen orientarte sin costo.</span></li>
                  <li className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" /><span>Si alguien lo llena por ti, que lo haga en el sitio oficial y delante de ti.</span></li>
                  <li className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" /><span>En el aeropuerto puedes completarlo antes de migración si no lo hiciste, aunque con espera.</span></li>
                </ul>
                <p className="mt-5 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
                  Descubre RD es una guía de viaje independiente: no tramita el e-Ticket ni cobra por él.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Preguntas frecuentes */}
          <section aria-labelledby="titulo-faq" className="container mx-auto max-w-3xl px-4 py-14 lg:px-8">
            <motion.h2 {...fadeUp} id="titulo-faq" className="text-center font-display text-3xl font-bold">Preguntas frecuentes</motion.h2>
            <Accordion type="single" collapsible className="mt-8 space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`faq-${index}`} className="rounded-2xl border border-border bg-card px-5">
                  <AccordionTrigger className="text-left font-display font-bold hover:no-underline">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Cierre */}
          <section className="container mx-auto px-4 pb-16 lg:px-8">
            <div className="flex flex-col items-center gap-5 rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/15 to-primary/5 p-8 text-center md:flex-row md:justify-between md:text-left">
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
