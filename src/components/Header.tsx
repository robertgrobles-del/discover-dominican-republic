import { useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Menu, X, ChevronRight, Globe, Compass, Plane, FileText, 
  MapPin, Waves, Mountain, Utensils, Music, Calendar, Building2, Car,
  Bed, Users, Heart, Info, BookOpen, Camera, Sun, Sparkles, Ship, 
  TrendingUp, Briefcase, ShoppingBag, Download, Accessibility, Route,
  User, LogOut
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

type MegaMenuType = "dondeIr" | "queHacer" | "dondeQuedarse" | "planificar" | "sobreElPais" | null;

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<MegaMenuType>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user, loading, signOut } = useAuth();
  const { t } = useTranslation();

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
      { name: "Punta Cana", desc: t("header.puntaCanaDesc"), image: puntaCana, href: "/destino/punta-cana" },
      { name: "Samaná", desc: t("header.samanaDesc"), image: samana, href: "/destino/samana" },
      { name: "Santo Domingo", desc: t("header.santoDomingoDesc"), image: santoDomingo, href: "/destino/santo-domingo" },
      { name: "Puerto Plata", desc: t("header.puertoPlataDesc"), image: puertoPlata, href: "/destino/puerto-plata" },
    ],
    regiones: [
      { name: t("header.allProvinces"), href: "/provincias" },
      { name: t("header.regionNorth"), href: "/provincias?region=norte" },
      { name: t("header.regionEast"), href: "/provincias?region=este" },
      { name: t("header.regionSouth"), href: "/provincias?region=sur" },
      { name: t("header.regionSD"), href: "/provincias?region=santo-domingo" },
    ]
  };

  const megaMenuQueHacer = {
    experiencias: [
      { name: t("interest.beaches"), href: "/playas", icon: Waves, desc: t("header.beachesDesc") },
      { name: t("header.adventureSports"), href: "/actividades", icon: Compass, desc: t("header.adventureDesc") },
      { name: t("interest.gastronomy"), href: "/guia-gastronomica", icon: Utensils, desc: t("header.gastronomyDesc") },
      { name: t("bars.nightlife"), href: "/vida-nocturna", icon: Music, desc: t("header.nightlifeDesc") },
      { name: t("header.heritage"), href: "/patrimonio", icon: Building2, desc: t("header.heritageDesc") },
    ],
    categorias: [
      { name: t("interest.ecotourism"), href: "/ecoturismo", icon: Mountain },
      { name: t("header.flavorRoutes"), href: "/rutas-sabor", icon: Utensils },
      { name: t("header.themeParks"), href: "/parques-tematicos", icon: Sparkles },
      { name: t("footer.events"), href: "/eventos", icon: Calendar },
      { name: "Golf", href: "/turismo-deportivo", icon: Sparkles },
    ],
    nichos: [
      { name: "Wellness & Spa", href: "/wellness", icon: Sparkles, desc: t("header.wellnessDesc") },
      { name: t("header.destinationWeddings"), href: "/bodas", icon: Heart, desc: t("header.weddingsDesc") },
      { name: t("header.cruises"), href: "/cruceros", icon: Ship, desc: t("header.cruisesDesc") },
      { name: t("niche.family"), href: "/familia-con-ninos", icon: Users, desc: t("header.familyDesc") },
      { name: t("niche.solo"), href: "/viajera-sola", icon: User, desc: t("header.soloDesc") },
    ],
  };

  const megaMenuDondeQuedarse = [
    { name: t("header.hotelsResorts"), href: "/alojamientos?tipo=hotel", icon: Building2 },
    { name: "Eco-Lodges", href: "/alojamientos?tipo=ecolodge", icon: Mountain },
    { name: t("header.privateVillas"), href: "/alojamientos?tipo=villa", icon: Bed },
    { name: t("header.apartments"), href: "/alojamientos?tipo=apartamento", icon: Building2 },
    { name: t("header.allInclusive"), href: "/alojamientos?tipo=all-inclusive", icon: Sun },
  ];

  const megaMenuPlanificar = [
    { name: t("plan.howToGetThere"), href: "/como-llegar", icon: Plane, desc: t("header.flightsDesc") },
    { name: t("plan.entryReq"), href: "/planifica", icon: FileText, desc: t("header.visasDesc") },
    { name: t("plan.transport"), href: "/info/transporte", icon: Car, desc: t("header.transportDesc") },
    { name: t("plan.practicalGuide"), href: "/guia-practica", icon: Info, desc: t("header.practicalDesc") },
    { name: t("plan.insurance"), href: "/seguro-viaje", icon: Heart, desc: t("header.insuranceDesc") },
    { name: t("plan.itineraries"), href: "/itinerarios", icon: Route, desc: t("header.itinerariesDesc") },
    { name: t("plan.planner"), href: "/mi-viaje", icon: Route, desc: t("header.plannerDesc") },
  ];

  const megaMenuSobreElPais = [
    { name: t("header.cultureTraditions"), href: "/cultura", icon: Heart, desc: t("header.cultureDesc") },
    { name: t("header.history"), href: "/patrimonio", icon: BookOpen, desc: t("header.historyDesc") },
    { name: "Historia de RD", href: "/historia", icon: BookOpen, desc: "Personajes y eventos históricos" },
    { name: t("header.typicalCuisine"), href: "/cultura#gastronomia", icon: Utensils, desc: t("header.cuisineDesc") },
    { name: t("header.mediaGallery"), href: "/galeria", icon: Camera, desc: t("header.galleryDesc") },
    { name: t("header.shopping"), href: "/compras", icon: ShoppingBag, desc: t("header.shoppingDesc") },
    { name: t("header.embassies"), href: "/embajadas", icon: Globe, desc: t("header.embassiesDesc") },
    { name: t("header.practicalInfo"), href: "/info/seguridad", icon: Info, desc: t("header.safetyDesc") },
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
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border" role="banner">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <span className="font-display font-bold text-primary-foreground text-sm">RD</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-display font-bold text-foreground">República Dominicana</span>
                <span className="block text-xs text-muted-foreground -mt-1">{t("hero.subtitle")}</span>
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
                className="text-muted-foreground hover:text-foreground"
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
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <User className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
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
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                        <LogOut className="h-4 w-4 mr-2" />
                        {t("header.signOut")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link to="/login">
                    <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                      <User className="h-4 w-4" />
                      {t("header.signIn")}
                    </Button>
                    <Button variant="ghost" size="icon" className="sm:hidden text-muted-foreground hover:text-foreground">
                      <User className="h-5 w-5" />
                    </Button>
                  </Link>
                )
              )}
              
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
              className="absolute left-0 right-0 top-full bg-background border-b border-border shadow-xl max-h-[50vh] overflow-y-auto"
              onMouseEnter={handleMegaMenuEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="container mx-auto px-4 lg:px-8 py-4">
                
                {/* DONDE IR Mega Menu */}
                {activeMegaMenu === "dondeIr" && (
                  <div className="grid lg:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-primary mb-2">
                        <Globe className="h-4 w-4" />
                        <h3 className="font-display font-bold uppercase tracking-wider text-xs">{t("destinations.popular")}</h3>
                      </div>
                      <nav className="space-y-0.5">
                        {megaMenuDondeIr.destinos.map((item) => (
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
                      <Link to="/destinos" onClick={() => setActiveMegaMenu(null)} className="inline-flex items-center gap-1 text-primary text-xs font-medium hover:underline mt-2">
                        {t("destinations.viewAll")} <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                    
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{t("header.byRegion")}</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {megaMenuDondeIr.regiones.map((region) => (
                          <Link key={region.href} to={region.href} onClick={() => setActiveMegaMenu(null)} className="text-xs text-foreground hover:text-primary px-2.5 py-1 bg-secondary/50 rounded-full hover:bg-secondary transition-colors">
                            {region.name}
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Link to="/destino/samana" onClick={() => setActiveMegaMenu(null)} className="block group relative rounded-xl overflow-hidden h-full max-h-[28vh]">
                        <img src={samana} alt="Bahía de las Águilas" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium mb-1">★ {t("header.destinationOfMonth")}</span>
                          <h4 className="font-display text-sm font-bold text-white leading-tight">Bahía de las Águilas</h4>
                          <p className="text-white/80 text-xs">{t("header.mostBeautifulBeach")}</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}

                {/* QUE HACER Mega Menu */}
                {activeMegaMenu === "queHacer" && (
                  <div className="grid lg:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-primary mb-2">
                        <Compass className="h-4 w-4" />
                        <h3 className="font-display font-bold uppercase tracking-wider text-xs">{t("footer.experiences")}</h3>
                      </div>
                      <nav className="space-y-0">
                        {megaMenuQueHacer.experiencias.map((item) => (
                          <Link key={item.href} to={item.href} onClick={() => setActiveMegaMenu(null)} className="flex items-center gap-2 py-0.5 px-1.5 rounded hover:bg-secondary/50 transition-colors group">
                            <item.icon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                            <span className="text-sm text-foreground group-hover:text-primary transition-colors">{item.name}</span>
                          </Link>
                        ))}
                      </nav>
                      <div className="flex items-center gap-2 text-primary mb-2 mt-4">
                        <Sparkles className="h-4 w-4" />
                        <h3 className="font-display font-bold uppercase tracking-wider text-xs">{t("header.byInterest")}</h3>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {megaMenuQueHacer.categorias.map((item) => (
                          <Link key={item.href} to={item.href} onClick={() => setActiveMegaMenu(null)} className="text-xs text-foreground hover:text-primary px-2.5 py-1 bg-secondary/50 rounded-full hover:bg-secondary transition-colors">
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-primary mb-2">
                        <Building2 className="h-4 w-4" />
                        <h3 className="font-display font-bold uppercase tracking-wider text-xs">{t("header.specialized")}</h3>
                      </div>
                      <nav className="space-y-0">
                        {megaMenuQueHacer.nichos.map((item) => (
                          <Link key={item.href} to={item.href} onClick={() => setActiveMegaMenu(null)} className="flex items-center gap-2 py-0.5 px-1.5 rounded hover:bg-secondary/50 transition-colors group">
                            <item.icon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                            <span className="text-sm text-foreground group-hover:text-primary transition-colors">{item.name}</span>
                          </Link>
                        ))}
                      </nav>
                      <Link to="/experiencias" onClick={() => setActiveMegaMenu(null)} className="inline-flex items-center gap-1 text-primary text-xs font-medium hover:underline mt-2">
                        {t("header.viewAllExperiences")} <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>

                    <div>
                      <Link to="/wellness" onClick={() => setActiveMegaMenu(null)} className="block group relative rounded-lg overflow-hidden h-full max-h-[28vh]">
                        <img src={samana} alt="Wellness" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-2 left-3">
                          <span className="text-white font-semibold text-sm">Wellness & Spa</span>
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
                        <h3 className="font-display font-bold uppercase tracking-wider text-xs">{t("accommodations.title")}</h3>
                      </div>
                      <nav className="space-y-0">
                        {megaMenuDondeQuedarse.map((item) => (
                          <Link key={item.href} to={item.href} onClick={() => setActiveMegaMenu(null)} className="flex items-center gap-2 py-1 px-1.5 rounded hover:bg-secondary/50 transition-colors group">
                            <item.icon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                            <span className="text-sm text-foreground group-hover:text-primary transition-colors">{item.name}</span>
                          </Link>
                        ))}
                      </nav>
                      <Link to="/alojamientos" onClick={() => setActiveMegaMenu(null)} className="inline-flex items-center gap-1 text-primary text-xs font-medium hover:underline mt-2">
                        {t("accommodations.viewAll")} <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                    
                    <div className="lg:col-span-2">
                      <div className="bg-card rounded-lg border border-border p-3">
                        <h4 className="font-display font-bold text-foreground text-sm mb-1">{t("header.lookingSpecial")}</h4>
                        <p className="text-muted-foreground text-xs mb-2">{t("header.lookingSpecialDesc")}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <Link to="/alojamientos?tipo=all-inclusive" onClick={() => setActiveMegaMenu(null)} className="bg-secondary/50 rounded-lg p-2.5 hover:bg-secondary transition-colors">
                            <Sun className="h-4 w-4 text-primary mb-1" />
                            <p className="font-semibold text-foreground text-sm">{t("header.allInclusive")}</p>
                            <p className="text-[11px] text-muted-foreground">{t("header.allInclusiveDesc")}</p>
                          </Link>
                          <Link to="/alojamientos?tipo=ecolodge" onClick={() => setActiveMegaMenu(null)} className="bg-secondary/50 rounded-lg p-2.5 hover:bg-secondary transition-colors">
                            <Mountain className="h-4 w-4 text-primary mb-1" />
                            <p className="font-semibold text-foreground text-sm">Eco-Lodges</p>
                            <p className="text-[11px] text-muted-foreground">{t("header.sustainableDesc")}</p>
                          </Link>
                        </div>
                      </div>
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
                <div className="border-t border-border my-2 pt-2">
                  <Link to="/eventos" onClick={() => setIsMenuOpen(false)} className="block py-2 text-muted-foreground hover:text-primary">{t("footer.events")}</Link>
                  <Link to="/patrimonio" onClick={() => setIsMenuOpen(false)} className="block py-2 text-muted-foreground hover:text-primary">{t("header.heritage")}</Link>
                  <Link to="/como-llegar" onClick={() => setIsMenuOpen(false)} className="block py-2 text-muted-foreground hover:text-primary">{t("plan.howToGetThere")}</Link>
                  <Link to="/alojamientos" onClick={() => setIsMenuOpen(false)} className="block py-2 text-muted-foreground hover:text-primary">{t("accommodations.title")}</Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Global Search Modal */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
