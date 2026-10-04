import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { upcomingMondays } from "@/lib/adminCommerceApi";
import { money } from "@/lib/creatorCampaignsApi";
import { CAMPAIGN_STATUS_LABEL, MY_BID_STATUS_LABEL, advertiserApi as api, advertiserErrorMessage } from "@/lib/advertiserApi";

const fail = (error: unknown) => toast.error(advertiserErrorMessage(error));
const day = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("es-DO", { dateStyle: "medium" });
const WEEKS = upcomingMondays(8);

/**
 * Posiciones patrocinadas para el operador: crea su campaña con un anuncio y puja por una semana en un espacio.
 * La puja es a sobre cerrado: aquí sólo se ven las propias y el precio mínimo de cada espacio.
 */
export function SponsoredPositionsCard({ businessName }: { businessName: string }) {
  const client = useQueryClient();
  const { user } = useAuth();
  const [draft, setDraft] = useState({ campaign: "", slot: "", title: "", url: "" });
  const [bid, setBid] = useState({ creative: "", week: WEEKS[0]!, amount: "" });
  const refresh = () => { void client.invalidateQueries({ queryKey: ["ads", "mine"] }); void client.invalidateQueries({ queryKey: ["ads", "bids"] }); };

  const slots = useQuery({ queryKey: ["ads", "auction-slots"], enabled: HAS_BACKEND_SESSION, queryFn: api.slots });
  const campaigns = useQuery({ queryKey: ["ads", "mine"], enabled: HAS_BACKEND_SESSION, queryFn: api.campaigns });
  const bids = useQuery({ queryKey: ["ads", "bids"], enabled: HAS_BACKEND_SESSION, queryFn: api.bids });

  const create = useMutation({
    mutationFn: async () => {
      const campaign = await api.createCampaign({ advertiser_name: businessName, advertiser_email: user!.email!, campaign_name: draft.campaign.trim() });
      await api.createCreative(campaign.data.id, { slot_id: draft.slot, title: draft.title.trim(), target_url: draft.url.trim() });
    },
    onSuccess: () => { toast.success("Campaña enviada a revisión. Podrás pujar cuando se apruebe."); setDraft({ campaign: "", slot: "", title: "", url: "" }); refresh(); },
    onError: fail,
  });
  const place = useMutation({
    mutationFn: () => { const creative = creatives.find((c) => c.id === bid.creative)!; return api.bid({ slot_id: creative.slot_id, creative_id: creative.id, period_start: week, amount: Number(bid.amount) }); },
    onSuccess: () => { toast.success("Puja registrada"); setBid({ ...bid, amount: "" }); refresh(); }, onError: fail,
  });
  const withdraw = useMutation({ mutationFn: api.withdraw, onSuccess: () => { toast.success("Puja retirada"); refresh(); }, onError: fail });

  if (!HAS_BACKEND_SESSION) return null;
  const slotList = slots.data ?? [];
  const slotName = (id: string) => slotList.find((s) => s.id === id)?.name ?? id;
  const mine = campaigns.data?.data ?? [];
  // Sólo se puja con anuncios de campañas aprobadas y en espacios que se subastan.
  const creatives = mine.filter((c) => c.status === "active").flatMap((c) => c.creatives.filter((cr) => slotList.some((s) => s.id === cr.slot_id)).map((cr) => ({ ...cr, campaign: c.campaign_name })));
  const selected = creatives.find((c) => c.id === bid.creative);
  const slot = slotList.find((s) => s.id === selected?.slot_id);
  const reserve = Number(slot?.auction_reserve ?? 0);
  // Las semanas cuya subasta ya se cerró no se ofrecen; el servidor las rechazaría de todos modos.
  const openWeeks = WEEKS.filter((w) => !slot?.closed_weeks?.includes(w));
  const week = openWeeks.includes(bid.week) ? bid.week : openWeeks[0] ?? "";
  const draftOk = draft.campaign.trim().length >= 3 && !!draft.slot && draft.title.trim().length >= 3 && /^https:\/\/\S+$/.test(draft.url.trim()) && !!user?.email;
  const bidOk = !!selected && !!week && Number(bid.amount) > 0 && Number(bid.amount) >= reserve;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Megaphone className="h-4 w-4" aria-hidden /> Posiciones patrocinadas</CardTitle>
        <CardDescription className="text-xs">Puja por aparecer una semana completa en un espacio destacado. Ganan las pujas más altas y cada ganador paga lo que pujó; nadie ve las pujas de los demás.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {(campaigns.isLoading || slots.isLoading) && <Skeleton className="h-16 w-full" />}
        {campaigns.isError && <p className="text-destructive">{advertiserErrorMessage(campaigns.error)}</p>}
        {slots.data && slotList.length === 0 && <p className="text-muted-foreground">Ahora mismo no hay espacios en subasta.</p>}

        {mine.map((c) => (
          <div key={c.id} className="rounded-xl border border-border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-semibold">{c.campaign_name}</span><Badge variant="outline" className="text-[10px]">{CAMPAIGN_STATUS_LABEL[c.status]}</Badge></div>
            <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">{c.creatives.map((cr) => <li key={cr.id}>{cr.title} · {slotName(cr.slot_id)} · {cr.impressions} impresiones · {cr.clicks} clics</li>)}</ul>
          </div>
        ))}

        {creatives.length > 0 && (
          <div className="grid gap-3 rounded-xl border border-primary/30 p-3 md:grid-cols-4 md:items-end">
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="bid-creative" className="text-xs">Anuncio</Label>
              <Select value={bid.creative} onValueChange={(v) => setBid({ ...bid, creative: v })}>
                <SelectTrigger id="bid-creative" className="h-9 text-xs"><SelectValue placeholder="Elige un anuncio aprobado" /></SelectTrigger>
                <SelectContent>{creatives.map((c) => <SelectItem key={c.id} value={c.id} className="text-xs">{c.title} · {slotName(c.slot_id)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="bid-week" className="text-xs">Semana</Label>
              <Select value={week} onValueChange={(v) => setBid({ ...bid, week: v })}>
                <SelectTrigger id="bid-week" className="h-9 text-xs"><SelectValue placeholder="Sin semanas abiertas" /></SelectTrigger>
                <SelectContent>{openWeeks.map((w) => <SelectItem key={w} value={w} className="text-xs">{day(w)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="bid-amount" className="text-xs">Puja (DOP){selected ? ` · mínimo ${money(reserve, "DOP")}` : ""}</Label>
              <Input id="bid-amount" inputMode="decimal" value={bid.amount} onChange={(e) => setBid({ ...bid, amount: e.target.value.replace(/[^\d.]/g, "") })} className="h-9 text-xs" />
            </div>
            <div className="md:col-span-4"><Button size="sm" className="h-9 text-xs" disabled={!bidOk || place.isPending} onClick={() => place.mutate()}>Pujar</Button></div>
          </div>
        )}

        {(bids.data?.data.length ?? 0) > 0 && (
          <div>
            <p className="mb-1 font-semibold">Mis pujas</p>
            <ul className="space-y-1 text-xs">{bids.data!.data.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
                <span>{b.slot_name} · semana del {day(b.period_start)} · <span className="font-semibold">{money(b.amount, b.currency)}</span></span>
                <span className="flex items-center gap-2"><Badge variant="outline" className="text-[10px]">{MY_BID_STATUS_LABEL[b.status]}</Badge>{b.status === "open" && <Button size="sm" variant="ghost" className="h-7 text-xs" disabled={withdraw.isPending} onClick={() => withdraw.mutate(b.id)}>Retirar</Button>}</span>
              </li>
            ))}</ul>
          </div>
        )}

        {slotList.length > 0 && (
          <div className="grid gap-3 rounded-xl border border-border bg-muted/40 p-3 md:grid-cols-2">
            <p className="font-semibold md:col-span-2">Nueva campaña</p>
            <div className="space-y-1"><Label htmlFor="ad-campaign" className="text-xs">Nombre de la campaña</Label><Input id="ad-campaign" value={draft.campaign} maxLength={120} onChange={(e) => setDraft({ ...draft, campaign: e.target.value })} className="h-9 text-xs" /></div>
            <div className="space-y-1">
              <Label htmlFor="ad-slot" className="text-xs">Espacio</Label>
              <Select value={draft.slot} onValueChange={(v) => setDraft({ ...draft, slot: v })}>
                <SelectTrigger id="ad-slot" className="h-9 text-xs"><SelectValue placeholder="Elige un espacio" /></SelectTrigger>
                <SelectContent>{slotList.map((s) => <SelectItem key={s.id} value={s.id} className="text-xs">{s.name} · {s.max_active_creatives} posiciones</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label htmlFor="ad-title" className="text-xs">Título del anuncio</Label><Input id="ad-title" value={draft.title} maxLength={120} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="h-9 text-xs" /></div>
            <div className="space-y-1"><Label htmlFor="ad-url" className="text-xs">Enlace de destino (https)</Label><Input id="ad-url" value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="https://…" className="h-9 text-xs" /></div>
            <div className="md:col-span-2"><Button size="sm" variant="outline" className="h-9 text-xs" disabled={!draftOk || create.isPending} onClick={() => create.mutate()}>Enviar a revisión</Button></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
