import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export interface SEOHeadProps {
  title: string;
  description?: string;
  image?: string;
  canonicalUrl?: string;
  type?: "website" | "article" | "place" | "event" | "product";
  keywords?: string[];
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const DEFAULT_TITLE = "Descubre República Dominicana - Tu Portal de Turismo del Caribe";
const DEFAULT_DESCRIPTION =
  "Explora las mejores playas, destinos, hoteles, restaurantes y experiencias de República Dominicana. Planifica tu viaje perfecto al Caribe con 300+ días de sol al año.";
const DEFAULT_IMAGE = "https://descubrerd.com/og-image.jpg";
const BASE_URL = "https://descubrerd.com";

export function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  canonicalUrl,
  type = "website",
  keywords,
  jsonLd,
}: SEOHeadProps) {
  const location = useLocation();
  const currentUrl = canonicalUrl || `${BASE_URL}${location.pathname}`;
  const fullTitle = title.includes("República Dominicana") || title.includes("Descubre RD") 
    ? title 
    : `${title} | Descubre República Dominicana`;

  useEffect(() => {
    // 1. Update Title
    document.title = fullTitle;

    // Helper to update or create meta tags
    const updateMetaTag = (nameOrProperty: "name" | "property", key: string, value: string) => {
      let element = document.querySelector(`meta[${nameOrProperty}="${key}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(nameOrProperty, key);
        document.head.appendChild(element);
      }
      element.setAttribute("content", value);
    };

    // 2. Standard Meta Tags
    updateMetaTag("name", "description", description);
    if (keywords && keywords.length > 0) {
      updateMetaTag("name", "keywords", keywords.join(", "));
    }

    // 3. Open Graph Meta Tags
    updateMetaTag("property", "og:title", fullTitle);
    updateMetaTag("property", "og:description", description);
    updateMetaTag("property", "og:image", image);
    updateMetaTag("property", "og:url", currentUrl);
    updateMetaTag("property", "og:type", type);
    updateMetaTag("property", "og:site_name", "Descubre República Dominicana");
    updateMetaTag("property", "og:locale", "es_DO");

    // 4. Twitter Cards
    updateMetaTag("name", "twitter:card", "summary_large_image");
    updateMetaTag("name", "twitter:title", fullTitle);
    updateMetaTag("name", "twitter:description", description);
    updateMetaTag("name", "twitter:image", image);

    // 5. Canonical Link
    let canonicalElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalElement) {
      canonicalElement = document.createElement("link");
      canonicalElement.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.setAttribute("href", currentUrl);

    // 6. JSON-LD Structured Data for Google Rich Snippets
    let scriptTag = document.getElementById("json-ld-seo") as HTMLScriptElement | null;
    if (jsonLd) {
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.id = "json-ld-seo";
        scriptTag.type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(
        Array.isArray(jsonLd)
          ? {
              "@context": "https://schema.org",
              "@graph": jsonLd,
            }
          : {
              "@context": "https://schema.org",
              ...jsonLd,
            }
      );
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [fullTitle, description, image, currentUrl, type, keywords, jsonLd]);

  return null;
}
