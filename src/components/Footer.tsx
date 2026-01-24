import { Link } from "react-router-dom";
import { MapPin, Youtube, Twitter, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

const footerLinks = {
  destinos: [
    { name: "Punta Cana", href: "/destinos/punta-cana" },
    { name: "Samaná", href: "/destinos/samana" },
    { name: "Puerto Plata", href: "/destinos/puerto-plata" },
    { name: "La Romana", href: "/destinos/la-romana" },
  ],
  intereses: [
    { name: "Ecoturismo", href: "/intereses/ecoturismo" },
    { name: "Gastronomía", href: "/intereses/gastronomia" },
    { name: "Golf", href: "/intereses/golf" },
    { name: "Turquismo", href: "/intereses/turquismo" },
  ],
  info: [
    { name: "Requisitos", href: "/info/requisitos" },
    { name: "Clima", href: "/info/clima" },
    { name: "Seguridad", href: "/info/seguridad" },
    { name: "FAQs", href: "/info/faqs" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              Explora la Isla
            </h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
              Navega por nuestro mapa interactivo y descubre los tesoros ocultos que hacen de República Dominicana un destino único.
            </p>
            
            {/* Mini Map Placeholder */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-surface mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <Button variant="outline" className="gap-2">
              Ver Mapa Completo
            </Button>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-display font-bold text-foreground mb-4">Destinos</h4>
            <ul className="space-y-3">
              {footerLinks.destinos.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-foreground mb-4">Intereses</h4>
            <ul className="space-y-3">
              {footerLinks.intereses.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-foreground mb-4">Info</h4>
            <ul className="space-y-3">
              {footerLinks.info.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="font-display font-bold text-primary-foreground text-sm">RD</span>
            </div>
            <span className="font-display font-bold text-foreground">República Dominicana</span>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            © 2024 Ministerio de Turismo de República Dominicana. Todos los derechos reservados.
          </p>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <Youtube className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <Twitter className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <Instagram className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
