import { Plane, Calendar, User, Clock, QrCode, Sparkles, Download, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DigitalBoardingPassCardProps {
  passengerName?: string;
  flightNumber?: string;
  airline?: string;
  originCode?: string;
  originCity?: string;
  destinationCode?: string;
  destinationCity?: string;
  departureTime?: string;
  arrivalTime?: string;
  gate?: string;
  terminal?: string;
  seat?: string;
  classType?: string;
}

export function DigitalBoardingPassCard({
  passengerName = "Viajero Descubre RD",
  flightNumber = "DM 2026",
  airline = "Arajet • Vuelo Oficial",
  originCode = "MIA",
  originCity = "Miami",
  destinationCode = "SDQ",
  destinationCity = "Santo Domingo",
  departureTime = "10:30 AM",
  arrivalTime = "01:45 PM",
  gate = "B12",
  terminal = "TB",
  seat = "14A",
  classType = "Premium Economy"
}: DigitalBoardingPassCardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto my-6 font-sans">
      <div className="relative bg-gradient-to-br from-card via-card/95 to-muted/50 border border-border/80 rounded-3xl shadow-xl overflow-hidden backdrop-blur-md">
        {/* Cabecera del Boarding Pass */}
        <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/15 rounded-xl backdrop-blur-xs">
              <Plane className="w-5 h-5 text-white transform -rotate-45" />
            </div>
            <div>
              <span className="text-3xs font-black uppercase tracking-widest text-white/80 block">
                Tarjeta de Embarque Digital
              </span>
              <h3 className="h4 font-bold text-sm tracking-wide">{airline}</h3>
            </div>
          </div>
          <Badge className="bg-white/20 text-white border-0 text-xs font-semibold backdrop-blur-xs">
            {classType}
          </Badge>
        </div>

        {/* Cuerpo Principal del Vuelo */}
        <div className="p-6">
          {/* Ruta: Origen -> Trayecto Curvo con Avión -> Destino */}
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="text-left">
              <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tight block">
                {originCode}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {originCity}
              </span>
              <p className="text-xs font-bold text-foreground/80 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-sky-500" /> {departureTime}
              </p>
            </div>

            {/* Trayecto dinámico con avión al centro */}
            <div className="flex-1 px-4 flex flex-col items-center justify-center relative">
              <span className="text-3xs font-bold text-sky-600 dark:text-sky-400 mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Vuelo Directo
              </span>
              <div className="w-full relative flex items-center">
                <div className="w-full border-t-2 border-dashed border-sky-400/50" />
                <div className="absolute left-1/2 -translate-x-1/2 p-2 bg-sky-500 text-white rounded-full shadow-md shadow-sky-500/30">
                  <Plane className="w-4 h-4 transform rotate-90" />
                </div>
              </div>
              <span className="text-2xs font-semibold text-muted-foreground mt-2">
                2h 15m de vuelo
              </span>
            </div>

            <div className="text-right">
              <span className="text-3xl sm:text-4xl font-black text-sky-600 dark:text-sky-400 tracking-tight block">
                {destinationCode}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {destinationCity}
              </span>
              <p className="text-xs font-bold text-foreground/80 mt-1 flex items-center justify-end gap-1">
                <Clock className="w-3 h-3 text-sky-500" /> {arrivalTime}
              </p>
            </div>
          </div>

          {/* Grilla de Datos de Vuelo */}
          <div className="grid grid-cols-4 gap-3 py-4 mt-2 border-t border-border/50 text-center">
            <div className="bg-muted/40 p-2.5 rounded-2xl">
              <span className="text-3xs uppercase font-bold text-muted-foreground block">
                Pasajero
              </span>
              <span className="font-bold text-xs text-foreground truncate block">
                {passengerName}
              </span>
            </div>
            <div className="bg-muted/40 p-2.5 rounded-2xl">
              <span className="text-3xs uppercase font-bold text-muted-foreground block">
                Vuelo
              </span>
              <span className="font-bold text-xs text-foreground block">
                {flightNumber}
              </span>
            </div>
            <div className="bg-muted/40 p-2.5 rounded-2xl">
              <span className="text-3xs uppercase font-bold text-muted-foreground block">
                Puerta / Term.
              </span>
              <span className="font-bold text-xs text-foreground block">
                {gate} ({terminal})
              </span>
            </div>
            <div className="bg-muted/40 p-2.5 rounded-2xl">
              <span className="text-3xs uppercase font-bold text-muted-foreground block">
                Asiento
              </span>
              <span className="font-black text-xs text-sky-600 dark:text-sky-400 block">
                {seat}
              </span>
            </div>
          </div>
        </div>

        {/* Línea Troquelada con Muescas Redondeadas laterales (Estilo Boarding Pass clásico) */}
        <div className="relative flex items-center justify-between">
          <div className="w-5 h-8 bg-background border-r border-border rounded-r-full -ml-px shadow-inner" />
          <div className="flex-1 border-t-2 border-dashed border-border/80 mx-2" />
          <div className="w-5 h-8 bg-background border-l border-border rounded-l-full -mr-px shadow-inner" />
        </div>

        {/* Sección Inferior del Ticket con Código de Barras / QR y Estado */}
        <div className="p-6 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-card rounded-2xl border border-border shadow-xs">
              <QrCode className="w-10 h-10 text-foreground" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" /> E-Ticket Dominicano Vinculado
              </div>
              <p className="text-2xs text-muted-foreground mt-0.5">
                Presenta este código en el mostrador o puerta de embarque.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto rounded-xl gap-1.5 text-xs font-bold border-border/80 hover:bg-muted"
            onClick={() => window.print()}
          >
            <Download className="w-3.5 h-3.5" /> Descargar / Imprimir
          </Button>
        </div>
      </div>
    </div>
  );
}
