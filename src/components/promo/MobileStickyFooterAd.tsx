import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BannerAd } from "./BannerAd";
import { Button } from "@/components/ui/button";

interface MobileStickyFooterAdProps {
  className?: string;
  showDemo?: boolean;
}

export function MobileStickyFooterAd({ className, showDemo = false }: MobileStickyFooterAdProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div 
      className={cn(
        "lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg",
        className
      )}
    >
      <div className="relative flex justify-center py-2 px-2">
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-3 right-2 h-6 w-6 rounded-full bg-background border border-border shadow-sm z-10"
          onClick={() => setIsDismissed(true)}
        >
          <X className="h-3 w-3" />
        </Button>
        <BannerAd 
          size="mobile-banner" 
          placement="sticky" 
          showDemo={showDemo}
          className="!w-full !max-w-full"
        />
      </div>
    </div>
  );
}
