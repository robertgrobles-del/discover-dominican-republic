import { useState, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Building2, ChevronRight, Star, TrendingUp, Users, Home } from "lucide-react";
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
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 ${
              tipo === "airbnb" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" :
              tipo === "restaurante" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
              tipo === "bar" ? "bg-purple-500/10 text-purple-600 dark:text-purple-400" :
              "bg-primary/10 text-primary"
            }`}>
              {tipo === "airbnb" ? <Home className="h-3.5 w-3.5" aria-hidden="true" /> : <Building2 className="h-3.5 w-3.5" aria-hidden="true" />}
              {tipo === "airbnb" ? "Portal de Anfitriones & Rentas Cortas" :
               tipo === "restaurante" ? "Guía Gastronómica & Reservas" :
               tipo === "bar" ? "Directorio Nightlife & Mesas VIP" :
               "Portal de Alojamientos & Cadenas Hoteleras"}
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              {titulo || (
                tipo === "airbnb" ? "¿Tienes un Airbnb o Villa Turística?" :
                tipo === "restaurante" ? "¿Administras un Restaurante?" :
                tipo === "bar" ? "¿Tienes un Bar, Rooftop o Discoteca?" :
                "¿Tienes un hotel o alojamiento?"
              )}
            </h2>
            <p className="text-muted-foreground max-w-lg">
              {subtitulo ||
                (tipo === "airbnb"
                  ? "Publica tu apartamento, villa o casa vacacional y conecta directamente con viajeros que buscan estancias privadas auténticas."
                  : tipo === "restaurante"
                  ? "Muestra tu menú digital, ubicación exacta y recibe reservas de mesa directas y consultas por WhatsApp sin pagar comisiones por comensal."
                  : tipo === "bar"
                  ? "Publica tu horario de apertura y cierre, carta de cócteles y bebidas de autor, ubicación y gestiona reservas de mesas VIP directo por WhatsApp."
                  : "Regístralo gratis en Descubre RD y llega a miles de viajeros internacionales y corporativos que buscan confort y servicios de clase mundial.")}
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
              aria-label={
                tipo === "airbnb" ? "Registrar mi Airbnb o Vivienda Turística" :
                tipo === "restaurante" ? "Registrar mi Restaurante o Negocio Gastronómico" :
                tipo === "bar" ? "Registrar mi Bar o Discoteca" :
                "Registrar mi Hotel o Alojamiento"
              }
              className={`gap-2 shadow-lg whitespace-nowrap ${
                tipo === "airbnb" 
                  ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20" 
                  : tipo === "restaurante"
                  ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20"
                  : tipo === "bar"
                  ? "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20"
                  : "shadow-primary/20"
              }`}
            >
              {tipo === "airbnb" ? <Home className="h-5 w-5" aria-hidden="true" /> : <Building2 className="h-5 w-5" aria-hidden="true" />}
              {tipo === "airbnb" ? "Registrar mi Airbnb / Villa" :
               tipo === "restaurante" ? "Registrar mi Restaurante" :
               tipo === "bar" ? "Registrar mi Bar / Discoteca" :
               "Registrar mi Hotel / Resort"}
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <p className="text-xs text-muted-foreground text-center md:text-right">
              {tipo === "airbnb" ? "0% comisión directa · Anfitrión verificado" :
               tipo === "restaurante" ? "Menú digital · WhatsApp directo · Sin comisiones" :
               tipo === "bar" ? "Mesas VIP · Horario & Cierre · Acceso prioritario" :
               "Gratis · Sin tarjeta · Aprobación en 2-3 días"}
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" aria-hidden="true" /> {tipo === "airbnb" ? "Superhost RD" : "Premium"}</span>
              <span className="flex items-center gap-1"><Users className="h-3 w-3 text-primary" aria-hidden="true" /> {tipo === "airbnb" ? "+1.2K anfitriones" : "+2K empresas"}</span>
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
