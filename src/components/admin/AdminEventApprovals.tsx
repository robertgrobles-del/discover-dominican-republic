import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, CalendarDays, Check, ExternalLink, Loader2, MapPin, Phone, Ticket, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelEmptyState } from "@/components/ui/panel-empty-state";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { safeExternalUrl } from "@/lib/security";
import { listEventsByStatus, reviewEvent, type PendingEvent } from "@/lib/adminStoreApi";

const TICKET_LABEL = { none: "Sin entrada", free_pass: "Pase gratuito del portal", external: "Boletería externa" } as const;
const day = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString("es-DO", { weekday: "short", day: "numeric", month: "long", year: "numeric" });

function EventCard({ event, busy, onReview }: { event: PendingEvent; busy: boolean; onReview: (action: "publish" | "archive") => void }) {
  const info = event.extras?.submission;
  const ticketUrl = info?.ticket_url ? safeExternalUrl(info.ticket_url) : undefined;
  return (
    <article className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-bold">{event.title}</h3>
            {event.category && <Badge variant="secondary">{event.category}</Badge>}
            {!info && <Badge variant="outline">Creado por el equipo</Badge>}
          </div>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {day(event.start_date)}{info?.start_time ? `, ${info.start_time}` : ""}{event.end_date ? ` → ${day(event.end_date)}` : ""}</span>
            {event.location && <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {event.location}</span>}
          </p>
          {event.description && <p className="max-w-3xl text-sm leading-relaxed text-foreground/90 whitespace-pre-line">{event.description}</p>}
          {info && (
            <dl className="grid gap-x-6 gap-y-1 pt-2 text-sm sm:grid-cols-2">
              <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">Organiza</dt><dd className="font-medium">{info.organizer_name}</dd></div>
              {info.organizer_phone && <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">Teléfono</dt><dd className="inline-flex items-center gap-1.5 font-medium"><Phone className="h-3.5 w-3.5" /> {info.organizer_phone}</dd></div>}
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Entradas</dt>
                <dd className="inline-flex items-center gap-1.5 font-medium">
                  <Ticket className="h-3.5 w-3.5" /> {TICKET_LABEL[info.ticket_mode]}
                  {ticketUrl && <a href={ticketUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">ver enlace <ExternalLink className="h-3 w-3" /></a>}
                </dd>
              </div>
              {info.price_info && <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">Precio</dt><dd className="font-medium">{info.price_info}</dd></div>}
            </dl>
          )}
          <p className="text-xs text-muted-foreground">Recibido el {new Date(event.created_at).toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <div className="flex shrink-0 gap-2 lg:flex-col">
          <Button disabled={busy} onClick={() => onReview("publish")}><Check className="mr-1 h-4 w-4" /> Aprobar y publicar</Button>
          <Button variant="outline" disabled={busy} onClick={() => { if (window.confirm(`¿Rechazar «${event.title}»? Se archiva y no se publica.`)) onReview("archive"); }}><X className="mr-1 h-4 w-4" /> Rechazar</Button>
        </div>
      </div>
    </article>
  );
}

/** Eventos que esperan revisión: los propuestos por organizadores y los que el equipo envió a revisar. */
export function AdminEventApprovals() {
  const qc = useQueryClient();
  const { data: events = [], isLoading, isError, error } = useQuery({ queryKey: ["admin-events-in-review"], queryFn: () => listEventsByStatus("in_review"), enabled: HAS_BACKEND_SESSION });
  const review = useMutation({
    mutationFn: (input: { id: string; action: "publish" | "archive" }) => reviewEvent(input.id, input.action),
    onSuccess: (_, input) => {
      toast.success(input.action === "publish" ? "Evento publicado: ya aparece en la agenda" : "Evento rechazado y archivado");
      qc.invalidateQueries({ queryKey: ["admin-events-in-review"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard-kpis"] });
    },
    onError: (e) => toast.error("No se pudo completar la revisión", { description: e instanceof Error ? e.message : undefined }),
  });

  if (!HAS_BACKEND_SESSION) {
    return <PanelEmptyState icon={CalendarCheck} title="Las propuestas llegan al backend" description="Inicia sesión contra el backend para revisar los eventos propuestos." />;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Un evento propuesto no es público hasta que lo apruebas. Al aprobarlo se publica en la agenda; al rechazarlo se archiva.
        Para corregir datos antes de publicar, edítalo en Eventos.
      </p>
      {isLoading && <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}
      {isError && <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">No se pudieron cargar los eventos: {error instanceof Error ? error.message : "error desconocido"}</p>}
      {!isLoading && !isError && events.length === 0 && <PanelEmptyState icon={CalendarCheck} title="Nada pendiente" description="No hay eventos esperando aprobación." />}
      {events.map((event) => (
        <EventCard key={event.id} event={event} busy={review.isPending} onReview={(action) => review.mutate({ id: event.id, action })} />
      ))}
    </div>
  );
}
