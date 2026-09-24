import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { availableSpots, useBookings, useListings } from "../api";
import { BOOKING_STATUS_LABEL, formatMoney } from "../constants";
import { useOrg } from "./OrgContext";

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const WEEKDAYS = ["D", "L", "M", "X", "J", "V", "S"];
const pad = (n: number) => String(n).padStart(2, "0");

export default function Calendario() {
  const { org } = useOrg();
  const { data: bookings = [] } = useBookings(org.id);
  const { data: listings = [] } = useListings(org.id);
  const now = new Date();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);

  const byDate = useMemo(() => {
    const map: Record<string, typeof bookings> = {};
    bookings.filter((b) => b.status !== "cancelled").forEach((b) => { (map[b.date] ||= []).push(b); });
    return map;
  }, [bookings]);

  const first = new Date(cursor.y, cursor.m, 1);
  const days = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells = [...Array(first.getDay()).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const move = (d: number) => setCursor((c) => { const t = new Date(c.y, c.m + d, 1); return { y: t.getFullYear(), m: t.getMonth() }; });
  const dayList = byDate[selected] || [];
  const published = listings.filter((l) => l.status === "published");

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-6">Calendario</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <Button variant="ghost" size="icon" aria-label="Mes anterior" onClick={() => move(-1)}><ChevronLeft className="h-4 w-4" /></Button>
            <CardTitle className="text-lg">{MONTHS[cursor.m]} {cursor.y}</CardTitle>
            <Button variant="ghost" size="icon" aria-label="Mes siguiente" onClick={() => move(1)}><ChevronRight className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-1">{WEEKDAYS.map((d, i) => <span key={i}>{d}</span>)}</div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((d, i) => {
                if (!d) return <span key={i} />;
                const key = `${cursor.y}-${pad(cursor.m + 1)}-${pad(d)}`;
                const count = byDate[key]?.reduce((n, b) => n + b.guests, 0) || 0;
                const isSel = key === selected;
                return (
                  <button key={key} type="button" onClick={() => setSelected(key)} aria-label={`${d} de ${MONTHS[cursor.m]}${count ? `, ${count} personas` : ""}`}
                    className={`aspect-square rounded-lg text-sm flex flex-col items-center justify-center border transition-colors ${isSel ? "border-primary bg-primary/10" : "border-transparent hover:bg-muted"} ${count ? "font-semibold" : ""}`}>
                    {d}
                    {count > 0 && <span className="mt-0.5 rounded-full bg-primary px-1.5 text-[10px] leading-4 text-primary-foreground">{count}</span>}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{selected}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {dayList.length === 0 ? <p className="text-sm text-muted-foreground">Sin salidas ese día.</p> : dayList.map((b) => (
              <div key={b.id} className="rounded-lg border border-border p-3 text-sm">
                <p className="font-semibold">{b.contact_name}</p>
                <p className="text-muted-foreground">{b.listing_title} · {b.time || "—"} · {b.guests} pers.</p>
                <div className="mt-1 flex items-center justify-between"><Badge variant="secondary">{BOOKING_STATUS_LABEL[b.status]}</Badge><span className="font-mono">{formatMoney(b.total_price, b.currency)}</span></div>
              </div>
            ))}
            {published.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Cupos disponibles</p>
                <ul className="space-y-1 text-sm">
                  {published.map((l) => (
                    <li key={l.id} className="flex justify-between gap-2"><span className="truncate">{l.title}</span><span className="font-mono shrink-0">{availableSpots(l, bookings, selected)}/{l.capacity}</span></li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
