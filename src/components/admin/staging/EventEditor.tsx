// Editor de evento con la disposición del de noticias (estilo WordPress): contenido a la izquierda; cajas de
// Publicar, Fecha y hora, Imagen, Lugar, Entradas y Contacto a la derecha.
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClassicEditor } from "./ClassicEditor";
import { ImageField } from "./StagingCrudManager";
import { Box } from "./NewsEditor";
import { eventEnded } from "./EventList";
import { EventPlacePicker } from "./EventPlacePicker";
import { LocationPicker, locationLabel, useTerritory } from "./LocationPicker";
import { EditorAutosaveStrip } from "./DraftAutosaveBar";
import { buildAutoDraftSlug, useDraftAutosave } from "./useDraftAutosave";

type Row = Record<string, unknown> & { id: string };
const EVENT_TYPES = ["Cultural", "Música", "Feria", "Regional", "Exposición", "Deporte", "Gastronomía", "Evento"];
const SITE = "https://descubrerepdom.com";
const apiMessage = (e: unknown) => (e instanceof HttpError ? (e.details as { error?: { message?: string } } | null)?.error?.message : null) ?? (e instanceof Error ? e.message : "Error");
const toSlug = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const s = (v: unknown) => (v == null ? "" : String(v));

const FIELDS = ["name", "slug", "event_type", "short_description", "description", "image_url", "start_date", "end_date", "start_time", "end_time",
  "venue", "address", "province", "price_range", "ticket_url", "organizer", "submitter_email", "submitter_phone", "status", "venue_id", "venue_type", "venue_room",
  "province_id", "municipality_id", "destination_id"] as const;
type Key = (typeof FIELDS)[number];

