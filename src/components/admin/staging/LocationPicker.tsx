// Ubicación de cualquier contenido: provincia > municipio > destino. Elegir un municipio o un destino completa los niveles
// de arriba (la API hace lo mismo y rechaza combinaciones que no encajan), así el contenido sale en las tres páginas.
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fastifyClient";
import { Label } from "@/components/ui/label";

type Row = Record<string, unknown> & { id: string };
export type Location = { province_id: string; municipality_id: string; destination_id: string };

const s = (v: unknown) => (v == null ? "" : String(v));
const byName = (a: Row, b: Row) => s(a.name).localeCompare(s(b.name), "es");
const select = "flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm";

/** Provincias, municipios y destinos del panel (borradores incluidos), compartidos por todos los editores. */
export function useTerritory() {
  const get = (r: string) => async () => (await fetchApi<{ data: Row[] }>(`/admin/${r}`)).data.sort(byName);
  const provinces = useQuery({ queryKey: ["staging", "provinces"], queryFn: get("provinces"), staleTime: 60_000 });
  const municipalities = useQuery({ queryKey: ["staging", "municipalities"], queryFn: get("municipalities"), staleTime: 60_000 });
  const destinations = useQuery({ queryKey: ["staging", "destinations"], queryFn: get("destinations"), staleTime: 60_000 });
  return { provinces: provinces.data ?? [], municipalities: municipalities.data ?? [], destinations: destinations.data ?? [], loading: provinces.isLoading };
}

/** Nombre legible de una ubicación ("Boca Chica, Santo Domingo") para rellenar los campos de texto antiguos. */
export function locationLabel(t: ReturnType<typeof useTerritory>, v: Location) {
  const p = t.provinces.find((x) => x.id === v.province_id);
  const m = t.municipalities.find((x) => x.id === v.municipality_id);
  const d = t.destinations.find((x) => x.id === v.destination_id);
  return { province: s(p?.name), city: s(d?.name) || s(m?.name) };
}

export function LocationPicker({ value, onChange, idPrefix = "loc" }: { value: Location; onChange: (v: Location) => void; idPrefix?: string }) {
  const t = useTerritory();
  const munis = t.municipalities.filter((m) => !value.province_id || m.province_id === value.province_id);
  const dests = t.destinations.filter((d) => (!value.province_id || d.province_id === value.province_id)
    && (!value.municipality_id || !d.municipality_id || d.municipality_id === value.municipality_id));

  const setProvince = (id: string) => onChange({ province_id: id, municipality_id: "", destination_id: "" });
  const setMuni = (id: string) => {
    const m = t.municipalities.find((x) => x.id === id);
    onChange({ province_id: m ? s(m.province_id) : value.province_id, municipality_id: id, destination_id: "" });
  };
  const setDest = (id: string) => {
    const d = t.destinations.find((x) => x.id === id);
    onChange(d ? { province_id: s(d.province_id), municipality_id: s(d.municipality_id) || value.municipality_id, destination_id: id } : { ...value, destination_id: "" });
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label htmlFor={`${idPrefix}-prov`}>Provincia</Label>
        <select id={`${idPrefix}-prov`} className={select} value={value.province_id} onChange={(e) => setProvince(e.target.value)}>
          <option value="">{t.loading ? "Cargando…" : "— Sin indicar —"}</option>
          {t.provinces.map((p) => <option key={p.id} value={p.id}>{s(p.name)}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor={`${idPrefix}-muni`}>Municipio</Label>
        <select id={`${idPrefix}-muni`} className={select} value={value.municipality_id} onChange={(e) => setMuni(e.target.value)}>
          <option value="">— Toda la provincia —</option>
          {munis.map((m) => <option key={m.id} value={m.id}>{s(m.name)}{value.province_id ? "" : ` · ${s(t.provinces.find((p) => p.id === m.province_id)?.name)}`}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor={`${idPrefix}-dest`}>Destino o zona</Label>
        <select id={`${idPrefix}-dest`} className={select} value={value.destination_id} onChange={(e) => setDest(e.target.value)}>
          <option value="">— Ninguno —</option>
          {dests.map((d) => <option key={d.id} value={d.id}>{s(d.name)}</option>)}
        </select>
      </div>
      <p className="text-xs text-muted-foreground">Con elegir el municipio o el destino basta: la provincia se completa sola y el contenido sale en las tres páginas.</p>
    </div>
  );
}
