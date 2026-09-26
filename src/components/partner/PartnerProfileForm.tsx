import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";

interface PartnerProfileFormProps {
  businessName: string;
  setBusinessName: (val: string) => void;
  businessType: string;
  setBusinessType: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function PartnerProfileForm({
  businessName,
  setBusinessName,
  businessType,
  setBusinessType,
  phone,
  setPhone,
  email,
  setEmail,
  description,
  setDescription,
  loading,
  onSubmit
}: PartnerProfileFormProps) {
  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Información de la Ficha Comercial</CardTitle>
        <CardDescription>Edita los datos que se muestran públicamente a los viajeros en Descubre RD.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="biz-name">Nombre Comercial</Label>
              <Input
                id="biz-name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="biz-type">Tipo de Negocio B2B</Label>
              <select
                id="biz-type"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                title="Tipo de Establecimiento B2B"
              >
                <option value="hotel">Hotel / Hospedaje</option>
                <option value="restaurante">Restaurante / Fritura</option>
                <option value="guia">Guía Turístico Certificado</option>
                <option value="agencia">Agencia de Viajes B2B</option>
                <option value="operador">Tour Operador / Excursiones</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="biz-phone">Teléfono de Reservas</Label>
              <Input
                id="biz-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="biz-email">Email Corporativo de Contacto</Label>
              <Input
                id="biz-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="biz-desc">Descripción General del Establecimiento</Label>
            <Textarea
              id="biz-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>

          <Button type="submit" className="gap-2" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar Ficha Comercial
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
