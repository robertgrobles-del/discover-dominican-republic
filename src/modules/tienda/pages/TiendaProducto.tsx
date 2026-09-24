import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Minus, Plus, Share2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";
import { CATEGORY_LABEL, FREE_SHIPPING_FROM, SHIPPING_FLAT, dopToUsd, formatDop, useProduct, useProducts } from "../api";
import { ProductArt } from "../ProductArt";

export default function TiendaProducto() {
  const { slug } = useParams();
  const { data: product, isLoading } = useProduct(slug);
  const { data: all = [] } = useProducts();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");

  if (isLoading) return <div className="min-h-screen" />;
  if (!product) {
    return (
      <PageTransition>
        <SEOHead title="Producto no encontrado — Tienda Descubre RD" description="El producto que buscas no existe." />
        <Header variant="white" />
        <main className="min-h-[60vh] flex flex-col items-center justify-center gap-4 pt-24"><h1 className="font-display text-2xl font-bold">Producto no encontrado</h1><Button asChild><Link to="/tienda">Volver a la tienda</Link></Button></main>
        <Footer />
      </PageTransition>
    );
  }

  const related = all.filter((p) => p.id !== product.id && p.category === product.category).concat(all.filter((p) => p.id !== product.id && p.category !== product.category)).slice(0, 4);
  const needSize = product.sizes.length > 1;
  const needColor = product.colors.length > 1;
  const chosenSize = size || (product.sizes.length === 1 ? product.sizes[0] : "");
  const chosenColor = color || (product.colors.length === 1 ? product.colors[0] : "");

  const add = () => {
    if (needSize && !chosenSize) return toast.error("Elige una talla.");
    if (needColor && !chosenColor) return toast.error("Elige un color.");
    const variant = [chosenSize, chosenColor].filter(Boolean).join(", ");
    addItem({
      product_id: `${product.id}:${chosenSize}:${chosenColor}`,
      product_name: variant ? `${product.name} (${variant})` : product.name,
      product_image: null, price: dopToUsd(product.price), quantity: qty,
    });
  };
  const share = async () => {
    const url = window.location.href;
    try { if (navigator.share) await navigator.share({ title: product.name, url }); else { await navigator.clipboard.writeText(url); toast.success("Enlace copiado"); } } catch { /* cancelado */ }
  };

  return (
    <PageTransition>
      <SEOHead title={`${product.name} — Tienda Descubre RD`} description={product.description.slice(0, 155)} />
      <Header variant="white" />
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <nav className="text-sm text-muted-foreground mb-4"><Link to="/tienda" className="hover:text-primary">Tienda</Link> / {CATEGORY_LABEL[product.category]}</nav>
          <div className="grid gap-10 lg:grid-cols-2">
            <ProductArt product={product} className="aspect-square rounded-2xl" />
            <div className="space-y-5">
              <h1 className="font-display text-3xl md:text-4xl font-bold">{product.name}</h1>
              <p className="text-2xl font-semibold">{formatDop(product.price)} <span className="text-sm font-normal text-muted-foreground">≈ US$ {dopToUsd(product.price).toFixed(2)}</span></p>
              {(needSize || needColor) && (
                <div className="grid grid-cols-2 gap-3">
                  {needSize && <div className="space-y-1"><Label>Talla</Label><Select value={size} onValueChange={setSize}><SelectTrigger><SelectValue placeholder="Elige" /></SelectTrigger><SelectContent>{product.sizes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>}
                  {needColor && <div className="space-y-1"><Label>Color</Label><Select value={color} onValueChange={setColor}><SelectTrigger><SelectValue placeholder="Elige" /></SelectTrigger><SelectContent>{product.colors.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>}
                </div>
              )}
              <div className="space-y-1">
                <Label>Cantidad</Label>
                <div className="inline-flex items-center border border-border rounded-lg">
                  <Button variant="ghost" size="icon" aria-label="Disminuir" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-4 w-4" /></Button>
                  <span className="w-10 text-center" aria-live="polite">{qty}</span>
                  <Button variant="ghost" size="icon" aria-label="Aumentar" onClick={() => setQty(Math.min(10, product.stock || 1, qty + 1))}><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
              <Button size="lg" className="w-full" disabled={product.stock <= 0} onClick={add}>{product.stock <= 0 ? "Agotado" : "Agregar al carrito"}</Button>

              <div className="space-y-4 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">{product.tagline}</p>
                <p>{product.description}</p>
                <div><p className="font-semibold text-foreground mb-1">✨ ¿Qué incluye?</p><ul className="list-disc pl-5 space-y-0.5">{product.includes.map((i) => <li key={i}>{i}</li>)}</ul></div>
                <div><p className="font-semibold text-foreground mb-1">🚚 Entrega (costos no incluidos)</p>
                  <ul className="list-disc pl-5 space-y-0.5"><li>Envíos a todo el país.</li><li>Ciudad principal: 2 a 3 días hábiles. Otras ciudades: 4 a 7 días hábiles.</li><li>Envío {formatDop(SHIPPING_FLAT)}; gratis desde {formatDop(FREE_SHIPPING_FROM)}.</li></ul></div>
                <div><p className="font-semibold text-foreground mb-1">💳 Métodos de pago</p><ul className="list-disc pl-5"><li>Tarjeta de débito</li><li>Tarjeta de crédito</li></ul></div>
                <div><p className="font-semibold text-foreground mb-1">↩️ Política de devolución</p><p>Tienes 72 horas desde que recibes tu pedido para solicitar una devolución. Los reembolsos aplican a productos defectuosos.</p></div>
              </div>
              <Button variant="ghost" size="sm" className="gap-2" onClick={share}><Share2 className="h-4 w-4" /> Compartir</Button>
            </div>
          </div>

          <h2 className="font-display text-2xl font-bold mt-16 mb-5">Productos relacionados</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((p) => (
              <Link key={p.id} to={`/tienda/${p.slug}`}><Card className="overflow-hidden h-full"><ProductArt product={p} className="aspect-square" /><div className="p-3"><p className="text-sm font-medium leading-snug">{p.name}</p><p className="text-sm text-muted-foreground">{formatDop(p.price)}</p></div></Card></Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
}
