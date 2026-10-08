import React from "react";
import { 
  Share2, MessageCircle, Twitter, Facebook, Send, Link as LinkIcon, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SocialShareBarProps {
  url?: string;
  title: string;
  description?: string;
  className?: string;
  variant?: "floating" | "inline" | "compact";
}

export function SocialShareBar({
  url,
  title,
  description = "",
  className,
  variant = "inline",
}: SocialShareBarProps) {
  const [copied, setCopied] = React.useState(false);

  const shareUrl = typeof window !== "undefined" ? url || window.location.href : (url || "https://descubrerd.com");
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(`${title} — Descubre República Dominicana 🇩🇴`);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      toast.success("¡Enlace copiado al portapapeles!");
      setTimeout(() => setCopied(false), 3000);
    }).catch(() => {
      toast.error("No se pudo copiar el enlace");
    });
  };

  const shareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const shareFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    window.open(fbUrl, "_blank", "noopener,noreferrer");
  };

  const shareTwitter = () => {
    const xUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
    window.open(xUrl, "_blank", "noopener,noreferrer");
  };

  const shareTelegram = () => {
    const tgUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
    window.open(tgUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "flex items-center gap-2",
          variant === "floating" && "flex-col bg-card/90 backdrop-blur-md p-2.5 rounded-2xl border border-border/80 shadow-xl fixed left-6 top-1/3 z-30 hidden lg:flex",
          variant === "inline" && "flex-wrap p-3 bg-muted/40 rounded-2xl border border-border/60",
          variant === "compact" && "gap-1",
          className
        )}
      >
        {variant !== "floating" && variant !== "compact" && (
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mr-2">
            <Share2 className="h-3.5 w-3.5 text-primary" /> Compartir:
          </span>
        )}

        {/* WhatsApp */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={shareWhatsApp}
              className="h-8 w-8 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 transition-transform hover:scale-105"
              aria-label="Compartir en WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">WhatsApp</TooltipContent>
        </Tooltip>

        {/* X / Twitter */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={shareTwitter}
              className="h-8 w-8 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/30 transition-transform hover:scale-105"
              aria-label="Compartir en X"
            >
              <Twitter className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">X (Twitter)</TooltipContent>
        </Tooltip>

        {/* Facebook */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={shareFacebook}
              className="h-8 w-8 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30 transition-transform hover:scale-105"
              aria-label="Compartir en Facebook"
            >
              <Facebook className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Facebook</TooltipContent>
        </Tooltip>

        {/* Telegram */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={shareTelegram}
              className="h-8 w-8 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30 transition-transform hover:scale-105"
              aria-label="Compartir en Telegram"
            >
              <Send className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Telegram</TooltipContent>
        </Tooltip>

        {/* Copy Link */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className={cn(
                "h-8 w-8 rounded-xl transition-all hover:scale-105",
                copied
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "bg-muted/80 hover:bg-muted text-foreground border-border"
              )}
              aria-label="Copiar enlace"
            >
              {copied ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">{copied ? "¡Copiado!" : "Copiar enlace"}</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
