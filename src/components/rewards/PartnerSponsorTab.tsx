import React, { useState } from "react";
import {
  ShieldCheck, CheckCheck, RefreshCw, PlusCircle, ArrowRight,
  Sparkles, Gift, Scan, AlertTriangle, CheckCircle2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { PartnerEmbedBadge } from "@/components/gamification/PartnerEmbedBadge";
import { rewardsFaqs, type CatalogReward, type RedeemedVoucher } from "@/data/rewardsData";

interface PartnerSponsorTabProps {
  rewards: CatalogReward[];
  myVouchers: RedeemedVoucher[];
  onAddReward: (newReward: CatalogReward) => void;
  onGoToCatalog: () => void;
}

export const PartnerSponsorTab: React.FC<PartnerSponsorTabProps> = ({
  rewards,
  myVouchers,
  onAddReward,
  onGoToCatalog,
}) => {
  const [partnerStep, setPartnerStep] = useState<"verify" | "create-reward" | "ads-perks" | "dashboard">("verify");
  const [companyVerified, setCompanyVerified] = useState(false);
  const [verifyingCompany, setVerifyingCompany] = useState(false);
  const [verificationType, setVerificationType] = useState<"corporate_otp" | "pyme_manual">("corporate_otp");
  const [otpCode, setOtpCode] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [pymeDocUploaded, setPymeDocUploaded] = useState(false);

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
    website: "https://bahiadorada.do",
  });

  const [adPerksForm, setAdPerksForm] = useState({
    wantsAds: true,
    adFormat: "billboard_home",
    userPerkTitle: "Cóctel de Bienvenida de Ron Añejo Dominicano",
    userPerkDesc: "Cortesía para todo viajero con reserva a través de Descubre RD",
    influencerPerkTitle: "Estadía All-Inclusive de 2 Noches / 3 Días",
    influencerPerkDesc: "Disponible para creadores de contenido de viajes con más de 20k seguidores",
    raffleTitle: "Fin de Semana para 2 en Habitación Frente al Mar",
    raffleDesc: "Sorteo mensual para la comunidad y seguidores del portal",
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
    bookingInstructions: "Reservar con 48 horas de antelación vía WhatsApp al (809) 586-2244.",
  });

  // Partner Voucher Validation Tool State
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [voucherValidationResult, setVoucherValidationResult] = useState<any>(null);

  const handleSendOtp = () => {
    if (!companyForm.email.includes("@")) {
      toast.error("Ingresa un correo institucional válido.");
      return;
    }
    setIsOtpSent(true);
    toast.success(`Código de verificación OTP enviado a ${companyForm.email}. (Código simulado: 849201)`);
  };

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

  const handlePublishReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRewardForm.name.trim() || !newRewardForm.description.trim()) {
      toast.error("Por favor ingresa el título y descripción de la recompensa.");
      return;
    }

    const includesArray = newRewardForm.includesText
      .split("\n")
      .map((s) => s.trim())
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
      isPartnerCustom: true,
    };

    onAddReward(createdReward);
    setPartnerStep("ads-perks");
    toast.success(`🎉 ¡Recompensa "${createdReward.name}" configurada! Puedes gestionar publicidad o regalos ahora.`);
  };

  const handleValidateVoucherCode = () => {
    const code = voucherCodeInput.trim().toUpperCase();
    if (!code) {
      toast.error("Ingresa un código de voucher.");
      return;
    }

    const found = myVouchers.find((v) => v.code.toUpperCase() === code);
    if (found) {
      setVoucherValidationResult({
        isValid: true,
        voucher: found,
        message: "✓ Voucher Auténtico y Válido para Canje",
      });
      toast.success("Voucher verificado correctamente.");
    } else {
      setVoucherValidationResult({
        isValid: false,
        message: "❌ Código no encontrado o ya utilizado anteriormente.",
      });
      toast.error("Código no válido.");
    }
  };

  return (
    <div className="space-y-8">
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
                partnerStep === "verify"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
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
                partnerStep === "create-reward"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              2. Publicar Recompensa
            </button>
            <button
              onClick={() => setPartnerStep("dashboard")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                partnerStep === "dashboard"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
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
                <Label htmlFor="rnc-input" className="text-xs font-bold">
                  RNC (Registro Nacional de Contribuyentes)
                </Label>
                <Input
                  id="rnc-input"
                  placeholder="Ej: 1-31-88492-3"
                  value={companyForm.rnc}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({ ...prev, rnc: e.target.value }))
                  }
                  className="mt-1 text-xs rounded-xl h-9 bg-card border-border"
                />
                <span className="text-[10px] text-muted-foreground">
                  Formato de 9 u 11 dígitos con guiones
                </span>
              </div>

              <div>
                <Label htmlFor="rnt-input" className="text-xs font-bold">
                  Registro Nacional Turístico (RNT / MITUR)
                </Label>
                <Input
                  id="rnt-input"
                  placeholder="Ej: RNT-MITUR-2025-0418"
                  value={companyForm.rntMitur}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({ ...prev, rntMitur: e.target.value }))
                  }
                  className="mt-1 text-xs rounded-xl h-9 bg-card border-border"
                />
                <span className="text-[10px] text-muted-foreground">
                  Licencia de operación emitida por el Ministerio de Turismo
                </span>
              </div>

              <div>
                <Label htmlFor="legal-name" className="text-xs font-bold">
                  Razón Social Registrada
                </Label>
                <Input
                  id="legal-name"
                  placeholder="Ej: Inversiones Turísticas del Caribe SRL"
                  value={companyForm.legalName}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({ ...prev, legalName: e.target.value }))
                  }
                  className="mt-1 text-xs rounded-xl h-9 bg-card border-border"
                />
              </div>

              <div>
                <Label htmlFor="trade-name" className="text-xs font-bold">
                  Nombre Comercial / Marca
                </Label>
                <Input
                  id="trade-name"
                  placeholder="Ej: Resort & Spa Bahía Dorada"
                  value={companyForm.tradeName}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({ ...prev, tradeName: e.target.value }))
                  }
                  className="mt-1 text-xs rounded-xl h-9 bg-card border-border"
                />
              </div>

              <div>
                <Label htmlFor="btype" className="text-xs font-bold">
                  Categoría de Negocio
                </Label>
                <select
                  id="btype"
                  value={companyForm.businessType}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({ ...prev, businessType: e.target.value }))
                  }
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
                <Label htmlFor="province" className="text-xs font-bold">
                  Provincia Principal
                </Label>
                <Input
                  id="province"
                  placeholder="Ej: Puerto Plata, Samaná, La Altagracia..."
                  value={companyForm.province}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({ ...prev, province: e.target.value }))
                  }
                  className="mt-1 text-xs rounded-xl h-9 bg-card border-border"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-xs font-bold">
                  Correo Institucional / Corporativo
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="email"
                    placeholder="Ej: reservas@empresa.do"
                    value={companyForm.email}
                    onChange={(e) =>
                      setCompanyForm((prev) => ({ ...prev, email: e.target.value }))
                    }
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
                  <Label htmlFor="otp-input" className="text-xs font-bold">
                    Código OTP de 6 Dígitos
                  </Label>
                  <Input
                    id="otp-input"
                    placeholder="Ingresa los 6 dígitos recibidos (Ej: 849201)"
                    value={otpCode}
                    maxLength={6}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="mt-1 text-xs rounded-xl h-9 bg-card border-border font-mono font-bold tracking-widest text-center"
                  />
                  <span className="text-[10px] text-muted-foreground">
                    Validación instantánea sin esperas
                  </span>
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
                      {pymeDocUploaded
                        ? "✓ Registro_Mercantil_2026.pdf adjunto"
                        : "📎 Adjuntar RNC o Registro Mercantil"}
                    </button>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Revisión manual aprobada en &lt; 24h
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-start gap-3 text-xs text-muted-foreground">
              <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <p>
                El sistema valida en tiempo real la concordancia del <strong>RNC</strong> y la{" "}
                <strong>Licencia RNT</strong>. Una vez completado, recibirás el sello de{" "}
                <em>Empresa Verificada</em> y podrás publicar recompensas instantáneamente.
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
                <Label htmlFor="rew-name" className="text-xs font-bold">
                  Título de la Recompensa Turística *
                </Label>
                <Input
                  id="rew-name"
                  placeholder="Ej: Day Pass 2x1 con Almuerzo Buffet & Kayaks en Playa Dorada"
                  value={newRewardForm.name}
                  onChange={(e) => setNewRewardForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="mt-1 text-xs rounded-xl h-9 bg-card border-border"
                />
              </div>

              <div>
                <Label htmlFor="rew-category" className="text-xs font-bold">
                  Categoría del Catálogo
                </Label>
                <select
                  id="rew-category"
                  value={newRewardForm.category}
                  onChange={(e: any) =>
                    setNewRewardForm((prev) => ({ ...prev, category: e.target.value }))
                  }
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
                <Label htmlFor="rew-location" className="text-xs font-bold">
                  Ubicación de la Experiencia
                </Label>
                <Input
                  id="rew-location"
                  placeholder="Ej: Puerto Plata / Punta Cana / Samaná"
                  value={newRewardForm.location}
                  onChange={(e) =>
                    setNewRewardForm((prev) => ({ ...prev, location: e.target.value }))
                  }
                  className="mt-1 text-xs rounded-xl h-9 bg-card border-border"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="rew-desc" className="text-xs font-bold">
                  Descripción Atractiva para el Viajero *
                </Label>
                <Textarea
                  id="rew-desc"
                  rows={3}
                  placeholder="Describe la experiencia, qué vivirán los turistas, vistas destacadas, ambiente y amenidades disponibles..."
                  value={newRewardForm.description}
                  onChange={(e) =>
                    setNewRewardForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  required
                  className="mt-1 text-xs rounded-xl bg-card border-border"
                />
              </div>

              <div>
                <Label htmlFor="rew-coins" className="text-xs font-bold">
                  Costo en Monedas para el Turista
                </Label>
                <Input
                  id="rew-coins"
                  type="number"
                  placeholder="Ej: 280"
                  value={newRewardForm.coinCost}
                  onChange={(e) =>
                    setNewRewardForm((prev) => ({ ...prev, coinCost: Number(e.target.value) }))
                  }
                  className="mt-1 text-xs rounded-xl h-9 bg-card border-border font-bold text-amber-500"
                />
                <span className="text-[10px] text-muted-foreground">
                  Recomendado entre 150 y 500 monedas
                </span>
              </div>

              <div>
                <Label htmlFor="rew-val-dop" className="text-xs font-bold">
                  Valor Comercial Estimado (RD$)
                </Label>
                <Input
                  id="rew-val-dop"
                  type="number"
                  placeholder="Ej: 4500"
                  value={newRewardForm.estimatedValueDop}
                  onChange={(e) => {
                    const dop = Number(e.target.value);
                    setNewRewardForm((prev) => ({
                      ...prev,
                      estimatedValueDop: dop,
                      estimatedValueUsd: Math.round(dop / 60),
                    }));
                  }}
                  className="mt-1 text-xs rounded-xl h-9 bg-card border-border"
                />
                <span className="text-[10px] text-muted-foreground">
                  Equivalente a aprox. ${newRewardForm.estimatedValueUsd} USD
                </span>
              </div>

              <div>
                <Label htmlFor="rew-qty" className="text-xs font-bold">
                  Cupos / Vouchers Disponibles
                </Label>
                <Input
                  id="rew-qty"
                  type="number"
                  placeholder="Ej: 20"
                  value={newRewardForm.quantityAvailable}
                  onChange={(e) =>
                    setNewRewardForm((prev) => ({
                      ...prev,
                      quantityAvailable: Number(e.target.value),
                    }))
                  }
                  className="mt-1 text-xs rounded-xl h-9 bg-card border-border"
                />
              </div>

              <div>
                <Label htmlFor="rew-level" className="text-xs font-bold">
                  Nivel Mínimo Requerido
                </Label>
                <select
                  id="rew-level"
                  value={newRewardForm.minLevel}
                  onChange={(e) =>
                    setNewRewardForm((prev) => ({ ...prev, minLevel: Number(e.target.value) }))
                  }
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
                <Label htmlFor="rew-includes" className="text-xs font-bold">
                  ¿Qué incluye? (Un elemento por línea)
                </Label>
                <Textarea
                  id="rew-includes"
                  rows={3}
                  value={newRewardForm.includesText}
                  onChange={(e) =>
                    setNewRewardForm((prev) => ({ ...prev, includesText: e.target.value }))
                  }
                  className="mt-1 text-xs rounded-xl bg-card border-border font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="rew-img" className="text-xs font-bold">
                  URL de Fotografía de la Experiencia
                </Label>
                <Input
                  id="rew-img"
                  placeholder="https://images.unsplash.com/..."
                  value={newRewardForm.imageUrl}
                  onChange={(e) =>
                    setNewRewardForm((prev) => ({ ...prev, imageUrl: e.target.value }))
                  }
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
                    {
                      id: "billboard_home",
                      name: "Billboard de Portada (Hero Home)",
                      desc: "Máxima visibilidad nacional para viajeros internacionales",
                    },
                    {
                      id: "infeed_gastronomy",
                      name: "Banner In-Feed Guía Gastronómica",
                      desc: "Segmentado por provincia y tipo de cocina",
                    },
                    {
                      id: "newsletter_vip",
                      name: "Mención en Newsletter Semanal",
                      desc: "Llega a más de 45,000 suscriptores activos",
                    },
                  ].map((ad) => (
                    <label
                      key={ad.id}
                      className={`p-2.5 rounded-xl border flex items-start gap-2 cursor-pointer transition-all ${
                        adPerksForm.adFormat === ad.id
                          ? "bg-primary/10 border-primary"
                          : "bg-muted/30 border-border/60"
                      }`}
                    >
                      <input
                        type="radio"
                        name="adFormat"
                        checked={adPerksForm.adFormat === ad.id}
                        onChange={() =>
                          setAdPerksForm((prev) => ({ ...prev, adFormat: ad.id }))
                        }
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
                  <Label className="text-[11px] font-bold">
                    1. Regalo / Cortesía para Usuarios Descubre RD
                  </Label>
                  <Input
                    value={adPerksForm.userPerkTitle}
                    onChange={(e) =>
                      setAdPerksForm((prev) => ({ ...prev, userPerkTitle: e.target.value }))
                    }
                    className="mt-1 text-xs rounded-xl h-8 bg-background border-border"
                  />
                </div>

                <div>
                  <Label className="text-[11px] font-bold">
                    2. Degustación / Estadía para Creadores & Influencers
                  </Label>
                  <Input
                    value={adPerksForm.influencerPerkTitle}
                    onChange={(e) =>
                      setAdPerksForm((prev) => ({
                        ...prev,
                        influencerPerkTitle: e.target.value,
                      }))
                    }
                    className="mt-1 text-xs rounded-xl h-8 bg-background border-border"
                  />
                </div>

                <div>
                  <Label className="text-[11px] font-bold">
                    3. Sorteo / Rifa entre Seguidores
                  </Label>
                  <Input
                    value={adPerksForm.raffleTitle}
                    onChange={(e) =>
                      setAdPerksForm((prev) => ({ ...prev, raffleTitle: e.target.value }))
                    }
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

        {/* STEP 4: PARTNER DASHBOARD & VOUCHER VALIDATOR */}
        {partnerStep === "dashboard" && (
          <div className="space-y-6">
            {/* Metrics Summary */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-background border border-border space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">
                  Recompensas Activas
                </span>
                <p className="text-2xl font-black text-foreground">
                  {rewards.filter((r) => r.isPartnerCustom).length + 1}
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold">
                  Visibles en todo el país
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-background border border-border space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">
                  Vouchers Canjeados por Turistas
                </span>
                <p className="text-2xl font-black text-amber-500">14</p>
                <p className="text-[10px] text-muted-foreground">Turistas verificados</p>
              </div>

              <div className="p-5 rounded-3xl bg-background border border-border space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">
                  Reseñas y Menciones
                </span>
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
                <div
                  className={`p-4 rounded-2xl border text-xs space-y-2 ${
                    voucherValidationResult.isValid
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                      : "bg-destructive/10 border-destructive/30 text-destructive"
                  }`}
                >
                  <p className="font-bold flex items-center gap-1.5 text-sm">
                    {voucherValidationResult.isValid ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    {voucherValidationResult.message}
                  </p>
                  {voucherValidationResult.voucher && (
                    <div className="bg-background/80 p-3 rounded-xl border border-border text-foreground space-y-1">
                      <p>
                        <strong>Beneficio:</strong> {voucherValidationResult.voucher.prizeName}
                      </p>
                      <p>
                        <strong>Establecimiento:</strong> {voucherValidationResult.voucher.sponsor}
                      </p>
                      <p>
                        <strong>Estado:</strong>{" "}
                        <span className="text-emerald-600 font-bold">Activo para consumo</span>
                      </p>
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

              <Button variant="outline" onClick={onGoToCatalog} className="rounded-xl text-xs">
                Ver Catálogo General
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Partner FAQs */}
      <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
        <h3 className="font-display text-xl font-bold text-foreground">
          Preguntas Frecuentes para Aliados & Hoteles
        </h3>
        <Accordion type="single" collapsible className="w-full">
          {rewardsFaqs.map((faq, i) => (
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
    </div>
  );
};
