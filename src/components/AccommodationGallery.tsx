import { useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface AccommodationGalleryProps {
  images: string[];
  name: string;
}

export function AccommodationGallery({ images, name }: AccommodationGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const next = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[400px] md:h-[500px]">
        {/* Main Image */}
        <div 
          className="col-span-2 row-span-2 relative rounded-l-2xl overflow-hidden cursor-pointer group"
          onClick={() => setIsFullscreen(true)}
        >
          <img 
            src={images[currentIndex]} 
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <Expand className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          {/* Navigation arrows on main image */}
          <Button
            size="icon"
            variant="outline"
            className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-background/80"
            onClick={(e) => { e.stopPropagation(); prev(); }}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-background/80"
            onClick={(e) => { e.stopPropagation(); next(); }}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Secondary Images */}
        {images.slice(1, 5).map((img, index) => (
          <div 
            key={index}
            className={`relative overflow-hidden cursor-pointer group ${
              index === 1 ? "rounded-tr-2xl" : index === 3 ? "rounded-br-2xl" : ""
            }`}
            onClick={() => {
              setCurrentIndex(index + 1);
              setIsFullscreen(true);
            }}
          >
            <img 
              src={img} 
              alt={`${name} ${index + 2}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              onClick={prev}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>

            <div className="max-w-5xl max-h-[80vh] relative px-16">
              <motion.img
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                src={images[currentIndex]}
                alt={`${name} ${currentIndex + 1}`}
                className="max-h-[80vh] object-contain mx-auto"
              />
              <p className="text-center text-white/80 mt-4">
                {currentIndex + 1} / {images.length}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              onClick={next}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>

            {/* Thumbnails */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-xl px-4">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    currentIndex === index ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
