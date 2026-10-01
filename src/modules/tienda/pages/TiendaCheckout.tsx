import { useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { trackEvent } from "@/hooks/useAnalytics";
import { isValidEmail } from "@/lib/security";
import { DOP_PER_USD, FREE_SHIPPING_FROM, SHIPPING_FLAT, createOrder, formatDop } from "../api";

export default function TiendaCheckout() {
  const { user } = useAuth();
  const { items, clearCart } = useCart();
  const qc = useQueryClient();
  const [f, setF] = useState({ name: "", email: user?.email || "", phone: "", address: "", city: "", card: "" });
  const [busy, setBusy] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // El carrito guarda precios en US$ (ver CartDrawer); aquí se muestran en RD$.
  const subtotal = Math.round(items.reduce((n, i) => n + i.price * i.quantity, 0) * DOP_PER_USD);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FLAT;
  const total = subtotal + shipping;

  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer">("card");

  const pay = async () => {
    if (items.length === 0) return toast.error("Tu carrito está vacío.");
    if (f.name.trim().length < 3) return toast.error("Escribe tu nombre completo.");
    if (!isValidEmail(f.email)) return toast.error("Ingresa un correo válido.");
    if (f.address.trim().length < 6 || f.city.trim().length < 2) return toast.error("Completa la dirección de entrega.");
    if (!f.phone.trim() || f.phone.trim().length < 7) return toast.error("Ingresa un número de contacto válido.");

    trackEvent("checkout_start", { method: paymentMethod, items: items.length, total });
    setBusy(true);
    try {
      const id = await createOrder({
        user_id: user?.id ?? null,
        customer_name: f.name.trim(),
        customer_email: f.email.trim(),
        phone: f.phone.trim(),
        address: f.address.trim(),
        city: f.city.trim(),
        subtotal,
        shipping,
        total,
        items: items.map((i) => ({
          product_id: i.product_id,
          name: i.product_name,
          qty: i.quantity,
          unit_price: Math.round(i.price * DOP_PER_USD)
        })),
        status: paymentMethod === "transfer" ? "pending" : "paid"
      });
      await clearCart();
      qc.invalidateQueries({ queryKey: ["store"] });
      setOrderId(id);
      trackEvent("purchase", { method: paymentMethod, items: items.length, total });
    } catch (e: any) {
      toast.error(e.message || "No se pudo procesar el pedido");
    } finally {
      setBusy(false);
    }
  };

  if (orderId) {
    return (
      <PageTransition>
        <SEOHead title="Pedido confirmado — Tienda Descubre RD" description="Tu pedido fue confirmado." />
        <Header variant="white" />
        <main className="pt-32 pb-20 container mx-auto px-4 max-w-xl text-center space-y-4">
          <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto" />
          <h1 className="font-display text-3xl font-bold">¡Gracias por tu compra!</h1>
          <p className="text-muted-foreground">Te enviaremos los detalles y confirmación de entrega por correo a <strong>{f.email}</strong>.</p>
          <p className="rounded-lg bg-muted p-3 font-mono text-sm">Número de Orden: {orderId}</p>
          {paymentMethod === "transfer" && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-left text-xs text-amber-900 dark:text-amber-300 space-y-1">
              <p className="font-semibold text-sm">Instrucciones para Transferencia Bancaria:</p>
              <p>Banco: Banco Popular Dominicano / Banreservas</p>
              <p>Cuenta Corriente: 7890-12345-6 (Descubre RD S.R.L.)</p>
              <p>Envía tu comprobante con el número de orden por WhatsApp para despacho inmediato.</p>
            </div>
          )}
          <Button asChild><Link to="/tienda">Seguir comprando</Link></Button>
        </main>
        <Footer />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SEOHead title="Checkout Seguro — Tienda Descubre RD" description="Completa tu compra de manera segura en la tienda oficial de Descubre RD." />
      <Header variant="white" />
      <main className="pt-28 pb-16 container mx-auto px-4">
        <h1 className="font-display text-3xl font-bold mb-6">Finalizar Compra</h1>
        {!user ? (
          <Card variant="commercial"><CardContent className="py-12 text-center space-y-3"><p>Inicia sesión para ver tu carrito y completar la compra con tus sellos y beneficios.</p><Button asChild><Link to="/login">Iniciar sesión</Link></Button></CardContent></Card>
        ) : items.length === 0 ? (
          <Card variant="commercial"><CardContent className="py-12 text-center space-y-3"><p>Tu carrito está vacío.</p><Button asChild><Link to="/tienda">Ir a la tienda</Link></Button></CardContent></Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
            <div className="space-y-6">
              <Card variant="commercial">
                <CardContent className="p-6 grid gap-4 sm:grid-cols-2">
                  <h2 className="sm:col-span-2 font-display font-bold text-lg border-b border-border/60 pb-2">1. Datos de Entrega</h2>
                  <div className="space-y-1 sm:col-span-2"><Label htmlFor="c-name">Nombre completo</Label><Input id="c-name" maxLength={80} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Ej. Juan Pérez" /></div>
                  <div className="space-y-1"><Label htmlFor="c-mail">Correo electrónico</Label><Input id="c-mail" type="email" maxLength={254} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
                  <div className="space-y-1"><Label htmlFor="c-phone">Teléfono / WhatsApp</Label><Input id="c-phone" maxLength={25} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="809-555-0100" /></div>
                  <div className="space-y-1 sm:col-span-2"><Label htmlFor="c-addr">Dirección de entrega</Label><Input id="c-addr" maxLength={160} value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} placeholder="Calle, número, sector o edificio" /></div>
                  <div className="space-y-1 sm:col-span-2"><Label htmlFor="c-city">Ciudad / Provincia</Label><Input id="c-city" maxLength={60} value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} placeholder="Santo Domingo, Santiago, etc." /></div>
                </CardContent>
              </Card>

              <Card variant="commercial">
                <CardContent className="p-6 space-y-4">
                  <h2 className="font-display font-bold text-lg border-b border-border/60 pb-2">2. Método de Pago</h2>
                  
                  <div className="grid sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`surface-commercial p-4 rounded-card border text-left transition-all ${
                        paymentMethod === "card" 
                          ? "border-primary bg-primary/5 ring-1 ring-primary" 
                          : "border-border hover:border-border/80"
                      }`}
                    >
                      <p className="font-semibold text-sm">Tarjeta de Crédito / Débito</p>
                      <p className="text-xs text-muted-foreground mt-1">Visa, Mastercard, Amex a través de pasarela bancaria segura.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("transfer")}
                      className={`surface-commercial p-4 rounded-card border text-left transition-all ${
                        paymentMethod === "transfer" 
                          ? "border-primary bg-primary/5 ring-1 ring-primary" 
                          : "border-border hover:border-border/80"
                      }`}
                    >
                      <p className="font-semibold text-sm">Transferencia Local</p>
                      <p className="text-xs text-muted-foreground mt-1">Pago directo vía Banco Popular o Banreservas con comprobante.</p>
                    </button>
                  </div>

                  <div className="rounded-lg bg-muted/60 p-3.5 text-xs text-muted-foreground space-y-1.5 border border-border/50">
                    <p className="font-medium text-foreground">🔒 Seguridad Garantizada (Cumplimiento PCI-DSS):</p>
                    <p>Descubre RD no almacena datos sensibles de tarjetas de crédito en sus servidores. Las transacciones se procesan mediante túneles bancarios encriptados.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card variant="commercial" className="self-start"><CardContent className="p-6 space-y-3">
              <h2 className="font-display font-bold">Resumen de Orden</h2>
              <ul className="space-y-1 text-sm divide-y divide-border/40">
                {items.map((i) => (
                  <li key={i.id} className="flex justify-between gap-2 py-1.5">
                    <span className="truncate">{i.quantity} × {i.product_name}</span>
                    <span className="font-medium">{formatDop(Math.round(i.price * i.quantity * DOP_PER_USD))}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border pt-2 text-sm space-y-1">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatDop(subtotal)}</span></div>
                <div className="flex justify-between"><span>Envío</span><span>{shipping ? formatDop(shipping) : "Gratis (Compras > RD$ 2,500)"}</span></div>
                <div className="flex justify-between font-bold text-base pt-1 border-t border-border/40">
                  <span>Total</span><span>{formatDop(total)}</span>
                </div>
              </div>
              <Button className="w-full text-base font-semibold" size="lg" disabled={busy} onClick={pay}>
                {busy ? "Procesando orden..." : `Confirmar Pedido · ${formatDop(total)}`}
              </Button>
              <p className="text-[11px] text-muted-foreground text-center">Garantía oficial y soporte directo por WhatsApp.</p>
            </CardContent></Card>
          </div>
        )}
      </main>
      <Footer />
    </PageTransition>
  );
}
