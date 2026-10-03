import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { BUSINESS_TYPES, VERIFICATION_STATUS_LABEL, operatorToolsApi as api, toolsErrorMessage, type BusinessType } from "@/lib/operatorToolsApi";

const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("es-DO", { dateStyle: "medium" }) : "—");
const fail = (error: unknown) => toast.error(toolsErrorMessage(error));
const TYPE_LABEL: Record<BusinessType, string> = { operador: "Tour operador", agencia: "Agencia de viajes", guia: "Guía turístico" };

/** Solicitud del Sello Verificado y lectura y aceptación del contrato de términos comerciales que se emite al aprobarla. */
export function VerificationCard() {
  const client = useQueryClient();
  const [type, setType] = useState<BusinessType>("operador");
  const [rnc, setRnc] = useState("");
  const [license, setLicense] = useState("");
  const [read, setRead] = useState(false);
  const refresh = () => { void client.invalidateQueries({ queryKey: ["op", "verification"] }); void client.invalidateQueries({ queryKey: ["op", "contracts"] }); };

  const org = useQuery({ queryKey: ["op", "backend-org"], enabled: HAS_BACKEND_SESSION, queryFn: api.myOrg, retry: false });
  const applications = useQuery({ queryKey: ["op", "verification"], enabled: HAS_BACKEND_SESSION, queryFn: api.applications });
  const contracts = useQuery({ queryKey: ["op", "contracts"], enabled: HAS_BACKEND_SESSION, queryFn: api.contracts });
  const apply = useMutation({
    mutationFn: () => api.apply({ business_id: org.data!.data.org.id, business_type: type, business_name: org.data!.data.org.business_name, ...(rnc ? { rnc } : {}), ...(license.trim() ? { mitur_license: license.trim() } : {}) }),
    onSuccess: () => { toast.success("Solicitud enviada. Te avisaremos cuando se revise."); refresh(); }, onError: fail,
  });
  const accept = useMutation({ mutationFn: (c: { id: string; body_hash: string }) => api.acceptContract(c.id, c.body_hash), onSuccess: () => { toast.success("Contrato aceptado. Queda registrado con fecha y versión."); setRead(false); refresh(); }, onError: fail });

  if (!HAS_BACKEND_SESSION) return null;
  const apps = applications.data?.data ?? [];
  const pending = apps.some((a) => a.status === "pending");
  const toSign = (contracts.data?.data ?? []).find((c) => !c.accepted_at);
  const rncOk = rnc === "" || /^\d{9}(\d{2})?$/.test(rnc);
  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><BadgeCheck className="h-4 w-4 text-primary" aria-hidden /> Sello Verificado</CardTitle>
        <CardDescription className="text-xs">Solicita la verificación de tu negocio. Al aprobarse se emite un contrato de términos comerciales que debes leer y aceptar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {applications.isLoading && <Skeleton className="h-12 w-full" />}
        {apps.map((a) => (
          <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3">
            <span>{a.business_name} · solicitada el {day(a.created_at)}{a.badge_expires_at && <> · vigente hasta el {day(a.badge_expires_at)}</>}{a.status === "rejected" && a.audit_notes && <span className="block text-xs text-muted-foreground">Motivo: {a.audit_notes}</span>}</span>
            <Badge variant="outline" className="text-[10px]">{VERIFICATION_STATUS_LABEL[a.status]}{a.contract_id && (a.contract_accepted_at ? " · contrato aceptado" : " · contrato por aceptar")}</Badge>
          </div>
        ))}

        {toSign && (
          <div className="space-y-3 rounded-xl border border-primary/40 p-3">
            <p className="font-semibold">Contrato de términos comerciales (versión {toSign.terms_version})</p>
            <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg bg-muted p-3 font-sans text-xs leading-relaxed" tabIndex={0}>{toSign.body}</pre>
            <label className="flex items-start gap-2 text-xs"><Checkbox checked={read} onCheckedChange={(v) => setRead(v === true)} className="mt-0.5" /> Leí el contrato completo y lo acepto en nombre de {toSign.business_name}.</label>
            <Button size="sm" className="h-9 text-xs" disabled={!read || accept.isPending} onClick={() => accept.mutate(toSign)}>Aceptar contrato</Button>
          </div>
        )}

        {!pending && !toSign && (
          org.isError ? <p className="text-muted-foreground">Para solicitar el sello necesitas una organización registrada en la plataforma.</p> : (
            <div className="grid gap-3 rounded-xl border border-border bg-muted/40 p-3 md:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="ver-type" className="text-xs">Tipo de negocio</Label>
                <Select value={type} onValueChange={(v) => setType(v as BusinessType)}>
                  <SelectTrigger id="ver-type" className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{BUSINESS_TYPES.map((t) => <SelectItem key={t} value={t} className="text-xs">{TYPE_LABEL[t]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="ver-rnc" className="text-xs">RNC o cédula (sin guiones)</Label>
                <Input id="ver-rnc" inputMode="numeric" value={rnc} onChange={(e) => setRnc(e.target.value.replace(/\D/g, "").slice(0, 11))} aria-invalid={!rncOk} className="h-9 text-xs" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ver-license" className="text-xs">Licencia MITUR (opcional)</Label>
                <Input id="ver-license" value={license} maxLength={60} onChange={(e) => setLicense(e.target.value)} className="h-9 text-xs" />
              </div>
              <div className="md:col-span-3"><Button size="sm" className="h-9 text-xs" disabled={!org.data || !rncOk || apply.isPending} onClick={() => apply.mutate()}>Solicitar Sello Verificado</Button></div>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
