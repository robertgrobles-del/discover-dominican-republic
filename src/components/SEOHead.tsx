import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  jsonLd?: object;
}

export function SEOHead({
  title,
  description,
  keywords,
  image = "https://id-preview--55c187f0-4b9c-49ff-a94c-aeab8c02e18c.lovable.app/og-image.jpg",
  url,
  type = "website",
  jsonLd,
}: SEOHeadProps) {
  const fullTitle = title.includes("Descubre RD") ? title : `${title} | Descubre República Dominicana`;
  const currentUrl = url || (typeof window !== "undefined" ? window.location.href : "");

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
    updateMeta("og:image", image, true);
    updateMeta("og:url", currentUrl, true);
    updateMeta("og:type", type, true);
    updateMeta("og:site_name", "Descubre República Dominicana", true);

    // Twitter Card
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", fullTitle);
    updateMeta("twitter:description", description);
    updateMeta("twitter:image", image);

    // Update or create canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", currentUrl);

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

    return () => {
      // Cleanup JSON-LD on unmount
      const script = document.querySelector('script[data-seo-jsonld]');
      if (script) script.remove();
    };
  }, [fullTitle, description, keywords, image, currentUrl, type, jsonLd]);

  return null;
}

// Pre-built JSON-LD generators
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: "Descubre República Dominicana",
    description: "Portal oficial de turismo de República Dominicana",
    url: "https://descubrerd.com",
    logo: "https://id-preview--55c187f0-4b9c-49ff-a94c-aeab8c02e18c.lovable.app/logo.png",
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
  address: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: hotel.name,
    description: hotel.description,
    image: hotel.image,
    priceRange: hotel.priceRange,
    aggregateRating: hotel.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: hotel.rating,
          bestRating: 5,
        }
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
    author: {
      "@type": "Person",
      name: review.author,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
    },
    datePublished: review.datePublished,
    reviewBody: review.reviewBody,
    itemReviewed: {
      "@type": "TouristDestination",
      name: review.itemReviewed,
    },
  };
}
