import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { History, X } from "lucide-react";
import { clearRecentlyViewed, listRecentlyViewed, type RecentItem } from "@/lib/recentlyViewed";

/** Fichas vistas recientemente en este navegador, para volver a ellas sin buscar de nuevo. */
export function RecentlyViewed() {
  const { pathname } = useLocation();
  const [items, setItems] = useState<RecentItem[]>([]);

  // Se relee al cambiar de página; la ficha actual no se ofrece como destino.
  useEffect(() => { setItems(listRecentlyViewed().filter((item) => item.path !== pathname).slice(0, 6)); }, [pathname]);

  if (!items.length) return null;
  return (
    <nav aria-label="Visto recientemente" className="border-t border-border bg-muted/30">
      <div className="container mx-auto flex flex-wrap items-center gap-2 px-4 py-3 text-sm">
        <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
          <History className="h-4 w-4" aria-hidden="true" />
          Visto recientemente
        </span>
        {items.map((item) => (
          <Link key={item.path} to={item.path} className="rounded-full border border-border bg-background px-3 py-1.5 text-foreground transition-colors hover:border-primary hover:text-primary">
            {item.title}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => { clearRecentlyViewed(); setItems([]); }}
          className="ml-auto flex items-center gap-1 rounded-full px-2 py-1.5 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Borrar historial
        </button>
      </div>
    </nav>
  );
}
