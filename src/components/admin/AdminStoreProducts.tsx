import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, ImagePlus, Link2, Loader2, Package, Pencil, Plus, Search, Star, Tags, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PanelEmptyState } from "@/components/ui/panel-empty-state";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { safeExternalUrl } from "@/lib/security";
import {
  ACCEPTED_IMAGE_TYPES, MAX_PRODUCT_IMAGES, deleteProduct, deleteProductType, displayImageUrl, isInUseError, listProductTypes, listProducts,
  saveProduct, saveProductType, slugify, uploadProductImage, type AdminProduct, type AdminProductInput, type ProductType,
} from "@/lib/adminProductsApi";

const money = (amount: number) => new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP", maximumFractionDigits: 2 }).format(amount);
const errorText = (error: unknown) => (error instanceof Error ? error.message : "Error desconocido");
const toList = (text: string) => text.split(",").map((part) => part.trim()).filter(Boolean);

interface ProductForm { id: string | null; name: string; slug: string; slugTouched: boolean; category: string; price: string; stock: string; tagline: string; description: string; sizes: string; colors: string; images: string[]; active: boolean; featured: boolean }

const emptyForm = (category: string): ProductForm => ({ id: null, name: "", slug: "", slugTouched: false, category, price: "", stock: "0", tagline: "", description: "", sizes: "", colors: "", images: [], active: true, featured: false });
const formOf = (p: AdminProduct): ProductForm => ({
  id: p.id, name: p.name, slug: p.slug, slugTouched: true, category: p.category, price: String(p.price), stock: String(p.stock), tagline: p.tagline ?? "", description: p.description ?? "",
  sizes: p.sizes.join(", "), colors: p.colors.join(", "), images: p.images, active: p.active, featured: p.featured,
});

