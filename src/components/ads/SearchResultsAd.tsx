import { cn } from "@/lib/utils";
import { BannerAd } from "./BannerAd";

interface SearchResultsAdProps {
  className?: string;
  showDemo?: boolean;
}

export function SearchResultsAd({ className, showDemo = false }: SearchResultsAdProps) {
  return (
    <div className={cn("w-full py-3 px-2", className)}>
      <div className="hidden md:block">
        <BannerAd 
          size="leaderboard" 
          placement="inline" 
          showDemo={showDemo}
          className="mx-auto"
        />
      </div>
      <div className="block md:hidden">
        <BannerAd 
          size="mobile-large" 
          placement="inline" 
          showDemo={showDemo}
          className="mx-auto"
        />
      </div>
    </div>
  );
}
