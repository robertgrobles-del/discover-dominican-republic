import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { travelerTypes } from "@/components/reviews/ReviewCard";

export interface CategoryFilterItem {
  label: string;
  count: number;
}

interface ReviewsSidebarProps {
  travelerTypes: typeof travelerTypes;
  selectedTravelerTypes: string[];
  onToggleTravelerType: (id: string) => void;
  categoryFilters: CategoryFilterItem[];
  selectedCategories: string[];
  onToggleCategory: (label: string) => void;
  onClearFilters: () => void;
}

export function ReviewsSidebar({
  travelerTypes,
  selectedTravelerTypes,
  onToggleTravelerType,
  categoryFilters,
  selectedCategories,
  onToggleCategory,
  onClearFilters,
}: ReviewsSidebarProps) {
  return (
    <aside className="w-full lg:w-72 flex-shrink-0 space-y-8">
      <div className="bg-card p-6 rounded-2xl border border-border sticky top-24">
        <h3 className="font-bold text-lg mb-4 text-foreground">Filtrar por</h3>

        <div className="mb-6">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Tipo de Viajero
          </h4>
          <div className="flex flex-wrap gap-2">
            {travelerTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => onToggleTravelerType(type.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedTravelerTypes.includes(type.id)
                    ? "bg-primary/10 text-primary ring-1 ring-primary/50"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <type.icon className="h-4 w-4" />
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Categoría
          </h4>
          <div className="space-y-2">
            {categoryFilters.map((cat) => (
              <label
                key={cat.label}
                className="flex items-center gap-3 cursor-pointer p-2 hover:bg-muted/50 rounded-lg transition-colors"
              >
                <Checkbox
                  checked={selectedCategories.includes(cat.label)}
                  onCheckedChange={() => onToggleCategory(cat.label)}
                />
                <span className="text-sm font-medium text-foreground flex-1">{cat.label}</span>
                <span className="text-xs text-muted-foreground">{cat.count}</span>
              </label>
            ))}
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          Limpiar filtros
        </Button>
      </div>

      <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-card rounded-full shadow-sm text-primary">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">100% Verificado</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Solo permitimos reseñas de usuarios registrados y verificados.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
