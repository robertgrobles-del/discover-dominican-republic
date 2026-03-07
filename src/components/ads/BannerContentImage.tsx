interface BannerContentImageProps {
  src: string;
  alt: string;
}

export function BannerContentImage({ src, alt }: BannerContentImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      loading="lazy"
    />
  );
}
