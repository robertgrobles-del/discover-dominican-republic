// /noticias/:slug: una noticia publicada desde el panel. El servidor entrega esta URL con título, descripción,
// canónica, Open Graph, JSON-LD (NewsArticle + migas) y versión Markdown para IA (api/index.ts). Aquí SEOHead solo
// mantiene título, descripción y canónica al navegar dentro de la app; no repite el JSON-LD del servidor.
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock, ExternalLink, MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Skeleton } from "@/components/ui/skeleton";
import { NewsBody } from "@/components/admin/staging/NewsBody";
import { POST_TYPE_LABEL, formatNewsDate, newsSeoDescription, newsSeoTitle, readMinutes, usePublicNews, usePublicNewsList } from "@/lib/stagingContent";

export default function NoticiaDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const { data: n, isLoading } = usePublicNews(slug);
  const { data: all = [] } = usePublicNewsList();

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="container mx-auto max-w-3xl px-4 pb-16 pt-28"><Skeleton className="mb-4 h-10 w-3/4" /><Skeleton className="aspect-[16/9] w-full rounded-2xl" /></main>
      </>
    );
  }

  if (!n) {
    return (
      <>
        <SEOHead title="Noticia no encontrada | Descubre RD" description="La noticia que buscas no existe o ya no está publicada." breadcrumbs={[]} />
        <Header />
        <main className="container mx-auto max-w-3xl px-4 pb-16 pt-32 text-center">
          <h1 className="font-display text-3xl font-bold">Noticia no encontrada</h1>
          <p className="mt-2 text-muted-foreground">Puede que se haya retirado o que el enlace tenga un error.</p>
          <Link to="/noticias" className="mt-6 inline-block font-semibold text-primary hover:underline">Ver todas las noticias</Link>
        </main>
        <Footer />
      </>
    );
  }

  // Relacionadas: misma categoría primero, luego las más recientes.
  const related = all.filter((r) => r.slug !== n.slug)
    .sort((a, b) => Number(b.category_slug === n.category_slug) - Number(a.category_slug === n.category_slug))
    .slice(0, 3);
  const minutes = readMinutes(n.body);

  return (
    <>
      <SEOHead title={newsSeoTitle(n)} description={newsSeoDescription(n)} url={`/noticias/${n.slug}`} image={n.cover_url ?? undefined} type="article" breadcrumbs={[]} />
      <Header />
      <main className="container mx-auto max-w-3xl px-4 pb-16 pt-20 md:pt-24">
        <nav aria-label="Migas de pan" className="mb-4 text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link to="/" className="hover:text-foreground">Inicio</Link></li><li aria-hidden="true">/</li>
            <li><Link to="/noticias" className="hover:text-foreground">Noticias</Link></li><li aria-hidden="true">/</li>
            <li aria-current="page" className="truncate text-foreground">{n.title}</li>
          </ol>
        </nav>

        <article>
          <header>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              {n.post_type && n.post_type !== "noticia" ? POST_TYPE_LABEL[n.post_type] : n.category_name ?? "Noticias"}
              {n.post_type === "patrocinado" && n.sponsor && <span className="font-normal normal-case tracking-normal text-muted-foreground"> · por {n.sponsor}</span>}
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-foreground md:text-5xl">{n.title}</h1>
            {n.excerpt && <p className="mt-4 text-lg font-bold italic leading-relaxed text-primary">{n.excerpt}</p>}
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-y border-border py-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-3">
                <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-display font-bold text-primary">
                  {(n.author || "Redacción Descubre RD").trim().charAt(0).toUpperCase()}
                </span>
                <span className="leading-tight">
                  <span className="block text-xs">{n.post_type === "invitado" ? "Autor invitado" : "Por"}</span>
                  <span className="font-semibold text-foreground">{n.author || "Redacción Descubre RD"}</span>
                </span>
              </span>
              <span className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-1">
                {n.published_at && <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" /><time dateTime={n.published_at}>{formatNewsDate(n.published_at)}</time></span>}
                {minutes && <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" aria-hidden="true" />{minutes} min de lectura</span>}
                {n.province_name && <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" aria-hidden="true" />{n.province_name}</span>}
              </span>
            </div>
          </header>

          {n.cover_url && (
            <figure className="mt-6">
              <img src={n.cover_url} alt={n.image_alt || n.title} width={1200} height={675} fetchPriority="high"
                className="aspect-[16/9] w-full rounded-2xl border border-border object-cover" />
              {n.image_credit && <figcaption className="mt-2 text-xs text-muted-foreground">{n.image_credit}</figcaption>}
            </figure>
          )}

          {n.body && <div className="mt-8"><NewsBody markdown={n.body} /></div>}

          {n.source_url && (
            <p className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
              Fuente: <a href={n.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
                {new URL(n.source_url).hostname.replace(/^www\./, "")}<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </p>
          )}
        </article>

        {related.length > 0 && (
          <aside aria-labelledby="mas-noticias" className="mt-14 border-t border-border pt-8">
            <div className="flex items-end justify-between gap-4">
              <h2 id="mas-noticias" className="font-display text-2xl font-bold">Más noticias</h2>
              <Link to="/noticias" className="text-sm font-semibold text-primary hover:underline">Ver todas</Link>
            </div>
            <ul className="mt-5 grid gap-5 sm:grid-cols-3">
              {related.map((r) => (
                <li key={r.id}>
                  <Link to={`/noticias/${r.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg">
                    <div className="aspect-[16/10] overflow-hidden bg-muted">
                      {r.cover_url && <img src={r.cover_url} alt="" loading="lazy" width={400} height={250} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-primary">{r.category_name ?? "Noticias"}</p>
                      <h3 className="mt-1.5 line-clamp-3 font-display text-base font-bold leading-snug text-foreground group-hover:text-primary">{r.title}</h3>
                      {r.published_at && <time dateTime={r.published_at} className="mt-auto pt-3 text-xs text-muted-foreground">{formatNewsDate(r.published_at)}</time>}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <Link to="/noticias" className="mt-10 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />Todas las noticias
        </Link>
      </main>
      <Footer />
    </>
  );
}
