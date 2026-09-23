import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FORMAS_GANAR_PUNTOS, 
  CATEGORIAS_PUNTOS, 
  FormaGanarPuntos 
} from "@/data/formasGanarPuntos";
import { 
  Sparkles, 
  Coins, 
  Zap, 
  UserPlus, 
  Users, 
  Mail, 
  Target, 
  MapPin, 
  Brain, 
  Star, 
  Camera, 
  PenTool, 
  Leaf, 
  Flame, 
  Route, 
  Shield, 
  Calendar, 
  Copy, 
  Check, 
  Search, 
  ArrowRight,
  Share2,
  CheckCircle2,
  Gift,
  Trophy,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

const ICON_MAP: Record<string, any> = {
  UserPlus,
  Users,
  Mail,
  Target,
  MapPin,
  Brain,
  Star,
  Camera,
  PenTool,
  Leaf,
  Flame,
  Route,
  Shield,
  Calendar,
};

interface ComoGanarPuntosSectionProps {
  onOpenModal?: () => void;
  className?: string;
}

export function ComoGanarPuntosSection({ onOpenModal, className = "" }: ComoGanarPuntosSectionProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  const referralCode = user ? `EXPLORER-${user.id.slice(0, 6).toUpperCase()}` : "DESCUBRE-RD-VIP";
  const referralLink = `${window.location.origin}/registro?ref=${referralCode}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedCode(true);
    toast.success("¡Enlace de referido copiado al portapapeles! 🎁 +100 XP por cada amigo que se registre");
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const filteredItems = FORMAS_GANAR_PUNTOS.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalMaxXP = FORMAS_GANAR_PUNTOS.reduce((acc, curr) => acc + curr.xpReward, 0);
  const totalMaxCoins = FORMAS_GANAR_PUNTOS.reduce((acc, curr) => acc + curr.coinReward, 0);

  const handleAction = (item: FormaGanarPuntos) => {
    if (item.actionModal === "referrals") {
      handleCopyReferral();
      return;
    }
    if (item.actionRoute) {
      navigate(item.actionRoute);
    }
  };

  return (
    <section className={`py-12 sm:py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Economía de Puntos & Monedas
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            14 Formas Lógicas de Ganar Puntos en Descubre RD
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Desde tu registro y la invitación a tus amigos, hasta misiones en parques nacionales, trivias diarias y crónicas en el blog. Cada interacción tiene una recompensa transparente.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="inline-flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-xl shadow-xs">
              <Zap className="w-4 h-4 text-cyan-500" />
              <span className="text-xs text-muted-foreground">Hasta</span>
              <span className="text-sm font-bold text-foreground">+{totalMaxXP.toLocaleString()} XP</span>
              <span className="text-xs text-muted-foreground">por ciclo</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-xl shadow-xs">
              <Coins className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Hasta</span>
              <span className="text-sm font-bold text-foreground">+{totalMaxCoins.toLocaleString()} Monedas</span>
              <span className="text-xs text-muted-foreground">canjeables</span>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card/60 backdrop-blur-md border border-border p-4 rounded-2xl shadow-xs">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {CATEGORIAS_PUNTOS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-xs shadow-primary/25"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Filtrar por actividad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/80 border-border text-xs rounded-xl h-9"
            />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const IconComp = ICON_MAP[item.iconName] || Sparkles;
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="group relative bg-card hover:bg-card/90 border border-border hover:border-primary/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 shadow-xs hover:shadow-lg hover:shadow-primary/5"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-muted text-xs font-mono font-bold text-foreground flex items-center justify-center">
                        {item.num}
                      </span>
                      <Badge variant="outline" className={`text-[10px] font-semibold uppercase tracking-wider ${item.badgeColor}`}>
                        {item.badgeText}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">
                        <Zap className="w-3 h-3" /> +{item.xpReward} XP
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                        <Coins className="w-3 h-3" /> +{item.coinReward}
                      </span>
                    </div>
                  </div>

                  {/* Header Title */}
                  <div className="flex items-start gap-3 mb-2.5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-primary/20 transition-all">
                      <IconComp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {item.categoryLabel} • {item.frequency}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* Requirements */}
                  <div className="space-y-1.5 border-t border-border/60 pt-3 mb-4">
                    {item.requirements.map((req, idx) => (
                      <div key={idx} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="line-clamp-1">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-border/60">
                  <Button
                    size="sm"
                    onClick={() => handleAction(item)}
                    className="w-full bg-muted hover:bg-primary text-foreground hover:text-primary-foreground border border-border text-xs font-semibold justify-between group/btn transition-all"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Banner with Referral & Rules link */}
        <div className="bg-gradient-to-r from-primary/15 via-blue-500/10 to-purple-500/15 border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-foreground">¿Quieres ganar +100 Monedas ahora mismo?</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Invita a tus amigos con tu enlace personal y ambos recibirán 100 XP y 100 Monedas tan pronto se registren.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Button onClick={handleCopyReferral} className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1.5 shrink-0">
              {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copiedCode ? "¡Enlace Copiado!" : "Copiar Enlace de Referido"}
            </Button>
            <Link to="/gamificacion-turistica/reglas">
              <Button variant="outline" className="border-border text-xs gap-1.5 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-500" /> Ver Reglamento Oficial
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
