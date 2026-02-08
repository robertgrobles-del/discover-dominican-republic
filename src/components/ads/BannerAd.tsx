import { cn } from "@/lib/utils";
import { ExternalLink, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

// Demo images for tourism ads
import adBeachResort from "@/assets/ads/ad-beach-resort.jpg";
import adAdventure from "@/assets/ads/ad-adventure.jpg";
import adLuxuryHotel from "@/assets/ads/ad-luxury-hotel.jpg";
import adWhaleWatching from "@/assets/ads/ad-whale-watching.jpg";
import adGastronomyMobile from "@/assets/ads/ad-gastronomy-mobile.jpg";
import adEcoSquare from "@/assets/ads/ad-eco-square.jpg";
import adSpaSquare from "@/assets/ads/ad-spa-square.jpg";
import adGolfSkyscraper from "@/assets/ads/ad-golf-skyscraper.jpg";
import adCasinoSkyscraper from "@/assets/ads/ad-casino-skyscraper.jpg";
import adDivingWide from "@/assets/ads/ad-diving-wide.jpg";

export type AdSize = 
  | "leaderboard"       // 728x90 - horizontal top/bottom
  | "billboard"         // 970x125 - large horizontal (reduced height)
  | "skyscraper"        // 160x600 - vertical sidebar
  | "wide-skyscraper"   // 300x600 - wider vertical sidebar
  | "half-page"         // 300x600 - half page ad
  | "medium-rect"       // 300x250 - inline content
  | "large-rect"        // 336x280 - inline content
  | "square-small"      // 250x250 - small square
  | "square-large"      // 300x300 - large square
  | "mobile-banner"     // 320x50 - mobile header
  | "mobile-large"      // 320x100 - mobile interstitial
  | "mobile-medium"     // 320x250 - mobile medium
  | "portrait"          // 300x1050 - portrait
  | "panorama";         // 980x120 - panoramic

export type AdPlacement = 
  | "header" 
  | "sidebar" 
  | "inline" 
  | "footer" 
  | "between-sections"
  | "sticky";

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
}

// Promotional messages for demo ads
const promoMessages: Record<string, { headline: string; subtext: string; cta: string }> = {
  "billboard": {
    headline: "🌴 República Dominicana, El Mejor Destino del Caribe",
    subtext: "Tu hotel, restaurante o agencia podría estar aquí",
    cta: "Anúnciate con nosotros"
  },
  "leaderboard": {
    headline: "✨ Promociona tu negocio turístico",
    subtext: "Llega a miles de viajeros cada día",
    cta: "Contáctanos"
  },
  "skyscraper": {
    headline: "🏝️ Destino #1",
    subtext: "Anuncia aquí",
    cta: "Ver más"
  },
  "wide-skyscraper": {
    headline: "🌊 Tu negocio en el paraíso",
    subtext: "Promociona tu establecimiento",
    cta: "Contactar"
  },
  "medium-rect": {
    headline: "🌅 Espacio Premium",
    subtext: "Tu marca aquí",
    cta: "Anunciarse"
  },
  "panorama": {
    headline: "🏖️ República Dominicana te espera",
    subtext: "Promociona tu establecimiento turístico aquí",
    cta: "Contáctanos"
  },
  "default": {
    headline: "🌴 Anuncia en RD",
    subtext: "El mejor destino del Caribe",
    cta: "Contactar"
  }
};

const sizeConfig: Record<AdSize, { width: string; height: string; placeholderHeight: string; label: string }> = {
  "leaderboard": { width: "728px", height: "90px", placeholderHeight: "50px", label: "728×90" },
  "billboard": { width: "970px", height: "125px", placeholderHeight: "80px", label: "970×125" },
  "skyscraper": { width: "160px", height: "600px", placeholderHeight: "250px", label: "160×600" },
  "wide-skyscraper": { width: "300px", height: "600px", placeholderHeight: "280px", label: "300×600" },
  "half-page": { width: "300px", height: "600px", placeholderHeight: "280px", label: "300×600" },
  "medium-rect": { width: "300px", height: "250px", placeholderHeight: "100px", label: "300×250" },
  "large-rect": { width: "336px", height: "280px", placeholderHeight: "110px", label: "336×280" },
  "square-small": { width: "250px", height: "250px", placeholderHeight: "100px", label: "250×250" },
  "square-large": { width: "300px", height: "300px", placeholderHeight: "120px", label: "300×300" },
  "mobile-banner": { width: "320px", height: "50px", placeholderHeight: "30px", label: "320×50" },
  "mobile-large": { width: "320px", height: "80px", placeholderHeight: "50px", label: "320×80" },
  "mobile-medium": { width: "320px", height: "250px", placeholderHeight: "100px", label: "320×250" },
  "portrait": { width: "300px", height: "1050px", placeholderHeight: "400px", label: "300×1050" },
  "panorama": { width: "980px", height: "100px", placeholderHeight: "60px", label: "980×100" },
};

