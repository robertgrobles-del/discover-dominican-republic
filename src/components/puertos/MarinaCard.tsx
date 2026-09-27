import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star } from "lucide-react";
import { MarinaData } from "@/data/portsData";

interface MarinaCardProps {
  marina: MarinaData;
  index: number;
}

export function MarinaCard({ marina, index }: MarinaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden h-full">
        <div className="relative h-48">
          <img
            src={marina.image}
            alt={marina.name}
            className="w-full h-full object-cover"
          />
          <Badge className="absolute top-4 right-4">{marina.priceRange}</Badge>
        </div>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-display text-xl font-bold">{marina.name}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {marina.location}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="font-bold">{marina.rating}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <p className="text-muted-foreground">Atraques</p>
              <p className="font-bold">{marina.slips}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Eslora máx.</p>
              <p className="font-bold">{marina.maxLength}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {marina.services.slice(0, 4).map((service) => (
              <Badge key={service} variant="outline" className="text-xs">
                {service}
              </Badge>
            ))}
          </div>

          <Button className="w-full">Reservar Atraque</Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
