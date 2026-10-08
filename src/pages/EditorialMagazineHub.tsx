import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Clock, PenLine, Search, X } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  EDITORIAL_CHANNELS, channelLabel, formatEditorialDate, sendEditorialProposal, useEditorialArticles,
  type EditorialArticle, type EditorialChannelId,
} from "@/lib/editorialApi";

/** Nombres de canal de versiones anteriores (`?canal=experiencias`), para que los enlaces viejos sigan funcionando. */
const LEGACY_CHANNEL: Record<string, EditorialChannelId> = { experiencias: "viajes", blog: "viajes", invitados: "firmas", magazine: "viajes" };

function resolveChannel(raw: string | null): EditorialChannelId | null {
  if (!raw) return null;
  if (EDITORIAL_CHANNELS.some((c) => c.id === raw)) return raw as EditorialChannelId;
  return LEGACY_CHANNEL[raw] ?? null;
}

function Meta({ article, light = false }: { article: EditorialArticle; light?: boolean }) {
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 text-xs", light ? "text-white/80" : "text-muted-foreground")}>
      <span className="font-medium">{article.authorName}</span>
      {article.publishedAt && <><span aria-hidden="true">·</span><time dateTime={article.publishedAt}>{formatEditorialDate(article.publishedAt)}</time></>}
      {article.readMinutes ? <><span aria-hidden="true">·</span><span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {article.readMinutes} min</span></> : null}
    </p>
  );
}

function Kicker({ article, light = false }: { article: EditorialArticle; light?: boolean }) {
  return (
    <span className={cn("text-[11px] font-bold uppercase tracking-[0.18em]", light ? "text-white" : "text-primary")}>
      {channelLabel(article.channel)}{article.pressPartner ? ` · ${article.pressPartner}` : ""}
    </span>
  );
}

