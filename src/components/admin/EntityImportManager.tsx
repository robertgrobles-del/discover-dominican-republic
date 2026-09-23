import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Upload, FileSpreadsheet, List, AlertTriangle, CheckCircle, XCircle, Loader2, Download,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EntityList } from "@/components/admin/EntityList";
import { EntityType as AdminEntityType } from "@/hooks/useAdminEntities";
import {
  EntityType,
  EntityConfig,
  entityConfigs,
  fieldTypeMap,
  getFieldsConfig
} from "@/components/admin/AdminEntityConfigs";

export function EntityImportManager() {
  const { toast } = useToast();
  const [selectedEntity, setSelectedEntity] = useState<EntityType>('hotels');
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ success: 0, failed: 0 });
  const [entityCounts, setEntityCounts] = useState<Record<EntityType, number>>({} as Record<EntityType, number>);

  useEffect(() => {
    const fetchEntityCounts = async () => {
      const counts: Record<EntityType, number> = {} as Record<EntityType, number>;

      for (const entity of Object.keys(entityConfigs) as EntityType[]) {
        const { count } = await (supabase as any)
          .from(entity)
          .select('*', { count: 'exact', head: true });
        counts[entity] = count || 0;
      }

      setEntityCounts(counts);
    };

    fetchEntityCounts();
  }, []);

  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }

    return data;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const data = parseCSV(text);
      setCsvData(data);
      toast({
        title: "Archivo cargado",
        description: `Se encontraron ${data.length} registros para importar.`
      });
    };
    reader.readAsText(file);
  };

  const processArrayField = (value: string): string[] | null => {
    if (!value || value === '') return null;
    return value.split('|').map(v => v.trim()).filter(v => v);
  };

  const processData = (row: Record<string, string>, entityType: EntityType) => {
    const config = entityConfigs[entityType];
    const processedRow: Record<string, unknown> = {};

    config.fields.forEach(field => {
      if (row[field] !== undefined && row[field] !== '') {
        const type = fieldTypeMap[field] || 'text';
        if (type === 'array') {
          processedRow[field] = processArrayField(row[field]);
        } else if (type === 'boolean') {
          processedRow[field] = row[field].toLowerCase() === 'true' || row[field] === '1';
        } else if (type === 'number') {
          const num = parseFloat(row[field]);
          processedRow[field] = isNaN(num) ? null : num;
        } else {
          processedRow[field] = row[field];
        }
      }
    });

    return processedRow;
  };

  const handleImport = async () => {
    if (csvData.length === 0) {
      toast({
        title: "Error",
        description: "No hay datos para importar.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadProgress({ success: 0, failed: 0 });

    let successCount = 0;
    let failedCount = 0;

    for (const row of csvData) {
      try {
        const processedData = processData(row, selectedEntity);
        const { error } = await (supabase as any)
          .from(selectedEntity)
          .insert([processedData as never]);

        if (error) throw error;
        successCount++;
      } catch (error) {
        console.error('Error inserting row:', error);
        failedCount++;
      }
      setUploadProgress({ success: successCount, failed: failedCount });
    }

    setUploading(false);
    setCsvData([]);

    toast({
      title: "Importación completada",
      description: `${successCount} registros importados exitosamente. ${failedCount > 0 ? `${failedCount} fallidos.` : ''}`
    });

    // Refresh counts
    const { count } = await (supabase as any)
      .from(selectedEntity)
      .select('*', { count: 'exact', head: true });
    setEntityCounts(prev => ({ ...prev, [selectedEntity]: count || 0 }));
  };

  const downloadTemplate = (entityType: EntityType) => {
    const config = entityConfigs[entityType];
    const csvContent = config.fields.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_${entityType}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8 mt-8">
        {(Object.entries(entityConfigs) as [EntityType, EntityConfig][]).slice(0, 6).map(([key, config]) => (
          <Card key={key} className="cursor-pointer hover:border-primary transition-colors" onClick={() => setSelectedEntity(key)}>
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2 text-primary">
                {config.icon}
              </div>
              <p className="text-2xl font-bold">{entityCounts[key] || 0}</p>
              <p className="text-xs text-muted-foreground">{config.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar - Entity Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Entidades</CardTitle>
              <CardDescription>Selecciona el tipo de datos a importar</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="p-4 space-y-1">
                  {(Object.entries(entityConfigs) as [EntityType, EntityConfig][]).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedEntity(key);
                        setCsvData([]);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        selectedEntity === key
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {config.icon}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{config.name}</p>
                        <p className={`text-xs truncate ${selectedEntity === key ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {entityCounts[key] || 0} registros
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Selected Entity Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {entityConfigs[selectedEntity].icon}
                  </div>
                  <div>
                    <CardTitle>{entityConfigs[selectedEntity].name}</CardTitle>
                    <CardDescription>{entityConfigs[selectedEntity].description}</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">{entityCounts[selectedEntity] || 0} registros</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="manage">
                <TabsList className="mb-4">
                  <TabsTrigger value="manage">
                    <List className="h-4 w-4 mr-2" />
                    Gestionar
                  </TabsTrigger>
                  <TabsTrigger value="upload">
                    <Upload className="h-4 w-4 mr-2" />
                    Cargar CSV
                  </TabsTrigger>
                  <TabsTrigger value="template">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Plantilla
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="manage">
                  <EntityList
                    entity={selectedEntity as AdminEntityType}
                    entityName={entityConfigs[selectedEntity].name.slice(0, -1)}
                    fields={getFieldsConfig(selectedEntity)}
                  />
                </TabsContent>

                <TabsContent value="upload" className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Formato de archivo</AlertTitle>
                    <AlertDescription>
                      El archivo CSV debe contener las columnas definidas en la plantilla.
                      Para campos múltiples (arrays), separa los valores con el caracter "|".
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="csv-file">Archivo CSV</Label>
                    <Input
                      id="csv-file"
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </div>

                  {csvData.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          {csvData.length} registros listos para importar
                        </p>
                        <Button onClick={handleImport} disabled={uploading}>
                          {uploading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Importando...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Importar Datos
                            </>
                          )}
                        </Button>
                      </div>

                      {uploading && (
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-primary">
                            <CheckCircle className="h-4 w-4" />
                            {uploadProgress.success} exitosos
                          </span>
                          <span className="flex items-center gap-1 text-destructive">
                            <XCircle className="h-4 w-4" />
                            {uploadProgress.failed} fallidos
                          </span>
                        </div>
                      )}

                      <ScrollArea className="h-[300px] border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {Object.keys(csvData[0] || {}).map(header => (
                                <TableHead key={header} className="whitespace-nowrap">
                                  {header}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {csvData.slice(0, 10).map((row, index) => (
                              <TableRow key={index}>
                                {Object.values(row).map((value, i) => (
                                  <TableCell key={i} className="max-w-[200px] truncate">
                                    {value}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                      {csvData.length > 10 && (
                        <p className="text-xs text-muted-foreground text-center">
                          Mostrando 10 de {csvData.length} registros
                        </p>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="template" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Campos disponibles:</h4>
                      <div className="flex flex-wrap gap-2">
                        {entityConfigs[selectedEntity].fields.map(field => (
                          <Badge
                            key={field}
                            variant={entityConfigs[selectedEntity].requiredFields.includes(field) ? "default" : "secondary"}
                          >
                            {field}
                            {entityConfigs[selectedEntity].requiredFields.includes(field) && " *"}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">* Campos obligatorios</p>
                    </div>

                    <Alert>
                      <FileSpreadsheet className="h-4 w-4" />
                      <AlertTitle>Campos con valores múltiples</AlertTitle>
                      <AlertDescription>
                        Para campos como "amenities", "services", "languages", etc., separa los valores con "|".
                        Ejemplo: WiFi|Piscina|Spa|Gimnasio
                      </AlertDescription>
                    </Alert>

                    <Button onClick={() => downloadTemplate(selectedEntity)} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Descargar Plantilla CSV
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
