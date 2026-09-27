import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy } from "lucide-react";
import { affiliateOffers } from "@/data/creatorsData";

interface CreatorsAffiliatesTabProps {
  onCopyAffiliate: (url: string) => void;
}

export function CreatorsAffiliatesTab({ onCopyAffiliate }: CreatorsAffiliatesTabProps) {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-card border border-border space-y-2">
        <h3 className="font-display text-xl font-bold text-foreground">Programas de Afiliados Oficiales</h3>
        <p className="text-xs text-muted-foreground">
          Comparte tus enlaces personalizados en tus redes sociales (Instagram Bio, YouTube description, TikTok, blog). Cada vez que un usuario reserve, ganas comisiones automáticas.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {affiliateOffers.map((offer) => (
          <Card key={offer.id} className="border-border bg-card flex flex-col justify-between shadow-sm">
            <CardHeader>
              <Badge className="w-fit mb-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                {offer.category}
              </Badge>
              <CardTitle className="text-base font-bold text-foreground leading-snug">
                {offer.title}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Partner: {offer.partner}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-xl bg-muted/50 space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Comisión Ofrecida</p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{offer.commissionRate}</p>
                <p className="text-[10px] text-muted-foreground">Ganancia promedio por clic (EPC): {offer.epc}</p>
              </div>

              <Button 
                onClick={() => onCopyAffiliate(offer.affiliateUrl)}
                className="w-full rounded-xl text-xs font-bold gap-2"
              >
                <Copy className="h-3.5 w-3.5" /> Copiar Enlace de Afiliado
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
