import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Landmark, Star, Clock, MapPin, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProvinceMonumentsProps {
  provinceId: string;
  provinceName: string;
}

export function ProvinceMonuments({ provinceId, provinceName }: ProvinceMonumentsProps) {
  const { data: monuments } = useQuery({
    queryKey: ['province-monuments', provinceId],
    queryFn: async () => {
      const { data } = await supabase
        .from('monuments')
        .select('*')
        .eq('province_id', provinceId)
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false })
        .limit(8);
      return data || [];
    },
    enabled: !!provinceId,
  });

  if (!monuments || monuments.length === 0) return null;

  return (
    <section className="py-16 bg-muted/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 text-primary mb-2">
            <Landmark className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Patrimonio Histórico</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Monumentos en {provinceName}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {monuments.map((monument, index) => (
            <motion.div
              key={monument.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full group">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={monument.image_url || "/placeholder.svg"}
                    alt={monument.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  {monument.is_featured && (
                    <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">Destacado</Badge>
                  )}
                  {monument.entry_fee && (
                    <Badge className="absolute top-3 right-3 bg-card/90 text-foreground text-xs">
                      {monument.entry_fee}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {monument.rating && (
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium">{Number(monument.rating).toFixed(1)}</span>
                      </div>
                    )}
                    <Badge variant="outline" className="text-xs">{monument.monument_type}</Badge>
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">
                    {monument.name}
                  </h3>
                  {monument.address && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="line-clamp-1">{monument.address}</span>
                    </p>
                  )}
                  {monument.opening_hours && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <span className="line-clamp-1">{monument.opening_hours}</span>
                    </p>
                  )}
                  {monument.short_description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{monument.short_description}</p>
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
