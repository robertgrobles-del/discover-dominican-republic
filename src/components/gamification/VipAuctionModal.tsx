import { useState, useEffect } from "react";
import { Crown, Gavel, Clock, Flame, Zap, Trophy, ShieldCheck, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { GamificationSoundEngine } from "@/services/gamificationEngine";

interface VipAuctionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userCoins: number;
}

export function VipAuctionModal({
  open,
  onOpenChange,
  userCoins
}: VipAuctionModalProps) {
  const [currentBid, setCurrentBid] = useState(850);
  const [highestBidder, setHighestBidder] = useState("Carlos M. (Nivel 5)");
  const [myBidAmount, setMyBidAmount] = useState(900);
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 22, seconds: 40 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePlaceBid = () => {
    if (myBidAmount <= currentBid) {
      toast.error(`Tu puja debe ser mayor a la puja actual (${currentBid} monedas).`);
      return;
    }
    if (userCoins < myBidAmount) {
      toast.error(`Saldo insuficiente. Tienes ${userCoins} monedas disponibles.`);
      return;
    }

    GamificationSoundEngine.playCoinSound();
    setCurrentBid(myBidAmount);
    setHighestBidder("Tú (Puja Líder)");
    setMyBidAmount(myBidAmount + 50);
    toast.success(`🎉 ¡Puja registrada con éxito por ${myBidAmount} monedas! Eres el postor líder.`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg rounded-3xl p-6 overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-amber-500" />
            <DialogTitle className="font-display font-bold text-lg text-foreground">
              Subasta VIP de Experiencias Turísticas Exclusivas
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Usa tus monedas acumuladas para pujar por vivencias únicas que no están a la venta comercial.
          </DialogDescription>
        </DialogHeader>

        {/* Featured Auction Item */}
        <div className="rounded-3xl overflow-hidden bg-card border-2 border-amber-500/40 shadow-lg space-y-4">
          <div className="relative aspect-[16/9] bg-muted">
            <img
              src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80"
              alt="Vuelo en Helicóptero & Villa Privada"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            <Badge className="absolute top-3 left-3 bg-amber-500 text-black font-black text-xs">
              👑 SUBASTA ESTRELLA
            </Badge>

            <div className="absolute bottom-3 left-4 right-4 text-white">
              <h4 className="font-display font-bold text-base">Vuelo Escénico en Helicóptero & Estadía en Villa Privada</h4>
              <p className="text-xs text-white/80">Samaná & Cayo Levantado • Experiencia para 2 personas</p>
            </div>
          </div>

          <div className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-muted/40 border border-border">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Puja Actual Líder</span>
                <p className="text-xl font-black text-amber-500 mt-0.5">{currentBid} monedas</p>
                <span className="text-[10px] text-muted-foreground">Por: {highestBidder}</span>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Cierre de Subasta</span>
                <p className="text-sm font-bold text-foreground mt-0.5 flex items-center gap-1 font-mono">
                  <Clock className="h-4 w-4 text-amber-500" />
                  {String(timeLeft.hours).padStart(2, "0")}h : {String(timeLeft.minutes).padStart(2, "0")}m : {String(timeLeft.seconds).padStart(2, "0")}s
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold">Garantía oficial MITUR</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">Tu Siguiente Puja:</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={myBidAmount}
                  onChange={(e) => setMyBidAmount(Number(e.target.value))}
                  className="text-xs rounded-xl h-10 font-bold font-mono bg-background border-border"
                />
                <Button
                  onClick={handlePlaceBid}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-black rounded-xl text-xs h-10 px-5 shrink-0"
                >
                  <Gavel className="h-3.5 w-3.5 mr-1" /> Pujar Ahora
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Tu saldo disponible: <strong className="text-amber-500">{userCoins} monedas</strong>. Solo se deducen las monedas si ganas la subasta al expirar el tiempo.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="rounded-xl text-xs">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
