import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, History as HistoryIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ExchangeRate } from "@/data/monedaData";

interface CurrencyDetailHistoryViewProps {
  activeCurrency: string;
  coinInfo: {
    buy_rate: number;
    sell_rate: number;
    name: string;
    symbol: string;
    flag: string;
  };
  historicalRates: ExchangeRate[];
  onBack: () => void;
}

export function CurrencyDetailHistoryView({
  activeCurrency,
  coinInfo,
  historicalRates,
  onBack
}: CurrencyDetailHistoryViewProps) {
  const historyList = (historicalRates || []).filter(h => h.currency_code === activeCurrency);

  const buyRates = historyList.map(h => Number(h.buy_rate));
  const sellRates = historyList.map(h => Number(h.sell_rate));
  const maxBuy = buyRates.length > 0 ? Math.max(...buyRates) : coinInfo.buy_rate;
  const minBuy = buyRates.length > 0 ? Math.min(...buyRates) : coinInfo.buy_rate;
  const maxSell = sellRates.length > 0 ? Math.max(...sellRates) : coinInfo.sell_rate;
  const minSell = sellRates.length > 0 ? Math.min(...sellRates) : coinInfo.sell_rate;

  return (
    <section className="container mx-auto px-4 max-w-4xl pt-24 pb-16">
      {/* Back button */}
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a Conversor
      </Button>

      {/* Currency Header Card */}
      <Card className="border border-border shadow-md mb-8">
        <CardHeader className="bg-muted/10 pb-6 flex flex-row items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{coinInfo.flag}</span>
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary border-primary/20">{activeCurrency}</Badge>
                <span className="text-xs text-muted-foreground">Divisa</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold mt-1">{coinInfo.name}</h2>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-background border rounded-lg px-3 py-2 text-center shadow-xs">
              <span className="block text-[10px] uppercase text-muted-foreground font-bold">Compra</span>
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">RD$ {coinInfo.buy_rate.toFixed(2)}</span>
            </div>
            <div className="bg-background border rounded-lg px-3 py-2 text-center shadow-xs">
              <span className="block text-[10px] uppercase text-muted-foreground font-bold">Venta</span>
              <span className="text-xl font-extrabold text-primary">RD$ {coinInfo.sell_rate.toFixed(2)}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="border shadow-xs p-5">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span>Estadísticas de Compra (Buy)</span>
          </CardTitle>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Máximo</p>
              <p className="text-lg font-bold text-foreground mt-0.5">RD$ {maxBuy.toFixed(4)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Mínimo</p>
              <p className="text-lg font-bold text-foreground mt-0.5">RD$ {minBuy.toFixed(4)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="border shadow-xs p-5">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>Estadísticas de Venta (Sell)</span>
          </CardTitle>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Máximo</p>
              <p className="text-lg font-bold text-foreground mt-0.5">RD$ {maxSell.toFixed(4)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Mínimo</p>
              <p className="text-lg font-bold text-foreground mt-0.5">RD$ {minSell.toFixed(4)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Dedicated Table */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <HistoryIcon className="h-5 w-5 text-primary" />
            <span>Histórico de Tasas para {activeCurrency}</span>
          </CardTitle>
          <CardDescription>
            Historial detallado de tasas de cambio de compra y venta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-xl overflow-hidden bg-background">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-bold">Fecha</TableHead>
                  <TableHead className="font-bold text-right">Compra (Buy)</TableHead>
                  <TableHead className="font-bold text-right">Venta (Sell)</TableHead>
                  <TableHead className="font-bold text-right">Diferencial</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyList.length > 0 ? (
                  historyList.map((row) => {
                    const dateObj = new Date(row.rate_date + "T12:00:00");
                    const spread = Math.abs(row.sell_rate - row.buy_rate);
                    return (
                      <TableRow key={row.id} className="hover:bg-muted/10">
                        <TableCell className="font-medium">
                          {format(dateObj, "dd 'de' MMMM yyyy", { locale: es })}
                        </TableCell>
                        <TableCell className="text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                          RD$ {Number(row.buy_rate).toFixed(4)}
                        </TableCell>
                        <TableCell className="text-right text-primary font-semibold">
                          RD$ {Number(row.sell_rate).toFixed(4)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-xs">
                          RD$ {spread.toFixed(4)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      No se encontraron registros de tasas de cambio históricas para {activeCurrency}.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
