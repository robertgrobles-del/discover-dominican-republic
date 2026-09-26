import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sparkles, DollarSign, Trophy, Plus, Edit2, 
  Trash2, Save, RefreshCw, CheckCircle, AlertCircle, Building2, Calendar
} from "lucide-react";
import { toast } from "sonner";
import { DEFAULT_LOTTERY_RESULTS, LotteryResult } from "@/pages/Loterias";
import { DOMINICAN_BANKS_RATES, BankRate } from "@/components/currency/CurrencyExchangeSection";

export function AdminFinanceLotteryManager() {
  // --- LOTTERY STATE ---
  const [lotteryList, setLotteryList] = useState<LotteryResult[]>([]);
  const [newCompany, setNewCompany] = useState<LotteryResult["company"]>("leidsa");
  const [newCompanyName, setNewCompanyName] = useState("LEIDSA");
  const [newDrawName, setNewDrawName] = useState("");
  const [newDrawTime, setNewDrawTime] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newWinningNumbers, setNewWinningNumbers] = useState("");
  const [newJackpot, setNewJackpot] = useState("");
  const [editingLotteryId, setEditingLotteryId] = useState<string | null>(null);

  // --- CURRENCY RATES STATE ---
  const [bankRates, setBankRates] = useState<BankRate[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>("bcrd");
  const [usdBuy, setUsdBuy] = useState<number>(60.35);
  const [usdSell, setUsdSell] = useState<number>(60.75);
  const [eurBuy, setEurBuy] = useState<number>(65.40);
  const [eurSell, setEurSell] = useState<number>(66.15);
  const [cadBuy, setCadBuy] = useState<number>(44.10);
  const [cadSell, setCadSell] = useState<number>(44.85);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const storedLottery = localStorage.getItem("descubre_rd_lottery_results");
      if (storedLottery) {
        setLotteryList(JSON.parse(storedLottery));
      } else {
        setLotteryList(DEFAULT_LOTTERY_RESULTS);
      }

      const storedRates = localStorage.getItem("descubre_rd_bank_rates");
      if (storedRates) {
        setBankRates(JSON.parse(storedRates));
      } else {
        setBankRates(DOMINICAN_BANKS_RATES);
      }
    } catch {
      setLotteryList(DEFAULT_LOTTERY_RESULTS);
      setBankRates(DOMINICAN_BANKS_RATES);
    }
  }, []);

  // Sync selected bank inputs
  useEffect(() => {
    const currentBank = bankRates.find((b) => b.id === selectedBankId);
    if (currentBank) {
      setUsdBuy(currentBank.currencies.USD.buy);
      setUsdSell(currentBank.currencies.USD.sell);
      setEurBuy(currentBank.currencies.EUR.buy);
      setEurSell(currentBank.currencies.EUR.sell);
      setCadBuy(currentBank.currencies.CAD.buy);
      setCadSell(currentBank.currencies.CAD.sell);
    }
  }, [selectedBankId, bankRates]);

  // Handle Save Lottery Result
  const handleSaveLottery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDrawName.trim()) {
      toast.error("Ingresa el nombre del sorteo.");
      return;
    }

    const numbersArray = newWinningNumbers
      .split(/[\s,-]+/)
      .map((n) => n.trim().padStart(2, "0"))
      .filter((n) => n.length === 2 && !isNaN(Number(n)));

    if (numbersArray.length === 0) {
      toast.error("Ingresa al menos un número ganador válido (2 dígitos).");
      return;
    }

    let updatedList: LotteryResult[];

    if (editingLotteryId) {
      updatedList = lotteryList.map((item) => {
        if (item.id === editingLotteryId) {
          return {
            ...item,
            company: newCompany,
            companyName: newCompanyName,
            drawName: newDrawName,
            drawTime: newDrawTime || "Hoy",
            date: newDate,
            winningNumbers: numbersArray,
            jackpotOrExtra: newJackpot || undefined,
          };
        }
        return item;
      });
      toast.success("¡Resultado de sorteo actualizado exitosamente!");
    } else {
      const newItem: LotteryResult = {
        id: `lot-${Date.now()}`,
        company: newCompany,
        companyName: newCompanyName,
        drawName: newDrawName,
        drawTime: newDrawTime || "Hoy",
        date: newDate,
        winningNumbers: numbersArray,
        jackpotOrExtra: newJackpot || undefined,
        colorScheme: "from-primary/20 to-card border-primary/30",
        logo: "🎰",
      };
      updatedList = [newItem, ...lotteryList];
      toast.success("¡Nuevo resultado de lotería publicado!");
    }

    setLotteryList(updatedList);
    localStorage.setItem("descubre_rd_lottery_results", JSON.stringify(updatedList));

    // Reset Form
    setEditingLotteryId(null);
    setNewDrawName("");
    setNewDrawTime("");
    setNewWinningNumbers("");
    setNewJackpot("");
  };

  const handleEditLottery = (item: LotteryResult) => {
    setEditingLotteryId(item.id);
    setNewCompany(item.company);
    setNewCompanyName(item.companyName);
    setNewDrawName(item.drawName);
    setNewDrawTime(item.drawTime);
    setNewDate(item.date);
    setNewWinningNumbers(item.winningNumbers.join(" - "));
    setNewJackpot(item.jackpotOrExtra || "");
  };

  const handleDeleteLottery = (id: string) => {
    const updated = lotteryList.filter((item) => item.id !== id);
    setLotteryList(updated);
    localStorage.setItem("descubre_rd_lottery_results", JSON.stringify(updated));
    toast.info("Resultado de lotería eliminado.");
  };

  // Handle Save Bank Rate
  const handleSaveBankRate = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = bankRates.map((bank) => {
      if (bank.id === selectedBankId) {
        return {
          ...bank,
          currencies: {
            ...bank.currencies,
            USD: { buy: Number(usdBuy), sell: Number(usdSell), change: 0.05 },
            EUR: { buy: Number(eurBuy), sell: Number(eurSell), change: -0.02 },
            CAD: { buy: Number(cadBuy), sell: Number(cadSell), change: 0.01 },
          },
          lastUpdated: `Hoy, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Admin Actualizado)`,
        };
      }
      return bank;
    });

    setBankRates(updated);
    localStorage.setItem("descubre_rd_bank_rates", JSON.stringify(updated));
    toast.success(`Tasas de cambio actualizadas para ${bankRates.find(b => b.id === selectedBankId)?.bankName}!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Administrador de Loterías y Tasas de Cambio
          </h2>
          <p className="text-sm text-muted-foreground">
            Ingresa y actualiza manualmente los números ganadores diarios y las tasas bancarias en tiempo real.
          </p>
        </div>
      </div>

      <Tabs defaultValue="lottery" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md bg-muted/60 p-1 rounded-2xl">
          <TabsTrigger value="lottery" className="rounded-xl gap-2 font-bold">
            <Trophy className="h-4 w-4 text-amber-500" />
            Loterías Dominicanas
          </TabsTrigger>
          <TabsTrigger value="currency" className="rounded-xl gap-2 font-bold">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            Tasas de Cambio Bancarias
          </TabsTrigger>
        </TabsList>

        {/* --- LOTTERY TAB --- */}
        <TabsContent value="lottery" className="space-y-6 mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Form */}
            <Card className="lg:col-span-1 border-border shadow-md rounded-3xl bg-card">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  {editingLotteryId ? "Editar Resultado de Sorteo" : "Publicar Nuevo Sorteo"}
                </CardTitle>
                <CardDescription className="text-xs">
                  Completa los datos del sorteo oficial para actualizar la web.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-2">
                <form onSubmit={handleSaveLottery} className="space-y-4 text-xs sm:text-sm">
                  <div className="space-y-1.5">
                    <Label>Empresa de Lotería</Label>
                    <Select
                      value={newCompany}
                      onValueChange={(val: any) => {
                        setNewCompany(val);
                        const names: Record<string, string> = {
                          leidsa: "LEIDSA",
                          nacional: "Lotería Nacional",
                          loteka: "LOTEKA",
                          real: "Lotería Real",
                          primera: "La Primera",
                          suerte: "La Suerte Dominicana",
                          newyork: "New York",
                          florida: "Florida",
                          king: "King Lottery"
                        };
                        setNewCompanyName(names[val] || val);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="leidsa">LEIDSA</SelectItem>
                        <SelectItem value="nacional">Lotería Nacional</SelectItem>
                        <SelectItem value="loteka">LOTEKA</SelectItem>
                        <SelectItem value="real">Lotería Real</SelectItem>
                        <SelectItem value="primera">La Primera</SelectItem>
                        <SelectItem value="suerte">La Suerte Dominicana</SelectItem>
                        <SelectItem value="newyork">New York</SelectItem>
                        <SelectItem value="florida">Florida</SelectItem>
                        <SelectItem value="king">King Lottery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="drawName">Nombre del Sorteo</Label>
                    <Input
                      id="drawName"
                      placeholder="Ej: Quiniela y Palé LEIDSA, Gana Más..."
                      value={newDrawName}
                      onChange={(e) => setNewDrawName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="drawTime">Hora del Sorteo</Label>
                      <Input
                        id="drawTime"
                        placeholder="Ej: 8:55 PM"
                        value={newDrawTime}
                        onChange={(e) => setNewDrawTime(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="date">Fecha</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="winningNumbers">Números Ganadores (Bolos)</Label>
                    <Input
                      id="winningNumbers"
                      placeholder="Ej: 42 - 18 - 77 (separados por espacio o guión)"
                      value={newWinningNumbers}
                      onChange={(e) => setNewWinningNumbers(e.target.value)}
                      className="font-mono font-bold tracking-wider"
                      required
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Introduce los bolos de 2 dígitos. Los 3 primeros recibirán medallas (1º, 2º, 3º).
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="jackpot">Bote o Mensaje Extra (Opcional)</Label>
                    <Input
                      id="jackpot"
                      placeholder="Ej: Acumulado RD$ 420 Millones"
                      value={newJackpot}
                      onChange={(e) => setNewJackpot(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button type="submit" className="flex-1 font-bold">
                      <Save className="h-4 w-4 mr-2" />
                      {editingLotteryId ? "Actualizar Sorteo" : "Publicar Sorteo"}
                    </Button>
                    {editingLotteryId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingLotteryId(null);
                          setNewDrawName("");
                          setNewWinningNumbers("");
                          setNewJackpot("");
                        }}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* List */}
            <Card className="lg:col-span-2 border-border shadow-md rounded-3xl bg-card">
              <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Sorteos Registrados ({lotteryList.length})</CardTitle>
                  <CardDescription className="text-xs">
                    Listado activo de sorteos visibles en la página principal y páginas individuales.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="gap-1 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  <CheckCircle className="h-3 w-3" />
                  Sincronizado
                </Badge>
              </CardHeader>
              <CardContent className="p-5 pt-2">
                <div className="max-h-[500px] overflow-y-auto space-y-3 pr-2">
                  {lotteryList.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-muted/40 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-muted/70 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-bold text-[10px] uppercase">
                            {item.companyName}
                          </Badge>
                          <span className="font-bold text-sm text-foreground">{item.drawName}</span>
                          <span className="text-xs text-muted-foreground font-mono">({item.drawTime})</span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          {item.winningNumbers.map((num, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-full bg-primary/20 text-primary font-mono font-bold text-xs"
                            >
                              {num}
                            </span>
                          ))}
                          {item.jackpotOrExtra && (
                            <span className="text-[11px] text-amber-500 font-medium ml-2">
                              ⭐ {item.jackpotOrExtra}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => handleEditLottery(item)}
                          title="Editar resultado"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteLottery(item.id)}
                          title="Eliminar resultado"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- CURRENCY TAB --- */}
        <TabsContent value="currency" className="space-y-6 mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Form */}
            <Card className="lg:col-span-1 border-border shadow-md rounded-3xl bg-card">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-emerald-500" />
                  Editar Tasas Bancarias
                </CardTitle>
                <CardDescription className="text-xs">
                  Modifica las tasas de compra y venta en pesos dominicanos (DOP).
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-2">
                <form onSubmit={handleSaveBankRate} className="space-y-4 text-xs sm:text-sm">
                  <div className="space-y-1.5">
                    <Label>Seleccionar Entidad Bancaria</Label>
                    <Select
                      value={selectedBankId}
                      onValueChange={(val) => setSelectedBankId(val)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona banco" />
                      </SelectTrigger>
                      <SelectContent>
                        {bankRates.map((bank) => (
                          <SelectItem key={bank.id} value={bank.id}>
                            {bank.shortName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* USD */}
                  <div className="p-3 rounded-2xl bg-muted/40 border border-border space-y-2">
                    <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                      🇺🇸 Dólar Estadounidense (USD)
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="usdBuy" className="text-[11px] text-muted-foreground">Compra (DOP)</Label>
                        <Input
                          id="usdBuy"
                          type="number"
                          step="0.01"
                          value={usdBuy}
                          onChange={(e) => setUsdBuy(parseFloat(e.target.value) || 0)}
                          className="font-mono font-bold"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="usdSell" className="text-[11px] text-muted-foreground">Venta (DOP)</Label>
                        <Input
                          id="usdSell"
                          type="number"
                          step="0.01"
                          value={usdSell}
                          onChange={(e) => setUsdSell(parseFloat(e.target.value) || 0)}
                          className="font-mono font-bold"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* EUR */}
                  <div className="p-3 rounded-2xl bg-muted/40 border border-border space-y-2">
                    <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                      🇪🇺 Euro (EUR)
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="eurBuy" className="text-[11px] text-muted-foreground">Compra (DOP)</Label>
                        <Input
                          id="eurBuy"
                          type="number"
                          step="0.01"
                          value={eurBuy}
                          onChange={(e) => setEurBuy(parseFloat(e.target.value) || 0)}
                          className="font-mono font-bold"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="eurSell" className="text-[11px] text-muted-foreground">Venta (DOP)</Label>
                        <Input
                          id="eurSell"
                          type="number"
                          step="0.01"
                          value={eurSell}
                          onChange={(e) => setEurSell(parseFloat(e.target.value) || 0)}
                          className="font-mono font-bold"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* CAD */}
                  <div className="p-3 rounded-2xl bg-muted/40 border border-border space-y-2">
                    <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                      🇨🇦 Dólar Canadiense (CAD)
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="cadBuy" className="text-[11px] text-muted-foreground">Compra (DOP)</Label>
                        <Input
                          id="cadBuy"
                          type="number"
                          step="0.01"
                          value={cadBuy}
                          onChange={(e) => setCadBuy(parseFloat(e.target.value) || 0)}
                          className="font-mono font-bold"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cadSell" className="text-[11px] text-muted-foreground">Venta (DOP)</Label>
                        <Input
                          id="cadSell"
                          type="number"
                          step="0.01"
                          value={cadSell}
                          onChange={(e) => setCadSell(parseFloat(e.target.value) || 0)}
                          className="font-mono font-bold"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full font-bold">
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Tasas Bancarias
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Live Table */}
            <Card className="lg:col-span-2 border-border shadow-md rounded-3xl bg-card">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-lg font-bold">Resumen de Tasas Bancarias Vigentes</CardTitle>
                <CardDescription className="text-xs">
                  Comparativa de tipos de cambio configurados en el sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-2">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                      <tr>
                        <th className="p-3">Banco / Entidad</th>
                        <th className="p-3 text-center">USD Compra</th>
                        <th className="p-3 text-center">USD Venta</th>
                        <th className="p-3 text-center">EUR Compra</th>
                        <th className="p-3 text-center">EUR Venta</th>
                        <th className="p-3">Última Actualización</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {bankRates.map((bank) => (
                        <tr key={bank.id} className="hover:bg-muted/30">
                          <td className="p-3 font-bold text-foreground flex items-center gap-2">
                            <span>{bank.logo}</span>
                            <span>{bank.shortName}</span>
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-emerald-500">
                            RD$ {bank.currencies.USD.buy.toFixed(2)}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-foreground">
                            RD$ {bank.currencies.USD.sell.toFixed(2)}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-blue-500">
                            RD$ {bank.currencies.EUR.buy.toFixed(2)}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-foreground">
                            RD$ {bank.currencies.EUR.sell.toFixed(2)}
                          </td>
                          <td className="p-3 text-muted-foreground text-[11px]">
                            {bank.lastUpdated}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
