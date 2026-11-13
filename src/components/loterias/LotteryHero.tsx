import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/hooks/useI18n";
import { Sparkles, RefreshCw, Clock, Trophy } from "lucide-react";

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
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-white/10 text-white p-6 sm:p-10 lg:p-12 shadow-2xl">
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-4xl space-y-5">
        {/* Top Badges & Real-time Indicator */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge className="bg-primary/20 text-primary border border-primary/30 backdrop-blur-md font-bold uppercase tracking-widest text-3xs px-3 py-1">
            🇩🇴 {t("lottery.badge")}
          </Badge>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-3xs font-semibold bg-white/10 backdrop-blur-md border border-white/15 text-white/90">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Resultados Oficiales en Directo</span>
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
        <div className="space-y-2.5">
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.08] tracking-tight">
            {t("lottery.title")}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
            {t("lottery.subtitle")}
          </p>
        </div>

        {/* Quick Micro-Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 max-w-xl">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-2xs text-slate-400 uppercase tracking-wider font-semibold block">Empresas</span>
            <span className="font-display text-xl font-bold text-white">8 Loterías</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-2xs text-slate-400 uppercase tracking-wider font-semibold block">Horarios</span>
            <span className="font-display text-xl font-bold text-primary">12:00 PM - 9:00 PM</span>
          </div>
          <div className="hidden sm:block p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-2xs text-slate-400 uppercase tracking-wider font-semibold block">Validación</span>
            <span className="font-display text-xl font-bold text-emerald-400">100% Verificado</span>
          </div>
        </div>

        {/* Company Filter Pills */}
        <div className="pt-3">
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
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.03] ring-2 ring-primary/40"
                      : "bg-white/10 text-slate-200 hover:bg-white/20 border border-white/10 backdrop-blur-sm hover:scale-[1.01]"
                  }`}
                >
                  <span className="text-sm">{comp.logo}</span>
                  <span>{comp.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

