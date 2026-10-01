import { Card, CardContent } from "@/components/ui/card";
import { Award, Eye, Wallet } from "lucide-react";

interface CreatorProfileMetrics {
  tier: string;
  total_views: number;
  total_earnings: number | string;
  balance_available: number | string;
  balance_pending: number | string;
  status: string;
}

interface CreatorsMetricsProps {
  profile: CreatorProfileMetrics | null;
  loading: boolean;
  error: string | null;
}

const amount = (value?: number | string) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";
};

export function CreatorsMetrics({ profile, loading, error }: CreatorsMetricsProps) {
  const metrics = [
    { label: "Saldo disponible", value: profile ? amount(profile.balance_available) : "—", note: "Importe reportado por el backend", icon: Wallet },
    { label: "Saldo pendiente", value: profile ? amount(profile.balance_pending) : "—", note: "Aún no disponible para pago", icon: Wallet },
    { label: "Ganancias acumuladas", value: profile ? amount(profile.total_earnings) : "—", note: "Total registrado por el servicio", icon: Wallet },
    { label: "Vistas registradas", value: profile ? profile.total_views.toLocaleString("es-DO") : "—", note: "Total asociado a tu perfil", icon: Eye },
    { label: "Nivel de creador", value: profile?.tier ?? "—", note: profile ? `Estado: ${profile.status}` : "Se muestra al tener un perfil", icon: Award },
  ];

  return <div className="mb-8">
    {error && <p role="status" className="mb-3 text-sm text-destructive">{error}</p>}
    {!loading && !error && !profile && <p className="mb-3 text-sm text-muted-foreground">Inicia sesión y completa el registro para ver tus métricas personales.</p>}
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {metrics.map(({ label, value, note, icon: Icon }) => <Card key={label} className="bg-card border-border"><CardContent className="p-4">
        <p className="text-xs text-muted-foreground font-semibold uppercase">{label}</p>
        <h3 className="text-xl font-black text-foreground mt-1 flex items-center gap-1.5"><Icon className="h-5 w-5 text-primary" />{loading ? "Cargando…" : value}</h3>
        <span className="text-[10px] text-muted-foreground">{note}</span>
      </CardContent></Card>)}
    </div>
  </div>;
}