function Field({ id, label, value, onChange, type = "text", placeholder }: { id: string; label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function EventEditor({ row, onClose, onNew }: { row: Row | "new"; onClose: () => void; onNew: () => void }) {
  const qc = useQueryClient();
  const territory = useTerritory();
  const r: Record<string, unknown> = row === "new" ? {} : row;
  const [id, setId] = useState<string | null>(row === "new" ? null : row.id);
  const [f, setF] = useState(() => ({ ...Object.fromEntries(FIELDS.map((k) => [k, s(r[k])])), event_type: s(r.event_type) || "Evento" }) as Record<Key, string>);
  const [featured, setFeatured] = useState(r.is_featured === 1 || r.is_featured === true);
  const [slugTouched, setSlugTouched] = useState(row !== "new");
  const set = (k: Key, v: string) => setF((x) => ({ ...x, [k]: v, ...(k === "name" && !slugTouched ? { slug: toSlug(v) } : {}) }));

  const eventSnapshot = useMemo(() => ({ f, featured, slugTouched }), [f, featured, slugTouched]);

  const autosave = useDraftAutosave({
    resource: "events",
    itemId: id,
    status: f.status || "draft",
    snapshot: eventSnapshot,
    title: f.name,
    serverUpdatedAt: row === "new" ? null : (row.updated_at as string | null),
    onRestore: (snap) => {
      setF(snap.f);
      setFeatured(snap.featured);
      setSlugTouched(snap.slugTouched);
    },
    onPromoted: (saved) => {
      setId(saved.id);
      setSlugTouched(true);
      setF((x) => ({ ...x, name: x.name.trim() || "Evento borrador", slug: x.slug.trim() || saved.slug || x.slug, status: "draft" }));
      void qc.invalidateQueries({ queryKey: ["staging", "events"] });
    },
    onServerAutoDraft: async (snap, effectiveId) => {
      const targetId = effectiveId ?? id;
      const safeName = snap.f.name.trim() || "Evento borrador";
      const safeSlug = buildAutoDraftSlug(safeName, snap.f.slug, "evento");
      const body = {
        ...Object.fromEntries(FIELDS.map((k) => [k, snap.f[k] || null])),
        name: safeName,
        slug: safeSlug,
        status: "draft",
        is_featured: snap.featured,
      };
      const saved = (await fetchApi<{ data: Row }>(`/admin/events${targetId ? `/${targetId}` : ""}`, {
        method: targetId ? "PUT" : "POST",
        body: JSON.stringify(body),
      })).data;
      setId(saved.id);
      setF((x) => ({ ...x, name: x.name.trim() || safeName, slug: x.slug.trim() || String(saved.slug ?? safeSlug), status: "draft" }));
      void qc.invalidateQueries({ queryKey: ["staging", "events"] });
      return { id: saved.id, slug: String(saved.slug ?? safeSlug), updated_at: saved.updated_at as string | undefined };
    },
    onManualSave: () => {
      if (!save.isPending && !trash.isPending && f.name && f.slug) save.mutate(f.status === "published" ? "published" : "draft");
    },
  });

  const save = useMutation({
    mutationFn: async (status: string) => {
      const targetId = autosave.effectiveId ?? id;
      const body = { ...Object.fromEntries(FIELDS.map((k) => [k, f[k] || null])), status, is_featured: featured };
      return (await fetchApi<{ data: Row }>(`/admin/events${targetId ? `/${targetId}` : ""}`, { method: targetId ? "PUT" : "POST", body: JSON.stringify(body) })).data;
    },
    onSuccess: (saved, status) => {
      setId(saved.id); setF((x) => ({ ...x, status }));
      autosave.markSavedClean(saved.id);
      void qc.invalidateQueries({ queryKey: ["staging", "events"] });
      toast.success(status === "published" ? "Evento publicado" : "Borrador guardado", { action: { label: "Nuevo evento", onClick: onNew } });
    },
    onError: (e) => toast.error(apiMessage(e)),
  });
  const trash = useMutation({
    mutationFn: () => fetchApi(`/admin/events/${autosave.effectiveId ?? id}`, { method: "DELETE" }),
    onSuccess: () => { autosave.markSavedClean(id); toast.success("Evento eliminado"); void qc.invalidateQueries({ queryKey: ["staging", "events"] }); onClose(); },
    onError: (e) => toast.error(apiMessage(e)),
  });
  const busy = save.isPending || trash.isPending;
  const ended = eventEnded({ id: "", ...f });
  const canSave = Boolean(f.name && f.slug);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onClose}><ArrowLeft className="mr-1.5 h-4 w-4" />Todos los eventos</Button>
        <h2 className="text-xl font-semibold">{id ? "Editar evento" : "Añadir nuevo evento"}</h2>
        {id && <Button size="sm" variant="outline" className="border-primary text-primary" onClick={onNew}>Añadir nuevo evento</Button>}
      </div>

      <EditorAutosaveStrip autosave={autosave} itemLabel="este evento" />

      {f.submitter_email && f.status !== "published" && (
        <p className="rounded border-l-4 border-amber-500 bg-amber-500/10 p-3 text-sm">
          Enviado por el público. Revisa los datos y pulsa <strong>Publicar</strong> para que salga en la agenda.
        </p>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-4">
          <Input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Nombre del evento" aria-label="Nombre" className="h-12 text-xl font-semibold" />
          <p className="text-sm text-muted-foreground">
            Enlace permanente: {SITE}/evento/
            <input value={f.slug} onChange={(e) => { setSlugTouched(true); set("slug", toSlug(e.target.value)); }} aria-label="Slug" className="rounded border border-input bg-background px-1 font-mono text-foreground" />
          </p>

          <ClassicEditor id="event-body" value={f.description} onChange={(v) => set("description", v)} />

          <Box title="Resumen">
            <Textarea rows={3} value={f.short_description} onChange={(e) => set("short_description", e.target.value)} aria-label="Resumen" />
            <p className="flex justify-between text-xs text-muted-foreground">
              <span>Sale en la tarjeta del calendario y en los buscadores.</span>
              <span className={`tabular-nums ${f.short_description.length > 160 ? "font-semibold text-amber-600" : ""}`}>{f.short_description.length}/160</span>
            </p>
          </Box>
        </div>

        {/* La barra lateral se queda fija y se desplaza por dentro: no crece más que la pantalla. */}
        <aside className="min-w-0 space-y-4 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
          <Box title="Publicar">
            <p>Estado: <strong>{ended ? "Terminado" : f.status === "published" ? "Publicado" : "Borrador"}</strong></p>
            {ended && <p className="text-xs text-muted-foreground">Ya pasó su fecha de fin: no sale en la web.</p>}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
              Evento destacado
            </label>
            <Button variant="outline" size="sm" disabled={busy || !canSave} onClick={() => save.mutate("draft")}>Guardar borrador</Button>
            <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
              {id ? <button type="button" className="text-sm text-destructive underline underline-offset-2" disabled={busy}
                onClick={() => { if (window.confirm("¿Eliminar este evento?")) trash.mutate(); }}>Eliminar</button> : <span />}
              <Button disabled={busy || !canSave} onClick={() => save.mutate("published")}>
                {save.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}{f.status === "published" ? "Actualizar" : "Publicar"}
              </Button>
            </div>
          </Box>

          <Box title="Fecha y hora">
            <div className="grid grid-cols-2 gap-2">
              <Field id="ev-sd" label="Inicio" type="date" value={f.start_date} onChange={(v) => set("start_date", v)} />
              <Field id="ev-st" label="Hora" type="time" value={f.start_time} onChange={(v) => set("start_time", v)} />
              <Field id="ev-ed" label="Fin" type="date" value={f.end_date} onChange={(v) => set("end_date", v)} />
              <Field id="ev-et" label="Hora" type="time" value={f.end_time} onChange={(v) => set("end_time", v)} />
            </div>
            <p className="text-xs text-muted-foreground">Al llegar la fecha y hora de fin deja de salir en la web.</p>
          </Box>

          <Box title="Tipo de evento">
            <select aria-label="Tipo de evento" value={f.event_type} onChange={(e) => set("event_type", e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
              {[...new Set([...EVENT_TYPES, f.event_type])].map((t) => <option key={t}>{t}</option>)}
            </select>
          </Box>

          <Box title="Imagen destacada">
            <ImageField id="event-cover" compact value={f.image_url} onChange={(v) => set("image_url", v)} />
          </Box>

          <Box title="Lugar">
            <EventPlacePicker value={{ venue_id: f.venue_id, venue_type: f.venue_type, venue: f.venue, venue_room: f.venue_room, address: f.address, province: f.province }}
              onChange={(p) => setF((x) => ({ ...x, ...p }))} />
          </Box>

          <Box title="Ubicación">
            <LocationPicker idPrefix="ev-loc" value={{ province_id: f.province_id, municipality_id: f.municipality_id, destination_id: f.destination_id }}
              onChange={(v) => { const l = locationLabel(territory, v); setF((x) => ({ ...x, ...v, province: l.province || x.province })); }} />
            <p className="text-xs text-muted-foreground">Si el lugar es un recinto del catálogo y lo dejas vacío, se usa la ubicación del recinto.</p>
          </Box>

          <Box title="Entradas">
            <Field id="ev-price" label="Precio" value={f.price_range} onChange={(v) => set("price_range", v)} placeholder="Gratis, RD$500 – RD$1,500…" />
            <Field id="ev-ticket" label="Enlace de entradas" type="url" value={f.ticket_url} onChange={(v) => set("ticket_url", v)} />
            <Field id="ev-org" label="Organizador" value={f.organizer} onChange={(v) => set("organizer", v)} />
          </Box>

          <Box title="Contacto (solo el equipo)">
            <Field id="ev-mail" label="Correo" type="email" value={f.submitter_email} onChange={(v) => set("submitter_email", v)} />
            <Field id="ev-phone" label="Teléfono" value={f.submitter_phone} onChange={(v) => set("submitter_phone", v)} />
            {f.submitter_email && <a className="text-sm text-primary underline" href={`mailto:${f.submitter_email}?subject=${encodeURIComponent(`Tu evento «${f.name}» en Descubre RD`)}`}>Escribir al organizador</a>}
          </Box>
        </aside>
      </div>
    </div>
  );
}
