import { Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Marca discreta de un espacio publicitario aún sin anunciante: indica el formato disponible sin tapar la
 * imagen ni competir con el contenido. La posición la pone quien la usa (`className`: `left-3 top-3`…).
 */
export function AdSlotTag({ size, className }: { size: string; className?: string }) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute z-20 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1.5 rounded-full border border-white/25 bg-black/55 px-2.5 py-1 text-3xs font-medium leading-none text-white/90 backdrop-blur-sm",
        className,
      )}
      title="Espacio publicitario disponible"
    >
      <Megaphone className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span className="truncate">Espacio disponible <span className="text-white/60">· {size}</span></span>
    </span>
  );
}
