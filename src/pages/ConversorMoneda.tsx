import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowRightLeft, RefreshCw, TrendingUp, 
  Info, Calendar, Search, X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
const supabaseAny = supabase as any;
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useSearchParams } from "react-router-dom";
import { 
  ExchangeRate, 
  staticTasas, 
  consejosCambio, 
  preciosReferencia 
} from "@/data/monedaData";
import { CurrencyDetailHistoryView } from "@/components/currency/CurrencyDetailHistoryView";

function useLatestExchangeRates() {
  return useQuery({
    queryKey: ["latest-exchange-rates"],
    queryFn: async () => {
      const { data, error } = await supabaseAny
        .from("exchange_rates")
        .select("*")
        .order("rate_date", { ascending: false });
      
      if (error) throw error;
      
      const latest: Record<string, ExchangeRate> = {};
      (data || []).forEach((row: any) => {
        if (!latest[row.currency_code]) {
          latest[row.currency_code] = row;
        }
      });
      return latest;
    }
  });
}

function useHistoricalExchangeRates(filters: { currency: string; date?: string }) {
  return useQuery({
    queryKey: ["historical-exchange-rates", filters],
    queryFn: async () => {
      let query = supabaseAny
        .from("exchange_rates")
        .select("*");
      
      if (filters.currency !== "all") {
        query = query.eq("currency_code", filters.currency);
      }
      if (filters.date) {
        query = query.eq("rate_date", filters.date);
      }
      
      const { data, error } = await query
        .order("rate_date", { ascending: false })
        .limit(100);
        
      if (error) throw error;
      return (data || []) as ExchangeRate[];
    }
  });
}

