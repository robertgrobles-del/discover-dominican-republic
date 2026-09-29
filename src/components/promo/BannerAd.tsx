import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { ExternalLink, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useBanner, type AdBanner } from "@/hooks/useAdBanners";
import { BannerMediaContent } from "./BannerMediaContent";
import { INDUSTRY_BANNERS_DEMO, type IndustryBannerDemo } from "@/data/mockIndustryBanners";

// Demo images for tourism promos (fallback)
import adBeachResort from "@/assets/promo/promo-beach-resort.jpg";
import adAdventure from "@/assets/promo/promo-adventure.jpg";
import adLuxuryHotel from "@/assets/promo/promo-luxury-hotel.jpg";
import adWhaleWatching from "@/assets/promo/promo-whale-watching.jpg";
import adGastronomyMobile from "@/assets/promo/promo-gastronomy-mobile.jpg";
import adEcoSquare from "@/assets/promo/promo-eco-square.jpg";
import adSpaSquare from "@/assets/promo/promo-spa-square.jpg";
import adGolfSkyscraper from "@/assets/promo/promo-golf-skyscraper.jpg";
import adCasinoSkyscraper from "@/assets/promo/promo-casino-skyscraper.jpg";
import adDivingWide from "@/assets/promo/promo-diving-wide.jpg";
import { OFFICIAL_BANNER_MAP } from "@/data/officialBanners";

export type AdSize = 
  | "leaderboard"           // 728x90
  | "super-leaderboard"     // 970x90
  | "billboard"             // 970x250
  | "skyscraper"            // 160x600
  | "skyscraper-traditional"// 120x600
  | "wide-skyscraper"       // 300x600
  | "half-page"             // 300x600
  | "medium-rect"           // 300x250 (MPU / Robapáginas)
  | "large-rect"            // 336x280
  | "square-small"          // 200x200 (Cuadrado Pequeño)
  | "square-large"          // 250x250 (Cuadrado Estándar)
  | "mobile-banner"         // 320x50 (Estándar móvil)
  | "mobile-large"          // 320x100 (Banner grande móvil)
  | "mobile-medium"         // 320x250 (Móvil integrado)
  | "interstitial-mobile"   // 320x480 (Intersticial móvil)
  | "panorama"              // 980x120
  | "full-width-hero"       // 1280x240 Full-Width High-Impact
  | "full-width-screen"     // 1920x250 Full-Width Screen (100vw)
  | "full-width-screen-2x" // 1920x250 2x Retina Full-Width Screen
  | "portrait";            // 300x1050 Portrait / Retrato

export type AdPlacement = 
  | "header" 
  | "sidebar" 
  | "inline" 
  | "footer" 
  | "between-sections"
  | "sticky"
  | "topbar"
  | "exit-intent";

export type IndustryCategory = 
  | "hotels" 
  | "restaurants" 
  | "bars" 
  | "banks" 
  | "alcohol" 
  | "rentcar" 
  | "airlines" 
  | "airports" 
  | "government" 
  | "presidente";

interface BannerAdProps {
  size: AdSize;
  placement?: AdPlacement;
  className?: string;
  adId?: string;
  imageUrl?: string;
  targetUrl?: string;
  altText?: string;
  sponsor?: string;
  showDemo?: boolean;
  showDimensionsBadge?: boolean;
  /** Specialized Dominican Industry Category for Demo Ads */
  industry?: IndustryCategory;
  /** Section key to fetch dynamic banner from DB */
  section?: string;
  /** Pass a pre-fetched banner object directly */
  bannerData?: AdBanner | null;
  /** Si la ficha es de un establecimiento Premium, bloquea anuncios de competidores (★ Mejora 71) */
  isPremiumListing?: boolean;
}

