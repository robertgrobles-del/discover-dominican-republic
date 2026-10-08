import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Menu, X, Globe, Compass, 
  MapPin, Waves, TreePine, Leaf, Bed, Utensils, Music, ShoppingBag,
  Heart, BookOpen, Camera, User, LogOut, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HighContrastToggle } from "@/components/HighContrastToggle";
import { WeatherWidget } from "@/components/WeatherWidget";
import { LanguageSelector } from "@/components/LanguageSelector";
import { GlobalSearch } from "@/components/GlobalSearch";
import { NotificationBell } from "@/components/NotificationBell";
import { SpaceSwitcher } from "@/components/account/SpaceSwitcher";
import { CartDrawer } from "@/components/CartDrawer";
import { UserProgressWidget } from "@/components/gamification/UserProgressWidget";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useI18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MegaMenuDondeIr } from "@/components/header/mega-menus/MegaMenuDondeIr";
import { MegaMenuQueHacer } from "@/components/header/mega-menus/MegaMenuQueHacer";
import { MegaMenuPlanificar } from "@/components/header/mega-menus/MegaMenuPlanificar";
import { MegaMenuGuias } from "@/components/header/mega-menus/MegaMenuGuias";
import { MegaMenuEmpresas } from "@/components/header/mega-menus/MegaMenuEmpresas";

import puntaCana from "@/assets/punta-cana.jpg";
import samana from "@/assets/samana.jpg";
import santoDomingo from "@/assets/santo-domingo.jpg";
import puertoPlata from "@/assets/puerto-plata.jpg";
import adventure from "@/assets/adventure.jpg";
import gastronomy from "@/assets/gastronomy.jpg";
import diving from "@/assets/diving.jpg";
import relaxBeach from "@/assets/relax-beach.jpg";
import adAdventureImg from "@/assets/promo/promo-adventure.jpg";
import adBeachResortImg from "@/assets/promo/promo-beach-resort.jpg";
import adLuxuryHotelImg from "@/assets/promo/promo-luxury-hotel.jpg";

interface HeaderProps {
  hasHero?: boolean;
  variant?: "transparent" | "dark" | "white";
  className?: string;
  onOpenSearch?: () => void;
}

type MegaMenuType = "dondeIr" | "queHacer" | "dondeQuedarse" | "planificar" | "sobreElPais" | null;

