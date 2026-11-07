import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TipoEstablecimiento } from "@/components/forms/RegistroEstablecimientoModal";
import { tipoConfig } from "@/components/forms/registro/RegistroFormHelpers";

export type { TipoEstablecimiento };

interface Props {
  /** Tipo con el que se abre el formulario. Con `general`, la persona lo elige dentro. */
  tipo: TipoEstablecimiento;
  titulo?: string;
  subtitulo?: string;
  /** Cifras reales para acompañar la invitación. Sin ellas no se muestra ninguna. */
  stats?: { label: string; valor: string }[];
}

/** Textos propios de los tipos más habituales; el resto usa el nombre y la descripción de su tipo. */
const COPY: Partial<Record<TipoEstablecimiento, { titulo: string; subtitulo: string; boton: string; nota: string }>> = {
  general: { titulo: "¿Tienes un negocio turístico?", subtitulo: "Regístralo gratis en Descubre RD, sea cual sea su tipo: alojamiento, restaurante, excursiones, transporte, salud o comercio.", boton: "Registrar mi negocio", nota: "Gratis · Revisión en 2-3 días hábiles" },
  hotel: { titulo: "¿Tienes un hotel o alojamiento?", subtitulo: "Regístralo gratis en Descubre RD y llega a viajeros que buscan dónde hospedarse en República Dominicana.", boton: "Registrar mi hotel", nota: "Gratis · Revisión en 2-3 días hábiles" },
  airbnb: { titulo: "¿Tienes un Airbnb o villa turística?", subtitulo: "Publica tu apartamento, villa o casa vacacional y conecta directamente con viajeros que buscan estancias privadas.", boton: "Registrar mi alojamiento", nota: "Gratis · Reservas directas" },
  restaurante: { titulo: "¿Administras un restaurante?", subtitulo: "Muestra tu menú, tu ubicación y recibe reservas de mesa y consultas por WhatsApp.", boton: "Registrar mi restaurante", nota: "Menú digital · WhatsApp directo" },
  bar: { titulo: "¿Tienes un bar, rooftop o discoteca?", subtitulo: "Publica tu horario, tu carta de cócteles y tu ubicación, y gestiona reservas de mesa por WhatsApp.", boton: "Registrar mi bar", nota: "Horario y cierre · Reservas de mesa" },
};

export function CTARegistroEstablecimiento({ tipo, titulo, subtitulo, stats }: Props) {
  const config = tipoConfig[tipo];
  const Icon = config.icon;
  const copy = COPY[tipo] ?? { titulo: "Registra tu negocio en Descubre RD", subtitulo: config.descripcion, boton: "Registrar mi negocio", nota: "Gratis · Revisión en 2-3 días hábiles" };

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-8 md:p-10 mb-10"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 bg-primary/10 text-primary">
              <Icon className={`h-3.5 w-3.5 ${config.color}`} aria-hidden="true" />
              {config.label}
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">{titulo || copy.titulo}</h2>
            <p className="text-muted-foreground max-w-lg">{subtitulo || copy.subtitulo}</p>

            {stats && stats.length > 0 && (
              <div className="flex flex-wrap gap-6 mt-5">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-xl font-bold text-foreground">{stat.valor}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            {/* El formulario vive en su propia página: se puede enlazar desde correos y redes. */}
            <Button size="lg" asChild className="gap-2 whitespace-nowrap">
              <Link to={tipo === "general" ? "/registra-tu-negocio" : `/registra-tu-negocio?tipo=${tipo}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
                {copy.boton}
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground text-center md:text-right">{copy.nota}</p>
          </div>
        </div>
      </motion.section>

    </>
  );
}
