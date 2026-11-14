import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { ArrowRight, BadgeCheck, Gavel, Hotel, LayoutDashboard, Link2, Megaphone, Receipt, Video, Wallet, type LucideIcon } from "lucide-react";
import { Header } from "@/components/Header";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { usePanelAdoption } from "@/lib/adoption";
import { useCreatorDashboard } from "@/lib/creatorDashboard";
import { CreatorsMetrics } from "@/components/creators/CreatorsMetrics";
import { CreatorsVideosTab, type CreatorVideoItem } from "@/components/creators/CreatorsVideosTab";
import { CreatorsCampaignsTab } from "@/components/creators/CreatorsCampaignsTab";
import { CreatorsAffiliatesTab } from "@/components/creators/CreatorsAffiliatesTab";
import { CreatorsEarningsTab } from "@/components/creators/CreatorsEarningsTab";
import { CreatorsPayoutsTab } from "@/components/creators/CreatorsPayoutsTab";
import { CreatorsIdentityTab } from "@/components/creators/CreatorsIdentityTab";
import { CreatorsAppealsTab, type CreatorAppealItem } from "@/components/creators/CreatorsAppealsTab";

type SectionKey = "resumen" | "contenidos" | "campanas" | "estancias" | "afiliados" | "ingresos" | "pagos" | "identidad" | "apelaciones";
const SECTIONS: { key: SectionKey; label: string; icon: LucideIcon; group: string }[] = [
  { key: "resumen", label: "Resumen", icon: LayoutDashboard, group: "General" },
  { key: "contenidos", label: "Mis contenidos", icon: Video, group: "General" },
  { key: "campanas", label: "Campañas", icon: Megaphone, group: "Oportunidades" },
  { key: "estancias", label: "Estancias", icon: Hotel, group: "Oportunidades" },
  { key: "afiliados", label: "Enlaces de afiliado", icon: Link2, group: "Oportunidades" },
  { key: "ingresos", label: "Ingresos y disputas", icon: Receipt, group: "Dinero" },
  { key: "pagos", label: "Retirar fondos", icon: Wallet, group: "Dinero" },
  { key: "identidad", label: "Identidad y reputación", icon: BadgeCheck, group: "Cuenta" },
  { key: "apelaciones", label: "Apelaciones", icon: Gavel, group: "Cuenta" },
];
const GROUPS = [...new Set(SECTIONS.map((s) => s.group))];

