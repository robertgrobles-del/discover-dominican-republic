interface BannerContentImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export function BannerContentImage({ src, alt, width = 728, height = 90 }: BannerContentImageProps) {
  const isOfficialBanner = src.startsWith("/banners/");
  return (
    <img
      src={src}
      alt={alt}
      className={isOfficialBanner ? "w-full h-full object-contain bg-transparent" : "w-full h-full object-cover"}
      loading="lazy"
      decoding="async"
      width={width}
      height={height}
      sizes="(max-width: 768px) 320px, (max-width: 1024px) 728px, 970px"
    />
  );
}
