import { ArrowRight, Camera, Compass, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ParticipationInviteProps {
  placeName?: string;
}

export function ParticipationInvite({ placeName }: ParticipationInviteProps) {
  const subject = placeName ? ` en ${placeName}` : "";

  return (
    <section aria-labelledby="participation-invite-title" className="relative isolate overflow-hidden rounded-3xl border border-emerald-900/15 bg-[#0b3c36] px-6 py-8 text-white md:px-10 md:py-10">
      <div aria-hidden="true" className="absolute -right-14 -top-24 -z-10 h-64 w-64 rounded-full border border-emerald-100/20" />
      <div aria-hidden="true" className="absolute -right-2 -top-12 -z-10 h-40 w-40 rounded-full border border-emerald-100/15" />
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-amber-200">Pasaporte y comunidad</p>
          <h2 id="participation-invite-title" className="mt-3 font-display text-2xl font-bold leading-tight md:text-3xl">
            Haz que tu visita{subject} cuente.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50/80 md:text-base">
            Ver esta ficha no otorga puntos. Una visita registrada o una contribución aprobada puede dar progreso según las reglas vigentes y los límites del Pasaporte.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="bg-amber-300 text-emerald-950 hover:bg-amber-200">
            <Link to="/pasaporte-digital"><Compass className="mr-2 h-4 w-4" />Pasaporte Digital</Link>
          </Button>
          <Button asChild variant="outline" className="border-white/35 bg-transparent text-white hover:bg-white/10 hover:text-white">
            <Link to="/gana-con-descubre-rd"><Share2 className="mr-2 h-4 w-4" />Otras formas de participar <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
      <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/15 pt-4 text-xs text-emerald-50/70">
        <span className="inline-flex items-center gap-2"><Compass className="h-3.5 w-3.5 text-amber-200" />Visitas verificadas</span>
        <span className="inline-flex items-center gap-2"><Camera className="h-3.5 w-3.5 text-amber-200" />Aportes revisados</span>
        <Link to="/reglas-gamificacion" className="font-medium text-white underline decoration-white/40 underline-offset-4 hover:decoration-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200">Lee las reglas</Link>
      </div>
    </section>
  );
}
