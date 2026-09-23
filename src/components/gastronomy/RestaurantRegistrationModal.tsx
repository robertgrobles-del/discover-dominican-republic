import { useState } from "react";
import { 
  Utensils, FileText, Upload, Plus, Trash2, CheckCircle2, 
  ShieldCheck, AlertTriangle, Building, Sparkles, Gift, 
  Crown, Ticket, Megaphone, Check, RefreshCw, Eye, MapPin, DollarSign
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export interface MenuItem {
  id: string;
  name: string;
  category: "Entradas" | "Platos Fuertes" | "Postres" | "Bebidas & Coctelería" | "Especialidades";
  description: string;
  priceDop: number;
  priceUsd: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isChefSpecial?: boolean;
  imageUrl?: string;
}

interface RestaurantRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestaurantRegistered?: (data: any) => void;
}

export function RestaurantRegistrationModal({
  open,
  onOpenChange,
  onRestaurantRegistered
}: RestaurantRegistrationModalProps) {
  // Registration step
  const [currentStep, setCurrentStep] = useState<"info" | "verification" | "menu" | "advertising" | "complete">("info");

  // Basic Info Form
  const [basicForm, setBasicForm] = useState({
    name: "Restaurante El Conuco Colonial",
    rnc: "1-31-99882-4",
    cuisineType: "Gastronomía Criolla Fusión",
    province: "Santo Domingo",
    address: "Calle Las Damas #12, Zona Colonial",
    phone: "(809) 682-4411",
    email: "contacto@elconucocolonial.do", // default corporate
    website: "https://elconucocolonial.do"
  });

  // Verification State: Corporate OTP vs Pyme Manual
  const [isCorporateEmail, setIsCorporateEmail] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isManualReviewPending, setIsManualReviewPending] = useState(false);
  const [pymeDocumentName, setPymeDocumentName] = useState("");

  // Menu Mode: PDF vs Detailed Items
  const [menuMode, setMenuMode] = useState<"pdf" | "items">("items");
  const [menuPdfUrl, setMenuPdfUrl] = useState("https://descubrerd.com/docs/menu-elconuco-2026.pdf");
  const [menuPdfFileName, setMenuPdfFileName] = useState("menu-elconuco-2026.pdf");

  // Detailed Menu Items State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: "item-1",
      name: "Chivo Liniero Guisado al Ron Dominicano",
      category: "Platos Fuertes",
      description: "Chivo tierno sazonado con orégano de Montecristi, ají gustoso y reducción de ron añejo, acompañado de tostones.",
      priceDop: 750,
      priceUsd: 12.5,
      isChefSpecial: true,
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80"
    },
    {
      id: "item-2",
      name: "Ceviche de Mero & Coco de Samaná",
      category: "Entradas",
      description: "Cubos de mero fresco marinados en cítricos, leche de coco fresca, cilantro y chips de plátano verde.",
      priceDop: 480,
      priceUsd: 8.0,
      isGlutenFree: true,
      imageUrl: "https://images.unsplash.com/photo-1535400255456-984241443b29?w=500&auto=format&fit=crop&q=80"
    },
    {
      id: "item-3",
      name: "Majarete Brûlée con Canela Criolla",
      category: "Postres",
      description: "Dulce tradicional de maíz tierno caramelizado con costra de azúcar morena y canela de la cordillera.",
      priceDop: 320,
      priceUsd: 5.5,
      isVegetarian: true,
      isChefSpecial: true,
      imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=80"
    }
  ]);

  // New Item Input State
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: "",
    category: "Platos Fuertes",
    description: "",
    priceDop: 500,
    priceUsd: 8.5,
    isChefSpecial: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false
  });

  // Advertising, User Gifts, Influencer perks & Raffles Form
  const [advertisingForm, setAdvertisingForm] = useState({
    wantsAds: true,
    adFormat: "billboard", // billboard, infeed, newsletter
    userGiftEnabled: true,
    userGiftType: "Aperitivo de bienvenida o Cóctel de autor de cortesía al mostrar Pasaporte Digital",
    influencerEnabled: true,
    influencerPerk: "Cena de degustación para 2 personas a cambio de 1 Reel y 3 Stories",
    raffleEnabled: true,
    rafflePrize: "Bono de consumo por RD$ 5,000 para sortear entre los exploradores de la comunidad"
  });

  // Terms & Newsletter Agreement
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true);

  // Detect corporate vs generic email
  const handleEmailChange = (email: string) => {
    setBasicForm(prev => ({ ...prev, email }));
    const genericDomains = ["gmail.com", "hotmail.com", "yahoo.com", "outlook.com", "live.com", "icloud.com"];
    const domain = email.split("@")[1]?.toLowerCase() || "";
    if (domain && !genericDomains.includes(domain)) {
      setIsCorporateEmail(true);
    } else {
      setIsCorporateEmail(false);
    }
  };

  const handleSendOtp = () => {
    setOtpSent(true);
    toast.success(`Código de verificación OTP enviado a ${basicForm.email}. (Código de prueba: 774920)`);
  };

  const handleVerifyOtp = () => {
    setVerifyingOtp(true);
    setTimeout(() => {
      setVerifyingOtp(false);
      if (otpCode.trim() === "774920" || otpCode.trim().length === 6) {
        setIsVerified(true);
        toast.success("✓ ¡Empresa y correo institucional validados con éxito!");
        setCurrentStep("menu");
      } else {
        toast.error("Código OTP incorrecto. Intenta con 774920.");
      }
    }, 800);
  };

  const handlePymeManualSubmit = () => {
    if (!pymeDocumentName) {
      setPymeDocumentName("comprobante_rnc_registro_mercantil.pdf");
    }
    setIsManualReviewPending(true);
    setIsVerified(false);
    toast.info("📄 Documentos de Pyme cargados. Tu restaurante estará en 'Revisión Manual' por el equipo de MITUR (24-48h).");
    setCurrentStep("menu");
  };

  const handleAddMenuItem = () => {
    if (!newItem.name?.trim()) {
      toast.error("Por favor ingresa el nombre del plato.");
      return;
    }
    const item: MenuItem = {
      id: `item-${Date.now()}`,
      name: newItem.name,
      category: newItem.category || "Platos Fuertes",
      description: newItem.description || "",
      priceDop: Number(newItem.priceDop) || 0,
      priceUsd: Number(newItem.priceUsd) || 0,
      isVegetarian: newItem.isVegetarian,
      isVegan: newItem.isVegan,
      isGlutenFree: newItem.isGlutenFree,
      isChefSpecial: newItem.isChefSpecial,
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80"
    };
    setMenuItems(prev => [...prev, item]);
    setNewItem({
      name: "",
      category: "Platos Fuertes",
      description: "",
      priceDop: 500,
      priceUsd: 8.5,
      isChefSpecial: false,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false
    });
    toast.success(`Plato "${item.name}" agregado al menú.`);
  };

  const handleRemoveMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };

  const handleFinalSubmit = () => {
    if (!acceptTerms) {
      toast.error("Debes aceptar los Términos y Condiciones del Directorio Gastronómico.");
      return;
    }

    const restaurantData = {
      ...basicForm,
      isVerified,
      isManualReviewPending,
      menuMode,
      menuPdfUrl: menuMode === "pdf" ? menuPdfUrl : null,
      menuItems: menuMode === "items" ? menuItems : [],
      advertising: advertisingForm,
      acceptTerms,
      subscribeNewsletter
    };

    if (onRestaurantRegistered) {
      onRestaurantRegistered(restaurantData);
    }

    toast.success(`🎉 ¡Restaurante "${basicForm.name}" registrado con éxito en la Guía Gastronómica de RD!`);
    setCurrentStep("complete");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-3xl rounded-3xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Utensils className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="font-display font-bold text-lg text-foreground">
                  Alta de Restaurante & Gestión de Menú
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Portal de Establecimientos Gastronómicos • Descubre República Dominicana
                </DialogDescription>
              </div>
            </div>

            {isVerified && (
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                ✓ Verificado por OTP
              </Badge>
            )}
            {isManualReviewPending && (
              <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-bold">
                ⏳ Pyme en Revisión Manual
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Wizard Steps Bar */}
        <div className="flex items-center justify-between border-y border-border/60 py-2.5 my-2 text-xs font-semibold">
          <button
            onClick={() => setCurrentStep("info")}
            className={`flex items-center gap-1.5 ${currentStep === "info" ? "text-primary font-bold" : "text-muted-foreground"}`}
          >
            <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px]">1</span> Datos
          </button>
          <span className="text-muted-foreground/40">→</span>
          <button
            onClick={() => setCurrentStep("verification")}
            className={`flex items-center gap-1.5 ${currentStep === "verification" ? "text-primary font-bold" : "text-muted-foreground"}`}
          >
            <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px]">2</span> Verificación
          </button>
          <span className="text-muted-foreground/40">→</span>
          <button
            onClick={() => setCurrentStep("menu")}
            className={`flex items-center gap-1.5 ${currentStep === "menu" ? "text-primary font-bold" : "text-muted-foreground"}`}
          >
            <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px]">3</span> Menú (PDF/Items)
          </button>
          <span className="text-muted-foreground/40">→</span>
          <button
            onClick={() => setCurrentStep("advertising")}
            className={`flex items-center gap-1.5 ${currentStep === "advertising" ? "text-primary font-bold" : "text-muted-foreground"}`}
          >
            <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px]">4</span> Publicidad & Rifas
          </button>
        </div>

        {/* STEP 1: Basic Information */}
        {currentStep === "info" && (
          <div className="space-y-4 py-2 text-xs">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold">Nombre Comercial del Restaurante *</Label>
                <Input
                  value={basicForm.name}
                  onChange={(e) => setBasicForm(prev => ({ ...prev, name: e.target.value }))}
                  className="text-xs rounded-xl mt-1 h-9 bg-card border-border"
                />
              </div>

              <div>
                <Label className="text-xs font-bold">RNC (Registro Nacional de Contribuyentes) *</Label>
                <Input
                  value={basicForm.rnc}
                  onChange={(e) => setBasicForm(prev => ({ ...prev, rnc: e.target.value }))}
                  className="text-xs rounded-xl mt-1 h-9 bg-card border-border font-mono"
                />
              </div>

              <div>
                <Label className="text-xs font-bold">Tipo de Cocina / Especialidad</Label>
                <Input
                  value={basicForm.cuisineType}
                  onChange={(e) => setBasicForm(prev => ({ ...prev, cuisineType: e.target.value }))}
                  placeholder="Ej: Criolla, Mariscos, Fusión, Internacional..."
                  className="text-xs rounded-xl mt-1 h-9 bg-card border-border"
                />
              </div>

              <div>
                <Label className="text-xs font-bold">Provincia / Destino</Label>
                <Input
                  value={basicForm.province}
                  onChange={(e) => setBasicForm(prev => ({ ...prev, province: e.target.value }))}
                  className="text-xs rounded-xl mt-1 h-9 bg-card border-border"
                />
              </div>

              <div className="md:col-span-2">
                <Label className="text-xs font-bold">Dirección Física Exacta</Label>
                <Input
                  value={basicForm.address}
                  onChange={(e) => setBasicForm(prev => ({ ...prev, address: e.target.value }))}
                  className="text-xs rounded-xl mt-1 h-9 bg-card border-border"
                />
              </div>

              <div>
                <Label className="text-xs font-bold">Correo Electrónico de Contacto *</Label>
                <Input
                  value={basicForm.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className="text-xs rounded-xl mt-1 h-9 bg-card border-border"
                />
                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                  {isCorporateEmail ? "✓ Dominio corporativo detectado (Validación instantánea por OTP)" : "ℹ️ Correo genérico detectado (Pyme: requerirá verificación manual)"}
                </span>
              </div>

              <div>
                <Label className="text-xs font-bold">Teléfono / WhatsApp de Reservas</Label>
                <Input
                  value={basicForm.phone}
                  onChange={(e) => setBasicForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="text-xs rounded-xl mt-1 h-9 bg-card border-border"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border/60">
              <Button onClick={() => setCurrentStep("verification")} className="rounded-xl text-xs font-bold">
                Continuar a Verificación →
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* STEP 2: Verification (Corporate OTP vs Pyme Manual) */}
        {currentStep === "verification" && (
          <div className="space-y-4 py-2 text-xs">
            {isCorporateEmail ? (
              <div className="p-6 rounded-3xl bg-primary/10 border-2 border-primary/30 space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
                  <div>
                    <h4 className="font-display font-bold text-sm text-foreground">
                      Validación Instantánea por Código OTP
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Tu correo <strong className="text-foreground">{basicForm.email}</strong> cuenta con dominio institucional propio.
                    </p>
                  </div>
                </div>

                {!otpSent ? (
                  <div className="space-y-3 pt-2">
                    <p className="text-xs text-muted-foreground">
                      Presiona el botón para recibir un código de seguridad de 6 dígitos en tu bandeja de entrada corporativa.
                    </p>
                    <Button onClick={handleSendOtp} className="rounded-xl text-xs font-bold">
                      Enviar Código OTP a {basicForm.email}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <Label className="text-xs font-bold">Ingresa el Código OTP de 6 dígitos</Label>
                    <div className="flex gap-2 max-w-xs">
                      <Input
                        placeholder="774920"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="text-xs rounded-xl h-10 font-mono font-bold tracking-widest text-center bg-card border-border"
                      />
                      <Button 
                        onClick={handleVerifyOtp}
                        disabled={verifyingOtp || !otpCode.trim()}
                        className="rounded-xl text-xs font-bold shrink-0"
                      >
                        {verifyingOtp ? "Verificando..." : "Validar Código"}
                      </Button>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Código de demostración: <strong>774920</strong></span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 space-y-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0" />
                  <div>
                    <h4 className="font-display font-bold text-sm text-foreground">
                      Verificación Manual para Pymes & Emprendedores
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Al utilizar un correo genérico (<strong className="text-foreground">{basicForm.email}</strong>), adjunta tu certificado de RNC de la DGII o Registro Mercantil.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Label className="text-xs font-bold">Comprobante de RNC o Licencia Comercial (PDF / Imagen)</Label>
                  <div className="border-2 border-dashed border-border rounded-2xl p-4 text-center space-y-2 bg-card">
                    <Upload className="h-6 w-6 text-muted-foreground mx-auto" />
                    <p className="text-xs text-muted-foreground">
                      {pymeDocumentName || "Arrastra o selecciona el archivo de acreditación tributaria"}
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setPymeDocumentName("rnc_oficial_dgii_restaurante.pdf")}
                      className="rounded-xl text-xs"
                    >
                      {pymeDocumentName ? "✓ Documento Cargado" : "Simular Carga de Archivo"}
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={handlePymeManualSubmit} 
                  className="rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-black w-full"
                >
                  Enviar Documentos y Continuar con el Menú →
                </Button>
              </div>
            )}

            <DialogFooter className="pt-3 border-t border-border/60">
              <Button variant="outline" size="sm" onClick={() => setCurrentStep("info")} className="rounded-xl text-xs">
                ← Volver a Datos
              </Button>
              <Button size="sm" onClick={() => setCurrentStep("menu")} className="rounded-xl text-xs font-bold">
                Continuar a Configuración de Menú →
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* STEP 3: Menu Configuration (PDF vs Detailed Items) */}
        {currentStep === "menu" && (
          <div className="space-y-5 py-2 text-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h4 className="font-display font-bold text-sm text-foreground">Elige cómo presentar tu Menú</h4>
                <p className="text-xs text-muted-foreground">Puedes cargar un archivo PDF o estructurar tus platos plato por plato.</p>
              </div>

              <div className="flex bg-muted p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMenuMode("items")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    menuMode === "items" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
                  }`}
                >
                  🍲 Platos Detallados ({menuItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMenuMode("pdf")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    menuMode === "pdf" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
                  }`}
                >
                  📄 Cargar Menú en PDF
                </button>
              </div>
            </div>

            {/* OPTION A: PDF MENU */}
            {menuMode === "pdf" && (
              <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary shrink-0" />
                  <div>
                    <h5 className="font-bold text-sm text-foreground">Menú Oficial en Formato PDF</h5>
                    <p className="text-xs text-muted-foreground">Los turistas podrán visualizarlo en pantalla o descargarlo directamente.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold">URL o Archivo del Documento PDF</Label>
                  <Input
                    value={menuPdfUrl}
                    onChange={(e) => setMenuPdfUrl(e.target.value)}
                    placeholder="https://restaurante.do/menu.pdf"
                    className="text-xs rounded-xl h-9 bg-background border-border font-mono"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">{menuPdfFileName}</span>
                  </div>
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none text-[10px]">
                    Listo para Visualización
                  </Badge>
                </div>
              </div>
            )}

            {/* OPTION B: DETAILED ITEMS */}
            {menuMode === "items" && (
              <div className="space-y-4">
                {/* List of currently added items */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {menuItems.map((item) => (
                    <div key={item.id} className="p-3.5 rounded-2xl bg-card border border-border flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-xs">{item.name}</span>
                          <Badge variant="outline" className="text-[9px]">{item.category}</Badge>
                          {item.isChefSpecial && <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-none text-[9px]">Especialidad</Badge>}
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{item.description}</p>
                        <div className="flex gap-2 text-[10px] text-muted-foreground">
                          <span className="font-black text-emerald-600">RD$ {item.priceDop.toLocaleString()}</span>
                          <span>(~${item.priceUsd} USD)</span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveMenuItem(item.id)}
                        className="text-destructive h-8 w-8 p-0 rounded-xl"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Add new item form */}
                <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
                  <h5 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                    <Plus className="h-3.5 w-3.5 text-primary" /> Agregar Nuevo Plato al Menú
                  </h5>

                  <div className="grid md:grid-cols-3 gap-2">
                    <Input
                      placeholder="Nombre del Plato *"
                      value={newItem.name}
                      onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                      className="text-xs rounded-xl h-8 bg-card border-border md:col-span-2"
                    />

                    <select
                      value={newItem.category}
                      onChange={(e: any) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                      className="text-xs rounded-xl h-8 px-2 bg-card border border-border text-foreground"
                    >
                      <option value="Entradas">Entradas</option>
                      <option value="Platos Fuertes">Platos Fuertes</option>
                      <option value="Postres">Postres</option>
                      <option value="Bebidas & Coctelería">Bebidas & Coctelería</option>
                      <option value="Especialidades">Especialidades Criollas</option>
                    </select>

                    <Textarea
                      placeholder="Descripción de ingredientes y sabor..."
                      value={newItem.description}
                      onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      className="text-xs rounded-xl bg-card border-border md:col-span-3"
                    />

                    <Input
                      type="number"
                      placeholder="Precio RD$"
                      value={newItem.priceDop}
                      onChange={(e) => {
                        const dop = Number(e.target.value);
                        setNewItem(prev => ({ ...prev, priceDop: dop, priceUsd: Math.round((dop / 60) * 10) / 10 }));
                      }}
                      className="text-xs rounded-xl h-8 bg-card border-border"
                    />

                    <div className="flex items-center gap-3 md:col-span-2 text-[11px]">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newItem.isChefSpecial}
                          onChange={(e) => setNewItem(prev => ({ ...prev, isChefSpecial: e.target.checked }))}
                        />
                        <span>⭐ Plato Estrella</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newItem.isGlutenFree}
                          onChange={(e) => setNewItem(prev => ({ ...prev, isGlutenFree: e.target.checked }))}
                        />
                        <span>🌾 Sin Gluten</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newItem.isVegetarian}
                          onChange={(e) => setNewItem(prev => ({ ...prev, isVegetarian: e.target.checked }))}
                        />
                        <span>🥗 Vegetariano</span>
                      </label>
                    </div>
                  </div>

                  <Button size="sm" onClick={handleAddMenuItem} className="rounded-xl text-xs font-bold">
                    Guardar Plato en Menú
                  </Button>
                </div>
              </div>
            )}

            <DialogFooter className="pt-3 border-t border-border/60">
              <Button variant="outline" size="sm" onClick={() => setCurrentStep("verification")} className="rounded-xl text-xs">
                ← Volver a Verificación
              </Button>
              <Button size="sm" onClick={() => setCurrentStep("advertising")} className="rounded-xl text-xs font-bold">
                Continuar a Publicidad & Beneficios →
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* STEP 4: Advertising, User Gifts, Influencers & Community Raffles */}
        {currentStep === "advertising" && (
          <div className="space-y-4 py-2 text-xs">
            <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-primary" />
                <h4 className="font-bold text-sm text-foreground">Opciones de Publicidad para tu Establecimiento</h4>
              </div>

              <div className="grid md:grid-cols-3 gap-2 pt-1">
                <label className={`p-3 rounded-xl border text-center cursor-pointer space-y-1 ${
                  advertisingForm.adFormat === "billboard" ? "bg-primary/10 border-primary font-bold" : "bg-muted/30 border-border"
                }`}>
                  <input
                    type="radio"
                    name="adFormat"
                    value="billboard"
                    checked={advertisingForm.adFormat === "billboard"}
                    onChange={(e) => setAdvertisingForm(prev => ({ ...prev, adFormat: e.target.value }))}
                    className="hidden"
                  />
                  <p className="text-xs">Banner Billboard</p>
                  <span className="text-[10px] text-muted-foreground">Cabecera de Guía Gastronómica</span>
                </label>

                <label className={`p-3 rounded-xl border text-center cursor-pointer space-y-1 ${
                  advertisingForm.adFormat === "infeed" ? "bg-primary/10 border-primary font-bold" : "bg-muted/30 border-border"
                }`}>
                  <input
                    type="radio"
                    name="adFormat"
                    value="infeed"
                    checked={advertisingForm.adFormat === "infeed"}
                    onChange={(e) => setAdvertisingForm(prev => ({ ...prev, adFormat: e.target.value }))}
                    className="hidden"
                  />
                  <p className="text-xs">Tarjeta In-Feed</p>
                  <span className="text-[10px] text-muted-foreground">Destacado entre restaurantes</span>
                </label>

                <label className={`p-3 rounded-xl border text-center cursor-pointer space-y-1 ${
                  advertisingForm.adFormat === "newsletter" ? "bg-primary/10 border-primary font-bold" : "bg-muted/30 border-border"
                }`}>
                  <input
                    type="radio"
                    name="adFormat"
                    value="newsletter"
                    checked={advertisingForm.adFormat === "newsletter"}
                    onChange={(e) => setAdvertisingForm(prev => ({ ...prev, adFormat: e.target.value }))}
                    className="hidden"
                  />
                  <p className="text-xs">Newsletter Semanal</p>
                  <span className="text-[10px] text-muted-foreground">Mención en 'Escapadas RD'</span>
                </label>
              </div>
            </div>

            {/* Sponsorship & Gift Controls */}
            <div className="space-y-3">
              {/* 1. User Gift */}
              <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-emerald-500" />
                    <span className="font-bold text-foreground">Regalo / Cortesía para Usuarios de Descubre RD</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={advertisingForm.userGiftEnabled}
                    onChange={(e) => setAdvertisingForm(prev => ({ ...prev, userGiftEnabled: e.target.checked }))}
                  />
                </div>
                {advertisingForm.userGiftEnabled && (
                  <Input
                    value={advertisingForm.userGiftType}
                    onChange={(e) => setAdvertisingForm(prev => ({ ...prev, userGiftType: e.target.value }))}
                    className="text-xs rounded-xl h-8 bg-background border-border"
                  />
                )}
              </div>

              {/* 2. Influencer Perk */}
              <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    <span className="font-bold text-foreground">Experiencia para Influencers & Creadores de Contenido</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={advertisingForm.influencerEnabled}
                    onChange={(e) => setAdvertisingForm(prev => ({ ...prev, influencerEnabled: e.target.checked }))}
                  />
                </div>
                {advertisingForm.influencerEnabled && (
                  <Input
                    value={advertisingForm.influencerPerk}
                    onChange={(e) => setAdvertisingForm(prev => ({ ...prev, influencerPerk: e.target.value }))}
                    className="text-xs rounded-xl h-8 bg-background border-border"
                  />
                )}
              </div>

              {/* 3. Community Raffle */}
              <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-purple-500" />
                    <span className="font-bold text-foreground">Patrocinio de Rifas & Sorteos entre Seguidores</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={advertisingForm.raffleEnabled}
                    onChange={(e) => setAdvertisingForm(prev => ({ ...prev, raffleEnabled: e.target.checked }))}
                  />
                </div>
                {advertisingForm.raffleEnabled && (
                  <Input
                    value={advertisingForm.rafflePrize}
                    onChange={(e) => setAdvertisingForm(prev => ({ ...prev, rafflePrize: e.target.value }))}
                    className="text-xs rounded-xl h-8 bg-background border-border"
                  />
                )}
              </div>
            </div>

            {/* Legal Terms and Newsletter Agreement */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2.5">
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="rest-terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 rounded"
                  required
                />
                <label htmlFor="rest-terms" className="text-xs text-muted-foreground leading-tight cursor-pointer">
                  Acepto los <span className="text-primary underline font-medium">Términos y Condiciones del Directorio Gastronómico</span> y la Política de Protección de Datos de Descubre RD. <span className="text-red-500">*</span>
                </label>
              </div>

              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="rest-newsletter"
                  checked={subscribeNewsletter}
                  onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                  className="mt-0.5 rounded"
                />
                <label htmlFor="rest-newsletter" className="text-xs text-muted-foreground leading-tight cursor-pointer">
                  Deseo recibir el boletín informativo gastronómico con reportes de afluencia turística y promociones.
                </label>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border/60">
              <Button variant="outline" size="sm" onClick={() => setCurrentStep("menu")} className="rounded-xl text-xs">
                ← Volver al Menú
              </Button>
              <Button size="sm" onClick={handleFinalSubmit} className="rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground">
                Finalizar Alta y Publicar Restaurante ✓
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* STEP 5: Complete Confirmation */}
        {currentStep === "complete" && (
          <div className="p-8 text-center space-y-4 py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-3xl mx-auto">
              🎉
            </div>
            <h3 className="font-display font-bold text-xl text-foreground">
              ¡{basicForm.name} Registrado con Éxito!
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              Tu menú ({menuMode === "pdf" ? "Documento PDF" : `${menuItems.length} platos estructurados`}) ya está disponible para millones de turistas en la Guía Gastronómica de República Dominicana.
            </p>

            <Button onClick={() => onOpenChange(false)} className="rounded-xl text-xs font-bold px-6">
              Entendido y Cerrar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
