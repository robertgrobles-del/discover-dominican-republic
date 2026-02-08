import { motion } from "framer-motion";
import { Star, ChevronRight, MapPin, Clock, Wine, Utensils, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Badge } from "@/components/ui/badge";
import { LazyImage } from "@/components/ui/lazy-image";
import gastronomyImg from "@/assets/gastronomy.jpg";
import divingImg from "@/assets/diving.jpg";
import laBanderaImg from "@/assets/la-bandera.jpg";
import beachCategoryImg from "@/assets/beach-category.jpg";

// Restaurante patrocinado destacado
const sponsoredRestaurant = {
  id: "sponsored-restaurant",
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

const restaurants = [
  {
    id: "sabor-premium",
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

const bars = [
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

function RestaurantCard({ restaurant, index }: { restaurant: RestaurantType; index: number }) {
  return (
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
              Patrocinado
            </Badge>
          )}
          <span className="bg-background/80 backdrop-blur-sm text-foreground text-xs font-medium px-2 py-1 rounded">
            {restaurant.cuisine}
          </span>
          {restaurant.openNow && (
            <span className="bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-medium px-2 py-1 rounded flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Abierto
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
          <span className="font-medium text-foreground">Especialidad:</span> {restaurant.speciality}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Link to={`/restaurante/${restaurant.id}`}>
            <Button size="sm" className="gap-1">
              <Utensils className="h-3.5 w-3.5" />
              Reservar Mesa
            </Button>
          </Link>
          <Link to={`/restaurante/${restaurant.id}`}>
            <Button size="sm" variant="ghost" className="gap-1">
              Ver Menú
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
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

function BarCard({ bar, index }: { bar: BarType; index: number }) {
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
            Patrocinado
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
  return (
    <>
      {/* Restaurants Section */}
      <section className="min-h-screen flex flex-col justify-center bg-background py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 text-muted-foreground text-sm font-medium mb-3">
                <span className="w-8 h-px bg-border" />
                Sabores del Caribe
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold">
                Restaurantes <span className="text-gradient">Destacados</span>
              </h2>
              <p className="text-muted-foreground mt-3 max-w-lg">
                Una experiencia gastronómica que fusiona tradición caribeña con técnicas contemporáneas.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Link to="/guia-gastronomica">
                <Button variant="link" className="text-primary gap-2">
                  Ver guía gastronómica
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[sponsoredRestaurant, ...restaurants].map((restaurant, index) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Bars Section */}
      <section className="relative min-h-screen flex flex-col justify-center bg-card py-16">
        {/* Left Skyscraper Ad */}
        <div className="hidden 2xl:block absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <div className="w-[160px] h-[600px] rounded-lg overflow-hidden shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=160&h=600&fit=crop" 
              alt="Publicidad cócteles"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">Publicidad</span>
          </div>
        </div>

        {/* Right Skyscraper Ad */}
        <div className="hidden 2xl:block absolute right-4 top-1/2 -translate-y-1/2 z-10">
          <div className="w-[160px] h-[600px] rounded-lg overflow-hidden shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=160&h=600&fit=crop" 
              alt="Publicidad vida nocturna"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">Publicidad</span>
          </div>
        </div>
        <div className="container mx-auto px-4 lg:px-8 2xl:px-48">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 text-muted-foreground text-sm font-medium mb-3">
                <span className="w-8 h-px bg-border" />
                Vida Nocturna
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold">
                Bares <span className="text-gradient">Recomendados</span>
              </h2>
              <p className="text-muted-foreground mt-3 max-w-lg">
                Desde cócteles artesanales hasta noches de merengue bajo las estrellas.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Link to="/vida-nocturna">
                <Button variant="link" className="text-primary gap-2">
                  Explorar vida nocturna
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[sponsoredBar, ...bars.slice(0, 2)].map((bar, index) => (
              <BarCard key={bar.id} bar={bar} index={index} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