// Demo tourism ads for each size
const demoAds: Partial<Record<AdSize, { image: string; alt: string; sponsor: string }>> = {
  "billboard": { image: adBeachResort, alt: "Resorts de playa en República Dominicana", sponsor: "Visit DR" },
  "leaderboard": { image: adLuxuryHotel, alt: "Hoteles de lujo en el Caribe", sponsor: "RD Hotels" },
  "medium-rect": { image: adAdventure, alt: "Aventuras en República Dominicana", sponsor: "Adventure RD" },
  "large-rect": { image: adDivingWide, alt: "Buceo en el Caribe", sponsor: "Dive RD" },
  "skyscraper": { image: adWhaleWatching, alt: "Avistamiento de ballenas en Samaná", sponsor: "Whale RD" },
  "wide-skyscraper": { image: adGolfSkyscraper, alt: "Golf en República Dominicana", sponsor: "Golf RD" },
  "half-page": { image: adCasinoSkyscraper, alt: "Casinos y entretenimiento", sponsor: "Casino RD" },
  "mobile-large": { image: adGastronomyMobile, alt: "Gastronomía dominicana", sponsor: "Taste RD" },
  "mobile-banner": { image: adGastronomyMobile, alt: "Sabores del Caribe", sponsor: "Food Tours" },
  "mobile-medium": { image: adAdventure, alt: "Excursiones tropicales", sponsor: "Tours RD" },
  "square-small": { image: adSpaSquare, alt: "Spa y bienestar", sponsor: "Wellness RD" },
  "square-large": { image: adEcoSquare, alt: "Ecoturismo en RD", sponsor: "Eco Tours" },
  "portrait": { image: adGolfSkyscraper, alt: "Destinos de golf premium", sponsor: "Golf Premium" },
  "panorama": { image: adBeachResort, alt: "Playas paradisíacas", sponsor: "Beach RD" },
};

export function BannerAd({
  size,
  placement = "inline",
  className,
  adId,
  imageUrl,
  targetUrl = "/partners",
  altText = "Publicidad",
  sponsor,
  showDemo = false,
}: BannerAdProps) {
  const config = sizeConfig[size];
  const demoAd = showDemo ? demoAds[size] : null;
  const promo = promoMessages[size] || promoMessages["default"];
  
  const finalImageUrl = imageUrl || (demoAd?.image);
  const finalAltText = altText || demoAd?.alt || "Publicidad turística";
  const finalSponsor = sponsor || demoAd?.sponsor;

  const isHorizontal = ["billboard", "leaderboard", "panorama", "mobile-large", "mobile-banner"].includes(size);
  const isCompact = ["mobile-banner", "mobile-large", "leaderboard"].includes(size);

  if (!finalImageUrl) {
    return (
      <Link
        to="/partners"
        className={cn(
          "relative bg-gradient-to-br from-primary/10 to-primary/5 border border-dashed border-primary/30 rounded-lg flex flex-col items-center justify-center overflow-hidden",
          "hover:border-primary/50 hover:from-primary/15 transition-all group",
          className
        )}
        style={{ 
          width: "100%", 
          maxWidth: config.width, 
          height: config.placeholderHeight 
        }}
        data-ad-id={adId}
        data-ad-size={size}
        data-ad-placement={placement}
      >
        <span className="text-xs text-primary font-medium flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {promo.headline}
        </span>
        <span className="text-[10px] text-muted-foreground mt-1">
          {promo.subtext}
        </span>
        <span className="text-[9px] text-primary/70 group-hover:text-primary hover:underline flex items-center gap-0.5 mt-2 font-medium">
          {promo.cta} <ExternalLink className="h-2.5 w-2.5" />
        </span>
      </Link>
    );
  }

  const AdContent = (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg group",
        "hover:shadow-lg transition-shadow",
        className
      )}
      style={{ 
        width: "100%", 
        maxWidth: config.width, 
        height: config.height 
      }}
      data-ad-id={adId}
      data-ad-size={size}
      data-ad-placement={placement}
    >
      <img 
        src={finalImageUrl} 
        alt={finalAltText}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      
      {/* Overlay with promotional text */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent",
        "flex items-center"
      )}>
        <div className={cn(
          "text-white px-4",
          isCompact ? "py-1" : "py-3"
        )}>
          <p className={cn(
            "font-bold leading-tight",
            isCompact ? "text-xs" : isHorizontal ? "text-sm md:text-base" : "text-xs"
          )}>
            {promo.headline}
          </p>
          {!isCompact && (
            <p className={cn(
              "text-white/80 mt-0.5",
              isHorizontal ? "text-xs" : "text-[10px]"
            )}>
              {promo.subtext}
            </p>
          )}
          <span className={cn(
            "inline-flex items-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded px-2 py-0.5 mt-1 font-medium transition-colors",
            isCompact ? "text-[9px]" : "text-[10px]"
          )}>
            {promo.cta}
            <ExternalLink className="h-2.5 w-2.5" />
          </span>
        </div>
      </div>

      {finalSponsor && (
        <span className="absolute top-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
          {finalSponsor}
        </span>
      )}
      <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
        Publicidad
      </span>
    </div>
  );

  return (
    <Link 
      to={targetUrl} 
      className="block"
    >
      {AdContent}
    </Link>
  );
}

