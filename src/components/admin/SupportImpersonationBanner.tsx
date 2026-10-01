import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Eye, Clock } from "lucide-react";
import { toast } from "sonner";
import { useAccessContext } from "@/hooks/useAccessContext";
import { useAuth } from "@/hooks/useAuth";
import { fetchApi } from "@/lib/fastifyClient";
import { IS_MOCK_DATA } from "@/lib/dataSource";

/**
 * Banner de sesión de soporte (Plan de accesos y paneles por perfil, punto 55).
 *
 * Una sesión de soporte es un modo visible, no un truco: la persona cuya cuenta se está mirando (y
 * cualquiera que pase por delante de la pantalla) tiene que ver que hay un administrador detrás, que es
 * **solo lectura** y cómo terminarla.
 *
 * El estado real viene del servidor: `GET /api/v1/me/context` expone el actor de la impersonación a partir
 * del claim del token (`imp`), y terminar la sesión llama a `POST /api/v1/auth/impersonation/end`. La vía
 * por `sessionStorage` queda solo para el entorno de demostración (datos simulados), donde no hay sesión
 * de soporte real.
 */

interface SupportImpersonationBannerProps {
  onExitSession?: () => void;
}

interface DemoSession {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
}

const DEMO_KEY = "admin_support_impersonation";

export function SupportImpersonationBanner({ onExitSession }: SupportImpersonationBannerProps) {
  const { context } = useAccessContext();
  const { user, session } = useAuth();
  const [demoSession, setDemoSession] = useState<DemoSession | null>(null);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    if (!IS_MOCK_DATA) return;
    try {
      const raw = sessionStorage.getItem(DEMO_KEY);
      if (raw) setDemoSession(JSON.parse(raw) as DemoSession);
    } catch {
      // Datos de demostración ilegibles: no hay banner que mostrar.
    }
  }, []);

  const serverImpersonation = context.user.impersonation;
  const active = serverImpersonation.active || !!demoSession;
  if (!active) return null;

  const targetLabel = user?.email ?? demoSession?.email ?? "cuenta objetivo";
  const actorLabel = serverImpersonation.actor_id ? `admin ${serverImpersonation.actor_id.slice(0, 8)}` : demoSession?.role ?? "administrador";

  const handleEndSession = async () => {
    setEnding(true);
    try {
      if (!IS_MOCK_DATA) {
        await fetchApi("/auth/impersonation/end", {
          method: "POST",
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
        });
      }
      try { sessionStorage.removeItem(DEMO_KEY); } catch { /* almacenamiento no disponible */ }
      setDemoSession(null);
      toast.success("Sesión de soporte finalizada. Vuelves a tu propia cuenta.");
      onExitSession?.();
    } catch {
      toast.error("No se pudo cerrar la sesión de soporte. Inténtalo de nuevo o recarga la página.");
    } finally {
      setEnding(false);
    }
  };

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2 text-xs font-medium border-b border-amber-600/40 shadow-sm sticky top-0 z-50 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Badge className="bg-amber-950 text-amber-100 border-0 text-[10px] gap-1 font-mono uppercase">
          <Eye className="h-3 w-3" /> Modo soporte (solo lectura)
        </Badge>
        <span className="truncate">
          Estás auditando la cuenta de: <strong className="font-bold">{targetLabel}</strong>{" "}
          (<span className="font-mono">por {actorLabel}</span>)
        </span>
        <span className="hidden md:inline-flex items-center gap-1 text-[11px] opacity-80">
          <Clock className="h-3 w-3" /> Caduca sola a los 15 min {demoSession?.expiresAt ? `(${demoSession.expiresAt})` : ""}
        </span>
      </div>
      <Button
        size="sm"
        variant="secondary"
        onClick={handleEndSession}
        disabled={ending}
        className="h-7 text-xs bg-amber-950 text-amber-100 hover:bg-amber-900 rounded-lg font-bold gap-1 shrink-0"
      >
        <LogOut className="h-3 w-3" /> {ending ? "Cerrando…" : "Terminar sesión"}
      </Button>
    </div>
  );
}
