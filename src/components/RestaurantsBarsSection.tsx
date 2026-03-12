import { motion } from "framer-motion";
import { Star, ChevronRight, MapPin, Clock, Wine, Utensils, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Badge } from "@/components/ui/badge";
import { LazyImage } from "@/components/ui/lazy-image";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "@/hooks/useI18n";
import gastronomyImg from "@/assets/gastronomy.jpg";
import divingImg from "@/assets/diving.jpg";
import laBanderaImg from "@/assets/la-bandera.jpg";
import beachCategoryImg from "@/assets/beach-category.jpg";

// Restaurante patrocinado destacado
const sponsoredRestaurant = {
  id: "sponsored-restaurant",
  slug: "la-yola-cap-cana",
  name: "La Casa del Chef",
  rating: 4.9,
  location: "Cap Cana, Punta Cana",
  cuisine: "Alta Cocina Caribeña",
  priceRange: "$$$$",
  image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
  openNow: true,
  speciality: "Menú Degustación 7 Tiempos",
  isSponsored: true,
};

const staticRestaurants = [
  {
    id: "sabor-premium",
    slug: "pat-e-palo",
    name: "Sabor Premium",
    rating: 4.9,
    location: "Zona Colonial, Santo Domingo",
    cuisine: "Cocina Fusión Caribeña",
    priceRange: "$$$",
    image: gastronomyImg,
    openNow: true,
    speciality: "Ceviche de Marlín",
  },
  {
    id: "el-conuco",
    slug: "meson-de-bari",
    name: "El Conuco Gourmet",
    rating: 4.7,
    location: "Piantini, Santo Domingo",
    cuisine: "Cocina Dominicana Tradicional",
    priceRange: "$$",
    image: laBanderaImg,
    openNow: true,
    speciality: "La Bandera Dominicana",
  },
];

// Bar patrocinado destacado
const sponsoredBar = {
  id: "sponsored-bar",
  name: "Oro Lounge",
  rating: 4.9,
  location: "Cap Cana, Punta Cana",
  type: "Premium Lounge",
  specialty: "Cócteles de Autor",
  image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800",
  atmosphere: "Ultra Exclusivo",
  isSponsored: true,
};

const staticBars = [
  {
    id: "la-terraza-lounge",
    name: "La Terraza Lounge",
    rating: 4.8,
    location: "Zona Colonial, Santo Domingo",
    type: "Rooftop Bar",
    specialty: "Cócteles Artesanales",
    image: divingImg,
    atmosphere: "Elegante",
  },
  {
    id: "blue-mall-sky",
    name: "Sky Bar RD",
    rating: 4.6,
    location: "Punta Cana",
    type: "Beach Bar",
    specialty: "Mojitos de Frutas",
    image: beachCategoryImg,
    atmosphere: "Tropical",
  },
  {
    id: "merengue-club",
    name: "Club Merengue",
    rating: 4.5,
    location: "Malecón, Santo Domingo",
    type: "Night Club",
    specialty: "Mamajuana Premium",
    image: gastronomyImg,
    atmosphere: "Vibrante",
  },
  {
    id: "coco-bongo-rd",
    name: "Coco Bongo",
    rating: 4.9,
    location: "Bávaro, Punta Cana",
    type: "Mega Club",
    specialty: "Shows en Vivo",
    image: laBanderaImg,
    atmosphere: "Fiesta Total",
  },
];

interface RestaurantType {
  id: string;
  slug?: string;
  name: string;
  rating: number;
  location: string;
  cuisine: string;
  priceRange: string;
  image: string;
  openNow: boolean;
  speciality: string;
  isSponsored?: boolean;
}

function RestaurantCard({ restaurant, index, t }: { restaurant: RestaurantType; index: number; t: (key: string) => string }) {
  const restaurantLink = restaurant.slug ? `/restaurante/${restaurant.slug}` : '/restaurante';
  
  return (
    <Link to={restaurantLink}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        className={`group bg-surface rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-primary/5 transition-all ${
          restaurant.isSponsored ? 'ring-2 ring-primary/50' : ''
        }`}
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <LazyImage
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            containerClassName="w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            {restaurant.isSponsored && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1">
                <Megaphone className="h-3 w-3" />
                {t("accommodations.sponsored")}
              </Badge>
            )}
            <span className="bg-background/80 backdrop-blur-sm text-foreground text-xs font-medium px-2 py-1 rounded">
              {restaurant.cuisine}
            </span>
            {restaurant.openNow && (
              <span className="bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-medium px-2 py-1 rounded flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {t("restaurants.open")}
              </span>
            )}
          </div>
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <div className="flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
              <Star className="h-3 w-3 fill-current" />
              {restaurant.rating}
            </div>
            <FavoriteButton
              id={restaurant.id}
              type="restaurante"
              name={restaurant.name}
              image={restaurant.image}
              location={restaurant.location}
              size="sm"
            />
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                {restaurant.name}
              </h3>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {restaurant.location}
              </div>
            </div>
            <span className="text-primary font-bold">{restaurant.priceRange}</span>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            <span className="font-medium text-foreground">{t("restaurants.specialty")}</span> {restaurant.speciality}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button size="sm" className="gap-1">
              <Utensils className="h-3.5 w-3.5" />
              {t("restaurants.bookTable")}
            </Button>
            <Button size="sm" variant="ghost" className="gap-1">
              {t("restaurants.viewMenu")}
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