// Default promo messages (clean editorial tourism fallback when no DB banner)
const defaultPromo: Record<string, { headline: string; subtext: string; cta: string }> = {
  "full-width-hero": {
    headline: "Descubre Quisqueya La Bella: Playas, Cultura y Naturaleza",
    subtext: "Conoce las ofertas turísticas exclusivas y promociones de operadores certificados en todo el territorio nacional.",
    cta: "Explorar Todo RD"
  },
  "billboard": { 
    headline: "República Dominicana: Experiencias de Clase Mundial", 
    subtext: "Descubre alojamientos boutique, gastronomía galardonada y playas de ensueño.", 
    cta: "Explorar Ofertas" 
  },
  "leaderboard": { 
    headline: "Reserva los Mejores Alojamientos y Tours Oficiales", 
    subtext: "Conexión directa con operadores turísticos certificados de República Dominicana.", 
    cta: "Ver Catálogo" 
  },
  "skyscraper": { 
    headline: "Destino Caribe", 
    subtext: "Guía oficial de hoteles y escapadas.", 
    cta: "Reservar" 
  },
  "wide-skyscraper": { 
    headline: "Espacios Exclusivos en el Paraíso", 
    subtext: "Villas, resorts y experiencias frente al mar.", 
    cta: "Descubrir" 
  },
  "medium-rect": { 
    headline: "Escapadas de Lujo y Aventura", 
    subtext: "Certificaciones turísticas y experiencias inolvidables.", 
    cta: "Ver Experiencias" 
  },
  "panorama": { 
    headline: "República Dominicana lo tiene todo", 
    subtext: "Planifica tus próximas vacaciones con las mejores tarifas y operadores locales.", 
    cta: "Planificar Viaje" 
  },
  "default": { 
    headline: "Turismo en República Dominicana", 
    subtext: "Descubre destinos únicos, playas y gastronomía.", 
    cta: "Conocer Más" 
  },
};

const sizeConfig: Record<AdSize, { width: string; height: string; placeholderHeight: string; label: string }> = {
  "full-width-hero": { width: "100%", height: "240px", placeholderHeight: "180px", label: "1280 × 240 (Full Width)" },
  "leaderboard": { width: "728px", height: "90px", placeholderHeight: "60px", label: "728 × 90 (Leaderboard Estándar)" },
  "super-leaderboard": { width: "970px", height: "90px", placeholderHeight: "60px", label: "970 × 90 (Super Leaderboard)" },
  "billboard": { width: "980px", height: "120px", placeholderHeight: "70px", label: "980 × 120 (Panorama / Billboard)" },
  "skyscraper": { width: "160px", height: "600px", placeholderHeight: "250px", label: "160 × 600 (Skyscraper Ancho)" },
  "skyscraper-traditional": { width: "120px", height: "600px", placeholderHeight: "250px", label: "120 × 600 (Skyscraper Tradicional)" },
  "wide-skyscraper": { width: "300px", height: "600px", placeholderHeight: "280px", label: "300 × 600 (Wide Skyscraper)" },
  "half-page": { width: "300px", height: "600px", placeholderHeight: "280px", label: "300 × 600 (Media Página / Half Page)" },
  "medium-rect": { width: "300px", height: "250px", placeholderHeight: "120px", label: "300 × 250 (Medium Rectangle / MPU)" },
  "large-rect": { width: "336px", height: "280px", placeholderHeight: "130px", label: "336 × 280 (Large Rectangle)" },
  "square-small": { width: "200px", height: "200px", placeholderHeight: "100px", label: "200 × 200 (Cuadrado Pequeño)" },
  "square-large": { width: "250px", height: "250px", placeholderHeight: "110px", label: "250 × 250 (Cuadrado Estándar)" },
  "mobile-banner": { width: "320px", height: "50px", placeholderHeight: "40px", label: "320 × 50 (Mobile Banner Estándar)" },
  "mobile-large": { width: "320px", height: "100px", placeholderHeight: "60px", label: "320 × 100 (Mobile Large)" },
  "mobile-medium": { width: "320px", height: "250px", placeholderHeight: "120px", label: "320 × 250 (Mobile Medium Rectangle)" },
  "interstitial-mobile": { width: "320px", height: "480px", placeholderHeight: "240px", label: "320 × 480 (Intersticial Móvil)" },
  "portrait": { width: "300px", height: "1050px", placeholderHeight: "400px", label: "300 × 1050 (Portrait / Retrato)" },
  "panorama": { width: "980px", height: "120px", placeholderHeight: "70px", label: "980 × 120 (Panorama)" },
  "full-width-screen": { width: "100%", height: "250px", placeholderHeight: "180px", label: "1920 × 250 (Full-Width Screen)" },
  "full-width-screen-2x": { width: "100%", height: "250px", placeholderHeight: "180px", label: "1920 × 250 (Full-Width 2x Ultra HD)" },
};

