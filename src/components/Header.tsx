import { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, ChevronRight, Globe, Compass, Plane, FileText, MapPin, Waves, Mountain, Utensils, Music, Calendar, Building2, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

import puntaCana from "@/assets/punta-cana.jpg";
import samana from "@/assets/samana.jpg";
import santoDomingo from "@/assets/santo-domingo.jpg";
import puertoPlata from "@/assets/puerto-plata.jpg";

type MegaMenuType = "destinos" | "actividades" | "planifica" | null;

const megaMenuDestinos = [
  { name: "Punta Cana", desc: "Playas infinitas", image: puntaCana, href: "/destinos" },
  { name: "Samaná", desc: "Naturaleza virgen", image: samana, href: "/destino/samana" },
  { name: "Santo Domingo", desc: "Historia y Cultura", image: santoDomingo, href: "/destino/santo-domingo" },
  { name: "Puerto Plata", desc: "Costa del Ámbar", image: puertoPlata, href: "/destinos" },
];

const megaMenuQueHacer = [
  { name: "Playas", href: "/playas", icon: Waves },
  { name: "Ríos y Cascadas", href: "/rios", icon: Mountain },
  { name: "Gastronomía", href: "/guia-gastronomica", icon: Utensils },
  { name: "Vida Nocturna", href: "/vida-nocturna", icon: Music },
  { name: "Eventos y Festivales", href: "/eventos", icon: Calendar },
  { name: "Patrimonio y Museos", href: "/patrimonio", icon: Building2 },
];

const megaMenuPlanifica = [
  { name: "Alojamientos", href: "/alojamientos", icon: Building2 },
  { name: "Cómo Llegar", href: "/como-llegar", icon: Plane },
  { name: "Herramientas de Viaje", href: "/herramientas", icon: Car },
  { name: "Requisitos de Entrada", href: "/planifica", icon: FileText },
  { name: "Directorio de Agencias", href: "/directorio-agencias", icon: Globe },
];

const navLinks = [
  { name: "Destinos", href: "/destinos", megaMenu: "destinos" as MegaMenuType },
  { name: "Actividades", href: "/actividades", megaMenu: "actividades" as MegaMenuType },
  { name: "Planifica", href: "/planifica", megaMenu: "planifica" as MegaMenuType },
  { name: "Cultura", href: "/cultura", megaMenu: null },
  { name: "Ayuda", href: "/ayuda", megaMenu: null },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<MegaMenuType>(null);
  const location = useLocation();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (megaMenu: MegaMenuType) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (megaMenu) setActiveMegaMenu(megaMenu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 150);
  };

  const handleMegaMenuEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

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
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(link.megaMenu)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    to={link.href}
                    className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary rounded-lg hover:bg-secondary/50 ${
                      location.pathname === link.href ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {link.name}
                  </Link>
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
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

        {/* Mega Menu Dropdowns */}
        <AnimatePresence>
          {activeMegaMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 top-full bg-background border-b border-border shadow-xl"
              onMouseEnter={handleMegaMenuEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="container mx-auto px-4 lg:px-8 py-8">
                {/* Destinos Mega Menu */}
                {activeMegaMenu === "destinos" && (
                  <div className="grid lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-2 text-primary mb-6">
                        <Globe className="h-5 w-5" />
                        <h3 className="font-display font-bold uppercase tracking-wider text-sm">Destinos Populares</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {megaMenuDestinos.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setActiveMegaMenu(null)}
                            className="flex items-center gap-3 group p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                          >
                            <div className="w-14 h-10 rounded-lg overflow-hidden flex-shrink-0">
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                                {item.name}
                              </p>
                              <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <Link 
                        to="/destinos" 
                        onClick={() => setActiveMegaMenu(null)}
                        className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline mt-6"
                      >
                        Ver todos los destinos <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                    
                    <div className="lg:col-span-2">
                      <Link 
                        to="/destino/samana" 
                        onClick={() => setActiveMegaMenu(null)}
                        className="block group relative rounded-2xl overflow-hidden aspect-[16/9]"
                      >
                        <img 
                          src={samana}
                          alt="Bahía de las Águilas"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium mb-2">
                            ★ DESTINO DEL MES
                          </span>
                          <h4 className="font-display text-xl font-bold text-white mb-1">
                            Bahía de las Águilas
                          </h4>
                          <p className="text-white/80 text-sm">
                            La playa más hermosa del Caribe te espera
                          </p>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Actividades Mega Menu */}
                {activeMegaMenu === "actividades" && (
                  <div className="grid lg:grid-cols-3 gap-8">
                    <div>
                      <div className="flex items-center gap-2 text-primary mb-6">
                        <Compass className="h-5 w-5" />
                        <h3 className="font-display font-bold uppercase tracking-wider text-sm">Qué Hacer</h3>
                      </div>
                      <nav className="space-y-1">
                        {megaMenuQueHacer.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setActiveMegaMenu(null)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <item.icon className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-foreground group-hover:text-primary transition-colors">
                              {item.name}
                            </span>
                          </Link>
                        ))}
                      </nav>
                    </div>
                    
                    <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                      <Link 
                        to="/playas" 
                        onClick={() => setActiveMegaMenu(null)}
                        className="group relative rounded-xl overflow-hidden aspect-[4/3]"
                      >
                        <img src={puntaCana} alt="Playas" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-4 left-4">
                          <span className="text-white font-semibold">Playas Paradisíacas</span>
                        </div>
                      </Link>
                      <Link 
                        to="/eventos" 
                        onClick={() => setActiveMegaMenu(null)}
                        className="group relative rounded-xl overflow-hidden aspect-[4/3]"
                      >
                        <img src={santoDomingo} alt="Eventos" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-4 left-4">
                          <span className="text-white font-semibold">Eventos y Festivales</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Planifica Mega Menu */}
                {activeMegaMenu === "planifica" && (
                  <div className="grid lg:grid-cols-3 gap-8">
                    <div>
                      <div className="flex items-center gap-2 text-primary mb-6">
                        <Plane className="h-5 w-5" />
                        <h3 className="font-display font-bold uppercase tracking-wider text-sm">Planifica tu Viaje</h3>
                      </div>
                      <nav className="space-y-1">
                        {megaMenuPlanifica.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setActiveMegaMenu(null)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <item.icon className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-foreground group-hover:text-primary transition-colors">
                              {item.name}
                            </span>
                          </Link>
                        ))}
                      </nav>
                    </div>
                    
                    <div className="lg:col-span-2">
                      <div className="bg-card rounded-2xl border border-border p-6">
                        <h4 className="font-display font-bold text-foreground mb-2">¿Primera vez en RD?</h4>
                        <p className="text-muted-foreground text-sm mb-4">
                          Descubre todo lo que necesitas saber para planificar tu viaje perfecto al Caribe.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <Link 
                            to="/como-llegar" 
                            onClick={() => setActiveMegaMenu(null)}
                            className="bg-secondary/50 rounded-xl p-4 hover:bg-secondary transition-colors"
                          >
                            <Plane className="h-6 w-6 text-primary mb-2" />
                            <p className="font-semibold text-foreground text-sm">Cómo Llegar</p>
                            <p className="text-xs text-muted-foreground">Vuelos y conexiones</p>
                          </Link>
                          <Link 
                            to="/herramientas" 
                            onClick={() => setActiveMegaMenu(null)}
                            className="bg-secondary/50 rounded-xl p-4 hover:bg-secondary transition-colors"
                          >
                            <FileText className="h-6 w-6 text-primary mb-2" />
                            <p className="font-semibold text-foreground text-sm">Herramientas</p>
                            <p className="text-xs text-muted-foreground">Checklist y tips</p>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-background border-t border-border"
            >
              <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-base font-medium transition-colors hover:text-primary text-muted-foreground py-2"
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="border-t border-border my-2 pt-2">
                  <Link to="/eventos" onClick={() => setIsMenuOpen(false)} className="block py-2 text-muted-foreground hover:text-primary">Eventos</Link>
                  <Link to="/patrimonio" onClick={() => setIsMenuOpen(false)} className="block py-2 text-muted-foreground hover:text-primary">Patrimonio</Link>
                  <Link to="/como-llegar" onClick={() => setIsMenuOpen(false)} className="block py-2 text-muted-foreground hover:text-primary">Cómo Llegar</Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
