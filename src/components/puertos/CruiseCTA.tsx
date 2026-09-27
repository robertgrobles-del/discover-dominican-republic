import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ship } from "lucide-react";

export function CruiseCTA() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <Ship className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold mb-2">
              ¿Llegas en crucero?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Planifica tu día en tierra con nuestras excursiones y tours diseñados 
              especialmente para pasajeros de cruceros.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg">Ver Excursiones</Button>
              <Button size="lg" variant="outline">Guía para Cruceristas</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
