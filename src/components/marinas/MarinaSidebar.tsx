import { Star, Anchor, Phone, Mail, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarinaRate } from "@/data/marinasDetalleData";

interface MarinaSidebarProps {
  rating: number;
  reviews: number;
  tarifas: MarinaRate[];
  telefono: string;
  email: string;
  website: string;
}

export function MarinaSidebar({
  rating,
  reviews,
  tarifas,
  telefono,
  email,
  website,
}: MarinaSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Booking Card */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm sticky top-24">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <Anchor className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Solicitar Amarre</h3>
            <p className="text-sm text-muted-foreground">Respuesta en 24 horas</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-1 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-current" : ""}`}
              />
            ))}
            <span className="ml-2 text-foreground font-semibold">{rating}</span>
            <span className="text-muted-foreground text-sm">({reviews} reseñas)</span>
          </div>

          {tarifas.length > 0 && (
            <div className="border-t border-border pt-4 space-y-3">
              <h4 className="font-semibold text-foreground text-sm">Tarifas Orientativas</h4>
              {tarifas.map((tarifa, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{tarifa.concepto}</span>
                  <span className="font-medium text-foreground">{tarifa.precio}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button className="w-full mb-3">Solicitar Reserva</Button>
        <a href={`tel:${telefono}`} className="block w-full">
          <Button variant="outline" className="w-full gap-2">
            <Phone className="h-4 w-4" />
            Llamar Ahora
          </Button>
        </a>
      </div>

      {/* Contact Info Card */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h3 className="font-bold text-foreground mb-4">Información de Contacto</h3>
        <div className="space-y-3">
          <a
            href={`tel:${telefono}`}
            className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Phone className="h-4 w-4 shrink-0 text-primary" />
            <span>{telefono}</span>
          </a>
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Mail className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{email}</span>
          </a>
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Globe className="h-4 w-4 shrink-0 text-primary" />
            <span>Sitio Web Oficial</span>
          </a>
        </div>
      </div>
    </div>
  );
}
