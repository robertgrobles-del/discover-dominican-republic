import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, ChevronRight, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FeaturedItem {
  id: string;
  slug?: string;
  name: string;
  imageUrl?: string;
  shortDescription?: string;
  rating?: number;
  priceRange?: string;
  category?: string;
  address?: string;
}

interface ProvinceFeaturedSectionProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  items: FeaturedItem[];
  linkPrefix: string;
  viewAllLink: string;
  emptyMessage?: string;
}

export function ProvinceFeaturedSection({
  title,
  subtitle,
  icon,
  items,
  linkPrefix,
  viewAllLink,
  emptyMessage = "No hay elementos disponibles",
}: ProvinceFeaturedSectionProps) {
  if (items.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center py-12 bg-muted/30 rounded-xl">
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              {icon}
              <span className="text-sm font-semibold uppercase tracking-wider">{subtitle}</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              {title}
            </h2>
          </div>
          <Link to={viewAllLink}>
            <Button variant="outline" className="hidden md:flex gap-2">
              Ver más <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.slice(0, 4).map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link 
                to={`${linkPrefix}/${item.slug || item.id}`}
                className="block group"
              >
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={item.imageUrl || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    {item.priceRange && (
                      <Badge className="absolute top-3 right-3 bg-card/90 text-foreground">
                        {item.priceRange}
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {item.rating && (
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm font-medium">{item.rating}</span>
                        </div>
                      )}
                      {item.category && (
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-display font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {item.name}
                    </h3>

                    {item.address && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                        <MapPin className="h-3 w-3" />
                        <span className="line-clamp-1">{item.address}</span>
                      </p>
                    )}

                    {item.shortDescription && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.shortDescription}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {items.length > 4 && (
          <div className="mt-8 text-center md:hidden">
            <Link to={viewAllLink}>
              <Button variant="outline" className="gap-2">
                Ver más <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
