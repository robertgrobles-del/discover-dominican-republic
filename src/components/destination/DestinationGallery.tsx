import { useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/lazy-image";

interface DestinationGalleryProps {
  images: { src: string; alt: string }[];
}

export function DestinationGallery({ images }: DestinationGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const next = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[400px] md:h-[500px]">
        {/* Main Image */}
        <div 
          className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden cursor-pointer group"
          onClick={() => setIsFullscreen(true)}
        >
          <LazyImage 
            src={images[0]?.src} 
            alt={images[0]?.alt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            containerClassName="w-full h-full"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <Expand className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Secondary Images */}
        {images.slice(1, 5).map((img, index) => (
          <div 
            key={index}
            className="relative rounded-xl overflow-hidden cursor-pointer group"
            onClick={() => {
              setCurrentIndex(index + 1);
              setIsFullscreen(true);
            }}
          >
            <LazyImage 
              src={img.src} 
              alt={img.alt}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              containerClassName="w-full h-full"
            />
            {index === 3 && images.length > 5 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold text-xl">+{images.length - 5}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 text-white hover:bg-white/20"
              onClick={prev}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>

            <div className="max-w-5xl max-h-[80vh] relative">
              <img
                src={images[currentIndex]?.src}
                alt={images[currentIndex]?.alt}
                className="max-h-[80vh] object-contain"
              />
              <p className="text-center text-white/80 mt-4">
                {currentIndex + 1} / {images.length} — {images[currentIndex]?.alt}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 text-white hover:bg-white/20"
              onClick={next}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>

            {/* Thumbnails */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-xl">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    currentIndex === index ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
