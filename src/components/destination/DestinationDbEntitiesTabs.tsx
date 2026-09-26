import { Link } from "react-router-dom";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Building2, 
  Bed, 
  Utensils, 
  GlassWater, 
  Compass, 
  Users, 
  Map 
} from "lucide-react";
import { getSafeCoverImage } from "@/lib/imageCovers";
import { useTranslation } from "@/hooks/useI18n";

interface DestinationEntity {
  id: string;
  name: string;
  slug?: string;
  image_url?: string;
  short_description?: string;
}

interface MunicipalityEntity {
  id: string;
  name: string;
  slug?: string;
  is_capital?: boolean;
  description?: string;
  population?: number;
  area_km2?: number;
}

interface HotelEntity {
  id: string;
  name: string;
  slug?: string;
  image_url?: string;
  category?: string;
  price_range?: string;
}

interface RestaurantEntity {
  id: string;
  name: string;
  slug?: string;
  image_url?: string;
  cuisine_type?: string;
  price_range?: string;
}

interface BarEntity {
  id: string;
  name: string;
  slug?: string;
  image_url?: string;
  bar_type?: string;
  music_style?: string;
}

interface ExperienceEntity {
  id: string;
  name: string;
  slug?: string;
  image_url?: string;
  category?: string;
  difficulty?: string;
  duration?: string;
  price_range?: string;
}

interface DestinationDbEntitiesTabsProps {
  isProvinceView: boolean;
  destinations?: DestinationEntity[];
  municipios: MunicipalityEntity[];
  hotels?: HotelEntity[];
  restaurants?: RestaurantEntity[];
  bars?: BarEntity[];
  experiences?: ExperienceEntity[];
}

