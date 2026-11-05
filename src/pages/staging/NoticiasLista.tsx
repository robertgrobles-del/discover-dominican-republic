// /noticias: listado de las noticias publicadas desde el panel, filtrable por categoría.
// El servidor ya entrega esta URL con sus metadatos y JSON-LD (api/index.ts → render/noticias).
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Skeleton } from "@/components/ui/skeleton";
import heroBeachImg from "@/assets/hero-beach.jpg";
import { formatNewsDate, usePublicNewsList } from "@/lib/stagingContent";

export default function NoticiasLista() {
  const { data: news = [], isLoading } = usePublicNewsList();
  const [category, setCategory] = useState<string | null>(null);
  const categories = useMemo(
    () => [...new Map(news.filter((n) => n.category_slug).map((n) => [n.category_slug!, n.category_name!])).entries()],
    [news],
  );
  const shown = category ? news.filter((n) => n.category_slug === category) : news;

  return (
    <>
      <SEOHead
        title="Noticias de turismo en República Dominicana | Descubre RD"
        description="Actualidad del turismo dominicano: eventos, cultura, gastronomía, naturaleza y avisos para viajeros."
        url="/noticias"
        breadcrumbs={[]}
      />
      <Header />
      <main className="container mx-auto px-4 pb-16 pt-28 lg:px-8">
        <nav aria-label="Migas de pan" className="mb-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Inicio</Link> <span aria-hidden="true">/</span> <span aria-current="page">Noticias</span>
        </nav>
        <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">Noticias</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Actualidad del turismo en República Dominicana.</p>

        {categories.length > 1 && (
          <div role="group" aria-label="Filtrar por categoría" className="mt-6 flex flex-wrap gap-2">
            {[[null, "Todas"] as const, ...categories].map(([slug, name]) => (
              <button key={slug ?? "todas"} type="button" aria-pressed={category === slug} onClick={() => setCategory(slug)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${category === slug ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"}`}>
                {name}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}</div>
        ) : shown.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">Todavía no hay noticias publicadas.</p>
        ) : (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((n, i) => (
              <li key={n.id}>
                <article className="group h-full overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/50">
                  <Link to={`/noticias/${n.slug}`} className="block h-full">
                    <img src={n.cover_url || heroBeachImg} alt={n.image_alt || ""} width={640} height={400}
                      loading={i < 3 ? "eager" : "lazy"} decoding="async" className="aspect-[16/10] w-full object-cover" />
                    <div className="p-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-primary">{n.category_name ?? "Noticias"}</p>
                      <h2 className="mt-1 font-display text-xl font-bold text-foreground group-hover:text-primary">{n.title}</h2>
                      {n.excerpt && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{n.excerpt}</p>}
                      {n.published_at && <time dateTime={n.published_at} className="mt-3 block text-xs text-muted-foreground">{formatNewsDate(n.published_at)}</time>}
                    </div>
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </>
  );
}
