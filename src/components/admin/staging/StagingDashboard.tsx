// Escritorio del panel (staging): resumen del contenido, lo pendiente y accesos rápidos.
// Lee las mismas listas que las demás pestañas (comparten caché de TanStack Query), sin endpoint propio.
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { fetchApi } from "@/lib/fastifyClient";
import { analyzeSeo, splitKeywords } from "@/lib/seoAnalysis";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SeoScore } from "./SeoAnalysisBox";

type Row = Record<string, unknown> & { id: string };
const s = (v: unknown) => (v == null ? "" : String(v));
const list = (path: string, enabled = true) => ({
  queryKey: ["staging", path], enabled,
  queryFn: async () => (await fetchApi<{ data: Row[] }>(`/admin/${path}`)).data,
});
const seo = (r: Row) => analyzeSeo({
  keywords: splitKeywords(s(r.focus_keywords)), title: s(r.title), seoTitle: s(r.seo_title), seoDescription: s(r.seo_description),
  slug: s(r.slug), excerpt: s(r.excerpt), body: s(r.body), imageAlt: s(r.image_alt), hasImage: Boolean(r.cover_url),
}).score;
const fmt = (iso: unknown) => (typeof iso === "string" && iso ? new Date(iso).toLocaleDateString("es-DO", { day: "numeric", month: "short" }) : "—");

export function StagingDashboard() {
  const { user } = useAuth();
  const roles = (user?.app_metadata?.roles as string[] | undefined) ?? [];
  const name = s(user?.user_metadata?.display_name ?? user?.user_metadata?.full_name ?? "").split(" ")[0];
  const [, setParams] = useSearchParams();
  const go = (seccion: string) => setParams({ seccion });
  const isAdmin = roles.includes("admin");
  const news = useQuery(list("news"));
  const provinces = useQuery(list("provinces"));
  const media = useQuery(list("media"));
  const leads = useQuery(list("leads", isAdmin));
  const requests = useQuery(list("establishment-requests", isAdmin));

  const rows = news.data ?? [];
  const nowIso = new Date().toISOString();
  const published = rows.filter((r) => r.status === "published" && s(r.published_at) <= nowIso);
  const scheduled = rows.filter((r) => r.status === "published" && s(r.published_at) > nowIso);
  const drafts = rows.filter((r) => r.status !== "published");
  const scores = rows.map(seo);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const weak = rows.map((r, i) => ({ r, score: scores[i] })).filter((x) => x.score < 50).slice(0, 5);
  const pendingRequests = (requests.data ?? []).filter((r) => r.status === "pending").length;

  const stats: { label: string; value: number | string; note?: string; to: string; show?: boolean }[] = [
    { label: "Noticias publicadas", value: published.length, note: `${scheduled.length} programadas · ${drafts.length} borradores`, to: "noticias" },
    { label: "Puntuación SEO media", value: rows.length ? `${avg}/100` : "—", note: `${weak.length ? `${rows.filter((_, i) => scores[i] < 50).length} por mejorar` : "Todo en orden"}`, to: "noticias" },
    { label: "Provincias", value: (provinces.data ?? []).length, note: `${(provinces.data ?? []).filter((p) => p.status === "published").length} publicadas`, to: "provincias" },
    { label: "Imágenes", value: (media.data ?? []).length, note: "en la biblioteca", to: "medios" },
    { label: "Suscriptores y participantes", value: (leads.data ?? []).length, note: "boletín y sorteo", to: "sorteo", show: isAdmin },
    { label: "Solicitudes de negocios", value: pendingRequests, note: "pendientes de revisar", to: "solicitudes-negocios", show: isAdmin },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString("es-DO", { weekday: "long", day: "numeric", month: "long" })}</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Hola{name ? `, ${name}` : ""}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => go("noticias")}>Escribir una noticia</Button>
          <Button variant="outline" onClick={() => go("medios")}>Subir imágenes</Button>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border lg:grid-cols-3">
        {stats.filter((x) => x.show !== false).map((x) => (
          <button key={x.label} type="button" onClick={() => go(x.to)} className="bg-card p-5 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <dt className="text-sm text-muted-foreground">{x.label}</dt>
            <dd className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">{news.isLoading ? <Skeleton className="h-8 w-16" /> : x.value}</dd>
            {x.note && <dd className="mt-1 text-xs text-muted-foreground">{x.note}</dd>}
          </button>
        ))}
      </dl>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-md border border-border bg-card">
          <h3 className="border-b border-border px-4 py-3 text-sm font-semibold">Actividad reciente</h3>
          <ul className="divide-y divide-border">
            {rows.slice(0, 6).map((r, i) => (
              <li key={r.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className="w-14 shrink-0 text-xs text-muted-foreground">{fmt(r.updated_at ?? r.created_at)}</span>
                <span className="min-w-0 flex-1 truncate">{s(r.title)}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{r.status === "published" ? (s(r.published_at) > nowIso ? "Programada" : "Publicada") : "Borrador"}</span>
                <SeoScore score={scores[i]} />
              </li>
            ))}
            {!rows.length && <li className="px-4 py-6 text-sm text-muted-foreground">Todavía no hay noticias. Empieza por la primera.</li>}
          </ul>
        </section>

        <section className="rounded-md border border-border bg-card">
          <h3 className="border-b border-border px-4 py-3 text-sm font-semibold">Para mejorar el SEO</h3>
          {weak.length ? (
            <ul className="divide-y divide-border">
              {weak.map(({ r, score }) => (
                <li key={r.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                  <span className="min-w-0 flex-1 truncate">{s(r.title)}</span>
                  <SeoScore score={score} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-6 text-sm text-muted-foreground">Ninguna noticia baja de 50 puntos.</p>
          )}
          {drafts.length > 0 && (
            <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">{drafts.length} borrador{drafts.length === 1 ? "" : "es"} esperando revisión o publicación.</p>
          )}
        </section>
      </div>
    </div>
  );
}
