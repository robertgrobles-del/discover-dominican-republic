import React from "react";
import {
  Calendar, Clock, MapPin, Ticket, ExternalLink,
  ShieldCheck, Share2, Building2, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CountdownData {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface EventSidebarCardProps {
  priceRange?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  venue?: string;
  organizer?: string;
  ticketUrl?: string | null;
  countdown?: CountdownData;
  onOpenFreeTicketModal?: () => void;
  onOpenRsvpModal?: () => void;
}

export const EventSidebarCard: React.FC<EventSidebarCardProps> = ({
  priceRange = "Consultar Boletería",
  startDate,
  endDate,
  startTime,
  endTime,
  venue,
  organizer,
  ticketUrl,
  countdown,
  onOpenFreeTicketModal,
  onOpenRsvpModal,
}) => {
  const isPastOrToday =
    countdown &&
    countdown.days === 0 &&
    countdown.hours === 0 &&
    countdown.minutes === 0 &&
    countdown.seconds === 0;

  return (
    <div className="rounded-3xl bg-card border border-border p-6 shadow-xl space-y-6 sticky top-24">
      {/* Price & Status */}
      <div className="border-b border-border/60 pb-4">
        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
          Acceso & Boletas
        </span>
        <h3 className="font-display font-black text-2xl text-foreground mt-0.5">
          {priceRange}
        </h3>
        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5" /> Evento Oficial Dominicano
        </p>
      </div>

      {/* Countdown Clock */}
      {countdown && !isPastOrToday && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-amber-500/5 to-transparent border border-primary/20 space-y-2 text-center">
          <span className="text-[10px] uppercase font-bold text-primary flex items-center justify-center gap-1">
            <Clock className="h-3 w-3" /> Faltan para el inicio
          </span>
          <div className="grid grid-cols-4 gap-1.5 font-mono text-xs">
            <div className="bg-background/80 p-2 rounded-xl border border-border">
              <span className="font-black text-base text-foreground block">{countdown.days}</span>
              <span className="text-[9px] text-muted-foreground uppercase">Días</span>
            </div>
            <div className="bg-background/80 p-2 rounded-xl border border-border">
              <span className="font-black text-base text-foreground block">{countdown.hours}</span>
              <span className="text-[9px] text-muted-foreground uppercase">Hrs</span>
            </div>
            <div className="bg-background/80 p-2 rounded-xl border border-border">
              <span className="font-black text-base text-foreground block">{countdown.minutes}</span>
              <span className="text-[9px] text-muted-foreground uppercase">Min</span>
            </div>
            <div className="bg-background/80 p-2 rounded-xl border border-border">
              <span className="font-black text-base text-foreground block text-amber-500">{countdown.seconds}</span>
              <span className="text-[9px] text-muted-foreground uppercase">Seg</span>
            </div>
          </div>
        </div>
      )}

      {/* Key Dates & Times */}
      <div className="space-y-3 text-xs">
        {startDate && (
          <div className="flex items-start gap-2.5">
            <Calendar className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-foreground block">Fecha</span>
              <span className="text-muted-foreground">
                {startDate} {endDate && endDate !== startDate ? `al ${endDate}` : ""}
              </span>
            </div>
          </div>
        )}

        {startTime && (
          <div className="flex items-start gap-2.5">
            <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-foreground block">Horario</span>
              <span className="text-muted-foreground">
                {startTime} {endTime ? `- ${endTime}` : ""}
              </span>
            </div>
          </div>
        )}

        {venue && (
          <div className="flex items-start gap-2.5">
            <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-foreground block">Lugar / Recinto</span>
              <span className="text-muted-foreground">{venue}</span>
            </div>
          </div>
        )}

        {organizer && (
          <div className="flex items-start gap-2.5">
            <Building2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-foreground block">Organizador</span>
              <span className="text-muted-foreground">{organizer}</span>
            </div>
          </div>
        )}
      </div>

      {/* CTA Action Buttons */}
      <div className="space-y-2.5 pt-2">
        {onOpenFreeTicketModal && (
          <Button
            onClick={onOpenFreeTicketModal}
            className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs h-11 shadow-md gap-1.5"
          >
            <Sparkles className="h-4 w-4" /> Solicitar Entrada Gratis / Sorteo
          </Button>
        )}

        {ticketUrl ? (
          <a
            href={ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full"
          >
            <Button
              className="w-full rounded-2xl font-bold text-xs h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md gap-1.5"
            >
              <Ticket className="h-4 w-4" /> Comprar Boleta Oficial <ExternalLink className="h-3.5 w-3.5 ml-1 opacity-70" />
            </Button>
          </a>
        ) : onOpenRsvpModal ? (
          <Button
            onClick={onOpenRsvpModal}
            className="w-full rounded-2xl font-bold text-xs h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md gap-1.5"
          >
            <Ticket className="h-4 w-4" /> Confirmar Asistencia (RSVP)
          </Button>
        ) : null}
      </div>
    </div>
  );
};
