import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/hooks/useCart";

export function CartDrawer() {
  const { items, count, total, removeItem, updateQuantity, clearCart, loading, error, retry } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Carrito de compras ${count > 0 ? `(${count} artículos)` : "(vacío)"}`}
        >
          <ShoppingCart className="h-5 w-5" aria-hidden="true" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            Carrito ({count})
          </SheetTitle>
        </SheetHeader>

        {error ? (
          <div role="alert" className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-destructive">No se pudo cargar el carrito.</p>
            <Button variant="outline" onClick={retry}>Reintentar</Button>
          </div>
        ) : loading ? (
          <div role="status" aria-live="polite" className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
            Cargando el carrito…
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <ShoppingCart className="h-12 w-12 opacity-30" aria-hidden="true" />
            <p className="text-sm">Tu carrito está vacío</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    {item.product_image && (
                      <img src={item.product_image} alt={item.product_name} width="64" height="64" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product_name}</p>
                      <p className="text-sm text-primary font-semibold">US$ {item.price.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          aria-label={`Disminuir cantidad de ${item.product_name}`}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" aria-hidden="true" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          aria-label={`Aumentar cantidad de ${item.product_name}`}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-auto text-destructive"
                          aria-label={`Eliminar ${item.product_name} del carrito`}
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between font-semibold">
                <span>Total</span>
                <span className="text-lg text-primary">US$ {total.toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={clearCart} aria-label="Vaciar todo el carrito">
                  Vaciar
                </Button>
                <Button className="flex-1" onClick={() => window.location.href = "/checkout"} aria-label="Proceder al pago seguro">
                  Comprar
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
