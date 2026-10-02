import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { trackContactClick, whatsappNumber } from "@/lib/operatorContactApi";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { fetchListings, fetchOrgBySlug } from "../api";
import { ListingCard } from "../components/ListingCard";
import { CATEGORY_META } from "../constants";
import type { ListingCategory } from "../types";

export default function OperadorStorefront() {
  const { slug = "" } = useParams();
  const { user } = useAuth();
  const orgQ = useQuery({ queryKey: ["op", "org-slug", slug], queryFn: () => fetchOrgBySlug(slug) });
  const org = orgQ.data;
  const listingsQ = useQuery({ queryKey: ["op", "listings", org?.id], queryFn: () => fetchListings(org!.id), enabled: !!org });
  const isOwner = !!org && user?.id === org.id;
  const live = !!org && org.verification === "verified" && org.website_enabled;

  if (orgQ.isLoading) return <div className="min-h-screen" />;

  if (!org || (!live && !isOwner)) {
    return (
      <PageTransition>
        <SEOHead title="Operador no disponible — Descubre RD" description="Este sitio de reservas no está disponible." />
        <Header variant="white" />
        <main className="min-h-[60vh] flex flex-col items-center justify-center gap-4 pt-24 text-center px-4">
          <h1 className="font-display text-2xl font-bold">Este sitio de reservas no está disponible</h1>
          <p className="text-muted-foreground">El operador no existe o todavía no ha activado su sitio.</p>
          <Button asChild><Link to="/operadores/directorio">Ver operadores verificados</Link></Button>
        </main>
        <Footer />
      </PageTransition>
    );
  }

  const listings = (listingsQ.data || []).filter((l) => (isOwner && !live ? true : l.status === "published"));
  const cats = [...new Set(listings.map((l) => l.category))] as ListingCategory[];

  return (
    <PageTransition>
      <SEOHead title={`${org.business_name} — reservas directas`} description={org.description || `Reserva directo con ${org.business_name} en Descubre RD.`} image={org.cover_url || undefined} />
      <Header variant="white" />
      <main>
        <section className="relative pt-24">
          <div className="h-56 md:h-72 bg-muted relative overflow-hidden">
            {org.cover_url && <img src={org.cover_url} alt="" className="w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
          <div className="container mx-auto px-4 -mt-16 relative">
            <div className="rounded-2xl bg-card border border-border shadow-lg p-6">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-display text-3xl font-extrabold">{org.business_name}</h1>
                {org.verification === "verified" && <Badge className="gap-1"><BadgeCheck className="h-3 w-3" /> Verificado</Badge>}
              </div>
              {org.description && <p className="text-muted-foreground max-w-3xl">{org.description}</p>}
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                {org.province && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {org.province}</span>}
                {org.phone && <a href={`tel:${org.phone.replace(/[^\d+]/g, "")}`} onClick={() => trackContactClick(slug, "call")} className="flex items-center gap-1 hover:text-foreground"><Phone className="h-4 w-4" /> {org.phone}</a>}
                {org.phone && whatsappNumber(org.phone) && <a href={`https://wa.me/${whatsappNumber(org.phone)}`} target="_blank" rel="noopener noreferrer" onClick={() => trackContactClick(slug, "whatsapp")} className="flex items-center gap-1 hover:text-foreground"><MessageCircle className="h-4 w-4" /> WhatsApp</a>}
                {org.email && <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {org.email}</span>}
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10">
          {isOwner && !live && (
            <Alert className="mb-6 border-amber-500/40 bg-amber-500/10"><AlertDescription>Vista previa: tu sitio se publicará cuando tu organización esté verificada y el sitio de reservas esté activo (Org/Perfil).</AlertDescription></Alert>
          )}
          {listings.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">Este operador aún no tiene servicios publicados.</p>
          ) : (
            cats.map((c) => (
              <div key={c} className="mb-10">
                <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">{(() => { const I = CATEGORY_META[c].icon; return <I className="h-5 w-5 text-primary" />; })()} {CATEGORY_META[c].label}</h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {listings.filter((l) => l.category === c).map((l) => <ListingCard key={l.id} listing={l} orgSlug={org.slug} />)}
                </div>
              </div>
            ))
          )}
        </section>
      </main>
      <Footer />
    </PageTransition>
  );
}
