import { useEffect, useState } from "react";
import { adminListEntities } from "@/lib/adminApi";

type Client = { id: string; legal_name: string; trade_name: string | null; is_active: boolean };

/** Cliente al que se factura un banner: sólo clientes registrados en «Clientes publicitarios». */
export function AdClientSelect({ id, value, onChange }: { id: string; value: string | null; onChange: (v: string | null) => void }) {
  const [clients, setClients] = useState<Client[] | null>(null);
  useEffect(() => {
    adminListEntities<Client>("ad_clients", { limit: 100 }).then((r) => setClients(r.data ?? [])).catch(() => setClients([]));
  }, []);
  return (
    <select id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
      <option value="">{clients === null ? "Cargando clientes…" : clients.length ? "Elige un cliente" : "No hay clientes: créalo en la pestaña Clientes"}</option>
      {clients?.filter((c) => c.is_active || c.id === value).map((c) => (
        <option key={c.id} value={c.id}>{c.trade_name ? `${c.trade_name} · ${c.legal_name}` : c.legal_name}</option>
      ))}
    </select>
  );
}
