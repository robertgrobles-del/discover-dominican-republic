// Página de detalle de un destino del catálogo. Estructura según el mockup de «detalle de destino» (2026-10):
// encabezado a dos columnas, navegación por secciones, resumen con datos clave, lo más destacado, zonas, eventos,
// información práctica, hoteles, dónde comer y vida nocturna, sabores, artículos, destinos cercanos y preguntas.
// Cada sección sale de los datos del destino: la que no tiene datos no se muestra.
import { useRef } from "react";
import type React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, ChevronLeft, ChevronRight, Hotel, MapPin, Plane, Sparkles, Star, Thermometer, Wallet } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { destinationTheme } from "@/lib/destinationTheme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/FavoriteButton";
import { DistancesFromCities } from "@/components/destination/DistancesFromCities";
import { DestinationAboutTabs } from "@/components/destination/DestinationAboutTabs";
import { DestinationLocalGastronomy } from "@/components/destination/DestinationLocalGastronomy";
import { DestinationZonesGrid } from "@/components/destination/DestinationZonesGrid";
import { RelatedBlogPosts } from "@/components/destination/RelatedBlogPosts";
import { ParticipationInvite } from "@/components/gamificacion/ParticipationInvite";
import { DetailPageSidebarAd } from "@/components/promo/DetailPageSidebarAd";
import { BetweenSectionsAd, PanoramaAd } from "@/components/promo/BannerAd";
import { Destination, getDestinationsByProvince, getDestinationsByRegion } from "@/data/destinations";
import { hotels as allHotels, getHotelsByDestination, getHotelsByProvince } from "@/data/hotels";
import { restaurants as allRestaurants, getRestaurantsByDestination, getRestaurantsByProvince } from "@/data/restaurants";
import { bars as allBars, getBarsByDestination, getBarsByProvince } from "@/data/bars";
import { staticEventos } from "@/data/eventosData";
import { usePageContent } from "@/lib/pageContent";

interface StaticDestinationPageProps {
  destination: Destination;
}

const REGION_LABEL: Record<Destination["region"], string> = { norte: "Costa norte", sur: "Región sur", este: "Costa este", "santo-domingo": "Santo Domingo" };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** Del destino, de su provincia y, si aún faltan, los mejor valorados: nunca una sección con uno o dos elementos. */
function fill<T>(own: T[], province: T[], all: T[], min = 3): T[] {
  const merged = Array.from(new Set([...own, ...province]));
  return merged.length >= min ? merged : Array.from(new Set([...merged, ...all.slice(0, 4)]));
}

