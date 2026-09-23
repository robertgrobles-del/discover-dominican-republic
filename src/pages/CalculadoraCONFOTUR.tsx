import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Calculator, Building, Percent, FileText, CheckCircle2, 
  HelpCircle, Landmark, TrendingUp, Info, DollarSign
} from "lucide-react";
import { toast } from "sonner";

export default function CalculadoraCONFOTUR() {
  const [propertyValue, setPropertyValue] = useState<number>(250000);
  const [rentalIncome, setRentalIncome] = useState<number>(1800); // mensual estimado
  const [isB2B, setIsB2B] = useState<boolean>(false);

  // Umbral exento IPI (Impuesto a la Propiedad Inmobiliaria) en RD es aprox. 9,500,000 DOP (~165,000 USD)
  const ipiThresholdUSD = 165000;
  
  // Beneficios CONFOTUR:
  // 1. Exención del Impuesto de Transferencia de Propiedad (3% del valor)
  const transferTaxSavings = propertyValue * 0.03;
  
  // 2. Exención del IPI (1% anual del valor del inmueble, por 15 años)
  // Bajo CONFOTUR la exención es total del 1% del valor catastral/declarado
  const annualIpiSavings = propertyValue * 0.01;
  const totalIpiSavings15Years = annualIpiSavings * 15;
  
  // 3. Exención del Impuesto sobre la Renta (ISR) por alquileres (20% del ingreso bruto estimado)
  const annualRentalIncome = rentalIncome * 12;
  const annualIsrSavings = annualRentalIncome * 0.20; // 20% tasa efectiva aproximada
  const totalIsrSavings15Years = annualIsrSavings * 15;

  const grandTotalSavings = transferTaxSavings + totalIpiSavings15Years + totalIsrSavings15Years;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Enlace de la calculadora copiado al portapapeles");
  };

  return (
    <PageTransition>
      <SEOHead
        title="Calculadora de Beneficios CONFOTUR - Descubre RD"
        description="Calcula tus ahorros en impuestos de transferencia, IPI e Impuesto sobre la Renta al invertir en propiedades turísticas bajo la Ley de CONFOTUR en República Dominicana."
      />
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-20">
          {/* Hero */}
          <section className="relative py-16 bg-gradient-to-br from-blue-500/10 via-primary/5 to-transparent">
            <div className="container mx-auto px-4 text-center">
              <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
                Inversión Turística Inteligente
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">
                Calculadora CONFOTUR
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Estima tu ahorro de impuestos al invertir en proyectos amparados bajo la Ley de Fomento al Desarrollo Turístico (Ley 158-01) en República Dominicana.
              </p>
            </div>
          </section>

          {/* Calculator Section */}
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="grid lg:grid-cols-12 gap-8">
                
                {/* Inputs (Col 5) */}
                <div className="lg:col-span-5 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Datos del Inmueble</CardTitle>
                      <CardDescription>Ajusta los valores para simular tu inversión</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Property Value Slider & Input */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-medium">Valor del Inmueble (USD)</label>
                          <span className="font-bold text-primary font-mono">${propertyValue.toLocaleString()}</span>
                        </div>
                        <Slider 
                          value={[propertyValue]} 
                          onValueChange={(val) => setPropertyValue(val[0])} 
                          min={50000} 
                          max={1500000} 
                          step={10000}
                          className="py-4"
                        />
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number"
                            className="pl-9"
                            value={propertyValue} 
                            onChange={(e) => setPropertyValue(Math.max(0, Number(e.target.value)))} 
                          />
                        </div>
                      </div>

                      {/* Estimated Rental Income Slider & Input */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-medium">Renta Mensual Estimada (USD)</label>
                          <span className="font-bold text-primary font-mono">${rentalIncome.toLocaleString()}</span>
                        </div>
                        <Slider 
                          value={[rentalIncome]} 
                          onValueChange={(val) => setRentalIncome(val[0])} 
                          min={200} 
                          max={10000} 
                          step={100}
                          className="py-4"
                        />
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number" 
                            className="pl-9"
                            value={rentalIncome} 
                            onChange={(e) => setRentalIncome(Math.max(0, Number(e.target.value)))} 
                          />
                        </div>
                      </div>

                      {/* B2B / Empresa Check */}
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Inversión Corporativa (B2B)</p>
                          <p className="text-xs text-muted-foreground">Exención del impuesto a los activos corporativos (1%)</p>
                        </div>
                        <Button 
                          variant={isB2B ? "default" : "outline"} 
                          size="sm"
                          onClick={() => setIsB2B(!isB2B)}
                        >
                          {isB2B ? "Activo" : "Inactivo"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Legal Benefits info card */}
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md flex items-center gap-2">
                        <Landmark className="h-5 w-5 text-primary" />
                        ¿Qué es la Ley CONFOTUR?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2 text-muted-foreground">
                      <p>
                        La Ley 158-01 (CONFOTUR) busca incentivar el desarrollo turístico en polos de bajo desarrollo relativo o de gran potencial.
                      </p>
                      <ul className="space-y-1 text-xs">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span>Aplicable a proyectos certificados por MITUR.</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span>Válido para hoteles, condohoteles, villas y apartamentos.</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span>Ahorro del 3% en impuesto de transferencia inmobiliaria.</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span>Ahorro del 1% del IPI anual por hasta 15 años.</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Outputs (Col 7) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Results Panel */}
                  <Card className="relative overflow-hidden border-2 border-primary">
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 font-bold rounded-bl-lg uppercase">
                      Estimación 15 Años
                    </div>
                    <CardHeader className="bg-primary/5">
                      <CardTitle className="text-lg">Ahorro Fiscal Total Estimado</CardTitle>
                      <CardDescription>Resumen de incentivos acumulados por la ley 158-01</CardDescription>
                      <div className="text-4xl md:text-5xl font-bold text-primary font-mono pt-2">
                        ${grandTotalSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm text-muted-foreground font-normal">USD</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      
                      {/* Itemized Savings */}
                      <div className="space-y-3">
                        {/* Transfer Tax */}
                        <div className="flex justify-between items-center p-3 bg-muted/40 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">Impuesto de Transferencia (3%)</p>
                              <p className="text-xs text-muted-foreground">Exención de pago único al comprar</p>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-foreground">${transferTaxSavings.toLocaleString()}</span>
                        </div>

                        {/* Annual IPI */}
                        <div className="flex justify-between items-center p-3 bg-muted/40 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                              <Percent className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">Impuesto a la Propiedad (IPI - 1%)</p>
                              <p className="text-xs text-muted-foreground">Exención del 1% anual por 15 años</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-foreground">${totalIpiSavings15Years.toLocaleString()}</span>
                            <p className="text-[10px] text-muted-foreground">${annualIpiSavings.toLocaleString()}/año</p>
                          </div>
                        </div>

                        {/* ISR rental */}
                        <div className="flex justify-between items-center p-3 bg-muted/40 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                              <TrendingUp className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">Impuesto sobre Alquileres (ISR)</p>
                              <p className="text-xs text-muted-foreground">Exención aproximada del 20% ISR sobre rentas</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-foreground">${totalIsrSavings15Years.toLocaleString()}</span>
                            <p className="text-[10px] text-muted-foreground">${annualIsrSavings.toLocaleString()}/año</p>
                          </div>
                        </div>

                        {/* B2B Corporativo Additional */}
                        {isB2B && (
                          <div className="flex justify-between items-center p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                                <Building className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm">Impuesto de Activos Societarios (1%)</p>
                                <p className="text-xs text-muted-foreground">Exención por tener el inmueble a nombre de SRL/SA</p>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-amber-500">+ Aplica</span>
                          </div>
                        )}
                      </div>

                      {/* ROI Projection */}
                      <div className="p-4 bg-muted/50 rounded-xl space-y-2 border border-border">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <Info className="h-4 w-4 text-primary" />
                          Retorno de Inversión (ROI) Estimado con CONFOTUR
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Sin CONFOTUR, tu retorno neto anual por alquileres se vería reducido por el pago del IPI y del ISR. Con esta ley, el ahorro acumulado de <strong>${grandTotalSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD</strong> en 15 años representa un incremento directo de aproximadamente <strong>{((grandTotalSavings / propertyValue) * 100 / 15).toFixed(1)}% anual adicional</strong> sobre tu tasa de rendimiento original.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <Button className="flex-1" onClick={() => window.print()}>
                          Imprimir Reporte
                        </Button>
                        <Button variant="outline" onClick={handleShare}>
                          Compartir Cálculos
                        </Button>
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
