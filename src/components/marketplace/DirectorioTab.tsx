import { Search, Star, MapPin, CheckCircle, Clock, Phone, Globe, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "./EmptyState";
import { categoriasNegocios, type Negocio } from "@/data/marketplaceData";

interface DirectorioTabProps {
  negocios: Negocio[];
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
}

export function DirectorioTab({ negocios, search, onSearchChange, category, onCategoryChange }: DirectorioTabProps) {
  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar negocios..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 h-12 bg-card border-border"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categoriasNegocios.map((cat) => (
            <Button key={cat} variant={category === cat ? "default" : "outline"} size="sm" onClick={() => onCategoryChange(cat)} className="whitespace-nowrap">
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {negocios.map((n) => (
          <Card key={n.id} className="group overflow-hidden border-border hover:shadow-xl transition-all">
            <div className="relative aspect-[16/9] overflow-hidden">
              <img src={n.imagen} alt={n.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              {n.verificado && (
                <Badge className="absolute top-3 left-3 bg-emerald-600 text-white text-xs gap-1">
                  <CheckCircle className="h-3 w-3" /> Verificado
                </Badge>
              )}
              <Badge variant="secondary" className="absolute top-3 right-3">{n.tipo}</Badge>
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-lg font-bold text-white">{n.nombre}</h3>
                <p className="text-white/80 text-sm flex items-center gap-1"><MapPin className="h-3 w-3" /> {n.ubicacion}</p>
              </div>
            </div>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{n.descripcion}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {n.categorias.map((c) => (
                  <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                ))}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" /> {n.rating}</span>
                <span>({n.reviews.toLocaleString()} reseñas)</span>
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
                <p className="flex items-center gap-2"><Clock className="h-3 w-3 text-primary" /> {n.horario}</p>
                <p className="flex items-center gap-2"><Phone className="h-3 w-3 text-primary" /> {n.telefono}</p>
                {n.website && (
                  <p className="flex items-center gap-2"><Globe className="h-3 w-3 text-primary" /> {n.website}</p>
                )}
              </div>
              <Button size="sm" variant="outline" className="w-full gap-1">
                Ver detalles <ChevronRight className="h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {negocios.length === 0 && (
        <EmptyState text="No se encontraron negocios" onClear={() => { onSearchChange(""); onCategoryChange("Todos"); }} />
      )}
    </>
  );
}
