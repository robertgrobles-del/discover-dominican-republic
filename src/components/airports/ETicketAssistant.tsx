import { Link } from "react-router-dom";
import { ShieldCheck, FileText, CheckCircle2, ArrowRight, Smartphone, ExternalLink, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ETicketAssistant() {
  return (
    <aside 
      aria-label="Asistente de E-Ticket de República Dominicana"
      className="w-full bg-gradient-to-br from-emerald-500/10 via-card to-card border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-xs my-8"
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shrink-0">
            <QrCode className="w-8 h-8" />
          </div>
          <div>
            {/* Antetítulo limpio sin cápsula de fondo (Regla 1 master-frontend-designer) */}
            <div className="flex items-center gap-2 text-3xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>OBLIGATORIO PARA ENTRADA Y SALIDA • 100% GRATUITO</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-foreground">
              E-Ticket de Migración y Aduanas
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-2xl leading-relaxed">
              El Ministerio de Turismo (MITUR) y la Dirección General de Migración requieren que todo pasajero complete el formulario digital único antes de abordar su vuelo hacia o desde República Dominicana.
            </p>

            {/* 3 Pasos Rápidos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-border/60">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground/85">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Llena 72h antes del viaje</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground/85">
                <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>1 formulario por familia</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground/85">
                <Smartphone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Genera código QR</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTAs Rectangulares hacia la página de e-ticket (Regla 2 y 3) */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto shrink-0">
          <Link to="/e-ticket" className="w-full">
            <Button className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-xs text-xs sm:text-sm">
              <span>Ver Guía y Llenar E-Ticket</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <a
            href="https://eticket.gob.do/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center"
          >
            <Button variant="outline" className="w-full h-9 rounded-xl text-2xs font-semibold gap-1.5">
              <span>Portal oficial eticket.gob.do</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </Button>
          </a>
        </div>
      </div>
    </aside>
  );
}
