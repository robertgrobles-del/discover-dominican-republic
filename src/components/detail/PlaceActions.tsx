import type React from "react";
import type { LucideIcon } from "lucide-react";
import { MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ClaimBusinessModal } from "@/components/business/ClaimBusinessModal";

export interface PlaceAction {
  label: string;
  icon: LucideIcon;
  /** Acción en la página (desplazarse a una sección, abrir un diálogo). */
  onClick?: () => void;
  /** Enlace externo (mapa, sitio web): se abre en otra pestaña. */
  href?: string;
}

interface PlaceActionsProps {
  /** La acción principal de la ficha (reservar, ver menú…): la única con el botón relleno. */
  primary?: PlaceAction;
  secondary?: PlaceAction[];
  /** Enlace de WhatsApp ya compuesto (`https://wa.me/…`). */
  whatsappUrl?: string;
  shareTitle: string;
  claim: { name: string; type: React.ComponentProps<typeof ClaimBusinessModal>["businessType"]; id?: string };
}

/**
 * Acciones de la cabecera de una ficha (hotel, restaurante, bar…), iguales en todas: una acción principal, las
 * demás con el mismo peso visual, compartir al final y, debajo, el enlace discreto para reclamar la ficha.
 */
export function PlaceActions({ primary, secondary = [], whatsappUrl, shareTitle, claim }: PlaceActionsProps) {
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: shareTitle, url });
      else { await navigator.clipboard.writeText(url); toast.success("Enlace copiado"); }
    } catch { /* el usuario cerró el diálogo de compartir */ }
  };
  const external = <span className="sr-only"> (se abre en otra pestaña)</span>;
  return (
    <div className="flex shrink-0 flex-col gap-2 lg:items-end">
      <div className="flex flex-wrap items-center gap-2">
        {primary && (
          <Button size="sm" className="gap-1.5 rounded-xl font-bold shadow-sm" onClick={primary.onClick}>
            <primary.icon className="h-4 w-4" aria-hidden="true" /> {primary.label}
          </Button>
        )}
        {secondary.map((a) => a.href ? (
          <Button key={a.label} asChild variant="outline" size="sm" className="gap-1.5 rounded-xl">
            <a href={a.href} target="_blank" rel="noopener noreferrer"><a.icon className="h-4 w-4" aria-hidden="true" /> {a.label}{external}</a>
          </Button>
        ) : (
          <Button key={a.label} variant="outline" size="sm" className="gap-1.5 rounded-xl" onClick={a.onClick}>
            <a.icon className="h-4 w-4" aria-hidden="true" /> {a.label}
          </Button>
        ))}
        {whatsappUrl && (
          <Button asChild variant="outline" size="sm" className="gap-1.5 rounded-xl border-emerald-600/40 text-emerald-700 hover:bg-emerald-600/10 hover:text-emerald-800 dark:text-emerald-400">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp{external}</a>
          </Button>
        )}
        <Button variant="ghost" size="sm" className="gap-1.5 rounded-xl" onClick={share}>
          <Share2 className="h-4 w-4" aria-hidden="true" /> Compartir
        </Button>
      </div>
      <ClaimBusinessModal
        businessName={claim.name}
        businessType={claim.type}
        businessId={claim.id}
        triggerButton={
          <button type="button" className="w-fit text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline">
            ¿Eres el propietario? Reclama esta ficha
          </button>
        }
      />
    </div>
  );
}

/** Desplaza la página hasta una sección de la ficha (y, si se pide, pone el foco en ella). */
export function scrollToSection(id: string, focus = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: focus ? "center" : "start" });
  if (focus) window.setTimeout(() => (el as HTMLElement).focus?.({ preventScroll: true }), 400);
}
