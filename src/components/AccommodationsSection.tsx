import { motion } from "framer-motion";
import { Star, ChevronRight, Home, Users, Sparkles, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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

const hotels = [
  {
    id: "eden-roc-cap-cana",
    name: "Eden Roc Cap Cana",
    rating: 4.9,
    location: "Punta Cana",
    description: "Suites exclusivas y villa privadas con piscinas personalizadas. El epítome del lujo y la exclusividad en la costa este del Caribe.",
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
    description: "Hotel boutique modernidad colonial fusion. La mejor ubicación en el corazón histórico de la ciudad.",
    price: 210,
    image: hotelBilliniImg,
    tags: ["Boutique", "Colonial"],
  },
];

// Airbnb patrocinado destacado
const sponsoredAirbnb = {
  id: "sponsored-airbnb",
  name: "Penthouse Oceanview",
  rating: 4.98,
  location: "Cap Cana, Punta Cana",
  description: "Penthouse de lujo con terraza privada de 200m², piscina infinita y vistas panorámicas al océano. El mejor alojamiento exclusivo del Caribe.",
  price: 650,
  image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
  tags: ["Penthouse", "Océano"],
  guests: 6,
  host: "Superhost",
  isSponsored: true,
};

const airbnbs = [
  {
    id: "villa-oceanica-punta-cana",
    name: "Villa Oceánica",
    rating: 4.95,
    location: "Punta Cana",
    description: "Villa frente al mar con piscina infinita, 4 habitaciones y servicio de chef privado. Perfecta para grupos.",
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
    description: "Refugio acogedor rodeado de pinos con chimenea, jacuzzi al aire libre y vistas espectaculares a los valles.",
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
}

function AccommodationCard({ item, type }: AccommodationCardProps) {
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
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
          {item.isSponsored && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1">
              <Megaphone className="h-3 w-3" />
              Patrocinado
            </Badge>
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
              <Sparkles className="h-3 w-3" />
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
                  {item.guests} huéspedes
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
            <span className="text-sm text-muted-foreground">/noche</span>
          </div>
          <Link to={`/alojamiento/${item.id}`}>
            <Button size="sm" variant={isAirbnb ? "default" : "outline"}>
              {isAirbnb ? "Reservar" : "Ver Disponibilidad"}
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function AccommodationsSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center bg-card py-16">
      {/* Left Skyscraper Ad */}
      <div className="hidden 2xl:block absolute left-4 top-1/2 -translate-y-1/2 z-10">
        <div className="w-[160px] h-[600px] rounded-lg overflow-hidden shadow-lg">
          <img 
            src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=160&h=600&fit=crop" 
            alt="Publicidad hoteles de lujo"
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">Publicidad</span>
        </div>
      </div>

      {/* Right Skyscraper Ad */}
      <div className="hidden 2xl:block absolute right-4 top-1/2 -translate-y-1/2 z-10">
        <div className="w-[160px] h-[600px] rounded-lg overflow-hidden shadow-lg">
          <img 
            src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=160&h=600&fit=crop" 
            alt="Publicidad resorts"
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">Publicidad</span>
        </div>
      </div>
      <div className="container mx-auto px-4 lg:px-8 2xl:px-48">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 text-muted-foreground text-sm font-medium mb-3">
              <span className="w-8 h-px bg-border" />
              Estancia Exclusiva
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Alojamientos <span className="text-gradient">Destacados</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg">
              Una selección curada de lujo, confort y experiencias auténticas.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link to="/alojamientos">
              <Button variant="link" className="text-primary gap-2">
                Ver todos los alojamientos
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="todos" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="hoteles">Hoteles</TabsTrigger>
            <TabsTrigger value="airbnb" className="gap-2">
              <Home className="h-4 w-4" />
              Airbnb
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todos">
            <div className="grid md:grid-cols-3 gap-6">
              {[sponsoredHotel, hotels[0], airbnbs[0]].map((item, index) => (
                <AccommodationCard
                  key={item.id}
                  item={item}
                  type={item.id.includes('airbnb') || airbnbs.some(a => a.id === item.id) ? "airbnb" : "hotel"}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hoteles">
            <div className="grid md:grid-cols-3 gap-6">
              {[sponsoredHotel, ...hotels].map((hotel) => (
                <AccommodationCard key={hotel.id} item={hotel} type="hotel" />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="airbnb">
            <div className="grid md:grid-cols-3 gap-6">
              {[sponsoredAirbnb, ...airbnbs].map((airbnb) => (
                <AccommodationCard key={airbnb.id} item={airbnb} type="airbnb" />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}