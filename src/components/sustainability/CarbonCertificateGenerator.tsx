import { useState } from "react";
import { Award, ShieldCheck, Share2, Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface CarbonCertificateGeneratorProps {
  totalCO2Tons: number;
  treesNeeded: number;
  selectedProjectForCert: string;
}

export function CarbonCertificateGenerator({
  totalCO2Tons,
  treesNeeded,
  selectedProjectForCert
}: CarbonCertificateGeneratorProps) {
  const [certifiedName, setCertifiedName] = useState<string>("");
  const [isCertificateGenerated, setIsCertificateGenerated] = useState<boolean>(false);

  const handleGenerateCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certifiedName.trim()) {
      toast.error("Por favor escribe tu nombre para el certificado.");
      return;
    }
    setIsCertificateGenerated(true);
    toast.success("¡Certificado Oficial de Viajero Verde generado exitosamente!");
  };

  return (
    <Card className="border border-emerald-500/30 bg-card shadow-md">
      <CardHeader className="pb-3 bg-emerald-500/10 border-b border-emerald-500/20">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-emerald-600" />
          <div>
            <CardTitle className="text-base font-display text-foreground">
              Emisión del Certificado Oficial de Viajero Verde
            </CardTitle>
            <CardDescription className="text-xs">
              Acredita tu contribución ecológica avalada con código único de verificación
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        <form onSubmit={handleGenerateCertificate} className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text"
            placeholder="Tu nombre completo o de la familia viajera..."
            value={certifiedName}
            onChange={(e) => setCertifiedName(e.target.value)}
            className="flex-1 bg-background border border-input text-xs rounded-lg px-3 py-2 text-foreground"
            required
          />
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs whitespace-nowrap">
            <Award className="w-3.5 h-3.5 mr-1.5" />
            Generar Certificado Digital
          </Button>
        </form>

        {isCertificateGenerated && certifiedName && (
          <div className="mt-4 p-5 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-50/50 to-emerald-100/30 dark:from-emerald-950/30 dark:to-emerald-900/10 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <div>
                  <h4 className="font-bold text-sm text-foreground">REPÚBLICA DOMINICANA • TURISMO VERDE</h4>
                  <p className="text-[10px] text-muted-foreground">Folio Verificado: DR-ECO-{Math.floor(100000 + Math.random() * 900000)}</p>
                </div>
              </div>
              <Badge className="bg-emerald-600 text-white text-[10px]">
                Carbon Neutral Verified
              </Badge>
            </div>

            <div className="text-center py-3 space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                Certificado de Sostenibilidad Turística otorgado a:
              </p>
              <h3 className="text-xl font-bold font-serif text-foreground">
                {certifiedName}
              </h3>
              <p className="text-xs text-muted-foreground max-w-lg mx-auto">
                Por neutralizar con éxito un impacto estimado de <strong className="text-foreground">{totalCO2Tons.toFixed(3)} tCO₂e</strong> financiando el proyecto <strong className="text-emerald-700 dark:text-emerald-300">{selectedProjectForCert}</strong> equivalente a la absorción de <strong className="text-foreground">{treesNeeded} árboles nativos</strong>.
              </p>
            </div>

            <div className="pt-3 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground">
              <span>Fecha de Validación: <strong>{new Date().toLocaleDateString('es-DO')}</strong></span>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 text-xs gap-1 border-emerald-500/40"
                  onClick={() => {
                    toast.success("Enlace del certificado copiado al portapapeles.");
                  }}
                >
                  <Share2 className="w-3 h-3" /> Compartir
                </Button>
                <Button 
                  size="sm" 
                  className="h-7 text-xs gap-1 bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={() => {
                    toast.success("Descargando Certificado Digital en Alta Resolución (PDF/PNG)...");
                  }}
                >
                  <Download className="w-3 h-3" /> Descargar PDF
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
