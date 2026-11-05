import { useState, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  fallbackSrc?: string;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  className,
  wrapperClassName,
  fallbackSrc,
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  const handleError = () => {
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    } else {
      setHasError(true);
    }
  };

  return (
    <div className={cn("relative overflow-hidden bg-muted/40", wrapperClassName)}>
      {/* Skeleton Shimmer while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted/50 via-muted/20 to-muted/50 animate-pulse" />
      )}

      {/* Error Fallback State */}
      {hasError ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-muted/60 p-4 text-muted-foreground">
          <ImageOff className="h-6 w-6 mb-1 opacity-50" />
          <span className="text-3xs uppercase font-medium">Imagen no disponible</span>
        </div>
      ) : (
        <img
          src={imgSrc}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={handleError}
          className={cn(
            "w-full h-full object-cover transition-all duration-500",
            isLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-xs",
            className
          )}
          {...props}
        />
      )}
    </div>
  );
}
