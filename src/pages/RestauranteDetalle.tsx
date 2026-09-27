import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Skeleton } from "@/components/ui/skeleton";
import { RestaurantHeroSlider } from "@/components/restaurant/RestaurantHeroSlider";
import { RestaurantDishesGrid, SignatureDishDetail } from "@/components/restaurant/RestaurantDishesGrid";
import { RestaurantReservationCard } from "@/components/restaurant/RestaurantReservationCard";
import { RestaurantAmbienceCard } from "@/components/restaurant/RestaurantAmbienceCard";
import { DetailFloatingBar } from "@/components/detail/DetailFloatingBar";
import { CommentSection } from "@/components/comments/CommentSection";
import { TipCalculatorModal } from "@/components/tools/TipCalculatorModal";
import { useRestaurantData, restaurantCategoryLabels } from "@/hooks/useRestaurantData";
import { RestaurantActionBar } from "@/components/restaurant/RestaurantActionBar";
import { RestaurantOverviewSection } from "@/components/restaurant/RestaurantOverviewSection";
import { RestaurantFaqAccordion } from "@/components/restaurant/RestaurantFaqAccordion";
import { RestaurantPhotoGallery } from "@/components/restaurant/RestaurantPhotoGallery";

export default function RestauranteDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const { restaurant, isLoading } = useRestaurantData(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-32 space-y-6">
            <Skeleton className="h-[450px] w-full rounded-3xl" />
            <div className="grid grid-cols-4 gap-4">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  if (!restaurant) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-32 text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
              <Utensils className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold mb-3 text-foreground">Restaurante no encontrado</h1>
            <p className="text-muted-foreground mb-6 text-sm">
              El restaurante que buscas no se encuentra disponible o ha sido actualizado.
            </p>
            <Button asChild className="rounded-xl">
              <Link to="/restaurante">Ver Guía Gastronómica</Link>
            </Button>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  const allImages = [restaurant.imageUrl, ...restaurant.gallery].filter(Boolean);

  const signatureDishesDetailed: SignatureDishDetail[] = (
    restaurant.signatureDishes.length > 0
      ? restaurant.signatureDishes
      : [
          "Chillo Boca Chica al Coco",
          "Filete Mignon Criollo",
          "Risotto de Yautía con Mariscos",
          "Cacao Bombón Dominicano",
        ]
  ).map((dish, i) => {
    const descriptions = [
      "Preparado con pesca artesanal fresca, reducción de coco criollo y toques cítricos de naranja agria de monte.",
      "Corte premium a la parrilla de leña con chimichurri dominicano de hierbas silvestres y puré rústico de yautía.",
      "Elaboración de autor que fusiona técnicas de alta cocina europea con ingredientes autóctonos de la cordillera central.",
      "Postre emblemático reinventado con chocolate orgánico de San Francisco de Macorís y frutos del bosque caribeño.",
    ];
    const tagsList = [
      ["Pesca del Día", "Sin Gluten", "Recomendación del Chef"],
      ["A las Brasas", "Corte Angus", "Firma de la Casa"],
      ["Orgánico Local", "Plato Estrella"],
      ["Repostería de Autor", "Cacao Dominicano"],
    ];
    const pairings = [
      "Maridaje sugerido: Vino blanco Albariño o Sauvignon Blanc fresco",
      "Maridaje sugerido: Cabernet Sauvignon Reserva o Ron Dominicano Imperial",
      "Maridaje sugerido: Chardonnay con paso por barrica o Cóctel Cítrico",
      "Maridaje sugerido: Ron Añejo Dominicano Gran Reserva o Café de Altura",
    ];

    return {
      title: dish,
      desc: descriptions[i % descriptions.length],
      tags: tagsList[i % tagsList.length],
      pairing: pairings[i % pairings.length],
      priceEst:
        restaurant.priceRange === "$$$$"
          ? `$${32 + i * 8} USD`
          : restaurant.priceRange === "$$$"
          ? `$${22 + i * 5} USD`
          : `$${14 + i * 3} USD`,
    };
  });

  return (
    <PageTransition>
      <SEOHead
        title={`${restaurant.name} - Menú, Reservas y Opiniones en RD`}
        description={restaurant.shortDescription || restaurant.description?.slice(0, 160)}
        keywords={`restaurante, ${restaurant.name}, ${restaurant.cuisineType.join(
          ", "
        )}, gastronomía dominicana`}
      />

      <div className="min-h-screen bg-background text-foreground">
        <Header hasHero />

        {/* Hero Slider */}
        <RestaurantHeroSlider
          images={allImages}
          name={restaurant.name}
          location={restaurant.destinationName || restaurant.address}
          destinationSlug={restaurant.destinationId}
          destinationName={restaurant.destinationName}
          rating={restaurant.rating}
          categoryLabel={restaurantCategoryLabels[restaurant.category] || restaurant.category}
          isFeatured={restaurant.isFeatured}
          favoriteId={restaurant.id}
        />

        {/* Action / Meta Bar */}
        <RestaurantActionBar restaurant={restaurant} />

        {/* Main Content Layout */}
        <main className="container mx-auto px-4 lg:px-8 py-10">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left Column (8 cols) */}
            <div className="lg:col-span-8 space-y-10">
              {/* Quick Stats, Description & Services */}
              <RestaurantOverviewSection restaurant={restaurant} />

              {/* Signature Dishes Grid */}
              <RestaurantDishesGrid dishes={signatureDishesDetailed} />

              {/* Ambience, Wine & Cocktails */}
              <RestaurantAmbienceCard />

              {/* FAQs Accordion */}
              <RestaurantFaqAccordion category={restaurant.category} />

              {/* User Reviews & Comments */}
              <div className="pt-4">
                <CommentSection
                  contentId={restaurant.id}
                  contentType="restaurant"
                  title={`Opiniones sobre ${restaurant.name}`}
                />
              </div>
            </div>

            {/* Right Column (4 cols - Reservation Card & Tip Calculator) */}
            <div className="lg:col-span-4 space-y-6">
              <RestaurantReservationCard
                restaurantName={restaurant.name}
                phone={restaurant.phone}
                website={restaurant.website}
                email={restaurant.email}
                address={restaurant.address}
                openingHours={restaurant.openingHours}
              />

              <TipCalculatorModal />
            </div>
          </div>
        </main>

        {/* Full Photo Grid Gallery */}
        <RestaurantPhotoGallery name={restaurant.name} images={allImages} />

        {/* Mobile Sticky Floating Bar */}
        <DetailFloatingBar
          priceLabel="Consumo promedio"
          priceValue={restaurant.priceRange}
          primaryActionLabel="Reservar Mesa"
          onPrimaryAction={() => {
            const resElement = document.getElementById("res-name");
            if (resElement) {
              resElement.scrollIntoView({ behavior: "smooth", block: "center" });
              resElement.focus();
            }
          }}
        />

        <Footer />
      </div>
    </PageTransition>
  );
}
