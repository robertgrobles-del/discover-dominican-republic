import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Share2 } from "lucide-react";

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
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border">
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por sorteo o número..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 rounded-xl text-xs h-9 bg-background"
        />
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="flex items-center gap-1.5 bg-background border border-border rounded-xl px-3 py-1 text-xs">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-transparent text-foreground text-xs focus:outline-hidden font-bold cursor-pointer"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onShare}
          className="rounded-xl text-xs h-9 gap-1 font-semibold"
        >
          <Share2 className="h-3.5 w-3.5 text-primary" /> Compartir
        </Button>
      </div>
    </div>
  );
}
