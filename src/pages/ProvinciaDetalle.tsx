import { useParams, Link } from "react-router-dom";
import { Home, ChevronRight, Building2, Utensils } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { useMemo } from "react";

import { ProvinceHero } from "@/components/province/ProvinceHero";
import { ProvinceTechCard } from "@/components/province/ProvinceTechCard";
import { ProvinceActivities } from "@/components/province/ProvinceActivities";
import { ProvinceDestinations } from "@/components/province/ProvinceDestinations";
import { ProvinceFeaturedSection } from "@/components/province/ProvinceFeaturedSection";
import { ProvinceNightlife } from "@/components/province/ProvinceNightlife";
import { ProvinceMonuments } from "@/components/province/ProvinceMonuments";
import { ProvinceParks } from "@/components/province/ProvinceParks";
import { BetweenSectionsAd } from "@/components/ads";
import { DistancesFromCities } from "@/components/destination/DistancesFromCities";
import { DestinationAboutTabs } from "@/components/destination/DestinationAboutTabs";
import { RelatedBlogPosts } from "@/components/destination/RelatedBlogPosts";

import { destinations, getDestinationBySlug } from "@/data/destinations";
import { hotels } from "@/data/hotels";
import { restaurants } from "@/data/restaurants";
import { bars } from "@/data/bars";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function ProvinciaDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const province = getDestinationBySlug(slug || "");

  // Fetch province DB ID for monument/park queries
  const { data: dbProvince } = useQuery({
    queryKey: ['province-db-id', slug],
    queryFn: async () => {
      const { data } = await supabase.from('provinces').select('id').eq('slug', slug!).maybeSingle();
      return data;
    },
    enabled: !!slug && !!province,
  });

  const { data: dbHotels } = useQuery({
    queryKey: ['province-hotels', slug],
    queryFn: async () => {
      if (!dbProvince) return [];
      const { data } = await supabase.from('hotels').select('*').eq('destination_id', dbProvince.id).eq('is_active', true).limit(10);
      return data || [];
    },
    enabled: !!dbProvince,
  });

  const { data: dbRestaurants } = useQuery({
    queryKey: ['province-restaurants', slug],
    queryFn: async () => {
      if (!dbProvince) return [];
      const { data } = await supabase.from('restaurants').select('*').eq('destination_id', dbProvince.id).eq('is_active', true).limit(10);
      return data || [];
    },
    enabled: !!dbProvince,
  });

  const { data: dbBars } = useQuery({
    queryKey: ['province-bars', slug],
    queryFn: async () => {
      if (!dbProvince) return [];
      const { data } = await supabase.from('bars').select('*').eq('destination_id', dbProvince.id).eq('is_active', true).limit(10);
      return data || [];
    },
    enabled: !!dbProvince,
  });

  const provinceHotels = useMemo(() => {
    if (!province || province.type !== "provincia") return [];
    const staticItems = hotels.filter(
      h => h.province?.toLowerCase() === province.name.toLowerCase() || h.provinceId === province.id
    ).map(h => ({
      id: h.id, slug: h.slug, name: h.name, imageUrl: h.imageUrl,
      shortDescription: h.shortDescription, rating: h.rating,
      priceRange: h.priceRange, category: h.category, address: h.address,
    }));
    const slugs = new Set(staticItems.map(h => h.slug));
    (dbHotels || []).forEach(h => {
      if (h.slug && !slugs.has(h.slug)) {
        staticItems.push({
          id: h.id, slug: h.slug, name: h.name, imageUrl: h.image_url || '/placeholder.svg',
          shortDescription: h.short_description || '', rating: Number(h.rating) || 0,
          priceRange: h.price_range || '$$', category: h.category || 'Hotel', address: h.address || '',
        } as any);
      }
    });
    return staticItems;
  }, [province, dbHotels]);

  const provinceRestaurants = useMemo(() => {
    if (!province || province.type !== "provincia") return [];
    const staticItems = restaurants.filter(
      r => r.province?.toLowerCase() === province.name.toLowerCase() || r.provinceId === province.id
    ).map(r => ({
      id: r.id, slug: r.slug, name: r.name, imageUrl: r.imageUrl,
      shortDescription: r.shortDescription, rating: r.rating,
      priceRange: r.priceRange, category: Array.isArray(r.cuisineType) ? r.cuisineType[0] : (r.cuisineType || r.category),
      address: r.address,
    }));
    const slugs = new Set(staticItems.map(r => r.slug));
    (dbRestaurants || []).forEach(r => {
      if (r.slug && !slugs.has(r.slug)) {
        staticItems.push({
          id: r.id, slug: r.slug || '', name: r.name, imageUrl: r.image_url || '/placeholder.svg',
          shortDescription: r.short_description || '', rating: Number(r.rating) || 0,
          priceRange: r.price_range || '$$', category: r.cuisine_type || r.category || 'Restaurante',
          address: r.address || '',
        } as any);
      }
    });
    return staticItems;
  }, [province, dbRestaurants]);

  const provinceBars = useMemo(() => {
    if (!province || province.type !== "provincia") return [];
    const staticItems = bars.filter(
      b => b.province?.toLowerCase() === province.name.toLowerCase() || b.provinceId === province.id
    ).map(b => ({
      id: b.id, slug: b.slug, name: b.name, imageUrl: b.imageUrl,
      barType: b.barType, musicStyle: Array.isArray(b.musicStyle) ? b.musicStyle.join(", ") : b.musicStyle,
      priceRange: b.priceRange, rating: b.rating, address: b.address, openingHours: b.openingHours,
    }));
    const slugs = new Set(staticItems.map(b => b.slug));
    (dbBars || []).forEach(b => {
      if (b.slug && !slugs.has(b.slug)) {
        staticItems.push({
          id: b.id, slug: b.slug || '', name: b.name, imageUrl: b.image_url || '/placeholder.svg',
          barType: b.bar_type || 'lounge', musicStyle: b.music_style || '',
          priceRange: b.price_range || '$$', rating: Number(b.rating) || 0,
          address: b.address || '', openingHours: b.opening_hours || '',
        } as any);
      }
    });
    return staticItems;
  }, [province, dbBars]);

  const provinceDestinations = useMemo(() => {
    if (!province) return [];
    return destinations.filter(d => d.provinceSlug === province.slug && d.type !== "provincia");
  }, [province]);

  const heroImages = province?.gallery?.length
    ? province.gallery
    : [province?.imageUrl || "/placeholder.svg"];

  if (!province || province.type !== "provincia") {
    return (
      <PageTransition>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Provincia no encontrada</h1>
            <Link to="/destinos" className="text-primary hover:underline">
              Volver a destinos
            </Link>
          </div>
        </main>
        <Footer />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SEOHead
        title={`${province.name} - Turismo República Dominicana`}
        description={province.description || province.shortDescription}
        keywords={`${province.name}, turismo, República Dominicana, ${province.categories?.join(", ")}`}
      />

      <Header />

      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 pt-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary flex items-center gap-1">
              <Home className="h-4 w-4" /> Inicio
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/destinos" className="hover:text-primary">Destinos</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/provincias" className="hover:text-primary">Provincias</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">{province.name}</span>
          </nav>
        </div>

        <ProvinceHero
          name={province.name}
          region={province.region}
          description={province.description}
          images={heroImages}
          highlights={province.highlights}
        />

        <ProvinceTechCard
          name={province.name}
          region={province.region}
          bestTimeToVisit={province.bestTimeToVisit}
          weatherInfo={province.weatherInfo}
          howToGetThere={province.howToGetThere}
          typicalDishes={province.typicalDishes}
          latitude={province.latitude}
          longitude={province.longitude}
          categories={province.categories}
        />

        <DistancesFromCities
          latitude={province.latitude}
          longitude={province.longitude}
          destinationName={province.name}
        />

        <BetweenSectionsAd />

        {/* About Tabs - History, Geography, Culture, etc. */}
        {province.about && (
          <DestinationAboutTabs name={province.name} data={province.about} />
        )}

        <ProvinceActivities
          provinceName={province.name}
          provinceSlug={province.slug}
          categories={province.categories}
        />

        <ProvinceDestinations
          provinceName={province.name}
          provinceSlug={province.slug}
          destinations={provinceDestinations}
        />

        {/* Monuments */}
        {dbProvince && (
          <ProvinceMonuments
            provinceId={dbProvince.id}
            provinceName={province.name}
          />
        )}

        <BetweenSectionsAd />

        {/* Parks */}
        {dbProvince && (
          <ProvinceParks
            provinceId={dbProvince.id}
            provinceName={province.name}
          />
        )}

        <ProvinceFeaturedSection
          title={`Hoteles en ${province.name}`}
          subtitle="Alojamiento"
          icon={<Building2 className="h-5 w-5" />}
          items={provinceHotels}
          linkPrefix="/alojamiento"
          viewAllLink={`/alojamientos?provincia=${province.slug}`}
          emptyMessage="Próximamente hoteles destacados"
        />

        <div className="bg-muted/30">
          <ProvinceFeaturedSection
            title={`Restaurantes en ${province.name}`}
            subtitle="Gastronomía"
            icon={<Utensils className="h-5 w-5" />}
            items={provinceRestaurants}
            linkPrefix="/restaurante"
            viewAllLink={`/guia-gastronomica?provincia=${province.slug}`}
            emptyMessage="Próximamente restaurantes destacados"
          />
        </div>

        <ProvinceNightlife
          provinceName={province.name}
          provinceSlug={province.slug}
          venues={provinceBars}
        />
        {/* Related Blog Posts */}
        <RelatedBlogPosts destinationName={province.name} destinationSlug={province.slug} />

        <BetweenSectionsAd showDemo />
      </main>

      <Footer />
    </PageTransition>
  );
}
