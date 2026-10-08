import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

interface GoogleAdSlotProps {
  adSlot?: string;
  adFormat?: "auto" | "rectangle" | "horizontal" | "vertical" | "fluid";
  fullWidthResponsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
}

export function GoogleAdSlot({
  adSlot = "1234567890",
  adFormat = "auto",
  fullWidthResponsive = true,
  className,
  style,
  label = "Publicidad Google"
}: GoogleAdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const adClientId = import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT_ID || "";
  const isProductionReady = Boolean(adClientId && adClientId.startsWith("ca-pub-"));

  useEffect(() => {
    if (!isProductionReady) return;

    try {
      // Inyectar el script de AdSense si no existe
      const SCRIPT_ID = "google-adsense-script";
      if (!document.getElementById(SCRIPT_ID)) {
        const script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClientId}`;
        script.async = true;
        script.crossOrigin = "anonymous";
        document.head.appendChild(script);
      }

      // Inicializar el bloque publicitario
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.warn("[GoogleAdSlot] Error al inicializar bloque AdSense:", err);
    }
  }, [adClientId, isProductionReady]);

  // Si no hay ID de AdSense en producción (o en local), renderiza un slot de respaldo limpio y discreto
  if (!isProductionReady) {
    return (
      <div
        ref={containerRef}
        className={cn(
          "relative overflow-hidden rounded-lg border border-dashed border-border/70 bg-muted/30 p-3 text-center flex flex-col items-center justify-center min-h-[90px] transition-all hover:bg-muted/40",
          className
        )}
        style={style}
      >
        <span className="absolute top-1 right-2 text-[9px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
          {label}
        </span>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
          <svg className="w-3.5 h-3.5 fill-current opacity-70" viewBox="0 0 24 24">
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
          </svg>
          <span className="font-medium text-[11px]">Espacio Monetizado con Google Ads</span>
        </div>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
          Respaldo programático cuando no hay anunciante directo contratado
        </p>
      </div>
    );
  }

  return (
    <div className={cn("google-ad-container my-3 overflow-hidden text-center", className)} style={style}>
      <span className="block text-[9px] uppercase tracking-wider text-muted-foreground/50 mb-1 text-right pr-2">
        {label}
      </span>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adClientId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
      />
    </div>
  );
}