// Demo fallback images & dynamic target landing pages
const demoAds: Partial<Record<AdSize, { image: string; alt: string; sponsor: string; targetUrl: string }>> = {
  "full-width-hero": { 
    image: adBeachResort, 
    alt: "Descubre Quisqueya La Bella: Playas, Cultura y Naturaleza", 
    sponsor: "Ministerio de Turismo de RD", 
    targetUrl: "/destinos/punta-cana" 
  },
  "billboard": { 
    image: adBeachResort, 
    alt: "Resorts de playa en República Dominicana", 
    sponsor: "Cap Cana & Punta Cana", 
    targetUrl: "/alojamientos" 
  },
  "leaderboard": { 
    image: adLuxuryHotel, 
    alt: "Hoteles de lujo en el Caribe", 
    sponsor: "Colección Boutique RD", 
    targetUrl: "https://instagram.com/godomrep" 
  },
  "medium-rect": { 
    image: adAdventure, 
    alt: "Aventuras en República Dominicana", 
    sponsor: "Turismo Aventura", 
    targetUrl: "/actividades" 
  },
  "large-rect": { 
    image: adDivingWide, 
    alt: "Buceo en el Caribe", 
    sponsor: "Parques Submarinos RD", 
    targetUrl: "/destinos/samana" 
  },
  "skyscraper": { 
    image: adWhaleWatching, 
    alt: "Avistamiento de ballenas en Samaná", 
    sponsor: "Santuario de Samaná", 
    targetUrl: "/destinos/samana" 
  },
  "wide-skyscraper": { 
    image: adGolfSkyscraper, 
    alt: "Campos de Golf PGA en República Dominicana", 
    sponsor: "Golf Dominicano", 
    targetUrl: "https://instagram.com/godomrep" 
  },
  "half-page": { 
    image: adCasinoSkyscraper, 
    alt: "Entretenimiento y Vida Nocturna", 
    sponsor: "Ocio Caribe", 
    targetUrl: "/vida-nocturna" 
  },
  "mobile-large": { 
    image: adGastronomyMobile, 
    alt: "Ruta Gastronómica Dominicana", 
    sponsor: "Sabores de RD", 
    targetUrl: "/guia-gastronomica" 
  },
  "mobile-banner": { 
    image: adGastronomyMobile, 
    alt: "Sabores del Caribe", 
    sponsor: "Gastronomía RD", 
    targetUrl: "/restaurantes" 
  },
  "mobile-medium": { 
    image: adAdventure, 
    alt: "Excursiones y Ecoturismo", 
    sponsor: "Ecoturismo RD", 
    targetUrl: "/sostenible" 
  },
  "square-small": { 
    image: adSpaSquare, 
    alt: "Centros de Bienestar y Spa", 
    sponsor: "Wellness RD", 
    targetUrl: "/wellness" 
  },
  "square-large": { 
    image: adEcoSquare, 
    alt: "Ecoturismo y Parques Nacionales", 
    sponsor: "Parques Nacionales", 
    targetUrl: "/destinos/jarabacoa" 
  },
  "portrait": { 
    image: adGolfSkyscraper, 
    alt: "Golf de campeonato en el Caribe", 
    sponsor: "PGA Tour RD", 
    targetUrl: "https://instagram.com/godomrep" 
  },
  "panorama": { 
    image: adBeachResort, 
    alt: "Playas vírgenes de República Dominicana", 
    sponsor: "Descubre República Dominicana", 
    targetUrl: "/playas" 
  },
};

