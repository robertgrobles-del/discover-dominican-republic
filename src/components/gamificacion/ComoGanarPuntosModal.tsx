import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  ExternalLink,
  ArrowRight,
  Share2,
  CheckCircle2,
  Gift,
  Trophy,
  ShieldCheck,
  Info
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

interface ComoGanarPuntosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ComoGanarPuntosModal({ open, onOpenChange }: ComoGanarPuntosModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [activeTabSubView, setActiveTabSubView] = useState<"list" | "referral" | "newsletter">("list");

  const referralCode = user ? `EXPLORER-${user.id.slice(0, 6).toUpperCase()}` : "DESCUBRE-RD-VIP";
  const referralLink = `${window.location.origin}/registro?ref=${referralCode}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedCode(true);
    toast.success("¡Enlace de referido copiado al portapapeles! 🎁 +100 XP por cada amigo que se registre");
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleShareWhatsapp = () => {
    const text = `¡Únete a Descubre República Dominicana conmigo! Regístrate gratis con mi código ${referralCode} y gana +100 Monedas para canjear por tours, spas y resorts: ${referralLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast.error("Por favor ingresa un correo electrónico válido");
      return;
    }
    setNewsletterSuccess(true);
    toast.success("¡Te has suscrito con éxito! +50 Monedas y +50 XP acreditados 📬");
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
      setActiveTabSubView("referral");
      return;
    }
    if (item.actionModal === "newsletter") {
      setActiveTabSubView("newsletter");
      return;
    }
    if (item.actionRoute) {
      onOpenChange(false);
      navigate(item.actionRoute);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-white/10 shadow-2xl bg-gradient-to-b from-slate-900 via-slate-900/98 to-slate-950 text-slate-100">
        
        {/* Header Hero */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-purple-900/50 border-b border-white/10 overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 gap-1.5 px-3 py-1 font-semibold text-xs tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" /> Guía Maestra de Puntos
              </Badge>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs bg-slate-800/80 px-2.5 py-1 rounded-full border border-white/10 text-cyan-300 font-medium">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" /> +{totalMaxXP.toLocaleString()} XP Potenciales
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs bg-slate-800/80 px-2.5 py-1 rounded-full border border-white/10 text-amber-300 font-medium">
                  <Coins className="w-3.5 h-3.5 text-amber-400" /> +{totalMaxCoins.toLocaleString()} Monedas
                </span>
              </div>
            </div>

            <DialogTitle className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              14 Formas Oficiales de Ganar Puntos & Monedas
            </DialogTitle>
            <DialogDescription className="text-slate-300 mt-2 text-sm sm:text-base max-w-2xl">
              Gana experiencia (XP) para subir de rango en tu Pasaporte Digital y acumula Monedas Dominicanas para canjear por estancias de hotel, catas, tours en catamarán y merchandising oficial.
            </DialogDescription>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Subview Switcher if viewing referrals or newsletter */}
          {activeTabSubView !== "list" && (
            <div className="flex items-center justify-between bg-slate-800/60 p-3 rounded-xl border border-white/10">
              <span className="text-sm font-medium text-slate-300">
                {activeTabSubView === "referral" ? "🎁 Módulo de Invitación a Amigos" : "📬 Módulo de Suscripción al Boletín"}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveTabSubView("list")}
                className="text-xs text-cyan-400 hover:text-cyan-300 hover:bg-slate-700"
              >
                ← Volver a las 14 formas
              </Button>
            </div>
          )}

          {/* REFERRAL VIEW */}
          {activeTabSubView === "referral" && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-950/60 to-slate-900 border border-blue-500/30 rounded-2xl p-6 space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Invita a tus amigos y ambos ganan +100 Monedas</h4>
                  <p className="text-xs text-slate-300">Cuando tu amigo complete su registro y verifique su correo, se acreditarán automáticamente 100 XP y 100 Monedas en ambas cuentas.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tu Enlace Personal de Referido</label>
                <div className="flex gap-2">
                  <Input 
                    readOnly 
                    value={referralLink} 
                    className="bg-slate-950 border-slate-700 text-slate-200 font-mono text-xs selection:bg-blue-500"
                  />
                  <Button onClick={handleCopyReferral} className="bg-primary hover:bg-primary/90 gap-1.5 shrink-0">
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {copiedCode ? "Copiado" : "Copiar"}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button 
                  onClick={handleShareWhatsapp} 
                  variant="outline" 
                  className="bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50 text-xs gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" /> Compartir por WhatsApp
                </Button>
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(referralCode);
                    toast.success("Código copiado: " + referralCode);
                  }} 
                  variant="outline" 
                  className="border-slate-700 text-slate-300 text-xs gap-1.5"
                >
                  Copiar sólo Código: <span className="font-mono text-cyan-400 font-bold">{referralCode}</span>
                </Button>
              </div>
            </motion.div>
          )}

          {/* NEWSLETTER VIEW */}
          {activeTabSubView === "newsletter" && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-500/30 rounded-2xl p-6 space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Suscríbete al Boletín Oficial Turístico (+50 XP y +50 Monedas)</h4>
                  <p className="text-xs text-slate-300">Recibe las mejores ofertas hoteleras, guías exclusivas y novedades de conservación de República Dominicana.</p>
                </div>
              </div>

              {newsletterSuccess ? (
                <div className="bg-emerald-500/20 border border-emerald-500/30 p-4 rounded-xl flex items-center gap-3 text-emerald-300 text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                  <span>¡Suscripción confirmada! Te hemos enviado un correo con tu bono de 50 Monedas.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                  <div className="flex gap-2">
                    <Input 
                      type="email"
                      placeholder="tu.correo@ejemplo.com" 
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="bg-slate-950 border-slate-700 text-slate-200 text-sm"
                      required
                    />
                    <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-1.5 shrink-0">
                      <Sparkles className="w-4 h-4" /> Suscribirme
                    </Button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Al suscribirte aceptas recibir novedades turísticas conforme a nuestra política de privacidad. Puedes desuscribirte en cualquier momento.
                  </p>
                </form>
              )}
            </motion.div>
          )}

          {/* SEARCH & CATEGORY FILTERS */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar forma de ganar puntos (ej: registro, amigos, trivia, fotos)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-slate-950/70 border-white/10 text-slate-200 placeholder:text-slate-500 text-sm focus-visible:ring-primary"
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIAS_PUNTOS.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "bg-slate-800/70 text-slate-300 hover:bg-slate-800 border border-white/5"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* 14 WAYS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => {
              const IconComp = ICON_MAP[item.iconName] || Sparkles;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="group relative bg-slate-800/40 hover:bg-slate-800/70 border border-white/5 hover:border-primary/40 rounded-xl p-4.5 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-primary/5"
                >
                  <div>
                    {/* Top Row: Number & Badges */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-700/60 border border-white/10 text-xs font-mono font-bold text-slate-300 flex items-center justify-center">
                          {item.num}
                        </span>
                        <Badge variant="outline" className={`text-[10px] font-semibold uppercase tracking-wider ${item.badgeColor}`}>
                          {item.badgeText}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                          <Zap className="w-3 h-3" /> +{item.xpReward} XP
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-950/40 border border-amber-500/20 px-2 py-0.5 rounded-md">
                          <Coins className="w-3 h-3" /> +{item.coinReward}
                        </span>
                      </div>
                    </div>

                    {/* Title & Icon */}
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-9 h-9 rounded-lg bg-slate-900 border border-white/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-primary/20 transition-all">
                        <IconComp className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {item.title}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {item.categoryLabel} • {item.frequency}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300/90 leading-relaxed mb-3">
                      {item.description}
                    </p>

                    {/* Bullet Requirements */}
                    <ul className="space-y-1 mb-4 border-t border-white/5 pt-2">
                      {item.requirements.map((req, idx) => (
                        <li key={idx} className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action CTA */}
                  <div className="pt-2 border-t border-white/5">
                    <Button
                      size="sm"
                      onClick={() => handleAction(item)}
                      className="w-full bg-slate-700/60 hover:bg-primary text-white border border-white/10 text-xs font-semibold justify-between group/btn transition-all"
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Ethics & Security Note */}
          <div className="bg-slate-950/80 border border-white/10 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-400">
            <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-slate-200">
                Garantía de Transparencia y Sistema Anti-Fraude
              </p>
              <p className="leading-relaxed">
                Todos los puntos y monedas son acreditados conforme a nuestro{" "}
                <Link 
                  to="/gamificacion-turistica/reglas" 
                  onClick={() => onOpenChange(false)}
                  className="text-cyan-400 hover:underline font-medium"
                >
                  Reglamento Oficial de Gamificación
                </Link>
                . Los intentos de geolocalización simulada o cuentas duplicadas serán invalidados para proteger a la comunidad de exploradores.
              </p>
            </div>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
