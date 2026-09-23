import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ text, onClear }: { text: string; onClear: () => void }) {
  return (
    <div className="text-center py-12">
      <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground">{text}</p>
      <Button variant="outline" className="mt-4" onClick={onClear}>Limpiar filtros</Button>
    </div>
  );
}
