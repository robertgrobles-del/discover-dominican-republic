import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

// Demo images for tourism ads
import adBeachResort from "@/assets/ads/ad-beach-resort.jpg";
import adAdventure from "@/assets/ads/ad-adventure.jpg";
import adLuxuryHotel from "@/assets/ads/ad-luxury-hotel.jpg";
import adWhaleWatching from "@/assets/ads/ad-whale-watching.jpg";
import adGastronomyMobile from "@/assets/ads/ad-gastronomy-mobile.jpg";

export type AdSize = 
  | "leaderboard"    // 728x90 - horizontal top/bottom
  | "billboard"      // 970x250 - large horizontal
  | "skyscraper"     // 160x600 - vertical sidebar
  | "medium-rect"    // 300x250 - inline content
  | "large-rect"     // 336x280 - inline content
  | "mobile-banner"  // 320x50 - mobile header
  | "mobile-large";  // 320x100 - mobile interstitial

export type AdPlacement = 
  | "header" 
  | "sidebar" 
  | "inline" 
  | "footer" 
  | "between-sections";

interface BannerAdProps {
  size: AdSize;
  placement?: AdPlacement;
  className?: string;
  adId?: string;
  // For demo purposes - in production these would come from ad server
  imageUrl?: string;
  targetUrl?: string;
  altText?: string;
  sponsor?: string;
  // Show demo tourism ads instead of placeholder
  showDemo?: boolean;
}

const sizeConfig: Record<AdSize, { width: string; height: string; placeholderHeight: string; label: string }> = {
  "leaderboard": { width: "728px", height: "90px", placeholderHeight: "60px", label: "728 x 90" },
  "billboard": { width: "970px", height: "250px", placeholderHeight: "120px", label: "970 x 250" },
  "skyscraper": { width: "160px", height: "600px", placeholderHeight: "300px", label: "160 x 600" },
  "medium-rect": { width: "300px", height: "250px", placeholderHeight: "100px", label: "300 x 250" },
  "large-rect": { width: "336px", height: "280px", placeholderHeight: "120px", label: "336 x 280" },
  "mobile-banner": { width: "320px", height: "50px", placeholderHeight: "40px", label: "320 x 50" },
  "mobile-large": { width: "320px", height: "100px", placeholderHeight: "60px", label: "320 x 100" },
};

// Demo tourism ads for each size
const demoAds: Partial<Record<AdSize, { image: string; alt: string; sponsor: string }>> = {
  "billboard": { image: adBeachResort, alt: "Resorts de playa en República Dominicana", sponsor: "Visit DR" },
  "leaderboard": { image: adLuxuryHotel, alt: "Hoteles de lujo en el Caribe", sponsor: "RD Hotels" },
  "medium-rect": { image: adAdventure, alt: "Aventuras en República Dominicana", sponsor: "Adventure RD" },
  "large-rect": { image: adAdventure, alt: "Tours de aventura", sponsor: "Eco Tours" },
  "skyscraper": { image: adWhaleWatching, alt: "Avistamiento de ballenas en Samaná", sponsor: "Whale RD" },
  "mobile-large": { image: adGastronomyMobile, alt: "Gastronomía dominicana", sponsor: "Taste RD" },
  "mobile-banner": { image: adGastronomyMobile, alt: "Sabores del Caribe", sponsor: "Food Tours" },
};

export function BannerAd({
  size,
  placement = "inline",
  className,
  adId,
  imageUrl,
  targetUrl,
  altText = "Publicidad",
  sponsor,
  showDemo = false,
}: BannerAdProps) {
  const config = sizeConfig[size];
  const demoAd = showDemo ? demoAds[size] : null;
  
  // Use demo ad if showDemo is true and no custom image is provided
  const finalImageUrl = imageUrl || (demoAd?.image);
  const finalAltText = altText || demoAd?.alt || "Publicidad turística";
  const finalSponsor = sponsor || demoAd?.sponsor;

  // Demo placeholder when no real ad content and no demo
  if (!finalImageUrl) {
    return (
      <div
        className={cn(
          "relative bg-gradient-to-br from-muted/30 to-muted/10 border border-dashed border-border/50 rounded-lg flex flex-col items-center justify-center overflow-hidden",
          "hover:border-primary/30 transition-colors",
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
        <span className="text-[10px] text-muted-foreground/60 font-medium tracking-wider">ESPACIO PUBLICITARIO</span>
        <a 
          href="/partners" 
          className="text-[9px] text-primary/70 hover:text-primary hover:underline flex items-center gap-0.5 mt-1"
        >
          Anunciar aquí <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>
    );
  }

  // Real ad content or demo ad
  const AdContent = (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg",
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
      {finalSponsor && (
        <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
          Patrocinado por {finalSponsor}
        </span>
      )}
      <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
        Publicidad
      </span>
    </div>
  );

  if (targetUrl) {
    return (
      <a 
        href={targetUrl} 
        target="_blank" 
        rel="noopener noreferrer sponsored"
        className="block"
      >
        {AdContent}
      </a>
    );
  }

  return AdContent;
}

// Wrapper components for common placements
export function HeaderAd({ className, showDemo = false }: { className?: string; showDemo?: boolean }) {
  return (
    <div className={cn("hidden lg:flex justify-center py-2 bg-muted/20", className)}>
      <BannerAd size="leaderboard" placement="header" showDemo={showDemo} />
    </div>
  );
}

export function SidebarAd({ className, showDemo = false }: { className?: string; showDemo?: boolean }) {
  return (
    <div className={cn("hidden xl:block sticky top-24", className)}>
      <BannerAd size="skyscraper" placement="sidebar" showDemo={showDemo} />
    </div>
  );
}

export function InlineAd({ className, showDemo = false }: { className?: string; showDemo?: boolean }) {
  return (
    <div className={cn("flex justify-center py-6", className)}>
      <BannerAd size="medium-rect" placement="inline" className="mx-auto" showDemo={showDemo} />
    </div>
  );
}

export function BetweenSectionsAd({ className, showDemo = false }: { className?: string; showDemo?: boolean }) {
  return (
    <div className={cn("container mx-auto px-4 py-6", className)}>
      <div className="hidden md:flex justify-center">
        <BannerAd size="billboard" placement="between-sections" showDemo={showDemo} />
      </div>
      <div className="flex md:hidden justify-center">
        <BannerAd size="mobile-large" placement="between-sections" showDemo={showDemo} />
      </div>
    </div>
  );
}

export function MobileAd({ className, showDemo = false }: { className?: string; showDemo?: boolean }) {
  return (
    <div className={cn("lg:hidden flex justify-center py-2", className)}>
      <BannerAd size="mobile-banner" placement="header" showDemo={showDemo} />
    </div>
  );
}

// New compact ad for pages with less space
export function CompactInlineAd({ className, showDemo = false }: { className?: string; showDemo?: boolean }) {
  return (
    <div className={cn("flex justify-center py-4", className)}>
      <div className="hidden md:block">
        <BannerAd size="leaderboard" placement="inline" showDemo={showDemo} />
      </div>
      <div className="block md:hidden">
        <BannerAd size="mobile-large" placement="inline" showDemo={showDemo} />
      </div>
    </div>
  );
}
