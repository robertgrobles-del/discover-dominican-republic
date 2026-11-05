import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminTranslations,
  saveAdminTranslation,
  type TranslationItem,
} from "@/lib/adminOperationsApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages, Search, RefreshCw, CheckCircle2, Sparkles, UserCheck, Edit3 } from "lucide-react";
import { toast } from "sonner";

const LOCALES = [
  { code: "en", label: "Inglés (en)" },
  { code: "fr", label: "Francés (fr)" },
  { code: "de", label: "Alemán (de)" },
  { code: "it", label: "Italiano (it)" },
  { code: "pt", label: "Portugués (pt)" },
  { code: "ru", label: "Ruso (ru)" },
];

export default function AdminTranslationsManager() {
  const queryClient = useQueryClient();
  const [localeFilter, setLocaleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [editingItem, setEditingItem] = useState<TranslationItem | null>(null);
  const [editedText, setEditedText] = useState("");

  const { data: translationsData, isLoading, refetch } = useQuery({
    queryKey: ["admin-translations", page, localeFilter, statusFilter, entityTypeFilter],
    queryFn: () =>
      getAdminTranslations({
        page,
        per_page: 30,
        locale: localeFilter === "all" ? undefined : localeFilter,
        status: statusFilter === "all" ? undefined : (statusFilter as any),
        entity_type: entityTypeFilter === "all" ? undefined : entityTypeFilter,
      }),
  });

  const saveMutation = useMutation({
    mutationFn: ({ entity_type, entity_id, locale, field_name, text }: { entity_type: string; entity_id: string; locale: string; field_name: string; text: string }) =>
      saveAdminTranslation(entity_type, entity_id, locale, { [field_name]: text }, true),
    onSuccess: () => {
      toast.success("Traducción guardada y marcada como revisada");
      setEditingItem(null);
      queryClient.invalidateQueries({ queryKey: ["admin-translations"] });
    },
    onError: (err: any) => toast.error(`Error al guardar: ${err.message}`),
  });

  const items = translationsData?.data ?? [];
  const meta = translationsData?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Languages className="w-6 h-6 text-indigo-500" />
            Gestor de Traducciones e Idiomas
          </h2>
          <p className="text-sm text-muted-foreground">
            Control de calidad editorial para contenidos traducidos automáticamente o revisados por humanos.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refrescar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-card border rounded-xl p-3">
        <Select value={localeFilter} onValueChange={(v) => { setLocaleFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Idioma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los idiomas</SelectItem>
            {LOCALES.map((l) => (
              <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[150px] h-9">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="machine">Automática (IA)</SelectItem>
            <SelectItem value="human">Humana</SelectItem>
            <SelectItem value="reviewed">Revisada</SelectItem>
          </SelectContent>
        </Select>

        <Select value={entityTypeFilter} onValueChange={(v) => { setEntityTypeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[150px] h-9">
            <SelectValue placeholder="Colección" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las colecciones</SelectItem>
            <SelectItem value="articles">Artículos</SelectItem>
            <SelectItem value="destinations">Destinos</SelectItem>
            <SelectItem value="beaches">Playas</SelectItem>
            <SelectItem value="events">Eventos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b text-muted-foreground font-medium">
              <tr>
                <th className="p-3">Colección & Campo</th>
                <th className="p-3">Idioma</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Texto Traducido</th>
                <th className="p-3">Fecha</th>
                <th className="p-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">Cargando traducciones...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No hay traducciones registradas.</td></tr>
              ) : (
                items.map((t, idx) => (
                  <tr key={`${t.entity_type}-${t.entity_id}-${t.locale}-${t.field_name}-${idx}`} className="hover:bg-muted/30 dark:hover:bg-muted/50">
                    <td className="p-3">
                      <div className="font-semibold text-foreground capitalize">{t.entity_type}</div>
                      <div className="text-xs font-mono text-indigo-600">{t.field_name}</div>
                    </td>
                    <td className="p-3 font-mono text-xs uppercase font-bold">{t.locale}</td>
                    <td className="p-3">
                      <Badge
                        variant="outline"
                        className={
                          t.status === "reviewed"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-200"
                            : t.status === "human"
                            ? "bg-blue-500/10 text-blue-500 border-blue-200"
                            : "bg-amber-500/10 text-amber-500 border-amber-200"
                        }
                      >
                        {t.status === "reviewed" ? "Revisada" : t.status === "human" ? "Humana" : "IA (Machine)"}
                      </Badge>
                    </td>
                    <td className="p-3 max-w-md">
                      <p className="text-xs text-foreground line-clamp-2">{t.text}</p>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(t.updated_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingItem(t);
                          setEditedText(t.text);
                        }}
                        className="gap-1 text-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Editar
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.total_pages > 1 && (
          <div className="flex items-center justify-between p-3 border-t text-xs text-muted-foreground">
            <span>Página {meta.page} de {meta.total_pages} ({meta.total} campos)</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Anterior
              </Button>
              <Button size="sm" variant="outline" disabled={page >= meta.total_pages} onClick={() => setPage(page + 1)}>
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={Boolean(editingItem)} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Editar Traducción ({editingItem?.locale.toUpperCase()})
            </DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-3 py-2 text-sm">
              <div className="text-xs bg-muted/50 p-2.5 rounded">
                <span className="text-muted-foreground">Colección:</span> <strong className="capitalize">{editingItem.entity_type}</strong> | <span className="text-muted-foreground">Campo:</span> <strong className="font-mono">{editingItem.field_name}</strong>
              </div>

              <div>
                <label htmlFor="admin-translations-manager-f1" className="text-xs font-semibold text-foreground">Texto Traducido</label>
                <Textarea id="admin-translations-manager-f1"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  rows={6}
                  className="mt-1 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" onClick={() => setEditingItem(null)}>Cancelar</Button>
                <Button
                  disabled={!editedText.trim() || saveMutation.isPending}
                  onClick={() =>
                    saveMutation.mutate({
                      entity_type: editingItem.entity_type,
                      entity_id: editingItem.entity_id,
                      locale: editingItem.locale,
                      field_name: editingItem.field_name,
                      text: editedText.trim(),
                    })
                  }
                  className="gap-1.5"
                >
                  <UserCheck className="w-4 h-4" /> Guardar y Aprobar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
