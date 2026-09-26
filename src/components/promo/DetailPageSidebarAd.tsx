import { cn } from "@/lib/utils";
import { BannerAd, type AdSize, type IndustryCategory } from "./BannerAd";

export type SidebarAdVariant = "standard" | "square" | "large" | "compact" | "half" | "skyscraper" | "wide-skyscraper";

interface DetailPageSidebarAdProps {
  className?: string;
  showDemo?: boolean;
  variant?: SidebarAdVariant;
  industry?: IndustryCategory;
}

export function DetailPageSidebarAd({ 
  className, 
  showDemo = false, 
  variant = "standard",
  industry
}: DetailPageSidebarAdProps) {
  const resolvedSize: AdSize = 
    variant === "skyscraper" 
      ? "skyscraper" 
      : variant === "wide-skyscraper" 
      ? "wide-skyscraper" 
      : variant === "square" 
      ? "square-large" 
      : variant === "large"
      ? "large-rect"
      : variant === "compact" || variant === "half"
      ? "mobile-large"
      : "medium-rect";

  return (
    <div className={cn("hidden lg:block w-full", className)}>
      <BannerAd 
        size={resolvedSize} 
        placement="sidebar" 
        showDemo={showDemo}
        industry={industry}
      />
    </div>
  );
}