export function BannerAd({
  size,
  placement = "inline",
  className,
  adId,
  imageUrl,
  targetUrl = "/alojamientos",
  altText = "Publicidad Turística Oficial",
  sponsor,
  showDemo = false,
  showDimensionsBadge = true,
  industry,
  section,
  bannerData,
  isPremiumListing = false,
}: BannerAdProps) {
  // Si la ficha es de un establecimiento Premium, no se muestran banners de competidores
  if (isPremiumListing) {
    return null;
  }

  // Fetch dynamic banner from DB if section is provided and no bannerData passed
  const dynamicBanner = useBanner(
    section && !bannerData
      ? { section, bannerType: size, placement }
      : {}
  );

  const activeBanner = bannerData || dynamicBanner;
  const config = sizeConfig[size] || sizeConfig["medium-rect"];
  const demoAd = showDemo ? demoAds[size] : null;

  // Resolve industry ad if specified
  const industryAd = industry
    ? INDUSTRY_BANNERS_DEMO.find((d) => d.industry === industry)
    : null;

  // Resolve values: bannerData > props > industryAd > official banner PNG > demo > defaults
  const officialBannerSrc = OFFICIAL_BANNER_MAP[size];
  const resolvedImageUrl = activeBanner?.image_url || imageUrl || industryAd?.imageUrl || officialBannerSrc || demoAd?.image;
  const isOfficialGraphic = resolvedImageUrl?.startsWith("/banners/");
  const resolvedAltText = activeBanner?.alt_text || altText || industryAd?.sponsor || demoAd?.alt || `Banner Oficial RD ${config.label}`;
  const resolvedTargetUrl = activeBanner?.target_url || (industryAd?.targetUrl ?? targetUrl);
  const resolvedSponsor = activeBanner?.sponsor || sponsor || industryAd?.sponsor || demoAd?.sponsor;
  const resolvedHeadline = activeBanner?.headline || industryAd?.headline || (defaultPromo[size] || defaultPromo["default"]).headline;
  const resolvedSubtext = activeBanner?.subtext || industryAd?.subtext || (defaultPromo[size] || defaultPromo["default"]).subtext;
  const resolvedCta = activeBanner?.cta_text || industryAd?.ctaText || (defaultPromo[size] || defaultPromo["default"]).cta;

  // Count impression on render/view once per banner id
  useEffect(() => {
    if (activeBanner?.id && activeBanner.id !== "preview-id") {
      import("@/hooks/useAdBanners").then(({ trackBannerImpression }) => {
        trackBannerImpression(activeBanner.id);
      });
    }
  }, [activeBanner?.id]);

  const handleBannerClick = () => {
    if (activeBanner?.id && activeBanner.id !== "preview-id") {
      import("@/hooks/useAdBanners").then(({ trackBannerClick }) => {
        trackBannerClick(activeBanner.id);
      });
    }
  };

  const isHorizontal = ["billboard", "leaderboard", "panorama", "mobile-large", "mobile-banner"].includes(size);
  const isVertical = ["skyscraper", "wide-skyscraper", "half-page", "portrait"].includes(size);
  const isRectangle = ["medium-rect", "large-rect", "square-small", "square-large", "mobile-medium"].includes(size);
  const isCompact = ["mobile-banner", "mobile-large"].includes(size);

  // Placeholder (no image)
  if (!resolvedImageUrl) {
    const isExternalPlaceholder = resolvedTargetUrl.startsWith("http://") || resolvedTargetUrl.startsWith("https://");
    const placeholderContent = (
      <div
        className={cn(
          "relative bg-card/80 backdrop-blur-md border border-border/80 hover:border-primary/40 rounded-2xl flex flex-col items-center justify-center p-4 overflow-hidden shadow-sm hover:shadow-md transition-all group w-full cursor-pointer",
          className
        )}
        style={{ maxWidth: config.width, minHeight: config.placeholderHeight }}
        data-promo-id={adId || activeBanner?.id}
        data-promo-size={size}
        data-promo-placement={placement}
        data-promo-section={section || activeBanner?.section}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase tracking-wider font-semibold text-primary flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {resolvedHeadline}
          </span>
        </div>
        <p className="text-xs text-muted-foreground text-center max-w-md">{resolvedSubtext}</p>
        <span className="text-[11px] font-semibold text-primary group-hover:underline flex items-center gap-1 mt-2.5">
          {resolvedCta} <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </span>
      </div>
    );

    if (isExternalPlaceholder) {
      return (
        <a
          href={resolvedTargetUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleBannerClick}
          className="block group w-full"
        >
          {placeholderContent}
        </a>
      );
    }

    return (
      <Link
        to={resolvedTargetUrl}
        onClick={handleBannerClick}
        className="block group w-full"
      >
        {placeholderContent}
      </Link>
    );
  }

  const isFullWidth = placement === "between-sections" || placement === "sidebar";
  const isExternalUrl = resolvedTargetUrl.startsWith("http://") || resolvedTargetUrl.startsWith("https://");

  const bannerInnerContent = (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl transition-all duration-300 transform-gpu w-full cursor-pointer",
        isOfficialGraphic ? "bg-transparent border-0 shadow-none hover:shadow-md" : "border border-white/10 shadow-md group-hover:shadow-xl",
        placement === "between-sections" && "!rounded-2xl mx-auto container px-0",
        className
      )}
      style={{ 
        maxWidth: isFullWidth ? "100%" : config.width, 
        height: config.height 
      }}
      data-promo-id={adId || activeBanner?.id}
      data-promo-size={size}
      data-promo-placement={placement}
      data-promo-section={section || activeBanner?.section}
    >
      {/* Media Background - Fills 100% of the Container */}
      <BannerMediaContent
        contentType={activeBanner?.content_type || "image"}
        imageUrl={resolvedImageUrl}
        altText={resolvedAltText}
        banner={activeBanner}
        height={config.height}
      />
      
      {/* Proportional Dynamic Overlay - Only show if not using an official pre-designed banner graphic, OR if custom DB headlines exist */}
      {(!isOfficialGraphic || Boolean(activeBanner?.headline)) && (
        <div className={cn(
          "absolute inset-0 z-10 flex",
          isVertical 
            ? "bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-slate-950/30 flex-col justify-end px-3 py-5 text-center items-center" 
            : isRectangle
            ? "bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent flex-col justify-end p-4 text-left"
            : "bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent flex-row items-center px-4 md:px-6"
        )}>
          <div className={cn(
            "text-white w-full",
            isHorizontal && "flex items-center justify-between gap-4 w-full py-2"
          )}>
            <div className="min-w-0 flex-1 px-1">
              {resolvedSponsor && !isCompact && (
                <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-amber-300/90 mb-1">
                  {resolvedSponsor}
                </span>
              )}
              <h3 className={cn(
                "font-display font-bold leading-snug text-white drop-shadow-sm", 
                isCompact 
                  ? "text-xs truncate" 
                  : isVertical
                  ? "text-xs sm:text-sm font-bold mb-1.5 line-clamp-2"
                  : isRectangle
                  ? "text-base font-bold mb-1 line-clamp-2"
                  : isHorizontal 
                  ? "text-sm md:text-base lg:text-lg truncate" 
                  : "text-sm truncate"
              )}>
                {resolvedHeadline}
              </h3>
              {!isCompact && (
                <p className={cn(
                  "text-slate-200/90 leading-tight font-normal", 
                  isVertical 
                    ? "text-[11px] sm:text-xs mb-3 line-clamp-3" 
                    : isRectangle
                    ? "text-xs mb-3 line-clamp-2"
                    : isHorizontal 
                    ? "text-xs md:text-sm mt-0.5 truncate hidden sm:block" 
                    : "text-xs truncate"
                )}>
                  {resolvedSubtext}
                </p>
              )}
            </div>

            <div className={cn("shrink-0", isVertical && "w-full mt-1.5", isRectangle && "mt-1")}>
              <span className={cn(
                "inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-md shadow-primary/20 transition-transform group-hover:scale-105",
                isCompact 
                  ? "text-[10px] px-2.5 py-1" 
                  : isVertical
                  ? "w-full text-xs px-3 py-2"
                  : isRectangle
                  ? "text-xs px-3.5 py-1.5"
                  : "text-xs px-4 py-2 shrink-0"
              )}>
                <span>{resolvedCta}</span>
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Central Dimension Indicator & Ad Space Status - Hide when official graphic already contains dimensions text */}
      {showDimensionsBadge && !isOfficialGraphic && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none w-auto max-w-[94%] flex items-center justify-center text-center">
          <div className="bg-red-600/95 hover:bg-red-600 text-white font-mono font-black text-xs sm:text-sm md:text-base px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border-2 border-white shadow-2xl shadow-red-950/90 backdrop-blur-md flex items-center gap-2 tracking-wider uppercase animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping shrink-0" />
            <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] whitespace-nowrap">
              {config.label} • ESPACIO DISPONIBLE
            </span>
          </div>
        </div>
      )}

      {/* Official Sponsored Label */}
      <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1">
        <span className="bg-slate-950/80 backdrop-blur-md text-slate-300 text-[9px] font-medium px-2 py-0.5 rounded-full border border-white/10 uppercase tracking-wider shadow-xs">
          Patrocinado
        </span>
      </div>
    </div>
  );

  if (isExternalUrl) {
    return (
      <a
        href={resolvedTargetUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleBannerClick}
        className="block group w-full"
        aria-label={`Anuncio patrocinado: ${resolvedHeadline}`}
      >
        {bannerInnerContent}
      </a>
    );
  }

  return (
    <Link 
      to={resolvedTargetUrl} 
      onClick={handleBannerClick}
      className="block group w-full" 
      aria-label={`Anuncio patrocinado: ${resolvedHeadline}`}
    >
      {bannerInnerContent}
    </Link>
  );
}

