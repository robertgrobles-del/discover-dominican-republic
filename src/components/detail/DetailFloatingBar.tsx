import React from "react";
import { Button } from "@/components/ui/button";
import { Heart, Share2 } from "lucide-react";

interface DetailFloatingBarProps {
  priceLabel?: string;
  priceValue?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  primaryActionIcon?: React.ReactNode;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onShare?: () => void;
  disabled?: boolean;

  title?: string;
  price?: string;
  pricePeriod?: string;
  rating?: number;
  ctaText?: string;
  onCtaClick?: () => void;
}

export const DetailFloatingBar: React.FC<DetailFloatingBarProps> = ({
  priceLabel,
  priceValue,
  primaryActionLabel,
  onPrimaryAction,
  primaryActionIcon,
  isSaved = false,
  onToggleSave,
  onShare,
  disabled = false,
  price,
  ctaText,
  onCtaClick,
}) => {
  const displayPrice = priceValue || price || "";
  const displayCta = primaryActionLabel || ctaText || "Reservar";
  const handleAction = onPrimaryAction || onCtaClick || (() => {});
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border p-3 px-4 shadow-xl md:hidden">
      <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
        {displayPrice ? (
          <div>
            {priceLabel && (
              <span className="text-[10px] text-muted-foreground uppercase font-bold block leading-none">
                {priceLabel}
              </span>
            )}
            <span className="text-base font-black text-foreground block leading-tight mt-0.5">
              {displayPrice}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            {onToggleSave && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleSave}
                className="h-10 w-10 p-0 rounded-2xl border-border"
              >
                <Heart className={`h-4 w-4 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            )}
            {onShare && (
              <Button
                variant="outline"
                size="sm"
                onClick={onShare}
                className="h-10 w-10 p-0 rounded-2xl border-border"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        <Button
          size="sm"
          disabled={disabled}
          onClick={handleAction}
          className="flex-1 rounded-2xl font-bold text-xs h-10 shadow-md gap-1.5"
        >
          {primaryActionIcon}
          {displayCta}
        </Button>
      </div>
    </div>
  );
};
