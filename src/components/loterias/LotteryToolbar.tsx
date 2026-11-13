import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Share2, X, Sparkles } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

interface LotteryToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedDate: string;
  onDateChange: (val: string) => void;
  onShare: () => void;
}

export function LotteryToolbar({
  searchQuery,
  onSearchChange,
  selectedDate,
  onDateChange,
  onShare,
}: LotteryToolbarProps) {
  const { t } = useI18n();

  const handleSetToday = () => {
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    onDateChange(todayStr);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card/80 backdrop-blur-xl p-3.5 rounded-2xl border border-border/80 shadow-sm">
      {/* Search Input */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("lottery.searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9.5 pr-8 rounded-xl text-xs h-10 bg-background/80 border-border/80 focus:border-primary"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Date controls and Share */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
        <div className="flex items-center gap-1.5 bg-background/80 border border-border/80 rounded-xl px-3 py-1 text-xs shadow-2xs">
          <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
          <input
            type="date"
            aria-label="Seleccionar fecha de sorteo"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-transparent text-foreground text-xs focus:outline-hidden font-bold cursor-pointer"
          />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleSetToday}
          className="text-xs h-10 px-2.5 text-primary hover:text-primary hover:bg-primary/10 rounded-xl font-bold"
        >
          Hoy
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onShare}
          className="rounded-xl text-xs h-10 gap-1.5 font-semibold border-border/80 hover:bg-primary/10 hover:border-primary/40 hover:text-primary"
        >
          <Share2 className="h-3.5 w-3.5 text-primary" />
          <span className="hidden xs:inline">{t("common.share")}</span>
        </Button>
      </div>
    </div>
  );
}

