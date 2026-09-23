import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { type Producto } from "@/data/marketplaceData";

export type ShippingDestination = "Local" | "USA" | "Spain" | "Canada";

export function getShippingFee(dest: ShippingDestination) {
  if (dest === "USA") return 15;
  if (dest === "Spain") return 22;
  if (dest === "Canada") return 25;
  return 0; // Local
}

export function parsePrice(priceStr: string) {
  const match = priceStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : 25;
}

interface ProductDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Producto | null;
  shippingDest: ShippingDestination;
  onShippingDestChange: (dest: ShippingDestination) => void;
  onProceedToCheckout: () => void;
}

export function ProductDetailModal({ open, onOpenChange, product, shippingDest, onShippingDestChange, onProceedToCheckout }: ProductDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">Detalle del Producto</DialogTitle>
          <DialogDescription className="text-xs">Configure su envío internacional antes de comprar.</DialogDescription>
        </DialogHeader>
        {product && (
          <div className="space-y-4 pt-2">
            <div className="aspect-[16/10] overflow-hidden rounded-lg">
              <img src={product.imagen} alt={product.nombre} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">{product.nombre}</h3>
              <p className="text-xs text-muted-foreground">Por: {product.vendedor} • {product.ubicacion}</p>
              <p className="text-xs text-foreground mt-2 leading-relaxed">{product.descripcion}</p>
            </div>

            {/* Shipping Selector */}
            <div className="space-y-2 p-4 bg-muted/40 border border-border rounded-lg">
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">País de Envío</label>
              <select
                value={shippingDest}
                onChange={(e) => onShippingDestChange(e.target.value as ShippingDestination)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-2"
                title="País de Envío"
              >
                <option value="Local">República Dominicana (Local) - Gratis</option>
                <option value="USA">Estados Unidos (USA) - +$15.00 USD</option>
                <option value="Spain">España / Europa - +$22.00 USD</option>
                <option value="Canada">Canadá - +$25.00 USD</option>
              </select>

              <div className="flex justify-between items-baseline text-xs text-muted-foreground pt-1 border-t border-border/50">
                <span>Precio base:</span>
                <span className="font-mono">${parsePrice(product.precio).toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between items-baseline text-xs text-muted-foreground">
                <span>Costo de envío:</span>
                <span className="font-mono">${getShippingFee(shippingDest).toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between items-baseline text-sm font-bold text-primary pt-1.5 border-t border-border">
                <span>Subtotal:</span>
                <span className="font-mono">${(parsePrice(product.precio) + getShippingFee(shippingDest)).toFixed(2)} USD</span>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button size="sm" className="gap-1.5" onClick={onProceedToCheckout}>
                Proceder al Pago <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