// ── Wrapper components ─────────────────────────────────────────

export function HeaderAd({ className, showDemo = false, section }: { className?: string; showDemo?: boolean; section?: string }) {
  return (
    <div className={cn("hidden lg:flex justify-center py-2.5 container mx-auto px-4 lg:px-8", className)}>
      <BannerAd size="leaderboard" placement="header" showDemo={showDemo} section={section || "global"} />
    </div>
  );
}

export function LeaderboardAd({ className, showDemo = false, section }: { className?: string; showDemo?: boolean; section?: string }) {
  return (
    <div className={cn("w-full py-4 flex justify-center container mx-auto px-4", className)}>
      <div className="hidden md:block">
        <BannerAd size="leaderboard" placement="inline" showDemo={showDemo} section={section} />
      </div>
      <div className="block md:hidden">
        <BannerAd size="mobile-banner" placement="inline" showDemo={showDemo} section={section} />
      </div>
    </div>
  );
}

export function SuperLeaderboardAd({ className, showDemo = false, section }: { className?: string; showDemo?: boolean; section?: string }) {
  return (
    <div className={cn("w-full py-4 flex justify-center container mx-auto px-4", className)}>
      <div className="hidden xl:block">
        <BannerAd size="super-leaderboard" placement="inline" showDemo={showDemo} section={section} />
      </div>
      <div className="hidden md:block xl:hidden">
        <BannerAd size="leaderboard" placement="inline" showDemo={showDemo} section={section} />
      </div>
      <div className="block md:hidden">
        <BannerAd size="mobile-large" placement="inline" showDemo={showDemo} section={section} />
      </div>
    </div>
  );
}