function Cover({ article, className }: { article: EditorialArticle; className?: string }) {
  return (
    <div className={cn("overflow-hidden bg-muted", className)}>
      {article.image
        ? <img src={article.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        : <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-secondary/40 font-display text-4xl font-bold text-primary/40" aria-hidden="true">RD</div>}
    </div>
  );
}

/** Tarjeta de rejilla: imagen arriba, texto abajo. */
function ArticleCard({ article }: { article: EditorialArticle }) {
  return (
    <Link to={article.href} className="group flex flex-col">
      <Cover article={article} className="aspect-[4/3] rounded-2xl" />
      <div className="pt-4 space-y-2">
        <Kicker article={article} />
        <h3 className="font-display text-xl font-bold leading-snug text-foreground group-hover:text-primary transition-colors">{article.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
        <Meta article={article} />
      </div>
    </Link>
  );
}

/** Fila compacta: texto a la izquierda, miniatura a la derecha. */
function ArticleRow({ article, index }: { article: EditorialArticle; index?: number }) {
  return (
    <Link to={article.href} className="group flex gap-4 py-4">
      {index !== undefined && <span className="font-display text-3xl font-bold leading-none text-primary/30 tabular-nums w-8 shrink-0">{index + 1}</span>}
      <div className="flex-1 min-w-0 space-y-1.5">
        <Kicker article={article} />
        <h3 className="font-display text-base font-bold leading-snug text-foreground group-hover:text-primary transition-colors">{article.title}</h3>
        <Meta article={article} />
      </div>
      <Cover article={article} className="h-20 w-20 shrink-0 rounded-xl" />
    </Link>
  );
}

export default function EditorialMagazineHub() {
  const [params, setParams] = useSearchParams();
  const active = resolveChannel(params.get("canal") ?? params.get("categoria"));
  const [search, setSearch] = useState("");
  const { data: articles = [], isLoading, isError, refetch } = useEditorialArticles();

  const [proposalKind, setProposalKind] = useState<"invitado" | "prensa" | null>(null);
  const [proposal, setProposal] = useState({ name: "", email: "", organization: "", title: "", body: "", link: "" });
  const [sending, setSending] = useState(false);

  const counts = useMemo(() => {
    const map = new Map<EditorialChannelId, number>();
    for (const a of articles) map.set(a.channel, (map.get(a.channel) ?? 0) + 1);
    return map;
  }, [articles]);
  const channels = EDITORIAL_CHANNELS.filter((c) => (counts.get(c.id) ?? 0) > 0);

  const query = search.trim().toLowerCase();
  const filtered = useMemo(() => articles.filter((a) => {
    if (active && a.channel !== active) return false;
    if (!query) return true;
    return [a.title, a.excerpt, a.authorName, ...a.tags].some((text) => text.toLowerCase().includes(query));
  }), [articles, active, query]);

  const browsing = Boolean(active) || Boolean(query);
  const lead = articles.find((a) => a.featured) ?? articles[0];
  // Junto a la nota principal, la más reciente de cada una de las otras secciones (para que la portada no sea de un solo tema).
  const secondary = useMemo(() => {
    const rest = articles.filter((a) => a.id !== lead?.id);
    const perChannel = EDITORIAL_CHANNELS.filter((c) => c.id !== lead?.channel).map((c) => rest.find((a) => a.channel === c.id)).filter((a): a is EditorialArticle => Boolean(a));
    return [...perChannel, ...rest.filter((a) => !perChannel.includes(a))].slice(0, 3);
  }, [articles, lead]);
  const frontIds = new Set([lead?.id, ...secondary.map((a) => a.id)]);
  const latest = articles.filter((a) => !frontIds.has(a.id)).slice(0, 5);
  const activeChannel = EDITORIAL_CHANNELS.find((c) => c.id === active);

  const selectChannel = (id: EditorialChannelId | null) => setParams(id ? { canal: id } : {}, { replace: true });

  const submitProposal = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!proposalKind) return;
    if (proposal.body.trim().length < 10) { toast.error("Cuéntanos un poco más sobre tu propuesta."); return; }
    setSending(true);
    try {
      await sendEditorialProposal({ kind: proposalKind, ...proposal });
      toast.success("Propuesta enviada", { description: "El equipo editorial la revisará y te escribirá al correo que indicaste." });
      setProposalKind(null);
      setProposal({ name: "", email: "", organization: "", title: "", body: "", link: "" });
    } catch (error) {
      toast.error("No se pudo enviar la propuesta", { description: error instanceof Error ? error.message : undefined });
    } finally {
      setSending(false);
    }
  };

  return (
    <PageTransition>
      <SEOHead
        title={`${activeChannel ? `${activeChannel.label} · ` : ""}Revista Descubre RD: blog, noticias y crónicas`}
        description="Blog de viajes, noticias del turismo, comunicados, firmas invitadas y crónicas de historia de la República Dominicana, en un solo lugar."
      />
      <Header />

      <main className="min-h-screen bg-background pt-28 pb-20">
        {/* Cabecera de la revista */}
        <header className="container mx-auto px-4">
          <div className="flex flex-col gap-6 border-b-2 border-foreground pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">Revista</p>
              <h1 className="mt-2 font-display text-5xl font-bold leading-none tracking-tight text-foreground md:text-7xl">Descubre RD</h1>
              <p className="mt-3 max-w-xl text-muted-foreground">Viajes, noticias, voces y memoria de la República Dominicana.</p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar en la revista" aria-label="Buscar en la revista" className="pl-9 pr-9" />
              {search && (
                <button type="button" onClick={() => setSearch("")} aria-label="Borrar búsqueda" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Canales */}
          <nav aria-label="Secciones de la revista" className="-mx-4 flex gap-1 overflow-x-auto px-4 py-3 no-scrollbar">
            <button type="button" onClick={() => selectChannel(null)} aria-current={!active ? "page" : undefined}
              className={cn("whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors", !active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              Portada
            </button>
            {channels.map((channel) => (
              <button key={channel.id} type="button" onClick={() => selectChannel(channel.id)} aria-current={active === channel.id ? "page" : undefined}
                className={cn("whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors", active === channel.id ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                {channel.label} <span className="ml-1 text-xs opacity-60">{counts.get(channel.id)}</span>
              </button>
            ))}
          </nav>
        </header>

        <div className="container mx-auto px-4">
          {isLoading && (
            <div className="grid gap-8 py-8 lg:grid-cols-3" aria-busy="true" aria-label="Cargando publicaciones">
              <Skeleton className="aspect-[16/10] rounded-3xl lg:col-span-2" />
              <div className="space-y-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
            </div>
          )}

          {isError && (
            <div className="py-20 text-center space-y-3">
              <p className="font-display text-2xl font-bold">No pudimos cargar la revista.</p>
              <p className="text-muted-foreground">Revisa tu conexión e inténtalo otra vez.</p>
              <Button variant="outline" onClick={() => refetch()}>Reintentar</Button>
            </div>
          )}

          {!isLoading && !isError && articles.length === 0 && (
            <p className="py-20 text-center text-muted-foreground">Todavía no hay publicaciones.</p>
          )}

          {/* Portada */}
          {!isLoading && !isError && !browsing && lead && (
            <>
              <section aria-label="En portada" className="grid gap-8 py-8 lg:grid-cols-3">
                <Link to={lead.href} className="group relative isolate flex min-h-[26rem] flex-col justify-end overflow-hidden rounded-3xl lg:col-span-2">
                  <Cover article={lead} className="absolute inset-0 -z-20" />
                  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                  <div className="space-y-3 p-6 md:p-10">
                    <Kicker article={lead} light />
                    <h2 className="font-display text-3xl font-bold leading-tight text-white md:text-5xl">{lead.title}</h2>
                    <p className="max-w-2xl text-white/85 line-clamp-2">{lead.excerpt}</p>
                    <Meta article={lead} light />
                  </div>
                </Link>
                <div className="divide-y divide-border">
                  {secondary.map((article) => <ArticleRow key={article.id} article={article} />)}
                </div>
              </section>

              {latest.length > 0 && (
                <section aria-labelledby="lo-ultimo" className="grid gap-10 border-t border-border py-10 lg:grid-cols-3">
                  <div>
                    <h2 id="lo-ultimo" className="font-display text-3xl font-bold">Lo último</h2>
                    <p className="mt-2 text-sm text-muted-foreground">Las publicaciones más recientes de todas las secciones.</p>
                  </div>
                  <div className="divide-y divide-border lg:col-span-2">
                    {latest.map((article, index) => <ArticleRow key={article.id} article={article} index={index} />)}
                  </div>
                </section>
              )}

              {channels.map((channel) => {
                const items = articles.filter((a) => a.channel === channel.id).slice(0, 3);
                return (
                  <section key={channel.id} aria-labelledby={`canal-${channel.id}`} className="border-t border-border py-10">
                    <div className="mb-6 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{channel.kicker}</p>
                        <h2 id={`canal-${channel.id}`} className="font-display text-3xl font-bold">{channel.label}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">{channel.description}</p>
                      </div>
                      {(counts.get(channel.id) ?? 0) > items.length && (
                        <Button variant="ghost" className="shrink-0" onClick={() => { selectChannel(channel.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                          Ver todo <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((article) => <ArticleCard key={article.id} article={article} />)}
                    </div>
                  </section>
                );
              })}
            </>
          )}

          {/* Una sección o una búsqueda */}
          {!isLoading && !isError && browsing && (
            <section className="py-8">
              <div className="mb-8">
                <h2 className="font-display text-4xl font-bold">{activeChannel?.label ?? "Resultados"}</h2>
                <p className="mt-1 text-muted-foreground">
                  {query ? `${filtered.length} ${filtered.length === 1 ? "resultado" : "resultados"} para «${search.trim()}»` : activeChannel?.description}
                </p>
              </div>
              {filtered.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <p className="font-semibold">No encontramos publicaciones.</p>
                  <Button variant="outline" onClick={() => { setSearch(""); selectChannel(null); }}>Volver a la portada</Button>
                </div>
              ) : (
                <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((article) => <ArticleCard key={article.id} article={article} />)}
                </div>
              )}
            </section>
          )}

          {/* Colaborar */}
          <section className="mt-6 grid gap-6 rounded-3xl bg-foreground p-8 text-background md:grid-cols-[1fr_auto] md:items-center md:p-12">
            <div>
              <PenLine className="mb-3 h-6 w-6" />
              <h2 className="font-display text-3xl font-bold">Escribe en la revista</h2>
              <p className="mt-2 max-w-xl opacity-80">Propón un artículo o envía el comunicado de tu institución. El equipo editorial lo revisa antes de publicarlo.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setProposalKind("invitado")}>Proponer un artículo <ArrowUpRight className="ml-1 h-4 w-4" /></Button>
              <Button variant="outline" className="border-background/40 bg-transparent text-background hover:bg-background/10 hover:text-background" onClick={() => setProposalKind("prensa")}>Enviar un comunicado</Button>
            </div>
          </section>
        </div>
      </main>

      <Dialog open={proposalKind !== null} onOpenChange={(open) => { if (!open) setProposalKind(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{proposalKind === "prensa" ? "Enviar un comunicado" : "Proponer un artículo"}</DialogTitle>
            <DialogDescription>Llega al equipo editorial. No se publica nada sin revisión.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitProposal} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label htmlFor="p-name">Nombre</Label><Input id="p-name" required minLength={2} maxLength={100} value={proposal.name} onChange={(e) => setProposal({ ...proposal, name: e.target.value })} /></div>
              <div className="space-y-1.5"><Label htmlFor="p-email">Correo</Label><Input id="p-email" type="email" required value={proposal.email} onChange={(e) => setProposal({ ...proposal, email: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5"><Label htmlFor="p-org">Organización (opcional)</Label><Input id="p-org" maxLength={120} value={proposal.organization} onChange={(e) => setProposal({ ...proposal, organization: e.target.value })} /></div>
            <div className="space-y-1.5"><Label htmlFor="p-title">Título</Label><Input id="p-title" required minLength={3} maxLength={110} value={proposal.title} onChange={(e) => setProposal({ ...proposal, title: e.target.value })} /></div>
            <div className="space-y-1.5"><Label htmlFor="p-body">{proposalKind === "prensa" ? "Texto del comunicado" : "De qué trata"}</Label><Textarea id="p-body" required rows={5} maxLength={3500} value={proposal.body} onChange={(e) => setProposal({ ...proposal, body: e.target.value })} /></div>
            <div className="space-y-1.5"><Label htmlFor="p-link">Enlace (opcional)</Label><Input id="p-link" type="url" maxLength={300} value={proposal.link} onChange={(e) => setProposal({ ...proposal, link: e.target.value })} /></div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setProposalKind(null)}>Cancelar</Button>
              <Button type="submit" disabled={sending}>{sending ? "Enviando…" : "Enviar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </PageTransition>
  );
}
