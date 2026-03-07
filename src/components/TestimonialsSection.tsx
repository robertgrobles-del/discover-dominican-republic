import { TestimonialCarousel } from "@/components/ui/testimonial-carousel";
import { useTranslation } from "@/hooks/useI18n";

const testimonials = [
  {
    id: "1",
    content: "República Dominicana superó todas mis expectativas. Las playas son increíbles y la gente es la más cálida que he conocido en mis viajes por el Caribe.",
    author: "María González",
    role: "Viajera de España",
    rating: 5,
  },
  {
    id: "2",
    content: "El avistamiento de ballenas en Samaná fue una experiencia que cambió mi vida. Planificar todo desde esta plataforma fue muy fácil.",
    author: "James Wilson",
    role: "Fotógrafo de naturaleza, EE.UU.",
    rating: 5,
  },
  {
    id: "3",
    content: "La gastronomía dominicana es un tesoro escondido. Desde el mangú hasta el mofongo, cada plato cuenta una historia. ¡Volveré pronto!",
    author: "Sophie Dubois",
    role: "Food blogger, Francia",
    rating: 5,
  },
  {
    id: "4",
    content: "Encontramos el hotel perfecto en Punta Cana gracias a las reseñas y comparaciones. Nuestras vacaciones familiares fueron inolvidables.",
    author: "Carlos Mendoza",
    role: "Viajero familiar, México",
    rating: 4,
  },
];

export function TestimonialsSection() {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            {t("testimonials.real")}
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2">
            {t("testimonials.title")}
          </h2>
        </div>
        <div className="max-w-3xl mx-auto">
          <TestimonialCarousel testimonials={testimonials} interval={6000} />
        </div>
      </div>
    </section>
  );
}
