import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

/**
 * Editor por campos de los datos estructurados de una ficha (columnas JSON): listas de elementos —habitaciones,
 * piscinas, restaurantes, preguntas frecuentes— y objetos —políticas, spa, pasadía—. Sustituye a escribir JSON
 * a mano: cada elemento es una tarjeta con sus campos, y las filas se añaden, quitan y reordenan con botones.
 *
 * Los campos de cada elemento salen de los elementos existentes y de la plantilla del campo (`TEMPLATES`), así
 * que una lista vacía también ofrece un formulario al añadir la primera fila.
 */
type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
type Obj = { [key: string]: Json };

/** Plantilla de una fila nueva por campo de la ficha. El tipo de cada valor decide su control. */
const TEMPLATES: Record<string, Obj> = {
  // Banners: datos de portada de las diapositivas y extras de la cinta y la ventana de salida.
  slide_details: { tag: "", location: "", season: "", rating: 0, badge: "", stats: [{ value: "", label: "" }] },
  animation_config: { coupon_code: "", badge_text: "", xp_reward: 0 },
  room_types: { name: "", description: "", size: "", view: "", bed: "", capacity: "", price: 0, breakfast: true, amenities: [], image: "" },
  pools: { name: "", type: "", vibe: "", depth: "", features: "" },
  dining: { name: "", cuisine: "", tag: "", hours: "", dressCode: "", reservations: false, description: "" },
  bars_lounges: { name: "", type: "", specialty: "", hours: "", description: "" },
  nightlife: { name: "", type: "", music: "", hours: "", dressCode: "", description: "" },
  faqs: { q: "", a: "" },
  facilities: { name: "", desc: "" },
  policies: { checkIn: "", checkOut: "", cancellation: "", children: "", pets: "", deposit: "", transfers: "", paymentMethods: [] },
  spa_info: { name: "", concept: "", size: "", hours: "", schedule: "", bookingPolicy: "", treatments: [], hydrotherapy: [], facilities: [] },
  day_pass: { price: "", hours: "", includes: "" },
  // Destinos
  attractions: { name: "", type: "", description: "", entryFee: "", hours: "" },
  activities: { name: "", type: "", duration: "", price: "", description: "" },
  averageBudget: { budget: "", mid: "", luxury: "" },
  about: { history: "", geography: "", artAndCulture: "", politicalDivision: "", economy: "", demographics: "", location: "", whatToDo: [], pointsOfInterest: [] },
  pointsOfInterest: { name: "", type: "", description: "" },
  kids_policy: { title: "", text: "" },
};
const LABELS: Record<string, string> = {
  name: "Nombre", description: "Descripción", desc: "Descripción", size: "Tamaño", view: "Vista", bed: "Camas", capacity: "Capacidad", price: "Precio por noche (US$)",
  breakfast: "Incluye desayuno", amenities: "Comodidades", image: "Foto (dirección)", type: "Tipo", vibe: "Ambiente", depth: "Profundidad", features: "Características",
  cuisine: "Tipo de cocina", tag: "Etiqueta", hours: "Horario", dressCode: "Código de vestimenta", reservations: "Requiere reservación", specialty: "Especialidad", music: "Música",
  q: "Pregunta", a: "Respuesta", checkIn: "Hora de entrada", checkOut: "Hora de salida", cancellation: "Cancelación", children: "Niños", pets: "Mascotas", deposit: "Depósito",
  transfers: "Traslados", paymentMethods: "Formas de pago", concept: "Concepto", schedule: "Horario de atención", bookingPolicy: "Política de reserva", treatments: "Tratamientos",
  hydrotherapy: "Hidroterapia", facilities: "Instalaciones", includes: "Qué incluye", title: "Título", text: "Texto", day_pass: "Pasadía (day pass)", kids_policy: "Política de niños",
  nightlife_summary: "Resumen de vida nocturna", experience_tags: "Etiquetas de la experiencia", id: "Identificador",
  region: "Región (norte, sur, este o santo-domingo)", categories: "Categorías (playa, montaña, cultura…)", attractions: "Atracciones (lo más destacado)", activities: "Actividades",
  tips: "Consejos", bestFor: "Ideal para", notRecommendedFor: "Menos recomendable para", averageBudget: "Presupuesto diario", budget: "Económico", mid: "Medio", luxury: "Lujo",
  nearbyAirport: "Aeropuerto más cercano", distanceFromAirport: "Distancia al aeropuerto", minimumDays: "Días mínimos", idealDays: "Días ideales", safetyInfo: "Seguridad",
  currency: "Moneda", language: "Idioma", isPopular: "Destino popular", isFeatured: "Destino destacado", isRecommended: "Recomendado", entryFee: "Entrada", duration: "Duración",
  about: "Acerca del destino", history: "Historia", geography: "Geografía", artAndCulture: "Arte y cultura", politicalDivision: "División política", economy: "Economía",
  demographics: "Población", location: "Ubicación", whatToDo: "Qué hacer", pointsOfInterest: "Puntos de interés",
};
/** Tipo de los valores sueltos que no pertenecen a una plantilla de fila (claves de `extras`). */
const VALUE_SAMPLES: Record<string, Json> = {
  experience_tags: [], nightlife_summary: "",
  // Destinos: el tipo de cada valor decide su control (lista, número, interruptor, texto).
  region: "", type: "", categories: [], attractions: [], activities: [], tips: [], bestFor: [], notRecommendedFor: [], nearbyAirport: "", distanceFromAirport: "",
  minimumDays: 0, idealDays: 0, safetyInfo: "", currency: "", language: "", isPopular: false, isFeatured: false, isRecommended: false,
};
const labelOf = (k: string) => LABELS[k] ?? k.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
const isObj = (v: Json | undefined): v is Obj => !!v && typeof v === "object" && !Array.isArray(v);
const isObjList = (v: Json | undefined, key: string): v is Obj[] => Array.isArray(v) && (v.some(isObj) || (v.length === 0 && key in TEMPLATES && !Array.isArray(TEMPLATES[key])));
const blank = (v: Json): Json => (Array.isArray(v) ? [] : isObj(v) ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blank(x)])) : typeof v === "number" ? 0 : typeof v === "boolean" ? false : "");
const titleOf = (item: Obj, i: number) => { for (const k of ["name", "title", "q", "nombre"]) if (typeof item[k] === "string" && item[k]) return item[k] as string; return `Elemento ${i + 1}`; };

