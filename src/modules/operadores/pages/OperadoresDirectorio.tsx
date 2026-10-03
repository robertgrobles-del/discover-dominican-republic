import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Search } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchOrgs, fetchPublishedListings } from "../api";
import { ListingCard } from "../components/ListingCard";
import { CATEGORY_META } from "../constants";
import type { ListingCategory } from "../types";
import { NativeSponsoredCard } from "@/components/promo/NativeSponsoredCard";
import { NATIVE_DIRECTORY_SLOT, serveNative } from "@/lib/sponsorshipApi";

/** El anuncio nativo va después de la tercera tarjeta: dentro de los resultados, sin desplazar los primeros. */
const NATIVE_AD_POSITION = 3;

export default function OperadoresDirectorio() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: listings = [], isLoading } = useQuery({ queryKey: ["op", "public-listings"], queryFn: fetchPublishedListings });
  const { data: orgs = [] } = useQuery({ queryKey: ["op", "orgs"], queryFn: fetchOrgs });
  const rawCat = searchParams.get("categoria") ?? "all";
  const cat: ListingCategory | "all" = rawCat === "all" || rawCat in CATEGORY_META ? rawCat as ListingCategory | "all" : "all";
  const q = searchParams.get("q") ?? "";
  // Un fallo del servidor de anuncios no debe afectar al directorio: sin reintentos y sin estado de error visible.
  const { data: ads = [] } = useQuery({ queryKey: ["ads", NATIVE_DIRECTORY_SLOT, cat], queryFn: () => serveNative(NATIVE_DIRECTORY_SLOT, { category: cat === "all" ? undefined : cat }), retry: false, staleTime: 5 * 60_000 });
  const updateFilters = (updates: { categoria?: string; q?: string }) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (!value || (key === "categoria" && value === "all")) next.delete(key);
      else next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  };
  const orgById = useMemo(() => new Map(orgs.map((o) => [o.id, o])), [orgs]);
  const verified = orgs.filter((o) => o.verification === "verified" && o.website_enabled);

  const shown = listings.filter((l) => {
    const okCat = cat === "all" || l.category === cat;
    const s = q.trim().toLowerCase();
    return okCat && (!s || [l.title, l.destination, l.summary].some((v) => v?.toLowerCase().includes(s)));
  });

  return (
    <PageTransition>
      <SEOHead title="Directorio de operadores turísticos verificados" description="Encuentra experiencias, voluntariados, alojamientos y transportes de operadores verificados de República Dominicana y reserva directo." />
      <Header variant="white" />
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-4xl font-extrabold mb-2">Operadores verificados</h1>
          <p className="text-muted-foreground mb-6 max-w-2xl">Reserva directo con guías, tour operadores, agencias, alojamientos y transportes locales, sin intermediarios.</p>

          {verified.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {verified.map((o) => (
                <Link key={o.id} to={`/operador/${o.slug}`}><Badge variant="secondary" className="gap-1 py-1.5 px-3 hover:bg-primary/10"><BadgeCheck className="h-3.5 w-3.5 text-primary" /> {o.business_name}</Badge></Link>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mb-6">
            <div className="relative w-full sm:w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Buscar servicio o destino" value={q} onChange={(e) => updateFilters({ q: e.target.value })} aria-label="Buscar" /></div>
            <Button size="sm" variant={cat === "all" ? "default" : "outline"} className="rounded-full" onClick={() => updateFilters({ categoria: "all" })}>Todos</Button>
            {(Object.keys(CATEGORY_META) as ListingCategory[]).map((c) => (
              <Button key={c} size="sm" variant={cat === c ? "default" : "outline"} className="rounded-full gap-1" onClick={() => updateFilters({ categoria: c })}>{CATEGORY_META[c].label}</Button>
            ))}
          </div>

          {isLoading ? null : shown.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">No encontramos servicios con esos filtros.</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((l, i) => {
                const o = orgById.get(l.org_id);
                const card = o ? <ListingCard key={l.id} listing={l} orgSlug={o.slug} orgName={o.business_name} /> : null;
                return i === NATIVE_AD_POSITION && ads[0] ? [<NativeSponsoredCard key={`ad-${ads[0].id}`} creative={ads[0]} page="/operadores/directorio" />, card] : card;
              })}
            </div>
          )}

          <div className="mt-14 rounded-2xl bg-secondary/50 p-8 text-center">
            <p className="font-display text-xl font-bold mb-1">¿Eres operador turístico?</p>
            <p className="text-muted-foreground mb-4 text-sm">Publica tus servicios y recibe reservas directas en tu propio sitio.</p>
            <Button asChild><Link to="/operadores">Conoce Operadores RD</Link></Button>
          </div>
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
}
