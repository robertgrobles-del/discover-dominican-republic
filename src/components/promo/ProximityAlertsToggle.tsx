import { useState } from "react";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { isProximityEnabled, setProximityEnabled, startProximityAlerts, stopProximityAlerts, toastNotify } from "@/lib/proximityAlerts";

/**
 * Interruptor de los avisos por proximidad. Al encenderlo se pide permiso de ubicación y, si el navegador lo
 * admite, de notificaciones (para avisar con la pestaña en segundo plano). Apagado por defecto.
 */
export function ProximityAlertsToggle() {
  const [enabled, setEnabled] = useState(isProximityEnabled);
  const [asking, setAsking] = useState(false);
  const supported = typeof navigator !== "undefined" && !!navigator.geolocation;

  const turnOn = () => {
    setAsking(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        setProximityEnabled(true);
        setEnabled(true);
        setAsking(false);
        startProximityAlerts({ notify: (alert) => void toastNotify(alert) });
        if (typeof Notification !== "undefined" && Notification.permission === "default") void Notification.requestPermission().catch(() => undefined);
        toast.success("Avisos de proximidad activados", { description: "Te avisaremos cuando haya algo a menos de 2 km mientras tengas el sitio abierto." });
      },
      () => {
        setAsking(false);
        toast.error("No pudimos acceder a tu ubicación", { description: "Revisa el permiso de ubicación del navegador para este sitio." });
      },
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 60_000 },
    );
  };
  const turnOff = () => {
    stopProximityAlerts();
    setProximityEnabled(false);
    setEnabled(false);
  };

  if (!supported) return null;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
      <div className="flex-1">
        <Label htmlFor="proximity-alerts" className="text-sm font-semibold">Avísame de ofertas y lugares cerca de mí</Label>
        <p className="text-xs text-muted-foreground">Cuando estés a menos de 2 km de una oferta, un monumento, un restaurante o una playa. Funciona con el sitio abierto; tu ubicación no se guarda.</p>
      </div>
      <Switch id="proximity-alerts" checked={enabled} disabled={asking} onCheckedChange={(on) => (on ? turnOn() : turnOff())} />
    </div>
  );
}
