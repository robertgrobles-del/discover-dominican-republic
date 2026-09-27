import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Share2 } from "lucide-react";

interface AirbnbGalleryProps {
  property: {
    id: string;
    name: string;
    address: string;
    image_url?: string;
  };
  images: string[];
  currentImageIndex: number;
  onOpenLightbox: (index: number) => void;
}

export function AirbnbGallery({
  property,
  images,
  currentImageIndex,
  onOpenLightbox,
}: AirbnbGalleryProps) {
  return (
    <section className="relative">
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[60vh] max-w-7xl mx-auto px-4">
        <div
          className="col-span-2 row-span-2 relative cursor-pointer overflow-hidden rounded-l-xl"
          onClick={() => onOpenLightbox(0)}
        >
          <img
            src={images[0]}
            alt={property.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        {images.slice(1, 5).map((img, idx) => (
          <div
            key={idx}
            className={`relative cursor-pointer overflow-hidden ${
              idx === 1 ? "rounded-tr-xl" : ""
            } ${idx === 3 ? "rounded-br-xl" : ""}`}
            onClick={() => onOpenLightbox(idx + 1)}
          >
            <img
              src={img}
              alt={`${property.name} ${idx + 2}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
        <Button
          variant="secondary"
          className="absolute bottom-4 right-8"
          onClick={() => onOpenLightbox(currentImageIndex)}
        >
          Mostrar todas las fotos
        </Button>
      </div>

      {/* Action buttons */}
      <div className="absolute top-4 right-8 flex gap-2">
        <Button variant="ghost" size="icon" className="bg-background/80 backdrop-blur">
          <Share2 className="h-5 w-5" />
        </Button>
        <FavoriteButton
          id={property.id}
          type="airbnb"
          name={property.name}
          image={property.image_url || ""}
          location={property.address}
        />
      </div>
    </section>
  );
}
