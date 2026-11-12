// Escritorio del panel de administración: resumen estructurado del catálogo, bandeja de pendientes,
// actividad reciente y recuperación de borradores locales.
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileEdit,
  History,
  Image as ImageIcon,
  Inbox,
  Landmark,
  Mail,
  MapPin,
  Newspaper,
  Pencil,
  Plus,
  SearchCheck,
  Trash2,
  Waves,
} from "lucide-react";
import { fetchApi } from "@/lib/fastifyClient";
import { Button } from "@/components/ui/button";
import { analyzeSeo, splitKeywords } from "@/lib/seoAnalysis";
import {
  AUTOSAVE_EVENT,
  RESOURCE_LABELS,
  RESOURCE_TO_TAB,
  discardLocalDraftRecord,
  formatRelativeTimeEs,
  listLocalDrafts,
  type LocalDraftRecord,
} from "./useDraftAutosave";

type Row = Record<string, unknown> & { id: string };
type SectionRef = { value: string; label: string; icon: LucideIcon; group: string };
const EMPTY: Row[] = [];

const ago = (iso: string | undefined | null) => {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso.replace(" ", "T")).getTime()) / 1000;
  if (!Number.isFinite(diff) || diff < 0) return "";
  if (diff < 60) return "ahora mismo";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86_400) return `hace ${Math.floor(diff / 3600)} h`;
  const days = Math.floor(diff / 86_400);
  if (days < 30) return `hace ${days} día${days === 1 ? "" : "s"}`;
  return new Date(iso).toLocaleDateString("es-DO", { day: "numeric", month: "short" });
};

const toTs = (iso: unknown): number => {
  if (typeof iso !== "string" || !iso) return 0;
  const ms = Date.parse(iso.replace(" ", "T"));
  return Number.isFinite(ms) ? ms : 0;
};

function Panel({ title, subtitle, icon: Icon, right, noPadding, children }: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  right?: React.ReactNode;
  noPadding?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            <span>{title}</span>
          </h2>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {right}
      </header>
      <div className={noPadding ? "" : "p-4 sm:p-5"}>{children}</div>
    </section>
  );
}

const useStagingList = (resource: string, enabled: boolean) =>
  useQuery({
    queryKey: ["staging", resource],
    queryFn: async () => (await fetchApi<{ data: Row[] }>(`/admin/${resource}`)).data,
    enabled,
    retry: false,
  });

