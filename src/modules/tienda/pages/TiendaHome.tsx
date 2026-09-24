import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Truck, ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";
import { CATEGORY_LABEL, FREE_SHIPPING_FROM, dopToUsd, formatDop, useProducts, type StoreProduct } from "../api";
import { ProductArt } from "../ProductArt";

export default function TiendaHome() {
  const { data: products = [], isLoading } = useProducts();
  const { addItem } = useCart();
  const [cat, setCat] = useState<StoreProduct["category"] | "all">("all");
  const featured = products.find((p) => p.featured && p.category === "poster") || products.find((p) => p.featured);
  const shown = useMemo(() => products.filter((p) => cat === "all" || p.category === cat), [products, cat]);
  const cats = [...new Set(products.map((p) => p.category))];

  const quickAdd = (p: StoreProduct) => {
    if (p.sizes.length > 1 || p.colors.length > 1) return;
    addItem({ product_id: p.id, product_name: p.name, product_image: null, price: dopToUsd(p.price), quantity: 1 });
  };

  return (
    <PageTransition>
      <SEOHead title="Tienda oficial Descubre RD" description="Pósters rayables, ropa, gorras, bolsos y accesorios inspirados en República Dominicana. Envíos a todo el país." />
      <Header variant="white" />
      <main className="pt-24 pb-16">
        <div className="bg-primary text-primary-foreground text-center text-sm py-2">¡Bienvenido a la tienda oficial de Descubre RD! Envío gratis en compras desde {formatDop(FREE_SHIPPING_FROM)}.</div>
        <div className="container mx-auto px-4 pt-8">
          {featured && (
            <Card className="overflow-hidden grid md:grid-cols-2 mb-10">
              <ProductArt product={featured} className="min-h-[16rem]" />
              <div className="p-8 flex flex-col justify-center gap-3">
                <Badge className="w-fit">Reto Descubre RD</Badge>
                <h1 className="font-display text-3xl md:text-4xl font-extrabold leading-tight">{featured.name}</h1>
                <p className="text-muted-foreground">{featured.tagline}</p>
                <p className="font-display text-2xl font-bold">{formatDop(featured.price)}</p>
                <div><Button size="lg" asChild><Link to={`/tienda/${featured.slug}`}>¡Cómpralo ya!</Link></Button></div>
              </div>
            </Card>
          )}

          <div className="grid sm:grid-cols-3 gap-3 mb-8 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground"><Truck className="h-4 w-4 text-primary" /> Envíos a todo el país</div>
            <div className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="h-4 w-4 text-primary" /> 72 horas para solicitar devolución</div>
            <div className="flex items-center gap-2 text-muted-foreground"><ShoppingBag className="h-4 w-4 text-primary" /> Pago con tarjeta de débito o crédito</div>
          </div>

          <h2 className="font-display text-2xl font-bold mb-4">¡Viaja con estas chulerías de productos!</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            <Button size="sm" className="rounded-full" variant={cat === "all" ? "default" : "outline"} onClick={() => setCat("all")}>Todos</Button>
            {cats.map((c) => <Button key={c} size="sm" className="rounded-full" variant={cat === c ? "default" : "outline"} onClick={() => setCat(c)}>{CATEGORY_LABEL[c]}</Button>)}
          </div>

          {isLoading ? null : (
            <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
              {shown.map((p) => (
                <Card key={p.id} className="overflow-hidden flex flex-col">
                  <Link to={`/tienda/${p.slug}`} className="block group">
                    <ProductArt product={p} className="aspect-square transition-transform duration-500 group-hover:scale-[1.03]" />
                  </Link>
                  <div className="p-3 flex flex-col gap-1 flex-1">
                    <Link to={`/tienda/${p.slug}`} className="text-sm font-medium leading-snug hover:text-primary">{p.name}</Link>
                    <p className="text-xs text-muted-foreground">{CATEGORY_LABEL[p.category]}</p>
                    <p className="font-semibold">{formatDop(p.price)}</p>
                    <div className="mt-auto pt-2">
                      {p.stock <= 0 ? <Button size="sm" variant="outline" className="w-full" disabled>Agotado</Button>
                        : p.sizes.length > 1 || p.colors.length > 1 ? <Button size="sm" variant="outline" className="w-full" asChild><Link to={`/tienda/${p.slug}`}>Elegir opciones</Link></Button>
                        : <Button size="sm" variant="outline" className="w-full" onClick={() => quickAdd(p)}>Agregar al carrito</Button>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
}
