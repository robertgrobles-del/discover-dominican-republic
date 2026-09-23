/**
 * Curated high-resolution covers and image fallbacks for Dominican Republic Tourism entities.
 * Ensures that no Hotel, Bar, Restaurant, Nightclub, Beach, River, Monument, Province or Destination
 * ever shows an empty placeholder.
 */

// Category default covers
export const categoryCovers = {
  hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop&q=80",
  resort: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&h=800&fit=crop&q=80",
  allInclusive: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=800&fit=crop&q=80",
  boutique: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&h=800&fit=crop&q=80",
  ecoLodge: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=1200&h=800&fit=crop&q=80",

  restaurant: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=800&fit=crop&q=80",
  fineDining: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&h=800&fit=crop&q=80",
  seafood: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=1200&h=800&fit=crop&q=80",
  dominicanFood: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=800&fit=crop&q=80",
  cafe: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&h=800&fit=crop&q=80",

  bar: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&h=800&fit=crop&q=80",
  cocktailBar: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1200&h=800&fit=crop&q=80",
  nightclub: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=1200&h=800&fit=crop&q=80",
  beachBar: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop&q=80",
  rooftop: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=1200&h=800&fit=crop&q=80",

  beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop&q=80",
  river: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1200&h=800&fit=crop&q=80",
  waterfall: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&h=800&fit=crop&q=80",
  monument: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1200&h=800&fit=crop&q=80",
  experience: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop&q=80",
  province: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop&q=80",
  destination: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop&q=80",
};

// Province covers mapped by slug
export const provinceCovers: Record<string, string> = {
  "la-altagracia": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&h=800&fit=crop&q=80",
  "distrito-nacional": "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1200&h=800&fit=crop&q=80",
  "santo-domingo": "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1200&h=800&fit=crop&q=80",
  "samana": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop&q=80",
  "puerto-plata": "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?w=1200&h=800&fit=crop&q=80",
  "la-romana": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&h=800&fit=crop&q=80",
  "la-vega": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1200&h=800&fit=crop&q=80",
  "santiago": "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?w=1200&h=800&fit=crop&q=80",
  "barahona": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop&q=80",
  "pedernales": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop&q=80",
  "montecristi": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop&q=80",
  "maria-trinidad-sanchez": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop&q=80",
  "espaillat": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1200&h=800&fit=crop&q=80",
  "duarte": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1200&h=800&fit=crop&q=80",
  "azua": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop&q=80",
  "san-cristobal": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop&q=80",
  "san-pedro-de-macoris": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop&q=80",
  "el-seibo": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop&q=80",
  "hato-mayor": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop&q=80",
  "monte-plata": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1200&h=800&fit=crop&q=80",
  "peravia": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop&q=80",
  "san-jose-de-ocoa": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1200&h=800&fit=crop&q=80",
  "valverde": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1200&h=800&fit=crop&q=80",
  "dajabon": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1200&h=800&fit=crop&q=80",
  "santiago-rodriguez": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1200&h=800&fit=crop&q=80",
  "san-juan": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1200&h=800&fit=crop&q=80",
  "elias-pina": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1200&h=800&fit=crop&q=80",
  "baoruco": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop&q=80",
  "independencia": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop&q=80",
  "hermanas-mirabal": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1200&h=800&fit=crop&q=80",
  "monsenor-nouel": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1200&h=800&fit=crop&q=80",
  "sanchez-ramirez": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1200&h=800&fit=crop&q=80",
};

/**
 * Returns a guaranteed valid cover image URL for any item,
 * replacing placeholder.svg or null with a vibrant relevant image.
 */
export function getSafeCoverImage(
  url: string | null | undefined,
  type: keyof typeof categoryCovers = "destination",
  slug?: string
): string {
  if (url && !url.includes("placeholder.svg") && url.trim().length > 0) {
    return url;
  }

  if (slug && provinceCovers[slug]) {
    return provinceCovers[slug];
  }

  return categoryCovers[type] || categoryCovers.destination;
}
