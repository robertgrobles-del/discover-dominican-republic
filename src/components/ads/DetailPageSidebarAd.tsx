import { cn } from "@/lib/utils";
import { BannerAd } from "./BannerAd";

interface DetailPageSidebarAdProps {
  className?: string;
  showDemo?: boolean;
  variant?: "standard" | "square";
}

export function DetailPageSidebarAd({ className, showDemo = false, variant = "standard" }: DetailPageSidebarAdProps) {
  return (
    <div className={cn("hidden lg:block", className)}>
      <div className="sticky top-24 space-y-4">
        <BannerAd 
          size={variant === "square" ? "square-large" : "medium-rect"} 
          placement="sidebar" 
          showDemo={showDemo}
        />
      </div>
    </div>
  );
}
