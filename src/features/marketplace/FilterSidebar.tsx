import { Badge } from "@/components/ui/badge";
import { Filter, Tag } from "lucide-react";

interface FilterSidebarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  title?: string;
}

export function FilterSidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  title = "Categorías",
}: FilterSidebarProps) {
  return (
    <div className="bg-card border rounded-2xl p-4 space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b pb-2">
        <Filter className="w-4 h-4 text-primary" />
        <span>{title}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <Badge
              key={cat}
              variant={isSelected ? "default" : "outline"}
              className="cursor-pointer transition-all hover:scale-105"
              onClick={() => onSelectCategory(cat)}
            >
              <Tag className="w-3 h-3 mr-1" />
              {cat}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
