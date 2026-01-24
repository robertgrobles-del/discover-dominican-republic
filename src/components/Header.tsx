import { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Menu, X, ChevronRight, Globe, Compass, Plane, FileText, 
  MapPin, Waves, Mountain, Utensils, Music, Calendar, Building2, Car,
  Bed, Users, Heart, Info, BookOpen, Camera, Sun
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

import puntaCana from "@/assets/punta-cana.jpg";
import samana from "@/assets/samana.jpg";
import santoDomingo from "@/assets/santo-domingo.jpg";
import puertoPlata from "@/assets/puerto-plata.jpg";

type MegaMenuType = "dondeIr" | "queHacer" | "dondeQuedarse" | "planificar" | "sobreElPais" | null;

// DONDE IR - Destinos
const megaMenuDondeIr = {
  destinos: [
    { name: "Punta Cana", desc: "Playas infinitas", image: puntaCana, href: "/destino/punta-cana" },
    { name: "Samaná", desc: "Naturaleza virgen", image: samana, href: "/destino/samana" },
    { name: "Santo Domingo", desc: "Historia y Cultura", image: santoDomingo, href: "/destino/santo-domingo" },
    { name: "Puerto Plata", desc: "Costa del Ámbar", image: puertoPlata, href: "/destino/puerto-plata" },
  ],
  regiones: [
    { name: "Región Norte", href: "/destinos?region=norte" },
    { name: "Región Este", href: "/destinos?region=este" },
    { name: "Región Sur", href: "/destinos?region=sur" },
    { name: "Santo Domingo", href: "/destinos?region=santo-domingo" },
  ]
};

// QUE HACER - Actividades y experiencias
const megaMenuQueHacer = [
  { name: "Playas", href: "/playas", icon: Waves, desc: "Descubre playas paradisíacas" },
  { name: "Ríos y Cascadas", href: "/rios", icon: Mountain, desc: "Aventura en la naturaleza" },
  { name: "Aventura y Deportes", href: "/actividades", icon: Compass, desc: "Senderismo, rafting, buceo" },
  { name: "Gastronomía", href: "/guia-gastronomica", icon: Utensils, desc: "Sabores dominicanos" },
  { name: "Vida Nocturna", href: "/vida-nocturna", icon: Music, desc: "Bares, clubs y shows" },
  { name: "Eventos y Festivales", href: "/eventos", icon: Calendar, desc: "Agenda cultural" },
  { name: "Patrimonio y Museos", href: "/patrimonio", icon: Building2, desc: "Historia y cultura" },
];

// DONDE QUEDARSE
const megaMenuDondeQuedarse = [
  { name: "Hoteles y Resorts", href: "/alojamientos?tipo=hotel", icon: Building2 },
  { name: "Eco-Lodges", href: "/alojamientos?tipo=ecolodge", icon: Mountain },
  { name: "Villas Privadas", href: "/alojamientos?tipo=villa", icon: Bed },
  { name: "Apartamentos", href: "/alojamientos?tipo=apartamento", icon: Building2 },
  { name: "Todo Incluido", href: "/alojamientos?tipo=all-inclusive", icon: Sun },
];

// PLANIFICAR VIAJE
const megaMenuPlanificar = [
  { name: "Cómo Llegar", href: "/como-llegar", icon: Plane, desc: "Vuelos y conexiones" },
  { name: "Aeropuertos", href: "/aeropuerto", icon: Plane, desc: "Info de aeropuertos" },
  { name: "Requisitos de Entrada", href: "/planifica", icon: FileText, desc: "Visas y documentos" },
  { name: "Transporte Interno", href: "/info/transporte", icon: Car, desc: "Cómo moverse" },
  { name: "Herramientas de Viaje", href: "/herramientas", icon: Compass, desc: "Checklists y tips" },
  { name: "Directorio de Agencias", href: "/directorio-agencias", icon: Users, desc: "Tour operadores" },
];

// SOBRE EL PAIS
const megaMenuSobreElPais = [
  { name: "Cultura y Tradiciones", href: "/cultura", icon: Heart, desc: "Música, baile, folclore" },
  { name: "Historia", href: "/patrimonio", icon: BookOpen, desc: "500 años de historia" },
  { name: "Gastronomía Típica", href: "/cultura#gastronomia", icon: Utensils, desc: "Platos tradicionales" },
  { name: "Galería Multimedia", href: "/galeria", icon: Camera, desc: "Fotos y videos" },
  { name: "Turismo Sostenible", href: "/sostenible", icon: Mountain, desc: "Viaja responsable" },
  { name: "Información Práctica", href: "/info/seguridad", icon: Info, desc: "Seguridad y salud" },
  { name: "Sobre Nosotros", href: "/sobre-nosotros", icon: Users, desc: "Quiénes somos" },
];

const navLinks = [
  { name: "Donde Ir", href: "/destinos", megaMenu: "dondeIr" as MegaMenuType },
  { name: "Qué Hacer", href: "/actividades", megaMenu: "queHacer" as MegaMenuType },
  { name: "Donde Quedarse", href: "/alojamientos", megaMenu: "dondeQuedarse" as MegaMenuType },
  { name: "Planificar", href: "/planifica", megaMenu: "planificar" as MegaMenuType },
  { name: "Sobre el País", href: "/cultura", megaMenu: "sobreElPais" as MegaMenuType },
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
                
                {/* DONDE IR Mega Menu */}
                {activeMegaMenu === "dondeIr" && (
                  <div className="grid lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-2 text-primary mb-6">
                        <Globe className="h-5 w-5" />
                        <h3 className="font-display font-bold uppercase tracking-wider text-sm">Destinos Populares</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {megaMenuDondeIr.destinos.map((item) => (
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
                      
                      {/* Regiones */}
                      <div className="mt-6 pt-6 border-t border-border">
                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Por Región</h4>
                        <div className="flex flex-wrap gap-2">
                          {megaMenuDondeIr.regiones.map((region) => (
                            <Link
                              key={region.name}
                              to={region.href}
                              onClick={() => setActiveMegaMenu(null)}
                              className="text-sm text-foreground hover:text-primary px-3 py-1 bg-secondary/50 rounded-full hover:bg-secondary transition-colors"
                            >
                              {region.name}
                            </Link>
                          ))}
                        </div>
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

                {/* QUE HACER Mega Menu */}
                {activeMegaMenu === "queHacer" && (
                  <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-2 text-primary mb-6">
                        <Compass className="h-5 w-5" />
                        <h3 className="font-display font-bold uppercase tracking-wider text-sm">Experiencias</h3>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2">
                        {megaMenuQueHacer.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setActiveMegaMenu(null)}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <item.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <span className="font-medium text-foreground group-hover:text-primary transition-colors block">
                                {item.name}
                              </span>
                              <span className="text-xs text-muted-foreground">{item.desc}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <Link 
                        to="/playas" 
                        onClick={() => setActiveMegaMenu(null)}
                        className="group relative rounded-xl overflow-hidden aspect-[4/3] block"
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
                        className="group relative rounded-xl overflow-hidden aspect-[4/3] block"
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

                {/* DONDE QUEDARSE Mega Menu */}
                {activeMegaMenu === "dondeQuedarse" && (
                  <div className="grid lg:grid-cols-3 gap-8">
                    <div>
                      <div className="flex items-center gap-2 text-primary mb-6">
                        <Bed className="h-5 w-5" />
                        <h3 className="font-display font-bold uppercase tracking-wider text-sm">Alojamiento</h3>
                      </div>
                      <nav className="space-y-1">
                        {megaMenuDondeQuedarse.map((item) => (
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
                      <Link 
                        to="/alojamientos" 
                        onClick={() => setActiveMegaMenu(null)}
                        className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline mt-6"
                      >
                        Ver todos los alojamientos <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                    
                    <div className="lg:col-span-2">
                      <div className="bg-card rounded-2xl border border-border p-6">
                        <h4 className="font-display font-bold text-foreground mb-2">¿Buscas algo especial?</h4>
                        <p className="text-muted-foreground text-sm mb-4">
                          Desde resorts de lujo frente al mar hasta eco-lodges en la montaña.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <Link 
                            to="/alojamientos?tipo=all-inclusive" 
                            onClick={() => setActiveMegaMenu(null)}
                            className="bg-secondary/50 rounded-xl p-4 hover:bg-secondary transition-colors"
                          >
                            <Sun className="h-6 w-6 text-primary mb-2" />
                            <p className="font-semibold text-foreground text-sm">Todo Incluido</p>
                            <p className="text-xs text-muted-foreground">Relax sin preocupaciones</p>
                          </Link>
                          <Link 
                            to="/alojamientos?tipo=ecolodge" 
                            onClick={() => setActiveMegaMenu(null)}
                            className="bg-secondary/50 rounded-xl p-4 hover:bg-secondary transition-colors"
                          >
                            <Mountain className="h-6 w-6 text-primary mb-2" />
                            <p className="font-semibold text-foreground text-sm">Eco-Lodges</p>
                            <p className="text-xs text-muted-foreground">Turismo sostenible</p>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PLANIFICAR Mega Menu */}
                {activeMegaMenu === "planificar" && (
                  <div className="grid lg:grid-cols-3 gap-8">
                    <div>
                      <div className="flex items-center gap-2 text-primary mb-6">
                        <Plane className="h-5 w-5" />
                        <h3 className="font-display font-bold uppercase tracking-wider text-sm">Planifica tu Viaje</h3>
                      </div>
                      <nav className="space-y-1">
                        {megaMenuPlanificar.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setActiveMegaMenu(null)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <item.icon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <span className="text-foreground group-hover:text-primary transition-colors block text-sm">
                                {item.name}
                              </span>
                              <span className="text-xs text-muted-foreground">{item.desc}</span>
                            </div>
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

                {/* SOBRE EL PAIS Mega Menu */}
                {activeMegaMenu === "sobreElPais" && (
                  <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-2 text-primary mb-6">
                        <Heart className="h-5 w-5" />
                        <h3 className="font-display font-bold uppercase tracking-wider text-sm">Conoce el País</h3>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2">
                        {megaMenuSobreElPais.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setActiveMegaMenu(null)}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <item.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <span className="font-medium text-foreground group-hover:text-primary transition-colors block">
                                {item.name}
                              </span>
                              <span className="text-xs text-muted-foreground">{item.desc}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Link 
                        to="/cultura" 
                        onClick={() => setActiveMegaMenu(null)}
                        className="block group relative rounded-2xl overflow-hidden aspect-[4/3]"
                      >
                        <img src={santoDomingo} alt="Cultura" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium mb-2">
                            DESCUBRE
                          </span>
                          <h4 className="font-display text-lg font-bold text-white">
                            Cultura Dominicana
                          </h4>
                          <p className="text-white/80 text-sm">
                            Música, gastronomía y tradiciones
                          </p>
                        </div>
                      </Link>
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
                  <Link to="/alojamientos" onClick={() => setIsMenuOpen(false)} className="block py-2 text-muted-foreground hover:text-primary">Alojamientos</Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
