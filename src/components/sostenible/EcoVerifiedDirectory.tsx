import { CheckCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface EcoBusinessCriteria {
  name: string;
  checked: boolean;
}

export interface EcoBusinessItem {
  id: string;
  name: string;
  location: string;
  description: string;
  category: string;
  rating: number;
  criteria: EcoBusinessCriteria[];
}

interface EcoVerifiedDirectoryProps {
  businesses: EcoBusinessItem[];
  onSelectBusiness: (bus: EcoBusinessItem) => void;
}

export function EcoVerifiedDirectory({
  businesses,
  onSelectBusiness,
}: EcoVerifiedDirectoryProps) {
  return (
    <div className="pt-8 border-t border-border space-y-6">
      <div>
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
          AUDITORÍA VERDE
        </Badge>
        <h2 className="text-2xl font-bold text-foreground mt-2">
          Directorio de Negocios Eco-Verified
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Establecimientos auditados formalmente bajo criterios rigurosos de sustentabilidad.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {businesses.map((bus) => (
          <Card
            key={bus.id}
            className="border bg-card/40 hover:border-emerald-500/30 transition-all flex flex-col justify-between"
          >
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <Badge className="bg-emerald-600/15 text-emerald-500 border-emerald-500/25 font-extrabold text-[10px]">
                    {bus.category}
                  </Badge>
                  <h3 className="font-display font-bold text-base text-foreground mt-2">{bus.name}</h3>
                </div>
                <div className="flex items-center gap-1 font-bold text-xs text-amber-500 font-mono">
                  ★ {bus.rating}
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-normal">{bus.description}</p>

              <div className="border-t border-border/60 pt-3">
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2">
                  Criterios Auditados:
                </p>
                <div className="space-y-1">
                  {bus.criteria.map((crit, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs">
                      {crit.checked ? (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <Info className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                      )}
                      <span
                        className={
                          crit.checked ? "text-foreground" : "text-muted-foreground line-through"
                        }
                      >
                        {crit.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>

            <div className="p-5 pt-0">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-bold border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/5"
                onClick={() => onSelectBusiness(bus)}
              >
                Ver Certificado Oficial
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
