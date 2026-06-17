import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MapPin, Youtube, Twitter, Instagram, Facebook, ChevronDown, ChevronUp, 
  Mail, Phone, Download, Building, Users, Newspaper, Smartphone 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useI18n";

export function Footer() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const { t } = useTranslation();

  const footerSections = {
    sitemap: {
      title: t("footer.sitemap"),
      links: [
        { name: t("footer.destinations"), href: "/destinos" },
        { name: t("footer.experiences"), href: "/experiencias" },
        { name: t("footer.accommodations"), href: "/alojamientos" },
        { name: t("footer.events"), href: "/eventos" },
        { name: t("footer.beaches"), href: "/playas" },
        { name: t("footer.gastronomy"), href: "/guia-gastronomica" },
        { name: t("footer.nightlife"), href: "/vida-nocturna" },
        { name: t("footer.wellness"), href: "/wellness" },
      ],
    },
    comunidad: {
      title: t("footer.community"),
      links: [
        { name: t("footer.agencyDirectory"), href: "/directorio-agencias" },
        { name: t("footer.tourOperators"), href: "/directorio-agencias" },
        { name: t("footer.localGuides"), href: "/guias-locales" },
        { name: t("footer.pressKit"), href: "/prensa" },
        { name: t("footer.affiliateProgram"), href: "/afiliados" },
        { name: t("footer.ambassadors"), href: "/embajadores" },
      ],
    },
    corporativo: {
      title: t("footer.corporate"),
      links: [
        { name: t("footer.aboutUs"), href: "/sobre-nosotros" },
        { name: t("footer.rdInNumbers"), href: "/estadisticas" },
        { name: t("footer.touristInvestment"), href: "/inversion" },
        { name: t("footer.jobs"), href: "/empleo" },
        { name: t("footer.touristAcademy"), href: "/academia" },
        { name: t("footer.termsAndPrivacy"), href: "/terminos" },
        { name: "Mapa del sitio", href: "/sitemap" },
      ],
    },
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        {/* Desktop: 4 Column Grid */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-12">
          <div>
            <h4 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {footerSections.sitemap.title}
            </h4>
            <ul className="space-y-3">
              {footerSections.sitemap.links.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              {footerSections.comunidad.title}
            </h4>
            <ul className="space-y-3">
              {footerSections.comunidad.links.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" />
              {footerSections.corporativo.title}
            </h4>
            <ul className="space-y-3">
              {footerSections.corporativo.links.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-primary" />
              {t("footer.connectWithRD")}
            </h4>
            
            <div className="flex items-center gap-3 mb-6">
              <Button variant="outline" size="icon" className="text-muted-foreground hover:text-primary hover:border-primary">
                <Youtube className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="text-muted-foreground hover:text-primary hover:border-primary">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="text-muted-foreground hover:text-primary hover:border-primary">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="text-muted-foreground hover:text-primary hover:border-primary">
                <Twitter className="h-4 w-4" />
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
                className="flex-1 bg-background"
                required
              />
              <Button type="submit" size="sm">
                <Mail className="h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                <Smartphone className="h-4 w-4" /> {t("footer.downloadApp")}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs">
                  App Store
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
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
                onClick={() => toggleSection(key)}
                className="flex items-center justify-between w-full py-4"
              >
                <span className="font-display font-bold text-foreground">{section.title}</span>
                {expandedSection === key ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
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
              <Button variant="outline" size="icon" className="text-muted-foreground hover:text-primary">
                <Youtube className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-3">Newsletter</p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder={t("footer.newsletterPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                required
              />
              <Button type="submit" size="sm">
                <Mail className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="font-display font-bold text-primary-foreground text-sm">RD</span>
            </div>
            <span className="font-display font-bold text-foreground">{t("hero.title")}</span>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} {t("footer.madeWithLove")}. {t("footer.rights")}.
          </p>

          <div className="flex items-center gap-4">
            <Link to="/terminos" className="text-xs text-muted-foreground hover:text-primary">
              {t("footer.terms")}
            </Link>
            <Link to="/accesibilidad" className="text-xs text-muted-foreground hover:text-primary">
              {t("footer.accessibility")}
            </Link>
            <Link to="/ayuda" className="text-xs text-muted-foreground hover:text-primary">
              {t("footer.contact")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
