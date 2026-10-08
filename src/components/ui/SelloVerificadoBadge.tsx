import React from "react";
import { ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SelloVerificadoBadgeProps {
  licenseNumber?: string;
  className?: string;
  variant?: "compact" | "full" | "pill" | "ribbon";
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export function SelloVerificadoBadge({
  licenseNumber,
  className,
  variant = "full",
  size = "md",
  showTooltip = true,
}: SelloVerificadoBadgeProps) {
  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3.5 py-1.5 gap-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  const badgeContent = (
    <div
      className={cn(
        "inline-flex items-center font-bold tracking-wide transition-all shadow-xs group",
        "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950",
        "border border-amber-300/80 shadow-[0_2px_10px_rgba(245,158,11,0.25)]",
        "hover:shadow-[0_4px_16px_rgba(245,158,11,0.4)] hover:scale-[1.02]",
        variant === "pill" ? "rounded-full" : "rounded-xl",
        sizeClasses[size],
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        <ShieldCheck className={cn("text-slate-950 stroke-[2.5]", iconSizes[size])} />
        <Sparkles className="h-2 w-2 text-white absolute -top-1 -right-1 opacity-80 animate-pulse" />
      </div>

      {variant === "compact" ? (
        <span>VERIFICADO</span>
      ) : (
        <span className="font-extrabold uppercase flex items-center gap-1">
          <span>Verificado MITUR</span>
          {licenseNumber && <span className="opacity-75 font-mono text-[9px]">#{licenseNumber}</span>}
        </span>
      )}
    </div>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-block cursor-help">{badgeContent}</div>
        </TooltipTrigger>
        <TooltipContent className="bg-slate-950 text-white border border-amber-500/40 p-3 max-w-xs shadow-2xl rounded-xl text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <CheckCircle2 className="h-4 w-4" />
            <span>Sello Oficial de Confianza Turística</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Este establecimiento ha sido auditado y cuenta con Licencia Oficial activa emitida por el Ministerio de Turismo (MITUR).
          </p>
          {licenseNumber && (
            <div className="pt-1 text-[10px] text-amber-300/90 font-mono border-t border-white/10">
              Licencia No: {licenseNumber} · Registro SIGTUR
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
