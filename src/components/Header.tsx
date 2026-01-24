import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, ChevronRight, Globe, Compass, Map, Plane, FileText, Calendar, Newspaper, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Input } from "@/components/ui/input";

import puntaCana from "@/assets/punta-cana.jpg";
import samana from "@/assets/samana.jpg";
import santoDomingo from "@/assets/santo-domingo.jpg";
import puertoPlata from "@/assets/puerto-plata.jpg";

const navLinks = [
  { name: "Destinos", href: "/destinos" },
  { name: "Actividades", href: "/actividades" },
  { name: "Playas", href: "/playas" },
  { name: "Cultura", href: "/cultura" },
  { name: "Planifica", href: "/planifica" },
  { name: "Ayuda", href: "/ayuda" },
];

const megaMenuDestinos = [
  { name: "Punta Cana", desc: "Playas infinitas", image: puntaCana, href: "/destinos" },
  { name: "Samaná", desc: "Naturaleza virgen", image: samana, href: "/destinos" },
  { name: "Santo Domingo", desc: "Historia y Cultura", image: santoDomingo, href: "/destinos" },
  { name: "Puerto Plata", desc: "Costa del Ámbar", image: puertoPlata, href: "/destinos" },
];

const megaMenuQueHacer = [
  { name: "Playas", href: "/playas" },
  { name: "Ecoturismo", href: "/rios" },
  { name: "Gastronomía", href: "/guia-gastronomica" },
  { name: "Golf", href: "/actividades" },
  { name: "Vida Nocturna", href: "/vida-nocturna" },
  { name: "Compras", href: "/actividades" },
];

const megaMenuPlanifica = [
  { name: "Hoteles y Resorts", href: "/alojamientos" },
  { name: "Vuelos y Aerolíneas", href: "/aeropuerto" },
  { name: "Requisitos de Entrada", href: "/planifica" },
  { name: "Mapas y Guías", href: "/destinos" },
];

const megaMenuDescubre = [
  { name: "Noticias", href: "/prensa" },
  { name: "Calendario de Eventos", href: "/actividades" },
  { name: "Blog de Viajes", href: "/revista" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const megaMenuRef = useRef<HTMLDivElement>(null);

  // Close mega menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setIsMegaMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <span className="font-display font-bold text-primary-foreground text-sm">RD</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-display font-bold text-foreground">República Dominicana</span>
                <span className="block text-xs text-muted-foreground -mt-1">Lo tiene todo</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
              >
                <Search className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-muted-foreground hover:text-foreground"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-background border-t border-border"
            >
              <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-base font-medium transition-colors hover:text-primary text-muted-foreground"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mega Menu Overlay */}
      <AnimatePresence>
        {isMegaMenuOpen && (
          <motion.div
            ref={megaMenuRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-background overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
              <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2" onClick={() => setIsMegaMenuOpen(false)}>
                  <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                    <span className="font-display font-bold text-primary-foreground text-sm">RD</span>
                  </div>
                  <span className="font-display font-bold text-foreground">RD Tourism</span>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsMegaMenuOpen(false)}
                  className="rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="container mx-auto px-4 lg:px-8 py-8">
              <div className="max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar destinos, experiencias, hoteles..."
                    className="pl-12 h-14 text-lg bg-secondary border-border"
                  />
                </div>
              </div>
            </div>

            {/* Mega Menu Content */}
            <div className="container mx-auto px-4 lg:px-8 pb-16">
              <div className="grid lg:grid-cols-4 gap-12">
                {/* Destinos */}
                <div>
                  <div className="flex items-center gap-2 text-primary mb-6">
                    <Globe className="h-5 w-5" />
                    <h3 className="font-display font-bold uppercase tracking-wider text-sm">Destinos</h3>
                  </div>
                  <div className="space-y-4">
                    {megaMenuDestinos.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="flex items-center gap-4 group"
                      >
                        <div className="w-16 h-12 rounded-lg overflow-hidden">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {item.name}
                          </p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </Link>
                    ))}
                    <Link 
                      to="/destinos" 
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline mt-4"
                    >
                      Ver todos los destinos <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                {/* Qué Hacer */}
                <div>
                  <div className="flex items-center gap-2 text-primary mb-6">
                    <Compass className="h-5 w-5" />
                    <h3 className="font-display font-bold uppercase tracking-wider text-sm">Qué Hacer</h3>
                  </div>
                  <nav className="space-y-3">
                    {megaMenuQueHacer.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="block text-foreground hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </div>

                {/* Planifica */}
                <div>
                  <div className="flex items-center gap-2 text-primary mb-6">
                    <Plane className="h-5 w-5" />
                    <h3 className="font-display font-bold uppercase tracking-wider text-sm">Planifica</h3>
                  </div>
                  <nav className="space-y-3">
                    {megaMenuPlanifica.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="block text-foreground hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>

                  <div className="flex items-center gap-2 text-primary mb-6 mt-10">
                    <FileText className="h-5 w-5" />
                    <h3 className="font-display font-bold uppercase tracking-wider text-sm">Descubre</h3>
                  </div>
                  <nav className="space-y-3">
                    {megaMenuDescubre.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="block text-foreground hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </div>

                {/* Featured Destination */}
                <div>
                  <Link 
                    to="/destinos" 
                    onClick={() => setIsMegaMenuOpen(false)}
                    className="block group"
                  >
                    <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
                      <img 
                        src={samana}
                        alt="Bahía de las Águilas"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium mb-3">
                          ★ DESTINO DEL MES
                        </span>
                        <h4 className="font-display text-2xl font-bold text-white mb-2">
                          Bahía de las Águilas
                        </h4>
                        <p className="text-white/80 text-sm line-clamp-2 mb-4">
                          Descubre una de las playas más hermosas del mundo, con aguas cristalinas y arena...
                        </p>
                        <Button variant="secondary" size="sm" className="gap-2">
                          Explorar Ahora <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border py-6">
              <div className="container mx-auto px-4 lg:px-8 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <span>Español (RD)</span>
                </div>
                <div className="flex items-center gap-6">
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Instagram</a>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Facebook</a>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Twitter</a>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">YouTube</a>
                </div>
                <p className="text-sm text-muted-foreground">
                  © 2024 Descubre República Dominicana
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
