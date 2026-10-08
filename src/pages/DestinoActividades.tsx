import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronRight, Clock, Compass, Loader2, Star } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fetchApi } from "@/lib/fastifyClient";
import { categoryKey, categoryLabel, groupByCategory, useDestinationActivities } from "@/lib/destinationActivities";

/** Todas las actividades de un destino, con filtro por categoría (`?categoria=`). */
export default function DestinoActividades() {
  const { slug } = useParams<{ slug: string }>();
  const [params, setParams] = useSearchParams();
  const selected = categoryKey(params.get("categoria"));

  const { data: destination } = useQuery({
    queryKey: ["destination-name", slug],
    queryFn: async () => (await fetchApi<{ data: { name: string } }>(`/destinations/${encodeURIComponent(slug!)}?fields=id,name`)).data,
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  });
  const { data: activities = [], isLoading, isError } = useDestinationActivities(slug);

  const name = destination?.name ?? "este destino";
  const categories = groupByCategory(activities);
  const active = categories.find((c) => c.key === selected);
  const visible = active ? activities.filter((a) => categoryKey(a.category) === active.key) : activities;
  const selectCategory = (key: string | null) => setParams(key ? { categoria: key } : {}, { replace: true });

  return (
    <PageTransition>
      <SEOHead
        title={`${active ? `${active.label}: actividades` : "Actividades"} en ${name} | Descubre República Dominicana`}
        description={`Todas las actividades y experiencias para hacer en ${name}, organizadas por categoría.`}
      />
      <Header />

      <main className="min-h-screen bg-background pt-28 pb-20">
        <div className="container mx-auto px-4">
          <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
            <Link to={`/destino/${slug}`}><ArrowLeft className="h-4 w-4 mr-1" /> Volver a {name}</Link>
          </Button>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            {active ? `${active.label} en ${name}` : `Actividades en ${name}`}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {isLoading ? "Cargando actividades…" : visible.length === 1 ? "1 actividad" : `${visible.length} actividades`}
            {active && !isLoading ? ` de ${activities.length} en el destino` : ""}
          </p>

          {categories.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
              <Button size="sm" variant={active ? "outline" : "default"} onClick={() => selectCategory(null)} aria-pressed={!active}>
                Todas ({activities.length})
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.key}
                  size="sm"
                  variant={active?.key === category.key ? "default" : "outline"}
                  onClick={() => selectCategory(category.key)}
                  aria-pressed={active?.key === category.key}
                >
                  {category.label} ({category.count})
                </Button>
              ))}
            </div>
          )}

          {isLoading && <div className="py-24 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}

          {isError && (
            <Card className="mt-10"><CardContent className="py-16 text-center">
              <p className="font-semibold">No se pudieron cargar las actividades.</p>
              <p className="text-sm text-muted-foreground mt-1">Inténtalo de nuevo en unos minutos.</p>
            </CardContent></Card>
          )}

          {!isLoading && !isError && activities.length === 0 && (
            <Card className="mt-10"><CardContent className="py-16 text-center space-y-3">
              <Compass className="h-10 w-10 mx-auto text-muted-foreground" />
              <p className="font-semibold">Todavía no hay actividades registradas en {name}.</p>
              <Button variant="outline" asChild><Link to="/experiencias">Ver experiencias de todo el país</Link></Button>
            </CardContent></Card>
          )}

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((activity) => {
              const key = categoryKey(activity.category);
              return (
                <Link key={activity.id} to={`/experiencia/${activity.slug}`} className="group rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-xl transition-shadow flex flex-col">
                  <div className="relative h-52 bg-muted overflow-hidden">
                    {activity.image_url && (
                      <img src={activity.image_url} alt={activity.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    {key && <Badge className="absolute top-3 left-3">{categoryLabel(key)}</Badge>}
                    {activity.rating && (
                      <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-xs font-semibold">
                        <Star className="h-3 w-3 fill-current text-amber-500" /> {Number(activity.rating).toFixed(1)}
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex flex-1 flex-col">
                    <h2 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">{activity.title}</h2>
                    {activity.short_description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{activity.short_description}</p>}
                    <div className="mt-auto pt-4 flex items-center justify-between text-sm">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        {activity.duration && <><Clock className="h-4 w-4" /> {activity.duration}</>}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-primary">
                        Ver detalles <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </PageTransition>
  );
}
