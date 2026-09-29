import { Search, Star, MapPin, CheckCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "./EmptyState";
import { categoriasServicios, type Servicio } from "@/data/marketplaceData";
import { VirtuosoGrid } from "react-virtuoso";

/** Por debajo de este total no vale la pena virtualizar (el costo del virtualizador supera el ahorro). */
const VIRTUALIZE_FROM = 20;

interface ServiciosTabProps {
  servicios: Servicio[];
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  onReserve: (servicio: Servicio) => void;
}

export function ServiciosTab({ servicios, search, onSearchChange, category, onCategoryChange, onReserve }: ServiciosTabProps) {
  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar servicios o proveedores..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 h-12 bg-card border-border"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categoriasServicios.map((cat) => (
            <Button key={cat} variant={category === cat ? "default" : "outline"} size="sm" onClick={() => onCategoryChange(cat)} className="whitespace-nowrap">
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {servicios.length >= VIRTUALIZE_FROM ? (
        <VirtuosoGrid
          useWindowScroll
          totalCount={servicios.length}
          listClassName="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          itemContent={(index) => <ServiceCard s={servicios[index]!} onReserve={onReserve} />}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicios.map((s) => <ServiceCard key={s.id} s={s} onReserve={onReserve} />)}
        </div>
      )}
      {servicios.length === 0 && (
        <EmptyState text="No se encontraron servicios" onClear={() => { onSearchChange(""); onCategoryChange("Todos"); }} />
      )}
    </>
  );
}

function ServiceCard({ s, onReserve }: { s: Servicio; onReserve: (servicio: Servicio) => void }) {
  return (
    <Card className="group overflow-hidden border-border hover:shadow-xl transition-all">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={s.imagen} alt={s.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        {s.verificado && (
          <Badge className="absolute top-3 left-3 bg-emerald-600 text-white text-xs gap-1">
            <CheckCircle className="h-3 w-3" /> Verificado
          </Badge>
        )}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-bold text-white">{s.nombre}</h3>
          <p className="text-white/80 text-sm">{s.proveedor}</p>
        </div>
      </div>
      <CardContent className="p-5">
        <Badge variant="outline" className="mb-2">{s.categoria}</Badge>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{s.descripcion}</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {s.serviciosList.map((item) => (
            <Badge key={item} variant="secondary" className="text-xs">{item}</Badge>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" /> {s.rating}</span>
          <span>({s.reviews} reseñas)</span>
          <span className="flex items-center gap-1 ml-auto"><MapPin className="h-3 w-3" /> {s.ubicacion}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-primary">{s.precio}</span>
          <Button size="sm" className="gap-1" onClick={() => onReserve(s)}>
            Reservar <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
