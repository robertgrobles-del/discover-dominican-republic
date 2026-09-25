import { useMemo, useState } from "react";
import { Download, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { runAutomation } from "../automation";
import { balanceDue, createBooking, opKeys, paidAmount, updateBooking, useBookings, useListings, useOpMutation } from "../api";
import { BOOKING_STATUS_LABEL, PAYMENT_STATUS_LABEL, formatMoney } from "../constants";
import type { Booking, BookingStatus } from "../types";
import { isValidEmail } from "@/lib/security";
import { useOrg } from "./OrgContext";

type Filter = "all" | "in_progress" | "upcoming" | "completed" | "cancelled" | "reviews";
const FILTERS: [Filter, string][] = [["all", "Todos"], ["in_progress", "En curso"], ["upcoming", "Próximamente"], ["completed", "Completados"], ["cancelled", "Cancelados"], ["reviews", "Reseñas pendientes"]];

function downloadCsv(rows: Booking[]) {
  const head = ["id", "servicio", "cliente", "email", "fecha", "hora", "personas", "total", "moneda", "estado", "pago", "origen"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const body = rows.map((b) => [b.id, b.listing_title, b.contact_name, b.contact_email, b.date, b.time, b.guests, b.total_price, b.currency, b.status, b.payment_status, b.source].map(esc).join(","));
  const blob = new Blob([[head.join(","), ...body].join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "reservas.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function Reservas({ onlyPending = false }: { onlyPending?: boolean }) {
  const { org } = useOrg();
  const qc = useQueryClient();
  const { data: bookings = [] } = useBookings(org.id);
  const { data: listings = [] } = useListings(org.id);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const keys = [opKeys.bookings(org.id)];
  const update = useOpMutation(({ id, patch }: { id: string; patch: Partial<Booking> }) => updateBooking(id, patch), keys);
  const create = useOpMutation(createBooking, keys);

  const list = useMemo(() => {
    let l = bookings;
    if (onlyPending) l = l.filter((b) => b.status === "pending");
    else if (filter === "in_progress") l = l.filter((b) => b.status === "in_progress");
    else if (filter === "upcoming") l = l.filter((b) => b.date >= today && (b.status === "confirmed" || b.status === "pending"));
    else if (filter === "completed") l = l.filter((b) => b.status === "completed");
    else if (filter === "cancelled") l = l.filter((b) => b.status === "cancelled");
    else if (filter === "reviews") l = l.filter((b) => b.review_pending);
    const s = q.trim().toLowerCase();
    return s ? l.filter((b) => [b.contact_name, b.contact_email, b.listing_title, b.id].some((v) => v?.toLowerCase().includes(s))) : l;
  }, [bookings, filter, q, onlyPending, today]);

  const setStatus = (b: Booking, status: BookingStatus) =>
    update.mutate({ id: b.id, patch: { status, ...(status === "completed" ? { review_pending: true } : {}) } }, { onSuccess: () => { toast.success(`Reserva ${BOOKING_STATUS_LABEL[status].toLowerCase()}`); if (status === "completed") runAutomation("review", org, b.id).then((sent) => { if (sent) { toast.message("Solicitud de reseña enviada al viajero"); qc.invalidateQueries({ queryKey: ["op"] }); } }).catch(() => undefined); } });

  const [form, setForm] = useState({ listing_id: "", name: "", email: "", date: today, time: "09:00", guests: 2 });
  const submitManual = () => {
    const l = listings.find((x) => x.id === form.listing_id);
    if (!l) return toast.error("Elige un servicio.");
    if (form.name.trim().length < 2) return toast.error("Escribe el nombre del cliente.");
    if (!isValidEmail(form.email)) return toast.error("Ingresa un correo válido.");
    create.mutate(
      { org_id: org.id, listing_id: l.id, listing_title: l.title, contact_name: form.name.trim(), contact_email: form.email.trim(), date: form.date, time: form.time, guests: form.guests, total_price: l.price * form.guests, currency: l.currency, status: "confirmed", payment_status: "unpaid", source: "manual" } as any,
      { onSuccess: () => { toast.success("Reserva registrada"); setOpen(false); }, onError: (e: any) => toast.error(e.message) },
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-3xl font-bold">{onlyPending ? "Solicitudes" : "Reservas"}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" aria-label="Exportar CSV" onClick={() => downloadCsv(list)}><Download className="h-4 w-4" /></Button>
          <Button size="icon" aria-label="Registrar reserva manual" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /></Button>
        </div>
      </div>

      {!onlyPending && (
        <div className="flex flex-wrap gap-2 mb-4" role="tablist">
          {FILTERS.map(([k, label]) => (
            <Button key={k} size="sm" role="tab" aria-selected={filter === k} variant={filter === k ? "default" : "outline"} className="rounded-full" onClick={() => setFilter(k)}>{label}</Button>
          ))}
        </div>
      )}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar por cliente, correo o servicio" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar reservas" />
      </div>

      {list.length === 0 ? (
        <Card><CardContent className="py-16 text-center space-y-1">
          <p className="font-semibold text-lg">{onlyPending ? "No tienes solicitudes pendientes." : "No tienes reservas."}</p>
          <p className="text-sm text-muted-foreground">Las reservas de tus servicios aparecerán aquí cuando los viajeros reserven, o puedes registrar una manualmente.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {list.map((b) => (
            <Card key={b.id}><CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold truncate">{b.contact_name} <span className="text-xs text-muted-foreground font-normal">· {b.contact_email}</span></p>
                <p className="text-sm text-muted-foreground">{b.listing_title} · {b.date}{b.time ? ` ${b.time}` : ""} · {b.guests} pers.{b.guest_mix?.infants ? ` (+${b.guest_mix.infants} bebé(s))` : ""}{b.extras?.length ? ` · Extras: ${b.extras.map((x) => `${x.name} ×${x.qty}`).join(", ")}` : ""} · {b.source === "web" ? "Sitio web" : b.source === "manual" ? "Manual" : "Marketplace"}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm">{formatMoney(b.total_price, b.currency)}</span>
                <Badge variant="outline">{PAYMENT_STATUS_LABEL[b.payment_status]}</Badge>
                {b.payment_status === "partial" && <span className="text-xs text-muted-foreground">Cobrado {formatMoney(paidAmount(b), b.currency)} · Saldo {formatMoney(balanceDue(b), b.currency)}</span>}
                <Select value={b.status} onValueChange={(v) => setStatus(b, v as BookingStatus)}>
                  <SelectTrigger className="h-8 w-36 text-xs" aria-label="Estado de la reserva"><SelectValue /></SelectTrigger>
                  <SelectContent>{(Object.keys(BOOKING_STATUS_LABEL) as BookingStatus[]).map((s) => <SelectItem key={s} value={s}>{BOOKING_STATUS_LABEL[s]}</SelectItem>)}</SelectContent>
                </Select>
                {b.status === "pending" && <Button size="sm" onClick={() => setStatus(b, "confirmed")}>Confirmar</Button>}
                {b.payment_status !== "paid" && b.status !== "cancelled" && (
                  <Button size="sm" variant="outline" onClick={() => update.mutate({ id: b.id, patch: { payment_status: "paid", amount_paid: b.total_price } }, { onSuccess: () => toast.success("Cobro registrado") })}>{b.payment_status === "partial" ? "Cobrar saldo" : "Marcar pagada"}</Button>
                )}
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar reserva manual</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Servicio</Label>
              <Select value={form.listing_id} onValueChange={(v) => setForm({ ...form, listing_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecciona un servicio" /></SelectTrigger>
                <SelectContent>{listings.map((l) => <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>)}</SelectContent>
              </Select></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label htmlFor="m-name">Cliente</Label><Input id="m-name" maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-1"><Label htmlFor="m-mail">Correo</Label><Input id="m-mail" type="email" maxLength={254} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-1"><Label htmlFor="m-date">Fecha</Label><Input id="m-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div className="space-y-1"><Label htmlFor="m-guests">Personas</Label><Input id="m-guests" type="number" min={1} max={100} value={form.guests} onChange={(e) => setForm({ ...form, guests: Math.max(1, Number(e.target.value)) })} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={submitManual} disabled={create.isPending}>Registrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