export function Header({ hasHero, variant, className, onOpenSearch }: HeaderProps = {}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<MegaMenuType>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user, loading, signOut } = useAuth();
  const { t } = useTranslation();

  const isHomePage = location.pathname === "/";
  const showCart = ["/tienda", "/marketplace", "/carrito", "/checkout"].some((path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`)
  );

  // List of known routes that feature a full-bleed Hero Banner or Hero Slider
  const heroRoutes = [
    "/",
    "/destinos",
    "/actividades",
    "/alojamientos",
    "/cultura",
    "/playas",
    "/planifica",
    "/experiencias",
    "/guia-gastronomica",
    "/eventos",
  ];

  // Check if current route has a hero (e.g. /destino/* or /evento/*)
  const isDynamicHeroRoute = 
    location.pathname.startsWith("/destino/") || 
    location.pathname.startsWith("/evento/") ||
    location.pathname.startsWith("/alojamiento/") ||
    location.pathname.startsWith("/restaurante/") ||
    location.pathname.startsWith("/bar/") ||
    location.pathname.startsWith("/provincia/") ||
    location.pathname.startsWith("/playa/") ||
    location.pathname.startsWith("/parque/") ||
    location.pathname.startsWith("/estadio/") ||
    location.pathname.startsWith("/experiencia/");

  const pageHasHero = variant === "white"
    ? false
    : (hasHero !== undefined 
        ? hasHero 
        : (heroRoutes.includes(location.pathname) || isDynamicHeroRoute));

  const isWhiteVariant = variant === "white";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Translated navigation data
  const navLinks = [
    { name: t("nav.explore"), href: "/destinos", megaMenu: "dondeIr" as MegaMenuType },
    { name: t("nav.plan"), href: "/planifica", megaMenu: "planificar" as MegaMenuType },
    { name: t("nav.whatToDo"), href: "/actividades", megaMenu: "queHacer" as MegaMenuType },
    { name: t("nav.guides"), href: "/guia-practica", megaMenu: "sobreElPais" as MegaMenuType },
    { name: t("nav.businesses"), href: "/para-empresas", megaMenu: "dondeQuedarse" as MegaMenuType },
  ];

  const mobileNavSections = [
    { title: t("nav.explore"), links: [
      ["Destinos y regiones", "/destinos"], ["Provincias", "/provincias"], ["Playas y costas", "/playas"],
      ["Ríos y cascadas", "/rios"], ["Parques y ecoturismo", "/ecoturismo"], ["Alojamientos", "/alojamientos"],
      ["Restaurantes", "/restaurantes"], ["Compras", "/compras"], ["Vida nocturna", "/vida-nocturna"],
    ] },
    { title: t("nav.plan"), links: [
      ["Participa y gana", "/gana-con-descubre-rd"], ["Mi viaje e itinerarios", "/mi-viaje"], ["Planificador grupal", "/planificador-grupal"], ["Ofertas y descuentos", "/ofertas"], ["Presupuesto", "/calculadora-presupuesto"],
      ["Llegada y vuelos", "/como-llegar"], ["Aeropuertos y puertos", "/aeropuerto"], ["Transporte", "/info/transporte"], ["Conectividad móvil", "/conectividad"],
      ["Requisitos de entrada", "/e-ticket"], ["Clima", "/clima"], ["Seguridad y emergencias", "/info/seguridad"],
    ] },
    { title: t("nav.whatToDo"), links: [
      ["Actividades", "/actividades"], ["Experiencias", "/experiencias"], ["Tours", "/tours"],
      ["Eventos", "/eventos"], ["Deportes", "/turismo-deportivo"], ["Cultura y gastronomía", "/cultura"],
    ] },
    { title: t("nav.guides"), links: [
      ["Guía práctica", "/guia-practica"], ["Editorial & Revista", "/revista"], ["Sala de Prensa (PR)", "/revista?canal=prensa"], ["Blog de Viajes", "/revista?canal=experiencias"], ["Historia y patrimonio", "/historia"],
      ["Accesibilidad", "/accesibilidad"], ["Guías locales", "/guias-locales"], ["Turismo responsable", "/sostenible"],
    ] },
    { title: t("nav.businesses"), links: [
      ["Portal para empresas", "/para-empresas"], ["Operadores turísticos", "/operadores"], ["Directorio de operadores", "/operadores/directorio"],
      ["Panel de empresa", "/operadores/panel"], ["Panel de administración", "/admin"], ["Anúnciate", "/anunciate"], ["Partners", "/partners"],
    ] },
  ];

  const megaMenuDondeIrData = {
    destinos: [
      { name: "Punta Cana", desc: t("header.puntaCanaDesc"), image: puntaCana, href: "/destino/punta-cana", tag: "Costas del Este" },
      { name: "Samaná", desc: t("header.samanaDesc"), image: samana, href: "/destino/samana", tag: "Santuario de Ballenas" },
      { name: "Santo Domingo", desc: t("header.santoDomingoDesc"), image: santoDomingo, href: "/destino/santo-domingo", tag: "Ciudad Primada de América" },
      { name: "Puerto Plata", desc: t("header.puertoPlataDesc"), image: puertoPlata, href: "/destino/puerto-plata", tag: "Costa del Ámbar & Surf" },
    ],
    regiones: [
      { name: "Región Norte (Cibao & Costa Atlántica)", desc: "Santiago, Puerto Plata, Jarabacoa, Montecristi", href: "/destinos/region/norte", tag: "Montaña & Ecoturismo", image: puertoPlata },
      { name: "Región Este (Playas & Golf)", desc: "Punta Cana, La Romana, Bayahíbe, Miches", href: "/destinos/region/este", tag: "All-Inclusive & Arrecifes", image: puntaCana },
      { name: "Región Sur Profundo (Naturaleza Virgen)", desc: "Barahona, Pedernales, Bahía de las Águilas, Baní", href: "/destinos/region/sur", tag: "Reserva de Biósfera", image: samana },
      { name: "Gran Santo Domingo (Cultura & Negocios)", desc: "Zona Colonial, Malecón, Gastronomía de Autor", href: "/destinos/region/santo-domingo", tag: "Patrimonio UNESCO", image: santoDomingo },
    ]
  };

  const megaMenuQueHacerData = {
    experienciasTop: [
      { name: "Aventura, Cascadas & Zipline", desc: "27 Charcos, Samaná y Jarabacoa", image: adventure, href: "/experiencia/27-charcos-de-damajagua" },
      { name: "Ruta Gastronómica & Alta Cocina", desc: "Sabores criollos, mariscos y catas de ron", image: gastronomy, href: "/rutas-sabor" },
      { name: "Buceo en Arrecifes & Snorkel", desc: "Aguas cristalinas en Bayahíbe y Sosúa", image: diving, href: "/buceo-snorkel" },
      { name: "Playas Paradisíacas & Catamarán", desc: "Bávaro, Cayo Levantado y Bahía de las Águilas", image: relaxBeach, href: "/playas" },
    ],
    categorias: [
      { name: "Vida Nocturna & Bares", href: "/vida-nocturna", icon: Music },
      { name: "Patrimonio & Museos", href: "/museos-monumentos", icon: BookOpen },
      { name: "Eventos & Fiestas", href: "/eventos", icon: Waves },
      { name: "Wellness & Spas", href: "/spas-wellness", icon: Heart },
      { name: "Pelota LIDOM", href: "/lidom", icon: Compass },
      { name: "Deportes y aventura", href: "/turismo-deportivo", icon: Compass },
    ]
  };

  const handleMouseEnter = (megaMenu: MegaMenuType) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMegaMenu(megaMenu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 150);
  };

  const handleMegaMenuEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
      {/* Skip to content - Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none"
      >
        Saltar al contenido principal
      </a>

      {/* Header Container */}
      <div 
        className={
          pageHasHero
            ? `fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ease-in-out transform ${
                isScrolled && !isMenuOpen && !activeMegaMenu
                  ? "-translate-y-full opacity-0 pointer-events-none" 
                  : "translate-y-0 opacity-100 pointer-events-auto"
              } ${className || ""}`
            : `sticky top-0 left-0 right-0 w-full z-50 shadow-md ${className || ""}`
        }
      >
        <header 
          className={
            pageHasHero
              ? "w-full bg-gradient-to-b from-black/80 via-black/40 to-transparent border-none shadow-none text-white transition-colors duration-300"
              : isWhiteVariant
              ? "w-full bg-white/95 dark:bg-card/95 backdrop-blur-md border-b border-border/80 text-foreground shadow-xs transition-colors duration-300"
              : "w-full bg-slate-950/95 backdrop-blur-md border-b border-border/80 text-white shadow-md transition-colors duration-300"
          }
          role="banner"
        >
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center shadow-md">
                  <span className="font-display font-black text-slate-950 text-sm">RD</span>
                </div>
                <div className="hidden sm:block text-left">
                  <span className={`font-display font-bold text-sm sm:text-base group-hover:text-primary transition-colors ${
                    isWhiteVariant ? "text-slate-900 dark:text-white" : "text-white drop-shadow-sm"
                  }`}>
                    República Dominicana
                  </span>
                  <span className={`block text-[11px] -mt-1 ${
                    isWhiteVariant ? "text-slate-500 dark:text-slate-400" : "text-white/80 drop-shadow-xs"
                  }`}>
                    {t("hero.subtitle")}
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1" aria-label="Navegación principal">
                {navLinks.map((link) => (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(link.megaMenu)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      to={link.href}
                      onClick={() => setActiveMegaMenu(null)}
                      className={`px-3.5 py-1.5 text-sm font-medium transition-all rounded-xl ${
                        isWhiteVariant
                          ? location.pathname === link.href
                            ? "text-primary font-bold bg-primary/10"
                            : "text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800"
                          : location.pathname === link.href
                            ? "text-primary font-bold bg-white/10"
                            : "text-white/90 hover:text-white hover:bg-white/15 drop-shadow-xs"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </div>
                ))}
              </nav>

              {/* Actions */}
              <div className={`flex items-center gap-1 sm:gap-2 ${isWhiteVariant ? "text-slate-800 dark:text-slate-100" : "text-white"}`}>
                <div className="hidden md:block">
                  <WeatherWidget />
                </div>
                <LanguageSelector />
                <HighContrastToggle />
                <ThemeToggle />
                <NotificationBell />
                <SpaceSwitcher />
                {user && <UserProgressWidget />}
                {showCart && <CartDrawer />}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={isWhiteVariant ? "a11y-touch-target text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800" : "a11y-touch-target text-white hover:text-white hover:bg-white/20"}
                  onClick={() => (onOpenSearch ? onOpenSearch() : setIsSearchOpen(true))}
                  aria-label="Buscar"
                >
                  <Search className="h-5 w-5" />
                </Button>

                {/* Auth Button */}
                {!loading && (
                  user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Menú de cuenta de usuario" className={isWhiteVariant ? "text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 h-9 w-9" : "text-white hover:text-white hover:bg-white/20 h-9 w-9"}>
                          <User className="h-5 w-5" aria-hidden="true" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-card text-card-foreground border border-border shadow-2xl">
                        <div className="px-2 py-1.5">
                          <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/perfil" className="flex items-center gap-2 cursor-pointer">
                            <User className="h-4 w-4" />
                            {t("header.myProfile")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/perfil" className="flex items-center gap-2 cursor-pointer">
                            <Heart className="h-4 w-4" />
                            Favoritos y guardados
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/pasaporte-digital" className="flex items-center gap-2 cursor-pointer">
                            <Compass className="h-4 w-4" />
                            Pasaporte digital
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/diario-viaje" className="flex items-center gap-2 cursor-pointer">
                            <BookOpen className="h-4 w-4" />
                            Mi Diario de Viaje
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/creadores" className="flex items-center gap-2 cursor-pointer">
                            <Camera className="h-4 w-4" />
                            Panel Creadores
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="flex items-center gap-2 cursor-pointer font-medium text-primary">
                            <Shield className="h-4 w-4 text-primary" />
                            Panel Administrativo
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                          <LogOut className="h-4 w-4 mr-2" />
                          {t("header.signOut")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Link to="/login" aria-label="Iniciar sesión">
                      <Button variant="outline" size="sm" className="hidden sm:flex gap-2 border-white/40 text-white bg-black/20 hover:bg-white/20 hover:text-white rounded-xl h-9">
                        <User className="h-4 w-4" aria-hidden="true" />
                        {t("header.signIn")}
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Iniciar sesión" className="sm:hidden text-white hover:text-white hover:bg-white/20 h-9 w-9">
                        <User className="h-5 w-5" aria-hidden="true" />
                      </Button>
                    </Link>
                  )
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={isMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
                  aria-expanded={isMenuOpen}
                  aria-controls="mobile-navigation"
                  className="lg:hidden text-white hover:text-white hover:bg-white/20 h-9 w-9"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Mega Menu Dropdowns */}
          <AnimatePresence>
            {activeMegaMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.99 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute left-0 right-0 top-full bg-background/95 dark:bg-slate-950/95 backdrop-blur-2xl border-b border-border/80 shadow-2xl max-h-[85vh] overflow-y-auto z-50 transition-colors"
                onMouseEnter={handleMegaMenuEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="container mx-auto px-4 lg:px-8 py-6">
                  {/* 1. DONDE IR Mega Menu */}
                  {activeMegaMenu === "dondeIr" && (
                    <MegaMenuDondeIr
                      onClose={() => setActiveMegaMenu(null)}
                      destinos={megaMenuDondeIrData.destinos}
                      regiones={megaMenuDondeIrData.regiones}
                      samanaImg={samana}
                      t={t}
                    />
                  )}

                  {/* 2. QUE HACER Mega Menu */}
                  {activeMegaMenu === "queHacer" && (
                    <MegaMenuQueHacer
                      onClose={() => setActiveMegaMenu(null)}
                      experienciasTop={megaMenuQueHacerData.experienciasTop}
                      categorias={megaMenuQueHacerData.categorias}
                      adAdventureImg={adAdventureImg}
                    />
                  )}

                  {/* 3. PLANIFICAR Mega Menu */}
                  {activeMegaMenu === "planificar" && (
                    <MegaMenuPlanificar
                      onClose={() => setActiveMegaMenu(null)}
                      adBeachResortImg={adBeachResortImg}
                    />
                  )}

                  {/* 4. SOBRE EL PAIS / GUIAS Mega Menu */}
                  {activeMegaMenu === "sobreElPais" && (
                    <MegaMenuGuias
                      onClose={() => setActiveMegaMenu(null)}
                      gastronomyImg={gastronomy}
                    />
                  )}

                  {/* 5. EMPRESAS & NEGOCIOS Mega Menu */}
                  {activeMegaMenu === "dondeQuedarse" && (
                    <MegaMenuEmpresas
                      onClose={() => setActiveMegaMenu(null)}
                      adLuxuryHotelImg={adLuxuryHotelImg}
                    />
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
                <nav id="mobile-navigation" className="container mx-auto px-4 py-4 flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-base font-medium transition-colors hover:text-primary text-muted-foreground py-2"
                    >
                      {link.name}
                    </Link>
                  ))}
                  <div className="mt-3 space-y-2 border-t border-border pt-3">
                    {mobileNavSections.map((section) => (
                      <details key={section.title} className="group rounded-lg border border-border/70 bg-card/40">
                        <summary className="min-h-11 cursor-pointer list-none px-3 py-2 font-semibold text-foreground marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          {section.title}
                        </summary>
                        <div className="grid grid-cols-2 gap-1 px-2 pb-2">
                          {section.links.map(([label, href]) => (
                            <Link key={href} to={href} onClick={() => setIsMenuOpen(false)} className="flex min-h-11 items-center rounded-md px-2 text-sm text-muted-foreground hover:bg-secondary/60 hover:text-primary">
                              {label}
                            </Link>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </header>
      </div>

      {/* Global Search Modal */}
      {!onOpenSearch && <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />}
    </>
  );
}
