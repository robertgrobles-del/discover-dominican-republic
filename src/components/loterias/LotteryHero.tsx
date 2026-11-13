import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/hooks/useI18n";
import { RefreshCw, ShieldCheck, Zap, BarChart3, Sparkles, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface LotteryHeroProps {
  companies: { id: string; name: string; logo: string }[];
  selectedCompany: string;
  onSelectCompany: (id: string) => void;
  onSync?: () => void;
  isSyncing?: boolean;
}

// Bolos decorativos sin número: la portada nunca muestra números de ejemplo (regla de AGENTS.md).
const BALL = {
  blue: "from-sky-300 via-blue-500 to-blue-700",
  gold: "from-yellow-200 via-amber-400 to-amber-600",
  red: "from-rose-300 via-red-500 to-red-700",
  green: "from-emerald-200 via-emerald-500 to-emerald-700",
  purple: "from-violet-300 via-purple-500 to-purple-700",
} as const;

function Ball({ color, className }: { color: keyof typeof BALL; className: string }) {
  return (
    <span aria-hidden className={`absolute rounded-full bg-gradient-to-br ${BALL[color]} shadow-lg ring-1 ring-white/60 ${className}`}>
      <span className="absolute left-[22%] top-[14%] h-[22%] w-[34%] rounded-full bg-white/70 blur-[1px]" />
      <span className="absolute inset-[28%] rounded-full bg-white/90" />
    </span>
  );
}

const PILLARS = [
  { icon: ShieldCheck, title: "Validados", text: "Fecha, cantidad y rango comprobados", tone: "bg-emerald-100 text-emerald-700" },
  { icon: Zap, title: "Al instante", text: "Minutos después del sorteo", tone: "bg-sky-100 text-sky-700" },
  { icon: BarChart3, title: "Estadísticas", text: "Calientes y fríos", tone: "bg-amber-100 text-amber-700" },
  { icon: Sparkles, title: "Comprobador", text: "Verifica tu jugada", tone: "bg-violet-100 text-violet-700" },
];

export function LotteryHero({ companies, selectedCompany, onSelectCompany, onSync, isSyncing }: LotteryHeroProps) {
  const { t } = useI18n();

  return (
    <div className="relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-white via-sky-50 to-blue-100 p-6 text-slate-900 shadow-xl sm:p-10 lg:p-12">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-sky-200/50 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />

      <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="space-y-6 lg:col-span-7">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge className="border border-blue-200 bg-blue-600 px-3 py-1 text-3xs font-bold uppercase tracking-widest text-white hover:bg-blue-600">
              🇩🇴 {t("lottery.badge")}
            </Badge>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-3xs font-semibold text-slate-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Resultados del día, actualizados tras cada sorteo
            </span>
            {onSync && (
              <button type="button" onClick={onSync} disabled={isSyncing}
                className="ml-auto flex items-center gap-1.5 rounded-full border border-sky-200 bg-white px-3.5 py-1 text-xs text-slate-700 transition hover:bg-sky-50 disabled:opacity-50">
                <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? t("common.loading") : t("lottery.refresh")}
              </button>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-4xl font-black leading-[1.05] tracking-tight text-blue-700 sm:text-5xl lg:text-6xl">
              {t("lottery.title")}
              <span className="mt-1 block text-slate-800">Resultados de hoy</span>
            </h1>
            <p className="max-w-xl pt-1 text-sm leading-relaxed text-slate-600 sm:text-base">{t("lottery.subtitle")}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PILLARS.map(({ icon: Icon, title, text, tone }) => (
              <div key={title} className="space-y-1 rounded-2xl border border-white bg-white/80 p-3 shadow-sm">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ${tone}`}><Icon className="h-4 w-4" /></span>
                <span className="block text-xs font-bold text-slate-900">{title}</span>
                <span className="block text-3xs leading-tight text-slate-500">{text}</span>
              </div>
            ))}
          </div>

          <div>
            <span className="mb-2.5 block text-3xs font-bold uppercase tracking-widest text-slate-500">Filtrar por lotería</span>
            <div className="flex flex-wrap gap-2">
              {companies.map((comp) => {
                const isSelected = selectedCompany === comp.id;
                return (
                  <button key={comp.id} type="button" onClick={() => onSelectCompany(comp.id)} aria-pressed={isSelected}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                      isSelected ? "bg-blue-600 text-white shadow-md shadow-blue-600/25" : "border border-sky-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-sky-50"
                    }`}>
                    <span className="select-none text-sm">{comp.logo}</span>
                    {comp.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bombo con bolos (decorativo) */}
        <div className="hidden flex-col items-center lg:col-span-5 lg:flex">
          <div className="relative h-80 w-80">
            <div aria-hidden className="absolute inset-x-8 top-4 h-64 rounded-full border-4 border-white/90 bg-gradient-to-br from-white/70 via-sky-100/40 to-blue-200/50 shadow-[inset_0_-20px_40px_rgba(59,130,246,0.25)]">
              <Ball color="gold" className="left-16 top-28 h-14 w-14" />
              <Ball color="blue" className="left-28 top-36 h-14 w-14" />
              <Ball color="red" className="left-40 top-24 h-12 w-12" />
              <Ball color="green" className="left-10 top-44 h-12 w-12" />
              <Ball color="purple" className="left-36 top-44 h-12 w-12" />
              <span className="absolute left-10 top-6 h-16 w-24 rotate-[-25deg] rounded-full bg-white/60 blur-md" />
            </div>
            <div aria-hidden className="absolute bottom-6 left-1/2 h-6 w-40 -translate-x-1/2 rounded-full bg-blue-600 shadow-lg" />
            <div aria-hidden className="absolute bottom-10 left-1/2 h-8 w-6 -translate-x-1/2 bg-blue-500" />
            <Ball color="blue" className="-left-2 bottom-0 h-20 w-20" />
            <Ball color="gold" className="left-24 -bottom-4 h-16 w-16" />
            <Ball color="purple" className="-right-2 bottom-2 h-20 w-20" />
          </div>
          <div className="mt-6 flex items-center gap-4 text-xs">
            <Link to="/loterias/como-se-gana" className="flex items-center gap-0.5 font-bold text-blue-700 hover:underline">Cómo se gana <ChevronRight className="h-3 w-3" /></Link>
            <Link to="/loterias/juego-responsable" className="flex items-center gap-0.5 font-bold text-amber-700 hover:underline">Juego responsable <ChevronRight className="h-3 w-3" /></Link>
          </div>
          <p className="mt-2 text-2xs text-slate-500">No vendemos boletos ni recibimos apuestas.</p>
        </div>
      </div>
    </div>
  );
}
