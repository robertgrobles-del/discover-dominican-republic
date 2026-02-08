import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Banknote, ArrowRightLeft, RefreshCw, TrendingUp, 
  TrendingDown, Info, DollarSign, Euro, PoundSterling
} from "lucide-react";

// Tasas de ejemplo (en producción conectar a API real)
const tasasCambio = {
  USD: { tasa: 59.50, nombre: "Dólar Estadounidense", simbolo: "$", icon: DollarSign },
  EUR: { tasa: 64.80, nombre: "Euro", simbolo: "€", icon: Euro },
  GBP: { tasa: 75.20, nombre: "Libra Esterlina", simbolo: "£", icon: PoundSterling },
  CAD: { tasa: 43.50, nombre: "Dólar Canadiense", simbolo: "C$", icon: DollarSign },
  MXN: { tasa: 3.40, nombre: "Peso Mexicano", simbolo: "MX$", icon: DollarSign },
};

const consejosCambio = [
  {
    titulo: "Casas de Cambio",
    descripcion: "Generalmente ofrecen mejores tasas que hoteles y aeropuertos.",
    icon: "🏦"
  },
  {
    titulo: "Tarjetas de Crédito",
    descripcion: "Ampliamente aceptadas en zonas turísticas. Verificar cargos por transacción extranjera.",
    icon: "💳"
  },
  {
    titulo: "Cajeros ATM",
    descripcion: "Disponibles en toda la isla. Pueden cobrar comisión de $3-5 USD por transacción.",
    icon: "🏧"
  },
  {
    titulo: "Propinas",
    descripcion: "10-15% en restaurantes. En pesos dominicanos preferiblemente.",
    icon: "💵"
  },
];

const preciosReferencia = [
  { item: "Cerveza local (bar)", precio: "150-250 DOP", usd: "$2.50-4" },
  { item: "Almuerzo típico", precio: "300-500 DOP", usd: "$5-8" },
  { item: "Taxi aeropuerto-hotel", precio: "1,500-3,000 DOP", usd: "$25-50" },
  { item: "Tour de medio día", precio: "2,500-5,000 DOP", usd: "$40-85" },
  { item: "Cena en restaurante", precio: "800-2,000 DOP", usd: "$13-35" },
  { item: "Guagua (bus local)", precio: "25-50 DOP", usd: "$0.40-0.85" },
];

export default function ConversorMoneda() {
  const [monedaOrigen, setMonedaOrigen] = useState("USD");
  const [cantidad, setCantidad] = useState<number>(100);
  const [resultado, setResultado] = useState<number>(0);
  const [direccion, setDireccion] = useState<"aDOP" | "deDOP">("aDOP");

  useEffect(() => {
    const tasa = tasasCambio[monedaOrigen as keyof typeof tasasCambio]?.tasa || 1;
    if (direccion === "aDOP") {
      setResultado(cantidad * tasa);
    } else {
      setResultado(cantidad / tasa);
    }
  }, [cantidad, monedaOrigen, direccion]);

  const toggleDireccion = () => {
    setDireccion(prev => prev === "aDOP" ? "deDOP" : "aDOP");
  };

  const monedaActual = tasasCambio[monedaOrigen as keyof typeof tasasCambio];

  return (
    <PageTransition>
      <SEOHead
        title="Conversor de Moneda - Peso Dominicano (DOP)"
        description="Convierte tu moneda a pesos dominicanos. Tasas actualizadas, consejos de cambio y precios de referencia en RD."
      />
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-20">
          {/* Hero */}
          <section className="relative py-20 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <div className="container mx-auto px-4 text-center">
              <Banknote className="h-16 w-16 text-primary mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Conversor de Moneda</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Peso Dominicano (DOP) - Tasas de referencia
              </p>
            </div>
          </section>

          {/* Converter */}
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-4xl">
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Convertir Moneda</span>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <RefreshCw className="h-3 w-3" />
                      Actualizado hoy
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Currency Selection */}
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(tasasCambio).map(([code, data]) => (
                      <Button
                        key={code}
                        variant={monedaOrigen === code ? "default" : "outline"}
                        onClick={() => setMonedaOrigen(code)}
                        className="flex items-center gap-2"
                      >
                        <data.icon className="h-4 w-4" />
                        {code}
                      </Button>
                    ))}
                  </div>

                  {/* Converter */}
                  <div className="grid md:grid-cols-3 gap-4 items-center">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">
                        {direccion === "aDOP" ? monedaActual?.nombre : "Peso Dominicano"}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-muted-foreground">
                          {direccion === "aDOP" ? monedaActual?.simbolo : "RD$"}
                        </span>
                        <Input
                          type="number"
                          value={cantidad}
                          onChange={(e) => setCantidad(parseFloat(e.target.value) || 0)}
                          className="pl-12 text-xl h-14"
                        />
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full h-12 w-12"
                        onClick={toggleDireccion}
                      >
                        <ArrowRightLeft className="h-6 w-6" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">
                        {direccion === "aDOP" ? "Peso Dominicano" : monedaActual?.nombre}
                      </label>
                      <div className="relative bg-muted rounded-md">
                        <span className="absolute left-3 top-4 text-muted-foreground">
                          {direccion === "aDOP" ? "RD$" : monedaActual?.simbolo}
                        </span>
                        <div className="pl-12 py-4 text-xl font-bold">
                          {resultado.toLocaleString('es-DO', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rate Info */}
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <span>1 {monedaOrigen} = RD$ {monedaActual?.tasa.toFixed(2)}</span>
                    <span>•</span>
                    <span>1 DOP = {monedaActual?.simbolo}{(1 / monedaActual?.tasa).toFixed(4)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Rates */}
              <div className="grid md:grid-cols-5 gap-4 mb-12">
                {Object.entries(tasasCambio).map(([code, data]) => (
                  <Card key={code} className="text-center">
                    <CardContent className="pt-4">
                      <data.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="font-bold text-lg">1 {code}</p>
                      <p className="text-muted-foreground">= RD$ {data.tasa.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Tips */}
              <Card className="mb-12">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Consejos para el Cambio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {consejosCambio.map((consejo, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                        <span className="text-2xl">{consejo.icon}</span>
                        <div>
                          <h4 className="font-semibold">{consejo.titulo}</h4>
                          <p className="text-sm text-muted-foreground">{consejo.descripcion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Reference Prices */}
              <Card>
                <CardHeader>
                  <CardTitle>Precios de Referencia</CardTitle>
                  <CardDescription>Cuánto cuestan las cosas típicas en RD</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {preciosReferencia.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <span className="font-medium">{item.item}</span>
                        <div className="text-right">
                          <span className="font-bold text-primary">{item.precio}</span>
                          <span className="text-sm text-muted-foreground ml-2">({item.usd})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Disclaimer */}
              <p className="text-center text-sm text-muted-foreground mt-8">
                * Las tasas mostradas son de referencia. Las tasas reales pueden variar según 
                el lugar de cambio. Última actualización: {new Date().toLocaleDateString('es-DO')}
              </p>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
