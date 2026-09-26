import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ChevronRight as ChevronRightIcon, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { BannerAd } from "@/components/promo";
import { EventoItem } from "@/data/eventosData";

interface CalendarioGeneralTabContentProps {
  categorias: string[];
  selectedCategoria: string;
  onSelectCategoria: (cat: string) => void;
  eventos: EventoItem[];
  labels: {
    upcoming: string;
    exploreByCategory: string;
    filterByLocation: string;
    viewDetails: string;
  };
}

export function CalendarioGeneralTabContent({
  categorias,
  selectedCategoria,
  onSelectCategoria,
  eventos,
  labels
}: CalendarioGeneralTabContentProps) {
  return (
    <div>
      {/* Próximos Eventos */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">{labels.upcoming}</h2>
          <p className="text-muted-foreground">{labels.exploreByCategory}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {categorias.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategoria === cat ? "default" : "outline"}
              size="sm"
              onClick={() => onSelectCategoria(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Calendar Sidebar */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <Button size="icon" variant="ghost" aria-label="Mes anterior"><ChevronLeft className="h-4 w-4" /></Button>
            <span className="font-semibold text-foreground">Octubre 2024</span>
            <Button size="icon" variant="ghost" aria-label="Siguiente mes"><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm mb-4">
            {["D", "L", "M", "M", "J", "V", "S"].map((d, i) => (
              <span key={i} className="text-muted-foreground py-1">{d}</span>
            ))}
            {Array.from({ length: 31 }, (_, i) => (
              <button
                key={i}
                className={`py-1 rounded-full hover:bg-primary/20 ${
                  i + 1 === 5 ? "bg-primary text-primary-foreground" : "text-foreground"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm font-semibold text-foreground mb-3">{labels.filterByLocation}</p>
            <div className="space-y-2">
              {["Santo Domingo", "Punta Cana", "Puerto Plata"].map((loc, i) => (
                <div key={loc} className="flex items-center gap-2">
                  <Checkbox id={`loc-${i}`} defaultChecked={i === 0} />
                  <label htmlFor={`loc-${i}`} className="text-sm text-foreground">{loc}</label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Skyscraper Banner Ad inside Sidebar */}
          <div className="border-t border-border pt-6 hidden sm:flex justify-center">
            <BannerAd 
              size="wide-skyscraper" 
              placement="sidebar" 
              showDemo 
              industry="alcohol" 
              className="shadow-lg"
            />
          </div>
        </div>

        {/* Events Grid */}
        <div className="lg:col-span-3 grid md:grid-cols-3 gap-6">
          {eventos.slice(0, 6).map((evento) => (
            <div key={evento.id} className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors">
              <div className="relative aspect-[4/3]">
                <img src={evento.imagen} alt={evento.titulo} className="w-full h-full object-cover" loading="lazy" />
                <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                  {evento.categoria}
                </Badge>
                <span className="absolute top-3 right-3 text-xs text-white bg-black/60 px-2 py-1 rounded">
                  {evento.fecha}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-display font-bold text-foreground mb-2">{evento.titulo}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{evento.descripcion}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3 text-primary" />
                    <span>{evento.ubicacion}</span>
                  </div>
                  <Link to={`/evento/${evento.id}`} className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
                    {labels.viewDetails} <ChevronRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
