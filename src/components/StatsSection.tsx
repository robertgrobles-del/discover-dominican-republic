import { AnimatedStats } from "@/components/ui/animated-counter";
import { MapPin, Hotel, UtensilsCrossed, Palmtree } from "lucide-react";
import { useTranslation } from "@/hooks/useI18n";

export function StatsSection() {
  const { t } = useTranslation();

  const stats = [
    { value: 32, suffix: "+", label: t("stats.provinces"), icon: <MapPin className="h-6 w-6" /> },
    { value: 150, suffix: "+", label: t("stats.hotels"), icon: <Hotel className="h-6 w-6" /> },
    { value: 200, suffix: "+", label: t("stats.restaurants"), icon: <UtensilsCrossed className="h-6 w-6" /> },
    { value: 50, suffix: "+", label: t("stats.beaches"), icon: <Palmtree className="h-6 w-6" /> },
  ];

  return (
    <section className="py-16 bg-primary/5 border-y border-primary/10">
      <div className="container mx-auto px-4">
        <AnimatedStats stats={stats} />
      </div>
    </section>
  );
}
