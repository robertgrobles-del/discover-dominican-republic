import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminSiteSettings,
  saveAdminSiteSetting,
  deleteAdminSiteSetting,
  type SiteSettingItem,
} from "@/lib/adminOperationsApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings, Plus, RefreshCw, Edit3, Trash2, Globe, Lock, Search } from "lucide-react";
import { toast } from "sonner";

export default function AdminSiteSettings() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [formKey, setFormKey] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formValueStr, setFormValueStr] = useState("{}");
  const [formIsPublic, setFormIsPublic] = useState(false);

  const { data: settings = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-site-settings"],
    queryFn: getAdminSiteSettings,
  });

  const saveMutation = useMutation({
    mutationFn: ({ key, data }: { key: string; data: { value: any; is_public?: boolean; description?: string } }) =>
      saveAdminSiteSetting(key, data),
    onSuccess: () => {
      toast.success("Ajuste guardado con éxito");
      setIsCreateOpen(false);
      setEditingKey(null);
      queryClient.invalidateQueries({ queryKey: ["admin-site-settings"] });
    },
    onError: (err: any) => toast.error(`Error al guardar: ${err.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminSiteSetting,
    onSuccess: () => {
      toast.success("Ajuste eliminado");
      queryClient.invalidateQueries({ queryKey: ["admin-site-settings"] });
    },
    onError: (err: any) => toast.error(`Error al eliminar: ${err.message}`),
  });

  const handleEdit = (item: SiteSettingItem) => {
    setFormKey(item.key);
    setFormDescription(item.description || "");
    setFormValueStr(typeof item.value === "object" ? JSON.stringify(item.value, null, 2) : String(item.value));
    setFormIsPublic(item.is_public);
    setEditingKey(item.key);
  };

  const handleSave = () => {
    try {
      let parsedValue: any;
      try {
        parsedValue = JSON.parse(formValueStr);
      } catch {
        // If not JSON, treat as raw string/number
        parsedValue = formValueStr;
      }

      saveMutation.mutate({
        key: formKey,
        data: {
          value: parsedValue,
          description: formDescription || undefined,
          is_public: formIsPublic,
        },
      });
    } catch (e: any) {
      toast.error(`Formato inválido: ${e.message}`);
    }
  };

  const filteredSettings = settings.filter(
    (s) =>
      s.key.toLowerCase().includes(search.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            Ajustes Globales del Sitio
          </h2>
          <p className="text-sm text-muted-foreground">
            Variables de configuración, banderas del sistema, parámetros de contacto y configuración en caliente.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Refrescar
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setFormKey("");
              setFormDescription("");
              setFormValueStr("{}");
              setFormIsPublic(false);
              setIsCreateOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> Nuevo Ajuste
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar ajustes por clave o descripción..."
          className="pl-9 h-9"
        />
      </div>

      {/* Settings Table */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b text-muted-foreground font-medium">
              <tr>
                <th className="p-3">Clave (Key)</th>
                <th className="p-3">Descripción</th>
                <th className="p-3">Visibilidad</th>
                <th className="p-3">Valor</th>
                <th className="p-3">Última mod.</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground">
                    Cargando configuración...
                  </td>
                </tr>
              ) : filteredSettings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground">
                    No hay ajustes registrados.
                  </td>
                </tr>
              ) : (
                filteredSettings.map((s) => (
                  <tr key={s.key} className="hover:bg-muted/30 dark:hover:bg-muted/50">
                    <td className="p-3 font-mono font-bold text-xs text-primary">{s.key}</td>
                    <td className="p-3 text-xs text-muted-foreground max-w-xs truncate">
                      {s.description || "—"}
                    </td>
                    <td className="p-3">
                      {s.is_public ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-200 gap-1 text-2xs">
                          <Globe className="w-3 h-3" /> Público
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground gap-1 text-2xs">
                          <Lock className="w-3 h-3" /> Privado
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 font-mono text-xs max-w-xs truncate text-foreground">
                      {typeof s.value === "object" ? JSON.stringify(s.value) : String(s.value)}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(s.updated_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(s)}>
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-500"
                        onClick={() => {
                          if (confirm(`¿Eliminar ajuste ${s.key}?`)) {
                            deleteMutation.mutate(s.key);
                          }
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Modal */}
      <Dialog
        open={isCreateOpen || Boolean(editingKey)}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingKey(null);
          }
        }}
      >
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingKey ? `Editar Ajuste: ${editingKey}` : "Crear Nuevo Ajuste"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-sm">
            <div>
              <label htmlFor="admin-site-settings-f3" className="text-xs font-semibold text-foreground">Clave (Identificador único)</label>
              <Input id="admin-site-settings-f3"
                value={formKey}
                disabled={Boolean(editingKey)}
                onChange={(e) => setFormKey(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ""))}
                placeholder="ej. site_contact_email"
                className="mt-1 font-mono text-xs"
              />
            </div>

            <div>
              <label htmlFor="admin-site-settings-f2" className="text-xs font-semibold text-foreground">Descripción</label>
              <Input id="admin-site-settings-f2"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Para qué sirve este parámetro..."
                className="mt-1 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_public_check"
                checked={formIsPublic}
                onChange={(e) => setFormIsPublic(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="is_public_check" className="text-xs font-medium cursor-pointer text-foreground">
                Público (disponible sin autenticación en <code>/site/settings</code>)
              </label>
            </div>

            <div>
              <label htmlFor="admin-site-settings-f1" className="text-xs font-semibold text-foreground">Valor (JSON o texto)</label>
              <Textarea id="admin-site-settings-f1"
                value={formValueStr}
                onChange={(e) => setFormValueStr(e.target.value)}
                rows={8}
                className="mt-1 font-mono text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingKey(null);
                }}
              >
                Cancelar
              </Button>
              <Button disabled={!formKey.trim() || saveMutation.isPending} onClick={handleSave}>
                {saveMutation.isPending ? "Guardando..." : "Guardar Ajuste"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
