import { Search, Star, MapPin, CheckCircle, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FavoriteButton } from "@/components/FavoriteButton";
import { EmptyState } from "./EmptyState";
import { categoriasProductos, type Producto } from "@/data/marketplaceData";

interface ProductosTabProps {
  productos: Producto[];
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  onBuy: (producto: Producto) => void;
}

export function ProductosTab({ productos, search, onSearchChange, category, onCategoryChange, onBuy }: ProductosTabProps) {
  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar productos o vendedores..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 h-12 bg-card border-border"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categoriasProductos.map((cat) => (
            <Button key={cat} variant={category === cat ? "default" : "outline"} size="sm" onClick={() => onCategoryChange(cat)} className="whitespace-nowrap">
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {productos.map((p) => (
          <Card key={p.id} className="group overflow-hidden border-border hover:shadow-xl transition-all">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              {p.verificado && (
                <Badge className="absolute top-3 left-3 bg-emerald-600 text-white text-xs gap-1">
                  <CheckCircle className="h-3 w-3" /> Verificado
                </Badge>
              )}
              <FavoriteButton id={p.id} type="destino" name={p.nombre} image={p.imagen} className="absolute top-3 right-3" />
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-base font-bold text-white line-clamp-1">{p.nombre}</h3>
                <p className="text-white/80 text-xs">{p.vendedor}</p>
              </div>
            </div>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{p.descripcion}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {p.tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" /> {p.rating}</span>
                <span>({p.reviews})</span>
                <span className="flex items-center gap-1 ml-auto"><MapPin className="h-3 w-3" /> {p.ubicacion}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-primary">{p.precio}</span>
                <div className="flex items-center gap-1.5">
                  {p.envio && (
                    <Badge variant="secondary" className="text-[10px] gap-1 hidden sm:flex">
                      <Truck className="h-3 w-3" /> Envío
                    </Badge>
                  )}
                  <Button size="sm" onClick={() => onBuy(p)}>Comprar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {productos.length === 0 && (
        <EmptyState text="No se encontraron productos" onClear={() => { onSearchChange(""); onCategoryChange("Todos"); }} />
      )}
    </>
  );
}
