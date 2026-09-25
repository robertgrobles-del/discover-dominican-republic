import { useRef, useState } from "react";
import { Download, RefreshCw, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { buildIcs, parseIcs } from "../ical";
import type { Booking, Room } from "../types";

interface Props {
  room: Room;
  listingTitle: string;
  bookings: Booking[];
  onChange: (patch: Partial<Room>) => void;
}

const uid = () => Math.random().toString(36).slice(2, 8);

export default function CalendarSync({ room, listingTitle, bookings, onChange }: Props) {
  const [name, setName] = useState("Booking.com");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const links = room.ical_links || [];
  const blocked = room.blocked || [];

  const download = () => {
    const mine = bookings.filter((b) => b.room_id === room.id);
    const ics = buildIcs(`${listingTitle} — ${room.name}`, mine);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    a.download = `${room.name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-") || "habitacion"}.ics`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success(`Calendario exportado (${mine.filter((b) => b.status !== "cancelled").length} reservas)`);
  };

  // Reemplaza los bloqueos de ese calendario por los del contenido recién leído.
  const apply = (linkId: string, label: string, content: string, source?: string) => {
    const ranges = parseIcs(content);
    if (ranges.length === 0) { toast.error("No se encontraron reservas en el calendario."); return false; }
    const kept = blocked.filter((b) => b.link_id !== linkId);
    const added = ranges.map((r) => ({ id: uid(), from: r.from, to: r.to, reason: `${label}: ${r.summary}`, link_id: linkId }));
    const rest = links.filter((l) => l.id !== linkId);
    const prev = links.find((l) => l.id === linkId);
    onChange({
      blocked: [...kept, ...added],
      ical_links: [...rest, { id: linkId, name: label, url: source ?? prev?.url, last_sync: new Date().toISOString(), count: ranges.length }],
    });
    toast.success(`${label}: ${ranges.length} reserva(s) sincronizada(s)`);
    return true;
  };

  const fetchUrl = async (u: string) => {
    const res = await fetch(u);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  };

  const importNow = async () => {
    if (!name.trim()) return toast.error("Ponle un nombre al calendario.");
    setBusy(true);
    try {
      let content = text.trim();
      if (!content) {
        if (!/^https?:\/\//i.test(url.trim())) { toast.error("Pega el enlace iCal (https://…) o el contenido del archivo .ics."); return; }
        try { content = await fetchUrl(url.trim()); }
        catch { toast.error("El navegador no pudo leer el enlace (bloqueo CORS). Descarga el .ics y súbelo, o pega su contenido."); return; }
      }
      if (apply(uid(), name.trim(), content, url.trim() || undefined)) { setText(""); setUrl(""); }
    } finally { setBusy(false); }
  };

  const onFile = async (f?: File) => {
    if (!f) return;
    if (f.size > 2_000_000) return toast.error("El archivo es demasiado grande.");
    setText(await f.text());
    toast.message("Archivo cargado: pulsa Importar.");
  };

  const resync = async (id: string) => {
    const l = links.find((x) => x.id === id);
    if (!l?.url) return toast.error("Este calendario se cargó desde un archivo: súbelo de nuevo para actualizarlo.");
    setBusy(true);
    try { apply(id, l.name, await fetchUrl(l.url)); }
    catch { toast.error("No se pudo leer el enlace (CORS o enlace inválido)."); }
    finally { setBusy(false); }
  };

  const remove = (id: string) => {
    onChange({ blocked: blocked.filter((b) => b.link_id !== id), ical_links: links.filter((l) => l.id !== id) });
    toast.success("Calendario desvinculado y bloqueos eliminados");
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Sincronización de calendarios (iCal) · {room.name}</CardTitle></CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <p className="text-sm font-medium">Exportar mis reservas</p>
          <p className="text-xs text-muted-foreground">Descarga un archivo .ics con las reservas de esta habitación e impórtalo en Booking, Airbnb o Google Calendar para que esas fechas se bloqueen allá.</p>
          <Button variant="outline" onClick={download} className="gap-2"><Download className="h-4 w-4" /> Descargar .ics</Button>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-medium">Importar un calendario externo</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1"><Label htmlFor="ic-name" className="text-xs">Nombre</Label><Input id="ic-name" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-1"><Label htmlFor="ic-url" className="text-xs">Enlace iCal</Label><Input id="ic-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…/calendar.ics" /></div>
          </div>
          <Textarea aria-label="Contenido del archivo .ics" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="…o pega aquí el contenido del archivo .ics" />
          <div className="flex flex-wrap gap-2">
            <input ref={fileRef} type="file" accept=".ics,text/calendar" className="hidden" aria-label="Subir archivo .ics" onChange={(e) => onFile(e.target.files?.[0])} />
            <Button type="button" variant="outline" className="gap-2" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> Subir .ics</Button>
            <Button type="button" disabled={busy} onClick={importNow}>Importar</Button>
          </div>
        </div>
        {links.length > 0 && (
          <div className="lg:col-span-2 space-y-2">
            <p className="text-sm font-medium">Calendarios vinculados</p>
            {links.map((l) => (
              <div key={l.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm">
                <div className="min-w-0"><p className="font-semibold">{l.name}</p><p className="text-xs text-muted-foreground">{l.count} reserva(s) · última sincronización {l.last_sync ? new Date(l.last_sync).toLocaleString("es-DO") : "—"}{l.url ? "" : " · archivo"}</p></div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => resync(l.id)} className="gap-1"><RefreshCw className="h-3.5 w-3.5" /> Sincronizar</Button>
                  <Button size="sm" variant="ghost" className="text-destructive" aria-label={`Desvincular ${l.name}`} onClick={() => remove(l.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="lg:col-span-2 text-[11px] text-muted-foreground">Las reservas importadas bloquean esas noches en tu página. La sincronización automática continua (sin pulsar el botón) requiere el backend real; por ahora se actualiza al sincronizar.</p>
      </CardContent>
    </Card>
  );
}
