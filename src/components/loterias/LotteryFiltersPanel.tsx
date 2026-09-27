import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

interface LotteryFiltersPanelProps {
  filterDate: string;
  onFilterDateChange: (val: string) => void;
  filterLotteryId: string;
  onFilterLotteryIdChange: (val: string) => void;
  filterDrawId: string;
  onFilterDrawIdChange: (val: string) => void;
  uniqueLotteries: any[];
  uniqueDraws: any[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function LotteryFiltersPanel({
  filterDate,
  onFilterDateChange,
  filterLotteryId,
  onFilterLotteryIdChange,
  filterDrawId,
  onFilterDrawIdChange,
  uniqueLotteries,
  uniqueDraws,
  hasActiveFilters,
  onClearFilters,
}: LotteryFiltersPanelProps) {
  return (
    <section className="container mx-auto px-4 mb-8">
      <div className="bg-card rounded-2xl border border-border p-5 md:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-primary font-bold">
          <Filter className="h-5 w-5" />
          <span>Buscador y Filtros de Sorteos</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Fecha */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="date-filter" className="text-xs font-semibold text-muted-foreground">
              Buscar por Fecha
            </Label>
            <Input
              id="date-filter"
              type="date"
              value={filterDate}
              onChange={(e) => onFilterDateChange(e.target.value)}
              className="w-full bg-background"
            />
          </div>

          {/* Lotería */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lottery-filter" className="text-xs font-semibold text-muted-foreground">
              Marca de Lotería
            </Label>
            <select
              id="lottery-filter"
              title="Filtrar por marca de lotería"
              aria-label="Filtrar por marca de lotería"
              value={filterLotteryId}
              onChange={(e) => onFilterLotteryIdChange(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">Todas las Marcas</option>
              {uniqueLotteries.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.country})
                </option>
              ))}
            </select>
          </div>

          {/* Sorteo */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="draw-filter" className="text-xs font-semibold text-muted-foreground">
              Sorteo Específico
            </Label>
            <select
              id="draw-filter"
              title="Filtrar por sorteo específico"
              aria-label="Filtrar por sorteo específico"
              value={filterDrawId}
              onChange={(e) => onFilterDrawIdChange(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">Todos los Sorteos</option>
              {uniqueDraws
                .filter((d) => filterLotteryId === "all" || d.lottery_id === filterLotteryId)
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex justify-end mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-destructive hover:bg-destructive/10 gap-1.5"
            >
              <X className="h-4 w-4" /> Limpiar Filtros
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
