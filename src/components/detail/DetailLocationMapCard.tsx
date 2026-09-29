import React from "react";
import { MapPin, Navigation, Car, ExternalLink, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DetailLocationMapCardProps {
  address?: string;
  venue?: string;
  province?: string;
  coordinates?: { lat: number; lng: number };
  parkingNotes?: string;
  howToGetThereNotes?: string;
  locationName?: string;
  howToGetThere?: string;
  googleMapsQuery?: string;
}

export const DetailLocationMapCard: React.FC<DetailLocationMapCardProps> = ({
  address,
  venue,
  province,
  coordinates,
  parkingNotes,
  howToGetThereNotes,
}) => {
  if (!address && !venue && !coordinates) return null;

  const mapsQuery = coordinates
    ? `${coordinates.lat},${coordinates.lng}`
    : encodeURIComponent(`${venue || ""} ${address || ""} ${province || "República Dominicana"}`);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const wazeUrl = coordinates
    ? `https://waze.com/ul?ll=${coordinates.lat},${coordinates.lng}&navigate=yes`
    : `https://waze.com/ul?q=${mapsQuery}`;

  return (
    <div className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" /> Ubicación & Cómo Llegar
        </h3>
        {province && (
          <span className="text-xs bg-primary/10 text-primary font-bold px-3 py-1 rounded-full border border-primary/20">
            {province}
          </span>
        )}
      </div>

      <div className="space-y-2 text-xs">
        {venue && (
          <p className="font-bold text-sm text-foreground">
            {venue}
          </p>
        )}
        {address && (
          <p className="text-muted-foreground flex items-start gap-1.5 leading-relaxed">
            <span className="text-primary font-bold">📍</span> {address}
          </p>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-2xl text-xs h-10 font-bold border-border bg-muted/40 hover:bg-muted text-foreground gap-1.5"
          >
            <Navigation className="h-3.5 w-3.5 text-blue-500" /> Abrir Google Maps
          </Button>
        </a>

        <a
          href={wazeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-2xl text-xs h-10 font-bold border-border bg-muted/40 hover:bg-muted text-foreground gap-1.5"
          >
            <Compass className="h-3.5 w-3.5 text-cyan-500" /> Navegar con Waze
          </Button>
        </a>
      </div>

      {/* Parking or Transport note */}
      {(parkingNotes || howToGetThereNotes) && (
        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 text-xs text-muted-foreground space-y-1.5">
          {parkingNotes && (
            <p className="flex items-start gap-1.5 text-[11px]">
              <Car className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Parqueo:</strong> {parkingNotes}</span>
            </p>
          )}
          {howToGetThereNotes && (
            <p className="flex items-start gap-1.5 text-[11px]">
              <Navigation className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <span><strong>Acceso:</strong> {howToGetThereNotes}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};
