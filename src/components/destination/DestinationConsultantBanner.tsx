import { Link } from "react-router-dom";
import { MessageSquare, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DestinationConsultantBannerProps {
  destinoNombre: string;
}

export function DestinationConsultantBanner({ destinoNombre }: DestinationConsultantBannerProps) {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#004e92] via-[#003366] to-[#001f3f] text-white p-8 md:p-10 shadow-xl border border-blue-900/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-sky-200 text-xs font-bold uppercase tracking-wider border border-white/15">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-400" /> Garantía Oficial de Calidad
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
              ¿Tienes dudas o buscas un plan a medida en {destinoNombre}?
            </h3>
            <p className="text-white/80 text-sm md:text-base leading-relaxed">
              Conecta con los consultores certificados del Ministerio de Turismo para recomendaciones personalizadas sin comisiones.
            </p>
          </div>

          <div className="shrink-0 flex items-center">
            <Button
              size="lg"
              className="bg-[#ff5a5f] hover:bg-[#ff444a] text-white font-bold px-7 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-base flex items-center gap-2 group"
              asChild
            >
              <Link to="/itinerario-ia">
                <MessageSquare className="h-5 w-5" />
                Hablar con un Experto Local
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