/** Panel privado del creador: métricas, contenidos, oportunidades y dinero. La parte informativa vive en /creadores. */
export default function CreadorPanel() {
  const { user, data: dashboard, loading, isError, refetch } = useCreatorDashboard();
  const [params, setParams] = useSearchParams();
  const section = (SECTIONS.find((s) => s.key === params.get("seccion"))?.key ?? "resumen") as SectionKey;
  const go = (key: SectionKey) => { setParams(key === "resumen" ? {} : { seccion: key }, { replace: true }); window.scrollTo({ top: 0 }); };
  const [appeals, setAppeals] = useState<CreatorAppealItem[]>([]);
  const [appealsReloadKey, setAppealsReloadKey] = useState(0);
  usePanelAdoption("creador");

  if (!loading && !user) return <Navigate to={`/login?returnTo=${encodeURIComponent("/creadores/panel")}`} replace />;
  if (!loading && !isError && !dashboard) return <Navigate to="/creadores/registro" replace />;

  const profile = dashboard?.profile ?? null;
  const videos: CreatorVideoItem[] = (dashboard?.videos ?? []).map((v) => ({
    id: v.id, title: v.title, dest: v.destination_name ?? "—", views: v.views_count, bookings: 0, earnings: "—",
    status: v.status, date: v.created_at, ruleCode: v.moderation_rule ?? undefined, reviewNotes: v.review_notes ?? undefined,
  }));
  const pendingReview = videos.filter((v) => ["pending", "pending_review", "in_review", "under_review"].includes(v.status)).length;
  const current = SECTIONS.find((s) => s.key === section)!;

  const NavButton = ({ s, compact = false }: { s: (typeof SECTIONS)[number]; compact?: boolean }) => (
    <button type="button" onClick={() => go(s.key)} aria-current={section === s.key ? "page" : undefined}
      className={cn("flex items-center gap-2 rounded-lg text-sm font-medium transition-colors", compact ? "shrink-0 whitespace-nowrap px-3 py-2" : "w-full px-3 py-2 text-left",
        section === s.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
      <s.icon className="h-4 w-4 shrink-0" />{s.label}
    </button>
  );

  return (
    <div className="min-h-dvh bg-muted/30">
      <SEOHead title={`${current.label} · Panel de creador | Descubre RD`} description="Panel privado del creador de contenido." />
      <Header />
      <div className="container mx-auto max-w-7xl px-4 pb-16 pt-24">
        {/* Cabecera del panel */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Panel de creador</p>
            {loading ? <Skeleton className="mt-2 h-8 w-64" /> : (
              <h1 className="mt-1 font-display text-2xl font-bold text-foreground md:text-3xl">
                {profile ? <>Hola, {profile.display_name} <span className="text-base font-medium text-muted-foreground">@{profile.handle}</span></> : "Tu panel"}
              </h1>
            )}
          </div>
          <div className="flex items-center gap-2">
            {profile && <Badge variant="outline" className="capitalize">Nivel {profile.tier}</Badge>}
            <Button asChild variant="ghost" size="sm"><Link to="/creadores">Sobre el programa</Link></Button>
          </div>
        </div>

        {/* Navegación móvil */}
        <nav aria-label="Secciones del panel" className="-mx-4 mb-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:hidden">
          {SECTIONS.map((s) => <NavButton key={s.key} s={s} compact />)}
        </nav>

        <div className="grid gap-6 lg:grid-cols-[15rem_1fr]">
          <aside className="hidden lg:block">
            <nav aria-label="Secciones del panel" className="sticky top-24 space-y-5 rounded-2xl border border-border bg-card p-3">
              {GROUPS.map((g) => (
                <div key={g}>
                  <p className="px-3 pb-1 text-2xs font-bold uppercase tracking-wider text-muted-foreground">{g}</p>
                  <div className="space-y-0.5">{SECTIONS.filter((s) => s.group === g).map((s) => <NavButton key={s.key} s={s} />)}</div>
                </div>
              ))}
            </nav>
          </aside>

          <main className="min-w-0">
            {isError && (
              <Card className="mb-6 border-destructive/40"><CardContent className="flex items-center justify-between gap-3 p-4 text-sm">
                <span>No pudimos cargar tus datos de creador.</span><Button size="sm" variant="outline" onClick={() => refetch()}>Reintentar</Button>
              </CardContent></Card>
            )}

            {section === "resumen" && (
              <div className="space-y-6">
                <CreatorsMetrics profile={profile} loading={loading} error={null} />
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { key: "contenidos" as const, title: "Mis contenidos", text: pendingReview ? `${videos.length} contenidos · ${pendingReview} en revisión` : `${videos.length} contenidos`, icon: Video },
                    { key: "campanas" as const, title: "Campañas abiertas", text: "Revisa términos, acepta y entrega.", icon: Megaphone },
                    { key: "ingresos" as const, title: "Ingresos", text: "Lo estimado, lo confirmado y los reversos.", icon: Receipt },
                  ].map((c) => (
                    <button key={c.key} type="button" onClick={() => go(c.key)} className="group rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/50">
                      <c.icon className="h-5 w-5 text-primary" />
                      <p className="mt-3 font-semibold text-foreground">{c.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">Abrir <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {section === "contenidos" && <CreatorsVideosTab creatorVideos={videos} loading={loading} hasProfile={!!profile} onAppealSubmitted={(a) => { setAppeals((prev) => [a, ...prev.filter((x) => x.id !== a.id)]); setAppealsReloadKey((k) => k + 1); }} />}
            {section === "campanas" && <CreatorsCampaignsTab videos={videos.map((v) => ({ id: v.id, title: v.title }))} />}
            {section === "estancias" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Hotel className="h-5 w-5 text-primary" />Estancias para creadores</CardTitle>
                  <CardDescription>Hoteles y operadores publican estancias con sus entregables. Allí te postulas, respondes invitaciones y envías lo acordado.</CardDescription>
                </CardHeader>
                <CardContent><Button asChild className="gap-2"><Link to="/creadores/estancias">Ver estancias e invitaciones <ArrowRight className="h-4 w-4" /></Link></Button></CardContent>
              </Card>
            )}
            {section === "afiliados" && <CreatorsAffiliatesTab />}
            {section === "ingresos" && <CreatorsEarningsTab />}
            {section === "pagos" && <CreatorsPayoutsTab profile={profile} payouts={dashboard?.payouts ?? []} />}
            {section === "identidad" && <CreatorsIdentityTab />}
            {section === "apelaciones" && <CreatorsAppealsTab appeals={appeals} reloadKey={appealsReloadKey} />}
          </main>
        </div>
      </div>
    </div>
  );
}
