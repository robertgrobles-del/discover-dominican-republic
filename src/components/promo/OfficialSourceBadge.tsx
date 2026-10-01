import { BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function OfficialSourceBadge({ className }: { className?: string }) {
  return (
    <Badge variant="outline" className={cn("gap-1 border-sky-500/50 text-sky-700 dark:text-sky-300", className)}>
      <BadgeCheck aria-hidden="true" className="h-3.5 w-3.5" />
      Fuente institucional
    </Badge>
  );
}
