import { motion } from "framer-motion";
import { Star, ChevronRight, MapPin, Clock, Wine, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import gastronomyImg from "@/assets/gastronomy.jpg";
import divingImg from "@/assets/diving.jpg";
import laBanderaImg from "@/assets/la-bandera.jpg";
import beachCategoryImg from "@/assets/beach-category.jpg";

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
  {
    id: "blue-mall-steak",
    name: "Prime Blue",
    rating: 4.8,
    location: "Blue Mall, Punta Cana",
    cuisine: "Steakhouse Premium",
    priceRange: "$$$$",
    image: beachCategoryImg,
    openNow: false,
    speciality: "Tomahawk Steak",
  },
];

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
];

function RestaurantCard({ restaurant, index }: { restaurant: typeof restaurants[0]; index: number }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group bg-surface rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-primary/5 transition-all"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {!imageLoaded && <Skeleton className="absolute inset-0 w-full h-full" />}
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
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
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
          <Star className="h-3 w-3 fill-current" />
          {restaurant.rating}
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

function BarCard({ bar, index }: { bar: typeof bars[0]; index: number }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer"
    >
      {!imageLoaded && <Skeleton className="absolute inset-0 w-full h-full" />}
      <img
        src={bar.image}
        alt={bar.name}
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setImageLoaded(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
      
      <div className="absolute top-4 left-4 flex gap-2">
        <span className="bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
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
      <section className="py-20 bg-background">
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
            {restaurants.map((restaurant, index) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Bars Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 lg:px-8">
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
            {bars.map((bar, index) => (
              <BarCard key={bar.id} bar={bar} index={index} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
