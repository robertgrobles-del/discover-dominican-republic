import { type ImgHTMLAttributes } from "react";

interface ResponsiveImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  /** Ruta del archivo original (jpg/png), p. ej. importado de `@/assets/foo.jpg`. */
  src: string;
  /** Variante AVIF ya generada (mismo nombre, extensión `.avif`), si existe. */
  avif?: string;
  /** Variante WebP ya generada (mismo nombre, extensión `.webp`), si existe. */
  webp?: string;
}

/**
 * Fase 10.17: sirve AVIF/WebP cuando el navegador los soporta y cae al original (jpg/png) si no — el navegador
 * elige la primera `<source>` compatible, sin JS. Las variantes se generan una vez con
 * `backend/scripts/gen-hero-variants.mjs` (reutiliza el `sharp` que ya tiene el backend; el frontend no gana
 * ninguna dependencia nueva). Úsalo en vez de `<img>` para imágenes de contenido grandes (hero, tarjetas destacadas).
 */
export function ResponsiveImage({ src, avif, webp, alt, ...imgProps }: ResponsiveImageProps) {
  return (
    <picture>
      {avif && <source srcSet={avif} type="image/avif" />}
      {webp && <source srcSet={webp} type="image/webp" />}
      <img src={src} alt={alt} {...imgProps} />
    </picture>
  );
}
