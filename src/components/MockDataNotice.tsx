import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IS_MOCK_DATA } from "@/lib/dataSource";

/**
 * Aviso de modo simulado (Plan de accesos y paneles por perfil, punto 57).
 *
 * Con `VITE_DATA_SOURCE=mock` el portal funciona sin backend: los datos son un snapshot y las capacidades
 * son de demostración. Ese hecho tiene que ser visible, no una sorpresa: cualquier pantalla que muestre
 * cifras o permisos sin servidor detrás lo dice aquí arriba. En un build con `VITE_DATA_SOURCE=api` el
 * componente no renderiza nada, así que no hay forma de que un aviso de maqueta llegue a producción
 * "por si acaso": si el modo es api, el aviso simplemente no existe.
 */

const DISMISS_KEY = "dr_mock_notice_dismissed";

export function MockDataNotice({ className = "" }: { className?: string }) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (!IS_MOCK_DATA) return;
    try { setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1"); } catch { setDismissed(false); }
  }, []);

  if (!IS_MOCK_DATA || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem(DISMISS_KEY, "1"); } catch { /* almacenamiento no disponible */ }
  };

  return (
    <div
      role="status"
      className={`flex items-start gap-3 border-b border-amber-500/40 bg-amber-50 px-4 py-2 text-xs text-amber-950 dark:bg-amber-950/40 dark:text-amber-100 ${className}`}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p className="flex-1">
        <strong className="font-semibold">Modo datos simulados.</strong> Esta pantalla corre sin backend:
        los datos son de demostración, no persisten y las capacidades que ves solo sirven para recorrer el
        entorno de desarrollo. No autorizan ninguna operación real.
      </p>
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6 shrink-0 text-amber-950 hover:bg-amber-500/20 dark:text-amber-100"
        onClick={dismiss}
        aria-label="Ocultar el aviso de datos simulados"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
