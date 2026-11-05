import React, { useState } from "react";
import { Download, Printer, ShieldAlert, Phone, MapPin, Stethoscope, AlertTriangle, FileText, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { centrosSalud } from "@/data/healthCenters";

interface EmergencyPdfExportProps {
  currentRegion?: string;
  triggerButton?: React.ReactNode;
}

const REGIONS = [
  { id: "all", name: "Nacional (Todas las regiones)" },
  { id: "Santo Domingo", name: "Santo Domingo & Distrito Nacional" },
  { id: "Punta Cana", name: "Punta Cana & La Altagracia" },
  { id: "Puerto Plata", name: "Puerto Plata & Costa Norte" },
  { id: "Samaná", name: "Samaná & Las Terrenas" },
  { id: "La Romana", name: "La Romana & Bayahíbe" },
  { id: "Santiago", name: "Santiago & Cibao Central" },
  { id: "Barahona / Pedernales", name: "Sur Profundo (Barahona / Pedernales)" },
  { id: "Jarabacoa / Constanza", name: "Cordillera Central (Jarabacoa / Constanza)" },
];

const EMERGENCY_HOTLINES = [
  { name: "Sistema Nacional de Emergencias", number: "911", desc: "Ambulancia, Policía Nacional y Bomberos 24/7", available: "Nacional" },
  { name: "POLITUR (Seguridad Turística)", number: "809-222-2026", desc: "Asistencia y protección especializada al turista", available: "Nacional" },
  { name: "Centro de Operaciones de Emergencias (COE)", number: "809-472-0909", desc: "Alertas climáticas y contingencias", available: "Nacional" },
  { name: "Cruz Roja Dominicana", number: "809-334-4545", desc: "Banco de sangre y traslados de emergencia", available: "Nacional" },
  { name: "Defensa Civil Dominicana", number: "809-472-8614", desc: "Rescate y evacuación", available: "Nacional" },
];

export function EmergencyPdfExport({ currentRegion = "all", triggerButton }: EmergencyPdfExportProps) {
  const [open, setOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(currentRegion);

  const regionCentros = centrosSalud.filter(
    (c) => selectedRegion === "all" || c.region.toLowerCase().includes(selectedRegion.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
    toast.success("Ventana de impresión/guardado en PDF iniciada");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" size="sm" className="gap-2 rounded-xl text-xs">
            <Printer className="h-3.5 w-3.5 text-primary" />
            <span>Guía Imprimible / PDF Offline</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2 border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <Badge className="bg-destructive/10 text-destructive border-destructive/20 font-bold">
              <ShieldAlert className="h-3.5 w-3.5 mr-1" /> Directorio de Emergencias 24h
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">Descubre RD Oficial</span>
          </div>
          <DialogTitle className="font-display text-xl font-bold text-foreground">
            Ficha de Salud y Emergencias para Viajeros
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Descarga o imprime esta ficha para tener acceso inmediato a hospitales, ambulancias y teléfonos de auxilio incluso sin cobertura de internet móvil.
          </DialogDescription>
        </DialogHeader>

        {/* Region selection filter */}
        <div className="my-4 flex items-center justify-between gap-3 p-3 bg-muted/40 rounded-2xl border border-border">
          <span className="text-xs font-bold text-foreground">Filtrar por Destino:</span>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="h-8 text-xs rounded-xl w-[240px] bg-card">
              <SelectValue placeholder="Seleccionar región" />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map((r) => (
                <SelectItem key={r.id} value={r.id} className="text-xs">
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Print preview content */}
        <div id="printable-emergency-sheet" className="space-y-6 text-xs p-4 bg-card rounded-2xl border border-border">
          {/* Top Numbers */}
          <div>
            <h4 className="font-bold text-sm text-primary mb-2 flex items-center gap-1.5">
              <Phone className="h-4 w-4" /> Líneas Directas de Auxilio Inmediato
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EMERGENCY_HOTLINES.map((h, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-muted/30 border border-border/70 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-foreground">{h.name}</p>
                    <p className="text-3xs text-muted-foreground">{h.desc}</p>
                  </div>
                  <a
                    href={`tel:${h.number.replace(/[^0-9]/g, "")}`}
                    className="font-mono font-black text-xs text-primary bg-primary/10 px-2 py-1 rounded-lg"
                  >
                    {h.number}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Hospitals & Centers */}
          <div>
            <h4 className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4" /> Centros Médicos y Clínicas 24h ({regionCentros.length})
            </h4>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {regionCentros.slice(0, 8).map((c, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-muted/20 border border-border/60 flex justify-between items-start gap-2">
                  <div>
                    <p className="font-bold text-foreground">{c.name}</p>
                    <p className="text-3xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-primary shrink-0" /> {c.address} ({c.region})
                    </p>
                  </div>
                  <span className="font-mono font-bold text-2xs text-primary shrink-0">{c.phone}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Practical travel advice */}
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-2xs text-amber-900 dark:text-amber-200">
            <p className="font-bold flex items-center gap-1 mb-1">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Seguro de Viaje Internacional:
            </p>
            <p>
              Conserva siempre a mano el número de póliza de tu seguro médico de viaje. La mayoría de los hospitales privados en zonas turísticas aceptan cobertura internacional directa o reembolso.
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)} className="rounded-xl text-xs">
            Cerrar
          </Button>
          <Button size="sm" onClick={handlePrint} className="gap-2 rounded-xl text-xs font-bold shadow-md">
            <Printer className="h-4 w-4" />
            <span>Imprimir / Guardar en PDF</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
