// Datos de los formularios de la landing (solo administradores): participantes del sorteo y solicitudes de negocios.
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, Loader2, Trash2 } from "lucide-react";
import { fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const apiMessage = (e: unknown) => (e instanceof HttpError ? (e.details as { error?: { message?: string } } | null)?.error?.message : null) ?? (e instanceof Error ? e.message : "Error");
const fecha = (iso: string) => new Date(iso).toLocaleString("es-DO", { dateStyle: "medium", timeStyle: "short" });

function useResource<T extends { id: string }>(resource: "leads" | "establishment-requests" | "contact-messages") {
  const qc = useQueryClient();
  const queryKey = ["staging", resource];
  const query = useQuery({ queryKey, queryFn: async () => (await fetchApi<{ data: T[] }>(`/admin/${resource}`)).data });
  const refresh = () => void qc.invalidateQueries({ queryKey });
  const remove = useMutation({
    mutationFn: (id: string) => fetchApi(`/admin/${resource}/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast.success("Eliminado"); refresh(); },
    onError: (e) => toast.error(apiMessage(e)),
  });
  return { ...query, remove, refresh };
}

// ---------- sorteo ----------
interface Lead { id: string; name: string; email: string; interest: string | null; source: string; created_at: string }

/** CSV con BOM para que Excel abra bien las tildes; las celdas que empiezan por = + - @ se neutralizan. */
function toCsv(rows: Lead[]): string {
  const cell = (v: unknown) => {
    let s = String(v ?? "");
    if (/^[=+\-@]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  return "﻿" + [["Nombre", "Correo", "Interés", "Origen", "Fecha"], ...rows.map((r) => [r.name, r.email, r.interest, r.source, r.created_at])]
    .map((r) => r.map(cell).join(",")).join("\r\n");
}

export function StagingLeadsManager() {
  const { data: rows = [], isLoading, error, remove } = useResource<Lead>("leads");
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? rows.filter((r) => `${r.name} ${r.email}`.toLowerCase().includes(t)) : rows;
  }, [rows, q]);

  const exportCsv = () => {
    const url = URL.createObjectURL(new Blob([toCsv(shown)], { type: "text/csv;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `participantes-sorteo-${new Date().toISOString().slice(0, 10)}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Sorteo y boletín <span className="text-sm font-normal text-muted-foreground">({rows.length})</span></h2>
        <div className="flex gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar nombre o correo" aria-label="Buscar participante" className="h-9 w-56" />
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={!shown.length}><Download className="mr-2 h-4 w-4" />Exportar CSV</Button>
        </div>
      </div>
      {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : error ? (
        <p role="alert" className="text-sm text-destructive">No se pudo cargar: {apiMessage(error)}</p>
      ) : !shown.length ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">Todavía no hay participantes.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
              <tr><th className="p-3 font-medium">Nombre</th><th className="p-3 font-medium">Correo</th><th className="p-3 font-medium">Origen</th><th className="p-3 font-medium">Fecha</th><th className="p-3"><span className="sr-only">Acciones</span></th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {shown.map((r) => (
                <tr key={r.id}>
                  <td className="p-3 font-medium">{r.name}</td>
                  <td className="p-3"><a href={`mailto:${r.email}`} className="text-primary hover:underline">{r.email}</a></td>
                  <td className="p-3 text-muted-foreground">{r.interest ?? r.source}</td>
                  <td className="whitespace-nowrap p-3 text-muted-foreground">{fecha(r.created_at)}</td>
                  <td className="p-3 text-right">
                    <Button size="icon" variant="ghost" aria-label={`Eliminar a ${r.email}`} disabled={remove.isPending}
                      onClick={() => { if (window.confirm(`¿Eliminar a ${r.email} del sorteo?`)) remove.mutate(r.id); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// ---------- negocios ----------
interface Request {
  id: string; type: string; name: string; contact_name: string; email: string; phone: string; address: string | null;
  province: string | null; website: string | null; photo_url: string | null; description: string | null; rnc: string | null;
  schedule: string | null; details: string | null; status: "pending" | "approved" | "rejected"; created_at: string;
  /** Urls de las fotos (.webp) y el menú (.pdf) subidos, separadas por espacios. */
  files: string | null;
}
const STATUS: Record<Request["status"], { label: string; variant: "secondary" | "default" | "destructive" }> = {
  pending: { label: "Pendiente", variant: "secondary" }, approved: { label: "Aprobada", variant: "default" }, rejected: { label: "Rechazada", variant: "destructive" },
};

function parseDetails(json: string | null): [string, string][] {
  try {
    return Object.entries(JSON.parse(json ?? "{}") as Record<string, unknown>)
      .filter(([, v]) => v !== "" && v != null && !(Array.isArray(v) && !v.length))
      .map(([k, v]) => [k.replace(/_/g, " "), Array.isArray(v) ? v.join(", ") : typeof v === "object" ? JSON.stringify(v) : String(v)]);
  } catch {
    return [];
  }
}

export function StagingEstablishmentRequestsManager() {
  const { data: rows = [], isLoading, error, remove, refresh } = useResource<Request>("establishment-requests");
  const [filter, setFilter] = useState<Request["status"] | "all">("pending");
  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Request["status"] }) =>
      fetchApi(`/admin/establishment-requests/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => { toast.success("Estado actualizado"); refresh(); },
    onError: (e) => toast.error(apiMessage(e)),
  });
  const shown = filter === "all" ? rows : rows.filter((r) => r.status === filter);
  const count = (s: Request["status"]) => rows.filter((r) => r.status === s).length;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Solicitudes de negocios</h2>
        <div role="group" aria-label="Filtrar por estado" className="flex flex-wrap gap-1.5">
          {(["pending", "approved", "rejected", "all"] as const).map((s) => (
            <button key={s} type="button" aria-pressed={filter === s} onClick={() => setFilter(s)}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${filter === s ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"}`}>
              {s === "all" ? `Todas (${rows.length})` : `${STATUS[s].label} (${count(s)})`}
            </button>
          ))}
        </div>
      </div>
      {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : error ? (
        <p role="alert" className="text-sm text-destructive">No se pudo cargar: {apiMessage(error)}</p>
      ) : !shown.length ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No hay solicitudes en este estado.</p>
      ) : (
        <ul className="space-y-3">
          {shown.map((r) => (
            <li key={r.id} className="rounded-2xl border border-border bg-card">
              <details className="group">
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{r.name} <span className="text-xs font-normal capitalize text-muted-foreground">· {r.type}</span></p>
                    <p className="truncate text-xs text-muted-foreground">{r.contact_name} · {r.province ?? "Sin provincia"} · {fecha(r.created_at)}</p>
                  </div>
                  <Badge variant={STATUS[r.status].variant}>{STATUS[r.status].label}</Badge>
                </summary>
                <div className="space-y-4 border-t border-border p-4 text-sm">
                  <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                    {([
                      ["Correo", <a key="e" href={`mailto:${r.email}`} className="text-primary hover:underline">{r.email}</a>],
                      ["Teléfono", <a key="t" href={`tel:${r.phone}`} className="text-primary hover:underline">{r.phone}</a>],
                      ["Dirección", r.address], ["RNC", r.rnc], ["Horario", r.schedule],
                      ["Web", r.website && <a key="w" href={r.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{r.website}</a>],
                      ...parseDetails(r.details),
                    ] as [string, React.ReactNode][]).filter(([, v]) => v).map(([k, v]) => (
                      <div key={k}><dt className="text-xs capitalize text-muted-foreground">{k}</dt><dd className="break-words">{v}</dd></div>
                    ))}
                  </dl>
                  {r.description && <p className="whitespace-pre-line text-muted-foreground">{r.description}</p>}
                  {r.files && (
                    <div className="flex flex-wrap items-center gap-2">
                      {r.files.split(" ").map((u, i) => u.endsWith(".pdf") ? (
                        <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="rounded-md border border-border px-3 py-2 text-primary hover:underline">Menú (PDF)</a>
                      ) : (
                        <a key={u} href={u} target="_blank" rel="noopener noreferrer"><img src={u} alt={`Foto ${i + 1} de ${r.name}`} className="h-20 w-28 rounded-md object-cover" loading="lazy" /></a>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    {(["approved", "rejected", "pending"] as const).filter((s) => s !== r.status).map((s) => (
                      <Button key={s} size="sm" variant={s === "rejected" ? "outline" : "default"} disabled={setStatus.isPending}
                        onClick={() => setStatus.mutate({ id: r.id, status: s })}>
                        {s === "approved" ? "Aprobar" : s === "rejected" ? "Rechazar" : "Volver a pendiente"}
                      </Button>
                    ))}
                    <Button size="sm" variant="ghost" className="ml-auto text-destructive" disabled={remove.isPending}
                      onClick={() => { if (window.confirm(`¿Eliminar la solicitud de «${r.name}»?`)) remove.mutate(r.id); }}>
                      <Trash2 className="mr-1.5 h-4 w-4" />Eliminar
                    </Button>
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

interface ContactMessage { id: string; name: string; email: string; subject: string | null; message: string; created_at: string }

/** Mensajes del formulario de /contacto: se leen aquí y se responden por correo. */
export function StagingContactMessagesManager() {
  const { data: rows = [], isLoading, error, remove } = useResource<ContactMessage>("contact-messages");
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Mensajes de contacto <span className="text-sm font-normal text-muted-foreground">({rows.length})</span></h2>
      {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : error ? (
        <p role="alert" className="text-sm text-destructive">No se pudo cargar: {apiMessage(error)}</p>
      ) : !rows.length ? (
        <p className="rounded-md border border-dashed border-border p-10 text-center text-sm text-muted-foreground">Todavía no hay mensajes.</p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border bg-card">
          {rows.map((r) => (
            <li key={r.id} className="p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium">{r.subject ?? "Sin asunto"} <span className="font-normal text-muted-foreground">· {r.name}</span></p>
                <span className="text-xs text-muted-foreground">{fecha(r.created_at)}</span>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm">{r.message}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" asChild><a href={`mailto:${r.email}?subject=${encodeURIComponent(`Re: ${r.subject ?? "Tu mensaje a Descubre RD"}`)}`}>Responder a {r.email}</a></Button>
                <Button size="sm" variant="ghost" aria-label={`Eliminar mensaje de ${r.name}`} disabled={remove.isPending}
                  onClick={() => { if (window.confirm("¿Eliminar este mensaje?")) remove.mutate(r.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