export function BillboardAd({ className, showDemo = false, section }: { className?: string; showDemo?: boolean; section?: string }) {
  return (
    <div className={cn("w-full py-6 container mx-auto px-4 lg:px-8", className)}>
      <div className="hidden md:block w-full">
        <BannerAd size="billboard" placement="between-sections" showDemo={showDemo} className="w-full !max-w-none shadow-sm" section={section} />
      </div>
      <div className="block md:hidden w-full">
        <BannerAd size="mobile-large" placement="between-sections" showDemo={showDemo} className="w-full !max-w-none shadow-sm" section={section} />
      </div>
    </div>
  );
}

export function MediumRectAd({ className, showDemo = false, section }: { className?: string; showDemo?: boolean; section?: string }) {
  return (
    <div className={cn("flex justify-center py-4", className)}>
      <BannerAd size="medium-rect" placement="inline" showDemo={showDemo} section={section} />
    </div>
  );
}

export function LargeRectAd({ className, showDemo = false, section }: { className?: string; showDemo?: boolean; section?: string }) {
  return (
    <div className={cn("flex justify-center py-4", className)}>
      <BannerAd size="large-rect" placement="inline" showDemo={showDemo} section={section} />
    </div>
  );
}

export function SkyscraperAd({ className, showDemo = false, variant = "standard", section }: { className?: string; showDemo?: boolean; variant?: "standard" | "traditional" | "wide"; section?: string }) {
  const size: AdSize = variant === "traditional" ? "skyscraper-traditional" : variant === "wide" ? "wide-skyscraper" : "skyscraper";
  return (
    <div className={cn("hidden xl:flex justify-center w-full sticky top-24 mb-6", className)}>
      <BannerAd size={size} placement="sidebar" showDemo={showDemo} section={section} />
    </div>
  );
}

