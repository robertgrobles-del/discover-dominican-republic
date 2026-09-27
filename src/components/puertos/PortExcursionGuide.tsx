import { Clock } from "lucide-react";

interface PortExcursionGuideProps {
  portId: string;
  portName: string;
}

export function PortExcursionGuide({ portId, portName }: PortExcursionGuideProps) {
  return (
    <section className="bg-gradient-to-br from-primary/10 via-card to-card rounded-2xl p-6 border border-primary/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-foreground">
            Qué hacer en 8 horas de escala en {portName}
          </h3>
          <p className="text-xs text-muted-foreground">
            Itinerario optimizado para cruceristas con retorno seguro al barco garantizado (tolerancia de 2h antes de zarpe).
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        <div className="p-4 rounded-xl bg-background/80 border border-border/60">
          <div className="inline-block px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-semibold mb-2">
            Horas 1 a 3 (Mañana)
          </div>
          <h4 className="font-semibold text-sm mb-1">Atracción Principal & Aventura</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {portId === "amber-cove" && "Salida directa a 27 Charcos de Damajagua o teleférico de la Loma Isabel de Torres."}
            {portId === "taino-bay" && "Caminata de 10 min al centro histórico: Calle de las Sombrillas, Parque Central y Fortaleza San Felipe."}
            {portId === "cabo-rojo" && "Excursión en lancha a Bahía de las Águilas con parada en mirador de la cueva."}
            {portId !== "amber-cove" && portId !== "taino-bay" && portId !== "cabo-rojo" && "Desembarque ágil y traslado contratado hacia el polo histórico/natural más cercano."}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-background/80 border border-border/60">
          <div className="inline-block px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-2">
            Horas 4 a 6 (Mediodía)
          </div>
          <h4 className="font-semibold text-sm mb-1">Gastronomía & Relax Criollo</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Almuerzo criollo (pescado con coco o bandera dominicana) frente al mar, degustación de ron añejo y café recién colado.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-background/80 border border-border/60">
          <div className="inline-block px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
            Horas 7 a 8 (Tarde)
          </div>
          <h4 className="font-semibold text-sm mb-1">Duty Free & Retorno Seguro</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Compras de ámbar, larimar y café en la terminal. Embarque relajado 90 minutos antes de la hora límite fijada por el capitán.
          </p>
        </div>
      </div>
    </section>
  );
}