function ValueField({ name, value, sample, onChange }: { name: string; value: Json | undefined; sample: Json | undefined; onChange: (v: Json) => void }) {
  const kind = value ?? sample ?? "";
  if (typeof kind === "boolean") {
    return <div className="flex items-center gap-2 pt-1"><Switch checked={!!value} onCheckedChange={onChange} /><span className="text-sm text-muted-foreground">{value ? "Sí" : "No"}</span></div>;
  }
  if (typeof kind === "number") {
    return <Input type="number" step="any" value={typeof value === "number" ? value : ""} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} />;
  }
  if (isObjList(kind, name)) return <ObjectListEditor name={name} value={Array.isArray(value) ? (value as Obj[]) : []} onChange={onChange} nested />;
  if (Array.isArray(kind)) {
    // Lista de textos: un valor por línea.
    return <Textarea rows={Math.min(6, Math.max(2, (Array.isArray(value) ? value.length : 0) + 1))} value={Array.isArray(value) ? value.join("\n") : ""} onChange={(e) => onChange(e.target.value.split("\n").map((x) => x.trimStart()).filter((x, i, all) => x || i === all.length - 1))} onBlur={(e) => onChange(e.target.value.split("\n").map((x) => x.trim()).filter(Boolean))} placeholder="Un valor por línea" />;
  }
  if (isObj(kind)) return <ObjectEditor name={name} value={isObj(value) ? value : {}} onChange={onChange} nested />;
  const text = typeof value === "string" ? value : "";
  return text.length > 70 || /^(description|desc|a|text|includes|features|cancellation|children|pets|deposit|transfers|concept|bookingPolicy)$/.test(name)
    ? <Textarea rows={2} value={text} onChange={(e) => onChange(e.target.value)} />
    : <Input value={text} onChange={(e) => onChange(e.target.value)} />;
}

