import { useParams, Link } from "react-router-dom";
import { 
  Building2, Utensils, Calendar, MapPin, Compass, Landmark, TreePine, 
  Music, Plane, Info, Camera, Route, ChevronRight
} from "lucide-react";
import { getSafeCoverImage } from "@/lib/imageCovers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead, generateDestinationSchema } from "@/components/SEOHead";
import { useMemo, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { ProvinceHero } from "@/components/province/ProvinceHero";
import { ProvinceTechCard } from "@/components/province/ProvinceTechCard";
import { ProvinceActivities } from "@/components/province/ProvinceActivities";
import { ProvinceDestinations } from "@/components/province/ProvinceDestinations";
import { ProvinceFeaturedSection } from "@/components/province/ProvinceFeaturedSection";
import { ProvinceNightlife } from "@/components/province/ProvinceNightlife";
import { ProvinceMonuments } from "@/components/province/ProvinceMonuments";
import { ProvinceParks } from "@/components/province/ProvinceParks";
import { BetweenSectionsAd, PanoramaAd } from "@/components/promo";
import { DistancesFromCities } from "@/components/destination/DistancesFromCities";
import { DestinationAboutTabs } from "@/components/destination/DestinationAboutTabs";
import { DestinationGallery } from "@/components/destination/DestinationGallery";
import { HowToGetThere } from "@/components/destination/HowToGetThere";
import { RelatedBlogPosts } from "@/components/destination/RelatedBlogPosts";
import { CommentSection } from "@/components/comments/CommentSection";

import { destinations, getDestinationBySlug } from "@/data/destinations";
import { destinosData, provinceToDestinationMap } from "@/data/destinosData";
import { getProvinceEnrichedData } from "@/data/provinceEnrichment";
import { hotels } from "@/data/hotels";
import { restaurants } from "@/data/restaurants";
import { bars } from "@/data/bars";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function ProvinciaDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const province = getDestinationBySlug(slug || "");

  // Match corresponding static rich destination data if available (e.g., samana, puerto-plata)
  const staticDestino = destinosData[slug || ""] || (slug ? destinosData[provinceToDestinationMap[slug] || ""] : null);

  // Guarantee 100% complete enriched dataset for all 32 provinces
  const enrichedData = useMemo(() => {
    if (!province) return null;
    return getProvinceEnrichedData(province.slug, province.name, province.region);
  }, [province]);

  // Fetch province DB ID for monument/park queries
  const { data: dbProvince } = useQuery({
    queryKey: ['province-db-id', slug],
    queryFn: async () => {
      const { data } = await supabase
        .from('provinces')
        .select('id, name, slug, capital, population, area_km2')
        .eq('slug', slug!)
        .maybeSingle();
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
      id: h.id, slug: h.slug, name: h.name, imageUrl: getSafeCoverImage(h.imageUrl, "hotel", h.slug),
      shortDescription: h.shortDescription, rating: h.rating,
      priceRange: h.priceRange, category: h.category, address: h.address,
    }));
    const slugs = new Set(staticItems.map(h => h.slug));
    (dbHotels || []).forEach(h => {
      if (h.slug && !slugs.has(h.slug)) {
        staticItems.push({
          id: h.id, slug: h.slug, name: h.name, imageUrl: getSafeCoverImage(h.image_url, "hotel", h.slug),
          shortDescription: h.short_description || '', rating: Number(h.rating) || 0,
          priceRange: h.price_range || '$$', category: h.category || 'Hotel', address: h.address || '',
        } as any);
        slugs.add(h.slug);
      }
    });

    // Complete with authentic regional fallback items so every province has a full catalog
    if (enrichedData?.hotels && staticItems.length < 4) {
      enrichedData.hotels.forEach(eh => {
        if (!slugs.has(eh.slug)) {
          staticItems.push({
            id: eh.id,
            slug: eh.slug,
            name: eh.name,
            imageUrl: getSafeCoverImage(eh.imageUrl, "hotel", eh.slug),
            shortDescription: eh.shortDescription,
            rating: eh.rating,
            priceRange: eh.priceRange,
            category: eh.category,
            address: eh.address,
          });
          slugs.add(eh.slug);
        }
      });
    }

    return staticItems;
  }, [province, dbHotels, enrichedData]);

  const provinceRestaurants = useMemo(() => {
    if (!province || province.type !== "provincia") return [];
    const staticItems = restaurants.filter(
      r => r.province?.toLowerCase() === province.name.toLowerCase() || r.provinceId === province.id
    ).map(r => ({
      id: r.id, slug: r.slug, name: r.name, imageUrl: getSafeCoverImage(r.imageUrl, "restaurant", r.slug),
      shortDescription: r.shortDescription, rating: r.rating,
      priceRange: r.priceRange, category: Array.isArray(r.cuisineType) ? r.cuisineType[0] : (r.cuisineType || r.category),
      address: r.address,
    }));
    const slugs = new Set(staticItems.map(r => r.slug));
    (dbRestaurants || []).forEach(r => {
      if (r.slug && !slugs.has(r.slug)) {
        staticItems.push({
          id: r.id, slug: r.slug || '', name: r.name, imageUrl: getSafeCoverImage(r.image_url, "restaurant", r.slug),
          shortDescription: r.short_description || '', rating: Number(r.rating) || 0,
          priceRange: r.price_range || '$$', category: r.cuisine_type || r.category || 'Restaurante',
          address: r.address || '',
        } as any);
        slugs.add(r.slug);
      }
    });

    // Complete with authentic regional fallback items
    if (enrichedData?.restaurants && staticItems.length < 4) {
      enrichedData.restaurants.forEach(er => {
        if (!slugs.has(er.slug)) {
          staticItems.push({
            id: er.id,
            slug: er.slug,
            name: er.name,
            imageUrl: getSafeCoverImage(er.imageUrl, "restaurant", er.slug),
            shortDescription: er.shortDescription,
            rating: er.rating,
            priceRange: er.priceRange,
            category: er.category,
            address: er.address,
          });
          slugs.add(er.slug);
        }
      });
    }

    return staticItems;
  }, [province, dbRestaurants, enrichedData]);

  const provinceBars = useMemo(() => {
    if (!province || province.type !== "provincia") return [];
    const staticItems = bars.filter(
      b => b.province?.toLowerCase() === province.name.toLowerCase() || b.provinceId === province.id
    ).map(b => ({
      id: b.id, slug: b.slug, name: b.name, imageUrl: getSafeCoverImage(b.imageUrl, "bar", b.slug),
      barType: b.barType, musicStyle: Array.isArray(b.musicStyle) ? b.musicStyle.join(", ") : b.musicStyle,
      priceRange: b.priceRange, rating: b.rating, address: b.address, openingHours: b.openingHours,
    }));
    const slugs = new Set(staticItems.map(b => b.slug));
    (dbBars || []).forEach(b => {
      if (b.slug && !slugs.has(b.slug)) {
        staticItems.push({
          id: b.id, slug: b.slug || '', name: b.name, imageUrl: getSafeCoverImage(b.image_url, "bar", b.slug),
          barType: b.bar_type || 'lounge', musicStyle: b.music_style || '',
          priceRange: b.price_range || '$$', rating: Number(b.rating) || 0,
          address: b.address || '', openingHours: b.opening_hours || '',
        } as any);
        slugs.add(b.slug);
      }
    });

    // Complete with authentic nightlife items
    if (enrichedData?.bars && staticItems.length < 4) {
      enrichedData.bars.forEach(eb => {
        if (!slugs.has(eb.slug)) {
          staticItems.push({
            id: eb.id,
            slug: eb.slug,
            name: eb.name,
            imageUrl: getSafeCoverImage(eb.imageUrl, "bar", eb.slug),
            barType: eb.barType,
            musicStyle: eb.musicStyle,
            priceRange: eb.priceRange,
            rating: eb.rating,
            address: eb.address,
            openingHours: eb.openingHours,
          });
          slugs.add(eb.slug);
        }
      });
    }

    return staticItems;
  }, [province, dbBars, enrichedData]);

  const provinceDestinations = useMemo(() => {
    if (!province) return [];
    return destinations.filter(d => d.provinceSlug === province.slug && d.type !== "provincia").map(d => ({
      ...d,
      imageUrl: getSafeCoverImage(d.imageUrl, "destination", d.slug),
    }));
  }, [province]);

  const heroImages = staticDestino?.galeria?.length
    ? staticDestino.galeria.map(g => g.src)
    : province?.gallery?.length
    ? province.gallery.map(img => getSafeCoverImage(img, "province", province.slug))
    : [getSafeCoverImage(province?.imageUrl, "province", province?.slug)];

  // Suggested itinerary fallback
  const displayItinerary = staticDestino?.rutaSugerida?.length
    ? staticDestino.rutaSugerida
    : enrichedData?.itinerary || [];

  // Transport & Airport fallback
  const displayAirport = staticDestino?.aeropuerto || enrichedData?.airport;
  const displayTransport = staticDestino?.transporte || enrichedData?.transport || [];

  // Gallery items fallback
  const displayGallery = staticDestino?.galeria?.length
    ? staticDestino.galeria
    : (province?.gallery && province.gallery.length > 0)
    ? province.gallery.map((img, i) => ({
        src: getSafeCoverImage(img, "province", `${province.slug}-${i}`),
        alt: `${province.name} - Vista ${i + 1}`,
        caption: `Paisajes y rincones de ${province.name}`,
      }))
    : heroImages.map((src, i) => ({
        src,
        alt: `${province.name} - Imagen ${i + 1}`,
        caption: `Explorando ${province.name}`,
      }));

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
        title={`${province.name} - Guía Turística Completa de la República Dominicana`}
        description={province.description || province.shortDescription}
        keywords={`${province.name}, turismo, República Dominicana, qué hacer en ${province.name}, hoteles, restaurantes, monumentos, parques`}
        image={heroImages[0]}
        jsonLd={generateDestinationSchema({
          name: province.name,
          description: province.description || province.shortDescription,
          image: heroImages[0] || "https://descubrerd.com/og-image.jpg",
          url: `https://descubrerd.com/provincias/${province.slug}`,
        })}
      />

      <Header />

      <main className="min-h-screen bg-background">
        <ProvinceHero
          name={province.name}
          region={province.region}
          capital={dbProvince?.capital}
          population={dbProvince?.population}
          areaKm2={dbProvince?.area_km2}
          description={province.description}
          images={heroImages}
          highlights={province.highlights}
          provinceSlug={slug}
          destinations={provinceDestinations}
          hotels={provinceHotels}
        />


        {/* Bento Grid Technical Card */}
        <ProvinceTechCard
          name={province.name}
          capital={dbProvince?.capital}
          population={dbProvince?.population}
          areaKm2={dbProvince?.area_km2}
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

        {/* About Tabs - History, Geography, Culture */}
        {province.about && (
          <DestinationAboutTabs name={province.name} data={province.about} />
        )}

        <div id="actividades" className="scroll-mt-20">
          <ProvinceActivities
            provinceName={province.name}
            provinceSlug={province.slug}
            categories={province.categories}
          />
        </div>

        {provinceDestinations.length > 0 && (
          <div id="destinos" className="scroll-mt-20">
            <ProvinceDestinations
              provinceName={province.name}
              provinceSlug={province.slug}
              destinations={provinceDestinations}
            />
          </div>
        )}

        {/* Suggested Route / 3-Day Itinerary (Guaranteed for all provinces) */}
        {displayItinerary && displayItinerary.length > 0 && (
          <section id="itinerario" className="py-16 bg-muted/25 border-y border-border/60 scroll-mt-20">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-widest uppercase mb-2">
                <Route className="h-4 w-4" />
                <span>Itinerario Recomendado</span>
              </div>
              <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-2">
                Ruta Sugerida: {displayItinerary.length} Días Inolvidables en {province.name}
              </h2>
              <p className="text-sm md:text-base text-muted-foreground mb-8 max-w-3xl">
                Diseñado por expertos locales para aprovechar al máximo los atractivos históricos, ecológicos y gastronómicos de la provincia.
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {displayItinerary.map((dia: any, index: number) => (
                  <div key={dia.dia || index} className="relative bg-card rounded-2xl p-6 border border-border/70 hover:border-primary/40 transition-all shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20 font-semibold">
                          Día {dia.dia}: {dia.titulo}
                        </Badge>
                        <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-xs">
                          {dia.dia}
                        </div>
                      </div>
                      <h4 className="font-display font-bold text-foreground text-lg mb-2">{dia.lugar}</h4>
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{dia.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* How to Get There (Independent clean section) */}
        {displayAirport && (
          <div id="como-llegar" className="scroll-mt-20 border-b border-border/40">
            <HowToGetThere 
              aeropuertoCercano={displayAirport}
              opciones={displayTransport}
            />
          </div>
        )}

        {/* Monuments (With authentic regional fallback) */}
        <ProvinceMonuments
          provinceId={dbProvince?.id || ''}
          provinceName={province.name}
          fallbackItems={enrichedData?.monuments}
        />

        <BetweenSectionsAd />

        {/* Parks & Protected Areas (With authentic regional fallback) */}
        <ProvinceParks
          provinceId={dbProvince?.id || ''}
          provinceName={province.name}
          fallbackItems={enrichedData?.parks}
        />

        {/* Hotels Section */}
        <div id="hoteles" className="scroll-mt-20">
          <ProvinceFeaturedSection
            title={`Dónde Alojarte en ${province.name}`}
            subtitle="Hoteles & Alojamientos Selectos"
            icon={<Building2 className="h-5 w-5" />}
            items={provinceHotels}
            linkPrefix="/alojamiento"
            viewAllLink={`/alojamientos?provincia=${province.slug}`}
            emptyMessage="Hoteles destacados en proceso de curaduría"
          />
        </div>

        {/* Gastronomy Section */}
        <div id="gastronomia" className="bg-muted/30 scroll-mt-20">
          <ProvinceFeaturedSection
            title={`Gastronomía & Sabores en ${province.name}`}
            subtitle="Restaurantes Recomendados"
            icon={<Utensils className="h-5 w-5" />}
            items={provinceRestaurants}
            linkPrefix="/restaurante"
            viewAllLink={`/guia-gastronomica?provincia=${province.slug}`}
            emptyMessage="Restaurantes destacados en proceso de curaduría"
          />
        </div>

        {/* Nightlife Section */}
        <div id="vida-nocturna" className="scroll-mt-20">
          <ProvinceNightlife
            provinceName={province.name}
            provinceSlug={province.slug}
            venues={provinceBars}
          />
        </div>

        {/* Panorama Banner Ad */}
        <section className="py-6">
          <div className="container mx-auto px-4 max-w-6xl">
            <PanoramaAd showDemo />
          </div>
        </section>

        {/* Related Blog Posts */}
        <RelatedBlogPosts destinationName={province.name} destinationSlug={province.slug} />

        {/* Gallery Section - Fotografía & Paisajes */}
        {displayGallery && displayGallery.length > 0 && (
          <section className="py-12 bg-card/20 border-t border-border/40">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-widest uppercase mb-2">
                <Camera className="h-4 w-4" />
                <span>Fotografía & Paisajes</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-6">
                Galería Visual de {province.name}
              </h2>
              <DestinationGallery images={displayGallery} />
            </div>
          </section>
        )}

        {/* Comments & UGC */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-5xl">
            <CommentSection
              contentId={province.slug}
              contentType="province"
              title={`Experiencias y Consejos sobre ${province.name}`}
            />
          </div>
        </section>
      </main>

      <Footer />
    </PageTransition>
  );
}
