import { useRef } from "react";
import { 
  Award, Download, Printer, ShieldCheck, 
  Sparkles, CheckCircle2, QrCode, Share2, Compass
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

interface CertificateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  totalProvinces: number;
  totalXp: number;
  levelTitle: string;
}

export function CertificateModal({
  open,
  onOpenChange,
  userName,
  totalProvinces,
  totalXp,
  levelTitle
}: CertificateModalProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const certId = `RD-CERT-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const issueDate = new Date().toLocaleDateString("es-DO", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Certificado de Conquistador Quisqueyano - Descubre RD",
        text: `¡He acreditado ${totalProvinces} provincias de la República Dominicana con el Pasaporte Digital Oficial!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`https://descubrerd.com/certificado/${certId}`);
      toast.success("Enlace de validación copiado al portapapeles.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-3xl rounded-3xl p-6 overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            <DialogTitle className="font-display font-bold text-lg text-foreground">
              Diploma Oficial de Conquistador Quisqueyano
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Acreditación oficial emitida por el portal de turismo Descubre República Dominicana.
          </DialogDescription>
        </DialogHeader>

        {/* Certificate Frame */}
        <div 
          ref={certificateRef}
          className="p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-card to-primary/10 border-4 border-double border-amber-500/40 text-center space-y-6 shadow-xl relative overflow-hidden my-2"
        >
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none text-9xl">
            🇩🇴
          </div>

          <div className="flex items-center justify-between border-b border-amber-500/30 pb-4">
            <div className="flex items-center gap-2 text-left">
              <span className="text-3xl">🇩🇴</span>
              <div>
                <h4 className="font-serif font-black text-sm text-foreground tracking-wider uppercase">República Dominicana</h4>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Portal Oficial de Turismo • MITUR</p>
              </div>
            </div>
            <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 text-xs font-bold px-3 py-1">
              Registro: {certId}
            </Badge>
          </div>

          <div className="space-y-2 py-3">
            <p className="font-serif italic text-xs text-muted-foreground tracking-widest uppercase">
              Por cuanto confiere el presente
            </p>
            <h2 className="font-serif text-2xl sm:text-4xl font-black text-foreground tracking-wide uppercase bg-gradient-to-r from-amber-600 via-primary to-amber-500 bg-clip-text text-transparent">
              Diploma de Honor & Mérito Turístico
            </h2>
            <p className="text-xs text-muted-foreground">al explorador(a)</p>
            <h3 className="font-display text-2xl sm:text-3xl font-black text-foreground underline decoration-amber-500/50 decoration-2 underline-offset-8">
              {userName || "Explorador Quisqueyano"}
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            En reconocimiento a su espíritu de aventura, dedicación y compromiso con la preservación del patrimonio natural, histórico y cultural de la República Dominicana, habiendo acreditado visitas en <strong>{totalProvinces} provincias</strong> y acumulando <strong>{totalXp.toLocaleString()} puntos de experiencia (XP)</strong> con el rango de <strong>{levelTitle}</strong>.
          </p>

          <div className="grid grid-cols-3 items-end pt-6 border-t border-amber-500/30 gap-4 text-xs">
            <div className="text-center space-y-1">
              <p className="font-serif font-bold text-foreground text-xs">{issueDate}</p>
              <div className="w-24 h-0.5 bg-muted-foreground/30 mx-auto" />
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Fecha de Emisión</p>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-white p-1.5 rounded-xl border border-amber-500/40 shadow-inner flex items-center justify-center">
                <QrCode className="w-full h-full text-black" />
              </div>
              <span className="text-[9px] text-muted-foreground font-mono mt-1">Verificación Oficial</span>
            </div>

            <div className="text-center space-y-1">
              <p className="font-serif font-bold text-foreground text-xs">Comité de Gamificación</p>
              <div className="w-24 h-0.5 bg-muted-foreground/30 mx-auto" />
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Descubre RD • MITUR</p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={handleShare} className="rounded-xl text-xs gap-1.5">
            <Share2 className="h-3.5 w-3.5" /> Compartir Enlace
          </Button>
          <Button size="sm" onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs gap-1.5">
            <Printer className="h-3.5 w-3.5" /> Imprimir / Guardar en PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
