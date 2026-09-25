import { useState } from "react";
import { Trash2, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { isValidEmail } from "@/lib/security";
import { opKeys, updateOrg, useListings, useOpMutation } from "../api";
import { MEMBER_ROLES, ROLE_DESC, ROLE_LABEL, findMember, type PanelRole } from "../permissions";
import type { TeamMember } from "../types";
import { useOrg } from "./OrgContext";

const uid = () => `tm-${Math.random().toString(36).slice(2, 9)}`;

export default function Equipo() {
  const { org, refetchOrg } = useOrg();
  const { data: listings = [] } = useListings(org.id);
  const team = org.team || [];
  const [form, setForm] = useState<{ name: string; email: string; role: Exclude<PanelRole, "owner">; listing_ids: string[] }>({ name: "", email: "", role: "recepcion", listing_ids: [] });
  const save = useOpMutation((t: TeamMember[]) => updateOrg(org.id, { team: t }), [opKeys.org(org.id)]);

  const persist = (next: TeamMember[], msg: string) => save.mutate(next, { onSuccess: () => { toast.success(msg); refetchOrg(); }, onError: (e: any) => toast.error(e.message) });

  const add = () => {
    if (form.name.trim().length < 2) return toast.error("Escribe el nombre.");
    if (!isValidEmail(form.email)) return toast.error("Ingresa un correo válido.");
    if (findMember(org, form.email) || form.email.trim().toLowerCase() === (org.email || "").toLowerCase()) return toast.error("Ese correo ya tiene acceso.");
    if (form.role === "guia" && form.listing_ids.length === 0) return toast.error("Asigna al menos una excursión al guía.");
    persist([...team, { id: uid(), name: form.name.trim(), email: form.email.trim().toLowerCase(), role: form.role, listing_ids: form.role === "guia" ? form.listing_ids : undefined, added_at: new Date().toISOString() }], "Miembro agregado");
    setForm({ name: "", email: "", role: "recepcion", listing_ids: [] });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-display text-3xl font-bold">Equipo y roles</h1>
      <p className="text-sm text-muted-foreground">Da acceso a tu equipo sin compartir tu contraseña. Cada persona inicia sesión en <b>/partner/login</b> con el correo que registres aquí y solo verá lo que su rol permite.</p>

      <Card><CardHeader><CardTitle className="text-lg">Agregar miembro</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1"><Label htmlFor="tm-name">Nombre</Label><Input id="tm-name" maxLength={60} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="space-y-1"><Label htmlFor="tm-mail">Correo</Label><Input id="tm-mail" type="email" maxLength={254} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        </div>
        <div className="space-y-2"><Label>Rol</Label>
          <div className="grid gap-2 sm:grid-cols-3">{MEMBER_ROLES.map((r) => (
            <button key={r} type="button" aria-pressed={form.role === r} onClick={() => setForm({ ...form, role: r })} className={`rounded-xl border p-3 text-left text-sm ${form.role === r ? "border-primary bg-primary/5" : "border-border"}`}>
              <p className="font-semibold">{ROLE_LABEL[r]}</p><p className="text-xs text-muted-foreground">{ROLE_DESC[r]}</p>
            </button>
          ))}</div></div>
        {form.role === "guia" && (
          <div className="space-y-2"><Label>Excursiones asignadas</Label>
            <div className="grid gap-2 sm:grid-cols-2">{listings.map((l) => (
              <label key={l.id} className="flex items-center gap-2 text-sm"><Checkbox checked={form.listing_ids.includes(l.id)} onCheckedChange={(c) => setForm({ ...form, listing_ids: c ? [...form.listing_ids, l.id] : form.listing_ids.filter((x) => x !== l.id) })} /> {l.title}</label>
            ))}</div></div>
        )}
        <Button onClick={add} disabled={save.isPending} className="gap-2"><UserPlus className="h-4 w-4" /> Agregar</Button>
      </CardContent></Card>

      <section>
        <h2 className="font-display text-xl font-bold mb-3">Miembros ({team.length})</h2>
        {team.length === 0 ? <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Todavía no has agregado a nadie.</CardContent></Card> : (
          <div className="space-y-2">{team.map((m) => (
            <Card key={m.id}><CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0"><p className="font-semibold">{m.name}</p><p className="text-xs text-muted-foreground">{m.email}{m.role === "guia" && m.listing_ids?.length ? ` · ${m.listing_ids.length} excursión(es)` : ""}</p></div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{ROLE_LABEL[m.role]}</Badge>
                <Button variant="ghost" size="icon" className="text-destructive" aria-label={`Quitar a ${m.name}`} onClick={() => persist(team.filter((x) => x.id !== m.id), "Acceso retirado")}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent></Card>
          ))}</div>
        )}
      </section>
    </div>
  );
}
