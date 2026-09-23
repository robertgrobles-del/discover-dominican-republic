import { useState, useEffect, useCallback } from "react";
import { BannerContentImage } from "./BannerContentImage";
import { BannerContentVideo } from "./BannerContentVideo";
import { BannerContentAnimation } from "./BannerContentAnimation";
import type { AnimationType } from "./BannerContentAnimation";
import { cn } from "@/lib/utils";

export interface SliderItem {
  type: "image" | "video" | "animation";
  src: string;
  alt?: string;
  video_url?: string;
  animation_type?: AnimationType;
  headline?: string;
  subtext?: string;
  cta_text?: string;
  target_url?: string;
}

interface BannerContentSliderProps {
  items: SliderItem[];
  interval?: number;
  height: string;
}

export function BannerContentSlider({ items, interval = 5000, height }: BannerContentSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrent(index);
        setIsTransitioning(false);
      }, 300);
    },
    [isTransitioning]
  );

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      goTo((current + 1) % items.length);
    }, interval);
    return () => clearInterval(timer);
  }, [current, items.length, interval, goTo]);

  if (!items.length) return null;

  const item = items[current];

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div
        className={cn(
          "w-full h-full transition-opacity duration-300",
          isTransitioning ? "opacity-0" : "opacity-100"
        )}
      >
        {item.type === "video" && item.video_url ? (
          <BannerContentVideo src={item.video_url} poster={item.src} />
        ) : item.type === "animation" && item.animation_type ? (
          <BannerContentAnimation
            imageSrc={item.src}
            alt={item.alt || "Ad"}
            animationType={item.animation_type}
          />
        ) : (
          <BannerContentImage src={item.src} alt={item.alt || "Ad"} />
        )}
      </div>

      {/* Dot indicators */}
      {items.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                i === current ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
              )}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