function SectionHeader({ title, description, link }: { title: string; description?: string; link?: { to: string; label: string } }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {link && (
        <Link to={link.to} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline underline-offset-4">
          {link.label} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export function StaticDestinationPage({ destination }: StaticDestinationPageProps) {
  const pc = usePageContent("static-destination-page");
  const REGION_LABEL = pc.data("REGION_LABEL", __pcData.REGION_LABEL);
  const d = destination;
  const hotels = fill(getHotelsByDestination(d.id), d.province ? getHotelsByProvince(d.province) : [], allHotels);
  const restaurants = fill(getRestaurantsByDestination(d.id), d.province ? getRestaurantsByProvince(d.province) : [], allRestaurants);
  const bars = fill(getBarsByDestination(d.id), d.province ? getBarsByProvince(d.province) : [], allBars);
  const subDestinations = d.type === "provincia" ? getDestinationsByProvince(d.slug) : [];
  const nearby = (subDestinations.length ? subDestinations : getDestinationsByRegion(d.region).filter((x) => x.id !== d.id && x.type !== "municipio")).slice(0, 4);
  const place = [d.province && d.province !== d.name ? d.province : null, REGION_LABEL[d.region]].filter(Boolean).join(" · ");
  const match = (s?: string) => !!s && [d.name, d.province].filter(Boolean).some((n) => s.toLowerCase().includes(n!.toLowerCase()));
  const events = staticEventos.filter((e) => match(e.ubicacion) || match(e.provincia)).slice(0, 4);
  const photos = [d.imageUrl, ...d.gallery].filter(Boolean);
  const photo = (i: number) => photos[i % photos.length]!;
  // Lo más destacado: atracciones con su descripción; si el destino no las detalla, sus puntos fuertes.
  const highlights = (d.attractions?.length
    ? d.attractions.map((a) => ({ name: a.name, tag: cap(a.type), text: a.description }))
    : d.highlights.map((h) => ({ name: h, tag: "Imprescindible", text: undefined as string | undefined }))).slice(0, 5);
  const facts = [
    { label: "Mejor época", value: d.bestTimeToVisit, icon: Calendar },
    { label: "Clima", value: d.weatherInfo, icon: Thermometer },
    { label: "Aeropuerto", value: [d.nearbyAirport, d.distanceFromAirport].filter(Boolean).join(" · "), icon: Plane },
    { label: "Presupuesto medio", value: d.averageBudget?.mid, icon: Wallet },
  ].filter((f) => f.value);
  const practical = [
    { label: "Entrada", value: "Formulario E-Ticket", to: "/e-ticket" },
    { label: "Estadía sugerida", value: d.idealDays ? `${d.minimumDays ? `${d.minimumDays}–` : ""}${d.idealDays} días` : undefined },
    { label: "Moneda", value: d.currency ?? "Peso dominicano (DOP)", to: "/conversor-moneda#tasas" },
    { label: "Idioma", value: d.language },
    { label: "Cómo llegar", value: d.nearbyAirport, to: "/como-llegar" },
    { label: "Asistencia", value: "POLITUR · 911", to: "/info/seguridad#emergencias" },
  ].filter((p) => p.value);
  const faqs = [
    { q: `¿Es seguro visitar ${d.name}?`, a: d.safetyInfo },
    { q: "¿Cuál es la mejor época para visitar?", a: d.bestTimeToVisit && `${d.bestTimeToVisit}. ${d.weatherInfo ?? ""}`.trim() },
    { q: "¿Cómo se llega?", a: d.howToGetThere },
    { q: "¿Cuántos días hacen falta?", a: d.idealDays ? `Lo ideal son ${d.idealDays} días${d.minimumDays ? `; como mínimo, ${d.minimumDays}` : ""}.` : undefined },
    { q: "¿Para quién es este destino?", a: d.bestFor?.length ? `Es ideal para ${d.bestFor.join(", ").toLowerCase()}.${d.notRecommendedFor?.length ? ` Menos recomendable para ${d.notRecommendedFor.join(", ").toLowerCase()}.` : ""}` : undefined },
  ].filter((f) => f.a);
  // Mosaico de destacados: uno grande y el resto repartido sin dejar huecos, haya 2, 3, 4 o 5.
  const tile = (i: number, n: number) => i === 0 ? (n === 1 ? "min-h-[16rem] md:col-span-4" : "min-h-[16rem] md:col-span-2 md:row-span-2")
    : n === 2 ? "min-h-[11rem] md:col-span-2 md:row-span-2" : n === 3 ? "min-h-[11rem] md:col-span-2" : n === 4 && i === 3 ? "min-h-[11rem] md:col-span-2" : "min-h-[11rem]";
  // Una foto que no carga se sustituye por la del destino: nunca un recuadro roto.
  const onImgError = (e: React.SyntheticEvent<HTMLImageElement>) => { if (e.currentTarget.src !== d.imageUrl && !e.currentTarget.dataset.fallback) { e.currentTarget.dataset.fallback = "1"; e.currentTarget.src = d.imageUrl; } };
  const hotelRail = useRef<HTMLDivElement>(null);
  const slide = (dir: number) => hotelRail.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  return (
    <PageTransition>
      <div {...destinationTheme(d.slug, d.provinceSlug)}>
      <SEOHead title={`${d.name} - Guía de viaje`} description={d.shortDescription} image={d.imageUrl} />
      <Header />

      {/* Encabezado: texto y acciones a la izquierda, foto a la derecha */}
      <section className="border-b border-border bg-gradient-to-br from-primary/15 via-background to-background pt-24 pb-10">
        <div className="container mx-auto grid items-center gap-8 px-4 lg:grid-cols-2 lg:px-8">
          <div>
            <nav aria-label={pc.t("nav.aria-label.1", "Migas de pan")} className="mb-4 text-sm text-muted-foreground">
              <Link to="/destinos" className="inline-flex items-center gap-1 hover:text-foreground"><ChevronLeft className="h-4 w-4" />{" "}{pc.tx("Link.1", "Destinos")}</Link>
            </nav>
            <ul className="mb-3 flex flex-wrap gap-2" aria-label={pc.t("ul.aria-label.1", "Tipo de destino")}>
              {d.categories.map((c) => <li key={c}><Badge variant="secondary" className="rounded-full">{cap(c)}</Badge></li>)}
            </ul>
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-foreground">{d.name}</h1>
            {place && <p className="mt-2 flex items-center gap-1.5 text-muted-foreground"><MapPin className="h-4 w-4 text-primary" /> {place}</p>}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-xl font-bold"><a href="#hoteles"><Hotel className="mr-2 h-4 w-4" />{" "}{pc.tx("a.1", "Ver hoteles")}</a></Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl"><Link to="/itinerario-ia"><Sparkles className="mr-2 h-4 w-4" />{" "}{pc.tx("Link.2", "Planificar con IA")}</Link></Button>
              <FavoriteButton id={d.id} type="destino" name={d.name} image={d.imageUrl} location={place} variant="button" size="lg" />
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl border border-border shadow-xl">
            <img src={d.imageUrl} alt={`Vista de ${d.name}`} className="aspect-[4/3] w-full object-cover" />
          </div>
        </div>
      </section>

      <main className="container mx-auto space-y-16 px-4 py-12 lg:px-8">
        {/* Resumen: texto y fotos a la izquierda; datos clave y anuncio a la derecha */}
        <section id="resumen" className="grid scroll-mt-32 gap-8 lg:grid-cols-[1fr_20rem]">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">{d.isFeatured ? "Destino estrella del Caribe" : d.isPopular ? "Destino popular" : "Guía del destino"}</p>
            <h2 className="mt-2 font-display text-2xl md:text-4xl font-bold leading-tight text-foreground">{d.shortDescription}</h2>
            <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-muted-foreground">{d.description}</p>
            {photos.length > 1 && (
              <div className="mt-6 grid grid-cols-5 gap-3">
                <figure className="col-span-3 overflow-hidden rounded-2xl"><img src={photo(1)} alt={`${d.name}: ${d.highlights[0] ?? "paisaje"}`} loading="lazy" onError={onImgError} className="aspect-[4/3] h-full w-full object-cover" /></figure>
                <figure className="col-span-2 overflow-hidden rounded-2xl"><img src={photo(2)} alt={`${d.name}: ${d.highlights[1] ?? "ambiente"}`} loading="lazy" onError={onImgError} className="aspect-[3/4] h-full w-full object-cover" /></figure>
              </div>
            )}
          </div>
          <aside className="space-y-6">
            {facts.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="mb-4 font-display text-lg font-bold">{pc.tx("h3.1", "Datos clave")}</h3>
                <dl className="space-y-4">
                  {facts.map((f) => (
                    <div key={f.label} className="flex gap-3">
                      <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <div><dt className="text-xs text-muted-foreground">{f.label}</dt><dd className="text-sm font-semibold text-foreground">{f.value}</dd></div>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            <div className="lg:sticky lg:top-32"><DetailPageSidebarAd showDemo variant="standard" industry="hotels" /></div>
          </aside>
        </section>

        {/* Lo más destacado: un bloque grande y cuatro medianos */}
        {highlights.length > 0 && (
          <section id="destacados" className="scroll-mt-32">
            <SectionHeader title={`Lo más destacado de ${d.name}`} link={{ to: `/destino/${d.slug}/actividades`, label: "Ver todos los lugares" }} />
            <div className="grid gap-3 md:grid-cols-4 md:grid-rows-2">
              {highlights.map((h, i) => (
                <article key={h.name} className={`group relative overflow-hidden rounded-2xl ${tile(i, highlights.length)}`}>
                  <img src={photo(i + 1)} alt="" loading="lazy" onError={onImgError} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-3xs font-bold uppercase tracking-widest text-white/75">{h.tag}</p>
                    <h3 className={`font-display font-bold text-white ${i === 0 ? "text-2xl" : "text-base"}`}>{h.name}</h3>
                    {i === 0 && h.text && <p className="mt-1 max-w-md text-sm text-white/85">{h.text}</p>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <BetweenSectionsAd showDemo section="destination-mid-1" industry="hotels" className="!py-0" />

        {/* Zonas y distancias */}
        <section id="zonas" className="scroll-mt-32 space-y-8">
          <DestinationZonesGrid slug={d.slug} destinoNombre={d.name} />
          {d.latitude && d.longitude && <DistancesFromCities latitude={d.latitude} longitude={d.longitude} destinationName={d.name} />}
        </section>

        {/* Próximos eventos */}
        {events.length > 0 && (
          <section id="eventos" className="scroll-mt-32">
            <SectionHeader title={`Próximos eventos en ${d.name}`} description={pc.t("SectionHeader.description.1", "Festivales, torneos y fiestas para planificar tu fecha.")} link={{ to: "/eventos", label: "Ver agenda completa" }} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {events.map((e) => (
                <Link key={e.id} to={`/evento/${e.id}`} className="group overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/50">
                  <div className="relative"><img src={e.imagen} alt="" loading="lazy" onError={onImgError} className="aspect-[16/10] w-full object-cover" /><Badge className="absolute left-3 top-3">{e.fecha}</Badge></div>
                  <div className="p-4">
                    <p className="text-3xs font-bold uppercase tracking-widest text-primary">{e.categoria}</p>
                    <h3 className="mt-1 font-semibold text-foreground group-hover:text-primary">{e.titulo}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{e.ubicacion}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Información práctica */}
        <section id="info" className="scroll-mt-32">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3 lg:grid-cols-6">
            {practical.map((p) => (
              <div key={p.label} className="bg-card p-4">
                <dt className="text-xs text-muted-foreground">{p.label}</dt>
                <dd className="mt-1 text-sm font-semibold text-foreground">{p.to ? <Link to={p.to} className="hover:text-primary hover:underline underline-offset-4">{p.value}</Link> : p.value}</dd>
              </div>
            ))}
          </dl>
          <Link to="/requisitos-viaje#guia-practica" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline underline-offset-4">{pc.tx("Link.3", "Guía completa para viajar a República Dominicana")}{" "}<ArrowRight className="h-4 w-4" /></Link>
        </section>

        {/* Hoteles recomendados */}
        {hotels.length > 0 && (
          <section id="hoteles" className="scroll-mt-32">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">{pc.tx("h2.1", "Hoteles recomendados en")}{" "}{d.name}</h2>
              <div className="flex items-center gap-2">
                <Link to="/alojamientos" className="mr-2 text-sm font-semibold text-primary hover:underline underline-offset-4">{pc.tx("Link.4", "Ver todos (")}{hotels.length})</Link>
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => slide(-1)} aria-label={pc.t("Button.aria-label.1", "Hoteles anteriores")}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => slide(1)} aria-label={pc.t("Button.aria-label.2", "Hoteles siguientes")}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
            <div ref={hotelRail} className="flex snap-x gap-4 overflow-x-auto pb-2 scrollbar-none">
              {hotels.slice(0, 8).map((h) => (
                <article key={h.id} className="w-72 shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="relative"><img src={h.imageUrl} alt="" loading="lazy" onError={onImgError} className="aspect-[4/3] w-full object-cover" /><Badge variant="secondary" className="absolute left-3 top-3 capitalize">{h.category.replace("-", " ")}</Badge></div>
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground">{h.destinationName}</p>
                    <h3 className="font-semibold text-foreground">{h.name}</h3>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <p className="flex items-center gap-2 text-sm"><span className="font-bold text-primary">{h.priceRange}</span><span className="flex items-center gap-0.5 text-muted-foreground"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{h.rating}</span></p>
                      <Button asChild size="sm" className="rounded-lg"><Link to={`/alojamiento/${h.slug}`}>{pc.tx("Link.5", "Ver detalles")}</Link></Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <BetweenSectionsAd showDemo section="destination-mid-2" industry="restaurants" className="!py-0" />

        {/* Dónde comer y vida nocturna */}
        {restaurants.length + bars.length > 0 && (
          <section id="comer" className="grid scroll-mt-32 gap-10 lg:grid-cols-[3fr_2fr]">
            {restaurants.length > 0 && (
              <div>
                <SectionHeader title={pc.t("SectionHeader.title.1", "Dónde comer")} link={{ to: "/restaurantes", label: "Ver todos" }} />
                <div className="grid gap-4 sm:grid-cols-3">
                  {restaurants.slice(0, 3).map((r) => (
                    <Link key={r.id} to={`/restaurante/${r.slug}`} className="group overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/50">
                      <img src={r.imageUrl} alt="" loading="lazy" onError={onImgError} className="aspect-[4/3] w-full object-cover" />
                      <div className="p-3">
                        <h3 className="font-semibold text-foreground group-hover:text-primary">{r.name}</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">{[r.cuisineType?.[0], r.destinationName, r.priceRange].filter(Boolean).join(" · ")}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {bars.length > 0 && (
              <div>
                <SectionHeader title={pc.t("SectionHeader.title.2", "Vida nocturna")} link={{ to: "/vida-nocturna", label: "Ver todos" }} />
                <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                  {bars.slice(0, 4).map((b) => (
                    <li key={b.id}>
                      <Link to={`/bar/${b.slug}`} className="flex items-center gap-3 p-3 transition-colors hover:bg-muted/50">
                        <img src={b.imageUrl} alt="" loading="lazy" onError={onImgError} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                        <div className="min-w-0"><p className="truncate font-semibold text-foreground">{b.name}</p><p className="truncate text-xs capitalize text-muted-foreground">{[b.barType?.replace("-", " "), b.destinationName].filter(Boolean).join(" · ")}</p></div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Sabores dominicanos para probar aquí */}
        <DestinationLocalGastronomy destinoNombre={d.name} />

        {/* Llamada a planificar */}
        <section className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-r from-primary to-primary/80 p-8 text-primary-foreground md:flex-row md:items-center md:p-10">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">{pc.tx("h2.2", "¿Listo para explorar")}{" "}{d.name}?</h2>
            <p className="mt-1 text-primary-foreground/85">{pc.tx("p.1", "Arma tu itinerario en minutos o habla con un experto local.")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary" className="rounded-xl font-bold"><Link to="/itinerario-ia">{pc.tx("Link.6", "Crear itinerario con IA")}</Link></Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl border-white/30 bg-white/10 font-bold text-white hover:bg-white/20 hover:text-white"><Link to="/planifica">{pc.tx("Link.7", "Planificar mi viaje")}</Link></Button>
          </div>
        </section>

        {/* Artículos, historia y cultura */}
        <RelatedBlogPosts destinationName={d.name} destinationSlug={d.slug} />
        {d.about && <DestinationAboutTabs name={d.name} data={d.about} />}

        {/* Destinos cercanos y preguntas frecuentes */}
        {(nearby.length > 0 || faqs.length > 0) && (
          <section className="grid gap-10 lg:grid-cols-2">
            {nearby.length > 0 && (
              <div>
                <SectionHeader title={subDestinations.length ? `Destinos en ${d.name}` : "Destinos cercanos"} />
                <div className="grid grid-cols-2 gap-3">
                  {nearby.map((n) => (
                    <Link key={n.id} to={`/destino/${n.slug}`} className="group relative overflow-hidden rounded-2xl">
                      <img src={n.imageUrl} alt="" loading="lazy" onError={onImgError} className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-3"><h3 className="font-bold text-white">{n.name}</h3><p className="line-clamp-1 text-xs text-white/80">{n.shortDescription}</p></div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {faqs.length > 0 && (
              <div>
                <SectionHeader title={pc.t("SectionHeader.title.3", "Preguntas frecuentes")} />
                <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                  {faqs.map((f) => (
                    <details key={f.q} className="group p-4">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-foreground">{f.q}<ChevronRight className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90" /></summary>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Pasaporte digital */}
        <ParticipationInvite placeName={d.name} />

        <PanoramaAd showDemo />
      </main>

      <Footer />
      </div>
    </PageTransition>
  );
}

// Datos del módulo editables desde el panel (ver pc.data en src/lib/pageContent.ts).
const __pcData = { REGION_LABEL };
