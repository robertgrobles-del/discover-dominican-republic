// Escritorio del panel: la primera pantalla para todos los roles. Resume el contenido, lo pendiente y enlaza
// todas las secciones que el usuario puede ver (las recibe del panel, así las futuras aparecen solas).
// Lee las mismas listas que las demás pestañas (comparten caché de TanStack Query), sin endpoint propio.
import type { ComponentType } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { ArrowUpRight, PenLine, Upload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { fetchApi } from "@/lib/fastifyClient";
import { analyzeSeo, splitKeywords } from "@/lib/seoAnalysis";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SeoScore } from "./SeoAnalysisBox";

type Row = Record<string, unknown> & { id: string };
export interface DashboardSection { value: string; label: string; group: string; icon: ComponentType<{ className?: string }> }

const s = (v: unknown) => (v == null ? "" : String(v));
const ROLE_LABEL: Record<string, string> = { admin: "Administrador", editor: "Editor", autor: "Autor", colaborador: "Colaborador" };
const list = (path: string, enabled = true) => ({
  queryKey: ["staging", path], enabled,
  queryFn: async () => (await fetchApi<{ data: Row[] }>(`/admin/${path}`)).data,
});
const seo = (r: Row) => analyzeSeo({
  keywords: splitKeywords(s(r.focus_keywords)), title: s(r.title), seoTitle: s(r.seo_title), seoDescription: s(r.seo_description),
  slug: s(r.slug), excerpt: s(r.excerpt), body: s(r.body), imageAlt: s(r.image_alt), hasImage: Boolean(r.cover_url),
}).score;
const ago = (iso: unknown) => {
  if (typeof iso !== "string" || !iso) return "";
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (m < 60) return `hace ${Math.max(1, m)} min`;
  if (m < 1440) return `hace ${Math.round(m / 60)} h`;
  return new Date(iso).toLocaleDateString("es-DO", { day: "numeric", month: "short" });
};

