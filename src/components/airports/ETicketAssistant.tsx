import { ShieldCheck, FileText, CheckCircle2, ExternalLink, AlertTriangle, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ETicketAssistant() {
  return (
    <div className="w-full bg-gradient-to-br from-emerald-500/10 via-card to-card border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-lg my-8">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="h3 text-xl sm:text-2xl font-black text-foreground">
                E-Ticket República Dominicana
              </h2>
              <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 text-xs">
                Obligatorio para Entrada y Salida
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-2xl leading-relaxed">
              El Ministerio de Turismo (MITUR) y la Dirección General de Migración requieren que todo pasajero complete el formulario digital único antes de abordar su vuelo. ¡Es 100% gratuito!
            </p>

            {/* 3 Pasos Rápidos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Llena 72h antes del viaje</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground/80">
                <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>1 formulario por familia</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground/80">
                <Smartphone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Guarda el código QR</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Directo a portal oficial */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
          <a
            href="https://eticket.migracion.gob.do"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-md shadow-emerald-600/20 text-xs sm:text-sm">
              Completar E-Ticket Oficial
              <ExternalLink className="w-4 h-4" />
            </Button>
          </a>
          <span className="text-2xs text-muted-foreground text-center">
            Sitio oficial de Migración y Aduanas de RD
          </span>
        </div>
      </div>
    </div>
  );
}
