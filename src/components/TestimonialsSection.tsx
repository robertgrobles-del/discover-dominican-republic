import { motion } from "framer-motion";
import { TestimonialCarousel } from "@/components/ui/testimonial-carousel";
import { useTranslation } from "@/hooks/useI18n";
import { MessageSquareQuote, CheckCircle2, Globe2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const testimonials = [
  {
    id: "1",
    content: "República Dominicana superó todas mis expectativas. Desde las aguas cristalinas de Bahía de las Águilas hasta la calidez de su gente en Samaná, cada rincón fue mágico.",
    author: "María González",
    role: "Viajera de España 🇪🇸 · Estuvo en Samaná & Pedernales",
    rating: 5,
  },
  {
    id: "2",
    content: "El avistamiento de ballenas jorobadas y el rafting en Jarabacoa fueron aventuras que recordaré siempre. Organizar rutas con esta plataforma fue rápido y muy intuitivo.",
    author: "James Wilson",
    role: "Fotógrafo de naturaleza, EE.UU. 🇺🇸 · Estuvo en Jarabacoa",
    rating: 5,
  },
  {
    id: "3",
    content: "La gastronomía dominicana es un tesoro extraordinario. El chivo liniero, el mangú con los tres golpes y el pescado frito en la playa no tienen comparación.",
    author: "Sophie Dubois",
    role: "Food blogger, Francia 🇫🇷 · Estuvo en Santo Domingo & Las Terrenas",
    rating: 5,
  },
  {
    id: "4",
    content: "Encontramos el resort perfecto en Punta Cana para nuestra familia. Los mapas y las guías de viaje nos ahorraron mucho tiempo y dinero en transporte.",
    author: "Carlos & Elena Mendoza",
    role: "Viajeros familiares, México 🇲🇽 · Estuvieron en Punta Cana",
    rating: 5,
  },
];

export function TestimonialsSection() {
  const { t } = useTranslation();

  return (
    <section className="py-24 relative overflow-hidden bg-secondary/20">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Badge className="bg-primary/10 text-primary border-primary/20 gap-1.5 px-3 py-1">
              <MessageSquareQuote className="h-3.5 w-3.5" />
              {t("testimonials.real")}
            </Badge>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t("testimonials.title")}
          </h2>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Reseñas 100% Verificadas
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Globe2 className="h-3.5 w-3.5 text-sky-500" /> Viajeros de +45 países
            </span>
          </div>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <TestimonialCarousel testimonials={testimonials} interval={7000} />
        </div>
      </div>
    </section>
  );
}