export function StagingDashboard({ sections = [] }: { sections?: DashboardSection[] }) {
  const { user } = useAuth();
  const roles = (user?.app_metadata?.roles as string[] | undefined) ?? [];
  const name = s(user?.user_metadata?.display_name).split(" ")[0];
  const [, setParams] = useSearchParams();
  const go = (seccion: string) => setParams({ seccion });
  const has = (v: string) => sections.some((x) => x.value === v);
  const isAdmin = roles.includes("admin");

  const news = useQuery(list("news", has("noticias")));
  const provinces = useQuery(list("provinces", has("provincias")));
  const media = useQuery(list("media", has("medios")));
  const leads = useQuery(list("leads", isAdmin && has("sorteo")));
  const requests = useQuery(list("establishment-requests", isAdmin && has("solicitudes-negocios")));
  const messages = useQuery(list("contact-messages", isAdmin && has("mensajes")));

  const rows = news.data ?? [];
  const nowIso = new Date().toISOString();
  const published = rows.filter((r) => r.status === "published" && s(r.published_at) <= nowIso);
  const scheduled = rows.filter((r) => r.status === "published" && s(r.published_at) > nowIso);
  const drafts = rows.filter((r) => r.status !== "published");
  const scored = rows.map((r) => ({ r, score: seo(r) }));
  const avg = scored.length ? Math.round(scored.reduce((a, x) => a + x.score, 0) / scored.length) : 0;
  const band = { good: scored.filter((x) => x.score >= 70).length, ok: scored.filter((x) => x.score >= 45 && x.score < 70).length, bad: scored.filter((x) => x.score < 45).length };
  const weak = [...scored].sort((a, b) => a.score - b.score).filter((x) => x.score < 70).slice(0, 5);
  const pendingRequests = (requests.data ?? []).filter((r) => r.status === "pending").length;

  // Lo que pide atención, solo de las secciones que este usuario ve.
  const todo = [
    has("solicitudes-negocios") && pendingRequests > 0 && { text: `${pendingRequests} solicitud${pendingRequests === 1 ? "" : "es"} de negocio por revisar`, to: "solicitudes-negocios" },
    has("mensajes") && (messages.data ?? []).length > 0 && { text: `${(messages.data ?? []).length} mensaje${(messages.data ?? []).length === 1 ? "" : "s"} de contacto`, to: "mensajes" },
    has("noticias") && drafts.length > 0 && { text: `${drafts.length} borrador${drafts.length === 1 ? "" : "es"} sin publicar`, to: "noticias" },
    has("noticias") && band.bad > 0 && { text: `${band.bad} noticia${band.bad === 1 ? "" : "s"} con SEO bajo`, to: "noticias" },
  ].filter(Boolean) as { text: string; to: string }[];

  const stats = [
    has("noticias") && { label: "Noticias publicadas", value: published.length, note: `${scheduled.length} programadas`, to: "noticias", loading: news.isLoading },
    has("noticias") && { label: "SEO medio", value: rows.length ? avg : "—", note: "de 100 puntos", to: "noticias", loading: news.isLoading },
    has("provincias") && { label: "Provincias", value: (provinces.data ?? []).length, note: `${(provinces.data ?? []).filter((p) => p.status === "published").length} publicadas`, to: "provincias", loading: provinces.isLoading },
    has("medios") && { label: "Imágenes", value: (media.data ?? []).length, note: "en la biblioteca", to: "medios", loading: media.isLoading },
    has("sorteo") && { label: "Suscriptores", value: (leads.data ?? []).length, note: "boletín y sorteo", to: "sorteo", loading: leads.isLoading },
  ].filter(Boolean) as { label: string; value: number | string; note: string; to: string; loading: boolean }[];

  const groups = sections.reduce<Record<string, DashboardSection[]>>((g, x) => ({ ...g, [x.group]: [...(g[x.group] ?? []), x] }), {});

  return (
    <div className="space-y-10">
      {/* Saludo y acciones */}
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-border pb-6">
        <div>
          <p className="text-sm capitalize text-muted-foreground">{new Date().toLocaleDateString("es-DO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">Hola{name ? `, ${name}` : ""}</h2>
          {roles[0] && <p className="mt-1 text-sm text-muted-foreground">Entraste como <span className="font-medium text-foreground">{ROLE_LABEL[roles[0]] ?? roles[0]}</span></p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {has("noticias") && <Button onClick={() => go("noticias")} className="gap-2 active:scale-[0.98]"><PenLine className="h-4 w-4" />Escribir una noticia</Button>}
          {has("medios") && <Button variant="outline" onClick={() => go("medios")} className="gap-2 active:scale-[0.98]"><Upload className="h-4 w-4" />Subir imágenes</Button>}
        </div>
      </header>

      {/* Cifras */}
      {stats.length > 0 && (
        <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((x, i) => (
            <button key={x.label} type="button" onClick={() => go(x.to)}
              className={`group py-2 pr-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${i ? "sm:border-l sm:border-border sm:pl-5" : ""}`}>
              <dt className="text-sm text-muted-foreground group-hover:text-foreground">{x.label}</dt>
              <dd className="mt-1 text-4xl font-semibold tabular-nums tracking-tight">{x.loading ? <Skeleton className="h-10 w-14" /> : x.value}</dd>
              <dd className="mt-0.5 text-xs text-muted-foreground">{x.note}</dd>
            </button>
          ))}
        </dl>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Actividad reciente */}
        {has("noticias") && (
          <section aria-labelledby="dash-actividad">
            <div className="flex items-baseline justify-between">
              <h3 id="dash-actividad" className="font-semibold">Actividad reciente</h3>
              <button type="button" onClick={() => go("noticias")} className="text-sm text-primary hover:underline">Ver todas</button>
            </div>
            <ul className="mt-3 divide-y divide-border border-y border-border">
              {news.isLoading && [0, 1, 2].map((i) => <li key={i} className="py-3"><Skeleton className="h-5 w-full" /></li>)}
              {scored.slice(0, 7).map(({ r, score }) => {
                const st = r.status !== "published" ? ["Borrador", "bg-muted-foreground"] : s(r.published_at) > nowIso ? ["Programada", "bg-amber-500"] : ["Publicada", "bg-emerald-500"];
                return (
                  <li key={r.id} className="flex items-center gap-3 py-3 text-sm">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${st[1]}`} title={st[0]} aria-label={st[0]} />
                    <span className="min-w-0 flex-1 truncate">{s(r.title)}</span>
                    <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">{ago(r.updated_at ?? r.created_at)}</span>
                    <SeoScore score={score} />
                  </li>
                );
              })}
              {!news.isLoading && !rows.length && <li className="py-6 text-sm text-muted-foreground">Todavía no hay noticias. Escribe la primera.</li>}
            </ul>
          </section>
        )}

        <div className="space-y-8">
          {/* Pendientes */}
          <section aria-labelledby="dash-pendiente">
            <h3 id="dash-pendiente" className="font-semibold">Pendiente</h3>
            {todo.length ? (
              <ul className="mt-3 space-y-1">
                {todo.map((t) => (
                  <li key={t.text}>
                    <button type="button" onClick={() => go(t.to)} className="flex w-full items-center justify-between rounded px-2 py-2 text-left text-sm transition-colors hover:bg-muted">
                      {t.text}<ArrowUpRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-3 text-sm text-muted-foreground">Nada pendiente. Todo al día.</p>}
          </section>

          {/* Salud SEO */}
          {has("noticias") && rows.length > 0 && (
            <section aria-labelledby="dash-seo">
              <h3 id="dash-seo" className="font-semibold">Salud SEO</h3>
              <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${band.good} buenas, ${band.ok} mejorables, ${band.bad} bajas`}>
                <span className="bg-emerald-500" style={{ width: `${(band.good / rows.length) * 100}%` }} />
                <span className="bg-amber-500" style={{ width: `${(band.ok / rows.length) * 100}%` }} />
                <span className="bg-red-500" style={{ width: `${(band.bad / rows.length) * 100}%` }} />
              </div>
              <p className="mt-2 flex gap-4 text-xs text-muted-foreground tabular-nums">
                <span>{band.good} buenas</span><span>{band.ok} mejorables</span><span>{band.bad} bajas</span>
              </p>
              {weak.length > 0 && (
                <ul className="mt-3 divide-y divide-border text-sm">
                  {weak.map(({ r, score }) => (
                    <li key={r.id} className="flex items-center gap-3 py-2"><span className="min-w-0 flex-1 truncate">{s(r.title)}</span><SeoScore score={score} /></li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      </div>

      {/* Todas las secciones a las que tiene acceso (las nuevas aparecen solas) */}
      {sections.length > 0 && (
        <section aria-labelledby="dash-secciones" className="border-t border-border pt-8">
          <h3 id="dash-secciones" className="font-semibold">Tus secciones</h3>
          <div className="mt-4 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {Object.entries(groups).map(([group, items]) => (
              <div key={group}>
                <p className="mb-2 text-xs text-muted-foreground">{group}</p>
                <ul className="space-y-1">
                  {items.map((x) => (
                    <li key={x.value}>
                      <button type="button" onClick={() => go(x.value)} className="group flex w-full items-center gap-3 rounded px-2 py-2 text-left text-sm transition-colors hover:bg-muted">
                        <x.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                        <span className="flex-1">{x.label}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
