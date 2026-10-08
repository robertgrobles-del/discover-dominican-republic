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
import { ShieldCheck, Award, ExternalLink, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

const TYPES = [
  ["tour_operator", "Tour operador"],
  ["guide", "Guía local"],
  ["agency", "Agencia de viajes"],
  ["hotel", "Alojamiento / Hotel"],
  ["transport", "Transporte turístico"],
  ["restaurant", "Gastronomía / Restaurante"],
];

const PAYOUTS = ["Transferencia bancaria local (RD)", "PayPal", "Efectivo en mostrador"];

export default function Perfil() {
  const { org, refetchOrg } = useOrg();
  const { user } = useAuth();
  const [f, setF] = useState({
    business_name: org.business_name,
    description: org.description || "",
    phone: org.phone || "",
    email: org.email || "",
    rnc: (org as any).rnc || "",
    mitur_license: (org as any).mitur_license || "",
    business_type: org.business_type || "tour_operator",
    province: org.province || "",
    cover_url: org.cover_url || "",
    payout_method: org.payout_method || "",
    website_enabled: org.website_enabled,
    slug: org.slug,
  });

  const save = useOpMutation((patch: any) => updateOrg(org.id, patch), [opKeys.org(user?.id)]);

  const submit = () => {
    if (f.business_name.trim().length < 3) return toast.error("El nombre necesita al menos 3 caracteres.");
    if (f.email && !isValidEmail(f.email)) return toast.error("Correo inválido.");
    const slug = slugify(f.slug) || org.slug;
    save.mutate(
      { ...f, slug },
      {
        onSuccess: () => {
          toast.success("Perfil y datos institucionales guardados.");
          refetchOrg();
        },
        onError: (e: any) => toast.error(e.message),
      }
    );
  };

  const requestVerification = () =>
    save.mutate(
      { verification: "pending" },
      {
        onSuccess: () => {
          toast.success("Solicitud de verificación MITUR enviada. Nuestro equipo revisará los documentos.");
          refetchOrg();
        },
      }
    );

  const isVerified = org.verification === "verified";

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Perfil Institucional y Verificación</h1>
          <p className="text-sm text-muted-foreground">
            Configura la ficha pública de tu empresa, tu registro tributario y el sello oficial de calidad turística.
          </p>
        </div>

        {f.slug && (
          <Button asChild variant="outline" className="gap-2">
            <Link to={`/operador/${f.slug}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" /> Ver perfil público
            </Link>
          </Button>
        )}
      </div>

      {/* Sello de Verificación Oficial MITUR */}
      <Card className={isVerified ? "border-amber-500/40 bg-amber-500/5 shadow-sm" : "border-border"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {isVerified ? (
                <span className="flex items-center gap-2 text-amber-600 font-bold">
                  <Award className="h-6 w-6 text-amber-500" /> Sello Oficial MITUR / MITUR Verified
                </span>
              ) : (
                <span className="flex items-center gap-2 text-foreground">
                  <ShieldCheck className="h-5 w-5 text-primary" /> Estado de Verificación Oficial
                </span>
              )}
            </CardTitle>
            <Badge variant={isVerified ? "default" : "secondary"} className={isVerified ? "bg-amber-600 hover:bg-amber-700" : ""}>
              {VERIFICATION_LABEL[org.verification]}
            </Badge>
          </div>
          <CardDescription>
            Las empresas verificadas exhiben el sello dorado oficial, acceden a posicionamiento prioritario en el directorio y pueden procesar pagos en línea.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="o-rnc">RNC Corporativo (Registro Nacional del Contribuyente)</Label>
              <Input
                id="o-rnc"
                maxLength={11}
                value={f.rnc}
                onChange={(e) => setF({ ...f, rnc: e.target.value })}
                placeholder="Ej. 131-12345-6"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="o-lic">Licencia / Registro MITUR</Label>
              <Input
                id="o-lic"
                maxLength={40}
                value={f.mitur_license}
                onChange={(e) => setF({ ...f, mitur_license: e.target.value })}
                placeholder="Ej. MITUR-AV-2024-089"
              />
            </div>
          </div>

          <div className="pt-2">
            {org.verification === "unverified" || org.verification === "rejected" ? (
              <Button onClick={requestVerification} disabled={save.isPending} className="gap-2 bg-primary">
                <FileText className="h-4 w-4" /> Solicitar Verificación Oficial
              </Button>
            ) : org.verification === "pending" ? (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                <AlertCircle className="h-4 w-4" /> Tu documentación está en revisión por el equipo ministerial (24 a 48 horas).
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4" /> Organización formalmente verificada y respaldada por el Ministerio de Turismo.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Datos Públicos del Negocio */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Datos Públicos y Presentación</CardTitle>
          <CardDescription>Esta información se mostrará a los viajeros en tu ficha pública del portal.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="o-name">Nombre comercial de la empresa</Label>
            <Input
              id="o-name"
              maxLength={80}
              value={f.business_name}
              onChange={(e) => setF({ ...f, business_name: e.target.value })}
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="o-desc">Descripción y propuesta de valor</Label>
            <Textarea
              id="o-desc"
              rows={4}
              maxLength={600}
              value={f.description}
              onChange={(e) => setF({ ...f, description: e.target.value })}
              placeholder="Describe los servicios, experiencia y garantías de tu empresa turística..."
            />
          </div>
          <div className="space-y-1">
            <Label>Categoría o tipo de negocio</Label>
            <Select value={f.business_type} onValueChange={(v) => setF({ ...f, business_type: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map(([v, l]) => (
                  <SelectItem key={v} value={v}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Provincia / Región principal</Label>
            <Select value={f.province} onValueChange={(v) => setF({ ...f, province: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la provincia" />
              </SelectTrigger>
              <SelectContent>
                {DESTINATION_OPTIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="o-mail">Correo público de atención</Label>
            <Input
              id="o-mail"
              type="email"
              maxLength={254}
              value={f.email}
              onChange={(e) => setF({ ...f, email: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="o-phone">Teléfono / WhatsApp oficial</Label>
            <Input
              id="o-phone"
              maxLength={25}
              value={f.phone}
              onChange={(e) => setF({ ...f, phone: e.target.value })}
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="o-cover">Imagen de portada o banner (URL)</Label>
            <Input
              id="o-cover"
              value={f.cover_url}
              onChange={(e) => setF({ ...f, cover_url: e.target.value })}
              placeholder="https://images.unsplash.com/..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Sitio de Reservas y Cobros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuración de Portal y Cobros</CardTitle>
          <CardDescription>Habilita tu landing page propia dentro de Descubre RD y define el método para recibir tus fondos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
            <Switch
              id="o-web"
              checked={f.website_enabled}
              onCheckedChange={(v) => setF({ ...f, website_enabled: v })}
            />
            <div>
              <Label htmlFor="o-web" className="font-semibold cursor-pointer">Página web de reservas activa</Label>
              <p className="text-xs text-muted-foreground">Permite a los turistas ver tu catálogo directo y realizar reservas instantáneas.</p>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="o-slug">Dirección URL personalizada</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-muted-foreground bg-muted px-2.5 py-2 rounded-md border">
                descubrerd.com/operador/
              </span>
              <Input
                id="o-slug"
                maxLength={60}
                value={f.slug}
                onChange={(e) => setF({ ...f, slug: e.target.value })}
                className="font-mono"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Método preferido de liquidación (Payout)</Label>
            <Select value={f.payout_method} onValueChange={(v) => setF({ ...f, payout_method: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un método de cobro" />
              </SelectTrigger>
              <SelectContent>
                {PAYOUTS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-2">
        <Button onClick={submit} disabled={save.isPending} size="lg" className="font-semibold px-8">
          Guardar todos los cambios
        </Button>
      </div>
    </div>
  );
}
