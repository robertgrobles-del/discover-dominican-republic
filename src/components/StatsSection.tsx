import { AnimatedStats } from "@/components/ui/animated-counter";
import { MapPin, Hotel, UtensilsCrossed, Palmtree } from "lucide-react";

const stats = [
  { value: 32, suffix: "+", label: "Provincias", icon: <MapPin className="h-6 w-6" /> },
  { value: 150, suffix: "+", label: "Hoteles & Resorts", icon: <Hotel className="h-6 w-6" /> },
  { value: 200, suffix: "+", label: "Restaurantes", icon: <UtensilsCrossed className="h-6 w-6" /> },
  { value: 50, suffix: "+", label: "Playas Paradisíacas", icon: <Palmtree className="h-6 w-6" /> },
];

export function StatsSection() {
  return (
    <section className="py-16 bg-primary/5 border-y border-primary/10">
      <div className="container mx-auto px-4">
        <AnimatedStats stats={stats} />
      </div>
    </section>
  );
}
