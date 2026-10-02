import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { opKeys, replyReview, useBookings, useListings, useOpMutation, useReviews } from "../api";
import { formatMoney } from "../constants";
import { useOrg } from "./OrgContext";
import { ContactClicksCard } from "./ContactClicksCard";

const COLORS = ["hsl(var(--primary))", "#f59e0b", "#10b981", "#6366f1"];

export default function Reportes() {
  const { org } = useOrg();
  const { data: bookings = [] } = useBookings(org.id);
  const { data: listings = [] } = useListings(org.id);
  const { data: reviews = [] } = useReviews(org.id);
  const [replying, setReplying] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const send = useOpMutation(({ id, text }: { id: string; text: string }) => replyReview(id, text), [opKeys.reviews(org.id)]);

  const valid = bookings.filter((b) => b.status !== "cancelled");
  const byListing = useMemo(() => {
    const m: Record<string, { name: string; ventas: number; personas: number; cupos: number }> = {};
    listings.forEach((l) => { m[l.id] = { name: l.title.slice(0, 22), ventas: 0, personas: 0, cupos: l.capacity }; });
    valid.forEach((b) => { const r = m[b.listing_id]; if (r) { r.ventas += b.total_price; r.personas += b.guests; } });
    return Object.values(m).filter((r) => r.personas > 0);
  }, [valid, listings]);
  const bySource = useMemo(() => {
    const m: Record<string, number> = {};
    valid.forEach((b) => { m[b.source] = (m[b.source] || 0) + 1; });
    const label: Record<string, string> = { web: "Sitio web", manual: "Manual", marketplace: "Marketplace" };
    return Object.entries(m).map(([k, v]) => ({ name: label[k] || k, value: v }));
  }, [valid]);
  const avg = valid.length ? valid.reduce((n, b) => n + b.total_price, 0) / valid.length : 0;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Reportes</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Reservas (sin canceladas)</p><p className="font-display text-2xl font-bold">{valid.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Valor promedio</p><p className="font-display text-2xl font-bold">{formatMoney(avg)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Cancelaciones</p><p className="font-display text-2xl font-bold">{bookings.length - valid.length}</p></CardContent></Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-base">Ventas por experiencia</CardTitle></CardHeader>
          <CardContent className="h-64">{byListing.length === 0 ? <p className="text-sm text-muted-foreground">Sin datos todavía.</p> : (
            <ResponsiveContainer width="100%" height="100%"><BarChart data={byListing}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis /><Tooltip /><Bar dataKey="ventas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
          )}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Canales de venta</CardTitle></CardHeader>
          <CardContent className="h-64">{bySource.length === 0 ? <p className="text-sm text-muted-foreground">Sin datos todavía.</p> : (
            <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={bySource} dataKey="value" nameKey="name" outerRadius={80} label>{bySource.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
          )}</CardContent></Card>
      </div>
      <ContactClicksCard />
      <Card>
        <CardHeader><CardTitle className="text-base">Reseñas</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {reviews.length === 0 ? <p className="text-sm text-muted-foreground">Aún no hay reseñas.</p> : reviews.map((r) => (
            <div key={r.id} className="border-b border-border/60 pb-4 last:border-0">
              <div className="flex items-center gap-2"><span className="font-semibold text-sm">{r.author}</span><span className="flex" aria-label={`${r.rating} de 5`}>{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}</span></div>
              <p className="text-sm text-muted-foreground mt-1">{r.comment}</p>
              {r.reply ? <p className="mt-2 rounded-lg bg-muted p-2 text-sm"><strong>Tu respuesta:</strong> {r.reply}</p> : replying === r.id ? (
                <div className="mt-2 space-y-2">
                  <Textarea value={reply} maxLength={500} onChange={(e) => setReply(e.target.value)} aria-label="Respuesta a la reseña" />
                  <div className="flex gap-2"><Button size="sm" onClick={() => send.mutate({ id: r.id, text: reply }, { onSuccess: () => { toast.success("Respuesta publicada"); setReplying(null); setReply(""); } })} disabled={!reply.trim()}>Responder</Button><Button size="sm" variant="ghost" onClick={() => setReplying(null)}>Cancelar</Button></div>
                </div>
              ) : <Button size="sm" variant="ghost" className="mt-1" onClick={() => setReplying(r.id)}>Responder</Button>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
