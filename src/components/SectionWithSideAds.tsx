import { ReactNode } from "react";
import { BannerAd } from "@/components/promo";
import { useBanner, type AdBanner } from "@/hooks/useAdBanners";

interface SectionWithSideAdsProps {
  children: ReactNode;
  className?: string;
  showAds?: boolean;
  /** Clave de la pareja en el admin de anuncios (campo section del banner skyscraper-traditional / sidebar). */
  section: string;
}

/**
 * Marco común de las secciones de la portada con skyscrapers (referencia: «Bares recomendados»): mismo ancho para todas,
 * el encabezado a lo ancho y los anuncios sólo a los lados de las tarjetas.
 */
export const HOME_SECTION_FRAME = "w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8";

// Todos los skyscrapers del sitio: 120×600 desde 2xl (1536px), en columna propia junto al contenido.
function SideAd({ section, banner }: { section: string; banner: AdBanner | null }) {
  return (
    <div className="hidden 2xl:block shrink-0 w-[120px]">
      <div className="sticky top-24">
        <BannerAd
          size="skyscraper-traditional"
          placement="sidebar"
          section={section}
          bannerData={banner}
          imageUrl="/banners/Escritorio_120x600_Skyscraper.png"
          className="w-[120px] !h-[600px] shadow-sm rounded-xl overflow-hidden"
        />
      </div>
    </div>
  );
}

/**
 * Los dos skyscrapers son una sola campaña: un banner del admin llena ambos lados, con la misma imagen o con
 * image_url_right para la derecha. La base de datos impide una segunda campaña en la misma pareja y fechas.
 */
export function SectionWithSideAds({ children, className = "", showAds = true, section }: SectionWithSideAdsProps) {
  const banner = useBanner({ section, bannerType: "skyscraper-traditional", placement: "sidebar" });
  // Sin campaña contratada no se reservan columnas vacías: el contenido ocupa también el espacio de los banners.
  if (!showAds || !banner) return <div className={className}>{children}</div>;
  const right = banner?.image_url_right ? { ...banner, image_url: banner.image_url_right } : banner;
  return (
    <div className={`flex items-start gap-4 xl:gap-8 ${className}`}>
      <SideAd section={section} banner={banner} />
      <div className="flex-1 min-w-0">{children}</div>
      <SideAd section={section} banner={right} />
    </div>
  );
}
