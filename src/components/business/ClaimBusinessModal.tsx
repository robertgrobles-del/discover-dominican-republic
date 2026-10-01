import React, { useRef, useState } from "react";
import { 
  Building2, ShieldCheck, CheckCircle2, Star, ArrowRight, 
  Sparkles, Mail, Phone, User, Check, AlertCircle, HelpCircle,
  FileText, ExternalLink
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { saveClaimLocally } from "@/lib/leadStorage";
import { businessClaimDraftSchema } from "@/lib/forms";

interface ClaimBusinessModalProps {
  businessName: string;
  businessType: "hotel" | "restaurante" | "bar" | "salud" | "operador" | "comercio" | "otro";
  businessId?: string;
  triggerButton?: React.ReactNode;
}

export function ClaimBusinessModal({
  businessName,
  businessType,
  businessId,
  triggerButton
}: ClaimBusinessModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const submitLock = useRef(false);
  
  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [miturLicense, setMiturLicense] = useState("");
  const [rnc, setRnc] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLock.current) return;
    const parsed = businessClaimDraftSchema.safeParse({
      name: fullName,
      email,
      phone,
      role: role || "Propietario",
      miturLicense,
      rnc,
      notes,
    });
    if (!parsed.success) {
      setFormError("Revisa los campos: nombre (2–100), email válido, teléfono (7–30) y cargo (2–80). Notas: máximo 1,000 caracteres.");
      return;
    }

    submitLock.current = true;
    setLoading(true);
    setFormError("");
    try {
      // Esta pantalla aún no tiene endpoint de reclamos; mantenerlo en memoria
      // evita afirmar que el portal o un administrador recibió/verificó el reclamo.
      saveClaimLocally({
        business_name: businessName,
        business_type: businessType,
        business_id: businessId || null,
        applicant_name: parsed.data.name,
        applicant_email: parsed.data.email,
        applicant_phone: parsed.data.phone,
        role: parsed.data.role,
        mitur_license: parsed.data.miturLicense || null,
        rnc: parsed.data.rnc || null,
        notes: parsed.data.notes || null,
      });
      setStep("success");
      toast.message("Borrador guardado solo durante esta sesión; todavía no se envió para revisión.");
    } catch {
      setFormError("No se pudo guardar el borrador. Conservamos tus datos en este formulario; vuelve a intentarlo.");
    } finally {
      submitLock.current = false;
      setLoading(false);
    }
  };
  const handleReset = () => {
    setStep("form");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 rounded-xl text-xs font-semibold border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/50 transition-all shadow-sm"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
            ¿Eres el propietario? Reclama tu ficha
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 bg-card border-border shadow-2xl">
        {step === "form" ? (
          <>
            <DialogHeader className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[11px] font-bold uppercase tracking-wider">
                  Verificación de Negocio
                </Badge>
                <Badge variant="outline" className="text-[11px] capitalize text-muted-foreground">
                  {businessType}
                </Badge>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-bold font-display text-foreground leading-tight">
                Reclamar ficha de <span className="text-primary">{businessName}</span>
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Toma el control oficial de tu establecimiento en Descubre RD: actualiza fotos, precios, horarios, responde reseñas y recibe solicitudes de reserva directas sin intermediarios.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2" aria-busy={loading}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="claim-name" className="text-xs font-semibold text-foreground">
                    Nombre y Apellidos *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="claim-name" 
                      placeholder="Ej. Juan Pérez"
                      maxLength={100}
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-9 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="claim-role" className="text-xs font-semibold text-foreground">
                    Cargo en el Negocio *
                  </Label>
                  <Input 
                    id="claim-role" 
                    placeholder="Ej. Propietario / Gerente General"
                    maxLength={80}
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="claim-email" className="text-xs font-semibold text-foreground">
                    Correo Corporativo / Personal *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="claim-email" 
                      type="email"
                      maxLength={254}
                      placeholder="gerencia@tunegocio.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="claim-phone" className="text-xs font-semibold text-foreground">
                    Teléfono / WhatsApp *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                    id="claim-phone"
                    placeholder="+1 (809) 000-0000"
                    maxLength={30}
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-9 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="claim-rnc" className="text-xs font-semibold text-foreground">
                      RNC o Registro Mercantil
                    </Label>
                    <span className="text-[10px] text-muted-foreground">Opcional</span>
                  </div>
                  <Input 
                    id="claim-rnc" 
                    placeholder="130-XXXXXX-X"
                    maxLength={30}
                    value={rnc}
                    onChange={(e) => setRnc(e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="claim-mitur" className="text-xs font-semibold text-foreground">
                      No. Licencia MITUR (SIGTUR)
                    </Label>
                    <span className="text-[10px] text-amber-500 font-medium">Dato para verificación</span>
                  </div>
                  <Input 
                    id="claim-mitur" 
                    placeholder="Ej. OP-1234 / AV-5678"
                    maxLength={80}
                    value={miturLicense}
                    onChange={(e) => setMiturLicense(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="claim-notes" className="text-xs font-semibold text-foreground">
                  Notas de comprobación (enlace a web oficial, IG o prueba de titularidad)
                </Label>
                <Textarea 
                  id="claim-notes" 
                  placeholder="Por favor indícanos brevemente cómo podemos validar tu vinculación con la empresa..."
                  rows={2}
                  maxLength={1000}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="rounded-xl text-xs resize-none"
                />
              </div>

              <div className="bg-primary/5 rounded-2xl p-3.5 border border-primary/10 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground font-semibold">Beneficios al verificar tu ficha:</strong>{" "}
                  Recibe contactos directos a tu WhatsApp, edita tu menú/habitaciones y obtén el sello oficial de calidad.
                </div>
              </div>

              {formError && <p role="alert" aria-live="assertive" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{formError}</p>}

              <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)} 
                  className="rounded-xl w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="rounded-xl w-full sm:w-auto font-semibold gap-2"
                >
                  {loading ? "Validando..." : "Guardar borrador"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <div className="py-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
              <Check className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold font-display text-foreground">
                Borrador de solicitud guardado
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                El borrador de <strong className="text-foreground">{businessName}</strong> solo queda en memoria durante esta sesión. Aún no se envió para revisión y la ficha no está verificada.
              </p>
            </div>

            <div className="bg-card border border-border p-4 rounded-2xl text-left space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Siguientes pasos:
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>El portal todavía no puede enviar este borrador al equipo de revisión.</li>
                <li>No se crea acceso al panel de empresa con este borrador.</li>
                <li>La licencia debe verificarse antes de emitir un sello.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button asChild variant="outline" className="rounded-xl w-full sm:w-auto">
                <Link to="/para-empresas">
                  Ver Planes para Empresas
                </Link>
              </Button>
              <Button onClick={handleReset} className="rounded-xl w-full sm:w-auto font-semibold">
                Entendido
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
