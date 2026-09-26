import { useState } from "react";
import type { StoreProduct } from "./api";
import { resolveProductImage } from "./api";

const TONES: Record<StoreProduct["tone"], string> = {
  sand: "from-amber-100 to-orange-100 dark:from-amber-950 dark:to-orange-950",
  cream: "from-stone-100 to-amber-50 dark:from-stone-900 dark:to-amber-950",
  sea: "from-sky-100 to-cyan-100 dark:from-sky-950 dark:to-cyan-950",
  forest: "from-emerald-100 to-lime-100 dark:from-emerald-950 dark:to-lime-950",
};

export function ProductArt({ 
  product, 
  className = "" 
}: { 
  product: Pick<StoreProduct, "emoji" | "tone" | "name"> & Partial<StoreProduct>; 
  className?: string 
}) {
  const [imgError, setImgError] = useState(false);
  const imgUrl = product.imageUrl || resolveProductImage(product);

  if (imgUrl && !imgError) {
    return (
      <div className={`relative overflow-hidden bg-muted flex items-center justify-center ${className}`}>
        <img
          src={imgUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
          onError={() => setImgError(true)}
          loading="lazy"
        />
        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-md rounded-full px-2 py-0.5 text-xs shadow-xs pointer-events-none select-none">
          {product.emoji}
        </div>
      </div>
    );
  }

  return (
    <div role="img" aria-label={product.name} className={`bg-gradient-to-br ${TONES[product.tone || "sand"]} flex items-center justify-center ${className}`}>
      <span className="text-7xl md:text-8xl drop-shadow-sm select-none" aria-hidden="true">{product.emoji}</span>
    </div>
  );
}