// Wrapper components for common placements
export function HeaderAd({ className, showDemo = false }: { className?: string; showDemo?: boolean }) {
  return (
    <div className={cn("hidden lg:flex justify-center py-2 bg-muted/20", className)}>
      <BannerAd size="leaderboard" placement="header" showDemo={showDemo} />
    </div>
  );
}

export function SidebarAd({ className, showDemo = false, variant = "standard" }: { className?: string; showDemo?: boolean; variant?: "standard" | "wide" | "square" }) {
  const size = variant === "wide" ? "wide-skyscraper" : variant === "square" ? "square-large" : "skyscraper";
  return (
    <div className={cn("hidden xl:block sticky top-24", className)}>
      <BannerAd size={size} placement="sidebar" showDemo={showDemo} />
    </div>
  );
}

export function InlineAd({ className, showDemo = false, variant = "medium" }: { className?: string; showDemo?: boolean; variant?: "medium" | "large" | "square-sm" | "square-lg" }) {
  const sizeMap: Record<string, AdSize> = {
    "medium": "medium-rect",
    "large": "large-rect",
    "square-sm": "square-small",
    "square-lg": "square-large"
  };
  return (
    <div className={cn("flex justify-center py-4", className)}>
      <BannerAd size={sizeMap[variant]} placement="inline" className="mx-auto" showDemo={showDemo} />
    </div>
  );
}

export function BetweenSectionsAd({ className, showDemo = false }: { className?: string; showDemo?: boolean }) {
  return (
    <div className={cn("container mx-auto px-4 py-3", className)}>
      <div className="hidden md:flex justify-center">
        <BannerAd size="billboard" placement="between-sections" showDemo={showDemo} />
      </div>
      <div className="flex md:hidden justify-center">
        <BannerAd size="mobile-large" placement="between-sections" showDemo={showDemo} />
      </div>
    </div>
  );
}

export function MobileAd({ className, showDemo = false, size = "mobile-banner" }: { className?: string; showDemo?: boolean; size?: "mobile-banner" | "mobile-large" | "mobile-medium" }) {
  return (
    <div className={cn("lg:hidden flex justify-center py-2", className)}>
      <BannerAd size={size} placement="header" showDemo={showDemo} />
    </div>
  );
}

export function CompactInlineAd({ className, showDemo = false }: { className?: string; showDemo?: boolean }) {
  return (
    <div className={cn("flex justify-center py-3", className)}>
      <div className="hidden md:block">
        <BannerAd size="leaderboard" placement="inline" showDemo={showDemo} />
      </div>
      <div className="block md:hidden">
        <BannerAd size="mobile-large" placement="inline" showDemo={showDemo} />
      </div>
    </div>
  );
}

export function SquareAd({ className, showDemo = false, size = "square-large" }: { className?: string; showDemo?: boolean; size?: "square-small" | "square-large" }) {
  return (
    <div className={cn("flex justify-center py-4", className)}>
      <BannerAd size={size} placement="inline" showDemo={showDemo} />
    </div>
  );
}

export function HalfPageAd({ className, showDemo = false }: { className?: string; showDemo?: boolean }) {
  return (
    <div className={cn("hidden xl:block sticky top-24", className)}>
      <BannerAd size="half-page" placement="sidebar" showDemo={showDemo} />
    </div>
  );
}

export function PanoramaAd({ className, showDemo = false }: { className?: string; showDemo?: boolean }) {
  return (
    <div className={cn("hidden lg:flex justify-center py-3 bg-muted/10", className)}>
      <BannerAd size="panorama" placement="between-sections" showDemo={showDemo} />
    </div>
  );
}
