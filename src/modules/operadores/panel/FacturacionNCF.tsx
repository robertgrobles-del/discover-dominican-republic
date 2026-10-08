import { 
  Download, Receipt, ShieldCheck, Printer 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useOrg } from "./OrgContext";

interface NcfInvoice {
  id: string;
  ncf: string; // Ej: B0100000045 (Factura de Crédito Fiscal)
  type: "B01" | "B02" | "B15";
  typeName: string;
  period: string;
  issueDate: string;
  subtotal: number;
  itbis: number;
  total: number;
  currency: "DOP";
  status: "paid" | "pending";
}

const SAMPLE_INVOICES: NcfInvoice[] = [
  { id: "inv-01", ncf: "B0100000045", type: "B01", typeName: "Crédito Fiscal", period: "Septiembre 2026", issueDate: "2026-09-30", subtotal: 5000, itbis: 900, total: 5900, currency: "DOP", status: "paid" },
  { id: "inv-02", ncf: "B0100000028", type: "B01", typeName: "Crédito Fiscal", period: "Agosto 2026", issueDate: "2026-08-31", subtotal: 5000, itbis: 900, total: 5900, currency: "DOP", status: "paid" },
  { id: "inv-03", ncf: "B0100000012", type: "B01", typeName: "Crédito Fiscal", period: "Julio 2026", issueDate: "2026-07-31", subtotal: 5000, itbis: 900, total: 5900, currency: "DOP", status: "paid" },
];

