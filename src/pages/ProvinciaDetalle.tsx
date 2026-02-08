import { useParams, Link } from "react-router-dom";
import { Home, ChevronRight, Building2, Utensils, Music } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";

import { ProvinceHero } from "@/components/province/ProvinceHero";
import { ProvinceTechCard } from "@/components/province/ProvinceTechCard";
import { ProvinceActivities } from "@/components/province/ProvinceActivities";
import { ProvinceDestinations } from "@/components/province/ProvinceDestinations";
import { ProvinceFeaturedSection } from "@/components/province/ProvinceFeaturedSection";
import { ProvinceNightlife } from "@/components/province/ProvinceNightlife";
import { BetweenSectionsAd, CompactInlineAd } from "@/components/ads";

import { destinations, getDestinationBySlug } from "@/data/destinations";
import { hotels } from "@/data/hotels";
import { restaurants } from "@/data/restaurants";
import { bars } from "@/data/bars";

export default function ProvinciaDetalle() {
  const { slug } = useParams<{ slug: string }>();
  
  // Find province data from static destinations
  const province = getDestinationBySlug(slug || "");
  
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

  // Get destinations within this province
  const provinceDestinations = destinations.filter(
    d => d.provinceSlug === province.slug && d.type !== "provincia"
  );

  // Get hotels in this province (matching by province name or slug)
  const provinceHotels = hotels.filter(
    h => h.province?.toLowerCase() === province.name.toLowerCase() ||
         h.provinceId === province.id
  ).map(h => ({
    id: h.id,
    slug: h.slug,
    name: h.name,
    imageUrl: h.imageUrl,
    shortDescription: h.shortDescription,
    rating: h.rating,
    priceRange: h.priceRange,
    category: h.category,
    address: h.address,
  }));

  // Get restaurants in this province
  const provinceRestaurants = restaurants.filter(
    r => r.province?.toLowerCase() === province.name.toLowerCase() ||
         r.provinceId === province.id
  ).map(r => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    imageUrl: r.imageUrl,
    shortDescription: r.shortDescription,
    rating: r.rating,
    priceRange: r.priceRange,
    category: Array.isArray(r.cuisineType) ? r.cuisineType[0] : (r.cuisineType || r.category),
    address: r.address,
  }));

  // Get bars/nightlife in this province
  const provinceBars = bars.filter(
    b => b.province?.toLowerCase() === province.name.toLowerCase() ||
         b.provinceId === province.id
  ).map(b => ({
    id: b.id,
    slug: b.slug,
    name: b.name,
    imageUrl: b.imageUrl,
    barType: b.barType,
    musicStyle: Array.isArray(b.musicStyle) ? b.musicStyle.join(", ") : b.musicStyle,
    priceRange: b.priceRange,
    rating: b.rating,
    address: b.address,
    openingHours: b.openingHours,
  }));

  // Mock data for demonstration (since actual static data may be limited)
  const heroImages = province.gallery?.length 
    ? province.gallery 
    : [province.imageUrl || "/placeholder.svg"];

  return (
    <PageTransition>
      <SEOHead
        title={`${province.name} - Turismo República Dominicana`}
        description={province.description || province.shortDescription}
        keywords={`${province.name}, turismo, República Dominicana, ${province.categories?.join(", ")}`}
      />

      <Header />

      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 pt-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary flex items-center gap-1">
              <Home className="h-4 w-4" />
              Inicio
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/destinos" className="hover:text-primary">Destinos</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/provincias" className="hover:text-primary">Provincias</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">{province.name}</span>
          </nav>
        </div>

        {/* Hero Section */}
        <ProvinceHero
          name={province.name}
          region={province.region}
          description={province.description}
          images={heroImages}
          highlights={province.highlights}
        />

        {/* Tech Card */}
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

        {/* Banner Ad */}
        <BetweenSectionsAd />

        {/* Activities Section */}
        <ProvinceActivities
          provinceName={province.name}
          provinceSlug={province.slug}
          categories={province.categories}
        />

        {/* Destinations in Province */}
        <ProvinceDestinations
          provinceName={province.name}
          provinceSlug={province.slug}
          destinations={provinceDestinations}
        />

        {/* Banner Ad */}
        <BetweenSectionsAd />

        {/* Featured Hotels */}
        <ProvinceFeaturedSection
          title={`Hoteles en ${province.name}`}
          subtitle="Alojamiento"
          icon={<Building2 className="h-5 w-5" />}
          items={provinceHotels}
          linkPrefix="/alojamiento"
          viewAllLink={`/alojamientos?provincia=${province.slug}`}
          emptyMessage="Próximamente hoteles destacados"
        />

        {/* Featured Restaurants */}
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

        {/* Nightlife */}
        <ProvinceNightlife
          provinceName={province.name}
          provinceSlug={province.slug}
          venues={provinceBars}
        />

        {/* Final Banner Ad */}
        <BetweenSectionsAd showDemo />
      </main>

      <Footer />
    </PageTransition>
  );
}
