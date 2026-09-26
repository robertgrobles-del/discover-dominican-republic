import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Landmark, Star, Clock, MapPin, Sparkles, Ticket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSafeCoverImage } from "@/lib/imageCovers";
import type { EnrichedMonument } from "@/data/provinceEnrichment";

interface ProvinceMonumentsProps {
  provinceId?: string;
  provinceName: string;
  fallbackItems?: EnrichedMonument[];
}

export function ProvinceMonuments({ provinceId, provinceName, fallbackItems = [] }: ProvinceMonumentsProps) {
  const { data: dbMonuments } = useQuery({
    queryKey: ['province-monuments', provinceId],
    queryFn: async () => {
      if (!provinceId) return [];
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

  const displayMonuments = (dbMonuments && dbMonuments.length > 0)
    ? dbMonuments.map((m: any) => ({
        id: m.id,
        name: m.name,
        slug: m.slug,
        monument_type: m.monument_type || "Monumento Histórico",
        rating: Number(m.rating) || 4.8,
        entry_fee: m.entry_fee,
        address: m.address,
        opening_hours: m.opening_hours,
        short_description: m.short_description || m.description || "",
        image_url: m.image_url,
        is_featured: !!m.is_featured,
      }))
    : fallbackItems;

  if (!displayMonuments || displayMonuments.length === 0) return null;

  return (
    <section id="monumentos" className="py-16 bg-muted/20 scroll-mt-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
        >
          <div>
            <div className="flex items-center gap-2 text-primary mb-2 font-medium">
              <Landmark className="h-5 w-5 text-amber-500" />
              <span className="text-xs md:text-sm font-semibold uppercase tracking-widest text-primary">
                Patrimonio & Memoria Histórica
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Monumentos y Sitios Emblemáticos de {provinceName}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-2xl">
              Huellas arquitectónicas, fortalezas y templos que narran las raíces culturales y republicanas de la región.
            </p>
          </div>
          <Badge variant="outline" className="self-start md:self-auto px-3 py-1.5 border-primary/30 text-xs font-semibold">
            {displayMonuments.length} Sitios Registrados
          </Badge>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayMonuments.map((monument, index) => (
            <motion.div
              key={monument.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <Card className="overflow-hidden border border-border/60 hover:border-primary/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full group bg-card flex flex-col justify-between">
                <div>
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={getSafeCoverImage(monument.image_url, "monument", monument.slug)}
                      alt={monument.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80" />
                    
                    {monument.is_featured && (
                      <Badge className="absolute top-3 left-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-md flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> Destacado
                      </Badge>
                    )}

                    {monument.entry_fee && (
                      <Badge className="absolute top-3 right-3 bg-background/90 backdrop-blur-md text-foreground text-xs font-semibold border border-white/20 shadow-md flex items-center gap-1">
                        <Ticket className="h-3 w-3 text-primary" /> {monument.entry_fee}
                      </Badge>
                    )}

                    <div className="absolute bottom-3 left-3 right-3">
                      <Badge variant="secondary" className="text-[11px] bg-white/90 dark:bg-black/80 text-foreground font-medium backdrop-blur-sm">
                        {monument.monument_type}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-display font-bold text-base md:text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {monument.name}
                      </h3>
                      {monument.rating && (
                        <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full flex-shrink-0">
                          <Star className="h-3.5 w-3.5 fill-amber-500" />
                          <span className="text-xs font-bold">{Number(monument.rating).toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {monument.short_description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                        {monument.short_description}
                      </p>
                    )}

                    <div className="space-y-1.5 pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                      {monument.address && (
                        <p className="flex items-center gap-1.5 line-clamp-1">
                          <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                          <span className="truncate">{monument.address}</span>
                        </p>
                      )}
                      {monument.opening_hours && (
                        <p className="flex items-center gap-1.5 line-clamp-1">
                          <Clock className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                          <span className="truncate">{monument.opening_hours}</span>
                        </p>
                      )}
                    </div>
                  </CardContent>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
