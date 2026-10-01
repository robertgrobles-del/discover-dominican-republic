import { Moon, Sun, Sunrise } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type ThemeMode = "dark" | "light" | "sol";

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as ThemeMode | null;
    const initialMode: ThemeMode = stored === "light" || stored === "sol" ? stored : "dark";
    applyMode(initialMode);
  }, []);

  const applyMode = (newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem("theme", newMode);

    const root = document.documentElement;
    const body = document.body;

    if (newMode === "sol") {
      root.classList.add("light");
      body.classList.add("sol-de-playa");
    } else if (newMode === "light") {
      root.classList.add("light");
      body.classList.remove("sol-de-playa");
    } else {
      root.classList.remove("light");
      body.classList.remove("sol-de-playa");
    }
  };

  const cycleTheme = () => {
    if (mode === "dark") {
      applyMode("light");
      toast("Modo Claro Activado");
    } else if (mode === "light") {
      applyMode("sol");
      toast("☀️ Modo Sol de Playa Activado: Máximo contraste bajo sol directo");
    } else {
      applyMode("dark");
      toast("Modo Noche Activado");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="a11y-touch-target text-inherit hover:bg-white/20 transition-colors"
      title={
        mode === "dark"
          ? "Tema Oscuro (Click para Claro)"
          : mode === "light"
          ? "Tema Claro (Click para Sol de Playa)"
          : "Modo Sol de Playa (Click para Oscuro)"
      }
      aria-label="Cambiar tema de visualización (Oscuro, Claro o Sol de Playa)"
    >
      {mode === "dark" ? (
        <Moon className="h-5 w-5 text-amber-300 transition-transform" />
      ) : mode === "light" ? (
        <Sun className="h-5 w-5 text-amber-500 transition-transform" />
      ) : (
        <Sunrise className="h-5 w-5 text-orange-600 animate-pulse transition-transform" />
      )}
    </Button>
  );
}
