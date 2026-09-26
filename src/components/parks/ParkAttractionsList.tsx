import { CheckCircle, DollarSign, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParqueAtraccion } from "@/data/parquesData";

interface ParkAttractionsListProps {
  atracciones: ParqueAtraccion[];
}

export function ParkAttractionsList({ atracciones }: ParkAttractionsListProps) {
  return (
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-display text-xl font-bold">Atracciones y Experiencias del Parque</h3>
        </div>
        
        <div className="grid gap-3">
          {atracciones.map((atraccion, idx) => (
            <div 
              key={idx} 
              className="flex items-start gap-4 p-4 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors border border-border/40"
            >
              <div className={`p-2.5 rounded-full shrink-0 ${atraccion.incluido ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                {atraccion.incluido ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <DollarSign className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h4 className="font-semibold text-foreground">{atraccion.nombre}</h4>
                  {atraccion.incluido ? (
                    <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                      Incluido en entrada
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-amber-600 dark:text-amber-400 border-amber-500/30">
                      Actividad opcional / Cargo extra
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{atraccion.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
