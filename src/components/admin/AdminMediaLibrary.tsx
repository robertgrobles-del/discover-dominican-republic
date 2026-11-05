import { useState } from "react";
import { displayImageUrl } from "@/lib/adminProductsApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminMediaList,
  moderateAdminMedia,
  importAdminMediaUrl,
  type MediaAssetItem,
} from "@/lib/adminOperationsApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image, CheckCircle, XCircle, Download, Search, RefreshCw, Eye, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { activateOnKey } from "@/lib/a11y";
export default function AdminMediaLibrary() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [purposeFilter, setPurposeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [importAlt, setImportAlt] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<MediaAssetItem | null>(null);

  const { data: mediaData, isLoading, refetch } = useQuery({
    queryKey: ["admin-media", page, statusFilter, purposeFilter, search],
    queryFn: () =>
      getAdminMediaList({
        page,
        per_page: 36,
        status: statusFilter === "all" ? undefined : statusFilter,
        purpose: purposeFilter === "all" ? undefined : purposeFilter,
        q: search.trim() || undefined,
      }),
  });

  const moderateMutation = useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: "approve" | "reject"; reason?: string }) =>
      moderateAdminMedia(id, action, reason),
    onSuccess: (_, variables) => {
      toast.success(variables.action === "approve" ? "Imagen aprobada" : "Imagen rechazada");
      setSelectedAsset(null);
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
    },
    onError: (err: any) => toast.error(`Error de moderación: ${err.message}`),
  });

  const importMutation = useMutation({
    mutationFn: importAdminMediaUrl,
    onSuccess: () => {
      toast.success("Imagen importada con éxito");
      setIsImportOpen(false);
      setImportUrl("");
      setImportAlt("");
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
    },
    onError: (err: any) => toast.error(`Error al importar: ${err.message}`),
  });

  const items = mediaData?.data ?? [];
  const meta = mediaData?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Image className="w-6 h-6 text-cyan-500" />
            Biblioteca de Medios y Moderación
          </h2>
          <p className="text-sm text-muted-foreground">
            Imágenes de contenidos, fotos de usuarios por moderar e importación de recursos multimedia.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Refrescar
          </Button>
          <Button size="sm" onClick={() => setIsImportOpen(true)} className="gap-2 bg-cyan-600 hover:bg-cyan-700 text-white">
            <Download className="w-4 h-4" /> Importar desde URL
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-card border rounded-xl p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por texto alternativo o crédito..."
            className="pl-9 h-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="in_review">Por moderar</SelectItem>
            <SelectItem value="ready">Aprobados / Listos</SelectItem>
            <SelectItem value="rejected">Rechazados</SelectItem>
          </SelectContent>
        </Select>

        <Select value={purposeFilter} onValueChange={(v) => { setPurposeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Propósito" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo propósito</SelectItem>
            <SelectItem value="cms">CMS y Artículos</SelectItem>
            <SelectItem value="user_ugc">Fotos de usuarios</SelectItem>
            <SelectItem value="avatar">Avatares</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Cargando biblioteca de medios...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-card border rounded-xl">
          No hay elementos multimedia que coincidan con la búsqueda.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {items.map((item) => (
            <div role="button" tabIndex={0} onKeyDown={activateOnKey}
              key={item.id}
              onClick={() => setSelectedAsset(item)}
              className="group relative bg-card border rounded-xl overflow-hidden shadow-2xs cursor-pointer hover:border-primary transition-all flex flex-col"
            >
              <div className="aspect-square bg-muted/50 overflow-hidden relative">
                {item.url || item.source_url ? (
                  <img
                    src={displayImageUrl(item.variants?.thumb || item.url || item.source_url || "")}
                    alt={item.alt || ""}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Image className="w-8 h-8 opacity-40" />
                  </div>
                )}
                {item.status === "in_review" && (
                  <div className="absolute top-1.5 left-1.5">
                    <Badge className="bg-amber-500 text-white text-3xs px-1.5 py-0 shadow">Por moderar</Badge>
                  </div>
                )}
              </div>
              <div className="p-2 text-2xs space-y-0.5">
                <div className="font-semibold text-foreground truncate">
                  {item.alt || item.credit || "Sin título"}
                </div>
                <div className="text-muted-foreground text-3xs flex justify-between">
                  <span>{item.purpose}</span>
                  <span>{item.width}x{item.height}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.total_pages > 1 && (
        <div className="flex items-center justify-between p-3 border-t text-xs text-muted-foreground">
          <span>Página {meta.page} de {meta.total_pages} ({meta.total} archivos)</span>
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

      {/* Asset Detail & Moderation Modal */}
      <Dialog open={Boolean(selectedAsset)} onOpenChange={(open) => !open && setSelectedAsset(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Detalle de Archivo Multimedia</DialogTitle>
          </DialogHeader>
          {selectedAsset && (
            <div className="space-y-4 text-sm">
              <div className="aspect-video bg-background rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src={displayImageUrl(selectedAsset.variants?.medium || selectedAsset.url || selectedAsset.source_url || "")}
                  alt={selectedAsset.alt || ""}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-muted/50 p-3 rounded-lg">
                <div><span className="text-muted-foreground">Dimensiones:</span> {selectedAsset.width} × {selectedAsset.height} px</div>
                <div><span className="text-muted-foreground">Formato:</span> {selectedAsset.mime}</div>
                <div><span className="text-muted-foreground">Propósito:</span> {selectedAsset.purpose}</div>
                <div><span className="text-muted-foreground">Estado:</span> <Badge variant="outline" className="text-3xs ml-1">{selectedAsset.status}</Badge></div>
                {selectedAsset.credit && (
                  <div className="col-span-2"><span className="text-muted-foreground">Crédito / Autor:</span> {selectedAsset.credit}</div>
                )}
              </div>

              {selectedAsset.status === "in_review" && (
                <div className="flex gap-2 pt-2 border-t justify-end">
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 gap-1.5"
                    onClick={() => {
                      const reason = prompt("Motivo del rechazo:");
                      if (reason) moderateMutation.mutate({ id: selectedAsset.id, action: "reject", reason });
                    }}
                  >
                    <XCircle className="w-4 h-4" /> Rechazar
                  </Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                    onClick={() => moderateMutation.mutate({ id: selectedAsset.id, action: "approve" })}
                  >
                    <CheckCircle className="w-4 h-4" /> Aprobar Imagen
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Import URL Modal */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Importar Imagen desde URL</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-sm">
            <div>
              <label htmlFor="admin-media-library-f2" className="text-xs font-semibold text-foreground">URL de la imagen (HTTPS)</label>
              <Input id="admin-media-library-f2"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="https://ejemplo.com/foto.jpg"
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="admin-media-library-f1" className="text-xs font-semibold text-foreground">Texto Alternativo (Alt)</label>
              <Input id="admin-media-library-f1"
                value={importAlt}
                onChange={(e) => setImportAlt(e.target.value)}
                placeholder="Descripción visual de la imagen"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setIsImportOpen(false)}>Cancelar</Button>
              <Button
                disabled={!importUrl.startsWith("https://") || importMutation.isPending}
                onClick={() => importMutation.mutate({ url: importUrl, alt: importAlt || undefined })}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                {importMutation.isPending ? "Descargando..." : "Importar y Procesar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
