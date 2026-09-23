import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gift, Star, Trophy, Award, Ticket, Crown,
  Target, Flame, Users, Copy, ChevronRight, 
  Search, Sparkles, ShoppingBag, Medal, Zap,
  TrendingUp, Lock, Check, ArrowRight, Compass,
  MapPin, Truck, CheckCircle2, ShieldCheck, HeartHandshake,
  Clock, Share2, QrCode, Download, ExternalLink, Calendar,
  Building, HelpCircle, Phone, Info, AlertCircle, ArrowUpRight,
  Filter, Tag, CheckCircle, RefreshCw, Eye, PlusCircle,
  FileCheck, Shield, CheckCheck, Scan, AlertTriangle
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { BannerAd, PanoramaAd } from "@/components/promo";
import { VipAuctionModal } from "@/components/gamification/VipAuctionModal";
import { PartnerEmbedBadge } from "@/components/gamification/PartnerEmbedBadge";
import { ComoGanarPuntosModal } from "@/components/gamificacion/ComoGanarPuntosModal";
import { ComoGanarPuntosSection } from "@/components/gamificacion/ComoGanarPuntosSection";

interface CatalogReward {
  id: string;
  name: string;
  description: string;
  sponsor: string;
  location: string;
  category: "all" | "resort" | "adventure" | "gastronomy" | "product" | "vip";
  coin_cost: number;
  original_coin_cost?: number;
  estimated_value_dop: number;
  estimated_value_usd: number;
  prize_type: "experience" | "product" | "discount";
  min_level: number;
  quantity_available: number;
  quantity_redeemed: number;
  is_featured: boolean;
  image_url: string;
  validity_days: number;
  includes: string[];
  isPartnerCustom?: boolean;
}

const initialRewards: CatalogReward[] = [
  {
    id: "p1",
    name: "Pase de 1 Día Todo Incluido en Resort Playa Dorada",
    description: "Acceso VIP a playas privadas, buffet ilimitado de almuerzo y snacks, open bar de coctelería nacional y uso de instalaciones acuáticas.",
    sponsor: "Grand Paradise Resort Puerto Plata",
    location: "Puerto Plata",
    category: "resort",
    coin_cost: 350,
    original_coin_cost: 420,
    estimated_value_dop: 5200,
    estimated_value_usd: 85,
    prize_type: "experience",
    min_level: 2,
    quantity_available: 25,
    quantity_redeemed: 11,
    is_featured: true,
    image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
    validity_days: 90,
    includes: ["Almuerzo buffet internacional", "Bebidas y coctelería nacional ilimitada", "Toallas y camastros de playa", "Piscinas y kayaks"]
  },
  {
    id: "p2",
    name: "Cata Guiada de Ron Dominicano Imperial & Cigarros",
    description: "Experiencia sensorial exclusiva para 2 personas en cava colonial con sommelier y maestro tabaquero certificado.",
    sponsor: "Cava Colonial & Tabaco RD",
    location: "Zona Colonial, Santo Domingo",
    category: "gastronomy",
    coin_cost: 220,
    estimated_value_dop: 3800,
    estimated_value_usd: 62,
    prize_type: "experience",
    min_level: 1,
    quantity_available: 35,
    quantity_redeemed: 14,
    is_featured: true,
    image_url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop&q=80",
    validity_days: 60,
    includes: ["Degustación de 4 rones añejos y extra-añejos", "Maridaje con chocolate orgánico", "Cigarro artesanal premium", "Guía sommelier"]
  },
  {
    id: "p3",
    name: "Excursión en Catamarán a Cayo Arena con Snorkel",
    description: "Navegación en lancha rápida por los manglares de Montecristi hacia el atolón coralino de Cayo Arena con equipo de buceo superficial y almuerzo típico.",
    sponsor: "Quisqueya EcoTours",
    location: "Punta Rucia / Montecristi",
    category: "adventure",
    coin_cost: 400,
    original_coin_cost: 480,
    estimated_value_dop: 6500,
    estimated_value_usd: 105,
    prize_type: "experience",
    min_level: 3,
    quantity_available: 15,
    quantity_redeemed: 6,
    is_featured: true,
    image_url: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80",
    validity_days: 120,
    includes: ["Transporte marítimo ida y vuelta", "Chalecos y caretas de snorkel", "Frutas frescas y bebidas en el cayo", "Almuerzo de mariscos en la playa"]
  },
  {
    id: "p4",
    name: "Kit de Explorador: Mochila Ecoturística + Termo RD",
    description: "Mochila impermeable de 30L oficial Descubre RD con termo de acero inoxidable grabado en láser y buff multifuncional.",
    sponsor: "Tienda Oficial Descubre RD",
    location: "Envío a todo el país",
    category: "product",
    coin_cost: 180,
    estimated_value_dop: 2900,
    estimated_value_usd: 48,
    prize_type: "product",
    min_level: 1,
    quantity_available: 45,
    quantity_redeemed: 22,
    is_featured: false,
    image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    validity_days: 365,
    includes: ["Mochila técnica impermeable 30L", "Termo doble capa frío/calor 750ml", "Envío postal certificado a domicilio"]
  },
  {
    id: "p5",
    name: "Safari en Buggies por Senderos & Playa Macao",
    description: "Recorrido off-road conduciendo tu propio buggy todoterreno por plantaciones de café, cueva con cenote y parada en Playa Macao.",
    sponsor: "Macao Adventure Tours",
    location: "Bávaro - Punta Cana",
    category: "adventure",
    coin_cost: 260,
    estimated_value_dop: 4200,
    estimated_value_usd: 70,
    prize_type: "experience",
    min_level: 2,
    quantity_available: 30,
    quantity_redeemed: 17,
    is_featured: false,
    image_url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80",
    validity_days: 90,
    includes: ["Buggy biplaza por 2.5 horas", "Casco y gafas de protección", "Baño en cenote indígena", "Degustación de café y cacao"]
  },
  {
    id: "p6",
    name: "Cena Degustación de 4 Tiempos Gastronomía Criolla",
    description: "Menú de autor para 2 personas que reinterpreta los sabores tradicionales del Cibao con ingredientes de origen orgánico.",
    sponsor: "Restaurante Raíces Cibaeñas",
    location: "Santiago de los Caballeros",
    category: "gastronomy",
    coin_cost: 240,
    estimated_value_dop: 3900,
    estimated_value_usd: 65,
    prize_type: "experience",
    min_level: 2,
    quantity_available: 20,
    quantity_redeemed: 9,
    is_featured: false,
    image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
    validity_days: 60,
    includes: ["Menú degustación 4 pasos", "2 copas de vino de bienvenida", "Postre artesanal de majarete brulee", "Mesa preferencial"]
  },
  {
    id: "p7",
    name: "Estadía 2 Días / 1 Noche en Eco-Lodge de Montaña",
    description: "Escapada ecológica en cabaña rústica con vista a los pinares de Jarabacoa, fogata nocturna y desayuno campestre.",
    sponsor: "Jarabacoa Eco-Reserva",
    location: "Jarabacoa, La Vega",
    category: "resort",
    coin_cost: 550,
    original_coin_cost: 650,
    estimated_value_dop: 9200,
    estimated_value_usd: 150,
    prize_type: "experience",
    min_level: 4,
    quantity_available: 8,
    quantity_redeemed: 3,
    is_featured: true,
    image_url: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&auto=format&fit=crop&q=80",
    validity_days: 120,
    includes: ["Alojamiento 1 noche para 2 personas", "Desayuno criollo con mangu y queso frito", "Acceso a senderos privados", "Leña para fogata"]
  },
  {
    id: "p8",
    name: "2 Entradas VIP para la Temporada de Béisbol LIDOM",
    description: "Boletas palco preferencial para ver a los Tigres del Licey, Leones del Escogido o Águilas Cibaeñas.",
    sponsor: "LIDOM Oficial",
    location: "Estadio Quisqueya / Estadio Cibao",
    category: "vip",
    coin_cost: 210,
    estimated_value_dop: 3200,
    estimated_value_usd: 52,
    prize_type: "experience",
    min_level: 2,
    quantity_available: 40,
    quantity_redeemed: 25,
    is_featured: false,
    image_url: "https://images.unsplash.com/photo-1508344928928-7165b67de128?w=800&auto=format&fit=crop&q=80",
    validity_days: 45,
    includes: ["2 Asientos en Palco A o B", "Acceso rápido sin filas en taquilla", "Válido para ronda regular"]
  },
  {
    id: "p9",
    name: "Pasaporte Físico de Colección con Sellos Dorados",
    description: "Libreta de tapa de cuero ecológico repujada en dorado con páginas ilustradas de las 32 provincias y set de calcomanías oficiales.",
    sponsor: "Descubre RD Brand",
    location: "Envío a todo el país",
    category: "product",
    coin_cost: 140,
    estimated_value_dop: 2100,
    estimated_value_usd: 35,
    prize_type: "product",
    min_level: 1,
    quantity_available: 60,
    quantity_redeemed: 38,
    is_featured: false,
    image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
    validity_days: 365,
    includes: ["Pasaporte Físico 64 páginas", "Set de 32 stickers provinciales", "Caja conmemorativa de presentación"]
  }
];

