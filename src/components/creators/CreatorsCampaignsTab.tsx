import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BadgeCheck, CalendarRange, FileSignature, Megaphone, ScrollText, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PanelEmptyState } from "@/components/ui/panel-empty-state";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { DELIVERABLE_LABEL, campaignErrorMessage, creatorCampaignsApi as api, describeCompensation, type License, type OpenCampaign } from "@/lib/creatorCampaignsApi";

/**
 * Campañas abiertas para el creador (plan de accesos, puntos 87, 88, 89 y 93): lee los términos completos,
 * acepta una versión concreta, entrega piezas propias y consulta o retira las licencias de cada pieza.
 */

interface Props { videos: { id: string; title: string }[] }
const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("es-DO", { dateStyle: "medium" }) : "sin vencimiento");
const fail = (error: unknown) => toast.error(campaignErrorMessage(error));

export function CreatorsCampaignsTab({ videos }: Props) {
  const client = useQueryClient();
  const [pieces, setPieces] = useState<Record<string, string>>({});
  const query = useQuery({ queryKey: ["creator-campaigns"], enabled: HAS_BACKEND_SESSION, queryFn: api.open });
  const refresh = () => client.invalidateQueries({ queryKey: ["creator-campaigns"] });

  const accept = useMutation({
    mutationFn: (c: OpenCampaign) => api.accept(c.id, c.version),
    onSuccess: () => { toast.success("Términos aceptados. Queda registrado con fecha y versión."); void refresh(); },
    // Si la versión cambió, se recarga para que lea la vigente antes de volver a aceptar.
    onError: (error) => { fail(error); void refresh(); },
  });
  const deliver = useMutation({
    mutationFn: (c: OpenCampaign) => api.deliver(c.id, pieces[c.id]!),
    onSuccess: () => { toast.success("Pieza entregada. El equipo la revisará."); void refresh(); },
    onError: fail,
  });

  if (!HAS_BACKEND_SESSION) return <PanelEmptyState icon={Megaphone} title="Las campañas necesitan el backend" description="Sin sesión contra el backend no hay campañas reales que aceptar ni entregas que registrar." />;
  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-2xl" />;
  if (query.isError) return <PanelEmptyState icon={Megaphone} title="No pudimos cargar las campañas" description={campaignErrorMessage(query.error)} actionLabel="Reintentar" onAction={() => query.refetch()} />;

  const campaigns = query.data?.data ?? [];
  return (
    <div className="space-y-6">
      {campaigns.length === 0 && <PanelEmptyState icon={Megaphone} title="No hay campañas abiertas" description="Cuando el equipo abra una campaña aparecerá aquí con sus términos completos." />}
      {campaigns.map((c) => (
        <Card key={c.id}>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">{c.title}</CardTitle>
                <CardDescription className="text-xs">{c.sponsor ? `Marca: ${c.sponsor} · ` : ""}Términos versión {c.version}</CardDescription>
              </div>
              {c.needs_acceptance
                ? <Badge variant="outline" className="border-amber-500/40 text-amber-600 text-[10px]">{c.accepted_version ? `Cambiaron desde la versión ${c.accepted_version} que aceptaste` : "Pendiente de aceptar"}</Badge>
                : <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 text-[10px]"><BadgeCheck className="mr-1 h-3 w-3" aria-hidden /> Aceptaste la versión {c.version}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <p className="leading-relaxed">{c.terms.brief}</p>
            <dl className="grid gap-3 sm:grid-cols-2">
              <Term icon={ScrollText} label="Entregables">{c.terms.deliverables.map((d) => `${d.quantity} ${DELIVERABLE_LABEL[d.type]}${d.due_date ? ` (hasta ${day(d.due_date)})` : ""}`).join(" · ")}</Term>
              <Term icon={CalendarRange} label="Calendario">{day(c.terms.schedule.starts_on)} – {day(c.terms.schedule.ends_on)}</Term>
              <Term icon={FileSignature} label="Compensación">{describeCompensation(c.terms.compensation)}</Term>
              <Term icon={Megaphone} label="Divulgación publicitaria">{c.terms.disclosure}</Term>
              <Term icon={ShieldCheck} label="Derechos que concedes">
                Licencia {c.terms.rights.exclusive ? "exclusiva" : "no exclusiva"} por {c.terms.rights.duration_days} días en {c.terms.rights.territory}. Medios: {c.terms.rights.media.join(", ")}. Usos: {c.terms.rights.approved_uses.join(", ")}. Sigues siendo titular de tu pieza.
              </Term>
              {c.terms.metrics.length > 0 && <Term icon={ScrollText} label="Métricas que se medirán">{c.terms.metrics.join(", ")}</Term>}
            </dl>

            {c.needs_acceptance ? (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
                <p className="flex-1 text-muted-foreground">Al aceptar queda registrado quién aceptó, cuándo y qué versión. Si los términos cambian, tendrás que aceptar de nuevo.</p>
                <Button size="sm" className="h-9 rounded-xl text-xs" disabled={accept.isPending} onClick={() => accept.mutate(c)}>Aceptar la versión {c.version}</Button>
              </div>
            ) : (
              <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-muted/40 p-3">
                <div className="min-w-[14rem] flex-1">
                  <label className="mb-1 block text-[11px] font-semibold text-muted-foreground" htmlFor={`piece-${c.id}`}>Pieza a entregar</label>
                  <Select value={pieces[c.id] ?? ""} onValueChange={(v) => setPieces({ ...pieces, [c.id]: v })}>
                    <SelectTrigger id={`piece-${c.id}`} className="h-9 text-xs"><SelectValue placeholder={videos.length ? "Elige una de tus piezas" : "Aún no tienes piezas publicadas"} /></SelectTrigger>
                    <SelectContent>{videos.map((v) => <SelectItem key={v.id} value={v.id} className="text-xs">{v.title}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button size="sm" className="h-9 rounded-xl text-xs" disabled={!pieces[c.id] || deliver.isPending} onClick={() => deliver.mutate(c)}>Entregar</Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <RightsCard videos={videos} />
    </div>
  );
}

function Term({ icon: Icon, label, children }: { icon: typeof ScrollText; label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="mb-0.5 flex items-center gap-1.5 font-semibold text-muted-foreground"><Icon className="h-3.5 w-3.5" aria-hidden /> {label}</dt>
      <dd className="leading-relaxed">{children}</dd>
    </div>
  );
}

const LICENSE_STATUS: Record<License["status"], string> = { active: "Vigente", expired: "Vencida", revoked: "Revocada" };

/** Titular y licencias de una pieza propia; permite conceder o retirar la licencia de difusión de la plataforma. */
function RightsCard({ videos }: Props) {
  const client = useQueryClient();
  const [videoId, setVideoId] = useState("");
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const query = useQuery({ queryKey: ["creator-rights", videoId], enabled: !!videoId, queryFn: () => api.rights(videoId) });
  const refresh = () => client.invalidateQueries({ queryKey: ["creator-rights"] });
  const grant = useMutation({ mutationFn: () => api.grantPlatformLicense(videoId), onSuccess: () => { toast.success("Licencia de plataforma concedida por un año"); void refresh(); }, onError: fail });
  const revoke = useMutation({ mutationFn: (id: string) => api.revokeRight(id, reasons[id]?.trim() ?? ""), onSuccess: () => { toast.success("Licencia retirada: ya no admite usos nuevos"); void refresh(); }, onError: fail });

  const licenses = query.data?.data.licenses ?? [];
  const hasPlatform = licenses.some((l) => l.license_type === "platform" && l.status === "active");
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Derechos de mis piezas</CardTitle>
        <CardDescription className="text-xs">Siempre eres titular de lo que publicas. Aquí ves qué licencias concediste, hasta cuándo y para qué usos.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        <div className="max-w-md">
          <label className="mb-1 block text-[11px] font-semibold text-muted-foreground" htmlFor="rights-piece">Pieza</label>
          <Select value={videoId} onValueChange={setVideoId}>
            <SelectTrigger id="rights-piece" className="h-9 text-xs"><SelectValue placeholder={videos.length ? "Elige una pieza" : "Aún no tienes piezas"} /></SelectTrigger>
            <SelectContent>{videos.map((v) => <SelectItem key={v.id} value={v.id} className="text-xs">{v.title}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {query.isLoading && <Skeleton className="h-16 w-full" />}
        {query.isError && <p className="text-destructive">{campaignErrorMessage(query.error)}</p>}
        {videoId && query.data && licenses.length === 0 && <p className="text-muted-foreground">Esta pieza no tiene licencias: nadie puede darle usos nuevos.</p>}
        {licenses.map((l) => (
          <div key={l.id} className="rounded-xl border border-border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold">{l.license_type === "campaign" ? `Campaña: ${l.campaign_title ?? "—"}` : "Difusión en la plataforma"}</span>
              <Badge variant="outline" className="text-[10px]">{LICENSE_STATUS[l.status]}</Badge>
            </div>
            <p className="mt-1 text-muted-foreground">
              {l.exclusive ? "Exclusiva" : "No exclusiva"} · {l.territory} · medios: {l.media.join(", ")} · usos: {l.approved_uses.join(", ")} · vence {day(l.expires_at)}
              {l.revoked_reason && <span className="block">Motivo de la revocación: {l.revoked_reason}</span>}
            </p>
            {l.status === "active" && l.license_type === "platform" && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Input aria-label="Motivo para retirar la licencia" value={reasons[l.id] ?? ""} onChange={(e) => setReasons({ ...reasons, [l.id]: e.target.value })} placeholder="Motivo (mínimo 10 caracteres)" className="h-8 min-w-[12rem] flex-1 text-xs" />
                <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs" disabled={revoke.isPending || (reasons[l.id]?.trim().length ?? 0) < 10} onClick={() => revoke.mutate(l.id)}>Retirar licencia</Button>
              </div>
            )}
            {l.status === "active" && l.license_type === "campaign" && <p className="mt-2 text-muted-foreground">Es un compromiso de campaña: para retirarla, abre una disputa desde la pestaña de ingresos.</p>}
          </div>
        ))}
        {videoId && query.data && !hasPlatform && (
          <Button size="sm" variant="outline" className="h-9 rounded-xl text-xs" disabled={grant.isPending} onClick={() => grant.mutate()}>Conceder licencia de difusión por un año</Button>
        )}
      </CardContent>
    </Card>
  );
}
