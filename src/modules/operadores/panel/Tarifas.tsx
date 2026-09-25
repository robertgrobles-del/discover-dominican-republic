import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { opKeys, saveListing, useBookings, useListings, useOpMutation } from "../api";
import { formatMoney } from "../constants";
import { addDays, blockedReason, nightRate } from "../pricing";
import type { Room } from "../types";
import CalendarSync from "./CalendarSync";
import { useOrg } from "./OrgContext";

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const WEEKDAYS = ["D", "L", "M", "X", "J", "V", "S"];
const pad = (n: number) => String(n).padStart(2, "0");
const uid = () => Math.random().toString(36).slice(2, 8);

export default function Tarifas() {
  const { org } = useOrg();
  const { data: listings = [] } = useListings(org.id);
  const { data: bookings = [] } = useBookings(org.id);
  const stays = listings.filter((l) => l.category === "alojamiento" && l.rooms?.length);
  const [listingId, setListingId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [cursor, setCursor] = useState(() => { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() }; });
  const save = useOpMutation(saveListing, [opKeys.listings(org.id)]);

  const listing = stays.find((l) => l.id === listingId) || stays[0];
  const room = listing?.rooms?.find((r) => r.id === roomId) || listing?.rooms?.[0];

  const update = (patch: Partial<Room>) => {
    if (!listing || !room) return;
    const rooms = listing.rooms!.map((r) => (r.id === room.id ? { ...r, ...patch } : r));
    save.mutate({ id: listing.id, org_id: org.id, title: listing.title, rooms } as any, { onError: (e: any) => toast.error(e.message) });
  };

  const days = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1);
    const count = new Date(cursor.y, cursor.m + 1, 0).getDate();
    return { offset: first.getDay(), list: Array.from({ length: count }, (_, i) => `${cursor.y}-${pad(cursor.m + 1)}-${pad(i + 1)}`) };
  }, [cursor]);

  if (!listing || !room) {
    return (
      <div className="space-y-4 max-w-2xl">
        <h1 className="font-display text-3xl font-bold">Tarifas y disponibilidad</h1>
        <Card><CardContent className="py-10 text-center text-muted-foreground space-y-3">
          <p>Aún no tienes alojamientos con habitaciones.</p>
          <Button asChild><Link to="../anuncios/nuevo" relative="path">Crear un alojamiento</Link></Button>
        </CardContent></Card>
      </div>
    );
  }

  const bookedOn = (date: string) => bookings.filter((b) => b.room_id === room.id && b.status !== "cancelled" && b.date <= date && (b.check_out || b.date) > date).length;
  const seasons = room.seasons || [];
  const blocked = room.blocked || [];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Tarifas y disponibilidad</h1>

      <div className="flex flex-wrap gap-3">
        <select aria-label="Alojamiento" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={listing.id} onChange={(e) => { setListingId(e.target.value); setRoomId(""); }}>
          {stays.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
        </select>
        <select aria-label="Habitación" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={room.id} onChange={(e) => setRoomId(e.target.value)}>
          {listing.rooms!.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        <Card className="min-w-0">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">{MONTHS[cursor.m]} {cursor.y}</CardTitle>
            <div className="flex gap-1">
              <Button size="icon" variant="outline" aria-label="Mes anterior" onClick={() => setCursor((c) => (c.m === 0 ? { y: c.y - 1, m: 11 } : { ...c, m: c.m - 1 }))}><ChevronLeft className="h-4 w-4" /></Button>
              <Button size="icon" variant="outline" aria-label="Mes siguiente" onClick={() => setCursor((c) => (c.m === 11 ? { y: c.y + 1, m: 0 } : { ...c, m: c.m + 1 }))}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-1">{WEEKDAYS.map((d) => <div key={d}>{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: days.offset }).map((_, i) => <div key={`o${i}`} />)}
              {days.list.map((d) => {
                const why = blockedReason(room, d);
                const rate = nightRate(room, d);
                const taken = bookedOn(d);
                const full = taken >= room.quantity;
                return (
                  <div key={d} title={why || rate.label || "Tarifa base"} className={`rounded-md border p-1 min-h-[3.75rem] text-[11px] leading-tight ${why ? "bg-muted text-muted-foreground line-through" : full ? "bg-rose-500/10 border-rose-500/30" : rate.kind === "season" ? "bg-amber-500/10 border-amber-500/30" : rate.kind === "weekend" ? "bg-sky-500/10 border-sky-500/30" : "border-border"}`}>
                    <div className="font-semibold">{Number(d.slice(8))}</div>
                    {why ? <div>Bloq.</div> : <div>{formatMoney(rate.price, listing.currency)}</div>}
                    {!why && taken > 0 && <div className="text-rose-600">{taken}/{room.quantity} res.</div>}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><i className="h-3 w-3 rounded bg-amber-500/30" /> Temporada</span>
              <span className="flex items-center gap-1"><i className="h-3 w-3 rounded bg-sky-500/30" /> Fin de semana</span>
              <span className="flex items-center gap-1"><i className="h-3 w-3 rounded bg-rose-500/30" /> Sin unidades</span>
              <span className="flex items-center gap-1"><i className="h-3 w-3 rounded bg-muted" /> Bloqueado</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card><CardHeader><CardTitle className="text-base">Tarifa base</CardTitle></CardHeader><CardContent className="grid grid-cols-3 gap-3">
            <div className="space-y-1"><Label htmlFor="t-base" className="text-xs">Por noche</Label><Input id="t-base" type="number" min={1} defaultValue={room.price} key={`b${room.id}${room.price}`} onBlur={(e) => Number(e.target.value) > 0 && Number(e.target.value) !== room.price && update({ price: Number(e.target.value) })} /></div>
            <div className="space-y-1"><Label htmlFor="t-we" className="text-xs">Vie–Sáb</Label><Input id="t-we" type="number" min={0} placeholder="igual" defaultValue={room.weekend_price || ""} key={`w${room.id}${room.weekend_price}`} onBlur={(e) => Number(e.target.value || 0) !== (room.weekend_price || 0) && update({ weekend_price: Number(e.target.value) || undefined })} /></div>
            <div className="space-y-1"><Label htmlFor="t-min" className="text-xs">Noches mín.</Label><Input id="t-min" type="number" min={1} defaultValue={room.min_nights || 1} key={`m${room.id}${room.min_nights}`} onBlur={(e) => Number(e.target.value) >= 1 && Number(e.target.value) !== (room.min_nights || 1) && update({ min_nights: Number(e.target.value) })} /></div>
          </CardContent></Card>

          <Card><CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle className="text-base">Temporadas</CardTitle>
            <Button size="sm" variant="outline" onClick={() => { const t = new Date().toISOString().slice(0, 10); update({ seasons: [...seasons, { id: uid(), name: "Temporada alta", from: t, to: addDays(t, 30), price: Math.round(room.price * 1.3) }] }); }}><Plus className="h-4 w-4 mr-1" /> Agregar</Button></CardHeader>
            <CardContent className="space-y-3">
              {seasons.length === 0 && <p className="text-sm text-muted-foreground">Sin temporadas: se cobra la tarifa base.</p>}
              {seasons.map((s) => (
                <div key={s.id} className="rounded-lg border border-border p-3 grid grid-cols-2 gap-2">
                  <Input className="col-span-2" aria-label="Nombre de la temporada" maxLength={40} defaultValue={s.name} onBlur={(e) => update({ seasons: seasons.map((x) => (x.id === s.id ? { ...x, name: e.target.value || x.name } : x)) })} />
                  <Input type="date" aria-label="Desde" defaultValue={s.from} onBlur={(e) => e.target.value && update({ seasons: seasons.map((x) => (x.id === s.id ? { ...x, from: e.target.value, to: x.to < e.target.value ? e.target.value : x.to } : x)) })} />
                  <Input type="date" aria-label="Hasta" defaultValue={s.to} min={s.from} onBlur={(e) => e.target.value >= s.from && update({ seasons: seasons.map((x) => (x.id === s.id ? { ...x, to: e.target.value } : x)) })} />
                  <Input type="number" min={1} aria-label="Precio por noche" defaultValue={s.price} onBlur={(e) => Number(e.target.value) > 0 && update({ seasons: seasons.map((x) => (x.id === s.id ? { ...x, price: Number(e.target.value) } : x)) })} />
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => update({ seasons: seasons.filter((x) => x.id !== s.id) })}><Trash2 className="h-4 w-4 mr-1" /> Quitar</Button>
                </div>
              ))}
            </CardContent></Card>

          <Card><CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle className="text-base">Fechas bloqueadas</CardTitle>
            <Button size="sm" variant="outline" onClick={() => { const t = new Date().toISOString().slice(0, 10); update({ blocked: [...blocked, { id: uid(), from: t, to: t, reason: "Mantenimiento" }] }); }}><Plus className="h-4 w-4 mr-1" /> Bloquear</Button></CardHeader>
            <CardContent className="space-y-3">
              {blocked.length === 0 && <p className="text-sm text-muted-foreground">No hay fechas bloqueadas.</p>}
              {blocked.map((b) => (
                <div key={b.id} className="rounded-lg border border-border p-3 grid grid-cols-2 gap-2">
                  <Input type="date" aria-label="Bloqueo desde" defaultValue={b.from} onBlur={(e) => e.target.value && update({ blocked: blocked.map((x) => (x.id === b.id ? { ...x, from: e.target.value, to: x.to < e.target.value ? e.target.value : x.to } : x)) })} />
                  <Input type="date" aria-label="Bloqueo hasta" defaultValue={b.to} min={b.from} onBlur={(e) => e.target.value >= b.from && update({ blocked: blocked.map((x) => (x.id === b.id ? { ...x, to: e.target.value } : x)) })} />
                  <Input aria-label="Motivo" maxLength={60} defaultValue={b.reason} placeholder="Motivo" onBlur={(e) => update({ blocked: blocked.map((x) => (x.id === b.id ? { ...x, reason: e.target.value } : x)) })} />
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => update({ blocked: blocked.filter((x) => x.id !== b.id) })}><Trash2 className="h-4 w-4 mr-1" /> Quitar</Button>
                </div>
              ))}
            </CardContent></Card>
        </div>
      </div>
      <CalendarSync room={room} listingTitle={listing.title} bookings={bookings} onChange={update} />
    </div>
  );
}
