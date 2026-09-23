import { ReactNode } from "react";
import { BannerAd } from "@/components/promo";

interface SectionWithSideAdsProps {
  children: ReactNode;
  className?: string;
  showAds?: boolean;
  leftAdSize?: "skyscraper" | "wide-skyscraper";
  rightAdSize?: "skyscraper" | "wide-skyscraper";
}

export function SectionWithSideAds({ 
  children, 
  className = "",
  showAds = true,
  leftAdSize = "skyscraper",
  rightAdSize = "skyscraper"
}: SectionWithSideAdsProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Left Skyscraper Ad - Fixed within section */}
      {showAds && (
        <div className="hidden 2xl:block absolute left-0 top-0 h-full pointer-events-none" style={{ marginLeft: '-180px' }}>
          <div className="sticky top-24 pointer-events-auto">
            <BannerAd 
              size={leftAdSize}
              placement="sidebar"
              showDemo
              className="shadow-lg"
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      {children}

      {/* Right Skyscraper Ad - Fixed within section */}
      {showAds && (
        <div className="hidden 2xl:block absolute right-0 top-0 h-full pointer-events-none" style={{ marginRight: '-180px' }}>
          <div className="sticky top-24 pointer-events-auto">
            <BannerAd 
              size={rightAdSize}
              placement="sidebar"
              showDemo
              className="shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