export function StagingDashboard({ sections }: { sections: SectionRef[] }) {
  const has = (v: string) => sections.some((s) => s.value === v);

  const [localDrafts, setLocalDrafts] = useState<LocalDraftRecord[]>(() => listLocalDrafts());
  useEffect(() => {
    const sync = () => setLocalDrafts(listLocalDrafts());
    window.addEventListener(AUTOSAVE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTOSAVE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const newsQ = useStagingList("news", has("noticias"));
  const provincesQ = useStagingList("provinces", has("provincias"));
  const municipalitiesQ = useStagingList("municipalities", has("municipios"));
  const destinationsQ = useStagingList("destinations", has("destinos"));
  const beachesQ = useStagingList("beaches", has("playas"));
  const eventsQ = useStagingList("events", has("eventos"));
  const venuesQ = useStagingList("venues", has("recintos"));
  const mediaQ = useStagingList("media", has("medios"));
  const leadsQ = useStagingList("leads", has("sorteo"));
  const reqsQ = useStagingList("establishment-requests", has("solicitudes-negocios"));
  const msgsQ = useStagingList("contact-messages", has("mensajes"));

  const news = newsQ.data ?? EMPTY;
  const provinces = provincesQ.data ?? EMPTY;
  const municipalities = municipalitiesQ.data ?? EMPTY;
  const destinations = destinationsQ.data ?? EMPTY;
  const beaches = beachesQ.data ?? EMPTY;
  const events = eventsQ.data ?? EMPTY;
  const venues = venuesQ.data ?? EMPTY;
  const media = mediaQ.data ?? EMPTY;
  const leads = leadsQ.data ?? EMPTY;
  const reqs = reqsQ.data ?? EMPTY;
  const msgs = msgsQ.data ?? EMPTY;

  const newsPub = useMemo(() => news.filter((n) => n.status === "published"), [news]);
  const newsDrafts = news.filter((n) => n.status !== "published");
  const beachesPub = beaches.filter((b) => b.status === "published");
  const eventsPub = events.filter((e) => e.status === "published");
  const eventsFromPublic = events.filter((e) => e.status !== "published" && Boolean(e.submitted_by));
  const venuesPub = venues.filter((v) => v.status === "published");
  const provPub = provinces.filter((p) => p.status === "published");
  const muniPub = municipalities.filter((m) => m.status === "published");
  const destPub = destinations.filter((d) => d.status === "published");

  const reqPending = reqs.filter((r) => String(r.status ?? "pending") === "pending");

  const seoHealth = useMemo(() => {
    let good = 0; let needs = 0;
    for (const a of newsPub) {
      const r = analyzeSeo({
        keywords: splitKeywords(String(a.focus_keywords ?? "")),
        title: String(a.title ?? ""),
        excerpt: String(a.excerpt ?? ""),
        body: String(a.body ?? ""),
        seoTitle: String(a.seo_title ?? ""),
        seoDescription: String(a.seo_description ?? ""),
        slug: String(a.slug ?? ""),
        imageAlt: String(a.image_alt ?? ""),
        hasImage: Boolean(a.cover_url ?? a.image_url),
      });
      if (r.score >= 70) good += 1;
      else needs += 1;
    }
    return { good, needs, total: newsPub.length };
  }, [newsPub]);

  const catalogRows = [
    has("provincias") && { label: "Provincias", icon: MapPin, pub: provPub.length, total: provinces.length, to: "/admin?seccion=provincias" },
    has("municipios") && { label: "Municipios", icon: MapPin, pub: muniPub.length, total: municipalities.length, to: "/admin?seccion=municipios" },
    has("destinos") && { label: "Destinos", icon: Landmark, pub: destPub.length, total: destinations.length, to: "/admin?seccion=destinos" },
    has("playas") && { label: "Playas", icon: Waves, pub: beachesPub.length, total: beaches.length, to: "/admin?seccion=playas" },
    has("recintos") && { label: "Recintos", icon: Landmark, pub: venuesPub.length, total: venues.length, to: "/admin?seccion=recintos" },
    has("eventos") && { label: "Eventos", icon: CalendarDays, pub: eventsPub.length, total: events.length, to: "/admin?seccion=eventos" },
    has("noticias") && { label: "Noticias", icon: Newspaper, pub: newsPub.length, total: news.length, to: "/admin?seccion=noticias", note: seoHealth.total > 0 ? `${seoHealth.good}/${seoHealth.total} SEO óptimo` : undefined },
  ].filter(Boolean) as { label: string; icon: LucideIcon; pub: number; total: number; to: string; note?: string }[];

  const totalCatalog = catalogRows.reduce((acc, r) => acc + r.total, 0);
  const totalPublished = catalogRows.reduce((acc, r) => acc + r.pub, 0);
  const totalDrafts = totalCatalog - totalPublished;
  const inboxCount = reqPending.length + eventsFromPublic.length + msgs.length;

  const recentActivity = useMemo(() => {
    const items: { id: string; title: string; section: string; tab: string; status: string; updatedAt: string; ts: number }[] = [];
    const pushRows = (rows: Row[], section: string, tab: string, titleField: string) => {
      for (const r of rows) {
        const updatedAt = String(r.updated_at ?? r.created_at ?? "");
        items.push({
          id: r.id,
          title: String(r[titleField] ?? "Sin título"),
          section,
          tab,
          status: String(r.status ?? "draft"),
          updatedAt,
          ts: toTs(updatedAt),
        });
      }
    };
    pushRows(news, "Noticias", "noticias", "title");
    pushRows(beaches, "Playas", "playas", "name");
    pushRows(events, "Eventos", "eventos", "name");
    pushRows(venues, "Recintos", "recintos", "name");
    pushRows(provinces, "Provincias", "provincias", "name");
    pushRows(municipalities, "Municipios", "municipios", "name");
    pushRows(destinations, "Destinos", "destinos", "name");
    return items.sort((a, b) => b.ts - a.ts).slice(0, 7);
  }, [news, beaches, events, venues, provinces, municipalities, destinations]);

  const todo = [
    reqPending.length > 0 && { label: "Solicitudes de negocios pendientes", count: reqPending.length, to: "/admin?seccion=solicitudes-negocios", icon: Building2, tone: "text-amber-600 dark:text-amber-400" },
    eventsFromPublic.length > 0 && { label: "Eventos enviados por la comunidad", count: eventsFromPublic.length, to: "/admin?seccion=eventos", icon: CalendarDays, tone: "text-amber-600 dark:text-amber-400" },
    msgs.length > 0 && { label: "Mensajes de contacto recibidos", count: msgs.length, to: "/admin?seccion=mensajes", icon: Mail, tone: "text-primary" },
    newsDrafts.length > 0 && { label: "Noticias en borrador", count: newsDrafts.length, to: "/admin?seccion=noticias", icon: FileEdit, tone: "text-muted-foreground" },
    (beaches.length - beachesPub.length) > 0 && { label: "Playas en borrador", count: beaches.length - beachesPub.length, to: "/admin?seccion=playas", icon: Waves, tone: "text-muted-foreground" },
    seoHealth.needs > 0 && { label: "Noticias publicadas con SEO mejorable", count: seoHealth.needs, to: "/admin?seccion=noticias", icon: SearchCheck, tone: "text-muted-foreground" },
  ].filter(Boolean) as { label: string; count: number; to: string; icon: LucideIcon; tone: string }[];

  const quickActions = [
    has("noticias") && { label: "Escribir noticia", desc: "Artículo editorial o guía", to: "/admin?seccion=noticias&nuevo=1", icon: Newspaper },
    has("playas") && { label: "Añadir playa", desc: "Ficha completa con mapa", to: "/admin?seccion=playas&nuevo=1", icon: Waves },
    has("eventos") && { label: "Publicar evento", desc: "Feria, concierto o actividad", to: "/admin?seccion=eventos&nuevo=1", icon: CalendarDays },
    has("medios") && { label: "Subir imágenes", desc: "Biblioteca compartida", to: "/admin?seccion=medios", icon: ImageIcon },
  ].filter(Boolean) as { label: string; desc: string; to: string; icon: LucideIcon }[];

  return (
    <div className="space-y-6">
      {/* Cinta unificada de métricas principales */}
      <section aria-label="Indicadores generales" className="grid divide-y divide-border overflow-hidden rounded-lg border border-border bg-card shadow-xs sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
        <Link to="/admin?seccion=noticias" className="group block p-4 transition-colors hover:bg-muted/30 sm:p-5">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Publicaciones activas</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-foreground">{totalPublished}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            de {totalCatalog} ficha{totalCatalog === 1 ? "" : "s"} en el catálogo
          </p>
        </Link>

        <Link to="/admin?seccion=noticias" className="group block p-4 transition-colors hover:bg-muted/30 sm:p-5">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Borradores abiertos</span>
            <FileEdit className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-foreground">{totalDrafts}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {localDrafts.length > 0
              ? `${localDrafts.length} respaldo${localDrafts.length === 1 ? "" : "s"} en este equipo`
              : "Autoguardado servidor cada 5 min"}
          </p>
        </Link>

        <Link
          to={reqPending.length > 0 ? "/admin?seccion=solicitudes-negocios" : msgs.length > 0 ? "/admin?seccion=mensajes" : "/admin?seccion=eventos"}
          className="group block p-4 transition-colors hover:bg-muted/30 sm:p-5"
        >
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Bandeja por revisar</span>
            <Inbox className={`h-4 w-4 ${inboxCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`} />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-foreground">{inboxCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {reqPending.length} negocio{reqPending.length === 1 ? "" : "s"} · {msgs.length} mensaje{msgs.length === 1 ? "" : "s"}
          </p>
        </Link>

        <Link to={has("medios") ? "/admin?seccion=medios" : "/admin?seccion=provincias"} className="group block p-4 transition-colors hover:bg-muted/30 sm:p-5">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Recursos y comunidad</span>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-foreground">{media.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            archivo{media.length === 1 ? "" : "s"} en medios{has("sorteo") ? ` · ${leads.length} en sorteo` : ""}
          </p>
        </Link>
      </section>

      {/* Borradores recuperados tras apagón, cierre inesperado o falta de internet */}
      {localDrafts.length > 0 && (
        <Panel
          title={`Borradores recuperados en este equipo (${localDrafts.length})`}
          subtitle="Cambios pendientes de sincronizar guardados ante cierre inesperado, corte eléctrico o desconexión."
          icon={History}
          noPadding
        >
          <ul className="divide-y divide-border">
            {localDrafts.map((d) => {
              const tab = RESOURCE_TO_TAB[d.resource];
              const label = RESOURCE_LABELS[d.resource] ?? d.resource;
              const editUrl = tab ? `/admin?seccion=${tab}&editar=${encodeURIComponent(d.itemId)}` : "/admin";
              return (
                <li key={`${d.resource}:${d.itemId}`} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                        {label} · {d.itemId === "new" ? "Nuevo" : "En edición"}
                      </span>
                      <span className="truncate text-sm font-medium text-foreground">{d.title}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Guardado localmente {formatRelativeTimeEs(d.updatedAt)}
                      {d.pendingSync ? " · Se subirá automáticamente al volver internet" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" asChild>
                      <Link to={editUrl}>Continuar</Link>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      title="Descartar copia local"
                      onClick={() => discardLocalDraftRecord(d.resource, d.itemId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}

      {/* Área operativa principal en 2 columnas */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          {/* Tabla de actividad reciente */}
          <Panel
            title="Actividad reciente"
            subtitle="Últimas fichas creadas o modificadas en el portal"
            icon={Clock}
            noPadding
            right={has("noticias") && (
              <Link to="/admin?seccion=noticias" className="text-xs font-medium text-primary hover:underline">
                Ver todo
              </Link>
            )}
          >
            {recentActivity.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">Aún no hay actividad registrada.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2.5 font-medium sm:px-5">Título</th>
                      <th className="px-3 py-2.5 font-medium">Sección</th>
                      <th className="px-3 py-2.5 font-medium">Estado</th>
                      <th className="px-3 py-2.5 font-medium text-right sm:px-5">Edición</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentActivity.map((item) => {
                      const isPub = item.status === "published";
                      return (
                        <tr key={`${item.tab}:${item.id}`} className="transition-colors hover:bg-muted/20">
                          <td className="max-w-[260px] px-4 py-2.5 sm:px-5">
                            <Link
                              to={`/admin?seccion=${item.tab}&editar=${encodeURIComponent(item.id)}`}
                              className="block truncate font-medium text-foreground hover:text-primary hover:underline"
                            >
                              {item.title}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-xs text-muted-foreground">{item.section}</td>
                          <td className="whitespace-nowrap px-3 py-2.5">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                isPub
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {isPub ? "Publicado" : "Borrador"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-right text-xs text-muted-foreground tabular-nums sm:px-5">
                            <span className="inline-flex items-center gap-2">
                              <span>{ago(item.updatedAt)}</span>
                              <Link
                                to={`/admin?seccion=${item.tab}&editar=${encodeURIComponent(item.id)}`}
                                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                title="Abrir en el editor"
                                aria-label={`Editar ${item.title}`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Link>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          {/* Estado consolidado del catálogo y SEO */}
          {catalogRows.length > 0 && (
            <Panel
              title="Cobertura del catálogo"
              subtitle="Proporción de fichas publicadas por módulo"
              icon={Landmark}
              noPadding
            >
              <div className="divide-y divide-border">
                {catalogRows.map((row) => {
                  const pct = row.total > 0 ? Math.round((row.pub / row.total) * 100) : 0;
                  const drafts = row.total - row.pub;
                  return (
                    <div key={row.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:grid-cols-[150px_minmax(0,1fr)_auto] sm:px-5">
                      <Link to={row.to} className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary hover:underline">
                        <row.icon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{row.label}</span>
                      </Link>
                      <div className="hidden items-center gap-3 sm:flex">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">{pct}%</span>
                      </div>
                      <div className="text-right text-xs tabular-nums text-muted-foreground">
                        <span className="font-medium text-foreground">{row.pub}</span>/{row.total}
                        {drafts > 0 && <span className="ml-1.5">· {drafts} borrador{drafts === 1 ? "" : "es"}</span>}
                        {row.note && <span className="ml-2 hidden text-[11px] text-emerald-700 dark:text-emerald-400 md:inline">({row.note})</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          )}
        </div>

        {/* Columna derecha: Pendientes + Crear nuevo */}
        <div className="space-y-6">
          <Panel
            title="Por atender"
            subtitle="Tareas y elementos que requieren revisión"
            icon={Inbox}
            noPadding
          >
            {todo.length === 0 ? (
              <p className="flex items-center gap-2 p-5 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Todo al día. No hay solicitudes ni tareas urgentes.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {todo.map((t) => (
                  <li key={t.label}>
                    <Link
                      to={t.to}
                      className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/20 sm:px-5"
                    >
                      <span className="flex min-w-0 items-center gap-2.5 text-foreground">
                        <t.icon className={`h-4 w-4 shrink-0 ${t.tone}`} />
                        <span className="truncate">{t.label}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums text-foreground">
                          {t.count}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {quickActions.length > 0 && (
            <Panel
              title="Crear nuevo"
              subtitle="Acceso directo a los editores principales"
              icon={Plus}
              noPadding
            >
              <ul className="divide-y divide-border">
                {quickActions.map((a) => (
                  <li key={a.to}>
                    <Link
                      to={a.to}
                      className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/20 sm:px-5"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 text-foreground">
                          <a.icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-foreground">{a.label}</span>
                          <span className="block text-xs text-muted-foreground">{a.desc}</span>
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
