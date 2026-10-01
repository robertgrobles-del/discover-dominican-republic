import { useNavigate } from "react-router-dom";
import { Check, ChevronDown, Building2, Compass, Megaphone, PenTool, Shield, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useAccessContext } from "@/hooks/useAccessContext";
import { useActiveSpace } from "@/hooks/useActiveSpace";
import { trackPanelAdoption, type PanelKey } from "@/lib/adoption";

/**
 * Selector e indicador de espacio activo (Plan de accesos y paneles por perfil, puntos 43 y 78).
 *
 * Cuando una cuenta tiene varias capacidades (empresa y creador, por ejemplo) permite cambiar de espacio
 * sin mezclar contextos; el espacio y la organización activa se conservan durante la sesión. Es solo
 * interfaz: los permisos siguen viviendo en el servidor.
 */

const ICONS: Record<string, typeof Compass> = {
  viajero: Compass,
  empresa: Building2,
  creador: Sparkles,
  embajador: Megaphone,
  editorial: PenTool,
  moderacion: ShieldCheck,
  admin: Shield,
};

function adoptionPanelKey(spaceKey: string): PanelKey {
  const known: PanelKey[] = ["viajero", "empresa", "creador", "embajador", "editorial", "moderacion", "admin"];
  return (known as string[]).includes(spaceKey) ? (spaceKey as PanelKey) : "viajero";
}

export function SpaceSwitcher({ className = "" }: { className?: string }) {
  const { user } = useAuth();
  const { spaces, demo } = useAccessContext();
  const { active, setActiveSpace, organizations, activeOrg, setActiveOrg, requiresChoice, contextLabel } = useActiveSpace(spaces);
  const navigate = useNavigate();

  if (!user || spaces.length === 0 || !active) return null;

  const go = (key: string) => {
    const space = spaces.find((s) => s.key === key);
    if (!space) return;
    setActiveSpace(key);
    trackPanelAdoption(adoptionPanelKey(key), "panel_open", { space: key });
    navigate(space.route);
  };

  const Icon = ICONS[active.key] ?? Compass;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 gap-1.5 rounded-xl px-2 text-xs font-semibold ${className}`}
          aria-label={`Espacio activo: ${contextLabel}. Cambiar de espacio`}
        >
          <Icon className="h-4 w-4" aria-hidden />
          <span className="hidden max-w-[10rem] truncate sm:inline">{contextLabel || active.label}</span>
          <ChevronDown className="h-3 w-3 opacity-70" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-card text-card-foreground border border-border shadow-2xl">
        <DropdownMenuLabel className="flex items-center justify-between gap-2 text-xs">
          <span>Espacio activo</span>
          {demo && <Badge variant="outline" className="text-[10px] font-mono">demo</Badge>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {spaces.map((space) => {
          const SpaceIcon = ICONS[space.key] ?? Compass;
          const isActive = space.key === active.key;
          return (
            <DropdownMenuItem
              key={space.key}
              onSelect={() => go(space.key)}
              className="flex items-start gap-2 text-xs"
            >
              <SpaceIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="flex-1">
                <span className="block font-semibold">{space.label}</span>
                <span className="block text-[11px] text-muted-foreground">{space.description}</span>
              </span>
              {isActive && <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />}
            </DropdownMenuItem>
          );
        })}

        {organizations.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs">
              Organización {requiresChoice && <span className="font-normal text-muted-foreground">(elige el contexto)</span>}
            </DropdownMenuLabel>
            {organizations.map((org) => (
              <DropdownMenuItem key={org.id} onSelect={() => setActiveOrg(org.id)} className="flex items-center gap-2 text-xs">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                <span className="flex-1 truncate">{org.name ?? "Organización"}</span>
                <span className="font-mono text-[10px] uppercase text-muted-foreground">{org.role}</span>
                {activeOrg?.id === org.id && <Check className="h-3.5 w-3.5 text-primary" aria-hidden />}
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