interface RedeemedVoucher {
  id: string;
  code: string;
  prizeName: string;
  sponsor: string;
  location: string;
  category: string;
  redeemedDate: string;
  expiryDate: string;
  status: "active" | "used" | "expired";
  qrData: string;
  instructions: string;
}

const mockInitialVouchers: RedeemedVoucher[] = [
  {
    id: "vouch-1",
    code: "RD-POP-882194",
    prizeName: "Pase de 1 Día Todo Incluido en Resort Playa Dorada",
    sponsor: "Grand Paradise Resort Puerto Plata",
    location: "Puerto Plata",
    category: "resort",
    redeemedDate: "18 Sep 2026",
    expiryDate: "18 Dic 2026",
    status: "active",
    qrData: "DESCUBRERD-VOUCHER-POP-882194-ACTIVE",
    instructions: "Presentar este voucher impreso o en tu pantalla junto a tu cédula o pasaporte en la recepción del resort con 48h de reserva previa."
  }
];

const howItWorksSteps = [
  { 
    icon: "🗺️", 
    title: "1. Explora & Registra", 
    desc: "Visita playas, monumentos, ríos y áreas protegidas en las 32 provincias de RD. Cada visita acreditada suma puntos de experiencia (XP) y monedas." 
  },
  { 
    icon: "⚡", 
    title: "2. Supera Retos & Trivias", 
    desc: "Participa en las misiones temáticas de temporada y en la trivia diaria sobre historia, gastronomía y biodiversidad para multiplicar tus monedas." 
  },
  { 
    icon: "🛍️", 
    title: "3. Descuentos en Tiendas", 
    desc: "A medida que subes de nivel, desbloqueas del 5% al 25% de descuento permanente en el Marketplace y comercios locales asociados." 
  },
  { 
    icon: "🎁", 
    title: "4. Canjea Experiencias Reales", 
    desc: "Cambia tus monedas acumuladas por estancias en hoteles, day passes, catas gastronómicas y artículos oficiales enviados a tu puerta." 
  },
];

const faqs = [
  {
    q: "¿Cómo reciben los turistas su recompensa una vez canjeada?",
    a: "Las experiencias y entradas digitales generan instantáneamente un Voucher con código único y código QR que el viajero muestra en tu recepción. Para los artículos físicos, el sistema coordina el envío postal con la dirección del cliente."
  },
  {
    q: "¿Cómo valida el portal que una empresa es real antes de registrar premios?",
    a: "Realizamos una verificación obligatoria mediante el RNC (Registro Nacional de Contribuyentes ante la DGII) y el Registro Nacional Turístico (RNT) o Licencia de Operación MITUR, asegurando que solo establecimientos formales y seguros ofrezcan recompensas a los turistas."
  },
  {
    q: "¿Tiene algún costo para los hoteles o tour operadores publicar recompensas?",
    a: "No cobramos comisión de publicación. El establecimiento únicamente aporta los cupos o experiencias que desee patrocinar, beneficiándose de promoción turística directa, turistas calificados y reseñas verificadas."
  },
  {
    q: "¿Cómo comprueba un hotel que el voucher del turista es auténtico?",
    a: "El personal del hotel o tour operador puede usar la herramienta de 'Escanear / Validar Voucher' en el portal de aliados para ingresar el código del viajero y marcarlo como redimido en segundos."
  }
];

