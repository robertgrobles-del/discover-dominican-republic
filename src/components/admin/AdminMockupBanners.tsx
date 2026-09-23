import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Megaphone, Image as ImageIcon, Video, Layers, Link as LinkIcon, 
  Eye, CheckCircle2, Sparkles, Activity, Plus, RefreshCw, Smartphone, Monitor,
  MousePointerClick, BarChart3, TrendingUp, Pin, Shuffle
} from "lucide-react";
import { BannerAd, type AdSize, type AdPlacement } from "@/components/promo/BannerAd";
import { getTopBarConfig, saveTopBarConfig, type TopBarPromoConfig } from "@/components/promo/TopBarPromo";
import { getExitPopupConfig, saveExitPopupConfig, type ExitPopupConfig } from "@/components/promo/ExitIntentModal";
import { useAdBanners, trackBannerClick, trackBannerImpression, type AdBanner } from "@/hooks/useAdBanners";
import { toast } from "sonner";

interface MockupBannerConfig {
  id: string;
  pageTarget: string;
  type: AdSize;
  mediaType: "image" | "video" | "rich_content";
  imageUrl: string;
  videoUrl?: string;
  headline: string;
  subtext: string;
  sponsor: string;
  ctaText: string;
  targetUrl: string;
  trackingPixelUrl?: string;
  isFixed: boolean;
  rotationMode: "fixed" | "rotative";
}

const PAGE_OPTIONS = [
  { value: "home", label: "Página Principal (Home / Index)" },
  { value: "home-hero-full", label: "Página Principal (Full-Width Hero Ad)" },
  { value: "home-topbar", label: "Cinta Superior Flash (TopBar Promocional)" },
  { value: "exit-popup", label: "Popup Automático de Salida / Abandono" },
  { value: "playas", label: "Playas & Costas" },
  { value: "alojamientos", label: "Hoteles & Alojamientos" },
  { value: "guia-gastronomica", label: "Guía Gastronómica & Restaurantes" },
  { value: "salud-24h", label: "Salud, Hospitales & Farmacias 24h" },
  { value: "provincias", label: "Provincias & Regiones" },
  { value: "destino-detalle", label: "Detalle de Destino Turístico" },
  { value: "gamificacion", label: "Gamificación & Pasaporte Digital (Cabecera)" },
  { value: "gamificacion-footer", label: "Gamificación & Pasaporte Digital (Panorama Footer)" },
  { value: "directorio-agencias", label: "Directorio de Agencias & Tour Operadores" },
  { value: "creadores", label: "Programa de Creadores & Influencers" },
  { value: "concursos", label: "Concursos de Fotografía Turística" },
];

const AD_FORMAT_SPECS: Record<AdSize, { name: string; dims: string; bestFor: string; typeGroup: "horizontal" | "vertical" | "rect" | "mobile" }> = {
  "full-width-hero": { name: "Full-Width Hero Panorama", dims: "1280 × 240", bestFor: "Máxima altura y ancho total entre secciones", typeGroup: "horizontal" },
  "leaderboard": { name: "Leaderboard", dims: "728 × 90", bestFor: "Cabeceras y separador superior de listados", typeGroup: "horizontal" },
  "billboard": { name: "Billboard", dims: "970 × 140", bestFor: "Separadores full-width entre módulos", typeGroup: "horizontal" },
  "panorama": { name: "Panorama High-Impact", dims: "980 × 120", bestFor: "Banners panorámicos de alta visibilidad", typeGroup: "horizontal" },
  "medium-rect": { name: "Medium Rectangle", dims: "300 × 250", bestFor: "Sidebars y grillas de contenido", typeGroup: "rect" },
  "large-rect": { name: "Large Rectangle", dims: "336 × 280", bestFor: "Bloques destacados entre artículos", typeGroup: "rect" },
  "square-small": { name: "Square Small", dims: "250 × 250", bestFor: "Widgets compactos y módulos B2B", typeGroup: "rect" },
  "square-large": { name: "Square Large", dims: "300 × 300", bestFor: "Columnas y cards de promociones", typeGroup: "rect" },
  "skyscraper": { name: "Skyscraper", dims: "160 × 600", bestFor: "Barra lateral estándar", typeGroup: "vertical" },
  "wide-skyscraper": { name: "Wide Skyscraper", dims: "300 × 600", bestFor: "Barra lateral amplia con llamada fija", typeGroup: "vertical" },
  "half-page": { name: "Half Page", dims: "300 × 600", bestFor: "Máximo impacto en desktop sidebars", typeGroup: "vertical" },
  "portrait": { name: "Portrait", dims: "300 × 1050", bestFor: "Formatos editoriales especiales", typeGroup: "vertical" },
  "mobile-large": { name: "Mobile Large", dims: "320 × 90", bestFor: "Smartphones (encabezado o intermedio)", typeGroup: "mobile" },
  "mobile-banner": { name: "Mobile Banner", dims: "320 × 60", bestFor: "Smartphones compacto", typeGroup: "mobile" },
  "mobile-medium": { name: "Mobile Inline Medium", dims: "320 × 250", bestFor: "Smartphones entre artículos", typeGroup: "mobile" },
};

