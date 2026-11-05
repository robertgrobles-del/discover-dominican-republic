import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Receipt, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { adminCreateEntity, adminDeleteEntity, adminListEntities, adminUpdateEntity } from "@/lib/adminApi";
import { fetchApi } from "@/lib/fastifyClient";
import { EntityFormDialog } from "./EntityFormDialog";
import { getFieldsConfig } from "./AdminEntityConfigs";

type Row = Record<string, unknown> & { id: string };
type Kind = "ad_clients" | "ad_banners";
type Invoice = { id: string; ncf: string; banner_name: string; period: string; total: string; currency: string; status: string; issued_at: string };

const errMsg = (e: unknown) => (e instanceof Error ? e.message : "No se pudo completar la operación");

/** Plantillas por hueco del portal: rellenan tipo, ubicación y sección; la sección se puede cambiar por otra de la lista. */
const PRESETS: { label: string; banner_type: string; placement: string; sections: string[] }[] = [
  { label: "Skyscrapers en pareja (120×600)", banner_type: "skyscraper-traditional", placement: "sidebar", sections: ["home-restaurantes", "home-bares", "home-alojamientos", "home-destinos", "actividades", "articulo", "destinos", "guia-gastronomica"] },
  { label: "Diapositiva de carrusel", banner_type: "hero-slide", placement: "hero", sections: ["home", "provincias", "provincia-<slug>", "destino-<slug>"] },
  { label: "Tarjeta nativa en portada", banner_type: "native-card", placement: "native", sections: ["home-destinos", "home-intereses", "home-restaurantes-card", "home-bares-card", "home-alojamientos-hotel", "home-alojamientos-airbnb"] },
  { label: "Menú desplegable del header", banner_type: "megamenu-card", placement: "megamenu", sections: ["megamenu-que-hacer", "megamenu-planificar", "megamenu-guias", "megamenu-empresas"] },
  { label: "Antes del footer (1920×250)", banner_type: "full-width-screen", placement: "between-sections", sections: ["pre-footer"] },
  { label: "Cinta superior", banner_type: "topbar", placement: "topbar", sections: ["global"] },
  { label: "Ventana al salir", banner_type: "exit-popup", placement: "exit-popup", sections: ["global"] },
  { label: "Banner de página (otros huecos)", banner_type: "billboard", placement: "between-sections", sections: ["home", "alojamientos", "eventos", "global"] },
];

/**
 * Publicidad con backend real: clientes (empresa o persona a la que se factura) y sus banners. Cada banner va ligado a un
 * cliente y desde la ficha del cliente se emiten y consultan sus facturas por mes.
 */
