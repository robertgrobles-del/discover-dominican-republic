import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, Languages, MapPin, ShieldCheck, Star, Users } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { isValidEmail } from "@/lib/security";
import {
  availableSpots, bumpPromotionUse, createBooking, fetchAllBookings, fetchListingBySlug, fetchOrgBySlug, findPromotion, sendMessage,
} from "../api";
import { CANCELLATION_POLICIES, CATEGORY_META, formatMoney } from "../constants";
import type { Promotion } from "../types";

export default function OperadorServicio() {
  const { slug = "", listing: listingSlug = "" } = useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const orgQ = useQuery({ queryKey: ["op", "org-slug", slug], queryFn: () => fetchOrgBySlug(slug) });
  const org = orgQ.data;
  const listingQ = useQuery({ queryKey: ["op", "listing", org?.id, listingSlug], queryFn: () => fetchListingBySlug(org!.id, listingSlug), enabled: !!org });
  const listing = listingQ.data;
  const bookingsQ = useQuery({ queryKey: ["op", "all-bookings"], queryFn: fetchAllBookings });

  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState<string>("");
  const [guests, setGuests] = useState(2);
  const [code, setCode] = useState("");
  const [promo, setPromo] = useState<Promotion | null>(null);
  const [f, setF] = useState({ name: "", email: "", phone: "", notes: "" });
  const [image, setImage] = useState(0);
  const [done, setDone] = useState<{ id: string; paid: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  const isOwner = !!org && user?.id === org.id;
  const selectedTime = time || listing?.time_slots?.[0] || "";
  const spots = useMemo(() => (listing ? availableSpots(listing, bookingsQ.data || [], date, selectedTime) : 0), [listing, bookingsQ.data, date, selectedTime]);

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
  const subtotal = listing.price * guests;
  const discount = promo ? (promo.type === "percent" ? (subtotal * promo.value) / 100 : Math.min(promo.value, subtotal)) : 0;
  const total = Math.max(0, subtotal - discount);
  const policy = CANCELLATION_POLICIES.find((p) => p.value === listing.cancellation_policy);

  const applyCode = async () => {
    const p = await findPromotion(org.id, code);
    setPromo(p);
    toast[p ? "success" : "error"](p ? `Código aplicado: ${p.code}` : "Código no válido o vencido");
  };

  const submit = async (payNow: boolean) => {
    if (f.name.trim().length < 2) return toast.error("Escribe tu nombre.");
    if (!isValidEmail(f.email)) return toast.error("Ingresa un correo válido.");
    if (date < today) return toast.error("Elige una fecha futura.");
    if (guests < 1 || guests > spots) return toast.error(spots === 0 ? "No hay cupos para esa fecha y horario." : `Solo quedan ${spots} cupos.`);
    setBusy(true);
    try {
      const id = await createBooking({
        org_id: org.id, listing_id: listing.id, listing_title: listing.title, contact_name: f.name.trim(), contact_email: f.email.trim(),
        contact_phone: f.phone.trim() || undefined, date, time: selectedTime, guests, total_price: total, currency: listing.currency,
        status: payNow ? "confirmed" : "pending", payment_status: payNow ? "paid" : "unpaid", promo_code: promo?.code, notes: f.notes.trim() || undefined, source: "web",
      });
      await sendMessage({ org_id: org.id, thread_id: `web-${id}`, traveler_name: f.name.trim(), sender: "traveler", channel: "web", booking_id: id, read: false, body: `Nueva reserva de ${guests} persona(s) para ${listing.title} el ${date} a las ${selectedTime}.${f.notes.trim() ? ` Nota: ${f.notes.trim()}` : ""}` });
      if (promo) await bumpPromotionUse(promo.id, promo.uses);
      qc.invalidateQueries({ queryKey: ["op"] });
      setDone({ id, paid: payNow });
    } catch (e: any) {
      toast.error(e.message || "No se pudo completar la reserva");
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
            </div>

            <aside className="lg:sticky lg:top-24 self-start">
              <Card><CardContent className="p-5 space-y-4">
                <p className="text-sm text-muted-foreground">Desde</p>
                <p className="font-display text-3xl font-extrabold">{formatMoney(listing.price, listing.currency)} <span className="text-sm font-normal text-muted-foreground">/ persona</span></p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label htmlFor="b-date">Fecha</Label><Input id="b-date" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} /></div>
                  <div className="space-y-1"><Label>Horario</Label>
                    <Select value={selectedTime} onValueChange={setTime}><SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{listing.time_slots.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="space-y-1"><Label htmlFor="b-guests">Personas <span className="text-xs text-muted-foreground">({spots} cupos disponibles)</span></Label>
                  <Input id="b-guests" type="number" min={1} max={Math.max(1, spots)} value={guests} onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))} /></div>
                <div className="space-y-1"><Label htmlFor="b-code">Código promocional</Label>
                  <div className="flex gap-2"><Input id="b-code" maxLength={20} value={code} onChange={(e) => setCode(e.target.value)} placeholder="BIENVENIDO10" /><Button type="button" variant="outline" onClick={applyCode}>Aplicar</Button></div></div>
                <div className="border-t border-border pt-3 space-y-2">
                  <div className="space-y-1"><Label htmlFor="b-name">Nombre completo</Label><Input id="b-name" maxLength={80} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
                  <div className="space-y-1"><Label htmlFor="b-mail">Correo</Label><Input id="b-mail" type="email" maxLength={254} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
                  <div className="space-y-1"><Label htmlFor="b-phone">Teléfono / WhatsApp (opcional)</Label><Input id="b-phone" maxLength={25} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
                  <div className="space-y-1"><Label htmlFor="b-notes">Notas (opcional)</Label><Textarea id="b-notes" rows={2} maxLength={300} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
                </div>
                <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
                  <div className="flex justify-between"><span>{formatMoney(listing.price, listing.currency)} × {guests}</span><span>{formatMoney(subtotal, listing.currency)}</span></div>
                  {discount > 0 && <div className="flex justify-between text-emerald-600"><span>Descuento {promo?.code}</span><span>− {formatMoney(discount, listing.currency)}</span></div>}
                  <div className="flex justify-between font-bold text-base pt-1 border-t border-border"><span>Total</span><span>{formatMoney(total, listing.currency)}</span></div>
                </div>
                <Button className="w-full" size="lg" disabled={busy || spots === 0} onClick={() => submit(true)}>Reservar y pagar ahora</Button>
                <Button className="w-full" variant="outline" disabled={busy || spots === 0} onClick={() => submit(false)}>Solicitar reserva (pagar después)</Button>
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
