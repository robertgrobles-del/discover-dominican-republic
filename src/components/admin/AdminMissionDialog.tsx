import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, QrCode, Target, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api";
import { displayImageUrl, uploadProductImage } from "@/lib/adminProductsApi";
import { provincias } from "@/components/forms/registro/RegistroFormHelpers";

export type MissionKind = "daily" | "weekly" | "special";

/** Acciones que el servidor registra solo (o que son bonos internos): no sirven como actividad de un reto. */
const INTERNAL_ACTIONS = new Set(["mission_completed", "achievement_unlocked", "admin_adjustment", "streak_bonus", "early_bird", "sponsor_validated"]);
const KIND_LABEL: Record<MissionKind, string> = { daily: "Reto diario", weekly: "Misión semanal", special: "Misión especial" };
const DIFFICULTY = { facil: "Fácil", media: "Media", exigente: "Exigente" } as const;
const NONE = "__none__";

interface Rule { action: string; description: string | null; is_active: boolean }
interface SponsorOrg { id: string; business_name: string }

const todayRD = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santo_Domingo" }).format(new Date());

const EMPTY = {
  name: "", completion: "auto" as "auto" | "qr", action: "", count: 1, instructions: "",
  image: "", placeName: "", province: "", targetUrl: "", targetLabel: "",
  startsOn: "", endsOn: "", maxCompletions: "", difficulty: "", minutes: "",
  sponsored: false, sponsorOrg: "", sponsorName: "", sponsorLogo: "", sponsorReward: "",
  xp: 50, coins: 0, featured: false,
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <fieldset className="space-y-3 border-t border-border pt-4 first:border-t-0 first:pt-0">
    <legend className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</legend>
    {children}
  </fieldset>
);

/**
 * Alta de un reto o misión: qué hay que hacer (una actividad que el servidor registra o la validación presencial de la empresa
 * patrocinadora con el QR del viajero), dónde, cuándo y para cuántas personas, y lo que se gana al completarlo.
 */
