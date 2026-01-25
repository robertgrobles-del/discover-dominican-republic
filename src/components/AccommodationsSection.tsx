import { motion } from "framer-motion";
import { Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FavoriteButton } from "@/components/FavoriteButton";
import hotelEdenRocImg from "@/assets/hotel-eden-roc.jpg";
import hotelClareVerdeImg from "@/assets/hotel-clare-verde.jpg";
import hotelBilliniImg from "@/assets/hotel-billini.jpg";

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
    id: "clare-verde",
    name: "Clare Verde",
    rating: 4.7,
    location: "Samaná",
    description: "Eco-resort inmerso en naturaleza tropical. Tu opción de ecoturismo premium para vivir el auténtico Caribe.",
    price: 180,
    image: hotelClareVerdeImg,
    tags: ["Eco", "Naturaleza"],
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

export function AccommodationsSection() {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
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
                Ver todos los hoteles
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Hotel Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {hotels.map((hotel, index) => (
            <motion.div
              key={hotel.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-surface rounded-2xl overflow-hidden hover:bg-surface-elevated transition-all hover:shadow-xl hover:shadow-primary/5"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {hotel.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-background/80 backdrop-blur-sm text-foreground text-xs font-medium px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
                    <Star className="h-3 w-3 fill-current" />
                    {hotel.rating}
                  </div>
                  <FavoriteButton
                    id={hotel.id}
                    type="hotel"
                    name={hotel.name}
                    image={hotel.image}
                    location={hotel.location}
                    size="sm"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {hotel.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{hotel.location}</p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {hotel.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    {hotel.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through mr-2">
                        ${hotel.originalPrice}
                      </span>
                    )}
                    <span className="text-xl font-bold text-foreground">${hotel.price}</span>
                    <span className="text-sm text-muted-foreground">/noche</span>
                  </div>
                  <Link to={`/alojamiento/${hotel.id}`}>
                    <Button size="sm" variant="outline">
                      Ver Disponibilidad
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
