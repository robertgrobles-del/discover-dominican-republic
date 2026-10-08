import React from "react";
import { MessageCircle, Phone } from "lucide-react";
import { trackEvent } from "@/hooks/useAnalytics";
import { getAttributionData } from "@/lib/utmTracker";
import { cn } from "@/lib/utils";

interface WhatsAppPulseButtonProps {
  phone?: string;
  businessName: string;
  customMessage?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "pulse" | "solid" | "outline";
}

export function WhatsAppPulseButton({
  phone = "+18095550198",
  businessName,
  customMessage,
  className,
  size = "md",
  variant = "pulse",
}: WhatsAppPulseButtonProps) {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const attribution = getAttributionData();
  const sourceRef = attribution.utm_source ? ` (Vía: ${attribution.utm_source})` : "";

  const defaultMsg = `Hola, vi la ficha de ${businessName} en Descubre República Dominicana y deseo consultar tarifas y disponibilidad.${sourceRef}`;
  const messageText = customMessage || defaultMsg;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;

  const handleClick = () => {
    // Sin teléfono ni nombre del negocio: la analítica descarta los datos de contacto.
    trackEvent("outbound_link", {
      channel: "whatsapp",
      utm_source: attribution.utm_source || "direct",
    });
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5 rounded-xl",
    md: "px-4 py-2.5 text-xs sm:text-sm gap-2 rounded-xl",
    lg: "px-6 py-3.5 text-sm sm:text-base gap-2.5 rounded-2xl",
  };

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn(
        "relative inline-flex items-center justify-center font-bold transition-all shadow-md active:scale-95 group",
        "bg-emerald-600 hover:bg-emerald-700 text-white",
        sizeClasses[size],
        className
      )}
    >
      {/* Animated Ping Ring for Pulse Variant */}
      {variant === "pulse" && (
        <span className="absolute -inset-0.5 rounded-xl bg-emerald-500 opacity-75 blur-xs animate-pulse group-hover:opacity-100 transition-opacity" />
      )}

      <span className="relative flex items-center gap-2">
        <MessageCircle className="h-4 w-4 fill-current transition-transform group-hover:scale-110" />
        <span>Contactar por WhatsApp</span>
      </span>
    </a>
  );
}
