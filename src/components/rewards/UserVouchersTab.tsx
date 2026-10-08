import React from "react";
import { Ticket, Building, QrCode, Copy, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { RedeemedVoucher } from "@/data/rewardsData";
import type { UserRewardShipment } from "@/lib/gamificationApi";
import { Package, Truck, CheckCircle } from "lucide-react";

interface UserVouchersTabProps {
  vouchers: RedeemedVoucher[];
  shipments?: UserRewardShipment[];
  onOpenQR: (voucher: RedeemedVoucher) => void;
  onExploreCatalog: () => void;
}

export const UserVouchersTab: React.FC<UserVouchersTabProps> = ({
  vouchers,
  shipments = [],
  onOpenQR,
  onExploreCatalog,
}) => {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-card border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" /> Mis Vouchers de Recompensas
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Aquí encuentras tus códigos QR de canje para presentar en recepción de hoteles, restaurantes y actividades turísticas.
          </p>
        </div>

        <Button
          onClick={onExploreCatalog}
          size="sm"
          className="rounded-xl text-xs font-semibold gap-1.5 shrink-0"
        >
          <Gift className="h-3.5 w-3.5" /> Canjear Más Premios
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {vouchers.map((voucher) => (
          <div
            key={voucher.id}
            className="p-6 rounded-3xl bg-card border border-border hover:border-primary/30 shadow-sm transition-all space-y-4 relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-4">
              <div>
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold mb-1.5">
                  ✓ VOUCHER ACTIVO
                </Badge>
                <h4 className="font-display font-bold text-base text-foreground">
                  {voucher.prizeName}
                </h4>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Building className="h-3 w-3 text-primary" /> {voucher.sponsor} — {voucher.location}
                </p>
              </div>

              <div className="p-2 rounded-2xl bg-white text-black border border-border shrink-0 shadow-inner">
                <QrCode className="h-10 w-10 text-black" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-muted/30 p-3.5 rounded-2xl border border-border/60">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">
                  Código Único
                </span>
                <p className="font-mono font-bold text-foreground text-xs mt-0.5">
                  {voucher.code}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">
                  Válido Hasta
                </span>
                <p className="font-semibold text-foreground text-xs mt-0.5">
                  {voucher.expiryDate}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {voucher.instructions}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                onClick={() => onOpenQR(voucher)}
                className="rounded-xl text-xs font-bold gap-1.5 flex-1"
              >
                <QrCode className="h-3.5 w-3.5" /> Ver Ticket & QR Completo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(voucher.code);
                  toast.success("Código de voucher copiado al portapapeles.");
                }}
                className="rounded-xl text-xs px-3"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}

        {vouchers.length === 0 && (
          <div className="col-span-2 p-12 text-center rounded-3xl bg-card border border-border space-y-3">
            <span className="text-4xl">🎟️</span>
            <h4 className="font-display font-bold text-base text-foreground">
              Aún no tienes vouchers canjeados
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Acumula monedas explorando provincias y canjéalas por experiencias reales.
            </p>
            <Button size="sm" onClick={onExploreCatalog} className="rounded-xl text-xs font-bold">
              Explorar Catálogo
            </Button>
          </div>
        )}
      </div>

      {shipments.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-border/60">
          <h4 className="font-display text-base font-bold text-foreground flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" /> Envíos de Premios Físicos ({shipments.length})
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            {shipments.map((s) => (
              <div key={s.id} className="p-4 rounded-2xl bg-card border border-border/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <Package className="h-4 w-4 text-muted-foreground" /> {s.prize || "Premio Físico"}
                  </span>
                  <Badge className={
                    s.status === "delivered" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" :
                    s.status === "shipped" ? "bg-blue-500/15 text-blue-600 dark:text-blue-400" :
                    s.status === "packed" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" :
                    "bg-muted text-muted-foreground"
                  }>
                    {s.status === "delivered" ? "Entregado" :
                     s.status === "shipped" ? "En camino" :
                     s.status === "packed" ? "Empacado" : "Pendiente"}
                  </Badge>
                </div>
                {s.courier_name && (
                  <p className="text-xs text-muted-foreground">
                    Transporte: <span className="font-medium text-foreground">{s.courier_name}</span>
                    {s.tracking_number && ` — Guía: ${s.tracking_number}`}
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground">
                  Solicitado: {new Date(s.created_at).toLocaleDateString("es-DO")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