interface BarType {
  id: string;
  name: string;
  rating: number;
  location: string;
  type: string;
  specialty: string;
  image: string;
  atmosphere: string;
  isSponsored?: boolean;
}

function BarCard({ bar, index, t }: { bar: BarType; index: number; t: (key: string) => string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className={`group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer ${
        bar.isSponsored ? 'ring-2 ring-primary/50' : ''
      }`}
    >
      <LazyImage
        src={bar.image}
        alt={bar.name}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
        containerClassName="absolute inset-0"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
      
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        {bar.isSponsored && (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1 w-fit">
            <Megaphone className="h-3 w-3" />
            {t("accommodations.sponsored")}
          </Badge>
        )}
        <span className="bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
          <Wine className="h-3 w-3" />
          {bar.type}
        </span>
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-1 bg-background/80 backdrop-blur-sm text-foreground text-xs font-bold px-2 py-1 rounded">
        <Star className="h-3 w-3 text-primary fill-primary" />
        {bar.rating}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5">
        <span className="inline-block bg-surface/60 backdrop-blur-sm text-muted-foreground text-xs px-2 py-1 rounded mb-2">
          {bar.atmosphere}
        </span>
        <h3 className="font-display text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
          {bar.name}
        </h3>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
          <MapPin className="h-3.5 w-3.5" />
          {bar.location}
        </div>
        <p className="text-sm text-primary font-medium">
          🍹 {bar.specialty}
        </p>
      </div>
    </motion.div>
  );
}

export function RestaurantsBarsSection() {
  const { t } = useTranslation();
  const { data: dbRestaurants } = useQuery({
    queryKey: ['home-restaurants'],
    queryFn: async () => {
      const { data } = await supabase.from('restaurants').select('*').eq('is_active', true).eq('is_featured', true).limit(4);
      return data || [];
    },
  });

  const { data: dbBars } = useQuery({
    queryKey: ['home-bars'],
    queryFn: async () => {
      const { data } = await supabase.from('bars').select('*').eq('is_active', true).eq('is_featured', true).limit(4);
      return data || [];
    },
  });

  const restaurants = useMemo(() => {
    const items = [...staticRestaurants];
    const ids = new Set(items.map(r => r.id));
    (dbRestaurants || []).forEach(r => {
      if (!ids.has(r.slug || r.id)) {
        items.push({
          id: r.slug || r.id,
          slug: r.slug || r.id,
          name: r.name,
          rating: Number(r.rating) || 0,
          location: r.address || '',
          cuisine: r.cuisine_type || 'Cocina Dominicana',
          priceRange: r.price_range || '$$',
          image: r.image_url || '/placeholder.svg',
          openNow: true,
          speciality: (r.signature_dishes || [])[0] || r.short_description || '',
        });
      }
    });
    return items;
  }, [dbRestaurants]);

  const bars = useMemo(() => {
    const items = [...staticBars];
    const ids = new Set(items.map(b => b.id));
    (dbBars || []).forEach(b => {
      if (!ids.has(b.slug || b.id)) {
        items.push({
          id: b.slug || b.id,
          name: b.name,
          rating: Number(b.rating) || 0,
          location: b.address || '',
          type: b.bar_type || 'Bar',
          specialty: b.short_description || '',
          image: b.image_url || '/placeholder.svg',
          atmosphere: b.ambiance || 'Elegante',
        });
      }
    });
    return items;
  }, [dbBars]);

  return (
    <>
      {/* Restaurants Section */}
      <section className="bg-background py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 text-muted-foreground text-sm font-medium mb-3">
                <span className="w-8 h-px bg-border" />
                {t("restaurants.flavors")}
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold">
                {t("restaurants.title")} <span className="text-gradient">{t("restaurants.featured")}</span>
              </h2>
              <p className="text-muted-foreground mt-3 max-w-lg">
                {t("restaurants.subtitle")}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Link to="/restaurante">
                <Button variant="link" className="text-primary gap-2">
                  {t("restaurants.viewAll")}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[sponsoredRestaurant, ...restaurants].slice(0, 3).map((restaurant, index) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} index={index} t={t} />
            ))}
          </div>
        </div>
      </section>

      {/* Bars Section */}
      <section className="relative bg-card py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 text-muted-foreground text-sm font-medium mb-3">
                <span className="w-8 h-px bg-border" />
                {t("bars.nightlife")}
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold">
                {t("bars.title")} <span className="text-gradient">{t("bars.recommended")}</span>
              </h2>
              <p className="text-muted-foreground mt-3 max-w-lg">
                {t("bars.subtitle")}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Link to="/vida-nocturna">
                <Button variant="link" className="text-primary gap-2">
                  {t("bars.exploreNightlife")}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[sponsoredBar, ...bars.slice(0, 2)].map((bar, index) => (
              <BarCard key={bar.id} bar={bar} index={index} t={t} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