/** Fotos del producto: subir varias a la vez, añadir por enlace, reordenar y quitar. La primera es la portada. */
function PhotoEditor({ images, onChange }: { images: string[]; onChange: (images: string[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [link, setLink] = useState("");
  const room = MAX_PRODUCT_IMAGES - images.length;

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    const picked = Array.from(files).slice(0, room);
    if (picked.length < files.length) toast.info(`Solo caben ${room} fotos más (máximo ${MAX_PRODUCT_IMAGES} por producto).`);
    setUploading(picked.length);
    const added: string[] = [];
    for (const file of picked) {
      try {
        added.push(await uploadProductImage(file));
      } catch (error) {
        toast.error("No se pudo subir una foto", { description: errorText(error) });
      }
      setUploading((n) => n - 1);
    }
    setUploading(0);
    if (added.length) onChange([...images, ...added]);
    if (input.current) input.current.value = "";
  };

  const addLink = () => {
    const url = safeExternalUrl(link.trim());
    if (!url) { toast.error("Escribe un enlace completo que empiece por https://"); return; }
    if (images.includes(url)) { toast.info("Esa foto ya está en la lista."); return; }
    onChange([...images, url]);
    setLink("");
  };

  const move = (index: number, delta: number) => {
    const next = [...images];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Fotos ({images.length} de {MAX_PRODUCT_IMAGES})</Label>
        <span className="text-xs text-muted-foreground">La primera es la portada.</span>
      </div>

      {images.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((url, index) => (
            <li key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
              <img src={displayImageUrl(url)} alt={`Foto ${index + 1}`} loading="lazy" className="h-full w-full object-cover" />
              {index === 0 && <span className="absolute left-1.5 top-1.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">Portada</span>}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 p-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                <div className="flex">
                  <button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Mover la foto ${index + 1} antes`} className="rounded p-1 text-white hover:bg-white/20 disabled:opacity-30"><ArrowLeft className="h-3.5 w-3.5" /></button>
                  <button type="button" disabled={index === images.length - 1} onClick={() => move(index, 1)} aria-label={`Mover la foto ${index + 1} después`} className="rounded p-1 text-white hover:bg-white/20 disabled:opacity-30"><ArrowRight className="h-3.5 w-3.5" /></button>
                </div>
                <button type="button" onClick={() => onChange(images.filter((_, i) => i !== index))} aria-label={`Quitar la foto ${index + 1}`} className="rounded p-1 text-white hover:bg-white/20"><X className="h-3.5 w-3.5" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <input ref={input} type="file" accept={ACCEPTED_IMAGE_TYPES.join(",")} multiple hidden onChange={(e) => void upload(e.target.files)} />
        <Button type="button" variant="outline" disabled={room <= 0 || uploading > 0} onClick={() => input.current?.click()}>
          {uploading > 0 ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subiendo {uploading}…</> : <><ImagePlus className="mr-2 h-4 w-4" /> Subir fotos</>}
        </Button>
        <div className="flex flex-1 gap-2">
          <Input value={link} onChange={(e) => setLink(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLink(); } }} placeholder="o pega el enlace de una foto" aria-label="Enlace de una foto" disabled={room <= 0} />
          <Button type="button" variant="ghost" size="icon" onClick={addLink} disabled={!link.trim() || room <= 0} aria-label="Agregar foto por enlace"><Link2 className="h-4 w-4" /></Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">JPG, PNG, WebP o GIF de hasta 10 MB cada una. Puedes elegir varias a la vez.</p>
    </div>
  );
}

function ProductsTab({ types }: { types: ProductType[] }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<ProductForm | null>(null);

  const { data, isLoading, isError, error } = useQuery({ queryKey: ["admin-store-products", search.trim(), page], queryFn: () => listProducts({ q: search.trim() || undefined, page }) });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-store-products"] }); qc.invalidateQueries({ queryKey: ["store"] }); };
  const typeName = useMemo(() => new Map(types.map((t) => [t.slug, t.name])), [types]);
  const products = (data?.data ?? []).filter((p) => typeFilter === "all" || p.category === typeFilter);
  const meta = data?.meta;

  const save = useMutation({
    mutationFn: (f: ProductForm) => {
      const input: AdminProductInput = {
        slug: f.slug, name: f.name.trim(), category: f.category, price: Number(f.price), stock: Number(f.stock), active: f.active, featured: f.featured,
        sizes: toList(f.sizes), colors: toList(f.colors), tagline: f.tagline.trim() || null, description: f.description.trim() || null, images: f.images,
      };
      return saveProduct(f.id, input);
    },
    onSuccess: (_, f) => { toast.success(f.id ? "Producto actualizado" : "Producto creado"); setForm(null); refresh(); },
    onError: (e) => toast.error("No se pudo guardar el producto", { description: errorText(e) }),
  });
  const toggle = useMutation({
    mutationFn: (input: { id: string; active: boolean }) => saveProduct(input.id, { active: input.active }),
    onSuccess: refresh,
    onError: (e) => toast.error("No se pudo cambiar el estado", { description: errorText(e) }),
  });
  const remove = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => { toast.success("Producto retirado del catálogo"); refresh(); },
    onError: (e) => toast.error("No se pudo retirar el producto", { description: errorText(e) }),
  });

  const priceOk = form ? form.price.trim() !== "" && Number(form.price) >= 0 && Number.isFinite(Number(form.price)) : false;
  const stockOk = form ? /^\d+$/.test(form.stock.trim()) : false;
  const valid = form && form.name.trim().length >= 2 && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(form.slug) && form.slug.length >= 2 && form.category && priceOk && stockOk;
  const patch = (changes: Partial<ProductForm>) => setForm((cur) => (cur ? { ...cur, ...changes } : cur));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por nombre" aria-label="Buscar productos" className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="lg:w-56" aria-label="Filtrar por tipo"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {types.map((t) => <SelectItem key={t.id} value={t.slug}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button disabled={types.length === 0} onClick={() => setForm(emptyForm(types.find((t) => t.is_active)?.slug ?? types[0]?.slug ?? ""))}><Plus className="mr-1 h-4 w-4" /> Nuevo producto</Button>
      </div>

      {types.length === 0 && <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm">Crea primero un tipo de producto en la pestaña «Tipos».</p>}
      {isLoading && <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}
      {isError && <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">No se pudieron cargar los productos: {errorText(error)}</p>}
      {!isLoading && !isError && products.length === 0 && <PanelEmptyState icon={Package} title="Sin productos" description={search || typeFilter !== "all" ? "Ningún producto coincide con el filtro." : "Crea el primer producto de la tienda."} />}

      {products.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Producto</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 text-right font-semibold">Precio</th>
                <th className="px-4 py-3 text-right font-semibold">Existencias</th>
                <th className="px-4 py-3 font-semibold">Fotos</th>
                <th className="px-4 py-3 font-semibold">A la venta</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                        {p.images[0] ? <img src={displayImageUrl(p.images[0])} alt="" loading="lazy" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-muted-foreground"><Package className="h-5 w-5" /></div>}
                      </div>
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 font-medium">{p.name}{p.featured && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-label="Destacado" />}</p>
                        <p className="truncate font-mono text-xs text-muted-foreground">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{typeName.get(p.category) ?? p.category}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{money(p.price)}</td>
                  <td className={`px-4 py-3 text-right tabular-nums ${p.stock === 0 ? "font-semibold text-destructive" : p.stock <= 5 ? "font-semibold text-amber-500" : ""}`}>{p.stock}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.images.length}</td>
                  <td className="px-4 py-3"><Switch checked={p.active} disabled={toggle.isPending} aria-label={`Poner a la venta ${p.name}`} onCheckedChange={(checked) => toggle.mutate({ id: p.id, active: checked })} /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="outline" onClick={() => setForm(formOf(p))}><Pencil className="mr-1 h-3.5 w-3.5" /> Editar</Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" disabled={remove.isPending} aria-label={`Retirar ${p.name}`}
                        onClick={() => { if (window.confirm(`¿Retirar «${p.name}» del catálogo? Los pedidos ya hechos no cambian.`)) remove.mutate(p.id); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.total_pages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{meta.total} productos · página {meta.page} de {meta.total_pages}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</Button>
            <Button size="sm" variant="outline" disabled={page >= meta.total_pages} onClick={() => setPage(page + 1)}>Siguiente</Button>
          </div>
        </div>
      )}

      <Dialog open={form !== null} onOpenChange={(open) => { if (!open) setForm(null); }}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form?.id ? "Editar producto" : "Nuevo producto"}</DialogTitle>
            <DialogDescription>Los precios van en pesos dominicanos e incluyen ITBIS.</DialogDescription>
          </DialogHeader>
          {form && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="pr-name">Nombre</Label>
                <Input id="pr-name" value={form.name} maxLength={120} onChange={(e) => patch({ name: e.target.value, ...(form.slugTouched ? {} : { slug: slugify(e.target.value) }) })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pr-type">Tipo</Label>
                <Select value={form.category} onValueChange={(v) => patch({ category: v })}>
                  <SelectTrigger id="pr-type"><SelectValue placeholder="Elige un tipo" /></SelectTrigger>
                  <SelectContent>{types.map((t) => <SelectItem key={t.id} value={t.slug}>{t.name}{t.is_active ? "" : " (inactivo)"}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pr-slug">Dirección en la tienda</Label>
                <Input id="pr-slug" value={form.slug} maxLength={80} className="font-mono text-sm" onChange={(e) => patch({ slug: slugify(e.target.value), slugTouched: true })} />
                <p className="text-xs text-muted-foreground">/tienda/{form.slug || "…"}</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pr-price">Precio (RD$)</Label>
                <Input id="pr-price" type="number" inputMode="decimal" min={0} step="0.01" value={form.price} onChange={(e) => patch({ price: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pr-stock">Existencias</Label>
                <Input id="pr-stock" type="number" inputMode="numeric" min={0} step={1} value={form.stock} onChange={(e) => patch({ stock: e.target.value })} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="pr-tagline">Frase corta (opcional)</Label>
                <Input id="pr-tagline" value={form.tagline} maxLength={200} onChange={(e) => patch({ tagline: e.target.value })} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="pr-description">Descripción</Label>
                <Textarea id="pr-description" rows={5} value={form.description} maxLength={4000} onChange={(e) => patch({ description: e.target.value })} />
              </div>
              <div className="sm:col-span-2"><PhotoEditor images={form.images} onChange={(images) => patch({ images })} /></div>
              <div className="space-y-1.5">
                <Label htmlFor="pr-sizes">Tallas (opcional)</Label>
                <Input id="pr-sizes" value={form.sizes} placeholder="S, M, L" onChange={(e) => patch({ sizes: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pr-colors">Colores (opcional)</Label>
                <Input id="pr-colors" value={form.colors} placeholder="Azul, Coral" onChange={(e) => patch({ colors: e.target.value })} />
              </div>
              <div className="flex items-center gap-2"><Switch id="pr-active" checked={form.active} onCheckedChange={(checked) => patch({ active: checked })} /><Label htmlFor="pr-active">A la venta</Label></div>
              <div className="flex items-center gap-2"><Switch id="pr-featured" checked={form.featured} onCheckedChange={(checked) => patch({ featured: checked })} /><Label htmlFor="pr-featured">Destacado en la portada</Label></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setForm(null)}>Cancelar</Button>
            <Button disabled={!valid || save.isPending} onClick={() => form && save.mutate(form)}>
              {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {form?.id ? "Guardar cambios" : "Crear producto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TypesTab({ types, loading }: { types: ProductType[]; loading: boolean }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<{ id: string | null; name: string; slug: string; slugTouched: boolean } | null>(null);
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-product-types"] }); qc.invalidateQueries({ queryKey: ["store"] }); };

  const save = useMutation({
    mutationFn: (input: { id: string | null; data: Partial<Omit<ProductType, "id">> }) => saveProductType(input.id, input.data),
    onSuccess: () => { toast.success("Tipo guardado"); setEditing(null); refresh(); },
    onError: (e) => toast.error("No se pudo guardar el tipo", { description: errorText(e) }),
  });
  const remove = useMutation({
    mutationFn: deleteProductType,
    onSuccess: () => { toast.success("Tipo eliminado"); refresh(); },
    onError: (e) => toast.error("No se pudo eliminar el tipo", { description: isInUseError(e) ? "Todavía tiene productos (también cuentan los retirados). Desactívalo para que no aparezca en la tienda." : errorText(e) }),
  });

  const valid = editing && editing.name.trim().length >= 2 && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(editing.slug) && editing.slug.length >= 2;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">Los tipos agrupan los productos en la tienda. Un tipo sin productos a la venta no se muestra.</p>
        <Button onClick={() => setEditing({ id: null, name: "", slug: "", slugTouched: false })}><Plus className="mr-1 h-4 w-4" /> Nuevo tipo</Button>
      </div>
      {loading && <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}
      {!loading && types.length === 0 && <PanelEmptyState icon={Tags} title="Sin tipos de producto" description="Crea el primero para poder cargar productos." />}
      {types.length > 0 && (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {types.map((type) => (
            <li key={type.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{type.name}</p>
                <p className="font-mono text-xs text-muted-foreground">{type.slug}</p>
              </div>
              <Badge variant={type.is_active ? "default" : "secondary"}>{type.is_active ? "Activo" : "Inactivo"}</Badge>
              <Switch checked={type.is_active} disabled={save.isPending} aria-label={`Activar ${type.name}`} onCheckedChange={(checked) => save.mutate({ id: type.id, data: { is_active: checked } })} />
              <Button size="sm" variant="outline" onClick={() => setEditing({ id: type.id, name: type.name, slug: type.slug, slugTouched: true })}><Pencil className="mr-1 h-3.5 w-3.5" /> Editar</Button>
              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" disabled={remove.isPending} aria-label={`Eliminar ${type.name}`}
                onClick={() => { if (window.confirm(`¿Eliminar el tipo «${type.name}»?`)) remove.mutate(type.id); }}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => { if (!open) setEditing(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar tipo" : "Nuevo tipo de producto"}</DialogTitle>
            <DialogDescription>El nombre es el que ve el cliente en la tienda.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="ty-name">Nombre</Label>
                <Input id="ty-name" value={editing.name} maxLength={60} onChange={(e) => setEditing({ ...editing, name: e.target.value, ...(editing.slugTouched ? {} : { slug: slugify(e.target.value).slice(0, 40) }) })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ty-slug">Identificador</Label>
                <Input id="ty-slug" value={editing.slug} maxLength={40} className="font-mono text-sm" onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value).slice(0, 40), slugTouched: true })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button disabled={!valid || save.isPending} onClick={() => editing && save.mutate({ id: editing.id, data: { name: editing.name.trim(), slug: editing.slug, ...(editing.id ? {} : { sort_order: types.length + 1 }) } })}>
              {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Catálogo de la tienda: productos con sus fotos, precio y existencias, y los tipos que los agrupan. */
export function AdminStoreProducts() {
  const { data: types = [], isLoading } = useQuery({ queryKey: ["admin-product-types"], queryFn: listProductTypes, enabled: HAS_BACKEND_SESSION });
  if (!HAS_BACKEND_SESSION) {
    return <PanelEmptyState icon={Package} title="El catálogo se gestiona en el backend" description="Inicia sesión contra el backend para cargar productos." />;
  }
  return (
    <Tabs defaultValue="products" className="space-y-4">
      <TabsList>
        <TabsTrigger value="products">Productos</TabsTrigger>
        <TabsTrigger value="types">Tipos</TabsTrigger>
      </TabsList>
      <TabsContent value="products"><ProductsTab types={types} /></TabsContent>
      <TabsContent value="types"><TypesTab types={types} loading={isLoading} /></TabsContent>
    </Tabs>
  );
}
