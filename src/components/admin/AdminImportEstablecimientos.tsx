import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CheckCircle, AlertCircle, Loader2, Database, FileText } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { readValidatedTextFile } from "@/lib/forms";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { submitEstablecimientosImport, pollImportJobUntilFinished } from "@/lib/adminImportsApi";

interface ImportResult {
  file: string;
  inserted: number;
  updated?: number;
  error?: string;
}

const BUNDLED_FILES = [
  { name: "Turismo de Aventura", path: "/data/turismo-aventura.csv" },
  { name: "Gift Shops", path: "/data/gift-shops.csv" },
  { name: "Hospedaje", path: "/data/hospedaje.csv" },
  { name: "Agencias de Viajes", path: "/data/agencias-viajes.csv" },
  { name: "Alimentos y Bebidas", path: "/data/alimentos-bebidas.csv" },
];

export function AdminImportEstablecimientos() {
  const [importing, setImporting] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<string | null>(null);
  const [results, setResults] = useState<ImportResult[]>([]);

  const importCsv = async (fileName: string, csvText: string): Promise<ImportResult> => {
    if (HAS_BACKEND_SESSION) {
      try {
        const { job_id } = await submitEstablecimientosImport(csvText, { fileName });
        setCurrentProgress(`Procesando ${fileName}...`);
        const job = await pollImportJobUntilFinished(job_id, (j) => {
          if (j.total > 0) {
            setCurrentProgress(`Procesando ${fileName} (${j.progress}% - ${j.processed}/${j.total})`);
          }
        });
        if (job.status === "failed") {
          return { file: fileName, inserted: 0, error: job.error || "Falló la importación" };
        }
        return {
          file: fileName,
          inserted: job.inserted,
          updated: job.updated,
        };
      } catch (err: any) {
        return { file: fileName, inserted: 0, error: err.message || "Error al conectar con el servidor" };
      }
    }

    try {
      const { data, error } = await supabase.functions.invoke("import-establecimientos", {
        body: { csv_text: csvText },
      });
      if (error) return { file: fileName, inserted: 0, error: error.message };
      return { file: fileName, inserted: data?.inserted || 0 };
    } catch (err: any) {
      return { file: fileName, inserted: 0, error: err.message };
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    if (Array.from(files).reduce((sum, file) => sum + file.size, 0) > 20 * 1024 * 1024) {
      toast.error("La selección supera el máximo total de 20 MB.");
      e.target.value = "";
      return;
    }
    setImporting(true);
    setResults([]);
    const newResults: ImportResult[] = [];
    try {
      for (const file of Array.from(files)) {
        try {
          const text = await readValidatedTextFile(file, [".csv", ".txt", ".tsv"], 10 * 1024 * 1024);
          newResults.push(await importCsv(file.name, text));
        } catch (error) {
          newResults.push({ file: file.name, inserted: 0, error: error instanceof Error ? error.message : "Archivo inválido" });
        }
        setResults([...newResults]);
      }
    } finally {
      setImporting(false);
      setCurrentProgress(null);
      e.target.value = "";
    }
    setResults(newResults);
    const total = newResults.reduce((sum, r) => sum + r.inserted, 0);
    const failures = newResults.filter((result) => result.error).length;
    if (failures) toast.error(`${total.toLocaleString()} registros importados; ${failures} archivo(s) requieren corrección.`);
    else toast.success(`Importación completada: ${total.toLocaleString()} registros`);
  };
  const handleImportBundled = async () => {
    setImporting(true);
    setResults([]);
    const newResults: ImportResult[] = [];
    try {
      for (const file of BUNDLED_FILES) {
        try {
          const resp = await fetch(file.path);
          const text = await resp.text();
          newResults.push(await importCsv(file.name, text));
          setResults([...newResults]);
        } catch (err: any) {
          newResults.push({ file: file.name, inserted: 0, error: err.message });
          setResults([...newResults]);
        }
      }
    } finally {
      setImporting(false);
      setCurrentProgress(null);
    }
    const total = newResults.reduce((sum, r) => sum + r.inserted, 0);
    toast.success(`Importación completada: ${total.toLocaleString()} registros`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar Establecimientos (CSV)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            Importa establecimientos turísticos del MITUR. Puedes subir archivos <Badge variant="outline">CSV</Badge> o <Badge variant="outline">TXT</Badge> delimitados por comas, tabuladores o pipes.
          </div>
          <p className="text-xs text-muted-foreground">
            Formato esperado: Subsector, Actividad, RUT, No. Identificación, Nombre, Sector/Zona, Provincia, Estatus Proceso, Estatus Licencia, Estatus Establecimiento, Fecha Vencimiento, Teléfono, Correo
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleImportBundled} disabled={importing}>
            {importing ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importando...</>
            ) : (
              <><Database className="h-4 w-4 mr-2" /> Importar datos MITUR precargados</>
            )}
          </Button>

          <Button asChild disabled={importing} variant="outline">
            <label className="cursor-pointer">
              <FileText className="h-4 w-4 mr-2" /> Subir archivo (CSV / TXT)
              <input
                type="file"
                accept=".txt,.csv,.tsv"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                disabled={importing}
              />
            </label>
          </Button>
        </div>

        {importing && currentProgress && (
          <div className="flex items-center gap-2 text-xs text-primary font-medium p-2.5 rounded bg-primary/10">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>{currentProgress}</span>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/50">
                {r.error ? (
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                )}
                <span className="font-medium">{r.file}</span>
                {r.error ? (
                  <span className="text-destructive text-xs">{r.error}</span>
                ) : (
                  <span className="text-muted-foreground">
                    {r.inserted.toLocaleString()} nuevos
                    {r.updated ? ` · ${r.updated.toLocaleString()} actualizados` : ""}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
