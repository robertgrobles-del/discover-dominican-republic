import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Award, Sparkles, TrendingUp, ShieldCheck, Video } from "lucide-react";

export function CreatorsMonetizationInfoCard() {
  const layers = [
    {
      icon: DollarSign,
      title: "Comisión por conversión atribuida",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      description: "El servicio puede registrar una comisión cuando una venta se atribuye a un video. La tasa se configura por perfil; no hay una tasa universal garantizada.",
      when: "Cuando una compra elegible queda atribuida al contenido."
    },
    {
      icon: Award,
      title: "Licencia de uso de contenido",
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      description: "Cada video puede incluir una tarifa de licencia propuesta. El uso comercial requiere acordar alcance, canales, plazo y pago antes de publicar la campaña.",
      when: "Sólo cuando exista una licencia acordada para una campaña."
    },
    {
      icon: TrendingUp,
      title: "Fondo de creadores",
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      description: "El sistema permite registrar pagos del fondo a creadores. No hay una fórmula pública de reparto ni un pago automático por vistas o interacciones.",
      when: "Cuando el equipo apruebe y registre una asignación."
    }
  ];

  return (
    <Card className="border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 rounded-2xl overflow-hidden mb-8">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs gap-1">
            <Sparkles className="h-3.5 w-3.5" /> Ecosistema de Monetización RD
          </Badge>
        </div>
        <CardTitle className="text-xl md:text-2xl font-bold text-foreground mt-1">
          Tres vías posibles; cada una tiene condiciones distintas
        </CardTitle>
        <CardDescription className="text-xs md:text-sm text-muted-foreground">
          La disponibilidad, el monto y la aprobación dependen de cada atribución, licencia o convocatoria. Esta página no promete ingresos ni refleja un saldo en tiempo real.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-4">
          {layers.map((layer) => {
            const Icon = layer.icon;
            return (
              <div key={layer.title} className="p-4 rounded-xl bg-card border border-border flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${layer.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-semibold text-sm text-foreground">{layer.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{layer.description}</p>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <span className="text-[11px] font-semibold text-primary block">¿Cuándo aplica?</span>
                  <span className="text-[11px] text-muted-foreground">{layer.when}</span>
                </div>
              </div>
            );
          })}
        </div>
        <section aria-labelledby="creator-earnings-examples" className="mt-6 rounded-xl border border-border bg-card p-5">
          <h3 id="creator-earnings-examples" className="font-semibold">Ejemplos de cálculo, sin promesa de ingreso</h3>
          <div className="mt-3 grid gap-4 text-sm leading-6 text-muted-foreground md:grid-cols-3">
            <p><strong className="text-foreground">Conversión:</strong> una venta atribuida de RD$5,000 daría RD$400 si al perfil se le aplica la tasa inicial del 8%. La tasa real se configura por perfil y el servidor registra la conversión.</p>
            <p><strong className="text-foreground">Licencia:</strong> si una campaña acuerda, por ejemplo, el uso del video en canales y fechas definidos, se paga la tarifa pactada para ese uso. Sin acuerdo no hay ingreso por licencia.</p>
            <p><strong className="text-foreground">Fondo:</strong> las vistas no calculan automáticamente un pago. Sólo existe ingreso cuando el equipo registra una asignación aprobada al creador.</p>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">El ejemplo de conversión es aritmético y usa la tasa predeterminada del esquema; no confirma una tasa individual, una compra atribuida ni la aprobación de pago.</p>
        </section>
        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Guía editorial y de uso</h3>
          </div>
          <ul className="mt-3 grid gap-3 text-sm leading-6 text-muted-foreground md:grid-cols-2">
            <li>Entrega video vertical 9:16, con audio claro, buena iluminación y resolución legible. Evita marcas de agua de otras plataformas.</li>
            <li>Usa material propio o con permisos suficientes; declara música, imágenes y colaboraciones de terceros.</li>
            <li>Publicar o enviar un video no concede a Descubre RD una licencia comercial. El uso promocional requiere un acuerdo separado que precise canales, plazo y compensación.</li>
            <li>Los criterios de aprobación, pagos, retiros y apelaciones se rigen por el acuerdo vigente y la respuesta del programa; esta guía no sustituye esos términos.</li>
          </ul>
          <p className="mt-4 flex items-start gap-2 border-t border-border pt-4 text-xs leading-5 text-muted-foreground"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Términos legales de cesión, retiro de contenido y plazos de apelación: pendientes de aprobación legal. No se interpretan como acordados en esta guía.</p>
        </div>
      </CardContent>
    </Card>
  );
}
