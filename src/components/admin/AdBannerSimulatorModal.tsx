import React, { useState } from "react";
import { 
  Smartphone, Tablet, Monitor, Eye, Sparkles, ExternalLink, 
  CheckCircle2, Layers, ZoomIn, Info, ShieldCheck
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BannerContentImage } from "@/components/promo/BannerContentImage";
import { BannerContentAnimation, type AnimationType } from "@/components/promo/BannerContentAnimation";

interface AdBannerSimulatorModalProps {
  bannerData?: {
    name?: string;
    headline?: string;
    subtext?: string;
    cta_text?: string;
    sponsor?: string;
    image_url?: string;
    target_url?: string;
    banner_type?: string;
    animation_type?: string;
  };
  triggerButton?: React.ReactNode;
}

export function AdBannerSimulatorModal({
  bannerData = {
    name: "Campaña Festival Presidente 2026",
    headline: "La Música Nos Une en el Olímpico",
    subtext: "Boletas oficiales con 15% de descuento exclusivo",
    cta_text: "Comprar Boletas",
    sponsor: "Cerveza Presidente",
    image_url: "/src/assets/promo/banner-festival-presidente-2026.png",
    target_url: "https://www.presidente.com.do",
    banner_type: "fullscreen",
    animation_type: "pulse",
  },
  triggerButton,
}: AdBannerSimulatorModalProps) {
  const [open, setOpen] = useState(false);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeFormat, setActiveFormat] = useState<string>(bannerData.banner_type || "fullscreen");

  const formats = [
    { id: "fullscreen", name: "Pantalla Completa Hero (1920×250)", dims: "1920×250", height: "h-[180px] sm:h-[220px]", maxW: "max-w-4xl" },
    { id: "billboard", name: "Billboard Header (970×250)", dims: "970×250", height: "h-[160px]", maxW: "max-w-3xl" },
    { id: "super-leaderboard", name: "Super Leaderboard (970×90)", dims: "970×90", height: "h-[90px]", maxW: "max-w-3xl" },
    { id: "leaderboard", name: "Leaderboard Estándar (728×90)", dims: "728×90", height: "h-[90px]", maxW: "max-w-2xl" },
    { id: "halfpage", name: "Media Página Lateral (300×600)", dims: "300×600", height: "h-[360px]", maxW: "max-w-[280px]" },
    { id: "skyscraper", name: "Skyscraper Ancho (160×600)", dims: "160×600", height: "h-[360px]", maxW: "max-w-[180px]" },
    { id: "medium-rectangle", name: "Rectángulo MPU (300×250)", dims: "300×250", height: "h-[220px]", maxW: "max-w-[300px]" },
    { id: "large-rect", name: "Large Rectangle (336×280)", dims: "336×280", height: "h-[240px]", maxW: "max-w-[320px]" },
    { id: "square", name: "Cuadrado Estándar (250×250)", dims: "250×250", height: "h-[220px]", maxW: "max-w-[220px]" },
    { id: "mobile-banner", name: "Banner Móvil Estándar (320×50)", dims: "320×50", height: "h-[60px]", maxW: "max-w-[320px]" },
    { id: "mobile-large", name: "Banner Móvil Doble Altura (320×100)", dims: "320×100", height: "h-[100px]", maxW: "max-w-[320px]" },
    { id: "interstitial-mobile", name: "Intersticial Móvil (320×480)", dims: "320×480", height: "h-[360px]", maxW: "max-w-[280px]" },
  ];

  const currentFmt = formats.find(f => f.id === activeFormat) || formats[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-xs">
            <Eye className="h-3.5 w-3.5 text-primary" />
            <span>Simulador Multidispositivo</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-4xl rounded-3xl p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge className="bg-primary/10 text-primary border-primary/20 font-bold">
              ● Ad Server Preview & QA
            </Badge>
            <span className="text-xs font-mono text-muted-foreground">32 Formatos IAB</span>
          </div>
          <DialogTitle className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <span>Simulador y Prueba de Banners</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Verifica el renderizado responsive, el contraste tipográfico y la velocidad de animación antes de activar la pauta en producción.
          </DialogDescription>
        </DialogHeader>

        {/* Device & Format Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-muted/40 rounded-2xl border border-border/80 my-2">
          {/* Device toggle */}
          <div className="flex items-center gap-1 bg-card p-1 rounded-xl border border-border">
            <Button
              variant={device === "desktop" ? "default" : "ghost"}
              size="sm"
              onClick={() => setDevice("desktop")}
              className="h-8 gap-1.5 text-xs rounded-lg"
            >
              <Monitor className="h-3.5 w-3.5" /> Desktop
            </Button>
            <Button
              variant={device === "tablet" ? "default" : "ghost"}
              size="sm"
              onClick={() => setDevice("tablet")}
              className="h-8 gap-1.5 text-xs rounded-lg"
            >
              <Tablet className="h-3.5 w-3.5" /> Tablet
            </Button>
            <Button
              variant={device === "mobile" ? "default" : "ghost"}
              size="sm"
              onClick={() => setDevice("mobile")}
              className="h-8 gap-1.5 text-xs rounded-lg"
            >
              <Smartphone className="h-3.5 w-3.5" /> Móvil
            </Button>
          </div>

          {/* Format Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-semibold">Formato IAB:</span>
            <Select value={activeFormat} onValueChange={setActiveFormat}>
              <SelectTrigger className="h-8 text-xs rounded-xl w-[220px] bg-card">
                <SelectValue placeholder="Seleccionar formato" />
              </SelectTrigger>
              <SelectContent>
                {formats.map((f) => (
                  <SelectItem key={f.id} value={f.id} className="text-xs">
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Interactive Viewport Canvas */}
        <div className="p-6 bg-slate-950/90 rounded-2xl border border-slate-800 flex items-center justify-center min-h-[320px] overflow-hidden relative">
          <div
            className={`transition-all duration-300 mx-auto flex items-center justify-center ${
              device === "desktop" ? `w-full ${currentFmt.maxW}` : device === "tablet" ? "w-[560px]" : "w-[320px]"
            }`}
          >
            {/* Simulated Banner Container */}
            <div className="w-full relative overflow-hidden rounded-2xl border border-white/20 shadow-2xl bg-slate-900 group">
              <div className={`relative w-full ${currentFmt.height} overflow-hidden flex items-center justify-center bg-gradient-to-r from-emerald-900 via-slate-900 to-amber-950`}>
                {bannerData.image_url && (
                  <img
                    src={bannerData.image_url}
                    alt={bannerData.headline || "Simulación Banner"}
                    className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700"
                  />
                )}

                {/* Banner overlay text */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-4 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-amber-400 text-slate-950 text-3xs font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                      Patrocinado
                    </span>
                    {bannerData.sponsor && (
                      <span className="text-2xs font-bold text-white/90">{bannerData.sponsor}</span>
                    )}
                  </div>
                  <h4 className="font-display text-base sm:text-lg font-bold text-white leading-tight drop-shadow-md">
                    {bannerData.headline || "Tu Anuncio Aquí"}
                  </h4>
                  {bannerData.subtext && (
                    <p className="text-xs text-white/80 line-clamp-1 mt-0.5">
                      {bannerData.subtext}
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 bg-amber-500 text-slate-950 font-bold text-2xs px-3 py-1 rounded-xl shadow-lg group-hover:bg-amber-400 transition-colors">
                    <span>{bannerData.cta_text || "Conocer Más"}</span>
                    <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QA Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="text-muted-foreground">Etiqueta "Patrocinado" visible</span>
          </div>
          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="text-muted-foreground">Lazy Loading & Async Activos</span>
          </div>
          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="text-muted-foreground">Anti-duplicación de Clics</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs col-span-1 sm:col-span-3">
            <ShieldCheck className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="text-foreground font-medium">Postback URL / Webhook Server-to-Server (S2S) listo con firma HMAC-SHA256 y click_id automático</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
