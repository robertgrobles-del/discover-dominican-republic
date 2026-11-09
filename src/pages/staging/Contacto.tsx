// /contacto: formulario (guarda en Turso, POST /contact → contact_messages) y correo directo.
import { Honeypot } from "@/components/forms/Honeypot";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Loader2, Mail } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";
import { LEGAL } from "./LegalPage";

const TOPICS = ["Información turística", "Publicidad y patrocinios", "Registrar mi negocio", "Prensa y alianzas", "Corrección de un dato", "Otro"];
const REASONS = [
  { title: "Publicidad y patrocinios", text: "Espacios publicitarios, posts patrocinados y campañas para tu marca." },
  { title: "Negocios turísticos", text: "Hoteles, restaurantes, tours y comercios que quieren aparecer en el portal." },
  { title: "Prensa y alianzas", text: "Medios, instituciones y creadores de contenido sobre República Dominicana." },
  { title: "Correcciones", text: "¿Viste un dato desactualizado o incorrecto? Avísanos y lo revisamos." },
];

export default function Contacto() {
  const [f, setF] = useState({ name: "", email: "", subject: TOPICS[0], message: "" });
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setState("sending");
    try {
      await fetchApi("/contact", { method: "POST", body: JSON.stringify(f) });
      setState("sent");
    } catch (err) {
      setState("idle");
      setError((err instanceof HttpError ? (err.details as { error?: { message?: string } } | null)?.error?.message : null) ?? "No se pudo enviar. Inténtalo de nuevo o escríbenos por correo.");
    }
  };

  return (
    <>
      <SEOHead
        title="Contacto | Descubre RD"
        description={`Escríbenos para publicidad, registrar tu negocio, prensa o correcciones sobre turismo en República Dominicana. Correo: ${LEGAL.email}.`}
        url="/contacto"
        keywords="contacto descubre rd, turismo republica dominicana contacto, prensa turismo rd, publicidad turismo"
        geo={{ placename: "Santo Domingo, República Dominicana", region: "DO" }}
        breadcrumbs={[
          { name: "Inicio", url: "/" },
          { name: "Contacto", url: "/contacto" },
        ]}
      />
      <Header />
      <main className="container mx-auto px-4 pb-20 pt-24 lg:px-8 lg:pt-28">
        <nav aria-label="Migas de pan" className="mb-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Inicio</Link> <span aria-hidden="true">/</span> <span aria-current="page">Contacto</span>
        </nav>

        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Atención y Soporte Oficial
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight [text-wrap:balance] md:text-5xl text-foreground">Hablemos</h1>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-muted-foreground">¿Tienes preguntas sobre turismo, deseas colaborar o promocionar tu empresa? Nuestro equipo responde en menos de 24 horas laborables.</p>

            <a href={`mailto:${LEGAL.email}`} className="group mt-8 inline-flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 px-5 py-3 text-base font-semibold text-foreground transition-all hover:border-primary/50 hover:bg-muted/60">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                <Mail className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>{LEGAL.email}</span>
            </a>

            <dl className="mt-10 grid gap-5 sm:grid-cols-2">
              {REASONS.map((r) => (
                <div key={r.title} className="rounded-xl border border-border/40 bg-card/60 p-4 shadow-sm">
                  <dt className="font-semibold text-foreground text-sm">{r.title}</dt>
                  <dd className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{r.text}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 text-xs text-muted-foreground">¿Tienes un negocio turístico en RD? Puedes registrarlo gratis desde <Link to="/registra-tu-negocio" className="font-semibold text-primary hover:underline">Registra tu negocio</Link>.</p>
          </div>

          {/* Double-Bezel Architecture */}
          <div className="rounded-[2rem] border border-border/60 bg-muted/20 p-2 sm:p-2.5 shadow-xl shadow-black/5 ring-1 ring-black/5 dark:ring-white/5">
            <section aria-labelledby="form-contacto" className="rounded-[calc(2rem-0.5rem)] border border-border/50 bg-card p-6 sm:p-9 shadow-sm">
              <h2 id="form-contacto" className="font-display text-2xl font-bold text-foreground">Envíanos un mensaje</h2>
              <p className="mt-1.5 text-xs text-muted-foreground">Completa los campos y te contactaremos de vuelta.</p>

              {state === "sent" ? (
                <div role="status" className="mt-8 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">✓</div>
                  <p className="font-display text-lg font-bold text-foreground">¡Mensaje recibido con éxito!</p>
                  <p className="text-sm text-muted-foreground">Hemos recibido tu consulta y responderemos a <strong className="text-foreground">{f.email}</strong> en breve.</p>
                  <Button variant="outline" className="mt-4 rounded-full" onClick={() => { setF({ name: "", email: "", subject: TOPICS[0], message: "" }); setState("idle"); }}>
                    Enviar otro mensaje
                  </Button>
                </div>
              ) : (
                <form onSubmit={submit} className="mt-6 space-y-4">
                  <Honeypot />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="c-name" className="text-xs font-medium">Nombre completo</Label>
                      <Input id="c-name" required maxLength={120} autoComplete="name" placeholder="Tu nombre" value={f.name} onChange={set("name")} className="rounded-xl border-border/60 bg-background/50 h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="c-email" className="text-xs font-medium">Correo electrónico</Label>
                      <Input id="c-email" type="email" required autoComplete="email" placeholder="tu@correo.com" value={f.email} onChange={set("email")} className="rounded-xl border-border/60 bg-background/50 h-11" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="c-subject" className="text-xs font-medium">Motivo del contacto</Label>
                    <select id="c-subject" value={f.subject} onChange={set("subject")} className="flex h-11 w-full rounded-xl border border-border/60 bg-background/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="c-msg" className="text-xs font-medium">Tu mensaje</Label>
                    <Textarea id="c-msg" required minLength={10} maxLength={3000} rows={5} placeholder="Cuéntanos en qué podemos ayudarte..." value={f.message} onChange={set("message")} className="rounded-xl border-border/60 bg-background/50 text-sm leading-relaxed" />
                  </div>

                  {error && <p role="alert" className="text-xs font-medium text-destructive">{error}</p>}

                  <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500/80" />
                    <span>Datos protegidos. Cero spam. Consulta nuestra <Link to="/privacidad" className="underline hover:text-foreground">Política de Privacidad</Link>.</span>
                  </div>

                  {/* Button-in-Button Nested CTA Architecture */}
                  <button
                    type="submit"
                    disabled={state === "sending"}
                    className="group relative mt-2 inline-flex w-full items-center justify-between rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/95 active:scale-[0.99] disabled:opacity-50 sm:w-auto sm:min-w-[200px]"
                  >
                    <span>{state === "sending" ? "Enviando..." : "Enviar mensaje"}</span>
                    <span className="ml-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-x-0.5">
                      {state === "sending" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <span className="text-xs">↗</span>
                      )}
                    </span>
                  </button>
                </form>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
