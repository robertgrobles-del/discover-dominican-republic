import React, { useState } from "react";
import { Download, FileSpreadsheet, FileText, Calendar, Filter, CheckCircle2, TrendingUp, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface AdCampaignMetric {
  id: string;
  sponsor: string;
  campaign_name: string;
  format: string;
  placement: string;
  impressions: number;
  clicks: number;
  viewable_impressions: number;
  ctr: string;
  cpm_estimate: string;
  cpc_estimate: string;
  utm_campaign: string;
  status: string;
  date_range: string;
}

const SAMPLE_METRICS: AdCampaignMetric[] = [
  { id: "ad-01", sponsor: "Cerveza Presidente", campaign_name: "Festival Presidente 2026", format: "Pantalla Completa (1920x250)", placement: "Pre-Footer Global", impressions: 45200, viewable_impressions: 39800, clicks: 1890, ctr: "4.18%", cpm_estimate: "$4.50 USD", cpc_estimate: "$0.11 USD", utm_campaign: "descubrerd_festival_2026", status: "Activa", date_range: "01 Sep - 30 Oct 2026" },
  { id: "ad-02", sponsor: "Banco Popular", campaign_name: "Financiamiento Turismo Eco", format: "Billboard (970x250)", placement: "Header Explorar", impressions: 28400, viewable_impressions: 26100, clicks: 940, ctr: "3.31%", cpm_estimate: "$5.00 USD", cpc_estimate: "$0.15 USD", utm_campaign: "descubrerd_banco_popular_eco", status: "Activa", date_range: "15 Sep - 15 Nov 2026" },
  { id: "ad-03", sponsor: "Arajet", campaign_name: "Vuela Directo a RD", format: "HalfPage (300x600)", placement: "Sidebar Alojamientos", impressions: 19800, viewable_impressions: 17900, clicks: 810, ctr: "4.09%", cpm_estimate: "$6.00 USD", cpc_estimate: "$0.14 USD", utm_campaign: "descubrerd_arajet_vuelos", status: "Activa", date_range: "01 Oct - 31 Dic 2026" },
  { id: "ad-04", sponsor: "Ron Barceló", campaign_name: "Experiencia Imperial Colonial", format: "Rectángulo (300x250)", placement: "Guía Gastronómica", impressions: 14200, viewable_impressions: 13100, clicks: 520, ctr: "3.66%", cpm_estimate: "$4.00 USD", cpc_estimate: "$0.10 USD", utm_campaign: "descubrerd_barcelo_imperial", status: "Activa", date_range: "20 Sep - 20 Oct 2026" },
];

export function ExportAdMetricsDialog({ triggerButton }: { triggerButton?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<"csv" | "excel">("csv");
  const [selectedRange, setSelectedRange] = useState("octubre_2026");

  const handleExport = () => {
    const head = [
      "ID", 
      "Anunciante / Patrocinador", 
      "Nombre de Campaña", 
      "Formato IAB", 
      "Ubicación", 
      "Impresiones Servidas", 
      "Impresiones Visibles (vCPM IAB)",
      "Clics Únicos", 
      "CTR (%)", 
      "CPM Estimado",
      "CPC Promedio",
      "UTM Campaign",
      "Estado", 
      "Periodo"
    ];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = SAMPLE_METRICS.map(m => [
      m.id, 
      m.sponsor, 
      m.campaign_name, 
      m.format, 
      m.placement, 
      m.impressions, 
      m.viewable_impressions,
      m.clicks, 
      m.ctr, 
      m.cpm_estimate,
      m.cpc_estimate,
      m.utm_campaign,
      m.status, 
      m.date_range
    ].map(esc).join(","));
    const csvContent = [head.join(","), ...rows].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `informe_publicidad_descubrerd_${selectedRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("¡Informe de publicidad exportado!", {
      description: "El archivo CSV/Excel se ha descargado con todas las métricas de clics e impresiones."
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" size="sm" className="gap-2 rounded-xl text-xs">
            <Download className="h-3.5 w-3.5" />
            <span>Exportar Informe Publicitario</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md rounded-3xl p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary border-primary/20 font-bold">
              ● Ad Server Reporting
            </Badge>
          </div>
          <DialogTitle className="font-display text-xl font-bold text-foreground">
            Exportar Métricas de Publicidad
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Genera un reporte auditado de impresiones, clics únicos y CTR para entrega formal a marcas y anunciantes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-3">
          {/* Format selection */}
          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Formato de Archivo:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat("csv")}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  format === "csv" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 border-border"
                }`}
              >
                <FileSpreadsheet className="h-4 w-4" /> CSV / Excel UTF-8
              </button>
              <button
                type="button"
                onClick={() => setFormat("excel")}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  format === "excel" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 border-border"
                }`}
              >
                <FileText className="h-4 w-4" /> Resumen Ejecutivo
              </button>
            </div>
          </div>

          {/* Quick Metrics Summary */}
          <div className="p-3.5 bg-muted/40 rounded-2xl border border-border/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Campañas Activas:</span>
              <span className="font-bold text-foreground">{SAMPLE_METRICS.length} campañas</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Impresiones Totales:</span>
              <span className="font-mono font-bold text-primary">107,600</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Clics Únicos Auditados:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">4,160</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1 border-t border-border/60">
              <span className="text-muted-foreground font-semibold">CTR Promedio Ecosistema:</span>
              <span className="font-mono font-black text-amber-500">3.86%</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)} className="rounded-xl text-xs">
            Cancelar
          </Button>
          <Button size="sm" onClick={handleExport} className="gap-2 rounded-xl text-xs font-bold shadow-md">
            <Download className="h-4 w-4" />
            <span>Descargar Archivo</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
