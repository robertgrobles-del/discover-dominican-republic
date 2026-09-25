import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BellRing, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { opKeys, updateOrg, useBookings, useMessages, useOpMutation } from "../api";
import {
  AUTOMATION_META, TEMPLATE_VARS, getAutomation, renderTemplate, sendDueReminders,
  type AutomationChannel, type AutomationConfig, type AutomationKind, type AutomationRule,
} from "../automation";
import type { Booking } from "../types";
import { useOrg } from "./OrgContext";

const KINDS = Object.keys(AUTOMATION_META) as AutomationKind[];

export default function Automatizaciones() {
  const { org } = useOrg();
  const qc = useQueryClient();
  const { data: messages = [] } = useMessages(org.id);
  const { data: bookings = [] } = useBookings(org.id);
  const [cfg, setCfg] = useState<AutomationConfig>(() => getAutomation(org));
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const save = useOpMutation((c: AutomationConfig) => updateOrg(org.id, { automation: c }), [opKeys.org(org.id)]);

  const set = (k: AutomationKind, patch: Partial<AutomationRule>) => { setCfg((c) => ({ ...c, [k]: { ...c[k], ...patch } })); setDirty(true); };
  const toggleCh = (k: AutomationKind, ch: AutomationChannel) => set(k, { channels: cfg[k].channels.includes(ch) ? cfg[k].channels.filter((x) => x !== ch) : [...cfg[k].channels, ch] });

  const sample = useMemo<Booking>(() => bookings.find((b) => b.status !== "cancelled") || {
    id: "bk-ejemplo", org_id: org.id, listing_id: "x", listing_title: "Excursión a Isla Saona", contact_name: "María Pérez", contact_email: "maria@example.com",
    date: new Date().toISOString().slice(0, 10), time: "08:00", guests: 2, total_price: 150, currency: "USD", status: "confirmed", payment_status: "partial", amount_paid: 45,
    source: "web", created_at: new Date().toISOString(),
  }, [bookings, org.id]);

  const log = messages.filter((m) => m.sender === "operator" && m.body.startsWith("[Automático")).slice().reverse();

  const runReminders = async () => {
    setBusy(true);
    try {
      const n = await sendDueReminders({ ...org, automation: cfg });
      toast[n ? "success" : "message"](n ? `${n} recordatorio(s) enviado(s)` : "No hay recordatorios pendientes para mañana.");
      if (n) qc.invalidateQueries({ queryKey: ["op"] });
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold">Automatizaciones</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" disabled={busy} onClick={runReminders}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />} Enviar recordatorios de mañana</Button>
          <Button disabled={!dirty || save.isPending} onClick={() => save.mutate(cfg, { onSuccess: () => { setDirty(false); toast.success("Automatizaciones guardadas"); }, onError: (e: any) => toast.error(e.message) })}>Guardar cambios</Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">Mensajes automáticos a tus viajeros por correo y WhatsApp. Quedan registrados en tus <b>Mensajes</b>. En este entorno de demostración el envío es simulado.</p>

      {KINDS.map((k) => (
        <Card key={k}>
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div><CardTitle className="text-lg">{AUTOMATION_META[k].label}</CardTitle><p className="text-sm text-muted-foreground">{AUTOMATION_META[k].when}</p></div>
            <Switch checked={cfg[k].enabled} onCheckedChange={(v) => set(k, { enabled: v })} aria-label={`Activar ${AUTOMATION_META[k].label}`} />
          </CardHeader>
          <CardContent className={`space-y-3 ${cfg[k].enabled ? "" : "opacity-50"}`}>
            <div className="flex gap-4 text-sm">
              {(["email", "whatsapp"] as const).map((ch) => (
                <label key={ch} className="flex items-center gap-2"><Checkbox checked={cfg[k].channels.includes(ch)} onCheckedChange={() => toggleCh(k, ch)} /> {ch === "email" ? "Correo" : "WhatsApp"}</label>
              ))}
            </div>
            <div className="space-y-1"><Label htmlFor={`s-${k}`} className="text-xs">Asunto (correo)</Label><Input id={`s-${k}`} maxLength={120} value={cfg[k].subject} onChange={(e) => set(k, { subject: e.target.value })} /></div>
            <div className="space-y-1"><Label htmlFor={`b-${k}`} className="text-xs">Mensaje</Label><Textarea id={`b-${k}`} rows={4} maxLength={800} value={cfg[k].body} onChange={(e) => set(k, { body: e.target.value })} /></div>
            <div className="rounded-lg bg-muted p-3 text-sm whitespace-pre-line"><p className="text-xs text-muted-foreground mb-1">Vista previa</p><b>{renderTemplate(cfg[k].subject, org, sample)}</b>{"\n"}{renderTemplate(cfg[k].body, org, sample)}</div>
          </CardContent>
        </Card>
      ))}
      <p className="text-xs text-muted-foreground">Variables disponibles: {TEMPLATE_VARS.join("  ")}</p>

      <section>
        <h2 className="font-display text-xl font-bold mb-3">Historial de envíos</h2>
        {log.length === 0 ? <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Aún no se ha enviado ningún mensaje automático.</CardContent></Card> : (
          <div className="space-y-2">{log.slice(0, 30).map((m) => (
            <Card key={m.id}><CardContent className="p-3 text-sm flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0"><p className="font-medium">{m.traveler_name}</p><p className="text-xs text-muted-foreground whitespace-pre-line line-clamp-3">{m.body}</p></div>
              <div className="flex items-center gap-2"><Badge variant="outline">{m.channel === "whatsapp" ? "WhatsApp" : "Correo"}</Badge><span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString("es-DO")}</span></div>
            </CardContent></Card>
          ))}</div>
        )}
      </section>
    </div>
  );
}
