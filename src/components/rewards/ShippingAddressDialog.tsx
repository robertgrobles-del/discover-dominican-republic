import React, { useState } from "react";
import { Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CatalogReward } from "@/data/rewardsData";

interface ShippingAddressDialogProps {
  prize: CatalogReward | null;
  onClose: () => void;
  onConfirm: (prize: CatalogReward, shippingData: {
    recipientName: string;
    recipientPhone: string;
    shippingAddress: string;
    city: string;
    notes: string;
  }) => Promise<void>;
}

export const ShippingAddressDialog: React.FC<ShippingAddressDialogProps> = ({
  prize,
  onClose,
  onConfirm,
}) => {
  const [shippingForm, setShippingForm] = useState({
    recipientName: "",
    recipientPhone: "",
    shippingAddress: "",
    city: "Santo Domingo",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!prize) return;
    setIsSubmitting(true);
    try {
      await onConfirm(prize, shippingForm);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={!!prize} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-3xl border border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Truck className="h-5 w-5 text-primary" /> Dirección de Despacho Postal
          </DialogTitle>
          <DialogDescription className="text-xs">
            Ingresa tus datos para coordinar el envío certificado sin costo de{" "}
            <strong className="text-foreground">{prize?.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          <div>
            <Label htmlFor="rec-name" className="text-xs font-semibold">
              Nombre Completo de Quien Recibe
            </Label>
            <Input
              id="rec-name"
              placeholder="Ej: Laura Pérez Rosario"
              value={shippingForm.recipientName}
              onChange={(e) =>
                setShippingForm((prev) => ({ ...prev, recipientName: e.target.value }))
              }
              className="text-xs rounded-xl mt-1 h-9 bg-card border-border"
            />
          </div>

          <div>
            <Label htmlFor="rec-phone" className="text-xs font-semibold">
              Teléfono / WhatsApp de Contacto
            </Label>
            <Input
              id="rec-phone"
              placeholder="Ej: (809) 555-0199"
              value={shippingForm.recipientPhone}
              onChange={(e) =>
                setShippingForm((prev) => ({ ...prev, recipientPhone: e.target.value }))
              }
              className="text-xs rounded-xl mt-1 h-9 bg-card border-border"
            />
          </div>

          <div>
            <Label htmlFor="rec-address" className="text-xs font-semibold">
              Dirección de Entrega Exacta
            </Label>
            <Input
              id="rec-address"
              placeholder="Calle, Número, Edificio, Apartamento..."
              value={shippingForm.shippingAddress}
              onChange={(e) =>
                setShippingForm((prev) => ({ ...prev, shippingAddress: e.target.value }))
              }
              className="text-xs rounded-xl mt-1 h-9 bg-card border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="rec-city" className="text-xs font-semibold">
                Ciudad / Sector
              </Label>
              <Input
                id="rec-city"
                placeholder="Ej: Santo Domingo Este"
                value={shippingForm.city}
                onChange={(e) =>
                  setShippingForm((prev) => ({ ...prev, city: e.target.value }))
                }
                className="text-xs rounded-xl mt-1 h-9 bg-card border-border"
              />
            </div>
            <div>
              <Label htmlFor="rec-notes" className="text-xs font-semibold">
                Referencia de Entrega
              </Label>
              <Input
                id="rec-notes"
                placeholder="Ej: Frente al parque"
                value={shippingForm.notes}
                onChange={(e) =>
                  setShippingForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                className="text-xs rounded-xl mt-1 h-9 bg-card border-border"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl text-xs">
            Cancelar
          </Button>
          <Button
            size="sm"
            disabled={
              isSubmitting ||
              !shippingForm.recipientName.trim() ||
              !shippingForm.recipientPhone.trim() ||
              !shippingForm.shippingAddress.trim()
            }
            onClick={handleSubmit}
            className="rounded-xl text-xs font-bold"
          >
            {isSubmitting
              ? "Procesando..."
              : `Confirmar y Canjear (${prize?.coin_cost} monedas)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
