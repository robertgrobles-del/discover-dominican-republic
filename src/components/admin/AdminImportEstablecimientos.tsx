import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImportResult {
  file: string;
  inserted: number;
  error?: string;
}

export function AdminImportEstablecimientos() {
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setImporting(true);
    setResults([]);
    const newResults: ImportResult[] = [];

    for (const file of Array.from(files)) {
      try {
        const text = await file.text();
        const { data, error } = await supabase.functions.invoke("import-establecimientos", {
          body: { csv_text: text },
        });

        if (error) {
          newResults.push({ file: file.name, inserted: 0, error: error.message });
        } else {
          newResults.push({ file: file.name, inserted: data.inserted || 0 });
        }
      } catch (err: any) {
        newResults.push({ file: file.name, inserted: 0, error: err.message });
      }
    }

    setResults(newResults);
    setImporting(false);
    const total = newResults.reduce((sum, r) => sum + r.inserted, 0);
    toast.success(`Importación completada: ${total.toLocaleString()} registros insertados`);
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
          Sube archivos CSV con formato del MITUR para importar establecimientos turísticos.
          Formato esperado: Subsector, Actividad, RUT, No. Identificación, Nombre, Sector/Zona, Provincia, etc.
        </p>

        <div className="flex items-center gap-4">
          <Button asChild disabled={importing} variant="outline">
            <label className="cursor-pointer">
              {importing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importando...</>
              ) : (
                <><Upload className="h-4 w-4 mr-2" /> Seleccionar archivos CSV</>
              )}
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
                  <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                )}
                <span className="font-medium">{r.file}</span>
                {r.error ? (
                  <span className="text-destructive">{r.error}</span>
                ) : (
                  <span className="text-muted-foreground">{r.inserted.toLocaleString()} registros importados</span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
