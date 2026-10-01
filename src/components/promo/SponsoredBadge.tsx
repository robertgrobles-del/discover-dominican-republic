import { Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SponsoredBadgeProps {
  label?: string;
  sponsor?: string;
  className?: string;
}

export function SponsoredBadge({ label, sponsor, className }: SponsoredBadgeProps) {
  const content = label && sponsor
    ? `${label} - ${sponsor}`
    : label || (sponsor ? `Patrocinado - ${sponsor}` : "Patrocinado");
  return (
    <Badge
      variant="sponsored"
      className={cn("gap-1.5", className)}
      aria-label={`Contenido patrocinado: ${sponsor || content}`}
    >
      <Megaphone aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
      <span>{content}</span>
    </Badge>
  );
}
