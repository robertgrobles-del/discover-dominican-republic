import { 
  ShieldCheck, Clock, CheckCircle2, Baby, PawPrint, CreditCard 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface AccommodationPoliciesData {
  checkIn: string;
  checkOut: string;
  cancellation: string;
  children: string;
  pets: string;
  paymentMethods: string[];
}

interface AccommodationPoliciesProps {
  policies: AccommodationPoliciesData;
}

export function AccommodationPolicies({ policies }: AccommodationPoliciesProps) {
  return (
    <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm">
      <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2.5">
        <ShieldCheck className="h-6 w-6 text-primary" />
        Políticas y Normativas de Hospedaje
      </h2>
      
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-4 bg-muted/30 rounded-2xl border border-border/60">
          <div className="flex items-center gap-2 font-bold text-sm text-foreground mb-1">
            <Clock className="h-4 w-4 text-primary" /> Horarios de Entrada / Salida
          </div>
          <p className="text-xs text-muted-foreground">
            Check-in: {policies.checkIn} | Check-out: {policies.checkOut}
          </p>
        </div>

        <div className="p-4 bg-muted/30 rounded-2xl border border-border/60">
          <div className="flex items-center gap-2 font-bold text-sm text-foreground mb-1">
            <CheckCircle2 className="h-4 w-4 text-primary" /> Cancelación Flexible
          </div>
          <p className="text-xs text-muted-foreground">{policies.cancellation}</p>
        </div>

        <div className="p-4 bg-muted/30 rounded-2xl border border-border/60">
          <div className="flex items-center gap-2 font-bold text-sm text-foreground mb-1">
            <Baby className="h-4 w-4 text-primary" /> Política de Niños
          </div>
          <p className="text-xs text-muted-foreground">{policies.children}</p>
        </div>

        <div className="p-4 bg-muted/30 rounded-2xl border border-border/60">
          <div className="flex items-center gap-2 font-bold text-sm text-foreground mb-1">
            <PawPrint className="h-4 w-4 text-primary" /> Mascotas
          </div>
          <p className="text-xs text-muted-foreground">{policies.pets}</p>
        </div>

        <div className="sm:col-span-2 p-4 bg-muted/30 rounded-2xl border border-border/60">
          <div className="flex items-center gap-2 font-bold text-sm text-foreground mb-2">
            <CreditCard className="h-4 w-4 text-primary" /> Medios de Pago Aceptados
          </div>
          <div className="flex flex-wrap gap-2">
            {policies.paymentMethods.map(m => (
              <Badge key={m} variant="outline" className="bg-background text-xs py-1 px-3">
                {m}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
