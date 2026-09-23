import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock, Play } from "lucide-react";
import type { Mission } from "@/hooks/useGamification";

interface MissionsTeaserProps {
  missions: Mission[];
}

// Fills the gap left by the onboarding/missions blocks, which only render
// for logged-in users, and gives anonymous visitors a reason to sign up.
export function MissionsTeaser({ missions }: MissionsTeaserProps) {
  return (
    <section className="py-12 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Misiones que te esperan</h2>
          <p className="text-muted-foreground text-sm">Inicia sesión para desbloquearlas y empezar a sumar puntos</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {missions.slice(0, 3).map((m) => (
            <div key={m.id} className="relative p-5 rounded-2xl bg-background border border-border overflow-hidden">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{m.icon}</span>
                <span className="text-xs font-semibold text-amber-500">+{m.xp_reward} XP</span>
              </div>
              <p className="font-semibold text-foreground text-sm mb-3">{m.name}</p>
              <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px] flex items-center justify-center">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button asChild className="gap-2">
            <Link to="/registro"><Play className="h-4 w-4" /> Crear Cuenta Gratis</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
