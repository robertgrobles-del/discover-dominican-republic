import React, { useState } from "react";
import { 
  Sparkles, Download, Share2, Copy, Check, MapPin, Compass, 
  Camera, ExternalLink, ShieldCheck, Sun
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SelloVerificadoBadge } from "@/components/ui/SelloVerificadoBadge";

interface ProvinceDigitalCardModalProps {
  provinceName: string;
  region: string;
  heroImage?: string;
  highlights?: string[];
  climate?: string;
  triggerButton?: React.ReactNode;
}

export function ProvinceDigitalCardModal({
  provinceName,
  region,
  heroImage = "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200&auto=format&fit=crop&q=80",
  highlights = ["Playas vírgenes", "Cascadas ecológicas", "Gastronomía criolla"],
  climate = "28°C Tropical Soleado",
  triggerButton,
}: ProvinceDigitalCardModalProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = typeof window !== "undefined" ? window.location.href : "https://descubrerd.com";
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("¡Enlace de tarjeta turística copiado!", {
        description: "Pégalo en tus historias de Instagram o estado de WhatsApp."
      });
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleShareStory = () => {
    const url = typeof window !== "undefined" ? window.location.href : "https://descubrerd.com";
    const text = `Explora ${provinceName} (${region}) en el portal oficial de Descubre República Dominicana 🇩🇴`;
    if (navigator.share) {
      navigator.share({ title: provinceName, text, url }).catch(() => undefined);
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`, "_blank");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-xs border-primary/30 text-primary hover:bg-primary/10">
            <Camera className="h-3.5 w-3.5" />
            <span>Tarjeta Digital para Redes</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl rounded-3xl p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge className="bg-primary/10 text-primary border-primary/20 font-bold">
              ● Social Share Card (1200×630)
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">Formatos Instagram / WhatsApp</span>
          </div>
          <DialogTitle className="font-display text-xl font-bold text-foreground">
            Tarjeta Turística Digital: {provinceName}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Comparte esta postal interactiva con amigos y seguidores en tus redes sociales.
          </DialogDescription>
        </DialogHeader>

        {/* Live Digital Card Preview (1200x630 proportion) */}
        <div className="my-4 rounded-3xl overflow-hidden border-2 border-primary/30 shadow-2xl relative aspect-[1200/630] bg-slate-950 group">
          {/* Background image */}
          <img
            src={heroImage}
            alt={provinceName}
            className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700"
          />

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent" />

          {/* Top Header Bar inside Card */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
              <span className="text-base">🇩🇴</span>
              <span className="font-mono font-bold text-3xs text-white tracking-widest uppercase">
                Descubre República Dominicana
              </span>
            </div>
            <SelloVerificadoBadge variant="compact" size="sm" licenseNumber="OFICIAL-MITUR" />
          </div>

          {/* Bottom Card Content */}
          <div className="absolute bottom-4 left-4 right-4 z-10 space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-400 text-slate-950 font-black text-3xs uppercase px-2.5 py-0.5 rounded-full">
                <MapPin className="h-3 w-3 mr-1" /> {region}
              </Badge>
              <Badge variant="outline" className="bg-slate-950/60 text-white border-white/30 text-3xs">
                <Sun className="h-3 w-3 mr-1 text-amber-400" /> {climate}
              </Badge>
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-lg">
              {provinceName}
            </h3>

            {/* Highlight tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {highlights.slice(0, 3).map((h, i) => (
                <span
                  key={i}
                  className="bg-white/15 backdrop-blur-md text-white text-3xs font-semibold px-2.5 py-0.5 rounded-lg border border-white/10"
                >
                  ✨ {h}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="gap-2 rounded-xl text-xs"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? "¡Enlace Copiado!" : "Copiar Enlace Postal"}</span>
          </Button>

          <Button
            size="sm"
            onClick={handleShareStory}
            className="gap-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
          >
            <Share2 className="h-4 w-4" />
            <span>Compartir en Redes</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
