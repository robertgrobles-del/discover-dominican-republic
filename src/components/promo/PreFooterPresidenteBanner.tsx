import { ExternalLink } from "lucide-react";
import bannerPresidenteImg from "@/assets/promo/banner-festival-presidente-2026.png";

export function PreFooterPresidenteBanner() {
  return (
    <section className="w-full relative overflow-hidden bg-slate-950 border-y-2 border-emerald-500/40 shadow-2xl">
      <a
        href="https://www.presidente.com.do/"
        target="_blank"
        rel="noopener noreferrer"
        className="block group relative w-full h-[250px] min-h-[250px] max-h-[250px] overflow-hidden cursor-pointer"
        aria-label="Publicidad Oficial Festival Presidente 2026 - Cerveza Presidente"
      >
        {/* Full-width and 250px height Banner Image */}
        <img
          src={bannerPresidenteImg}
          alt="Festival Presidente 2026 - Cerveza Presidente"
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Subtle hover overlay */}
        <div className="absolute inset-0 bg-emerald-950/10 group-hover:bg-transparent transition-colors duration-300" />

        {/* Central Dimension Indicator & Ad Space Status - Red, Larger, Centered in the Banner */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none w-auto max-w-[94%] flex items-center justify-center text-center">
          <div className="bg-red-600/95 hover:bg-red-600 text-white font-mono font-black text-xs sm:text-sm md:text-base px-3.5 sm:px-6 py-1.5 sm:py-2 rounded-xl border-2 border-white shadow-2xl shadow-red-950/90 backdrop-blur-md flex items-center gap-2 tracking-wider uppercase animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping shrink-0" />
            <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] whitespace-nowrap">
              100% ANCHO × 250PX • ESPACIO DISPONIBLE
            </span>
          </div>
        </div>

        {/* Top-Right Official CTA Pill */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
          <span className="inline-flex items-center gap-1.5 bg-slate-950/80 hover:bg-slate-950 text-white text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-xl border border-white/20 backdrop-blur-md shadow-lg group-hover:border-emerald-400 transition-all">
            <span>Visitar presidente.com.do</span>
            <ExternalLink className="h-3.5 w-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>

        {/* Bottom Bar: Legal Disclaimer */}
        <div className="absolute bottom-2 left-4 right-4 z-20 pointer-events-none hidden sm:flex items-center justify-between text-[10px] text-white/75 drop-shadow-sm font-medium">
          <span>Publicidad Oficial • Cervecería Nacional Dominicana</span>
          <span>El consumo de alcohol es perjudicial para la salud • Ley 24-97</span>
        </div>
      </a>
    </section>
  );
}
