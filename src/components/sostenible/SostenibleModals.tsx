import { Leaf, CheckCircle, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { EcoBusinessItem } from "@/components/sostenible/EcoVerifiedDirectory";
import { CleanupCampaignItem } from "@/components/sostenible/VolunteerCampaignsSection";

interface SostenibleModalsProps {
  selectedEcoBusiness: EcoBusinessItem | null;
  onCloseEcoBusiness: () => void;
  selectedCampaign: CleanupCampaignItem | null;
  onCloseCampaign: () => void;
  volunteerName: string;
  onVolunteerNameChange: (val: string) => void;
  volunteerEmail: string;
  onVolunteerEmailChange: (val: string) => void;
  volunteerPhone: string;
  onVolunteerPhoneChange: (val: string) => void;
  registrationSuccess: boolean;
  onRegisterVolunteer: (e: React.FormEvent) => void;
}

export function SostenibleModals({
  selectedEcoBusiness,
  onCloseEcoBusiness,
  selectedCampaign,
  onCloseCampaign,
  volunteerName,
  onVolunteerNameChange,
  volunteerEmail,
  onVolunteerEmailChange,
  volunteerPhone,
  onVolunteerPhoneChange,
  registrationSuccess,
  onRegisterVolunteer,
}: SostenibleModalsProps) {
  return (
    <>
      {/* Audit Certificate Modal */}
      <Dialog open={!!selectedEcoBusiness} onOpenChange={() => onCloseEcoBusiness()}>
        <DialogContent className="sm:max-w-[420px] text-center space-y-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-emerald-500 flex items-center justify-center gap-1.5">
              <CheckCircle className="h-6 w-6" /> Certificado Eco-Verified
            </DialogTitle>
            <DialogDescription className="text-xs">
              Registro Oficial de Auditoría de Sustentabilidad Ambiental
            </DialogDescription>
          </DialogHeader>

          {selectedEcoBusiness && (
            <div className="bg-muted/30 border p-6 rounded-2xl text-left space-y-4 font-sans relative overflow-hidden">
              <div className="absolute right-2 top-2 opacity-5">
                <Leaf className="h-32 w-32 text-emerald-500" />
              </div>

              <div className="pb-3 border-b border-border space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  Establecimiento
                </span>
                <h4 className="text-lg font-extrabold text-foreground">
                  {selectedEcoBusiness.name}
                </h4>
                <p className="text-xs text-muted-foreground">{selectedEcoBusiness.location}, RD</p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                  Resultados de Auditoría:
                </span>
                {selectedEcoBusiness.criteria.map((c, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="text-foreground">{c.name}</span>
                    <span
                      className={
                        c.checked ? "text-emerald-500 font-bold" : "text-muted-foreground font-mono"
                      }
                    >
                      {c.checked ? "CUMPLIDO" : "NO APLICA"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/25 p-3 rounded-lg text-[10px] text-center text-emerald-600 font-bold uppercase tracking-wider">
                Sello Verde Nº: EV-{selectedEcoBusiness.id.toUpperCase()}-2026
              </div>
            </div>
          )}

          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            onClick={onCloseEcoBusiness}
          >
            Cerrar Certificado
          </Button>
        </DialogContent>
      </Dialog>

      {/* Volunteer Registration Modal */}
      <Dialog open={!!selectedCampaign} onOpenChange={() => onCloseCampaign()}>
        <DialogContent className="sm:max-w-[420px] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              Registro de Voluntariado
            </DialogTitle>
            <DialogDescription className="text-xs">
              Únete a {selectedCampaign?.title}.
            </DialogDescription>
          </DialogHeader>

          {registrationSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">¡Registro Exitoso!</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                  Te has inscrito como voluntario. Recibiste una insignia virtual{" "}
                  <strong>{selectedCampaign?.badge}</strong> y has acumulado{" "}
                  <strong>+{selectedCampaign?.xp} XP</strong> en tu pasaporte digital.
                </p>
              </div>
              <Button className="w-full" onClick={onCloseCampaign}>
                Listo
              </Button>
            </div>
          ) : (
            <form onSubmit={onRegisterVolunteer} className="space-y-4 pt-2">
              <div className="bg-muted/40 p-4 rounded-xl text-xs space-y-1">
                <p className="font-bold">{selectedCampaign?.title}</p>
                <p className="text-muted-foreground">
                  {selectedCampaign?.date} • {selectedCampaign?.time}
                </p>
                <p className="text-muted-foreground">{selectedCampaign?.location}</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Nombre Completo
                </label>
                <Input
                  type="text"
                  placeholder="Juan Pérez"
                  value={volunteerName}
                  onChange={(e) => onVolunteerNameChange(e.target.value)}
                  required
                  className="text-xs bg-background"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Correo Electrónico
                </label>
                <Input
                  type="email"
                  placeholder="juan@ejemplo.com"
                  value={volunteerEmail}
                  onChange={(e) => onVolunteerEmailChange(e.target.value)}
                  required
                  className="text-xs bg-background"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Teléfono móvil
                </label>
                <Input
                  type="tel"
                  placeholder="+1 (809) 555-0123"
                  value={volunteerPhone}
                  onChange={(e) => onVolunteerPhoneChange(e.target.value)}
                  className="text-xs bg-background"
                  title="Teléfono del voluntario"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" size="sm" onClick={onCloseCampaign}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Confirmar Registro
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
