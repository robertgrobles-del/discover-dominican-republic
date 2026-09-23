import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Calculator, Receipt, Info, DollarSign, HelpCircle, 
  Sparkles, CheckCircle2
} from "lucide-react";

export default function CalculadoraTributaria() {
  const [subtotal, setSubtotal] = useState<number>(1500);
  const [additionalTipPercent, setAdditionalTipPercent] = useState<number>(5); // propina voluntaria

  const itbisPercent = 0.18;
  const legalTipPercent = 0.10;

  const itbisAmount = subtotal * itbisPercent;
  const legalTipAmount = subtotal * legalTipPercent;
  const additionalTipAmount = subtotal * (additionalTipPercent / 100);
  const grandTotal = subtotal + itbisAmount + legalTipAmount + additionalTipAmount;

  return (
    <PageTransition>
      <SEOHead
        title="Calculadora Tributaria Restaurantes DOP - Descubre RD"
        description="Calcula fácilmente la cuenta de restaurantes en República Dominicana desglosando el 18% del ITBIS y el 10% de la propina de ley."
      />
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-20">
          {/* Hero */}
          <section className="relative py-16 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border-b border-border">
            <div className="container mx-auto px-4 text-center">
              <Badge variant="secondary" className="mb-4 bg-orange-500/10 text-orange-600 border-orange-500/20 gap-1">
                <Receipt className="h-3.5 w-3.5" /> Finanzas del Viajero
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">
                Calculadora Tributaria Restaurantes
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Desglosa rápidamente los impuestos de consumo de ley en República Dominicana (18% ITBIS + 10% Propina de Ley) para evitar sorpresas en tu factura.
              </p>
            </div>
          </section>

          {/* Calculator Body */}
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-5xl">
              <div className="grid lg:grid-cols-12 gap-8">
                
                {/* Inputs (Col 5) */}
                <div className="lg:col-span-5 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Montos a Calcular</CardTitle>
                      <CardDescription>Digita el subtotal del menú para ver el desglose</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground">Consumo Subtotal (DOP $)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">RD$</span>
                          <Input
                            type="number"
                            className="pl-12 font-mono"
                            value={subtotal}
                            onChange={(e) => setSubtotal(Math.max(0, Number(e.target.value)))}
                          />
                        </div>
                      </div>

                      {/* Additional Tip Slider */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-muted-foreground">Propina Voluntaria (Adicional)</span>
                          <span className="text-primary font-mono">{additionalTipPercent}%</span>
                        </div>
                        <Slider 
                          value={[additionalTipPercent]}
                          onValueChange={(val) => setAdditionalTipPercent(val[0])}
                          min={0}
                          max={20}
                          step={1}
                          className="py-2"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Ley explanation */}
                  <Card className="border-primary/20 bg-primary/5 text-xs text-muted-foreground leading-relaxed">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-primary">
                        <Info className="h-4.5 w-4.5" />
                        ¿Qué es el 10% y el 18%?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p>
                        En la República Dominicana, los precios de los menús en restaurantes típicamente <strong>no incluyen</strong> los impuestos de ley, los cuales se suman al final de la factura:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li><strong>18% ITBIS:</strong> Impuesto al Valor Agregado aplicado a alimentos y bebidas.</li>
                        <li><strong>10% Propina de Ley:</strong> Exigido por el Código de Trabajo (Ley 1443). Se distribuye mensualmente entre el personal de servicio (camareros, cocineros).</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Outputs Receipt Style (Col 7) */}
                <div className="lg:col-span-7">
                  <Card className="border-2 border-dashed border-border shadow-md">
                    <CardHeader className="text-center pb-2 bg-muted/40">
                      <CardTitle className="font-mono text-base uppercase tracking-wider">Factura Pro-Forma (Simulación)</CardTitle>
                      <CardDescription className="text-[10px] font-mono">MITUR-HUB • REPÚBLICA DOMINICANA</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4 font-mono text-xs text-muted-foreground">
                      
                      <div className="flex justify-between">
                        <span>CONSUMO COMIDA/BEBIDA</span>
                        <span className="text-foreground font-bold">RD$ {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>

                      <div className="border-t border-border/60 pt-3 flex justify-between">
                        <span>18% ITBIS (TAX)</span>
                        <span className="text-foreground">RD$ {itbisAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>10% PROPINA DE LEY (SERVICE CHARGE)</span>
                        <span className="text-foreground">RD$ {legalTipAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>

                      {additionalTipPercent > 0 && (
                        <div className="flex justify-between text-primary">
                          <span>PROPINA VOLUNTARIA ({additionalTipPercent}%)</span>
                          <span>RD$ {additionalTipAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      )}

                      <div className="border-t-2 border-double border-foreground pt-4 flex justify-between text-base text-foreground font-bold">
                        <span>TOTAL ESTIMADO</span>
                        <span className="font-mono">RD$ {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>

                      <div className="pt-6 text-center text-[10px] space-y-2 border-t border-border/40">
                        <p className="flex justify-center items-center gap-1.5 text-emerald-500 font-bold">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Cuenta Calculada Correctamente
                        </p>
                        <p>Los precios en los menús dominicanos a menudo no contienen estos desgloses. Recuerda validar si la factura ya los incluye al momento de pagar.</p>
                      </div>

                    </CardContent>
                  </Card>
                </div>

              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
