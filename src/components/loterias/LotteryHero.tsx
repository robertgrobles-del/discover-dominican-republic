import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/hooks/useI18n";
import { Sparkles, RefreshCw, Clock, Trophy, ShieldCheck, Zap, BarChart3, CheckCircle2, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface LotteryHeroProps {
  companies: { id: string; name: string; logo: string }[];
  selectedCompany: string;
  onSelectCompany: (id: string) => void;
  onSync?: () => void;
  isSyncing?: boolean;
}

export function LotteryHero({
  companies,
  selectedCompany,
  onSelectCompany,
  onSync,
  isSyncing,
}: LotteryHeroProps) {
  const { t } = useI18n();

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-white/10 text-white p-6 sm:p-10 lg:p-12 shadow-2xl">
      {/* Background ambient lighting effects */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Editorial Presentation (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top Badges & Real-time Indicator */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge className="bg-primary/20 text-primary border border-primary/30 backdrop-blur-md font-bold uppercase tracking-widest text-3xs px-3 py-1">
              🇩🇴 {t("lottery.badge")}
            </Badge>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-3xs font-semibold bg-white/10 backdrop-blur-md border border-white/15 text-white/90">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Resultados Oficiales en Tiempo Real</span>
            </div>
            {onSync && (
              <button
                onClick={onSync}
                disabled={isSyncing}
                className="ml-auto text-xs bg-white/10 hover:bg-white/20 border border-white/15 px-3.5 py-1 rounded-full text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
                <span>{isSyncing ? t("common.loading") : t("lottery.refresh")}</span>
              </button>
            )}
          </div>

          {/* Main Title & Subtitle */}
          <div className="space-y-2">
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight">
              {t("lottery.title")}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 mt-1">
                Resultados en Vivo
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal pt-1">
              {t("lottery.subtitle")}
            </p>
          </div>

          {/* 4 Professional Trust Pillars (inspired by high-end gaming platforms) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="font-bold text-xs text-white block">100% Oficial</span>
              <span className="text-3xs text-slate-400 block leading-tight">Extractos certificados</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Zap className="h-4 w-4" />
              </div>
              <span className="font-bold text-xs text-white block">Al Instante</span>
              <span className="text-3xs text-slate-400 block leading-tight">12:00 PM a 9:00 PM</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <BarChart3 className="h-4 w-4" />
              </div>
              <span className="font-bold text-xs text-white block">Estadísticas</span>
              <span className="text-3xs text-slate-400 block leading-tight">Calientes y fríos</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-bold text-xs text-white block">Comprobador</span>
              <span className="text-3xs text-slate-400 block leading-tight">Verificación rápida</span>
            </div>
          </div>

          {/* Company Filter Pills */}
          <div className="pt-2">
            <span className="text-3xs uppercase tracking-widest font-bold text-slate-400 mb-2.5 block">
              Filtrar por Lotería Oficial
            </span>
            <div className="flex flex-wrap gap-2">
              {companies.map((comp) => {
                const isSelected = selectedCompany === comp.id;
                return (
                  <button
                    key={comp.id}
                    onClick={() => onSelectCompany(comp.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.03] ring-2 ring-primary/40"
                        : "bg-white/10 text-slate-200 hover:bg-white/20 border border-white/10 backdrop-blur-sm hover:scale-[1.01]"
                    }`}
                  >
                    <span className="text-sm select-none">{comp.logo}</span>
                    <span>{comp.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: 3D Live Lottery Cockpit Widget (5 cols) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col items-center justify-center">
          <div className="w-full max-w-sm rounded-3xl border border-white/20 bg-gradient-to-b from-white/15 via-white/10 to-slate-950/60 backdrop-blur-2xl p-6 shadow-2xl relative overflow-hidden space-y-5">
            {/* Glossy top reflection */}
            <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />

            {/* Header of Cockpit Card */}
            <div className="flex items-center justify-between pb-3 border-b border-white/15 relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-bold tracking-wider text-white">LOTERÍAS RD EN VIVO</span>
              </div>
              <Badge className="bg-amber-400 text-slate-950 font-black text-3xs px-2.5 py-0.5 shadow-sm">
                JACKPOT
              </Badge>
            </div>

            {/* Simulated Live Balls Sphere Showcase (inspired by the reference image) */}
            <div className="space-y-3 relative z-10">
              <div className="text-center">
                <span className="text-3xs uppercase tracking-widest text-slate-300 font-bold block">
                  Bote Acumulado Millonario
                </span>
                <span className="font-display text-3xl font-black text-amber-300 drop-shadow-md block">
                  RD$ 40,000,000+
                </span>
              </div>

              {/* Physical 3D Numbered Balls Array */}
              <div className="flex items-center justify-center gap-2.5 py-2">
                {/* Ball 07 - Royal Blue (like reference image) */}
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 text-white flex items-center justify-center font-mono font-black text-lg shadow-xl shadow-blue-500/30 border border-blue-200/80 ring-2 ring-blue-400/25">
                  <span className="absolute top-1.5 left-2.5 w-2.5 h-1 bg-white/50 rounded-full blur-[0.4px] pointer-events-none" />
                  <span>07</span>
                </div>

                {/* Ball 03 - Golden Amber (like reference image) */}
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 text-slate-950 flex items-center justify-center font-mono font-black text-lg shadow-xl shadow-amber-500/35 border border-amber-200/80 ring-2 ring-amber-400/30">
                  <span className="absolute top-1.5 left-2.5 w-2.5 h-1 bg-white/50 rounded-full blur-[0.4px] pointer-events-none" />
                  <span>03</span>
                </div>

                {/* Ball 09 - Deep Purple (like reference image) */}
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 via-purple-600 to-purple-800 text-white flex items-center justify-center font-mono font-black text-lg shadow-xl shadow-purple-500/30 border border-purple-200/70 ring-2 ring-purple-400/25">
                  <span className="absolute top-1.5 left-2.5 w-2.5 h-1 bg-white/50 rounded-full blur-[0.4px] pointer-events-none" />
                  <span>09</span>
                </div>

                {/* Ball 23 - Emerald Green */}
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 via-emerald-600 to-emerald-800 text-white flex items-center justify-center font-mono font-black text-lg shadow-xl shadow-emerald-500/30 border border-emerald-200/70 ring-2 ring-emerald-400/25">
                  <span className="absolute top-1.5 left-2.5 w-2.5 h-1 bg-white/50 rounded-full blur-[0.4px] pointer-events-none" />
                  <span>23</span>
                </div>
              </div>
            </div>

            {/* Bottom Verification Footer */}
            <div className="pt-3 border-t border-white/15 flex items-center justify-between text-2xs text-slate-300 relative z-10">
              <span className="flex items-center gap-1 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Auditado por Lotería Nacional
              </span>
              <Link to="/loterias/como-se-gana" className="text-primary hover:underline font-bold flex items-center gap-0.5">
                Reglas <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

