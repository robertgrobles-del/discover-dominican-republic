import { useState } from "react";
import { 
  Sparkles, Download, Share2, Copy, 
  MapPin, Award, Zap, Crown, Check
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface StoryCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  totalProvinces: number;
  totalXp: number;
  coins: number;
  levelTitle: string;
  levelIcon: string;
  recentProvinces: string[];
}

export function StoryCardModal({
  open,
  onOpenChange,
  userName,
  totalProvinces,
  totalXp,
  coins,
  levelTitle,
  levelIcon,
  recentProvinces
}: StoryCardModalProps) {
  const [cardTheme, setCardTheme] = useState<"caribbean" | "sunset" | "jungle">("caribbean");

  const themes = {
    caribbean: "from-sky-900 via-blue-950 to-emerald-950 border-sky-400/40 text-sky-100",
    sunset: "from-rose-950 via-purple-950 to-amber-950 border-rose-400/40 text-rose-100",
    jungle: "from-emerald-950 via-teal-950 to-green-950 border-emerald-400/40 text-emerald-100"
  };

  const handleDownload = () => {
    toast.success("📸 Tarjeta 9:16 generada. Puedes capturar la pantalla o compartir directamente en tus Stories de Instagram.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-6 overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <DialogTitle className="font-display font-bold text-lg text-foreground">
              Generador de Historia 9:16 (Instagram & WhatsApp)
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Comparte tus estadísticas de explorador y sellos conquistados en tus redes sociales.
          </DialogDescription>
        </DialogHeader>

        {/* Theme Selectors */}
        <div className="flex items-center justify-center gap-2 py-1">
          <Button
            size="sm"
            variant={cardTheme === "caribbean" ? "default" : "outline"}
            onClick={() => setCardTheme("caribbean")}
            className="rounded-xl text-xs h-7 px-3"
          >
            🌊 Caribe
          </Button>
          <Button
            size="sm"
            variant={cardTheme === "sunset" ? "default" : "outline"}
            onClick={() => setCardTheme("sunset")}
            className="rounded-xl text-xs h-7 px-3"
          >
            🌅 Atardecer
          </Button>
          <Button
            size="sm"
            variant={cardTheme === "jungle" ? "default" : "outline"}
            onClick={() => setCardTheme("jungle")}
            className="rounded-xl text-xs h-7 px-3"
          >
            🌴 Cordillera
          </Button>
        </div>

        {/* 9:16 Story Card View */}
        <div className={`aspect-[9/14] rounded-3xl bg-gradient-to-b ${themes[cardTheme]} border-2 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden text-white`}>
          {/* Top Brand */}
          <div className="flex items-center justify-between border-b border-white/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🇩🇴</span>
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase opacity-80">Pasaporte Digital</p>
                <h4 className="font-bold text-xs tracking-wider">Descubre República Dominicana</h4>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 text-[10px] backdrop-blur-md">
              #ExploradorRD
            </Badge>
          </div>

          {/* Center Profile & Level Info */}
          <div className="text-center space-y-3 py-4">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center text-4xl shadow-inner">
              {levelIcon || "🧭"}
            </div>

            <div>
              <h3 className="font-display font-black text-xl text-white tracking-wide">{userName || "Explorador Quisqueyano"}</h3>
              <p className="text-xs text-amber-300 font-bold mt-0.5">{levelTitle || "Aventurero Activo"}</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
              <div>
                <p className="text-[9px] uppercase font-bold text-white/70">Provincias</p>
                <p className="text-lg font-black text-amber-400">{totalProvinces}/32</p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-white/70">Puntos XP</p>
                <p className="text-lg font-black text-emerald-400">{totalXp.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-white/70">Monedas</p>
                <p className="text-lg font-black text-cyan-400">{coins}</p>
              </div>
            </div>

            {/* Recent Stamps */}
            <div className="space-y-1.5 text-left">
              <p className="text-[10px] uppercase font-bold text-white/70 tracking-wider">Últimas Provincias Selladas:</p>
              <div className="flex flex-wrap gap-1.5">
                {(recentProvinces.length > 0 ? recentProvinces : ["Puerto Plata", "Samaná", "La Vega", "Pedernales"]).map((prov, i) => (
                  <span key={i} className="text-[10px] bg-white/15 px-2.5 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1 border border-white/15">
                    <Check className="h-3 w-3 text-emerald-400" /> {prov}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Footer CTA */}
          <div className="border-t border-white/20 pt-3 flex items-center justify-between text-[10px] opacity-80">
            <span>descubrerd.com/pasaporte</span>
            <span className="font-mono">#TurismoRD2026</span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="rounded-xl text-xs">
            Cerrar
          </Button>
          <Button size="sm" onClick={handleDownload} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs gap-1.5">
            <Download className="h-3.5 w-3.5" /> Descargar para Stories
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
