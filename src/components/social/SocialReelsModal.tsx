import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MockReel } from "@/data/socialData";

interface ReelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reels: MockReel[];
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
}

export function SocialReelsModal({
  isOpen,
  onClose,
  reels,
  activeIndex,
  setActiveIndex
}: ReelsModalProps) {
  if (!isOpen || !reels.length) return null;

  const currentReel = reels[activeIndex] || reels[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-[2000] flex items-center justify-center p-0 md:p-4"
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:bg-white/10 z-[2010]"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Reels frame */}
        <div className="relative w-full max-w-[450px] h-full md:h-[80vh] md:rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 flex flex-col justify-between shadow-2xl">
          {/* Active Video Player */}
          <div className="absolute inset-0 z-0">
            <video
              src={currentReel.videoUrl}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
          </div>

          {/* Vertical navigation arrows (Side of the screen) */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10 text-white items-center">
            <button
              onClick={() => setActiveIndex(prev => (prev - 1 + reels.length) % reels.length)}
              className="p-2 bg-black/60 rounded-full hover:bg-black/80 transition"
              aria-label="Reel anterior"
            >
              ▲
            </button>
            <button
              onClick={() => setActiveIndex(prev => (prev + 1) % reels.length)}
              className="p-2 bg-black/60 rounded-full hover:bg-black/80 transition"
              aria-label="Siguiente reel"
            >
              ▼
            </button>
          </div>

          {/* Top Label */}
          <div className="relative z-10 p-4 flex justify-between items-center text-white">
            <Badge className="bg-red-500 text-white font-bold uppercase tracking-wider text-[10px]">
              RD Reels
            </Badge>
            <span className="text-xs text-white/70 font-mono">
              {activeIndex + 1} / {reels.length}
            </span>
          </div>

          {/* Bottom Overlay (Creator info, tags, music) */}
          <div className="relative z-10 p-6 text-white space-y-3 mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-xs">
                {currentReel.user.charAt(1).toUpperCase()}
              </div>
              <span className="font-bold text-sm">{currentReel.user}</span>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-none text-[9px]">
                Creador Local
              </Badge>
            </div>
            
            <p className="text-xs text-white/90 leading-relaxed">
              {currentReel.desc}
            </p>

            <div className="flex gap-4 pt-2 text-xs border-t border-white/10 mt-1">
              <button 
                className="flex items-center gap-1.5 hover:text-red-400 transition" 
                onClick={() => toast.success("¡Me gusta registrado!")}
              >
                <Heart className="h-4 w-4" /> {currentReel.likes}
              </button>
              <button 
                className="flex items-center gap-1.5 hover:text-blue-400 transition" 
                onClick={() => toast.info("Comentarios desactivados en la simulación")}
              >
                <MessageCircle className="h-4 w-4" /> {currentReel.comments}
              </button>
              <button 
                className="flex items-center gap-1.5 hover:text-green-400 transition" 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("¡Enlace del reel copiado!");
                }}
              >
                <Share2 className="h-4 w-4" /> Compartir
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
