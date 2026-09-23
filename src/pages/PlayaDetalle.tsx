import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MapPin, Star, Waves, Umbrella, Car, ShieldCheck, Sun, 
  Thermometer, Users, ChevronRight, Navigation, Clock, Info,
  Camera, Share2, Droplets, Wind, Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { FavoriteButton } from "@/components/FavoriteButton";
import { SEOHead } from "@/components/SEOHead";
import { getBeachBySlug, type Beach } from "@/data/beaches";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbox } from "@/components/ui/lightbox";
import { useLightbox } from "@/hooks/useLightbox";

const beachTypeLabels: Record<string, string> = {
  'arena-blanca': 'Arena Blanca',
  'arena-dorada': 'Arena Dorada',
  'virgen': 'Virgen',
  'bahia': 'Bahía',
  'deportiva': 'Deportiva',
  'urbana': 'Urbana'
};

const waveLabels: Record<string, { label: string; color: string }> = {
  'calma': { label: 'Oleaje Calmo', color: 'bg-emerald-500/80 text-white' },
  'moderada': { label: 'Oleaje Moderado', color: 'bg-amber-500/80 text-white' },
  'fuerte': { label: 'Oleaje Fuerte', color: 'bg-red-500/80 text-white' }
};

const crowdLabels: Record<string, { label: string; icon: typeof Users }> = {
  'baja': { label: 'Poca Afluencia', icon: Users },
  'media': { label: 'Afluencia Media', icon: Users },
  'alta': { label: 'Alta Afluencia', icon: Users }
};

// Row shape returned by the (mock) Supabase `beaches` table. The mock client
// is untyped (`supabase: any`) by design, so this is the one place that
// bridges its loose data into a real type: it mirrors `Beach` but with the
// database's snake_case column names, and every field is optional since rows
// may be incomplete. `BeachSource` combines it with `Beach` itself (a full
// `Beach` object always satisfies it, since every extra field is optional)
// so the rest of the component can read either naming convention without
// resorting to `as any`.
interface BeachDbRow {
  image_url?: string;
  short_description?: string;
  beach_type?: string;
  wave_intensity?: string;
  crowd_level?: string;
  access_type?: string;
  sand_type?: string;
  water_color?: string;
  parking_available?: boolean;
  lifeguard_on_duty?: boolean;
  how_to_get_there?: string;
  best_time_to_visit?: string;
  province_slug?: string;
  destination_name?: string;
}

type BeachSource = Partial<Beach> & BeachDbRow;

function useBeachData(slug: string | undefined): { beach: BeachSource | undefined; isLoading: boolean } {
  const staticBeach = slug ? getBeachBySlug(slug) : undefined;
  const { data: dbBeach, isLoading } = useQuery({
    queryKey: ['beach', slug],
    queryFn: async (): Promise<BeachDbRow | undefined> => {
      const { data, error } = await supabase
        .from('beaches')
        .select('*')
        .eq('slug', slug!)
        .eq('is_active', true)
        .single();
      if (error) return undefined;
      return data as BeachDbRow;
    },
    enabled: !staticBeach && !!slug,
  });
  return { beach: staticBeach || dbBeach, isLoading: !staticBeach && isLoading };
}

