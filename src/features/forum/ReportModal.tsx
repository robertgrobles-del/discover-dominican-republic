import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetId: string | null;
  targetType?: "thread" | "reply";
}

export function ReportModal({
  open,
  onOpenChange,
  targetId,
  targetType = "thread",
}: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Por favor especifica el motivo del reporte.");
      return;
    }

    setIsSubmitting(true);
    // Simular envío de reporte al backend Fastify
    setTimeout(() => {
      setIsSubmitting(false);
      onOpenChange(false);
      setReason("");
      toast.success("Reporte enviado a los moderadores para revisión.");
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Reportar {targetType === "thread" ? "Discusión" : "Respuesta"}
          </DialogTitle>
          <DialogDescription>
            Ayúdanos a mantener la comunidad segura y libre de spam o desinformación.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe el motivo de la infracción (ej. Spam, desinformación, lenguaje inapropiado)..."
            className="min-h-[100px] text-sm"
          />

          <DialogFooter className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Confirmar Reporte"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