function Fields({ name, item, sample, onChange, only }: { name: string; item: Obj; sample: Obj; onChange: (next: Obj) => void; only?: string[] }) {
  // Primero el orden de la plantilla; después las claves propias que no estén en ella.
  const keys = only ?? [...new Set([...Object.keys(TEMPLATES[name] ?? {}), ...Object.keys(sample), ...Object.keys(item)])].filter((k) => k !== "id");
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {keys.map((k) => {
        const v = item[k] ?? sample[k] ?? TEMPLATES[name]?.[k] ?? VALUE_SAMPLES[k] ?? TEMPLATES[k];
        const wide = Array.isArray(v) || isObj(v) || (typeof v === "string" && (v.length > 70 || /^(description|desc|a|text|includes|features)$/.test(k)));
        return (
          <div key={k} className={`space-y-1 ${wide ? "sm:col-span-2" : ""}`}>
            <Label className="text-xs text-muted-foreground">{labelOf(k)}</Label>
            <ValueField name={k} value={item[k]} sample={sample[k] ?? TEMPLATES[name]?.[k] ?? VALUE_SAMPLES[k] ?? TEMPLATES[k]} onChange={(nv) => onChange({ ...item, [k]: nv })} />
          </div>
        );
      })}
    </div>
  );
}

/** Lista de elementos: una tarjeta plegable por fila, con añadir, quitar y reordenar. */
export function ObjectListEditor({ name, value, onChange, nested }: { name: string; value: Obj[]; onChange: (v: Obj[]) => void; nested?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  const items = Array.isArray(value) ? value.filter(isObj) : [];
  const sample: Obj = { ...(TEMPLATES[name] ?? {}), ...(items[0] ? (blank(items[0]) as Obj) : {}) };
  const move = (i: number, d: number) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d]!, next[i]!];
    onChange(next);
    setOpen(open === i ? i + d : open);
  };
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border bg-card/50">
          <div className="flex items-center gap-1 px-2 py-1.5">
            <button type="button" className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-medium" onClick={() => setOpen(open === i ? null : i)}>
              {open === i ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
              <span className="truncate">{titleOf(item, i)}</span>
            </button>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Subir"><ArrowUp className="h-3.5 w-3.5" /></Button>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Bajar"><ArrowDown className="h-3.5 w-3.5" /></Button>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { onChange(items.filter((_, j) => j !== i)); setOpen(null); }} aria-label="Quitar"><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
          {open === i && <div className="border-t p-3"><Fields name={name} item={item} sample={sample} onChange={(next) => onChange(items.map((x, j) => (j === i ? next : x)))} /></div>}
        </div>
      ))}
      {items.length === 0 && <p className="text-xs text-muted-foreground">Sin elementos: esta sección no se muestra en la ficha.</p>}
      <Button type="button" variant="outline" size={nested ? "sm" : "default"} onClick={() => { onChange([...items, sample]); setOpen(items.length); }}><Plus className="mr-1 h-4 w-4" />Añadir {nested ? "" : "elemento"}</Button>
    </div>
  );
}

/** Objeto: sus campos, uno a uno. `only` limita a ciertas claves y conserva el resto sin tocarlas (p. ej. `extras`). */
export function ObjectEditor({ name, value, onChange, only, nested }: { name: string; value: Obj; onChange: (v: Obj) => void; only?: string[]; nested?: boolean }) {
  const item = isObj(value) ? value : {};
  return (
    <div className={nested ? "rounded-lg border bg-card/50 p-3" : "rounded-lg border p-3"}>
      <Fields name={name} item={item} sample={TEMPLATES[name] ?? {}} onChange={onChange} only={only} />
    </div>
  );
}
