import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface RechargeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customRechargeVal: string;
  onCustomRechargeValChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ProfileRechargeModal({
  open,
  onOpenChange,
  customRechargeVal,
  onCustomRechargeValChange,
  onSubmit,
}: RechargeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            Recarga Personalizada - RD Pass
          </DialogTitle>
          <DialogDescription className="text-xs">
            Ingresa el monto y los datos de tu tarjeta de crédito o débito internacional.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">
              Monto a Recargar (DOP)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm text-muted-foreground">
                RD$
              </span>
              <Input
                type="number"
                min="100"
                max="50000"
                placeholder="1000"
                value={customRechargeVal}
                onChange={(e) => onCustomRechargeValChange(e.target.value)}
                required
                className="pl-12 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">
              Número de Tarjeta
            </label>
            <Input
              type="text"
              placeholder="4000 1234 5678 9010"
              pattern="[0-9 ]{12,19}"
              maxLength={19}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                Vencimiento
              </label>
              <Input type="text" placeholder="MM/AA" maxLength={5} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                CVV
              </label>
              <Input type="password" placeholder="***" maxLength={4} required />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
            >
              Proceder al Pago
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
