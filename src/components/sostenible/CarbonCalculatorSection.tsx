import { motion } from "framer-motion";
import { Leaf, ArrowRight, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface CarbonCalculation {
  tons: number;
  offsetCost: number;
}

interface CarbonCalculatorSectionProps {
  flightOrigin: string;
  onFlightOriginChange: (val: string) => void;
  flightClass: string;
  onFlightClassChange: (val: string) => void;
  hotelNights: number;
  onHotelNightsChange: (val: number) => void;
  co2Calculation: CarbonCalculation | null;
  onCalculate: (e: React.FormEvent) => void;
  onOffsetPurchase: () => void;
}

export function CarbonCalculatorSection({
  flightOrigin,
  onFlightOriginChange,
  flightClass,
  onFlightClassChange,
  hotelNights,
  onHotelNightsChange,
  co2Calculation,
  onCalculate,
  onOffsetPurchase,
}: CarbonCalculatorSectionProps) {
  return (
    <div id="calculadora" className="pt-8 border-t border-border">
      <div className="grid lg:grid-cols-12 gap-8 items-center">
        {/* Form Side */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
              CALCULADORA DE HUELLA
            </Badge>
            <h2 className="text-2xl font-bold text-foreground mt-2">Mide Tu Impacto Ambiental</h2>
            <p className="text-xs text-muted-foreground mt-1 leading-normal">
              Calcula las toneladas de carbono generadas por tu vuelo y estadía, y compensa
              financiando de forma directa la siembra de manglares en la costa de Montecristi.
            </p>
          </div>

          <form onSubmit={onCalculate} className="space-y-4 bg-card/50 p-6 border rounded-xl">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">
                Origen del Vuelo
              </label>
              <select
                value={flightOrigin}
                onChange={(e) => onFlightOriginChange(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                title="Origen del Vuelo"
              >
                <option value="New York">Estados Unidos (New York) - ~2,500 km</option>
                <option value="Miami">Estados Unidos (Miami) - ~1,300 km</option>
                <option value="Madrid">España (Madrid) - ~6,500 km</option>
                <option value="Paris">Francia (París) - ~7,000 km</option>
                <option value="Bogota">Colombia (Bogotá) - ~1,600 km</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">
                Clase del Asiento
              </label>
              <select
                value={flightClass}
                onChange={(e) => onFlightClassChange(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                title="Clase del Asiento"
              >
                <option value="economic">Clase Económica</option>
                <option value="business">Clase Ejecutiva (2x Impacto)</option>
                <option value="first">Primera Clase (3x Impacto)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">
                Noches de Alojamiento
              </label>
              <Input
                type="number"
                min="1"
                value={hotelNights}
                onChange={(e) => onHotelNightsChange(parseInt(e.target.value) || 1)}
                required
                className="bg-background text-xs"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-5"
            >
              Calcular Huella Ecológica
            </Button>
          </form>
        </div>

        {/* Report / Offset Side */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8 max-w-lg w-full space-y-6 text-center">
            {co2Calculation ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Leaf className="h-10 w-10 text-emerald-500 mx-auto" />
                  <h3 className="font-display text-xl font-extrabold text-foreground">
                    Tu Reporte de Huella CO2
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card p-4 rounded-xl border border-border">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                      Emisiones CO2
                    </span>
                    <p className="text-2xl font-extrabold font-mono text-foreground mt-1">
                      {co2Calculation.tons} <span className="text-xs font-normal">Tons</span>
                    </p>
                  </div>
                  <div className="bg-card p-4 rounded-xl border border-border">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                      Costo Sugerido
                    </span>
                    <p className="text-2xl font-extrabold font-mono text-emerald-500 mt-1">
                      ${co2Calculation.offsetCost} <span className="text-xs font-normal">USD</span>
                    </p>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground leading-relaxed text-left bg-card/60 p-4 border rounded-lg">
                  <p className="font-bold text-foreground">🌱 ¿Cómo ayuda tu compensación?</p>
                  <p className="mt-1">
                    Tu aporte financia directamente la cooperativa costera en Montecristi encargada de
                    plantar manglares rojos, capaces de capturar hasta 10 veces más carbono que un bosque
                    tropical terrestre.
                  </p>
                </div>

                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2"
                  onClick={onOffsetPurchase}
                >
                  Compensar Huella en Montecristi <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            ) : (
              <div className="py-12 space-y-4 text-muted-foreground">
                <Plane className="h-12 w-12 text-muted-foreground/35 mx-auto animate-bounce" />
                <div>
                  <p className="font-bold text-sm text-foreground">
                    Aún no has calculado tu huella
                  </p>
                  <p className="text-xs mt-1">
                    Ingresa los detalles de tu vuelo a la izquierda para ver el reporte ecológico
                    detallado.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
