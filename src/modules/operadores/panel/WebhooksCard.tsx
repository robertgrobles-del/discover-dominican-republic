import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Webhook as WebhookIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { WEBHOOK_EVENTS, WEBHOOK_EVENT_LABEL, operatorToolsApi as api, toolsErrorMessage, type WebhookEvent } from "@/lib/operatorToolsApi";

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString("es-DO", { dateStyle: "medium", timeStyle: "short" }) : "—");
const fail = (error: unknown) => toast.error(toolsErrorMessage(error));
const DELIVERY_LABEL = { pending: "Pendiente", delivered: "Entregada", failed: "Fallida" } as const;

/** Webhooks salientes del operador: avisos firmados a su propio sistema cuando se crea o cancela una reserva. */
export function WebhooksCard() {
  const client = useQueryClient();
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<WebhookEvent[]>(["booking.created"]);
  const [secret, setSecret] = useState<string | null>(null);
  const [inspecting, setInspecting] = useState<string | null>(null);
  const refresh = () => client.invalidateQueries({ queryKey: ["op", "webhooks"] });

  const list = useQuery({ queryKey: ["op", "webhooks"], enabled: HAS_BACKEND_SESSION, queryFn: api.webhooks, retry: false });
  const deliveries = useQuery({ queryKey: ["op", "webhook-deliveries", inspecting], enabled: !!inspecting, queryFn: () => api.deliveries(inspecting!) });
  const create = useMutation({ mutationFn: () => api.createWebhook(url.trim(), events), onSuccess: (res) => { setSecret(res.data.secret); setUrl(""); void refresh(); }, onError: fail });
  const remove = useMutation({ mutationFn: api.deleteWebhook, onSuccess: () => { toast.success("Webhook eliminado"); void refresh(); }, onError: fail });
  const enable = useMutation({ mutationFn: api.enableWebhook, onSuccess: () => { toast.success("Webhook reactivado"); void refresh(); }, onError: fail });
  const test = useMutation({ mutationFn: api.testWebhook, onSuccess: () => toast.success("Entrega de prueba encolada; llegará en un minuto"), onError: fail });

  if (!HAS_BACKEND_SESSION) return null;
  const hooks = list.data?.data ?? [];
  const validUrl = /^https:\/\/\S+$/.test(url.trim());
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><WebhookIcon className="h-4 w-4" aria-hidden /> Webhooks</CardTitle>
        <CardDescription className="text-xs">Avisamos a tu sistema cuando se crea o cancela una reserva. Cada aviso va firmado en la cabecera <code>X-Signature</code> y no incluye datos de contacto del viajero.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {secret && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3" role="status">
            <p className="font-semibold">Guarda este secreto ahora: no se volverá a mostrar.</p>
            <code className="mt-1 block break-all text-xs">{secret}</code>
            <Button size="sm" variant="outline" className="mt-2 h-8 text-xs" onClick={() => { void navigator.clipboard?.writeText(secret); toast.success("Secreto copiado"); }}>Copiar</Button>
            <Button size="sm" variant="ghost" className="mt-2 h-8 text-xs" onClick={() => setSecret(null)}>Ya lo guardé</Button>
          </div>
        )}

        {list.isLoading && <Skeleton className="h-16 w-full" />}
        {list.isError && <p className="text-destructive">{toolsErrorMessage(list.error)}</p>}
        {list.data && hooks.length === 0 && <p className="text-muted-foreground">Aún no tienes webhooks.</p>}
        {hooks.map((h) => (
          <div key={h.id} className="rounded-xl border border-border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="break-all font-medium">{h.url}</span>
              <Badge variant="outline" className="text-[10px]">{h.active ? "Activo" : "Desactivado"}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {h.events.map((e) => WEBHOOK_EVENT_LABEL[e] ?? e).join(" · ")} · última entrega: {when(h.last_delivery_at)}
              {h.consecutive_failures > 0 && <> · {h.consecutive_failures} fallos seguidos</>}
              {h.disabled_reason && <span className="block">{h.disabled_reason}</span>}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {!h.active && <Button size="sm" className="h-8 text-xs" disabled={enable.isPending} onClick={() => enable.mutate(h.id)}>Reactivar</Button>}
              <Button size="sm" variant="outline" className="h-8 text-xs" disabled={test.isPending || !h.active} onClick={() => test.mutate(h.id)}>Enviar prueba</Button>
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setInspecting(inspecting === h.id ? null : h.id)}>{inspecting === h.id ? "Ocultar entregas" : "Ver entregas"}</Button>
              <Button size="sm" variant="ghost" className="h-8 text-xs text-destructive" disabled={remove.isPending} onClick={() => remove.mutate(h.id)}>Eliminar</Button>
            </div>
            {inspecting === h.id && (
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {deliveries.isLoading && <li>Cargando…</li>}
                {deliveries.data?.data.length === 0 && <li>Sin entregas todavía.</li>}
                {deliveries.data?.data.map((d) => <li key={d.id}>{when(d.created_at)} · {d.event} · {DELIVERY_LABEL[d.status]}{d.response_status ? ` (HTTP ${d.response_status})` : ""} · {d.attempts} intento(s)</li>)}
              </ul>
            )}
          </div>
        ))}

        <div className="grid gap-3 rounded-xl border border-border bg-muted/40 p-3 md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-2">
            <Label htmlFor="webhook-url" className="text-xs">URL de tu sistema (https)</Label>
            <Input id="webhook-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://tu-sistema.com/descubre-rd" className="h-9 text-xs" />
            <div className="flex flex-wrap gap-4">
              {WEBHOOK_EVENTS.map((e) => (
                <label key={e} className="flex items-center gap-2 text-xs">
                  <Checkbox checked={events.includes(e)} onCheckedChange={(on) => setEvents(on ? [...new Set([...events, e])] : events.filter((x) => x !== e))} /> {WEBHOOK_EVENT_LABEL[e]}
                </label>
              ))}
            </div>
          </div>
          <Button size="sm" className="h-9 text-xs" disabled={!validUrl || events.length === 0 || create.isPending} onClick={() => create.mutate()}>Agregar webhook</Button>
        </div>
      </CardContent>
    </Card>
  );
}
