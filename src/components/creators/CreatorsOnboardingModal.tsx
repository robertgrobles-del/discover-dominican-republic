import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, UserCheck, Video, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface CreatorsOnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatorsOnboardingModal({
  open,
  onOpenChange,
}: CreatorsOnboardingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    fullName: "",
    socialHandle: "@",
    primaryPlatform: "Instagram",
    portfolioUrl: "",
    bio: "",
  });

  const handleNext = () => {
    if (step === 1) {
      if (!formData.fullName.trim() || !formData.socialHandle.trim()) {
        toast.error("Por favor completa tu nombre y red social principal");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("El registro de creadores aún no está conectado. No se envió tu postulación ni se guardaron estos datos.");
    onOpenChange(false);
    setStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
              Paso {step} de 3
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 mt-1">
            <Sparkles className="h-5 w-5 text-primary" /> Onboarding & Registro de Creador
          </DialogTitle>
          <DialogDescription className="text-xs">
            Conoce el proceso previsto. El registro en línea todavía no está disponible.
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Nombre Completo o Nombre de Creador</Label>
              <Input
                placeholder="Ej. María Fernández (Viajera Eco)"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Usuario Principal (@handle)</Label>
                <Input
                  placeholder="@viajera_eco"
                  value={formData.socialHandle}
                  onChange={(e) => setFormData({ ...formData, socialHandle: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Plataforma Principal</Label>
                <select
                  value={formData.primaryPlatform}
                  onChange={(e) => setFormData({ ...formData, primaryPlatform: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Blog">Blog / Web</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Enlace a Portafolio o Canal</Label>
              <Input
                placeholder="https://instagram.com/tu_perfil"
                value={formData.portfolioUrl}
                onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
              <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" /> Derechos de uso del contenido
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                La aprobación legal de los términos de licencia está pendiente. Compartir o enviar contenido no concede permiso de uso comercial; cualquier campaña debe contar con un acuerdo por separado.
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-sm text-foreground">Registro en línea pendiente</h4>
              <p className="text-xs text-muted-foreground">
                El servicio debe conectarse antes de recibir postulaciones. Al continuar no enviaremos ni almacenaremos los datos del formulario.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between items-center sm:justify-between">
          {step > 1 ? (
            <Button variant="outline" size="sm" onClick={() => setStep((s) => (s - 1) as any)}>
              Atrás
            </Button>
          ) : <div />}
          {step < 3 ? (
            <Button size="sm" onClick={handleNext}>
              Siguiente
            </Button>
          ) : (
            <Button size="sm" onClick={handleSubmit}>
              Entendido
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
