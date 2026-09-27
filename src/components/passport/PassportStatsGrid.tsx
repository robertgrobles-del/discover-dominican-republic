import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Trophy, Gift, Award } from "lucide-react";

interface PassportStatsGridProps {
  totalStamps: number;
  completedRoutesCount: number;
  activeRoutesCount: number;
  ownedCollectibles: number;
  coins: number;
}

export function PassportStatsGrid({
  totalStamps,
  completedRoutesCount,
  activeRoutesCount,
  ownedCollectibles,
  coins,
}: PassportStatsGridProps) {
  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-blue-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">Sellos</span>
                </div>
                <p className="text-3xl font-bold">{totalStamps}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">Rutas</span>
                </div>
                <p className="text-3xl font-bold">{completedRoutesCount}</p>
                <p className="text-xs text-muted-foreground">{activeRoutesCount} activas</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Gift className="h-5 w-5 text-purple-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">Coleccionables</span>
                </div>
                <p className="text-3xl font-bold">{ownedCollectibles}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <Award className="h-5 w-5 text-yellow-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">Monedas</span>
                </div>
                <p className="text-3xl font-bold">{coins}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