export function AdminMockupBanners() {
  const { data: dbBanners, refetch } = useAdBanners();
  const [selectedPage, setSelectedPage] = useState("home");
  const [selectedFormat, setSelectedFormat] = useState<AdSize>("billboard");
  const [mediaType, setMediaType] = useState<"image" | "video" | "rich_content">("image");
  const [rotationMode, setRotationMode] = useState<"fixed" | "rotative">("rotative");
  
  // Custom Banner Fields
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&h=600&fit=crop");
  const [videoUrl, setVideoUrl] = useState("");
  const [headline, setHeadline] = useState("Sanctuary Cap Cana Golf & Spa Resort");
  const [subtext, setSubtext] = useState("Villas privadas de lujo frente al mar y campo de golf PGA.");
  const [sponsor, setSponsor] = useState("Sanctuary Luxury Collection");
  const [ctaText, setCtaText] = useState("Reservar Estadía");
  const [targetUrl, setTargetUrl] = useState("/alojamientos");
  const [trackingPixelUrl, setTrackingPixelUrl] = useState("https://analytics.descubrerd.do/pixel?campaign=capcana2026");

  const [savedConfigs, setSavedConfigs] = useState<MockupBannerConfig[]>([]);

  // TopBar Promo State
  const [topBarConfig, setTopBarConfig] = useState<TopBarPromoConfig>(getTopBarConfig);
  // Exit Popup State
  const [exitPopupConfig, setExitPopupConfig] = useState<ExitPopupConfig>(getExitPopupConfig);

  const handleSaveTopBar = () => {
    saveTopBarConfig(topBarConfig);
    toast.success("Configuración de la Cinta Flash TopBar guardada y activada.");
  };

  const handleSaveExitPopup = () => {
    saveExitPopupConfig(exitPopupConfig);
    toast.success("Configuración del Popup Automático de Salida guardada.");
  };

  // Calculate global metrics from DB banners
  const totalImpressions = (dbBanners || []).reduce((sum, b) => sum + (b.impressions || 0), 0);
  const totalClicks = (dbBanners || []).reduce((sum, b) => sum + (b.clicks || 0), 0);
  const averageCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";

  const handleSaveMockup = () => {
    const newConfig: MockupBannerConfig = {
      id: `banner-${Date.now()}`,
      pageTarget: selectedPage,
      type: selectedFormat,
      mediaType,
      imageUrl,
      videoUrl: mediaType === "video" ? videoUrl : undefined,
      headline,
      subtext,
      sponsor,
      ctaText,
      targetUrl,
      trackingPixelUrl,
      isFixed: rotationMode === "fixed",
      rotationMode,
    };

    setSavedConfigs((prev) => [newConfig, ...prev]);
    toast.success(`Banner para ${AD_FORMAT_SPECS[selectedFormat].name} guardado (${rotationMode === "fixed" ? "Fijo" : "Rotativo Dinámico"}).`);
  };

  const currentSpec = AD_FORMAT_SPECS[selectedFormat];

  return (
    <div className="space-y-8">
      {/* Header Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div>
          <Badge className="bg-primary/10 text-primary border-primary/20 gap-1.5 mb-2">
            <Megaphone className="h-3.5 w-3.5" /> Gestor & Métricas de Banners
          </Badge>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Configuración y Rastreo de Banners Dinámicos
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Configura banners fijos o rotativos para diferentes usuarios, y monitorea en tiempo real visualizaciones (impresiones), clics y CTR por sección.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Actualizar Datos
          </Button>
          <Badge variant="outline" className="px-3 py-1 text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
            14 Formatos IAB Activos
          </Badge>
        </div>
      </div>

      {/* Real-time Performance Metrics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card/60 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Visualizaciones (Impresiones)</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{totalImpressions.toLocaleString()}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Eye className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
            <Activity className="h-3 w-3 text-emerald-500" /> Rastreo automático de render / viewport
          </p>
        </Card>

        <Card className="border-border bg-card/60 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Clics Registrados</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{totalClicks.toLocaleString()}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <MousePointerClick className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-emerald-500" /> Rastreos en navegación y enlaces
          </p>
        </Card>

        <Card className="border-border bg-card/60 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">CTR Promedio</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{averageCtr}%</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Click-Through Rate global de campañas
          </p>
        </Card>

        <Card className="border-border bg-card/60 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Campañas Activas</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{(dbBanners || []).length}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Shuffle className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Soporta Banners Fijos y Rotativos
          </p>
        </Card>
      </div>

      {/* Main Tabs: Builder vs Active Campaigns vs Flash Promos */}
      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList className="bg-muted/60 p-1 flex flex-wrap gap-1">
          <TabsTrigger value="builder" className="gap-2 text-xs">
            <Layers className="h-3.5 w-3.5" /> Creador & Mockup de Banners
          </TabsTrigger>
          <TabsTrigger value="flash-promos" className="gap-2 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Cinta Flash TopBar & Exit Popup
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-2 text-xs">
            <BarChart3 className="h-3.5 w-3.5" /> Campañas Activas & Métricas Detalladas ({dbBanners?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          {/* Main Builder & Live Preview Grid */}
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Controls Column */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="border-border bg-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" /> Parámetros del Anuncio
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Selecciona la ubicación, modo de rotación y assets multimedia
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  
                  {/* Page Selection */}
                  <div>
                    <Label className="text-xs font-semibold">1. Página / Sección de Destino</Label>
                    <Select value={selectedPage} onValueChange={setSelectedPage}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecciona la página" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAGE_OPTIONS.map((p) => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Mode Selection: Fixed vs Rotative */}
                  <div>
                    <Label className="text-xs font-semibold">2. Comportamiento en la Sección</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <Button
                        type="button"
                        variant={rotationMode === "fixed" ? "default" : "outline"}
                        size="sm"
                        className="text-xs gap-1.5 h-9 justify-start px-3"
                        onClick={() => setRotationMode("fixed")}
                      >
                        <Pin className="h-3.5 w-3.5 text-amber-400" />
                        <div className="text-left">
                          <p className="font-semibold leading-none">Fijo</p>
                          <p className="text-[10px] opacity-75 font-normal">Siempre visible</p>
                        </div>
                      </Button>
                      <Button
                        type="button"
                        variant={rotationMode === "rotative" ? "default" : "outline"}
                        size="sm"
                        className="text-xs gap-1.5 h-9 justify-start px-3"
                        onClick={() => setRotationMode("rotative")}
                      >
                        <Shuffle className="h-3.5 w-3.5 text-primary" />
                        <div className="text-left">
                          <p className="font-semibold leading-none">Rotativo</p>
                          <p className="text-[10px] opacity-75 font-normal">Para múltiples usuarios</p>
                        </div>
                      </Button>
                    </div>
                  </div>

                  {/* Format / Dimensions Selection */}
                  <div>
                    <Label className="text-xs font-semibold">3. Formato & Proporción IAB</Label>
                    <Select value={selectedFormat} onValueChange={(v) => setSelectedFormat(v as AdSize)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecciona formato" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(AD_FORMAT_SPECS).map(([key, spec]) => (
                          <SelectItem key={key} value={key}>
                            {spec.name} ({spec.dims})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Uso recomendado: <strong>{currentSpec.bestFor}</strong>
                    </p>
                  </div>

                  {/* Media Type Tabs */}
                  <div>
                    <Label className="text-xs font-semibold">4. Tipo de Medio</Label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <Button
                        type="button"
                        variant={mediaType === "image" ? "default" : "outline"}
                        size="sm"
                        className="text-xs gap-1.5 h-8"
                        onClick={() => setMediaType("image")}
                      >
                        <ImageIcon className="h-3.5 w-3.5" /> Imagen
                      </Button>
                      <Button
                        type="button"
                        variant={mediaType === "video" ? "default" : "outline"}
                        size="sm"
                        className="text-xs gap-1.5 h-8"
                        onClick={() => setMediaType("video")}
                      >
                        <Video className="h-3.5 w-3.5" /> Video
                      </Button>
                      <Button
                        type="button"
                        variant={mediaType === "rich_content" ? "default" : "outline"}
                        size="sm"
                        className="text-xs gap-1.5 h-8"
                        onClick={() => setMediaType("rich_content")}
                      >
                        <Sparkles className="h-3.5 w-3.5" /> Rich Content
                      </Button>
                    </div>
                  </div>

                  {/* Media URL Inputs */}
                  <div className="space-y-3 pt-2 border-t border-border">
                    <div>
                      <Label className="text-xs">URL de la Imagen / Poster</Label>
                      <Input 
                        value={imageUrl} 
                        onChange={(e) => setImageUrl(e.target.value)} 
                        placeholder="https://images.unsplash.com/..." 
                        className="h-8 text-xs mt-1"
                      />
                    </div>

                    {mediaType === "video" && (
                      <div>
                        <Label className="text-xs">URL del Video (MP4 / WebM)</Label>
                        <Input 
                          value={videoUrl} 
                          onChange={(e) => setVideoUrl(e.target.value)} 
                          placeholder="https://assets.mixkit.co/videos/..." 
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                    )}
                  </div>

                  {/* Copywriting & Information */}
                  <div className="space-y-3 pt-2 border-t border-border">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Patrocinador</Label>
                        <Input 
                          value={sponsor} 
                          onChange={(e) => setSponsor(e.target.value)} 
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Texto Botón CTA</Label>
                        <Input 
                          value={ctaText} 
                          onChange={(e) => setCtaText(e.target.value)} 
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Título Principal</Label>
                      <Input 
                        value={headline} 
                        onChange={(e) => setHeadline(e.target.value)} 
                        className="h-8 text-xs mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Descripción / Subtítulo</Label>
                      <Input 
                        value={subtext} 
                        onChange={(e) => setSubtext(e.target.value)} 
                        className="h-8 text-xs mt-1"
                      />
                    </div>
                  </div>

                  {/* Destination & Tracking */}
                  <div className="space-y-3 pt-2 border-t border-border">
                    <div>
                      <Label className="text-xs flex items-center gap-1">
                        <LinkIcon className="h-3 w-3 text-primary" /> Enlace de Destino (Target URL)
                      </Label>
                      <Input 
                        value={targetUrl} 
                        onChange={(e) => setTargetUrl(e.target.value)} 
                        className="h-8 text-xs mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-xs flex items-center gap-1">
                        <Activity className="h-3 w-3 text-emerald-500" /> Píxel de Conversión / Tracking URL
                      </Label>
                      <Input 
                        value={trackingPixelUrl} 
                        onChange={(e) => setTrackingPixelUrl(e.target.value)} 
                        className="h-8 text-xs mt-1"
                        placeholder="https://tracker.com/pixel.gif"
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveMockup} className="w-full gap-2 mt-4">
                    <Plus className="h-4 w-4" /> Guardar Banner para {PAGE_OPTIONS.find(p => p.value === selectedPage)?.label.split(" ")[0]}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Live Preview Column */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="border-border bg-card">
                <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Eye className="h-4 w-4 text-primary" /> Previsualización en Tiempo Real
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Proporción exacta: <strong>{currentSpec.dims}</strong> ({currentSpec.name}) • Modo: <span className="font-semibold text-primary">{rotationMode === "fixed" ? "Fijo" : "Rotativo Dinámico"}</span>
                    </CardDescription>
                  </div>

                  <Badge variant="secondary" className="text-[11px] gap-1">
                    {currentSpec.typeGroup === "mobile" ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                    {currentSpec.typeGroup.toUpperCase()}
                  </Badge>
                </CardHeader>
                <CardContent className="p-6 flex flex-col items-center justify-center min-h-[380px] bg-secondary/15 rounded-b-xl overflow-x-auto">
                  
                  <div className="w-full flex justify-center py-4">
                    <BannerAd
                      size={selectedFormat}
                      placement="inline"
                      imageUrl={imageUrl}
                      targetUrl={targetUrl}
                      sponsor={sponsor}
                      showDemo={false}
                      className="shadow-xl"
                      bannerData={{
                        id: "preview-id",
                        name: "preview",
                        slug: null,
                        section: selectedPage,
                        page: null,
                        banner_type: selectedFormat,
                        placement: "inline",
                        image_url: imageUrl,
                        alt_text: null,
                        video_url: mediaType === "video" ? videoUrl : null,
                        content_type: mediaType,
                        headline,
                        subtext,
                        sponsor,
                        cta_text: ctaText,
                        target_url: targetUrl,
                        is_active: true,
                        is_featured: false,
                        start_date: null,
                        end_date: null,
                        impressions: 0,
                        clicks: 0,
                        priority: rotationMode === "fixed" ? 100 : 10,
                        is_fixed: rotationMode === "fixed",
                        rotation_mode: rotationMode,
                        video_autoplay: null,
                        video_loop: null,
                        video_muted: null,
                        animation_type: null,
                        animation_config: null,
                        slider_items: null,
                        slider_interval: null,
                      }}
                    />
                  </div>

                  {/* Tracking Pixel Indicator */}
                  {trackingPixelUrl && (
                    <div className="mt-4 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 w-full max-w-md">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">Píxel vinculado: {trackingPixelUrl}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Formats Cheat Sheet Table */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold">Resumen de Formatos Soportados en el Portal</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(AD_FORMAT_SPECS).map(([key, spec]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedFormat(key as AdSize)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          selectedFormat === key 
                            ? "bg-primary/10 border-primary shadow-xs" 
                            : "bg-secondary/40 border-border hover:border-primary/40"
                        }`}
                      >
                        <p className="font-bold text-xs text-foreground">{spec.name}</p>
                        <p className="text-[11px] font-mono text-primary mt-0.5">{spec.dims}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{spec.bestFor}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </TabsContent>

        {/* Tab 2: Campañas Activas & Métricas */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Métricas por Banner y Campaña
              </CardTitle>
              <CardDescription className="text-xs">
                Rastreo de visualizaciones automáticas en pantalla y clics en tiempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(!dbBanners || dbBanners.length === 0) ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Megaphone className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-medium">No hay banners activos en la base de datos.</p>
                  <p className="text-xs mt-1">Crea un nuevo banner desde el creador o revisa la configuración de Supabase.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground font-semibold">
                        <th className="py-2.5 px-3">Banner / Anunciante</th>
                        <th className="py-2.5 px-3">Sección</th>
                        <th className="py-2.5 px-3">Formato</th>
                        <th className="py-2.5 px-3">Modo</th>
                        <th className="py-2.5 px-3 text-right">Visualizaciones</th>
                        <th className="py-2.5 px-3 text-right">Clics</th>
                        <th className="py-2.5 px-3 text-right">CTR</th>
                        <th className="py-2.5 px-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {dbBanners.map((b) => {
                        const impressions = b.impressions || 0;
                        const clicks = b.clicks || 0;
                        const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : "0.00";
                        const isFixed = b.is_fixed || (b.priority && b.priority >= 100);

                        return (
                          <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                {b.image_url && (
                                  <img src={b.image_url} alt="" className="h-8 w-12 object-cover rounded border border-border" />
                                )}
                                <div>
                                  <p className="font-semibold text-foreground line-clamp-1">{b.headline || b.name}</p>
                                  <p className="text-[10px] text-muted-foreground">{b.sponsor || "Sin patrocinador"}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 capitalize">
                              <Badge variant="outline" className="text-[10px]">{b.section || "Global"}</Badge>
                            </td>
                            <td className="py-3 px-3 font-mono text-[11px]">{b.banner_type}</td>
                            <td className="py-3 px-3">
                              {isFixed ? (
                                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] gap-1">
                                  <Pin className="h-2.5 w-2.5" /> Fijo
                                </Badge>
                              ) : (
                                <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px] gap-1">
                                  <Shuffle className="h-2.5 w-2.5" /> Rotativo
                                </Badge>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right font-semibold font-mono text-foreground">
                              {impressions.toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-right font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                              {clicks.toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-right font-bold font-mono text-primary">
                              {ctr}%
                            </td>
                            <td className="py-3 px-3 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[11px] gap-1"
                                onClick={() => {
                                  trackBannerImpression(b.id);
                                  toast.info(`Simulada visualización para "${b.headline || b.name}"`);
                                  refetch();
                                }}
                              >
                                Probar Rastreo
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: FLASH PROMOS & EXIT POPUP MANAGER */}
        <TabsContent value="flash-promos" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* TopBar Promo Configuration Card */}
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    <CardTitle className="text-base font-bold">Cinta Superior Flash (TopBar)</CardTitle>
                  </div>
                  <Badge variant={topBarConfig.enabled ? "default" : "secondary"}>
                    {topBarConfig.enabled ? "Activa" : "Desactivada"}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Cinta promocional dismissible que aparece en el tope de toda la web para flash deals y cupones.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
                  <span className="font-semibold text-foreground">Estado de la Cinta Superior</span>
                  <Button
                    type="button"
                    size="sm"
                    variant={topBarConfig.enabled ? "default" : "outline"}
                    onClick={() => setTopBarConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                  >
                    {topBarConfig.enabled ? "Desactivar" : "Activar"}
                  </Button>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Texto / Badge Superior</Label>
                  <Input
                    value={topBarConfig.badge}
                    onChange={(e) => setTopBarConfig(prev => ({ ...prev, badge: e.target.value }))}
                    className="h-8 text-xs"
                    placeholder="PROMO FLASH 2026"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Mensaje Promocional Principal</Label>
                  <Input
                    value={topBarConfig.text}
                    onChange={(e) => setTopBarConfig(prev => ({ ...prev, text: e.target.value }))}
                    className="h-8 text-xs"
                    placeholder="¡Hasta 35% de descuento en Hoteles & Excursiones Oficiales!"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Código de Cupón (Opcional)</Label>
                    <Input
                      value={topBarConfig.couponCode || ""}
                      onChange={(e) => setTopBarConfig(prev => ({ ...prev, couponCode: e.target.value }))}
                      className="h-8 text-xs font-mono font-bold uppercase"
                      placeholder="QUISQUEYA26"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Texto del Botón (CTA)</Label>
                    <Input
                      value={topBarConfig.ctaText}
                      onChange={(e) => setTopBarConfig(prev => ({ ...prev, ctaText: e.target.value }))}
                      className="h-8 text-xs"
                      placeholder="Aprovechar Oferta"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Enlace de Destino (URL)</Label>
                  <Input
                    value={topBarConfig.ctaUrl}
                    onChange={(e) => setTopBarConfig(prev => ({ ...prev, ctaUrl: e.target.value }))}
                    className="h-8 text-xs"
                    placeholder="/alojamientos"
                  />
                </div>

                <Button onClick={handleSaveTopBar} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9">
                  Guardar Cambios de TopBar Flash
                </Button>
              </CardContent>
            </Card>

            {/* Exit Intent Popup Configuration Card */}
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base font-bold">Popup Automático de Salida / Abandono</CardTitle>
                  </div>
                  <Badge variant={exitPopupConfig.enabled ? "default" : "secondary"}>
                    {exitPopupConfig.enabled ? "Activo" : "Desactivado"}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Detecta cuando un visitante no autenticado va a cerrar la pestaña para ofrecerle registro y regalo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
                  <span className="font-semibold text-foreground">Estado del Exit-Intent Modal</span>
                  <Button
                    type="button"
                    size="sm"
                    variant={exitPopupConfig.enabled ? "default" : "outline"}
                    onClick={() => setExitPopupConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                  >
                    {exitPopupConfig.enabled ? "Desactivar" : "Activar"}
                  </Button>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Badge Superior del Popup</Label>
                  <Input
                    value={exitPopupConfig.badgeText}
                    onChange={(e) => setExitPopupConfig(prev => ({ ...prev, badgeText: e.target.value }))}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Título Principal</Label>
                  <Input
                    value={exitPopupConfig.title}
                    onChange={(e) => setExitPopupConfig(prev => ({ ...prev, title: e.target.value }))}
                    className="h-8 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Subtítulo Descriptivo</Label>
                  <Input
                    value={exitPopupConfig.subtitle}
                    onChange={(e) => setExitPopupConfig(prev => ({ ...prev, subtitle: e.target.value }))}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Regalo Prometido</Label>
                    <Input
                      value={exitPopupConfig.giftText}
                      onChange={(e) => setExitPopupConfig(prev => ({ ...prev, giftText: e.target.value }))}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Puntos XP Otorgados</Label>
                    <Input
                      type="number"
                      value={exitPopupConfig.xpReward}
                      onChange={(e) => setExitPopupConfig(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 0 }))}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <Button onClick={handleSaveExitPopup} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9">
                  Guardar Cambios de Exit-Intent Popup
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
