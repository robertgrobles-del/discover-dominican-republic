import { useEffect } from "react";
import { autoBreadcrumbs } from "@/lib/breadcrumbs";
import { recordRecentlyViewed } from "@/lib/recentlyViewed";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  jsonLd?: object;
  /** Migas de pan explícitas (Fase 10.19) para cuando la ruta no basta (p. ej. mostrar la provincia real en vez
   * del slug). Si no se pasa, se generan solas a partir de la URL — salvo en las rutas de `HIDDEN_PREFIXES`
   * (`src/lib/breadcrumbs.ts`), donde nunca se muestran. Pasar `breadcrumbs={[]}` fuerza a ocultarlas también. */
  breadcrumbs?: { name: string; url: string }[];
}

export function SEOHead({
  title,
  description,
  keywords,
  image = "https://descubrerd.com/og-image.jpg",
  url,
  type = "website",
  jsonLd,
  breadcrumbs,
}: SEOHeadProps) {
  const fullTitle = title.includes("Descubre RD") ? title : `${title} | Descubre República Dominicana`;
  // Canonical URLs must not inherit tracking, filter, or fragment parameters.
  const currentUrl = (() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://descubrerd.com";
    try {
      const fallback = typeof window !== "undefined" ? window.location.href : "/";
      const candidate = new URL(url || fallback, origin);
      if (candidate.origin !== origin) return `${origin}${typeof window !== "undefined" ? window.location.pathname : "/"}`;
      return `${candidate.origin}${candidate.pathname}`;
    } catch {
      return `${origin}${typeof window !== "undefined" ? window.location.pathname : "/"}`;
    }
  })();

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update or create meta tags
    const updateMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // Standard meta tags
    updateMeta("description", description);
    if (keywords) updateMeta("keywords", keywords);

    // Open Graph
    updateMeta("og:title", fullTitle, true);
    updateMeta("og:description", description, true);
    let imageUrl = "https://descubrerd.com/og-image.jpg";
    try { imageUrl = new URL(image, window.location.origin).href; } catch { /* Keep the known-good default image. */ }
    updateMeta("og:image", imageUrl, true);
    updateMeta("og:image:secure_url", imageUrl, true);
    const imageType = /\.png(?:\?|$)/i.test(imageUrl) ? "image/png" : /\.webp(?:\?|$)/i.test(imageUrl) ? "image/webp" : /\.avif(?:\?|$)/i.test(imageUrl) ? "image/avif" : "image/jpeg";
    updateMeta("og:image:type", imageType, true);
    const removeMeta = (property: string) => document.querySelector(`meta[property="${property}"]`)?.remove();
    if (new URL(imageUrl).pathname === "/og-image.jpg") {
      updateMeta("og:image:width", "1200", true);
      updateMeta("og:image:height", "630", true);
    } else {
      removeMeta("og:image:width");
      removeMeta("og:image:height");
    }
    updateMeta("og:image:alt", description.slice(0, 100), true);
    updateMeta("og:url", currentUrl, true);
    updateMeta("og:type", type, true);
    const locale = document.documentElement.lang || "es";
    const ogLocales: Record<string, string> = { es: "es_DO", en: "en_US", fr: "fr_FR", de: "de_DE", pt: "pt_BR", it: "it_IT" };
    updateMeta("og:locale", ogLocales[locale] || ogLocales.es, true);
    updateMeta("og:site_name", "Descubre República Dominicana", true);

    // Twitter Card
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:site", "@DescubreRD");
    updateMeta("twitter:creator", "@DescubreRD");
    updateMeta("twitter:title", fullTitle);
    updateMeta("twitter:description", description);
    updateMeta("twitter:image", imageUrl);
    updateMeta("twitter:image:alt", description.slice(0, 100));

    // Update or create canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", currentUrl);

    // hreflang: el idioma se elige con `?lang=`; el español es la versión por defecto y no lleva parámetro.
    const alternates: [string, string][] = [["es", currentUrl], ["en", `${currentUrl}?lang=en`], ["x-default", currentUrl]];
    for (const [hreflang, href] of alternates) {
      let link = document.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "alternate");
        link.setAttribute("hreflang", hreflang);
        document.head.appendChild(link);
      }
      link.setAttribute("href", href);
    }
    recordRecentlyViewed(new URL(currentUrl).pathname, fullTitle);

    // JSON-LD structured data
    if (jsonLd) {
      let script = document.querySelector('script[data-seo-jsonld]') as HTMLScriptElement;
      if (!script) {
        script = document.createElement("script");
        script.setAttribute("type", "application/ld+json");
        script.setAttribute("data-seo-jsonld", "true");
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    }

    // Migas de pan (Fase 10.19): explícitas si la página las pasó; si no, se generan solas por ruta (o se ocultan
    // del todo en rutas de HIDDEN_PREFIXES — ver src/lib/breadcrumbs.ts). Script propio para no pisar el jsonLd principal.
    const resolvedBreadcrumbs = breadcrumbs ?? (typeof window !== "undefined" ? autoBreadcrumbs(window.location.pathname, fullTitle) : null);
    let bcScript = document.querySelector('script[data-seo-breadcrumb]') as HTMLScriptElement | null;
    if (resolvedBreadcrumbs && resolvedBreadcrumbs.length > 0) {
      if (!bcScript) {
        bcScript = document.createElement("script");
        bcScript.setAttribute("type", "application/ld+json");
        bcScript.setAttribute("data-seo-breadcrumb", "true");
        document.head.appendChild(bcScript);
      }
      bcScript.textContent = JSON.stringify(generateBreadcrumbSchema(resolvedBreadcrumbs));
    } else if (bcScript) {
      bcScript.remove();
    }

    return () => {
      // Cleanup JSON-LD on unmount
      const script = document.querySelector('script[data-seo-jsonld]');
      if (script) script.remove();
      const bcScript = document.querySelector('script[data-seo-breadcrumb]');
      if (bcScript) bcScript.remove();
    };
  }, [fullTitle, description, keywords, image, currentUrl, type, jsonLd, breadcrumbs]);

  return null;
}

