import { BannerAd } from "@/components/promo/BannerAd";
import bannerPresidenteImg from "@/assets/promo/banner-festival-presidente-2026.png";

// Banner ancho completo antes del footer. Lo elige el admin de anuncios (section "pre-footer", tipo full-width-screen);
// la imagen de Presidente sólo se ve mientras no haya anuncio configurado.
export function PreFooterPresidenteBanner() {
  return (
    <BannerAd
      size="full-width-screen"
      placement="between-sections"
      section="pre-footer"
      imageUrl={bannerPresidenteImg}
      targetUrl="https://www.presidente.com.do/"
      altText="Festival Presidente 2026 - Cerveza Presidente"
      className="w-full !max-w-none !rounded-none"
    />
  );
}