export function AdminMissionDialog({ open, kind, onOpenChange }: { open: boolean; kind: MissionKind; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const [type, setType] = useState<MissionKind>(kind);
  const [f, setF] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) => setF((prev) => ({ ...prev, [k]: v }));
  useEffect(() => { if (open) { setType(kind); setF({ ...EMPTY, startsOn: kind === "daily" ? todayRD() : "", endsOn: kind === "daily" ? todayRD() : "" }); } }, [open, kind]);

  const { data: actions = [], isLoading: loadingActions } = useQuery({
    queryKey: ["admin-gamification-rules"],
    enabled: open,
    queryFn: async () => ((await apiClient.get<Rule[]>("/admin/gamification_rules?per_page=200")).data ?? [])
      .filter((r) => r.is_active && !INTERNAL_ACTIONS.has(r.action)),
  });
  const { data: orgs = [] } = useQuery({
    queryKey: ["admin-sponsor-orgs"],
    enabled: open,
    queryFn: async () => (await apiClient.get<SponsorOrg[]>("/admin/gamification/sponsor-orgs")).data ?? [],
  });

  const qr = f.completion === "qr";
  // La validación con QR la hace una empresa del panel de Operadores: el reto queda patrocinado por ella.
  const sponsored = qr || f.sponsored;
  const urlOk = !f.targetUrl.trim() || /^(\/|https:\/\/)/.test(f.targetUrl.trim());
  const datesOk = !f.startsOn || !f.endsOn || f.endsOn >= f.startsOn;
  const valid = f.name.trim().length >= 3 && f.instructions.trim() && f.xp >= 0 && f.coins >= 0 && urlOk && datesOk
    && (qr ? !!f.sponsorOrg : !!f.action && f.count >= 1)
    && (!sponsored || !!f.sponsorOrg || !!f.sponsorName.trim());

  const upload = async (file: File) => {
    setUploading(true);
    try { set("image", displayImageUrl(await uploadProductImage(file))); }
    catch (err) { toast.error(err instanceof Error ? err.message : "No se pudo subir la imagen"); }
    finally { setUploading(false); }
  };

  const opt = <T,>(v: T | "" | undefined) => (v === "" || v === undefined ? undefined : v);
  const save = useMutation({
    mutationFn: () => apiClient.post("/admin/gamification/missions", {
      name: f.name.trim(),
      description: f.instructions.trim(),
      target_action: qr ? "sponsor_validated" : f.action,
      target_count: qr ? 1 : Number(f.count),
      requires_validation: qr,
      xp_reward: Number(f.xp),
      coin_reward: Number(f.coins),
      mission_type: type,
      is_featured: f.featured,
      image_url: opt(f.image.trim()),
      place_name: opt(f.placeName.trim()),
      province: opt(f.province),
      target_url: opt(f.targetUrl.trim()),
      target_label: opt(f.targetLabel.trim()),
      starts_on: opt(f.startsOn),
      ends_on: opt(f.endsOn),
      max_completions: f.maxCompletions ? Number(f.maxCompletions) : undefined,
      difficulty: opt(f.difficulty),
      estimated_minutes: f.minutes ? Number(f.minutes) : undefined,
      is_sponsored: sponsored,
      sponsor_id: sponsored ? opt(f.sponsorOrg) : undefined,
      sponsor_name: sponsored && !f.sponsorOrg ? opt(f.sponsorName.trim()) : undefined,
      sponsor_logo_url: sponsored ? opt(f.sponsorLogo.trim()) : undefined,
      sponsor_reward_text: sponsored ? opt(f.sponsorReward.trim()) : undefined,
    }),
    onSuccess: () => {
      toast.success(`${KIND_LABEL[type]} creado`);
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["admin-missions-list"] });
      queryClient.invalidateQueries({ queryKey: ["home-daily-challenge"] });
    },
    onError: (err: Error) => toast.error(err.message || "No se pudo crear"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary" />Nuevo {KIND_LABEL[type].toLowerCase()}</DialogTitle>
          <DialogDescription>Los puntos se entregan una vez por {type === "daily" ? "día" : type === "weekly" ? "semana" : "persona"} y nunca los decide la app del viajero.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <Section title="El reto">
            <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={type} onValueChange={(v) => setType(v as MissionKind)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{(Object.keys(KIND_LABEL) as MissionKind[]).map((k) => <SelectItem key={k} value={k}>{KIND_LABEL[k]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-name">Nombre</Label>
                <Input id="m-name" maxLength={100} placeholder="Ej. Prueba el mangú de Doña Ana" value={f.name} onChange={(e) => set("name", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-instr">Indicaciones</Label>
              <Textarea id="m-instr" rows={3} maxLength={500} placeholder="Qué debe hacer la persona, paso a paso…" value={f.instructions} onChange={(e) => set("instructions", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Imagen</Label>
              {f.image ? (
                <div className="relative w-48">
                  <img src={f.image} alt="" className="aspect-video w-48 rounded-lg border border-border object-cover" />
                  <Button type="button" size="icon" variant="secondary" className="absolute right-1 top-1 h-7 w-7" onClick={() => set("image", "")} aria-label="Quitar imagen"><X className="h-4 w-4" /></Button>
                </div>
              ) : (
                <Button type="button" variant="outline" className="gap-2" disabled={uploading} onClick={() => fileRef.current?.click()}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}Subir imagen
                </Button>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) void upload(file); e.target.value = ""; }} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Dificultad</Label>
                <Select value={f.difficulty || NONE} onValueChange={(v) => set("difficulty", v === NONE ? "" : v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Sin indicar</SelectItem>
                    {Object.entries(DIFFICULTY).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-min">Duración estimada (minutos)</Label>
                <Input id="m-min" type="number" min={1} value={f.minutes} onChange={(e) => set("minutes", e.target.value)} />
              </div>
            </div>
          </Section>

          <Section title="Cómo se completa">
            <RadioGroup value={f.completion} onValueChange={(v) => set("completion", v as "auto" | "qr")} className="grid gap-2 sm:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-border p-3 has-[:checked]:border-primary">
                <RadioGroupItem value="auto" className="mt-0.5" />
                <span className="text-sm"><strong className="block">Con una actividad en la app</strong><span className="text-muted-foreground">Avanza solo cuando la persona la realiza.</span></span>
              </label>
              <label htmlFor="admin-mission-dialog-f1" className="flex cursor-pointer items-start gap-2 rounded-lg border border-border p-3 has-[:checked]:border-primary">
                <RadioGroupItem value="qr" className="mt-0.5" />
                <span className="text-sm"><strong className="flex items-center gap-1"><QrCode className="h-4 w-4" />Lo valida el patrocinador</strong><span className="text-muted-foreground">La empresa escanea el QR del viajero en su panel.</span></span>
              </label>
            </RadioGroup>
            {qr ? (
              <div className="space-y-1.5">
                <Label>Empresa que valida</Label>
                <Select value={f.sponsorOrg} onValueChange={(v) => set("sponsorOrg", v)}>
                  <SelectTrigger id="admin-mission-dialog-f1"><SelectValue placeholder={orgs.length ? "Seleccionar…" : "No hay empresas en Operadores RD"} /></SelectTrigger>
                  <SelectContent>{orgs.map((o) => <SelectItem key={o.id} value={o.id}>{o.business_name}</SelectItem>)}</SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Cualquier miembro de su equipo podrá validarlo desde «Validar retos» en el panel de Operadores.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-[1fr_7rem]">
                <div className="space-y-1.5">
                  <Label>Actividad a realizar</Label>
                  <Select value={f.action} onValueChange={(v) => set("action", v)} disabled={loadingActions}>
                    <SelectTrigger><SelectValue placeholder={loadingActions ? "Cargando…" : "Seleccionar…"} /></SelectTrigger>
                    <SelectContent>{actions.map((a) => <SelectItem key={a.action} value={a.action}>{a.description || a.action}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="m-count">Veces</Label>
                  <Input id="m-count" type="number" min={1} value={f.count} onChange={(e) => set("count", Number(e.target.value))} />
                </div>
              </div>
            )}
          </Section>

          <Section title="Dónde">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="m-place">Lugar</Label>
                <Input id="m-place" maxLength={120} placeholder="Ej. Playa Rincón" value={f.placeName} onChange={(e) => set("placeName", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Provincia</Label>
                <Select value={f.province || NONE} onValueChange={(v) => set("province", v === NONE ? "" : v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Cualquiera</SelectItem>
                    {provincias.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-url">Dónde dirigirse (enlace)</Label>
                <Input id="m-url" maxLength={500} placeholder="/playas o https://…" value={f.targetUrl} onChange={(e) => set("targetUrl", e.target.value)} aria-invalid={!urlOk} />
                {!urlOk && <p className="text-xs text-destructive">Usa una ruta del portal (/…) o un enlace https://</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-label">Texto del botón</Label>
                <Input id="m-label" maxLength={80} placeholder="Ir al reto" value={f.targetLabel} onChange={(e) => set("targetLabel", e.target.value)} />
              </div>
            </div>
          </Section>

          <Section title="Cuándo y para cuántos">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="m-from">Desde</Label>
                <Input id="m-from" type="date" value={f.startsOn} onChange={(e) => set("startsOn", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-to">Hasta</Label>
                <Input id="m-to" type="date" min={f.startsOn || undefined} value={f.endsOn} onChange={(e) => set("endsOn", e.target.value)} aria-invalid={!datesOk} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-max">Cupo de personas</Label>
                <Input id="m-max" type="number" min={1} placeholder="Sin límite" value={f.maxCompletions} onChange={(e) => set("maxCompletions", e.target.value)} />
              </div>
            </div>
            {!datesOk && <p className="text-xs text-destructive">La fecha final no puede ser anterior a la inicial.</p>}
          </Section>

          <Section title="Patrocinio">
            {!qr && (
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="m-sponsored">Patrocinado</Label>
                <Switch id="m-sponsored" checked={f.sponsored} onCheckedChange={(v) => set("sponsored", v)} />
              </div>
            )}
            {sponsored && (
              <div className="grid gap-3 sm:grid-cols-2">
                {!qr && (
                  <div className="space-y-1.5">
                    <Label>Empresa</Label>
                    <Select value={f.sponsorOrg || NONE} onValueChange={(v) => set("sponsorOrg", v === NONE ? "" : v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>Otra marca (escribir nombre)</SelectItem>
                        {orgs.map((o) => <SelectItem key={o.id} value={o.id}>{o.business_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {!qr && !f.sponsorOrg && (
                  <div className="space-y-1.5">
                    <Label htmlFor="m-sp-name">Nombre de la marca</Label>
                    <Input id="m-sp-name" maxLength={120} value={f.sponsorName} onChange={(e) => set("sponsorName", e.target.value)} />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="m-sp-logo">Logo (URL)</Label>
                  <Input id="m-sp-logo" maxLength={500} placeholder="https://…" value={f.sponsorLogo} onChange={(e) => set("sponsorLogo", e.target.value)} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="m-sp-reward">Beneficio del patrocinador (opcional)</Label>
                  <Input id="m-sp-reward" maxLength={200} placeholder="Ej. Un jugo natural gratis al validar" value={f.sponsorReward} onChange={(e) => set("sponsorReward", e.target.value)} />
                </div>
              </div>
            )}
          </Section>

          <Section title="Recompensa">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="m-xp">Puntos (XP)</Label>
                <Input id="m-xp" type="number" min={0} value={f.xp} onChange={(e) => set("xp", Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-coins">Monedas</Label>
                <Input id="m-coins" type="number" min={0} value={f.coins} onChange={(e) => set("coins", Number(e.target.value))} />
              </div>
            </div>
            {type === "daily" && (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={f.featured} onCheckedChange={(v) => set("featured", v === true)} />
                Mostrarlo como «Reto del día» en la portada
              </label>
            )}
          </Section>

          <Button className="w-full" disabled={!valid || save.isPending || uploading} onClick={() => save.mutate()}>
            {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
