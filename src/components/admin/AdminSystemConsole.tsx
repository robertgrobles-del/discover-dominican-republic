import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Activity, ArrowRightLeft, Play, RefreshCw, CheckCircle2, AlertTriangle,
  Clock, Database, Mail, ShieldAlert, Cpu, Server, Plus, Trash2
} from "lucide-react";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { adminSystemApi, type SeoRedirection, type SystemJob, type SystemHealthData } from "@/lib/adminSystemApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PanelEmptyState } from "@/components/ui/panel-empty-state";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// ---------- D8: Redirecciones SEO ----------
function SeoRedirectsTab() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [newRedirect, setNewRedirect] = useState({
    source_path: "",
    target_path: "",
    redirect_type: 301 as 301 | 302,
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-seo-redirects"],
    queryFn: async () => {
      if (HAS_BACKEND_SESSION) {
        return await adminSystemApi.listRedirects(1, 100);
      }
      const { data, error } = await (supabase as any)
        .from("seo_redirections")
        .select("*")
        .order("source_path");
      if (error) throw error;
      return { data: (data || []) as SeoRedirection[], meta: { total: (data || []).length } };
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: typeof newRedirect) => {
      if (HAS_BACKEND_SESSION) {
        return await adminSystemApi.createRedirect(payload);
      }
      const { data, error } = await (supabase as any)
        .from("seo_redirections")
        .insert({ ...payload, is_active: true })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Redirección SEO creada exitosamente");
      setIsOpen(false);
      setNewRedirect({ source_path: "", target_path: "", redirect_type: 301 });
      void queryClient.invalidateQueries({ queryKey: ["admin-seo-redirects"] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Error al crear la redirección");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      if (HAS_BACKEND_SESSION) {
        return await adminSystemApi.updateRedirect(id, { is_active });
      }
      const { error } = await (supabase as any)
        .from("seo_redirections")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Estado de la redirección actualizado");
      void queryClient.invalidateQueries({ queryKey: ["admin-seo-redirects"] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Error al actualizar");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (HAS_BACKEND_SESSION) {
        return await adminSystemApi.deleteRedirect(id);
      }
      const { error } = await (supabase as any).from("seo_redirections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Redirección eliminada");
      void queryClient.invalidateQueries({ queryKey: ["admin-seo-redirects"] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    },
  });

  const list = data?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-lg flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-indigo-500" /> Redirecciones SEO (D8)
          </h3>
          <p className="text-xs text-muted-foreground">
            Administra reglas de redirección permanente (301) y temporal (302) para URLs migradas o antiguas.
          </p>
        </div>
        <Button size="sm" onClick={() => setIsOpen(true)} className="rounded-xl text-xs gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Nueva Redirección
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando redirecciones SEO...</p>}
      {isError && (
        <p className="text-sm text-destructive">
          Error: {error instanceof Error ? error.message : "No se pudieron obtener las redirecciones"}
        </p>
      )}

      {!isLoading && !isError && list.length === 0 && (
        <PanelEmptyState
          icon={ArrowRightLeft}
          title="Sin redirecciones configuradas"
          description="Crea la primera redirección SEO para evitar errores 404 en rutas cambiadas."
        />
      )}

      {!isLoading && !isError && list.length > 0 && (
        <div className="space-y-2">
          {list.map((r) => (
            <Card key={r.id} className="border border-border/60">
              <CardContent className="p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 font-mono truncate">
                  <Badge variant="outline" className="font-sans text-[10px]">
                    {r.redirect_type}
                  </Badge>
                  <span className="text-foreground font-semibold">{r.source_path}</span>
                  <span className="text-muted-foreground">➔</span>
                  <span className="text-primary">{r.target_path}</span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <span className="text-[11px] text-muted-foreground">
                      {r.is_active ? "Activa" : "Inactiva"}
                    </span>
                    <Switch
                      checked={r.is_active}
                      onCheckedChange={(v) => toggleMutation.mutate({ id: r.id, is_active: v })}
                    />
                  </label>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-destructive hover:bg-destructive/10"
                    onClick={() => deleteMutation.mutate(r.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Nueva Redirección SEO</DialogTitle>
            <DialogDescription className="text-xs">
              Ruta de origen (ej. /vieja-ruta) y ruta/URL de destino (ej. /nueva-ruta).
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newRedirect.source_path.startsWith("/") || !newRedirect.target_path) {
                return toast.error("La ruta de origen debe comenzar con /");
              }
              createMutation.mutate(newRedirect);
            }}
            className="space-y-4 pt-2"
          >
            <div>
              <Label className="text-xs">Ruta Origen *</Label>
              <Input
                required
                placeholder="/gastronomia-vieja"
                value={newRedirect.source_path}
                onChange={(e) => setNewRedirect({ ...newRedirect, source_path: e.target.value })}
                className="text-xs h-9 mt-1 font-mono"
              />
            </div>

            <div>
              <Label className="text-xs">Ruta/URL Destino *</Label>
              <Input
                required
                placeholder="/guia-gastronomica"
                value={newRedirect.target_path}
                onChange={(e) => setNewRedirect({ ...newRedirect, target_path: e.target.value })}
                className="text-xs h-9 mt-1 font-mono"
              />
            </div>

            <div>
              <Label className="text-xs">Código HTTP de Redirección</Label>
              <Select
                value={String(newRedirect.redirect_type)}
                onValueChange={(val) =>
                  setNewRedirect({ ...newRedirect, redirect_type: Number(val) as 301 | 302 })
                }
              >
                <SelectTrigger className="h-9 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="301">301 - Permanente (Recomendado para SEO)</SelectItem>
                  <SelectItem value="302">302 - Temporal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Guardando..." : "Crear Redirección"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------- D10: Tareas Programadas (Jobs) ----------
function SystemJobsTab() {
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading, isError, error } = useQuery<SystemJob[]>({
    queryKey: ["admin-system-jobs"],
    queryFn: async () => {
      if (HAS_BACKEND_SESSION) {
        return await adminSystemApi.listJobs();
      }
      return [
        { name: "newsletter.send", description: "Envío de campañas masivas por lotes", enabled: true, every_seconds: 300, status: "idle" },
        { name: "ads.expiring", description: "Alerta de banners por vencer", enabled: true, every_seconds: 86400, status: "idle" },
        { name: "ads.cleanup", description: "Limpieza de marcas de impresión de anuncios", enabled: true, every_seconds: 86400, status: "idle" },
      ];
    },
  });

  const runMutation = useMutation({
    mutationFn: async (name: string) => {
      if (HAS_BACKEND_SESSION) {
        return await adminSystemApi.runJob(name);
      }
      toast.info(`Simulación de ejecución de trabajo: ${name}`);
    },
    onSuccess: (_, name) => {
      toast.success(`Trabajo "${name}" ejecutado correctamente`);
      void queryClient.invalidateQueries({ queryKey: ["admin-system-jobs"] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Fallo al ejecutar trabajo");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ name, enabled }: { name: string; enabled: boolean }) => {
      if (HAS_BACKEND_SESSION) {
        return await adminSystemApi.updateJob(name, { enabled });
      }
    },
    onSuccess: () => {
      toast.success("Estado del trabajo actualizado");
      void queryClient.invalidateQueries({ queryKey: ["admin-system-jobs"] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Error al actualizar el trabajo");
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" /> Tareas Programadas / Jobs (D10)
          </h3>
          <p className="text-xs text-muted-foreground">
            Monitoreo y ejecución manual de procesos en segundo plano (boletines, limpieza, alertas de anuncios).
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="rounded-xl text-xs gap-1.5"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-system-jobs"] })}
        >
          <RefreshCw className="h-3.5 w-3.5" /> Actualizar Lista
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando tareas programadas...</p>}
      {isError && (
        <p className="text-sm text-destructive">
          Error al obtener tareas: {error instanceof Error ? error.message : "Error del servidor"}
        </p>
      )}

      {!isLoading && !isError && (
        <div className="space-y-3">
          {jobs.map((j) => (
            <Card key={j.name} className="border border-border/60">
              <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="font-mono text-primary text-sm">{j.name}</span>
                    <Badge variant={j.enabled ? "default" : "secondary"}>
                      {j.enabled ? "Habilitado" : "Deshabilitado"}
                    </Badge>
                    {j.status && (
                      <Badge variant={j.status === "failed" ? "destructive" : "outline"}>
                        {j.status}
                      </Badge>
                    )}
                  </div>
                  {j.description && <p className="text-muted-foreground">{j.description}</p>}
                  {j.last_run_at && (
                    <p className="text-[11px] text-muted-foreground">
                      Última ejecución: {new Date(j.last_run_at).toLocaleString("es-DO")}
                    </p>
                  )}
                  {j.error_log && <p className="text-destructive font-mono text-[11px]">{j.error_log}</p>}
                </div>

                <div className="flex items-center gap-3">
                  {HAS_BACKEND_SESSION && (
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <Switch
                        checked={j.enabled}
                        onCheckedChange={(v) => toggleMutation.mutate({ name: j.name, enabled: v })}
                      />
                    </label>
                  )}
                  <Button
                    size="sm"
                    className="gap-1 rounded-lg text-xs"
                    disabled={runMutation.isPending}
                    onClick={() => runMutation.mutate(j.name)}
                  >
                    <Play className="h-3.5 w-3.5" /> Ejecutar Ahora
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- D11: Salud del Sistema ----------
function SystemHealthTab() {
  const { data: health, isLoading, isError, error, refetch } = useQuery<SystemHealthData>({
    queryKey: ["admin-system-health"],
    queryFn: async () => {
      if (HAS_BACKEND_SESSION) {
        return await adminSystemApi.getHealth();
      }
      return {
        database: { ok: true, latency_ms: 4 },
        mail_queue: { last_7d: { sent: 120, failed: 0 } },
        jobs: [],
        payments: { provider: "fake" },
        version: "0.1.0",
        node: "v20.18.0",
        uptime_seconds: 3600,
      };
    },
    staleTime: 30_000,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-500" /> Salud del Sistema (D11)
          </h3>
          <p className="text-xs text-muted-foreground">
            Diagnóstico en tiempo real de la base de datos, colas de correo, servicios y pasarela de pagos.
          </p>
        </div>
        <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1.5" onClick={() => refetch()}>
          <RefreshCw className="h-3.5 w-3.5" /> Recargar Estado
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Consultando diagnóstico del servidor...</p>}
      {isError && (
        <p className="text-sm text-destructive">
          Error al obtener salud del sistema: {error instanceof Error ? error.message : "Error de comunicación"}
        </p>
      )}

      {!isLoading && !isError && health && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <Card className="border-border/60">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" /> Base de Datos (PostgreSQL)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-1">
              <p className="flex items-center gap-2">
                Estado:{" "}
                <Badge variant={health.database.ok ? "default" : "destructive"}>
                  {health.database.ok ? "Operativa" : "Error"}
                </Badge>
              </p>
              <p className="text-muted-foreground">Latencia: {health.database.latency_ms} ms</p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500" /> Cola de Correo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-1">
              <p className="text-muted-foreground">
                Enviados últimos 7 días: {Object.values(health.mail_queue.last_7d || {}).reduce((a, b) => a + b, 0)}
              </p>
              {health.mail_queue.oldest_queued_seconds !== undefined && (
                <p className="text-muted-foreground">
                  Mensaje más antiguo en cola: {health.mail_queue.oldest_queued_seconds ?? 0} s
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Cpu className="h-4 w-4 text-amber-500" /> Servidor & Entorno
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-1">
              <p className="text-muted-foreground">Versión API: {health.version || "0.1.0"}</p>
              <p className="text-muted-foreground">Runtime Node: {health.node || "N/A"}</p>
              <p className="text-muted-foreground">
                Tiempo activo: {Math.round((health.uptime_seconds || 0) / 60)} min
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ---------- Componente Principal Consola de Sistema ----------
export function AdminSystemConsole() {
  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="p-6 border-b border-border/50">
        <CardTitle className="font-display text-xl flex items-center gap-2">
          <Server className="h-5 w-5 text-primary" /> Consola de Operación y Salud del Sistema
        </CardTitle>
        <CardDescription className="text-xs mt-1">
          Centro de control para redirecciones SEO, tareas en segundo plano (jobs) y estado del servidor Fastify.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs defaultValue="redirects">
          <TabsList className="mb-4">
            <TabsTrigger value="redirects">Redirecciones SEO (D8)</TabsTrigger>
            <TabsTrigger value="jobs">Tareas Programadas (D10)</TabsTrigger>
            <TabsTrigger value="health">Salud del Sistema (D11)</TabsTrigger>
          </TabsList>

          <TabsContent value="redirects">
            <SeoRedirectsTab />
          </TabsContent>

          <TabsContent value="jobs">
            <SystemJobsTab />
          </TabsContent>

          <TabsContent value="health">
            <SystemHealthTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
