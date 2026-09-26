import React from "react";
import { QrCode, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RedeemedVoucher } from "@/data/rewardsData";

interface VoucherQRModalProps {
  voucher: RedeemedVoucher | null;
  onClose: () => void;
  onGoToVouchers?: () => void;
}

export const VoucherQRModal: React.FC<VoucherQRModalProps> = ({
  voucher,
  onClose,
  onGoToVouchers,
}) => {
  return (
    <Dialog open={!!voucher} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 border border-border">
        <DialogHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-2xl border border-emerald-500/30">
            🎉
          </div>
          <DialogTitle className="font-display font-bold text-lg text-foreground">
            ¡Recompensa Lista para Canjear!
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Presenta este comprobante oficial al momento de tu llegada.
          </DialogDescription>
        </DialogHeader>

        {voucher && (
          <div className="space-y-4 py-2">
            <div className="p-5 rounded-3xl bg-muted/40 border border-border space-y-3 text-center">
              <div className="mx-auto w-36 h-36 bg-white p-3 rounded-2xl border border-border shadow-inner flex items-center justify-center">
                <QrCode className="w-full h-full text-black" />
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">
                  Código de Validación
                </span>
                <p className="font-mono text-base font-black text-foreground tracking-wider">
                  {voucher.code}
                </p>
              </div>

              <div className="text-xs border-t border-border/60 pt-2 space-y-1">
                <p className="font-bold text-foreground">{voucher.prizeName}</p>
                <p className="text-[11px] text-muted-foreground">
                  {voucher.sponsor} — {voucher.location}
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold">
                  Válido: {voucher.expiryDate}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
              {voucher.instructions}
            </p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (voucher) {
                navigator.clipboard.writeText(voucher.code);
                toast.success("Código copiado.");
              }
            }}
            className="rounded-xl text-xs gap-1"
          >
            <Copy className="h-3 w-3" /> Copiar Código
          </Button>
          <Button
            size="sm"
            onClick={() => {
              toast.success("Voucher guardado en 'Mis Vouchers Canjeados'.");
              onClose();
              if (onGoToVouchers) onGoToVouchers();
            }}
            className="rounded-xl text-xs font-bold"
          >
            Entendido y Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
