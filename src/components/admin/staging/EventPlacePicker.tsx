// Caja «Lugar» del editor de eventos. Según el tipo de lugar se elige de su catálogo: deportes (estadios, arenas,
// golf) y demás recintos salen de Recintos; playas y hoteles tendrán su propio catálogo (aún no habilitado). Desde
// aquí mismo se puede crear un recinto nuevo, que se guarda en su categoría, o escribir el lugar a mano.
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VENUE_CATEGORY } from "./VenueList";

type Row = Record<string, unknown> & { id: string };
export type Place = { venue_id: string; venue_type: string; venue: string; venue_room: string; address: string; province: string };

const s = (v: unknown) => (v == null ? "" : String(v));
const toSlug = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const apiMessage = (e: unknown) => (e instanceof HttpError ? (e.details as { error?: { message?: string } } | null)?.error?.message : null) ?? (e instanceof Error ? e.message : "Error");
const select = "flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm";

/** Grupos del selector y de dónde sale cada tipo. `pending`: su catálogo todavía no está en el panel. */
const GROUPS: { label: string; source: string; types: string[]; pending?: boolean }[] = [
  { label: "Deportes", source: "el área de deportes", types: ["estadio", "arena", "golf"] },
  { label: "Playas", source: "el listado de playas", types: ["playa"], pending: true },
  { label: "Hoteles", source: "el listado de hoteles", types: ["hotel"], pending: true },
  { label: "Cultura", source: "Recintos", types: ["teatro", "anfiteatro", "museo"] },
  { label: "Eventos y ocio", source: "Recintos", types: ["centro_convenciones", "mall", "discoteca", "restaurante"] },
  { label: "Aire libre", source: "Recintos", types: ["parque", "plaza", "carretera", "montana", "rio"] },
  { label: "Otros", source: "Recintos", types: ["otro"] },
];
const groupOf = (t: string) => GROUPS.find((g) => g.types.includes(t));

