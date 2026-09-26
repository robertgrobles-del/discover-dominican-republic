import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { TreePine, Star, Mountain, Sparkles, Compass, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSafeCoverImage } from "@/lib/imageCovers";
import type { EnrichedPark } from "@/data/provinceEnrichment";

interface ProvinceParksProps {
  provinceId?: string;
  provinceName: string;
  fallbackItems?: EnrichedPark[];
}

export function ProvinceParks({ provinceId, provinceName, fallbackItems = [] }: ProvinceParksProps) {
  const { data: dbParks } = useQuery({
    queryKey: ['province-parks', provinceId],
    queryFn: async () => {
      if (!provinceId) return [];
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

  const displayParks = (dbParks && dbParks.length > 0)
    ? dbParks.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        park_type: p.park_type || "Área Protegida",
        rating: Number(p.rating) || 4.9,
        area_km2: p.area_km2,
        entry_fee: p.entry_fee,
        short_description: p.short_description || p.description || "",
        image_url: p.image_url,
        activities: Array.isArray(p.activities) ? p.activities : ["Senderismo", "Ecoturismo", "Fotografía"],
        is_featured: !!p.is_featured,
      }))
    : fallbackItems;

  if (!displayParks || displayParks.length === 0) return null;

  return (
    <section id="parques" className="py-16 bg-gradient-to-b from-background via-muted/10 to-background scroll-mt-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
        >
          <div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2 font-medium">
              <TreePine className="h-5 w-5" />
              <span className="text-xs md:text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Santuarios Naturales & Reservas
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Parques y Paisajes Protegidos en {provinceName}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-2xl">
              Ecosistemas vírgenes, cascadas de montaña, cuevas milenarias y santuarios de biodiversidad endémica.
            </p>
          </div>
          <Badge variant="outline" className="self-start md:self-auto px-3 py-1.5 border-emerald-500/30 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            {displayParks.length} Espacios de Ecoturismo
          </Badge>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayParks.map((park, index) => (
            <motion.div
              key={park.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <Link to={`/parque-nacional/${park.slug}`} className="block h-full group">
                <Card className="overflow-hidden border border-border/60 group-hover:border-emerald-500/50 group-hover:shadow-2xl group-hover:-translate-y-1.5 transition-all duration-300 h-full bg-card flex flex-col justify-between cursor-pointer">
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      <img
                        src={getSafeCoverImage(park.image_url, "waterfall", park.slug)}
                        alt={park.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                      
                      {park.is_featured && (
                        <Badge className="absolute top-3 left-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> Ecoturismo Top
                        </Badge>
                      )}

                      {park.entry_fee && (
                        <Badge className="absolute top-3 right-3 bg-background/90 backdrop-blur-md text-foreground text-xs font-semibold border border-white/20 shadow-md">
                          {park.entry_fee}
                        </Badge>
                      )}

                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-[11px] bg-emerald-950/80 text-emerald-200 border border-emerald-500/30 font-medium backdrop-blur-sm">
                            {park.park_type}
                          </Badge>
                          {park.area_km2 && (
                            <span className="text-[11px] text-white/90 flex items-center gap-1 font-medium bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                              <Mountain className="h-3 w-3 text-emerald-400" />
                              {Number(park.area_km2).toLocaleString()} km²
                            </span>
                          )}
                        </div>
                        <h3 className="font-display font-bold text-white text-lg group-hover:text-emerald-300 transition-colors line-clamp-1 drop-shadow-sm">
                          {park.name}
                        </h3>
                      </div>
                    </div>

                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                          <Star className="h-3.5 w-3.5 fill-amber-500" />
                          <span className="text-xs font-bold">{Number(park.rating || 4.9).toFixed(1)}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Compass className="h-3 w-3 text-emerald-500" /> Acceso Controlado
                        </span>
                      </div>

                      {park.short_description && (
                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                          {park.short_description}
                        </p>
                      )}

                      {park.activities && park.activities.length > 0 && (
                        <div className="pt-3 border-t border-border/50">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1.5">
                            Experiencias Disponibles
                          </span>
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {park.activities.slice(0, 3).map((act, i) => (
                              <Badge key={i} variant="outline" className="text-[11px] bg-muted/40 font-normal py-0">
                                {act}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                        <span>Ver Ficha y Senderos</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
