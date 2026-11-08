import { Link } from "react-router-dom";
import { ShieldCheck, QrCode, ArrowRight, FileCheck, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ETicketBannerProps {
  className?: string;
  airportName?: string;
}

export function ETicketBanner({ className = "", airportName }: ETicketBannerProps) {
  return (
    <aside 
      aria-label="Aviso obligatorio sobre el E-Ticket de República Dominicana"
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-card to-sky-500/10 border border-emerald-500/30 p-6 sm:p-8 shadow-xs ${className}`}
    >
      {/* Luz radial decorativa */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-emerald-500/15 blur-2xl" 
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
            <QrCode className="w-7 h-7" />
          </div>

          <div>
            {/* Antetítulo limpio sin cápsula de fondo (Regla 1 master-frontend-designer) */}
            <div className="flex items-center gap-2 text-3xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>REQUISITO MIGRATORIO OBLIGATORIO • 100% GRATUITO</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight leading-snug">
              E-Ticket Electrónico de Entrada y Salida
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-2xl leading-relaxed">
              {airportName ? (
                <>Para viajar hacia o desde el <strong>{airportName}</strong>, debes completar el formulario digital único de migración y aduanas antes de abordar tu vuelo para generar tu código QR.</>
              ) : (
                <>Todos los pasajeros que ingresan o salen de República Dominicana deben completar el formulario digital único ante la Dirección General de Migración antes de abordar su vuelo.</>
              )}
            </p>

            {/* 3 micro-garantías */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-2xs font-semibold text-foreground/80 mt-3 pt-2 border-t border-border/50">
              <span className="inline-flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                Válido por familia o individual
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                Sin costo en el portal oficial
              </span>
              <span className="inline-flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-emerald-500" />
                Genera código QR de embarque
              </span>
            </div>
          </div>
        </div>

        {/* Acciones principales rectangulares (Regla 2 y 3 master-frontend-designer) */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto shrink-0">
          <Link to="/e-ticket" className="w-full">
            <Button className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-sm text-xs sm:text-sm">
              <span>Ver Guía Oficial y Pasos</span>
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
              <span>Ir al portal eticket.gob.do</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </Button>
          </a>
        </div>
      </div>
    </aside>
  );
}