function Field({ id, label, value, onChange, placeholder }: { id: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <div className="space-y-1"><Label htmlFor={id}>{label}</Label><Input id={id} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /></div>;
}

export function EventPlacePicker({ value, onChange }: { value: Place; onChange: (patch: Partial<Place>) => void }) {
  const qc = useQueryClient();
  const venues = useQuery({ queryKey: ["staging", "venues"], queryFn: async () => (await fetchApi<{ data: Row[] }>("/admin/venues")).data, staleTime: 60_000 });
  const [manual, setManual] = useState(() => !value.venue_id);
  const [adding, setAdding] = useState(false);
  const [nv, setNv] = useState({ name: "", address: "", city: "", province: "" });
  const group = groupOf(value.venue_type);
  const pending = Boolean(group?.pending);
  const catalog = (venues.data ?? []).filter((v) => (value.venue_type ? v.category === value.venue_type : true));
  const typeLabel = (VENUE_CATEGORY[value.venue_type] ?? "lugar").toLowerCase();

  const fromVenue = (v: Row): Partial<Place> => ({ venue_id: v.id, venue: s(v.name), address: s(v.address) || s(v.city), province: s(v.province), venue_type: s(v.category) });

  /** Crea el recinto en su categoría (como borrador, para completarlo luego en Recintos) y lo deja elegido. */
  const create = useMutation({
    mutationFn: async () => (await fetchApi<{ data: Row }>("/admin/venues", {
      method: "POST",
      body: JSON.stringify({ ...nv, slug: `${toSlug(nv.name)}-${Math.random().toString(36).slice(2, 6)}`, category: value.venue_type || "otro", status: "draft" }),
    })).data,
    onSuccess: (v) => {
      void qc.invalidateQueries({ queryKey: ["staging", "venues"] });
      onChange(fromVenue(v)); setAdding(false); setNv({ name: "", address: "", city: "", province: "" });
      toast.success(`«${s(v.name)}» añadido a ${group?.source ?? "Recintos"}. Complétalo (fotos, mapa…) en Recintos.`);
    },
    onError: (e) => toast.error(apiMessage(e)),
  });

  return (
    <>
      <div className="space-y-1">
        <Label htmlFor="ev-venue-type">Tipo de lugar</Label>
        <select id="ev-venue-type" value={value.venue_type} className={select}
          onChange={(e) => { const t = e.target.value; onChange({ venue_type: t, venue_id: "" }); setAdding(false); if (groupOf(t)?.pending) setManual(true); }}>
          <option value="">— Elige el tipo —</option>
          {GROUPS.map((g) => (
            <optgroup key={g.label} label={g.pending ? `${g.label} (próximamente)` : g.label}>
              {g.types.map((t) => <option key={t} value={t}>{VENUE_CATEGORY[t]}</option>)}
            </optgroup>
          ))}
        </select>
      </div>

      {pending ? (
        <p className="rounded border-l-4 border-amber-500 bg-amber-500/10 p-2 text-xs">
          El {group!.source.replace(/^el /, "")} todavía no está habilitado en el panel. Por ahora escribe el lugar a mano; cuando esté, se elegirá de ahí.
        </p>
      ) : (
        <fieldset className="flex gap-4 text-sm">
          <legend className="sr-only">Cómo indicar el lugar</legend>
          <label className="flex items-center gap-1.5"><input type="radio" name="ev-place" checked={!manual} onChange={() => setManual(false)} />Del catálogo</label>
          <label className="flex items-center gap-1.5"><input type="radio" name="ev-place" checked={manual} onChange={() => { setManual(true); onChange({ venue_id: "" }); }} />A mano</label>
        </fieldset>
      )}

      {!manual && !pending && (
        <div className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="ev-venue-id">{group ? `De ${group.source}` : "Recinto"}</Label>
            <select id="ev-venue-id" value={value.venue_id} className={select}
              onChange={(e) => { const v = venues.data?.find((x) => x.id === e.target.value); onChange(v ? fromVenue(v) : { venue_id: "" }); }}>
              <option value="">{venues.isLoading ? "Cargando…" : catalog.length ? "— Elige uno —" : `— No hay ningún ${typeLabel} —`}</option>
              {catalog.map((v) => <option key={v.id} value={v.id}>{s(v.name)}{v.city ? ` · ${s(v.city)}` : ""}</option>)}
            </select>
          </div>
          {!adding ? (
            <button type="button" className="flex items-center gap-1 text-sm text-primary hover:underline" onClick={() => setAdding(true)}>
              <Plus className="h-3.5 w-3.5" />Añadir {value.venue_type ? `un ${typeLabel}` : "un recinto"} nuevo
            </button>
          ) : (
            <div className="space-y-2 rounded border border-border bg-muted/30 p-3">
              <p className="text-xs font-medium">Nuevo {typeLabel} — se guarda en {group?.source ?? "Recintos"}</p>
              <Field id="nv-name" label="Nombre" value={nv.name} onChange={(v) => setNv((x) => ({ ...x, name: v }))} />
              <Field id="nv-addr" label="Dirección" value={nv.address} onChange={(v) => setNv((x) => ({ ...x, address: v }))} />
              <div className="grid grid-cols-2 gap-2">
                <Field id="nv-city" label="Ciudad" value={nv.city} onChange={(v) => setNv((x) => ({ ...x, city: v }))} />
                <Field id="nv-prov" label="Provincia" value={nv.province} onChange={(v) => setNv((x) => ({ ...x, province: v }))} />
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" disabled={!nv.name.trim() || create.isPending} onClick={() => create.mutate()}>
                  {create.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}Guardar y elegir</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancelar</Button>
              </div>
            </div>
          )}
        </div>
      )}

      <Field id="ev-venue" label={manual || pending ? "Nombre del lugar" : "Nombre visible"} value={value.venue} onChange={(v) => onChange({ venue: v })}
        placeholder={manual || pending ? "Playa Macao, Carretera Jarabacoa–Constanza…" : ""} />
      {(value.venue_type === "hotel" || value.venue_type === "centro_convenciones" || value.venue_type === "teatro" || value.venue_id) && (
        <Field id="ev-room" label="Salón, sala o área" value={value.venue_room} onChange={(v) => onChange({ venue_room: v })} placeholder="Salón La Fiesta, Sala Carlos Piantini…" />
      )}
      <Field id="ev-addr" label="Dirección o ciudad" value={value.address} onChange={(v) => onChange({ address: v })} />
      <Field id="ev-prov" label="Provincia" value={value.province} onChange={(v) => onChange({ province: v })} />
    </>
  );
}
