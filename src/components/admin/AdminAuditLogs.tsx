import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, History, Eye, ShieldAlert, Database, Info } from "lucide-react";

interface AuditLog {
  id: string;
  action_type: string;
  entity_name: string;
  entity_id: string;
  ip_address: string;
  user_agent: string;
  old_data: any;
  new_data: any;
  created_at: string;
  profiles?: {
    display_name: string | null;
  } | null;
}

export function AdminAuditLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data: logs, isLoading } = useQuery<AuditLog[]>({
    queryKey: ["admin-audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_activity_logs" as any)
        .select(`
          id,
          action_type,
          entity_name,
          entity_id,
          ip_address,
          user_agent,
          old_data,
          new_data,
          created_at,
          admin_id,
          profiles:id(display_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as any) || [];
    },
    staleTime: 5000,
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case "create":
        return <Badge variant="outline" className="border-emerald-500 text-emerald-500 bg-emerald-500/5 uppercase font-mono text-[9px]">Crear</Badge>;
      case "update":
        return <Badge variant="outline" className="border-blue-500 text-blue-500 bg-blue-500/5 uppercase font-mono text-[9px]">Editar</Badge>;
      case "delete":
        return <Badge variant="outline" className="border-rose-500 text-rose-500 bg-rose-500/5 uppercase font-mono text-[9px]">Borrar</Badge>;
      default:
        return <Badge variant="outline" className="border-muted text-muted bg-muted/5 uppercase font-mono text-[9px]">{action}</Badge>;
    }
  };

  const filteredLogs = logs?.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      log.entity_name?.toLowerCase().includes(term) ||
      log.action_type?.toLowerCase().includes(term) ||
      log.ip_address?.toLowerCase().includes(term) ||
      log.profiles?.display_name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="grid md:grid-cols-5 gap-6">
      {/* Logs Table Area */}
      <div className="md:col-span-3">
        <Card className="border border-border/50">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="h-4 w-4 text-primary" /> Historial de Cambios (Auditoría)
                </CardTitle>
                <CardDescription>Registro del sistema de las últimas operaciones administrativas</CardDescription>
              </div>
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por tabla o acción..."
                  className="pl-9 text-xs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground text-xs">
                Cargando historial de auditoría...
              </div>
            ) : (
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader className="bg-secondary/15">
                    <TableRow>
                      <TableHead className="text-xs">Fecha</TableHead>
                      <TableHead className="text-xs">Administrador</TableHead>
                      <TableHead className="text-xs">Acción</TableHead>
                      <TableHead className="text-xs">Entidad</TableHead>
                      <TableHead className="text-right text-xs">Detalles</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs && filteredLogs.length > 0 ? (
                      filteredLogs.map((log) => (
                        <TableRow 
                          key={log.id} 
                          className={`hover:bg-secondary/10 cursor-pointer ${
                            selectedLog?.id === log.id ? "bg-secondary/20" : ""
                          }`}
                          onClick={() => setSelectedLog(log)}
                        >
                          <TableCell className="text-xs font-mono">
                            {new Date(log.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-xs font-semibold">
                            {log.profiles?.display_name || "Sistema / Edge"}
                          </TableCell>
                          <TableCell className="text-xs">
                            {getActionBadge(log.action_type)}
                          </TableCell>
                          <TableCell className="text-xs font-mono font-bold text-muted-foreground">
                            {log.entity_name}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-primary">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-xs">
                          No se encontraron bitácoras de auditoría registradas.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Log Details Area */}
      <div className="md:col-span-2">
        <Card className="border border-border/50 h-full flex flex-col">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-500" /> Detalle del Log de Actividad
            </CardTitle>
            <CardDescription>Metadatos y diferencias de datos (JSON)</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-4 space-y-4 flex flex-col">
            {selectedLog ? (
              <ScrollArea className="flex-1 h-[450px] pr-2">
                <div className="space-y-4">
                  {/* Metadata fields */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-secondary/10 p-3 rounded-lg border">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Dirección IP</p>
                      <p className="font-mono mt-0.5">{selectedLog.ip_address || "n/a"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">ID del Registro</p>
                      <p className="font-mono truncate mt-0.5" title={selectedLog.entity_id}>{selectedLog.entity_id || "n/a"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Navegador / User Agent</p>
                      <p className="text-[10px] mt-0.5 text-muted-foreground">{selectedLog.user_agent || "n/a"}</p>
                    </div>
                  </div>

                  {/* Changes Delta Visualizer */}
                  {selectedLog.action_type === "update" && (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-rose-500 uppercase flex items-center gap-1">
                          <Database className="h-3.5 w-3.5" /> Estado Anterior (Antes)
                        </span>
                        <pre className="p-3 text-[10px] bg-rose-500/5 text-rose-300 font-mono rounded-lg border border-rose-500/10 overflow-auto max-h-48 whitespace-pre-wrap">
                          {JSON.stringify(selectedLog.old_data, null, 2) || "{}"}
                        </pre>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                          <Database className="h-3.5 w-3.5" /> Estado Nuevo (Después)
                        </span>
                        <pre className="p-3 text-[10px] bg-emerald-500/5 text-emerald-300 font-mono rounded-lg border border-emerald-500/10 overflow-auto max-h-48 whitespace-pre-wrap">
                          {JSON.stringify(selectedLog.new_data, null, 2) || "{}"}
                        </pre>
                      </div>
                    </div>
                  )}

                  {selectedLog.action_type !== "update" && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-primary uppercase flex items-center gap-1">
                        <Database className="h-3.5 w-3.5" /> Datos Registrados
                      </span>
                      <pre className="p-3 text-[10px] bg-primary/5 text-primary/80 font-mono rounded-lg border border-primary/10 overflow-auto max-h-[350px] whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.action_type === "delete" ? selectedLog.old_data : selectedLog.new_data, null, 2) || "{}"}
                      </pre>
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                <Info className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-xs font-semibold">Selecciona una fila</p>
                <p className="text-[10px]">Haz clic en cualquier log de la tabla para ver metadatos detallados e historial de datos.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
