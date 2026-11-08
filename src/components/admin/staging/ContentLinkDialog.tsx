import { useState, useEffect, useMemo } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Link2, Search, Newspaper, Plane, FileText, Calendar, 
  ExternalLink, Check, Compass, Globe, Building2 
} from "lucide-react";
import { 
  useSiteContentIndex, 
  filterContentItems, 
  type ContentItemType, 
  type SiteContentItem 
} from "@/lib/siteContentIndex";
import { toast } from "sonner";

interface ContentLinkDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (result: { url: string; text?: string; openInNewTab?: boolean }) => void;
  initialUrl?: string;
  initialText?: string;
}

export function ContentLinkDialog({
  open,
  onClose,
  onSelect,
  initialUrl = "",
  initialText = "",
}: ContentLinkDialogProps) {
  const { allItems, isLoading } = useSiteContentIndex();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<ContentItemType | "all">("all");
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState(initialText);
  const [openInNewTab, setOpenInNewTab] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Sincronizar estado cuando abre o cambian props iniciales
  useEffect(() => {
    if (open) {
      setUrl(initialUrl || "");
      setText(initialText || "");
      setSearchQuery("");
      setSelectedType("all");
      setSelectedItemId(null);
      // Por defecto, abre en nueva pestaña si es enlace externo
      setOpenInNewTab(/^https?:\/\//i.test(initialUrl));
    }
  }, [open, initialUrl, initialText]);

  // Lista filtrada reactivamente
  const filteredItems = useMemo(() => {
    return filterContentItems(allItems, searchQuery, selectedType);
  }, [allItems, searchQuery, selectedType]);

  const handleSelectContent = (item: SiteContentItem) => {
    setUrl(item.url);
    setSelectedItemId(item.id);
    if (!text.trim()) {
      setText(item.title);
    }
    // Enlaces internos por defecto en la misma pestaña
    setOpenInNewTab(false);
  };

  const handleConfirm = () => {
    const cleanUrl = url.trim();
    if (!cleanUrl) {
      toast.error("Por favor ingresa o selecciona una URL");
      return;
    }

    // Acepta URLs relativas internas (/...) o completas con protocolo
    const isValid = /^(\/|https?:\/\/|mailto:|tel:)/i.test(cleanUrl);
    if (!isValid) {
      toast.error("El enlace debe ser una ruta interna (ej. /noticias) o una URL válida (http/https)");
      return;
    }

    onSelect({
      url: cleanUrl,
      text: text.trim() || undefined,
      openInNewTab,
    });
    onClose();
  };

  const getIconForType = (type: ContentItemType) => {
    switch (type) {
      case "noticia":
        return <Newspaper className="h-4 w-4 text-sky-500" />;
      case "aeropuerto":
        return <Plane className="h-4 w-4 text-emerald-500" />;
      case "negocio":
        return <Building2 className="h-4 w-4 text-indigo-500" />;
      case "evento":
        return <Calendar className="h-4 w-4 text-amber-500" />;
      case "pagina":
      default:
        return <FileText className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="pb-3 border-b border-border/80">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
            <Link2 className="h-4 w-4" />
            <span>Selector Inteligente de Enlaces</span>
          </div>
          <DialogTitle className="text-xl font-black">
            Vincular Publicación o Página del Sitio
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Busca y enlaza noticias publicadas, aeropuertos, páginas oficiales y eventos sin romper enlaces.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1">
          {/* Campos de URL y Texto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/40 p-3.5 rounded-xl border border-border/80">
            <div>
              <Label htmlFor="link-url-input" className="text-xs font-bold text-foreground">
                URL de Destino
              </Label>
              <div className="relative mt-1">
                <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="link-url-input"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setSelectedItemId(null);
                  }}
                  placeholder="ej. /noticias/mi-articulo o https://..."
                  className="pl-8 text-xs font-mono h-9 rounded-lg"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="link-text-input" className="text-xs font-bold text-foreground">
                Texto del Enlace
              </Label>
              <Input
                id="link-text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Texto visible para el lector"
                className="mt-1 text-xs h-9 rounded-lg"
              />
            </div>

            <div className="sm:col-span-2 flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={openInNewTab}
                  onChange={(e) => setOpenInNewTab(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <span>Abrir en una pestaña nueva ({`target="_blank"`})</span>
              </label>

              {url && (
                <span className="text-3xs font-mono text-muted-foreground truncate max-w-[200px]">
                  Ruta: {url}
                </span>
              )}
            </div>
          </div>

          {/* Buscador de Contenido Indexado */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Explorar Contenidos Indexados ({allItems.length})
              </Label>
              {isLoading && (
                <span className="text-3xs text-muted-foreground animate-pulse">
                  Actualizando publicaciones...
                </span>
              )}
            </div>

            {/* Input de Búsqueda */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, slug o categoría..."
                className="pl-9 text-xs h-9 rounded-lg"
              />
            </div>

            {/* Filtros por Categoría */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[
                { type: "all" as const, label: "Todos", count: allItems.length },
                { type: "noticia" as const, label: "Noticias", count: allItems.filter(i => i.type === "noticia").length },
                { type: "negocio" as const, label: "Empresas", count: allItems.filter(i => i.type === "negocio").length },
                { type: "aeropuerto" as const, label: "Aeropuertos", count: allItems.filter(i => i.type === "aeropuerto").length },
                { type: "pagina" as const, label: "Páginas", count: allItems.filter(i => i.type === "pagina").length },
                { type: "evento" as const, label: "Eventos", count: allItems.filter(i => i.type === "evento").length },
              ].map((f) => (
                <button
                  key={f.type}
                  type="button"
                  onClick={() => setSelectedType(f.type)}
                  className={`px-2.5 py-1 rounded-md text-2xs font-bold transition-colors ${
                    selectedType === f.type
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>

            {/* Lista de Resultados */}
            <div className="border border-border/80 rounded-xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-border/60">
              {filteredItems.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No se encontraron publicaciones ni páginas con "{searchQuery}".
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = selectedItemId === item.id || url === item.url;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectContent(item)}
                      className={`w-full text-left p-3 flex items-start justify-between gap-3 transition-colors ${
                        isSelected
                          ? "bg-primary/10 border-l-4 border-l-primary"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="mt-0.5 shrink-0">
                          {getIconForType(item.type)}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isSelected ? "text-primary" : "text-foreground"}`}>
                            {item.title}
                          </p>
                          <p className="text-3xs font-mono text-muted-foreground truncate">
                            {item.url}
                          </p>
                          {item.description && (
                            <p className="text-3xs text-muted-foreground line-clamp-1 mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-3xs font-medium rounded-md px-1.5 py-0">
                          {item.badge}
                        </Badge>
                        {isSelected && (
                          <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border/80 flex sm:justify-between items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="rounded-lg text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="rounded-lg text-xs font-bold px-5"
          >
            Insertar Enlace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
