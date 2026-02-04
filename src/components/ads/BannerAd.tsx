import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

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
}

const sizeConfig: Record<AdSize, { width: string; height: string; label: string }> = {
  "leaderboard": { width: "728px", height: "90px", label: "728 x 90" },
  "billboard": { width: "970px", height: "250px", label: "970 x 250" },
  "skyscraper": { width: "160px", height: "600px", label: "160 x 600" },
  "medium-rect": { width: "300px", height: "250px", label: "300 x 250" },
  "large-rect": { width: "336px", height: "280px", label: "336 x 280" },
  "mobile-banner": { width: "320px", height: "50px", label: "320 x 50" },
  "mobile-large": { width: "320px", height: "100px", label: "320 x 100" },
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
}: BannerAdProps) {
  const config = sizeConfig[size];

  // Demo placeholder when no real ad content
  if (!imageUrl) {
    return (
      <div
        className={cn(
          "relative bg-gradient-to-br from-muted/50 to-muted border border-dashed border-border rounded-lg flex flex-col items-center justify-center overflow-hidden",
          "hover:border-primary/50 transition-colors",
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
        <span className="text-xs text-muted-foreground font-medium">PUBLICIDAD</span>
        <span className="text-[10px] text-muted-foreground/70">{config.label}</span>
        <a 
          href="/partners" 
          className="absolute bottom-2 right-2 text-[10px] text-primary hover:underline flex items-center gap-1"
        >
          Anunciar aquí <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    );
  }

  // Real ad content
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
        src={imageUrl} 
        alt={altText}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      {sponsor && (
        <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
          Patrocinado por {sponsor}
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
export function HeaderAd({ className }: { className?: string }) {
  return (
    <div className={cn("hidden lg:flex justify-center py-2 bg-muted/30", className)}>
      <BannerAd size="leaderboard" placement="header" />
    </div>
  );
}

export function SidebarAd({ className }: { className?: string }) {
  return (
    <div className={cn("hidden xl:block sticky top-24", className)}>
      <BannerAd size="skyscraper" placement="sidebar" />
    </div>
  );
}

export function InlineAd({ className }: { className?: string }) {
  return (
    <div className={cn("flex justify-center py-8", className)}>
      <BannerAd size="medium-rect" placement="inline" className="mx-auto" />
    </div>
  );
}

export function BetweenSectionsAd({ className }: { className?: string }) {
  return (
    <div className={cn("container mx-auto px-4 py-8", className)}>
      <div className="hidden md:flex justify-center">
        <BannerAd size="billboard" placement="between-sections" />
      </div>
      <div className="flex md:hidden justify-center">
        <BannerAd size="mobile-large" placement="between-sections" />
      </div>
    </div>
  );
}

export function MobileAd({ className }: { className?: string }) {
  return (
    <div className={cn("lg:hidden flex justify-center py-2", className)}>
      <BannerAd size="mobile-banner" placement="header" />
    </div>
  );
}