export function PortraitAd({ className, showDemo = false, section }: { className?: string; showDemo?: boolean; section?: string }) {
  return (
    <div className={cn("hidden xl:flex justify-center w-full sticky top-24 mb-6", className)}>
      <BannerAd size="portrait" placement="sidebar" showDemo={showDemo} section={section} />
    </div>
  );
}

export function MobileBannerAd({ className, showDemo = false, size = "mobile-banner", section }: { className?: string; showDemo?: boolean; size?: "mobile-banner" | "mobile-large" | "mobile-medium"; section?: string }) {
  return (
    <div className={cn("lg:hidden flex justify-center py-2 px-4 mb-4", className)}>
      <BannerAd size={size} placement="header" showDemo={showDemo} section={section} />
    </div>
  );
}

export function SidebarAd({ className, showDemo = false, variant = "standard", section }: { className?: string; showDemo?: boolean; variant?: "standard" | "wide" | "square"; section?: string }) {
  const size = variant === "wide" ? "wide-skyscraper" : variant === "square" ? "square-large" : "skyscraper";
  return (
    <div className={cn("hidden xl:flex justify-center w-full sticky top-24 mb-6", className)}>
      <BannerAd size={size} placement="sidebar" showDemo={showDemo} section={section} />
    </div>
  );
}

export function InlineAd({ className, showDemo = false, variant = "medium", section }: { className?: string; showDemo?: boolean; variant?: "medium" | "large" | "square-sm" | "square-lg"; section?: string }) {
  const sizeMap: Record<string, AdSize> = { "medium": "medium-rect", "large": "large-rect", "square-sm": "square-small", "square-lg": "square-large" };
  return (
    <div className={cn("flex justify-center py-6 container mx-auto px-4", className)}>
      <BannerAd size={sizeMap[variant]} placement="inline" className="mx-auto" showDemo={showDemo} section={section} />
    </div>
  );
}

