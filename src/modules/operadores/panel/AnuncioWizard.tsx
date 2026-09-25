import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { opKeys, saveListing, useListings, useOpMutation } from "../api";
import {
  CANCELLATION_POLICIES, CATEGORY_META, DESTINATION_OPTIONS, LANGUAGE_OPTIONS, TIME_SLOT_OPTIONS, formatMoney, slugify,
} from "../constants";
import type { Extra, ExtraUnit, ItineraryDay, Listing, ListingCategory, Room } from "../types";
import { useOrg } from "./OrgContext";

const STEPS = ["Categoría", "Información", "Detalles y precio", "Fotos", "Revisión"];

type Draft = Omit<Listing, "id" | "created_at" | "org_id" | "slug"> & { id?: string };

const EMPTY: Draft = {
  category: "experiencia", title: "", summary: "", description: "", destination: "", price: 0, currency: "USD",
  duration: "", capacity: 10, min_age: 0, languages: ["Español"], includes: [], meeting_point: "",
  cancellation_policy: "flexible", images: [], time_slots: ["09:00"], status: "draft",
};

export default function AnuncioWizard() {
  const { org } = useOrg();
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: listings = [], isLoading } = useListings(org.id);
  const [step, setStep] = useState(id ? 1 : 0);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [include, setInclude] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loaded, setLoaded] = useState(!id);
  const save = useOpMutation(saveListing, [opKeys.listings(org.id)]);
  const canPublish = org.verification === "verified";

  useEffect(() => {
    if (!id || loaded || isLoading) return;
    const found = listings.find((l) => l.id === id);
    if (found) setDraft(found);
    setLoaded(true);
  }, [id, listings, loaded, isLoading]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const toggleIn = (k: "languages" | "time_slots", v: string) =>
    set(k, (draft[k].includes(v) ? draft[k].filter((x) => x !== v) : [...draft[k], v]) as any);

  const errors: string[] = [];
  if (draft.title.trim().length < 5) errors.push("El título necesita al menos 5 caracteres.");
  if (!draft.destination) errors.push("Elige un destino.");
  const isPackage = draft.category === "paquete";
  const days = draft.days || 0;
  const itinerary = draft.itinerary || [];
  const setDays = (n: number) => {
    const d = Math.min(30, Math.max(1, Math.round(n) || 1));
    const next: ItineraryDay[] = Array.from({ length: d }, (_, i) => itinerary[i] || { day: i + 1, title: "", description: "" });
    setDraft((x) => ({ ...x, days: d, itinerary: next, duration: `${d} días${d > 1 ? ` / ${d - 1} noche(s)` : ""}` }));
  };
  const setDay = (i: number, patch: Partial<ItineraryDay>) => set("itinerary", itinerary.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const components = draft.components || [];
  const others = listings.filter((l) => l.id !== draft.id && l.category !== "paquete");
  const extras = draft.extras || [];
  const isStay = draft.category === "alojamiento";
  const rooms = draft.rooms || [];
  if (isPackage && (days < 2 || itinerary.some((x) => !x.title.trim()))) errors.push("El paquete necesita al menos 2 días, cada uno con título.");
  if (extras.some((x) => !x.name.trim() || x.price <= 0)) errors.push("Cada extra necesita nombre y un precio mayor que 0.");
  if (isStay) {
    if (rooms.length === 0) errors.push("Agrega al menos una habitación.");
    if (rooms.some((r) => !r.name.trim() || r.price <= 0 || r.quantity < 1 || r.guests < 1)) errors.push("Cada habitación necesita nombre, precio, huéspedes y unidades.");
  } else {
    if (draft.price <= 0) errors.push("El precio debe ser mayor que 0.");
    if (draft.capacity < 1) errors.push("Indica los cupos disponibles.");
    if (draft.time_slots.length === 0) errors.push("Agrega al menos un horario.");
  }
  const setExtra = (id: string, patch: Partial<Extra>) => set("extras", extras.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const addExtra = () => set("extras", [...extras, { id: `ex-${Math.random().toString(36).slice(2, 8)}`, name: "", price: 0, unit: isStay ? "night" : "person" }]);
  const setRoom = (id: string, patch: Partial<Room>) => set("rooms", rooms.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const addRoom = () => set("rooms", [...rooms, { id: `rm-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, name: "", price: 0, guests: 2, quantity: 1, beds: "", amenities: [] }]);

  const submit = (status: Draft["status"]) => {
    if (errors.length) { toast.error(errors[0]); return; }
    const finalStatus = status === "published" && !canPublish ? "draft" : status;
    const stay = isStay ? { price: Math.min(...rooms.map((r) => r.price)), capacity: rooms.reduce((n, r) => n + r.guests * r.quantity, 0), time_slots: [] as string[] } : {};
    save.mutate(
      { ...draft, ...stay, org_id: org.id, slug: (draft as any).slug || slugify(draft.title), status: finalStatus } as any,
      {
        onSuccess: () => {
          toast.success(finalStatus === "published" ? "Anuncio publicado" : status === "published" ? "Guardado como borrador: tu organización aún no está verificada" : "Borrador guardado");
          navigate("..", { relative: "path" });
        },
        onError: (e: any) => toast.error(e.message),
      },
    );
  };

  const addImage = () => {
    const u = imageUrl.trim();
    if (!/^https?:\/\//i.test(u)) { toast.error("Ingresa una URL válida que empiece con https://"); return; }
    if (draft.images.length >= 10) { toast.error("Máximo 10 fotos."); return; }
    set("images", [...draft.images, u]);
    setImageUrl("");
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold">{id ? "Editar anuncio" : "Crear anuncio"}</h1>
        <Button variant="outline" onClick={() => submit("draft")} disabled={save.isPending}>Guardar y salir</Button>
      </div>

      <ol className="flex flex-wrap gap-2 mb-6 text-xs" aria-label="Pasos">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button type="button" onClick={() => setStep(i)} className={`rounded-full px-3 py-1 font-medium ${i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
              {i < step && <Check className="h-3 w-3 inline mr-1" />}{i + 1}. {s}
            </button>
          </li>
        ))}
      </ol>

      <Card><CardContent className="p-6 space-y-5">
        {step === 0 && (
          <>
            <h2 className="font-display text-xl font-bold">Elige la categoría de tu servicio</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {(Object.keys(CATEGORY_META) as ListingCategory[]).map((c) => {
                const m = CATEGORY_META[c];
                return (
                  <button key={c} type="button" onClick={() => { set("category", c); setStep(1); }} className={`rounded-2xl border p-5 text-left transition-colors hover:border-primary/60 ${draft.category === c ? "border-primary bg-primary/5" : "border-border"}`}>
                    <m.icon className="h-8 w-8 text-primary mb-2" />
                    <p className="font-semibold">{m.label}</p>
                    <p className="text-sm text-muted-foreground">{m.desc}</p>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="font-display text-xl font-bold">Información del servicio</h2>
            <div className="space-y-2"><Label htmlFor="w-title">Título *</Label>
              <Input id="w-title" maxLength={100} value={draft.title} onChange={(e) => set("title", e.target.value)} placeholder="Ej. Rafting en el río Yaque del Norte" /></div>
            <div className="space-y-2"><Label htmlFor="w-summary">Resumen corto</Label>
              <Input id="w-summary" maxLength={160} value={draft.summary} onChange={(e) => set("summary", e.target.value)} placeholder="Una frase que invite a reservar" /></div>
            <div className="space-y-2"><Label htmlFor="w-desc">Descripción</Label>
              <Textarea id="w-desc" rows={6} maxLength={2000} value={draft.description} onChange={(e) => set("description", e.target.value)} placeholder="Cuenta qué harán los viajeros, el recorrido y qué lo hace especial." /></div>
            <div className="space-y-2"><Label>Destino *</Label>
              <Select value={draft.destination} onValueChange={(v) => set("destination", v)}>
                <SelectTrigger><SelectValue placeholder="Selecciona un destino" /></SelectTrigger>
                <SelectContent>{DESTINATION_OPTIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select></div>
            <div className="space-y-2"><Label>Idiomas del servicio</Label>
              <div className="flex flex-wrap gap-3">{LANGUAGE_OPTIONS.map((l) => (
                <label key={l} className="flex items-center gap-2 text-sm"><Checkbox checked={draft.languages.includes(l)} onCheckedChange={() => toggleIn("languages", l)} /> {l}</label>
              ))}</div></div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="font-display text-xl font-bold">Detalles y precio</h2>
            {isStay && (
              <div className="space-y-3">
                <div className="flex items-center justify-between"><Label className="text-base">Habitaciones *</Label><Button type="button" size="sm" variant="outline" onClick={addRoom}><Plus className="h-4 w-4 mr-1" /> Agregar habitación</Button></div>
                <p className="text-xs text-muted-foreground">Cada habitación tiene su propio enlace de reserva; el viajero reserva justo esa habitación.</p>
                {rooms.map((r, i) => (
                  <div key={r.id} className="rounded-xl border border-border p-4 grid gap-3 sm:grid-cols-4">
                    <div className="sm:col-span-4 flex gap-2"><Input aria-label={`Nombre de la habitación ${i + 1}`} maxLength={60} value={r.name} onChange={(e) => setRoom(r.id, { name: e.target.value })} placeholder="Ej. Suite frente al mar" />
                      <Button type="button" variant="ghost" size="icon" aria-label={`Quitar habitación ${i + 1}`} onClick={() => set("rooms", rooms.filter((x) => x.id !== r.id))}><X className="h-4 w-4" /></Button></div>
                    <div className="space-y-1"><Label className="text-xs">Precio por noche</Label><Input type="number" min={0} value={r.price || ""} onChange={(e) => setRoom(r.id, { price: Number(e.target.value) })} /></div>
                    <div className="space-y-1"><Label className="text-xs">Huéspedes</Label><Input type="number" min={1} value={r.guests} onChange={(e) => setRoom(r.id, { guests: Number(e.target.value) })} /></div>
                    <div className="space-y-1"><Label className="text-xs">Unidades</Label><Input type="number" min={1} value={r.quantity} onChange={(e) => setRoom(r.id, { quantity: Number(e.target.value) })} /></div>
                    <div className="space-y-1"><Label className="text-xs">Camas</Label><Input maxLength={40} value={r.beds || ""} onChange={(e) => setRoom(r.id, { beds: e.target.value })} placeholder="1 king" /></div>
                    <div className="sm:col-span-2 space-y-1"><Label className="text-xs">Comodidades (separadas por coma)</Label><Input maxLength={160} value={r.amenities.join(", ")} onChange={(e) => setRoom(r.id, { amenities: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} placeholder="Aire acondicionado, Wi-Fi, Balcón" /></div>
                    <div className="sm:col-span-2 space-y-1"><Label className="text-xs">Foto (URL)</Label><Input value={r.image || ""} onChange={(e) => setRoom(r.id, { image: e.target.value })} placeholder="https://…" /></div>
                  </div>
                ))}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-3">
              {!isStay && <div className="space-y-2"><Label htmlFor="w-price">Precio por persona *</Label>
                <Input id="w-price" type="number" min={0} value={draft.price || ""} onChange={(e) => set("price", Number(e.target.value))} /></div>}
              <div className="space-y-2"><Label>Moneda</Label>
                <Select value={draft.currency} onValueChange={(v) => set("currency", v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="USD">US$ (dólares)</SelectItem><SelectItem value="DOP">RD$ (pesos)</SelectItem></SelectContent>
                </Select></div>
              {!isStay && <div className="space-y-2"><Label htmlFor="w-cap">Cupos por salida *</Label>
                <Input id="w-cap" type="number" min={1} value={draft.capacity} onChange={(e) => set("capacity", Number(e.target.value))} /></div>}
              {!isStay && <div className="space-y-2"><Label htmlFor="w-dur">Duración</Label>
                <Input id="w-dur" maxLength={40} value={draft.duration} onChange={(e) => set("duration", e.target.value)} placeholder="3 horas" disabled={isPackage} /></div>}
              <div className="space-y-2"><Label htmlFor="w-age">Edad mínima</Label>
                <Input id="w-age" type="number" min={0} value={draft.min_age ?? 0} onChange={(e) => set("min_age", Number(e.target.value))} /></div>
              <div className="space-y-2"><Label>Política de cancelación</Label>
                <Select value={draft.cancellation_policy} onValueChange={(v) => set("cancellation_policy", v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CANCELLATION_POLICIES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label} — {p.desc}</SelectItem>)}</SelectContent>
                </Select></div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><Label className="text-base">Extras opcionales</Label><Button type="button" size="sm" variant="outline" onClick={addExtra}><Plus className="h-4 w-4 mr-1" /> Agregar extra</Button></div>
              <p className="text-xs text-muted-foreground">Traslado, almuerzo, seguro, fotos… el viajero los añade al reservar.</p>
              {extras.map((x, i) => (
                <div key={x.id} className="grid gap-2 sm:grid-cols-[1fr_7rem_9rem_auto] items-center">
                  <Input aria-label={`Nombre del extra ${i + 1}`} maxLength={60} value={x.name} onChange={(e) => setExtra(x.id, { name: e.target.value })} placeholder="Ej. Traslado desde el hotel" />
                  <Input aria-label={`Precio del extra ${i + 1}`} type="number" min={0} value={x.price || ""} onChange={(e) => setExtra(x.id, { price: Number(e.target.value) })} placeholder="Precio" />
                  <select aria-label={`Unidad del extra ${i + 1}`} className="h-10 rounded-md border border-input bg-background px-2 text-sm" value={x.unit} onChange={(e) => setExtra(x.id, { unit: e.target.value as ExtraUnit })}>
                    <option value="person">por persona</option><option value="booking">por reserva</option>{isStay && <option value="night">por noche</option>}
                  </select>
                  <Button type="button" variant="ghost" size="icon" aria-label={`Quitar extra ${i + 1}`} onClick={() => set("extras", extras.filter((y) => y.id !== x.id))}><X className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
            {isPackage && (
              <div className="space-y-3">
                <div className="flex items-center gap-3"><Label htmlFor="w-days" className="text-base">Días del paquete *</Label><Input id="w-days" className="w-24" type="number" min={2} max={30} value={days || ""} onChange={(e) => setDays(Number(e.target.value))} /></div>
                {itinerary.map((it, i) => (
                  <div key={it.day} className="rounded-xl border border-border p-3 space-y-2">
                    <Label className="text-xs text-muted-foreground">Día {it.day}</Label>
                    <Input aria-label={`Título del día ${it.day}`} maxLength={80} value={it.title} onChange={(e) => setDay(i, { title: e.target.value })} placeholder="Ej. Llegada y Zona Colonial" />
                    <Textarea aria-label={`Descripción del día ${it.day}`} rows={2} maxLength={400} value={it.description} onChange={(e) => setDay(i, { description: e.target.value })} placeholder="Qué se hace ese día" />
                  </div>
                ))}
                {others.length > 0 && (
                  <div className="space-y-2"><Label>Servicios tuyos incluidos en el paquete</Label>
                    <div className="grid gap-2 sm:grid-cols-2">{others.map((l) => (
                      <label key={l.id} className="flex items-center gap-2 text-sm"><Checkbox checked={components.includes(l.id)} onCheckedChange={(c) => set("components", c ? [...components, l.id] : components.filter((x) => x !== l.id))} /> {l.title}</label>
                    ))}</div></div>
                )}
              </div>
            )}
            {!isStay && (
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2"><Label htmlFor="w-child">Precio niños (3–11 años)</Label>
                  <Input id="w-child" type="number" min={0} value={draft.child_price ?? ""} placeholder="igual que adultos" onChange={(e) => set("child_price", e.target.value === "" ? undefined : Math.max(0, Number(e.target.value)))} /></div>
                <div className="space-y-2"><Label htmlFor="w-min">Mínimo de personas para salir</Label>
                  <Input id="w-min" type="number" min={0} value={draft.min_guests || ""} placeholder="sin mínimo" onChange={(e) => set("min_guests", Math.max(0, Number(e.target.value)) || undefined)} /></div>
                <label className="flex items-end gap-2 text-sm pb-2"><Checkbox checked={!!draft.infants_free} onCheckedChange={(c) => set("infants_free", !!c)} /> Bebés (0–2 años) gratis, sin ocupar cupo</label>
              </div>
            )}
            <div className="space-y-2"><Label htmlFor="w-dep">Depósito para reservar (%)</Label>
              <div className="flex items-center gap-3"><Input id="w-dep" className="w-28" type="number" min={0} max={90} step={5} value={draft.deposit_percent || 0} onChange={(e) => set("deposit_percent", Math.min(90, Math.max(0, Number(e.target.value) || 0)))} />
                <p className="text-xs text-muted-foreground">0 = el viajero paga el total. Con un valor (por ejemplo 30) podrá reservar pagando solo ese porcentaje y el resto al llegar.</p></div></div>
            <div className="space-y-2"><Label htmlFor="w-meet">Punto de encuentro</Label>
              <Input id="w-meet" maxLength={140} value={draft.meeting_point || ""} onChange={(e) => set("meeting_point", e.target.value)} /></div>
            {!isStay && <div className="space-y-2"><Label>Horarios de salida *</Label>
              <div className="flex flex-wrap gap-2">{TIME_SLOT_OPTIONS.map((t) => (
                <Button key={t} type="button" size="sm" variant={draft.time_slots.includes(t) ? "default" : "outline"} onClick={() => toggleIn("time_slots", t)}>{t}</Button>
              ))}</div></div>}
            <div className="space-y-2"><Label htmlFor="w-inc">Qué incluye</Label>
              <div className="flex gap-2">
                <Input id="w-inc" maxLength={80} value={include} onChange={(e) => setInclude(e.target.value)} placeholder="Ej. Guía local" onKeyDown={(e) => { if (e.key === "Enter" && include.trim()) { e.preventDefault(); set("includes", [...draft.includes, include.trim()]); setInclude(""); } }} />
                <Button type="button" variant="outline" aria-label="Agregar" onClick={() => { if (include.trim()) { set("includes", [...draft.includes, include.trim()]); setInclude(""); } }}><Plus className="h-4 w-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-2">{draft.includes.map((i) => (
                <Badge key={i} variant="secondary" className="gap-1">{i}<button type="button" aria-label={`Quitar ${i}`} onClick={() => set("includes", draft.includes.filter((x) => x !== i))}><X className="h-3 w-3" /></button></Badge>
              ))}</div></div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="font-display text-xl font-bold">Fotos</h2>
            <p className="text-sm text-muted-foreground">Agrega hasta 10 fotos por URL. La primera será la portada. Los anuncios con 5 o más fotos reciben más reservas.</p>
            <div className="flex gap-2">
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…/foto.jpg" aria-label="URL de la foto" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImage(); } }} />
              <Button type="button" variant="outline" onClick={addImage}>Agregar</Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {draft.images.map((u, i) => (
                <div key={u + i} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
                  <img src={u} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  {i === 0 && <Badge className="absolute top-2 left-2">Portada</Badge>}
                  <button type="button" aria-label={`Quitar foto ${i + 1}`} className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white" onClick={() => set("images", draft.images.filter((_, j) => j !== i))}><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="font-display text-xl font-bold">Revisión</h2>
            <div className="rounded-xl border border-border p-4 space-y-1 text-sm">
              <p className="font-semibold text-base">{draft.title || "Sin título"}</p>
              <p className="text-muted-foreground">{CATEGORY_META[draft.category].label} · {draft.destination || "Sin destino"} · {draft.duration || "—"}</p>
              {isStay ? <p>{rooms.length} habitación(es){rooms.length ? ` · desde ${formatMoney(Math.min(...rooms.map((r) => r.price)), draft.currency)} por noche` : ""}</p>
                : <p>{formatMoney(draft.price, draft.currency)} por persona · {draft.capacity} cupos · Horarios: {draft.time_slots.join(", ") || "—"}</p>}
              <p className="text-muted-foreground">{draft.images.length} foto(s) · {draft.includes.length} inclusiones · {draft.languages.join(", ")}</p>
            </div>
            {errors.length > 0 && <ul className="text-sm text-destructive list-disc pl-5">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
            {!canPublish && <p className="text-sm text-amber-600">Tu organización aún no está verificada: por ahora el anuncio se guardará como borrador.</p>}
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => submit("draft")} disabled={save.isPending}>Guardar como borrador</Button>
              <Button onClick={() => submit("published")} disabled={save.isPending}>Publicar anuncio</Button>
            </div>
          </>
        )}

        <div className="flex justify-between pt-2">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}><ChevronLeft className="h-4 w-4 mr-1" /> Atrás</Button>
          {step < STEPS.length - 1 && <Button onClick={() => setStep((s) => s + 1)}>Continuar <ChevronRight className="h-4 w-4 ml-1" /></Button>}
        </div>
      </CardContent></Card>
    </div>
  );
}
