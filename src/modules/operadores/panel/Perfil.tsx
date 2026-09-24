import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { isValidEmail } from "@/lib/security";
import { opKeys, updateOrg, useOpMutation } from "../api";
import { DESTINATION_OPTIONS, VERIFICATION_LABEL, slugify } from "../constants";
import { useOrg } from "./OrgContext";
import { useAuth } from "@/hooks/useAuth";

const TYPES = [["tour_operator", "Tour operador"], ["guide", "Guía local"], ["agency", "Agencia de viajes"], ["hotel", "Alojamiento"], ["transport", "Transporte"]];
const PAYOUTS = ["Transferencia bancaria", "PayPal", "Efectivo en oficina"];

export default function Perfil() {
  const { org, refetchOrg } = useOrg();
  const { user } = useAuth();
  const [f, setF] = useState({
    business_name: org.business_name, description: org.description || "", phone: org.phone || "", email: org.email || "",
    business_type: org.business_type || "tour_operator", province: org.province || "", cover_url: org.cover_url || "",
    payout_method: org.payout_method || "", website_enabled: org.website_enabled, slug: org.slug,
  });
  const save = useOpMutation((patch: any) => updateOrg(org.id, patch), [opKeys.org(user?.id)]);

  const submit = () => {
    if (f.business_name.trim().length < 3) return toast.error("El nombre necesita al menos 3 caracteres.");
    if (f.email && !isValidEmail(f.email)) return toast.error("Correo inválido.");
    const slug = slugify(f.slug) || org.slug;
    save.mutate(
      { ...f, slug },
      { onSuccess: () => { toast.success("Perfil guardado"); refetchOrg(); }, onError: (e: any) => toast.error(e.message) },
    );
  };
  const requestVerification = () =>
    save.mutate({ verification: "pending" }, { onSuccess: () => { toast.success("Solicitud enviada. Te avisaremos por correo."); refetchOrg(); } });

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-display text-3xl font-bold">Org/Perfil</h1>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2">Verificación <Badge variant={org.verification === "verified" ? "default" : "secondary"}>{VERIFICATION_LABEL[org.verification]}</Badge></CardTitle>
          <CardDescription>Una organización verificada puede publicar servicios, aparecer en el directorio y cobrar.</CardDescription></CardHeader>
        <CardContent>
          {org.verification === "unverified" || org.verification === "rejected" ? (
            <Button onClick={requestVerification} disabled={save.isPending}>Solicitar verificación</Button>
          ) : org.verification === "pending" ? <p className="text-sm text-muted-foreground">Tu solicitud está en revisión (24–48 horas).</p> : <p className="text-sm text-emerald-600">Tu organización está verificada.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Datos de la organización</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2"><Label htmlFor="o-name">Nombre</Label><Input id="o-name" maxLength={80} value={f.business_name} onChange={(e) => setF({ ...f, business_name: e.target.value })} /></div>
          <div className="space-y-1 sm:col-span-2"><Label htmlFor="o-desc">Descripción</Label><Textarea id="o-desc" rows={4} maxLength={600} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
          <div className="space-y-1"><Label>Tipo de negocio</Label>
            <Select value={f.business_type} onValueChange={(v) => setF({ ...f, business_type: v })}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TYPES.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1"><Label>Provincia / zona</Label>
            <Select value={f.province} onValueChange={(v) => setF({ ...f, province: v })}><SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
              <SelectContent>{DESTINATION_OPTIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1"><Label htmlFor="o-mail">Correo de contacto</Label><Input id="o-mail" type="email" maxLength={254} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <div className="space-y-1"><Label htmlFor="o-phone">Teléfono / WhatsApp</Label><Input id="o-phone" maxLength={25} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
          <div className="space-y-1 sm:col-span-2"><Label htmlFor="o-cover">Imagen de portada (URL)</Label><Input id="o-cover" value={f.cover_url} onChange={(e) => setF({ ...f, cover_url: e.target.value })} placeholder="https://…" /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Sitio de reservas y cobros</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3"><Switch id="o-web" checked={f.website_enabled} onCheckedChange={(v) => setF({ ...f, website_enabled: v })} /><Label htmlFor="o-web">Sitio de reservas activo</Label></div>
          <div className="space-y-1"><Label htmlFor="o-slug">Dirección de tu sitio</Label>
            <div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">/operador/</span><Input id="o-slug" maxLength={60} value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} /></div></div>
          <div className="space-y-1"><Label>Método de cobro</Label>
            <Select value={f.payout_method} onValueChange={(v) => setF({ ...f, payout_method: v })}><SelectTrigger><SelectValue placeholder="Selecciona un método" /></SelectTrigger>
              <SelectContent>{PAYOUTS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
        </CardContent>
      </Card>

      <Button onClick={submit} disabled={save.isPending}>Guardar cambios</Button>
    </div>
  );
}
