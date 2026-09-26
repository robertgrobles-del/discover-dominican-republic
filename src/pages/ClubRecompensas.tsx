import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Gift, Crown, Target, Sparkles, Zap,
  CheckCircle, Share2, Ticket, Building,
  ShieldCheck, TrendingUp, Compass, ChevronRight
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { PanoramaAd } from "@/components/promo";
import { VipAuctionModal } from "@/components/gamification/VipAuctionModal";
import { ComoGanarPuntosModal } from "@/components/gamificacion/ComoGanarPuntosModal";
import { ComoGanarPuntosSection } from "@/components/gamificacion/ComoGanarPuntosSection";
import { useGamification } from "@/hooks/useGamification";
import { toast } from "sonner";

import {
  initialRewards,
  mockInitialVouchers,
  type CatalogReward,
  type RedeemedVoucher,
} from "@/data/rewardsData";
import { RewardsCatalogTab } from "@/components/rewards/RewardsCatalogTab";
import { PartnerSponsorTab } from "@/components/rewards/PartnerSponsorTab";
import { UserVouchersTab } from "@/components/rewards/UserVouchersTab";
import { ExplorerLevelsRoadmapTab } from "@/components/rewards/ExplorerLevelsRoadmapTab";
import { RewardDetailDialog } from "@/components/rewards/RewardDetailDialog";
import { ShippingAddressDialog } from "@/components/rewards/ShippingAddressDialog";
import { VoucherQRModal } from "@/components/rewards/VoucherQRModal";

export default function ClubRecompensas() {
  const {
    userGamification, levels, referralCode,
    getCurrentLevel, getNextLevel, getXpProgress, redeemPrize
  } = useGamification();

  const [activeTab, setActiveTab] = useState<"catalog" | "my-vouchers" | "levels" | "how-it-works" | "partners">("catalog");
  const [rewardsList, setRewardsList] = useState<CatalogReward[]>(initialRewards);
  const [myVouchers, setMyVouchers] = useState<RedeemedVoucher[]>(mockInitialVouchers);

  // Modals state
  const [selectedDetailPrize, setSelectedDetailPrize] = useState<CatalogReward | null>(null);
  const [selectedPhysicalPrize, setSelectedPhysicalPrize] = useState<CatalogReward | null>(null);
  const [activeGeneratedVoucher, setActiveGeneratedVoucher] = useState<RedeemedVoucher | null>(null);
  const [auctionModalOpen, setAuctionModalOpen] = useState(false);
  const [puntosModalOpen, setPuntosModalOpen] = useState(false);

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const xpProgress = getXpProgress();

  const copyReferralCode = () => {
    const code = referralCode || "RD-EXPLORER";
    navigator.clipboard.writeText(`https://descubrerd.com/registro?ref=${code}`);
    toast.success("¡Enlace de referido copiado! Compártelo con amigos para ganar +50 monedas.");
  };

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

    setMyVouchers((prev) => [newVoucher, ...prev]);
    setActiveGeneratedVoucher(newVoucher);
    redeemPrize(prize.id);
    toast.success(`🎉 ¡Recompensa canjeada con éxito! Se ha generado tu Voucher ${newCode}.`);
  };

  const handleConfirmShipping = async (
    prize: CatalogReward,
    shippingData: {
      recipientName: string;
      recipientPhone: string;
      shippingAddress: string;
      city: string;
      notes: string;
    }
  ) => {
    await redeemPrize(prize.id);
    toast.success(`📦 ¡Despacho programado! Envío coordinado a: ${shippingData.shippingAddress}`);
  };

  const handleAddReward = (newReward: CatalogReward) => {
    setRewardsList((prev) => [newReward, ...prev]);
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
                  <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
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
                  <Gift className="h-4 w-4" /> Catálogo de Premios ({rewardsList.length})
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
            <TabsContent value="catalog">
              <RewardsCatalogTab
                rewards={rewardsList}
                userCoins={userGamification?.coins || 280}
                userLevel={userGamification?.current_level || 1}
                onPreviewPrize={(p) => setSelectedDetailPrize(p)}
                onRedeemPrize={(p) => {
                  if (p.prize_type === "product") {
                    setSelectedPhysicalPrize(p);
                  } else {
                    handleRedeemDigitalPrize(p);
                  }
                }}
              />
            </TabsContent>

            {/* TAB 2: PORTAL EMPRESAS & REGISTRO DE RECOMPENSAS */}
            <TabsContent value="partners">
              <PartnerSponsorTab
                rewards={rewardsList}
                myVouchers={myVouchers}
                onAddReward={handleAddReward}
                onGoToCatalog={() => setActiveTab("catalog")}
              />
            </TabsContent>

            {/* TAB 3: MY VOUCHERS */}
            <TabsContent value="my-vouchers">
              <UserVouchersTab
                vouchers={myVouchers}
                onOpenQR={(v) => setActiveGeneratedVoucher(v)}
                onExploreCatalog={() => setActiveTab("catalog")}
              />
            </TabsContent>

            {/* TAB 4: LEVELS & PRIVILEGES */}
            <TabsContent value="levels">
              <ExplorerLevelsRoadmapTab
                levels={levels}
                currentLevelNumber={userGamification?.current_level || 1}
                userTotalXp={userGamification?.total_xp || 640}
              />
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

      {/* MODALS */}
      <VoucherQRModal
        voucher={activeGeneratedVoucher}
        onClose={() => setActiveGeneratedVoucher(null)}
        onGoToVouchers={() => setActiveTab("my-vouchers")}
      />

      <ShippingAddressDialog
        prize={selectedPhysicalPrize}
        onClose={() => setSelectedPhysicalPrize(null)}
        onConfirm={handleConfirmShipping}
      />

      <RewardDetailDialog
        prize={selectedDetailPrize}
        onClose={() => setSelectedDetailPrize(null)}
        onRedeem={(prize) => {
          if (prize.prize_type === "product") {
            setSelectedPhysicalPrize(prize);
          } else {
            handleRedeemDigitalPrize(prize);
          }
        }}
      />

      <VipAuctionModal
        open={auctionModalOpen}
        onOpenChange={setAuctionModalOpen}
        userCoins={userGamification?.coins || 280}
      />

      <ComoGanarPuntosModal
        open={puntosModalOpen}
        onOpenChange={setPuntosModalOpen}
      />
    </PageTransition>
  );
}
