interface BannerContentImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export function BannerContentImage({ src, alt, width = 728, height = 90 }: BannerContentImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      loading="lazy"
      decoding="async"
      width={width}
      height={height}
      sizes="(max-width: 768px) 320px, (max-width: 1024px) 728px, 970px"
    />
  );
}
