import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  placeholderClassName?: string;
  showSkeleton?: boolean;
}

export function LazyImage({
  src,
  alt,
  className,
  containerClassName,
  placeholderClassName,
  showSkeleton = true,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const imgElRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px", // Start loading 200px before entering viewport
        threshold: 0,
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  // A cached image can finish loading before the onLoad handler attaches,
  // so onLoad never fires and the image stays stuck at opacity-0 forever.
  useEffect(() => {
    if (isInView && imgElRef.current?.complete) {
      setIsLoaded(true);
    }
  }, [isInView, src]);

  return (
    <div ref={imgRef} className={cn("relative", containerClassName)}>
      {showSkeleton && !isLoaded && (
        <Skeleton className={cn("absolute inset-0 w-full h-full", placeholderClassName)} />
      )}
      {isInView && (
        <img
          ref={imgElRef}
          src={src}
          alt={alt}
          className={cn(
            "transition-opacity duration-500",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
}
