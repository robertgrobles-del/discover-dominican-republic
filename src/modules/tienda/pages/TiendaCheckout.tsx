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

  const pay = async () => {
    if (items.length === 0) return toast.error("Tu carrito está vacío.");
    if (f.name.trim().length < 3) return toast.error("Escribe tu nombre completo.");
    if (!isValidEmail(f.email)) return toast.error("Ingresa un correo válido.");
    if (f.address.trim().length < 6 || f.city.trim().length < 2) return toast.error("Completa la dirección de entrega.");
    if (f.card.replace(/\s/g, "").length < 13) return toast.error("Ingresa un número de tarjeta válido (simulado).");
    setBusy(true);
    try {
      const id = await createOrder({
        user_id: user?.id ?? null, customer_name: f.name.trim(), customer_email: f.email.trim(), phone: f.phone.trim(),
        address: f.address.trim(), city: f.city.trim(), subtotal, shipping, total,
        items: items.map((i) => ({ product_id: i.product_id, name: i.product_name, qty: i.quantity, unit_price: Math.round(i.price * DOP_PER_USD) })),
      });
      await clearCart();
      qc.invalidateQueries({ queryKey: ["store"] });
      setOrderId(id);
    } catch (e: any) {
      toast.error(e.message || "No se pudo procesar el pago");
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
          <p className="text-muted-foreground">Te enviaremos los detalles de entrega por correo.</p>
          <p className="rounded-lg bg-muted p-3 font-mono text-sm">Pedido: {orderId}</p>
          <Button asChild><Link to="/tienda">Seguir comprando</Link></Button>
        </main>
        <Footer />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SEOHead title="Checkout — Tienda Descubre RD" description="Completa tu compra en la tienda oficial de Descubre RD." />
      <Header variant="white" />
      <main className="pt-28 pb-16 container mx-auto px-4">
        <h1 className="font-display text-3xl font-bold mb-6">Finalizar compra</h1>
        {!user ? (
          <Card><CardContent className="py-12 text-center space-y-3"><p>Inicia sesión para ver tu carrito y completar la compra.</p><Button asChild><Link to="/login">Iniciar sesión</Link></Button></CardContent></Card>
        ) : items.length === 0 ? (
          <Card><CardContent className="py-12 text-center space-y-3"><p>Tu carrito está vacío.</p><Button asChild><Link to="/tienda">Ir a la tienda</Link></Button></CardContent></Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
            <Card><CardContent className="p-6 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2"><Label htmlFor="c-name">Nombre completo</Label><Input id="c-name" maxLength={80} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
              <div className="space-y-1"><Label htmlFor="c-mail">Correo</Label><Input id="c-mail" type="email" maxLength={254} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
              <div className="space-y-1"><Label htmlFor="c-phone">Teléfono</Label><Input id="c-phone" maxLength={25} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
              <div className="space-y-1 sm:col-span-2"><Label htmlFor="c-addr">Dirección de entrega</Label><Input id="c-addr" maxLength={160} value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></div>
              <div className="space-y-1"><Label htmlFor="c-city">Ciudad</Label><Input id="c-city" maxLength={60} value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} /></div>
              <div className="space-y-1"><Label htmlFor="c-card">Tarjeta (simulada)</Label><Input id="c-card" inputMode="numeric" maxLength={23} value={f.card} onChange={(e) => setF({ ...f, card: e.target.value.replace(/[^\d ]/g, "") })} placeholder="4242 4242 4242 4242" /></div>
            </CardContent></Card>
            <Card className="self-start"><CardContent className="p-6 space-y-3">
              <h2 className="font-display font-bold">Resumen</h2>
              <ul className="space-y-1 text-sm">{items.map((i) => <li key={i.id} className="flex justify-between gap-2"><span className="truncate">{i.quantity} × {i.product_name}</span><span>{formatDop(Math.round(i.price * i.quantity * DOP_PER_USD))}</span></li>)}</ul>
              <div className="border-t border-border pt-2 text-sm space-y-1">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatDop(subtotal)}</span></div>
                <div className="flex justify-between"><span>Envío</span><span>{shipping ? formatDop(shipping) : "Gratis"}</span></div>
                <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatDop(total)}</span></div>
              </div>
              <Button className="w-full" size="lg" disabled={busy} onClick={pay}>Pagar {formatDop(total)}</Button>
              <p className="text-[11px] text-muted-foreground text-center">Pago simulado en este entorno de demostración.</p>
            </CardContent></Card>
          </div>
        )}
      </main>
      <Footer />
    </PageTransition>
  );
}
