import { cn } from "@/lib/utils";
import { BannerAd, type AdSize, type IndustryCategory } from "./BannerAd";

interface DetailPageSidebarAdProps {
  className?: string;
  showDemo?: boolean;
  variant?: "standard" | "square" | "skyscraper" | "wide-skyscraper";
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

