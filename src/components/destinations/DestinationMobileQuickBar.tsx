import React, { useState, useEffect } from "react";
import { 
  MapPin, 
  Share2, 
  Heart, 
  MessageCircle, 
  Navigation, 
  Sun, 
  Phone, 
  Calendar,
  X,
  Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

interface DestinationMobileQuickBarProps {
  destinationId: string;
  destinationName: string;
  regionName: string;
  heroImage: string;
  tempCelsius?: string;
  condition?: string;
  whatsappSupport?: string;
}

export const DestinationMobileQuickBar: React.FC<DestinationMobileQuickBarProps> = ({
  destinationId,
  destinationName,
  regionName,
  heroImage,
  tempCelsius = "28",
  condition = "Soleado",
  whatsappSupport = "18095550199"
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isGpsModalOpen, setIsGpsModalOpen] = useState(false);

  // Aparece tras scroll de 250px en móvil
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${destinationName} - Guía Oficial | Descubre RD`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  const handleOpenWhatsApp = () => {
    const message = encodeURIComponent(`Hola, estoy explorando ${destinationName} en Descubre RD y quisiera información de guías certificados.`);
    window.open(`https://wa.me/${whatsappSupport}?text=${message}`, "_blank");
  };

  return (
    <>
      {/* Barra Flotante Inferior sólo en Móvil y Tablet pequeña */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden p-3 bg-card/90 backdrop-blur-xl border-t border-border/80 shadow-[0_-8px_20px_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
          
          {/* Mini Info del Destino */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <img 
              src={heroImage} 
              alt={destinationName} 
              className="w-10 h-10 rounded-xl object-cover border border-border shrink-0" 
            />
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-foreground truncate leading-tight">
                {destinationName}
              </h4>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1 truncate">
                <Sun className="h-2.5 w-2.5 text-amber-500 shrink-0" />
                {tempCelsius}°C • {regionName}
              </span>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Guardar Favorito */}
            <FavoriteButton
              id={destinationId}
              type="destino"
              name={destinationName}
              image={heroImage}
              location={regionName}
              variant="icon"
              size="sm"
              className="h-9 w-9 rounded-full bg-muted/80 text-foreground border border-border"
            />

            {/* Compartir */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
              className="h-9 w-9 rounded-full bg-muted/80 text-foreground border border-border"
              title="Compartir"
            >
              <Share2 className="h-4 w-4" />
            </Button>

            {/* Guía WhatsApp */}
            <Button
              size="sm"
              onClick={handleOpenWhatsApp}
              className="h-9 px-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1 shadow-sm"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>Guía</span>
            </Button>

            {/* GPS / Cómo Llegar */}
            <Button
              size="sm"
              onClick={() => setIsGpsModalOpen(true)}
              className="h-9 px-3 rounded-full text-xs font-bold gap-1 shadow-sm"
            >
              <Navigation className="h-3.5 w-3.5" />
              <span>GPS</span>
            </Button>
          </div>

        </div>
      </div>

      {/* Modal de Navegación GPS Móvil */}
      <Dialog open={isGpsModalOpen} onOpenChange={setIsGpsModalOpen}>
        <DialogContent className="max-w-xs rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-lg flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" /> Cómo llegar a {destinationName}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Elige tu aplicación de mapas preferida para trazar la ruta en tiempo real.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 pt-2">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2.5 h-11 rounded-2xl text-xs font-semibold"
              onClick={() => {
                window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destinationName + ", Republica Dominicana")}`, "_blank");
                setIsGpsModalOpen(false);
              }}
            >
              <span className="text-base">🗺️</span> Google Maps
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start gap-2.5 h-11 rounded-2xl text-xs font-semibold"
              onClick={() => {
                window.open(`https://waze.com/ul?q=${encodeURIComponent(destinationName + " Republica Dominicana")}`, "_blank");
                setIsGpsModalOpen(false);
              }}
            >
              <span className="text-base">🚗</span> Waze Navigation
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start gap-2.5 h-11 rounded-2xl text-xs font-semibold"
              onClick={() => {
                window.open(`http://maps.apple.com/?q=${encodeURIComponent(destinationName + ", Dominican Republic")}`, "_blank");
                setIsGpsModalOpen(false);
              }}
            >
              <span className="text-base">🍏</span> Apple Maps
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default DestinationMobileQuickBar;
