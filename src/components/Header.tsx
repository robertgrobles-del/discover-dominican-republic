import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Menu, X, ChevronRight, Globe, Compass, Plane, FileText, 
  MapPin, Waves, Mountain, Utensils, Music, Calendar, Building2, Car,
  Bed, Users, Heart, Info, BookOpen, Camera, Sun, Ship, 
  TrendingUp, Briefcase, ShoppingBag, Download, Accessibility, Route,
  User, LogOut, Radio, Leaf, Gift, Trophy, Activity,
  Ticket, HeartPulse, Layers, DollarSign, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WeatherWidget } from "@/components/WeatherWidget";
import { LanguageSelector } from "@/components/LanguageSelector";
import { GlobalSearch } from "@/components/GlobalSearch";
import { NotificationBell } from "@/components/NotificationBell";
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

import puntaCana from "@/assets/punta-cana.jpg";
import samana from "@/assets/samana.jpg";
import santoDomingo from "@/assets/santo-domingo.jpg";
import puertoPlata from "@/assets/puerto-plata.jpg";
import adventure from "@/assets/adventure.jpg";
import gastronomy from "@/assets/gastronomy.jpg";
import diving from "@/assets/diving.jpg";
import relaxBeach from "@/assets/relax-beach.jpg";
import adAdventureImg from "@/assets/promo/promo-adventure.jpg";

interface HeaderProps {
  hasHero?: boolean;
  variant?: "transparent" | "dark" | "white";
  className?: string;
}

type MegaMenuType = "dondeIr" | "queHacer" | "dondeQuedarse" | "planificar" | "sobreElPais" | null;