// Pre-built JSON-LD generators
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Descubre República Dominicana",
    description: "Portal oficial de turismo de República Dominicana",
    url: "https://descubrerd.com",
    logo: {
      "@type": "ImageObject",
      url: "https://descubrerd.com/logo.png",
      width: 200,
      height: 60,
    },
    image: "https://descubrerd.com/og-image.jpg",
    areaServed: {
      "@type": "Country",
      name: "República Dominicana",
      addressCountry: "DO",
    },
    sameAs: [
      "https://facebook.com/descubrerd",
      "https://instagram.com/descubrerd",
      "https://twitter.com/descubrerd",
    ],
  };
}

export function generateDestinationSchema(destination: {
  name: string;
  description: string;
  image: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: destination.name,
    description: destination.description,
    image: destination.image,
    url: destination.url,
    containedInPlace: {
      "@type": "Country",
      name: "República Dominicana",
    },
  };
}

export function generateHotelSchema(hotel: {
  name: string;
  description: string;
  image: string;
  priceRange: string;
  rating?: number;
  reviewCount?: number;
  address: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: hotel.name,
    description: hotel.description,
    image: hotel.image,
    priceRange: hotel.priceRange,
    aggregateRating: typeof hotel.rating === "number" && hotel.rating >= 1 && hotel.rating <= 5 && Number.isInteger(hotel.reviewCount) && hotel.reviewCount! > 0
      ? { "@type": "AggregateRating", ratingValue: hotel.rating, bestRating: 5, ratingCount: hotel.reviewCount }
      : undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: hotel.address,
      addressCountry: "DO",
    },
  };
}

export function generateReviewSchema(review: {
  author: string;
  rating: number;
  datePublished: string;
  reviewBody: string;
  itemReviewed: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    author: { "@type": "Person", name: review.author },
    reviewRating: typeof review.rating === "number" && review.rating >= 1 && review.rating <= 5
      ? { "@type": "Rating", ratingValue: review.rating, bestRating: 5 }
      : undefined,
    datePublished: review.datePublished,
    reviewBody: review.reviewBody,
    itemReviewed: { "@type": "TouristDestination", name: review.itemReviewed },
  };
}

export function generateBeachSchema(beach: {
  name: string;
  description: string;
  image?: string;
  latitude?: number;
  longitude?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Beach",
    name: beach.name,
    description: beach.description,
    image: beach.image,
    geo: Number.isFinite(beach.latitude) && Number.isFinite(beach.longitude) ? {
      "@type": "GeoCoordinates",
      latitude: beach.latitude,
      longitude: beach.longitude,
    } : undefined,
    containedInPlace: { "@type": "Country", name: "República Dominicana" },
  };
}

export function generateRestaurantSchema(restaurant: {
  name: string;
  description: string;
  image?: string;
  priceRange?: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  cuisine?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    description: restaurant.description,
    image: restaurant.image,
    priceRange: restaurant.priceRange,
    servesCuisine: restaurant.cuisine,
    aggregateRating: typeof restaurant.rating === "number" && restaurant.rating >= 1 && restaurant.rating <= 5 && Number.isInteger(restaurant.reviewCount) && restaurant.reviewCount! > 0
      ? { "@type": "AggregateRating", ratingValue: restaurant.rating, bestRating: 5, ratingCount: restaurant.reviewCount }
      : undefined,
    address: restaurant.address ? {
      "@type": "PostalAddress",
      addressLocality: restaurant.address,
      addressCountry: "DO",
    } : undefined,
  };
}

export function generateTouristAttractionSchema(attraction: {
  name: string;
  description: string;
  image?: string;
  url?: string;
  touristType?: string[];
  geo?: { latitude: number; longitude: number };
  address?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: attraction.name,
    description: attraction.description,
    image: attraction.image,
    url: attraction.url,
    touristType: attraction.touristType,
    geo: attraction.geo ? {
      "@type": "GeoCoordinates",
      latitude: attraction.geo.latitude,
      longitude: attraction.geo.longitude,
    } : undefined,
    address: attraction.address ? {
      "@type": "PostalAddress",
      addressLocality: attraction.address,
      addressCountry: "DO",
    } : {
      "@type": "PostalAddress",
      addressCountry: "DO",
    },
  };
}

export function generateEventSchema(event: {
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    image: event.image,
    location: event.location ? {
      "@type": "Place",
      name: event.location,
      address: { "@type": "PostalAddress", addressCountry: "DO" },
    } : undefined,
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateArticleSchema(article: {
  title: string;
  description: string;
  image?: string;
  author?: string;
  publishedAt?: string;
  url?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: article.image,
    author: article.author ? { "@type": "Person", name: article.author } : undefined,
    datePublished: article.publishedAt,
    url: article.url,
    publisher: {
      "@type": "Organization",
      name: "Descubre República Dominicana",
    },
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
