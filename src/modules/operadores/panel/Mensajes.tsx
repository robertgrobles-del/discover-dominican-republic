import { useEffect, useMemo, useState } from "react";
import { Mail, MessageCircle, Globe, Instagram, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { markThreadRead, opKeys, sendMessage, useMessages, useOpMutation } from "../api";
import type { MessageChannel, OperatorMessage } from "../types";
import { useOrg } from "./OrgContext";

const CHANNEL: Record<MessageChannel, { label: string; icon: typeof Mail }> = {
  web: { label: "Web", icon: Globe }, whatsapp: { label: "WhatsApp", icon: MessageCircle },
  instagram: { label: "Instagram", icon: Instagram }, email: { label: "Correo", icon: Mail },
};
const QUICK_REPLIES = ["¡Gracias por escribirnos! Con gusto te ayudamos.", "Sí, tenemos disponibilidad para esa fecha.", "Te enviamos los detalles de pago por correo."];

export default function Mensajes() {
  const { org } = useOrg();
  const { data: messages = [] } = useMessages(org.id);
  const [active, setActive] = useState<string | null>(null);
  const [text, setText] = useState("");
  const keys = [opKeys.messages(org.id)];
  const send = useOpMutation(sendMessage, keys);
  const read = useOpMutation((t: string) => markThreadRead(org.id, t), keys);

  const threads = useMemo(() => {
    const map = new Map<string, OperatorMessage[]>();
    messages.forEach((m) => { (map.get(m.thread_id) || map.set(m.thread_id, []).get(m.thread_id)!).push(m); });
    return [...map.entries()]
      .map(([id, msgs]) => ({ id, msgs, last: msgs[msgs.length - 1], unread: msgs.filter((m) => m.sender === "traveler" && !m.read).length }))
      .sort((a, b) => b.last.created_at.localeCompare(a.last.created_at));
  }, [messages]);

  const current = threads.find((t) => t.id === active) || threads[0];
  useEffect(() => { if (current && current.unread > 0) read.mutate(current.id); }, [current?.id, current?.unread]);

  const submit = (body: string) => {
    if (!current || !body.trim()) return;
    send.mutate(
      { org_id: org.id, thread_id: current.id, traveler_name: current.last.traveler_name, sender: "operator", channel: current.last.channel, body: body.trim() },
      { onSuccess: () => setText(""), onError: (e: any) => toast.error(e.message) },
    );
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-6">Mensajes</h1>
      {threads.length === 0 ? (
        <Card className="py-16 text-center"><p className="font-semibold text-lg">Sin conversaciones</p><p className="text-sm text-muted-foreground">Los mensajes de tu web, WhatsApp, Instagram y correo aparecerán aquí.</p></Card>
      ) : (
        <Card className="grid md:grid-cols-[18rem_1fr] overflow-hidden min-h-[30rem]">
          <ul className="border-b md:border-b-0 md:border-r border-border max-h-[30rem] overflow-y-auto" aria-label="Conversaciones">
            {threads.map((t) => {
              const C = CHANNEL[t.last.channel];
              return (
                <li key={t.id}>
                  <button type="button" onClick={() => setActive(t.id)} className={`w-full text-left p-3 border-b border-border/60 hover:bg-muted/50 ${current?.id === t.id ? "bg-muted" : ""}`}>
                    <div className="flex items-center justify-between gap-2"><span className="font-semibold text-sm truncate">{t.last.traveler_name}</span>{t.unread > 0 && <Badge className="h-5 px-1.5">{t.unread}</Badge>}</div>
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1"><C.icon className="h-3 w-3 shrink-0" /> {t.last.body}</p>
                  </button>
                </li>
              );
            })}
          </ul>
          {current && (
            <div className="flex flex-col">
              <div className="p-3 border-b border-border flex items-center justify-between"><span className="font-semibold">{current.last.traveler_name}</span><Badge variant="secondary">{CHANNEL[current.last.channel].label}</Badge></div>
              <div className="flex-1 p-4 space-y-2 overflow-y-auto max-h-[22rem]">
                {current.msgs.map((m) => (
                  <div key={m.id} className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.sender === "operator" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"}`}>{m.body}</div>
                ))}
              </div>
              <div className="p-3 border-t border-border space-y-2">
                <div className="flex flex-wrap gap-1">{QUICK_REPLIES.map((r) => <Button key={r} size="sm" variant="outline" className="text-xs h-7" onClick={() => submit(r)}>{r.slice(0, 28)}…</Button>)}</div>
                <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); submit(text); }}>
                  <Input value={text} maxLength={1000} onChange={(e) => setText(e.target.value)} placeholder="Escribe una respuesta…" aria-label="Respuesta" />
                  <Button type="submit" size="icon" aria-label="Enviar" disabled={send.isPending}><Send className="h-4 w-4" /></Button>
                </form>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
