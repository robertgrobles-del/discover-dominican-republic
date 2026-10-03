import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { deletePromotion, opKeys, savePromotion, usePromotions, useOpMutation } from "../api";
import { useOrg } from "./OrgContext";
import { SponsoredPositionsCard } from "./SponsoredPositionsCard";

export default function Promocion() {
  const { org } = useOrg();
  const { data: promos = [] } = usePromotions(org.id);
  const keys = [opKeys.promos(org.id)];
  const save = useOpMutation(savePromotion, keys);
  const del = useOpMutation(deletePromotion, keys);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ code: "", type: "percent" as "percent" | "fixed", value: 10, max_uses: 0, ends_at: "" });

  const create = () => {
    const code = f.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    if (code.length < 3) return toast.error("El código necesita al menos 3 letras o números.");
    if (f.value <= 0 || (f.type === "percent" && f.value > 90)) return toast.error("Valor de descuento inválido.");
    if (promos.some((p) => p.code === code)) return toast.error("Ya existe ese código.");
    save.mutate(
      { org_id: org.id, code, type: f.type, value: f.value, max_uses: f.max_uses || undefined, ends_at: f.ends_at || undefined } as Parameters<typeof savePromotion>[0],
      { onSuccess: () => { toast.success("Promoción creada"); setOpen(false); setF({ code: "", type: "percent", value: 10, max_uses: 0, ends_at: "" }); } },
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold">Promoción</h1>
        <Button className="gap-2" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Nuevo código</Button>
      </div>
      <p className="text-sm text-muted-foreground mb-4">Los viajeros pueden aplicar estos códigos al reservar en tu sitio.</p>
      {promos.length === 0 ? (
        <Card><CardContent className="py-14 text-center text-muted-foreground">Aún no tienes códigos de descuento.</CardContent></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {promos.map((p) => (
            <Card key={p.id}><CardContent className="p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-mono font-bold text-lg">{p.code}</p>
                <p className="text-sm text-muted-foreground">{p.type === "percent" ? `${p.value}% de descuento` : `US$ ${p.value} de descuento`} · {p.uses}{p.max_uses ? `/${p.max_uses}` : ""} usos{p.ends_at ? ` · vence ${p.ends_at}` : ""}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={p.active ? "default" : "secondary"}>{p.active ? "Activo" : "Inactivo"}</Badge>
                <Switch checked={p.active} aria-label={`Activar ${p.code}`} onCheckedChange={(v) => save.mutate({ id: p.id, org_id: org.id, code: p.code, active: v } as Parameters<typeof savePromotion>[0])} />
                <Button variant="ghost" size="icon" aria-label={`Eliminar ${p.code}`} onClick={() => del.mutate(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo código de descuento</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2"><Label htmlFor="p-code">Código</Label><Input id="p-code" maxLength={20} value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} placeholder="VERANO15" /></div>
            <div className="space-y-1"><Label>Tipo</Label>
              <Select value={f.type} onValueChange={(v) => setF({ ...f, type: v as "percent" | "fixed" })}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="percent">Porcentaje</SelectItem><SelectItem value="fixed">Monto fijo (US$)</SelectItem></SelectContent></Select></div>
            <div className="space-y-1"><Label htmlFor="p-val">Valor</Label><Input id="p-val" type="number" min={1} value={f.value} onChange={(e) => setF({ ...f, value: Number(e.target.value) })} /></div>
            <div className="space-y-1"><Label htmlFor="p-max">Usos máximos (0 = sin límite)</Label><Input id="p-max" type="number" min={0} value={f.max_uses} onChange={(e) => setF({ ...f, max_uses: Number(e.target.value) })} /></div>
            <div className="space-y-1"><Label htmlFor="p-end">Vence</Label><Input id="p-end" type="date" value={f.ends_at} onChange={(e) => setF({ ...f, ends_at: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={create} disabled={save.isPending}>Crear</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="mt-8"><SponsoredPositionsCard businessName={org.business_name} /></div>
    </div>
  );
}
