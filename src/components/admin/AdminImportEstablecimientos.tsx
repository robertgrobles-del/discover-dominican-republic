import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CheckCircle, AlertCircle, Loader2, Database, FileText } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ImportResult {
  file: string;
  inserted: number;
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
  const [results, setResults] = useState<ImportResult[]>([]);

  const importCsv = async (fileName: string, csvText: string): Promise<ImportResult> => {
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
    setImporting(true);
    setResults([]);
    const newResults: ImportResult[] = [];
    for (const file of Array.from(files)) {
      const text = await file.text();
      newResults.push(await importCsv(file.name, text));
    }
    setResults(newResults);
    setImporting(false);
    const total = newResults.reduce((sum, r) => sum + r.inserted, 0);
    toast.success(`Importación completada: ${total.toLocaleString()} registros`);
  };

  const handleImportBundled = async () => {
    setImporting(true);
    setResults([]);
    const newResults: ImportResult[] = [];
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
    setImporting(false);
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
        <p className="text-sm text-muted-foreground">
          Importa establecimientos turísticos del MITUR. Puedes subir archivos CSV o importar los datos precargados.
        </p>

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
              <Upload className="h-4 w-4 mr-2" /> Subir CSV
              <input
                type="file"
                accept=".txt,.csv"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                disabled={importing}
              />
            </label>
          </Button>
        </div>

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
                  <span className="text-muted-foreground">{r.inserted.toLocaleString()} registros</span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