export function FacturacionNCF() {
  const { org } = useOrg();

  const handlePrintPdfInvoice = (inv: NcfInvoice) => {
    const printWindow = window.open("", "_blank", "width=850,height=950");
    if (!printWindow) {
      toast.error("Por favor permite las ventanas emergentes en tu navegador para ver la factura en PDF.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Factura con NCF - ${inv.ncf} - Descubre RD</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; color: #1e293b; background: #fff; }
          .header { border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
          .title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
          .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
          .ncf-box { background: #f8fafc; border: 2px dashed #0284c7; padding: 12px 20px; border-radius: 8px; text-align: right; }
          .ncf-title { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #0284c7; }
          .ncf-number { font-size: 18px; font-family: monospace; font-weight: 900; color: #0f172a; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; font-size: 13px; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .table th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 12px; border-bottom: 2px solid #cbd5e1; }
          .table td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
          .totals { margin-left: auto; width: 300px; font-size: 13px; }
          .totals-row { display: flex; justify-content: space-between; padding: 6px 0; }
          .totals-total { border-top: 2px solid #0f172a; font-weight: 800; font-size: 16px; color: #0f172a; margin-top: 6px; padding-top: 8px; }
          .footer { margin-top: 50px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">DESCUBRE REPÚBLICA DOMINICANA S.R.L.</h1>
            <p class="subtitle">Portal Turístico & Ecosistema Oficial de Promoción Digital</p>
            <p class="subtitle">RNC: 1-32-45678-9 | Tel: (809) 221-4660 | Santo Domingo, D.N.</p>
          </div>
          <div class="ncf-box">
            <div class="ncf-title">Comprobante Fiscal Oficial</div>
            <div class="ncf-number">${inv.ncf}</div>
            <div style="font-size:11px; color:#64748b; margin-top:2px;">${inv.typeName} (${inv.type})</div>
          </div>
        </div>

        <div class="meta-grid">
          <div>
            <strong>DATOS DEL CLIENTE / OPERADOR:</strong><br />
            <strong>Razón Social:</strong> ${org.business_name}<br />
            <strong>RNC / Cédula:</strong> ${org.rnc || "1-01-00000-0"}<br />
            <strong>Estado:</strong> REGISTRADO EN MITUR
          </div>
          <div style="text-align: right;">
            <strong>DETALLES DE EMISIÓN:</strong><br />
            <strong>Fecha de Emisión:</strong> ${inv.issueDate}<br />
            <strong>Periodo Fiscal:</strong> ${inv.period}<br />
            <strong>Condición de Pago:</strong> AL CONTADO (PAGADO)
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Descripción del Servicio</th>
              <th style="text-align:center;">Cant.</th>
              <th style="text-align:right;">Precio Unitario</th>
              <th style="text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Suscripción Plan Destacado - Ecosistema Descubre RD</strong><br />
                <span style="font-size:11px; color:#64748b;">Publicación de ficha comercial, posicionamiento SEO, recepción de leads directos a WhatsApp y protección competitiva.</span>
              </td>
              <td style="text-align:center;">1</td>
              <td style="text-align:right;">RD$ ${inv.subtotal.toLocaleString("es-DO")}.00</td>
              <td style="text-align:right;">RD$ ${inv.subtotal.toLocaleString("es-DO")}.00</td>
            </tr>
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row">
            <span>Subtotal:</span>
            <span>RD$ ${inv.subtotal.toLocaleString("es-DO")}.00</span>
          </div>
          <div class="totals-row">
            <span>ITBIS Facturado (18%):</span>
            <span>RD$ ${inv.itbis.toLocaleString("es-DO")}.00</span>
          </div>
          <div class="totals-row totals-total">
            <span>Total Pagado:</span>
            <span>RD$ ${inv.total.toLocaleString("es-DO")}.00</span>
          </div>
        </div>

        <div class="footer">
          <p>Documento emitido conforme a las regulaciones de la Dirección General de Impuestos Internos (DGII).</p>
          <p>Válido para crédito fiscal y reporte de compras formato 606. Conservar para fines tributarios.</p>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadInvoice = (inv: NcfInvoice) => {
    // Generate text receipt for 606 import
    const receiptContent = `
=====================================================
          DESCUBRE REPÚBLICA DOMINICANA S.R.L.
               RNC: 1-32-45678-9
      Av. México esq. 30 de Marzo, Santo Domingo
=====================================================
COMPROBANTE FISCAL: ${inv.ncf}
TIPO: ${inv.typeName} (${inv.type})
FECHA DE EMISIÓN: ${inv.issueDate}
PERIODO FISCAL: ${inv.period}

CLIENTE / OPERADOR: ${org.business_name}
RNC / CÉDULA: ${org.rnc || "1-01-00000-0"}
ESTADO: ${inv.status === "paid" ? "PAGADO - VALIDADOR DGII" : "PENDIENTE"}

DETALLE DE SERVICIO:
Suscripción Plan Destacado Ecosistema Turístico RD
-----------------------------------------------------
SUBTOTAL:                  RD$ ${inv.subtotal.toLocaleString("es-DO")}.00
ITBIS (18%):               RD$ ${inv.itbis.toLocaleString("es-DO")}.00
TOTAL FACTURADO:           RD$ ${inv.total.toLocaleString("es-DO")}.00
=====================================================
Comprobante emitido conforme a la Norma General DGII.
`.trim();

    const blob = new Blob([receiptContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Factura_NCF_${inv.ncf}_${org.business_name.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Factura NCF ${inv.ncf} descargada`, {
      description: "Comprobante fiscal listo para reporte tributario 606 DGII."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary" />
            <span>Facturación & Comprobantes Fiscales (NCF)</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Descarga o imprime tus facturas con comprobante fiscal oficial para declaración en DGII.
          </p>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold px-3 py-1">
          <ShieldCheck className="h-3.5 w-3.5 mr-1" /> RNC Validado
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SAMPLE_INVOICES.map((inv) => (
          <Card key={inv.id} className="rounded-2xl border-border/80 bg-card hover:border-primary/40 transition-all shadow-xs">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <Badge variant="outline" className="font-mono text-xs font-bold bg-primary/10 text-primary border-primary/20">
                  {inv.ncf}
                </Badge>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]">
                  Pagado
                </Badge>
              </div>
              <CardTitle className="text-base font-bold text-foreground mt-2">
                {inv.period}
              </CardTitle>
              <CardDescription className="text-xs">
                Emitida el {inv.issueDate}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 pt-2 space-y-3">
              <div className="space-y-1 text-xs border-t border-border/60 pt-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span>RD$ {inv.subtotal.toLocaleString("es-DO")}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>ITBIS (18%):</span>
                  <span>RD$ {inv.itbis.toLocaleString("es-DO")}</span>
                </div>
                <div className="flex justify-between font-bold text-foreground text-sm pt-1 border-t border-border/40">
                  <span>Total:</span>
                  <span className="text-primary font-mono">RD$ {inv.total.toLocaleString("es-DO")}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handlePrintPdfInvoice(inv)}
                  className="gap-1.5 rounded-xl text-xs font-semibold"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Imprimir / PDF</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadInvoice(inv)}
                  className="gap-1.5 rounded-xl text-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>TXT 606</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
