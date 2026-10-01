import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { ChevronRight as ChevronRightIcon, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const [province, setProvince] = useState("all");
  const [onlyThisWeek, setOnlyThisWeek] = useState(false);
  const provinces = useMemo(() => [...new Set(eventos.map((event) => event.provincia).filter((value): value is string => Boolean(value)))].sort(), [eventos]);
  const filteredEvents = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    return eventos.filter((event) => {
      if (province !== "all" && event.provincia !== province) return false;
      if (!onlyThisWeek) return true;
      if (!event.startsAt) return false;
      const startDate = new Date(event.startsAt);
      return !Number.isNaN(startDate.getTime()) && startDate >= weekStart && startDate < weekEnd;
    });
  }, [eventos, onlyThisWeek, province]);

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
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <div>
            <label htmlFor="event-province" className="text-sm font-semibold text-foreground">Filtrar por provincia</label>
            <select id="event-province" className="mt-2 w-full rounded-md border border-input bg-background p-2 text-sm" value={province} onChange={(event) => setProvince(event.target.value)}>
              <option value="all">Todas las provincias</option>
              {provinces.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <Button type="button" variant={onlyThisWeek ? "default" : "outline"} className="w-full" aria-pressed={onlyThisWeek} onClick={() => setOnlyThisWeek((value) => !value)}>
            {onlyThisWeek ? "Mostrando esta semana" : "Qué pasa esta semana"}
          </Button>
          <p className="text-xs leading-relaxed text-muted-foreground">El filtro semanal incluye eventos con fecha de inicio registrada. Confirma cambios de fecha o lugar con la organización.</p>
          
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
          {filteredEvents.slice(0, 9).map((evento) => (
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
                    <span>{evento.provincia || evento.ubicacion}</span>
                  </div>
                  <Link to={`/evento/${evento.id}`} className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
                    {labels.viewDetails} <ChevronRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {filteredEvents.length === 0 && <div className="md:col-span-3 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No hay eventos con fecha registrada para estos filtros. Prueba otra provincia o consulta la agenda general.</div>}
        </div>
      </div>
    </div>
  );
}
