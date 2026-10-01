import { motion } from "framer-motion";
import { Star, ChevronRight, Home, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SponsoredBadge } from "@/components/promo/SponsoredBadge";
import { LazyImage } from "@/components/ui/lazy-image";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "@/hooks/useI18n";
import hotelEdenRocImg from "@/assets/hotel-eden-roc.jpg";
import hotelClareVerdeImg from "@/assets/hotel-clare-verde.jpg";
import hotelBilliniImg from "@/assets/hotel-billini.jpg";

// Hotel patrocinado destacado
const sponsoredHotel = {
  id: "sponsored-hotel",
  name: "Secrets Cap Cana Resort & Spa",
  rating: 4.9,
  location: "Cap Cana, Punta Cana",
  description: "Resort todo incluido solo para adultos. Suites de lujo frente al mar con servicio personalizado y gastronomía de clase mundial.",
  price: 520,
  originalPrice: 650,
  image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
  tags: ["Todo Incluido", "Solo Adultos"],
  isSponsored: true,
};

const staticHotels = [
  {
    id: "eden-roc-cap-cana",
    name: "Eden Roc Cap Cana",
    rating: 4.9,
    location: "Punta Cana",
    description: "Suites exclusivas y villa privadas con piscinas personalizadas.",
    price: 485,
    originalPrice: 580,
    image: hotelEdenRocImg,
    tags: ["Lujo", "Playa"],
  },
  {
    id: "billini-hotel",
    name: "Billini Hotel",
    rating: 4.8,
    location: "Santo Domingo",
    description: "Hotel boutique modernidad colonial fusion.",
    price: 210,
    image: hotelBilliniImg,
    tags: ["Boutique", "Colonial"],
  },
];

const staticAirbnbs = [
  {
    id: "villa-oceanica-punta-cana",
    name: "Villa Oceánica",
    rating: 4.95,
    location: "Punta Cana",
    description: "Villa frente al mar con piscina infinita, 4 habitaciones y servicio de chef privado.",
    price: 350,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
    tags: ["Villa", "Frente al Mar"],
    guests: 8,
    host: "Superhost",
  },
  {
    id: "cabana-montana-jarabacoa",
    name: "Cabaña en la Montaña",
    rating: 4.92,
    location: "Jarabacoa",
    description: "Refugio acogedor rodeado de pinos con chimenea, jacuzzi al aire libre.",
    price: 120,
    image: "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800",
    tags: ["Cabaña", "Montaña"],
    guests: 4,
    host: "Superhost",
  },
];

interface AccommodationItem {
  id: string;
  name: string;
  rating: number;
  location: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  tags: string[];
  guests?: number;
  host?: string;
  isSponsored?: boolean;
}

interface AccommodationCardProps {
  item: AccommodationItem;
  type: "hotel" | "airbnb";
  t: (key: string) => string;
}

