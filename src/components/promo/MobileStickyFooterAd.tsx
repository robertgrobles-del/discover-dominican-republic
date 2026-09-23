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
        "lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/80 shadow-2xl pb-safe",
        className
      )}
    >
      <div className="relative flex justify-center py-2 px-3">
        <Button
          variant="secondary"
          size="icon"
          aria-label="Cerrar anuncio flotante"
          className="absolute -top-3 right-3 h-6 w-6 rounded-full bg-card border border-border shadow-md hover:bg-destructive hover:text-white transition-colors z-20"
          onClick={() => setIsDismissed(true)}
        >
          <X className="h-3 w-3" aria-hidden="true" />
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

