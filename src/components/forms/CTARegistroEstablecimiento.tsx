import { useState, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Building2, ChevronRight, Star, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TipoEstablecimiento } from "@/components/forms/RegistroEstablecimientoModal";

export type { TipoEstablecimiento };

// Modal is dynamically imported only when user opens it
const RegistroEstablecimientoModal = lazy(() =>
  import("@/components/forms/RegistroEstablecimientoModal").then((m) => ({
    default: m.RegistroEstablecimientoModal,
  }))
);

interface Props {
  tipo: TipoEstablecimiento;
  titulo?: string;
  subtitulo?: string;
  stats?: { label: string; valor: string }[];
}

const defaultStats = [
  { label: "Establecimientos activos", valor: "2,400+" },
  { label: "Visitantes mensuales", valor: "180K+" },
  { label: "Tasa de conversión", valor: "4.8%" },
];

export function CTARegistroEstablecimiento({ tipo, titulo, subtitulo, stats }: Props) {
  const [open, setOpen] = useState(false);
  const displayStats = stats || defaultStats;

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-8 md:p-10 mb-10"
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
          {/* Left content */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-4">
              <Building2 className="h-3 w-3" aria-hidden="true" />
              Portal de Empresas Turísticas
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              {titulo || "¿Tienes un establecimiento?"}
            </h2>
            <p className="text-muted-foreground max-w-lg">
              {subtitulo ||
                "Regístralo gratis en Descubre RD y llega a miles de viajeros internacionales y nacionales que buscan experiencias auténticas."}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mt-5">
              {displayStats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-xl font-bold text-foreground">{stat.valor}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right CTA */}
          <div className="flex flex-col gap-3 md:items-end">
            <Button
              size="lg"
              onClick={() => setOpen(true)}
              aria-label="Abrir formulario para registrar mi establecimiento turístico"
              className="gap-2 shadow-lg shadow-primary/20 whitespace-nowrap"
            >
              <Building2 className="h-5 w-5" aria-hidden="true" />
              Registrar mi Establecimiento
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <p className="text-xs text-muted-foreground text-center md:text-right">
              Gratis · Sin tarjeta · Aprobación en 2-3 días
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" aria-hidden="true" /> Premium</span>
              <span className="flex items-center gap-1"><Users className="h-3 w-3 text-primary" aria-hidden="true" /> +2K empresas</span>
              <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-emerald-500" aria-hidden="true" /> Verificado</span>
            </div>
          </div>
        </div>
      </motion.section>

      {open && (
        <Suspense fallback={null}>
          <RegistroEstablecimientoModal open={open} onClose={() => setOpen(false)} tipo={tipo} />
        </Suspense>
      )}
    </>
  );
}
