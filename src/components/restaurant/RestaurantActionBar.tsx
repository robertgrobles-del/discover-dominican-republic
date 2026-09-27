import { Share2, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClaimBusinessModal } from "@/components/business/ClaimBusinessModal";
import { calculateOpenStatus } from "@/lib/openStatus";
import { toast } from "sonner";
import { Restaurant } from "@/data/restaurants";

interface RestaurantActionBarProps {
  restaurant: Restaurant;
}

export function RestaurantActionBar({ restaurant }: RestaurantActionBarProps) {
  const status = calculateOpenStatus(restaurant.openingHours);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: restaurant.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  return (
    <section className="border-b border-border/60 bg-card/40 backdrop-blur-sm">
      <div className="container mx-auto px-4 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{restaurant.cuisineType.join(', ')}</span>
          <span>•</span>
          <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-xl text-xs font-bold text-primary">
            <span>
              Consumo promedio:{" "}
              {restaurant.priceRange === '$$$$'
                ? 'RD$ 2,800 – 4,500 (~$45–$75 USD)'
                : restaurant.priceRange === '$$$'
                ? 'RD$ 1,600 – 2,800 (~$25–$45 USD)'
                : 'RD$ 750 – 1,500 (~$12–$25 USD)'}{" "}
              / pers.
            </span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-md border border-emerald-500/20">
              🌱 Opciones Veganas
            </span>
            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold px-2 py-0.5 rounded-md border border-amber-500/20">
              🌾 Sin Gluten
            </span>
          </div>
          <span>•</span>
          <Badge variant="outline" className={`text-[11px] font-bold gap-1 ${status.badgeClass}`}>
            <Clock className="h-3 w-3" />
            {status.statusLabel}
          </Badge>
          {restaurant.address && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1 text-xs">
                <MapPin className="h-3.5 w-3.5 text-primary" /> {restaurant.address}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Botón Reservar Mesa Directo */}
          <Button
            size="sm"
            className="gap-1.5 rounded-xl font-bold bg-primary text-primary-foreground shadow-sm"
            onClick={() => {
              const resCard = document.getElementById("res-name");
              if (resCard) {
                resCard.scrollIntoView({ behavior: "smooth", block: "center" });
                resCard.focus();
              }
            }}
          >
            🍽️ Reservar Mesa
          </Button>

          {/* Botón Ver Menú */}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-xl font-medium"
            onClick={() => {
              const menuSection = document.getElementById("restaurant-menu-section");
              if (menuSection) {
                menuSection.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
          >
            📋 Ver Menú
          </Button>

          {/* Botón WhatsApp Directo */}
          <a
            href={`https://wa.me/18095550198?text=${encodeURIComponent(`Hola, vi su ficha en Descubre República Dominicana y deseo consultar el menú y disponibilidad para reservar mesa en ${restaurant.name}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-1.5 px-3 rounded-xl text-xs transition-colors shadow-xs"
          >
            💬 WhatsApp
          </a>

          {/* Botón Cómo Llegar / Ubicación */}
          {restaurant.address && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.name} ${restaurant.address}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-muted/80 hover:bg-muted text-foreground font-medium py-1.5 px-3 rounded-xl text-xs transition-colors border border-border"
            >
              📍 Cómo Llegar
            </a>
          )}

          <ClaimBusinessModal
            businessName={restaurant.name}
            businessType="restaurante"
            businessId={restaurant.id}
          />
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl w-fit"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" /> Compartir
          </Button>
        </div>
      </div>
    </section>
  );
}