export function DestinationDbEntitiesTabs({
  isProvinceView,
  destinations,
  municipios,
  hotels,
  restaurants,
  bars,
  experiences
}: DestinationDbEntitiesTabsProps) {
  const { t } = useTranslation();

  return (
    <Tabs defaultValue={isProvinceView ? "destinos" : "hoteles"} className="space-y-8">
      <TabsList className="flex flex-wrap gap-2 bg-transparent h-auto p-0">
        {isProvinceView && (
          <TabsTrigger value="destinos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            {t("destinos.title")} ({destinations?.length || 0})
          </TabsTrigger>
        )}
        {isProvinceView && (
          <TabsTrigger value="municipios" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Building2 className="h-4 w-4 mr-2" />
            {t("destinoDetalle.municipalities")} ({municipios.length})
          </TabsTrigger>
        )}
        <TabsTrigger value="hoteles" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Bed className="h-4 w-4 mr-2" />
          {t("destinoDetalle.hotels")} ({hotels?.length || 0})
        </TabsTrigger>
        <TabsTrigger value="restaurantes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Utensils className="h-4 w-4 mr-2" />
          {t("destinoDetalle.restaurants")} ({restaurants?.length || 0})
        </TabsTrigger>
        <TabsTrigger value="bares" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <GlassWater className="h-4 w-4 mr-2" />
          {t("destinoDetalle.nightlife")} ({bars?.length || 0})
        </TabsTrigger>
        <TabsTrigger value="actividades" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Compass className="h-4 w-4 mr-2" />
          {t("destinoDetalle.activities")} ({experiences?.length || 0})
        </TabsTrigger>
      </TabsList>


      {/* Destinos Tab */}
      {isProvinceView && (
        <TabsContent value="destinos">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations?.map((destination) => (
              <Link
                key={destination.id}
                to={`/destino/${destination.slug || destination.id}`}
                className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={getSafeCoverImage(destination.image_url, "destination", destination.slug)}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-semibold text-lg">{destination.name}</h3>
                    <p className="text-xs text-white/80 line-clamp-1">{destination.short_description}</p>
                  </div>
                </div>
              </Link>
            ))}
            {(!destinations || destinations.length === 0) && (
              <p className="text-muted-foreground col-span-full text-center py-12">
                No hay destinos registrados.
              </p>
            )}
          </div>
        </TabsContent>
      )}

      {/* Municipios Tab */}
      {isProvinceView && (
        <TabsContent value="municipios">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {municipios.map((municipio) => (
              <Link
                key={municipio.id}
                to={`/municipio/${municipio.slug || municipio.id}`}
                className="group bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
                    {municipio.name}
                  </h3>
                  {municipio.is_capital && (
                    <Badge variant="secondary">Capital</Badge>
                  )}
                </div>
                {municipio.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {municipio.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {municipio.population && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {municipio.population.toLocaleString()} hab.
                    </span>
                  )}
                  {municipio.area_km2 && (
                    <span className="flex items-center gap-1">
                      <Map className="h-3.5 w-3.5" />
                      {municipio.area_km2} km²
                    </span>
                  )}
                </div>
              </Link>
            ))}
            {municipios.length === 0 && (
              <p className="text-muted-foreground col-span-full text-center py-12">
                No hay municipios registrados.
              </p>
            )}
          </div>
        </TabsContent>
      )}

      {/* Hoteles Tab */}
      <TabsContent value="hoteles">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {hotels?.map((hotel) => (
            <Link
              key={hotel.id}
              to={`/alojamiento/${hotel.slug || hotel.id}`}
              className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={getSafeCoverImage(hotel.image_url, "hotel", hotel.slug)}
                  alt={hotel.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {hotel.category && (
                  <Badge className="absolute top-3 left-3 bg-primary/90">
                    {hotel.category}
                  </Badge>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {hotel.name}
                </h3>
                {hotel.price_range && (
                  <p className="text-sm text-primary font-medium mt-1">{hotel.price_range}</p>
                )}
              </div>
            </Link>
          ))}
          {(!hotels || hotels.length === 0) && (
            <p className="text-muted-foreground col-span-full text-center py-12">
              No hay hoteles registrados.
            </p>
          )}
        </div>
      </TabsContent>

      {/* Restaurantes Tab */}
      <TabsContent value="restaurantes">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {restaurants?.map((restaurant) => (
            <Link
              key={restaurant.id}
              to={`/restaurante/${restaurant.slug || restaurant.id}`}
              className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={getSafeCoverImage(restaurant.image_url, "restaurant", restaurant.slug)}
                  alt={restaurant.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {restaurant.cuisine_type && (
                  <Badge className="absolute top-3 left-3 bg-primary/90">
                    {restaurant.cuisine_type}
                  </Badge>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {restaurant.name}
                </h3>
                {restaurant.price_range && (
                  <p className="text-sm text-muted-foreground mt-1">{restaurant.price_range}</p>
                )}
              </div>
            </Link>
          ))}
          {(!restaurants || restaurants.length === 0) && (
            <p className="text-muted-foreground col-span-full text-center py-12">
              No hay restaurantes registrados.
            </p>
          )}
        </div>
      </TabsContent>

      {/* Bares Tab */}
      <TabsContent value="bares">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {bars?.map((bar) => (
            <Link
              key={bar.id}
              to={`/bar/${bar.slug || bar.id}`}
              className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={getSafeCoverImage(bar.image_url, "bar", bar.slug)}
                  alt={bar.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {bar.bar_type && (
                  <Badge className="absolute top-3 left-3 bg-primary/90">
                    {bar.bar_type}
                  </Badge>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {bar.name}
                </h3>
                {bar.music_style && (
                  <p className="text-sm text-muted-foreground mt-1">{bar.music_style}</p>
                )}
              </div>
            </Link>
          ))}
          {(!bars || bars.length === 0) && (
            <p className="text-muted-foreground col-span-full text-center py-12">
              No hay bares registrados.
            </p>
          )}
        </div>
      </TabsContent>

      {/* Actividades Tab */}
      <TabsContent value="actividades">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {experiences?.map((exp) => (
            <Link
              key={exp.id}
              to={`/experiencia/${exp.slug || exp.id}`}
              className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={getSafeCoverImage(exp.image_url, "experience", exp.slug)}
                  alt={exp.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {exp.category && (
                  <Badge className="absolute top-3 left-3 bg-primary/90">
                    {exp.category}
                  </Badge>
                )}
                {exp.difficulty && (
                  <Badge className="absolute top-3 right-3 bg-card/90 text-foreground">
                    {exp.difficulty}
                  </Badge>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {exp.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {exp.duration && (
                    <span className="text-xs text-muted-foreground">{exp.duration}</span>
                  )}
                  {exp.price_range && (
                    <span className="text-xs text-primary font-medium">{exp.price_range}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
          {(!experiences || experiences.length === 0) && (
            <p className="text-muted-foreground col-span-full text-center py-12">
              No hay actividades registradas.
            </p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