export default function ClubRecompensas() {
  const { user } = useAuth();
  const {
    userGamification, levels, missions, userMissions,
    prizes, leaderboard, referralCode, loading,
    getCurrentLevel, getNextLevel, getXpProgress, redeemPrize
  } = useGamification();

  const [activeTab, setActiveTab] = useState<"catalog" | "my-vouchers" | "levels" | "how-it-works" | "partners">("catalog");
  const [prizeFilter, setPrizeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "level">("featured");
  
  // Flash Sale Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 42, seconds: 15 });
  
  // Catalog Rewards with custom partner registered rewards
  const [rewardsList, setRewardsList] = useState<CatalogReward[]>(initialRewards);

  // Modal states
  const [selectedPhysicalPrize, setSelectedPhysicalPrize] = useState<CatalogReward | null>(null);
  const [selectedDetailPrize, setSelectedDetailPrize] = useState<CatalogReward | null>(null);
  const [activeGeneratedVoucher, setActiveGeneratedVoucher] = useState<RedeemedVoucher | null>(null);
  const [myVouchers, setMyVouchers] = useState<RedeemedVoucher[]>(mockInitialVouchers);
  const [auctionModalOpen, setAuctionModalOpen] = useState(false);
  const [puntosModalOpen, setPuntosModalOpen] = useState(false);

  // Business Registration & Verification Wizard State
  const [companyVerified, setCompanyVerified] = useState(false);
  const [verifyingCompany, setVerifyingCompany] = useState(false);
  const [verificationType, setVerificationType] = useState<"corporate_otp" | "pyme_manual">("corporate_otp");
  const [otpCode, setOtpCode] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [pymeDocUploaded, setPymeDocUploaded] = useState(false);
  const [partnerStep, setPartnerStep] = useState<"verify" | "create-reward" | "ads-perks" | "dashboard">("verify");

  const [companyForm, setCompanyForm] = useState({
    rnc: "1-31-88492-3",
    legalName: "Inversiones Turísticas del Caribe SRL",
    tradeName: "Resort & Spa Bahía Dorada",
    rntMitur: "RNT-MITUR-2025-0418",
    businessType: "hotel",
    province: "Puerto Plata",
    address: "Av. Playa Dorada Km 4",
    contactName: "Lic. Marcos Almonte",
    contactRole: "Director Comercial / Gerente",
    email: "reservas@bahiadorada.do",
    phone: "(809) 586-2244",
    website: "https://bahiadorada.do"
  });

  const [adPerksForm, setAdPerksForm] = useState({
    wantsAds: true,
    adFormat: "billboard_home",
    userPerkTitle: "Cóctel de Bienvenida de Ron Añejo Dominicano",
    userPerkDesc: "Cortesía para todo viajero con reserva a través de Descubre RD",
    influencerPerkTitle: "Estadía All-Inclusive de 2 Noches / 3 Días",
    influencerPerkDesc: "Disponible para creadores de contenido de viajes con más de 20k seguidores",
    raffleTitle: "Fin de Semana para 2 en Habitación Frente al Mar",
    raffleDesc: "Sorteo mensual para la comunidad y seguidores del portal"
  });

  const [newRewardForm, setNewRewardForm] = useState({
    name: "",
    category: "resort" as "resort" | "adventure" | "gastronomy" | "product" | "vip",
    description: "",
    location: "Puerto Plata",
    coinCost: 280,
    estimatedValueDop: 4500,
    estimatedValueUsd: 75,
    minLevel: 2,
    quantityAvailable: 20,
    validityDays: 90,
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
    includesText: "Acceso VIP a instalaciones\nAlmuerzo buffet y bebidas\nUso de toallas y camastros\nEstacionamiento vigilado",
    bookingInstructions: "Reservar con 48 horas de antelación vía WhatsApp al (809) 586-2244."
  });

  // Partner Voucher Validation Tool State
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [voucherValidationResult, setVoucherValidationResult] = useState<any>(null);

  const [shippingForm, setShippingForm] = useState({
    recipientName: "",
    recipientPhone: "",
    shippingAddress: "",
    city: "Santo Domingo",
    notes: ""
  });
  const [submittingShipment, setSubmittingShipment] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
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

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const xpProgress = getXpProgress();

  const copyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(`https://descubrerd.com/registro?ref=${referralCode}`);
      toast.success("¡Enlace de referido copiado! Compártelo con amigos para ganar +50 monedas.");
    } else {
      navigator.clipboard.writeText(`https://descubrerd.com/registro?ref=RD-EXPLORER`);
      toast.success("¡Enlace de referido copiado! Compártelo con amigos para ganar +50 monedas.");
    }
  };

  const handleSendOtp = () => {
    if (!companyForm.email.includes("@")) {
      toast.error("Ingresa un correo institucional válido.");
      return;
    }
    setIsOtpSent(true);
    toast.success(`Código de verificación OTP enviado a ${companyForm.email}. (Código simulado: 849201)`);
  };

  // Handle Business Verification with Corporate OTP vs SME document check
  const handleVerifyCompany = () => {
    if (!companyForm.rnc.trim() || !companyForm.legalName.trim() || !companyForm.rntMitur.trim()) {
      toast.error("Por favor completa el RNC, la Razón Social y el Registro Turístico MITUR.");
      return;
    }

    if (verificationType === "corporate_otp") {
      if (otpCode !== "849201" && otpCode.length !== 6) {
        toast.error("Código OTP incorrecto. Usa el código de 6 dígitos enviado.");
        return;
      }
    } else {
      if (!pymeDocUploaded) {
        toast.error("Por favor adjunta la documentación de tu PyME (RNC / Registro Mercantil) para revisión manual.");
        return;
      }
    }

    setVerifyingCompany(true);
    setTimeout(() => {
      setVerifyingCompany(false);
      setCompanyVerified(true);
      setPartnerStep("create-reward");
      toast.success(`🏢 ¡Empresa ${companyForm.tradeName || companyForm.legalName} Validada Exitosamente!`);
    }, 1000);
  };

  // Handle Publishing a New Reward
  const handlePublishReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRewardForm.name.trim() || !newRewardForm.description.trim()) {
      toast.error("Por favor ingresa el título y descripción de la recompensa.");
      return;
    }

    const includesArray = newRewardForm.includesText
      .split("\n")
      .map(s => s.trim())
      .filter(Boolean);

    const createdReward: CatalogReward = {
      id: `partner-rew-${Date.now()}`,
      name: newRewardForm.name,
      description: newRewardForm.description,
      sponsor: companyForm.tradeName || companyForm.legalName,
      location: newRewardForm.location,
      category: newRewardForm.category,
      coin_cost: Number(newRewardForm.coinCost),
      estimated_value_dop: Number(newRewardForm.estimatedValueDop),
      estimated_value_usd: Number(newRewardForm.estimatedValueUsd),
      prize_type: newRewardForm.category === "product" ? "product" : "experience",
      min_level: Number(newRewardForm.minLevel),
      quantity_available: Number(newRewardForm.quantityAvailable),
      quantity_redeemed: 0,
      is_featured: true,
      image_url: newRewardForm.imageUrl,
      validity_days: Number(newRewardForm.validityDays),
      includes: includesArray.length > 0 ? includesArray : ["Acceso garantizado", "Atención preferencial para exploradores"],
      isPartnerCustom: true
    };

    setRewardsList(prev => [createdReward, ...prev]);
    setPartnerStep("ads-perks");
    toast.success(`🎉 ¡Recompensa "${createdReward.name}" configurada! Puedes gestionar publicidad o regalos ahora.`);
  };

  // Handle validating voucher code in partner dashboard
  const handleValidateVoucherCode = () => {
    const code = voucherCodeInput.trim().toUpperCase();
    if (!code) {
      toast.error("Ingresa un código de voucher.");
      return;
    }

    const found = myVouchers.find(v => v.code.toUpperCase() === code);
    if (found) {
      setVoucherValidationResult({
        isValid: true,
        voucher: found,
        message: "✓ Voucher Auténtico y Válido para Canje"
      });
      toast.success("Voucher verificado correctamente.");
    } else {
      setVoucherValidationResult({
        isValid: false,
        message: "❌ Código no encontrado o ya utilizado anteriormente."
      });
      toast.error("Código no válido.");
    }
  };

  // Filter & sort prizes
  const filteredPrizes = rewardsList
    .filter(p => {
      const matchesFilter = prizeFilter === "all" || p.category === prizeFilter || (prizeFilter === "experience" && p.prize_type === "experience");
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
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

  const handleRedeemDigitalPrize = (prize: CatalogReward) => {
    const newCode = `RD-${prize.location.substring(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const newVoucher: RedeemedVoucher = {
      id: `vouch-${Date.now()}`,
      code: newCode,
      prizeName: prize.name,
      sponsor: prize.sponsor,
      location: prize.location,
      category: prize.category,
      redeemedDate: "Hoy",
      expiryDate: `En ${prize.validity_days} días`,
      status: "active",
      qrData: `DESCUBRERD-VOUCHER-${newCode}-AUTHENTICATED`,
      instructions: `Presentar este voucher al momento de llegar a ${prize.sponsor}. Se recomienda confirmar con 24-48h de antelación.`
    };

    setMyVouchers(prev => [newVoucher, ...prev]);
    setActiveGeneratedVoucher(newVoucher);
    redeemPrize(prize.id);
    toast.success(`🎉 ¡Recompensa canjeada con éxito! Se ha generado tu Voucher ${newCode}.`);
  };

  return (
    <PageTransition>
      <SEOHead
        title="Club de Recompensas y Portal de Empresas Aliadas | Descubre RD"
        description="Canjea tus monedas de exploración turística por day passes en resorts todo incluido, catas de ron y tours. Empresas verificadas pueden registrar y patrocinar recompensas."
        keywords="club de recompensas turismo rd, empresas aliadas turismo rd, validar empresa rnc mitur recompensas, canje de monedas descubrerd"
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        {/* Central Gamification Breadcrumb Bar */}
        <div className="border-b border-border/60 bg-muted/20 py-2.5">
          <div className="container mx-auto px-4 max-w-7xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link to="/gamificacion-turistica" className="hover:text-primary transition-colors flex items-center gap-1.5 font-semibold">
                <Compass className="h-3.5 w-3.5 text-primary" /> Hub de Gamificación
              </Link>
              <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
              <span className="text-foreground font-bold flex items-center gap-1">
                <Gift className="h-3 w-3 text-primary" /> Club de Recompensas
              </span>
            </div>

            {/* Subroutes Quick Links */}
            <div className="flex items-center gap-2 sm:gap-4 text-xs">
              <Link to="/gamificacion-turistica/retos" className="text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                <Target className="h-3.5 w-3.5 text-emerald-500" /> Misiones
              </Link>
              <span className="text-muted-foreground/40">•</span>
              <Link to="/gamificacion-turistica/trivia" className="text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                <Sparkles className="h-3.5 w-3.5 text-blue-500" /> Trivia Diaria
              </Link>
              <span className="text-muted-foreground/40">•</span>
              <Link to="/gamificacion-turistica/creadores" className="text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                <Crown className="h-3.5 w-3.5 text-amber-500" /> Creadores
              </Link>
              <span className="text-muted-foreground/40">•</span>
              <button 
                onClick={() => setActiveTab("partners")} 
                className="text-primary font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Building className="h-3.5 w-3.5" /> Portal Empresas
              </button>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="pt-10 pb-12 relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/10 via-background to-background">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10 max-w-7xl">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Heading & Value Proposition */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-primary/15 text-primary border-primary/30 text-xs px-3 py-1 font-semibold">
                    <Gift className="h-3.5 w-3.5 mr-1" /> Catálogo Oficial de Beneficios Turísticos
                  </Badge>
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs px-3 py-1 font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Empresas Validadas con RNC & RNT
                  </Badge>
                </div>

                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
                  Tus viajes en RD tienen premio real. <br />
                  <span className="text-primary bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
                    Canjea experiencias o publica como Aliado
                  </span>
                </h1>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
                  Cada provincia acreditada suma monedas canjeables por estancias en hoteles, catas de ron y excursiones. Las empresas hoteleras y gastronómicas pueden registrar sus recompensas tras validar su identidad fiscal y turística.
                </p>

                {/* Global Metrics Bar */}
                <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg">
                  <div className="p-3 rounded-2xl bg-card/60 backdrop-blur-sm border border-border">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Premios Disponibles</p>
                    <p className="text-lg font-black text-foreground mt-0.5">{rewardsList.length} Recompensas</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-card/60 backdrop-blur-sm border border-border">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Empresas Verificadas</p>
                    <p className="text-lg font-black text-foreground mt-0.5">52 Aliados</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-card/60 backdrop-blur-sm border border-border">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Valor Promedio</p>
                    <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">$85 USD</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-2">
                  <Button 
                    onClick={() => setActiveTab("catalog")} 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-10 px-5 text-xs shadow-md"
                  >
                    <Gift className="h-3.5 w-3.5 mr-1.5" /> Explorar Premios
                  </Button>
                  <Button 
                    onClick={() => setPuntosModalOpen(true)} 
                    variant="outline" 
                    className="rounded-xl h-10 px-4 text-xs bg-cyan-500/10 border-cyan-500/40 text-cyan-600 dark:text-cyan-400 font-bold hover:bg-cyan-500/20"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1.5 text-cyan-500" /> 14 Formas de Ganar Monedas
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("partners")} 
                    variant="outline" 
                    className="rounded-xl h-10 px-4 text-xs bg-card border-primary/40 text-primary font-bold hover:bg-primary/10"
                  >
                    <Building className="h-3.5 w-3.5 mr-1.5" /> Registrar Recompensa de Empresa
                  </Button>
                  <Button 
                    onClick={() => setAuctionModalOpen(true)} 
                    variant="outline" 
                    className="rounded-xl h-10 px-4 text-xs bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-500/20"
                  >
                    <Crown className="h-3.5 w-3.5 mr-1.5 text-amber-500" /> Subastas VIP
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("my-vouchers")} 
                    variant="ghost" 
                    className="rounded-xl h-10 px-3 text-xs text-muted-foreground font-semibold"
                  >
                    <Ticket className="h-3.5 w-3.5 mr-1.5 text-primary" /> Mis Vouchers ({myVouchers.length})
                  </Button>
                </div>
              </div>

              {/* Right Column: User Explorer Wallet */}
              <div className="lg:col-span-5">
                <div className="rounded-3xl p-6 bg-gradient-to-br from-card via-card to-primary/10 border-2 border-primary/25 shadow-xl space-y-4 backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-2xl bg-primary/20 flex items-center justify-center text-2xl border border-primary/30 shadow-inner">
                        {currentLevel?.icon || "🧭"}
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Tu Billetera de Explorador</p>
                        <h4 className="text-sm font-bold text-foreground">{currentLevel?.title || "Explorador Turístico"}</h4>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-bold px-2.5 py-0.5">
                      Nivel {userGamification?.current_level || 1}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Monedas Canjeables</span>
                      <p className="text-2xl sm:text-3xl font-black text-amber-500 mt-0.5 flex items-center justify-center gap-1.5">
                        <Crown className="h-5 w-5" /> {(userGamification?.coins || 280).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Puntos XP Totales</span>
                      <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center justify-center gap-1.5">
                        <Zap className="h-5 w-5" /> {(userGamification?.total_xp || 640).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {nextLevel ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Progreso hacia <strong className="text-foreground">{nextLevel.title}</strong></span>
                        <span className="font-bold text-foreground">{xpProgress}%</span>
                      </div>
                      <Progress value={xpProgress} className="h-2 bg-muted" />
                    </div>
                  ) : (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle className="h-3.5 w-3.5" /> Has alcanzado el rango máximo de Explorador.
                    </div>
                  )}

                  {/* Referral invitation */}
                  <div className="p-3 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between text-xs gap-2">
                    <div>
                      <p className="font-bold text-foreground text-[11px] flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-amber-500" /> ¿Necesitas más monedas?
                      </p>
                      <p className="text-[10px] text-muted-foreground">+50 monedas por cada amigo que se una con tu enlace.</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={copyReferralCode} className="h-8 rounded-xl text-xs gap-1 shrink-0 font-semibold bg-card border-primary/30">
                      <Share2 className="h-3 w-3 text-primary" /> Invitar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <main className="container mx-auto px-4 max-w-7xl py-10 flex-1">
          <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="space-y-8">
            {/* Tab Bar */}
            <div className="sticky top-16 z-30 bg-background/90 backdrop-blur-md py-2 border-b border-border/60">
              <TabsList className="bg-card p-1.5 rounded-2xl border border-border flex overflow-x-auto scrollbar-none h-auto gap-1">
                <TabsTrigger value="catalog" className="rounded-xl text-xs sm:text-sm font-semibold gap-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm">
                  <Gift className="h-4 w-4" /> Catálogo de Premios ({filteredPrizes.length})
                </TabsTrigger>
                <TabsTrigger value="partners" className="rounded-xl text-xs sm:text-sm font-semibold gap-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm">
                  <Building className="h-4 w-4" /> Portal de Empresas Aliadas & Registro
                </TabsTrigger>
                <TabsTrigger value="my-vouchers" className="rounded-xl text-xs sm:text-sm font-semibold gap-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm">
                  <Ticket className="h-4 w-4" /> Mis Vouchers ({myVouchers.length})
                </TabsTrigger>
                <TabsTrigger value="levels" className="rounded-xl text-xs sm:text-sm font-semibold gap-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm">
                  <TrendingUp className="h-4 w-4" /> Niveles & Privilegios
                </TabsTrigger>
                <TabsTrigger value="how-it-works" className="rounded-xl text-xs sm:text-sm font-semibold gap-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm">
                  <Sparkles className="h-4 w-4" /> ¿Cómo Ganar Monedas?
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: CATALOG */}
            <TabsContent value="catalog" className="space-y-8">
              {/* Flash Sale Promo Box */}
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
                        Pase All-Inclusive Día Completo en Resort Playa Dorada
                      </h3>
                      <p className="text-xs text-muted-foreground max-w-2xl">
                        Disfruta de buffet internacional, bebidas ilimitadas, deportes acuáticos no motorizados y acceso total al club de playa en Puerto Plata.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-foreground bg-card p-2.5 rounded-xl border border-border w-full sm:w-auto justify-center">
                      <Clock className="h-4 w-4 text-red-500 animate-pulse" />
                      <span>{String(timeLeft.hours).padStart(2, "0")}h : {String(timeLeft.minutes).padStart(2, "0")}m : {String(timeLeft.seconds).padStart(2, "0")}s</span>
                    </div>
                    <Button 
                      onClick={() => handleRedeemDigitalPrize(rewardsList[0])}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs h-10 px-5 w-full sm:w-auto shadow-md"
                    >
                      Canjear por 210 Monedas
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Filters, Categories and Search */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                {/* Category Pills */}
                <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                  {[
                    { id: "all", label: "🎯 Todos" },
                    { id: "resort", label: "🏨 Resorts & Day Passes" },
                    { id: "adventure", label: "🛶 Aventura & Ecoturismo" },
                    { id: "gastronomy", label: "🍷 Gastronomía & Ron" },
                    { id: "product", label: "🎒 Souvenirs Oficiales" },
                    { id: "vip", label: "🎟️ Pases VIP" }
                  ].map(f => (
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
                {filteredPrizes.map((prize, i) => {
                  const userCoins = userGamification?.coins ?? 280;
                  const userLevel = userGamification?.current_level ?? 1;
                  const canAfford = userCoins >= prize.coin_cost;
                  const meetsLevel = userLevel >= prize.min_level;
                  const remaining = prize.quantity_available - prize.quantity_redeemed;

                  return (
                    <motion.div
                      key={prize.id}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04 }}
                      className={`rounded-3xl overflow-hidden bg-card border ${
                        prize.isPartnerCustom ? "border-emerald-500/40 shadow-emerald-500/5 ring-1 ring-emerald-500/20" : "border-border"
                      } hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group`}
                    >
                      <div>
                        {/* Image Thumbnail with badges */}
                        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                          <img
                            src={prize.image_url}
                            alt={prize.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

                          <div className="absolute top-3 left-3 flex flex-col gap-1">
                            {prize.is_featured && (
                              <Badge className="bg-primary text-primary-foreground text-[10px] font-bold shadow-md">
                                ⭐ Destacado
                              </Badge>
                            )}
                            {prize.isPartnerCustom && (
                              <Badge className="bg-emerald-600 text-white text-[10px] font-bold shadow-md">
                                ✓ Empresa Verificada
                              </Badge>
                            )}
                          </div>

                          <Badge className="absolute top-3 right-3 bg-black/60 text-white backdrop-blur-md text-[10px] border-none font-medium">
                            <MapPin className="h-3 w-3 mr-1 text-primary" /> {prize.location}
                          </Badge>

                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px]">
                            <span className="font-semibold truncate max-w-[200px]">{prize.sponsor}</span>
                            <span className="bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
                              Valor: ~RD$ {prize.estimated_value_dop.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {prize.name}
                            </h3>
                          </div>

                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {prize.description}
                          </p>

                          {/* Quick Includes Tags */}
                          <div className="pt-1 flex flex-wrap gap-1.5">
                            {prize.includes.slice(0, 2).map((inc, ii) => (
                              <span key={ii} className="text-[10px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Check className="h-2.5 w-2.5 text-emerald-500" /> {inc}
                              </span>
                            ))}
                          </div>

                          {/* Level & Availability status */}
                          <div className="flex items-center gap-2 pt-2 text-[10px]">
                            {prize.min_level > 1 && (
                              <Badge variant={meetsLevel ? "secondary" : "destructive"} className="text-[10px] gap-1 font-semibold">
                                {meetsLevel ? <Check className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                Requiere Nivel {prize.min_level}+
                              </Badge>
                            )}
                            <span className="text-muted-foreground">
                              {remaining > 0 ? `Quedan ${remaining} disponibles` : "Agotado"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="p-5 pt-3 border-t border-border/60 mt-2 flex items-center justify-between gap-2">
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-foreground">{prize.coin_cost}</span>
                            <span className="text-xs text-amber-500 font-bold">monedas</span>
                          </div>
                          {prize.original_coin_cost && (
                            <span className="text-[10px] text-muted-foreground line-through">
                              {prize.original_coin_cost} monedas
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedDetailPrize(prize)}
                            className="rounded-xl text-xs h-9 px-2.5 text-muted-foreground"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>

                          <Button 
                            size="sm"
                            disabled={!canAfford || !meetsLevel || remaining <= 0}
                            onClick={() => {
                              if (prize.prize_type === "product") {
                                setSelectedPhysicalPrize(prize);
                              } else {
                                handleRedeemDigitalPrize(prize);
                              }
                            }}
                            className="rounded-xl text-xs font-bold px-4 h-9 shadow-sm"
                          >
                            {!meetsLevel ? "Nivel Insuficiente" : !canAfford ? "Monedas Insuficientes" : prize.prize_type === "product" ? "Pedir Envío" : "Canjear Ahora"}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {filteredPrizes.length === 0 && (
                <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-3">
                  <span className="text-4xl">🔍</span>
                  <h4 className="font-display font-bold text-lg text-foreground">No encontramos recompensas con ese filtro</h4>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Prueba cambiando la categoría seleccionada o buscando con un término diferente.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => { setPrizeFilter("all"); setSearchQuery(""); }} className="rounded-xl text-xs">
                    Restablecer Filtros
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* TAB 2: PORTAL EMPRESAS & REGISTRO DE RECOMPENSAS */}
            <TabsContent value="partners" className="space-y-8">
              {/* Header & Steps Navigator */}
              <div className="p-8 rounded-3xl bg-gradient-to-br from-card via-card to-primary/10 border-2 border-primary/20 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                        Portal Oficial de Empresas & Hotelería RD
                      </Badge>
                      {companyVerified && (
                        <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs flex items-center gap-1 font-bold">
                          <CheckCheck className="h-3 w-3" /> Empresa Verificada (RNC Activo)
                        </Badge>
                      )}
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl font-black text-foreground">
                      Registra tu Empresa y Publica Recompensas Turísticas
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
                      Para garantizar la seguridad y autenticidad hacia los viajeros, requerimos validar tu RNC (DGII) y Registro Nacional Turístico (MITUR) antes de habilitar la publicación de beneficios.
                    </p>
                  </div>

                  {/* Step Pills */}
                  <div className="flex items-center gap-2 bg-background/60 p-1.5 rounded-2xl border border-border shrink-0">
                    <button
                      onClick={() => setPartnerStep("verify")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        partnerStep === "verify" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      1. Validación RNC
                    </button>
                    <button
                      onClick={() => {
                        if (!companyVerified) {
                          toast.error("Debes validar tu empresa primero.");
                          return;
                        }
                        setPartnerStep("create-reward");
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        partnerStep === "create-reward" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      2. Publicar Recompensa
                    </button>
                    <button
                      onClick={() => setPartnerStep("dashboard")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        partnerStep === "dashboard" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      3. Panel & Vouchers
                    </button>
                  </div>
                </div>

                {/* STEP 1: VALIDATION FORM */}
                {partnerStep === "verify" && (
                  <div className="p-6 rounded-3xl bg-background border border-border/80 space-y-6">
                    <div className="flex items-center justify-between border-b border-border/60 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                          1
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-base text-foreground">
                            Validación de Identidad Fiscal & Licencia Turística
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Ingresa los datos de tu empresa para comprobar la formalidad en el sistema nacional.
                          </p>
                        </div>
                      </div>

                      {/* Verification Mode Selector */}
                      <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border text-xs">
                        <button
                          type="button"
                          onClick={() => setVerificationType("corporate_otp")}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                            verificationType === "corporate_otp"
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          ✉️ Correo Corporativo (OTP Inmediato)
                        </button>
                        <button
                          type="button"
                          onClick={() => setVerificationType("pyme_manual")}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                            verificationType === "pyme_manual"
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          📑 PyME (Revisión Documental)
                        </button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <Label htmlFor="rnc-input" className="text-xs font-bold">RNC (Registro Nacional de Contribuyentes)</Label>
                        <Input
                          id="rnc-input"
                          placeholder="Ej: 1-31-88492-3"
                          value={companyForm.rnc}
                          onChange={(e) => setCompanyForm(prev => ({ ...prev, rnc: e.target.value }))}
                          className="mt-1 text-xs rounded-xl h-9 bg-card border-border"
                        />
                        <span className="text-[10px] text-muted-foreground">Formato de 9 u 11 dígitos con guiones</span>
                      </div>

                      <div>
                        <Label htmlFor="rnt-input" className="text-xs font-bold">Registro Nacional Turístico (RNT / MITUR)</Label>
                        <Input
                          id="rnt-input"
                          placeholder="Ej: RNT-MITUR-2025-0418"
                          value={companyForm.rntMitur}
                          onChange={(e) => setCompanyForm(prev => ({ ...prev, rntMitur: e.target.value }))}
                          className="mt-1 text-xs rounded-xl h-9 bg-card border-border"
                        />
                        <span className="text-[10px] text-muted-foreground">Licencia de operación emitida por el Ministerio de Turismo</span>
                      </div>

                      <div>
                        <Label htmlFor="legal-name" className="text-xs font-bold">Razón Social Registrada</Label>
                        <Input
                          id="legal-name"
                          placeholder="Ej: Inversiones Turísticas del Caribe SRL"
                          value={companyForm.legalName}
                          onChange={(e) => setCompanyForm(prev => ({ ...prev, legalName: e.target.value }))}
                          className="mt-1 text-xs rounded-xl h-9 bg-card border-border"
                        />
                      </div>

                      <div>
                        <Label htmlFor="trade-name" className="text-xs font-bold">Nombre Comercial / Marca</Label>
                        <Input
                          id="trade-name"
                          placeholder="Ej: Resort & Spa Bahía Dorada"
                          value={companyForm.tradeName}
                          onChange={(e) => setCompanyForm(prev => ({ ...prev, tradeName: e.target.value }))}
                          className="mt-1 text-xs rounded-xl h-9 bg-card border-border"
                        />
                      </div>

                      <div>
                        <Label htmlFor="btype" className="text-xs font-bold">Categoría de Negocio</Label>
                        <select
                          id="btype"
                          value={companyForm.businessType}
                          onChange={(e) => setCompanyForm(prev => ({ ...prev, businessType: e.target.value }))}
                          className="mt-1 w-full text-xs rounded-xl h-9 px-3 bg-card border border-border text-foreground font-medium"
                        >
                          <option value="hotel">🏨 Hotel / Resort / Eco-Lodge</option>
                          <option value="tour">🛶 Tour Operador / Ecoturismo / Aventura</option>
                          <option value="restaurant">🍷 Restaurante / Gastronomía / Bar</option>
                          <option value="shop">🛍️ Tienda de Souvenirs / Artesanía / Cacao & Ron</option>
                          <option value="transport">⛵ Marina / Transporte Turístico</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="province" className="text-xs font-bold">Provincia Principal</Label>
                        <Input
                          id="province"
                          placeholder="Ej: Puerto Plata, Samaná, La Altagracia..."
                          value={companyForm.province}
                          onChange={(e) => setCompanyForm(prev => ({ ...prev, province: e.target.value }))}
                          className="mt-1 text-xs rounded-xl h-9 bg-card border-border"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-xs font-bold">Correo Institucional / Corporativo</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="email"
                            placeholder="Ej: reservas@empresa.do"
                            value={companyForm.email}
                            onChange={(e) => setCompanyForm(prev => ({ ...prev, email: e.target.value }))}
                            className="text-xs rounded-xl h-9 bg-card border-border flex-1"
                          />
                          {verificationType === "corporate_otp" && (
                            <Button
                              type="button"
                              onClick={handleSendOtp}
                              variant="outline"
                              className="text-xs rounded-xl h-9 px-3 shrink-0 border-primary/40 text-primary"
                            >
                              {isOtpSent ? "Reenviar OTP" : "Enviar Código"}
                            </Button>
                          )}
                        </div>
                      </div>

                      {verificationType === "corporate_otp" ? (
                        <div>
                          <Label htmlFor="otp-input" className="text-xs font-bold">Código OTP de 6 Dígitos</Label>
                          <Input
                            id="otp-input"
                            placeholder="Ingresa los 6 dígitos recibidos (Ej: 849201)"
                            value={otpCode}
                            maxLength={6}
                            onChange={(e) => setOtpCode(e.target.value)}
                            className="mt-1 text-xs rounded-xl h-9 bg-card border-border font-mono font-bold tracking-widest text-center"
                          />
                          <span className="text-[10px] text-muted-foreground">Validación instantánea sin esperas</span>
                        </div>
                      ) : (
                        <div>
                          <Label className="text-xs font-bold">Subida de Documento PyME (PDF/JPG)</Label>
                          <div className="mt-1 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPymeDocUploaded(true);
                                toast.success("Documento mercantil adjuntado correctamente.");
                              }}
                              className={`flex-1 p-2 rounded-xl border border-dashed text-xs text-center transition-all ${
                                pymeDocUploaded 
                                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 font-bold" 
                                  : "bg-muted/40 border-border text-muted-foreground hover:bg-muted/60"
                              }`}
                            >
                              {pymeDocUploaded ? "✓ Registro_Mercantil_2026.pdf adjunto" : "📎 Adjuntar RNC o Registro Mercantil"}
                            </button>
                          </div>
                          <span className="text-[10px] text-muted-foreground">Revisión manual aprobada en &lt; 24h</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-start gap-3 text-xs text-muted-foreground">
                      <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <p>
                        El sistema valida en tiempo real la concordancia del <strong>RNC</strong> y la <strong>Licencia RNT</strong>. Una vez completado, recibirás el sello de <em>Empresa Verificada</em> y podrás publicar recompensas instantáneamente.
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <Button
                        onClick={handleVerifyCompany}
                        disabled={verifyingCompany}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs h-10 px-6 shadow-md"
                      >
                        {verifyingCompany ? (
                          <span className="flex items-center gap-2">
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Validando empresa...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" /> Validar Empresa y Continuar
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 2: CREATE REWARD FORM */}
                {partnerStep === "create-reward" && (
                  <form onSubmit={handlePublishReward} className="p-6 rounded-3xl bg-background border border-border/80 space-y-6">
                    <div className="flex items-center justify-between border-b border-border/60 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-lg">
                          2
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-base text-foreground">
                            Configuración y Publicación de la Recompensa
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Patrocinador: <strong className="text-foreground">{companyForm.tradeName || companyForm.legalName}</strong> (RNC: {companyForm.rnc})
                          </p>
                        </div>
                      </div>

                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs">
                        ✓ Empresa Acreditada
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-xs">
                      <div className="md:col-span-2">
                        <Label htmlFor="rew-name" className="text-xs font-bold">Título de la Recompensa Turística *</Label>
                        <Input
                          id="rew-name"
                          placeholder="Ej: Day Pass 2x1 con Almuerzo Buffet & Kayaks en Playa Dorada"
                          value={newRewardForm.name}
                          onChange={(e) => setNewRewardForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                          className="mt-1 text-xs rounded-xl h-9 bg-card border-border"
                        />
                      </div>

                      <div>
                        <Label htmlFor="rew-category" className="text-xs font-bold">Categoría del Catálogo</Label>
                        <select
                          id="rew-category"
                          value={newRewardForm.category}
                          onChange={(e: any) => setNewRewardForm(prev => ({ ...prev, category: e.target.value }))}
                          className="mt-1 w-full text-xs rounded-xl h-9 px-3 bg-card border border-border text-foreground font-medium"
                        >
                          <option value="resort">🏨 Resort & Day Pass</option>
                          <option value="adventure">🛶 Aventura & Ecoturismo</option>
                          <option value="gastronomy">🍷 Gastronomía & Ron</option>
                          <option value="product">🎒 Souvenirs & Productos</option>
                          <option value="vip">🎟️ Pases VIP & Eventos</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="rew-location" className="text-xs font-bold">Ubicación de la Experiencia</Label>
                        <Input
                          id="rew-location"
                          placeholder="Ej: Puerto Plata / Punta Cana / Samaná"
                          value={newRewardForm.location}
                          onChange={(e) => setNewRewardForm(prev => ({ ...prev, location: e.target.value }))}
                          className="mt-1 text-xs rounded-xl h-9 bg-card border-border"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="rew-desc" className="text-xs font-bold">Descripción Atractiva para el Viajero *</Label>
                        <Textarea
                          id="rew-desc"
                          rows={3}
                          placeholder="Describe la experiencia, qué vivirán los turistas, vistas destacadas, ambiente y amenidades disponibles..."
                          value={newRewardForm.description}
                          onChange={(e) => setNewRewardForm(prev => ({ ...prev, description: e.target.value }))}
                          required
                          className="mt-1 text-xs rounded-xl bg-card border-border"
                        />
                      </div>

                      <div>
                        <Label htmlFor="rew-coins" className="text-xs font-bold">Costo en Monedas para el Turista</Label>
                        <Input
                          id="rew-coins"
                          type="number"
                          placeholder="Ej: 280"
                          value={newRewardForm.coinCost}
                          onChange={(e) => setNewRewardForm(prev => ({ ...prev, coinCost: Number(e.target.value) }))}
                          className="mt-1 text-xs rounded-xl h-9 bg-card border-border font-bold text-amber-500"
                        />
                        <span className="text-[10px] text-muted-foreground">Recomendado entre 150 y 500 monedas</span>
                      </div>

                      <div>
                        <Label htmlFor="rew-val-dop" className="text-xs font-bold">Valor Comercial Estimado (RD$)</Label>
                        <Input
                          id="rew-val-dop"
                          type="number"
                          placeholder="Ej: 4500"
                          value={newRewardForm.estimatedValueDop}
                          onChange={(e) => {
                            const dop = Number(e.target.value);
                            setNewRewardForm(prev => ({
                              ...prev,
                              estimatedValueDop: dop,
                              estimatedValueUsd: Math.round(dop / 60)
                            }));
                          }}
                          className="mt-1 text-xs rounded-xl h-9 bg-card border-border"
                        />
                        <span className="text-[10px] text-muted-foreground">Equivalente a aprox. ${newRewardForm.estimatedValueUsd} USD</span>
                      </div>

                      <div>
                        <Label htmlFor="rew-qty" className="text-xs font-bold">Cupos / Vouchers Disponibles</Label>
                        <Input
                          id="rew-qty"
                          type="number"
                          placeholder="Ej: 20"
                          value={newRewardForm.quantityAvailable}
                          onChange={(e) => setNewRewardForm(prev => ({ ...prev, quantityAvailable: Number(e.target.value) }))}
                          className="mt-1 text-xs rounded-xl h-9 bg-card border-border"
                        />
                      </div>

                      <div>
                        <Label htmlFor="rew-level" className="text-xs font-bold">Nivel Mínimo Requerido</Label>
                        <select
                          id="rew-level"
                          value={newRewardForm.minLevel}
                          onChange={(e) => setNewRewardForm(prev => ({ ...prev, minLevel: Number(e.target.value) }))}
                          className="mt-1 w-full text-xs rounded-xl h-9 px-3 bg-card border border-border text-foreground font-medium"
                        >
                          <option value={1}>Nivel 1 (Todos los Viajeros)</option>
                          <option value={2}>Nivel 2 (Explorador Activo)</option>
                          <option value={3}>Nivel 3 (Aventurero Quisqueyano)</option>
                          <option value={4}>Nivel 4 (Embajador VIP)</option>
                          <option value={5}>Nivel 5 (Leyenda)</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="rew-includes" className="text-xs font-bold">¿Qué incluye? (Un elemento por línea)</Label>
                        <Textarea
                          id="rew-includes"
                          rows={3}
                          value={newRewardForm.includesText}
                          onChange={(e) => setNewRewardForm(prev => ({ ...prev, includesText: e.target.value }))}
                          className="mt-1 text-xs rounded-xl bg-card border-border font-mono"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="rew-img" className="text-xs font-bold">URL de Fotografía de la Experiencia</Label>
                        <Input
                          id="rew-img"
                          placeholder="https://images.unsplash.com/..."
                          value={newRewardForm.imageUrl}
                          onChange={(e) => setNewRewardForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                          className="mt-1 text-xs rounded-xl h-9 bg-card border-border"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/60">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setPartnerStep("verify")}
                        className="rounded-xl text-xs"
                      >
                        Atrás: Datos de Empresa
                      </Button>

                      <Button
                        type="submit"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs h-10 px-6 shadow-md"
                      >
                        Continuar a Publicidad & Patrocinios <ArrowRight className="h-4 w-4 ml-1.5" />
                      </Button>
                    </div>
                  </form>
                )}

                {/* STEP 3: ADVERTISING & PERKS REQUEST */}
                {partnerStep === "ads-perks" && (
                  <div className="p-6 rounded-3xl bg-background border border-border/80 space-y-6">
                    <div className="flex items-center justify-between border-b border-border/60 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-lg">
                          3
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-base text-foreground">
                            Publicidad Destacada & Patrocinios de Regalos
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Solicita presencia publicitaria en el portal y configura beneficios para usuarios, influencers o rifas comunitarias.
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-xs">
                        ⭐ Autoservicio Comercial
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5 text-xs">
                      {/* Pauta Publicitaria */}
                      <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
                        <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-primary" /> Formato de Pauta en Portal
                        </h4>
                        <div className="space-y-2">
                          {[
                            { id: "billboard_home", name: "Billboard de Portada (Hero Home)", desc: "Máxima visibilidad nacional para viajeros internacionales" },
                            { id: "infeed_gastronomy", name: "Banner In-Feed Guía Gastronómica", desc: "Segmentado por provincia y tipo de cocina" },
                            { id: "newsletter_vip", name: "Mención en Newsletter Semanal", desc: "Llega a más de 45,000 suscriptores activos" }
                          ].map(ad => (
                            <label 
                              key={ad.id} 
                              className={`p-2.5 rounded-xl border flex items-start gap-2 cursor-pointer transition-all ${
                                adPerksForm.adFormat === ad.id ? "bg-primary/10 border-primary" : "bg-muted/30 border-border/60"
                              }`}
                            >
                              <input 
                                type="radio" 
                                name="adFormat" 
                                checked={adPerksForm.adFormat === ad.id} 
                                onChange={() => setAdPerksForm(prev => ({ ...prev, adFormat: ad.id }))}
                                className="mt-0.5 accent-primary"
                              />
                              <div>
                                <p className="font-bold text-foreground">{ad.name}</p>
                                <p className="text-[10px] text-muted-foreground">{ad.desc}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Beneficios & Patrocinios */}
                      <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
                        <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                          <Gift className="w-4 h-4 text-emerald-500" /> Opciones de Regalos & Sorteos
                        </h4>

                        <div>
                          <Label className="text-[11px] font-bold">1. Regalo / Cortesía para Usuarios Descubre RD</Label>
                          <Input
                            value={adPerksForm.userPerkTitle}
                            onChange={(e) => setAdPerksForm(prev => ({ ...prev, userPerkTitle: e.target.value }))}
                            className="mt-1 text-xs rounded-xl h-8 bg-background border-border"
                          />
                        </div>

                        <div>
                          <Label className="text-[11px] font-bold">2. Degustación / Estadía para Creadores & Influencers</Label>
                          <Input
                            value={adPerksForm.influencerPerkTitle}
                            onChange={(e) => setAdPerksForm(prev => ({ ...prev, influencerPerkTitle: e.target.value }))}
                            className="mt-1 text-xs rounded-xl h-8 bg-background border-border"
                          />
                        </div>

                        <div>
                          <Label className="text-[11px] font-bold">3. Sorteo / Rifa entre Seguidores</Label>
                          <Input
                            value={adPerksForm.raffleTitle}
                            onChange={(e) => setAdPerksForm(prev => ({ ...prev, raffleTitle: e.target.value }))}
                            className="mt-1 text-xs rounded-xl h-8 bg-background border-border"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/60">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setPartnerStep("create-reward")}
                        className="rounded-xl text-xs"
                      >
                        Atrás: Editar Recompensa
                      </Button>

                      <Button
                        type="button"
                        onClick={() => {
                          setPartnerStep("dashboard");
                          toast.success("¡Configuración comercial guardada con éxito! Tu panel ya está habilitado.");
                        }}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs h-10 px-6 shadow-md"
                      >
                        Finalizar y Abrir Panel de Empresa <CheckCheck className="h-4 w-4 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 3: PARTNER DASHBOARD & VOUCHER VALIDATOR */}
                {partnerStep === "dashboard" && (
                  <div className="space-y-6">
                    {/* Metrics Summary */}
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="p-5 rounded-3xl bg-background border border-border space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Recompensas Activas</span>
                        <p className="text-2xl font-black text-foreground">
                          {rewardsList.filter(r => r.isPartnerCustom).length + 1}
                        </p>
                        <p className="text-[10px] text-emerald-600 font-semibold">Visibles en todo el país</p>
                      </div>

                      <div className="p-5 rounded-3xl bg-background border border-border space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Vouchers Canjeados por Turistas</span>
                        <p className="text-2xl font-black text-amber-500">14</p>
                        <p className="text-[10px] text-muted-foreground">Turistas verificados</p>
                      </div>

                      <div className="p-5 rounded-3xl bg-background border border-border space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Reseñas y Menciones</span>
                        <p className="text-2xl font-black text-primary">⭐ 4.9 / 5.0</p>
                        <p className="text-[10px] text-muted-foreground">Excelente satisfacción</p>
                      </div>
                    </div>

                    {/* Voucher Scanner / Validator Tool */}
                    <div className="p-6 rounded-3xl bg-background border-2 border-primary/30 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center text-xl">
                          <Scan className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-base text-foreground">
                            Escanear / Validar Voucher de Viajero en Recepción
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Ingresa el código alfanumérico que presenta el turista para comprobar su autenticidad y marcarlo como redimido.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 max-w-lg">
                        <Input
                          placeholder="Ej: RD-POP-882194"
                          value={voucherCodeInput}
                          onChange={(e) => setVoucherCodeInput(e.target.value)}
                          className="text-xs rounded-xl h-10 bg-card border-border font-mono font-bold tracking-wider"
                        />
                        <Button
                          onClick={handleValidateVoucherCode}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs h-10 px-5 shrink-0"
                        >
                          <ShieldCheck className="h-4 w-4 mr-1.5" /> Comprobar Voucher
                        </Button>
                      </div>

                      {voucherValidationResult && (
                        <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                          voucherValidationResult.isValid ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300" : "bg-destructive/10 border-destructive/30 text-destructive"
                        }`}>
                          <p className="font-bold flex items-center gap-1.5 text-sm">
                            {voucherValidationResult.isValid ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertTriangle className="h-4 w-4" />}
                            {voucherValidationResult.message}
                          </p>
                          {voucherValidationResult.voucher && (
                            <div className="bg-background/80 p-3 rounded-xl border border-border text-foreground space-y-1">
                              <p><strong>Beneficio:</strong> {voucherValidationResult.voucher.prizeName}</p>
                              <p><strong>Establecimiento:</strong> {voucherValidationResult.voucher.sponsor}</p>
                              <p><strong>Estado:</strong> <span className="text-emerald-600 font-bold">Activo para consumo</span></p>
                            </div>
                          )}
                        </div>
                      )}
                      {/* Embeddable Official Partner Badge Generator */}
                      <PartnerEmbedBadge
                        partnerName={companyForm.tradeName || companyForm.legalName}
                        rnc={companyForm.rnc}
                        province={companyForm.province}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Button
                        onClick={() => setPartnerStep("create-reward")}
                        className="rounded-xl text-xs font-bold gap-1.5"
                      >
                        <PlusCircle className="h-4 w-4" /> Agregar Otra Recompensa
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("catalog")}
                        className="rounded-xl text-xs"
                      >
                        Ver Catálogo General
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Partner FAQs */}
              <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
                <h3 className="font-display text-xl font-bold text-foreground">Preguntas Frecuentes para Aliados & Hoteles</h3>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`faq-${i}`} className="border-border">
                      <AccordionTrigger className="text-xs sm:text-sm font-semibold text-foreground hover:no-underline">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </TabsContent>

            {/* TAB 3: MY VOUCHERS */}
            <TabsContent value="my-vouchers" className="space-y-6">
              <div className="p-6 rounded-3xl bg-card border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-primary" /> Mis Vouchers de Recompensas
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Aquí encuentras tus códigos QR de canje para presentar en recepción de hoteles, restaurantes y actividades turísticas.
                  </p>
                </div>

                <Button 
                  onClick={() => setActiveTab("catalog")} 
                  size="sm" 
                  className="rounded-xl text-xs font-semibold gap-1.5 shrink-0"
                >
                  <Gift className="h-3.5 w-3.5" /> Canjear Más Premios
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {myVouchers.map((voucher) => (
                  <div 
                    key={voucher.id}
                    className="p-6 rounded-3xl bg-card border border-border hover:border-primary/30 shadow-sm transition-all space-y-4 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-4">
                      <div>
                        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold mb-1.5">
                          ✓ VOUCHER ACTIVO
                        </Badge>
                        <h4 className="font-display font-bold text-base text-foreground">{voucher.prizeName}</h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Building className="h-3 w-3 text-primary" /> {voucher.sponsor} — {voucher.location}
                        </p>
                      </div>

                      <div className="p-2 rounded-2xl bg-white text-black border border-border shrink-0 shadow-inner">
                        <QrCode className="h-10 w-10 text-black" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs bg-muted/30 p-3.5 rounded-2xl border border-border/60">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Código Único</span>
                        <p className="font-mono font-bold text-foreground text-xs mt-0.5">{voucher.code}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Válido Hasta</span>
                        <p className="font-semibold text-foreground text-xs mt-0.5">{voucher.expiryDate}</p>
                      </div>
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {voucher.instructions}
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <Button 
                        size="sm" 
                        onClick={() => setActiveGeneratedVoucher(voucher)} 
                        className="rounded-xl text-xs font-bold gap-1.5 flex-1"
                      >
                        <QrCode className="h-3.5 w-3.5" /> Ver Ticket & QR Completo
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          navigator.clipboard.writeText(voucher.code);
                          toast.success("Código de voucher copiado al portapapeles.");
                        }}
                        className="rounded-xl text-xs px-3"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* TAB 4: LEVELS & PRIVILEGES */}
            <TabsContent value="levels" className="space-y-6">
              <div className="p-6 rounded-3xl bg-card border border-border space-y-2">
                <h3 className="font-display text-xl font-bold text-foreground">Jerarquía de Niveles & Beneficios Exclusivos</h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
                  A medida que exploras provincias y completas misiones, acumulas XP para ascender de nivel y desbloquear mayores porcentajes de descuento en tiendas, reservas de hoteles y acceso a eventos exclusivos.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {levels.map((level) => {
                  const isCurrent = level.level_number === (userGamification?.current_level || 1);
                  const isUnlocked = (userGamification?.total_xp || 640) >= level.xp_required;
                  return (
                    <div
                      key={level.id}
                      className={`p-6 rounded-3xl border transition-all ${
                        isCurrent ? "bg-primary/10 border-primary/50 ring-2 ring-primary/20 shadow-md" :
                        isUnlocked ? "bg-card border-border" :
                        "bg-muted/20 border-border opacity-75"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{level.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-display font-bold text-base text-foreground">{level.title}</h4>
                            {isCurrent && <Badge className="bg-primary text-primary-foreground text-[10px]">Tu Nivel</Badge>}
                          </div>
                          <span className="text-xs text-muted-foreground">{level.xp_required.toLocaleString()} XP requeridos</span>
                        </div>
                      </div>

                      {level.marketplace_discount > 0 && (
                        <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/20 text-xs font-semibold text-primary mb-3">
                          🎁 {level.marketplace_discount}% Descuento en Marketplace y Tiendas Aliadas
                        </div>
                      )}

                      {level.perks && level.perks.length > 0 && (
                        <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                          {level.perks.map((perk, pi) => (
                            <div key={pi} className="flex items-start gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{perk}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* TAB 5: HOW TO EARN COINS (14 WAYS) */}
            <TabsContent value="how-it-works" className="space-y-8">
              <ComoGanarPuntosSection onOpenModal={() => setPuntosModalOpen(true)} />
            </TabsContent>
          </Tabs>

          {/* Sponsoring Panorama Ad */}
          <div className="mt-14">
            <PanoramaAd showDemo />
          </div>
        </main>

        <Footer />
      </div>

      {/* MODAL 1: Voucher Canjeado con Código QR */}
      <Dialog open={!!activeGeneratedVoucher} onOpenChange={(open) => !open && setActiveGeneratedVoucher(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-2xl border border-emerald-500/30">
              🎉
            </div>
            <DialogTitle className="font-display font-bold text-lg text-foreground">
              ¡Recompensa Lista para Canjear!
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Presenta este comprobante oficial al momento de tu llegada.
            </DialogDescription>
          </DialogHeader>

          {activeGeneratedVoucher && (
            <div className="space-y-4 py-2">
              <div className="p-5 rounded-3xl bg-muted/40 border border-border space-y-3 text-center">
                <div className="mx-auto w-36 h-36 bg-white p-3 rounded-2xl border border-border shadow-inner flex items-center justify-center">
                  <QrCode className="w-full h-full text-black" />
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Código de Validación</span>
                  <p className="font-mono text-base font-black text-foreground tracking-wider">{activeGeneratedVoucher.code}</p>
                </div>

                <div className="text-xs border-t border-border/60 pt-2 space-y-1">
                  <p className="font-bold text-foreground">{activeGeneratedVoucher.prizeName}</p>
                  <p className="text-[11px] text-muted-foreground">{activeGeneratedVoucher.sponsor} — {activeGeneratedVoucher.location}</p>
                  <p className="text-[10px] text-emerald-600 font-semibold">Válido: {activeGeneratedVoucher.expiryDate}</p>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                {activeGeneratedVoucher.instructions}
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if (activeGeneratedVoucher) {
                  navigator.clipboard.writeText(activeGeneratedVoucher.code);
                  toast.success("Código copiado.");
                }
              }}
              className="rounded-xl text-xs gap-1"
            >
              <Copy className="h-3 w-3" /> Copiar Código
            </Button>
            <Button 
              size="sm" 
              onClick={() => {
                toast.success("Voucher guardado en 'Mis Vouchers Canjeados'.");
                setActiveGeneratedVoucher(null);
                setActiveTab("my-vouchers");
              }}
              className="rounded-xl text-xs font-bold"
            >
              Entendido y Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Envío Postal para Productos Físicos */}
      <Dialog open={!!selectedPhysicalPrize} onOpenChange={(open) => !open && setSelectedPhysicalPrize(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Truck className="h-5 w-5 text-primary" /> Dirección de Despacho Postal
            </DialogTitle>
            <DialogDescription className="text-xs">
              Ingresa tus datos para coordinar el envío certificado sin costo de{" "}
              <strong className="text-foreground">{selectedPhysicalPrize?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <Label htmlFor="rec-name" className="text-xs font-semibold">Nombre Completo de Quien Recibe</Label>
              <Input
                id="rec-name"
                placeholder="Ej: Laura Pérez Rosario"
                value={shippingForm.recipientName}
                onChange={(e) => setShippingForm(prev => ({ ...prev, recipientName: e.target.value }))}
                className="text-xs rounded-xl mt-1 h-9 bg-card border-border"
              />
            </div>

            <div>
              <Label htmlFor="rec-phone" className="text-xs font-semibold">Teléfono / WhatsApp de Contacto</Label>
              <Input
                id="rec-phone"
                placeholder="Ej: (809) 555-0199"
                value={shippingForm.recipientPhone}
                onChange={(e) => setShippingForm(prev => ({ ...prev, recipientPhone: e.target.value }))}
                className="text-xs rounded-xl mt-1 h-9 bg-card border-border"
              />
            </div>

            <div>
              <Label htmlFor="rec-address" className="text-xs font-semibold">Dirección de Entrega Exacta</Label>
              <Input
                id="rec-address"
                placeholder="Calle, Número, Edificio, Apartamento..."
                value={shippingForm.shippingAddress}
                onChange={(e) => setShippingForm(prev => ({ ...prev, shippingAddress: e.target.value }))}
                className="text-xs rounded-xl mt-1 h-9 bg-card border-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="rec-city" className="text-xs font-semibold">Ciudad / Sector</Label>
                <Input
                  id="rec-city"
                  placeholder="Ej: Santo Domingo Este"
                  value={shippingForm.city}
                  onChange={(e) => setShippingForm(prev => ({ ...prev, city: e.target.value }))}
                  className="text-xs rounded-xl mt-1 h-9 bg-card border-border"
                />
              </div>
              <div>
                <Label htmlFor="rec-notes" className="text-xs font-semibold">Referencia de Entrega</Label>
                <Input
                  id="rec-notes"
                  placeholder="Ej: Frente al parque"
                  value={shippingForm.notes}
                  onChange={(e) => setShippingForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="text-xs rounded-xl mt-1 h-9 bg-card border-border"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setSelectedPhysicalPrize(null)} className="rounded-xl text-xs">
              Cancelar
            </Button>
            <Button
              size="sm"
              disabled={
                submittingShipment ||
                !shippingForm.recipientName.trim() ||
                !shippingForm.recipientPhone.trim() ||
                !shippingForm.shippingAddress.trim()
              }
              onClick={async () => {
                if (!selectedPhysicalPrize) return;
                setSubmittingShipment(true);
                try {
                  await redeemPrize(selectedPhysicalPrize.id);
                  toast.success(`📦 ¡Despacho programado! Envío coordinado a: ${shippingForm.shippingAddress}`);
                  setSelectedPhysicalPrize(null);
                } catch (err) {
                  toast.error("Error al procesar el despacho.");
                } finally {
                  setSubmittingShipment(false);
                }
              }}
              className="rounded-xl text-xs font-bold"
            >
              {submittingShipment ? "Procesando..." : `Confirmar y Canjear (${selectedPhysicalPrize?.coin_cost} monedas)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: Detalle Completo de Recompensa */}
      <Dialog open={!!selectedDetailPrize} onOpenChange={(open) => !open && setSelectedDetailPrize(null)}>
        <DialogContent className="sm:max-w-lg rounded-3xl overflow-hidden p-0">
          {selectedDetailPrize && (
            <div>
              <div className="relative aspect-[16/9] w-full bg-muted">
                <img 
                  src={selectedDetailPrize.image_url} 
                  alt={selectedDetailPrize.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-6 right-6 text-white">
                  <Badge className="bg-primary text-primary-foreground text-[10px] mb-1">
                    {selectedDetailPrize.sponsor}
                  </Badge>
                  <h3 className="font-display font-bold text-lg leading-tight">{selectedDetailPrize.name}</h3>
                  <p className="text-xs opacity-90 flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3 text-primary" /> {selectedDetailPrize.location}
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <p className="text-muted-foreground leading-relaxed">
                  {selectedDetailPrize.description}
                </p>

                <div className="space-y-2">
                  <h5 className="font-bold text-foreground">¿Qué incluye este beneficio?</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {selectedDetailPrize.includes.map((inc, i) => (
                      <div key={i} className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-muted/30 p-3 rounded-2xl border border-border text-center">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Costo</span>
                    <p className="font-black text-amber-500 text-sm mt-0.5">{selectedDetailPrize.coin_cost} monedas</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Valor Real</span>
                    <p className="font-bold text-foreground text-sm mt-0.5">RD$ {selectedDetailPrize.estimated_value_dop.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Vigencia</span>
                    <p className="font-bold text-foreground text-sm mt-0.5">{selectedDetailPrize.validity_days} días</p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedDetailPrize(null)} className="rounded-xl text-xs">
                    Cerrar
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => {
                      const prize = selectedDetailPrize;
                      setSelectedDetailPrize(null);
                      if (prize.prize_type === "product") {
                        setSelectedPhysicalPrize(prize);
                      } else {
                        handleRedeemDigitalPrize(prize);
                      }
                    }}
                    className="rounded-xl text-xs font-bold"
                  >
                    Proceder al Canje
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL 4: Subasta VIP con Monedas */}
      <VipAuctionModal
        open={auctionModalOpen}
        onOpenChange={setAuctionModalOpen}
        userCoins={userGamification?.coins || 280}
      />

      {/* MODAL 5: 14 Formas Oficiales de Ganar Puntos & Monedas */}
      <ComoGanarPuntosModal
        open={puntosModalOpen}
        onOpenChange={setPuntosModalOpen}
      />
    </PageTransition>
  );
}
