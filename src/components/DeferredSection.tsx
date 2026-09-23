import { useState, useEffect, useRef, ReactNode, ComponentType } from "react";

interface DeferredSectionProps {
  children?: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  minHeight?: string;
}

export function DeferredSection({
  children,
  fallback = null,
  rootMargin = "300px",
  minHeight = "140px",
}: DeferredSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) return;
    const el = containerRef.current;
    if (!el) return;

    // If IntersectionObserver is not supported, render immediately
    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  if (!isVisible) {
    return (
      <div ref={containerRef} style={{ minHeight }} aria-hidden="true">
        {fallback}
      </div>
    );
  }

  return <>{children}</>;
}
