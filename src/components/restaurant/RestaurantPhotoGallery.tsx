interface RestaurantPhotoGalleryProps {
  name: string;
  images: string[];
}

export function RestaurantPhotoGallery({ name, images }: RestaurantPhotoGalleryProps) {
  if (images.length <= 1) return null;

  return (
    <section className="container mx-auto px-4 lg:px-8 py-12 border-t border-border/60">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          Galería y Ambiente de {name}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Conoce los espacios gastronómicos, salón principal, terraza y presentación de platos.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img, i) => (
          <div
            key={i}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border/80 shadow-xs bg-muted group"
          >
            <img
              src={img}
              alt={`${name} foto ${i + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>
        ))}
      </div>
    </section>
  );
}
