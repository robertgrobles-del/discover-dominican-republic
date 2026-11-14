// Datos de los formularios de la landing (solo administradores): participantes del sorteo y solicitudes de negocios.
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, Loader2, Trash2, Plus, ExternalLink, Eye, CheckCircle2 } from "lucide-react";
import { fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RegistroEstablecimientoModal } from "@/components/forms/RegistroEstablecimientoModal";
import { EstablishmentCard } from "@/components/establishments/EstablishmentCard";
import type { PublicEstablishment } from "@/lib/stagingContent";
import { confirmAction } from "./confirmAction";

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
        <p className="text-sm text-muted-foreground tabular-nums">
          {shown.length} participante{shown.length === 1 ? "" : "s"}{q.trim() ? ` de ${rows.length}` : ""}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o correo" aria-label="Buscar participante" className="h-9 w-60" />
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={!shown.length}><Download className="mr-2 h-4 w-4" />Exportar CSV</Button>
        </div>
      </div>
      {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : error ? (
        <p role="alert" className="text-sm text-destructive">No se pudo cargar: {apiMessage(error)}</p>
      ) : !shown.length ? (
        <p className="rounded-lg border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">Todavía no hay participantes.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-xs">
          <table className="admin-table w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
              <tr><th className="px-4 py-2.5 font-medium">Nombre</th><th className="px-3 py-2.5 font-medium">Correo</th><th className="px-3 py-2.5 font-medium">Origen</th><th className="px-3 py-2.5 font-medium">Fecha</th><th className="px-4 py-2.5 text-right font-medium"><span className="sr-only">Acciones</span></th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {shown.map((r) => (
                <tr key={r.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-medium">{r.name}</td>
                  <td className="px-3 py-2.5"><a href={`mailto:${r.email}`} className="text-primary hover:underline">{r.email}</a></td>
                  <td className="px-3 py-2.5 text-muted-foreground">{r.interest ?? r.source}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-xs tabular-nums text-muted-foreground">{fecha(r.created_at)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Button size="icon" variant="ghost" aria-label={`Eliminar a ${r.email}`} disabled={remove.isPending}
                      onClick={async () => { if (await confirmAction(`¿Eliminar a ${r.email} del sorteo?`)) remove.mutate(r.id); }}>
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
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [cardPreview, setCardPreview] = useState<Request | null>(null);

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Request["status"] }) =>
      fetchApi(`/admin/establishment-requests/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: (_, vars) => {
      toast.success(vars.status === "approved" ? "Empresa publicada en el directorio" : "Estado actualizado");
      refresh();
    },
    onError: (e) => toast.error(apiMessage(e)),
  });
  const shown = filter === "all" ? rows : rows.filter((r) => r.status === filter);
  const count = (s: Request["status"]) => rows.filter((r) => r.status === s).length;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Filtrar por estado" className="flex flex-wrap gap-1.5">
          {(["pending", "approved", "rejected", "all"] as const).map((s) => (
            <button key={s} type="button" aria-pressed={filter === s} onClick={() => setFilter(s)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${filter === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/50"}`}>
              {s === "all" ? `Todas (${rows.length})` : `${STATUS[s].label} (${count(s)})`}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => setRegisterModalOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Registrar y publicar empresa
        </Button>
      </div>
      {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : error ? (
        <p role="alert" className="text-sm text-destructive">No se pudo cargar: {apiMessage(error)}</p>
      ) : !shown.length ? (
        <p className="rounded-lg border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">No hay solicitudes en este estado.</p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card shadow-xs">
          {shown.map((r) => (
            <li key={r.id}>
              <details className="group">
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/20">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{r.name} <span className="text-xs font-normal capitalize text-muted-foreground">· {r.type}</span></p>
                    <p className="truncate text-xs text-muted-foreground">{r.contact_name} · {r.province ?? "Sin provincia"} · <span className="tabular-nums">{fecha(r.created_at)}</span></p>
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
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
                    {r.status === "approved" ? (
                      <>
                        <Button size="sm" asChild variant="default" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
                          <Link to={`/negocios/${r.id}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" /> Ver Página Pública
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setCardPreview(r)} className="gap-1.5 rounded-lg">
                          <Eye className="h-3.5 w-3.5" /> Ver Card
                        </Button>
                        <Button size="sm" variant="ghost" disabled={setStatus.isPending} onClick={() => setStatus.mutate({ id: r.id, status: "pending" })}>
                          Despublicar
                        </Button>
                      </>
                    ) : r.status === "pending" ? (
                      <>
                        <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg" disabled={setStatus.isPending}
                          onClick={() => setStatus.mutate({ id: r.id, status: "approved" })}>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Publicar Empresa
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setCardPreview(r)} className="gap-1.5 rounded-lg">
                          <Eye className="h-3.5 w-3.5" /> Vista Previa Card
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" disabled={setStatus.isPending}
                          onClick={() => setStatus.mutate({ id: r.id, status: "rejected" })}>
                          Rechazar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" disabled={setStatus.isPending} onClick={() => setStatus.mutate({ id: r.id, status: "pending" })}>
                          Volver a pendiente
                        </Button>
                        <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg" disabled={setStatus.isPending}
                          onClick={() => setStatus.mutate({ id: r.id, status: "approved" })}>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Aprobar y Publicar
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="ghost" className="ml-auto text-destructive" disabled={remove.isPending}
                      onClick={async () => { if (await confirmAction(`¿Eliminar la solicitud de «${r.name}»?`)) remove.mutate(r.id); }}>
                      <Trash2 className="mr-1.5 h-4 w-4" />Eliminar
                    </Button>
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}

      {/* Registro directo por administrador */}
      {registerModalOpen && (
        <RegistroEstablecimientoModal
          open={registerModalOpen}
          onClose={() => {
            setRegisterModalOpen(false);
            refresh();
          }}
          tipo="general"
          isAdmin={true}
        />
      )}

      {/* Previsualización de Card */}
      <Dialog open={Boolean(cardPreview)} onOpenChange={(open) => !open && setCardPreview(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vista Previa de la Card</DialogTitle>
          </DialogHeader>
          {cardPreview && (
            <div className="py-2">
              <EstablishmentCard
                establishment={{
                  id: cardPreview.id,
                  type: cardPreview.type,
                  name: cardPreview.name,
                  contact_name: cardPreview.contact_name,
                  email: cardPreview.email,
                  phone: cardPreview.phone,
                  address: cardPreview.address,
                  province: cardPreview.province,
                  website: cardPreview.website,
                  photo_url: cardPreview.photo_url,
                  description: cardPreview.description,
                  schedule: cardPreview.schedule,
                  details: cardPreview.details,
                  files: cardPreview.files,
                  created_at: cardPreview.created_at,
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

interface ContactMessage { id: string; name: string; email: string; subject: string | null; message: string; created_at: string }

/** Mensajes del formulario de /contacto: se leen aquí y se responden por correo. */
export function StagingContactMessagesManager() {
  const { data: rows = [], isLoading, error, remove } = useResource<ContactMessage>("contact-messages");
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? rows.filter((r) => `${r.name} ${r.email} ${r.subject ?? ""} ${r.message}`.toLowerCase().includes(t)) : rows;
  }, [rows, q]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground tabular-nums">
          {shown.length} mensaje{shown.length === 1 ? "" : "s"}{q.trim() ? ` de ${rows.length}` : ""}
        </p>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar asunto, remitente o mensaje" aria-label="Buscar mensaje" className="h-9 w-64" />
      </div>
      {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : error ? (
        <p role="alert" className="text-sm text-destructive">No se pudo cargar: {apiMessage(error)}</p>
      ) : !shown.length ? (
        <p className="rounded-lg border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">Todavía no hay mensajes.</p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card shadow-xs">
          {shown.map((r) => (
            <li key={r.id} className="p-4 transition-colors hover:bg-muted/20">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium">{r.subject ?? "Sin asunto"} <span className="font-normal text-muted-foreground">· {r.name}</span></p>
                <span className="text-xs tabular-nums text-muted-foreground">{fecha(r.created_at)}</span>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-foreground/90">{r.message}</p>
              <div className="mt-3 flex items-center gap-2">
                <Button size="sm" asChild><a href={`mailto:${r.email}?subject=${encodeURIComponent(`Re: ${r.subject ?? "Tu mensaje a Descubre RD"}`)}`}>Responder a {r.email}</a></Button>
                <Button size="sm" variant="ghost" aria-label={`Eliminar mensaje de ${r.name}`} disabled={remove.isPending}
                  onClick={async () => { if (await confirmAction("¿Eliminar este mensaje?")) remove.mutate(r.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
