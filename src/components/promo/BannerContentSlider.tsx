import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  interval?: number; // 10s a 15s recomendado para evitar CLS
  height?: string;
}

export function BannerContentSlider({ items, interval = 12000, height }: BannerContentSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const goTo = useCallback(
    (index: number) => {
      setCurrent((index + items.length) % items.length);
    },
    [items.length]
  );

  useEffect(() => {
    if (items.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [items.length, interval, isPaused]);

  if (!items.length) return null;

  const item = items[current];

  return (
    <div
      style={height ? { height } : undefined}
      className="relative w-full h-full overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Banner publicitario rotativo"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.01 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-full h-full"
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
        </motion.div>
      </AnimatePresence>

      {/* Dot indicators con barra de progreso sutil */}
      {items.length > 1 && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                goTo(i);
              }}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === current ? "w-5 bg-amber-400 shadow-sm shadow-amber-400/50" : "w-1.5 bg-white/40 hover:bg-white/70"
              )}
              aria-label={`Ir al anuncio publicitario ${i + 1}`}
              aria-current={i === current ? "true" : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