export default function PlayaDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const { beach: rawBeach, isLoading } = useBeachData(slug);
  const {
    isOpen: lightboxOpen,
    currentIndex: lightboxIndex,
    open: openLightbox,
    close: closeLightbox,
  } = useLightbox();

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-32">
            <Skeleton className="h-[400px] w-full rounded-xl mb-8" />
            <Skeleton className="h-8 w-1/2 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  if (!rawBeach) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-32 text-center">
            <Waves className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Playa no encontrada</h1>
            <p className="text-muted-foreground mb-8">La playa que buscas no existe o ha sido movida.</p>
            <Link to="/playas"><Button>Ver todas las playas</Button></Link>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  // Normalize data (rawBeach is a real `BeachSource`, not `any` - see useBeachData above)
  const beach = {
    id: rawBeach.id || '',
    name: rawBeach.name || '',
    slug: rawBeach.slug || '',
    description: rawBeach.description || '',
    shortDescription: rawBeach.shortDescription || rawBeach.short_description || '',
    imageUrl: rawBeach.imageUrl || rawBeach.image_url || '/placeholder.svg',
    gallery: rawBeach.gallery || [],
    beachType: rawBeach.beachType || rawBeach.beach_type || 'arena-blanca',
    waveIntensity: rawBeach.waveIntensity || rawBeach.wave_intensity || 'calma',
    crowdLevel: rawBeach.crowdLevel || rawBeach.crowd_level || 'media',
    accessType: rawBeach.accessType || rawBeach.access_type || 'publico',
    sandType: rawBeach.sandType || rawBeach.sand_type || '',
    waterColor: rawBeach.waterColor || rawBeach.water_color || '',
    activities: rawBeach.activities || [],
    amenities: rawBeach.amenities || [],
    parkingAvailable: rawBeach.parkingAvailable ?? rawBeach.parking_available ?? false,
    lifeguardOnDuty: rawBeach.lifeguardOnDuty ?? rawBeach.lifeguard_on_duty ?? false,
    howToGetThere: rawBeach.howToGetThere || rawBeach.how_to_get_there || '',
    bestTimeToVisit: rawBeach.bestTimeToVisit || rawBeach.best_time_to_visit || '',
    province: rawBeach.province || '',
    provinceSlug: rawBeach.provinceSlug || rawBeach.province_slug || '',
    destinationName: rawBeach.destinationName || rawBeach.destination_name || '',
    rating: rawBeach.rating || 0,
  };

  const waveInfo = waveLabels[beach.waveIntensity] || waveLabels['calma'];
  const crowdInfo = crowdLabels[beach.crowdLevel] || crowdLabels['media'];
  const allImages = [beach.imageUrl, ...beach.gallery].filter(Boolean);

  return (
    <PageTransition>
      <SEOHead
        title={`${beach.name} - Playas de República Dominicana`}
        description={beach.shortDescription || beach.description?.slice(0, 160)}
        keywords={`playa, ${beach.name}, ${beach.province}, República Dominicana, caribe`}
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Breadcrumbs */}
        <div className="bg-muted/30 border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/playas" className="hover:text-primary transition-colors">Playas</Link>
              {beach.province && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <Link to={`/destino/${beach.provinceSlug}`} className="hover:text-primary transition-colors">
                    {beach.province}
                  </Link>
                </>
              )}
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">{beach.name}</span>
            </nav>
          </div>
        </div>

        {/* Hero with Gallery Grid */}
        <section className="relative">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[50vh] min-h-[400px] rounded-2xl overflow-hidden">
              {/* Main image */}
              <div
                className="col-span-2 row-span-2 relative cursor-pointer group"
                onClick={() => openLightbox(0)}
              >
                <img src={beach.imageUrl} alt={beach.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-sm">
                      <Waves className="h-3 w-3 mr-1" /> {beachTypeLabels[beach.beachType] || beach.beachType}
                    </Badge>
                    <Badge className={`${waveInfo.color} backdrop-blur-sm`}>{waveInfo.label}</Badge>
                  </div>
                  <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground">{beach.name}</h1>
                </div>
              </div>
              {/* Side images */}
              {allImages.slice(1, 5).map((img, i) => (
                <div
                  key={i}
                  className="relative cursor-pointer group overflow-hidden"
                  onClick={() => openLightbox(i + 1)}
                >
                  <img src={img} alt={`${beach.name} ${i + 2}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  {i === 3 && allImages.length > 5 && (
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                      <span className="text-foreground font-bold text-lg flex items-center gap-2">
                        <Camera className="h-5 w-5" /> +{allImages.length - 5}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {/* Fill empty slots */}
              {allImages.length < 5 && [...Array(5 - allImages.length)].map((_, i) => (
                <div key={`empty-${i}`} className="bg-muted/50 flex items-center justify-center">
                  <Camera className="h-8 w-8 text-muted-foreground/30" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Action Bar */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {beach.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span className="font-medium text-foreground">{beach.rating}</span>
                </div>
              )}
              {beach.province && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{beach.province}</span>
                  {beach.destinationName && <span>· {beach.destinationName}</span>}
                </div>
              )}
              <span className="flex items-center gap-1">
                <Compass className="h-4 w-4 text-primary" />
                {beach.accessType === 'publico' ? 'Acceso Público' : beach.accessType === 'semi-privado' ? 'Semi-Privada' : 'Privada'}
              </span>
            </div>
            <div className="flex gap-2">
              <FavoriteButton id={beach.id} type="playa" name={beach.name} image={beach.imageUrl} location={beach.province} variant="button" size="md" />
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" /> Compartir
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-12">
              {/* Quick Stats */}
              <section>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {beach.sandType && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
                      className="bg-card rounded-xl p-5 border border-border text-center hover:border-primary/30 transition-colors">
                      <Droplets className="h-7 w-7 text-primary mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground mb-1">Tipo de Arena</p>
                      <p className="text-sm font-semibold text-foreground">{beach.sandType}</p>
                    </motion.div>
                  )}
                  {beach.waterColor && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                      className="bg-card rounded-xl p-5 border border-border text-center hover:border-primary/30 transition-colors">
                      <Thermometer className="h-7 w-7 text-primary mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground mb-1">Color del Agua</p>
                      <p className="text-sm font-semibold text-foreground">{beach.waterColor}</p>
                    </motion.div>
                  )}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-card rounded-xl p-5 border border-border text-center hover:border-primary/30 transition-colors">
                    <Wind className="h-7 w-7 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Oleaje</p>
                    <p className="text-sm font-semibold text-foreground">{waveInfo.label}</p>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className="bg-card rounded-xl p-5 border border-border text-center hover:border-primary/30 transition-colors">
                    <Users className="h-7 w-7 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Afluencia</p>
                    <p className="text-sm font-semibold text-foreground">{crowdInfo.label}</p>
                  </motion.div>
                </div>
              </section>

              {/* Description */}
              <section>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">Sobre {beach.name}</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">{beach.description}</p>
              </section>

              {/* Activities */}
              {beach.activities.length > 0 && (
                <section>
                  <h3 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Waves className="h-5 w-5 text-primary" /> Actividades Disponibles
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {beach.activities.map((activity: string) => (
                      <Badge key={activity} variant="secondary" className="text-sm py-2 px-4 hover:bg-primary/20 transition-colors cursor-default">
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              {/* Amenities */}
              {(beach.amenities.length > 0 || beach.parkingAvailable || beach.lifeguardOnDuty) && (
                <section>
                  <h3 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Umbrella className="h-5 w-5 text-primary" /> Servicios y Amenidades
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {beach.amenities.map((amenity: string) => (
                      <div key={amenity} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{amenity}</span>
                      </div>
                    ))}
                    {beach.parkingAvailable && (
                      <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                        <Car className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">Estacionamiento</span>
                      </div>
                    )}
                    {beach.lifeguardOnDuty && (
                      <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                        <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">Salvavidas en servicio</span>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* How to Get There */}
              {beach.howToGetThere && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Navigation className="h-5 w-5 text-primary" />
                    <h3 className="font-display text-xl font-bold text-foreground">Cómo Llegar</h3>
                  </div>
                  <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
                    <p className="text-muted-foreground leading-relaxed">{beach.howToGetThere}</p>
                  </div>
                </section>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              <div className="sticky top-32 space-y-6">
                {/* Best Time */}
                {beach.bestTimeToVisit && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Sun className="h-5 w-5 text-primary" />
                      <h3 className="font-display font-bold text-foreground">Mejor Época para Visitar</h3>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{beach.bestTimeToVisit}</p>
                  </motion.div>
                )}

                {/* Quick Info Card */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-6">
                  <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" /> Información Rápida
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Acceso</span>
                      <Badge variant="secondary">
                        {beach.accessType === 'publico' ? 'Público' : beach.accessType === 'semi-privado' ? 'Semi-Privado' : 'Privado'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Oleaje</span>
                      <Badge className={waveInfo.color}>{waveInfo.label.replace('Oleaje ', '')}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Estacionamiento</span>
                      <span className={`font-medium ${beach.parkingAvailable ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                        {beach.parkingAvailable ? '✓ Disponible' : '✗ No'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Salvavidas</span>
                      <span className={`font-medium ${beach.lifeguardOnDuty ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                        {beach.lifeguardOnDuty ? '✓ En servicio' : '✗ No'}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Location */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                  className="bg-card rounded-2xl border border-border p-6">
                  <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" /> Ubicación
                  </h3>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                    <MapPin className="h-8 w-8 text-primary animate-pulse" />
                  </div>
                  {beach.province && (
                    <>
                      <p className="text-sm text-muted-foreground mb-3">
                        {beach.province}
                        {beach.destinationName && ` · ${beach.destinationName}`}
                      </p>
                      <Link to={`/destino/${beach.provinceSlug}`}>
                        <Button variant="outline" size="sm" className="w-full gap-2">
                          <Compass className="h-4 w-4" /> Ver {beach.province}
                        </Button>
                      </Link>
                    </>
                  )}
                </motion.div>

                {/* CTA */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                  className="bg-card rounded-2xl border border-border p-6 space-y-3">
                  <Button className="w-full">Agregar al Plan de Viaje</Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Share2 className="h-4 w-4" /> Compartir esta Playa
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Lightbox */}
        <Lightbox
          images={allImages}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={closeLightbox}
        />

        <Footer />
      </div>
    </PageTransition>
  );
}
