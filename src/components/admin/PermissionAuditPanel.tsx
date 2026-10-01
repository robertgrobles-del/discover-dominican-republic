import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PanelEmptyState } from "@/components/ui/panel-empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, Search, RefreshCw, KeyRound, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { fetchApi } from "@/lib/fastifyClient";
import { IS_MOCK_DATA } from "@/lib/dataSource";
import { DEMO_CAPABILITIES } from "@/lib/capabilities";
import { MockDataNotice } from "@/components/MockDataNotice";

/**
 * Auditoría visual de permisos (Plan de accesos y paneles por perfil, punto 66).
 *
 * Para soporte autorizado: muestra, ruta por ruta, **qué recurso**, **qué permiso lo protege**, **qué rol
 * lo obtiene** y **de dónde sale esa decisión** (rol global, membresía de organización, perfil de producto o
 * permiso sobre el recurso concreto). Los datos vienen del inventario real del servidor
 * (`GET /api/v1/admin/access/audit`), no de una lista escrita a mano: si alguien añade una ruta sin
 * declararla, esta tabla lo delata.
 */

const SOURCE_LABEL: Record<string, string> = {
  publico: "Público (sin sesión)",
  rol_global: "Rol global",
  pertenencia_organizacion: "Membresía de organización",
  perfil_de_producto: "Perfil de producto",
  permiso_de_recurso: "Permiso de recurso",
};

interface AuditRow {
  method: string;
  url: string;
  authenticated: boolean;
  roles: string[];
  org_scope: boolean;
  decision_source: string;
  capability: string | null;
  capability_label: string | null;
  panel: string;
  mfa_required: boolean;
  owner: string | null;
  declared: boolean;
}

interface AuditPayload {
  catalog_version: string;
  summary: {
    routes: number;
    declared: number;
    undeclared: number;
    authenticated: number;
    public: number;
    mfa_required: number;
    by_source: Record<string, number>;
  };
  capabilities: { key: string; label: string; panel: string }[];
  rows: AuditRow[];
}

const PANELS = ["todos", "publico", "viajero", "empresa", "creador", "embajador", "editorial", "moderacion", "admin"];

