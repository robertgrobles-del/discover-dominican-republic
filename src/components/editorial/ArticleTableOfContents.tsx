import React, { useState } from "react";
import { ListFilter, ChevronDown, ChevronRight, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TocItem {
  id: string;
  title: string;
  level?: number;
}

interface ArticleTableOfContentsProps {
  items: TocItem[];
  className?: string;
}

export function ArticleTableOfContents({ items, className }: ArticleTableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeId, setActiveId] = useState<string>("");

  if (!items || items.length === 0) return null;

  const scrollTo = (id: string) => {
    setActiveId(id);
    const element = document.getElementById(id);
    if (element) {
      const topOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <nav aria-label="Tabla de contenidos del artículo" className={cn("bg-muted/40 dark:bg-muted/20 border border-border/80 rounded-2xl p-4 my-6", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left font-bold text-sm text-foreground hover:text-primary transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <ListFilter className="h-4 w-4 text-primary" />
          <span>Tabla de Contenidos & Guía Rápida</span>
        </span>
        {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </button>

      {isOpen && (
        <ul className="mt-3 space-y-1.5 pt-3 border-t border-border/60">
          {items.map((item, idx) => (
            <li key={item.id || idx} style={{ paddingLeft: item.level && item.level > 2 ? `${(item.level - 2) * 12}px` : "0px" }}>
              <button
                type="button"
                onClick={() => scrollTo(item.id)}
                className={cn(
                  "text-xs sm:text-sm text-left w-full py-1 px-2 rounded-lg transition-all flex items-center gap-2",
                  activeId === item.id
                    ? "text-primary font-bold bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <Hash className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                <span className="truncate">{item.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
