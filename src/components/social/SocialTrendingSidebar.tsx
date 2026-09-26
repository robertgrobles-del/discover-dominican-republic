import { motion } from "framer-motion";
import { TrendingUp, Trophy, MapPin, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TopSpot, WeeklyWinner } from "@/data/socialData";

interface SocialTrendingSidebarProps {
  topSpots: TopSpot[];
  weeklyWinners: WeeklyWinner[];
}

export function SocialTrendingSidebar({
  topSpots,
  weeklyWinners
}: SocialTrendingSidebarProps) {
  return (
    <>
      {/* Top Instagram Spots */}
      <section className="py-12 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="font-display text-2xl font-bold text-foreground">
              Lugares Más Fotografiados
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topSpots.map((spot, index) => (
              <motion.div
                key={spot.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl border border-border p-4 hover:shadow-lg transition-all"
              >
                <img
                  src={spot.image}
                  alt={spot.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                  loading="lazy"
                />
                <Badge variant="secondary" className="mb-2">
                  <MapPin className="h-3 w-3 mr-1" /> {spot.location}
                </Badge>
                <h3 className="font-semibold text-foreground">{spot.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{spot.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Weekly Photo Contest */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-amber-500" />
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Foto de la Semana
                </h2>
                <p className="text-sm text-muted-foreground">
                  Ganadores del concurso #DescubreRD
                </p>
              </div>
            </div>
            <Badge variant="outline" className="border-amber-500 text-amber-500">
              Premio: Fin de Semana en Samaná
            </Badge>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {weeklyWinners.map((winner, index) => (
              <motion.div
                key={winner.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-xl overflow-hidden group ${
                  winner.isWinner ? "sm:col-span-2 sm:row-span-2 aspect-[4/5]" : "aspect-square"
                }`}
              >
                <img
                  src={winner.image}
                  alt={winner.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                {winner.isWinner && (
                  <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground gap-1">
                    <Trophy className="h-3 w-3" /> Ganador #1
                  </Badge>
                )}
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="font-semibold text-white">{winner.title}</p>
                  <p className="text-sm text-white/70">por {winner.author}</p>
                </div>
              </motion.div>
            ))}
            
            <div className="bg-primary rounded-xl flex items-center justify-center aspect-square cursor-pointer hover:bg-primary/90 transition-colors">
              <div className="text-center text-primary-foreground p-4">
                <ChevronRight className="h-8 w-8 mx-auto mb-2" />
                <p className="font-semibold">Ver Galería Completa</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
