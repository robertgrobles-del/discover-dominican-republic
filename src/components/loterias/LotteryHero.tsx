import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/hooks/useI18n";

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
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-primary/20 text-white p-6 sm:p-12 shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-60" />

      <div className="relative z-10 max-w-3xl space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-amber-500 text-slate-950 font-black uppercase tracking-widest text-[10px] px-3 py-1">
            🇩🇴 {t("lottery.badge")}
          </Badge>
          <Badge variant="outline" className="text-white/80 border-white/20 text-[10px]">
            {t("lottery.detail.schedule")}
          </Badge>
          {onSync && (
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="ml-auto text-xs bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 rounded-full text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span className={isSyncing ? "animate-spin" : ""}>🔄</span>
              <span>{isSyncing ? t("common.loading") : t("lottery.refresh")}</span>
            </button>
          )}
        </div>

        <h1 className="font-display text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
          {t("lottery.title")}
        </h1>

        <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed max-w-2xl">
          {t("lottery.subtitle")}
        </p>

        {/* Company Filter Pills */}
        <div className="pt-2 flex flex-wrap gap-2">
          {companies.map((comp) => (
            <button
              key={comp.id}
              onClick={() => onSelectCompany(comp.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCompany === comp.id
                  ? "bg-amber-500 text-slate-950 shadow-md font-black scale-105"
                  : "bg-white/10 text-slate-300 hover:bg-white/20 border border-white/10"
              }`}
            >
              <span>{comp.logo}</span>
              <span>{comp.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

