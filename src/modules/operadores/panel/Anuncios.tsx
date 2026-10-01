import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { deleteListing, opKeys, saveListing, useListings, useOpMutation } from "../api";
import { CATEGORY_META, LISTING_STATUS_LABEL, formatMoney } from "../constants";
import type { Listing } from "../types";
import { useOrg } from "./OrgContext";

const copyLink = (path: string) => { const url = `${window.location.origin}${path}`; navigator.clipboard?.writeText(url).then(() => toast.success("Enlace copiado"), () => toast.message(url)); };

export default function Anuncios() {
  const { org } = useOrg();
  const navigate = useNavigate();
  const { data: listings = [], isLoading } = useListings(org.id);
  const keys = [opKeys.listings(org.id)];
  const del = useOpMutation(deleteListing, keys);
  const toggle = useOpMutation((l: Listing) => saveListing({ ...l, status: l.status === "published" ? "paused" : "published" }), keys);

  const canPublish = org.verification === "verified";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-3xl font-bold">Anuncios</h1>
        <Button onClick={() => navigate("nuevo")} className="gap-2"><Plus className="h-4 w-4" /> Crear anuncio</Button>
      </div>

      {isLoading ? null : listings.length === 0 ? (
        <Card><CardContent className="py-16 text-center space-y-3">
          <p className="font-semibold text-lg">Aún no tienes anuncios.</p>
          <p className="text-muted-foreground text-sm">Crea tu primera experiencia, alojamiento, transporte o voluntariado.</p>
          <Button onClick={() => navigate("nuevo")}>Crear mi primer anuncio</Button>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => {
            const Cat = CATEGORY_META[l.category];
            return (
              <Card key={l.id} className="overflow-hidden flex flex-col">
                <div className="aspect-[16/10] bg-muted relative">
                  {l.images?.[0] ? <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center"><Cat.icon className="h-10 w-10 text-muted-foreground/50" /></div>}
                  <Badge className="absolute top-3 left-3" variant={l.status === "published" ? "default" : "secondary"}>{LISTING_STATUS_LABEL[l.status]}</Badge>
                </div>
                <CardContent className="p-4 flex flex-col gap-2 flex-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Cat.icon className="h-3 w-3" /> {Cat.label} · {l.destination || "Sin destino"}</p>
                  <p className="font-semibold leading-snug">{l.title}</p>
                  <p className="text-sm text-muted-foreground">{formatMoney(l.price, l.currency)} · {l.duration || "—"} · {l.capacity} cupos</p>
                  {l.rooms && l.rooms.length > 0 && (
                    <div className="flex flex-wrap gap-1">{l.rooms.map((r) => (
                      <Button key={r.id} size="sm" variant="secondary" className="h-6 text-[11px] px-2 gap-1" onClick={() => copyLink(`/operador/${org.slug}/${l.slug}?habitacion=${r.id}`)}><Copy className="h-3 w-3" /> {r.name}</Button>
                    ))}</div>
                  )}
                  <div className="mt-auto pt-2 flex flex-wrap gap-1">
                    <Button size="sm" variant="outline" asChild><Link to={l.id}><Pencil className="h-3.5 w-3.5 mr-1" /> Editar</Link></Button>
                    <Button
                      size="sm" variant="outline"
                      disabled={l.status !== "published" && !canPublish}
                      title={!canPublish && l.status !== "published" ? "Se puede publicar cuando la organización esté verificada" : undefined}
                      onClick={() => toggle.mutate(l, { onSuccess: () => toast.success(l.status === "published" ? "Anuncio pausado" : "Anuncio publicado") })}
                    >
                      {l.status === "published" ? <><EyeOff className="h-3.5 w-3.5 mr-1" /> Pausar</> : <><Eye className="h-3.5 w-3.5 mr-1" /> Publicar</>}
                    </Button>
                    <Button size="sm" variant="ghost" aria-label={`Copiar enlace de ${l.title}`} title="Copiar enlace" onClick={() => copyLink(`/operador/${org.slug}/${l.slug}`)}><Copy className="h-3.5 w-3.5" /></Button>
                    {l.status === "published" && (
                      <Button size="sm" variant="ghost" asChild><Link to={`/operador/${org.slug}/${l.slug}`} target="_blank" aria-label="Ver anuncio público"><ExternalLink className="h-3.5 w-3.5" /></Link></Button>
                    )}
                    <ConfirmActionDialog
                      trigger={<Button size="sm" variant="ghost" className="text-destructive" aria-label={`Eliminar anuncio ${l.title}`}><Trash2 className="h-3.5 w-3.5" /></Button>}
                      title="Eliminar anuncio"
                      description={`Se eliminará “${l.title}”. Esta acción no se puede deshacer.`}
                      confirmLabel="Eliminar"
                      onConfirm={() => del.mutate(l.id, { onSuccess: () => toast.success("Anuncio eliminado") })}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
