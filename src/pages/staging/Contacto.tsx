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

        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight [text-wrap:balance] md:text-5xl">Hablemos</h1>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-muted-foreground">Respondemos en un plazo de uno a dos días laborables.</p>

            <a href={`mailto:${LEGAL.email}`} className="mt-8 inline-flex items-center gap-3 border-b-2 border-primary/30 pb-1 text-lg font-semibold transition-colors hover:border-primary">
              <Mail className="h-5 w-5 text-primary" aria-hidden="true" />{LEGAL.email}
            </a>

            <dl className="mt-10 grid gap-6 sm:grid-cols-2">
              {REASONS.map((r) => (
                <div key={r.title}>
                  <dt className="font-semibold">{r.title}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.text}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-10 text-sm text-muted-foreground">¿Tienes un negocio turístico? También puedes registrarlo directamente desde el pie de página.</p>
          </div>

          <section aria-labelledby="form-contacto" className="rounded-md bg-muted/40 p-6 sm:p-8">
            <h2 id="form-contacto" className="font-display text-2xl font-bold">Envíanos un mensaje</h2>
            {state === "sent" ? (
              <div role="status" className="mt-6 space-y-3">
                <p className="font-semibold">Mensaje recibido.</p>
                <p className="text-sm text-muted-foreground">Te responderemos a {f.email}.</p>
                <Button variant="outline" onClick={() => { setF({ name: "", email: "", subject: TOPICS[0], message: "" }); setState("idle"); }}>Enviar otro mensaje</Button>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-6 space-y-4"><Honeypot />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5"><Label htmlFor="c-name">Nombre</Label><Input id="c-name" required maxLength={120} autoComplete="name" value={f.name} onChange={set("name")} /></div>
                  <div className="space-y-1.5"><Label htmlFor="c-email">Correo electrónico</Label><Input id="c-email" type="email" required autoComplete="email" value={f.email} onChange={set("email")} /></div>
                </div>
                <div className="space-y-1.5"><Label htmlFor="c-subject">Asunto</Label>
                  <select id="c-subject" value={f.subject} onChange={set("subject")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    {TOPICS.map((t) => <option key={t}>{t}</option>)}
                  </select></div>
                <div className="space-y-1.5"><Label htmlFor="c-msg">Mensaje</Label><Textarea id="c-msg" required minLength={10} maxLength={3000} rows={6} value={f.message} onChange={set("message")} /></div>
                {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                <p className="text-xs text-muted-foreground">Usaremos tus datos solo para responderte. Más información en la <Link to="/privacidad" className="underline">Política de privacidad</Link>.</p>
                <Button type="submit" disabled={state === "sending"} className="w-full sm:w-auto">
                  {state === "sending" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enviar mensaje
                </Button>
              </form>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
