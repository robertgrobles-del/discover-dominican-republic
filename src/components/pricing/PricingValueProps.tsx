import { PhoneCall, ShieldCheck, TrendingUp, Receipt, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function PricingValueProps() {
  return (
    <section className="container mx-auto px-4 lg:px-8 max-w-5xl py-12">
      <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 shadow-sm">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-3">
            ¿Por qué los negocios turísticos eligen Descubre RD?
          </h2>
          <p className="text-sm text-muted-foreground">
            A diferencia de OTAs internacionales que cobran entre 15% y 25% de comisión, aquí tú eres dueño directo de tus clientes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="space-y-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto sm:mx-0">
              <PhoneCall className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-foreground">Cero Comisiones por Reserva</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Los turistas hacen clic directamente a tu número de WhatsApp o formulario. No retenemos pagos ni cobramos cargos por cliente ganado.
            </p>
          </div>

          <div className="space-y-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto sm:mx-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-foreground">Sello Verificado MITUR</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Valida tu licencia oficial de turismo de República Dominicana para obtener la insignia oficial que genera máxima confianza ante extranjeros.
            </p>
          </div>

          <div className="space-y-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto sm:mx-0">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-foreground">Analítica Real de Leads</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Conoce exactamente cuántos visitantes llamaron a tu negocio, abrieron la ruta en GPS y consultaron tu carta o habitaciones cada mes.
            </p>
          </div>
        </div>

        {/* Payment Methods & Fiscal Assurance */}
        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">Facturación Fiscal Dominicana (NCF)</h4>
              <p className="text-xs text-muted-foreground">Comprobantes válidos para crédito fiscal (B01) y consumidor final autorizados por la DGII.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-primary" /> Pasarelas soportadas:
            </span>
            <Badge variant="outline" className="font-bold text-xs py-1 px-2.5 bg-background">
              🇩🇴 Azul (Banco Popular)
            </Badge>
            <Badge variant="outline" className="font-bold text-xs py-1 px-2.5 bg-background">
              🇩🇴 CardNet
            </Badge>
            <Badge variant="outline" className="font-bold text-xs py-1 px-2.5 bg-background">
              🌐 Stripe Billing (USD)
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
