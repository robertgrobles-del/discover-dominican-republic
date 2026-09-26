import { useState } from "react";
import { 
  Clock, CheckCircle2, AlertTriangle, ShieldAlert
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { destinationData } from "@/data/nauticaData";

export function CruiserTimeEstimator() {
  const [selectedPuerto, setSelectedPuerto] = useState("Amber Cove");
  const [boardingTime, setBoardingTime] = useState("16:30");
  const [selectedDestino, setSelectedDestino] = useState("Damajagua");

  const dest = destinationData[selectedPuerto]?.[selectedDestino];
  if (!dest) return null;

  const travelTimeOneWay = dest.timeMinutes;
  const travelTimeRoundTrip = travelTimeOneWay * 2;
  
  const [bHour, bMin] = boardingTime.split(":").map(Number);
  const boardingMinutesFromMidnight = (bHour || 0) * 60 + (bMin || 0);
  const startMinutesFromMidnight = 9 * 60; // 09:00 AM
  const totalAvailableMinutes = boardingMinutesFromMidnight - startMinutesFromMidnight;
  const excursionDuration = 210; // 3.5 hrs
  const totalTimeNeeded = travelTimeRoundTrip + excursionDuration;
  const bufferMinutes = totalAvailableMinutes - totalTimeNeeded;
  
  let status = "safe";
  if (bufferMinutes < 60) status = "danger";
  else if (bufferMinutes < 120) status = "warning";

  const bufferHours = Math.floor(Math.abs(bufferMinutes) / 60);
  const bufferRemainingMins = Math.abs(bufferMinutes) % 60;

  return (
    <div className="mb-12">
      <Card className="border border-primary/20 bg-card/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" /> Estimador de Tiempo de Retorno a Puerto
          </CardTitle>
          <CardDescription>
            Calcula si tienes suficiente tiempo para realizar tu actividad y regresar al barco antes de zarpar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="puerto-select">Puerto de Atraque</Label>
              <select
                id="puerto-select"
                aria-label="Puerto de atraque"
                value={selectedPuerto}
                onChange={(e) => {
                  setSelectedPuerto(e.target.value);
                  const keys = Object.keys(destinationData[e.target.value]);
                  setSelectedDestino(keys[0]);
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="Amber Cove">Amber Cove (Puerto Plata)</option>
                <option value="Taino Bay">Taino Bay (Puerto Plata)</option>
                <option value="Sans Soucí">Sans Soucí (Santo Domingo)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destino-select">Actividad / Destino</Label>
              <select
                id="destino-select"
                aria-label="Actividad o destino de la excursión"
                value={selectedDestino}
                onChange={(e) => setSelectedDestino(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {Object.entries(destinationData[selectedPuerto] || {}).map(([key, data]) => (
                  <option key={key} value={key}>{data.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="boarding-input">Hora Límite de Abordaje</Label>
              <Input
                id="boarding-input"
                type="time"
                value={boardingTime}
                onChange={(e) => setBoardingTime(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border/60">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-foreground">Detalles del Trayecto</h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Distancia total (ida y vuelta):</span>
                  <span className="font-semibold text-foreground">{dest.dist * 2} km</span>
                </div>
                <div className="flex justify-between">
                  <span>Tiempo estimado de carretera:</span>
                  <span className="font-semibold text-foreground">{travelTimeRoundTrip} mins (~{(travelTimeRoundTrip/60).toFixed(1)}h)</span>
                </div>
                <div className="flex justify-between">
                  <span>Duración de actividad:</span>
                  <span className="font-semibold text-foreground">3.5 horas (210 mins)</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2 font-bold text-foreground">
                  <span>Tiempo total requerido:</span>
                  <span>~{Math.floor(totalTimeNeeded / 60)}h {totalTimeNeeded % 60}m</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between p-5 rounded-2xl border bg-muted/20">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {status === "safe" && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                  {status === "warning" && <AlertTriangle className="h-5 w-5 text-amber-500 animate-pulse" />}
                  {status === "danger" && <ShieldAlert className="h-5 w-5 text-red-500" />}
                  <span className="font-bold text-sm text-foreground">
                    {status === "safe" && "Retorno Seguro"}
                    {status === "warning" && "Tiempo Ajustado"}
                    {status === "danger" && "Riesgo de Pérdida de Embarque"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {status === "safe" && `Regresarás con aproximadamente ${bufferHours} horas y ${bufferRemainingMins} minutos de margen de seguridad antes del cierre de puertas.`}
                  {status === "warning" && `Tiempo de holgura de solo ${bufferHours}h ${bufferRemainingMins}m. Recomendamos adelantar el regreso o tomar una excursión oficial de la naviera.`}
                  {status === "danger" && `¡Alerta! Faltan ${bufferHours}h ${bufferRemainingMins}m para cubrir el tiempo. Es altamente probable que pierdas el barco.`}
                </p>
              </div>

              <div className="pt-4">
                {status === "danger" ? (
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs" onClick={() => {
                    const exSec = document.getElementById("excursiones-express");
                    exSec?.scrollIntoView({ behavior: "smooth" });
                  }}>
                    Cambiar a Excursión Express Garantizada
                  </Button>
                ) : (
                  <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-center text-xs font-bold border border-emerald-500/20">
                    Margen de seguridad aprobado: +{bufferHours}h {bufferRemainingMins}m
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
