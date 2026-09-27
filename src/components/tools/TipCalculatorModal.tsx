import React, { useState } from "react";
import { Sparkles, DollarSign, Calculator, HelpCircle, Check, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const DOP_PER_USD = 60.0;

export function TipCalculatorModal() {
  const [billAmount, setBillAmount] = useState<string>("2500");
  const [currency, setCurrency] = useState<"DOP" | "USD">("DOP");
  const [includeLawTip, setIncludeLawTip] = useState<boolean>(true); // 10% legal
  const [voluntaryTipPercent, setVoluntaryTipPercent] = useState<number>(10); // 5%, 10%, 15%
  const [numPeople, setNumPeople] = useState<number>(1);

  const rawBill = parseFloat(billAmount) || 0;
  
  // Calculate converted values
  const billDop = currency === "DOP" ? rawBill : rawBill * DOP_PER_USD;
  const billUsd = currency === "USD" ? rawBill : rawBill / DOP_PER_USD;

  // Law tip (10% de ley)
  const lawTipDop = includeLawTip ? billDop * 0.10 : 0;
  const lawTipUsd = includeLawTip ? billUsd * 0.10 : 0;

  // Voluntary tip
  const voluntaryDop = billDop * (voluntaryTipPercent / 100);
  const voluntaryUsd = billUsd * (voluntaryTipPercent / 100);

  const totalDop = billDop + lawTipDop + voluntaryDop;
  const totalUsd = billUsd + lawTipUsd + voluntaryUsd;

  const perPersonDop = numPeople > 0 ? totalDop / numPeople : totalDop;
  const perPersonUsd = numPeople > 0 ? totalUsd / numPeople : totalUsd;

  return (
    <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xl max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-foreground">
              Calculadora de Propina & Conversión
            </h3>
            <p className="text-xs text-muted-foreground">Mejora 730 · Normativa de hostelería dominicana</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
          Tasa ref: 1 USD ≈ 60 DOP
        </Badge>
      </div>

      {/* Bill input */}
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Monto de la Cuenta
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                {currency === "DOP" ? "RD$" : "US$"}
              </span>
              <Input
                type="number"
                min="0"
                step="any"
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
                className="pl-12 h-11 text-lg font-bold bg-muted/30 rounded-xl"
                placeholder="0.00"
              />
            </div>
            <div className="flex bg-muted rounded-xl p-1 border border-border">
              <button
                type="button"
                onClick={() => setCurrency("DOP")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  currency === "DOP" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                DOP (RD$)
              </button>
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  currency === "USD" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                USD (US$)
              </button>
            </div>
          </div>
        </div>

        {/* 10% Ley Switch */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="law-tip"
              checked={includeLawTip}
              onChange={(e) => setIncludeLawTip(e.target.checked)}
              className="h-4 w-4 rounded text-primary focus:ring-primary/40 cursor-pointer"
            />
            <label htmlFor="law-tip" className="text-xs font-medium text-foreground cursor-pointer">
              ¿La cuenta ya incluye el <strong>10% legal de servicio</strong>?
            </label>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {includeLawTip ? `+${currency === "DOP" ? `RD$ ${lawTipDop.toLocaleString("es-DO")}` : `US$ ${lawTipUsd.toFixed(2)}`}` : "No incluido"}
          </span>
        </div>

        {/* Voluntary Tip options */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Propina Voluntaria para el Mozo / Camarero
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[0, 5, 10, 15].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setVoluntaryTipPercent(pct)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  voluntaryTipPercent === pct
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-muted/40 border-border text-foreground hover:bg-muted"
                }`}
              >
                {pct === 0 ? "0%" : `${pct}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Number of People */}
        <div className="flex items-center justify-between pt-2">
          <label className="text-xs font-medium text-muted-foreground">
            Dividir cuenta entre amigos:
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setNumPeople(Math.max(1, numPeople - 1))}
              className="w-7 h-7 rounded-lg bg-muted text-foreground flex items-center justify-center font-bold text-sm"
            >
              -
            </button>
            <span className="text-sm font-bold text-foreground w-6 text-center">{numPeople}</span>
            <button
              type="button"
              onClick={() => setNumPeople(numPeople + 1)}
              className="w-7 h-7 rounded-lg bg-muted text-foreground flex items-center justify-center font-bold text-sm"
            >
              +
            </button>
          </div>
        </div>

        {/* Results Card */}
        <div className="mt-4 p-4 rounded-2xl bg-primary/10 border border-primary/20 space-y-2.5">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-foreground/80">Propina Voluntaria Sugerida:</span>
            <span className="text-sm font-bold text-foreground">
              RD$ {Math.round(voluntaryDop).toLocaleString("es-DO")} (US$ {voluntaryUsd.toFixed(2)})
            </span>
          </div>

          <div className="flex justify-between items-baseline pt-2 border-t border-primary/20">
            <span className="text-sm font-bold text-foreground">Total Final a Pagar:</span>
            <div className="text-right">
              <span className="text-xl sm:text-2xl font-black text-primary block">
                RD$ {Math.round(totalDop).toLocaleString("es-DO")}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                aprox. US$ {totalUsd.toFixed(2)}
              </span>
            </div>
          </div>

          {numPeople > 1 && (
            <div className="flex justify-between items-baseline pt-2 border-t border-primary/20 text-xs font-medium text-foreground">
              <span>Por cada persona ({numPeople} pers.):</span>
              <span className="font-bold text-primary">
                RD$ {Math.round(perPersonDop).toLocaleString("es-DO")} (US$ {perPersonUsd.toFixed(2)})
              </span>
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 text-[11px] text-muted-foreground pt-1">
          <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
          <span>
            En República Dominicana, los restaurantes añaden por ley el 18% de ITBIS y el 10% de propina legal en la factura. La propina adicional en mesa (5% al 10%) es voluntaria y va directamente a la persona que te atendió.
          </span>
        </div>
      </div>
    </div>
  );
}
