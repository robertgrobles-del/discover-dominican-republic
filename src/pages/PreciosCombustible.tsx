import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Droplet, Flame, Gauge, History, Sparkles, Calendar, DollarSign, Info, RefreshCw, X, Search, ArrowLeft, TrendingUp, TrendingDown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { useSearchParams } from "react-router-dom";

interface FuelPriceRecord {
  id: string;
  effective_date: string;
  gasolina_premium: number;
  gasolina_regular: number;
  gasoil_optimo: number;
  gasoil_regular: number;
  glp: number;
  gnv: number;
  created_at: string;
}

const fallbackPrices = {
  effective_date: "2026-06-20",
  gasolina_premium: 290.10,
  gasolina_regular: 272.50,
  gasoil_optimo: 239.10,
  gasoil_regular: 221.60,
  glp: 132.60,
  gnv: 43.97,
};

function useFuelPrices(filterDate?: string) {
  return useQuery({
    queryKey: ["fuel-prices", filterDate],
    queryFn: async () => {
      let query = supabase.from("fuel_prices").select("*");
      if (filterDate) {
        query = query.eq("effective_date", filterDate);
      }
      const { data, error } = await query
        .order("effective_date", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return (data || []) as FuelPriceRecord[];
    }
  });
}

export default function PreciosCombustible() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeType = searchParams.get("type");

  const [dateFilter, setDateFilter] = useState("");
  const [selectedFuelType, setSelectedFuelType] = useState("all");

  const { data: pricesList, isLoading, refetch, isFetching } = useFuelPrices(dateFilter);

  const getLatestRecord = (): FuelPriceRecord => {
    if (pricesList && pricesList.length > 0) {
      return pricesList[0];
    }
    return { ...fallbackPrices, id: "fallback", created_at: "" } as FuelPriceRecord;
  };

  const latest = getLatestRecord();

  const getWeekRangeLabel = (dateStr: string) => {
    try {
      const satDate = new Date(dateStr + "T12:00:00");
      const friDate = addDays(satDate, 6);
      return `Vigente desde el ${format(satDate, "d 'de' MMMM", { locale: es })} al ${format(friDate, "d 'de' MMMM yyyy", { locale: es })}`;
    } catch {
      return "Período de vigencia semanal";
    }
  };

  const handleClearFilters = () => {
    setDateFilter("");
    setSelectedFuelType("all");
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString("es-DO", {
      style: "currency",
      currency: "DOP",
      minimumFractionDigits: 2,
    });
  };

  const fuelCards = [
    {
      name: "Gasolina Premium",
      price: latest.gasolina_premium,
      key: "gasolina_premium",
      desc: "Alto octanaje, recomendada para motores de alta relación de compresión.",
      color: "border-l-rose-500",
      icon: <Flame className="h-5 w-5 text-rose-500" />,
      bg: "bg-rose-500/5",
    },
    {
      name: "Gasolina Regular",
      price: latest.gasolina_regular,
      key: "gasolina_regular",
      desc: "Combustible regular para vehículos convencionales.",
      color: "border-l-orange-500",
      icon: <Flame className="h-5 w-5 text-orange-500" />,
      bg: "bg-orange-500/5",
    },
    {
      name: "Gasoil Óptimo",
      price: latest.gasoil_optimo,
      key: "gasoil_optimo",
      desc: "Diésel refinado con bajos niveles de azufre para menor emisión.",
      color: "border-l-blue-500",
      icon: <Droplet className="h-5 w-5 text-blue-500" />,
      bg: "bg-blue-500/5",
    },
    {
      name: "Gasoil Regular",
      price: latest.gasoil_regular,
      key: "gasoil_regular",
      desc: "Diésel estándar para transporte pesado y motores industriales.",
      color: "border-l-cyan-500",
      icon: <Droplet className="h-5 w-5 text-cyan-500" />,
      bg: "bg-cyan-500/5",
    },
    {
      name: "GLP (Licuado de Petróleo)",
      price: latest.glp,
      key: "glp",
      desc: "Gas licuado de petróleo de uso doméstico y automotriz alternativo.",
      color: "border-l-amber-500",
      icon: <Gauge className="h-5 w-5 text-amber-500" />,
      bg: "bg-amber-500/5",
    },
    {
      name: "GNV (Gas Natural Vehicular)",
      price: latest.gnv,
      key: "gnv",
      desc: "Gas natural comprimido. Alta eficiencia y mínimo impacto ambiental.",
      color: "border-l-emerald-500",
      icon: <Gauge className="h-5 w-5 text-emerald-500" />,
      bg: "bg-emerald-500/5",
    },
  ];

  // Vista Detallada de Combustible Único
  if (activeType && fuelCards.some(f => f.key === activeType)) {
    const cardInfo = fuelCards.find(f => f.key === activeType)!;
    const historyPrices = (pricesList || []).map(p => ({
      date: p.effective_date,
      price: Number(p[activeType as keyof FuelPriceRecord])
    })).filter(p => !isNaN(p.price));

    const pricesArray = historyPrices.map(h => h.price);
    const maxPrice = pricesArray.length > 0 ? Math.max(...pricesArray) : cardInfo.price;
    const minPrice = pricesArray.length > 0 ? Math.min(...pricesArray) : cardInfo.price;
    const avgPrice = pricesArray.length > 0 ? (pricesArray.reduce((s, c) => s + c, 0) / pricesArray.length) : cardInfo.price;

    return (
      <PageTransition>
        <SEOHead
          title={`Historial de Precios: ${cardInfo.name} | Descubre RD`}
          description={`Consulta el histórico de precios de ${cardInfo.name} en República Dominicana. Estadísticas de máximos, mínimos y variaciones semanales.`}
        />
        <div className="min-h-screen bg-background flex flex-col justify-between">
          <div>
            <Header />
            <main className="pt-24 pb-16">
              <section className="container mx-auto px-4">
                {/* Back button */}
                <Button 
                  variant="ghost" 
                  onClick={() => setSearchParams({})} 
                  className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" /> Volver a Combustibles
                </Button>

                {/* Fuel Header Card */}
                <Card className="border border-border/80 shadow-md mb-8">
                  <CardHeader className="bg-muted/10 pb-6 flex flex-row items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 rounded-xl bg-background border shadow-xs">
                        {cardInfo.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">Combustible</Badge>
                          <span className="text-xs text-muted-foreground">República Dominicana</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-display font-bold mt-1">{cardInfo.name}</h2>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase font-bold">Precio Actual</p>
                      <p className="text-3xl font-extrabold text-primary mt-0.5">{formatCurrency(cardInfo.price)}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{getWeekRangeLabel(latest.effective_date)}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                      {cardInfo.desc}
                    </p>
                  </CardContent>
                </Card>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card className="border shadow-xs text-center p-5">
                    <TrendingUp className="h-6 w-6 text-rose-500 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Precio Máximo Registrado</p>
                    <p className="text-xl font-bold text-foreground mt-1">{formatCurrency(maxPrice)}</p>
                  </Card>
                  <Card className="border shadow-xs text-center p-5">
                    <TrendingDown className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Precio Mínimo Registrado</p>
                    <p className="text-xl font-bold text-foreground mt-1">{formatCurrency(minPrice)}</p>
                  </Card>
                  <Card className="border shadow-xs text-center p-5">
                    <DollarSign className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Promedio Histórico</p>
                    <p className="text-xl font-bold text-foreground mt-1">{formatCurrency(avgPrice)}</p>
                  </Card>
                </div>

                {/* Dedicated Table */}
                <Card className="border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <History className="h-5 w-5 text-primary" />
                      <span>Histórico Semanal para {cardInfo.name}</span>
                    </CardTitle>
                    <CardDescription>
                      Desglose de precios por galón registrados en las últimas semanas.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-xl overflow-hidden bg-background">
                      <Table>
                        <TableHeader className="bg-muted/40">
                          <TableRow>
                            <TableHead className="font-bold">Semana Vigente</TableHead>
                            <TableHead className="font-bold text-right">Precio por Galón</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {historyPrices.length > 0 ? (
                            historyPrices.map((row, index) => {
                              const dateObj = new Date(row.date + "T12:00:00");
                              const nextDateObj = addDays(dateObj, 6);
                              return (
                                <TableRow key={index} className="hover:bg-muted/10">
                                  <TableCell className="font-semibold text-xs py-3.5">
                                    <div className="flex items-center gap-1.5">
                                      <Calendar className="h-3.5 w-3.5 text-primary" />
                                      <span>{format(dateObj, "dd/MM/yyyy")} al {format(nextDateObj, "dd/MM/yyyy")}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right font-extrabold text-foreground text-sm">
                                    {formatCurrency(row.price)}
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          ) : (
                            <TableRow>
                              <TableCell colSpan={2} className="text-center py-12 text-muted-foreground">
                                No hay precios históricos cargados para este combustible.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </main>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SEOHead
        title="Precios de los Combustibles en RD | Histórico Semanal"
        description="Consulta oficial e histórica de precios de gasolina premium, regular, gasoil óptimo, regular, GLP y GNV en República Dominicana."
        keywords="precios gasolina rd, combustible republica dominicana, gasolina premium precio, glp precio hoy, micm combustibles"
      />
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <div>
          <Header />

          <main className="pt-24 pb-16">
            {/* Hero */}
            <section className="container mx-auto px-4 text-center mb-8 relative overflow-hidden">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 py-1 px-3">
                <Sparkles className="h-3.5 w-3.5 mr-1" /> Ministerio de Industria, Comercio y MiPymes (MICM)
              </Badge>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-3">
                Precios de <span className="text-primary italic">Combustibles</span>
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-base">
                Consulta los precios oficiales vigentes. <strong>Haz clic en cualquier combustible</strong> para analizar su histórico detallado.
              </p>
            </section>

            {/* Current Rates Section */}
            <section className="container mx-auto px-4 mb-12">
              <Card className="border border-border/80 shadow-md">
                <CardHeader className="bg-muted/15 border-b pb-4 flex flex-row items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <span>Precios Oficiales de esta Semana</span>
                    </CardTitle>
                    <CardDescription className="text-sm font-semibold text-primary/80 mt-1">
                      {getWeekRangeLabel(latest.effective_date)}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refetch()} 
                    disabled={isFetching}
                    className="gap-1.5 h-9"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
                    Actualizar
                  </Button>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {fuelCards.map((card) => (
                      <div 
                        key={card.key} 
                        onClick={() => setSearchParams({ type: card.key })}
                        className={`rounded-xl border border-border/80 border-l-4 ${card.color} ${card.bg} p-5 flex flex-col justify-between hover:shadow-md hover:border-primary/40 cursor-pointer transition-all active:scale-[0.98] group`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{card.name}</h4>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{card.desc}</p>
                          </div>
                          <div className="p-2 rounded-lg bg-background border shadow-xs group-hover:border-primary/30 transition-colors">
                            {card.icon}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
                          <span className="text-[9px] text-primary/80 font-bold bg-primary/10 px-1.5 py-0.5 rounded group-hover:bg-primary group-hover:text-primary-foreground transition-colors">Ver histórico →</span>
                          <span className="text-xl font-extrabold text-foreground">{formatCurrency(card.price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Historical Queries Section */}
            <section className="container mx-auto px-4">
              <Card className="border border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    <span>Registro Histórico General</span>
                  </CardTitle>
                  <CardDescription>
                    Busca semanas anteriores o filtra la tabla para rastrear la evolución general.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Filters Area */}
                  <div className="bg-muted/30 p-5 border rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="date-filter" className="text-xs font-semibold text-muted-foreground">
                        Buscar Fecha Vigencia (Sábado)
                      </Label>
                      <Input
                        id="date-filter"
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="bg-background"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="fuel-filter" className="text-xs font-semibold text-muted-foreground">
                        Combustible Particular
                      </Label>
                      <select
                        id="fuel-filter"
                        value={selectedFuelType}
                        onChange={(e) => setSelectedFuelType(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="all">Ver Todos</option>
                        {fuelCards.map((f) => (
                          <option key={f.key} value={f.key}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {dateFilter || selectedFuelType !== "all" ? (
                    <div className="flex justify-end -mt-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleClearFilters} 
                        className="text-destructive hover:bg-destructive/10 gap-1.5 h-8 text-xs"
                      >
                        <X className="h-4 w-4" /> Limpiar filtros
                      </Button>
                    </div>
                  ) : null}

                  {/* Logs Table */}
                  <div className="border rounded-xl overflow-hidden bg-background">
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow>
                          <TableHead className="font-bold">Semana Vigente</TableHead>
                          {selectedFuelType === "all" || selectedFuelType === "gasolina_premium" ? (
                            <TableHead className="font-bold text-right">G. Premium</TableHead>
                          ) : null}
                          {selectedFuelType === "all" || selectedFuelType === "gasolina_regular" ? (
                            <TableHead className="font-bold text-right">G. Regular</TableHead>
                          ) : null}
                          {selectedFuelType === "all" || selectedFuelType === "gasoil_optimo" ? (
                            <TableHead className="font-bold text-right">G. Óptimo</TableHead>
                          ) : null}
                          {selectedFuelType === "all" || selectedFuelType === "gasoil_regular" ? (
                            <TableHead className="font-bold text-right">G. Regular</TableHead>
                          ) : null}
                          {selectedFuelType === "all" || selectedFuelType === "glp" ? (
                            <TableHead className="font-bold text-right">GLP</TableHead>
                          ) : null}
                          {selectedFuelType === "all" || selectedFuelType === "gnv" ? (
                            <TableHead className="font-bold text-right">GNV</TableHead>
                          ) : null}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                              Cargando precios históricos...
                            </TableCell>
                          </TableRow>
                        ) : pricesList && pricesList.length > 0 ? (
                          pricesList.map((record) => {
                            const dateObj = new Date(record.effective_date + "T12:00:00");
                            const nextDateObj = addDays(dateObj, 6);
                            return (
                              <TableRow key={record.id} className="hover:bg-muted/10">
                                <TableCell className="font-semibold text-xs py-3.5">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5 text-primary" />
                                    <span>{format(dateObj, "dd/MM/yyyy")} al {format(nextDateObj, "dd/MM/yyyy")}</span>
                                  </div>
                                </TableCell>

                                {(selectedFuelType === "all" || selectedFuelType === "gasolina_premium") && (
                                  <TableCell className="text-right font-medium text-xs">
                                    {formatCurrency(Number(record.gasolina_premium))}
                                  </TableCell>
                                )}

                                {(selectedFuelType === "all" || selectedFuelType === "gasolina_regular") && (
                                  <TableCell className="text-right font-medium text-xs">
                                    {formatCurrency(Number(record.gasolina_regular))}
                                  </TableCell>
                                )}

                                {(selectedFuelType === "all" || selectedFuelType === "gasoil_optimo") && (
                                  <TableCell className="text-right font-medium text-xs">
                                    {formatCurrency(Number(record.gasoil_optimo))}
                                  </TableCell>
                                )}

                                {(selectedFuelType === "all" || selectedFuelType === "gasoil_regular") && (
                                  <TableCell className="text-right font-medium text-xs">
                                    {formatCurrency(Number(record.gasoil_regular))}
                                  </TableCell>
                                )}

                                {(selectedFuelType === "all" || selectedFuelType === "glp") && (
                                  <TableCell className="text-right font-medium text-xs">
                                    {formatCurrency(Number(record.glp))}
                                  </TableCell>
                                )}

                                {(selectedFuelType === "all" || selectedFuelType === "gnv") && (
                                  <TableCell className="text-right font-medium text-xs">
                                    {formatCurrency(Number(record.gnv))}
                                  </TableCell>
                                )}
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                              <Search className="h-10 w-10 mx-auto mb-3 opacity-30 text-muted-foreground" />
                              <h5 className="font-bold text-foreground">No se encontraron precios</h5>
                              <p className="text-xs mt-1">Intenta cambiar la fecha de búsqueda (ej. buscar sábados).</p>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Travel tips banner */}
            <section className="container mx-auto px-4 mt-8">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-4">
                <div className="p-3 bg-primary/15 rounded-xl text-primary">
                  <Info className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">Información para Conductores Turistas</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Los precios de los combustibles en República Dominicana cambian cada viernes a medianoche. La venta se realiza por Galón Americano. El GLP es altamente común para servicios de taxi y transporte público local.
                  </p>
                </div>
              </div>
            </section>
          </main>
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
}
