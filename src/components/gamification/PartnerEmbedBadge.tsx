import { useState } from "react";
import { Copy, Code, Check, ShieldCheck, Building, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface PartnerEmbedBadgeProps {
  partnerName: string;
  rnc: string;
  province: string;
}

export function PartnerEmbedBadge({
  partnerName,
  rnc,
  province
}: PartnerEmbedBadgeProps) {
  const [copied, setCopied] = useState(false);

  const embedCode = `<!-- Sello Oficial Aliado Descubre RD -->
<div style="display:inline-flex;align-items:center;gap:8px;padding:8px 14px;background:#0f172a;color:#ffffff;border-radius:12px;font-family:system-ui,-apple-system,sans-serif;font-size:12px;border:1px solid rgba(255,255,255,0.15);">
  <span style="font-size:16px;">🇩🇴</span>
  <div>
    <div style="font-weight:bold;font-size:11px;">${partnerName}</div>
    <div style="color:#38bdf8;font-size:10px;">✓ Empresa Aliada Acreditada • RNC ${rnc}</div>
  </div>
</div>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success("Código HTML copiado para insertar en tu sitio web.");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
          <h4 className="font-display font-bold text-sm sm:text-base text-foreground">
            Sello Digital Oficial para tu Sitio Web
          </h4>
        </div>
        <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px]">
          HTML / Iframe Embebible
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Inserta este sello en el pie de página de la web oficial de tu hotel o tour operadora para demostrar a los turistas que eres un <strong>Establecimiento Verificado con RNC & RNT</strong> en el portal oficial de República Dominicana.
      </p>

      {/* Live Badge Preview */}
      <div className="p-4 rounded-2xl bg-muted/40 border border-border/70 flex items-center justify-center">
        <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-md">
          <span className="text-xl">🇩🇴</span>
          <div>
            <div className="font-bold text-xs">{partnerName || "Grand Paradise Resort"}</div>
            <div className="text-sky-400 text-[10px] font-medium flex items-center gap-1">
              ✓ Empresa Aliada Acreditada • RNC {rnc || "1-31-88492-3"}
            </div>
          </div>
        </div>
      </div>

      {/* Code Snippet Box */}
      <div className="relative">
        <pre className="p-3.5 rounded-2xl bg-slate-950 text-slate-300 text-[11px] font-mono overflow-x-auto border border-border/60">
          {embedCode}
        </pre>
        <Button
          size="sm"
          onClick={handleCopy}
          className="absolute top-2.5 right-2.5 h-7 rounded-xl text-xs gap-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copiado" : "Copiar Código"}
        </Button>
      </div>
    </div>
  );
}