export function BetweenSectionsAd({ className, showDemo = false, section, industry }: { className?: string; showDemo?: boolean; section?: string; industry?: IndustryCategory }) {
  return (
    <div className={cn("w-full py-6 container mx-auto px-4 lg:px-8", className)}>
      <div className="hidden md:block w-full">
        <BannerAd size="billboard" placement="between-sections" showDemo={showDemo} className="w-full !max-w-none" section={section} industry={industry} />
      </div>
      <div className="block md:hidden w-full">
        <BannerAd size="mobile-large" placement="between-sections" showDemo={showDemo} className="w-full !max-w-none" section={section} industry={industry} />
      </div>
    </div>
  );
}

export function MobileAd({ className, showDemo = false, size = "mobile-large", section }: { className?: string; showDemo?: boolean; size?: "mobile-banner" | "mobile-large" | "mobile-medium"; section?: string }) {
  return (
    <div className={cn("lg:hidden flex justify-center py-2 px-4", className)}>
      <BannerAd size={size} placement="header" showDemo={showDemo} section={section} />
    </div>
  );
}

export function CompactInlineAd({ className, showDemo = false, section }: { className?: string; showDemo?: boolean; section?: string }) {
  return (
    <div className={cn("flex justify-center w-full py-3", className)}>
      <div className="hidden md:block w-full max-w-[970px]">
        <BannerAd size="billboard" placement="inline" showDemo={showDemo} section={section} className="w-full !max-w-none" />
      </div>
      <div className="block md:hidden w-full max-w-[360px]">
        <BannerAd size="mobile-large" placement="inline" showDemo={showDemo} section={section} className="w-full !max-w-none" />
      </div>
    </div>
  );
}

export function SquareAd({ className, showDemo = false, size = "square-large", section }: { className?: string; showDemo?: boolean; size?: "square-small" | "square-large"; section?: string }) {
  return (
    <div className={cn("flex justify-center py-4", className)}>
      <BannerAd size={size} placement="inline" showDemo={showDemo} section={section} />
    </div>
  );
}

export function HalfPageAd({ className, showDemo = false, section }: { className?: string; showDemo?: boolean; section?: string }) {
  return (
    <div className={cn("hidden xl:block sticky top-24", className)}>
      <BannerAd size="half-page" placement="sidebar" showDemo={showDemo} section={section} />
    </div>
  );
}

export function PanoramaAd({ className, showDemo = false, section }: { className?: string; showDemo?: boolean; section?: string }) {
  return (
    <div className={cn("hidden lg:flex justify-center py-3 bg-transparent", className)}>
      <BannerAd size="panorama" placement="between-sections" showDemo={showDemo} section={section} />
    </div>
  );
}

export function FullWidthHeroAd({ className, showDemo = false, section }: { className?: string; showDemo?: boolean; section?: string }) {
  return (
    <div className={cn("w-full py-6 container mx-auto px-4 lg:px-8", className)}>
      <BannerAd size="full-width-hero" placement="between-sections" showDemo={showDemo} className="w-full !max-w-none shadow-xl" section={section} />
    </div>
  );
}

/**
 * Banner de Ancho Completo (1920x250): se extiende de borde a borde de la pantalla (100% viewport)
 */
export function FullWidthScreenAd({ className, showDemo = false, section, isRetina = false }: { className?: string; showDemo?: boolean; section?: string; isRetina?: boolean }) {
  return (
    <div className={cn("w-full relative overflow-hidden py-4 my-6 bg-transparent", className)}>
      <div className="w-full">
        <BannerAd 
          size={isRetina ? "full-width-screen-2x" : "full-width-screen"} 
          placement="between-sections" 
          showDemo={showDemo} 
          className="w-full !max-w-none rounded-none md:rounded-2xl" 
          section={section} 
        />
      </div>
    </div>
  );
}

/**
 * Banner de Ancho Completo Retina Ultra HD 2x (1920x250 @2x)
 */
export function FullWidthScreenAd2x({ className, showDemo = false, section }: { className?: string; showDemo?: boolean; section?: string }) {
  return <FullWidthScreenAd className={className} showDemo={showDemo} section={section} isRetina={true} />;
}



