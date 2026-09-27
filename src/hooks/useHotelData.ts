import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getHotelBySlug } from "@/data/hotels";
import { getEnrichedHotelBySlug } from "@/data/provinceEnrichment";

export function useHotelData(id: string | undefined) {
  const [dbHotel, setDbHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const staticHotelRaw = id ? getHotelBySlug(id) : undefined;
  const enrichedHotel = (!staticHotelRaw && id) ? getEnrichedHotelBySlug(id) : null;
  const staticHotel = staticHotelRaw || (enrichedHotel ? {
    id: enrichedHotel.id,
    name: enrichedHotel.name,
    slug: enrichedHotel.slug,
    destinationId: "republica-dominicana",
    destinationName: enrichedHotel.address.split(",").pop()?.trim() || "República Dominicana",
    province: enrichedHotel.address.split(",").pop()?.trim() || "República Dominicana",
    category: (enrichedHotel.category?.toLowerCase().includes("boutique") ? "boutique" : enrichedHotel.category?.toLowerCase().includes("eco") ? "eco-lodge" : "resort") as any,
    stars: 5,
    rating: enrichedHotel.rating || 4.85,
    reviewCount: 148,
    priceRange: enrichedHotel.priceRange || "$$$",
    pricePerNight: enrichedHotel.priceRange === "$$$" ? 220 : 140,
    imageUrl: enrichedHotel.imageUrl,
    gallery: [
      enrichedHotel.imageUrl,
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80",
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80"
    ],
    amenities: ["Piscina infinita", "Spa", "Wifi gratuito", "Restaurante gourmet", "Desayuno incluido", "Room service 24h", "Playa privada"],
    shortDescription: enrichedHotel.shortDescription,
    description: `${enrichedHotel.shortDescription} Ubicado en un entorno privilegiado de ${enrichedHotel.address}, este exclusivo alojamiento ofrece una experiencia de confort inigualable con gastronomía de autor, habitaciones de lujo y excursiones guiadas por los atractivos más espectaculares de la región.`,
    isFeatured: true,
  } as any : undefined);

  useEffect(() => {
    async function fetchHotel() {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}/.test(id);
        const query = supabase.from("hotels").select("*, destinations(name, slug)");
        if (isUuid) {
          query.or(`slug.eq.${id},id.eq.${id}`);
        } else {
          query.eq("slug", id);
        }
        const { data } = await query.maybeSingle();
        setDbHotel(data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchHotel();
  }, [id]);

  return {
    staticHotel,
    dbHotel,
    loading
  };
}
