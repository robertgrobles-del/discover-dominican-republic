import { motion } from "framer-motion";
import { FileText, Download, Share2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ExportPDFProps {
  content: {
    title: string;
    data: Record<string, unknown>;
  };
  filename?: string;
}

export function ExportPDF({ content, filename = "documento" }: ExportPDFProps) {
  const handleExport = async () => {
    // Create printable content
    const printContent = generatePrintableHTML(content);
    
    // Open print dialog
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
      
      toast.success("Abriendo ventana de impresión...");
    }
  };

  const handleDownload = () => {
    const printContent = generatePrintableHTML(content);
    const blob = new Blob([printContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Documento descargado");
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
        <Printer className="h-4 w-4" />
        Imprimir
      </Button>
      <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
        <Download className="h-4 w-4" />
        Descargar
      </Button>
    </div>
  );
}

function generatePrintableHTML(content: { title: string; data: Record<string, unknown> }): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${content.title}</title>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 40px;
          color: #1a1a1a;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #0ea5e9;
        }
        .header h1 { 
          font-size: 28px; 
          color: #0ea5e9;
          margin-bottom: 5px;
        }
        .header p { color: #666; }
        .section { margin-bottom: 25px; }
        .section-title { 
          font-size: 18px; 
          font-weight: 600;
          color: #0ea5e9;
          margin-bottom: 10px;
          padding-bottom: 5px;
          border-bottom: 1px solid #e5e5e5;
        }
        .item { 
          display: flex; 
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px dotted #e5e5e5;
        }
        .item-label { color: #666; }
        .item-value { font-weight: 500; }
        .total { 
          font-size: 24px; 
          font-weight: bold;
          color: #0ea5e9;
          text-align: center;
          margin-top: 20px;
          padding: 15px;
          background: #f0f9ff;
          border-radius: 8px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #999;
          font-size: 12px;
        }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${content.title}</h1>
        <p>Generado el ${new Date().toLocaleDateString("es-ES", { 
          year: "numeric", 
          month: "long", 
          day: "numeric" 
        })}</p>
      </div>
      ${generateContentSections(content.data)}
      <div class="footer">
        <p>Documento generado por RD Turismo • www.rdturismo.com</p>
      </div>
    </body>
    </html>
  `;
}

function generateContentSections(data: Record<string, unknown>): string {
  let html = "";
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      html += `<div class="section"><h2 class="section-title">${formatKey(key)}</h2>`;
      for (const [subKey, subValue] of Object.entries(value as Record<string, unknown>)) {
        html += `<div class="item"><span class="item-label">${formatKey(subKey)}</span><span class="item-value">${formatValue(subValue)}</span></div>`;
      }
      html += `</div>`;
    } else if (Array.isArray(value)) {
      html += `<div class="section"><h2 class="section-title">${formatKey(key)}</h2>`;
      value.forEach((item, index) => {
        if (typeof item === "object" && item !== null) {
          html += `<div style="margin-bottom: 15px; padding: 10px; background: #f9f9f9; border-radius: 4px;">`;
          for (const [itemKey, itemValue] of Object.entries(item as Record<string, unknown>)) {
            html += `<div class="item"><span class="item-label">${formatKey(itemKey)}</span><span class="item-value">${formatValue(itemValue)}</span></div>`;
          }
          html += `</div>`;
        } else {
          html += `<div class="item"><span class="item-label">${index + 1}</span><span class="item-value">${item}</span></div>`;
        }
      });
      html += `</div>`;
    } else {
      html += `<div class="item"><span class="item-label">${formatKey(key)}</span><span class="item-value">${formatValue(value)}</span></div>`;
    }
  }
  
  return html;
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function formatValue(value: unknown): string {
  if (typeof value === "number") {
    return value.toLocaleString("es-ES");
  }
  return String(value);
}

// Itinerary-specific PDF export
interface ItineraryDay {
  day: number;
  date: string;
  activities: {
    name: string;
    location: string;
    duration: string;
    time?: string;
  }[];
}

export function exportItineraryToPDF(tripName: string, days: ItineraryDay[]) {
  const data: Record<string, unknown> = {};
  
  days.forEach((day) => {
    data[`Día ${day.day} - ${day.date}`] = day.activities.map((act) => ({
      Actividad: act.name,
      Ubicación: act.location,
      Duración: act.duration,
      ...(act.time && { Hora: act.time }),
    }));
  });

  const content = { title: tripName, data };
  const printContent = generatePrintableHTML(content);
  
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}
