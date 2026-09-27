import { Button } from "@/components/ui/button";

interface ReservasFilterBarProps {
  categorias: string[];
  categoriaActiva: string;
  onSelectCategoria: (cat: string) => void;
}

export function ReservasFilterBar({
  categorias,
  categoriaActiva,
  onSelectCategoria
}: ReservasFilterBarProps) {
  return (
    <section className="py-4 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categorias.map((cat) => (
            <Button
              key={cat}
              variant={categoriaActiva === cat ? "default" : "outline"}
              size="sm"
              onClick={() => onSelectCategoria(cat)}
              className="whitespace-nowrap"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
