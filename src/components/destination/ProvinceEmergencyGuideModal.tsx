import React, { useState } from "react";
import { Phone, ShieldAlert, HeartPulse, Building2, ExternalLink, Printer, Check, Info } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EmergencyContact {
  name: string;
  category: "seguridad" | "salud" | "farmacia" | "asistencia";
  phone: string;
  address?: string;
  notes?: string;
}

interface ProvinceEmergencyGuideModalProps {
  provinceName: string;
  triggerButton?: React.ReactNode;
}

export function ProvinceEmergencyGuideModal({
  provinceName,
  triggerButton,
}: ProvinceEmergencyGuideModalProps) {
  const [open, setOpen] = useState(false);

  const emergencyContacts: EmergencyContact[] = [
    {
      name: "Sistema Nacional de Emergencias 9-1-1",
      category: "seguridad",
      phone: "911",
      notes: "Ambulancia, Policía Nacional, Bomberos y Rescate",
    },
    {
      name: "POLITUR (Policía de Turismo)",
      category: "seguridad",
      phone: "+18092222010",
      notes: "Asistencia directa y protección especializada al turista",
    },
    {
      name: `Hospital Regional / Centro Médico Principal (${provinceName})`,
      category: "salud",
      phone: "+18095550190",
      address: `Zona Central, ${provinceName}`,
      notes: "Emergencias 24 horas y trauma",
    },
    {
      name: "Farmacia 24 Horas de Turno",
      category: "farmacia",
      phone: "+18095550180",
      notes: "Medicamentos de urgencia y primeros auxilios",
    },
    {
      name: "Asistencia Vial MOPC (Ministerio de Obras Públicas)",
      category: "asistencia",
      phone: "+18296881000",
      notes: "Grúa, patrulla de carretera y auxilio mecánico en autopistas",
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" size="sm" className="gap-2 rounded-xl text-xs border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10">
            <HeartPulse className="h-4 w-4" />
            <span>Guía de Emergencias & Salud</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-lg rounded-3xl p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-bold">
              ● Directorio de Asistencia Rápida
            </Badge>
          </div>
          <DialogTitle className="font-display text-xl sm:text-2xl font-bold text-foreground">
            Emergencias & Salud: {provinceName}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Números de auxilio inmediato y centros asistenciales en {provinceName}. Toca cualquier número para llamar directamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-4 max-h-[60vh] overflow-y-auto pr-1">
          {emergencyContacts.map((contact, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between gap-3 hover:bg-muted/70 transition-colors"
            >
              <div className="space-y-0.5 min-w-0">
                <p className="font-bold text-xs sm:text-sm text-foreground truncate">{contact.name}</p>
                {contact.notes && (
                  <p className="text-2xs text-muted-foreground">{contact.notes}</p>
                )}
                {contact.address && (
                  <p className="text-3xs text-muted-foreground/80">{contact.address}</p>
                )}
              </div>

              <a
                href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`}
                className="shrink-0 inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs px-3 py-2 rounded-xl shadow-xs transition-all active:scale-95"
              >
                <Phone className="h-3.5 w-3.5 fill-current" />
                <span>{contact.phone}</span>
              </a>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-border flex items-center justify-between gap-3">
          <p className="text-2xs text-muted-foreground flex items-center gap-1">
            <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
            <span>Servicios de emergencia 24/7 en toda RD</span>
          </p>
          <Button variant="ghost" size="sm" onClick={handlePrint} className="gap-1.5 text-xs text-muted-foreground">
            <Printer className="h-3.5 w-3.5" />
            <span>Imprimir</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
