import { toast } from "sonner";

// Share via WhatsApp
export function shareViaWhatsApp(text: string, url?: string) {
  const message = url ? `${text}\n\n${url}` : text;
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  toast.success("Abriendo WhatsApp...");
}

// Share via Email
export function shareViaEmail(subject: string, body: string) {
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  window.open(`mailto:?subject=${encodedSubject}&body=${encodedBody}`, "_blank");
  toast.success("Abriendo correo...");
}

// Share via native share API (mobile)
export async function shareNative(data: { title: string; text: string; url?: string }) {
  if (navigator.share) {
    try {
      await navigator.share(data);
      toast.success("Contenido compartido");
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        toast.error("Error al compartir");
      }
    }
  } else {
    // Fallback to copy to clipboard
    const text = data.url ? `${data.text}\n${data.url}` : data.text;
    await navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  }
}

// Copy to clipboard
export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    toast.success("Copiado al portapapeles");
  }
}

// Share itinerary
export function shareItinerary(
  tripName: string,
  days: Array<{
    date: string;
    activities: Array<{
      name: string;
      location: string;
      duration: string;
    }>;
  }>
) {
  let text = `🌴 *${tripName}*\n`;
  text += `📅 Duración: ${days.length} días\n\n`;

  days.forEach((day, index) => {
    text += `*Día ${index + 1}* - ${day.date}\n`;
    if (day.activities.length === 0) {
      text += "  Sin actividades planificadas\n";
    } else {
      day.activities.forEach((act) => {
        text += `  📍 ${act.name} (${act.location}) - ${act.duration}\n`;
      });
    }
    text += "\n";
  });

  text += "✈️ Planificado con RD Turismo";
  return text;
}

// Generate share URL
export function generateShareUrl(type: string, id: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/${type}/${id}`;
}

// Share buttons component
import { Button } from "@/components/ui/button";
import { Share2, MessageCircle, Mail, Link2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
}

export function ShareButton({ title, text, url }: ShareButtonProps) {
  const fullUrl = url || window.location.href;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Compartir
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => shareViaWhatsApp(text, fullUrl)}
          className="gap-2 cursor-pointer"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => shareViaEmail(title, `${text}\n\n${fullUrl}`)}
          className="gap-2 cursor-pointer"
        >
          <Mail className="h-4 w-4" />
          Email
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => copyToClipboard(fullUrl)}
          className="gap-2 cursor-pointer"
        >
          <Link2 className="h-4 w-4" />
          Copiar enlace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
