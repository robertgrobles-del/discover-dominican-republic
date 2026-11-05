import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Check, Copy, Link2, Loader2, MousePointerClick, Plus, ShoppingBag, UserPlus, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchApi } from "@/lib/fastifyClient";

interface AffiliateLink { id: string; code: string; target_path: string; label: string | null; clicks: number; signups: number; orders: number; estimated: number; confirmed: number; created_at: string }
interface Overview { commission_rate: number; attribution_window_days: number; max_links: number; totals: { clicks: number; signups: number; orders: number; estimated: number; confirmed: number }; links: AffiliateLink[] }

const KEY = ["creator-affiliate"] as const;
/** Destinos donde una compra genera comisión hoy (tienda y marketplace); el creador puede escribir cualquier otra página. */
const SUGGESTED = [
  { path: "/tienda", label: "Tienda oficial" },
  { path: "/marketplace", label: "Marketplace de artesanos" },
];
const money = (n: number) => `RD$ ${n.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fullUrl = (l: AffiliateLink) => {
  const url = new URL(l.target_path, window.location.origin);
  url.searchParams.set("ref", l.code);
  return url.toString();
};

/** Enlaces de afiliado del creador: cada uno con su código, sus clics y las comisiones de los pedidos que trae. */
export function CreatorsAffiliatesTab() {
  const queryClient = useQueryClient();
  const [target, setTarget] = useState("");
  const [label, setLabel] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({ queryKey: KEY, queryFn: async () => (await fetchApi<{ data: Overview }>("/creators/me/affiliate")).data });

  const create = useMutation({
    mutationFn: async (input: { target_path: string; label?: string }) => (await fetchApi<{ data: AffiliateLink & { created: boolean } }>("/creators/me/affiliate/links", { method: "POST", body: JSON.stringify(input) })).data,
    onSuccess: (link) => {
      toast.success(link.created ? "Enlace creado" : "Ya tenías un enlace para esa página");
      setTarget(""); setLabel("");
      queryClient.invalidateQueries({ queryKey: KEY });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "No se pudo crear el enlace"),
  });
  const archive = useMutation({
    mutationFn: (id: string) => fetchApi(`/creators/me/affiliate/links/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast.success("Enlace archivado"); queryClient.invalidateQueries({ queryKey: KEY }); },
    onError: (err) => toast.error(err instanceof Error ? err.message : "No se pudo archivar"),
  });

  const copy = async (l: AffiliateLink) => {
    try { await navigator.clipboard.writeText(fullUrl(l)); setCopied(l.id); setTimeout(() => setCopied(null), 2000); }
    catch { toast.error("No se pudo copiar; selecciona el enlace y cópialo a mano"); }
  };
  const path = target.trim();
  const pathOk = !path || /^\/(?!\/)/.test(path);

  if (isLoading) return <Skeleton className="h-96 rounded-3xl" />;
  if (isError || !data) return (
    <Card><CardContent className="flex items-center justify-between gap-3 p-6 text-sm">
      <span>No pudimos cargar tus enlaces.</span><Button size="sm" variant="outline" onClick={() => refetch()}>Reintentar</Button>
    </CardContent></Card>
  );

  const stats = [
    { label: "Clics", value: data.totals.clicks.toLocaleString("es-DO"), icon: MousePointerClick },
    { label: "Registros", value: data.totals.signups.toLocaleString("es-DO"), icon: UserPlus },
    { label: "Pedidos atribuidos", value: data.totals.orders.toLocaleString("es-DO"), icon: ShoppingBag },
    { label: "Comisión estimada", value: money(data.totals.estimated), icon: Wallet },
    { label: "Comisión confirmada", value: money(data.totals.confirmed), icon: Check },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label}><CardContent className="p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground"><s.icon className="h-3.5 w-3.5 text-primary" />{s.label}</p>
            <p className="mt-1 text-xl font-black text-foreground">{s.value}</p>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Link2 className="h-5 w-5 text-primary" />Crear un enlace</CardTitle>
          <CardDescription>
            Ganas el {data.commission_rate} % de las compras en la tienda y el marketplace que lleguen por tu enlace. La comisión aparece como estimada y se confirma a los {data.attribution_window_days} días si el pedido no se devuelve. Tus propias compras no cuentan. Si alguien se registra con tu enlace, ambos reciben puntos cuando verifique su correo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {SUGGESTED.map((s) => (
              <Button key={s.path} type="button" size="sm" variant="outline" className="rounded-full" disabled={create.isPending} onClick={() => create.mutate({ target_path: s.path, label: s.label })}>
                <Plus className="mr-1 h-3.5 w-3.5" />{s.label}
              </Button>
            ))}
          </div>
          <form className="grid gap-3 sm:grid-cols-[1fr_12rem_auto] sm:items-end" onSubmit={(e) => { e.preventDefault(); if (path && pathOk) create.mutate({ target_path: path, label: label.trim() || undefined }); }}>
            <div className="space-y-1.5">
              <Label htmlFor="aff-path">Página del sitio</Label>
              <Input id="aff-path" placeholder="/tienda/afiche-samana" value={target} maxLength={300} onChange={(e) => setTarget(e.target.value)} aria-invalid={!pathOk} />
              {!pathOk && <p className="text-xs text-destructive">Escribe la ruta de una página de Descubre RD, empezando por /</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="aff-label">Nombre (opcional)</Label>
              <Input id="aff-label" placeholder="Reel de Samaná" value={label} maxLength={80} onChange={(e) => setLabel(e.target.value)} />
            </div>
            <Button type="submit" disabled={!path || !pathOk || create.isPending}>{create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear enlace"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mis enlaces</CardTitle>
          <CardDescription>{data.links.length} de {data.max_links} enlaces activos. Archivar uno no borra lo que ya generó.</CardDescription>
        </CardHeader>
        <CardContent>
          {data.links.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Aún no tienes enlaces. Crea el primero con los botones de arriba.</p>
          ) : (
            <ul className="divide-y divide-border">
              {data.links.map((l) => (
                <li key={l.id} className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-semibold text-foreground">{l.label || l.target_path}<Badge variant="outline" className="font-mono text-2xs">{l.code}</Badge></p>
                    <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">{fullUrl(l)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{l.clicks} clics · {l.signups} registros · {l.orders} pedidos · {money(l.estimated)} estimado · {money(l.confirmed)} confirmado</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => copy(l)}>{copied === l.id ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}Copiar</Button>
                    <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground" disabled={archive.isPending} onClick={() => archive.mutate(l.id)}><Archive className="h-4 w-4" />Archivar</Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
