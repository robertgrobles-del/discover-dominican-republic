import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { TreePine, Star, MapPin, Mountain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProvinceParksProps {
  provinceId: string;
  provinceName: string;
}

export function ProvinceParks({ provinceId, provinceName }: ProvinceParksProps) {
  const { data: parks } = useQuery({
    queryKey: ['province-parks', provinceId],
    queryFn: async () => {
      const { data } = await supabase
        .from('parks')
        .select('*')
        .eq('province_id', provinceId)
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false })
        .limit(6);
      return data || [];
    },
    enabled: !!provinceId,
  });

  if (!parks || parks.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 text-primary mb-2">
            <TreePine className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Áreas Protegidas</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Parques y Naturaleza en {provinceName}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parks.map((park, index) => (
            <motion.div
              key={park.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full group">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={park.image_url || "/placeholder.svg"}
                    alt={park.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {park.is_featured && (
                    <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">Destacado</Badge>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h3 className="font-display font-bold text-white text-lg">{park.name}</h3>
                    <Badge variant="secondary" className="mt-1 text-xs">{park.park_type}</Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {park.rating && (
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium">{Number(park.rating).toFixed(1)}</span>
                      </div>
                    )}
                    {park.area_km2 && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Mountain className="h-4 w-4" />
                        <span className="text-xs">{Number(park.area_km2).toLocaleString()} km²</span>
                      </div>
                    )}
                    {park.entry_fee && (
                      <Badge variant="outline" className="text-xs ml-auto">{park.entry_fee}</Badge>
                    )}
                  </div>
                  {park.short_description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{park.short_description}</p>
                  )}
                  {park.activities && (park.activities as string[]).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {(park.activities as string[]).slice(0, 3).map((act, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{act}</Badge>
                      ))}
                      {(park.activities as string[]).length > 3 && (
                        <Badge variant="secondary" className="text-xs">+{(park.activities as string[]).length - 3}</Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