function AccommodationCard({ item, type, t }: AccommodationCardProps) {
  const isAirbnb = type === "airbnb";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`group bg-surface rounded-2xl overflow-hidden hover:bg-surface-elevated transition-all hover:shadow-xl hover:shadow-primary/5 ${
        item.isSponsored ? 'ring-2 ring-primary/50' : ''
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <LazyImage
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          containerClassName="w-full h-full"
        />
        <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
          {item.isSponsored && (
            <SponsoredBadge label={t("accommodations.sponsored")} />
          )}
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="bg-background/80 backdrop-blur-sm text-foreground text-xs font-medium px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {isAirbnb && item.host === "Superhost" && (
            <div className="flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
              <Award className="h-3 w-3" />
              Superhost
            </div>
          )}
          <div className="flex items-center gap-1 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded">
            <Star className="h-3 w-3 fill-current" />
            {item.rating}
          </div>
          <FavoriteButton
            id={item.id}
            type="hotel"
            name={item.name}
            image={item.image}
            location={item.location}
            size="sm"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
              {item.name}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              {isAirbnb && <Home className="h-3 w-3" />}
              {item.location}
              {isAirbnb && item.guests && (
                <span className="flex items-center gap-1 ml-2">
                  <Users className="h-3 w-3" />
                  {item.guests} {t("accommodations.guests")}
                </span>
              )}
            </p>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {item.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            {item.originalPrice && (
              <span className="text-sm text-muted-foreground line-through mr-2">
                ${item.originalPrice}
              </span>
            )}
            <span className="text-xl font-bold text-foreground">${item.price}</span>
            <span className="text-sm text-muted-foreground">{t("accommodations.perNight")}</span>
          </div>
          <Link to={`/alojamiento/${item.id}`}>
            <Button size="sm" variant={isAirbnb ? "default" : "outline"}>
              {isAirbnb ? t("accommodations.book") : t("accommodations.checkAvailability")}
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function AccommodationsSection() {
  const { t } = useTranslation();
  const { data: dbHotels } = useQuery({
    queryKey: ['home-hotels'],
    queryFn: async () => {
      const { data } = await supabase.from('hotels').select('*').eq('is_active', true).order('is_featured', { ascending: false }).limit(6);
      return data || [];
    },
  });

  const { data: dbAirbnbs } = useQuery({
    queryKey: ['home-airbnbs'],
    queryFn: async () => {
      const { data } = await supabase.from('airbnb_listings').select('*').eq('is_active', true).order('is_featured', { ascending: false }).limit(6);
      return data || [];
    },
  });

  const hotels = useMemo(() => {
    const items = [...staticHotels];
    const ids = new Set(items.map(h => h.id));
    (dbHotels || []).forEach(h => {
      if (!ids.has(h.slug || h.id)) {
        items.push({
          id: h.slug || h.id,
          name: h.name,
          rating: Number(h.rating) || 0,
          location: h.address || '',
          description: h.short_description || '',
          price: 0,
          image: h.image_url || '/placeholder.svg',
          tags: [h.category || 'Hotel'].filter(Boolean),
        });
      }
    });
    return items;
  }, [dbHotels]);

  const airbnbs = useMemo(() => {
    const items = [...staticAirbnbs];
    const ids = new Set(items.map(a => a.id));
    (dbAirbnbs || []).forEach(a => {
      if (!ids.has(a.slug || a.id)) {
        items.push({
          id: a.slug || a.id,
          name: a.name,
          rating: Number(a.rating) || 0,
          location: a.address || '',
          description: a.short_description || '',
          price: Number(a.price_per_night) || 0,
          image: a.image_url || '/placeholder.svg',
          tags: [a.property_type || 'Alojamiento'].filter(Boolean),
          guests: a.guests || 2,
          host: a.is_superhost ? "Superhost" : undefined,
        });
      }
    });
    return items;
  }, [dbAirbnbs]);

  const sponsoredAirbnb = {
    id: "sponsored-airbnb",
    name: "Penthouse Oceanview",
    rating: 4.98,
    location: "Cap Cana, Punta Cana",
    description: "Penthouse de lujo con terraza privada de 200m², piscina infinita y vistas panorámicas al océano.",
    price: 650,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    tags: ["Penthouse", "Océano"],
    guests: 6,
    host: "Superhost",
    isSponsored: true,
  };

  return (
    <section className="relative bg-card py-16">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 text-muted-foreground text-sm font-medium mb-3">
              <span className="w-8 h-px bg-border" />
              {t("accommodations.exclusive")}
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              {t("accommodations.title")} <span className="text-gradient">{t("accommodations.featured")}</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg">
              {t("accommodations.subtitle")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link to="/alojamientos">
              <Button variant="link" className="text-primary gap-2">
                {t("accommodations.viewAll")}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="todos" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="todos">{t("accommodations.all")}</TabsTrigger>
            <TabsTrigger value="hoteles">{t("accommodations.hotels")}</TabsTrigger>
            <TabsTrigger value="airbnb" className="gap-2">
              <Home className="h-4 w-4" />
              Airbnb
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todos">
            <div className="grid md:grid-cols-3 gap-6">
              {[sponsoredHotel, hotels[0], airbnbs[0]].filter(Boolean).map((item) => (
                <AccommodationCard
                  key={item.id}
                  item={item}
                  type={airbnbs.some(a => a.id === item.id) ? "airbnb" : "hotel"}
                  t={t}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hoteles">
            <div className="grid md:grid-cols-3 gap-6">
              {[sponsoredHotel, ...hotels].map((hotel) => (
                <AccommodationCard key={hotel.id} item={hotel} type="hotel" t={t} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="airbnb">
            <div className="grid md:grid-cols-3 gap-6">
              {[sponsoredAirbnb, ...airbnbs].map((airbnb) => (
                <AccommodationCard key={airbnb.id} item={airbnb} type="airbnb" t={t} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
