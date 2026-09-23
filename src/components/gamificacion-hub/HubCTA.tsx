import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gamepad2, Trophy, Play } from "lucide-react";

interface HubCTAProps {
  user: { id: string } | null | undefined;
}

export function HubCTA({ user }: HubCTAProps) {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/10 via-card to-amber-500/10">
      <div className="container mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Gamepad2 className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tu próxima visita ya vale puntos
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            Cada destino nuevo te sube de nivel; cada experiencia suma puntos extra.
          </p>
          <div className="flex gap-4 justify-center">
            {user ? (
              <Button size="lg" asChild className="gap-2">
                <Link to="/club-recompensas"><Trophy className="h-5 w-5" /> Ir al Club de Recompensas</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild className="gap-2">
                  <Link to="/registro"><Play className="h-5 w-5" /> Crear Cuenta Gratis</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">Iniciar Sesión</Link>
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
