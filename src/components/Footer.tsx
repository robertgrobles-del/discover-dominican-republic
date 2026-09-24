import { Link } from "react-router-dom";
import { 
  Instagram, Facebook, Twitter, Youtube, Mail, 
  MapPin, Phone, Shield, Heart,
  ChevronDown, ChevronUp, Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useI18n";
import { toast } from "sonner";
import { PreFooterPresidenteBanner } from "@/components/promo/PreFooterPresidenteBanner";

interface FooterProps {
  hidePreFooterBanner?: boolean;
}

export function Footer({ hidePreFooterBanner = false }: FooterProps = {}) {
  const [email, setEmail] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success(t("footer.newsletterSuccess"));
      setEmail("");
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const footerSections = {
    destinos: {
      title: t("footer.destinations"),
      links: [
        { name: "Punta Cana", href: "/destino/punta-cana" },
        { name: "Santo Domingo", href: "/destino/santo-domingo" },
        { name: "Samaná", href: "/destino/samana" },
        { name: "Puerto Plata", href: "/destino/puerto-plata" },
        { name: "La Romana", href: "/destino/la-romana" },
        { name: "Jarabacoa", href: "/destino/jarabacoa" },
        { name: "Barahona", href: "/destino/barahona" },
        { name: "Bahía de las Águilas", href: "/destino/bahia-de-las-aguilas" },
      ],
    },
    experiencias: {
      title: t("footer.experiences"),
      links: [
        { name: t("interest.beaches"), href: "/playas" },
        { name: t("interest.adventure"), href: "/actividades" },
        { name: t("interest.gastronomy"), href: "/guia-gastronomica" },
        { name: t("interest.culture"), href: "/cultura" },
        { name: t("interest.ecotourism"), href: "/ecoturismo" },
        { name: t("interest.wellness"), href: "/spas-wellness" },
        { name: t("header.allInclusive"), href: "/alojamientos?categoria=Resort" },
        { name: "Pelota Invernal LIDOM", href: "/lidom" },
      ],
    },
    planifica: {
      title: t("nav.plan"),
      links: [
        { name: "Tasas de Cambio Bancarias", href: "/tasas-cambio" },
        { name: "Resultados de Loterías", href: "/loterias" },
        { name: "Reserva Directa", href: "/reserva-directa" },
        { name: "Itinerario con IA", href: "/itinerario-ia" },
        { name: "Tarjeta RD Pass", href: "/tarjeta-prepago" },
        { name: "Salud y Farmacias 24h", href: "/salud-24h" },
        { name: t("plan.howToGetThere"), href: "/como-llegar" },
        { name: t("plan.entryReq"), href: "/requisitos-viaje" },
        { name: t("plan.transport"), href: "/info/transporte" },
        { name: t("plan.safety"), href: "/info/seguridad" },
        { name: t("plan.insurance"), href: "/seguro-viaje" },
        { name: t("plan.faq"), href: "/centro-ayuda" },
      ],
    },
    corporativo: {
      title: t("footer.corporate"),
      links: [
        { name: t("footer.aboutUs"), href: "/sobre-nosotros" },
        { name: "Portal de Partners B2B", href: "/partners" },
        { name: "Operadores RD (reservas directas)", href: "/operadores" },
        { name: "Tienda oficial", href: "/tienda" },
        { name: "Programa de Creadores", href: "/creadores" },
        { name: "Gamificación & Premios", href: "/gamificacion-turistica" },
        { name: t("footer.press"), href: "/prensa" },
        { name: t("footer.sustainability"), href: "/sostenible" },
        { name: "Inversión Turística", href: "/inversion" },
        { name: t("footer.privacy"), href: "/terminos" },
        { name: t("footer.terms"), href: "/terminos" },
        { name: t("footer.contact"), href: "/sobre-nosotros#contacto" },
      ],
    },
  };

  return (
    <>
      {/* 250px Full-Width Cerveza Presidente Banner Before Footer */}
      {!hidePreFooterBanner && <PreFooterPresidenteBanner />}

      <footer className="bg-card border-t border-border" role="contentinfo">
      <div className="container mx-auto px-4 lg:px-8 pt-12 pb-8 lg:pt-14 lg:pb-8">
        {/* Desktop: 5 Columns Grid */}
        <div className="hidden lg:grid grid-cols-5 gap-8 mb-8">
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-display font-bold text-foreground mb-4 text-base">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <span className="font-display font-black text-slate-950 text-sm">RD</span>
              </div>
              <span className="font-display font-bold text-foreground">Descubre RD</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {t("hero.subtitle")}
            </p>

            <div className="flex items-center gap-3 mb-6">
              <Button variant="outline" size="icon" aria-label="Canal de YouTube oficial" className="text-muted-foreground hover:text-primary hover:border-primary">
                <Youtube className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button variant="outline" size="icon" aria-label="Perfil de Instagram oficial" className="text-muted-foreground hover:text-primary hover:border-primary">
                <Instagram className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button variant="outline" size="icon" aria-label="Página de Facebook oficial" className="text-muted-foreground hover:text-primary hover:border-primary">
                <Facebook className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button variant="outline" size="icon" aria-label="Cuenta de Twitter / X oficial" className="text-muted-foreground hover:text-primary hover:border-primary">
                <Twitter className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-3">
              {t("footer.newsletter")}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder={t("footer.newsletterPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Correo electrónico para boletín"
                className="flex-1 bg-background"
                required
              />
              <Button type="submit" size="sm" aria-label="Suscribirse al boletín informativo">
                <Mail className="h-4 w-4" aria-hidden="true" />
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                <Smartphone className="h-4 w-4" aria-hidden="true" /> {t("footer.downloadApp")}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" aria-label="Descargar aplicación en Apple App Store" className="text-xs">
                  App Store
                </Button>
                <Button variant="outline" size="sm" aria-label="Descargar aplicación en Google Play Store" className="text-xs">
                  Google Play
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Accordion */}
        <div className="lg:hidden space-y-2">
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key} className="border-b border-border">
              <button
                type="button"
                onClick={() => toggleSection(key)}
                aria-expanded={expandedSection === key}
                aria-label={`Desplegar sección ${section.title}`}
                className="flex items-center justify-between w-full py-4 text-left"
              >
                <span className="font-display font-bold text-foreground">{section.title}</span>
                {expandedSection === key ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                )}
              </button>
              <motion.div
                initial={false}
                animate={{ height: expandedSection === key ? "auto" : 0 }}
                className="overflow-hidden"
              >
                <ul className="pb-4 space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          ))}

          <div className="pt-6">
            <h4 className="font-display font-bold text-foreground mb-4">{t("footer.connectWithRD")}</h4>
            <div className="flex items-center gap-3 mb-6">
              <Button variant="outline" size="icon" aria-label="Canal de YouTube" className="text-muted-foreground hover:text-primary">
                <Youtube className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button variant="outline" size="icon" aria-label="Perfil de Instagram" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button variant="outline" size="icon" aria-label="Página de Facebook" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button variant="outline" size="icon" aria-label="Cuenta de Twitter / X" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-3">Newsletter</p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder={t("footer.newsletterPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Correo electrónico para boletín móvil"
                className="flex-1"
                required
              />
              <Button type="submit" size="sm" aria-label="Suscribirse al boletín móvil">
                <Mail className="h-4 w-4" aria-hidden="true" />
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 mt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Descubre República Dominicana. {t("footer.allRightsReserved")}</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link to="/terminos" className="hover:text-primary transition-colors">{t("footer.privacy")}</Link>
            <Link to="/terminos" className="hover:text-primary transition-colors">{t("footer.terms")}</Link>
            <Link to="/sitemap" className="hover:text-primary transition-colors">Mapa del Sitio</Link>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}