export function PermissionAuditPanel() {
  const { session } = useAuth();
  const [panel, setPanel] = useState("todos");
  const [capability, setCapability] = useState("todas");
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [page, setPage] = useState(1);

  const token = session?.access_token ?? null;
  const enabled = !IS_MOCK_DATA && !!token;

  const query = useQuery({
    queryKey: ["access-audit", panel, capability, appliedQ, page, token ? "auth" : "no-auth"],
    enabled,
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), per_page: "50", panel });
      if (capability !== "todas") params.set("capability", capability);
      if (appliedQ) params.set("q", appliedQ);
      return fetchApi<{ data: AuditPayload; meta: { total: number; total_pages: number } }>(
        `/admin/access/audit?${params.toString()}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
      );
    },
  });

  if (IS_MOCK_DATA) {
    return (
      <div className="space-y-6">
        <MockDataNotice className="rounded-xl" />
        <PanelEmptyState
          icon={KeyRound}
          title="El inventario de rutas necesita el backend"
          description="Con datos simulados no hay servidor que decir qué exige cada endpoint. Abajo queda el catálogo de capacidades del entorno de demostración; con VITE_DATA_SOURCE=api esta pantalla muestra el inventario real, ruta por ruta, con su fuente de decisión."
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Catálogo de demostración</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Capacidad</TableHead>
                  <TableHead>Panel</TableHead>
                  <TableHead>Fuente de decisión</TableHead>
                  <TableHead>Concedida por</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEMO_CAPABILITIES.map((c) => (
                  <TableRow key={c.key}>
                    <TableCell className="font-mono text-[11px]">{c.key}</TableCell>
                    <TableCell className="text-xs">{c.panel}</TableCell>
                    <TableCell className="text-xs">{SOURCE_LABEL[c.source] ?? c.source}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{c.granted_by}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  const payload = query.data?.data;
  const meta = query.data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden /> Auditoría visual de permisos
          </h2>
          <p className="text-xs text-muted-foreground">
            Inventario real de rutas del servidor con su permiso, su rol y la fuente de decisión.
            {payload && <span className="ml-1 font-mono">catálogo {payload.catalog_version}</span>}
          </p>
        </div>
        <Button size="sm" variant="outline" className="h-8 gap-1.5 rounded-xl text-xs" onClick={() => query.refetch()} disabled={query.isFetching}>
          <RefreshCw className={`h-3.5 w-3.5 ${query.isFetching ? "animate-spin" : ""}`} aria-hidden /> Actualizar
        </Button>
      </div>

      {query.isError && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 text-xs text-destructive">
            No se pudo leer el inventario de permisos. Comprueba que el backend esté disponible y que tu sesión tenga el segundo factor completado.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {query.isLoading &&
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        {payload && (
          <>
            <SummaryCard title="Rutas inventariadas" value={payload.summary.routes} hint={`${payload.summary.authenticated} exigen sesión`} />
            <SummaryCard title="Sin capacidad declarada" value={payload.summary.undeclared} hint={payload.summary.undeclared === 0 ? "Todo declarado" : "Revisar: ruta nueva sin declarar"} tone={payload.summary.undeclared === 0 ? "ok" : "warn"} />
            <SummaryCard title="Rutas públicas" value={payload.summary.public} hint="No exigen sesión; deben estar justificadas" />
            <SummaryCard title="Con MFA obligatorio" value={payload.summary.mfa_required} hint="Personal interno y operaciones sensibles" />
          </>
        )}
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div className="min-w-[12rem] flex-1">
            <label className="mb-1 block text-[11px] font-semibold text-muted-foreground" htmlFor="audit-q">Recurso o rol</label>
            <Input
              id="audit-q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setAppliedQ(q.trim()); setPage(1); } }}
              placeholder="/api/v1/admin/users"
              className="h-9 text-xs"
            />
          </div>
          <div className="w-[11rem]">
            <label className="mb-1 block text-[11px] font-semibold text-muted-foreground" htmlFor="audit-panel">Panel</label>
            <Select value={panel} onValueChange={(v) => { setPanel(v); setPage(1); }}>
              <SelectTrigger id="audit-panel" className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PANELS.map((p) => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-[14rem]">
            <label className="mb-1 block text-[11px] font-semibold text-muted-foreground" htmlFor="audit-capability">Capacidad</label>
            <Select value={capability} onValueChange={(v) => { setCapability(v); setPage(1); }}>
              <SelectTrigger id="audit-capability" className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas" className="text-xs">todas</SelectItem>
                {(payload?.capabilities ?? []).map((c) => (
                  <SelectItem key={c.key} value={c.key} className="text-xs">{c.key}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" className="h-9 gap-1.5 rounded-xl text-xs" onClick={() => { setAppliedQ(q.trim()); setPage(1); }}>
            <Search className="h-3.5 w-3.5" aria-hidden /> Buscar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Método</TableHead>
                <TableHead>Recurso</TableHead>
                <TableHead>Permiso (capacidad)</TableHead>
                <TableHead>Roles que lo obtienen</TableHead>
                <TableHead>Fuente de decisión</TableHead>
                <TableHead className="w-16 text-center">MFA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.isLoading && (
                <TableRow><TableCell colSpan={6} className="p-6"><Skeleton className="h-24 w-full" /></TableCell></TableRow>
              )}
              {payload?.rows.map((row) => (
                <TableRow key={`${row.method}-${row.url}`}>
                  <TableCell className="font-mono text-[11px] font-bold">{row.method}</TableCell>
                  <TableCell className="font-mono text-[11px]">{row.url}</TableCell>
                  <TableCell className="text-xs">
                    <span className="block font-semibold">{row.capability_label ?? "Sin declarar"}</span>
                    <span className="block font-mono text-[10px] text-muted-foreground">{row.capability ?? "—"}{row.owner ? ` · ${row.owner}` : ""}</span>
                  </TableCell>
                  <TableCell className="text-xs">
                    {row.roles.length > 0
                      ? <span className="flex flex-wrap gap-1">{row.roles.map((r) => <Badge key={r} variant="outline" className="text-[10px] font-mono">{r}</Badge>)}</span>
                      : <span className="text-muted-foreground">{row.org_scope ? "Según organización" : "Solo sesión válida"}</span>}
                  </TableCell>
                  <TableCell className="text-xs">{SOURCE_LABEL[row.decision_source] ?? row.decision_source}</TableCell>
                  <TableCell className="text-center text-xs">{row.mfa_required ? "Sí" : "—"}</TableCell>
                </TableRow>
              ))}
              {payload && payload.rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="p-6">
                    <PanelEmptyState icon={Info} title="Sin rutas para este filtro" description="Prueba con otro panel, otra capacidad o borra la búsqueda." />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {meta && meta.total_pages > 1 && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Página {page} de {meta.total_pages} · {meta.total} rutas</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</Button>
            <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs" disabled={page >= meta.total_pages} onClick={() => setPage((p) => p + 1)}>Siguiente</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, hint, tone = "neutral" }: { title: string; value: number; hint: string; tone?: "neutral" | "ok" | "warn" }) {
  const toneClass = tone === "ok" ? "text-emerald-600" : tone === "warn" ? "text-amber-600" : "text-foreground";
  return (
    <Card>
      <CardContent className="space-y-1 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
        <p className={`text-2xl font-black ${toneClass}`}>{value}</p>
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
