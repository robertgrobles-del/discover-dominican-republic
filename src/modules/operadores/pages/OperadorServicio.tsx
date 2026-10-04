import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, Languages, MapPin, MessageCircle, Phone, ShieldCheck, Star, Users } from "lucide-react";
import { trackContactClick, whatsappNumber } from "@/lib/operatorContactApi";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { isValidEmail } from "@/lib/security";
import {
  availableRooms, availableSpots, bumpPromotionUse, fetchListings, nightsBetween, createBooking, fetchAllBookings, fetchListingBySlug, fetchOrgBySlug, findPromotion, sendMessage,
} from "../api";
import { CANCELLATION_POLICIES, CATEGORY_META, EXTRA_UNIT_LABEL, formatMoney } from "../constants";
import { runAutomation } from "../automation";
import { addDays, quoteStay } from "../pricing";
import type { Listing, Promotion } from "../types";

export default function OperadorServicio() {
  const { slug = "", listing: listingSlug = "" } = useParams();
  const { user } = useAuth();
  const [search, setSearch] = useSearchParams();
  const qc = useQueryClient();
  const orgQ = useQuery({ queryKey: ["op", "org-slug", slug], queryFn: () => fetchOrgBySlug(slug) });
  const org = orgQ.data;
  const listingQ = useQuery({ queryKey: ["op", "listing", org?.id, listingSlug], queryFn: () => fetchListingBySlug(org!.id, listingSlug), enabled: !!org });
  const listing = listingQ.data;
  const allListingsQ = useQuery({ queryKey: ["op", "listings-of", org?.id], queryFn: () => fetchListings(org!.id), enabled: !!org });
  const allListings = allListingsQ.data || [];
  const bookingsQ = useQuery({ queryKey: ["op", "all-bookings"], queryFn: fetchAllBookings });

  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState<string>("");
  const [guests, setGuests] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [code, setCode] = useState("");
  const [promo, setPromo] = useState<Promotion | null>(null);
  const [f, setF] = useState({ name: "", email: "", phone: "", notes: "" });
  const [image, setImage] = useState(0);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [done, setDone] = useState<{ id: string; paid: boolean; deposit: number; balance: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);

  const isOwner = !!org && user?.id === org.id;
  const selectedTime = time || listing?.time_slots?.[0] || "";
  const spots = useMemo(() => (listing ? availableSpots(listing, bookingsQ.data || [], date, selectedTime) : 0), [listing, bookingsQ.data, date, selectedTime]);

  const isStay = listing?.category === "alojamiento" && !!listing.rooms?.length;
  const roomId = search.get("habitacion") || "";
  const room = isStay ? listing!.rooms!.find((r) => r.id === roomId) || (roomId ? undefined : undefined) : undefined;
  const nights = nightsBetween(date, checkOut);
  const roomsFree = useMemo(() => (listing && room ? availableRooms(listing, room.id, bookingsQ.data || [], date, checkOut) : 0), [listing, room, bookingsQ.data, date, checkOut]);

  if (orgQ.isLoading || (org && listingQ.isLoading)) return <div className="min-h-screen" />;
  if (!org || !listing || (listing.status !== "published" && !isOwner)) {
    return (
      <PageTransition>
        <SEOHead title="Servicio no disponible — Descubre RD" description="Este servicio no está disponible." />
        <Header variant="white" />
        <main className="min-h-[60vh] flex flex-col items-center justify-center gap-4 pt-24 text-center px-4">
          <h1 className="font-display text-2xl font-bold">Este servicio no está disponible</h1>
          <Button asChild><Link to="/operadores/directorio">Ver operadores verificados</Link></Button>
        </main>
        <Footer />
      </PageTransition>
    );
  }

  const cat = CATEGORY_META[listing.category];
  const packDays = listing.category === "paquete" ? Math.max(1, listing.days || 1) : 1;
  const endDate = packDays > 1 ? addDays(date, packDays - 1) : undefined;
  const included = (listing.components || []).map((id) => allListings.find((l) => l.id === id)).filter(Boolean) as Listing[];
  const quote = room ? quoteStay(room, date, checkOut) : null;
  const unitPrice = room ? (quote && quote.nights ? quote.average : room.price) : listing.price;
  const units = isStay ? nights : guests;
  const hasChild = !isStay && listing.child_price != null;
  const kids = hasChild ? children : 0;
  const babies = !isStay && listing.infants_free ? infants : 0;
  const seats = guests + kids; // los bebés no ocupan cupo
  const base = quote ? quote.total : listing.price * guests + (listing.child_price ?? listing.price) * kids;
  const extraLines = (listing.extras || []).filter((x) => picked.includes(x.id)).map((x) => {
    const qty = x.unit === "person" ? seats : x.unit === "night" ? Math.max(1, nights) : 1;
    return { id: x.id, name: x.name, qty, price: x.price };
  });
  const extrasTotal = extraLines.reduce((n, x) => n + x.qty * x.price, 0);
  const subtotal = base + extrasTotal;
  const discount = promo ? (promo.type === "percent" ? (subtotal * promo.value) / 100 : Math.min(promo.value, subtotal)) : 0;
  const total = Math.max(0, subtotal - discount);
  const policy = CANCELLATION_POLICIES.find((p) => p.value === listing.cancellation_policy);

  const applyCode = async () => {
    const p = await findPromotion(org.id, code);
    setPromo(p);
    toast[p ? "success" : "error"](p ? `Código aplicado: ${p.code}` : "Código no válido o vencido");
  };

  const depositPct = listing.deposit_percent && listing.deposit_percent > 0 && listing.deposit_percent < 100 ? listing.deposit_percent : 0;
  const depositAmount = depositPct ? Math.round(total * depositPct) / 100 : 0;

  const submit = async (payNow: boolean, deposit = false) => {
    if (f.name.trim().length < 2) return toast.error("Escribe tu nombre.");
    if (!isValidEmail(f.email)) return toast.error("Ingresa un correo válido.");
    if (date < today) return toast.error("Elige una fecha futura.");
    if (isStay) {
      if (!room) return toast.error("Elige una habitación.");
      if (nights < 1) return toast.error("La salida debe ser posterior a la llegada.");
      if (quote?.issue) return toast.error(quote.issue);
      if (guests > room.guests) return toast.error(`Esta habitación admite hasta ${room.guests} huéspedes.`);
      if (roomsFree < 1) return toast.error("Esta habitación no está disponible en esas fechas.");
    } else if (seats < 1 || seats > spots) return toast.error(spots === 0 ? "No hay cupos para esa fecha y horario." : `Solo quedan ${spots} cupos.`);
    setBusy(true);
    try {
      const id = await createBooking({
        org_id: org.id, listing_id: listing.id, listing_title: room ? `${listing.title} — ${room.name}` : listing.title, room_id: room?.id, room_name: room?.name, check_out: isStay ? checkOut : endDate, extras: extraLines.length ? extraLines : undefined, contact_name: f.name.trim(), contact_email: f.email.trim(),
        contact_phone: f.phone.trim() || undefined, date, time: isStay ? undefined : selectedTime, guests: isStay ? guests : seats, guest_mix: !isStay && (kids || babies) ? { adults: guests, children: kids, infants: babies } : undefined, total_price: total, currency: listing.currency,
        status: payNow ? "confirmed" : "pending", payment_status: deposit ? "partial" : payNow ? "paid" : "unpaid", amount_paid: deposit ? depositAmount : payNow ? total : 0, promo_code: promo?.code, notes: f.notes.trim() || undefined, source: "web",
      });
      await sendMessage({ org_id: org.id, thread_id: `web-${id}`, traveler_name: f.name.trim(), sender: "traveler", channel: "web", booking_id: id, read: false, body: isStay ? `Nueva reserva de ${room!.name} en ${listing.title}: ${date} → ${checkOut} (${nights} noche(s)), ${guests} huésped(es).${extraLines.length ? ` Extras: ${extraLines.map((x) => `${x.name} ×${x.qty}`).join(", ")}.` : ""}${f.notes.trim() ? ` Nota: ${f.notes.trim()}` : ""}` : `Nueva reserva de ${seats} persona(s)${kids || babies ? ` (${guests} adulto(s), ${kids} niño(s), ${babies} bebé(s))` : ""} para ${listing.title} el ${date} a las ${selectedTime}.${f.notes.trim() ? ` Nota: ${f.notes.trim()}` : ""}` });
      if (promo) await bumpPromotionUse(promo.id, promo.uses);
      await runAutomation("confirmation", org, id).catch(() => false);
      qc.invalidateQueries({ queryKey: ["op"] });
      setDone({ id, paid: payNow, deposit: deposit ? depositAmount : 0, balance: deposit ? total - depositAmount : 0 });
    } catch (e) {
      toast.error((e instanceof Error && e.message) || "No se pudo completar la reserva");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <PageTransition>
        <SEOHead title="Reserva registrada — Descubre RD" description="Tu reserva fue registrada." />
        <Header variant="white" />
        <main className="pt-28 pb-16 container mx-auto px-4 max-w-xl text-center space-y-4">
          <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto" />
          <h1 className="font-display text-3xl font-bold">{done.paid ? "¡Reserva confirmada!" : "¡Solicitud enviada!"}</h1>
          <p className="text-muted-foreground">{done.paid ? "Recibirás la confirmación en tu correo." : `${org.business_name} confirmará tu reserva y te contactará pronto.`}</p>
          <p className="rounded-lg bg-muted p-3 font-mono text-sm">Referencia: {done.id}</p>
          {done.deposit > 0 && <p className="rounded-lg border border-border p-3 text-sm">Depósito pagado: <b>{formatMoney(done.deposit, listing.currency)}</b> · Saldo a pagar al llegar: <b>{formatMoney(done.balance, listing.currency)}</b></p>}
          <div className="flex justify-center gap-3"><Button asChild><Link to={`/operador/${org.slug}`}>Ver más de {org.business_name}</Link></Button><Button variant="outline" asChild><Link to="/">Volver al inicio</Link></Button></div>
        </main>
        <Footer />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SEOHead title={`${listing.title} — ${org.business_name}`} description={listing.summary || listing.description.slice(0, 150)} image={listing.images?.[0]} />
      <Header variant="white" />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <nav className="text-sm text-muted-foreground mb-4"><Link to={`/operador/${org.slug}`} className="hover:text-primary">{org.business_name}</Link></nav>
          <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
            <div className="space-y-6 min-w-0">
              <div>
                <Badge className="gap-1 mb-2"><cat.icon className="h-3 w-3" /> {cat.label.replace(/s$/, "")}</Badge>
                <h1 className="font-display text-3xl md:text-4xl font-extrabold">{listing.title}</h1>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                  {listing.destination && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {listing.destination}</span>}
                  {listing.duration && <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {listing.duration}</span>}
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" /> hasta {listing.capacity} personas</span>
                  {listing.rating ? <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {listing.rating} ({listing.reviews_count})</span> : null}
                </div>
              </div>

              {listing.images.length > 0 && (
                <div className="space-y-2">
                  <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-muted"><img src={listing.images[image]} alt={`${listing.title} — foto ${image + 1}`} className="w-full h-full object-cover" /></div>
                  {listing.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">{listing.images.map((u, i) => (
                      <button key={u + i} type="button" aria-label={`Ver foto ${i + 1}`} onClick={() => setImage(i)} className={`h-16 w-24 shrink-0 rounded-lg overflow-hidden border-2 ${i === image ? "border-primary" : "border-transparent"}`}><img src={u} alt="" className="w-full h-full object-cover" /></button>
                    ))}</div>
                  )}
                </div>
              )}

              {isStay && (
                <section id="habitaciones"><h2 className="font-display text-xl font-bold mb-3">Habitaciones</h2>
                  <div className="space-y-3">{listing.rooms!.map((r) => {
                    const sel = room?.id === r.id;
                    return (
                      <Card key={r.id} className={sel ? "border-primary ring-1 ring-primary" : ""}><CardContent className="p-4 flex flex-wrap gap-4 items-center">
                        {r.image && <img src={r.image} alt={r.name} className="h-20 w-28 rounded-lg object-cover" />}
                        <div className="flex-1 min-w-[12rem]">
                          <p className="font-semibold">{r.name}</p>
                          <p className="text-xs text-muted-foreground">Hasta {r.guests} huéspedes{r.beds ? ` · ${r.beds}` : ""}</p>
                          {r.amenities.length > 0 && <p className="text-xs text-muted-foreground mt-1">{r.amenities.join(" · ")}</p>}
                        </div>
                        <div className="text-right"><p className="font-display font-bold">{formatMoney(r.price, listing.currency)}</p><p className="text-xs text-muted-foreground">por noche</p></div>
                        <Button size="sm" variant={sel ? "default" : "outline"} onClick={() => setSearch({ habitacion: r.id }, { replace: true })}>{sel ? "Seleccionada" : "Reservar esta"}</Button>
                      </CardContent></Card>
                    );
                  })}</div>
                  {room && <p className="mt-3 text-xs text-muted-foreground">Enlace directo a esta habitación: <span className="font-mono break-all">{`${window.location.origin}/operador/${org.slug}/${listing.slug}?habitacion=${room.id}`}</span></p>}
                </section>
              )}
              {listing.category === "paquete" && (listing.itinerary?.length ?? 0) > 0 && (
                <section id="itinerario"><h2 className="font-display text-xl font-bold mb-3">Itinerario · {packDays} días</h2>
                  <ol className="space-y-3">{listing.itinerary!.map((d) => (
                    <li key={d.day} className="flex gap-3"><span className="h-8 w-8 shrink-0 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">{d.day}</span>
                      <div><p className="font-semibold">{d.title}</p>{d.description && <p className="text-sm text-muted-foreground">{d.description}</p>}</div></li>
                  ))}</ol>
                  {included.length > 0 && <div className="mt-4"><p className="text-sm font-medium mb-2">Servicios incluidos</p>
                    <div className="flex flex-wrap gap-2">{included.map((l) => <Link key={l.id} to={`/operador/${org.slug}/${l.slug}`} className="rounded-full bg-secondary px-3 py-1 text-xs hover:bg-secondary/80">{l.title}</Link>)}</div></div>}
                </section>
              )}
              <section><h2 className="font-display text-xl font-bold mb-2">Descripción</h2><p className="text-muted-foreground whitespace-pre-line">{listing.description}</p></section>
              {listing.includes.length > 0 && (
                <section><h2 className="font-display text-xl font-bold mb-2">Qué incluye</h2>
                  <ul className="grid sm:grid-cols-2 gap-2">{listing.includes.map((i) => <li key={i} className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-primary" /> {i}</li>)}</ul></section>
              )}
              <section className="grid sm:grid-cols-3 gap-3 text-sm">
                <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground flex items-center gap-1"><Languages className="h-3 w-3" /> Idiomas</p><p className="font-medium">{listing.languages.join(", ")}</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Punto de encuentro</p><p className="font-medium">{listing.meeting_point || "Se confirma al reservar"}</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Cancelación</p><p className="font-medium">{policy?.label}: {policy?.desc}</p></CardContent></Card>
              </section>
              {(org.phone || listing.meeting_point) && (
                <section className="flex flex-wrap items-center gap-2 text-sm" aria-label="Contactar al operador">
                  <span className="text-muted-foreground">¿Dudas antes de reservar?</span>
                  {org.phone && whatsappNumber(org.phone) && <Button size="sm" variant="outline" asChild><a href={`https://wa.me/${whatsappNumber(org.phone)}`} target="_blank" rel="noopener noreferrer" onClick={() => trackContactClick(slug, "whatsapp", listing.id)}><MessageCircle className="mr-1 h-4 w-4" /> WhatsApp</a></Button>}
                  {org.phone && <Button size="sm" variant="outline" asChild><a href={`tel:${org.phone.replace(/[^\d+]/g, "")}`} onClick={() => trackContactClick(slug, "call", listing.id)}><Phone className="mr-1 h-4 w-4" /> Llamar</a></Button>}
                  {listing.meeting_point && <Button size="sm" variant="outline" asChild><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${listing.meeting_point}, ${listing.destination ?? "República Dominicana"}`)}`} target="_blank" rel="noopener noreferrer" onClick={() => trackContactClick(slug, "directions", listing.id)}><MapPin className="mr-1 h-4 w-4" /> Cómo llegar</a></Button>}
                </section>
              )}
            </div>

            <aside className="lg:sticky lg:top-24 self-start">
              <Card><CardContent className="p-5 space-y-4">
                <p className="text-sm text-muted-foreground">{room ? room.name : "Desde"}</p>
                <p className="font-display text-3xl font-extrabold">{formatMoney(unitPrice, listing.currency)} <span className="text-sm font-normal text-muted-foreground">/ {isStay ? "noche" : "persona"}</span></p>
                {isStay ? (
                  <>
                    {!room && <p className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-sm">Elige una habitación en la lista para reservar.</p>}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1"><Label htmlFor="b-date">Llegada</Label><Input id="b-date" type="date" min={today} value={date} onChange={(e) => { setDate(e.target.value); if (e.target.value >= checkOut) setCheckOut(new Date(Date.parse(e.target.value) + 86400000).toISOString().slice(0, 10)); }} /></div>
                      <div className="space-y-1"><Label htmlFor="b-out">Salida</Label><Input id="b-out" type="date" min={date} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} /></div>
                    </div>
                    <div className="space-y-1"><Label htmlFor="b-guests">Huéspedes {room && <span className="text-xs text-muted-foreground">(máx. {room.guests} · {roomsFree} disponible(s))</span>}</Label>
                      <Input id="b-guests" type="number" min={1} max={room?.guests} value={guests} onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))} /></div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1"><Label htmlFor="b-date">{packDays > 1 ? "Fecha de inicio" : "Fecha"}</Label><Input id="b-date" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />{endDate && <p className="text-[11px] text-muted-foreground">Termina el {endDate}</p>}</div>
                      <div className="space-y-1"><Label>Horario</Label>
                        <Select value={selectedTime} onValueChange={setTime}><SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{listing.time_slots.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                    </div>
                    <div className="space-y-1"><Label htmlFor="b-guests">{hasChild || listing.infants_free ? "Adultos" : "Personas"} <span className="text-xs text-muted-foreground">({spots} cupos disponibles)</span></Label>
                      <Input id="b-guests" type="number" min={1} max={Math.max(1, spots)} value={guests} onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))} /></div>
                    {(hasChild || listing.infants_free) && (
                      <div className="grid grid-cols-2 gap-3">
                        {hasChild && <div className="space-y-1"><Label htmlFor="b-kids">Niños 3–11 <span className="text-xs text-muted-foreground">({formatMoney(listing.child_price!, listing.currency)})</span></Label><Input id="b-kids" type="number" min={0} value={children} onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))} /></div>}
                        {listing.infants_free && <div className="space-y-1"><Label htmlFor="b-babies">Bebés 0–2 <span className="text-xs text-muted-foreground">(gratis)</span></Label><Input id="b-babies" type="number" min={0} value={infants} onChange={(e) => setInfants(Math.max(0, Number(e.target.value)))} /></div>}
                      </div>
                    )}
                    {(listing.min_guests ?? 0) > 1 && (() => { const booked = listing.capacity - spots; const need = listing.min_guests! - booked; return (
                      <p className={`rounded-lg p-2 text-xs ${need <= 0 ? "bg-emerald-500/10 text-emerald-700" : "bg-amber-500/10 text-amber-700"}`}>{need <= 0 ? "Salida confirmada: ya se alcanzó el mínimo de personas." : `Faltan ${need} persona(s) para confirmar esta salida (mínimo ${listing.min_guests}). Si no se alcanza, te ofrecemos otra fecha o el reembolso.`}</p>
                    ); })()}
                  </>
                )}
                {(listing.extras?.length ?? 0) > 0 && (
                  <fieldset className="space-y-2"><legend className="text-sm font-medium mb-1">Extras opcionales</legend>
                    {listing.extras!.map((x) => (
                      <label key={x.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox checked={picked.includes(x.id)} onCheckedChange={(c) => setPicked((p) => (c ? [...p, x.id] : p.filter((i) => i !== x.id)))} />
                        <span className="flex-1">{x.name}</span>
                        <span className="text-muted-foreground text-xs">{formatMoney(x.price, listing.currency)} {EXTRA_UNIT_LABEL[x.unit]}</span>
                      </label>
                    ))}
                  </fieldset>
                )}
                <div className="space-y-1"><Label htmlFor="b-code">Código promocional</Label>
                  <div className="flex gap-2"><Input id="b-code" maxLength={20} value={code} onChange={(e) => setCode(e.target.value)} placeholder="BIENVENIDO10" /><Button type="button" variant="outline" onClick={applyCode}>Aplicar</Button></div></div>
                <div className="border-t border-border pt-3 space-y-2">
                  <div className="space-y-1"><Label htmlFor="b-name">Nombre completo</Label><Input id="b-name" maxLength={80} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
                  <div className="space-y-1"><Label htmlFor="b-mail">Correo</Label><Input id="b-mail" type="email" maxLength={254} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
                  <div className="space-y-1"><Label htmlFor="b-phone">Teléfono / WhatsApp (opcional)</Label><Input id="b-phone" maxLength={25} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
                  <div className="space-y-1"><Label htmlFor="b-notes">Notas (opcional)</Label><Textarea id="b-notes" rows={2} maxLength={300} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
                </div>
                <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
                  {quote && quote.nights > 0 ? quote.lines.map((l) => <div key={l.label + l.price} className="flex justify-between"><span>{l.label}: {formatMoney(l.price, listing.currency)} × {l.nights} noche(s)</span><span>{formatMoney(l.price * l.nights, listing.currency)}</span></div>)
                    : <>
                      <div className="flex justify-between"><span>{kids || babies ? "Adultos: " : ""}{formatMoney(unitPrice, listing.currency)} × {units}</span><span>{formatMoney(unitPrice * units, listing.currency)}</span></div>
                      {kids > 0 && <div className="flex justify-between"><span>Niños: {formatMoney(listing.child_price!, listing.currency)} × {kids}</span><span>{formatMoney(listing.child_price! * kids, listing.currency)}</span></div>}
                      {babies > 0 && <div className="flex justify-between text-emerald-600"><span>Bebés × {babies}</span><span>Gratis</span></div>}
                    </>}
                  {extraLines.map((x) => <div key={x.id} className="flex justify-between"><span>{x.name} × {x.qty}</span><span>{formatMoney(x.price * x.qty, listing.currency)}</span></div>)}
                  {quote?.issue && <p className="text-xs text-destructive">{quote.issue}</p>}
                  {discount > 0 && <div className="flex justify-between text-emerald-600"><span>Descuento {promo?.code}</span><span>− {formatMoney(discount, listing.currency)}</span></div>}
                  <div className="flex justify-between font-bold text-base pt-1 border-t border-border"><span>Total</span><span>{formatMoney(total, listing.currency)}</span></div>
                </div>
                <Button className="w-full" size="lg" disabled={busy || (isStay ? !room || roomsFree < 1 || nights < 1 || !!quote?.issue : spots === 0)} onClick={() => submit(true)}>Reservar y pagar ahora</Button>
                {depositPct > 0 && <Button className="w-full" variant="secondary" disabled={busy || (isStay ? !room || roomsFree < 1 || nights < 1 || !!quote?.issue : spots === 0)} onClick={() => submit(true, true)}>Reservar con depósito de {formatMoney(depositAmount, listing.currency)} ({depositPct} %)</Button>}
                <Button className="w-full" variant="outline" disabled={busy || (isStay ? !room || roomsFree < 1 || nights < 1 || !!quote?.issue : spots === 0)} onClick={() => submit(false)}>Solicitar reserva (pagar después)</Button>
                <p className="text-[11px] text-muted-foreground text-center">Pago simulado en este entorno de demostración. {org.business_name} recibe tu reserva de forma directa.</p>
              </CardContent></Card>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
}
