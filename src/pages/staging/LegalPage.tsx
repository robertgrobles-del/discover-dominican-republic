// Páginas legales de staging (Privacidad y Términos). Describen lo que este sitio hace de verdad: formularios que
// guarda (boletín, sorteo, registro de negocios), dónde (Turso, Vercel) y qué cookies usa (solo la de sesión del panel).
// Datos de contacto y titular en LEGAL: cambiarlos aquí los cambia en las dos páginas.
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";

export const LEGAL = {
  owner: "Descubre RD",
  site: "www.descubrerepdom.com",
  email: "descubrerepublicadominicana@gmail.com",
  updated: "2026-11-06",
};

export interface LegalSection { id: string; title: string; body: ReactNode }

export function LegalPage({ title, description, path, intro, sections }: {
  title: string; description: string; path: string; intro: ReactNode; sections: LegalSection[];
}) {
  const updated = new Date(`${LEGAL.updated}T12:00:00`).toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric" });
  return (
    <>
      <SEOHead
        title={`${title} | Descubre RD`}
        description={description}
        url={path}
        geo={{ placename: "República Dominicana", region: "DO" }}
        breadcrumbs={[
          { name: "Inicio", url: "/" },
          { name: title, url: path },
        ]}
      />
      <Header />
      <main className="container mx-auto px-4 pb-16 pt-28 lg:px-8">
        <nav aria-label="Migas de pan" className="mb-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Inicio</Link> <span aria-hidden="true">/</span> <span aria-current="page">{title}</span>
        </nav>
        <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <nav aria-label="Contenido" className="sticky top-28 space-y-1 text-sm">
              <p className="mb-2 font-semibold text-foreground">Contenido</p>
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="block rounded px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground">{s.title}</a>
              ))}
            </nav>
          </aside>
          <article className="max-w-3xl">
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">Última actualización: <time dateTime={LEGAL.updated}>{updated}</time></p>
            <div className="mt-6 text-base leading-relaxed text-foreground/90">{intro}</div>
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="mt-10 scroll-mt-28">
                <h2 id={`${s.id}-h`} className="font-display text-2xl font-bold text-foreground">{i + 1}. {s.title}</h2>
                <div className="mt-3 space-y-3 leading-relaxed text-foreground/90 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">{s.body}</div>
              </section>
            ))}
            <p className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
              ¿Dudas? Escríbenos a <a href={`mailto:${LEGAL.email}`} className="font-medium text-primary hover:underline">{LEGAL.email}</a>.
              Ver también: {path === "/privacidad"
                ? <Link to="/terminos" className="font-medium text-primary hover:underline">Términos y condiciones</Link>
                : <Link to="/privacidad" className="font-medium text-primary hover:underline">Política de privacidad</Link>}.
            </p>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
