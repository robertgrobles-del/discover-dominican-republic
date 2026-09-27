import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ExternalLink, Globe } from "lucide-react";
import { AirlineRoute } from "@/data/airlinesData";

interface AirlineCardProps {
  airline: AirlineRoute;
}

export function AirlineCard({ airline }: AirlineCardProps) {
  return (
    <Card className="overflow-hidden border border-border/80 hover:border-primary/40 transition-all shadow-xs">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-border/60">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-muted/60 border border-border flex items-center justify-center font-black text-xl text-primary shrink-0">
              {airline.code}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-bold">{airline.name}</h2>
                {airline.isDominicanHub && (
                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                    <Sparkles className="w-3 h-3 mr-1" /> Aerolínea de Bandera Dominicana
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  Hub: {airline.hub}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                País de origen: <strong>{airline.country}</strong>
                {airline.terminalSDQ && ` • Terminal SDQ: ${airline.terminalSDQ}`}
                {airline.terminalPUJ && ` • Terminal PUJ: ${airline.terminalPUJ}`}
              </p>
            </div>
          </div>

          <a
            href={airline.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shrink-0"
          >
            Sitio Web Oficial
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Direct Routes / Cities */}
        <div className="pt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-primary" />
            Rutas Directas Disponibles
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {airline.directOrigins.map((route, i) => (
              <div
                key={i}
                className="p-3 bg-muted/30 rounded-xl border border-border/40 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-sm">{route.city}</div>
                  <div className="text-[11px] text-muted-foreground">{route.country}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-primary block">
                    {route.flightDuration}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Vía {route.airportsRD.join("/")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
