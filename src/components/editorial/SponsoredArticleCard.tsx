import React from "react";
import { Sparkles, Building2, ExternalLink, Calendar, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SelloVerificadoBadge } from "@/components/ui/SelloVerificadoBadge";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SponsoredArticleCardProps {
  sponsorName: string;
  sponsorCategory?: string;
  sponsorLogo?: string;
  sponsorDescription?: string;
  sponsorUrl?: string;
  bookingUrl?: string;
  offerText?: string;
  className?: string;
}

export function SponsoredArticleCard({
  sponsorName,
  sponsorCategory = "Alojamiento & Experiencia Aliada",
  sponsorLogo,
  sponsorDescription = "Establecimiento formalmente certificado que ofrece tarifas directas y beneficios de bienvenida exclusivos.",
  sponsorUrl,
  bookingUrl = "/reservas",
  offerText = "Tarifa Directa Especial para lectores de Descubre RD",
  className,
}: SponsoredArticleCardProps) {
  return (
    <div className={cn(
      "my-8 p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-card to-amber-500/5",
      "border-2 border-amber-500/30 shadow-lg relative overflow-hidden",
      className
    )}>
      {/* Top Banner Tag */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <Badge className="bg-amber-500 text-slate-950 font-black text-3xs tracking-wider uppercase px-2.5 py-0.5 rounded-full">
            ● Reportaje Patrocinado
          </Badge>
          <span className="text-xs font-semibold text-muted-foreground">{sponsorCategory}</span>
        </div>
        <SelloVerificadoBadge variant="compact" size="sm" licenseNumber="MITUR-ALIADO" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center gap-3">
            {sponsorLogo && (
              <img src={sponsorLogo} alt={sponsorName} className="h-10 w-10 object-cover rounded-xl border border-border" />
            )}
            <div>
              <h4 className="font-display text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                <span>{sponsorName}</span>
              </h4>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> {offerText}
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {sponsorDescription}
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <Button asChild className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md">
            <Link to={bookingUrl} className="flex items-center justify-center gap-2 text-xs">
              <span>Consultar Disponibilidad</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          {sponsorUrl && (
            <Button asChild variant="outline" size="sm" className="w-full rounded-xl text-xs border-amber-500/30">
              <a href={sponsorUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5">
                <span>Visitar Sitio Oficial</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