export function AdminAdsManager() {
  const [rows, setRows] = useState<Record<Kind, Row[]>>({ ad_clients: [], ad_banners: [] });
  const [editing, setEditing] = useState<{ kind: Kind; row?: Row } | null>(null);
  const [saving, setSaving] = useState(false);
  const [billingFor, setBillingFor] = useState<Row | null>(null);
  const [stats, setStats] = useState<Record<string, { impressions: number; clicks: number; ctr: number }>>({});

  const load = useCallback(async () => {
    try {
      const [c, b] = await Promise.all([adminListEntities<Row>("ad_clients", { limit: 200 }), adminListEntities<Row>("ad_banners", { limit: 200 })]);
      setRows({ ad_clients: c.data ?? [], ad_banners: b.data ?? [] });
      fetchApi<{ data: { banners: { id: string; impressions: number; clicks: number; ctr: number }[] } }>("/admin/ads/reports")
        .then((r) => setStats(Object.fromEntries(r.data.banners.map((x) => [x.id, x])))).catch(() => undefined);
    } catch (e) { toast.error(errMsg(e)); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const clientName = (id: unknown) => {
    const c = rows.ad_clients.find((x) => x.id === id);
    return c ? String(c.trade_name || c.legal_name) : "— sin cliente —";
  };

  const save = async (data: Record<string, unknown>) => {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.row?.id) await adminUpdateEntity(editing.kind, editing.row.id, data);
      else { const { id: _drop, ...fresh } = data; await adminCreateEntity(editing.kind, fresh); }
      toast.success("Guardado");
      setEditing(null);
      await load();
    } catch (e) { toast.error(errMsg(e)); } finally { setSaving(false); }
  };

  // Activar pasa por las reglas de la base de datos: cliente asignado y pareja de skyscrapers libre en esas fechas.
  const toggle = async (row: Row) => {
    try { await adminUpdateEntity("ad_banners", row.id, { is_active: row.is_active === false }); await load(); } catch (e) { toast.error(errMsg(e)); }
  };

  const remove = async (kind: Kind, row: Row) => {
    if (!confirm(`¿Borrar «${String(row.legal_name ?? row.name)}»?`)) return;
    try { await adminDeleteEntity(kind, row.id); await load(); } catch (e) { toast.error(errMsg(e)); }
  };

  const table = (kind: Kind, cols: [string, (r: Row) => string][]) => (
    <div className="space-y-3">
      {kind === "ad_clients" ? (
        <Button size="sm" onClick={() => setEditing({ kind })}><Plus className="h-4 w-4 mr-1" />Nuevo cliente</Button>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Plus className="h-4 w-4" />
          <select aria-label="Nuevo banner" value="" onChange={(e) => { const p = PRESETS[Number(e.target.value)]; if (p) setEditing({ kind, row: { id: "", banner_type: p.banner_type, placement: p.placement, section: p.sections[0], is_active: false } }); }} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
            <option value="">Nuevo banner: elige el hueco…</option>
            {PRESETS.map((p, i) => <option key={p.label} value={i}>{p.label} — secciones: {p.sections.join(", ")}</option>)}
          </select>
          {!rows.ad_clients.length && <span className="text-xs text-muted-foreground">Primero registra el cliente en la pestaña Clientes.</span>}
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left"><tr>{cols.map(([h]) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}<th /></tr></thead>
          <tbody>
            {rows[kind].map((r) => (
              <tr key={r.id} className="border-t">
                {cols.map(([h, f]) => <td key={h} className="px-3 py-2">{f(r)}</td>)}
                <td className="px-3 py-2 whitespace-nowrap text-right">
                  {kind === "ad_clients" && <Button size="sm" variant="ghost" onClick={() => setBillingFor(r)} aria-label="Facturas"><Receipt className="h-4 w-4" /></Button>}
                  {kind === "ad_banners" && <Button size="sm" variant="outline" onClick={() => toggle(r)}>{r.is_active === false ? "Activar" : "Desactivar"}</Button>}
                  <Button size="sm" variant="ghost" onClick={() => setEditing({ kind, row: r })} aria-label="Editar"><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(kind, r)} aria-label="Borrar"><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
            {!rows[kind].length && <tr><td colSpan={cols.length + 1} className="px-3 py-6 text-center text-muted-foreground">Sin registros</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Tabs defaultValue="ad_banners">
        <TabsList>
          <TabsTrigger value="ad_banners">Banners</TabsTrigger>
          <TabsTrigger value="ad_clients">Clientes</TabsTrigger>
        </TabsList>
        <TabsContent value="ad_banners">
          {table("ad_banners", [
            ["Banner", (r) => String(r.name)],
            ["Cliente", (r) => clientName(r.client_id)],
            ["Tipo · hueco", (r) => `${r.banner_type ?? ""} · ${r.section ?? r.placement ?? ""}`],
            ["Vigencia", (r) => `${r.start_date ?? "…"} → ${r.end_date ?? "…"}`],
            ["30 días", (r) => { const s = stats[r.id]; return s ? `${s.impressions.toLocaleString("es-DO")} vistas · ${s.clicks} clics · ${s.ctr}%` : "—"; }],
            ["Activo", (r) => (r.is_active === false ? "No (borrador)" : "Sí")],
          ])}
        </TabsContent>
        <TabsContent value="ad_clients">
          {table("ad_clients", [
            ["Cliente", (r) => String(r.trade_name || r.legal_name)],
            ["Razón social", (r) => String(r.legal_name)],
            ["RNC / cédula", (r) => String(r.rnc_cedula ?? "—")],
            ["Correo", (r) => String(r.email)],
            ["Banners", (r) => String(rows.ad_banners.filter((b) => b.client_id === r.id).length)],
          ])}
        </TabsContent>
      </Tabs>

      {editing && (
        <EntityFormDialog
          open
          onOpenChange={(o) => !o && setEditing(null)}
          title={`${editing.row?.id ? "Editar" : "Nuevo"} ${editing.kind === "ad_clients" ? "cliente" : "banner"}`}
          entity={editing.kind}
          fields={getFieldsConfig(editing.kind).map((fl) => (fl.name === "notes" ? { ...fl, label: "Notas internas" } : fl))}
          initialData={editing.row}
          onSubmit={save}
          loading={saving}
        />
      )}

      {billingFor && <ClientBilling client={billingFor} banners={rows.ad_banners.filter((b) => b.client_id === billingFor.id)} onClose={() => setBillingFor(null)} />}
    </div>
  );
}

/** Facturas del cliente y emisión de la de un mes de uno de sus banners. */
function ClientBilling({ client, banners, onClose }: { client: Row; banners: Row[]; onClose: () => void }) {
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [bannerId, setBannerId] = useState(banners[0]?.id ?? "");
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetchApi<{ data: Invoice[] }>(`/admin/ad_clients/${client.id}/invoices`).then((r) => setInvoices(r.data)).catch((e) => { toast.error(errMsg(e)); setInvoices([]); });
  }, [client.id]);
  useEffect(load, [load]);

  const issue = async () => {
    setBusy(true);
    try {
      await fetchApi(`/admin/ad_banners/${bannerId}/invoices`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ period, ...(amount ? { subtotal: Number(amount) } : {}) }) });
      toast.success("Factura emitida");
      setAmount("");
      load();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  return (
    <div className="rounded-xl border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Facturación · {String(client.trade_name || client.legal_name)}</h3>
        <Button size="sm" variant="ghost" onClick={onClose}>Cerrar</Button>
      </div>

      {banners.length ? (
        <div className="flex flex-wrap items-end gap-2">
          <label className="grid gap-1 text-xs">Banner
            <select value={bannerId} onChange={(e) => setBannerId(e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
              {banners.map((b) => <option key={b.id} value={b.id}>{String(b.name)}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-xs">Mes<Input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} className="h-9" /></label>
          <label className="grid gap-1 text-xs">Monto sin ITBIS (vacío = precio mensual del banner)<Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-9 w-48" /></label>
          <Button size="sm" onClick={issue} disabled={busy || !bannerId}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Emitir factura"}</Button>
        </div>
      ) : <p className="text-sm text-muted-foreground">Este cliente aún no tiene banners.</p>}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left"><tr><th className="px-3 py-2">NCF</th><th className="px-3 py-2">Banner</th><th className="px-3 py-2">Mes</th><th className="px-3 py-2">Total</th><th className="px-3 py-2">Estado</th><th className="px-3 py-2">Emitida</th></tr></thead>
          <tbody>
            {invoices?.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="px-3 py-2 font-mono">{i.ncf}</td><td className="px-3 py-2">{i.banner_name}</td><td className="px-3 py-2">{i.period}</td>
                <td className="px-3 py-2">{i.currency} {Number(i.total).toLocaleString("es-DO", { minimumFractionDigits: 2 })}</td>
                <td className="px-3 py-2">{i.status}</td><td className="px-3 py-2">{i.issued_at.slice(0, 10)}</td>
              </tr>
            ))}
            {invoices && !invoices.length && <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">Sin facturas</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
