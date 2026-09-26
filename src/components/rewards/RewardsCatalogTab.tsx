import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RewardCard } from "./RewardCard";
import type { CatalogReward } from "@/data/rewardsData";

interface RewardsCatalogTabProps {
  rewards: CatalogReward[];
  userCoins: number;
  userLevel: number;
  onPreviewPrize: (prize: CatalogReward) => void;
  onRedeemPrize: (prize: CatalogReward) => void;
}

const CATEGORIES = [
  { id: "all", label: "🎯 Todos" },
  { id: "resort", label: "🏨 Resorts & Day Passes" },
  { id: "adventure", label: "🛶 Aventura & Ecoturismo" },
  { id: "gastronomy", label: "🍷 Gastronomía & Ron" },
  { id: "product", label: "🎒 Souvenirs Oficiales" },
  { id: "vip", label: "🎟️ Pases VIP" },
];

export const RewardsCatalogTab: React.FC<RewardsCatalogTabProps> = ({
  rewards,
  userCoins,
  userLevel,
  onPreviewPrize,
  onRedeemPrize,
}) => {
  const [prizeFilter, setPrizeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "level">("featured");

  // Flash Sale Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 42, seconds: 15 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          clearInterval(timer);
          return prev;
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredPrizes = rewards
    .filter((p) => {
      const matchesFilter =
        prizeFilter === "all" ||
        p.category === prizeFilter ||
        (prizeFilter === "experience" && p.prize_type === "experience");
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sponsor.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.coin_cost - b.coin_cost;
      if (sortBy === "price-desc") return b.coin_cost - a.coin_cost;
      if (sortBy === "level") return a.min_level - b.min_level;
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    });

  const featuredFlashPrize = rewards[0];

  return (
    <div className="space-y-8">
      {/* Flash Sale Promo Box */}
      {featuredFlashPrize && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl border border-red-500/30 bg-gradient-to-r from-red-500/10 via-amber-500/10 to-transparent relative overflow-hidden shadow-sm"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center text-2xl shrink-0 border border-red-500/30">
                ⚡
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-red-500 text-white border-none text-[10px] font-bold animate-pulse">
                    OFERTA FLASH 24 HORAS
                  </Badge>
                  <span className="text-xs text-red-500 font-bold uppercase tracking-wider">
                    Ahorra 40% en Monedas
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-foreground">
                  {featuredFlashPrize.name}
                </h3>
                <p className="text-xs text-muted-foreground max-w-2xl">
                  {featuredFlashPrize.description}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-foreground bg-card p-2.5 rounded-xl border border-border w-full sm:w-auto justify-center">
                <Clock className="h-4 w-4 text-red-500 animate-pulse" />
                <span>
                  {String(timeLeft.hours).padStart(2, "0")}h :{" "}
                  {String(timeLeft.minutes).padStart(2, "0")}m :{" "}
                  {String(timeLeft.seconds).padStart(2, "0")}s
                </span>
              </div>
              <Button
                onClick={() => onRedeemPrize(featuredFlashPrize)}
                className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs h-10 px-5 w-full sm:w-auto shadow-md"
              >
                Canjear por {featuredFlashPrize.coin_cost} Monedas
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters, Categories and Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {CATEGORIES.map((f) => (
            <Button
              key={f.id}
              variant={prizeFilter === f.id ? "default" : "outline"}
              size="sm"
              onClick={() => setPrizeFilter(f.id)}
              className="rounded-xl text-xs h-9 px-3.5 whitespace-nowrap font-medium"
            >
              {f.label}
            </Button>
          ))}
        </div>

        {/* Search and Sort controls */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar recompensa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs rounded-xl h-9 bg-card border-border"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="text-xs rounded-xl h-9 px-3 bg-card border border-border text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="featured">⭐ Destacados</option>
            <option value="price-asc">🪙 Menor costo</option>
            <option value="price-desc">🪙 Mayor costo</option>
            <option value="level">🏆 Por nivel</option>
          </select>
        </div>
      </div>

      {/* Prizes Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrizes.map((prize, i) => (
          <RewardCard
            key={prize.id}
            prize={prize}
            index={i}
            userCoins={userCoins}
            userLevel={userLevel}
            onPreview={onPreviewPrize}
            onRedeem={onRedeemPrize}
          />
        ))}
      </div>

      {filteredPrizes.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-3">
          <span className="text-4xl">🔍</span>
          <h4 className="font-display font-bold text-lg text-foreground">
            No encontramos recompensas con ese filtro
          </h4>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Prueba cambiando la categoría seleccionada o buscando con un término diferente.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPrizeFilter("all");
              setSearchQuery("");
            }}
            className="rounded-xl text-xs"
          >
            Restablecer Filtros
          </Button>
        </div>
      )}
    </div>
  );
};