export function Header({ hasHero, variant, className }: HeaderProps = {}) {
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
    "/gastronomia",
    "/guia-gastronomica",
    "/eventos",
  ];

  // Check if current route has a hero (e.g. /destino/* or /evento/*)
  const isDynamicHeroRoute = 
    location.pathname.startsWith("/destino/") || 
    location.pathname.startsWith("/evento/");

  // Only transparent if page has a hero banner / slider and not explicitly forced to white
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
    { name: t("nav.whereToGo"), href: "/destinos", megaMenu: "dondeIr" as MegaMenuType },
    { name: t("nav.whatToDo"), href: "/actividades", megaMenu: "queHacer" as MegaMenuType },
    { name: t("nav.whereToStay"), href: "/alojamientos", megaMenu: "dondeQuedarse" as MegaMenuType },
    { name: t("nav.plan"), href: "/planifica", megaMenu: "planificar" as MegaMenuType },
    { name: t("nav.aboutCountry"), href: "/cultura", megaMenu: "sobreElPais" as MegaMenuType },
  ];

  const megaMenuDondeIr = {
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

  const megaMenuQueHacer = {
    experienciasTop: [
      { name: "Aventura, Cascadas & Zipline", desc: "27 Charcos, Samaná y Jarabacoa", image: adventure, href: "/experiencia/27-charcos-de-damajagua" },
      { name: "Ruta Gastronómica & Alta Cocina", desc: "Sabores criollos, mariscos y catas de ron", image: gastronomy, href: "/rutas-sabor" },
      { name: "Buceo en Arrecifes & Snorkel", desc: "Aguas cristalinas en Bayahíbe y Sosúa", image: diving, href: "/buceo-snorkel" },
      { name: "Playas Paradisíacas & Catamarán", desc: "Bávaro, Cayo Levantado y Bahía de las Águilas", image: relaxBeach, href: "/playas" },
    ],
    categorias: [
      { name: "Turismo Sostenible", href: "/sostenible", icon: Leaf },
      { name: "Rutas del Sabor", href: "/rutas-sabor", icon: Utensils },
      { name: "Vida Nocturna & Bares", href: "/vida-nocturna", icon: Music },
      { name: "Patrimonio & Museos", href: "/museos-monumentos", icon: Building2 },
      { name: "Eventos & Fiestas", href: "/eventos", icon: Calendar },
      { name: "Wellness & Spas", href: "/spas-wellness", icon: HeartPulse },
      { name: "Pelota LIDOM", href: "/lidom", icon: Activity },
      { name: "Bodas en el Caribe", href: "/bodas", icon: Heart },
    ]
  };

  const megaMenuDondeQuedarse = {
    tipos: [
      { name: "Resorts All-Inclusive", desc: "Lujo, piscinas infinitas y todo incluido en la playa", image: puntaCana, href: "/alojamientos?categoria=Resort" },
      { name: "Hoteles Boutique & Coloniales", desc: "Encanto histórico, arquitectura y trato exclusivo", image: santoDomingo, href: "/alojamientos?categoria=Boutique" },
      { name: "Eco-Lodges de Montaña", desc: "Desconexión en Jarabacoa, Constanza y Samaná", image: samana, href: "/alojamientos?categoria=Ecolodge" },
      { name: "Villas & Penthouses de Playa", desc: "Privacidad frente al mar para grupos y familias", image: puertoPlata, href: "/alojamientos?categoria=Villa" },
    ],
    categorias: [
      { name: "Punta Cana & Cap Cana", href: "/alojamientos?destino=punta-cana" },
      { name: "Las Terrenas & Samaná", href: "/alojamientos?destino=samana" },
      { name: "Santo Domingo Histórico", href: "/alojamientos?destino=santo-domingo" },
      { name: "Jarabacoa & Montaña", href: "/alojamientos?destino=jarabacoa" },
      { name: "Puerto Plata & Cabarete", href: "/alojamientos?destino=puerto-plata" },
      { name: "Bayahíbe & La Romana", href: "/alojamientos?destino=la-romana" },
    ]
  };

  const megaMenuPlanificar = [
    { name: "Tasas de Cambio Bancarias", href: "/tasas-cambio", icon: DollarSign, desc: "USD, EUR, CAD en bancos de RD" },
    { name: "Resultados de Loterías", href: "/loterias", icon: Sparkles, desc: "Leidsa, Nacional, Loteka, Real" },
    { name: "Reserva Directa", href: "/reserva-directa", icon: Calendar, desc: "Hoteles, vuelos y actividades" },
    { name: "eSIM Dominicana", href: "/esim", icon: Globe, desc: "Datos móviles 5G prepago" },
    { name: "Tarjeta RD Pass", href: "/tarjeta-prepago", icon: ShoppingBag, desc: "Descuentos y pagos locales" },
    { name: "Salud y Farmacias 24h", href: "/salud-24h", icon: Activity, desc: "Hospitales y farmacias de turno" },
    { name: t("plan.howToGetThere"), href: "/como-llegar", icon: Plane, desc: t("header.flightsDesc") },
    { name: t("plan.entryReq"), href: "/e-ticket", icon: FileText, desc: t("header.visasDesc") },
    { name: t("plan.transport"), href: "/transporte-urbano", icon: Car, desc: t("header.transportDesc") },
    { name: t("plan.practicalGuide"), href: "/guia-practica", icon: Info, desc: t("header.practicalDesc") },
    { name: t("plan.insurance"), href: "/seguro-viaje", icon: Heart, desc: t("header.insuranceDesc") },
    { name: t("plan.itineraries"), href: "/itinerarios", icon: Route, desc: t("header.itinerariesDesc") },
    { name: t("plan.planner"), href: "/mi-viaje", icon: Route, desc: t("header.plannerDesc") },
  ];

  const megaMenuSobreElPais = [
    { name: t("header.cultureTraditions"), href: "/cultura", icon: Heart, desc: t("header.cultureDesc") },
    { name: t("header.heritage"), href: "/museos-monumentos", icon: Building2, desc: t("header.heritageDesc") },
    { name: "Historia de RD", href: "/historia", icon: BookOpen, desc: "Personajes y eventos históricos" },
    { name: "Recetas Criollas & Platos", href: "/recetas-criollas", icon: Utensils, desc: "Gastronomía autóctona paso a paso" },
    { name: t("header.mediaGallery"), href: "/galeria", icon: Camera, desc: t("header.galleryDesc") },
    { name: "Marketplace RD", href: "/marketplace", icon: ShoppingBag, desc: "Comprar souvenirs locales" },
    { name: "Operadores RD", href: "/operadores", icon: Briefcase, desc: "Reserva directo con operadores verificados" },
    { name: "Tienda Descubre RD", href: "/tienda", icon: ShoppingBag, desc: "Merchandising oficial y pósters rayables" },
    { name: "Suscripción Sabores RD", href: "/suscripciones-sabores", icon: Gift, desc: "Cajas de productos dominicanos" },
    { name: t("header.embassies"), href: "/embajadas", icon: Globe, desc: t("header.embassiesDesc") },
    { name: "Leyes del Turista & Seguridad", href: "/leyes-turista", icon: Info, desc: "Derechos, normas y seguridad" },
  ];

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
                <ThemeToggle />
                <NotificationBell />
                {user && <UserProgressWidget />}
                <CartDrawer />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={isWhiteVariant ? "text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 h-9 w-9" : "text-white hover:text-white hover:bg-white/20 h-9 w-9"}
                  onClick={() => setIsSearchOpen(true)}
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
                          <Link to="/mi-viaje" className="flex items-center gap-2 cursor-pointer">
                            <Heart className="h-4 w-4" />
                            {t("common.favorite")}
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
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 top-full bg-background border-b border-border shadow-xl max-h-[50vh] overflow-y-auto"
              onMouseEnter={handleMegaMenuEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="container mx-auto px-4 lg:px-8 py-4">
                
                {/* DONDE IR Mega Menu */}
                {activeMegaMenu === "dondeIr" && (
                  <div className="grid lg:grid-cols-12 gap-5">
                    {/* Col 1: Destinos Principales (4 cols) */}
                    <div className="lg:col-span-4 border-r border-border/50 pr-4">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2 text-primary">
                          <Globe className="h-4 w-4" />
                          <h3 className="font-display font-bold uppercase tracking-wider text-xs">{t("destinations.popular")}</h3>
                        </div>
                        <Link to="/destinos" onClick={() => setActiveMegaMenu(null)} className="text-[11px] text-primary hover:underline font-medium flex items-center gap-0.5">
                          {t("destinations.viewAll")} <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                      <nav className="space-y-1">
                        {megaMenuDondeIr.destinos.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setActiveMegaMenu(null)}
                            className="flex items-center gap-2.5 group p-1.5 rounded-lg hover:bg-secondary/60 transition-colors"
                          >
                            <div className="w-10 h-8 rounded-md overflow-hidden flex-shrink-0 relative">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <p className="font-semibold text-foreground group-hover:text-primary transition-colors text-xs truncate">{item.name}</p>
                                <span className="text-[9px] px-1.5 py-0.2 bg-primary/10 text-primary rounded-full font-medium">{item.tag}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">{item.desc}</p>
                            </div>
                          </Link>
                        ))}
                      </nav>
                    </div>
                    
                    {/* Col 2: Macro Regiones Dominicanas con Tarjetas (5 cols) */}
                    <div className="lg:col-span-5 border-r border-border/50 pr-4">
                      <div className="flex items-center justify-between mb-2.5">
                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Macro-Regiones Turísticas</h4>
                        <Link to="/provincias" onClick={() => setActiveMegaMenu(null)} className="text-[11px] text-muted-foreground hover:text-foreground">
                          31 Provincias + D.N.
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {megaMenuDondeIr.regiones.map((region) => (
                          <Link 
                            key={region.href} 
                            to={region.href} 
                            onClick={() => setActiveMegaMenu(null)} 
                            className="group p-2 rounded-lg bg-card/80 border border-border/60 hover:border-primary/50 hover:bg-secondary/40 transition-all flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                                  {region.name.split(' (')[0]}
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground line-clamp-1">{region.desc}</p>
                            </div>
                            <span className="text-[9px] font-medium text-primary/80 mt-1.5 flex items-center gap-1">
                              ✦ {region.tag}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Col 3: Destino del Mes Destacado (3 cols) */}
                    <div className="lg:col-span-3">
                      <Link to="/destino/bahia-de-las-aguilas" onClick={() => setActiveMegaMenu(null)} className="block group relative rounded-xl overflow-hidden h-full min-h-[140px] max-h-[170px] shadow-sm">
                        <img src={samana} alt="Bahía de las Águilas" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold mb-1 shadow">
                            ★ {t("header.destinationOfMonth")}
                          </span>
                          <h4 className="font-display text-sm font-bold text-white leading-tight">Bahía de las Águilas</h4>
                          <p className="text-white/85 text-[11px] line-clamp-1">{t("header.mostBeautifulBeach")}</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}

                {/* QUE HACER Mega Menu */}
                {activeMegaMenu === "queHacer" && (
                  <div className="grid lg:grid-cols-3 gap-4">
                    {/* Column 1: Micro cards */}
                    <div>
                      <div className="flex items-center gap-2 text-primary mb-2">
                        <Compass className="h-4 w-4" />
                        <h3 className="font-display font-bold uppercase tracking-wider text-xs">Experiencias Destacadas</h3>
                      </div>
                      <nav className="space-y-0.5">
                        {megaMenuQueHacer.experienciasTop.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setActiveMegaMenu(null)}
                            className="flex items-center gap-2 group p-1 rounded-lg hover:bg-secondary/50 transition-colors"
                          >
                            <div className="w-8 h-6 rounded overflow-hidden flex-shrink-0">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm leading-tight">{item.name}</p>
                              <p className="text-[11px] text-muted-foreground leading-tight">{item.desc}</p>
                            </div>
                          </Link>
                        ))}
                      </nav>
                      <Link to="/actividades" onClick={() => setActiveMegaMenu(null)} className="inline-flex items-center gap-1 text-primary text-xs font-medium hover:underline mt-2">
                        {t("header.viewAllExperiences")} <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>

                    {/* Column 2: Por Categoría / Interés */}
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Por Categoría de Interés</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {megaMenuQueHacer.categorias.map((item) => (
                          <Link 
                            key={item.href} 
                            to={item.href} 
                            onClick={() => setActiveMegaMenu(null)} 
                            className="inline-flex items-center gap-1.5 text-xs text-foreground hover:text-primary px-2.5 py-1 bg-secondary/50 rounded-full hover:bg-secondary transition-colors"
                          >
                            <item.icon className="h-3 w-3 text-primary" />
                            <span>{item.name}</span>
                          </Link>
                        ))}
                      </div>
                      <div className="mt-4 pt-3 border-t border-border/50">
                        <Link to="/tours" onClick={() => setActiveMegaMenu(null)} className="inline-flex items-center gap-2 text-xs font-medium text-foreground hover:text-primary p-2 bg-secondary/40 rounded-lg w-full transition-colors">
                          <Ticket className="h-4 w-4 text-primary" />
                          <span>Directorio de Excursiones & Tours Oficiales</span>
                          <ChevronRight className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
                        </Link>
                      </div>
                    </div>

                    {/* Column 3: Contenido Patrocinado */}
                    <div>
                      <Link to="/tour/buggies-cenote-hoyo-azul" onClick={() => setActiveMegaMenu(null)} className="block group relative rounded-xl overflow-hidden h-full max-h-[28vh]">
                        <img src={adAdventureImg} alt="Excursiones Extremas & Buggies en Punta Cana" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold mb-1">★ Patrocinado • Caribbean Buggies</span>
                          <h4 className="font-display text-sm font-bold text-white leading-tight">Buggies & Cenote Hoyo Azul</h4>
                          <p className="text-white/80 text-xs">Aventura 4x4 todo terreno con traslado desde tu hotel</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}

                {/* DONDE QUEDARSE Mega Menu */}
                {activeMegaMenu === "dondeQuedarse" && (
                  <div className="grid lg:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-primary mb-2">
                        <Bed className="h-4 w-4" />
                        <h3 className="font-display font-bold uppercase tracking-wider text-xs">Tipos de Hospedaje</h3>
                      </div>
                      <nav className="space-y-0.5">
                        {megaMenuDondeQuedarse.tipos.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setActiveMegaMenu(null)}
                            className="flex items-center gap-2 group p-1 rounded-lg hover:bg-secondary/50 transition-colors"
                          >
                            <div className="w-8 h-6 rounded overflow-hidden flex-shrink-0">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm leading-tight">{item.name}</p>
                              <p className="text-[11px] text-muted-foreground leading-tight">{item.desc}</p>
                            </div>
                          </Link>
                        ))}
                      </nav>
                      <Link to="/alojamientos" onClick={() => setActiveMegaMenu(null)} className="inline-flex items-center gap-1 text-primary text-xs font-medium hover:underline mt-2">
                        Ver todos los alojamientos <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                    
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Por Destino Turístico</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {megaMenuDondeQuedarse.categorias.map((cat) => (
                          <Link key={cat.href} to={cat.href} onClick={() => setActiveMegaMenu(null)} className="text-xs text-foreground hover:text-primary px-2.5 py-1 bg-secondary/50 rounded-full hover:bg-secondary transition-colors">
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                      <div className="mt-4 pt-3 border-t border-border/50">
                        <Link to="/comparador-hoteles" onClick={() => setActiveMegaMenu(null)} className="inline-flex items-center gap-2 text-xs font-medium text-foreground hover:text-primary p-2 bg-secondary/40 rounded-lg w-full transition-colors">
                          <Building2 className="h-4 w-4 text-primary" />
                          <span>Comparador inteligente de hoteles</span>
                          <ChevronRight className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
                        </Link>
                      </div>
                    </div>

                    <div>
                      <Link to="/alojamiento/sanctuary-cap-cana" onClick={() => setActiveMegaMenu(null)} className="block group relative rounded-xl overflow-hidden h-full max-h-[28vh]">
                        <img src={puntaCana} alt="Resorts de Lujo en Cap Cana" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium mb-1">★ Recomendación Premium</span>
                          <h4 className="font-display text-sm font-bold text-white leading-tight">Sanctuary Cap Cana Resort</h4>
                          <p className="text-white/80 text-xs">Villas de lujo frente al mar y mayordomo privado</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}

                {/* PLANIFICAR Mega Menu */}
                {activeMegaMenu === "planificar" && (
                  <div className="grid lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-2 text-primary mb-2">
                        <Plane className="h-4 w-4" />
                        <h3 className="font-display font-bold uppercase tracking-wider text-xs">{t("header.planYourTrip")}</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                        {megaMenuPlanificar.map((item) => (
                          <Link key={item.href} to={item.href} onClick={() => setActiveMegaMenu(null)} className="flex items-center gap-2 py-1 px-1.5 rounded hover:bg-secondary/50 transition-colors group">
                            <item.icon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                            <span className="text-sm text-foreground group-hover:text-primary transition-colors">{item.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                    
                    <div className="lg:col-span-2">
                      <div className="bg-card rounded-lg border border-border p-3">
                        <h4 className="font-display font-bold text-foreground text-sm mb-1">{t("header.firstTime")}</h4>
                        <p className="text-muted-foreground text-xs mb-2">{t("header.firstTimeDesc")}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <Link to="/como-llegar" onClick={() => setActiveMegaMenu(null)} className="bg-secondary/50 rounded-lg p-2.5 hover:bg-secondary transition-colors">
                            <Plane className="h-4 w-4 text-primary mb-1" />
                            <p className="font-semibold text-foreground text-sm">{t("plan.howToGetThere")}</p>
                            <p className="text-[11px] text-muted-foreground">{t("header.flightsDesc")}</p>
                          </Link>
                          <Link to="/herramientas" onClick={() => setActiveMegaMenu(null)} className="bg-secondary/50 rounded-lg p-2.5 hover:bg-secondary transition-colors">
                            <FileText className="h-4 w-4 text-primary mb-1" />
                            <p className="font-semibold text-foreground text-sm">{t("plan.tools")}</p>
                            <p className="text-[11px] text-muted-foreground">{t("header.toolsDesc")}</p>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SOBRE EL PAIS Mega Menu */}
                {activeMegaMenu === "sobreElPais" && (
                  <div className="grid lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-2 text-primary mb-2">
                        <Heart className="h-4 w-4" />
                        <h3 className="font-display font-bold uppercase tracking-wider text-xs">{t("header.knowCountry")}</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                        {megaMenuSobreElPais.map((item) => (
                          <Link key={item.href} to={item.href} onClick={() => setActiveMegaMenu(null)} className="flex items-center gap-2 py-1 px-1.5 rounded hover:bg-secondary/50 transition-colors group">
                            <item.icon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                            <span className="text-sm text-foreground group-hover:text-primary transition-colors">{item.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Link to="/cultura" onClick={() => setActiveMegaMenu(null)} className="block group relative rounded-lg overflow-hidden h-full max-h-[28vh]">
                        <img src={santoDomingo} alt="Cultura" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-2.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium mb-1">{t("header.discover")}</span>
                          <h4 className="font-display text-sm font-bold text-white leading-tight">{t("header.dominicanCulture")}</h4>
                          <p className="text-white/80 text-xs">{t("header.musicGastronomyTraditions")}</p>
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
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-base font-medium transition-colors hover:text-primary text-muted-foreground py-2"
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="border-t border-border my-2 pt-2 space-y-4">
                  {/* Sección Planifica y Reserva */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary px-2 mb-1">
                      Planifica y Reserva
                    </h4>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      <Link to="/reserva-directa" onClick={() => setIsMenuOpen(false)} className="block py-1.5 px-2 text-sm text-muted-foreground hover:text-primary rounded hover:bg-secondary/50 font-medium">Reserva Directa</Link>
                      <Link to="/esim" onClick={() => setIsMenuOpen(false)} className="block py-1.5 px-2 text-sm text-muted-foreground hover:text-primary rounded hover:bg-secondary/50">eSIM Turística</Link>
                      <Link to="/tarjeta-prepago" onClick={() => setIsMenuOpen(false)} className="block py-1.5 px-2 text-sm text-muted-foreground hover:text-primary rounded hover:bg-secondary/50">Tarjeta RD Pass</Link>
                      <Link to="/salud-24h" onClick={() => setIsMenuOpen(false)} className="py-1.5 px-2 text-sm text-muted-foreground hover:text-primary rounded hover:bg-secondary/50 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        Salud 24h
                      </Link>
                      <Link to="/como-llegar" onClick={() => setIsMenuOpen(false)} className="block py-1.5 px-2 text-sm text-muted-foreground hover:text-primary rounded hover:bg-secondary/50">{t("plan.howToGetThere")}</Link>
                      <Link to="/alojamientos" onClick={() => setIsMenuOpen(false)} className="block py-1.5 px-2 text-sm text-muted-foreground hover:text-primary rounded hover:bg-secondary/50">{t("accommodations.title")}</Link>
                      <Link to="/seguro-viaje" onClick={() => setIsMenuOpen(false)} className="block py-1.5 px-2 text-sm text-muted-foreground hover:text-primary rounded hover:bg-secondary/50">{t("plan.insurance")}</Link>
                    </div>
                  </div>

                  {/* Sección Experiencias y E-commerce */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary px-2 mb-1">
                      Experiencias y E-commerce
                    </h4>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      <Link to="/eventos-vivo" onClick={() => setIsMenuOpen(false)} className="py-1.5 px-2 text-sm hover:text-primary rounded hover:bg-secondary/50 font-medium text-foreground flex items-center gap-1">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        En Vivo
                      </Link>
                      <Link to="/lidom" onClick={() => setIsMenuOpen(false)} className="block py-1.5 px-2 text-sm text-muted-foreground hover:text-primary rounded hover:bg-secondary/50">Pelota LIDOM</Link>
                      <Link to="/vive-local" onClick={() => setIsMenuOpen(false)} className="block py-1.5 px-2 text-sm text-muted-foreground hover:text-primary rounded hover:bg-secondary/50">Vive Local</Link>
                      <Link to="/bebidas-rd" onClick={() => setIsMenuOpen(false)} className="block py-1.5 px-2 text-sm text-muted-foreground hover:text-primary rounded hover:bg-secondary/50">Bebidas RD</Link>
                      <Link to="/sostenible" onClick={() => setIsMenuOpen(false)} className="block py-1.5 px-2 text-sm text-muted-foreground hover:text-primary rounded hover:bg-secondary/50">Sostenibilidad</Link>
                      <Link to="/marketplace" onClick={() => setIsMenuOpen(false)} className="block py-1.5 px-2 text-sm text-muted-foreground hover:text-primary rounded hover:bg-secondary/50">Marketplace</Link>
                      <Link to="/operadores" onClick={() => setIsMenuOpen(false)} className="block py-1.5 px-2 text-sm text-muted-foreground hover:text-primary rounded hover:bg-secondary/50">Operadores RD</Link>
                      <Link to="/tienda" onClick={() => setIsMenuOpen(false)} className="block py-1.5 px-2 text-sm text-muted-foreground hover:text-primary rounded hover:bg-secondary/50">Tienda</Link>
                      <Link to="/suscripciones-sabores" onClick={() => setIsMenuOpen(false)} className="block py-1.5 px-2 text-sm text-muted-foreground hover:text-primary rounded hover:bg-secondary/50">Suscripción Sabores</Link>
                      <Link to="/eventos-grupo" onClick={() => setIsMenuOpen(false)} className="block py-1.5 px-2 text-sm text-muted-foreground hover:text-primary rounded hover:bg-secondary/50">Excursión Grupal</Link>
                      <Link to="/creadores" onClick={() => setIsMenuOpen(false)} className="block py-1.5 px-2 text-sm text-muted-foreground hover:text-primary rounded hover:bg-secondary/50">Creadores</Link>
                      <Link to="/diario-viaje" onClick={() => setIsMenuOpen(false)} className="block py-1.5 px-2 text-sm text-muted-foreground hover:text-primary rounded hover:bg-secondary/50">Diario Revista</Link>
                    </div>
                  </div>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
        </header>
      </div>

      {/* Global Search Modal */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
