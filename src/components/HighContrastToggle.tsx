import { useEffect, useState } from "react";
import { Contrast } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "accessibility-high-contrast";

export function HighContrastToggle() {
  const [enabled, setEnabled] = useState(() => {
    try {
      return typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.dataset.contrast = enabled ? "high" : "standard";
    try {
      window.localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch {
      // Keep the preference for this page session when storage is unavailable.
    }
  }, [enabled]);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="a11y-touch-target text-inherit hover:bg-white/20"
      aria-label={enabled ? "Desactivar alto contraste" : "Activar alto contraste"}
      aria-pressed={enabled}
      title={enabled ? "Desactivar alto contraste" : "Activar alto contraste"}
      onClick={() => setEnabled((current) => !current)}
    >
      <Contrast aria-hidden="true" className="h-5 w-5" />
    </Button>
  );
}
