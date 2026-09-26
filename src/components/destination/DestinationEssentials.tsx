import { 
  FileText, Zap, ShieldCheck, DollarSign, 
  Car, Compass 
} from "lucide-react";
import { useTranslation } from "@/hooks/useI18n";

interface DestinationEssentialsProps {
  destinoNombre: string;
  region: string;
  aeropuertoCercano?: string;
  tiempoEstadiaRecomendado?: string;
}

export function DestinationEssentials({
  destinoNombre,
  region,
  aeropuertoCercano = "Aeropuerto Internacional de Las Américas (SDQ) o Punta Cana (PUJ)",
  tiempoEstadiaRecomendado = "3 a 5 días",
}: DestinationEssentialsProps) {
  const { t } = useTranslation();

  const essentials = [
    {
      icon: FileText,
      title: "Requisito de Entrada",
      desc: "e-Ticket Digital obligatorio y 100% gratuito antes de abordar el vuelo.",
      badge: "Oficial MITUR",
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    {
      icon: Compass,
      title: "Estadía Sugerida",
      desc: `${tiempoEstadiaRecomendado} para recorrer playas, monumentos y gastronomía.`,
      badge: "Recomendado",
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
    {
      icon: DollarSign,
      title: "Moneda & Pagos",
      desc: "Peso Dominicano (DOP) y USD aceptados. Tarjetas de crédito en la mayoría de comercios.",
      badge: "DOP / USD",
      color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
    {
      icon: Car,
      title: "Conexión y Acceso",
      desc: `Vía ${aeropuertoCercano}. Red de carreteras con peajes rápidos (Paso Rápido).`,
      badge: "Transporte",
      color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    },
    {
      icon: Zap,
      title: "Electricidad & Enchufes",
      desc: "110V / 60Hz. Clavijas estándar tipo A y B (igual que Estados Unidos y Canadá).",
      badge: "110V Estándar",
      color: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    },
    {
      icon: ShieldCheck,
      title: "Seguridad & Asistencia",
      desc: "Patrullaje especializado de POLITUR y línea de emergencia nacional 911 las 24 horas.",
      badge: "POLITUR 24/7",
      color: "bg-sky-500/10 text-sky-500 border-sky-500/20",
    },
  ];

  return (
    <section className="py-12 bg-muted/30 border-y border-border/60">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-2 border border-primary/20">
            Lo Esencial para el Viajero
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Prepárate para explorar {destinoNombre}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base mt-1">
            Datos prácticos y recomendaciones oficiales para disfrutar tu viaje con tranquilidad y confort.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {essentials.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-card hover:bg-card/80 transition-all duration-300 rounded-2xl p-5 border border-border shadow-sm flex flex-col justify-between group hover:border-primary/40 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl border ${item.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-foreground mb-1.5 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
