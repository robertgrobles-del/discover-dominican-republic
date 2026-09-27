import { Restaurant } from "@/data/restaurants";
import { getRestaurantBySlug } from "@/data/restaurants";
import { getEnrichedRestaurantBySlug } from "@/data/provinceEnrichment";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const restaurantCategoryLabels: Record<string, string> = {
  'fine-dining': 'Alta Cocina & Autor',
  'casual': 'Cocina Casual Chic',
  'local': 'Gastronomía Criolla Dominicana',
  'seafood': 'Marisquería & Pescados del Día',
  'international': 'Cocina Internacional',
  'fusion': 'Fusión Caribeña Contemporánea',
};

export function useRestaurantData(slug: string | undefined) {
  const staticRestaurant = slug ? getRestaurantBySlug(slug) : null;
  const enrichedRestaurant = (!staticRestaurant && slug) ? getEnrichedRestaurantBySlug(slug) : null;

  const enrichedFallback: Restaurant | null = enrichedRestaurant ? {
    id: enrichedRestaurant.id,
    slug: enrichedRestaurant.slug,
    name: enrichedRestaurant.name,
    destinationId: "republica-dominicana",
    destinationName: enrichedRestaurant.address.split(",").pop()?.trim() || "República Dominicana",
    province: enrichedRestaurant.address.split(",").pop()?.trim() || "República Dominicana",
    cuisineType: [enrichedRestaurant.category || "Dominicana", "Criolla", "Mariscos & Parrilla"],
    category: "local",
    shortDescription: enrichedRestaurant.shortDescription,
    description: `${enrichedRestaurant.shortDescription} Ubicado en ${enrichedRestaurant.address}, este reconocido restaurante deleita a locales y viajeros con las recetas más emblemáticas de la cocina dominicana, ingredientes frescos de productores regionales y una cálida atención criolla.`,
    imageUrl: enrichedRestaurant.imageUrl,
    gallery: [
      enrichedRestaurant.imageUrl,
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80",
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80"
    ],
    signatureDishes: [
      "Plato Especial de la Casa",
      "Chivo Liniero al Ron Dominicano",
      "Pescado Fresco al Coco Samaná"
    ],
    priceRange: (enrichedRestaurant.priceRange as Restaurant['priceRange']) || '$$',
    rating: enrichedRestaurant.rating || 4.8,
    reviewCount: 94,
    address: enrichedRestaurant.address,
    phone: "+1 809-555-0198",
    email: "reservas@descubrerd.com",
    website: "https://descubrerd.com",
    openingHours: "Lunes a Domingo: 11:30 AM - 11:00 PM",
    services: ["Aire Acondicionado", "Terraza al Aire Libre", "Estacionamiento Privado", "Wi-Fi Gratuito", "Menú Infantil", "Música Dominicana"],
    isFeatured: true,
  } : null;

  const { data: dbRestaurant, isLoading } = useQuery({
    queryKey: ['restaurant', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', slug!)
        .eq('is_active', true)
        .single();
      if (error || !data) return null;
      return {
        id: data.id, slug: data.slug || data.id, name: data.name,
        destinationId: data.destination_id || '', destinationName: '', province: '',
        cuisineType: data.cuisine_type ? [data.cuisine_type] : [],
        category: (data.category as Restaurant['category']) || 'casual',
        shortDescription: data.short_description || '', description: data.description || '',
        imageUrl: data.image_url || '/placeholder.svg', gallery: data.gallery || [],
        signatureDishes: data.signature_dishes || [],
        priceRange: (data.price_range as Restaurant['priceRange']) || '$$',
        rating: Number(data.rating) || 0, reviewCount: data.review_count || 0,
        address: data.address || '', phone: data.phone || undefined,
        email: data.email || undefined, website: data.website || undefined,
        openingHours: data.opening_hours || '', services: data.services || [],
        latitude: data.latitude ? Number(data.latitude) : undefined,
        longitude: data.longitude ? Number(data.longitude) : undefined,
        isFeatured: data.is_featured || false,
      } as Restaurant;
    },
    enabled: !staticRestaurant && !enrichedFallback && !!slug,
  });

  return {
    restaurant: staticRestaurant || enrichedFallback || dbRestaurant,
    isLoading: !staticRestaurant && !enrichedFallback && isLoading
  };
}
