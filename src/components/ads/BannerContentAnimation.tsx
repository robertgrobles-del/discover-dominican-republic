import { cn } from "@/lib/utils";

export type AnimationType = "pulse" | "shimmer" | "gradient-shift" | "zoom" | "fade-cycle";

interface BannerContentAnimationProps {
  imageSrc: string;
  alt: string;
  animationType: AnimationType;
}

const animationClasses: Record<AnimationType, string> = {
  pulse: "animate-[pulse_3s_ease-in-out_infinite]",
  shimmer: "animate-[shimmer_2.5s_linear_infinite]",
  "gradient-shift": "animate-[gradient-shift_6s_ease_infinite]",
  zoom: "animate-[zoom-subtle_8s_ease-in-out_infinite]",
  "fade-cycle": "animate-[fade-cycle_4s_ease-in-out_infinite]",
};

export function BannerContentAnimation({ imageSrc, alt, animationType }: BannerContentAnimationProps) {
  return (
    <div className="w-full h-full overflow-hidden relative">
      <img
        src={imageSrc}
        alt={alt}
        className={cn("w-full h-full object-cover", animationClasses[animationType] || "")}
        loading="lazy"
      />
      {animationType === "shimmer" && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer-overlay_2.5s_linear_infinite]" />
      )}
    </div>
  );
}
