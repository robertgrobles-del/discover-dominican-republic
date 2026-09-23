import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { type Artesano } from "@/data/marketplaceData";

interface ArtisanChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artesano: Artesano | null;
  chatHistory: string[];
  chatMessage: string;
  onChatMessageChange: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
}

export function ArtisanChatModal({
  open, onOpenChange, artesano, chatHistory, chatMessage, onChatMessageChange, onSendMessage,
}: ArtisanChatModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] h-[500px] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 border-b border-border">
          <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            {artesano?.nombre}
          </DialogTitle>
          <DialogDescription className="text-[10px]">Chat simulado directo con el taller artesanal.</DialogDescription>
        </DialogHeader>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20 flex flex-col justify-end">
          <div className="bg-muted text-foreground p-3 rounded-lg text-xs max-w-[85%] self-start leading-normal">
            ¡Hola! Bienvenido al chat de <strong>{artesano?.nombre}</strong>. Cuéntame, ¿estás interesado en alguna pieza de {artesano?.especialidad} o te gustaría cotizar un diseño personalizado?
          </div>
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex flex-col ${i % 2 === 0 ? "items-end" : "items-start"}`}>
              <div className={`p-3 rounded-lg text-xs max-w-[85%] leading-normal ${
                i % 2 === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}>
                {msg}
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <form onSubmit={onSendMessage} className="p-3 border-t border-border flex gap-2">
          <Input
            type="text"
            placeholder="Escribe tu consulta aquí..."
            value={chatMessage}
            onChange={(e) => onChatMessageChange(e.target.value)}
            className="flex-1 text-xs"
            title="Mensaje para el artesano"
          />
          <Button type="submit" size="sm" className="font-bold text-xs px-3">
            Enviar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
