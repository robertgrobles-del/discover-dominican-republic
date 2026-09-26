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
      {/* Left Skyscraper Ad - Separated 20px from content, 24px bottom, centered flexbox */}
      {showAds && (
        <div 
          className="hidden min-[1680px]:flex justify-center items-start absolute right-[calc(100%+20px)] top-0 h-full pointer-events-none z-10"
          style={{
            maxWidth: "calc((100vw - 100%) / 2 - 24px)",
            width: leftAdSize === "wide-skyscraper" ? "300px" : "160px"
          }}
        >
          <div className="sticky top-24 pointer-events-auto overflow-hidden rounded-2xl w-full mb-6 flex justify-center">
            <BannerAd 
              size={leftAdSize}
              placement="sidebar"
              showDemo
              className="shadow-lg w-full max-w-full"
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      {children}

      {/* Right Skyscraper Ad - Separated 20px from content, 24px bottom, centered flexbox */}
      {showAds && (
        <div 
          className="hidden min-[1680px]:flex justify-center items-start absolute left-[calc(100%+20px)] top-0 h-full pointer-events-none z-10"
          style={{
            maxWidth: "calc((100vw - 100%) / 2 - 24px)",
            width: rightAdSize === "wide-skyscraper" ? "300px" : "160px"
          }}
        >
          <div className="sticky top-24 pointer-events-auto overflow-hidden rounded-2xl w-full mb-6 flex justify-center">
            <BannerAd 
              size={rightAdSize}
              placement="sidebar"
              showDemo
              className="shadow-lg w-full max-w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
