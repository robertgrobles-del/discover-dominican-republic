import { BannerContentImage } from "./BannerContentImage";
import { BannerContentVideo } from "./BannerContentVideo";
import { BannerContentAnimation } from "./BannerContentAnimation";
import { BannerContentSlider } from "./BannerContentSlider";
import type { AnimationType } from "./BannerContentAnimation";
import type { SliderItem } from "./BannerContentSlider";
import type { AdBanner } from "@/hooks/useAdBanners";

interface BannerMediaContentProps {
  contentType: string;
  imageUrl?: string;
  altText: string;
  banner?: AdBanner | null;
  height: string;
}

export function BannerMediaContent({
  contentType,
  imageUrl,
  altText,
  banner,
  height,
}: BannerMediaContentProps) {
  // Slider mode
  if (contentType === "slider" && banner?.slider_items) {
    const items = (banner.slider_items as unknown as SliderItem[]) || [];
    return (
      <BannerContentSlider
        items={items}
        interval={banner.slider_interval || 5000}
        height={height}
      />
    );
  }

  // Video mode
  if (contentType === "video" && banner?.video_url) {
    return (
      <BannerContentVideo
        src={banner.video_url}
        poster={imageUrl}
        autoplay={banner.video_autoplay ?? true}
        loop={banner.video_loop ?? true}
        muted={banner.video_muted ?? true}
      />
    );
  }

  // Animation mode
  if (contentType === "animation" && imageUrl && banner?.animation_type) {
    return (
      <BannerContentAnimation
        imageSrc={imageUrl}
        alt={altText}
        animationType={banner.animation_type as AnimationType}
      />
    );
  }

  // Default: static image
  if (imageUrl) {
    return <BannerContentImage src={imageUrl} alt={altText} />;
  }

  return null;
}
