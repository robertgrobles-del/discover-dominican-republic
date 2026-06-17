import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { CheckCircle, ShieldCheck, ArrowLeft, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function ReservaDirecta() {
  const handlePayment = () => {
    toast.success("¡Reserva procesada exitosamente! Recibirás los detalles en tu correo electrónico.");
  };

  return (
    <PageTransition>
      <SEOHead
        title="Reserva Directa | Descubre RD"
        description="Completa tu reserva de manera segura."
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <Link to={-1 as any} className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Ofertas
            </Link>

            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold font-display text-foreground">Confirmación de Reserva</h1>
                <p className="text-muted-foreground mt-2">Estás a un paso de asegurar tu aventura en la República Dominicana.</p>
              </div>

              <div className="bg-muted/30 p-4 rounded-xl space-y-3">
                <h3 className="font-bold text-foreground">Resumen de la Orden</h3>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tarifa de Oferta Flash</span>
                  <span>Aplicada</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Impuestos y tasas</span>
                  <span>Calculados al pagar</span>
                </div>
                <div className="pt-2 mt-2 border-t border-border flex justify-between font-bold text-foreground">
                  <span>Total Estimado</span>
                  <span className="text-primary">Continuar para ver monto final</span>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <Button onClick={handlePayment} className="w-full gap-2" size="lg">
                  <CreditCard className="h-5 w-5" /> Proceder al Pago Seguro
                </Button>
                <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                  <CheckCircle className="h-3 w-3 text-emerald-500" /> Transacción encriptada con cifrado SSL
                </p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
}