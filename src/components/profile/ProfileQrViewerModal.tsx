import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface QrTicket {
  title: string;
  qrValue: string;
  type: string;
}

interface ProfileQrViewerModalProps {
  ticket: QrTicket | null;
  onClose: () => void;
}

export function ProfileQrViewerModal({
  ticket,
  onClose,
}: ProfileQrViewerModalProps) {
  return (
    <Dialog open={!!ticket} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[400px] text-center space-y-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            {ticket?.title}
          </DialogTitle>
          <DialogDescription className="text-xs">{ticket?.type}</DialogDescription>
        </DialogHeader>

        {ticket && (
          <div className="bg-white p-6 rounded-2xl border flex flex-col items-center justify-center space-y-4 shadow-inner relative overflow-hidden group">
            {/* Laser scan animation effect */}
            <div className="absolute left-0 right-0 h-0.5 bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-[bounce_3s_infinite]" />

            {/* Styled vector QR Code representation */}
            <svg
              className="w-48 h-48 text-zinc-950"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              {/* Outer borders */}
              <path d="M0,0 h30 v10 h-20 v20 h-10 z M70,0 h30 v30 h-10 v-20 h-20 z M0,70 h10 v20 h20 v10 h-30 z M90,90 h-20 v10 h30 v-30 h-10 z" />
              {/* Top-left position block */}
              <path d="M10,10 h20 v20 h-20 z M15,15 h10 v10 h-10 z" />
              {/* Top-right position block */}
              <path d="M70,10 h20 v20 h-20 z M75,15 h10 v10 h-10 z" />
              {/* Bottom-left position block */}
              <path d="M10,70 h20 v20 h-20 z M15,75 h10 v10 h-10 z" />
              {/* Random noise bits */}
              <path d="M45,10 h10 v10 h-10 z M35,25 h15 v5 h-15 z M55,30 h10 v10 h-10 z M40,40 h10 v10 h-10 z M25,45 h10 v10 h-10 z M70,45 h15 v10 h-15 z M45,60 h20 v5 h-20 z M55,75 h10 v10 h-10 z M35,80 h15 v10 h-15 z M75,75 h10 v15 h-10 z" />
            </svg>

            <div className="font-mono text-xs text-zinc-500 bg-zinc-100 px-3 py-1 rounded-md select-all">
              {ticket.qrValue}
            </div>
          </div>
        )}

        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-xs text-center text-emerald-600 font-bold flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Listo para ser
          Escaneado
        </div>

        <Button className="w-full" onClick={onClose}>
          Cerrar Código
        </Button>
      </DialogContent>
    </Dialog>
  );
}
