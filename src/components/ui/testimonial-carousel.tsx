import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: string;
  content: string;
  author: string;
  role?: string;
  avatar?: string;
  rating?: number;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}

export function TestimonialCarousel({
  testimonials,
  autoPlay = true,
  interval = 5000,
  className,
}: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (autoPlay) {
      timerRef.current = setInterval(next, interval);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [autoPlay, interval]);

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className={cn("relative", className)}>
      <div className="testimonial-card rounded-2xl p-8 md:p-12">
        <Quote className="h-12 w-12 text-primary/30 mb-6" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-xl md:text-2xl text-foreground font-medium leading-relaxed mb-8">
              "{currentTestimonial.content}"
            </p>
            
            <div className="flex items-center gap-4">
              {currentTestimonial.avatar ? (
                <img
                  src={currentTestimonial.avatar}
                  alt={currentTestimonial.author}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">
                    {currentTestimonial.author.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <p className="font-bold text-foreground">{currentTestimonial.author}</p>
                {currentTestimonial.role && (
                  <p className="text-sm text-muted-foreground">{currentTestimonial.role}</p>
                )}
              </div>
              {currentTestimonial.rating && (
                <div className="ml-auto flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg
                      key={i}
                      className={cn(
                        "w-5 h-5",
                        i < currentTestimonial.rating! ? "text-gold fill-gold" : "text-muted"
                      )}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => {
            if (timerRef.current) clearInterval(timerRef.current);
            prev();
          }}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (timerRef.current) clearInterval(timerRef.current);
                setCurrentIndex(index);
              }}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentIndex ? "w-6 bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => {
            if (timerRef.current) clearInterval(timerRef.current);
            next();
          }}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
