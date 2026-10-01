import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { sendDueReminders } from "../automation";
import { Link } from "react-router-dom";
import { AlertTriangle, Store, Globe, Wallet, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { opKeys, seedDemoData, useBookings, useListings, useOpMutation } from "../api";
import { BOOKING_STATUS_LABEL, PLATFORM_ANNOUNCEMENTS, formatMoney } from "../constants";
import { useOrg, useScopedBookings } from "./OrgContext";
import { OrgHealthWidget } from "./OrgHealthWidget";

export default function PanelHome() {
  const { org } = useOrg();
  const qc = useQueryClient();
  useEffect(() => { sendDueReminders(org).then((n) => { if (n) qc.invalidateQueries({ queryKey: ["op"] }); }).catch(() => undefined); }, [org.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const { data: listings = [] } = useListings(org.id);
  const { data: bookings = [] } = useScopedBookings();
  const [tab, setTab] = useState<"all" | "today" | "upcoming">("all");
  const today = new Date().toISOString().slice(0, 10);
  const active = bookings.filter((b) => b.status !== "cancelled");
  const shown = active.filter((b) => (tab === "today" ? b.date === today : tab === "upcoming" ? b.date > today : true)).slice(0, 6);
  const seed = useOpMutation(() => seedDemoData(org), [opKeys.listings(org.id), opKeys.bookings(org.id), opKeys.messages(org.id), opKeys.promos(org.id), opKeys.reviews(org.id)]);

  const steps = [
    { icon: Store, title: "Publica tu primera experiencia", desc: "Promociona y comercializa tus servicios", to: "anuncios/nuevo", done: listings.length > 0 },
    { icon: Globe, title: "Activa tu sitio web", desc: "Configura tu marca y enciende tu sitio de reservas", to: "perfil", done: org.website_enabled },
    { icon: Wallet, title: "Indica tu método de cobros", desc: "Cobra tus ganancias con tu método de cobro", to: "perfil", done: !!org.payout_method },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold">Bienvenido, {org.business_name}</h1>

      <OrgHealthWidget
        org={org}
        listingsCount={listings.length}
        teamCount={(org.team || []).length}
        pendingBookingsCount={bookings.filter((b) => b.status === "pending").length}
      />

      {org.verification !== "verified" && (
        <Alert className="border-amber-500/40 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            Tu organización todavía no está verificada por el equipo de Descubre RD. Puedes preparar tus anuncios y guardarlos como borrador; podrás publicarlos y cobrar cuando verifiquemos tu cuenta (te avisaremos por correo).
          </AlertDescription>
        </Alert>
      )}

      <section>
        <h2 className="font-display text-xl font-bold mb-3">Comienza tu travesía</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {steps.map((s) => (
            <Link key={s.title} to={s.to} className="group">
              <Card variant="editorial" className={`h-full transition-colors group-hover:border-primary/50 ${s.done ? "border-emerald-500/40" : ""}`}>
                <CardContent className="p-5 flex gap-3">
                  <s.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold flex items-center gap-2">{s.title} {s.done && <Badge className="bg-emerald-500/15 text-emerald-600 border-0">Listo</Badge>}</div>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        {listings.length === 0 && (
          <Button variant="outline" className="mt-4 gap-2" disabled={seed.isPending} onClick={() => seed.mutate(undefined, { onSuccess: () => toast.success("Datos de demostración cargados"), onError: (e: any) => toast.error(e.message) })}>
            {seed.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Cargar datos de demostración
          </Button>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl font-bold">Reservas</h2>
          <Button variant="ghost" size="sm" asChild><Link to="reservas">Ir a Reservas <ArrowRight className="h-4 w-4 ml-1" /></Link></Button>
        </div>
        <div className="flex gap-2 mb-4" role="tablist">
          {([["all", "Todos"], ["today", "Hoy"], ["upcoming", "Próximamente"]] as const).map(([k, label]) => (
            <Button key={k} size="sm" role="tab" aria-selected={tab === k} variant={tab === k ? "default" : "outline"} className="rounded-full" onClick={() => setTab(k)}>
              {label} ({active.filter((b) => (k === "today" ? b.date === today : k === "upcoming" ? b.date > today : true)).length})
            </Button>
          ))}
        </div>
        {shown.length === 0 ? (
          <Card variant="editorial"><CardContent className="py-10 text-center text-muted-foreground">
            <p className="font-semibold text-foreground">No tienes reserva pendiente.</p>
            <p className="text-sm">Las reservas se visualizarán en esta pantalla.</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-2">
            {shown.map((b) => (
              <Card key={b.id} variant="editorial"><CardContent className="p-4 flex flex-wrap items-center gap-3 justify-between">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{b.contact_name} · {b.listing_title || "Servicio"}</p>
                  <p className="text-sm text-muted-foreground">{b.date}{b.time ? ` · ${b.time}` : ""} · {b.guests} {b.guests === 1 ? "persona" : "personas"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm">{formatMoney(b.total_price, b.currency)}</span>
                  <Badge variant="secondary">{BOOKING_STATUS_LABEL[b.status]}</Badge>
                </div>
              </CardContent></Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl font-bold mb-3">Novedades de la plataforma</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {PLATFORM_ANNOUNCEMENTS.map((a) => (
            <Card key={a.id} variant="editorial"><CardContent className="p-4">
              <p className="font-semibold text-sm">{a.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{a.body}</p>
            </CardContent></Card>
          ))}
        </div>
      </section>
    </div>
  );
}