export default function ConversorMoneda() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCurrency = searchParams.get("currency");

  const [monedaOrigen, setMonedaOrigen] = useState("USD");
  const [cantidad, setCantidad] = useState<number>(100);
  const [resultado, setResultado] = useState<number>(0);
  const [direccion, setDireccion] = useState<"aDOP" | "deDOP">("aDOP");
  
  // Historical States
  const [histCurrency, setHistCurrency] = useState("all");
  const [histDate, setHistDate] = useState("");

  const { data: latestDbRates, refetch: refetchLatest, isFetching: isFetchingLatest } = useLatestExchangeRates();
  const { data: historicalRates, isLoading: isLoadingHist } = useHistoricalExchangeRates({
    currency: activeCurrency || histCurrency,
    date: histDate
  });

  const getRateData = (code: string) => {
    const dbRate = latestDbRates?.[code];
    const fallback = staticTasas[code as keyof typeof staticTasas];
    return {
      buy_rate: dbRate ? Number(dbRate.buy_rate) : fallback.buy_rate,
      sell_rate: dbRate ? Number(dbRate.sell_rate) : fallback.sell_rate,
      name: fallback.name,
      symbol: fallback.symbol,
      icon: fallback.icon,
      flag: fallback.flag,
      isDb: !!dbRate
    };
  };

  const currentRate = getRateData(monedaOrigen);

  useEffect(() => {
    const rate = direccion === "aDOP" ? currentRate.buy_rate : currentRate.sell_rate;
    if (direccion === "aDOP") {
      setResultado(cantidad * rate);
    } else {
      setResultado(cantidad / rate);
    }
  }, [cantidad, monedaOrigen, direccion, latestDbRates]);

  const toggleDireccion = () => {
    setDireccion(prev => prev === "aDOP" ? "deDOP" : "aDOP");
  };

  const handleClearHistFilters = () => {
    setHistCurrency("all");
    setHistDate("");
  };

  // Vista Detallada de Moneda Única
  if (activeCurrency && staticTasas[activeCurrency as keyof typeof staticTasas]) {
    const coinInfo = getRateData(activeCurrency);
    return (
      <PageTransition>
        <SEOHead
          title={`Historial de Tasa de Cambio: ${activeCurrency} | Descubre RD`}
          description={`Consulta el historial de tasas de compra y venta de ${coinInfo.name} (${activeCurrency}) a pesos dominicanos (DOP).`}
        />
        <div className="min-h-screen bg-background flex flex-col justify-between">
          <Header />
          <CurrencyDetailHistoryView
            activeCurrency={activeCurrency}
            coinInfo={coinInfo}
            historicalRates={historicalRates || []}
            onBack={() => setSearchParams({})}
          />
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SEOHead
        title="Tasa de Cambio e Histórico de Divisas | Descubre RD"
        description="Convierte tus divisas a pesos dominicanos (DOP). Consulta el histórico de tasas de compra y venta de Dólar, Euro, Libra y más."
        keywords="tasa de cambio rd, dolar a pesos dominicanos, euro a dop, conversor de divisas republica dominicana, casas de cambio rd"
      />
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <div>
          <Header />
          
          <main className="pt-24">
            {/* Hero */}
            <section className="relative py-12 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 mb-8">
              <div className="container mx-auto px-4 text-center">
                <Badge className="mb-4 bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                  <TrendingUp className="h-3.5 w-3.5 mr-1" /> Tasas Oficiales y de Referencia
                </Badge>
                <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">Conversor de Moneda</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto text-base">
                  Conversiones precisas al Peso Dominicano (DOP). <strong>Haz clic en cualquier moneda</strong> abajo para ver su histórico completo.
                </p>
              </div>
            </section>

            {/* Navigation Tabs */}
            <section className="container mx-auto px-4 mb-12">
              <Tabs defaultValue="converter" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
                  <TabsTrigger value="converter">Conversor</TabsTrigger>
                  <TabsTrigger value="history">Historial</TabsTrigger>
                  <TabsTrigger value="info">Guía Práctica</TabsTrigger>
                </TabsList>

                {/* Tab: Converter */}
                <TabsContent value="converter" className="space-y-6 animate-fade-in">
                  <div className="max-w-4xl mx-auto">
                    <Card>
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center justify-between flex-wrap gap-2 text-xl font-bold">
                          <span>Calculadora de Divisas</span>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => refetchLatest()}
                            disabled={isFetchingLatest}
                            className="text-xs h-8 gap-1.5"
                          >
                            <RefreshCw className={`h-3 w-3 ${isFetchingLatest ? "animate-spin" : ""}`} />
                            Actualizar Tasas
                          </Button>
                        </CardTitle>
                        <CardDescription>
                          Selecciona una divisa y digita la cantidad para convertir de/a Pesos Dominicanos (DOP).
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Currency Selection Buttons */}
                        <div className="flex flex-wrap gap-2">
                          {Object.keys(staticTasas).map((code) => {
                            const data = getRateData(code);
                            return (
                              <Button
                                key={code}
                                variant={monedaOrigen === code ? "default" : "outline"}
                                onClick={() => setMonedaOrigen(code)}
                                className="flex items-center gap-2 px-4 py-2"
                              >
                                <span className="text-lg">{data.flag}</span>
                                <span className="font-bold">{code}</span>
                              </Button>
                            );
                          })}
                        </div>

                        {/* Conversion Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase">
                              {direccion === "aDOP" ? currentRate.name : "Pesos Dominicanos"}
                            </Label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-3.5 text-muted-foreground font-medium">
                                {direccion === "aDOP" ? currentRate.symbol : "RD$"}
                              </span>
                              <Input
                                type="number"
                                value={cantidad}
                                onChange={(e) => setCantidad(parseFloat(e.target.value) || 0)}
                                className="pl-12 text-lg h-12"
                              />
                            </div>
                          </div>

                          <div className="flex justify-center pt-4 md:pt-0">
                            <Button 
                              variant="secondary" 
                              size="icon" 
                              className="rounded-full h-11 w-11 shadow-sm border"
                              onClick={toggleDireccion}
                              title="Invertir dirección de cambio"
                            >
                              <ArrowRightLeft className="h-5 w-5 text-primary" />
                            </Button>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase">
                              {direccion === "aDOP" ? "Pesos Dominicanos" : currentRate.name}
                            </Label>
                            <div className="relative bg-muted/40 border rounded-md">
                              <span className="absolute left-3.5 top-3.5 text-muted-foreground font-medium">
                                {direccion === "aDOP" ? "RD$" : currentRate.symbol}
                              </span>
                              <div className="pl-12 py-3 text-lg font-bold text-foreground">
                                {resultado.toLocaleString('es-DO', { 
                                  minimumFractionDigits: 2, 
                                  maximumFractionDigits: 2 
                                })}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Rate Info Display */}
                        <div className="rounded-xl bg-muted/40 p-4 border flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🏦</span>
                            <div>
                              <p className="font-semibold text-foreground">Tasas de Referencia</p>
                              <p className="text-xs text-muted-foreground">
                                {currentRate.isDb ? "Tasa provista por base de datos" : "Tasa estándar de respaldo"}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground">
                            <div className="bg-background border rounded px-3 py-1.5 text-center">
                              <span className="block text-[10px] uppercase text-muted-foreground">Tasa Compra</span>
                              <span className="text-sm font-bold text-foreground">RD$ {currentRate.buy_rate.toFixed(2)}</span>
                            </div>
                            <div className="bg-background border rounded px-3 py-1.5 text-center">
                              <span className="block text-[10px] uppercase text-muted-foreground">Tasa Venta</span>
                              <span className="text-sm font-bold text-foreground">RD$ {currentRate.sell_rate.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Rates Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-8">
                      {Object.keys(staticTasas).map((code) => {
                        const data = getRateData(code);
                        return (
                          <Card 
                            key={code} 
                            onClick={() => setSearchParams({ currency: code })}
                            className="text-center overflow-hidden hover:border-primary/40 hover:shadow-md transition-all cursor-pointer active:scale-95 group"
                          >
                            <div className="bg-muted/30 py-2 border-b group-hover:bg-primary/5 transition-colors">
                              <span className="text-xl block">{data.flag}</span>
                              <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors mt-0.5">{code}</p>
                            </div>
                            <CardContent className="p-3 text-xs space-y-1">
                              <div>
                                <span className="text-muted-foreground block text-[9px] uppercase">Compra</span>
                                <span className="font-semibold text-foreground">RD$ {data.buy_rate.toFixed(2)}</span>
                              </div>
                              <div className="pt-1 border-t border-border/50">
                                <span className="text-muted-foreground block text-[9px] uppercase">Venta</span>
                                <span className="font-semibold text-foreground">RD$ {data.sell_rate.toFixed(2)}</span>
                              </div>
                              <div className="pt-1 text-[9px] text-primary/80 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                Ver histórico →
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: History */}
                <TabsContent value="history" className="space-y-6 animate-fade-in">
                  <div className="max-w-4xl mx-auto">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-bold">
                          <Calendar className="h-5 w-5 text-primary" />
                          <span>Historial de Tasas de Cambio</span>
                        </CardTitle>
                        <CardDescription>
                          Filtra y consulta las fluctuaciones de compra y venta de divisas en la base de datos histórica.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Filters */}
                        <div className="bg-muted/30 p-4 border rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="hist-currency" className="text-xs font-semibold text-muted-foreground">
                              Filtrar por Divisa
                            </Label>
                            <select
                              id="hist-currency"
                              value={histCurrency}
                              onChange={(e) => setHistCurrency(e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Filtrar por Divisa"
                              aria-label="Filtrar por Divisa"
                            >
                              <option value="all">Todas las Monedas</option>
                              {Object.keys(staticTasas).map(code => (
                                <option key={code} value={code}>{code} - {staticTasas[code as keyof typeof staticTasas].name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="hist-date" className="text-xs font-semibold text-muted-foreground">
                              Buscar Día Específico
                            </Label>
                            <Input
                              id="hist-date"
                              type="date"
                              value={histDate}
                              onChange={(e) => setHistDate(e.target.value)}
                              className="w-full bg-background"
                            />
                          </div>
                        </div>

                        {histDate || histCurrency !== "all" ? (
                          <div className="flex justify-end -mt-2">
                            <Button variant="ghost" size="sm" onClick={handleClearHistFilters} className="text-destructive hover:bg-destructive/10 gap-1.5 h-8">
                              <X className="h-4 w-4" /> Limpiar filtros
                            </Button>
                          </div>
                        ) : null}

                        {/* Historical Results Table */}
                        <div className="border rounded-xl overflow-hidden bg-background">
                          <Table>
                            <TableHeader className="bg-muted/40">
                              <TableRow>
                                <TableHead className="font-bold">Fecha</TableHead>
                                <TableHead className="font-bold text-center">Moneda</TableHead>
                                <TableHead className="font-bold text-right">Tasa Compra</TableHead>
                                <TableHead className="font-bold text-right">Tasa Venta</TableHead>
                                <TableHead className="font-bold text-right">Margen (Spread)</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {isLoadingHist ? (
                                <TableRow>
                                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                                    Cargando historial...
                                  </TableCell>
                                </TableRow>
                              ) : historicalRates && historicalRates.length > 0 ? (
                                historicalRates.map((rate) => {
                                  const flag = staticTasas[rate.currency_code]?.flag || "🪙";
                                  const spread = Math.abs(rate.sell_rate - rate.buy_rate);
                                  const dateObj = new Date(rate.rate_date + "T12:00:00");
                                  return (
                                    <TableRow key={rate.id} className="hover:bg-muted/10">
                                      <TableCell className="font-medium">
                                        {format(dateObj, "dd MMM yyyy", { locale: es })}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <Badge variant="outline" className="gap-1 font-bold">
                                          <span>{flag}</span>
                                          <span>{rate.currency_code}</span>
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                                        RD$ {Number(rate.buy_rate).toFixed(4)}
                                      </TableCell>
                                      <TableCell className="text-right text-primary font-semibold">
                                        RD$ {Number(rate.sell_rate).toFixed(4)}
                                      </TableCell>
                                      <TableCell className="text-right text-muted-foreground text-xs">
                                        RD$ {spread.toFixed(4)}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                    <Search className="h-10 w-10 mx-auto mb-3 opacity-30 text-muted-foreground" />
                                    <h5 className="font-bold text-foreground">No se encontraron registros</h5>
                                    <p className="text-xs mt-1">No hay tasas de cambio registradas para los filtros especificados.</p>
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Tab: Travel Guide */}
                <TabsContent value="info" className="space-y-8 animate-fade-in">
                  <div className="max-w-4xl mx-auto">
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Info className="h-5 w-5 text-primary" />
                          <span>Consejos para el Cambio en República Dominicana</span>
                        </CardTitle>
                        <CardDescription>
                          Recomendaciones prácticas para el manejo de efectivo y tarjetas durante tu estadía en el país.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                          {consejosCambio.map((consejo, idx) => (
                            <div key={idx} className="flex items-start gap-3.5 p-4 bg-muted/40 rounded-xl border">
                              <span className="text-2xl mt-0.5">{consejo.icon}</span>
                              <div>
                                <h4 className="font-bold text-foreground text-sm">{consejo.titulo}</h4>
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{consejo.descripcion}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-bold">Precios de Referencia Promedio</CardTitle>
                        <CardDescription>Visualiza el costo estimado de bienes y servicios básicos locales en pesos dominicanos.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {preciosReferencia.map((item, idx) => (
                            <div 
                              key={idx} 
                              className="flex items-center justify-between p-3.5 bg-muted/20 border rounded-xl"
                            >
                              <span className="font-semibold text-sm text-foreground">{item.item}</span>
                              <div className="text-right">
                                <span className="font-bold text-primary text-sm">{item.precio}</span>
                                <span className="text-xs text-muted-foreground block">~ {item.usd}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </section>
          </main>
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
}
