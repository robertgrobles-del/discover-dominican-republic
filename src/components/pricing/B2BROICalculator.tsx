import React, { useState } from "react";
import { Calculator, TrendingUp, DollarSign, Users, MessageCircle, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export function B2BROICalculator() {
  const [businessCategory, setBusinessCategory] = useState<"hotel" | "restaurante" | "tour" | "experiencia">("hotel");
  const [ticketMedio, setTicketMedio] = useState<number>(120); // USD
  const [monthlyViews, setMonthlyViews] = useState<number>(2500);

  // Conversion modeling:
  // Ficha destacada en Descubre RD tiene aprox 2.5% CTR hacia WhatsApp/Reserva Directa
  const directLeadsEstimated = Math.round((monthlyViews * 0.025));
  // De los leads directos de WhatsApp/Llamada, cierran aprox el 20%
  const estimatedClients = Math.max(1, Math.round(directLeadsEstimated * 0.20));
  // Facturación bruta generada
  const estimatedGrossRevenue = estimatedClients * ticketMedio;
  // Ahorro en comisiones OTA extranjera (18% típica de Booking/Airbnb/Expedia)
  const otaCommissionsSaved = Math.round(estimatedGrossRevenue * 0.18);

  const categoryPresets = {
    hotel: { name: "Hotel / Resort / Villa", defaultTicket: 150, defaultViews: 3500 },
    restaurante: { name: "Restaurante / Bar / Gastronomía", defaultTicket: 45, defaultViews: 4000 },
    tour: { name: "Operador de Tours / Excursiones", defaultTicket: 85, defaultViews: 2800 },
    experiencia: { name: "Experiencia / Transporte / Renta", defaultTicket: 65, defaultViews: 2000 },
  };

  const handleCategoryChange = (cat: "hotel" | "restaurante" | "tour" | "experiencia") => {
    setBusinessCategory(cat);
    setTicketMedio(categoryPresets[cat].defaultTicket);
    setMonthlyViews(categoryPresets[cat].defaultViews);
  };

  return (
    <section className="container mx-auto px-4 lg:px-8 max-w-5xl py-12">
      <Card className="border-2 border-primary/30 rounded-3xl overflow-hidden bg-gradient-to-br from-card via-card to-primary/5 shadow-xl">
        <CardHeader className="p-6 sm:p-8 bg-muted/40 border-b border-border/80">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold px-3 py-1">
              <TrendingUp className="h-3.5 w-3.5 mr-1" /> Calculadora de Retorno de Inversión (ROI B2B)
            </Badge>
            <span className="text-xs text-muted-foreground font-medium">0% Comisiones por Reserva</span>
          </div>
          <CardTitle className="font-display text-2xl sm:text-3xl font-extrabold text-foreground mt-3">
            Calcula el impacto estimado de tu ficha en Descubre RD
          </CardTitle>
          <p className="text-sm text-muted-foreground max-w-2xl mt-1">
            Estima cuántos clientes directos y cuánto ahorro en comisiones de OTAs intermediarias puedes generar cada mes.
          </p>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 space-y-8">
          {/* Category selection */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Tipo de Negocio Turístico:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(Object.keys(categoryPresets) as Array<keyof typeof categoryPresets>).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left ${
                    businessCategory === cat
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-muted/40 text-foreground border-border hover:bg-muted"
                  }`}
                >
                  {categoryPresets[cat].name}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 bg-muted/30 p-4 rounded-2xl border border-border/60">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-muted-foreground">Ticket Promedio por Cliente (US$):</span>
                <span className="font-black text-primary text-base font-mono">US$ {ticketMedio}</span>
              </div>
              <input
                type="range"
                min={15}
                max={500}
                step={5}
                value={ticketMedio}
                onChange={(e) => setTicketMedio(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
                aria-label="Ticket Promedio por Cliente en dólares"
              />
              <div className="flex justify-between text-3xs text-muted-foreground font-mono">
                <span>US$ 15</span>
                <span>US$ 500</span>
              </div>
            </div>

            <div className="space-y-2 bg-muted/30 p-4 rounded-2xl border border-border/60">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-muted-foreground">Visitas Estimadas al Mes a tu Ficha:</span>
                <span className="font-black text-primary text-base font-mono">{monthlyViews.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={500}
                max={15000}
                step={250}
                value={monthlyViews}
                onChange={(e) => setMonthlyViews(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
                aria-label="Visitas mensuales estimadas"
              />
              <div className="flex justify-between text-3xs text-muted-foreground font-mono">
                <span>500 visitas</span>
                <span>15,000 visitas</span>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 text-center space-y-1">
              <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-2">
                <MessageCircle className="h-4 w-4" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">Contactos Directos / WhatsApp</p>
              <p className="text-2xl sm:text-3xl font-black text-primary font-mono">{directLeadsEstimated}</p>
              <p className="text-3xs text-muted-foreground">leads mensuales estimados</p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
              <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <Users className="h-4 w-4" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">Clientes Cerrados Directos</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{estimatedClients}</p>
              <p className="text-3xs text-muted-foreground">≈ US$ {estimatedGrossRevenue.toLocaleString()} facturados</p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
              <div className="h-8 w-8 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2">
                <DollarSign className="h-4 w-4" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">Ahorro en Comisiones OTAs</p>
              <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">US$ {otaCommissionsSaved.toLocaleString()}</p>
              <p className="text-3xs text-muted-foreground">18% no pagado a intermediarios</p>
            </div>
          </div>

          {/* CTA Footer */}
          <div className="p-4 rounded-2xl bg-muted/60 border border-border flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" /> ¡Comienza hoy con 30 días de prueba sin compromiso!
              </p>
              <p className="text-xs text-muted-foreground">
                Elige el plan que mejor se adapte a tu establecimiento y empieza a recibir turistas.
              </p>
            </div>
            <Button asChild className="font-bold rounded-xl shadow-md">
              <a href="#planes-precios" className="flex items-center gap-2">
                <span>Ver Planes & Precios</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
