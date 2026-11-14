import { motion } from "framer-motion";
import { HOME_SECTION_FRAME, SectionWithSideAds } from "@/components/SectionWithSideAds";
import { Star, ChevronRight, MapPin, Clock, Wine, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Badge } from "@/components/ui/badge";
import { LazyImage } from "@/components/ui/lazy-image";
import { supabase } from "@/integrations/supabase/client";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { fetchApi } from "@/lib/fastifyClient";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "@/hooks/useI18n";
import { useTrackedBanner } from "@/hooks/useAdBanners";
import gastronomyImg from "@/assets/gastronomy.jpg";
import divingImg from "@/assets/diving.jpg";
import laBanderaImg from "@/assets/la-bandera.jpg";
import beachCategoryImg from "@/assets/beach-category.jpg";
import { SponsoredBadge } from "@/components/promo/SponsoredBadge";

// Restaurante patrocinado destacado
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
const staticBars = [
  {
    id: "la-terraza-lounge",
    slug: "lulu-tasting-bar",
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
    slug: "onno-s",
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
    slug: "la-zona-colonial-pub",
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
    slug: "coco-bongo-punta-cana",
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
  adUrl?: string;
  onAdClick?: () => void;
}

function RestaurantCard({ restaurant, index, t }: { restaurant: RestaurantType; index: number; t: (key: string) => string }) {
  const restaurantLink = restaurant.slug ? `/restaurante/${restaurant.slug}` : '/restaurante';
  
  return (
    <Link to={restaurant.adUrl || restaurantLink} onClick={restaurant.onAdClick}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        className={`group bg-surface rounded-2xl overflow-hidden cursor-pointer hover:shadow-sm hover:shadow-primary/5 transition-all ${
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
              <SponsoredBadge label={t("accommodations.sponsored")} />
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
            {restaurant.rating > 0 && (<div className="flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
              <Star className="h-3 w-3 fill-current" />
              {restaurant.rating}
            </div>)}
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
  slug?: string;
  name: string;
  rating: number;
  location: string;
  type: string;
  specialty: string;
  image: string;
  atmosphere: string;
  isSponsored?: boolean;
  adUrl?: string;
  onAdClick?: () => void;
}

function BarCard({ bar, index, t }: { bar: BarType; index: number; t: (key: string) => string }) {
  const barLink = bar.slug ? `/bar/${bar.slug}` : '/vida-nocturna';

  return (
    <Link to={bar.adUrl || barLink} onClick={bar.onAdClick} className="block group">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05 }}
        className={`relative h-[360px] lg:h-[390px] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-sm transition-all ${
          bar.isSponsored ? 'ring-2 ring-primary/50' : 'border border-border/60'
        }`}
      >
        <LazyImage
          src={bar.image}
          alt={bar.name}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
          containerClassName="absolute inset-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 transition-opacity" />
        
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {bar.isSponsored && (
            <SponsoredBadge label={t("accommodations.sponsored")} className="text-2xs py-0.5 px-2 w-fit shadow-xs" />
          )}
          <span className="bg-primary/90 backdrop-blur-md text-primary-foreground text-2xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit shadow-xs">
            <Wine className="h-3 w-3" />
            {bar.type}
          </span>
        </div>

        {bar.rating > 0 && (<div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-black/60 backdrop-blur-md text-white text-2xs font-bold px-2 py-0.5 rounded-md border border-white/10 shadow-xs">
          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
          {bar.rating}
        </div>)}

        <div className="absolute inset-x-0 bottom-0 p-4 z-10 space-y-2">
          <div>
            <span className="inline-block bg-white/15 backdrop-blur-md text-slate-200 text-3xs font-medium px-2 py-0.5 rounded mb-1.5 border border-white/10">
              {bar.atmosphere}
            </span>
            <h3 className="font-display text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors leading-tight drop-shadow-sm">
              {bar.name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-slate-300">
              <MapPin className="h-3 w-3 text-primary shrink-0" />
              <span className="truncate">{bar.location}</span>
            </div>
            <p className="text-xs text-amber-300 font-medium truncate mt-1">
              🍹 {bar.specialty}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/15">
            <span className="text-2xs font-semibold text-white/90 group-hover:text-primary transition-colors flex items-center gap-1">
              Ver Horario & Reservar VIP
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
            <span className="text-3xs bg-white/20 text-white px-2 py-0.5 rounded-full">
              Entrada 18+
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export function RestaurantsBarsSection() {
  const { t } = useTranslation();
  // Tarjetas patrocinadas: sólo con campaña en el admin (banner_type "native-card", placement "native"); sin ella la
  // posición la ocupa un negocio normal. Nunca se marca como patrocinado a quien no ha contratado.
  const restAd = useTrackedBanner({ section: "home-restaurantes-card", bannerType: "native-card", placement: "native" });
  const barAd = useTrackedBanner({ section: "home-bares-card", bannerType: "native-card", placement: "native" });
  const adRestaurant: RestaurantType | null = restAd.banner && restAd.banner.image_url ? { id: `ad-${restAd.banner.id}`, name: restAd.banner.headline || restAd.banner.name, rating: 0, location: restAd.banner.sponsor || "", cuisine: restAd.banner.subtext || "", priceRange: "", image: restAd.banner.image_url, openNow: false, speciality: restAd.banner.cta_text || "", isSponsored: true, adUrl: restAd.banner.target_url || undefined, onAdClick: restAd.trackClick } : null;
  const adBar: BarType | null = barAd.banner && barAd.banner.image_url ? { id: `ad-${barAd.banner.id}`, name: barAd.banner.headline || barAd.banner.name, rating: 0, location: barAd.banner.sponsor || "", type: barAd.banner.subtext || "", specialty: barAd.banner.cta_text || "", image: barAd.banner.image_url, atmosphere: "", isSponsored: true, adUrl: barAd.banner.target_url || undefined, onAdClick: barAd.trackClick } : null;
  const { data: dbRestaurants } = useQuery({
    queryKey: ['home-restaurants'],
    queryFn: async () => {
      if (HAS_BACKEND_SESSION) {
        const res = await fetchApi<{ data: any[] }>('/restaurants?per_page=4');
        return res.data || [];
      }
      const { data } = await supabase.from('restaurants').select('*').eq('is_active', true).eq('is_featured', true).limit(4);
      return data || [];
    },
  });

  const { data: dbBars } = useQuery({
    queryKey: ['home-bars'],
    queryFn: async () => {
      if (HAS_BACKEND_SESSION) {
        const res = await fetchApi<{ data: any[] }>('/bars?per_page=4');
        return res.data || [];
      }
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
          slug: b.slug || b.id,
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
      <section className="bg-background py-14 lg:py-20">
        <div className={HOME_SECTION_FRAME}>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold text-balance">
                {t("restaurants.title")} <span className="text-primary">{t("restaurants.featured")}</span>
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
              <Button variant="link" className="text-primary gap-2" asChild>
                <Link to="/restaurante">
                  {t("restaurants.viewAll")}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>

          <SectionWithSideAds section="home-restaurantes">
            <div className="grid md:grid-cols-3 gap-6">
              {[...(adRestaurant ? [adRestaurant] : []), ...restaurants].slice(0, 3).map((restaurant, index) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} index={index} t={t} />
              ))}
            </div>
          </SectionWithSideAds>
        </div>
      </section>

      {/* Bars Section (Ocupa el 100vh en escritorio con Skyscrapers laterales de 120x600) */}
      <section className="relative bg-muted/40 py-14 lg:py-20 overflow-hidden">
        <div className={`${HOME_SECTION_FRAME} py-6`}>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-2">
                <span className="w-6 h-px bg-primary" />
                {t("bars.nightlife")}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground text-balance">
                {t("bars.title")} <span className="text-primary">{t("bars.recommended")}</span>
              </h2>
              <p className="text-muted-foreground mt-1.5 text-xs sm:text-sm max-w-lg">
                {t("bars.subtitle")}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Button variant="link" className="text-primary gap-1.5 text-xs sm:text-sm font-semibold p-0" asChild>
                <Link to="/vida-nocturna">
                  {t("bars.exploreNightlife")}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Skyscrapers en pareja (120x600) a los lados de las cards */}
          <SectionWithSideAds section="home-bares">

            {/* Cuadrícula Central de Cards de Bares */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 lg:gap-6 items-center">
              {[...(adBar ? [adBar] : []), ...bars].slice(0, 3).map((bar, index) => (
                <BarCard key={bar.id} bar={bar} index={index} t={t} />
              ))}
            </div>

          </SectionWithSideAds>
        </div>
      </section>
    </>
  );
}
